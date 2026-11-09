/* Body, More and Recovery tabs, strength score (strData), backup import/export and the sub-tab bar with swipe.
   Pestañas Cuerpo, Más y Recuperación, puntaje de fuerza (strData), importar/exportar respaldo y barra de subpestañas con deslizar.
   Map of all files: docs/CODEMAP.md / Mapa de todos los archivos: docs/CODEMAP.md */
'use strict';
/* Body tab (weight, body fat, measurements) and More tab (settings, backup, about).
   Pestaña Cuerpo (peso, grasa, medidas) y pestaña Más (ajustes, respaldo, acerca de). */

/* ---------- body ---------- */
const MEAS=['chest','waist','hips','arm','thigh','neck'];
/* weight trend: smoothed line (time-aware moving average) and pace per week / tendencia del peso: línea suavizada y ritmo por semana */
function bwEma(ws){let e=null,pt=0;return ws.map(b=>{if(e==null)e=b.w;else e+=(1-Math.pow(0.5,Math.max(0.5,(b.t-pt)/864e5)/5))*(b.w-e);pt=b.t;return{t:b.t,y:e};});}
function bwRate(ws){ // kg per week from the last 28 days, or null / kg por semana de los últimos 28 días
  const now=ws[ws.length-1].t,a=ws.filter(b=>b.t>=now-28*864e5);
  if(a.length<3||a[a.length-1].t-a[0].t<6*864e5)return null;
  const x0=a[0].t,xs=a.map(b=>(b.t-x0)/864e5),n=a.length,mx=xs.reduce((p,c)=>p+c,0)/n,my=a.reduce((p,c)=>p+c.w,0)/n;
  let nu=0,de=0;a.forEach((b,k)=>{nu+=(xs[k]-mx)*(b.w-my);de+=(xs[k]-mx)*(xs[k]-mx);});
  return de?nu/de*7:null;
}
function bwRange(v){UI.bwr=v;render();}
function bwStep(d){
  const e=$('bw');if(!e)return;const last=DATA.body.find(b=>b.w);
  let v=numParse(e.value);if(v==null)v=last?parseFloat(wShow(last.w)):null;if(v==null)return;
  e.value=fmtNum(Math.max(0,Math.round((v+d)*10)/10),1);
}
/* muscle recovery from what you logged, per muscle part (data/musc.js): every exercise trains several parts with different weight; each part has its own window, and unrecovered fatigue carries over
   recuperación muscular según lo que registraste, por parte del músculo (data/musc.js): cada ejercicio trabaja varias partes con distinto peso; cada parte tiene su ventana y la fatiga no recuperada se arrastra */
const REC_G=['chest','back','shoulders','biceps','triceps','legs','glutes','core'];
let _MW={};
function muW(eid,vr){ // [[part, weight],...] of an exercise (and variation) / partes y pesos de un ejercicio (y variante)
  if(vr&&typeof muVar==='function')return muVar(muW(eid),eid,vr);
  if(_MW[eid]!==undefined)return _MW[eid];
  const e=exById(eid);let r=null;
  if(e){const str=EXMU[eid]||MUS_DEF[e.g];if(str){r=[];str.split(' ').forEach(p=>{const m=/^([a-z]+)([\d.]+)$/.exec(p);if(m&&MUS_BASE[m[1]])r.push([m[1],+m[2]]);});}}
  _MW[eid]=r;return r;
}
function muGroup(sub){for(const g in MUS_SUB)if(MUS_SUB[g].indexOf(sub)>=0)return g;return null;}
/* hours a part needs after a session of s effective sets / horas que necesita una parte tras una sesión de s series efectivas */
function recWin(sub,s){const f=s<=4?Math.max(.5,.5+s*.125):Math.min(1.75,1+(s-4)*.125);return MUS_BASE[sub]*f;}
function recData(now){
  now=now||Date.now();
  const ev={};Object.keys(MUS_BASE).forEach(k=>{ev[k]=[];});let lastT=0;
  DATA.workouts.filter(w=>isFinite(w.end||w.t)).sort((x,y)=>(x.end||x.t)-(y.end||y.t)).forEach(wk=>{
    const eff={},end=wk.end||wk.t;let any=0;
    wk.ex.forEach(x=>{const w=muW(x.eid,x.vr);if(!w)return;const n=x.sets.filter(q=>q.done!==false&&(q.r>0||q.t>0)).length;if(!n)return;any=1;w.forEach(m=>{eff[m[0]]=(eff[m[0]]||0)+n*m[1];});});
    if(any&&end>lastT)lastT=end;
    for(const k in eff)if(eff[k]>=1)ev[k].push([end,eff[k]]);
  });
  const o={};
  REC_G.forEach(g=>{o[g]={t:0,n:0,pct:null,left:0,subs:{}};});
  Object.keys(MUS_BASE).forEach(k=>{
    const g=muGroup(k),L=ev[k];if(!g)return;
    const r={t:0,s:0,pct:null,left:0};
    if(L.length){
      let R=0,prev=0;
      L.forEach(q=>{const dec=prev?Math.max(0,R-(q[0]-prev)/36e5):0;R=recWin(k,q[1])+.5*dec;prev=q[0];r.s=q[1];});
      const el=(now-prev)/36e5;r.t=prev;r.pct=Math.max(0,Math.min(100,Math.round(el/R*100)));r.left=Math.max(0,Math.ceil(R-el));
    }
    o[g].subs[k]=r;
  });
  REC_G.forEach(g=>{
    const x=o[g],tr=Object.keys(x.subs).filter(k=>x.subs[k].pct!=null);
    if(!tr.length)return;
    x.pct=Math.min.apply(null,tr.map(k=>x.subs[k].pct));x.left=Math.max.apply(null,tr.map(k=>x.subs[k].left));x.t=Math.max.apply(null,tr.map(k=>x.subs[k].t));x.n=Math.round(Math.max.apply(null,tr.map(k=>x.subs[k].s)));
  });
  return{g:o,last:lastT,days:lastT?(function(){const a=new Date(now),c=new Date(lastT);a.setHours(0,0,0,0);c.setHours(0,0,0,0);return Math.round((a-c)/864e5);})():null,ready:REC_G.filter(g=>o[g].pct==null||o[g].pct>=100).length};
}
/* training load: hard sets per week, this week vs your last 3 weeks, and per-muscle weekly sets / carga de entrenamiento: series duras por semana */
/* weekly hard sets per muscle group before it is flagged: arms get extra work from pressing and pulling, core recovers fast and is trained light
   series duras por semana de cada grupo antes de avisar: los brazos reciben trabajo extra al empujar y jalar, el core se recupera rápido y se entrena ligero */
