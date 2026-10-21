'use strict';
/* Bubylift — workout log. No account, no server: everything stays in this device's localStorage.
   Bubylift — registro de entrenamientos. Sin cuenta ni servidor: todo se queda en el almacenamiento local de este dispositivo. */
const APP_VER='v53';
const KG_LB=2.20462262185,KM_MI=0.621371192,CM_IN=0.393700787;
let K_DATA='bl_data',K_SET='bl_settings',K_ACT='bl_active'; // switched per profile by profiles.js / cambian por perfil (profiles.js)
let LANG='en',SET={},DATA={workouts:[],routines:[],body:[],custom:[],plan:null},ACT=null,tab='workout';
const UI={q:'',g:'',prog:null,pm:'',pickCb:null,rb:null};

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
let ENC=null; // encrypted-storage state, set by profiles.js / estado del almacenamiento cifrado (profiles.js)
function jget(k,d){if(ENC&&encOn(k))return encGet(k,d);try{const s=localStorage.getItem(k);return s?JSON.parse(s):d;}catch(e){return d;}}
function jset(k,v){if(ENC&&encOn(k))return encSet(k,v);try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){try{toast(t('saveFail'));}catch(x){}return false;}}
function numParse(s){const n=parseFloat(String(s).replace(',','.'));return isFinite(n)&&n>=0?n:null;}
function fmtNum(n,d){const k=Math.pow(10,d==null?1:d);return String(Math.round(n*k)/k);}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}

/* ---------- storage ---------- */
function defUnits(){return /-(US|LR|MM)$/i.test(navigator.language||'')?'imperial':'metric';}
function loadAll(){
  SET=Object.assign({lang:/^es/i.test(navigator.language||'')?'es':'en',theme:'system',units:defUnits(),rest:90,auto:true,sound:true,wnSeen:null,lastExport:0,bkSnooze:0,goal:null},jget(K_SET,{}));
  const d=jget(K_DATA,null);
  if(d&&typeof d==='object')DATA=Object.assign({workouts:[],routines:[],body:[],custom:[],plan:null},d);
  DATA.plan=cleanPlan(DATA.plan);
  ['workouts','routines','body','custom'].forEach(k=>{if(!Array.isArray(DATA[k]))DATA[k]=[];});
  DATA.workouts.sort((a,b)=>b.t-a.t);DATA.body.sort((a,b)=>b.t-a.t);
  ACT=jget(K_ACT,null);
  if(ACT&&!Array.isArray(ACT.ex))ACT=null;
  LANG=SET.lang==='es'?'es':'en';
}
function saveSet(){jset(K_SET,SET);try{localStorage.setItem('bl_lang',SET.lang);localStorage.setItem('bl_theme',SET.theme||'system');}catch(e){}}
function saveData(){return jset(K_DATA,DATA);}
function jdel(k){if(ENC&&encOn(k)){encDel(k);return;}try{localStorage.removeItem(k);}catch(e){}}
function saveAct(){if(ACT)jset(K_ACT,ACT);else jdel(K_ACT);}

/* ---------- units ---------- */
const imp=()=>SET.units==='imperial';
const wUnit=()=>imp()?'lb':'kg',dUnit=()=>imp()?'mi':'km',lUnit=()=>imp()?'in':'cm';
function wShow(kg){if(kg==null||isNaN(kg))return'';return fmtNum(imp()?kg*KG_LB:kg,1);}
function wParse(s){const n=numParse(s);return n==null?null:(imp()?n/KG_LB:n);}
function dShow(km){if(km==null||isNaN(km))return'';return fmtNum(imp()?km*KM_MI:km,2);}
function dParse(s){const n=numParse(s);return n==null?null:(imp()?n/KM_MI:n);}
function lShow(cm){if(cm==null||isNaN(cm))return'';return fmtNum(imp()?cm*CM_IN:cm,1);}
function lParse(s){const n=numParse(s);return n==null?null:(imp()?n/CM_IN:n);}

/* ---------- dates / durations ---------- */
const loc=()=>LANG==='es'?'es':'en-US';
function dFmt(ts,o){return new Date(ts).toLocaleDateString(loc(),o||{month:'short',day:'numeric',year:'numeric'});}
function dInput(ts){const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dFromInput(s){const p=String(s).split('-').map(Number);if(p.length!==3||p.some(isNaN))return Date.now();return new Date(p[0],p[1]-1,p[2],12,0,0).getTime();}
function weekStart(ts){const d=new Date(ts);d.setHours(0,0,0,0);const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return d.getTime();}
function fmtDur(sec){sec=Math.max(0,Math.round(sec));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);return h?h+'h '+String(m).padStart(2,'0')+'m':m+'m';}
function fmtClock(sec){sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');}

/* ---------- UI plumbing: toast, sheet, confirm ---------- */
let toastT=null;
function toast(msg){const e=$('toast');if(!e)return;e.textContent=msg;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2600);}
function sheet(html){$('sheet').className='';$('sheet').innerHTML=html;$('sheetov').hidden=false;document.body.classList.add('noscroll');$('sheet').scrollTop=0;}
function sheetClose(){$('sheetov').hidden=true;$('sheet').innerHTML='';document.body.classList.remove('noscroll');}
let _askFn=null;
function ask(msg,okTxt,fn,danger){_askFn=fn;sheet('<div class="dlg"><p>'+esc(msg)+'</p><div class="dlg-b"><button class="btn" onclick="askNo()">'+t('cancel')+'</button><button class="btn '+(danger?'danger':'pri')+'" onclick="askOk()">'+esc(okTxt)+'</button></div></div>');}
function askOk(){const f=_askFn;_askFn=null;sheetClose();if(f)f();}
function askNo(){_askFn=null;sheetClose();}

