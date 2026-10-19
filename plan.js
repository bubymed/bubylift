'use strict';
/* Guided weekly plan, technique guide and weight suggestions. All plans here are original Bubylift templates.
   Plan semanal guiado, guía de técnica y sugerencias de peso. Todos los planes son plantillas originales de Bubylift. */

/* ---------- plan templates: [id for beginners, id for some experience, role] role: m main · a accessory · c core ---------- */
const PD={
 fullA:[['gobsq','squat','m'],['chestpress','bench','m'],['cablerow','bbrow','m'],['machsp','dbohp','a'],['glutebr','rdl','a'],['plank','plank','c']],
 fullB:[['legpress','bulgsplit','m'],['dbbench','dbinc','m'],['latpd','latpd','m'],['latraise','latraise','a'],['legcurl','hipthrust','a'],['deadbug','cablecr','c']],
 fullC:[['stepup','hexdl','m'],['incpush','pushup','m'],['dbrow','dbrow','m'],['dbohp','ohp','a'],['legcurl','legcurl','a'],['birddog','plank','c']],
 up1:[['chestpress','bench','m'],['cablerow','bbrow','m'],['machsp','dbohp','a'],['latpd','latpd','a'],['dbcurl','dbcurl','a'],['pushdown','pushdown','a']],
 up2:[['dbinc','dbinc','m'],['machrow','dbrow','m'],['latraise','latraise','a'],['assistpu','pullup','a'],['hammer','hammer','a'],['ropepd','ropepd','a']],
 low1:[['legpress','squat','m'],['legcurl','rdl','m'],['stepup','lunge','a'],['legext','legext','a'],['calf','calf','a'],['plank','cablecr','c']],
 low2:[['gobsq','hexdl','m'],['glutebr','hipthrust','m'],['legcurl','bulgsplit','a'],['legext','legcurl','a'],['seatcalf','seatcalf','a'],['deadbug','deadbug','c']],
 push:[['chestpress','bench','m'],['machsp','dbohp','m'],['dbinc','dbinc','a'],['latraise','latraise','a'],['pushdown','pushdown','a'],['ropepd','ropepd','a']],
 pull:[['latpd','latpd','m'],['cablerow','bbrow','m'],['dbrow','dbrow','a'],['facepull','facepull','a'],['dbcurl','dbcurl','a'],['hammer','hammer','a']]
};
const PSPLIT={2:['fullA','fullB'],3:['fullA','fullB','fullC'],4:['up1','low1','up2','low2'],5:['push','pull','low1','up2','low2']};
const PGOALS=['muscle','strength','fat','general'],PLVLS=['new','some'];
/* sets × reps by goal / level / role / series y repeticiones */
function planScheme(goal,lvl,role){
  const N=lvl==='new';
  if(role==='c')return{sets:3,lo:8,hi:12};
  if(goal==='strength')return role==='m'?(N?{sets:3,lo:6,hi:8}:{sets:4,lo:4,hi:6}):(N?{sets:2,lo:10,hi:12}:{sets:3,lo:8,hi:10});
  if(goal==='muscle')return role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:4,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:10,hi:15});
  return role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:3,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:12,hi:15});
}
function genPlan(goal,n,lvl){
  const ds=PSPLIT[n].map(k=>{
    const ex=PD[k].map(r=>{
      const eid=lvl==='new'?r[0]:r[1],m=exMode(eid),sc=planScheme(goal,lvl,r[2]);
      if(m==='t')return{eid:eid,sets:3,lo:0.5,hi:1,u:'m',r:r[2]};
      return{eid:eid,sets:sc.sets,lo:sc.lo,hi:sc.hi,u:'r',r:r[2]};
    });
    if(goal==='fat')ex.push({eid:'treadmill',sets:1,lo:15,hi:20,u:'m',r:'a'});
    return{k:k,ex:ex};
  });
  return{goal:goal,n:n,lvl:lvl,t0:Date.now(),ct:0,ds:ds,checks:[]};
}
function cleanPlan(p){
  if(!p||typeof p!=='object'||PGOALS.indexOf(p.goal)<0||PLVLS.indexOf(p.lvl)<0||!(p.n>=2&&p.n<=5)||typeof p.t0!=='number'||!Array.isArray(p.ds)||p.ds.length!==p.n)return null;
  const ds=[];
  for(const d of p.ds){
    if(!d||!PD[d.k]||!Array.isArray(d.ex))return null;
    const ex=d.ex.filter(e=>e&&ID_RE.test(String(e.eid))).slice(0,12).map(e=>({eid:String(e.eid),sets:Math.max(1,Math.min(8,Math.round(cn(e.sets)||1))),lo:cn(e.lo)||0,hi:cn(e.hi)||0,u:e.u==='m'?'m':'r',r:['m','a','c'].indexOf(e.r)>=0?e.r:'a'}));
    if(!ex.length)return null;ds.push({k:d.k,ex:ex});
  }
  const checks=(Array.isArray(p.checks)?p.checks:[]).slice(-40).filter(c=>c&&typeof c.t==='number').map(c=>({t:c.t,bw:cn(c.bw)||null,feel:['easy','right','hard'].indexOf(c.feel)>=0?c.feel:'right'}));
  return{goal:p.goal,n:p.n,lvl:p.lvl,t0:p.t0,ct:cn(p.ct)||0,ds:ds,checks:checks};
}