const MUS_HI={chest:20,back:22,shoulders:20,biceps:16,triceps:16,legs:22,glutes:20,core:30};
const musHi=g=>MUS_HI[g]||20;
function loadData(now){
  now=now||Date.now();const W=7*864e5,wk=[0,0,0,0],mus={},eff={};REC_G.forEach(g=>{mus[g]=0;});
  DATA.workouts.forEach(w=>{
    const end=w.end||w.t,age=now-end;if(age<0||age>=4*W)return;const k=Math.floor(age/W);
    w.ex.forEach(x=>{const e=exById(x.eid),g=e&&e.g;const n=x.sets.filter(s=>s.done!==false&&(s.r>0||s.t>0)).length;if(!n)return;wk[k]+=n;if(k===0&&g&&mus[g]!=null)mus[g]+=n;if(k===0){const mw=muW(x.eid,x.vr);if(mw)mw.forEach(m=>{eff[m[0]]=(eff[m[0]]||0)+n*m[1];});}});
  });
  /* weeks before your first logged workout are not "rest", they are empty: only fully covered weeks form the baseline, and a spike needs 2+ of them / las semanas antes de tu primer entreno no son descanso, están vacías: solo las semanas completas cuentan y hacen falta 2 */
  const first=DATA.workouts.reduce((m,w)=>Math.min(m,w.t||m),now),cov=[true,1,2,3].map((k,i)=>i===0||first<=now-(i+1)*W),base=[1,2,3].filter(k=>cov[k]);
  const a=wk[0],ch=(base.length?base.reduce((n,k)=>n+wk[k],0)/base.length:0),ratio=base.length>=2&&ch>0?a/ch:null,learn=base.length<2&&a>0;
  const up=(x,y)=>x>0&&y>=x*1.1,c4=cov[3]&&up(wk[3],wk[2])&&up(wk[2],wk[1])&&up(wk[1],wk[0]),c3=cov[2]&&up(wk[2],wk[1])&&up(wk[1],wk[0]);
  const hi=REC_G.filter(g=>mus[g]>musHi(g)).sort((x,y)=>mus[y]-mus[x]),over6=REC_G.some(g=>mus[g]>=musHi(g)+6);
  let lv='ok';
  if(a<1)lv='none';
  else if((ratio!=null&&ratio>=1.5&&a>=20)||over6||c4)lv='over';
  else if((ratio!=null&&ratio>=1.3&&a>=15)||hi.length||c3)lv='high';
  else if(ratio!=null&&ch>=10&&ratio<.6)lv='low';
  return{wk:wk,mus:mus,eff:eff,hi:hi,lv:lv,ratio:ratio,learn:learn,climb:c4?4:(c3?3:0)};
}
function loadCard(){
  const d=loadData();if(d.lv==='none')return'';
  const mx=Math.max.apply(null,d.wk.concat([1])),why=[];
  if(d.ratio!=null&&d.ratio>=1.3)why.push(t('ldRatio',Math.round((d.ratio-1)*100)));
  if(d.climb)why.push(t('ldClimb',d.climb));
  if(d.learn)why.push(t('ldLearn'));
  if(d.hi.length)why.push(t('ldMus',d.hi.map(g=>t('g_'+g)+' ('+d.mus[g]+'/'+musHi(g)+')').join(', ')));
  return'<div class="card ldc '+d.lv+'"><div class="lbl">'+t('ldT')+'</div><div class="ld-top"><span class="ld-chip">'+t('ldL_'+d.lv)+'</span><b>'+t('ldSets',d.wk[0])+'</b></div><p class="ld-msg">'+t('ldM_'+d.lv)+'</p>'+
    '<div class="ana-card ana-ld">'+anaHeat(k=>{const f=(d.eff[k]||0)/(MUS_TGT[k]||8);return f<.05?'':(f>=1.6?'rgb(255,69,58)':'color-mix(in srgb,var(--an-main) '+Math.round(25+Math.min(1,f)*70)+'%,var(--an-sil))');},null,null,130)+'<div class="ana-grad ld-grad"><span>'+t('ldLegLo')+'</span><i></i><span>'+t('ldLegHi')+'</span></div></div>'+'<div class="ld-bars">'+[3,2,1,0].map(k=>'<div class="'+(k===0?'now':'')+'"><u style="height:'+Math.max(4,Math.round(d.wk[k]/mx*100))+'%"></u><small>'+d.wk[k]+'</small><em>'+(k===0?t('ldNow'):t('ldAgo',k))+'</em></div>').join('')+'</div>'+
    (why.length?'<ul class="ld-why">'+why.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'')+
    '<details class="dtl pv-dt"><summary><b>'+t('ldInfoT')+'</b></summary><p class="muted sm">'+t('ldInfo')+'</p></details></div>';
}
function recCard(){
  const r=recData();
  if(!r.last)return'<div class="card rec"><div class="lbl">'+t('recT')+'</div><p class="muted sm">'+t('recNone')+'</p></div>';
  const vals=REC_G.map(g=>r.g[g].pct==null?100:r.g[g].pct),avg=Math.round(vals.reduce((a,c)=>a+c,0)/vals.length);
  return'<div class="rv"><div class="rv-hero"'+skAttr(t('recT'),t('recPct',avg),t('recCtaB'),'recWorkout()')+'><div class="rv-ring" style="--p:'+avg+'"><b>'+avg+'<small>%</small></b></div><div class="rv-ht"><span class="hero-e">'+t('recT')+'</span><h3>'+t('recPct',avg)+'</h3>'+
    '<p>'+r.ready+'/'+REC_G.length+' '+t('recReady')+' · '+(r.days===0?t('recLastToday'):r.days+' '+t('recDays'))+'</p></div></div>'+
    '<div class="seg rv-view"><button class="'+(REC_VIEW==='g'?'on':'')+'" onclick="recView(\'g\')">'+t('recViewG')+'</button><button class="'+(REC_VIEW==='b'?'on':'')+'" onclick="recView(\'b\')">'+t('recViewB')+'</button></div>'+
    (REC_VIEW==='b'?anaRecHtml(r)+'</div>':'<div class="rv-leg"><span class="ok">'+t('rlOk')+'</span><span class="mid">'+t('rlMid')+'</span><span class="low">'+t('rlLow')+'</span></div>'+
    '<div class="rv-grid">'+REC_G.map((g,k)=>{const x=r.g[g],p=x.pct==null?100:x.pct,c=p>=100?'ok':(p>=60?'mid':'low'),op=REC_OPEN===g;
      let h='<button class="rv-t '+c+(op?' open':'')+'" aria-expanded="'+op+'" style="--p:'+p+';--i:'+k+'" onclick="recTap(\''+g+'\')"><span class="rv-r"><em>'+(p>=100?'✓':p+'%')+'</em></span><b>'+t('g_'+g)+'</b><small>'+(x.pct==null?t('recFresh'):(p>=100?t('recOk'):t('recIn',x.left)))+'</small><i class="rv-chv" aria-hidden="true">▾</i></button>';
      const oi=REC_G.indexOf(REC_OPEN);
      if(oi>=0&&Math.floor(oi/2)===Math.floor(k/2)&&(k%2===1||k===REC_G.length-1))h+=recSubs(r,REC_OPEN);
      return h;}).join('')+'</div><p class="muted sm rv-hint">'+t('recTapGo')+'</p></div>');
}
let REC_OPEN=null,REC_VIEW='b';
function recView(v){REC_VIEW=v;render();}
/* the parts of one muscle, opened under the grid / las partes de un músculo, abiertas bajo la cuadrícula */
function recSubs(r,g){
  const x=r.g[g];
  return'<div class="rv-sub" role="group" aria-label="'+esc(t('g_'+g))+'"><div class="rv-sh"><b>'+t('g_'+g)+'</b><button class="ico" onclick="recTap(\''+g+'\')" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    MUS_SUB[g].map(k=>{const q=x.subs[k],p=q.pct==null?100:q.pct,c=p>=100?'ok':(p>=60?'mid':'low');
      return'<button class="rv-s '+c+'" style="--p:'+p+'" onclick="recSubTap(\''+k+'\')"><span class="rv-sn">'+t('ms_'+k)+'</span><span class="rv-bar"><u style="width:'+p+'%"></u></span><span class="rv-st">'+(q.pct==null?t('recFresh'):(p>=100?t('recOk'):t('recIn',q.left)))+'</span>'+(p>=100?'<span class="rv-go">'+t('recSubTrain')+'</span>':'')+'</button>';}).join('')+'</div>';
}
function recTap(g){REC_OPEN=REC_OPEN===g?null:g;render();}
/* tap a part: start a workout for it if it is ready, otherwise say how long is left / toca una parte: empieza un entreno si está lista, si no dice cuánto falta */
function recSubTap(k){
  const q=recData().g[muGroup(k)].subs[k];
  if(q.pct==null||q.pct>=100){recWorkout(null,k);return;}
  toast(t('ms_'+k)+': '+t('recIn',q.left));
}
/* ---------- general strength score (e1RM ÷ body weight vs. standards) / fuerza general (1RM estimado ÷ peso corporal) ---------- */
const STR_L=[
 ['squat',[['squat',1]],[.75,1.25,1.5,2.25,2.75],.8],
 ['bench',[['bench',1],['dbbench',1.7]],[.5,.75,1.1,1.6,2],.6],
 ['deadlift',[['deadlift',1],['rdl',1.3]],[1,1.5,1.9,2.6,3.1],.8],
 ['ohp',[['ohp',1]],[.35,.55,.75,1,1.25],.6],
 ['row',[['bbrow',1],['bentrow',1],['dbrow',1.6]],[.5,.75,1,1.35,1.7],.65]];
