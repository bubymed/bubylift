/* Ready routines and challenges (v28): focused routines by muscle and level, and timed challenges.
   Rutinas listas y retos (v28): rutinas enfocadas por músculo y nivel, y retos con tiempo. */
const LIB_FILT=['all','pt','cf','hy','run','mil','bw'];
let LIB={tab:'focus',area:'full',lv:1,sel:null,clv:1,flt:'all',eq:false,sp:'ppl',spn:3,spl:null,spsd:0,pg:'sl'};
let CHR=null,CHT=null; // challenge being run, and its timer / reto en curso y su temporizador
NT_KEYS.push('lz_std','lz_rom','lz_uni','lz_prof','lz_inst','lz_lever','lz_mom'); // notes shown while training / notas durante el entrenamiento

function libHave(){return Array.isArray(SET.libHave)?SET.libHave:curHave();}
function libTogHave(k){const a=libHave().slice(),i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.push(k);SET.libHave=a;saveSet();libDraw();}
function libPreset(k){SET.libHave=HAVE_PRESETS[k].slice();saveSet();libDraw();}

/* ---------- focused routines / rutinas enfocadas ---------- */
/* 6 ranks over 3 content levels: even ranks are the level itself, odd ranks add a set / 6 rangos sobre 3 niveles de contenido: los pares son el nivel, los impares suman una serie */
const RANK_BASE=[0,0,1,1,2,2],RANK_SETS=[0,1,0,1,0,2];
function libDefaultRank(){const p=profNow();return p?({new:0,some:2,adv:4}[p.lvl]||1):1;}
function libFocus(area,rank,have0){
  // equipment routines assume the piece of equipment; the rest of your list still counts (bench, bar…) / las rutinas por equipo dan por hecho el equipo; el resto de tu lista cuenta
  const have=LIB_EQ.indexOf(area)>=0&&LIB_EQKEY[area]?have0.concat([LIB_EQKEY[area]]):have0;
  const li=RANK_BASE[rank]||0,prof=profNow(),L=curInjL(),used={},out=[];
  (FOCUS[area]&&FOCUS[area][li]||[]).forEach(s=>{
    const p=s.split('|'),alts=p[0].split(','),lever=p[1],sets=+p[2],lo=+p[3],hi=+p[4];
    let id=null;
    for(let i=0;i<alts.length&&!id;i++){const a=alts[i];if(!used[a]&&avail(a,have)&&stressLvl(a,L)<2&&!(prof&&prefBad(a,prof)))id=a;}
    if(!id&&LIB_EQ.indexOf(area)<0&&area!=='stretch'){const c=swapCands(alts[0],have,L,used,li===0?1:2).filter(x=>!(prof&&prefBad(x.id,prof)));if(c.length)id=c[0].id;}
    if(!id)return;
    used[id]=1;
    const hold=exMode(id)==='t',secs=hold&&lo>=20;
    out.push({eid:id,sets:Math.min(6,sets+RANK_SETS[rank]),lo:hold?(secs?lo/60:0.5):lo,hi:hold?(secs?hi/60:1):hi,u:hold?'m':'r',lever:lever,rs:Math.max(45,(li===0?75:(li===1?90:(lever==='mom'?150:105)))-(rank===5?15:0)),cn:stressJoints(id,L,1)});
  });
  return out;
}
/* rank names follow what you are training: one ladder per muscle area and per kind of challenge / los nombres de rango siguen lo que entrenas */
function chCat(c){const o=['hy','mil','run','cf','pt'];for(let i=0;i<o.length;i++)if(c.tg.indexOf(o[i])>=0)return o[i];return'pt';}
function rk(kind,i){return t('rk_'+(LIB_EQ.indexOf(kind)>=0?'eq':kind)+'_'+i);}
function libFocusName(area,li){return t('lib_'+area)+' · '+rk(area,li);}
function libFocusStart(area,li){
  if(ACT){toast(t('finishFirst'));return;}
  const items=libFocus(area,li,libHave());if(!items.length){toast(t('libNone'));return;}
  sheetClose();
  startWorkout({name:libFocusName(area,li),ex:items.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:'lz_'+e.lever,rs:e.rs}}))});
}
function libFocusSave(area,li){
  const items=libFocus(area,li,libHave());if(!items.length)return;
  DATA.routines.push({id:uid(),name:libFocusName(area,li),ex:items.map(e=>({eid:e.eid,n:(exById(e.eid)||{}).en||e.eid,sets:e.sets}))});
  saveData();toast(t('libSaved'));render();
}
function tgLine(e){const rg=e.lo===e.hi?fmtNum(e.hi,1):fmtNum(e.lo,1)+'–'+fmtNum(e.hi,1);return e.sets+' × '+rg+(e.u==='m'?' '+t('minU'):'');}