/* ---------- targets and suggestions ---------- */
function tgText(e){
  const rg=e.lo===e.hi?fmtNum(e.hi,1):fmtNum(e.lo,1)+'–'+fmtNum(e.hi,1);
  return e.sets+' × '+rg+(e.u==='m'?' '+t('minU'):'');
}
function wInc(){return imp()?5/KG_LB:2.5;}
function wRound(kg){const s=wInc();return Math.max(s,Math.round(kg/s)*s);}
/* progressive overload from the last session / sobrecarga progresiva según la última sesión */
function sugg(eid,tg){
  if(!tg||tg.u==='m')return null;
  const m=exMode(eid),le=lastEx(eid);
  if(m==='bw'){
    if(!le)return{key:'sgFirstBw'};
    const ok=le.x.sets.length&&le.x.sets.every(s=>(s.r||0)>=tg.hi);
    return ok?{key:'sgUpBw'}:{key:'sgHold2'};
  }
  if(m!=='wr')return null;
  if(!le)return{key:'sgFirst'};
  const ss=le.x.sets.filter(s=>s.w!=null&&s.r);
  if(!ss.length)return{key:'sgFirst'};
  const W=Math.max.apply(null,ss.map(s=>s.w));
  if(ss.every(s=>s.r>=tg.hi))return{key:'sgUp',w:wRound(W+wInc())};
  if(ss.some(s=>s.r<tg.lo)){
    const p2=lastEx(eid,le.wk.t),low2=p2&&p2.x.sets.some(s=>s.w!=null&&s.r&&s.r<tg.lo);
    return low2?{key:'sgDown',w:wRound(W*0.9)}:{key:'sgHold',w:W};
  }
  return{key:'sgHold2',w:W};
}
function suggLine(x){
  if(!x.tg)return'';
  const s=sugg(x.eid,x.tg);
  let h='<div class="goalln"><b>'+t('target')+':</b> '+esc(tgText({sets:x.sets.length,lo:x.tg.lo,hi:x.tg.hi,u:x.tg.u}));
  if(s)h+='<br><span class="sg">'+esc(t(s.key,s.w!=null?wShow(s.w)+' '+wUnit():''))+'</span>';
  return h+'</div>';
}

/* ---------- progress through the plan ---------- */
function planDone(){const p=DATA.plan;return p?DATA.workouts.filter(w=>w.pl!=null&&w.t>=p.t0):[];}
function weekStart(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}
function planNext(){const p=DATA.plan;return p?planDone().length%p.n:0;}
function planWeek(){const ws=weekStart();return planDone().filter(w=>w.t>=ws).length;}
function checkDue(){
  const p=DATA.plan;if(!p)return false;
  const since=planDone().filter(w=>w.t>(p.ct||p.t0));
  return since.length>=p.n*4||(Date.now()-(p.ct||p.t0)>=28*864e5&&since.length>=2);
}
function dayName(i){const d=DATA.plan.ds[i];return t('planDay',i+1)+' · '+t('pd_'+d.k);}
function planExList(d,withInfo){
  return d.ex.map(e=>'<div class="plex"><span><b>'+esc(exName(e.eid))+'</b><small>'+esc(tgText(e))+'</small></span>'+(withInfo?'<button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="howOpen(\''+e.eid+'\')">ⓘ</button>':'')+'</div>').join('');
}