/* the sex in your plan profile picks the table; heavier lifters are compared fairly (strength grows ~ body weight^0.67) / el sexo del perfil del plan elige la tabla; los más pesados se comparan con justicia */
function strSex(){const p=DATA.plan&&DATA.plan.prof;return p&&p.sex?p.sex:'x';}
function strFac(bw,sex){const ref=sex==='f'?62:(sex==='m'?80:71);return Math.max(.85,Math.min(1.25,Math.pow(bw/ref,.33)));}
function strRatio(e,bw,sex){return e/bw*strFac(bw,sex);}
function strTh(L,sex){const k=sex==='m'?1:(sex==='f'?L[3]:(1+L[3])/2);return L[2].map(v=>v*k);}
function strPts(r,th){if(!(r>0))return 0;let lo=0,pl=0;for(let i=0;i<th.length;i++){const hi=th[i],ph=(i+1)*20;if(r<=hi)return Math.round(pl+(ph-pl)*(r-lo)/(hi-lo));lo=hi;pl=ph;}return 100;}
function strLevel(p){return p>=80?'elite':p>=60?'adv':p>=40?'inter':p>=20?'nov':'beg';}
function strData(){
  const bw=(DATA.body.find(x=>x.w)||{}).w,ws=DATA.workouts.slice().sort((a,b)=>a.t-b.t),best={},rec={},cut=Date.now()-180*864e5,pts=[],sex=strSex();
  if(!bw)return{bw:null,n:ws.length,lifts:[],pts:[],score:null};
  const sc=L=>best[L[0]]?strPts(strRatio(best[L[0]],bw,sex),strTh(L,sex)):null;
  ws.forEach(wk=>{
    wk.ex.forEach(x=>x.vr?0:STR_L.forEach(L=>{const m=L[1].find(q=>q[0]===x.eid);if(!m)return;x.sets.forEach(s=>{if(s.done===false||!(s.r>=1&&s.r<=12))return;const e=e1rm(s.w,s.r)*m[1];if(e>(best[L[0]]||0))best[L[0]]=e;if(wk.t>=cut&&e>(rec[L[0]]||0))rec[L[0]]=e;});}));
    const v=STR_L.map(sc); // lifts you have not tried count as 0: one strong lift cannot carry the rank / los levantamientos que no has hecho cuentan 0: uno solo no puede sostener el rango
    if(v.some(x=>x!=null))pts.push({t:wk.t,y:Math.round(v.reduce((a,c)=>a+(c||0),0)/STR_L.length)});
  });
  const scc=L=>rec[L[0]]?strPts(strRatio(rec[L[0]],bw,sex),strTh(L,sex)):null; // current = best of the last 6 months / actual = mejor de los últimos 6 meses
  const lifts=STR_L.map(L=>({k:L[0],e:best[L[0]]||0,p:sc(L),ec:rec[L[0]]||0,pc:scc(L)}));
  const cv=lifts.filter(l=>l.pc!=null).map(l=>l.pc);
  return{bw:bw,n:ws.length,lifts:lifts,pts:pts,score:pts.length?pts[pts.length-1].y:null,cur:cv.length?Math.round(cv.reduce((a,c)=>a+c,0)/STR_L.length):null,sex:sex};
}
/* a workout from the muscles that have recovered / un entrenamiento con los músculos ya recuperados */
function recWorkout(only,sub){
  if(sub){ // one muscle part: the exercises that train it most, the ones you already do first / una parte: los ejercicios que más la trabajan, primero los que ya haces
    const use={},hv=curHave(),c=[];DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{use[x.eid]=(use[x.eid]||0)+1;}));
    EXLIB.forEach((e,i)=>{if(e[3]==='mobility'||e[3]==='cardio')return;const w=muW(e[0]);if(!w||!avail(e[0],hv))return;const m=w.find(q=>q[0]===sub);if(m&&m[1]>=.8&&(w.filter(q=>q[1]>=.8).length<=2))c.push([e[0],i]);});
    c.sort((x,y)=>(use[y[0]]||0)-(use[x[0]]||0)||x[1]-y[1]);
    const ex=c.slice(0,4).map(q=>({eid:q[0],sets:3}));
    if(!ex.length){toast(t('recNoneRdy'));return;}
    startWorkout({name:t('ms_'+sub),ex:ex});return;
  }
  const r=recData(),rd=only?[only]:REC_G.filter(g=>g!=='core'&&(r.g[g].pct==null||r.g[g].pct>=100)).sort((a,b)=>(r.g[a].t||0)-(r.g[b].t||0)).slice(0,3);
  if(!rd.length){toast(t('recNoneRdy'));return;}
  const use={};DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{use[x.eid]=(use[x.eid]||0)+1;}));
  const ex=[];
  rd.forEach(g=>{
    const P=POOL[G2MU[g]],hv=curHave(),c=[];
    if(P)P.m.concat(P.a).forEach(id=>{if(exById(id)&&avail(id,hv)&&c.indexOf(id)<0)c.push(id);});
    c.sort((a,b)=>(use[b]||0)-(use[a]||0)||c.indexOf(a)-c.indexOf(b));
    c.slice(0,2).forEach(id=>ex.push({eid:id,sets:3}));
  });
  if(!ex.length){toast(t('recNoneRdy'));return;}
  startWorkout({name:t('recName'),ex:ex});
}
function recCta(){
  const r=recData(),rd=REC_G.filter(g=>g!=='core'&&(r.g[g].pct==null||r.g[g].pct>=100));
  if(!r.last||!rd.length)return'';
  return'<div class="card rec-cta"><div><b>'+t('recCtaT')+'</b><small>'+rd.slice(0,4).map(g=>t('g_'+g)).join(' · ')+'</small></div><button class="btn pri sm" onclick="recWorkout()">'+t('recCtaB')+'</button></div>';
}
function vBody(){
  const today=dInput(Date.now()),last=DATA.body.find(b=>b.w),sg=d=>(d>0?'+':'')+fmtNum(d,1);
  const toU=kg=>imp()?kg*KG_LB:kg;
  const REC=recCard()+loadCard();
  const bodyTabs=(rec,wt,lg)=>{const c=UI.bt||'rec';return subBar('bt',[['rec',t('bsRec')],['wt',t('bsWt')],['log',t('bsLog')]],c)+subWrap(c==='wt'?wt:(c==='log'?lg:rec));};
  let h='<div class="card form bwhero"><div class="lbl c">'+t('bwTitle')+'</div>'+
    '<div class="bw-row"><button class="bw-st" aria-label="'+esc(t('bwMinus'))+'" onclick="bwStep(-0.1)">−</button>'+
    '<span class="bw-f"><input id="bw" class="bw-in" type="text" inputmode="decimal" autocomplete="off" placeholder="'+esc(last?wShow(last.w):'0.0')+'"><b class="bw-u">'+wUnit()+'</b></span>'+
    '<button class="bw-st" aria-label="'+esc(t('bwPlus'))+'" onclick="bwStep(0.1)">+</button></div>'+
    (last?'<p class="muted sm c">'+t('bwLast',wShow(last.w)+' '+wUnit(),esc(dFmt(last.t,{month:'short',day:'numeric'})))+'</p>':'')+
    '<button class="btn pri big wide" onclick="bodySave()">'+t('bwSave')+'</button>'+
    '<details class="dtl"><summary>'+t('bwMore')+'</summary>'+
    '<label>'+t('date')+'<input id="bd" class="in wide" type="date" value="'+today+'" max="'+today+'"></label>'+
    '<label>'+t('bodyFat')+' (%)<input id="bf" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>'+
    '<div class="lbl">'+t('measure')+' ('+lUnit()+')</div><div class="two">'+MEAS.map(k=>'<label>'+t('me_'+k)+'<input id="bm_'+k+'" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>').join('')+'</div>'+
    '<label>'+t('note')+'<input id="bn" class="in wide" type="text" maxlength="120"></label></details></div>';
  if(!DATA.body.length){const tip='<div class="card tip"><b>'+t('emptyBodyT')+'</b><p>'+t('emptyBodyP')+'</p></div>';return bodyTabs(REC,h+tip,tip);}

  const ws=DATA.body.filter(b=>b.w>0).slice().reverse();
  if(ws.length){
    const cur=ws[ws.length-1],em=bwEma(ws),tr=em[em.length-1].y,rate=bwRate(ws),goal=SET.goal;
    const rg=UI.bwr||'3',days={'1':30,'3':91,'12':365,A:1e5}[rg]||91,from=cur.t-days*864e5;
    let idx=ws.findIndex(b=>b.t>=from);if(idx<0)idx=ws.length-1;if(idx>ws.length-2)idx=Math.max(0,ws.length-2);
    const pts=ws.slice(idx).map(b=>({t:b.t,y:b.w})),tpts=em.slice(idx);
    h+='<div class="stats card"><div><b>'+wShow(cur.w)+'</b><span>'+t('current')+' ('+wUnit()+')</span></div>'+
      '<div><b>'+wShow(tr)+'</b><span>'+t('bwTrendL')+' ('+wUnit()+')</span></div>'+
      '<div><b>'+(rate==null?'—':sg(toU(rate)))+'</b><span>'+t('bwRate')+' ('+wUnit()+')</span></div></div>';
    h+='<div class="card"><b>'+t('weightTrend')+'</b>'+seg([['1',t('bwRng1')],['3',t('bwRng3')],['12',t('bwRng12')],['A',t('bwRngA')]],rg,'bwRange')+
      lineSvg(pts,v=>wShow(v),goal,tpts)+'<p class="muted sm">'+t('bwDots')+'</p>'+
      (rate==null?'<p class="muted sm">'+t('bwNeed')+'</p>':'')+
      (goal?'<p class="sm">'+(Math.abs(tr-goal)*toU(1)<0.5?t('goalReached'):t('toGo',fmtNum(Math.abs(tr-goal)*toU(1),1)+' '+wUnit()))+'</p>':'')+
      (goal&&rate!=null&&Math.abs(tr-goal)*toU(1)>=0.5?'<p class="muted sm">'+((goal-tr)*rate>0&&Math.abs(rate)>0.02?(function(){const wk=Math.round((goal-tr)/rate);return wk<=104?t('bwEta',Math.max(1,wk)):'';})():t('bwAway'))+'</p>':'')+
      '<details class="dtl"><summary>'+t('bwGoalH')+'</summary><div class="goalrow"><label>'+t('goal')+' ('+wUnit()+')<input id="bg" class="in" type="text" inputmode="decimal" autocomplete="off" value="'+esc(goal?wShow(goal):'')+'"></label><button class="btn sm" onclick="goalSet()">'+t('set')+'</button></div></details></div>';
  }
  const WT=h;h='';
  const ms=MEAS.map(k=>{const b=DATA.body.find(x=>x.m&&x.m[k]>0);return b?[k,b.m[k],b.t]:null;}).filter(Boolean);
  if(ms.length)h+='<div class="card"><b>'+t('measure')+'</b><div class="mtab">'+ms.map(a=>'<div><span>'+t('me_'+a[0])+'</span><b>'+lShow(a[1])+' '+lUnit()+'</b><small>'+esc(dFmt(a[2],{month:'short',day:'numeric'}))+'</small></div>').join('')+'</div></div>';
  h+='<div class="sec"><h2>'+t('entries')+'</h2></div>';
  DATA.body.slice(0,40).forEach(b=>{
    const parts=[];if(b.w)parts.push(wShow(b.w)+' '+wUnit());if(b.bf)parts.push(fmtNum(b.bf,1)+'%');if(b.m)parts.push(t('nMeas',Object.keys(b.m).length));
    h+='<div class="card bde"><div><b>'+esc(dFmt(b.t))+'</b><div class="muted sm">'+esc(parts.join(' · '))+(b.note?' — '+esc(b.note):'')+'</div></div>'+xBtn('bodyDel(\''+b.id+'\')')+'</div>';
  });
  return bodyTabs(REC,WT,h);
}
function bodySave(){
  const o={id:uid(),t:dFromInput($('bd').value)};
  if(dInput(o.t)>dInput(Date.now()))o.t=Date.now(); // a date in the future would become your "current" weight / una fecha futura sería tu peso "actual"
  const w=wParse($('bw').value),bf=numParse($('bf').value);
  if(w!=null&&w>0&&w<700)o.w=w;
  if(bf!=null&&bf>0&&bf<100)o.bf=bf;
  const m={};MEAS.forEach(k=>{const v=lParse($('bm_'+k).value);if(v!=null&&v>0&&v<500)m[k]=v;});
  if(Object.keys(m).length)o.m=m;
  const n=$('bn').value.trim();if(n)o.note=n;
  if(o.w==null&&o.bf==null&&!o.m){toast(t('needBody'));return;}
  const day=dInput(o.t),ex=DATA.body.find(b=>dInput(b.t)===day); // one entry per day: update it / una entrada por día: se actualiza
  if(ex){if(o.w!=null)ex.w=o.w;if(o.bf!=null)ex.bf=o.bf;if(o.m)ex.m=Object.assign({},ex.m,o.m);if(o.note)ex.note=o.note;saveData();toast(t('bwUpd'));render();return;}
  DATA.body.push(o);DATA.body.sort((a,b)=>b.t-a.t);goalsCheck();saveData();toast(t('saved'));render();
}
function bodyDel(id){
  const snap=JSON.stringify(DATA.body);
  DATA.body=DATA.body.filter(b=>b.id!==id);
  jset(K_DATA,DATA);render();
  undoDo(t('entryGone'),function(){DATA.body=JSON.parse(snap);jset(K_DATA,DATA);render();},function(){DATA.body=DATA.body.filter(b=>b.id!==id);clTomb(id);saveData();});
}
function goalSet(){
  const v=$('bg').value.trim();
  if(!v){SET.goal=null;}else{const g=wParse(v);if(g==null||g<=0||g>700){toast(t('needBody'));return;}SET.goal=g;}
  saveSet();render();
}

