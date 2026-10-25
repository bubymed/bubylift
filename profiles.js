'use strict';
/* Profiles ("who's training?"), password sign-in, recovery questions, avatars and phone-to-phone transfer by QR.
   Everything stays on this device. The password unlocks a key that encrypts this profile's data on the device.
   Perfiles ("¿quién entrena?"), contraseña, preguntas de recuperación, avatares y transferencia entre teléfonos por QR.
   Todo se queda en este dispositivo. La contraseña impide que otros entren a la app; no cifra los datos guardados. */
const PF_MAX=5,PF_ITER=150000,PF_QN=8;
const PF_COMMON=['password','password1','passw0rd','12345678','123456789','1234567890','qwerty123','qwertyui','iloveyou','letmein1','welcome1','admin123','abc12345','11111111','contraseña','contrasena1','bubylift1','gimnasio1'];
const B64_RE=/^[A-Za-z0-9+/]+={0,2}$/;
let PFS=[],PFID=null,GS={};

/* ---------- storage ---------- */
function pfKeys(id){return{d:'bl_d_'+id,s:'bl_s_'+id,a:'bl_a_'+id};}
/* a random suggested photo for new profiles / foto sugerida al azar para perfiles nuevos */
function pfRandAv(){return{k:'p',p:AVP[Math.floor(Math.random()*AVP.length)]};}
function pfAv(a){
  if(a&&a.k==='p'&&AVP.indexOf(a.p)>=0)return{k:'p',p:a.p};
  let h=0;const s=JSON.stringify(a||0);for(let k=0;k<s.length;k++)h=(h*31+s.charCodeAt(k))>>>0; // old emoji / photo avatars → a stable suggested photo / avatares viejos → una foto sugerida fija
  return{k:'p',p:AVP[h%AVP.length]};
}
const pfWrapOk=r=>r&&typeof r.s==='string'&&typeof r.i==='string'&&typeof r.c==='string'&&r.s.length===24&&r.i.length===16&&r.c.length===64&&B64_RE.test(r.s)&&B64_RE.test(r.i)&&B64_RE.test(r.c)?{s:r.s,i:r.i,c:r.c}:null;
function pfEncRec(e){const wp=e&&pfWrapOk(e.wp);return wp?{wp:wp,wq:pfWrapOk(e.wq)}:null;}
function pfRec(r){return r&&typeof r.s==='string'&&typeof r.h==='string'&&B64_RE.test(r.s)&&B64_RE.test(r.h)&&r.s.length<40&&r.h.length<80?{s:r.s,h:r.h,n:Math.max(1000,Math.min(1000000,(r.n|0)||PF_ITER))}:null;}
function pfClean(p){
  if(!p||typeof p!=='object'||typeof p.id!=='string'||!/^[a-z0-9]{3,24}$/.test(p.id))return null;
  const qs=(Array.isArray(p.qs)?p.qs:[]).map(q=>{if(!q||!((q.i|0)>=0&&(q.i|0)<PF_QN))return null;const r=pfRec(q);return r?Object.assign(r,{i:q.i|0}):{i:q.i|0};}).filter(Boolean).slice(0,3);
  const enc=pfEncRec(p.enc);
  return{id:p.id,name:String(p.name||'').trim().slice(0,20)||'Profile',av:pfAv(p.av),pw:pfRec(p.pw),qs:qs,enc:enc,rm:enc?0:(p.rm?1:0),t:+p.t||Date.now(),g:(!enc&&!pfRec(p.pw)&&p.g)?1:0,tmp:(!enc&&!pfRec(p.pw)&&p.g&&p.tmp)?1:0,acct:p.acct?1:0};
}
function pfLoad(){const a=jget('bl_profiles',[]);PFS=(Array.isArray(a)?a:[]).map(pfClean).filter(Boolean).slice(0,PF_MAX);return PFS;}
function pfSave(){jset('bl_profiles',PFS);}
const pfGet=id=>PFS.find(p=>p.id===id);
const pfName=p=>p.g?t('pfGuest'):p.name; // guests are shown in the current language / el invitado se muestra en el idioma actual
const pfCur=()=>pfGet(PFID);

/* ---------- crypto helpers ---------- */
const hasCrypto=()=>!!(window.crypto&&crypto.subtle&&window.TextEncoder);
function b64(buf){let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
async function pbk(text,salt,iter,bits){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(text),'PBKDF2',false,['deriveBits']);
  return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:iter,hash:'SHA-256'},k,bits||256);
}
async function pfHash(text){const salt=crypto.getRandomValues(new Uint8Array(16));return{s:b64(salt),h:b64(await pbk(text,salt,PF_ITER)),n:PF_ITER};}
async function pfCheck(text,rec){if(!rec)return true;return b64(await pbk(text,unb64(rec.s),rec.n||PF_ITER))===rec.h;}
const pfNormAns=a=>String(a||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');

/* ---------- encrypted storage / almacenamiento cifrado ----------
   A random master key encrypts this profile's data (AES-256-GCM). The key is stored wrapped twice: by the password, and by the three security answers together.
   Una llave maestra aleatoria cifra los datos del perfil (AES-256-GCM). La llave se guarda envuelta dos veces: por la contraseña y por las tres respuestas juntas. */
const encOn=k=>!!(ENC&&ENC.ks.indexOf(k)>=0);
function encGet(k,d){const s=ENC.c[k];if(s==null)return d;try{return JSON.parse(s);}catch(e){return d;}}
function encSet(k,v){ENC.c[k]=JSON.stringify(v);ENC.q[k]=1;pfPump();return true;}
function encDel(k){ENC.c[k]=null;ENC.q[k]=1;pfPump();}
async function pfSeal(s,k,E){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:new TextEncoder().encode(k)},E.key,new TextEncoder().encode(s));
  return'e1.'+b64(iv)+'.'+b64(ct);
}
async function pfOpen(str,k,E){
  const m=/^e1\.([A-Za-z0-9+/=]+)\.([A-Za-z0-9+/=]+)$/.exec(str);if(!m)throw new Error('fmt');
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(m[1]),additionalData:new TextEncoder().encode(k)},E.key,unb64(m[2]));
  return new TextDecoder().decode(pt);
}
async function pfPump(){
  const E=ENC;if(!E||E.busy)return;E.busy=true;
  try{
    while(Object.keys(E.q).length){
      for(const k of Object.keys(E.q)){
        delete E.q[k];const s=E.c[k];
        if(s==null)localStorage.removeItem(k);else localStorage.setItem(k,await pfSeal(s,k,E));
      }
    }
  }catch(e){try{toast(t('saveFail'));}catch(x){}}
  E.busy=false;
}
async function pfFlush(){const E=ENC;if(!E)return;for(let i=0;i<200&&(E.busy||Object.keys(E.q).length);i++){if(!E.busy)pfPump();await new Promise(r=>setTimeout(r,25));}}
/* wrap/unwrap the master key with a secret (password or joined answers) / envolver la llave maestra */
async function pfWrap(secret,raw){
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},await pfAesKey(secret,salt,'encrypt'),raw);
  return{s:b64(salt),i:b64(iv),c:b64(ct)};
}
async function pfUnwrap(secret,rec){
  const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(rec.i)},await pfAesKey(secret,unb64(rec.s),'decrypt'),unb64(rec.c));
  return new Uint8Array(raw);
}
const pfAnsKey=a=>a.map(pfNormAns).join('|');
const pfNewKey=()=>crypto.getRandomValues(new Uint8Array(32));

/* password rules and strength / reglas y fuerza de la contraseña */
function pfRules(pw,name){
  const low=pw.toLowerCase(),nm=pfNormAns(name);
  return{len:pw.length>=8,let:/[A-Za-z]/.test(pw),num:/\d/.test(pw),common:PF_COMMON.indexOf(low)<0&&!(nm.length>=3&&pfNormAns(pw).indexOf(nm)>=0)};
}
const pfRulesOk=r=>r.len&&r.let&&r.num&&r.common;
function pfStrength(pw){
  let s=0;if(pw.length>=8)s++;if(pw.length>=12)s++;
  if(/[a-z]/.test(pw)&&/[A-Z]/.test(pw))s++;if(/\d/.test(pw)&&/[^A-Za-z0-9]/.test(pw))s++;
  return Math.min(3,s);
}

