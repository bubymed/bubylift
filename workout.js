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
function setScore(m,s){if(m==='t')return s.t||0;if(m==='bw')return s.w?e1rm(s.w,s.r):(s.r||0);return e1rm(s.w,s.r);}
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
function setVol(s){return(s.w||0)*(s.r||0);}
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
function vStart(){
  let h='';
  if(needBackup())h+='<div class="card warn"><b>'+t('bkT')+'</b><p>'+t('bkP')+'</p><div class="row"><button class="btn pri sm" onclick="exportJSON()">'+t('exportBackup')+'</button><button class="btn sm" onclick="bkLater()">'+t('later')+'</button></div></div>';
  h+=planCard();
  h+='<button class="btn pri big wide" onclick="startWorkout()">＋ '+t('startEmpty')+'</button>';
  h+='<div class="sec"><h2>'+t('routines')+'</h2><button class="btn sm" onclick="rbOpen()">＋ '+t('newRoutine')+'</button></div>';
  if(!DATA.routines.length)h+='<p class="muted">'+t('noRoutines')+'</p>';
  else h+=DATA.routines.map(r=>'<div class="swp"><div class="swp-h swp-hl">'+t('swDelete')+'</div><div class="swp-h swp-hr">'+t('swEdit')+'</div><div class="card rt swp-in" data-l="rtDelAsk" data-r="rtEdit" data-a="'+r.id+'"><div class="rt-main"><b>'+esc(r.name)+'</b><div class="muted sm">'+r.ex.slice(0,4).map(x=>esc(exName(x.eid,x.n))).join(' · ')+(r.ex.length>4?' …':'')+'</div></div><div class="rt-b"><button class="btn pri sm" onclick="startRoutine(\''+r.id+'\')">'+t('start')+'</button><button class="btn sm" onclick="rbOpen(\''+r.id+'\')">'+t('edit')+'</button></div></div></div>').join('');
  const lw=DATA.workouts[0];
  if(lw)h+='<div class="sec"><h2>'+t('lastWorkout')+'</h2></div>'+wkCard(lw);
  else h+='<div class="card tip"><b>'+t('welcomeT')+'</b><p>'+t('welcomeP')+'</p></div>';
  return h;
}
function bkLater(){SET.bkSnooze=Date.now()+14*864e5;saveSet();render();}

function actTotals(){
  let done=0,tot=0,vol=0;
  ACT.ex.forEach(x=>x.sets.forEach(s=>{tot++;if(s.done){done++;vol+=setVol(s);}}));
  return{done:done,tot:tot,vol:vol};
}
function statsLine(){
  const a=actTotals();
  return '<span id="elapsed">'+fmtClock((Date.now()-ACT.t0)/1000)+'</span> · '+t('setsDone',a.done,a.tot)+(a.vol?' · '+wShow(a.vol)+' '+wUnit():'');
}
function tickElapsed(){
  if(!ACT)return;
  const e=$('elapsed');if(e)e.textContent=fmtClock((Date.now()-ACT.t0)/1000);
}
function updTop(){const e=$('wkstats');if(e)e.innerHTML=statsLine();}