/* ---------- More ---------- */
/* second-level tabs: pill bar with a sliding marker, swipe left/right to change / pestañas de segundo nivel: barra de pastillas con marcador deslizante, desliza a los lados para cambiar */
const SUBS={};
function subBar(key,opts,cur){
  const n=opts.length,ci=Math.max(0,opts.findIndex(o=>o[0]===cur)),pi=UI['sp_'+key]!=null?Math.min(n-1,UI['sp_'+key]):ci;
  SUBS[key]={opts:opts.map(o=>o[0]),cur:opts[ci][0]};UI['sp_'+key]=ci;
  return'<div class="seg sub" data-k="'+key+'" role="tablist"><span class="sub-ind" style="--n:'+n+';--i:'+pi+'" data-to="'+ci+'"></span>'+opts.map((o,i)=>'<button role="tab" aria-selected="'+(i===ci)+'" class="'+(i===ci?'on':'')+'" onclick="subSet(\''+key+'\',\''+o[0]+'\')">'+esc(o[1])+'</button>').join('')+'</div>';
}
function subWrap(html){const d=UI.sdir||0;UI.sdir=0;return'<div class="subc'+(d>0?' from-r':(d<0?' from-l':''))+'">'+html+'</div>';}
function subSet(k,v){const s=SUBS[k];if(!s||s.cur===v)return;UI.sdir=s.opts.indexOf(v)>s.opts.indexOf(s.cur)?1:-1;UI[k]=v;render();window.scrollTo(0,0);}
function subAnim(){requestAnimationFrame(()=>{document.querySelectorAll('.sub-ind[data-to]').forEach(e=>{e.style.setProperty('--i',e.dataset.to);});});}
(function(){
  let x0=0,y0=0,t0=0,ok=false;
  function blocked(el){
    for(let e=el;e&&e!==document.body;e=e.parentElement){
      const n=e.tagName;if(n==='INPUT'||n==='TEXTAREA'||n==='SELECT')return true;
      if(e.classList&&(e.classList.contains('swp')||e.classList.contains('noswipe')))return true;
      if(e.id==='sheet'||(e.classList&&e.classList.contains('sheet')))return true;
      if(e.scrollWidth>e.clientWidth+4&&/(auto|scroll)/.test(getComputedStyle(e).overflowX))return true;
    }
    return false;
  }
  document.addEventListener('touchstart',e=>{const p=e.touches[0];x0=p.clientX;y0=p.clientY;t0=Date.now();ok=e.touches.length===1&&!blocked(e.target)&&!!document.querySelector('.seg.sub[data-k]');},{passive:true});
  document.addEventListener('touchend',e=>{
    if(!ok)return;ok=false;const p=e.changedTouches[0],dx=p.clientX-x0,dy=p.clientY-y0;
    if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6||Date.now()-t0>700)return;
    const bar=document.querySelector('.seg.sub[data-k]');if(!bar)return;
    const k=bar.getAttribute('data-k'),s=SUBS[k];if(!s)return;
    const i=s.opts.indexOf(s.cur)+(dx<0?1:-1);if(i<0||i>=s.opts.length)return;
    subSet(k,s.opts[i]);
  },{passive:true});
})();
function seg(opts,cur,fn){return'<div class="seg">'+opts.map(o=>'<button class="'+(String(o[0])===String(cur)?'on':'')+'" onclick="'+fn+'(\''+o[0]+'\')">'+esc(o[1])+'</button>').join('')+'</div>';}
function setAuto(v){SET.autoRest=v==='1';saveSet();render();}
function setSound(v){SET.sound=v==='1';saveSet();render();}
function setRest(v){SET.rest=parseInt(v,10)||90;saveSet();}
function mrow(ic,lab,act,sub){
  const inner='<span class="mi">'+ic+'</span><span class="mt">'+lab+(sub?'<small>'+sub+'</small>':'')+'</span><span class="mc">›</span>';
  return/^https?:/.test(act)?'<a class="mrow" href="'+act+'" target="_blank" rel="noopener">'+inner+'</a>':'<button class="mrow" onclick="'+act+'">'+inner+'</button>';
}
function vMore(){
  // iOS-style grouped list: one card, one row per setting / lista agrupada estilo iOS: una tarjeta, una fila por ajuste
  const row=(lab,ctl)=>'<div class="lrow"><span>'+lab+'</span>'+ctl+'</div>';
  let h=cloudCard()+'<div class="sec"><h2>'+t('prefs')+'</h2></div><div class="card grp">'+
    row(t('language'),seg([['en','English'],['es','Español']],LANG,'setLang'))+
    row(t('textSize'),seg([['s','A'],['m','A+'],['l','A++']],SET.fs||'s','setFs'))+
    row(t('appearance'),seg([['system',t('thSystem')],['dark',t('thDark')],['light',t('thLight')]],SET.theme||'system','setTheme'))+
    row(t('units'),seg([['imperial','lb·in·mi'],['metric','kg·cm·km']],SET.units,'setUnits'))+
    row(t('restTimer'),seg([['1',t('on')],['0',t('off')]],SET.autoRest?'1':'0','setAuto'))+
    row(t('restLen'),'<select class="in" onchange="setRest(this.value)">'+[30,45,60,90,120,150,180,240,300].map(s=>'<option value="'+s+'"'+(s===SET.rest?' selected':'')+'>'+fmtClock(s)+'</option>').join('')+'</select>')+
    row(t('sound'),seg([['1',t('on')],['0',t('off')]],SET.sound?'1':'0','setSound'))+
    row(t('tourRow'),seg([['1',t('on')],['0',t('off')]],SET.tour===false?'0':'1','setTour'))+'</div>';
  if(DATA.plan)h+='<div class="sec"><h2>'+t('myPlanS')+'</h2></div><div class="card grp mlist">'+
    mrow(ic('calendar'),t('rmT'),'remOpen()')+mrow(ic('heart'),t('tkBtn'),'tasteOpen()')+mrow(ic('calendar'),t('schBtn'),'schedOpen()')+mrow(ic('chart-bar'),t('volBtn'),'volOpen()')+
    (DATA.plan.prof&&DATA.plan.prof.test==='aft'?mrow(ic('target'),t('afT'),'aftOpen()'):'')+mrow(ic('compass'),t('planAll'),'planOpen()')+'</div>';
  h+='<div class="sec"><h2>'+t('yourData')+'</h2></div><div class="card grp mlist">'+
    mrow(ic('download'),t('exportBackup'),'exportJSON()',SET.lastExport?t('lastBackup',dFmt(SET.lastExport)):t('noBackup'))+
    mrow(ic('file-text'),t('exportCsv'),'exportCSV()')+
    '<label class="mrow"><span class="mi">'+ic('upload')+'</span><span class="mt">'+t('importCsv')+'</span><span class="mc">›</span><input type="file" accept=".csv,text/csv" onchange="importCsv(this)" hidden></label>'+
    '<label class="mrow"><span class="mi">'+ic('upload')+'</span><span class="mt">'+t('importBackup')+'</span><span class="mc">›</span><input type="file" accept=".json,application/json" onchange="importFile(this)" hidden></label></div>'+
    '<p class="muted sm mnote">'+t((typeof CL!=='undefined'&&CL&&!CL.bad)?'dataPc':'dataP',DATA.workouts.length,DATA.body.length)+'</p>';
  h+='<div class="sec"><h2>'+t('app')+'</h2></div><div class="card grp mlist">'+
    (canInstall()?mrow(ic('device-mobile'),t('install'),'installApp()'):'')+mrow(ic('compass'),t('tourReplay'),'tourStart(true)')+
    mrow(ic('sparkles'),t('whatsNew'),'wnShow(true)')+
    mrow(ic('help-circle'),t('faqBtn'),'faqOpen()')+
    mrow(ic('message-circle'),t('fbT'),'https://tally.so/r/KpY5MA')+
    mrow(ic('share'),t('shT'),'shareOpen()')+
    mrow(ic('refresh'),t('updChk'),'checkUpd()',APP_VER)+'</div>'+
    '<div class="card creator"><div class="cr-top"><span class="cr-av"><img src="icons/creator.jpg" alt="" onerror="this.parentNode.classList.add(\'nf\');this.remove()"></span><div><b>Mike</b><div class="muted sm">@bubylifts</div></div></div>'+
    '<p class="sm">'+t('crBio')+'</p><a class="btn pri wide" href="https://www.instagram.com/bubylifts/" target="_blank" rel="noopener">'+ic('brand-instagram')+' '+t('crFollow')+'</a></div>'+
    '<div class="card"><details class="dtl nob"><summary>'+t('about')+' · Bubylift '+APP_VER+'</summary><p class="sm">'+t('privacy')+'</p><p class="muted sm">'+t('credits')+'</p><p class="muted sm">'+t('disclaimer')+'</p>'+
    '<p class="sm"><a href="https://github.com/bubymed/bubylift" target="_blank" rel="noopener">github.com/bubymed/bubylift</a></p></details></div>';
  h+='<div class="card"><button class="btn danger wide" onclick="eraseAsk()">'+t('eraseAll')+'</button></div>';
  return h;
}

