/* Workout tab: start screen, active workout, set logging, PRs, rest timer and exercise picker.
   Pestaña Entrenar: inicio, entrenamiento activo, registro de series, récords, descanso y selector de ejercicios.
   Map of all files: docs/CODEMAP.md / Mapa de todos los archivos: docs/CODEMAP.md */
'use strict';
/* Workout tab: start, log sets, rest timer, finish, routines, exercise picker.
   Pestaña Entrenar: empezar, registrar series, temporizador de descanso, terminar, rutinas, selector de ejercicios. */

/* ---------- exercise lookup ---------- */
let EXMAP=null;
function exMap(){if(!EXMAP){EXMAP={};EXLIB.forEach(a=>{EXMAP[a[0]]={id:a[0],en:a[1],es:a[2],g:a[3],e:a[4],m:a[5]||'wr'};});}return EXMAP;}
function exById(id){const m=exMap();if(m[id])return m[id];const c=DATA.custom.find(x=>x.id===id);return c?{id:c.id,en:c.n,es:c.n,g:c.g,e:c.e||'other',m:c.m||'wr',custom:true}:null;}
function exName(id,fb){const e=exById(id);return e?(LANG==='es'?e.es:e.en):(fb||id);}
function exMode(id){const e=exById(id);return e?e.m:'wr';}
/* holds (plank, wall sit...): minutes and seconds boxes; cardio keeps minutes and distance / isométricos (plancha, sentadilla en pared...): casillas de minutos y segundos; el cardio conserva minutos y distancia */
function isHold(id){const e=exById(id);return!!e&&e.m==='t'&&e.g!=='cardio';}
function tSplit(t){if(t==null)return null;const sc=Math.round(t*60);return[Math.floor(sc/60),sc%60];}
function tShow(t){if(t==null)return'';return Number.isInteger(Math.round(t*600)/600)?fmtNum(t)+' min':fmtClock(Math.round(t*60));}
function newSet(){return{w:null,r:null,t:null,d:null,done:false};}

/* ---------- scoring / PR logic ---------- */
function e1rm(w,r){if(!w||!r||r<1)return 0;return r===1?w:w*(1+Math.min(r,30)/30);}
function setScore(m,s){if(s.ty==='w')return 0;if(m==='t')return s.t||0;if(m==='bw')return s.w?e1rm(s.w,s.r):(s.r||0);return e1rm(s.w,s.r);}
function bestScore(eid,m,skip){
  let b=0;
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(xk(x)===eid)x.sets.forEach(s=>{b=Math.max(b,setScore(m,s));});}));
  if(ACT)ACT.ex.forEach(x=>{if(xk(x)===eid)x.sets.forEach(s=>{if(s.done&&s!==skip)b=Math.max(b,setScore(m,s));});});
  return b;
}
function lastEx(eid,beforeT){
  for(const wk of DATA.workouts){if(beforeT&&wk.t>=beforeT)continue;const x=wk.ex.find(y=>xk(y)===eid);if(x&&x.sets.length)return{wk:wk,x:x};}
  return null;
}
function setVol(s){return s.ty==='w'?0:(s.w||0)*(s.r||0);}
/* set type: warm-up (W), drop set (D) or failure (F); tap the set number to change / tipo de serie: calentamiento, drop set o fallo */
const SET_TY=['','w','d','f'];
function cycTy(i,j){const s=ACT.ex[i].sets[j];if(!s)return;const k=(SET_TY.indexOf(s.ty||'')+1)%SET_TY.length;if(SET_TY[k])s.ty=SET_TY[k];else delete s.ty;if(s.ty==='w'){delete s.pr;}saveAct();render();}
function wkVol(wk){let v=0;wk.ex.forEach(x=>x.sets.forEach(s=>{v+=setVol(s);}));return v;}
/* stretching and mobility moves are not training sets: they stay out of every sets total / los estiramientos y la movilidad no son series de entrenamiento: no suman a ningún total de series */
function isMobEx(eid){const e=exById(eid);return !!e&&e.g==='mobility';}
function wkSets(wk){let n=0;wk.ex.forEach(x=>{if(!isMobEx(x.eid))n+=x.sets.length;});return n;}
function wkMoves(wk){let n=0;wk.ex.forEach(x=>{if(isMobEx(x.eid)&&x.sets.length)n++;});return n;}
function wkAnySets(wk){let n=0;wk.ex.forEach(x=>{n+=x.sets.length;});return n;}
/* "12 sets", or "8 moves" for a stretching-only session / "12 series", o "8 movimientos" si solo fue estiramiento */
function wkCountTxt(wk){const n=wkSets(wk);if(n>0)return t('nSetsT',n);const m=wkMoves(wk);return m>0?t('nMovesT',m):'';}
function wkCountBox(wk){const n=wkSets(wk),m=n>0?0:wkMoves(wk);return'<div><b>'+(m||n)+'</b><span>'+t(m?'moves':'sets')+'</span></div>';}
function fmtSet(m,s){
  if(!s)return'—';
  if(m==='t')return tShow(s.t)+(s.d?(s.t!=null?' · ':'')+dShow(s.d)+' '+dUnit():'');
  if(m==='bw')return(s.w?'+'+wShow(s.w)+' '+wUnit()+' × ':'')+(s.r!=null?s.r:'');
  return wShow(s.w)+' '+wUnit()+' × '+s.r;
}
function fmtPrev(m,s){
  if(!s)return'—';
  if(m==='t')return(s.t!=null?(Number.isInteger(Math.round(s.t*600)/600)?fmtNum(s.t):fmtClock(Math.round(s.t*60))):'')+(s.d?'·'+dShow(s.d):'');
  if(m==='bw')return s.w?'+'+wShow(s.w)+'×'+s.r:String(s.r!=null?s.r:'—');
  return wShow(s.w)+'×'+s.r;
}

/* ---------- start / routines ---------- */
function startWorkout(o){
  if(ACT){toast(t('finishFirst'));return;}
  ACT={id:uid(),t0:Date.now(),name:(o&&o.name)||'',note:'',ex:[]};
  if(o&&o.pl!=null)ACT.pl=o.pl;
  if(o&&o.guide)ACT.guide=1;
  ((o&&o.ex)||[]).forEach(x=>addExTo(x.eid,x.sets,x.n,x.tg,x));
  saveAct();wake();tab='workout';renderTabs();render();window.scrollTo(0,0);pgAnim();
  if(!o)setTimeout(function(){if(ACT&&!ACT.ex.length)pickEx(null,true);},120);
}
/* workouts saved before the bar/dumbbell update already hold totals (you typed the sum of both dumbbells, the bar included): keep every number, only mark them as the new model / los entrenos guardados antes ya tienen totales (escribías la suma de las dos mancuernas, con la barra incluida): se conservan todos los números y solo se marcan como el modelo nuevo */
function legacyFix(){
  let ch=false;
  (DATA.workouts||[]).forEach(wk=>wk.ex.forEach(x=>{
    if(x.v)return;x.v=2;ch=true;
    const e=exById(x.eid);
    if(e&&e.m==='wr'&&e.e==='dumbbell'&&mulDef(x.eid)>1)x.mul=2; // old numbers were already the sum of both dumbbells: keep them, just show half per dumbbell / los números viejos ya eran la suma de las dos: se conservan, solo se muestra la mitad por mancuerna
  }));
  return ch;
}
/* barbell weight: you type the total, bar included, like every other app. The bar of each exercise is only remembered for the plate calculator
   peso con barra: escribes el total, con la barra incluida, como en las demás apps. La barra de cada ejercicio solo se recuerda para la calculadora de discos */