function vActive(){
  let h='<div class="wk-head"><input id="wkName" class="wkname" type="text" maxlength="60" placeholder="'+esc(t('wkNamePh'))+'" value="'+esc(ACT.name)+'" oninput="ACT.name=this.value;saveAct()">'+
    '<div class="muted" id="wkstats">'+statsLine()+'</div>'+
    '<div class="row"><button class="btn pri" onclick="finishAsk()">'+t('finish')+'</button><button class="btn" onclick="cancelAsk()">'+t('cancelWk')+'</button></div></div>';
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
  h+='<button class="btn wide" onclick="pickEx()">＋ '+t('addEx')+'</button>';
  h+='<textarea class="note-in" rows="2" maxlength="500" placeholder="'+esc(t('wkNotePh'))+'" oninput="ACT.note=this.value;saveAct()">'+esc(ACT.note)+'</textarea>';
  if(ACT.ex.length)h+='<button class="btn wide" onclick="saveAsRoutine()">'+t('saveRoutine')+'</button>';
  return h;
}
function exCard(i,x){
  const m=exMode(x.eid),le=lastEx(x.eid),pv=le?le.x.sets:[];
  let h='<section class="exc"><div class="exh"><b>'+esc(exName(x.eid,x.n))+'</b></div><div class="exb"><button class="btn sm" onclick="swapOpen('+i+')">↔ '+t('swapB')+'</button><button class="btn sm" onclick="howOpen(\''+x.eid+'\')">ⓘ '+t('guideB')+'</button><button class="btn sm" onclick="exMenu('+i+')">⋯ '+t('options')+'</button></div>';
  h+=suggLine(x);
  h+='<div class="exsub muted sm">'+(le?t('lastTime',dFmt(le.wk.t,{month:'short',day:'numeric'}),esc(le.x.sets.map(s=>fmtPrev(m,s)).join('  '))):t('firstTime'))+'</div>';
  const c1=m==='t'?t('colMin'):(m==='bw'?'+'+wUnit().toUpperCase():wUnit().toUpperCase()),c2=m==='t'?dUnit().toUpperCase():t('colReps');
  h+='<div class="srow hd"><span>'+t('colSet')+'</span><span>'+t('colPrev')+'</span><span>'+c1+'</span><span>'+c2+'</span><span></span><span></span></div>';
  x.sets.forEach((s,j)=>{
    const ph=pv[j]||(pv.length?pv[pv.length-1]:null)||(j>0?x.sets[j-1]:null);
    let f1,f2,p1,p2,k1,k2;
    if(m==='t'){k1='t';k2='d';f1=s.t!=null?fmtNum(s.t):'';f2=dShow(s.d);p1=ph&&ph.t!=null?fmtNum(ph.t):'';p2=ph&&ph.d?dShow(ph.d):'';}
    else{k1='w';k2='r';f1=wShow(s.w);f2=s.r!=null?String(s.r):'';p1=ph&&ph.w!=null?wShow(ph.w):(m==='bw'?'0':'');p2=ph&&ph.r!=null?String(ph.r):'';if(m==='wr'&&x.sg!=null)p1=wShow(x.sg);}
    const inp0=(k,v,p,mode)=>'<input class="in'+(s.done?' dn':'')+'" type="text" inputmode="'+mode+'" autocomplete="off" value="'+esc(v)+'" placeholder="'+esc(p)+'" oninput="sv('+i+','+j+',\''+k+'\',this.value)">';
    const stb=(k,d)=>'<button class="stp" tabindex="-1" aria-label="'+(d<0?'−':'+')+'" onclick="stepSet('+i+','+j+',\''+k+'\','+d+')">'+(d<0?'−':'+')+'</button>';
    const inp=(k,v,p,mode)=>m==='t'?inp0(k,v,p,mode):'<span class="stc">'+stb(k,-1)+inp0(k,v,p,mode)+stb(k,1)+'</span>';
    h+='<div class="srow'+(s.done?' done':'')+'"><span class="sn">'+(j+1)+(s.pr?'<i class="pr" title="PR">🏆</i>':'')+'</span><span class="sp">'+esc(fmtPrev(m,pv[j]))+'</span>'+inp(k1,f1,p1,'decimal')+inp(k2,f2,p2,k2==='r'?'numeric':'decimal')+'<button class="chk" aria-label="'+esc(t('doneSet'))+'" onclick="tgSet('+i+','+j+')">✓</button><button class="clr'+((s.w!=null||s.r!=null||s.t!=null||s.d||s.done)?'':' off')+'" aria-label="'+esc(t('clrSet'))+'" title="'+esc(t('clrSet'))+'" onclick="clrSet('+i+','+j+')">✕</button></div>';
  });
  h+='<button class="btn sm wide" onclick="addSet('+i+')">＋ '+t('addSet')+'</button></section>';
  return h;
}
/* wipe one set back to empty (fix a typo quickly) / dejar una serie vacía (corregir un error rápido) */
function clrSet(i,j){
  const s=ACT.ex[i].sets[j];if(!s)return;
  s.w=null;s.r=null;s.t=null;s.d=null;s.done=false;delete s.pr;
  saveAct();render();toast(t('clrDone'));
}
function sv(i,j,f,v){
  const s=ACT.ex[i].sets[j];v=String(v).trim();let n=null;
  if(v!==''){
    if(f==='w')n=wParse(v);else if(f==='d')n=dParse(v);
    else if(f==='r'){n=parseInt(v,10);if(!(n>=0))n=null;}
    else n=numParse(v);
  }
  s[f]=n;saveAct();updTop();
}
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
  saveAct();render();
}
function addSet(i){ACT.ex[i].sets.push(newSet());saveAct();render();}
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
    s.done=true;
    if(prev>0&&sc>prev){s.pr=true;toast(t('newPR'));}else delete s.pr;
    startRest(x.tg&&x.tg.rs!=null?x.tg.rs:undefined);
  }else{s.done=false;delete s.pr;}
  saveAct();render();
}
function exMenu(i){
  const x=ACT.ex[i];
  sheet('<h3>'+esc(exName(x.eid,x.n))+'</h3><div class="menu">'+
    (i>0?'<button onclick="exMove('+i+',-1)">↑ '+t('moveUp')+'</button>':'')+
    (i<ACT.ex.length-1?'<button onclick="exMove('+i+',1)">↓ '+t('moveDown')+'</button>':'')+
    '<button onclick="rmSet('+i+')">− '+t('rmLastSet')+'</button><button class="danger" onclick="rmEx('+i+')">✕ '+t('rmEx')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
}
function exMove(i,d){const a=ACT.ex,j=i+d;if(j<0||j>=a.length)return;const x=a[i];a[i]=a[j];a[j]=x;saveAct();sheetClose();render();}
function rmSet(i){const s=ACT.ex[i].sets;if(s.length>1)s.pop();saveAct();sheetClose();render();}
function rmEx(i){ACT.ex.splice(i,1);saveAct();sheetClose();render();}

/* ---------- finish / cancel ---------- */
function autoName(ts){const h=new Date(ts).getHours();return t(h<12?'wkMorning':(h<18?'wkAfternoon':'wkEvening'));}
function finishAsk(){
  const a=actTotals();
  if(a.done===0){ask(t('noDone'),t('discard'),cancelWk,true);return;}
  if(a.done<a.tot){ask(t('undone',a.tot-a.done),t('finish'),finishWk);return;}
  finishWk();
}
function finishWk(){
  const end=Date.now();
  const ex=ACT.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.filter(s=>s.done).map(s=>{const o={w:s.w,r:s.r,t:s.t,d:s.d};if(s.pr)o.pr=1;return o;})})).filter(x=>x.sets.length);
  const wk={id:ACT.id,t:ACT.t0,end:end,name:(ACT.name||'').trim()||autoName(ACT.t0),note:(ACT.note||'').trim(),ex:ex};
  if(ACT.pl!=null){wk.pl=ACT.pl;if(DATA.plan)DATA.plan.cur=(ACT.pl+1)%DATA.plan.n;}
  DATA.workouts.push(wk);DATA.workouts.sort((a,b)=>b.t-a.t);
  saveData();
  ACT=null;saveAct();stopRest();unwake();
  render();
  const prs=[];wk.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr&&prs.indexOf(x.eid)<0)prs.push(x.eid);}));
  sheet('<div class="sum"><div class="sum-e">🎉</div><h3>'+t('wkSaved')+'</h3><p class="muted">'+esc(wk.name)+'</p>'+
    '<div class="stats"><div><b>'+fmtDur((end-wk.t)/1000)+'</b><span>'+t('duration')+'</span></div><div><b>'+wkSets(wk)+'</b><span>'+t('sets')+'</span></div><div><b>'+wShow(wkVol(wk))+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>'+
    (prs.length?'<p class="prs">🏆 '+t('prsT')+': '+prs.map(e=>esc(exName(e))).join(', ')+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="sheetClose()">'+t('done')+'</button><button class="btn" onclick="saveWkAsRoutine(\''+wk.id+'\')">'+t('saveRoutineS')+'</button></div></div>');
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
    b.innerHTML='<div class="rb-bar"><div id="restF"></div></div><div class="rb-row"><span class="rb-l">'+t('rest')+'</span><b id="restT"></b><span class="rb-sp"></span><button class="btn sm" onclick="restAdd(-15)">−15</button><button class="btn sm" onclick="restAdd(15)">+15</button><button class="btn sm pri" onclick="stopRest()">'+t('skip')+'</button></div>';
    restBuilt=true;
  }
  b.hidden=false;
  const left=Math.ceil((REST.end-Date.now())/1000),T=$('restT'),F=$('restF');
  if(left<=0){
    if(!REST.done){REST.done=true;beep();}
    if(T)T.textContent=t('restOver');if(F)F.style.width='100%';
    if(Date.now()-REST.end>5000)stopRest();
    return;
  }
  if(T)T.textContent=fmtClock(left);
  if(F)F.style.width=Math.max(0,Math.min(100,100*(1-left/REST.tot)))+'%';
}
function restAdd(d){if(!REST)return;REST.end+=d*1000;REST.tot=Math.max(5,REST.tot+d);REST.done=false;drawRest();}
function stopRest(){REST=null;restBuilt=false;if(restTick){clearInterval(restTick);restTick=null;}const b=$('restbar');if(b){b.hidden=true;b.innerHTML='';}}