/* ---------- challenges / retos ---------- */
function chScale(q,u,m){
  if(u==='m')return Math.max(10,Math.round(q*m/5)*5);
  if(u==='s')return Math.max(10,Math.round(q*m/5)*5);
  return Math.max(1,Math.round(q*m));
}
/* one movement: first option the person can do; the last one is bodyweight / un movimiento: la primera opción posible */
function chMove(spec,have,L,m,a,used){
  const opts=spec.split('|').map(o=>{
    const p=o.split(':'),mm=/^(\d+|max|\{a\})(m|s)?$/.exec(p[1]||'');
    return{id:p[0],q:mm?mm[1]:'1',u:mm&&mm[2]?mm[2]:'r'};
  });
  // first option the person can do that is not already in this round; if every option repeats, take the first one they can do
  // primera opción posible que no esté ya en esta ronda; si todas se repiten, la primera posible
  let k=-1,k2=-1;
  for(let i=0;i<opts.length;i++){
    if(!avail(opts[i].id,have)||stressLvl(opts[i].id,L)>=2)continue;
    if(k2<0)k2=i;
    if(!used||!used[opts[i].id]){k=i;break;}
  }
  if(k<0)k=k2>=0?k2:opts.length-1;
  if(used)used[opts[k].id]=1;
  const o=opts[k];let q=o.q;
  if(q==='{a}')q=a;
  if(q==='max')return{id:o.id,q:0,u:'max',first:k===0};
  return{id:o.id,q:chScale(+q,o.u,m),u:o.u,first:k===0};
}
/* rank multiplier: between the three levels, and a little above the hardest (never above the real distance when fx) / multiplicador por rango */
function chMult(c,li){
  const a=c.lv[0],b=c.lv[1],h=c.lv[2],top=c.fx?h:h*1.15;
  return[a,(a+b)/2,b,(b+h)/2,h,top][li];
}
function chBuild(c,li,have){
  const L=curInjL(),m=chMult(c,li),segs=[];
  const rounds=c.ty==='time'?(c.rd||1):1;
  for(let r=0;r<rounds;r++){
    const used=c.rep?null:{}; // movements already in this round / movimientos ya usados en esta ronda
    c.mv.forEach(sp=>{
      const a=c.rr?Math.max(1,Math.round(c.rr[r]*m)):0;
      const s=chMove(sp,have,L,c.rr?1:m,a,used);s.r=r;segs.push(s);
    });
  }
  return{c:c,li:li,segs:segs,exact:segs.every(s=>s.first),cap:c.cap,rd:c.ty==='interval'?Math.max(1,Math.round(c.rd*m)):0,w:(c.ty==='interval'&&li>=4&&c.hw)?c.hw:c.w};
}
function chQty(s){
  if(s.u==='max')return t('chMax');
  if(s.u==='m')return s.q+' m';
  if(s.u==='s')return s.q+' s';
  return '× '+s.q;
}
function chSegTxt(s){return exName(s.id)+' '+chQty(s);}
function chScoreTxt(ty,sc){
  if(!sc)return'';
  if(ty==='time')return fmtClock(sc.v);
  if(ty==='amrap')return t('chRounds',sc.r,sc.x||0);
  if(ty==='emom')return t('chMin',sc.v);
  return t('chReps',sc.v);
}
function fmtClock(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0');}
function chKey(sc,ty){return ty==='time'?-sc.v:(ty==='amrap'?sc.r*1000+(sc.x||0):sc.v);}
function chLvOf(ch){return ch.v===2?ch.lv:[0,2,4][ch.lv];} // results saved before the ranks / resultados anteriores a los rangos
function chBest(id,li,ty){
  let b=null;
  DATA.workouts.forEach(w=>{if(w.ch&&w.ch.id===id&&chLvOf(w.ch)===li&&w.ch.sc){const k=chKey(w.ch.sc,ty);if(b===null||k>b.k)b={k:k,sc:w.ch.sc};}});
  return b;
}

/* ---------- library screen / pantalla de la biblioteca ---------- */
function libOpen(){if(!LIB.set){LIB.lv=LIB.clv=libDefaultRank();LIB.set=1;}LIB.sel=null;libDraw();}
function libTab(k){LIB.tab=k;LIB.sel=null;libDraw();}
function libArea(k){LIB.area=k;libDraw();}
function libLv(i){LIB.lv=+i;libDraw();}
function libFlt(k){LIB.flt=k;libDraw();}
function libSel(id){LIB.sel=id;libDraw();}
function libBack(){LIB.sel=null;libDraw();}
function libCLv(i){LIB.clv=+i;libDraw();}
function libEq(){LIB.eq=!LIB.eq;libDraw();}
function libHow(id){howOpen(id,'libDraw');}
function libChips(arr,cur,fn,lab,wrap){return'<div class="chips'+(wrap?' wrap':'')+'">'+arr.map((k,i)=>{const v=typeof k==='number'?k:k;return'<button class="chip'+(String(v)===String(cur)?' on':'')+'" onclick="'+fn+'(\''+v+'\')">'+lab(v)+'</button>';}).join('')+'</div>';}
/* a numbered rank card grid, different from the pill buttons / cuadrícula de rangos numerados, distinta de los botones de píldora */
function libRanks(kind,cur,fn){
  return'<div class="rkg">'+[0,1,2,3,4,5].map(i=>'<button class="rk'+(i===cur?' on':'')+'" onclick="'+fn+'('+i+')"><i>'+(i+1)+'</i><span>'+esc(rk(kind,i))+'</span></button>').join('')+'</div>';
}
function libStep(n,key){return'<div class="lstep"><b>'+n+'</b><span>'+t(key)+'</span></div>';}
function libEqHtml(){
  const have=libHave();
  return'<details class="dtl" '+(LIB.eq?'open ':'')+'ontoggle="LIB.eq=this.open"><summary><b>'+t('libEq')+'</b> <span class="muted sm">'+have.length+'</span></summary>'+
    haveChips(have,'libTogHave')+
    '<div class="row"><button class="btn sm" onclick="libPreset(\'gym\')">'+t('eqp_gym')+'</button><button class="btn sm" onclick="libPreset(\'db\')">'+t('eqp_db')+'</button><button class="btn sm" onclick="libPreset(\'home\')">'+t('eqp_home')+'</button><button class="btn sm" onclick="libPreset(\'none\')">'+t('eqp_none')+'</button></div></details>';
}
function libDraw(){
  let h='<div class="form lib"><div class="pick-h"><h3>'+t(LIB.tab==='focus'?'pkMusT':(LIB.tab==='split'?'pkSpT':(LIB.tab==='prog'?'pkPrT':'pkChT')))+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>';
  h+='<div class="seg"><button class="'+(LIB.tab==='focus'?'on':'')+'" onclick="libTab(\'focus\')">💪 '+t('libFocusT')+'</button><button class="'+(LIB.tab==='split'?'on':'')+'" onclick="libTab(\'split\')">🔀 '+t('libSplitT')+'</button><button class="'+(LIB.tab==='prog'?'on':'')+'" onclick="libTab(\'prog\')">🏆 '+t('libProgT')+'</button><button class="'+(LIB.tab==='ch'?'on':'')+'" onclick="libTab(\'ch\')">⏱️ '+t('libChT')+'</button></div>';
  h+=libEqHtml();
  h+=LIB.tab==='focus'?libFocusHtml():(LIB.tab==='split'?libSplitHtml():(LIB.tab==='prog'?libProgHtml():(LIB.sel?libChDetail():libChList())));
  h+='</div>';
  sheet(h);
}
function libFocusHtml(){
  const li=LIB.lv,items=libFocus(LIB.area,li,libHave());
  let h='<p class="muted sm">'+t('libFocusP')+'</p>'+
    libStep(1,'libStep1')+libChips(LIB_AREAS,LIB.area,'libArea',k=>t('lib_'+k),1)+'<p class="muted sm">'+t('libOrEq')+'</p>'+libChips(LIB_EQ,LIB.area,'libArea',k=>t('lib_'+k),1)+
    libStep(2,'libStep2')+libRanks(LIB.area,li,'libLv')+
    '<div class="card optb"><b>'+rk(LIB.area,li)+' <span class="muted sm">'+t('rankOf',li+1)+'</span></b><p class="sm">'+t('lvd_'+li)+'</p></div>';
  h+=libStep(3,'libStep3');
  if(!items.length)return h+'<p class="muted">'+t('libNone')+'</p>';
  h+=items.map(e=>'<div class="plex">'+exThumb(e.eid)+'<span><b>'+esc(exName(e.eid))+'</b><small>'+esc(tgLine(e))+' · '+esc(t('rsSec',e.rs))+(e.cn?' · ⚠ '+esc(t('caution')):'')+'</small><small class="rz">'+esc(t('lz_'+e.lever))+'</small></span><button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="libHow(\''+e.eid+'\')">ⓘ</button></div>').join('');
  if(items.length<4)h+='<p class="muted sm">'+t('libFew')+'</p>';
  h+='<div class="row"><button class="btn pri" onclick="libFocusStart(\''+LIB.area+'\','+li+')">'+t('libStart')+'</button><button class="btn" onclick="libFocusSave(\''+LIB.area+'\','+li+')">'+t('libSave')+'</button>'+
    (DATA.plan?'<button class="btn" onclick="xdAdd(\'f:'+LIB.area+':'+li+'\')">'+t('libAddPlan')+'</button>':'')+'</div>'+
    '<p class="muted sm">'+t('libNote')+'</p>';
  return h;
}
function libChList(){
  const have=libHave();
  let h='<p class="muted sm">'+t('libChP')+'</p>'+libStep(1,'libStepF')+libChips(LIB_FILT,LIB.flt,'libFlt',k=>t('chf_'+k),1)+libStep(2,'libStepP');
  const list=CHALLENGES.filter(c=>LIB.flt==='all'||c.tg.indexOf(LIB.flt)>=0);
  h+=list.map(c=>{
    const b=chBuild(c,LIB.clv,have),best=chBest(c.id,LIB.clv,c.ty);
    return'<button class="card chc" onclick="libSel(\''+c.id+'\')"><b>'+esc(t('ch_'+c.id))+'</b><div class="muted sm">'+esc(t('chty_'+c.ty,c.cap))+' · '+c.tg.map(k=>t('chf_'+k)).join(' · ')+'</div><div class="muted sm">'+t('rankOf',LIB.clv+1)+' · '+esc(rk(chCat(c),LIB.clv))+' · '+(b.exact?t('chExact'):t('chAdapt'))+(best?' · 🏆 '+esc(chScoreTxt(c.ty,best.sc)):'')+'</div></button>';
  }).join('');
  return h;
}
function libChDetail(){
  const c=CHALLENGES.find(x=>x.id===LIB.sel);if(!c){LIB.sel=null;return libChList();}
  const li=LIB.clv,b=chBuild(c,li,libHave()),best=chBest(c.id,li,c.ty);
  let h='<button class="btn sm" onclick="libBack()">← '+t('back')+'</button><h3>'+esc(t('ch_'+c.id))+'</h3>'+
    '<p class="muted sm">'+esc(t('chty_'+c.ty,c.cap))+' · '+c.tg.map(k=>t('chf_'+k)).join(' · ')+'</p>'+
    '<p>'+esc(t('chd_'+c.id))+'</p>'+
    libStep(1,'libStepR')+libRanks(chCat(c),li,'libCLv')+
    '<p class="sm"><b>'+rk(chCat(c),li)+'</b> <span class="muted">'+t('rankOf',li+1)+'</span> · '+t('lvd_'+li)+'</p>'+
    libStep(2,'libStepW')+
    '<div class="card optb"><p class="sm">'+esc(t('chfx_'+c.ty,c.cap,b.w||0,c.r||0,b.rd||0))+'</p>'+
    '<ol class="how">'+chDetailRows(b).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'+
    (c.rest?'<p class="muted sm">'+t('chRest',c.rest)+'</p>':'')+
    '<p class="muted sm">'+(b.exact?t('chExact'):t('chAdaptP'))+'</p>'+
    (best?'<p><b>🏆 '+t('chBest')+':</b> '+esc(chScoreTxt(c.ty,best.sc))+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="chGo(\''+c.id+'\','+li+')">'+t('chStart')+'</button>'+(DATA.plan?'<button class="btn" onclick="xdAdd(\'c:'+c.id+':'+li+'\')">'+t('libAddPlan')+'</button>':'')+'</div>'+
    '<p class="muted sm">'+t('chSafe')+'</p>';
  return h;
}
function chDetailRows(b){
  if(b.c.ty==='time'&&b.c.rd>1){
    const per=b.segs.length/b.c.rd,rows=[];
    for(let r=0;r<b.c.rd;r++)rows.push(t('chRound',r+1)+': '+b.segs.slice(r*per,(r+1)*per).map(chSegTxt).join(' + '));
    return rows;
  }
  return b.segs.map(chSegTxt);
}

/* ---------- running a challenge / hacer un reto ---------- */
function chGo(id,li){
  if(ACT){toast(t('finishFirst'));return;}
  const c=CHALLENGES.find(x=>x.id===id);if(!c)return;
  const b=chBuild(c,li,libHave());
  CHR={b:b,t0:0,idx:0,splits:[],rounds:0,run:false,done:false,ph:-1};
  chDraw();
}
function chStop(){clearInterval(CHT);CHT=null;}
function chStartRun(){
  if(!CHR||CHR.run)return;
  CHR.run=true;CHR.t0=Date.now();CHR.ph=-1;
  unlockAudio();
  CHT=setInterval(chTick,250);chDraw();
}
function chElapsed(){return CHR&&CHR.run?(Date.now()-CHR.t0)/1000:0;}
/* position inside the timed formats / posición dentro de los formatos con tiempo */
function chPos(){
  const b=CHR.b,c=b.c,e=chElapsed();
  if(c.ty==='emom'){const m=Math.floor(e/60);return{k:m,left:60-(e%60),end:e>=c.cap*60};}
  if(c.ty==='interval'){
    const w=b.w,r=c.r,per=w+r,blk=b.rd*per,n=c.mv.length,tot=blk*n;
    if(e>=tot)return{end:true};
    const bi=Math.floor(e/blk),inb=e%blk,ri=Math.floor(inb/per),inr=inb%per;
    return{mv:bi,round:ri,work:inr<w,left:inr<w?w-inr:per-inr,end:false,key:bi*1000+ri*2+(inr<w?0:1)};
  }
  if(c.ty==='amrap')return{left:Math.max(0,c.cap*60-e),end:e>=c.cap*60};
  return{end:false};
}
function chTick(){
  if(!CHR||!CHR.run||CHR.done){chStop();return;}
  const c=CHR.b.c,p=chPos(),el=$('chclk');
  if(c.ty==='time'){if(el)el.textContent=fmtClock(chElapsed());return;}
  if(p.end){beep();chStop();CHR.done=true;chEnd();return;}
  if(c.ty==='emom'){
    if(CHR.ph!==p.k){if(CHR.ph>=0)beep();CHR.ph=p.k;chDraw();}
    const e2=$('chclk');if(e2)e2.textContent=fmtClock(p.left);
  }else if(c.ty==='interval'){
    if(CHR.ph!==p.key){if(CHR.ph!==-1)beep();CHR.ph=p.key;chDraw();}
    const e2=$('chclk');if(e2)e2.textContent=String(Math.ceil(p.left));
  }else{
    if(el)el.textContent=fmtClock(p.left);
    if(!CHR.warn&&p.left<=10){CHR.warn=1;beep();}
  }
}
function chDraw(){
  if(!CHR)return;
  const b=CHR.b,c=b.c,li=b.li;
  let h='<div class="form lib"><div class="pick-h"><h3>'+esc(t('ch_'+c.id))+'</h3><button class="ico" onclick="chAskQuit()" aria-label="'+esc(t('close'))+'">✕</button></div>';
  if(!CHR.run){
    h+='<p class="muted sm">'+esc(t('chty_'+c.ty,c.cap))+' · '+rk(chCat(c),li)+'</p><div class="card optb"><ol class="how">'+chDetailRows(b).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'+
      '<p class="muted sm">'+t('chReady')+'</p><div class="row"><button class="btn pri big wide" onclick="chStartRun()">'+t('chGo')+'</button></div></div>';
    sheet(h);return;
  }
  const p=chPos();
  if(c.ty==='time'){
    h+='<div class="chclk" id="chclk">'+fmtClock(chElapsed())+'</div><p class="muted sm center">'+t('chCap',c.cap)+'</p>';
    const per=c.rd>1?b.segs.length/c.rd:b.segs.length;
    h+=b.segs.map((s,i)=>'<div class="chseg'+(i<CHR.idx?' done':(i===CHR.idx?' now':''))+'">'+(c.rd>1&&i%per===0?'<small>'+t('chRound',s.r+1)+'</small>':'')+'<span>'+(i<CHR.idx?'✓ ':'')+esc(chSegTxt(s))+'</span>'+(i<CHR.idx?'<i>'+fmtClock(CHR.splits[i])+'</i>':'')+'</div>').join('');
    h+='<div class="row"><button class="btn pri big wide" onclick="chSegDone()">'+(CHR.idx>=b.segs.length-1?t('chFinishB'):t('chNext'))+'</button></div>';
  }else if(c.ty==='amrap'){
    h+='<div class="chclk" id="chclk">'+fmtClock(p.left)+'</div><div class="chr"><b>'+CHR.rounds+'</b> '+t('chRoundsL')+'</div>'+
      '<div class="card optb"><ol class="how">'+b.segs.map(s=>'<li>'+esc(chSegTxt(s))+'</li>').join('')+'</ol></div>'+
      '<div class="row"><button class="btn pri big wide" onclick="chRound()">+1 '+t('chRoundsL')+'</button></div><div class="row"><button class="btn" onclick="chUndo()">−1</button><button class="btn" onclick="chEnd()">'+t('chFinishNow')+'</button></div>';
  }else if(c.ty==='emom'){
    const cur=b.segs[p.k%b.segs.length],nx=b.segs[(p.k+1)%b.segs.length];
    h+='<div class="chclk" id="chclk">'+fmtClock(p.left)+'</div><p class="center muted">'+t('chMinute',p.k+1,c.cap)+'</p><div class="chnow">'+esc(chSegTxt(cur))+'</div><p class="center muted sm">'+t('chNextUp')+': '+esc(chSegTxt(nx))+'</p><div class="row"><button class="btn" onclick="chEnd()">'+t('chFinishNow')+'</button></div>';
  }else{
    const cur=b.segs[Math.min(p.mv||0,b.segs.length-1)];
    h+='<div class="chclk '+(p.work?'work':'rest')+'" id="chclk">'+Math.ceil(p.left||0)+'</div><p class="center"><b>'+(p.work?t('chWork'):t('chRestL'))+'</b> · '+t('chRoundOf',(p.round||0)+1,b.rd)+'</p><div class="chnow">'+esc(exName(cur.id))+'</div><div class="row"><button class="btn" onclick="chEnd()">'+t('chFinishNow')+'</button></div>';
  }
  h+='</div>';
  sheet(h);
}
function chRound(){if(CHR&&CHR.run){CHR.rounds++;beep();chDraw();}}
function chUndo(){if(CHR&&CHR.rounds>0){CHR.rounds--;chDraw();}}
function chSegDone(){
  if(!CHR||!CHR.run)return;
  CHR.splits[CHR.idx]=chElapsed();CHR.idx++;
  if(CHR.idx>=CHR.b.segs.length){CHR.done=true;chStop();chEnd();return;}
  chDraw();
}
function chAskQuit(){
  if(!CHR||!CHR.run){CHR=null;sheetClose();return;}
  ask(t('chQuit'),t('discard'),function(){chStop();CHR=null;sheetClose();},true);
}
/* score screen: AMRAP and intervals ask for the extra number / pantalla de resultado */
function chEnd(){
  if(!CHR)return;chStop();CHR.done=true;
  const c=CHR.b.c,el=chElapsed();CHR.el=el;
  if(c.ty==='time'){chSave({v:Math.round(el)});return;}
  let h='<div class="form lib"><h3>'+t('chResult')+'</h3>';
  if(c.ty==='amrap')h+='<p>'+t('chRounds',CHR.rounds,0)+'</p><label>'+t('chExtra')+'<input class="in wide" id="chin" type="number" inputmode="numeric" min="0" max="999" value="0"></label>';
  else if(c.ty==='emom')h+='<label>'+t('chMinDone')+'<input class="in wide" id="chin" type="number" inputmode="numeric" min="0" max="'+c.cap+'" value="'+Math.min(c.cap,Math.floor(el/60))+'"></label>';
  else h+='<label>'+t('chRepsDone')+'<input class="in wide" id="chin" type="number" inputmode="numeric" min="0" max="999" value="0"></label>';
  h+='<div class="row"><button class="btn pri" onclick="chSaveForm()">'+t('save')+'</button></div></div>';
  sheet(h);
}
function chSaveForm(){
  const c=CHR.b.c,n=Math.max(0,Math.min(999,parseInt(($('chin')||{}).value,10)||0));
  if(c.ty==='amrap')chSave({r:CHR.rounds,x:n});else chSave({v:n});
}
function chSave(sc){
  const b=CHR.b,c=b.c,now=Date.now(),prev=chBest(c.id,b.li,c.ty);
  // totals per movement; a distance on a rep exercise counts about 2 m per rep / totales por movimiento
  const tot={};
  const rounds=c.ty==='amrap'?Math.max(1,CHR.rounds):(c.ty==='emom'?Math.max(1,Math.floor((sc.v||0)/b.segs.length)):1);
  b.segs.forEach(s=>{
    if(s.u==='max'){const x0=tot[s.id]||(tot[s.id]={r:0,d:0,t:0});x0.r+=Math.round((sc.v||0)/b.segs.length);return;} // reps split evenly / repeticiones repartidas por igual
    const x=tot[s.id]||(tot[s.id]={r:0,d:0,t:0}),mode=exMode(s.id);
    const mult=(c.ty==='amrap'||c.ty==='emom')?rounds:1;
    if(s.u==='m'){if(mode==='t')x.d+=s.q*mult/1000;else x.r+=Math.round(s.q*mult/2);}
    else if(s.u==='s'){if(mode==='t')x.t+=s.q*mult/60;else x.r+=Math.round(s.q*mult/3);}
    else x.r+=s.q*mult;
  });
  const ex=[];
  Object.keys(tot).forEach(id=>{
    const x=tot[id],mode=exMode(id),e=exById(id);let set=null;
    if(mode==='t'){if(x.d||x.t)set={w:null,r:null,t:x.t?Math.round(x.t*10)/10:null,d:x.d?Math.round(x.d*1000)/1000:null};}
    else if(x.r)set={w:null,r:x.r,t:null,d:null};
    if(set)ex.push({eid:id,n:e?e.en:id,sets:[set]});
  });
  if(!ex.length)ex.push({eid:b.segs[0].id,n:exName(b.segs[0].id),sets:[{w:null,r:1,t:null,d:null}]});
  const txt=chScoreTxt(c.ty,sc),better=!prev||chKey(sc,c.ty)>prev.k;
  DATA.workouts.push({id:uid(),t:CHR.t0||now,end:now,name:t('ch_'+c.id)+' · '+rk(chCat(c),b.li),note:t('chNote',txt),ex:ex,ch:{id:c.id,lv:b.li,v:2,sc:sc}});
  DATA.workouts.sort((a,x)=>x.t-a.t);saveData();
  const pr=prev&&better;
  CHR=null;
  sheet('<div class="form lib"><h3>'+(pr?'🏆 '+t('chNewPR'):t('chDone'))+'</h3><div class="chclk">'+esc(txt)+'</div>'+(prev&&!pr?'<p class="center muted">'+t('chBest')+': '+esc(chScoreTxt(c.ty,prev.sc))+'</p>':'')+'<div class="row"><button class="btn pri" onclick="sheetClose();render()">'+t('done')+'</button></div></div>');
  render();
}

/* ---------- extra days in the plan / días extra en el plan ---------- */
function xdParse(k){const p=String(k).split(':');return p.length===3?{ty:p[0],id:p[1],li:+p[2]}:null;}
function xdName(k){
  const x=xdParse(k);if(!x)return'';
  return x.ty==='f'?libFocusName(x.id,x.li):t('ch_'+x.id)+' · '+rk(chCat(CHALLENGES.find(q=>q.id===x.id)||{tg:[]}),x.li);
}
function xdAdd(k){
  const p=DATA.plan;if(!p)return;
  p.xd=p.xd||[];
  if(p.xd.indexOf(k)>=0){toast(t('xdHave'));return;}
  if(p.xd.length>=6){toast(t('xdMax'));return;}
  p.xd.push(k);saveData();toast(t('xdAdded'));render();
}
function xdDel(i){const p=DATA.plan;if(!p||!p.xd)return;p.xd.splice(i,1);saveData();planOpen();render();}
function xdStart(i){
  const p=DATA.plan,k=p&&p.xd&&p.xd[i],x=xdParse(k);if(!x)return;
  if(x.ty==='f'){sheetClose();libFocusStart(x.id,x.li);}
  else{if(ACT){toast(t('finishFirst'));return;}LIB.clv=x.li;chGo(x.id,x.li);}
}
function xdHtml(){
  const p=DATA.plan;if(!p||!p.xd||!p.xd.length)return'';
  return'<div class="lbl">'+t('xdT')+'</div><p class="muted sm">'+t('xdP')+'</p>'+p.xd.map((k,i)=>'<div class="plex"><span><b>'+esc(xdName(k))+'</b></span><button class="btn sm" onclick="xdStart('+i+')">'+t('libStart')+'</button><button class="ico" aria-label="'+esc(t('delete'))+'" onclick="xdDel('+i+')">🗑</button></div>').join('');
}
/* ---------- famous splits, straight to the point / divisiones famosas, directo ---------- */
function libSp(id){LIB.sp=id;if(!splitOk(id,LIB.spn))LIB.spn=[3,4,5,2].find(n=>splitOk(id,n))||3;libDraw();}
function libSpN(n){LIB.spn=+n;libDraw();}
function libSpL(k){LIB.spl=k;libDraw();}
function libSpProf(){
  const p=DATA.plan,base=p?p.prof:{goal:'muscle',len:60,inj:[],avoid:[],fav:[]};
  if(!LIB.spsd)LIB.spsd=(Math.random()*1e6|0)+1;
  const lvl=LIB.spl||(p?p.lvl:'some');
  return Object.assign({},base,{n:LIB.spn,lvl:lvl,have:libHave().slice(),split:LIB.sp,sd:LIB.spsd,rt:0,ph:0,no:[]});
}
function libSpPlan(){try{return genPlan(libSpProf());}catch(e){return null;}}
function libSplitHtml(){
  if(!splitOk(LIB.sp,LIB.spn))LIB.spn=[3,4,5,2].find(n=>splitOk(LIB.sp,n))||3;
  const p=libSpPlan(),lvl=LIB.spl||(DATA.plan?DATA.plan.lvl:'some');
  let h='<p class="muted sm">'+t('libSplitP')+'</p>'+
    libStep(1,'spStep1')+'<div class="spl">'+SPLIT_IDS.map(id=>'<button class="card spc'+(id===LIB.sp?' on':'')+'" onclick="libSp(\''+id+'\')"><b>'+t('spl_'+id)+'</b><small>'+t('spd_'+id)+'</small></button>').join('')+'</div>'+
    libStep(2,'spStep2')+libChips(['new','some','adv'],lvl,'libSpL',k=>t('pl_'+k),1)+
    libStep(3,'spStep3')+libChips([2,3,4,5].filter(n=>splitOk(LIB.sp,n)),LIB.spn,'libSpN',n=>t('spDays',n),1)+
    libStep(4,'spStep4');
  if(!p||!p.ds||!p.ds.length)return h+'<p class="muted">'+t('libNone')+'</p>';
  LIB.spPlan=p;
  h+='<p class="muted sm">'+t('spNote')+'</p>';
  h+=p.ds.map((d,i)=>{
    const rs=d.ex.filter(e=>e.sec==='rs');
    return'<div class="card spd"><b>'+esc(t('planDay',i+1)+' · '+t('pd_'+d.k))+'</b>'+
      '<ul class="optul">'+rs.map(e=>'<li>'+esc(exName(e.eid))+' <span class="muted">'+esc(tgText(e))+'</span></li>').join('')+'</ul>'+
      (d.wy&&d.wy.length?'<details class="dtl"><summary class="sm">'+t('wyT')+'</summary><ul class="optul">'+d.wy.map(s=>'<li>'+esc(wyText(s))+'</li>').join('')+'</ul></details>':'')+
      '<div class="row"><button class="btn sm pri" onclick="libSpDay('+i+')">'+t('spStartDay')+'</button><button class="btn sm" onclick="libSpSave('+i+')">'+t('spSaveDay')+'</button></div></div>';
  }).join('');
  h+='<div class="row"><button class="btn pri" onclick="libSpUse()">'+t('spUse')+'</button></div><p class="muted sm">'+t('spUseP')+'</p>';
  return h;
}
function libSpDay(i){
  const p=LIB.spPlan;if(!p||!p.ds[i])return;
  if(ACT){toast(t('finishFirst'));return;}
  sheetClose();
  startWorkout({name:t('spl_'+LIB.sp)+' · '+t('pd_'+p.ds[i].k),ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:e.nt,tp:e.tp,rs:e.rs,ss:e.ss,sec:e.sec}}))});
}
function libSpSave(i){
  const p=LIB.spPlan;if(!p||!p.ds[i])return;
  DATA.routines.push({id:uid(),name:t('spl_'+LIB.sp)+' · '+t('pd_'+p.ds[i].k),ex:p.ds[i].ex.map(e=>({eid:e.eid,n:(exById(e.eid)||{}).en||e.eid,sets:e.sets}))});
  saveData();toast(t('libSaved'));render();
}
function libSpUse(){
  const p=LIB.spPlan;if(!p)return;
  const go=function(){DATA.plan=p;saveData();sheetClose();render();toast(t('planReady'));};
  if(DATA.plan)ask(t('spReplace'),t('spUse'),go);else go();
}
/* ---------- classic programs / programas clásicos ---------- */
function p531St(){const s=SET.p531||{};return{w:(s.w>=0&&s.w<4)?s.w:0,tm:(s.tm&&typeof s.tm==='object')?s.tm:{}};}
function p531Set(f){const s=p531St();f(s);SET.p531=s;saveSet();libDraw();}
function libPrW(i){p531Set(s=>{s.w=+i;});}
function p531Tm(k,v){const kg=wParse(v);p531Set(s=>{if(kg!=null&&kg>=10&&kg<=500)s.tm[k]=kg;else delete s.tm[k];});}
function p531Auto(){
  p531Set(s=>{W531_MAIN.forEach(k=>{
    let b=0;DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(x.eid===k)x.sets.forEach(z=>{b=Math.max(b,setScore('wr',z));});}));
    if(b>0)s.tm[k]=wRound(b*0.9);
  });});
}
function p531Line(di,w){
  const k=W531_MAIN[di],tm=p531St().tm[k];
  if(!tm)return t('p531NoTm');
  return W531[w].map((r,i)=>r[0]+'% × '+r[1]+((i===2&&w<3)?'+':'')+' = '+wShow(wRound(tm*r[0]/100))+' '+wUnit()).join(' · ');
}
function progRows(pid,di,have){
  const used=[],out=[],w=p531St().w;
  PROGRAMS[pid].days[di].forEach(sp=>{
    const a=sp.split('|'),eid=a[0].split(',').find(id=>exById(id)&&avail(id,have)&&used.indexOf(id)<0);
    if(!eid)return;used.push(eid);
    if(a[1]==='M'){out.push({eid:eid,main:1,sets:3,lo:Math.min.apply(null,W531[w].map(r=>r[1])),hi:Math.max.apply(null,W531[w].map(r=>r[1])),rs:180,u:'r',ln:p531Line(di,w)});return;}
    out.push({eid:eid,sets:+a[1],lo:+a[2],hi:+a[3],rs:+a[4],u:a[5]==='m'?'m':'r'});
  });
  return out;
}
function progItems(pid,di){
  return progRows(pid,di,libHave()).map(e=>({eid:e.eid,sets:e.sets,tg:Object.assign({lo:e.lo,hi:e.hi,u:e.u,rs:e.rs},e.ln?{ln:e.ln,fx:1}:{})}));
}
function progDayName(pid,di){return t('prg_'+pid)+' · '+t('prgday_'+pid+'_'+di);}
function libPg(id){LIB.pg=id;libDraw();}
function progStart(pid,di){
  if(ACT){toast(t('finishFirst'));return;}
  const ex=progItems(pid,di);if(!ex.length)return;
  sheetClose();startWorkout({name:progDayName(pid,di),ex:ex});
}
function progSave(pid,di){
  const ex=progItems(pid,di);if(!ex.length)return;
  DATA.routines.push({id:uid(),name:progDayName(pid,di),ex:ex.map(e=>({eid:e.eid,n:(exById(e.eid)||{}).en||e.eid,sets:e.sets}))});
  saveData();toast(t('libSaved'));render();
}
function progRowTxt(e){
  const rg=e.lo===e.hi?fmtNum(e.hi,1):fmtNum(e.lo,1)+'–'+fmtNum(e.hi,1);
  return e.main?t('p531Main'):(e.sets+' × '+rg+(e.u==='m'?' '+t('minU'):'')+' · '+t('rsSec',e.rs));
}
function libProgHtml(){
  if(!PROGRAMS[LIB.pg])LIB.pg='sl';
  const pid=LIB.pg,P=PROGRAMS[pid],have=libHave();
  let h='<p class="muted sm">'+t('libProgP')+'</p>'+
    libStep(1,'prStep1')+'<div class="spl">'+PROG_IDS.map(id=>'<button class="card spc'+(id===pid?' on':'')+'" onclick="libPg(\''+id+'\')"><b>'+t('prg_'+id)+'</b><small>'+t('prgd_'+id)+'</small></button>').join('')+'</div>'+
    '<div class="card optb"><b>'+t('prg_'+pid)+' <span class="muted sm">'+t('prgWk',P.wk)+'</span></b><p class="sm">'+t('prgw_'+pid)+'</p><p class="sm"><b>'+t('prgProg')+':</b> '+t('prgp_'+pid)+'</p></div>';
  let n=2;
  if(pid==='w531'){
    const st=p531St();
    h+=libStep(n++,'prStep531')+libChips([0,1,2,3],st.w,'libPrW',i=>t('p531W'+i),1)+
      '<p class="muted sm">'+t('p531TmP')+'</p>'+
      W531_MAIN.map(k=>'<label class="rbx"><b>'+esc(exName(k))+'</b><input class="in" type="text" inputmode="decimal" style="max-width:110px" value="'+(st.tm[k]?wShow(st.tm[k]):'')+'" placeholder="'+wUnit()+'" onchange="p531Tm(\''+k+'\',this.value)"></label>').join('')+
      '<div class="row"><button class="btn sm" onclick="p531Auto()">'+t('p531Auto')+'</button></div>';
  }
  h+=libStep(n,'prStepDays')+'<p class="muted sm">'+t('prgNote')+'</p>';
  h+=P.days.map((d,di)=>{
    const rows=progRows(pid,di,have);
    return'<div class="card spd"><b>'+esc(t('prgday_'+pid+'_'+di))+'</b>'+
      (rows.length?'<ul class="optul">'+rows.map(e=>'<li>'+esc(exName(e.eid))+' <span class="muted">'+esc(progRowTxt(e))+'</span>'+(e.ln?'<br><span class="muted sm">'+esc(e.ln)+'</span>':'')+' <button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="libHow(\''+e.eid+'\')">ⓘ</button></li>').join('')+'</ul>':'<p class="muted">'+t('libNone')+'</p>')+
      (rows.length?'<div class="row"><button class="btn sm pri" onclick="progStart(\''+pid+'\','+di+')">'+t('spStartDay')+'</button><button class="btn sm" onclick="progSave(\''+pid+'\','+di+')">'+t('spSaveDay')+'</button></div>':'')+'</div>';
  }).join('');
  return h;
}
function libGo(tab){if(!LIB.set){LIB.lv=LIB.clv=libDefaultRank();LIB.set=1;}LIB.tab=tab;LIB.sel=null;libDraw();}
/* the four ways to train, in one clear list / las cuatro formas de entrenar, en una lista clara */
function startChooser(){
  const c=(ic,tt,pp,fn,img,cls)=>'<button class="card pk pkt'+(cls?' '+cls:'')+'" onclick="'+fn+'"><span class="pkt-img" style="background-image:url(img/ex/'+img+'-0.jpg)"></span><span class="pk-i">'+ic+'</span><span class="pk-t"><b>'+t(tt)+'</b><small>'+t(pp)+'</small></span></button>';
  return'<div class="pks">'+
    (DATA.plan?'':c('🧭','pkPlanT','pkPlanP','planSetup()','z_worlds_greatest_stretch','pri wide'))+
    c('💪','pkMusT','pkMusP',"libGo('focus')",'bench')+
    c('🔀','pkSpT','pkSpP',"libGo('split')",'squat')+
    c('🏆','pkPrT','pkPrP',"libGo('prog')",'deadlift')+
    c('⏱️','pkChT','pkChP',"libGo('ch')",'kbswing')+
    c('✍️','pkOwnT','pkOwnP','startWorkout()','ohp','wide')+
  '</div>';
}
