'use strict';
/* Workout tab: start, log sets, rest timer, finish, routines, exercise picker.
   Pestaña Entrenar: empezar, registrar series, temporizador de descanso, terminar, rutinas, selector de ejercicios. */

/* ---------- exercise lookup ---------- */
let EXMAP=null;
function exMap(){if(!EXMAP){EXMAP={};EXLIB.forEach(a=>{EXMAP[a[0]]={id:a[0],en:a[1],es:a[2],g:a[3],e:a[4],m:a[5]||'wr'};});}return EXMAP;}
function exById(id){const m=exMap();if(m[id])return m[id];const c=DATA.custom.find(x=>x.id===id);return c?{id:c.id,en:c.n,es:c.n,g:c.g,e:c.e||'other',m:c.m||'wr',custom:true}:null;}
function exName(id,fb){const e=exById(id);return e?(LANG==='es'?e.es:e.en):(fb||id);}
function exMode(id){const e=exById(id);return e?e.m:'wr';}
function newSet(){return{w:null,r:null,t:null,d:null,done:false};}

/* ---------- scoring / PR logic ---------- */
function e1rm(w,r){if(!w||!r||r<1)return 0;return r===1?w:w*(1+Math.min(r,30)/30);}
function setScore(m,s){if(s.ty==='w')return 0;if(m==='t')return s.t||0;if(m==='bw')return s.w?e1rm(s.w,s.r):(s.r||0);return e1rm(s.w,s.r);}
function bestScore(eid,m,skip){
  let b=0;
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(x.eid===eid)x.sets.forEach(s=>{b=Math.max(b,setScore(m,s));});}));
  if(ACT)ACT.ex.forEach(x=>{if(x.eid===eid)x.sets.forEach(s=>{if(s.done&&s!==skip)b=Math.max(b,setScore(m,s));});});
  return b;
}
function lastEx(eid,beforeT){
  for(const wk of DATA.workouts){if(beforeT&&wk.t>=beforeT)continue;const x=wk.ex.find(y=>y.eid===eid);if(x&&x.sets.length)return{wk:wk,x:x};}
  return null;
}
function setVol(s){return s.ty==='w'?0:(s.w||0)*(s.r||0);}
/* set type: warm-up (W), drop set (D) or failure (F); tap the set number to change / tipo de serie: calentamiento, drop set o fallo */
const SET_TY=['','w','d','f'];
function cycTy(i,j){const s=ACT.ex[i].sets[j];if(!s)return;const k=(SET_TY.indexOf(s.ty||'')+1)%SET_TY.length;if(SET_TY[k])s.ty=SET_TY[k];else delete s.ty;if(s.ty==='w'){delete s.pr;}saveAct();render();}
function wkVol(wk){let v=0;wk.ex.forEach(x=>x.sets.forEach(s=>{v+=setVol(s);}));return v;}
function wkSets(wk){let n=0;wk.ex.forEach(x=>{n+=x.sets.length;});return n;}
function fmtSet(m,s){
  if(!s)return'—';
  if(m==='t')return(s.t!=null?fmtNum(s.t)+' min':'')+(s.d?(s.t!=null?' · ':'')+dShow(s.d)+' '+dUnit():'');
  if(m==='bw')return(s.w?'+'+wShow(s.w)+' '+wUnit()+' × ':'')+(s.r!=null?s.r:'');
  return wShow(s.w)+' '+wUnit()+' × '+s.r;
}
function fmtPrev(m,s){
  if(!s)return'—';
  if(m==='t')return(s.t!=null?fmtNum(s.t):'')+(s.d?'·'+dShow(s.d):'');
  if(m==='bw')return s.w?'+'+wShow(s.w)+'×'+s.r:String(s.r!=null?s.r:'—');
  return wShow(s.w)+'×'+s.r;
}

/* ---------- start / routines ---------- */
function startWorkout(o){
  if(ACT){toast(t('finishFirst'));return;}
  ACT={id:uid(),t0:Date.now(),name:(o&&o.name)||'',note:'',ex:[]};
  if(o&&o.pl!=null)ACT.pl=o.pl;
  ((o&&o.ex)||[]).forEach(x=>addExTo(x.eid,x.sets,x.n,x.tg));
  saveAct();wake();tab='workout';renderTabs();render();window.scrollTo(0,0);
  if(!o)setTimeout(function(){if(ACT&&!ACT.ex.length)pickEx(null,true);},120);
}
function addExTo(eid,nSets,nm,tg){
  const e=exById(eid),x={eid:eid,n:e?e.en:(nm||eid),sets:Array.from({length:Math.max(1,nSets||1)},()=>newSet())};
  if(tg){x.tg=tg;const sg=sugg(eid,tg);if(sg&&sg.w!=null)x.sg=sg.w;}
  ACT.ex.push(x);
}
function startRoutine(id){const r=DATA.routines.find(x=>x.id===id);if(r)startWorkout({name:r.name,ex:r.ex});}