/* ---------- keep screen awake during a workout ---------- */
let WL=null;
async function wake(){try{if(ACT&&'wakeLock' in navigator&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null;});}}catch(e){WL=null;}}
function unwake(){try{if(WL)WL.release();}catch(e){}WL=null;}

/* ---------- exercise picker ---------- */
function pickEx(cb){UI.q='';UI.g='';UI.pickCb=cb||function(eid){addExTo(eid,1);saveAct();render();};drawPick();}
function recentIds(){
  const r=[];
  for(const wk of DATA.workouts){for(const x of wk.ex){if(r.indexOf(x.eid)<0)r.push(x.eid);if(r.length>=6)return r;}}
  return r;
}
function exRow(e){return'<button class="exrow" onclick="pickDone(\''+e.id+'\')"><b>'+esc(LANG==='es'?e.es:e.en)+'</b><small>'+t('g_'+e.g)+' · '+t('e_'+e.e)+(e.custom?' · '+t('custom'):'')+esc(injBadge(e.id))+'</small></button>';}
function exListHtml(){
  const q=norm(UI.q.trim()),all=EXLIB.map(a=>exById(a[0])).concat(DATA.custom.map(c=>exById(c.id)));
  let h='';
  if(!q&&!UI.g){
    const rec=recentIds().map(exById).filter(Boolean);
    if(rec.length)h+='<div class="lbl">'+t('recent')+'</div>'+rec.map(exRow).join('');
    h+='<div class="lbl">'+t('allEx')+'</div>';
  }
  const list=all.filter(e=>e&&(!UI.g||e.g===UI.g)&&(!q||norm(e.en).indexOf(q)>=0||norm(e.es).indexOf(q)>=0)).sort((a,b)=>norm(LANG==='es'?a.es:a.en).localeCompare(norm(LANG==='es'?b.es:b.en)));
  h+=list.length?list.map(exRow).join(''):'<p class="muted">'+t('noMatch')+'</p>';
  return h;
}
function drawPick(){
  sheet('<div class="pick"><div class="pick-h"><h3>'+t('addEx')+'</h3><button class="ico" onclick="pickCancel()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<input id="exq" class="in wide" type="search" placeholder="'+esc(t('search'))+'" value="'+esc(UI.q)+'" oninput="exSearch(this.value)">'+
    '<div class="chips"><button class="chip'+(UI.g===''?' on':'')+'" onclick="exGroup(\'\')">'+t('all')+'</button>'+EX_GROUPS.map(g=>'<button class="chip'+(UI.g===g?' on':'')+'" onclick="exGroup(\''+g+'\')">'+t('g_'+g)+'</button>').join('')+'</div>'+
    '<div id="exlist" class="exlist">'+exListHtml()+'</div><button class="btn wide" onclick="customOpen()">＋ '+t('customEx')+'</button></div>');
}
function exSearch(v){UI.q=v;const l=$('exlist');if(l)l.innerHTML=exListHtml();}
function exGroup(g){UI.g=g;drawPick();const i=$('exq');if(i&&UI.q){i.value=UI.q;}}
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
    (r.ex.length?r.ex.map((x,i)=>'<div class="rbx"><b>'+esc(exName(x.eid,x.n))+'</b><span class="rbs"><button class="ico" onclick="rbSets('+i+',-1)">−</button><span>'+t('nSets',x.sets)+'</span><button class="ico" onclick="rbSets('+i+',1)">＋</button></span><button class="ico" onclick="rbDel('+i+')" aria-label="'+esc(t('rmEx'))+'">✕</button></div>').join(''):'<p class="muted">'+t('noEx')+'</p>')+
    '<button class="btn wide" onclick="rbAdd()">＋ '+t('addEx')+'</button>'+
    '<div class="row"><button class="btn pri" onclick="rbSave()">'+t('save')+'</button><button class="btn" onclick="UI.rb=null;sheetClose()">'+t('cancel')+'</button>'+(r.id?'<button class="btn danger" onclick="rbRemove()">'+t('delete')+'</button>':'')+'</div></div>');
}
function rbAdd(){pickEx(function(eid){const e=exById(eid);UI.rb.ex.push({eid:eid,n:e?e.en:eid,sets:3});rbDraw();});}
function rbSets(i,d){const x=UI.rb.ex[i];x.sets=Math.max(1,Math.min(20,x.sets+d));rbDraw();}
function rbDel(i){UI.rb.ex.splice(i,1);rbDraw();}
function rbSave(){
  const r=UI.rb;if(!r.name.trim()){toast(t('needName'));return;}
  if(!r.ex.length){toast(t('needEx'));return;}
  const o={id:r.id||uid(),name:r.name.trim(),ex:r.ex};
  const k=DATA.routines.findIndex(x=>x.id===o.id);
  if(k>=0)DATA.routines[k]=o;else DATA.routines.push(o);
  saveData();UI.rb=null;sheetClose();toast(t('saved'));render();
}
function rbRemove(){const id=UI.rb.id;ask(t('delRoutine'),t('delete'),function(){DATA.routines=DATA.routines.filter(x=>x.id!==id);UI.rb=null;saveData();render();},true);}
