/* ---------- automatic copies on this phone + anonymous crash log ----------
   Copias automáticas en este teléfono + registro anónimo de fallos.

   Automatic copies: once a day (and after each workout) a copy of your log goes to the browser's IndexedDB,
   a separate store from the one the app runs on. The last 7 are kept, per profile. They protect against a broken
   or emptied app store, a bad import or a sync mix-up. They do NOT survive "clear website data" in Safari/Chrome:
   that also clears this store, so an account or an exported file is still the real backup.
   Copias automáticas: una vez al día (y tras cada entrenamiento) una copia va a IndexedDB, un almacén aparte.
   Se guardan las 7 últimas por perfil. NO sobreviven a "borrar datos del sitio": la cuenta o un archivo siguen siendo el respaldo real. */
const BK_DB='bubylift-bk',BK_N=7;
let BK_LIST=null; // [{k,t,n,b}] newest first, for this profile / más nuevas primero, de este perfil
function bkDb(){return new Promise((ok,no)=>{try{if(!window.indexedDB)return no();const r=indexedDB.open(BK_DB,1);r.onupgradeneeded=()=>{r.result.createObjectStore('c',{keyPath:'k'});};r.onsuccess=()=>ok(r.result);r.onerror=()=>no();}catch(e){no();}});}
function bkTx(mode,fn){return bkDb().then(db=>new Promise((ok,no)=>{const tx=db.transaction('c',mode),st=tx.objectStore('c');let out;try{out=fn(st);}catch(e){no(e);return;}tx.oncomplete=()=>{db.close();ok(out&&out.result!==undefined?out.result:out);};tx.onerror=()=>{db.close();no();};}));}
function bkPre(){return(typeof K_DATA==='string'?K_DATA:'bl_data')+'|';}
function bkLoad(){
  return bkTx('readonly',st=>st.getAll()).then(all=>{
    const p=bkPre();BK_LIST=(all||[]).filter(c=>c&&String(c.k).indexOf(p)===0).map(c=>({k:c.k,t:c.t,n:c.n,b:c.b})).sort((a,b)=>b.t-a.t);return BK_LIST;
  }).catch(()=>{BK_LIST=[];return BK_LIST;});
}
/* take a copy if the newest one is older than a day or the log changed since / copia si la última tiene más de un día o el registro cambió */
function bkAuto(force){
  if(!DATA||!(DATA.workouts.length+DATA.body.length))return Promise.resolve();
  return bkLoad().then(list=>{
    const last=list[0],n=DATA.workouts.length,b=DATA.body.length;
    if(!force&&last&&Date.now()-last.t<864e5&&last.n===n&&last.b===b)return;
    if(last&&last.n>n+2&&!force)return; // never let a smaller log push out a bigger copy by itself / un registro más chico no reemplaza solo una copia más grande
    const day=dInput(Date.now()),k=bkPre()+day,doc={k:k,t:Date.now(),n:n,b:b,v:APP_VER,data:JSON.stringify(DATA)};
    return bkTx('readwrite',st=>{st.put(doc);}).then(bkLoad).then(l=>{const old=l.slice(BK_N);if(old.length)return bkTx('readwrite',st=>{old.forEach(c=>st.delete(c.k));}).then(bkLoad);});
  }).catch(()=>{});
}
function bkGet(k){return bkTx('readonly',st=>st.get(k));}
function bkOpen(){
  bkLoad().then(list=>{
    sheet('<h3>'+t('bkaT')+'</h3><p class="muted sm">'+t('bkaP')+'</p>'+
      (list.length?'<div class="lgrp">'+list.map(c=>'<button class="lrow" onclick="bkUse(\''+esc(c.k)+'\')"><span class="li">'+ic('clipboard-list')+'</span><span class="lt2"><b>'+esc(dFmt(c.t,{weekday:'short',month:'short',day:'numeric'}))+' · '+new Date(c.t).toLocaleTimeString(LANG==='es'?'es':'en',{hour:'numeric',minute:'2-digit'})+'</b><small>'+t('bkaN',c.n,c.b)+'</small></span><span class="lc">›</span></button>').join('')+'</div>':'<div class="card tip"><p class="muted">'+t('bkaNone')+'</p></div>')+
      '<button class="btn wide" onclick="sheetClose()">'+t('close')+'</button>');
  });
}
/* restoring merges: it only adds what is missing, nothing you have now is deleted / restaurar solo agrega lo que falta, no borra nada */
function bkUse(k){
  bkGet(k).then(c=>{
    if(!c||!c.data){toast(t('impBad'));return;}
    let d;try{d=JSON.parse(c.data);}catch(e){toast(t('impBad'));return;}
    sheetClose();importObj({app:'bubylift',data:d});
  }).catch(()=>toast(t('impBad')));
}
/* the app came up empty but a copy exists: offer it right on the home screen / la app abrió vacía pero hay copia: ofrecerla en el inicio */
function bkFound(){
  if(DATA.workouts.length||!BK_LIST||!BK_LIST.length)return'';
  const c=BK_LIST.find(x=>x.n>0);if(!c||SET.bkFoundNo===c.k)return'';
  return'<div class="card warn"><b>'+t('bkfT')+'</b><p>'+t('bkfP',dFmt(c.t),c.n)+'</p><div class="row"><button class="btn pri sm" onclick="bkUse(\''+esc(c.k)+'\')">'+t('bkfB')+'</button><button class="btn sm" onclick="SET.bkFoundNo=\''+esc(c.k)+'\';saveSet();render()">'+t('later')+'</button></div></div>';
}
function bkDrop(dataKey){const p=dataKey+'|';return bkTx('readwrite',st=>{const r=st.getAllKeys();r.onsuccess=()=>{(r.result||[]).forEach(k=>{if(String(k).indexOf(p)===0)st.delete(k);});};}).catch(()=>{});} // a deleted profile takes its copies with it / un perfil borrado se lleva sus copias
function bkWipe(){try{indexedDB.deleteDatabase(BK_DB);}catch(e){}}
function bkBoot(){bkLoad().then(()=>{if(!DATA.workouts.length&&BK_LIST.length&&tab==='workout'&&!ACT)render();setTimeout(()=>bkAuto(),3000);});}