/* attempt limits: pause after repeated failures / límite de intentos: pausa tras fallos repetidos */
function pfThr(k,id){return jget('bl_thr'+k+'_'+id,{n:0,u:0});}
function pfFail(k,id){const x=pfThr(k,id);x.n++;if(x.n>=3)x.u=Date.now()+Math.min(900,Math.pow(2,x.n-2)*5)*1000;jset('bl_thr'+k+'_'+id,x);return x;}
function pfOk(k,id){try{localStorage.removeItem('bl_thr'+k+'_'+id);}catch(e){}}
function pfWait(k,id){return Math.max(0,Math.ceil((pfThr(k,id).u-Date.now())/1000));}
const pfWaitTxt=s=>s>=60?Math.ceil(s/60)+' min':s+' s';

/* ---------- avatars ---------- */
function avHtml(av,sz){
  av=pfAv(av);
  return'<span class="av av-p" style="width:'+sz+'px;height:'+sz+'px"><img alt="" src="img/av/'+av.p+'.webp"></span>';
}
function pfRenderAv(){const b=$('avBtn');if(!b)return;const p=pfCur();if(!p){b.hidden=true;return;}b.hidden=false;b.innerHTML=avHtml(p.av,32);b.setAttribute('aria-label',pfName(p));}

/* ---------- stay signed in on this device / mantener sesión en este dispositivo ----------
   Opt-in: the unlocked key is kept on this device so the password is not asked every time. Turn it off in the profile menu.
   Opcional: la llave desbloqueada se guarda en este dispositivo para no pedir la contraseña cada vez. Se apaga en el menú del perfil. */
function pfRemKey(id){try{const v=localStorage.getItem('bl_rk_'+id);if(!v||!B64_RE.test(v))return null;const r=unb64(v);return r.length===32?r:null;}catch(e){return null;}}
function pfRemSet(id,raw,on){try{if(on&&raw&&raw.length===32)localStorage.setItem('bl_rk_'+id,b64(raw));else localStorage.removeItem('bl_rk_'+id);}catch(e){}}
function pfRemToggle(){
  const p=pfCur();if(!p||!p.enc||!ENC)return;
  if(pfRemKey(p.id)){pfRemSet(p.id,null,false);toast(t('pfRemOffT'));}
  else{pfRemSet(p.id,ENC.raw,true);toast(t('pfRemOnT'));}
}

/* "Welcome back" splash: a very short opening screen so it feels like opening the app / pantalla breve de bienvenida */
function pfSplash(p){
  try{
    const old=$('splash');if(old)old.remove();
    const d=document.createElement('div');d.id='splash';d.setAttribute('aria-hidden','true');
    d.innerHTML='<img src="icons/icon-192.png" alt=""><b>'+esc(p&&!p.g?t('pfBackN',p.name):t('pfBack'))+'</b>';
    document.body.appendChild(d);
    setTimeout(()=>{d.classList.add('out');setTimeout(()=>{if(d.parentNode)d.remove();},350);},850);
  }catch(e){}
}

/* ---------- boot / enter / leave ---------- */
/* a temporary profile exists only while someone is signing in from the start screen; if they never finished, it is removed
   un perfil temporal existe solo mientras alguien inicia sesión desde la pantalla de inicio; si no terminó, se elimina */
function pfDropTmp(){
  const bad=PFS.filter(p=>{if(!p.tmp)return false;let s=null;try{s=JSON.parse(localStorage.getItem(pfKeys(p.id).s)||'null');}catch(e){}return!(s&&s.cl&&s.cl.dek);});
  bad.forEach(p=>{const k=pfKeys(p.id);try{[k.d,k.s,k.a].forEach(x=>localStorage.removeItem(x));}catch(e){}});
  PFS=PFS.filter(p=>bad.indexOf(p)<0);const dirty=bad.length||PFS.some(p=>p.tmp);PFS.forEach(p=>{p.tmp=0;});
  if(dirty)pfSave();
}
/* old password-protected local profiles are no longer valid when accounts are on (unless they got a cloud account)
   los perfiles locales viejos con contraseña ya no son válidos con cuentas activas (salvo que tengan cuenta en la nube) */