/* ---------- theme & language ---------- */
function applyTheme(){
  let m=SET.theme;
  if(m!=='light'&&m!=='dark')m=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';
  document.documentElement.setAttribute('data-mode',m);
  const mt=document.querySelector('meta[name=theme-color]');if(mt)mt.setAttribute('content',m==='light'?'#F2F2F7':'#0B0B0F');
}
try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{if(SET.theme==='system')applyTheme();});}catch(e){}
function setTheme(m){SET.theme=m;saveSet();applyTheme();render();}
function setLang(l){
  LANG=l==='es'?'es':'en';SET.lang=LANG;saveSet();document.documentElement.lang=LANG;
  renderHeader();renderTabs();render();
}
function setUnits(u){SET.units=u;saveSet();render();}

/* ---------- shell: header, tabs, router ---------- */
const TAB_ICONS={
  workout:'<path d="M3 9v6M6.5 7v10M17.5 7v10M21 9v6M6.5 12h11"/>',
  history:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  progress:'<path d="M4 4v16h16M8 15l4-4 3 3 5-6"/>',
  body:'<circle cx="12" cy="5.5" r="2.5"/><path d="M12 8.5V15M8 21l4-6 4 6M6.5 11h11"/>',
  stretch:'<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M5 5l7 3 7-3M9 21l3-7 3 7"/>',
  more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'
};
const TAB_KEYS=[['workout','tWorkout'],['history','tHistory'],['progress','tProgress'],['body','tBody'],['stretch','tStretch'],['more','tMore']];
function renderHeader(){
  const be=$('lEN'),bs=$('lES');if(be)be.classList.toggle('on',LANG==='en');if(bs)bs.classList.toggle('on',LANG==='es');
  instUpd();
}
function renderTabs(){
  $('tabbar').innerHTML=TAB_KEYS.map(a=>'<button class="'+(tab===a[0]?'on':'')+'" onclick="go(\''+a[0]+'\')"'+(tab===a[0]?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+TAB_ICONS[a[0]]+'</svg><span>'+t(a[1])+'</span></button>').join('');
}
function go(x){tab=x;UI.prog=null;renderTabs();render();window.scrollTo(0,0);}
function render(){
  const v={workout:vWorkout,history:vHistory,progress:vProgress,body:vBody,stretch:vStretch,more:vMore}[tab];
  const tk=TAB_KEYS.find(a=>a[0]===tab);
  $('main').innerHTML=(ACT&&tab==='workout'?'':'<h1 class="lt">'+t(tk?tk[1]:'tWorkout')+'</h1>')+v();
}

/* ---------- auto-update: compare version.json with APP_VER; reload once if newer ---------- */
let swReg=null;
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){try{navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{swReg=r;}).catch(()=>{});}catch(e){}}
function autoUpd(){
  if(!/^https?:/.test(location.protocol)||!navigator.onLine)return;
  try{swReg&&swReg.update();}catch(e){}
  fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
    if(!j||!j.v||j.v===APP_VER)return;
    let k='';try{k=sessionStorage.getItem('bl_upd')||'';}catch(e){}
    if(k===j.v)return;
    const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
    try{sessionStorage.setItem('bl_upd',j.v);}catch(e){}
    toast(t('updating',j.v));
    setTimeout(()=>{location.replace(location.pathname+'?v='+encodeURIComponent(j.v));},700);
  }).catch(()=>{});
}