/* ---------- export / import ---------- */
function fileOut(name,text,mime){
  const f=new File([text],name,{type:mime});
  try{if((matchMedia('(pointer: coarse)').matches)&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(()=>{});return;}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}
function exportJSON(){
  const o={app:'bubylift',v:APP_VER,t:Date.now(),data:DATA};
  fileOut('bubylift-backup-'+dInput(Date.now())+'.json',JSON.stringify(o),'application/json');
  SET.lastExport=Date.now();saveSet();toast(t('exported'));if(tab==='more'||tab==='workout')render();
}
function csvCell(v){
  if(typeof v==='string'&&/^[=+\-@\t\r]/.test(v))v="'"+v;
  v=v==null?'':String(v);
  return/[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
}
function exportCSV(){
  const rows=[['date','workout','exercise','set','weight','weight_unit','reps','minutes','distance','distance_unit','pr','set_type']];
  DATA.workouts.slice().reverse().forEach(wk=>wk.ex.forEach(x=>x.sets.forEach((s,i)=>{
    rows.push([dInput(wk.t),wk.name,exNameV(x.eid,x.vr,x.n),i+1,s.w!=null?wShow(s.w):'',wUnit(),s.r!=null?s.r:'',s.t!=null?s.t:'',s.d?dShow(s.d):'',dUnit(),s.pr?1:'',s.ty||'']);
  })));
  fileOut('bubylift-workouts-'+dInput(Date.now())+'.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\n'),'text/csv');
  toast(t('exported'));
}
const ID_RE=/^[A-Za-z0-9_-]{1,40}$/;
const cn=v=>(typeof v==='number'&&isFinite(v)&&v>=0&&v<1e7)?v:null;
function cleanSet(s){if(!s||typeof s!=='object')return null;const o={w:cn(s.w),r:cn(s.r)==null?null:Math.round(s.r),t:cn(s.t),d:cn(s.d)};if(s.pr)o.pr=1;if(s.ty==='w'||s.ty==='d'||s.ty==='f')o.ty=s.ty;return o;}
function cleanCh(c){
  if(!c||typeof c!=='object'||!/^[a-z0-9]{2,12}$/.test(String(c.id))||![0,1,2,3,4,5].includes(c.lv)||!c.sc||typeof c.sc!=='object')return undefined;
  const n=v=>(typeof v==='number'&&isFinite(v)&&v>=0&&v<1e6)?v:0;
  return{id:String(c.id),lv:c.lv,v:c.v===2?2:undefined,sc:{v:n(c.sc.v),r:n(c.sc.r),x:n(c.sc.x)}};
}
function cleanHr(h){return(h&&typeof h==='object'&&isFinite(h.a)&&h.a>=30&&h.a<=230)?{a:Math.round(h.a),m:(isFinite(h.m)&&h.m>=h.a&&h.m<=250)?Math.round(h.m):Math.round(h.a)}:undefined;}
function cleanWk(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||typeof x.t!=='number'||!isFinite(x.t)||!Array.isArray(x.ex))return null;
  const ex=[];
  x.ex.forEach(e=>{if(!e||!ID_RE.test(String(e.eid))||!Array.isArray(e.sets))return;const sets=e.sets.map(cleanSet).filter(Boolean);if(!sets.length)return;const o={eid:String(e.eid),n:String(e.n||e.eid).slice(0,80),sets:sets};if(e.v===2)o.v=2;if(e.vr&&ID_RE.test(String(e.vr)))o.vr=String(e.vr);if(e.mul===2)o.mul=2;if(typeof e.bar==='number'&&e.bar>0&&e.bar<=100)o.bar=e.bar;ex.push(o);});
  const sid=/^\d{1,15}$/.test(String(x.sid||''))?String(x.sid):'';
  if(!ex.length&&!sid)return null; // watch-only workouts come from Strava / los entrenamientos solo-reloj vienen de Strava
  return{id:String(x.id),t:x.t,end:(typeof x.end==='number'&&isFinite(x.end))?x.end:0,name:String(x.name||'').slice(0,80),note:String(x.note||'').slice(0,500),ex:ex,hr:cleanHr(x.hr),kcal:(isFinite(x.kcal)&&x.kcal>0&&x.kcal<=10000)?Math.round(x.kcal):undefined,sv:x.sv?1:undefined,pl:(Number.isInteger(x.pl)&&x.pl>=0&&x.pl<5)?x.pl:undefined,ch:cleanCh(x.ch),sid:sid||undefined,sp:sid?String(x.sp||'').slice(0,30):undefined,sec:(sid&&isFinite(x.sec)&&x.sec>0&&x.sec<172800)?Math.round(x.sec):undefined};
}
function cleanBody(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||typeof x.t!=='number'||!isFinite(x.t))return null;
  const o={id:String(x.id),t:x.t};
  if(cn(x.w)>0)o.w=x.w;if(cn(x.bf)>0&&x.bf<100)o.bf=x.bf;
  if(x.m&&typeof x.m==='object'){const m={};MEAS.forEach(k=>{if(cn(x.m[k])>0)m[k]=x.m[k];});if(Object.keys(m).length)o.m=m;}
  if(x.note)o.note=String(x.note).slice(0,120);
  return(o.w||o.bf||o.m)?o:null;
}
function cleanRt(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||!Array.isArray(x.ex))return null;
  const ex=x.ex.filter(e=>e&&ID_RE.test(String(e.eid))).map(e=>{const o={eid:String(e.eid),n:String(e.n||e.eid).slice(0,80),sets:Math.max(1,Math.min(20,Math.round(cn(e.sets)||1)))};if(e.vr&&ID_RE.test(String(e.vr)))o.vr=String(e.vr);if(e.mul===2)o.mul=2;if(typeof e.bar==='number'&&e.bar>0&&e.bar<=100)o.bar=e.bar;if(e.keep)o.keep=1;return o;});
  return ex.length?{id:String(x.id),name:String(x.name||'').slice(0,60),ex:ex}:null;
}
function cleanCx(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||!x.n)return null;
  return{id:String(x.id),n:String(x.n).slice(0,60),g:EX_GROUPS.indexOf(x.g)>=0?x.g:'full',e:'other',m:['wr','bw','t'].indexOf(x.m)>=0?x.m:'wr'};
}
function cleanGoals(a){
  if(!Array.isArray(a))return[];
  return a.map(g=>{
    if(!g||typeof g!=='object'||!ID_RE.test(String(g.id))||['reps','lift','bw','ses'].indexOf(g.k)<0||!(cn(g.tg)>0))return null;
    const o={id:String(g.id),k:g.k,t:cn(g.t)||Date.now(),tg:g.tg};
    if((g.k==='reps'||g.k==='lift')){if(typeof g.eid!=='string'||!ID_RE.test(g.eid))return null;o.eid=String(g.eid);}
    if(g.k==='bw')o.st=cn(g.st)||g.tg;
    if(cn(g.done)>0)o.done=g.done;
    return o;
  }).filter(Boolean).slice(0,40);
}
function importFile(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(f.size>20e6){toast(t('impBad'));return;}
  const r=new FileReader();
  r.onload=function(){
    let o;try{o=JSON.parse(r.result);}catch(e){toast(t('impBad'));return;}
    if(!o||o.app!=='bubylift'||!o.data||typeof o.data!=='object'){toast(t('impBad'));return;}
    const d=o.data,arr=k=>Array.isArray(d[k])?d[k]:[];
    const have=k=>{const s={};DATA[k].forEach(x=>{s[x.id]=1;});return s;};
    const nw=arr('workouts').map(cleanWk).filter(Boolean),nb=arr('body').map(cleanBody).filter(Boolean),nr=arr('routines').map(cleanRt).filter(Boolean),nc=arr('custom').map(cleanCx).filter(Boolean),np=(!DATA.plan&&d.plan)?cleanPlan(d.plan):null,ng=cleanGoals(d.goals),na=(d.aft&&typeof d.aft==='object')?d.aft:null;
    const hw=have('workouts'),hb=have('body'),hr=have('routines'),hc=have('custom');
    const aw=nw.filter(x=>!hw[x.id]),ab=nb.filter(x=>!hb[x.id]),ar=nr.filter(x=>!hr[x.id]),ac=nc.filter(x=>!hc[x.id]);
    const gAdd=ng.filter(g=>!(DATA.goals||[]).some(x=>x.id===g.id));
    if(!aw.length&&!ab.length&&!ar.length&&!ac.length&&!np&&!gAdd.length){toast(t('impNone'));return;}
    ask(t('impAsk',aw.length,ab.length),t('import'),function(){
      aw.forEach(x=>DATA.workouts.push(x));ab.forEach(x=>DATA.body.push(x));ar.forEach(x=>DATA.routines.push(x));ac.forEach(x=>DATA.custom.push(x));if(np)DATA.plan=np;
      if(gAdd.length){DATA.goals=(DATA.goals||[]).concat(gAdd);}
      if(na&&!DATA.aft){DATA.aft={};['mdl','hrp','sdc','plk','run'].forEach(k=>{if(cn(na[k])>0)DATA.aft[k]=na[k];});}
      DATA.workouts.sort((a,b)=>b.t-a.t);DATA.body.sort((a,b)=>b.t-a.t);legacyFix();
      saveData();toast(t('imported'));render();
    });
  };
  r.onerror=function(){toast(t('impBad'));};
  r.readAsText(f);
}