const pfIsOld=p=>!p.g&&!p.acct&&!!(p.pw||p.enc);
function pfPurge(id){const k=pfKeys(id);try{[k.d,k.s,k.a,'bl_rk_'+id,'bl_thrp_'+id,'bl_thrq_'+id].forEach(x=>localStorage.removeItem(x));if(localStorage.getItem('bl_last')===id)localStorage.removeItem('bl_last');}catch(e){}PFS=PFS.filter(x=>x.id!==id);pfSave();}
function gLegacy(){
  GS={redraw:gLegacy};
  const old=PFS.filter(pfIsOld),rest=PFS.length>old.length;
  gateShow('<div class="g-top"><span></span><span></span></div><div class="g-c"><div class="wel-e">🏋️</div></div><h1 class="lt g-h">'+t('legT')+'</h1><p class="muted g-c">'+t('legP')+'</p>'+
    '<div class="g-form">'+old.map(p=>'<div class="card leg-row"><div class="leg-n">'+avHtml(p.av,56)+'<b>'+esc(pfName(p))+'</b></div><button class="btn pri wide" onclick="pfLegKeep(\''+p.id+'\')">'+t('legKeep')+'</button><button class="btn wide" onclick="pfLegAsk([\''+p.id+'\'])">'+t('legDel')+'</button></div>').join('')+
    (old.length>1?'<button class="btn danger wide" onclick="pfLegAsk(['+old.map(p=>'\''+p.id+'\'').join(',')+'])">'+t('legDelAll')+'</button>':'')+
    (rest?'<button class="lnk-d" onclick="pfLegSkip()">'+t('legSkip')+'</button>':'')+'</div>'+gLang());
}
function pfLegKeep(id){window.__clGo='up';gPw(id);}
function pfLegAsk(ids){
  const names=ids.map(i=>{const p=pfGet(i);return p?pfName(p):'';}).filter(Boolean).join(', ');
  gateShow('<div class="g-top"><button class="g-link" onclick="gLegacy()">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('legDel')+'</h1><p class="muted">'+t('legDelP',esc(names))+'</p>'+
    '<div class="g-form"><button class="btn danger big wide" onclick="pfLegDo(['+ids.map(i=>'\''+i+'\'').join(',')+'])">'+t('legDel')+'</button></div>'+gLang());
}
function pfLegDo(ids){ids.forEach(pfPurge);try{sessionStorage.setItem('bl_pick','1');}catch(e){}location.replace(location.pathname);}
function pfLegSkip(){try{sessionStorage.setItem('bl_legskip','1');}catch(e){}location.replace(location.pathname);}
async function boot(){
  pfLoad();pfDropTmp();
  let sess=null,sk=null,last=null;try{sess=sessionStorage.getItem('bl_sess');sk=sessionStorage.getItem('bl_sk');last=localStorage.getItem('bl_last');}catch(e){}
  pfPrefs();
  if(typeof cloudOn==='function'&&cloudOn()&&PFS.some(pfIsOld)){let sk2=null;try{sk2=sessionStorage.getItem('bl_legskip');}catch(e){}if(!sk2){gLegacy();return;}}
  const p=pfGet(sess);
  if(p&&!p.enc){await pfEnter(p.id,null);return;}
  if(p&&p.enc&&sk){
    try{const raw=unb64(sk);if(raw.length===32){await pfEnter(p.id,raw);return;}}catch(e){}
  }
  let pick=null;try{pick=sessionStorage.getItem('bl_pick');sessionStorage.removeItem('bl_pick');}catch(e){}
  const lp=pfGet(last);
  if(!pick&&lp&&lp.enc){const rk=pfRemKey(lp.id);if(rk){await pfEnter(lp.id,rk,null,false,1);return;}}
  if(!PFS.length)gWelcome();
  else if(pick&&PFS.length===1&&typeof cloudOn==='function'&&cloudOn())gWelcome(1);
  else if(PFS.length===1&&!PFS[0].pw){await pfEnter(PFS[0].id,null,null,false,1);}
  else gPick();
}
/* language/theme before sign-in (kept in plain, non-sensitive keys) / idioma y tema antes de entrar (claves simples, no sensibles) */
function pfPrefs(){
  let l=null,th=null;try{l=localStorage.getItem('bl_lang');th=localStorage.getItem('bl_theme');}catch(e){}
  SET={theme:th||'system'};LANG=(l||(/^es/i.test(navigator.language||'')?'es':'en'))==='es'?'es':'en';
  document.documentElement.lang=LANG;applyTheme();
}
/* raw = unlocked master key (32 bytes) for encrypted profiles; seed = {storageKey:jsonString} to write first / raw = llave maestra desbloqueada; seed = datos iniciales */
async function pfEnter(id,raw,seed,noBoot,spl){
  const p=pfGet(id);if(!p){gPick();return;}
  const k=pfKeys(id);
  try{
    if(p.enc){
      if(!raw||raw.length!==32)throw new Error('key');
      const E={raw:raw,key:await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']),c:{},q:{},busy:false,ks:[k.d,k.s,k.a]};
      for(const kk of E.ks){
        const v=localStorage.getItem(kk);if(v==null)continue;
        if(v.indexOf('e1.')===0)E.c[kk]=await pfOpen(v,kk,E);else{E.c[kk]=v;E.q[kk]=1;} // plain leftovers get encrypted now / restos sin cifrar se cifran ahora
      }
      if(seed)for(const kk in seed){E.c[kk]=seed[kk];E.q[kk]=1;}
      ENC=E;
      try{sessionStorage.setItem('bl_sk',b64(raw));}catch(e){}
    }else ENC=null;
  }catch(e){
    ENC=null;pfRemSet(id,null,false);try{sessionStorage.removeItem('bl_sk');sessionStorage.removeItem('bl_sess');}catch(x){}
    gPick();toast(t('pfDataBad'));return;
  }
  PFID=id;K_DATA=k.d;K_SET=k.s;K_ACT=k.a;
  try{sessionStorage.setItem('bl_sess',id);localStorage.setItem('bl_last',id);}catch(e){}
  if(noBoot)return;
  if(spl)pfSplash(p);
  if(!window.__gKeep)gateHide();pfRenderAv();bootApp();
  if(typeof clInit==='function')clInit();
  if(ENC)pfPump();
  try{if(sessionStorage.getItem('bl_up')){sessionStorage.removeItem('bl_up');setTimeout(()=>toast(t('pfUpDone')),700);}}catch(e){}
}
function pfLeave(){
  const go=function(){
    try{sessionStorage.removeItem('bl_sess');sessionStorage.removeItem('bl_sk');sessionStorage.setItem('bl_pick','1');}catch(e){}
    location.replace(location.pathname);
  };
  try{stopRest();unwake();}catch(e){}
  if(ENC)pfFlush().then(go,go);else go();
}
/* the first profile adopts any log saved before profiles existed / el primer perfil adopta el registro previo */
function pfLegacy(id){
  const k=pfKeys(id),map={},del=[];
  [['bl_data',k.d],['bl_settings',k.s],['bl_active',k.a]].forEach(x=>{try{const v=localStorage.getItem(x[0]);if(v!=null){map[x[1]]=v;del.push(x[0]);}}catch(e){}});
  return{map:map,del:del};
}
const pfHasLegacy=()=>{try{return localStorage.getItem('bl_data')!=null;}catch(e){return false;}};

/* ---------- gate (full-screen sign-in area) ---------- */
let PFSTOP=null;function pfStopAll(){if(PFSTOP){try{PFSTOP();}catch(e){}PFSTOP=null;}}
function gateShow(html){pfStopAll();const g=$('gate'),was=!g.hidden,st=g.scrollTop,h0=was&&g.querySelector('h1')?g.querySelector('h1').textContent:null;g.innerHTML='<div class="gate-in">'+html+'</div>';g.hidden=false;document.body.classList.add('noscroll');const h1=g.querySelector('h1');g.scrollTop=(was&&(window.__gSame||(h0!==null&&h1&&h1.textContent===h0)))?st:0;}
function gateHide(){pfStopAll();const g=$('gate');if(!g.hidden&&typeof ghostOut==='function')ghostOut(g);g.hidden=true;g.innerHTML='';document.body.classList.remove('noscroll');}
const gv=id=>{const e=$(id);return e?e.value:'';};
function gLang(){return'<div class="g-lang"><button onclick="pfSetLang(\'en\')"'+(LANG==='en'?' class="on"':'')+'>English</button><button onclick="pfSetLang(\'es\')"'+(LANG==='es'?' class="on"':'')+'>Español</button></div>';}
function pfSetLang(l){LANG=l==='es'?'es':'en';try{localStorage.setItem('bl_lang',LANG);}catch(e){}document.documentElement.lang=LANG;const f=GS.redraw;window.__gSame=1;try{if(f)f();else gPick();}finally{window.__gSame=0;}}

/* first screen: create a profile or just try it as a guest / primera pantalla: crear perfil o probar como invitado */
function gWelcome(back){
  GS={redraw:function(){gWelcome(back);},back:!!back};
  gateShow('<div class="g-top"><span></span><span></span></div><div class="g-c"><div class="wel-e">🏋️</div></div><h1 class="lt g-h">'+t('pfWelT')+'</h1><p class="muted g-c">'+t(typeof cloudOn==='function'&&cloudOn()?'wCP':'pfWelP')+'</p>'+(pfHasLegacy()?'<p class="note">'+t('pfLegacy')+'</p>':'')+
    (typeof cloudOn==='function'&&cloudOn()?'<div class="g-form"><button class="btn pri big wide" onclick="gAcct(\'up\')">✨ '+t('wCreate')+'</button><p class="muted sm g-c">'+t('wCreateP')+'</p>'+
    '<button class="btn big wide" onclick="gAcct(\'in\')">'+t('wIn')+'</button>'+
    '<button class="btn big wide" onclick="pfGuest()">👤 '+t('wGuest')+'</button><p class="muted sm g-c">'+t('wGuestP')+'</p>'+
    '<p id="gmsg" class="g-msg"></p></div>':
    '<div class="g-form"><button class="btn pri big wide" onclick="gNew(1,{first:true})">✨ '+t('pfWelNew')+'</button><p class="muted sm g-c">'+t('pfWelNewP')+'</p>'+
    '<button class="btn big wide" onclick="pfGuest()">👤 '+t('pfGuestB')+'</button><p class="muted sm g-c">'+t('pfGuestP')+'</p>'+
    '<button class="btn wide" onclick="gRecv()">📲 '+t('pfBring')+'</button><p id="gmsg" class="g-msg"></p></div>')+(GS.back&&PFS.length?'<button class="lnk-d g-c" onclick="gBack()">← '+t('wBack',esc(pfName(PFS[0])))+'</button>':'')+gLang());
}
function gBack(){const q=PFS[0];if(PFS.length===1&&q&&!q.pw&&!q.enc)pfEnter(q.id,null,null,false,1);else gPick();}
/* create account / sign in from the first screen: start as a guest, then open the account sheet / cuenta desde la primera pantalla */
function gAcct(mode){if(mode==='up'){gSignup(1,{});return;}window.__clGo=mode;pfGuest(true);}
function pfGuest(tmp){
  const eg=PFS.find(x=>x.g);
  if(eg){pfEnter(eg.id,null);return;}
  if(PFS.length>=PF_MAX)return;
  const prof={id:'g'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:'Guest',av:pfRandAv(),pw:null,qs:[],enc:null,rm:0,t:Date.now(),g:1};
  const k=pfKeys(prof.id),lg=PFS.length?{map:{},del:[]}:pfLegacy(prof.id);
  prof.tmp=(tmp===true&&!lg.del.length)?1:0; // never throw away an old log: only an empty profile is temporary / nunca se descarta un registro viejo
  if(!lg.map[k.s])lg.map[k.s]=JSON.stringify({lang:LANG});
  try{for(const kk in lg.map)localStorage.setItem(kk,lg.map[kk]);}catch(e){const m=$('gmsg');if(m)m.textContent=t('pfTxBad');return;}
  PFS.push(prof);pfSave();GS={};
  try{lg.del.forEach(x=>localStorage.removeItem(x));}catch(e){}
  pfEnter(prof.id,null);
}
/* create account = one full-screen flow: name + avatar → e-mail + password → recovery key → in / crear cuenta = un flujo de pantalla completa */
function gSignup(step,o){
  if(o)GS=Object.assign({},o);
  if(!GS.av)GS.av=pfRandAv();
  if(GS.name===undefined)GS.name='';
  GS.step=step;GS.redraw=function(){gSignup(GS.step);};
  const top='<div class="g-top"><button class="g-link" onclick="suBack()">‹ '+t('back')+'</button><span class="muted sm">'+t('psStep',step,3)+'</span></div>';
  let b;
  if(step===1){
    b='<h1 class="lt g-h">'+t('suT')+'</h1><div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form"><label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+
      '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="suNext1()">'+t('next')+' ›</button></div>';
  }else{
    b='<h1 class="lt g-h">'+t('suE')+'</h1><p class="muted">'+t('suEP')+'</p><div class="g-form"><label>'+t('clEmail')+'<input id="sue" class="in wide" type="email" autocomplete="email" inputmode="email" value="'+esc(GS.em||'')+'"></label>'+
      pfPwFields(GS.name)+'<p class="clwarn">'+t('clE2eP')+'</p><p id="gmsg" class="g-msg"></p><button class="btn pri big wide" id="sugo" onclick="suGo()">'+t('clCreate')+'</button>'+
      '<button class="lnk-d g-c" onclick="clAuthBackIn()">'+t('clHave')+'</button></div>';
  }
  gateShow(top+b+gLang());
  if(step===2)pfPwLive(GS.name);
}
function suBack(){
  if(GS.step===2){const e=$('sue');if(e)GS.em=e.value;gSignup(1);return;}
  const c=pfCur();
  if(c&&c.tmp)clAuthBack();else if(GS.upg)gateHide();else gWelcome();
}
function clAuthBackIn(){const e=$('sue');const em=e?e.value:'';if(GS.upg){gateHide();clAuthOpen('in','',em);}else{window.__clGo='in';gateHide();pfGuest(true);}}
function suNext1(){
  const n=gv('gname').trim();GS.name=n;
  if(!n){$('gmsg').textContent=t('pfNeedName');return;}
  gSignup(2);
}
async function suGo(){
  const m=$('gmsg'),em=gv('sue').trim().toLowerCase(),pw=gv('npw'),c=gv('npw2');
  GS.em=em;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){m.textContent=t('clBadEmail');return;}
  if(!pfRulesOk(pfRules(pw,em))||!pfRulesOk(pfRules(pw,GS.name||''))){m.textContent=t('pfWeak');return;}
  if(pw!==c){m.textContent=t('pfNoMatch');return;}
  const b=$('sugo');if(b)b.disabled=true;m.textContent=t('clWait');
  let cur=pfCur();
  if(!cur){window.__gKeep=1;pfGuest(true);cur=pfCur();if(!cur){window.__gKeep=0;gSignup(2);$('gmsg').textContent=t('pfMax');return;}}
  window.__gKeep=1;window.__clGate=1;window.__clProf={id:cur.id,name:GS.name,av:GS.av};
  clSubmit('up',{em:em,pw:pw,err:function(msg){window.__gKeep=0;window.__clGate=0;gSignup(2);const x=$('gmsg');if(x)x.textContent=msg;}});
}
/* a guest turns into a real profile: same data, now protected / el invitado pasa a perfil real: mismos datos, ahora protegidos */
function gSave(){const p=pfCur();if(!p||!p.g)return;GS={};if(typeof cloudOn==='function'&&cloudOn()){sheetClose();gSignup(1,{upg:true});return;}gNew(1,{upg:p.id});}
function guestNag(){
  const p=pfCur();if(!p||!p.g||(typeof CL!=='undefined'&&CL&&CL.dek))return;
  const cl=typeof cloudOn==='function'&&cloudOn();
  if(window.__gnT)return;
  const show=function(n){
    window.__gnT=0;
    const q=pfCur();if(!q||!q.g||(typeof CL!=='undefined'&&CL&&CL.dek))return;
    if(!$('sheetov').hidden||!$('gate').hidden||(typeof ACT!=='undefined'&&ACT)){if(n<6)window.__gnT=setTimeout(function(){show(n+1);},30000);return;}
    let last=0;try{last=+localStorage.getItem('bl_gn')||0;}catch(e){}
    if(Date.now()-last<(cl?864e5:7*864e5))return;
    if(!cl&&!(DATA&&DATA.workouts&&DATA.workouts.length))return;
    try{localStorage.setItem('bl_gn',String(Date.now()));}catch(e){}
    if(cl)sheet('<div class="sum"><div class="sum-e">☁️</div><h3>'+t('gnCT')+'</h3><p class="muted">'+t('gnCP')+'</p><div class="row"><button class="btn pri wide" onclick="sheetClose();gSignup(1,{upg:true})">'+t('clCreate')+'</button></div><div class="row"><button class="btn wide" onclick="clAuthOpen(\'in\')">'+t('wIn')+'</button></div><button class="lnk-d" onclick="sheetClose()">'+t('gnNo')+'</button></div>');
    else sheet('<div class="sum"><div class="sum-e">💾</div><h3>'+t('gnT')+'</h3><p class="muted">'+t('gnP')+'</p><div class="row"><button class="btn" onclick="sheetClose()">'+t('gnNo')+'</button><button class="btn pri" onclick="sheetClose();gSave()">'+t('gnYes')+'</button></div></div>');
  };
  window.__gnT=setTimeout(function(){show(0);},cl?25000:0);
}