/* plate exercises are labeled barbell but use no bar / ejercicios con disco están como barra pero no usan barra */
function noBar(e){const n=(e&&e.en||'').toLowerCase();return/\bplate\b/.test(n)&&!/movers/.test(n);}
function barDef(eid){
  if(SET.barPref&&SET.barPref[eid]!=null)return SET.barPref[eid];
  const e=exById(eid);if(!e||e.m!=='wr'||e.e!=='barbell'||noBar(e))return 0;
  const n=(e.en||'').toLowerCase();
  if(/\bez\b|ez-bar|curl bar/.test(n))return imp()?20/KG_LB:9;
  return imp()?45/KG_LB:20;
}
function barOf(x){return x&&x.bar>0?x.bar:0;}
/* dumbbells: you type the weight of one, the app counts both (or just one) / mancuernas: escribes el peso de una y la app cuenta las dos (o solo una) */
function mulDef(eid){
  if(SET.mulPref&&SET.mulPref[eid]!=null)return SET.mulPref[eid];
  const e=exById(eid);if(!e||e.m!=='wr'||e.e!=='dumbbell')return 1;
  return /single|one-?arm|one-?leg|unilateral|goblet|pullover|concentration|kickback|alternating|renegade|\bsplit\b/i.test(e.en||'')?1:2;
}
function mulOf(x){return x&&x.mul>1?x.mul:1;}
function isDb(x){const e=exById(x.eid);return !!e&&e.m==='wr'&&e.e==='dumbbell'||mulOf(x)>1;}
function mulMenu(i){
  const x=ACT.ex[i];if(!x)return;const cur=mulOf(x);
  sheet('<h3>'+esc(t('mulTitle'))+'</h3><p class="muted sm">'+esc(t('mulHelp'))+'</p><div class="menu"><button'+(cur===2?' class="on"':'')+' onclick="mulSet('+i+',2)">'+(cur===2?'✓ ':'')+esc(t('mul2'))+'</button><button'+(cur===1?' class="on"':'')+' onclick="mulSet('+i+',1)">'+(cur===1?'✓ ':'')+esc(t('mul1'))+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
}
/* change the dumbbell count: what you typed stays, the total follows / al cambiar una o dos mancuernas: lo escrito se queda y el total se recalcula */
function reScale(x,nm){
  const om=mulOf(x);
  x.sets.forEach(s=>{if(s.w!=null)s.w=s.w/om*nm;});
  if(x.sg!=null)x.sg=x.sg/om*nm;
  if(nm>1)x.mul=nm;else delete x.mul;
}
/* the bar this exercise uses, remembered for the plate calculator; the numbers in the sets do not change / la barra que usa este ejercicio, recordada para la calculadora; los números de las series no cambian */
function barKeep(x,kg){
  if(!x)return;if(kg>0)x.bar=kg;else delete x.bar;
  SET.barPref=SET.barPref||{};SET.barPref[x.eid]=kg>0?kg:0;jset(K_SET,SET);saveAct();
}
function mulSet(i,n){
  const x=ACT.ex[i];if(!x)return;
  reScale(x,n);
  SET.mulPref=SET.mulPref||{};SET.mulPref[x.eid]=n>1?2:1;jset(K_SET,SET);
  saveAct();sheetClose();render();
}
/* src: the entry this one repeats (a saved workout or routine); it keeps the variation, the multiplier and the bar / src: el ejercicio que se repite; conserva la variante, el multiplicador y la barra */
function addExTo(eid,nSets,nm,tg,src){
  const e=exById(eid),x={eid:eid,n:e?e.en:(nm||eid),sets:Array.from({length:Math.max(1,nSets||1)},()=>newSet())};
  x.v=2; // new weight model: bar + dumbbells counted / modelo nuevo de peso: barra + mancuernas contadas
  {const b=barDef(eid);if(b>0)x.bar=b;}
  {const m=mulDef(eid);if(m>1)x.mul=m;}
  if(src){
    if(src.vr)x.vr=src.vr;
    if(src.v===2||src.keep){delete x.bar;delete x.mul;} // saved with the new model: absent means none / guardado con el modelo nuevo: ausente significa ninguno
    if(src.bar>0)x.bar=src.bar;
    if(src.mul>1)x.mul=src.mul;
  }
  if(tg){x.tg=tg;const sg=sugg(eid,tg);if(sg&&sg.w!=null)x.sg=sg.w;}
  ACT.ex.push(x);
}
function startRoutine(id){const r=DATA.routines.find(x=>x.id===id);if(r)startWorkout({name:r.name,ex:r.ex});}

/* ---------- views ---------- */
function vWorkout(){if(!ACT)return vStart();if(ACT.guide&&!ACT.gOff&&typeof vGuide==='function')return vGuide();return(ACT.guide?'<button class="btn sm wide gd-back" onclick="gdOn()">'+ic('play')+' '+t('gdGuide')+'</button>':'')+vActive();}
function needBackup(){
  const n=DATA.workouts.length+DATA.body.length;
  if(typeof CL!=='undefined'&&CL&&CL.uid&&!CL.bad&&!CL.err&&CL.last&&Date.now()-CL.last<7*864e5)return false; // signed in and synced this week: the cloud is the backup / con sesión y sincronizado esta semana: la nube es el respaldo
  return n>=5&&(Date.now()-(SET.lastExport||0))>30*864e5&&Date.now()>(SET.bkSnooze||0);
}
function weekStrip(){
  const ws=weekStart(Date.now()),td=new Date().getDay(),days=[];
  const at=n=>{const x=new Date(ws);x.setDate(x.getDate()+n);return x.getTime();}; // calendar days, safe across daylight-saving changes / días de calendario, sin errores por cambio de hora
  for(let i=0;i<7;i++){const a=at(i),b=at(i+1),d=new Date(a+432e5);
    days.push({l:d.toLocaleDateString(LANG==='es'?'es':'en',{weekday:'narrow'}).toUpperCase(),on:DATA.workouts.some(w=>w.t>=a&&w.t<b),today:d.toDateString()===new Date().toDateString()});}
  const s=streakInfo(),n=days.filter(d=>d.on).length;
  return'<div class="card wkstrip"><div class="ws-top"><b>'+t('thisWeek')+'</b><span class="muted sm">'+(s.n?ic('bolt')+' '+t(s.n===1?'stOne':'stN',s.n):t('wsCount',n,s.tg))+'</span></div><div class="ws-days">'+days.map(d=>'<div class="ws-d'+(d.on?' on':'')+(d.today?' td':'')+'"><span>'+d.l+'</span><i>'+(d.on?ic('check'):'')+'</i></div>').join('')+'</div></div>';
}
function mobCard(){
  return'<div class="card mobc"><button class="mobc-b" onclick="go(\'stretch\')"><span class="li">'+ic('yoga')+'</span><span class="lt2"><b>'+t('mobToday')+'</b><small>'+t('mobQuick')+'</small></span><span class="lc">›</span></button><div class="row"><button class="btn pri" onclick="mobGo(10)">'+ic('yoga')+' '+t('mobGo10')+'</button><button class="btn" onclick="mobGo(5)">'+t('mobGo5')+'</button></div></div>';
}
function mobGo(m){STX.type=m===5?'warm':'full';STX.min=m;strSessGo(0);}
function hero0(){
  return'<div class="card hero"'+skAttr(t('hiWelcome'),t('pkPlanT'),t('planMake'),'planSetup()')+'><span class="hero-e">'+t('hiWelcome')+'</span><h2>'+t('pkPlanT')+'</h2><p>'+t('pkPlanP')+'</p><button class="btn pri big wide" onclick="planSetup()">'+t('planMake')+'</button></div>';
}
function exploreList(){
  const r=(i,tt,pp,fn)=>'<button class="lrow" onclick="'+fn+'"><span class="li">'+ic(i)+'</span><span class="lt2"><b>'+t(tt)+'</b><small>'+t(pp)+'</small></span><span class="lc">›</span></button>';
  return'<div class="sec"><h2>'+t('exploreT')+'</h2></div><div class="lgrp">'+
    r('barbell','pkMusT','pkMusP',"libGo('focus')")+r('arrows-shuffle','pkSpT','pkSpP',"libGo('split')")+r('trophy','pkPrT','pkPrP',"libGo('prog')")+r('stopwatch','pkChT','pkChP',"libGo('ch')")+'</div>';
}
/* start again with the same exercises and set counts as your last workout / empezar otra vez con los mismos ejercicios y series del último entrenamiento */
function repeatLast(){const w=DATA.workouts.find(x=>x.ex&&x.ex.length&&wkAnySets(x)>0);if(!w)return;startWorkout({name:w.name||'',ex:w.ex.map(x=>({eid:x.eid,sets:Math.max(1,x.sets.length),n:x.n,vr:x.vr,mul:x.mul,bar:x.bar,v:x.v}))});}
function vStart(){
  let h='';
  if(needBackup())h+='<div class="card warn"><b>'+t('bkT')+'</b><p>'+t('bkP')+'</p><div class="row"><button class="btn pri sm" onclick="exportJSON()">'+t('exportBackup')+'</button><button class="btn sm" onclick="bkLater()">'+t('later')+'</button></div></div>';
  if(typeof inApp==='function'&&inApp())h+='<div class="card warn"><b>'+t('inappT')+'</b><p>'+t(isIOS()?'inappIos':'inappAnd')+'</p><div class="row"><button class="btn sm" onclick="installApp()">'+t('inappBtn')+'</button></div></div>';
  h+=wkSumCard();
  h+=rkTeaser();
  h+=(DATA.plan?planCard():hero0())+recCta();
  const lw0=DATA.workouts.find(w=>w.ex&&w.ex.length&&wkAnySets(w)>0);
  if(lw0)h+='<button class="btn wide" onclick="repeatLast()">↺ '+t('repLast')+(lw0.name?' · '+esc(lw0.name):'')+'</button>';
  h+='<button class="btn wide emptyb" onclick="startWorkout()">'+ic('pencil')+' '+t('pkOwnT')+'</button>';
  h+=mobCard();
  if(DATA.workouts.length)h+=weekStrip();
  h+='<div class="sec"><h2>'+t('routines')+'</h2><button class="btn sm" onclick="rbOpen()">＋ '+t('newRoutine')+'</button></div>';
  if(!DATA.routines.length)h+='<div class="card tip"><p class="muted">'+t('noRoutines')+'</p></div>';
  else h+=DATA.routines.map(r=>'<div class="swp"><div class="swp-h swp-hl">'+t('swDelete')+'</div><div class="swp-h swp-hr">'+t('swEdit')+'</div><div class="card rt swp-in" data-l="rtDelAsk" data-r="rtEdit" data-a="'+r.id+'">'+rtThumb(r)+'<div class="rt-main"><b>'+esc(r.name)+'</b><div class="muted sm">'+r.ex.slice(0,4).map(x=>esc(exName(x.eid,x.n))).join(' · ')+(r.ex.length>4?' …':'')+'</div></div>'+'<div class="rt-b"><button class="btn pri sm" onclick="startRoutine(\''+r.id+'\')">'+t('start')+'</button><button class="btn sm" onclick="rbOpen(\''+r.id+'\')">'+t('edit')+'</button></div></div></div>').join('');
  h+=exploreList();
  const lw=DATA.workouts[0];
  if(lw)h+='<div class="sec"><h2>'+t('lastWorkout')+'</h2></div><div class="lgrp">'+wkCard(lw)+'</div>';
  return h;
}
function rtThumb(r){
  const x=r.ex.find(e=>typeof EXPHOTO!=='undefined'&&EXPHOTO.has(e.eid));
  return x?'<span class="rt-th" style="background-image:url(img/ex/'+x.eid+'-0.jpg)"></span>':'<span class="rt-th rt-no">'+ic('barbell')+'</span>';
}
function bkLater(){SET.bkSnooze=Date.now()+14*864e5;saveSet();render();}

function actTotals(){
  let done=0,tot=0,vol=0;
  ACT.ex.forEach(x=>x.sets.forEach(s=>{tot++;if(s.done){done++;vol+=setVol(s);}}));
  return{done:done,tot:tot,vol:vol};
}
function statsLine(){
  const a=actTotals();
  return (actStart()?'<span id="elapsed"'+(ACT.pz?' class="paused"':'')+'>'+fmtClock(actMs()/1000)+'</span><button class="clkb" onclick="pauseClock()" aria-label="'+esc(t(ACT.pz?'clkResume':'clkPause'))+'">'+(ACT.pz?'▶':'❚❚')+'</button>':'<button class="lnk-d" onclick="startClock()">▶ '+t('startClk')+'</button>')+' · '+t('setsDone',a.done,a.tot)+(a.vol?' · '+vShow(a.vol)+' '+wUnit():''); // whole number with separators, like history / número entero con separadores, como el historial
}
/* the clock runs from your first set (or the Start button), not from when you opened the screen / el reloj corre desde tu primera serie (o el botón Iniciar), no desde que abriste la pantalla */
function actStart(){return ACT?(ACT.ts||(actTotals().done?ACT.t0:0)):0;}
/* a real stopwatch: start, pause, resume; the time is always "saved + now minus when it last started" / un cronómetro de verdad: iniciar, pausar, reanudar; el tiempo siempre es "lo guardado + ahora menos cuando arrancó" */
function actMs(){
  if(!ACT||!actStart())return 0;
  const sn=ACT.sn===undefined?ACT.ts||ACT.t0:ACT.sn;
  return (ACT.acc||0)+(ACT.pz||!sn?0:Math.max(0,Date.now()-sn));
}
function startClock(){if(!ACT||ACT.ts)return;ACT.ts=Date.now();ACT.sn=ACT.ts;ACT.acc=0;ACT.pz=false;saveAct();updTop();}
function pauseClock(){
  if(!ACT||!actStart())return;
  if(ACT.pz){ACT.pz=false;ACT.sn=Date.now();}
  else{ACT.acc=actMs();ACT.pz=true;ACT.sn=null;}
  saveAct();updTop();buzz(10);
}
function tickElapsed(){
  if(!ACT)return;
  const e=$('elapsed');if(e)e.textContent=fmtClock(actMs()/1000);
}
function updTop(){const e=$('wkstats');if(e)e.innerHTML=statsLine();}

function vActive(){
  let h='<div class="wk-head"><input id="wkName" class="wkname" type="text" maxlength="60" placeholder="'+esc(t('wkNamePh'))+'" value="'+esc(ACT.name)+'" oninput="ACT.name=this.value;saveAct()">'+
    '<div class="muted" id="wkstats">'+statsLine()+'</div>'+
    '<div class="row wk-act"><button class="btn pri" onclick="finishAsk()">'+t('finish')+'</button></div></div>';
  const pl=(ACT.pl!=null&&DATA.plan&&DATA.plan.ph&&DATA.plan.ds[ACT.pl])?DATA.plan:null;
  if(pl)h+='<details class="card optd"><summary>'+t('optWu')+'</summary>'+optWarm(pl.ds[ACT.pl],pl).replace(/^<div class="card optb"><b>[^<]*<\/b>/,'<div>')+'</details>';
  let lastSec='';
  ACT.ex.forEach((x,i)=>{
    const sc=x.tg&&x.tg.sec;
    if(sc&&sc!==lastSec)h+='<div class="secl">'+t('sec_'+sc)+'</div>';
    if(sc)lastSec=sc;
    h+=exCard(i,x);
  });
  if(pl)h+='<details class="card optd"><summary>'+t('optCd')+'</summary>'+optWarm(pl.ds[ACT.pl],pl,true).replace(/^<div class="card optb"><b>[^<]*<\/b>/,'<div>')+'</details>';
  if(typeof nxHtml==='function')h+=nxHtml();
  h+='<button class="btn wide" onclick="pickEx(null,true)">＋ '+t('addEx')+'</button>';
  h+='<button class="lnk-d" onclick="cancelAsk()">'+t('cancelWk')+'</button>';
  h+='<textarea class="note-in" rows="2" maxlength="500" placeholder="'+esc(t('wkNotePh'))+'" oninput="ACT.note=this.value;saveAct()">'+esc(ACT.note)+'</textarea>';
  /* "Save as routine" lives on the finish screen only (it was here twice) / "Guardar como rutina" solo en la pantalla final */
  h+='<div class="fab-sp" aria-hidden="true"></div>'; // room so the floating timer and plate buttons never cover the last button / espacio para que los botones flotantes no tapen el último botón
  return h;
}
/* first tip of the how-to as a one-line cue / primer consejo de la guía como pista de una línea */
function cueOf(eid){const s=HOWTO&&HOWTO[eid];if(!s)return'';const st=(s[LANG==='es'?1:0]||'').split('|')[0]||'';return st.length>90?st.slice(0,87)+'…':st;}
/* fill the empty sets with what you did last time, in one tap / llena las series vacías con lo de la última vez, en un toque */
function fillLast(i){
  const x=ACT.ex[i],le=lastEx(xk(x));if(!le)return;const ps=le.x.sets,m=exMode(x.eid);
  x.sets.forEach((s,j)=>{if(s.done)return;const p=ps[j]||ps[ps.length-1];if(!p)return;
    if(m==='t'){if(s.t==null)s.t=p.t;if(s.d==null)s.d=p.d;}else{if(s.w==null)s.w=p.w;if(s.r==null)s.r=p.r;}});
  saveAct();exRedraw(i);toast(t('flDone'));
}
/* one tap: put the suggested weight in the empty sets / un toque: pone el peso sugerido en las series vacías */
function useSugg(i){
  const x=ACT.ex[i];if(!x)return;
  const s=sugg(x.eid,x.tg||{lo:6,hi:12,u:'r'});if(!s||s.w==null)return;
  x.sets.forEach(q=>{if(!q.done&&q.w==null)q.w=s.w;});
  saveAct();exRedraw(i);buzz(10);
}
/* a personal record deserves a moment: gold flash, trophy pop and a few sparks / un récord merece su momento */
function prBurst(i,j){
  const el=document.getElementById('exc'+i);if(!el)return;const r=el.querySelectorAll('.srow:not(.hd)')[j];if(!r)return;
  r.classList.add('prb');setTimeout(()=>r.classList.remove('prb'),1400);
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  for(let k=0;k<8;k++){const sp=document.createElement('span');sp.className='prp';sp.textContent=['✨','🏆','⭐'][k%3];sp.style.setProperty('--dx',(Math.cos(k/8*6.283)*46)+'px');sp.style.setProperty('--dy',(Math.sin(k/8*6.283)*46-18)+'px');r.appendChild(sp);setTimeout(()=>sp.remove(),1000);}
}
/* how to count reps in exercises done one side at a time / cómo contar repeticiones en ejercicios que se hacen de un lado a la vez */
const RN_WALK=/(^lunge$|walking_lunge)/,RN_ALT=/(alternat|^mountain$|mountain_climber)/;
const RN_UNI=/(onearm|one_arm|singleleg|single_leg|one_leg|one_legged|^slsquat$|^sldl$|^slbridge$|^slsq|bulgsplit|splitsq|split_squat|step_?up|stepup|lunge|pistol|kickback|windmill|side_bend|^dbrow$|calfdb|^latstep$|^powerstep$)/;
function repNote(eid,m){
  if(m==='t')return'';
  const id=String(eid).toLowerCase();
  if(RN_WALK.test(id))return'rnWalk';
  if(RN_ALT.test(id))return'rnAlt';
  if(RN_UNI.test(id))return'rnUni';
  return'';
}
function exCard(i,x){
  const m=exMode(x.eid),le=lastEx(xk(x)),pv=le?le.x.sets:[];
  const ml=m==='wr'?mulOf(x):1,pw=v=>v==null?'':wShow(Math.max(0,v/ml));
  const cue=cueOf(x.eid),dm=(typeof EXPHOTO!=='undefined'&&EXPHOTO.has(x.eid))?'<button class="exdm" onclick="howOpen(\''+x.eid+'\')" aria-label="'+esc(t('guideB'))+'">'+exImgs(x.eid,'this.remove()')+'</button>':'';
  let h='<section class="exc" data-dcard="1" id="exc'+i+'"><div class="exh">'+dm+'<span class="exh-t"><b>'+esc(exName(x.eid,x.n))+'</b>'+(cue?'<small class="cue">'+esc(cue)+'</small>':'')+varChip(i,x)+'</span>'+xBtn('rmEx('+i+')',1)+'<button class="exmore" onclick="exMenu('+i+')" aria-label="'+esc(t('options'))+'">⋯</button>'+(ACT.ex.length>1?'<span class="pv-grip" role="button" tabindex="0" data-k="act" data-ei="'+i+'" aria-label="'+esc(t('dragAria'))+'">⠿</span>':'')+'</div>';
  h+=suggLine(x);
  {const rn=repNote(x.eid,m);if(rn)h+='<p class="muted sm rn">'+esc(t(rn))+'</p>';}
  if(i===0&&DATA.workouts.length<4)h+='<p class="muted sm">'+t('tyHint')+'</p>';
  h+='<div class="exsub muted sm"><span>'+(le?t('lastTime',dFmt(le.wk.t,{month:'short',day:'numeric'}),esc(le.x.sets.map(s=>fmtPrev(m,s)).join('  '))):t('firstTime'))+'</span>'+(le&&x.sets.some(s=>!s.done)?'<button class="lnk-d" onclick="fillLast('+i+')">↺ '+t('flBtn')+'</button>':'')+'<button class="lnk-d" onclick="restPick('+i+')">⏱ '+(exRest(x)===0?t('restOff'):fmtClock(exRest(x)!=null?exRest(x):(SET.rest||90)))+'</button></div>';
  const hd=m==='t'&&isHold(x.eid),c1=m==='t'?t('colMin'):(m==='bw'?'+'+wUnit().toUpperCase():wUnit().toUpperCase()),c2=hd?t('colSec'):(m==='t'?dUnit().toUpperCase():t('colReps'));
  if(m==='wr'&&!isDb(x)&&exById(x.eid)&&exById(x.eid).e==='barbell'&&!noBar(exById(x.eid)))h+='<div class="barln"><button class="lnk-d" onclick="pcOpenEx('+i+')">🏋 '+esc(t('barTot'))+'</button></div>';
  if(m==='wr'&&isDb(x))h+='<div class="barln"><button class="lnk-d" onclick="mulMenu('+i+')">🏋 '+esc(t(ml>1?'mulOn':'mulOff'))+'</button></div>';
  h+='<div class="srow hd"><span>'+t('colSet')+'</span><span>'+c1+'</span><span>'+c2+'</span><span></span></div>';
  const sg=(m==='wr'||m==='bw')?sugg(x.eid,x.tg||{lo:6,hi:12,u:'r'}):null;
  x.sets.forEach((s,j)=>{
    const ph=pv[j]||(pv.length?pv[pv.length-1]:null)||(j>0?x.sets[j-1]:null);
    let f1,f2,p1,p2,k1,k2;
    if(hd){k1='tm';k2='ts';const a=tSplit(s.t),b=ph?tSplit(ph.t):null;f1=a?String(a[0]):'';f2=a?String(a[1]):'';p1=b?String(b[0]):'';p2=b?String(b[1]):'';}
    else if(m==='t'){k1='t';k2='d';f1=s.t!=null?fmtNum(s.t):'';f2=dShow(s.d);p1=ph&&ph.t!=null?fmtNum(ph.t):'';p2=ph&&ph.d?dShow(ph.d):'';}
    else{k1='w';k2='r';f1=m==='wr'?pw(s.w):wShow(s.w);f2=s.r!=null?String(s.r):'';p1=ph&&ph.w!=null?(m==='wr'?pw(ph.w):wShow(ph.w)):(m==='bw'?'0':'');p2=ph&&ph.r!=null?String(ph.r):'';if(m==='wr'&&x.sg!=null)p1=pw(x.sg);}
    if((m==='wr'||m==='bw')&&sg&&!s.done&&s.ty!=='w'&&!x.sets.slice(0,j).some(q=>q.r!=null)){ // suggestion, unless an earlier set already shows what you do today / sugerencia, salvo que una serie anterior ya muestre lo de hoy
      if(sg.r&&s.r==null)p2=String(sg.r);
      if(m==='wr'&&sg.w!=null&&x.sg==null&&s.w==null)p1=pw(sg.w);
    }
    const inp0=(k,v,p,mode)=>'<input class="in'+(s.done?' dn':'')+'" type="text" inputmode="'+mode+'" autocomplete="off" enterkeyhint="next" data-i="'+i+'" data-j="'+j+'" data-k="'+k+'" onfocus="this.select()" value="'+esc(v)+'" placeholder="'+esc(p)+'" oninput="sv('+i+','+j+',\''+k+'\',this.value)">';
    const stb=(k,d)=>'<button class="stp" tabindex="-1" aria-label="'+esc(t(d<0?'aDec':'aInc'))+'" onclick="stepSet('+i+','+j+',\''+k+'\','+d+')">'+(d<0?'−':'+')+'</button>';
    const inp=inp0;
    h+='<div class="srow'+(s.done?' done':'')+'"><button class="sn tyb'+(s.ty?' ty-'+s.ty:'')+'" aria-label="'+esc(t('tyAria'))+'" onclick="cycTy('+i+','+j+')">'+(s.ty?s.ty.toUpperCase():(j+1))+(s.pr?'<i class="pr" title="PR">'+ic('trophy')+'</i>':'')+'</button>'+inp(k1,f1,p1,'decimal')+inp(k2,f2,p2,(k2==='r'||k2==='ts')?'numeric':'decimal')+'<button class="chk" aria-label="'+esc(t('chkAria'))+'" onclick="tgSet('+i+','+j+')">'+ic('check')+'</button></div>';
  });
  h+='<button class="btn sm wide" onclick="addSet('+i+')">＋ '+t('addSet')+'</button></section>';
  return h;
}
/* wipe one set back to empty (fix a typo quickly) / dejar una serie vacía (corregir un error rápido) */
function clrSet(i,j){
  const s=ACT.ex[i].sets[j];if(!s)return;
  const snap=JSON.stringify(ACT);
  s.w=null;s.r=null;s.t=null;s.d=null;s.done=false;delete s.pr;
  saveAct();exRedraw(i);undoToast(t('clrDone'),snap);
}
function sv(i,j,f,v){
  const s=ACT.ex[i].sets[j];v=String(v).trim();let n=null;
  if(f==='tm'||f==='ts'){ // minutes and seconds share one number, the time in minutes / minutos y segundos comparten un número, el tiempo en minutos
    const row=document.querySelectorAll('#exc'+i+' .srow:not(.hd)')[j],o=row&&row.querySelector('.in[data-k="'+(f==='tm'?'ts':'tm')+'"]'),ov=o?String(o.value).trim():(()=>{const a=tSplit(s.t);return a?String(a[f==='tm'?1:0]):'';})();
    const mm=parseInt(f==='tm'?v:ov,10),ss=parseInt(f==='ts'?v:ov,10);
    n=(isNaN(mm)&&isNaN(ss))?null:((mm>0?mm:0)*60+(ss>0?ss:0))/60;f='t';v='';
  }
  if(v!==''){
    if(f==='w')n=wParse(v);else if(f==='d')n=dParse(v);
    else if(f==='r'){n=parseInt(v,10);if(!(n>=0))n=null;}
    else n=numParse(v);
  }
  if(n!=null&&n>({w:1500,r:999,t:1440,d:1000}[f]||1e9)){n=null;toast(t('tooBig'));} // typos like 1000000 never reach your totals / un error de dedo no llega a tus totales
  if(f==='w'&&n!=null){const bx=ACT.ex[i];if(exMode(bx.eid)==='wr')n=n*mulOf(bx);}
  s[f]=n;
  if(n==null&&s.done){s.done=false;delete s.pr;const r=document.querySelectorAll('#exc'+i+' .srow:not(.hd)')[j];if(r){r.classList.remove('done');r.querySelectorAll('.in').forEach(q=>q.classList.remove('dn'));}}
  saveAct();updTop();
}
/* a set only counts when you tap its check button: typing numbers never confirms it / una serie solo cuenta al tocar su botón ✓: escribir números no la confirma */
document.addEventListener('focusin',function(ev){const el=ev.target;if(el&&el.dataset&&el.dataset.i!=null&&el.classList.contains('in')){REST_LAST=+el.dataset.i;restFab();}});
function stepSet(i,j,f,d){
  const x=ACT.ex[i],s=x.sets[j],m=exMode(x.eid);if(m==='t')return;
  const pv=lastEx(xk(x)),ps=pv?pv.x.sets:[],ph=ps[j]||(ps.length?ps[ps.length-1]:null)||(j>0?x.sets[j-1]:null);
  if(f==='w'){
    let b=s.w;if(b==null)b=(m==='wr'&&x.sg!=null)?x.sg:(ph&&ph.w!=null?ph.w:(m==='wr'?barOf(x)-wInc()*d:0)); // an empty barbell set starts at the empty bar / una serie vacía con barra empieza en la barra sola
    const st=wInc(),ml=m==='wr'?mulOf(x):1;let dv=Math.max(0,b/ml);dv=Math.max(0,Math.round((dv+d*st)/st)*st);s.w=dv*ml;
  }else{
    let b=s.r;if(b==null)b=ph&&ph.r!=null?ph.r:(x.tg&&x.tg.u==='r'?x.tg.lo:0);
    s.r=Math.max(0,Math.min(999,b+d));
  }
  saveAct();exRedraw(i);buzz(6);
}
/* a new set starts as a copy of the last one: log it with one tap / una serie nueva copia la anterior: se registra con un toque */
function addSet(i){const x=ACT.ex[i];const l=x.sets[x.sets.length-1],n=newSet();if(l){n.w=l.w;n.r=l.r;n.t=l.t;n.d=l.d;}x.sets.push(n);saveAct();exRedraw(i);{const r=document.querySelectorAll('#exc'+i+' .srow:not(.hd)'),l=r[r.length-1];if(l){l.classList.add('rin');setTimeout(()=>l.classList.remove('rin'),500);}}}
/* Enter/Next only walks weight → reps → next set; it never confirms / Enter/Siguiente solo pasa de peso a reps y a la siguiente serie; nunca confirma */
document.addEventListener('keydown',function(ev){
  const el=ev.target;if(ev.key!=='Enter'||!el||!el.classList||!el.classList.contains('in')||el.dataset.i==null)return;
  ev.preventDefault();
  const card=document.getElementById('exc'+el.dataset.i);if(!card)return;
  const ins=[].slice.call(card.querySelectorAll('.srow .in[data-i]')),k=ins.indexOf(el);
  if(k>=0&&ins[k+1])ins[k+1].focus();else el.blur();
});
/* after a rejected tap, outline the missing number(s) in that set / tras un toque rechazado, marca el o los números que faltan */
function errSetRow(i,j,m,s){
  const row=document.querySelectorAll('#exc'+i+' .srow:not(.hd)')[j];if(!row)return;
  const need=m==='t'?[isHold(ACT.ex[i].eid)?'tm':'t']:(m==='bw'?['r']:[s.w==null?'w':'',!(s.r>0)?'r':''].filter(Boolean));
  let first=null;need.forEach(k=>{const el=row.querySelector('.in[data-k="'+k+'"]');if(el){if(!first)first=el;el.classList.add('bad');el.addEventListener('input',function(){el.classList.remove('bad');},{once:true});}});
  if(first){try{first.focus({preventScroll:true});}catch(e){}}
}
function tgSet(i,j){REST_LAST=i;
  const x=ACT.ex[i],s=x.sets[j],m=exMode(x.eid);
  unlockAudio();
  if(!s.done){
    const bk={w:s.w,r:s.r,t:s.t,d:s.d}; // so a rejected tap leaves the row untouched / para que un toque rechazado no cambie la fila
    const pv=lastEx(xk(x)),ps=pv?pv.x.sets:[],ph=ps[j]||(ps.length?ps[ps.length-1]:null)||(j>0?x.sets[j-1]:null);
    if(m==='wr'&&s.w==null&&x.sg!=null)s.w=x.sg;
    if((m==='wr'||m==='bw')&&s.ty!=='w'&&!x.sets.slice(0,j).some(q=>q.r!=null)){const g=sugg(x.eid,x.tg||{lo:6,hi:12,u:'r'});if(g){if(g.r&&s.r==null)s.r=g.r;if(m==='wr'&&g.w!=null&&x.sg==null&&s.w==null)s.w=g.w;}}
    if(ph){
      if(m==='t'){if(s.t==null&&ph.t!=null)s.t=ph.t;if(s.d==null&&ph.d)s.d=ph.d;}
      else{if(s.w==null&&ph.w!=null&&m!=='bw')s.w=ph.w;if(s.w==null&&m==='bw'&&ph.w)s.w=ph.w;if(s.r==null&&ph.r!=null)s.r=ph.r;}
    }
    const ok=m==='t'?(s.t!=null&&s.t>0):(m==='bw'?(s.r!=null&&s.r>0):(s.w!=null&&s.r!=null&&s.r>0));
    if(!ok){s.w=bk.w;s.r=bk.r;s.t=bk.t;s.d=bk.d;toast(t(m==='t'?'needTime':(m==='bw'?'needReps':'needWR')));errSetRow(i,j,m,s);return;}
    const prev=bestScore(xk(x),m,s),sc=setScore(m,s);
    s.done=true;if(!ACT.ts){ACT.ts=ACT.t0&&actTotals().done>1?ACT.t0:Date.now();ACT.sn=ACT.ts;ACT.acc=0;ACT.pz=false;}else if(ACT.pz){ACT.pz=false;ACT.sn=Date.now();}
    if(prev>0&&sc>prev){s.pr=true;toast(m==='wr'?t('newPR2',wShow(Math.round(sc))+' '+wUnit(),wShow(Math.round(sc-prev))+' '+wUnit()):t('newPR'));}else delete s.pr;
    startRest(exRest(x));
  }else{s.done=false;delete s.pr;}
  saveAct();exRedraw(i);
  if(s.done){buzz(s.pr?[12,60,24]:12);popRow(i,j);if(s.pr)prBurst(i,j);nextInView(i,j);}
}
/* redraw only the exercise you touched: no flash, no jump, keeps your place / redibuja solo el ejercicio que tocaste: sin parpadeo ni saltos */
function exRedraw(i){
  const el=document.getElementById('exc'+i);
  if(!el||!ACT||!ACT.ex[i]){render();return;}
  const tmp=document.createElement('div');tmp.innerHTML=exCard(i,ACT.ex[i]);
  el.replaceWith(tmp.firstElementChild);updTop();
}
/* toast with Undo: restores the workout as it was / aviso con Deshacer: restaura el entrenamiento como estaba */
let UNDO=null;
function undoToast(msg,snap){
  UNDO=snap;const e=$('toast');if(!e)return;
  e.innerHTML=esc(msg)+' <button class="tundo" onclick="undoRun()">'+esc(t('undoB'))+'</button>';
  e.classList.add('on','undo');clearTimeout(toastT);toastT=setTimeout(()=>{e.classList.remove('on','undo');UNDO=null;},5500);
}
/* delete with undo: the change shows at once but is only committed (tombstone + cloud sync) when the undo window closes or the app is hidden,
   so an undone delete never reaches the cloud / borrar con deshacer: el cambio se ve al instante pero solo se confirma (lápida + nube) al cerrarse la ventana o al ocultar la app */
let UNDOP=null,UNDOT=0;
function undoCommit(){clearTimeout(UNDOT);const p=UNDOP;UNDOP=null;if(p&&p.commit)p.commit();}
function undoDo(msg,restore,commit){
  undoCommit();UNDO=null;UNDOP={restore:restore,commit:commit};
  const e=$('toast');if(e){e.innerHTML=esc(msg)+' <button class="tundo" onclick="undoRun()">'+esc(t('undoB'))+'</button>';e.classList.add('on','undo');clearTimeout(toastT);toastT=setTimeout(()=>{e.classList.remove('on','undo');},8000);}
  UNDOT=setTimeout(undoCommit,8000);
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')undoCommit();});
window.addEventListener('pagehide',undoCommit);
function undoRun(){
  if(UNDOP){clearTimeout(UNDOT);const p=UNDOP;UNDOP=null;const e0=$('toast');if(e0)e0.classList.remove('on','undo');p.restore();return;}
  const s=UNDO;UNDO=null;const e=$('toast');if(e)e.classList.remove('on','undo');
  if(!s||!ACT)return;try{ACT=JSON.parse(s);}catch(x){return;}
  saveAct();render();
}
function buzz(p){try{if(SET.hap!==false&&navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function popRow(i,j){const el=document.getElementById('exc'+i);if(!el)return;const r=el.querySelectorAll('.srow:not(.hd)')[j];if(r){r.classList.add('pop');}}
/* after a set is done, bring the next one into view only if it is off screen / al terminar una serie, muestra la siguiente solo si queda fuera de pantalla */
function nextInView(i,j){
  const el=document.getElementById('exc'+i);if(!el)return;
  const rows=el.querySelectorAll('.srow:not(.hd)');let nx=rows[j+1];
  if(!nx){const e2=document.getElementById('exc'+(i+1));if(e2)nx=e2.querySelector('.srow:not(.hd)');}
  if(!nx)return;
  const r=nx.getBoundingClientRect();
  if(r.bottom>window.innerHeight-170||r.top<70){try{nx.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}}
}
function exMenu(i){
  const x=ACT.ex[i];
  sheet('<h3>'+esc(exNameV(x.eid,x.vr,x.n))+'</h3><div class="menu">'+
    '<button class="pri" onclick="swapOpen('+i+')">↔ '+t('swapB')+'</button>'+(exVars(x.eid).length?'<button onclick="varOpen('+i+')">⚙ '+t('varB')+'</button>':'')+'<button onclick="howOpen(\''+x.eid+'\')">ⓘ '+t('guideB')+'</button>'+(x.eid.indexOf('c_')===0?'<button onclick="customOpen(\''+x.eid+'\')">✎ '+t('cxEdit')+'</button>':'')+
    '<button onclick="tasteLike(\''+x.eid+'\');exMenu('+i+')">'+ic('heart')+' '+t(tasteOf(x.eid)==='lk'?'tkLiked':'tkLike')+'</button><button onclick="tasteDis(\'act\','+i+')">'+ic('ban')+' '+t('tkDis')+'</button>'+
    '<button onclick="restPick('+i+')">⏱ '+t('restEx')+'</button>'+(x.sets.some(q=>q.done)?'<button onclick="unDoneLast('+i+')">↩ '+t('unDone')+'</button>':'')+''+(exMode(x.eid)==='wr'&&!isDb(x)?'<button onclick="sheetClose();pcOpenEx('+i+')">🏋 '+t('pcT')+'</button>':'')+(exMode(x.eid)==='wr'&&isDb(x)?'<button onclick="mulMenu('+i+')">🏋 '+t('mulTitle')+'</button>':'')+'<button onclick="rmSet('+i+')">− '+t('rmLastSet')+'</button><button class="danger" onclick="rmEx('+i+')">✕ '+t('rmEx')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
}
/* remove one set (the swipe-left uses this); the last set left is emptied instead / quitar una serie (lo usa deslizar a la izquierda); si queda una sola, se vacía */
function rmSetAt(i,j){
  const x=ACT&&ACT.ex[i];if(!x||!x.sets[j])return;
  const snap=JSON.stringify(ACT);
  if(x.sets.length>1)x.sets.splice(j,1);else x.sets[0]=newSet();
  saveAct();exRedraw(i);buzz(8);undoToast(t('rmDone'),snap);
}
/* swipe a set row to the left to remove it (with Undo) / deslizar una serie a la izquierda para quitarla (con Deshacer) */
(function(){
  let st=null;
  const home=row=>{row.classList.add('swr');row.style.transform='';setTimeout(()=>{row.classList.remove('sw','swr');delete row.dataset.del;},220);};
  document.addEventListener('touchstart',e=>{
    const row=e.target.closest&&e.target.closest('.srow:not(.hd)');
    if(!row||!row.closest('[id^="exc"]')||e.touches.length!==1){st=null;return;}
    const a=document.activeElement;if(a&&a.classList&&a.classList.contains('in')){st=null;return;} // keyboard open: leave it alone / con el teclado abierto no se desliza
    st={row:row,x:e.touches[0].clientX,y:e.touches[0].clientY,on:false,dx:0};
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!st)return;const dx=e.touches[0].clientX-st.x,dy=e.touches[0].clientY-st.y;
    if(!st.on){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){st=null;return;}
      if(dx<-14&&Math.abs(dx)>Math.abs(dy)*1.5){st.on=true;st.row.classList.add('sw');st.row.dataset.del=t('remove');}else return;
    }
    st.dx=Math.min(0,dx);st.row.style.transform='translateX('+st.dx+'px)';
    st.row.classList.toggle('swgo',st.dx<-90);
    if(e.cancelable)e.preventDefault();
  },{passive:false});
  const end=()=>{
    if(!st)return;const o=st;st=null;if(!o.on)return;
    const card=o.row.closest('[id^="exc"]'),i=card?+card.id.slice(3):-1,rows=card?[].slice.call(card.querySelectorAll('.srow:not(.hd)')):[],j=rows.indexOf(o.row);
    if(o.dx<-90&&i>=0&&j>=0){o.row.style.transform='translateX(-110%)';o.row.classList.add('swr');setTimeout(()=>rmSetAt(i,j),160);}
    else home(o.row);
  };
  document.addEventListener('touchend',end);document.addEventListener('touchcancel',end);
})();
function rmSet(i){const snap=JSON.stringify(ACT),s=ACT.ex[i].sets;if(s.length>1)s.pop();saveAct();sheetClose();render();undoToast(t('rmDone'),snap);}
function unDoneLast(i){const x=ACT&&ACT.ex[i];if(!x)return;for(let j=x.sets.length-1;j>=0;j--)if(x.sets[j].done){tgSet(i,j);break;}sheetClose();}
function rmEx(i,ok){const x=ACT&&ACT.ex[i];if(!x)return;if(!ok&&x.sets&&x.sets.some(s=>s.done||s.w!=null||s.r!=null||s.t!=null)){ask(t('delEx'),t('delete'),function(){rmEx(i,1);},true);return;}const snap=JSON.stringify(ACT);ACT.ex.splice(i,1);saveAct();sheetClose();render();undoToast(t('rmDone'),snap);}

/* ---------- finish / cancel ---------- */
function autoName(ts){const h=new Date(ts).getHours();return t(h<12?'wkMorning':(h<18?'wkAfternoon':'wkEvening'));}
function finishAsk(){
  const a=actTotals();
  if(a.done===0){ask(t('noDone'),t('discard'),cancelWk,true);return;}
  if(a.done<a.tot){ask(t('undone',a.tot-a.done),t('finish'),finishWk);return;}
  finishWk();
}
/* a short, warm message after finishing / un mensaje corto y cálido al terminar */
function wkCheer(wk,prs){
  if(DATA.workouts.length===1)return t('chFirst');
  if(prs.length)return t('chPR');
  const s=streakInfo();if(s.n>=2)return t('chStreak',s.n);
  return[t('chG0'),t('chG1'),t('chG2'),t('chG3')][Math.floor(wk.t/864e5)%4];
}
function finishWk(){
  const end=Date.now();
  const ex=ACT.ex.map(x=>{const o={eid:x.eid,n:x.n,sets:x.sets.filter(s=>s.done).map(s=>{const o={w:s.w,r:s.r,t:s.t,d:s.d};if(s.pr)o.pr=1;if(s.ty)o.ty=s.ty;return o;})};if(x.v)o.v=x.v;if(x.vr)o.vr=x.vr;if(x.mul>1)o.mul=x.mul;if(x.bar>0)o.bar=x.bar;return o;}).filter(x=>x.sets.length);
  const t0=actStart()||ACT.t0,dur=actStart()?actMs():end-t0,wk={id:ACT.id,t:t0,end:t0+dur,name:(ACT.name||'').trim()||autoName(t0),note:(ACT.note||'').trim(),ex:ex};
  if(ACT.pl!=null){wk.pl=ACT.pl;if(DATA.plan)DATA.plan.cur=(ACT.pl+1)%DATA.plan.n;}
  DATA.workouts.push(wk);DATA.workouts.sort((a,b)=>b.t-a.t);
  goalsCheck();rkCheck();
  saveData();
  if(typeof trkGuest==='function')trkGuest('wk_done');
  ACT=null;saveAct();stopRest();unwake();
  render();
  const prs=[];wk.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr&&prs.indexOf(x.eid)<0)prs.push(x.eid);}));
  sheet('<div class="sum"><div class="sum-e">🎉</div><h3>'+t('wkSaved')+'</h3><p class="cheer">'+wkCheer(wk,prs)+'</p><p class="muted">'+esc(wk.name)+'</p>'+
    '<div class="stats"><div><b>'+fmtDur((end-wk.t)/1000)+'</b><span>'+t('duration')+'</span></div>'+wkCountBox(wk)+'<div><b>'+vShow(wkVol(wk))+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>'+
    (prs.length?'<p class="prs">'+ic('trophy')+' '+t('prsT')+': '+prs.map(e=>esc(exName(e))).join(', ')+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="sumDone()">'+t('done')+'</button><button class="btn" onclick="saveWkAsRoutine(\''+wk.id+'\')">'+t('saveRoutineS')+'</button><button class="btn" onclick="wkPic(\''+wk.id+'\')">'+ic('share')+' '+t('cdBtn')+'</button><button class="btn" onclick="cgAfter(\''+wk.id+'\')">'+ic('heart')+' '+t('cgAfter')+'</button></div></div>');
}
/* one-time feedback pop up: after the first routine/plan AND the first logged set / pop up de feedback una sola vez */
function fbDue(){return !SET.fbAsked&&DATA.workouts.some(w=>wkAnySets(w)>0)&&!!(DATA.plan||DATA.routines.length||DATA.workouts.some(w=>w.pl!=null));}
function sumDone(){
  sheetClose();
  if(typeof gwFirstDue==='function'&&gwFirstDue()){setTimeout(gwFirst,400);return;} // a guest's first workout: invite them to keep it; feedback waits for the next one / primer entrenamiento de un invitado: se invita a guardarlo; el feedback espera al siguiente
  if(fbDue())setTimeout(fbShow,400);
}
function fbShow(){
  SET.fbAsked=1;saveSet();
  sheet('<div class="sum"><div class="sum-e">💬</div><h3>'+t('fbPopT')+'</h3><p class="muted">'+t('fbPopP')+'</p>'+
    '<div class="row"><a class="btn pri" href="https://tally.so/r/KpY5MA" target="_blank" rel="noopener" onclick="sheetClose()">'+t('fbPopYes')+'</a><button class="btn" onclick="sheetClose()">'+t('fbPopNo')+'</button></div></div>');
}
function cancelAsk(){ask(t('cancelAsk'),t('discard'),cancelWk,true);}
function cancelWk(){ACT=null;saveAct();stopRest();unwake();render();pgAnim();}

/* ---------- rest timer ---------- */
let REST=null,restTick=null,restBuilt=false,AC=null;
function unlockAudio(){try{if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(A)AC=new A();}if(AC&&AC.state==='suspended')AC.resume();}catch(e){}}
function beep(){
  if(SET.sound&&AC){try{const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.frequency.value=880;g.gain.value=0.15;o.start();setTimeout(()=>{try{o.stop();}catch(e){}},350);}catch(e){}}
  try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(e){}
}
/* rest for one exercise: your choice for it, then the plan's, then the default / descanso de un ejercicio: tu elección, luego la del plan, luego el predeterminado */
function exRest(x){
  if(x.rsu!=null)return x.rsu;
  const m=SET.exRest&&SET.exRest[x.eid];if(m!=null)return m;
  return x.tg&&x.tg.rs!=null?x.tg.rs:undefined;
}
function restPick(i){
  const x=ACT.ex[i],cur=exRest(x),def=SET.rest||90;
  const chip=(v,l)=>'<button class="chip'+(cur===v||(cur==null&&v==='d')?' on':'')+'" onclick="restSet('+i+',\''+v+'\')">'+l+'</button>';
  sheet('<h3>'+t('restEx')+'</h3><p class="muted sm">'+esc(exName(x.eid,x.n))+'</p><div class="chips">'+chip('d',t('restDef')+' · '+fmtClock(def))+chip('0',t('restOff'))+[30,45,60,90,120,150,180,240,300].map(v=>chip(String(v),fmtClock(v))).join('')+'</div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
}
function restSet(i,v){
  const x=ACT.ex[i];SET.exRest=SET.exRest||{};
  if(v==='d'){delete x.rsu;delete SET.exRest[x.eid];}else{x.rsu=parseInt(v,10);SET.exRest[x.eid]=x.rsu;}
  saveSet();saveAct();sheetClose();exRedraw(i);toast(t('restSaved'));
}
/* rest never starts by itself unless you turn that on; the Rest button is always there / el descanso nunca empieza solo salvo que lo actives; el botón Descanso siempre está */
let REST_LAST=0;
function startRest(sec,manual){
  if(!manual&&!SET.autoRest)return;
  if(sec===0&&!manual){return;} // supersets: straight to the next exercise / supersets: directo al siguiente ejercicio
  sec=sec||SET.rest||90;
  REST={end:Date.now()+sec*1000,tot:sec,done:false};restBuilt=false;
  drawRest();if(!restTick)restTick=setInterval(drawRest,250);restFab();
}
/* the always-there Rest button / el botón Descanso siempre visible */
function restStart(){if(!ACT)return;const x=ACT.ex[Math.min(REST_LAST,ACT.ex.length-1)],r=x?exRest(x):null;startRest(r>0?r:(SET.rest||90),true);buzz(8);}
function restFab(){if(typeof plateFab==='function')plateFab();const b=$('restfab');if(!b)return;const on=!!ACT&&tab==='workout'&&!REST&&!(ACT.guide&&!ACT.gOff);b.hidden=!on;if(on){const x=ACT.ex[Math.min(REST_LAST,ACT.ex.length-1)],r=x?exRest(x):null;b.innerHTML=ic('stopwatch')+'<span>'+fmtClock(r>0?r:(SET.rest||90))+'</span>';b.setAttribute('aria-label',t('restStartB'));}}
function drawRest(){
  const b=$('restbar');if(!b)return;
  if(!REST){b.hidden=true;return;}
  if(!restBuilt){
    b.innerHTML='<div class="rb-bar"><div id="restF"></div></div><div class="rb-row"><span class="rb-l">'+t('rest')+'</span><b id="restT"></b><span class="rb-sp"></span><button class="btn sm" id="restP" onclick="restPause()" aria-label="'+esc(t('clkPause'))+'">❚❚</button><button class="btn sm pri" onclick="stopRest()">'+t('skip')+'</button></div><div class="rb-adj">'+[-60,-30,30,60].map(d=>'<button class="btn sm" onclick="restAdd('+d+')">'+(d<0?'−':'+')+(Math.abs(d)===60?'1:00':'0:30')+'</button>').join('')+'</div>';
    restBuilt=true;
  }
  b.hidden=false;
  const left=Math.ceil((REST.pz?REST.left:REST.end-Date.now())/1000),T=$('restT'),F=$('restF'),P=$('restP');
  if(P){const g=REST.pz?'▶':'❚❚';if(P.textContent!==g)P.textContent=g;}
  if(left<=0){
    if(!REST.done){REST.done=true;beep();}
    if(T){T.textContent=t('restOver');T.classList.add('rdone');}if(F)F.style.width='100%';
    if(Date.now()-REST.end>5000)stopRest();
    return;
  }
  if(T){T.textContent=fmtClock(left);T.classList.remove('rdone');}
  if(F)F.style.width=Math.max(0,Math.min(100,100*(1-left/REST.tot)))+'%';
}
function restPause(){
  if(!REST||REST.done)return;
  if(REST.pz){REST.end=Date.now()+REST.left;REST.pz=false;}
  else{REST.left=Math.max(0,REST.end-Date.now());REST.pz=true;}
  drawRest();buzz(10);
}
function restAdd(d){if(!REST)return;if(REST.pz)REST.left=Math.max(0,REST.left+d*1000);REST.end+=d*1000;REST.tot=Math.max(5,REST.tot+d);REST.done=false;drawRest();}
function stopRest(){REST=null;restBuilt=false;if(restTick){clearInterval(restTick);restTick=null;}const b=$('restbar');if(b){b.hidden=true;b.innerHTML='';}restFab();}

/* ---------- keep screen awake during a workout ---------- */
let WL=null;
async function wake(){try{if(ACT&&'wakeLock' in navigator&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null;});}}catch(e){WL=null;}}
function unwake(){try{if(WL)WL.release();}catch(e){}WL=null;}