/* ---------- erase everything ---------- */
function eraseAsk(){ask(t('eraseAsk'),t('continue'),function(){ask(t('eraseAsk2'),t('eraseAll'),eraseAll,true);},true);}
function eraseAll(){
  [K_DATA,K_SET,K_ACT].forEach(jdel);
  stopRest();unwake();
  const go=function(){location.replace(location.pathname);};
  go();
}

/* share the app with a QR code / compartir la app con un código QR */
const APP_URL='https://bubymed.github.io/bubylift/';
async function shareOpen(){
  sheet('<div class="form"><div class="pick-h"><h3>'+ic('share')+' '+t('shT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted">'+t('shP')+'</p><div class="qrbox" id="shqr" style="cursor:default"></div><p class="g-c"><b>'+APP_URL.replace('https://','')+'</b></p>'+
    '<div class="row">'+(navigator.share?'<button class="btn pri" onclick="shareNative()">'+ic('share')+' '+t('shSend')+'</button>':'')+'<button class="btn" onclick="shareCopy()">'+ic('link')+' '+t('shCopy')+'</button></div><div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
  try{await pfLib('lib/qrcode.min.js');const e=$('shqr');if(e)e.innerHTML=pfQrSvg(APP_URL);}catch(e){const x=$('shqr');if(x)x.remove();}
}
function shareNative(){try{navigator.share({title:'Bubylift',text:t('shMsg'),url:APP_URL}).catch(function(){});}catch(e){}}
function shareCopy(){
  const ok=()=>toast(t('shCopied'));
  try{navigator.clipboard.writeText(APP_URL).then(ok,()=>prompt(t('shCopy'),APP_URL));}catch(e){prompt(t('shCopy'),APP_URL);}
}