/* ---------- home card ---------- */
function planCard(){
  const p=DATA.plan;
  if(!p)return'<div class="card tip"><b>'+t('planT')+'</b><p>'+t('planP')+'</p><div class="row"><button class="btn pri" onclick="planSetup()">'+t('planMake')+'</button></div></div>';
  const i=planNext(),d=p.ds[i];
  let h='<div class="card plan"><div class="plh"><b>'+t('planToday')+'</b><span class="muted sm">'+t('planWeek',planWeek(),p.n)+'</span></div><h3>'+esc(dayName(i))+'</h3>'+planExList(d,false)+
    '<div class="row"><button class="btn pri" onclick="planStart('+i+')">'+t('planStart')+'</button><button class="btn" onclick="planOpen()">'+t('planAll')+'</button></div>';
  if(checkDue())h+='<div class="pldue"><b>'+t('chkDue')+'</b><button class="btn sm" onclick="chkOpen()">'+t('chkOpen')+'</button></div>';
  return h+'</div>';
}
function planStart(i){
  const p=DATA.plan;if(!p)return;
  sheetClose();
  startWorkout({name:dayName(i),pl:i,ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u}}))});
}
function planOpen(){
  const p=DATA.plan;if(!p){planSetup();return;}
  let h='<div class="form"><div class="pick-h"><h3>'+t('planMine')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('planInfo',t('pg_'+p.goal),p.n,t('pl_'+p.lvl))+'</p>';
  p.ds.forEach((d,i)=>{h+='<div class="lbl">'+esc(dayName(i))+'</div>'+planExList(d,true)+'<div class="row"><button class="btn sm" onclick="planStart('+i+')">'+t('planStart')+'</button></div>';});
  h+='<p class="muted sm">'+t('planNote')+'</p><div class="row"><button class="btn" onclick="chkOpen()">'+t('chkOpen')+'</button><button class="btn" onclick="planSetup()">'+t('planChange')+'</button></div></div>';
  sheet(h);
}

/* ---------- setup ---------- */
let PS={goal:'muscle',n:3,lvl:'new'};
function planSetup(){
  if(DATA.plan)PS={goal:DATA.plan.goal,n:DATA.plan.n,lvl:DATA.plan.lvl};
  planSetupDraw();
}
function chips(key,vals,cur,lab){return'<div class="chips wrap">'+vals.map(v=>'<button class="chip'+(cur===v?' on':'')+'" onclick="psSet(\''+key+'\','+(typeof v==='number'?v:'\''+v+'\'')+')">'+esc(lab(v))+'</button>').join('')+'</div>';}
function psSet(k,v){PS[k]=v;planSetupDraw();}
function planSetupDraw(){
  sheet('<div class="form"><h3>'+t('planMake')+'</h3>'+
    '<div class="lbl">'+t('psGoal')+'</div>'+chips('goal',PGOALS,PS.goal,v=>t('pg_'+v))+'<p class="muted sm">'+t('pgd_'+PS.goal)+'</p>'+
    '<div class="lbl">'+t('psDays')+'</div>'+chips('n',[2,3,4,5],PS.n,v=>t('psDaysN',v))+
    '<div class="lbl">'+t('psLvl')+'</div>'+chips('lvl',PLVLS,PS.lvl,v=>t('pl_'+v))+'<p class="muted sm">'+t('pld_'+PS.lvl)+'</p>'+
    '<p class="muted sm">'+t('planNote')+'</p>'+
    '<div class="row"><button class="btn pri" onclick="planCreate()">'+t('planCreate')+'</button><button class="btn" onclick="sheetClose()">'+t('cancel')+'</button></div></div>');
}
function planCreate(){
  DATA.plan=genPlan(PS.goal,PS.n,PS.lvl);saveData();sheetClose();render();toast(t('planReady'));
}