/* who's training? / ¿quién entrena? */
function gPick(edit){
  GS={redraw:function(){gPick(edit);}};
  const tiles=PFS.map(p=>'<button class="pf-tile" onclick="'+(edit?(p.g?'gDelete':'gEdit')+'(\''+p.id+'\')':'gPw(\''+p.id+'\')')+'">'+avHtml(p.av,edit?84:92)+(edit?'<i class="pf-pen">'+(p.g?'🗑':'✎')+'</i>':'')+'<b>'+esc(pfName(p))+'</b></button>').join('')+
    (PFS.length<PF_MAX&&!edit&&!PFS.some(x=>x.g)?'<button class="pf-tile wrap" onclick="pfGuest()"><span class="av av-add" style="width:92px;height:92px">👤</span><b>'+t('pfGuestB')+'</b></button>':'')+
    (PFS.length<PF_MAX&&!edit?'<button class="pf-tile" onclick="gAdd()"><span class="av av-add" style="width:92px;height:92px">＋</span><b>'+t(typeof cloudOn==='function'&&cloudOn()?'wAcctTile':'pfAdd')+'</b></button>':'');
  gateShow('<div class="g-top"><span></span><button class="g-link" onclick="gPick('+(edit?'false':'true')+')">'+(edit?t('done'):t('edit'))+'</button></div><h1 class="lt g-h">'+t('pfWho')+'</h1><div class="pf-grid">'+tiles+'</div>'+gLang());
}
function gAdd(){
  if(typeof cloudOn==='function'&&cloudOn()){gWelcome(1);return;} // accounts only: sign in or create one / solo cuentas
  gateShow('<div class="g-top"><button class="g-link" onclick="gPick()">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfAdd')+'</h1>'+
    '<div class="menu"><button onclick="gNew(1,{})">✨ '+t('pfNew')+'</button>'+(PFS.some(x=>x.g)?'':'<button onclick="pfGuest()">👤 '+t('pfGuestB')+'</button>')+'<button onclick="gRecv()">📲 '+t('pfBring')+'</button></div>'+(PFS.some(x=>x.g)?'':'<p class="muted sm g-c">'+t('pfGuestP')+'</p>')+gLang());
  GS={redraw:gAdd};
}

/* password prompt / contraseña */
function gPw(id){
  const p=pfGet(id);if(!p)return gPick();
  if(!p.pw){pfEnter(id,null,null,false,1);return;}
  const rk=p.enc&&pfRemKey(id);if(rk){pfEnter(id,rk,null,false,1);return;}
  GS={redraw:function(){gPw(id);}};
  const w=pfWait('p',id);
  gateShow('<div class="g-top"><button class="g-link" onclick="gPick()">‹ '+t('pfSwitch')+'</button><span></span></div><div class="g-c">'+avHtml(p.av,96)+'<h2 class="g-n">'+esc(p.name)+'</h2></div>'+
    '<div class="g-form"><label>'+t('pfPw')+'<span class="pw-w"><input id="gpw" class="in wide" type="password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')pfLogin(\''+id+'\')"><button class="pw-eye" type="button" onclick="pfEye(\'gpw\',this)">'+t('pfShow')+'</button></span></label>'+
    '<p id="gmsg" class="g-msg">'+(w?t('pfWait',pfWaitTxt(w)):'')+'</p>'+
    '<label class="chk-l"><input id="grm" type="checkbox" checked><span>'+t('pfRemChk')+'<small class="muted" style="display:block">'+t('pfRemP')+'</small></span></label>'+
    '<button class="btn pri big wide" onclick="pfLogin(\''+id+'\')">'+t('pfSignIn')+'</button>'+
    '<button class="btn wide" onclick="gForgot(\''+id+'\')">'+t('pfForgot')+'</button></div>'+gLang());
}
function pfEye(id,b){const e=$(id);if(!e)return;const h=e.type==='password';e.type=h?'text':'password';b.textContent=h?t('pfHide'):t('pfShow');}
async function pfLogin(id){
  const p=pfGet(id),m=$('gmsg');if(!p||!m)return;
  const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  const pw=gv('gpw'),rmOn=!!($('grm')&&$('grm').checked);
  if(!pw){m.textContent=t('pfNeedPw');return;}
  m.textContent='…';let ok=false;
  try{ok=await pfCheck(pw,p.pw);}catch(e){m.textContent=t('pfNoCrypto');return;}
  if(ok){
    pfOk('p',id);let raw=null,mig=false;
    try{
      if(p.enc)raw=await pfUnwrap(pw,p.enc.wp);
      else if(hasCrypto()){raw=pfNewKey();p.enc={wp:await pfWrap(pw,raw),wq:null};p.qs=[];p.rm=0;pfSave();mig=true;} // upgrade older profile / actualizar perfil anterior
    }catch(e){m.textContent=t('pfDataBad');return;}
    if(p.enc)pfRemSet(id,raw,rmOn);
    await pfEnter(id,raw,null,false,1);
    if(mig)setTimeout(function(){toast(t('pfMig'));gQuest(id);},400);
    return;
  }
  const x=pfFail('p',id),left=Math.max(0,3-x.n);
  m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',left);
}