/* anonymous crash log: message, file:line, version, a coarse platform word, and the random install id. No workout data, no account.
   Max 5 per session, the same message once a day. Off with Do Not Track, like the usage counters.
   registro anónimo de fallos: mensaje, archivo:línea, versión, plataforma general e id aleatorio de instalación. Sin datos ni cuenta. */
let ERR_N=0;
function errPlat(){const u=navigator.userAgent||'';return(/iphone|ipad/i.test(u)?'ios':/android/i.test(u)?'android':/mac/i.test(u)?'mac':/win/i.test(u)?'win':'other')+(typeof isStandalone==='function'&&isStandalone()?'-app':'-web');}
function errSend(msg,src){
  try{
    msg=String(msg||'').replace(/\s+/g,' ').trim().slice(0,200);if(!msg||ERR_N>=5)return;
    if(/Script error\.?$|ResizeObserver loop|extension:\/\/|NetworkError|Load failed|Failed to fetch/i.test(msg))return; // noise from the browser or extensions / ruido del navegador
    src=((String(src||'').match(/([\w.-]+\.js):(\d+)/)||[])[0]||'').slice(0,80);
    const day=dInput(Date.now()),key='bl_err',seen=JSON.parse(localStorage.getItem(key)||'{}');
    if(seen.d!==day){seen.d=day;seen.m=[];}
    const h=msg.slice(0,60)+'|'+src;if(seen.m.indexOf(h)>=0)return;seen.m.push(h);seen.m=seen.m.slice(-20);localStorage.setItem(key,JSON.stringify(seen));
    if(typeof cloudOn!=='function'||!cloudOn()||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
    let d='';try{d=localStorage.getItem('bl_did')||'';}catch(e){}
    if(!/^[a-f0-9]{16}$/.test(d)){d=Array.from(crypto.getRandomValues(new Uint8Array(8))).map(function(b){return('0'+b.toString(16)).slice(-2);}).join('');try{localStorage.setItem('bl_did',d);}catch(e){}} // same random install id as the usage counters / el mismo id aleatorio que los contadores
    ERR_N++;const c=window.CLOUD_CFG;
    fetch(c.url+'/rest/v1/app_errors',{method:'POST',keepalive:true,headers:{apikey:c.key,Authorization:'Bearer '+c.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({did:d,v:typeof APP_VER==='string'?APP_VER.slice(0,16):null,msg:msg,src:src||null,ua:errPlat()})}).catch(function(){});
  }catch(e){}
}
window.addEventListener('error',function(e){if(e&&e.message)errSend(e.message,(e.filename||'')+(e.lineno?':'+e.lineno:''));});
window.addEventListener('unhandledrejection',function(e){const r=e&&e.reason;if(r)errSend((r&&r.message)||String(r),r&&r.stack?String(r.stack).split('\n').find(l=>/\.js:\d+/.test(l))||'':'');});