/* ---------- views ---------- */
function vWorkout(){return ACT?vActive():vStart();}
function needBackup(){
  const n=DATA.workouts.length+DATA.body.length;
  return n>=5&&(Date.now()-(SET.lastExport||0))>30*864e5&&Date.now()>(SET.bkSnooze||0);
}
function weekStrip(){
  const ws=weekStart(Date.now()),td=new Date().getDay(),days=[];
  for(let i=0;i<7;i++){const a=ws+i*864e5,d=new Date(a+432e5);
    days.push({l:d.toLocaleDateString(LANG==='es'?'es':'en',{weekday:'narrow'}).toUpperCase(),on:DATA.workouts.some(w=>w.t>=a&&w.t<a+864e5),today:new Date(a+432e5).toDateString()===new Date().toDateString()});}
  const s=streakInfo(),n=days.filter(d=>d.on).length;
  return'<div class="card wkstrip"><div class="ws-top"><b>'+t('thisWeek')+'</b><span class="muted sm">'+(s.n?ic('bolt')+' '+t(s.n===1?'stOne':'stN',s.n):t('wsCount',n,s.tg))+'</span></div><div class="ws-days">'+days.map(d=>'<div class="ws-d'+(d.on?' on':'')+(d.today?' td':'')+'"><span>'+d.l+'</span><i>'+(d.on?ic('check'):'')+'</i></div>').join('')+'</div></div>';
}
function mobCard(){
  return'<div class="card mobc"><button class="mobc-b" onclick="go(\'stretch\')"><span class="li">'+ic('yoga')+'</span><span class="lt2"><b>'+t('mobToday')+'</b><small>'+t('mobQuick')+'</small></span><span class="lc">›</span></button><div class="row"><button class="btn pri" onclick="mobGo(10)">'+ic('yoga')+' '+t('mobGo10')+'</button><button class="btn" onclick="mobGo(5)">'+t('mobGo5')+'</button></div></div>';
}
function mobGo(m){STX.type=m===5?'warm':'full';STX.min=m;strSessGo(0);}
function hero0(){
  return'<div class="card hero"><span class="hero-e">'+t('hiWelcome')+'</span><h2>'+t('pkPlanT')+'</h2><p>'+t('pkPlanP')+'</p><button class="btn pri big wide" onclick="planSetup()">'+t('planMake')+'</button></div>';
}
function exploreList(){
  const r=(i,tt,pp,fn)=>'<button class="lrow" onclick="'+fn+'"><span class="li">'+ic(i)+'</span><span class="lt2"><b>'+t(tt)+'</b><small>'+t(pp)+'</small></span><span class="lc">›</span></button>';
  return'<div class="sec"><h2>'+t('exploreT')+'</h2></div><div class="lgrp">'+
    r('barbell','pkMusT','pkMusP',"libGo('focus')")+r('arrows-shuffle','pkSpT','pkSpP',"libGo('split')")+r('trophy','pkPrT','pkPrP',"libGo('prog')")+r('stopwatch','pkChT','pkChP',"libGo('ch')")+'</div>';
}
/* start again with the same exercises and set counts as your last workout / empezar otra vez con los mismos ejercicios y series del último entrenamiento */
function repeatLast(){const w=DATA.workouts.find(x=>x.ex&&x.ex.length&&wkSets(x)>0);if(!w)return;startWorkout({name:w.name||'',ex:w.ex.map(x=>({eid:x.eid,sets:Math.max(1,x.sets.length),n:x.n}))});}
function vStart(){
  let h='';
  if(needBackup())h+='<div class="card warn"><b>'+t('bkT')+'</b><p>'+t('bkP')+'</p><div class="row"><button class="btn pri sm" onclick="exportJSON()">'+t('exportBackup')+'</button><button class="btn sm" onclick="bkLater()">'+t('later')+'</button></div></div>';
  if(typeof inApp==='function'&&inApp())h+='<div class="card warn"><b>'+t('inappT')+'</b><p>'+t(isIOS()?'inappIos':'inappAnd')+'</p><div class="row"><button class="btn sm" onclick="installApp()">'+t('inappBtn')+'</button></div></div>';
  h+=wkSumCard();
  h+=(DATA.plan?planCard():hero0())+recCta();
  const lw0=DATA.workouts.find(w=>w.ex&&w.ex.length&&wkSets(w)>0);
  if(lw0)h+='<button class="btn wide" onclick="repeatLast()">↺ '+t('repLast')+(lw0.name?' · '+esc(lw0.name):'')+'</button>';
  h+='<button class="btn wide emptyb" onclick="startWorkout()">'+ic('pencil')+' '+t('pkOwnT')+'</button>';
  h+=mobCard();
  if(DATA.workouts.length)h+=weekStrip();
  h+='<div class="sec"><h2>'+t('routines')+'</h2><button class="btn sm" onclick="rbOpen()">＋ '+t('newRoutine')+'</button></div>';
  if(!DATA.routines.length)h+='<div class="card tip"><p class="muted">'+t('noRoutines')+'</p></div>';
  else h+=DATA.routines.map(r=>'<div class="swp"><div class="swp-h swp-hl">'+t('swDelete')+'</div><div class="swp-h swp-hr">'+t('swEdit')+'</div><div class="card rt swp-in" data-l="rtDelAsk" data-r="rtEdit" data-a="'+r.id+'">'+rtThumb(r)+'<div class="rt-main"><b>'+esc(r.name)+'</b><div class="muted sm">'+r.ex.slice(0,4).map(x=>esc(exName(x.eid,x.n))).join(' · ')+(r.ex.length>4?' …':'')+'</div></div><div class="rt-b"><button class="btn pri sm" onclick="startRoutine(\''+r.id+'\')">'+t('start')+'</button><button class="btn sm" onclick="rbOpen(\''+r.id+'\')">'+t('edit')+'</button></div></div></div>').join('');
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
  return (actStart()?'<span id="elapsed"'+(ACT.pz?' class="paused"':'')+'>'+fmtClock(actMs()/1000)+'</span><button class="clkb" onclick="pauseClock()" aria-label="'+esc(t(ACT.pz?'clkResume':'clkPause'))+'">'+(ACT.pz?'▶':'❚❚')+'</button>':'<button class="lnk-d" onclick="startClock()">▶ '+t('startClk')+'</button>')+' · '+t('setsDone',a.done,a.tot)+(a.vol?' · '+wShow(a.vol)+' '+wUnit():'');
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
  h+='<button class="btn wide" onclick="pickEx(null,true)">＋ '+t('addEx')+'</button>';
  h+='<button class="lnk-d" onclick="cancelAsk()">'+t('cancelWk')+'</button>';
  h+='<textarea class="note-in" rows="2" maxlength="500" placeholder="'+esc(t('wkNotePh'))+'" oninput="ACT.note=this.value;saveAct()">'+esc(ACT.note)+'</textarea>';
  if(ACT.ex.length)h+='<button class="btn wide" onclick="saveAsRoutine()">'+t('saveRoutine')+'</button>';
  return h;
}
/* first tip of the how-to as a one-line cue / primer consejo de la guía como pista de una línea */
function cueOf(eid){const s=HOWTO&&HOWTO[eid];if(!s)return'';const st=(s[LANG==='es'?1:0]||'').split('|')[0]||'';return st.length>90?st.slice(0,87)+'…':st;}
/* fill the empty sets with what you did last time, in one tap / llena las series vacías con lo de la última vez, en un toque */
function fillLast(i){
  const x=ACT.ex[i],le=lastEx(x.eid);if(!le)return;const ps=le.x.sets,m=exMode(x.eid);
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
function exCard(i,x){
  const m=exMode(x.eid),le=lastEx(x.eid),pv=le?le.x.sets:[];
  const cue=cueOf(x.eid),dm=(typeof EXPHOTO!=='undefined'&&EXPHOTO.has(x.eid))?'<button class="exdm" onclick="howOpen(\''+x.eid+'\')" aria-label="'+esc(t('guideB'))+'"><img src="img/ex/'+x.eid+'-0.jpg" alt=""><img class="b" src="img/ex/'+x.eid+'-1.jpg" alt="" onerror="this.remove()"></button>':'';
  let h='<section class="exc" id="exc'+i+'"><div class="exh">'+dm+'<span class="exh-t"><b>'+esc(exName(x.eid,x.n))+'</b>'+(cue?'<small class="cue">'+esc(cue)+'</small>':'')+'</span><button class="exmore" onclick="exMenu('+i+')" aria-label="'+esc(t('options'))+'">⋯</button></div>';
  h+=suggLine(x);
  if(i===0&&DATA.workouts.length<4)h+='<p class="muted sm">'+t('tyHint')+'</p>';
  h+='<div class="exsub muted sm"><span>'+(le?t('lastTime',dFmt(le.wk.t,{month:'short',day:'numeric'}),esc(le.x.sets.map(s=>fmtPrev(m,s)).join('  '))):t('firstTime'))+'</span>'+(le&&x.sets.some(s=>!s.done)?'<button class="lnk-d" onclick="fillLast('+i+')">↺ '+t('flBtn')+'</button>':'')+'<button class="lnk-d" onclick="restPick('+i+')">⏱ '+(exRest(x)===0?t('restOff'):fmtClock(exRest(x)!=null?exRest(x):(SET.rest||90)))+'</button></div>';
  const c1=m==='t'?t('colMin'):(m==='bw'?'+'+wUnit().toUpperCase():wUnit().toUpperCase()),c2=m==='t'?dUnit().toUpperCase():t('colReps');
  h+='<div class="srow hd"><span>'+t('colSet')+'</span><span>'+c1+'</span><span>'+c2+'</span></div>';
  x.sets.forEach((s,j)=>{
    const ph=pv[j]||(pv.length?pv[pv.length-1]:null)||(j>0?x.sets[j-1]:null);
    let f1,f2,p1,p2,k1,k2;
    if(m==='t'){k1='t';k2='d';f1=s.t!=null?fmtNum(s.t):'';f2=dShow(s.d);p1=ph&&ph.t!=null?fmtNum(ph.t):'';p2=ph&&ph.d?dShow(ph.d):'';}
    else{k1='w';k2='r';f1=wShow(s.w);f2=s.r!=null?String(s.r):'';p1=ph&&ph.w!=null?wShow(ph.w):(m==='bw'?'0':'');p2=ph&&ph.r!=null?String(ph.r):'';if(m==='wr'&&x.sg!=null)p1=wShow(x.sg);}
    const inp0=(k,v,p,mode)=>'<input class="in'+(s.done?' dn':'')+'" type="text" inputmode="'+mode+'" autocomplete="off" enterkeyhint="next" data-i="'+i+'" data-j="'+j+'" data-k="'+k+'" onfocus="this.select()" value="'+esc(v)+'" placeholder="'+esc(p)+'" oninput="sv('+i+','+j+',\''+k+'\',this.value)">';
    const stb=(k,d)=>'<button class="stp" tabindex="-1" aria-label="'+(d<0?'−':'+')+'" onclick="stepSet('+i+','+j+',\''+k+'\','+d+')">'+(d<0?'−':'+')+'</button>';
    const inp=inp0;
    h+='<div class="srow'+(s.done?' done':'')+'"><button class="sn tyb'+(s.ty?' ty-'+s.ty:'')+'" aria-label="'+esc(t('tyAria'))+'" onclick="cycTy('+i+','+j+')">'+(s.ty?s.ty.toUpperCase():(j+1))+(s.pr?'<i class="pr" title="PR">'+ic('trophy')+'</i>':'')+'</button>'+inp(k1,f1,p1,'decimal')+inp(k2,f2,p2,k2==='r'?'numeric':'decimal')+'</div>';
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
  if(v!==''){
    if(f==='w')n=wParse(v);else if(f==='d')n=dParse(v);
    else if(f==='r'){n=parseInt(v,10);if(!(n>=0))n=null;}
    else n=numParse(v);
  }
  s[f]=n;
  if(n==null&&s.done){s.done=false;delete s.pr;const r=document.querySelectorAll('#exc'+i+' .srow:not(.hd)')[j];if(r){r.classList.remove('done');r.querySelectorAll('.in').forEach(q=>q.classList.remove('dn'));}}
  saveAct();updTop();
}
/* no check button: a set saves itself when you leave it with weight and reps filled in, and turns green / sin botón de confirmar: la serie se guarda sola al salir de ella con peso y repeticiones, y se pone verde */
function autoDone(i,j){
  const x=ACT&&ACT.ex[i],s=x&&x.sets[j];if(!s||s.done)return false;
  const m=exMode(x.eid),has=m==='t'?(s.t!=null&&s.t>0):(m==='bw'?(s.r!=null&&s.r>0):(s.w!=null&&s.r!=null&&s.r>0));
  if(!has)return false;tgSet(i,j);return true;
}
document.addEventListener('focusout',function(ev){
  const el=ev.target,rt=ev.relatedTarget;
  if(!el||!el.classList||!el.classList.contains('in')||el.dataset.i==null)return;
  if(rt&&rt.dataset&&rt.dataset.i===el.dataset.i&&rt.dataset.j===el.dataset.j)return; // moving inside the same set
  const i=+el.dataset.i,j=+el.dataset.j;
  if(!autoDone(i,j))return;
  if(rt&&rt.dataset&&rt.dataset.i!=null){const n=document.querySelector('#exc'+rt.dataset.i+' .in[data-j="'+rt.dataset.j+'"][data-k="'+rt.dataset.k+'"]');if(n&&n!==rt)n.focus();}
});
function stepSet(i,j,f,d){
  const x=ACT.ex[i],s=x.sets[j],m=exMode(x.eid);if(m==='t')return;
  const pv=lastEx(x.eid),ps=pv?pv.x.sets:[],ph=ps[j]||(ps.length?ps[ps.length-1]:null)||(j>0?x.sets[j-1]:null);
  if(f==='w'){
    let b=s.w;if(b==null)b=(m==='wr'&&x.sg!=null)?x.sg:(ph&&ph.w!=null?ph.w:0);
    const st=wInc();s.w=Math.max(0,Math.round((b+d*st)/st)*st);
  }else{
    let b=s.r;if(b==null)b=ph&&ph.r!=null?ph.r:(x.tg&&x.tg.u==='r'?x.tg.lo:0);
    s.r=Math.max(0,Math.min(999,b+d));
  }
  saveAct();exRedraw(i);buzz(6);
}
/* a new set starts as a copy of the last one: log it with one tap / una serie nueva copia la anterior: se registra con un toque */
function addSet(i){const x=ACT.ex[i],l=x.sets[x.sets.length-1],n=newSet();if(l){n.w=l.w;n.r=l.r;n.t=l.t;n.d=l.d;}x.sets.push(n);saveAct();exRedraw(i);}
/* Enter/Next walks weight → reps → done → next set, keyboard stays open / Enter/Siguiente: peso → reps → listo → siguiente serie sin cerrar el teclado */
document.addEventListener('keydown',function(ev){
  const el=ev.target;if(ev.key!=='Enter'||!el||!el.classList||!el.classList.contains('in')||el.dataset.i==null)return;
  ev.preventDefault();
  const i=+el.dataset.i,j=+el.dataset.j,card=document.getElementById('exc'+i);if(!card)return;
  const ins=[].slice.call(card.querySelectorAll('.srow .in[data-i]')),k=ins.indexOf(el);
  if(k>=0&&k%2===0&&ins[k+1]){ins[k+1].focus();return;}
  if(ACT&&ACT.ex[i]&&ACT.ex[i].sets[j]&&!ACT.ex[i].sets[j].done){
    sv(i,j,el.dataset.k,el.value);
    tgSet(i,j);
    setTimeout(function(){const c=document.getElementById('exc'+i),n=c&&c.querySelector('.srow:not(.done):not(.hd) .in[data-i]');if(n)n.focus();else if(document.activeElement)document.activeElement.blur();},60);
  }else if(ins[k+1])ins[k+1].focus();
});
function tgSet(i,j){
  const x=ACT.ex[i],s=x.sets[j],m=exMode(x.eid);
  unlockAudio();
  if(!s.done){
    const pv=lastEx(x.eid),ps=pv?pv.x.sets:[],ph=ps[j]||(ps.length?ps[ps.length-1]:null)||(j>0?x.sets[j-1]:null);
    if(m==='wr'&&s.w==null&&x.sg!=null)s.w=x.sg;
    if(ph){
      if(m==='t'){if(s.t==null&&ph.t!=null)s.t=ph.t;if(s.d==null&&ph.d)s.d=ph.d;}
      else{if(s.w==null&&ph.w!=null&&m!=='bw')s.w=ph.w;if(s.w==null&&m==='bw'&&ph.w)s.w=ph.w;if(s.r==null&&ph.r!=null)s.r=ph.r;}
    }
    const ok=m==='t'?(s.t!=null&&s.t>0):(m==='bw'?(s.r!=null&&s.r>0):(s.w!=null&&s.r!=null&&s.r>0));
    if(!ok){toast(t(m==='t'?'needTime':(m==='bw'?'needReps':'needWR')));return;}
    const prev=bestScore(x.eid,m,s),sc=setScore(m,s);
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
function undoRun(){
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
  sheet('<h3>'+esc(exName(x.eid,x.n))+'</h3><div class="menu">'+
    '<button onclick="swapOpen('+i+')">↔ '+t('swapB')+'</button><button onclick="howOpen(\''+x.eid+'\')">ⓘ '+t('guideB')+'</button>'+
    (i>0?'<button onclick="exMove('+i+',-1)">↑ '+t('moveUp')+'</button>':'')+
    (i<ACT.ex.length-1?'<button onclick="exMove('+i+',1)">↓ '+t('moveDown')+'</button>':'')+
    '<button onclick="tasteLike(\''+x.eid+'\');exMenu('+i+')">'+ic('heart')+' '+t(tasteOf(x.eid)==='lk'?'tkLiked':'tkLike')+'</button><button onclick="tasteDis(\'act\','+i+')">'+ic('ban')+' '+t('tkDis')+'</button>'+
    '<button onclick="restPick('+i+')">⏱ '+t('restEx')+'</button><button onclick="rmSet('+i+')">− '+t('rmLastSet')+'</button><button class="danger" onclick="rmEx('+i+')">✕ '+t('rmEx')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
}
function exMove(i,d){const a=ACT.ex,j=i+d;if(j<0||j>=a.length)return;const x=a[i];a[i]=a[j];a[j]=x;saveAct();sheetClose();render();}
function rmSet(i){const snap=JSON.stringify(ACT),s=ACT.ex[i].sets;if(s.length>1)s.pop();saveAct();sheetClose();render();undoToast(t('rmDone'),snap);}
function rmEx(i){const snap=JSON.stringify(ACT);ACT.ex.splice(i,1);saveAct();sheetClose();render();undoToast(t('rmDone'),snap);}

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
  const ex=ACT.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.filter(s=>s.done).map(s=>{const o={w:s.w,r:s.r,t:s.t,d:s.d};if(s.pr)o.pr=1;if(s.ty)o.ty=s.ty;return o;})})).filter(x=>x.sets.length);
  const t0=actStart()||ACT.t0,dur=actStart()?actMs():end-t0,wk={id:ACT.id,t:t0,end:t0+dur,name:(ACT.name||'').trim()||autoName(t0),note:(ACT.note||'').trim(),ex:ex};
  if(ACT.pl!=null){wk.pl=ACT.pl;if(DATA.plan)DATA.plan.cur=(ACT.pl+1)%DATA.plan.n;}
  DATA.workouts.push(wk);DATA.workouts.sort((a,b)=>b.t-a.t);
  goalsCheck();
  saveData();
  ACT=null;saveAct();stopRest();unwake();
  render();
  const prs=[];wk.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr&&prs.indexOf(x.eid)<0)prs.push(x.eid);}));
  sheet('<div class="sum"><div class="sum-e">🎉</div><h3>'+t('wkSaved')+'</h3><p class="cheer">'+wkCheer(wk,prs)+'</p><p class="muted">'+esc(wk.name)+'</p>'+
    '<div class="stats"><div><b>'+fmtDur((end-wk.t)/1000)+'</b><span>'+t('duration')+'</span></div><div><b>'+wkSets(wk)+'</b><span>'+t('sets')+'</span></div><div><b>'+wShow(wkVol(wk))+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>'+
    (prs.length?'<p class="prs">'+ic('trophy')+' '+t('prsT')+': '+prs.map(e=>esc(exName(e))).join(', ')+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="sumDone()">'+t('done')+'</button><button class="btn" onclick="saveWkAsRoutine(\''+wk.id+'\')">'+t('saveRoutineS')+'</button><button class="btn" onclick="wkPic(\''+wk.id+'\')">'+ic('share')+' '+t('cdBtn')+'</button></div></div>');
}
/* one-time feedback pop up: after the first routine/plan AND the first logged set / pop up de feedback una sola vez */
function fbDue(){return !SET.fbAsked&&DATA.workouts.some(w=>wkSets(w)>0)&&!!(DATA.plan||DATA.routines.length||DATA.workouts.some(w=>w.pl!=null));}
function sumDone(){
  sheetClose();
  if(fbDue())setTimeout(fbShow,400);
}
function fbShow(){
  SET.fbAsked=1;saveSet();
  sheet('<div class="sum"><div class="sum-e">💬</div><h3>'+t('fbPopT')+'</h3><p class="muted">'+t('fbPopP')+'</p>'+
    '<div class="row"><a class="btn pri" href="https://tally.so/r/KpY5MA" target="_blank" rel="noopener" onclick="sheetClose()">'+t('fbPopYes')+'</a><button class="btn" onclick="sheetClose()">'+t('fbPopNo')+'</button></div></div>');
}
function cancelAsk(){ask(t('cancelAsk'),t('discard'),cancelWk,true);}
function cancelWk(){ACT=null;saveAct();stopRest();unwake();render();}

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
function startRest(sec){
  if(!SET.auto)return;
  if(sec===0){return;} // supersets: straight to the next exercise / supersets: directo al siguiente ejercicio
  sec=sec||SET.rest||90;
  REST={end:Date.now()+sec*1000,tot:sec,done:false};restBuilt=false;
  drawRest();if(!restTick)restTick=setInterval(drawRest,250);
}
function drawRest(){
  const b=$('restbar');if(!b)return;
  if(!REST){b.hidden=true;return;}
  if(!restBuilt){
    b.innerHTML='<div class="rb-bar"><div id="restF"></div></div><div class="rb-row"><span class="rb-l">'+t('rest')+'</span><b id="restT"></b><span class="rb-sp"></span><button class="btn sm" id="restP" onclick="restPause()" aria-label="'+esc(t('clkPause'))+'">❚❚</button><button class="btn sm" onclick="restAdd(-15)">−15</button><button class="btn sm" onclick="restAdd(15)">+15</button><button class="btn sm pri" onclick="stopRest()">'+t('skip')+'</button></div>';
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
function stopRest(){REST=null;restBuilt=false;if(restTick){clearInterval(restTick);restTick=null;}const b=$('restbar');if(b){b.hidden=true;b.innerHTML='';}}

/* ---------- keep screen awake during a workout ---------- */
let WL=null;
async function wake(){try{if(ACT&&'wakeLock' in navigator&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null;});}}catch(e){WL=null;}}
function unwake(){try{if(WL)WL.release();}catch(e){}WL=null;}

/* ---------- exercise picker ---------- */
function pickEx(cb,multi){UI.q='';UI.pt='all';UI.pf=null;UI.pickSel=[];UI.pickMulti=!!multi;UI.pickCb=cb||function(eid){addExTo(eid,1);saveAct();render();};drawPick();}
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
function exThumb(id){return typeof EXPHOTO!=='undefined'&&EXPHOTO.has(id)?'<span class="ex-th" style="background-image:url(img/ex/'+id+'-0.jpg)"></span>':'<span class="ex-th ex-no">'+ic('barbell')+'</span>';}
function exRow(e,srch){const on=UI.pickMulti&&(UI.pickSel||[]).indexOf(e.id)>=0,al=LANG==='es'?e.en:e.es,nm=LANG==='es'?e.es:e.en,sub=srch&&al&&norm(al)!==norm(nm)?t('alsoCalled',al):t('g_'+e.g)+' · '+t('e_'+e.e)+(e.custom?' · '+t('custom'):'')+injBadge(e.id);return'<button class="exrow exth'+(on?' sel':'')+'" data-id="'+e.id+'" onclick="pickTap(\''+e.id+'\')">'+exThumb(e.id)+'<span class="ex-tx"><b>'+esc(nm)+'</b><small>'+esc(sub)+'</small></span>'+(UI.pickMulti?'<i class="exck">'+(on?'✓':'')+'</i>':'')+'</button>';}
/* same exercise imported twice (Pull-Up / Pullups): show it once / el mismo ejercicio importado dos veces: se muestra una vez */
function exKey(e){return norm(e.en).replace(/[^a-z0-9 ]/g,'').split(' ').map(w=>w.replace(/(ups|up)$/,'up').replace(/s$/,'')).join('')+'|'+e.g;}
function pickPool(){
  const seen={},out=[];
  EXLIB.map(a=>exById(a[0])).sort((a,b)=>(/^z_/.test(a.id)?1:0)-(/^z_/.test(b.id)?1:0)).forEach(e=>{if(!e)return;const k=exKey(e);if(seen[k])return;seen[k]=1;out.push(e);});
  return out.concat(DATA.custom.map(c=>exById(c.id)));
}
function exRank(e,tok){
  const nm=norm(LANG==='es'?e.es:e.en),other=norm(LANG==='es'?e.en:e.es),ws=nm.split(' ');let sc=0;
  for(const q of tok){
    if(nm===q)sc+=0;else if(nm.indexOf(q)===0)sc+=1;else if(ws.some(w=>w.indexOf(q)===0))sc+=2;else if(nm.indexOf(q)>=0)sc+=4;
    else if(other.indexOf(q)>=0)sc+=6;
    else{const meta=norm(t('g_'+e.g)+' '+t('e_'+e.e));if(meta.indexOf(q)>=0)sc+=8;else return -1;}
  }
  return sc*100+nm.length;
}
function exListHtml(){
  const q=norm(UI.q.trim()),tok=q?q.split(' ').filter(Boolean):[];
  if(!tok.length&&UI.pt!=='all'&&!UI.pf)return pickMenu();
  const f=pickFx(),pool=pickPoolF(f),nmf=e=>norm(LANG==='es'?e.es:e.en);
  let list,h='',last='';
  if(tok.length)list=pool.map(e=>({e:e,r:exRank(e,tok)})).filter(x=>x.r>=0).sort((a,b)=>a.r-b.r).map(x=>x.e);
  else if(f.t==='mine'||f.t==='recent'){const ids=f.t==='mine'?mineIds():recentIds();list=pool.slice().sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));}
  else list=pool.slice().sort((a,b)=>nmf(a).localeCompare(nmf(b)));
  const letters=!tok.length&&f.t!=='mine'&&f.t!=='recent';
  list.forEach(e=>{
    if(letters){const c=(nmf(e).charAt(0)||'#').toUpperCase(),L=/[A-Z]/.test(c)?c:'#';if(L!==last){last=L;h+='<div class="pk-l">'+L+'</div>';}}
    h+=exRow(e,tok.length>0);
  });
  let sn=0;
  if(tok.length&&f.t==='all'){sn=pickPoolF({t:'str'}).filter(e=>exRank(e,tok)>=0).length;if(sn)h+='<button class="pk-more" onclick="pickPick(\'str\',\'\',1)">'+t('seeStr',sn)+'</button>';}
  if(!list.length&&!sn)h+='<p class="muted pk-none">'+t('noMatch')+'</p>';
  return h+'<button class="pk-more pk-own" onclick="customOpen()">＋ '+t('customEx')+'</button>';
}
/* which exercises a view shows: stretches & mobility only when asked for / qué ejercicios muestra cada vista: estiramientos solo si se piden */
function pickFx(){return UI.pt==='all'||!UI.pf?{t:'all'}:UI.pf;}
function pickPoolF(f){
  const P=pickPool().filter(Boolean),nm=e=>e.g!=='mobility';
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
  const row=(k,v,label,n)=>'<button class="pk-m" onclick="pickPick(\''+k+'\',\''+v+'\')"><b>'+esc(label)+'</b><small>'+n+'</small><i>›</i></button>',c=f=>pickPoolF(f).length;
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
  const head=sub?'<div class="pick-h"><button class="ico" onclick="pickBack()" aria-label="'+esc(t('back'))+'">←</button><h3>'+esc(pfLabel())+'</h3>'+x+'</div>':'<div class="pick-h"><h3>'+t('addEx')+'</h3>'+x+'</div>';
  const tabs=sub?'':'<div class="pk-tabs">'+[['all','tabAll'],['mus','tabMus'],['cat','tabCat']].map(a=>'<button class="'+(UI.pt===a[0]?'on':'')+'" onclick="pickTab(\''+a[0]+'\')">'+t(a[1])+'</button>').join('')+'</div>';
  sheet('<div class="pick">'+head+tabs+'<div id="exlist" class="exlist pk-list">'+exListHtml()+'</div><div class="pk-bot">'+pickBar()+
    '<input id="exq" class="in wide pk-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(t('searchEx'))+'" value="'+esc(UI.q)+'" oninput="exSearch(this.value)"></div></div>');
  const el=$('sheet');el.className='pks';$('sheetov').classList.add('pks');
}
function exSearch(v){UI.q=v;const l=$('exlist');if(l){l.innerHTML=exListHtml();l.scrollTop=0;}}
function pickTab(k){UI.pt=k;UI.pf=null;pickRedraw();}
function pickBack(){UI.pf=null;pickRedraw();}
function pickPick(k,v,fromSearch){
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
function pickCancel(){UI.pickCb=null;sheetClose();if(UI.rb)rbDraw();}
function customOpen(){
  sheet('<div class="form"><h3>'+t('customEx')+'</h3><label>'+t('name')+'<input id="cxn" class="in wide" type="text" maxlength="60"></label>'+
    '<label>'+t('group')+'<select id="cxg" class="in wide">'+EX_GROUPS.map(g=>'<option value="'+g+'">'+t('g_'+g)+'</option>').join('')+'</select></label>'+
    '<label>'+t('trackAs')+'<select id="cxm" class="in wide"><option value="wr">'+t('m_wr')+'</option><option value="bw">'+t('m_bw')+'</option><option value="t">'+t('m_t')+'</option></select></label>'+
    '<div class="row"><button class="btn pri" onclick="customSave()">'+t('save')+'</button><button class="btn" onclick="drawPick()">'+t('cancel')+'</button></div></div>');
}
function customSave(){
  const n=($('cxn').value||'').trim();if(!n){toast(t('needName'));return;}
  const c={id:'c_'+uid(),n:n,g:$('cxg').value,e:'other',m:$('cxm').value};
  DATA.custom.push(c);saveData();
  pickDone(c.id);
}

/* ---------- routines ---------- */
function saveAsRoutine(){UI.rb={id:null,name:ACT.name||'',ex:ACT.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.length}))};rbDraw();}
function saveWkAsRoutine(id){const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;UI.rb={id:null,name:wk.name||'',ex:wk.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.length}))};rbDraw();}
function rbOpen(id){
  if(id){const r=DATA.routines.find(x=>x.id===id);if(!r)return;UI.rb={id:r.id,name:r.name,ex:r.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets}))};}
  else UI.rb={id:null,name:'',ex:[]};
  rbDraw();
}
function rbDraw(){
  const r=UI.rb;
  sheet('<div class="form"><h3>'+t(r.id?'editRoutine':'newRoutine')+'</h3><label>'+t('name')+'<input class="in wide" type="text" maxlength="60" value="'+esc(r.name)+'" oninput="UI.rb.name=this.value"></label>'+
    '<div class="lbl">'+t('exercises')+'</div>'+
    (r.ex.length?r.ex.map((x,i)=>'<div class="rbx"><b>'+esc(exName(x.eid,x.n))+'</b><span class="rbs"><button class="ico" onclick="rbSets('+i+',-1)">−</button><span>'+t('nSets',x.sets)+'</span><button class="ico" onclick="rbSets('+i+',1)">＋</button></span><button class="ico" onclick="rbMove('+i+',-1)" aria-label="'+esc(t('moveUp'))+'"'+(i<1?' disabled':'')+'>↑</button><button class="ico" onclick="rbMove('+i+',1)" aria-label="'+esc(t('moveDn'))+'"'+(i>=r.ex.length-1?' disabled':'')+'>↓</button><button class="ico" onclick="rbDel('+i+')" aria-label="'+esc(t('rmEx'))+'">✕</button></div>').join(''):'<p class="muted">'+t('noEx')+'</p>')+
    '<button class="btn wide" onclick="rbAdd()">＋ '+t('addEx')+'</button>'+
    '<div class="row"><button class="btn pri" onclick="rbSave()">'+t('save')+'</button><button class="btn" onclick="UI.rb=null;sheetClose()">'+t('cancel')+'</button>'+(r.id?'<button class="btn danger" onclick="rbRemove()">'+t('delete')+'</button>':'')+'</div></div>');
}
function rbAdd(){pickEx(function(eid){const e=exById(eid);UI.rb.ex.push({eid:eid,n:e?e.en:eid,sets:3});rbDraw();},true);}
function rbSets(i,d){const x=UI.rb.ex[i];x.sets=Math.max(1,Math.min(20,x.sets+d));rbDraw();}
function rbMove(i,d){const a=UI.rb.ex,j=i+d;if(j<0||j>=a.length)return;const x=a[i];a[i]=a[j];a[j]=x;rbDraw();}
function rbDel(i){UI.rb.ex.splice(i,1);rbDraw();}
function rbSave(){
  const r=UI.rb;if(!r.name.trim()){toast(t('needName'));return;}
  if(!r.ex.length){toast(t('needEx'));return;}
  const o={id:r.id||uid(),name:r.name.trim(),ex:r.ex};
  const k=DATA.routines.findIndex(x=>x.id===o.id);
  if(k>=0)DATA.routines[k]=o;else DATA.routines.push(o);
  saveData();UI.rb=null;sheetClose();toast(t('saved'));render();
}
function rbRemove(){const id=UI.rb.id;ask(t('delRoutine'),t('delete'),function(){DATA.routines=DATA.routines.filter(x=>x.id!==id);clTomb(id);UI.rb=null;saveData();render();},true);}