/* forgot password: answer the 3 questions / recuperar: responde las 3 preguntas */
function gForgot(id){
  const p=pfGet(id);if(!p)return gPick();
  GS={redraw:function(){gForgot(id);}};
  if(!p.qs.length||(p.enc&&!p.enc.wq)){gateShow('<div class="g-top"><button class="g-link" onclick="gPw(\''+id+'\')">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfRecT')+'</h1><p class="muted">'+t('pfNoQ')+'</p>'+gLang());return;}
  gateShow('<div class="g-top"><button class="g-link" onclick="gPw(\''+id+'\')">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfRecT')+'</h1><p class="muted">'+t('pfRecP')+'</p><div class="g-form">'+
    p.qs.map((q,i)=>'<label>'+t('pfQ'+q.i)+'<input id="ga'+i+'" class="in wide" autocomplete="off" autocapitalize="off"></label>').join('')+
    '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfRecover(\''+id+'\')">'+t('pfVerify')+'</button></div>'+gLang());
}
async function pfRecover(id){
  const p=pfGet(id),m=$('gmsg');if(!p||!m)return;
  const w=pfWait('q',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  m.textContent='…';let good=0;GS.raw=null;
  try{
    if(p.enc){if(!p.enc.wq)throw new Error('noq');try{GS.raw=await pfUnwrap(pfAnsKey(p.qs.map((q,i)=>gv('ga'+i))),p.enc.wq);good=p.qs.length;}catch(e){good=-1;}}
    else for(let i=0;i<p.qs.length;i++)if(await pfCheck(pfNormAns(gv('ga'+i)),p.qs[i]))good++;
  }catch(e){m.textContent=t('pfNoCrypto');return;}
  if(good===p.qs.length){pfOk('q',id);gSetPw(id);return;}
  const x=pfFail('q',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('q',id))):t('pfRecBad');
}
/* set a new password (recovery or change) / nueva contraseña */
function gSetPw(id,inApp){
  const p=pfGet(id);if(!p)return gPick();
  GS={raw:GS&&GS.raw,redraw:function(){gSetPw(id,inApp);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="'+(inApp?'gateHide()':'gPw(\''+id+'\')')+'">'+(inApp?t('cancel'):'‹ '+t('back'))+'</button><span></span></div><h1 class="lt g-h">'+t(inApp?'pfChange':'pfRecT')+'</h1><div class="g-form">'+
    (inApp?'<label>'+t('pfCurPw')+'<input id="gcur" class="in wide" type="password" autocomplete="current-password"></label>':'')+
    pfPwFields(p.name)+'<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfDoSetPw(\''+id+'\','+(inApp?1:0)+')">'+t('save')+'</button></div>');
}
async function pfDoSetPw(id,inApp){
  const p=pfGet(id),m=$('gmsg');if(!p||!m)return;
  const pw=gv('npw'),c=gv('npw2');
  if(!pfRulesOk(pfRules(pw,p.name))){m.textContent=t('pfWeak');return;}
  if(pw!==c){m.textContent=t('pfNoMatch');return;}
  m.textContent='…';
  try{
    if(inApp){const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
      if(!(await pfCheck(gv('gcur'),p.pw))){const x=pfFail('p',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',Math.max(0,3-x.n));return;}
      pfOk('p',id);}
    const raw=inApp?(ENC&&ENC.raw):GS.raw;
    const np=await pfHash(pw),wp=(p.enc&&raw)?await pfWrap(pw,raw):null;
    if(p.enc&&!wp)throw new Error('raw');
    p.pw=np;if(wp)p.enc.wp=wp;pfSave();pfOk('p',id);
    if(!inApp){const r=GS.raw;GS={};await pfEnter(id,r||null);return;}
  }catch(e){m.textContent=t('pfNoCrypto');return;}
  gateHide();toast(t('saved'));
}
/* password + confirm with live rules and meter / contraseña y confirmación con reglas y medidor */
function pfPwFields(name){
  return'<label>'+t('pfPw')+'<span class="pw-w"><input id="npw" class="in wide" type="password" autocomplete="new-password" oninput="pfPwLive(\''+esc(name).replace(/'/g,'')+'\')"><button class="pw-eye" type="button" onclick="pfEye(\'npw\',this)">'+t('pfShow')+'</button></span></label>'+
    '<div class="meter"><i id="mt0"></i><i id="mt1"></i><i id="mt2"></i></div><p id="mtl" class="sm muted"></p><ul id="rl" class="rules"></ul>'+
    '<label>'+t('pfPw2')+'<input id="npw2" class="in wide" type="password" autocomplete="new-password" oninput="pfPwLive()"></label><p id="mm" class="sm"></p>';
}
function pfPwLive(name){
  if(name!==undefined)GS.nm=name;
  const gm=$('gmsg');if(gm)gm.textContent='';
  const pw=gv('npw'),r=pfRules(pw,GS.nm||''),s=pfStrength(pw);
  [0,1,2].forEach(i=>{const e=$('mt'+i);if(e)e.className=(pw&&pfRulesOk(r)&&i<s)?'on s'+s:'';});
  const l=$('mtl');if(l)l.textContent=pw?(pfRulesOk(r)?t('pfS'+s):t('pfS0')):'';
  const rl=$('rl');if(rl)rl.innerHTML=[['len','pfR1'],['let','pfR2'],['num','pfR3'],['common','pfR4']].map(x=>'<li class="'+(r[x[0]]?'ok':'')+'">'+(r[x[0]]?'✓ ':'○ ')+t(x[1])+'</li>').join('');
  const c=gv('npw2'),mm=$('mm');if(mm){mm.textContent=c?(c===pw?'✓ '+t('pfMatch'):t('pfNoMatch')):'';mm.className='sm '+(c&&c===pw?'okt':'');}
}

/* create profile: 1 name+avatar · 2 password · 3 recovery questions / crear perfil */
function gNew(step,o){
  if(o)GS=Object.assign(GS.step?GS:{},o);
  if(!GS.av)GS.av=pfRandAv();
  if(GS.name===undefined)GS.name='';
  GS.step=step;GS.redraw=function(){gNew(GS.step);};
  const first=!!GS.first,back='<button class="g-link" onclick="'+(step===1?(first?'gWelcome()':GS.upg?'gateHide()':'gAdd()'):'gNew('+(step-1)+')')+'">‹ '+t('back')+'</button>';
  let b='';
  if(step===1){
    b='<div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form"><label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+
      (first&&pfHasLegacy()?'<p class="note">'+t('pfLegacy')+'</p>':'')+(GS.upg?'<p class="note">'+t('pfUpNote')+'</p>':'')+'<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="gNewNext1()">'+t('next')+' ›</button>'+(first&&!PFS.length?'<button class="btn wide" onclick="gRecv()">📲 '+t('pfBring')+'</button>':'')+'</div>';
  }else if(step===2){
    b='<h1 class="lt g-h">'+t('pfPw')+'</h1><p class="muted">'+t('pfPwP')+'</p><div class="g-form">'+(hasCrypto()?pfPwFields(GS.name):'<p class="note">'+t('pfNoCrypto')+'</p>')+
      '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="gNewNext2()">'+t('next')+' ›</button></div>';
  }else{
    b='<h1 class="lt g-h">'+t('pfQT')+'</h1><p class="muted">'+t('pfQP')+'</p><div class="g-form">'+[0,1,2].map(i=>qBlock(i,GS.q&&GS.q[i])).join('')+
      '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="gNewDone()">'+t('pfCreate')+'</button></div>';
  }
  gateShow('<div class="g-top">'+(back||'<span></span>')+'<span class="muted sm">'+t('psStep',step,3)+'</span></div>'+(step===1?'<h1 class="lt g-h">'+t('pfNewT')+'</h1>':'')+b+gLang());
  if(step===2&&hasCrypto())pfPwLive(GS.name);
}
function qBlock(i,cur){
  cur=cur||{i:i,a:''};
  return'<div class="qb"><select id="gq'+i+'" class="in wide">'+Array.from({length:PF_QN},(_,k)=>'<option value="'+k+'"'+(k===cur.i?' selected':'')+'>'+esc(t('pfQ'+k))+'</option>').join('')+'</select><input id="ga'+i+'" class="in wide" placeholder="'+esc(t('pfAns'))+'" autocomplete="off" autocapitalize="off" value="'+esc(cur.a||'')+'"></div>';
}
function avPicker(){
  return'<div class="lbl">'+t('pfAvatar')+'</div><div class="av-sug">'+AVP.map(n=>'<button class="av-s'+(GS.av.k==='p'&&GS.av.p===n?' on':'')+'" onclick="pfPickPre(\''+n+'\')" aria-label="'+t('pfAvatar')+' '+n+'"><img alt="" loading="lazy" src="img/av/'+n+'.webp"></button>').join('')+'</div>';
}
function pfAvRedraw(){const n=$('gname');if(n)GS.name=n.value;if(GS.redraw)GS.redraw();}
function pfPickPre(n){ // change the choice in place: no redraw, so the list keeps its scroll / cambia la selección sin redibujar: la lista no salta arriba
  GS.av={k:'p',p:n};
  const pv=$('avprev');
  if(!pv){pfAvRedraw();return;}
  pv.innerHTML=avHtml(GS.av,104);
  document.querySelectorAll('.av-sug .av-s').forEach(function(b){const im=b.querySelector('img');b.classList.toggle('on',!!im&&im.getAttribute('src')==='img/av/'+n+'.webp');});
}
function gNewNext1(){
  const n=gv('gname').trim();GS.name=n;
  if(!n){$('gmsg').textContent=t('pfNeedName');return;}
  gNew(2);
}
function gNewNext2(){
  if(!hasCrypto()){GS.pw1='';GS.nopw=true;gNew(3);return;}
  const pw=gv('npw'),c=gv('npw2'),m=$('gmsg');
  if(!pfRulesOk(pfRules(pw,GS.name))){m.textContent=t('pfWeak');return;}
  if(pw!==c){m.textContent=t('pfNoMatch');return;}
  GS.pw1=pw;gNew(3);
}
async function gNewDone(){
  const m=$('gmsg');
  const q=[0,1,2].map(i=>({i:+gv('gq'+i),a:gv('ga'+i)}));
  if(new Set(q.map(x=>x.i)).size<3){m.textContent=t('pfQDup');return;}
  if(q.some(x=>pfNormAns(x.a).length<2)){m.textContent=t('pfQShort');return;}
  GS.q=q;m.textContent=t('pfSecuring');
  try{
    const prof={id:'p'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:GS.name,av:GS.av,pw:null,qs:[],enc:null,rm:0,t:Date.now()};
    let raw=null;
    if(hasCrypto()&&GS.pw1){
      raw=pfNewKey();prof.pw=await pfHash(GS.pw1);
      prof.qs=q.map(x=>({i:x.i})); // answers are never stored; they only unlock the key together / las respuestas no se guardan; solo abren la llave juntas
      prof.enc={wp:await pfWrap(GS.pw1,raw),wq:await pfWrap(pfAnsKey(q.map(x=>x.a)),raw)};
    }
    if(PFS.length>=PF_MAX){m.textContent=t('pfMax');return;}
    const gid=GS.upg&&pfGet(GS.upg)&&pfGet(GS.upg).g?GS.upg:null;
    if(gid){try{saveData();saveAct();}catch(e){}}
    const first=PFS.length===0;PFS.push(prof);pfSave();
    const k=pfKeys(prof.id),lg=first?pfLegacy(prof.id):{map:{},del:[]};
    if(gid){ // move the guest's log into the new profile / mueve el registro del invitado al perfil nuevo
      const gk=pfKeys(gid);
      [[gk.d,k.d],[gk.s,k.s],[gk.a,k.a]].forEach(x=>{try{const v=localStorage.getItem(x[0]);if(v!=null)lg.map[x[1]]=v;}catch(e){}});
      lg.del=[gk.d,gk.s,gk.a];
    }
    if(!lg.map[k.s])lg.map[k.s]=JSON.stringify({lang:LANG});
    GS={};
    if(prof.enc){
      pfRemSet(prof.id,raw,true);
      await pfEnter(prof.id,raw,lg.map,!!gid);await pfFlush();
      try{lg.del.forEach(x=>localStorage.removeItem(x));}catch(e){} // plain copies removed only after the encrypted ones are written / se borran los originales solo después de guardar los cifrados
    }else{
      try{for(const kk in lg.map)localStorage.setItem(kk,lg.map[kk]);lg.del.forEach(x=>localStorage.removeItem(x));}catch(e){}
      await pfEnter(prof.id,null,null,!!gid);
    }
    if(gid){PFS=PFS.filter(x=>x.id!==gid);pfSave();try{sessionStorage.setItem('bl_up','1');}catch(e){}location.replace(location.pathname);}
  }catch(e){m.textContent=t('pfNoCrypto');}
}

/* edit profile (name, avatar); delete needs the password / editar perfil; borrar pide la contraseña */
function gEdit(id,inApp){
  const p=pfGet(id);if(!p)return gPick();
  GS={av:p.av,name:p.name,edit:{id:id,inApp:!!inApp},redraw:function(){gEdit(id,inApp);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="'+(inApp?'gateHide()':'gPick(true)')+'">'+t('cancel')+'</button><span></span></div><h1 class="lt g-h">'+t('pfEditT')+'</h1><div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form">'+
    '<label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+'<p id="gmsg" class="g-msg"></p>'+
    '<button class="btn pri big wide" onclick="pfEditSave(\''+id+'\','+(inApp?1:0)+')">'+t('save')+'</button>'+
    (inApp?'':'<div class="dz"><button class="btn danger" onclick="gDelete(\''+id+'\')">🗑 '+t('pfDel')+'</button></div>')+'</div>');
}
function pfEditSave(id,inApp){
  const p=pfGet(id),n=gv('gname').trim();if(!p)return;
  if(!n){$('gmsg').textContent=t('pfNeedName');return;}
  p.name=n.slice(0,20);p.av=pfAv(GS.av);pfSave();pfRenderAv();
  if(inApp){gateHide();toast(t('saved'));}else gPick(true);
}
function gDelete(id,inApp){
  const p=pfGet(id);if(!p)return;
  GS={redraw:function(){gDelete(id,inApp);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="'+(inApp?'gateHide()':(p.g?'gPick(true)':'gEdit(\''+id+'\')'))+'">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfDel')+'</h1><p class="muted">'+t('pfDelP',esc(pfName(p)))+'</p><div class="g-form">'+
    (p.pw?'<label>'+t('pfPw')+'<input id="gpw" class="in wide" type="password" autocomplete="current-password"></label>':'')+'<p id="gmsg" class="g-msg"></p><button class="btn danger big wide" onclick="pfDelete(\''+id+'\')">🗑 '+t('pfDel')+'</button></div>');
}
async function pfDelete(id){
  const p=pfGet(id),m=$('gmsg');if(!p)return;
  const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  try{if(p.pw&&!(await pfCheck(gv('gpw'),p.pw))){const x=pfFail('p',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',Math.max(0,3-x.n));return;}}catch(e){m.textContent=t('pfNoCrypto');return;}
  const cur=id===PFID;
  if(cur&&ENC){try{await pfFlush();}catch(e){}}
  if(cur){ENC=null;}
  const k=pfKeys(id);try{[k.d,k.s,k.a,'bl_thrp_'+id,'bl_thrq_'+id,'bl_rk_'+id].forEach(x=>localStorage.removeItem(x));}catch(e){}
  PFS=PFS.filter(x=>x.id!==id);pfSave();
  try{if(localStorage.getItem('bl_last')===id)localStorage.removeItem('bl_last');}catch(e){}
  if(cur){try{sessionStorage.removeItem('bl_sess');sessionStorage.removeItem('bl_sk');sessionStorage.setItem('bl_pick','1');}catch(e){}location.replace(location.pathname);return;}
  if(!PFS.length){GS={};gWelcome();}else gPick(true);
}

/* in-app profile menu (avatar button) / menú del perfil dentro de la app */
function pfMenu(){
  const p=pfCur();if(!p)return;
  if(p.g){
    sheet('<div class="form"><div class="g-c">'+avHtml(p.av,76)+'<h3 class="g-n">'+esc(pfName(p))+'</h3></div><div class="menu">'+(typeof cloudOn==='function'&&cloudOn()?'<button class="pri" onclick="sheetClose();gSignup(1,{upg:true})">☁ '+t('clCreate')+'</button><button onclick="clAuthOpen(\'in\')">'+t('wIn')+'</button><button onclick="sheetClose();gEdit(\''+p.id+'\',true)">✎ '+t('pfEditT')+'</button>':'<button class="pri" onclick="sheetClose();gSave()">💾 '+t('pfGuestSave')+'</button>')+'<button onclick="sheetClose();pfLeave()">⇄ '+t('pfSwitch')+'</button><button onclick="sheetClose();gDelete(\''+p.id+'\',true)">🗑 '+t('pfDelIn')+'</button></div>'+
      '<p class="muted sm">'+t('gnP')+'</p><div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
    return;
  }
  sheet('<div class="form"><div class="g-c">'+avHtml(p.av,76)+'<h3 class="g-n">'+esc(pfName(p))+'</h3></div><div class="menu">'+
    '<button onclick="sheetClose();pfLeave()">⇄ '+t('pfSwitch')+'</button><button onclick="sheetClose();gEdit(\''+p.id+'\',true)">✎ '+t('pfEditT')+'</button>'+
    (p.pw?'<button onclick="sheetClose();gSetPw(\''+p.id+'\',true)">🔑 '+t('pfChange')+'</button><button onclick="sheetClose();gQuest(\''+p.id+'\')">❓ '+t('pfQT')+'</button>':'')+
    (p.enc?'<button onclick="sheetClose();pfRemToggle()">'+(pfRemKey(p.id)?'🔓 '+t('pfRemOff'):'🔒 '+t('pfRemOn'))+'</button>':'')+
    '<button onclick="sheetClose();gSend()">📲 '+t('pfTx')+'</button><button onclick="sheetClose();gDelete(\''+p.id+'\',true)">🗑 '+t('pfDelIn')+'</button></div><p class="muted sm">'+t('pfNote')+'</p><div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
/* change security questions (needs the password) / cambiar preguntas (pide la contraseña) */
function gQuest(id){
  const p=pfGet(id);if(!p)return;
  GS={q:null,redraw:function(){gQuest(id);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="gateHide()">'+t('cancel')+'</button><span></span></div><h1 class="lt g-h">'+t('pfQT')+'</h1><p class="muted">'+t('pfQP')+'</p><div class="g-form">'+
    '<label>'+t('pfCurPw')+'<input id="gcur" class="in wide" type="password" autocomplete="current-password"></label>'+[0,1,2].map(i=>qBlock(i)).join('')+
    '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfQSave(\''+id+'\')">'+t('save')+'</button></div>');
}
async function pfQSave(id){
  const p=pfGet(id),m=$('gmsg');if(!p)return;
  const q=[0,1,2].map(i=>({i:+gv('gq'+i),a:gv('ga'+i)}));
  if(new Set(q.map(x=>x.i)).size<3){m.textContent=t('pfQDup');return;}
  if(q.some(x=>pfNormAns(x.a).length<2)){m.textContent=t('pfQShort');return;}
  const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  m.textContent=t('pfSecuring');
  try{
    if(!(await pfCheck(gv('gcur'),p.pw))){const x=pfFail('p',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',Math.max(0,3-x.n));return;}
    pfOk('p',id);
    if(p.enc&&ENC){p.enc.wq=await pfWrap(pfAnsKey(q.map(x=>x.a)),ENC.raw);p.qs=q.map(x=>({i:x.i}));}
    else p.qs=await Promise.all(q.map(async x=>Object.assign(await pfHash(pfNormAns(x.a)),{i:x.i})));
    pfSave();
  }catch(e){m.textContent=t('pfNoCrypto');return;}
  gateHide();toast(t('saved'));
}

/* ---------- phone-to-phone transfer by QR / transferencia por QR ----------
   One-time copy, not sync. The data is encrypted with an 8-digit PIN shown on the sending phone and split across looping QR frames.
   Copia única, no sincronización. Los datos se cifran con un PIN de 8 dígitos que muestra el teléfono de origen y se reparten en cuadros QR en bucle. */
const PF_CH=240,PF_IT2=120000;
function pfLib(src){return new Promise((ok,no)=>{const id='lib_'+src;if(document.getElementById(id)){ok();return;}const s=document.createElement('script');s.id=id;s.src=src;s.onload=ok;s.onerror=()=>{s.remove();no(new Error('lib'));};document.head.appendChild(s);});}
async function pfStream(bytes,mode){ // deflate-raw / inflate
  const cs=new (mode==='c'?CompressionStream:DecompressionStream)('deflate-raw');
  const w=cs.writable.getWriter();w.write(bytes);w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
async function pfAesKey(pin,salt,use){
  const bits=await pbk(pin,salt,PF_IT2,256);
  return crypto.subtle.importKey('raw',bits,'AES-GCM',false,[use]);
}
async function pfPack(payload,pin){
  let raw=new TextEncoder().encode(JSON.stringify(payload)),flag=0;
  if(window.CompressionStream){try{raw=await pfStream(raw,'c');flag=1;}catch(e){raw=new TextEncoder().encode(JSON.stringify(payload));flag=0;}}
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},await pfAesKey(pin,salt,'encrypt'),raw));
  const out=new Uint8Array(1+16+12+ct.length);out[0]=flag;out.set(salt,1);out.set(iv,17);out.set(ct,29);return out;
}
async function pfUnpack(bytes,pin){
  if(bytes.length<46)throw new Error('short');
  const flag=bytes[0],salt=bytes.slice(1,17),iv=bytes.slice(17,29),ct=bytes.slice(29);
  let raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},await pfAesKey(pin,salt,'decrypt'),ct));
  if(flag===1){if(!window.DecompressionStream)throw new Error('nodecomp');raw=await pfStream(raw,'d');}
  if(raw.length>8e6)throw new Error('big');
  return JSON.parse(new TextDecoder().decode(raw));
}
function pfFrames(bytes){
  const sid=Math.random().toString(36).slice(2,8).padEnd(6,'0'),n=Math.ceil(bytes.length/PF_CH),f=[];
  for(let i=0;i<n;i++)f.push('BL1.'+sid+'.'+i+'.'+n+'.'+b64(bytes.subarray(i*PF_CH,(i+1)*PF_CH)));
  return f;
}
function pfParseFrame(s){
  const m=/^BL1\.([a-z0-9]{6})\.(\d{1,4})\.(\d{1,4})\.([A-Za-z0-9+/]+={0,2})$/.exec(s||'');
  if(!m)return null;const i=+m[2],n=+m[3];if(!(n>=1&&n<=2000&&i<n))return null;
  return{sid:m[1],i:i,n:n,b:m[4]};
}
function pfJoin(parts,n){let len=0;const u=[];for(let i=0;i<n;i++){const x=unb64(parts[i]);u.push(x);len+=x.length;}const o=new Uint8Array(len);let p=0;u.forEach(x=>{o.set(x,p);p+=x.length;});return o;}
function pfQrSvg(text){
  const q=qrcode(0,'M');q.addData(text);q.make();const c=q.getModuleCount();let d='';
  for(let r=0;r<c;r++)for(let k=0;k<c;k++)if(q.isDark(r,k))d+='M'+(k+4)+' '+(r+4)+'h1v1h-1z';
  const z=c+8;
  return'<svg viewBox="0 0 '+z+' '+z+'" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="'+z+'" height="'+z+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
}

/* sender: confirm password, then loop QR frames / origen */
function gSend(){
  const p=pfCur();if(!p)return;
  GS={redraw:gSend};
  gateShow('<div class="g-top"><button class="g-link" onclick="gateHide()">'+t('cancel')+'</button><span></span></div><h1 class="lt g-h">'+t('pfTx')+'</h1><p class="muted">'+t('pfTxP')+'</p><div class="g-form">'+
    (hasCrypto()?'':'<p class="note">'+t('pfNoCrypto')+'</p>')+
    (p.pw?'<label>'+t('pfCurPw')+'<input id="gpw" class="in wide" type="password" autocomplete="current-password"></label>':'')+
    '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfSendGo()"'+(hasCrypto()?'':' disabled')+'>'+t('pfTxGo')+'</button></div>');
}
async function pfSendGo(){
  const p=pfCur(),m=$('gmsg');if(!p||!m)return;
  const w=pfWait('p',p.id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  m.textContent=t('pfSecuring');
  try{
    if(p.pw&&!(await pfCheck(gv('gpw'),p.pw))){const x=pfFail('p',p.id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',p.id))):t('pfWrong',Math.max(0,3-x.n));return;}
    pfOk('p',p.id);
    await pfLib('lib/qrcode.min.js');
    const n8=crypto.getRandomValues(new Uint32Array(2)),pin=String(n8[0]%10000).padStart(4,'0')+String(n8[1]%10000).padStart(4,'0');
    const bytes=await pfPack({v:1,p:{name:p.name,av:p.av,pw:p.pw,qs:p.qs,enc:p.enc},k:(p.enc&&ENC)?b64(ENC.raw):null,d:DATA,s:SET},pin);
    const fr=pfFrames(bytes);pfShowFrames(fr,pin);
  }catch(e){m.textContent=t('pfTxFail');}
}
function pfShowFrames(fr,pin){
  let i=0,paused=false;
  gateShow('<div class="g-top"><button class="g-link" onclick="gateHide()">'+t('done')+'</button><span></span></div><h1 class="lt g-h">'+t('pfTx')+'</h1>'+
    '<p class="muted">'+t('pfTxS1')+'</p><div id="qrbox" class="qrbox" onclick="PFQR.toggle()"></div><p id="qrinfo" class="sm muted c"></p>'+
    '<div class="pinbox"><span class="sm muted">'+t('pfPin')+'</span><b>'+pin.slice(0,4)+' '+pin.slice(4)+'</b></div><p class="muted sm">'+t('pfTxS2')+'</p>');
  const draw=()=>{$('qrbox').innerHTML=pfQrSvg(fr[i]);$('qrinfo').textContent=t('pfFrame',i+1,fr.length)+(paused?' · '+t('pfPaused'):'');};
  window.PFQR={toggle:function(){paused=!paused;draw();}};
  draw();const iv=setInterval(()=>{if(paused||!$('qrbox'))return;i=(i+1)%fr.length;draw();},220);
  PFSTOP=function(){clearInterval(iv);window.PFQR=null;};
}

/* receiver: scan frames, ask PIN, decrypt, add profile / destino */
function gRecv(){
  GS={redraw:gRecv};
  const back=PFS.length?'gAdd()':'gWelcome()';
  gateShow('<div class="g-top"><button class="g-link" onclick="'+back+'">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfBring')+'</h1><p class="muted">'+t('pfRxP')+'</p>'+
    (PFS.length>=PF_MAX?'<p class="note">'+t('pfMax')+'</p>':(hasCrypto()?'<div class="g-form"><button class="btn pri big wide" onclick="pfScan()">📷 '+t('pfScan')+'</button></div>':'<p class="note">'+t('pfNoCrypto')+'</p>'))+'<p id="gmsg" class="g-msg"></p>'+gLang());
}
async function pfScan(){
  const m=$('gmsg');
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('cam');
    await pfLib('lib/jsqr.min.js');
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
    gateShow('<div class="g-top"><button class="g-link" onclick="gRecv()">'+t('cancel')+'</button><span></span></div><h1 class="lt g-h">'+t('pfBring')+'</h1><video id="cam" class="cam" playsinline muted></video><p id="gmsg" class="g-msg c">'+t('pfAim')+'</p><div class="meter big"><i id="scbar" style="width:0%"></i></div>');
    const v=$('cam'),cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
    v.srcObject=stream;await v.play();
    const parts={};let sid=null,n=0,got=0,alive=true,done=false;
    const tick=function(){
      if(!alive)return;
      if(v.videoWidth){
        const sc=Math.min(1,640/v.videoWidth);cv.width=Math.round(v.videoWidth*sc);cv.height=Math.round(v.videoHeight*sc);
        cx.drawImage(v,0,0,cv.width,cv.height);
        const r=jsQR(cx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'}),f=r&&pfParseFrame(r.data);
        if(f){
          if(sid!==f.sid){sid=f.sid;n=f.n;got=0;for(const k in parts)delete parts[k];}
          if(f.n===n&&parts[f.i]===undefined){parts[f.i]=f.b;got++;const b=$('scbar');if(b)b.style.width=Math.round(got/n*100)+'%';const mm=$('gmsg');if(mm)mm.textContent=t('pfGot',got,n);}
          if(got===n&&!done){done=true;alive=false;stream.getTracks().forEach(x=>x.stop());gRecvPin(pfJoin(parts,n));return;}
        }
      }
      requestAnimationFrame(tick);
    };
    PFSTOP=function(){alive=false;try{stream.getTracks().forEach(x=>x.stop());}catch(e){}};
    requestAnimationFrame(tick);
  }catch(e){if(m)m.textContent=t(e&&e.name==='NotAllowedError'?'pfCamDenied':'pfCamFail');}
}
function gRecvPin(bytes){
  GS={redraw:function(){gRecvPin(bytes);}};
  gateShow('<h1 class="lt g-h">'+t('pfPinT')+'</h1><p class="muted">'+t('pfPinP')+'</p><div class="g-form"><input id="gpin" class="in wide pin-in" inputmode="numeric" maxlength="9" autocomplete="off" placeholder="0000 0000" onkeydown="if(event.key===\'Enter\')pfRecvGo()"><p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfRecvGo()">'+t('continue')+'</button><button class="btn wide" onclick="gRecv()">'+t('cancel')+'</button></div>');
  GS.bytes=bytes;
}
function pfSafeData(d){
  if(!d||typeof d!=='object')throw new Error('data');
  const o={workouts:[],routines:[],body:[],custom:[],plan:null};
  ['workouts','routines','body','custom'].forEach(k=>{o[k]=Array.isArray(d[k])?d[k].filter(x=>x&&typeof x==='object'):[];});
  o.plan=typeof cleanPlan==='function'?cleanPlan(d.plan):null;
  return o;
}
function pfSafeSet(s){
  s=s&&typeof s==='object'?s:{};const o={};
  if(s.lang==='es'||s.lang==='en')o.lang=s.lang;
  if(['system','light','dark'].indexOf(s.theme)>=0)o.theme=s.theme;
  if(s.units&&typeof s.units==='object')o.units=s.units;else if(typeof s.units==='string')o.units=s.units;
  if(isFinite(s.rest)&&s.rest>=0&&s.rest<=1800)o.rest=+s.rest;
  if(typeof s.auto==='boolean')o.auto=s.auto;
  if(typeof s.sound==='boolean')o.sound=s.sound;
  if(s.goal&&typeof s.goal==='object')o.goal=s.goal;
  return o;
}
async function pfRecvGo(){
  const m=$('gmsg'),pin=gv('gpin').replace(/\D/g,'');
  if(pin.length!==8){m.textContent=t('pfPinBad');return;}
  const w=pfWait('x','rx');if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  m.textContent=t('pfSecuring');let pl;
  try{pl=await pfUnpack(GS.bytes,pin);}catch(e){const x=pfFail('x','rx');m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('x','rx'))):t('pfPinBad');return;}
  try{
    pfOk('x','rx');
    if(!pl||pl.v!==1||!pl.p)throw new Error('fmt');
    if(PFS.length>=PF_MAX){m.textContent=t('pfMax');return;}
    const base=pfClean({id:'p'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:pl.p.name,av:pl.p.av,pw:pl.p.pw,qs:pl.p.qs,enc:pl.p.enc,rm:0,t:Date.now()});
    if(!base)throw new Error('prof');
    const k=pfKeys(base.id),set=pfSafeSet(pl.s),data=pfSafeData(pl.d);
    if(!set.lang)set.lang=LANG;
    PFS.push(base);pfSave();GS={};
    if(base.enc){
      const raw=typeof pl.k==='string'&&B64_RE.test(pl.k)?unb64(pl.k):null;
      if(!raw||raw.length!==32){PFS.pop();pfSave();throw new Error('key');}
      const seed={};seed[k.d]=JSON.stringify(data);seed[k.s]=JSON.stringify(set);
      pfRemSet(base.id,raw,true);
      await pfEnter(base.id,raw,seed);
    }else{
      if(!jset(k.d,data)||!jset(k.s,set)){PFS.pop();pfSave();throw new Error('save');}
      await pfEnter(base.id,null);
    }
  }catch(e){m.textContent=t('pfTxBad');}
}