/* ---------- install / Add to Home Screen ---------- */
let instEvt=null;
function isStandalone(){return(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;}
function isIOS(){return/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function canInstall(){return!isStandalone();}
/* Instagram, Facebook, TikTok… open links in their own browser, where installing is impossible / los navegadores internos no permiten instalar */
function inApp(){return/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Snapchat|Line\//i.test(navigator.userAgent||'');}
function instUpd(){const b=$('instBtn');if(b){b.style.display=canInstall()?'':'none';b.innerHTML=ic('device-mobile')+' '+t('install');}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEvt=e;instUpd();});
window.addEventListener('appinstalled',()=>{instEvt=null;instUpd();toast(t('installed'));});
let INST_TAB='';
function instPlat(){return isIOS()?'ios':(/android/i.test(navigator.userAgent)?'and':'pc');}
function installApp(tab){
  const cur=(tab==='ios'||tab==='and'||tab==='pc')?tab:(INST_TAB||instPlat());INST_TAB=cur;
  const steps={ios:['iosS1','iosS2','iosS3','iosS4'],and:['andS1','andS2','andS3','andS4'],pc:['pcS1','pcS2','pcS3']}[cur];
  const tabs=[['ios','tabIos'],['and','tabAnd'],['pc','tabPc']].map(x=>'<button class="chip'+(x[0]===cur?' on':'')+'" onclick="installApp(\''+x[0]+'\')">'+t(x[1])+'</button>').join('');
  sheet('<div class="inst"><div class="pick-h"><div class="inst-top"><img src="icons/icon-192.png" alt="" class="inst-ic"><h3>'+t('ginT')+'</h3></div><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    (inApp()?'<div class="card warn"><b>'+t('inappT')+'</b><p>'+t(isIOS()?'inappIos':'inappAnd')+'</p></div>':'')+
    '<p class="muted">'+t('instP')+'</p>'+
    '<div class="card"><b>'+t('whyT')+'</b><ul class="why">'+[t('why1'),t('why2'),t('why3'),t('why4')].map(x=>'<li>'+x+'</li>').join('')+'</ul></div>'+
    '<div class="lbl">'+t('howT')+'</div><div class="chips">'+tabs+'</div>'+
    (instEvt&&cur===instPlat()?'<button class="btn pri wide" onclick="instNative()">'+ic('device-mobile')+' '+t('installNow')+'</button><p class="muted sm">'+t('orSteps')+'</p>':'')+
    '<ol>'+steps.map(k=>'<li>'+t(k)+'</li>').join('')+'</ol>'+(cur==='ios'?'<p class="note">'+t('iosNote')+'</p>':'')+
    '<button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div>');
}
async function instNative(){
  if(!instEvt)return;
  sheetClose();instEvt.prompt();try{await instEvt.userChoice;}catch(e){}instEvt=null;instUpd();
}

/* ---------- What's new (data/whatsnew.js): once per version, and from More → What's new ---------- */
function wnVnum(v){return parseInt(String(v||'').replace(/\D/g,''),10)||0;}
function wnPending(){
  if(typeof WHATSNEW==='undefined')return[];
  const cur=wnVnum(APP_VER),list=WHATSNEW.filter(e=>wnVnum(e.v)<=cur),seen=SET.wnSeen;
  if(!seen)return[];
  return list.filter(e=>wnVnum(e.v)>wnVnum(seen)).slice(0,4);
}
function wnDone(){SET.wnSeen=APP_VER;saveSet();sheetClose();}
function wnShow(force){
  const list=force?(typeof WHATSNEW!=='undefined'?WHATSNEW.slice(0,3):[]):wnPending();
  if(!list.length){if(!force&&SET.wnSeen!==APP_VER){SET.wnSeen=APP_VER;saveSet();}return;}
  const items=list.flatMap(e=>e.items.map(x=>Object.assign({v:e.v},x)));
  sheet('<div class="wn"><div class="wn-k">'+(force?'':t('updated')+' · ')+APP_VER+'</div><h3>'+t('whatsNew')+'</h3>'+
    items.map(x=>'<div class="wn-i"><span class="wn-ic">'+x.i+'</span><div>'+(LANG==='es'?x.es:x.en)+'</div></div>').join('')+
    '<button class="btn pri wide" onclick="wnDone()">'+t('gotIt')+'</button></div>');
}
function wnInit(n){
  n=n||0;
  if(!$('sheetov').hidden){if(n<40)setTimeout(()=>wnInit(n+1),1500);return;}
  wnShow(false);
}

/* manual "check for updates": clears the saved copies and reloads when a newer version exists / botón de buscar actualizaciones */
async function checkUpd(){
  if(!navigator.onLine){toast(t('updOff'));return;}
  toast(t('updChecking'));
  let j=null;
  try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});j=r.ok?await r.json():null;}catch(e){}
  if(!j||!j.v){toast(t('updOff'));return;}
  if(j.v===APP_VER){toast(t('updLatest',APP_VER));return;}
  toast(t('updating',j.v));
  try{if(window.pfFlush)await pfFlush();}catch(e){}
  try{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()));}catch(e){}
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));}catch(e){}
  setTimeout(()=>{location.replace(location.pathname+'?v='+encodeURIComponent(j.v));},500);
}

/* ---------- boot ---------- */
function bootApp(){
  loadAll();document.documentElement.lang=LANG;applyTheme();
  if(!SET.wnSeen){SET.wnSeen=APP_VER;saveSet();} // first run: nothing "new" to show
  $('sheetov').onclick=e=>{if(e.target===$('sheetov'))sheetClose();};
  renderHeader();renderTabs();render();
  if(ACT)wake();
  setInterval(tickElapsed,1000);
  setTimeout(autoUpd,1500);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){autoUpd();if(ACT)wake();}});
  setTimeout(instUpd,0);
  setTimeout(()=>wnInit(0),1200);
  setTimeout(()=>{try{guestNag();}catch(e){}},4500);
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}
}