/* ---------- exercise picker ---------- */
function pickEx(cb,multi){UI.q='';UI.pt='all';UI.pf=null;UI.pkN=0;UI.pickSel=[];UI.pickMulti=!!multi;UI.pickCb=cb||function(eid){addExTo(eid,1);saveAct();render();};drawPick();}
function recentIds(){
  const r=[];
  for(const wk of DATA.workouts){for(const x of wk.ex){if(r.indexOf(x.eid)<0)r.push(x.eid);if(r.length>=8)return r;}}
  return r;
}
/* the exercises you use most, then the ones you liked / los que más usas y los que te gustan */
function mineIds(){
  const c={};DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{c[x.eid]=(c[x.eid]||0)+1;}));
  const top=Object.keys(c).sort((a,b)=>c[b]-c[a]).slice(0,30);
  try{EXLIB.forEach(a=>{if(tasteOf(a[0])==='lk'&&top.indexOf(a[0])<0)top.push(a[0]);});}catch(e){}
  return top;
}
/* Big exercise media: animated loop when we have one (EXANIM), otherwise the two-photo crossfade. / Media grande: animación en bucle si existe (EXANIM), si no el cruce de dos fotos. */
/* Red ✕ delete button (top-right of a card). / Botón rojo ✕ para eliminar (esquina superior derecha de una tarjeta). */
function xBtn(call,inl){return'<button class="xdel'+(inl?' inl':'')+'" onclick="event.stopPropagation();'+call+'" aria-label="'+esc(t('delete'))+'">✕</button>';}
function exAnimOn(id){return typeof EXANIM!=='undefined'&&EXANIM.has(id);}
function exImgs(id,own){return exAnimOn(id)?'<img class="a" src="img/ex/a/'+id+'.webp" alt="" loading="lazy" onerror="this.src=\'img/ex/'+id+'-0.jpg\'">':'<img src="img/ex/'+id+'-0.jpg" alt="" onerror="'+(own||'this.parentNode.remove()')+'"><img class="b" src="img/ex/'+id+'-1.jpg" alt="" onerror="this.remove()">';}
function exThumb(id){return typeof EXPHOTO!=='undefined'&&EXPHOTO.has(id)?'<span class="ex-th" style="background-image:url(img/ex/'+id+'-0.jpg)"></span>':'<span class="ex-th ex-no">'+ic('barbell')+'</span>';}
function exRow(e,srch){const on=UI.pickMulti&&(UI.pickSel||[]).indexOf(e.id)>=0,al=LANG==='es'?e.en:e.es,nm=LANG==='es'?e.es:e.en,sub=srch&&al&&norm(al)!==norm(nm)?t('alsoCalled',al):t('g_'+e.g)+' · '+t('e_'+e.e)+(e.custom?' · '+t('custom'):'')+injBadge(e.id);return'<button class="exrow exth'+(on?' sel':'')+'" data-id="'+e.id+'" onclick="pickTap(\''+e.id+'\')">'+exThumb(e.id)+'<span class="ex-tx"><b>'+esc(nm)+'</b><small>'+esc(sub)+'</small></span>'+(e.custom?'<span class="exedit" role="button" tabindex="0" aria-label="'+esc(t('cxEdit'))+'" onclick="event.stopPropagation();customOpen(\''+e.id+'\')">✎</span>':'')+(UI.pickMulti?'<i class="exck">'+(on?'✓':'')+'</i>':'')+'</button>';}
/* same exercise imported twice (Pull-Up / Pullups): show it once / el mismo ejercicio importado dos veces: se muestra una vez */
function exKey(e){return norm(e.en).replace(/[^a-z0-9 ]/g,'').split(' ').map(w=>w.replace(/(ups|up)$/,'up').replace(/s$/,'')).join('')+'|'+e.g;}
let _pkU=null,_pkVK=null;
function pkVarKids(){if(_pkVK)return _pkVK;const o={};if(typeof EXVAR!=='undefined')Object.keys(EXVAR).forEach(k=>{(o[EXVAR[k]]=o[EXVAR[k]]||[]).push(k);});return(_pkVK=o);}
function pkUsed(){const L=DATA.workouts,k=L.length+':'+(L[0]?L[0].id:'');if(_pkU&&_pkU.k===k)return _pkU.v;const v={};L.forEach(wk=>wk.ex.forEach(x=>{v[x.eid]=1;}));_pkU={k:k,v:v};return v;}
function pickPool(){
  const seen={},out=[];
  const dup=typeof EXDUP!=='undefined'?EXDUP:{},vr=typeof EXVAR!=='undefined'?EXVAR:{},used=pkUsed(); // variants hide from browsing too, unless logged / las variantes también se ocultan, salvo registradas // a hand-listed duplicate stays hidden unless you already logged it / un duplicado listado a mano queda oculto salvo que ya lo hayas registrado
  const rk=e=>used[e.id]?0:(/^z_/.test(e.id)?2:1); // what you logged wins over a look-alike, then curated / lo que registraste gana a su gemelo, luego lo curado
  EXLIB.map(a=>exById(a[0])).filter(Boolean).sort((a,b)=>rk(a)-rk(b)).forEach(e=>{if(!e)return;if((dup[e.id]||vr[e.id])&&!used[e.id])return;const k=exKey(e);if(seen[k])return;seen[k]=1;out.push(e);});
  return out.concat(DATA.custom.filter(c=>!c.del).map(c=>exById(c.id)));
}
/* ---------- exercise search / búsqueda de ejercicios ----------
   Each exercise is indexed once as word lists per field (current-language name, other-language name, aliases, group/equipment labels).
   Matching is at word starts only; plurals are folded on both sides; a token that is not a known word or prefix is corrected to the
   nearest word in the app's vocabulary (typos); muscle words prefer that muscle group; ties go to what you use, then staple lifts.
   Cada ejercicio se indexa una vez como listas de palabras por campo. Coincidencia al inicio de palabra; plurales en ambos lados; un
   término que no es palabra ni prefijo se corrige a la palabra más cercana del vocabulario; las palabras de músculo prefieren ese grupo;
   los empates van a lo que usas y luego a los básicos. */