/* ---------- periodic check-in / evaluación periódica ---------- */
let CK={feel:'right'};
function chkOpen(){CK={feel:'right'};chkDraw();}
function ckFeel(v){CK.feel=v;const w=$('ckw');CK.w=w?w.value:'';chkDraw();}
function chkDraw(){
  const p=DATA.plan;if(!p)return;
  const since=planDone().filter(w=>w.t>(p.ct||p.t0));
  let prs=0;since.forEach(w=>w.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr)prs++;})));
  const bw=DATA.body.filter(b=>b.w);
  const first=bw.length?bw[bw.length-1].w:null,last=bw.length?bw[0].w:null;
  sheet('<div class="form"><h3>'+t('chkT')+'</h3>'+
    '<div class="stats"><div><b>'+since.length+'</b><span>'+t('chkSess')+'</span></div><div><b>'+prs+'</b><span>'+t('chkPr')+'</span></div><div><b>'+(first!=null&&last!=null&&bw.length>1?(last-first>0?'+':'')+wShow(last-first)+' '+wUnit():'—')+'</b><span>'+t('chkBw')+'</span></div></div>'+
    '<label>'+t('chkWeight')+' ('+wUnit()+')<input id="ckw" class="in wide" type="text" inputmode="decimal" autocomplete="off" value="'+esc(CK.w||'')+'" placeholder="'+esc(last!=null?wShow(last):'')+'"></label>'+
    '<div class="lbl">'+t('chkFeel')+'</div>'+chips2([['easy','chkEasy'],['right','chkRight'],['hard','chkHard']])+
    '<p class="muted sm">'+t('chkEff_'+CK.feel)+'</p>'+
    '<div class="row"><button class="btn pri" onclick="chkSave()">'+t('save')+'</button><button class="btn" onclick="sheetClose()">'+t('cancel')+'</button></div></div>');
}
function chips2(a){return'<div class="chips wrap">'+a.map(x=>'<button class="chip'+(CK.feel===x[0]?' on':'')+'" onclick="ckFeel(\''+x[0]+'\')">'+t(x[1])+'</button>').join('')+'</div>';}
function chkSave(){
  const p=DATA.plan;if(!p)return;
  const w=wParse(($('ckw')||{}).value||''),now=Date.now();
  if(w!=null&&w>0&&w<700){DATA.body.push({id:uid(),t:now,w:w});DATA.body.sort((a,b)=>b.t-a.t);}
  const dlt=CK.feel==='easy'?1:(CK.feel==='hard'?-1:0);
  if(dlt)p.ds.forEach(d=>d.ex.forEach(e=>{if(e.r==='m')e.sets=Math.max(2,Math.min(5,e.sets+dlt));}));
  p.checks.push({t:now,bw:w!=null&&w>0&&w<700?w:null,feel:CK.feel});if(p.checks.length>40)p.checks.shift();
  p.ct=now;saveData();sheetClose();render();toast(t('chkSaved'));
}

/* ---------- technique guide ---------- */
function howOpen(eid){
  const e=exById(eid);if(!e)return;
  const es=LANG==='es',src=HOWTO[eid],gen=HOWGEN[e.g]||HOWGEN.full;
  const steps=(src?src[es?1:0]:gen[es?1:0]).split('|');
  const mis=src?src[es?3:2]:'';
  sheet('<div class="form"><div class="pick-h"><h3>'+esc(es?e.es:e.en)+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('g_'+e.g)+' · '+t('e_'+e.e)+'</p>'+
    '<div class="lbl">'+t('howSteps')+'</div><ol class="how">'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
    (mis?'<div class="lbl">'+t('howMis')+'</div><p>'+esc(mis)+'</p>':(src?'':'<p class="muted sm">'+t('howGen')+'</p>'))+
    '<p class="muted sm">'+esc(HOWSAFE[es?1:0])+'</p>'+
    '<div class="row"><button class="btn pri" onclick="sheetClose()">'+t('done')+'</button></div></div>');
}
