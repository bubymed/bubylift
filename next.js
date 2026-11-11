/* "Up next": which exercise to do after the ones already in this workout. Rule-based, from this session, muscle recovery, your equipment, injuries and history.
   "Sigue": qué ejercicio hacer después de los que ya van en este entrenamiento. Por reglas, con la sesión, la recuperación, tu equipo, lesiones e historial. */
const NX_BIG=['chm','chu','lat','trp','rf','vl','vm','gmx','bfm','smt','abs'],NX_K=3,NX_MINOR=['frm','nck','tib','per','sar','ql','brd','bra','hfl','ser','rtc','tva','gmn'];
let _nxMemo=null;
function nxSession(){
  const eff={},fam={push:0,pull:0,quad:0,post:0},reg={up:0,lo:0},ids={},comp={n:0};let tot=0,lastEq='';
  ACT.ex.forEach(x=>{
    ids[x.eid]=1;const e=exById(x.eid);if(e)lastEq=e.e;
    const n=x.sets.reduce((a,s)=>a+(s.ty==='w'?0:(s.done?1:.5)),0);if(!n)return;tot+=n;
    (muW(x.eid,x.vr)||[]).forEach(m=>{eff[m[0]]=(eff[m[0]]||0)+n*m[1];});
    const tx=exTaxOf(x.eid),rl=exRelOf(x.eid);
    if(rl){if(rl.pat==='horizontal push'||rl.pat==='vertical push')fam.push+=n;else if(rl.pat==='horizontal pull'||rl.pat==='vertical pull')fam.pull+=n;else if(rl.pat==='squat'||rl.pat==='lunge'||rl.pat==='knee extension')fam.quad+=n;else if(rl.pat==='hinge'||rl.pat==='knee flexion')fam.post+=n;}
    if(tx){if(tx.reg==='up'||tx.reg==='lo')reg[tx.reg]+=n;if(tx.mech==='C')comp.n++;}
  });
  return{eff:eff,fam:fam,reg:reg,ids:ids,comp:comp.n,tot:tot,lastEq:lastEq};
}
function nxCos(a,b){let d=0,na=0,nb=0;a.forEach(q=>{na+=q[1]*q[1];const o=b.find(z=>z[0]===q[0]);if(o)d+=q[1]*o[1];});b.forEach(q=>{nb+=q[1]*q[1];});return na&&nb?d/Math.sqrt(na*nb):0;}
function nxCalc(){
  const S=nxSession(),rec=recData(),hv=curHave(),L=curInjL(),skip=ACT.nxSkip||[],use={};
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{use[x.eid]=(use[x.eid]||0)+1;}));
  const novice=DATA.workouts.length<4,seen={};
  Object.keys(S.ids).forEach(id=>{const e=exById(id);if(e)seen[exKey(e)]=1;const r=exRelOf(id);if(r)r.sim.forEach(s=>{S.ids[s]=1;});});
  const C=[];
  pickPool().forEach(e=>{
    if(!e||e.g==='balance'||S.ids[e.id]||skip.indexOf(e.id)>=0||/^rh_/.test(e.id)||e.g==='mobility'||e.g==='cardio'||seen[exKey(e)]||!avail(e.id,hv))return;
    const w=muW(e.id);if(!w||!w.length)return;
    const lv=stressLvl(e.id,L);if(lv>=2)return;
    let mains=w.filter(q=>q[1]>=.8);if(!mains.length){const mx=Math.max.apply(null,w.map(q=>q[1]));mains=w.filter(q=>q[1]===mx);}
    const tx=exTaxOf(e.id),rl=exRelOf(e.id);
    if(rl&&(rl.pat==='balance'||rl.pat==='cardio'||rl.pat==='other'||rl.pat==='carry'))return;
    let sc=0,why=[];
    /* 1 · muscles you have not trained yet in this workout / músculos que aún no trabajas en este entrenamiento */
    const fresh=mains.reduce((a,q)=>a+Math.exp(-(S.eff[q[0]]||0)/3),0)/mains.length;sc+=40*fresh;
    /* 2 · muscles that are recovered from your last sessions / músculos recuperados de tus sesiones anteriores */
    let rp=0,low=0;mains.forEach(q=>{const g=muGroup(q[0]),r=g&&rec.g[g]&&rec.g[g].subs[q[0]],p=r&&r.pct!=null?Math.min(100,r.pct):100;rp+=p/100;if(p<50)low=1;});rp/=mains.length;
    sc+=20*rp-(low?30:0);
    /* 3 · do not pile more work on what is already tired in this workout / no sumar más a lo ya cansado en este entrenamiento */
    let ft=0,tw=0;w.forEach(q=>{ft+=q[1]*Math.min(1,(S.eff[q[0]]||0)/8);tw+=q[1];});sc-=25*(tw?ft/tw:0);
    /* 4 · push / pull balance / balance empuje y jalón */
    let bal='';
    if(tx){
      /* push / pull only counts the big presses and rows or pulldowns, not curls or raises / empuje y jalón solo cuentan press y remos o jalones, no curls ni elevaciones */
      const pp=rl&&(rl.pat==='horizontal push'||rl.pat==='vertical push'),pl=rl&&(rl.pat==='horizontal pull'||rl.pat==='vertical pull');
      if(pl&&S.fam.push-S.fam.pull>=2){sc+=14;bal='nxPull';}
      else if(pp&&S.fam.pull-S.fam.push>=2){sc+=14;bal='nxPush';}
      const qd=rl&&(rl.pat==='squat'||rl.pat==='lunge'||rl.pat==='knee extension'),ps=rl&&(rl.pat==='hinge'||rl.pat==='knee flexion');
      if(ps&&S.fam.quad-S.fam.post>=2){sc+=14;bal='nxPost';}
      else if(qd&&S.fam.post-S.fam.quad>=2){sc+=14;bal='nxQuad';}
      /* same half of the body as the workout so far: an upper day stays upper, a leg day stays legs / la misma mitad del cuerpo */
      const rt=S.reg.up+S.reg.lo;
      if(rt>=3&&(tx.reg==='up'||tx.reg==='lo')){const sh=S.reg[tx.reg]/rt;if(sh>=.7)sc+=14;else if(sh<=.3)sc-=14;}
      /* 5 · big lifts first, then single-joint work for what you already trained / primero los básicos, luego aislamiento */
      if(S.comp===0&&tx.mech==='C')sc+=8;
      else if(S.comp===0&&tx.mech==='I')sc-=4;
      if(S.comp>=2&&tx.mech==='I'&&mains.some(q=>(S.eff[q[0]]||0)>=1&&(S.eff[q[0]]||0)<9)){sc+=6;bal=bal||'nxFin';}
    }
    /* 6 · what you know and like; advanced moves wait for experience / lo que ya conoces; lo avanzado espera experiencia */
    if(mains.some(q=>NX_BIG.indexOf(q[0])>=0))sc+=4;
    const u=use[e.id]||0;sc+=Math.min(8,3*Math.log2(1+u));
    if(rl&&rl.diff>=3&&!u)sc-=8;
    if(/^z_/.test(e.id)&&!u)sc-=6;                                  // curated moves first / primero los ejercicios curados
    if(mains.every(q=>NX_MINOR.indexOf(q[0])>=0)&&!u)sc-=12;       // small muscles are not the first pick / los músculos pequeños no van primero
    if(novice&&rl&&rl.diff>=2&&!u)sc-=10;
    if(lv===1)sc-=8;
    if(S.lastEq&&e.e===S.lastEq)sc+=3;
    const top=mains.slice().sort((a,b)=>b[1]-a[1])[0][0];
    why=[bal||(fresh>.8&&S.tot>0?'nxFresh':u>=3?'nxFav':'nxRec'),top,lv===1?'nxCare':''];
    C.push({e:e,sc:sc,w:w,why:why,top:top});
  });
  C.sort((a,b)=>b.sc-a.sc);
  const out=[];
  for(let k=0;k<NX_K&&C.length;k++){
    const b=C.shift();out.push(b);
    C.forEach(c=>{if(nxCos(b.w,c.w)>.8)c.sc-=25;else if(c.top===b.top)c.sc-=10;});
    C.sort((a,b2)=>b2.sc-a.sc);
  }
  return{list:out,tot:S.tot};
}
function nxHtml(){
  if(!ACT||!ACT.ex.length)return'';
  const sig=ACT.ex.map(x=>x.eid+':'+x.sets.filter(s=>s.done).length+'/'+x.sets.length).join(',')+'|'+(ACT.nxSkip||[]).join(',');
  if(!_nxMemo||_nxMemo.sig!==sig)_nxMemo={sig:sig,r:nxCalc()};
  const r=_nxMemo.r;if(!r.list.length)return'';
  const rows=r.list.map(c=>{
    const e=c.e,g=muGroup(c.top),w=c.why,rs=t(w[0],g?t('g_'+g):'')+(w[2]?' · '+t(w[2]):'');
    return'<div class="nx-r"><button class="nx-n" onclick="howOpen(\''+e.id+'\')"><b>'+esc(exName(e.id,e.en))+'</b><small>'+esc(rs)+' · '+esc(t('e_'+e.e))+'</small></button>'+
      '<button class="btn sm" onclick="nxAdd(\''+e.id+'\')">＋ '+t('nxAdd')+'</button><button class="ico nx-x" aria-label="'+esc(t('nxSkip'))+'" onclick="nxSkip(\''+e.id+'\')">✕</button></div>';
  }).join('');
  return'<section class="card nx"><div class="nx-h"><b>'+t('nxTitle')+'</b></div>'+rows+'</section>';
}
function nxAdd(eid){
  if(!ACT)return;const le=lastEx(eid);
  addExTo(eid,le&&le.x.sets.length?Math.min(5,le.x.sets.length):3);
  saveAct();render();
  setTimeout(()=>{const c=document.getElementById('exc'+(ACT.ex.length-1));if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'center'});},60);
}
function nxSkip(eid){if(!ACT)return;(ACT.nxSkip=ACT.nxSkip||[]).push(eid);saveAct();render();}