const SR_STOP={de:1,del:1,con:1,en:1,al:1,a:1,la:1,el:1,los:1,las:1,y:1,the:1,with:1,on:1,of:1,to:1,and:1,'&':1};
const SR_EQW={barbell:1,dumbbell:1,cable:1,machine:1,kettlebell:1,band:1,smith:1,barra:1,mancuerna:1,polea:1,maquina:1,pesa:1,rusa:1,banda:1,db:1,bb:1,kb:1};
let _sx=null;
function srWords(s){return norm(s).replace(/[-/(),.:+]/g,' ').split(/\s+/).filter(w=>w&&!SR_STOP[w]);}
function srFold(w){return w.length>4&&/[^aeiou]es$/.test(w)?w.slice(0,-2):(w.length>3&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w);}
function srIdx(){
  const key=LANG+':'+DATA.custom.length+':'+DATA.custom.map(c=>c.n+(c.del?'x':'')).join('|').length;
  if(_sx&&_sx.k===key)return _sx;
  const ex={},voc={},add=w=>{voc[w]=(voc[w]||0)+1;const g=srFold(w);if(g!==w)voc[g]=(voc[g]||0)+1;};
  const one=e=>{if(!e)return;const es=LANG==='es';
    const f={c:srWords(es?e.es:e.en),o:srWords(es?e.en:e.es),a:srWords(typeof EXALI!=='undefined'&&EXALI[e.id]?EXALI[e.id].replace(/;/g,' '):''),m:srWords(t('g_'+e.g)+' '+t('e_'+e.e)),en:' '+srWords(e.en).join(' ')+' '};
    ['c','o','a','m'].forEach(k=>{f[k]=f[k].map(w=>[w,srFold(w)]);f[k].forEach(p=>{add(p[0]);});});ex[e.id]=f;};
  EXLIB.forEach(r=>one(exById(r[0])));DATA.custom.forEach(c=>one(exById(c.id)));
  if(typeof EXSYN!=='undefined')Object.keys(EXSYN).forEach(add);
  _sx={k:key,ex:ex,voc:Object.keys(voc),cnt:voc,fix:{}};return _sx;
}
/* edit distance with swaps, stopped early above the limit / distancia de edición con transposiciones, se corta al pasar el límite */
function srDist(a,b,max){
  if(Math.abs(a.length-b.length)>max)return max+1;
  const m=a.length,n=b.length;let p2=null,p=[],c;for(let j=0;j<=n;j++)p.push(j);
  for(let i=1;i<=m;i++){c=[i];let lo=i;for(let j=1;j<=n;j++){let v=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));if(p2&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,p2[j-2]+1);c.push(v);if(v<lo)lo=v;}if(lo>max)return max+1;p2=p;p=c;}
  return p[n];
}
/* a token the vocabulary does not know -> its closest words (4+ letters; a word still being typed is left alone while it is the start of a real word) */
function srFix(q,last){
  const X=srIdx();if(X.fix[q+last]!==undefined)return X.fix[q+last];
  let best=[];const fq=srFold(q);
  if(!X.voc.some(w=>w.indexOf(q)===0||w.indexOf(fq)===0)&&q.length>=4){
    const max=q.length>=7?2:1;let bd=max+1;
    X.voc.forEach(w=>{if(w[0]!==q[0]&&!(q.length>=6&&w[1]===q[1]))return;const d=srDist(q,w,max);if(d<bd){bd=d;best=[w];}else if(d===bd&&d<=max)best.push(w);});
    best.sort((a,b)=>X.cnt[b]-X.cnt[a]);best=best.slice(0,4); // every word at the closest distance, most common first / todas las palabras a la menor distancia
  }
  X.fix[q+last]=best;return best;
}
/* cost of one query token in one field: 0 exact word, 1 word prefix; -1 no match / costo de un término en un campo */
function srIn(words,q,fq,pre){
  let c=-1;for(const p of words){if(p[0]===q||p[1]===q||p[1]===fq||p[0]===fq)return 0;if(pre&&(p[0].indexOf(q)===0||p[0].indexOf(fq)===0))c=1;}
  return c;
}
let _srUse=null;
function srUse(){const L=DATA.workouts,k=L.length+':'+(L[0]?L[0].id:'');if(_srUse&&_srUse.k===k)return _srUse.v;const v={};L.forEach(w=>w.ex.forEach(x=>{v[x.eid]=(v[x.eid]||0)+1;}));_srUse={k:k,v:v};return v;}
function exRank(e,tok){
  const X=srIdx(),f=X.ex[e.id];if(!f)return -1;
  let sc=0,fixed=0;const eff=[];
  for(let i=0;i<tok.length;i++){
    let q=norm(tok[i]).replace(/-/g,'');if(!q||SR_STOP[q])continue;
    const last=i===tok.length-1;let fq=srFold(q),best=99;
    const tryQ=(q,fq,pen)=>{
      const syn=typeof EXSYN!=='undefined'&&(EXSYN[q]||EXSYN[fq]);let grp='';
      if(syn)syn.split('|').forEach(w=>{if(w.indexOf('g:')===0){grp=w.slice(2);if(e.g===grp)best=Math.min(best,pen);}else if(f.en.indexOf(' '+w.replace(/-/g,' '))>=0)best=Math.min(best,2+pen);});
      let c=srIn(f.c,q,fq,true);if(c>=0)best=Math.min(best,c+pen+(grp&&e.g!==grp?3:0));
      c=srIn(f.o,q,fq,true);if(c>=0)best=Math.min(best,c+2+pen+(grp&&e.g!==grp?3:0));
      c=srIn(f.a,q,fq,q.length>=3);if(c>=0)best=Math.min(best,c+1+pen); // hand-written aliases are real names / los alias escritos a mano son nombres reales
      c=srIn(f.m,q,fq,q.length>=3);if(c>=0)best=Math.min(best,c+5+pen);
      // "pushup" = "push-up", "pullup" = "pull up": glue two neighbouring words / pega dos palabras vecinas
      if(best===99&&q.length>=5){[f.c,f.o].forEach((W,k)=>{for(let j=0;j+1<W.length;j++){const g=W[j][0]+W[j+1][0];if(g===q||g===fq||(last&&g.indexOf(q)===0))best=Math.min(best,1+k*2+pen);}});}
    };
    tryQ(q,fq,0);
    let used=fq;
    if(best===99){const ws=srFix(q,last);if(ws.length){fixed=1;ws.forEach(w=>{const b0=best;tryQ(w,srFold(w),2);if(best<b0)used=srFold(w);});}}
    eff.push(used);
    if(best===99)return -1;
    sc+=best;
  }
  /* tie-breaks: what you use, staple lifts, curated, shorter names; variations and stretches after / desempates */
  const u=srUse()[e.id]||0,st=typeof EXSTAPLE!=='undefined'&&EXSTAPLE[e.id];
  /* the plain version: name minus equipment words equals the query ("Barbell Curl" for "curl", "Remo con barra" for "remo") / la versión básica */
  const core=f.c.map(p=>p[1]).filter(w=>!SR_EQW[w]),qs=eff.filter(x=>x&&!SR_STOP[x]&&!SR_EQW[x]);
  const plain=core.length&&core.length===qs.length&&core.every(w=>qs.indexOf(w)>=0);
  let r=sc*10-Math.min(6,Math.round(2.5*Math.log2(1+u)))-(st===2?7:st?4:0)-(plain?5:0)+(/^z_/.test(e.id)?2:0)+(typeof EXVAR!=='undefined'&&EXVAR[e.id]?2:0)+(e.g==='mobility'&&UI.pt!=='mob'?6:0)+fixed;
  return Math.max(0,(r+20))*100+f.c.length*4+Math.min(40,(LANG==='es'?e.es:e.en).length);
}
const PK_PAGE=80;
function pkScroll(){const l=$('exlist');if(!l||!$('pkmore'))return;if(l.scrollTop+l.clientHeight>l.scrollHeight-900){const y=l.scrollTop;UI.pkN=(UI.pkN||PK_PAGE)+160;l.innerHTML=exListHtml();l.scrollTop=y;}}
function exListHtml(){
  const q=norm(UI.q.trim()),tok=q?q.split(' ').filter(Boolean):[];
  if(!tok.length&&UI.pt!=='all'&&!UI.pf)return pickMenu();
  const f=pickFx(),pool=pickPoolF(f),nmf=e=>norm(LANG==='es'?e.es:e.en);
  let list,h='',last='';
  if(tok.length){
    /* search also sees variations (you may only know the grip: "wide grip"); a small penalty keeps them below the main lift
       la búsqueda también ve las variantes (a veces solo sabes el agarre); una pequeña penalización las deja bajo el ejercicio principal */
    const have={},rk=e=>exRank(e,tok);pool.forEach(e=>{have[e.id]=1;});
    const vars=Object.keys(typeof EXVAR!=='undefined'?EXVAR:{}).filter(id=>!have[id]).map(exById).filter(v=>v&&pickPoolF(f,[v]).length);
    list=pool.concat(vars).map(e=>({e:e,r:rk(e)})).filter(x=>x.r>=0).sort((a,b)=>a.r-b.r).map(x=>x.e);
    const nmSeen={};list=list.filter(e=>{const k=norm(LANG==='es'?e.es:e.en);if(nmSeen[k])return false;nmSeen[k]=1;return true;}); // no repeated names / sin nombres repetidos
  }
  else if(f.t==='mine'||f.t==='recent'){const ids=f.t==='mine'?mineIds():recentIds();list=pool.slice().sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));}
  else list=pool.slice().sort((a,b)=>nmf(a).localeCompare(nmf(b)));
  const letters=!tok.length&&f.t!=='mine'&&f.t!=='recent';
  /* long lists are drawn in pages as you scroll: ~900 rows with photos at once froze slow phones / las listas largas se dibujan por páginas al deslizar */
  const cap=UI.pkN||PK_PAGE,total=list.length;if(total>cap)list=list.slice(0,cap);
  list.forEach(e=>{
    if(letters){const c=(nmf(e).charAt(0)||'#').toUpperCase(),L=/[A-Z]/.test(c)?c:'#';if(L!==last){last=L;h+='<div class="pk-l">'+L+'</div>';}}
    h+=exRow(e,tok.length>0);
  });
  let sn=0;
  if(tok.length&&f.t==='all'){sn=pickPoolF({t:'str'}).filter(e=>exRank(e,tok)>=0).length;if(sn)h+='<button class="pk-more" onclick="pickPick(\'str\',\'\',1)">'+t('seeStr',sn)+'</button>';}
  if(total>cap)return h+'<div id="pkmore" class="pk-mo" aria-hidden="true"></div>';
  if(!list.length&&!sn)h+='<p class="muted pk-none">'+t('noMatch')+'</p>'+(tok.length?'<button class="btn pri wide" onclick="customOpen()">＋ '+t('cxCreate',esc(UI.q.trim()))+'</button>':'');
  return h+'<button class="pk-more pk-own" onclick="customOpen()">＋ '+t('customEx')+'</button>';
}
/* which exercises a view shows: stretches & mobility only when asked for / qué ejercicios muestra cada vista: estiramientos solo si se piden */
function pickFx(){return UI.pt==='all'||!UI.pf?{t:'all'}:UI.pf;}
function pickPoolF(f,src){
  const P=(src||pickPool()).filter(Boolean),nm=e=>e.g!=='mobility';
  switch(f.t){
    case 'g':return P.filter(e=>e.g===f.v);
    case 'e':return P.filter(e=>e.e===f.v&&nm(e));
    case 'bw':return P.filter(e=>e.e==='bodyweight'&&nm(e));
    case 'wt':return P.filter(e=>e.e!=='bodyweight'&&nm(e)&&e.g!=='cardio');
    case 'custom':return P.filter(e=>e.custom);
    case 'str':return P.filter(e=>e.g==='mobility');
    case 'mine':{const s=new Set(mineIds());return P.filter(e=>s.has(e.id));}
    case 'recent':{const s=new Set(recentIds());return P.filter(e=>s.has(e.id));}
    default:return P.filter(nm);
  }
}
function pickMenu(){
  const row=(k,v,label,n)=>'<button class="pk-m" onclick="pickPick(\''+k+'\',\''+v+'\')">'+(k==='g'&&typeof libAnaSvg==='function'?'<span class="pk-f">'+(LIB_ANA[v]?libAnaSvg(v):'')+'</span>':'')+'<b>'+esc(label)+'</b><small>'+n+'</small><i>›</i></button>',c=f=>pickPoolF(f).length;
  if(UI.pt==='mus')return EX_GROUPS.filter(g=>g!=='mobility').map(g=>row('g',g,t('g_'+g),c({t:'g',v:g}))).join('');
  const eq=['barbell','dumbbell','machine','cable','kettlebell','band','ball','suspension','other'];
  return row('all','',t('catAll'),c({t:'all'}))+row('recent','',t('catRecent'),c({t:'recent'}))+row('mine','',t('mineB'),c({t:'mine'}))+row('custom','',t('catCustom'),c({t:'custom'}))+
    row('bw','',t('catBw'),c({t:'bw'}))+row('wt','',t('catWt'),c({t:'wt'}))+row('g','cardio',t('g_cardio'),c({t:'g',v:'cardio'}))+row('str','',t('g_mobility'),c({t:'str'}))+
    '<div class="pk-l">'+t('catEq')+'</div>'+eq.map(g=>row('e',g,t('e_'+g),c({t:'e',v:g}))).join('');
}
function pfLabel(){const f=UI.pf||{};return f.t==='g'?t('g_'+f.v):f.t==='e'?t('e_'+f.v):f.t==='mine'?t('mineB'):f.t==='str'?t('g_mobility'):t({all:'catAll',recent:'catRecent',bw:'catBw',wt:'catWt',custom:'catCustom'}[f.t]||'catAll');}
function pickBar(){
  if(!UI.pickMulti)return'';
  const n=(UI.pickSel||[]).length;
  return'<button id="pickAdd" class="btn pri wide pickadd" onclick="pickCommit()"'+(n?'':' disabled')+'>'+(n?(n===1?t('addN1'):t('addN',n)):t('pickSome'))+'</button>';
}
function drawPick(){
  const sub=UI.pt!=='all'&&UI.pf,x='<button class="ico" onclick="pickCancel()" aria-label="'+esc(t('close'))+'">✕</button>';
  const head=sub?'<div class="pick-h"><button class="ico" onclick="pickBack()" aria-label="'+esc(t('back'))+'">←</button><h3>'+esc(pfLabel())+'</h3><button class="btn sm pk-cx" onclick="customOpen()">＋ '+t('customShort')+'</button>'+x+'</div>':'<div class="pick-h"><h3>'+t('addEx')+'</h3><button class="btn sm pk-cx" onclick="customOpen()">＋ '+t('customShort')+'</button>'+x+'</div>';
  const tabs=sub?'':'<div class="pk-tabs">'+[['all','tabAll'],['mus','tabMus'],['cat','tabCat']].map(a=>'<button class="'+(UI.pt===a[0]?'on':'')+'" onclick="pickTab(\''+a[0]+'\')">'+t(a[1])+'</button>').join('')+'</div>';
  sheet('<div class="pick">'+head+tabs+'<div id="exlist" class="exlist pk-list">'+exListHtml()+'</div><div class="pk-bot">'+pickBar()+
    '<input id="exq" class="in wide pk-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(t('searchEx'))+'" value="'+esc(UI.q)+'" oninput="exSearch(this.value)"></div></div>');
  const el=$('sheet');el.className='pks';$('sheetov').classList.add('pks');
  const xl=$('exlist');if(xl)xl.onscroll=pkScroll;
}
function exSearch(v){UI.q=v;UI.pkN=0;const l=$('exlist');if(l){l.innerHTML=exListHtml();l.scrollTop=0;}}
function pickTab(k){UI.pt=k;UI.pf=null;UI.pkN=0;pickRedraw();}
function pickBack(){UI.pf=null;UI.pkN=0;pickRedraw();}
function pickPick(k,v,fromSearch){
  UI.pkN=0;
  if(k==='all'&&!fromSearch){UI.pt='all';UI.pf=null;}
  else{if(fromSearch)UI.pt='cat';else if(UI.pt==='all')UI.pt=k==='g'?'mus':'cat';UI.pf={t:k,v:v||''};}
  pickRedraw();
}
function pickRedraw(){const q=UI.q;drawPick();const i=$('exq');if(i&&q)i.value=q;}
function pickTap(id){
  if(!UI.pickMulti){pickDone(id);return;}
  const a=UI.pickSel=UI.pickSel||[],k=a.indexOf(id);if(k>=0)a.splice(k,1);else a.push(id);
  document.querySelectorAll('#exlist .exrow[data-id="'+id+'"]').forEach(b=>{const on=a.indexOf(id)>=0;b.classList.toggle('sel',on);const c=b.querySelector('.exck');if(c)c.textContent=on?'✓':'';});
  const p=$('pickAdd');if(p){p.disabled=!a.length;p.textContent=a.length?(a.length===1?t('addN1'):t('addN',a.length)):t('pickSome');}
  buzz(6);
}
function pickCommit(){const cb=UI.pickCb,a=(UI.pickSel||[]).slice();UI.pickCb=null;UI.pickSel=[];sheetClose();if(cb)a.forEach(cb);}
function pickDone(eid){const cb=UI.pickCb;UI.pickCb=null;sheetClose();if(cb)cb(eid);}
function pickCancel(){UI.pickCb=null;sheetClose();if(UI.rb)rbDraw();else if(typeof WKE!=='undefined'&&WKE)wkEditDraw();}
/* custom exercises: create from the picker (name prefilled from the search) or edit/delete one you made / ejercicios propios: crear desde el selector (con el nombre de la búsqueda) o editar/eliminar uno tuyo */
const CX_EQ=['bodyweight','barbell','dumbbell','machine','cable','kettlebell','band','ball','suspension','other'];
function customOpen(id){
  const c=id?DATA.custom.find(x=>x.id===id):null,q=(UI.q||'').trim();
  UI.cxEdit=c?c.id:null;
  const nm=c?c.n:(q?q.charAt(0).toUpperCase()+q.slice(1):'');
  sheet('<div class="form"><h3>'+t(c?'cxEdit':'customEx')+'</h3><label>'+t('name')+'<input id="cxn" class="in wide" type="text" maxlength="60" value="'+esc(nm)+'"></label>'+
    '<label>'+t('group')+'<select id="cxg" class="in wide">'+EX_GROUPS.map(g=>'<option value="'+g+'"'+(c&&c.g===g?' selected':'')+'>'+t('g_'+g)+'</option>').join('')+'</select></label>'+
    '<label>'+t('cxEquip')+'<select id="cxe" class="in wide">'+CX_EQ.map(g=>'<option value="'+g+'"'+(c&&(c.e||'other')===g?' selected':'')+'>'+t('e_'+g)+'</option>').join('')+'</select></label>'+
    '<label>'+t('trackAs')+'<select id="cxm" class="in wide">'+['wr','bw','t'].map(m=>'<option value="'+m+'"'+(c&&(c.m||'wr')===m?' selected':'')+'>'+t('m_'+m)+'</option>').join('')+'</select></label>'+
    '<div class="row"><button class="btn pri" onclick="customSave()">'+t('save')+'</button><button class="btn" onclick="customCancel()">'+t('cancel')+'</button></div>'+
    (c?'<button class="lnk-d" onclick="customDel(\''+c.id+'\')">'+t('cxDel')+'</button>':'')+'</div>');
  if(!c&&!nm)setTimeout(function(){const i=$('cxn');if(i)i.focus();},60);
}
function customCancel(){if(UI.pickCb)drawPick();else sheetClose();}
function customAfter(){if(UI.pickCb)pickRedraw();else{sheetClose();render();}}
function customSave(){
  const n=($('cxn').value||'').trim();if(!n){toast(t('needName'));errField($('cxn'));return;}
  const v={n:n,g:$('cxg').value,e:$('cxe').value,m:$('cxm').value},id=UI.cxEdit;
  if(id){
    const c=DATA.custom.find(x=>x.id===id);if(!c)return;
    Object.assign(c,v);saveData();
    if(typeof _MW!=='undefined')delete _MW[id];
    if(ACT)ACT.ex.forEach(x=>{if(x.eid===id)x.n=n;});
    UI.cxEdit=null;saveAct();toast(t('cxSaved'));customAfter();return;
  }
  const c=Object.assign({id:'c_'+uid()},v);
  DATA.custom.push(c);saveData();
  if(UI.pickMulti&&UI.pickCb&&(UI.pickSel||[]).length){UI.pickSel.push(c.id);pickCommit();return;} // keep what was already ticked / conserva lo ya marcado
  pickDone(c.id);
}
function customDel(id){
  const c=DATA.custom.find(x=>x.id===id);if(!c)return;
  ask(t('cxDelAsk',c.n),t('delete'),function(){
    c.del=1;saveData(); // hidden, not removed: past workouts keep its name and how it is tracked, and sync cannot bring it back / oculto, no borrado
    if(typeof _MW!=='undefined')delete _MW[id];
    toast(t('cxGone'));customAfter();
  },true);
}

/* ---------- routines ---------- */
function saveAsRoutine(){UI.rb={id:null,name:ACT.name||'',ex:ACT.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.length}))};rbDraw();}
/* a routine line keeps the variation, multiplier and bar of the exercise it came from / una línea de rutina conserva la variante, el multiplicador y la barra */
function rbKeep(x,sets){const o={eid:x.eid,n:x.n,sets:sets};if(x.vr)o.vr=x.vr;if(x.mul>1)o.mul=x.mul;if(x.bar>0)o.bar=x.bar;if(x.v===2||x.keep)o.keep=1;return o;}
function saveWkAsRoutine(id){const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;UI.rb={id:null,name:wk.name||'',ex:wk.ex.map(x=>rbKeep(x,x.sets.length))};rbDraw();}
function rbOpen(id){
  if(id){const r=DATA.routines.find(x=>x.id===id);if(!r)return;UI.rb={id:r.id,name:r.name,ex:r.ex.map(x=>rbKeep(x,x.sets))};}
  else UI.rb={id:null,name:'',ex:[]};
  rbDraw();
}
function rbDraw(){
  const r=UI.rb;
  sheet('<div class="form"><h3>'+t(r.id?'editRoutine':'newRoutine')+'</h3><label>'+t('name')+'<input id="rbn" class="in wide" type="text" maxlength="60" value="'+esc(r.name)+'" oninput="UI.rb.name=this.value"></label>'+
    '<div class="lbl">'+t('exercises')+'</div>'+
    (r.ex.length?r.ex.map((x,i)=>'<div class="rbx" data-dcard="1"><b>'+esc(exName(x.eid,x.n))+'</b><span class="rbs"><button class="ico" aria-label="'+esc(t('aDec')+' · '+t('sets'))+'" onclick="rbSets('+i+',-1)">−</button><span>'+t('nSets',x.sets)+'</span><button class="ico" aria-label="'+esc(t('aInc')+' · '+t('sets'))+'" onclick="rbSets('+i+',1)">＋</button></span><span class="pv-grip" role="button" tabindex="0" data-k="rb" data-ei="'+i+'" aria-label="'+esc(t('dragAria'))+'">⠿</span>'+xBtn('rbDel('+i+')',1)+'</div>').join(''):'<p class="muted">'+t('noEx')+'</p>')+
    '<button class="btn wide" onclick="rbAdd()">＋ '+t('addEx')+'</button>'+
    '<div class="row"><button class="btn pri" onclick="rbSave()">'+t('save')+'</button><button class="btn" onclick="UI.rb=null;sheetClose()">'+t('cancel')+'</button>'+(r.id?'<button class="btn danger" onclick="rbRemove()">'+t('delete')+'</button>':'')+'</div></div>');
}
function rbAdd(){pickEx(function(eid){const e=exById(eid);UI.rb.ex.push({eid:eid,n:e?e.en:eid,sets:3});rbDraw();},true);}
function rbSets(i,d){const x=UI.rb.ex[i];x.sets=Math.max(1,Math.min(20,x.sets+d));rbDraw();}
function rbDel(i){UI.rb.ex.splice(i,1);rbDraw();}
function rbSave(){
  const r=UI.rb;if(!r.name.trim()){toast(t('needName'));errField($('rbn'));return;}
  if(!r.ex.length){toast(t('needEx'));return;}
  const o={id:r.id||uid(),name:r.name.trim(),ex:r.ex};
  const k=DATA.routines.findIndex(x=>x.id===o.id);
  if(k>=0)DATA.routines[k]=o;else DATA.routines.push(o);
  saveData();UI.rb=null;sheetClose();toast(t('saved'));render();
}
function rbRemove(){const id=UI.rb.id;ask(t('delRoutine'),t('delete'),function(){UI.rb=null;rtDelDo(id);},true);}
