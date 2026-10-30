'use strict';
/* Profiles on this device (guest or cloud account), sign-in screens, avatars and the shared key helpers the cloud vault uses.
   Perfiles en este dispositivo (invitado o cuenta en la nube), pantallas de acceso, avatares y las funciones de llave que usa la bóveda en la nube. */
const PF_MAX=5,PF_ITER=150000,PF_IT2=120000;
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
function pfClean(p){
  if(!p||typeof p!=='object'||typeof p.id!=='string'||!/^[a-z0-9]{3,24}$/.test(p.id))return null;
  return{id:p.id,name:String(p.name||'').trim().slice(0,20)||'Profile',av:pfAv(p.av),t:+p.t||Date.now(),g:p.g&&!p.acct?1:0,tmp:(p.g&&p.tmp)?1:0,acct:p.acct?1:0,old:(!p.g&&!p.acct&&(p.pw||p.enc))?1:0};
}
function pfLoad(){const a=jget('bl_profiles',[]);PFS=(Array.isArray(a)?a:[]).map(pfClean).filter(Boolean).slice(0,PF_MAX);return PFS;}
function pfSave(){jset('bl_profiles',PFS);}
const pfGet=id=>PFS.find(p=>p.id===id);
const pfName=p=>p.g?t('pfGuest'):p.name; // guests are shown in the current language / el invitado se muestra en el idioma actual
const pfCur=()=>pfGet(PFID);

function b64(buf){let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
async function pbk(text,salt,iter,bits){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(text),'PBKDF2',false,['deriveBits']);
  return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:iter,hash:'SHA-256'},k,bits||256);
}
/* ---------- key wrapping (used by the cloud vault) / envoltura de llaves (la usa la bóveda en la nube) ---------- */
async function pfAesKey(pin,salt,use){
  const bits=await pbk(pin,salt,PF_IT2,256);
  return crypto.subtle.importKey('raw',bits,'AES-GCM',false,[use]);
}
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
const pfNewKey=()=>crypto.getRandomValues(new Uint8Array(32));

/* password rules and strength / reglas y fuerza de la contraseña */
const pfNormAns=a=>String(a||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
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

/* ---------- avatars ---------- */
function avHtml(av,sz){
  av=pfAv(av);
  return'<span class="av av-p" style="width:'+sz+'px;height:'+sz+'px"><img alt="" src="img/av/'+av.p+'.webp"></span>';
}
function pfRenderAv(){const b=$('avBtn');if(!b)return;const p=pfCur();if(!p){b.hidden=true;return;}b.hidden=false;b.innerHTML=avHtml(p.av,32);b.setAttribute('aria-label',pfName(p));}

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
/* profiles made by the retired local-password system are skipped (their data is left untouched) / los perfiles del sistema anterior de contraseña local se omiten (sus datos no se tocan) */
const pfIsOld=p=>!!p.old;
async function boot(){
  pfLoad();pfDropTmp();PFS=PFS.filter(x=>!pfIsOld(x));
  let sess=null,last=null,pick=null,oh=null;
  try{sess=sessionStorage.getItem('bl_sess');last=localStorage.getItem('bl_last');pick=sessionStorage.getItem('bl_pick');sessionStorage.removeItem('bl_pick');oh=sessionStorage.getItem('bl_clh');}catch(e){}
  pfPrefs();
  const cl=typeof cloudOn==='function'&&cloudOn();
  const p=pfGet(sess);
  if(p){await pfEnter(p.id);return;}
  if(!PFS.length&&oh&&/access_token=/.test(oh)&&cl){pfGuest();return;} // back from Google with no profile yet / de vuelta de Google sin perfil
  if(!PFS.length){if(typeof clProv==='function')await clProv();gWelcome();return;}
  if(pick&&cl){gWelcome(1);return;}
  await pfEnter((pfGet(last)||PFS[0]).id,false,1);
}
/* language/theme before sign-in (kept in plain, non-sensitive keys) / idioma y tema antes de entrar (claves simples, no sensibles) */
function pfPrefs(){
  let l=null,th=null;try{l=localStorage.getItem('bl_lang');th=localStorage.getItem('bl_theme');}catch(e){}
  SET={theme:th||'system'};LANG=(l||(/^es/i.test(navigator.language||'')?'es':'en'))==='es'?'es':'en';
  document.documentElement.lang=LANG;applyTheme();
}
async function pfEnter(id,noBoot,spl){
  const p=pfGet(id);if(!p){gWelcome();return;}
  const k=pfKeys(id);
  PFID=id;K_DATA=k.d;K_SET=k.s;K_ACT=k.a;
  try{sessionStorage.setItem('bl_sess',id);localStorage.setItem('bl_last',id);}catch(e){}
  if(noBoot)return;
  if(spl)pfSplash(p);
  if(!window.__gKeep)gateHide();pfRenderAv();bootApp();
  if(typeof clInit==='function')clInit();
}
function pfLeave(){
  const go=function(){
    try{sessionStorage.removeItem('bl_sess');sessionStorage.setItem('bl_pick','1');}catch(e){}
    location.replace(location.pathname);
  };
  try{stopRest();unwake();}catch(e){}
  go();
}
/* ---------- gate (full-screen sign-in area) ---------- */
let PFSTOP=null;function pfStopAll(){if(PFSTOP){try{PFSTOP();}catch(e){}PFSTOP=null;}}
function gateShow(html){pfStopAll();const g=$('gate'),was=!g.hidden,st=g.scrollTop,h0=was&&g.querySelector('h1')?g.querySelector('h1').textContent:null;g.innerHTML='<div class="gate-in">'+html+'</div>';g.hidden=false;document.body.classList.add('noscroll');const h1=g.querySelector('h1');g.scrollTop=(was&&(window.__gSame||(h0!==null&&h1&&h1.textContent===h0)))?st:0;}
function gateHide(){pfStopAll();const g=$('gate');if(!g.hidden&&typeof ghostOut==='function')ghostOut(g);g.hidden=true;g.innerHTML='';document.body.classList.remove('noscroll');}
const gv=id=>{const e=$(id);return e?e.value:'';};
function gLang(){return'<div class="g-lang"><button onclick="pfSetLang(\'en\')"'+(LANG==='en'?' class="on"':'')+'>English</button><button onclick="pfSetLang(\'es\')"'+(LANG==='es'?' class="on"':'')+'>Español</button></div>';}
function pfSetLang(l){LANG=l==='es'?'es':'en';try{localStorage.setItem('bl_lang',LANG);}catch(e){}document.documentElement.lang=LANG;const f=GS.redraw;window.__gSame=1;try{if(f)f();else gWelcome();}finally{window.__gSame=0;}}

/* first screen: create a profile or just try it as a guest / primera pantalla: crear perfil o probar como invitado */
function gWelcome(back){
  GS={redraw:function(){gWelcome(back);},back:!!back};
  const cl=typeof cloudOn==='function'&&cloudOn();
  gateShow('<div class="wel-hero"><div class="wel-logo">'+ic('barbell')+'</div><h1>Bubylift</h1><p>'+t('wTag')+'</p></div>'+
    '<div class="g-form wel-act">'+(cl&&typeof oaBtn==='function'?oaBtn()+oaOr():'')+(cl?'<button class="btn pri big wide" onclick="gAcct(\'up\')">'+t('wSignUp')+'</button>'+
    '<button class="btn big wide" onclick="gAcct(\'in\')">'+t('wLogIn')+'</button>':'')+
    '<button class="btn '+(cl?'':'pri big ')+'wide wel-guest" onclick="pfGuest()">'+t('wGuestB')+'</button><p class="muted sm g-c">'+t('wGuestN')+'</p><p id="gmsg" class="g-msg"></p></div>'+
    (GS.back&&PFS.length?'<button class="lnk-d g-c" onclick="gBack()">← '+t('wBack',esc(pfName(PFS[0])))+'</button>':'')+gLang());
}
function gBack(){const q=pfGet((function(){try{return localStorage.getItem('bl_last');}catch(e){return null;}})())||PFS[0];if(q)pfEnter(q.id,false,1);else gWelcome();}
/* create account / sign in from the first screen: start as a guest, then open the account sheet / cuenta desde la primera pantalla */
function gAcct(mode){if(mode==='up'){gSignup(1,{});return;}gSignin('','');}
function pfGuest(tmp){
  const eg=PFS.find(x=>x.g);
  if(eg){if(tmp!==true&&eg.tmp){eg.tmp=0;pfSave();}pfEnter(eg.id);return;}
  if(PFS.length>=PF_MAX)return;
  const prof={id:'g'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:'Guest',av:pfRandAv(),t:Date.now(),g:1,tmp:tmp===true?1:0};
  const k=pfKeys(prof.id);
  try{localStorage.setItem(k.s,JSON.stringify({lang:LANG}));}catch(e){const m=$('gmsg');if(m)m.textContent=t('pfTxBad');return;}
  PFS.push(prof);pfSave();GS={};
  pfEnter(prof.id);
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
    b='<h1 class="lt g-h">'+t('suT')+'</h1><p class="muted">'+t('suEP')+'</p><div class="g-form">'+oaBtn()+oaOr()+'<label>'+t('clEmail')+'<input id="sue" class="in wide" type="email" autocomplete="email" inputmode="email" value="'+esc(GS.em||'')+'"></label>'+
      '<label>'+t('pfPw')+'<span class="pw-w"><input id="npw" class="in wide" type="password" autocomplete="new-password" value="'+esc(GS.pw||'')+'" oninput="pfPwLive(\'\')"><button class="pw-eye" type="button" onclick="pfEye(\'npw\',this)">'+t('pfShow')+'</button></span></label>'+
      '<div class="meter"><i id="mt0"></i><i id="mt1"></i><i id="mt2"></i></div><p id="mtl" class="sm muted"></p><ul id="rl" class="rules"></ul>'+
      '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="suNext1()">'+t('next')+'</button>'+
      '<p class="muted sm g-c">'+t('suSafe')+'</p><button class="btn wide" onclick="gSignin($(\'sue\').value,\'\')">'+t('wHaveAcct')+'</button></div>';
  }else{
    b='<h1 class="lt g-h">'+t('suProfT')+'</h1><p class="muted">'+t('suProfP')+'</p><div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form"><label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+
      '<label class="clchk"><input type="checkbox" id="gtour"'+(GS.tour===false?'':' checked')+'> '+t('tourSign')+'</label><p id="gmsg" class="g-msg"></p><button class="btn pri big wide" id="sugo" onclick="suGo()">'+t('clCreate')+'</button></div>';
  }
  gateShow(top+b+gLang());
  if(step===1)pfPwLive('');
}
/* sign in: one full screen, e-mail + password, nothing else / iniciar sesión: una pantalla, correo y contraseña */
function gSignin(em,msg){
  GS=Object.assign({},GS,{step:'in',em:em||''});
  const cur=pfCur(),upg=!!(cur&&cur.g&&!cur.tmp);GS.upg=upg;
  gateShow('<div class="g-top"><button class="g-link" onclick="siBack()">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('siT')+'</h1><p class="muted">'+t('siP')+'</p><div class="g-form">'+oaBtn()+oaOr()+
    '<label>'+t('clEmail')+'<input id="cle" class="in wide" type="email" autocomplete="email" inputmode="email" value="'+esc(em||'')+'"></label>'+
    '<label>'+t('clPw')+'<span class="pw-w"><input id="clp" class="in wide" type="password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')siGo()"><button class="pw-eye" type="button" onclick="pfEye(\'clp\',this)">'+t('pfShow')+'</button></span></label>'+
    '<p id="gmsg" class="g-msg">'+esc(msg||'')+'</p><button class="btn pri big wide" id="sigo" onclick="siGo()">'+t('wLogIn')+'</button>'+
    '<button class="btn wide" onclick="clForgot()">'+t('clForgot')+'</button>'+
    '<button class="btn wide" onclick="gSignup(1,{upg:'+(upg?'true':'false')+',em:$(\'cle\').value})">'+t('wNewHere')+'</button></div>'+gLang());
}
function siBack(){const c=pfCur();if(c&&c.tmp)clAuthBack();else if(c)gateHide();else gWelcome();}
async function siGo(){
  const m=$('gmsg'),em=gv('cle').trim().toLowerCase(),pw=gv('clp');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){m.textContent=t('clBadEmail');return;}
  if(!pw){m.textContent=t('siNoPw');return;}
  const b=$('sigo');if(b)b.disabled=true;m.textContent=t('clWait');
  let cur=pfCur();
  if(!cur){window.__gKeep=1;pfGuest(true);cur=pfCur();if(!cur){window.__gKeep=0;gSignin(em,t('pfMax'));return;}}
  window.__gKeep=1;window.__clGate=1;
  clSubmit('in',{em:em,pw:pw,err:function(msg){window.__gKeep=0;window.__clGate=0;gSignin(em,msg);}});
}
function suBack(){
  if(GS.step===2){const n=$('gname');if(n)GS.name=n.value;GS.tour=!!($('gtour')&&$('gtour').checked);gSignup(1);return;}
  const c=pfCur();
  if(c&&c.tmp)clAuthBack();else if(GS.upg)gateHide();else gWelcome();
}
function suNext1(){
  const em=gv('sue').trim().toLowerCase(),pw=gv('npw'),m=$('gmsg');
  GS.em=em;GS.pw=pw;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){m.textContent=t('clBadEmail');return;}
  if(!pfRulesOk(pfRules(pw,em))){m.textContent=t('pfWeak');return;}
  gSignup(2);
}
async function suGo(){
  const m=$('gmsg'),n=gv('gname').trim(),em=GS.em,pw=GS.pw;
  GS.name=n;
  if(!n){m.textContent=t('pfNeedName');return;}
  if(!pfRulesOk(pfRules(pw,n))){gSignup(1);$('gmsg').textContent=t('pfWeak');return;}
  const b=$('sugo');if(b)b.disabled=true;m.textContent=t('clWait');
  const keep={name:n,av:GS.av,em:em,tour:!!($('gtour')&&$('gtour').checked)};
  try{if(keep.tour)localStorage.removeItem('bl_tourpref');else localStorage.setItem('bl_tourpref','0');}catch(e){} // pfGuest() resets GS, so keep what was typed / pfGuest() reinicia GS
  let cur=pfCur();
  if(!cur){window.__gKeep=1;pfGuest(true);cur=pfCur();if(!cur){window.__gKeep=0;gSignup(2,keep);$('gmsg').textContent=t('pfMax');return;}}
  window.__gKeep=1;window.__clGate=1;window.__clProf={id:cur.id,name:keep.name,av:keep.av};
  clSubmit('up',{em:em,pw:pw,err:function(msg){window.__gKeep=0;window.__clGate=0;GS=Object.assign({},keep,{pw:pw});gSignup(2);const x=$('gmsg');if(x)x.textContent=msg;}});
}
function clAuthBackIn(){gSignin((GS&&GS.em)||'','');}
/* a guest turns into a real profile: same data, now protected / el invitado pasa a perfil real: mismos datos, ahora protegidos */
function gSave(){const p=pfCur();if(!p||!p.g)return;GS={};sheetClose();gSignup(1,{upg:true});}
function guestNag(){
  const p=pfCur();if(!p||!p.g||(typeof CL!=='undefined'&&CL&&CL.dek))return;
  if(!(typeof cloudOn==='function'&&cloudOn())||window.__gnT)return;
  const show=function(n){
    window.__gnT=0;
    const q=pfCur();if(!q||!q.g||(typeof CL!=='undefined'&&CL&&CL.dek))return;
    if(!$('sheetov').hidden||!$('gate').hidden||(typeof ACT!=='undefined'&&ACT)){if(n<6)window.__gnT=setTimeout(function(){show(n+1);},30000);return;}
    let last=0;try{last=+localStorage.getItem('bl_gn')||0;}catch(e){}
    if(Date.now()-last<864e5)return;
    try{localStorage.setItem('bl_gn',String(Date.now()));}catch(e){}
    sheet('<div class="sum"><div class="sum-e">☁️</div><h3>'+t('gnCT')+'</h3><p class="muted">'+t('gnCP')+'</p><div class="row"><button class="btn pri wide" onclick="sheetClose();gSignup(1,{upg:true})">'+t('clCreate')+'</button></div><div class="row"><button class="btn wide" onclick="clAuthOpen(\'in\')">'+t('wIn')+'</button></div><button class="lnk-d" onclick="sheetClose()">'+t('gnNo')+'</button></div>');
  };
  window.__gnT=setTimeout(function(){show(0);},25000);
}

function pfEye(id,b){const e=$(id);if(!e)return;const h=e.type==='password';e.type=h?'text':'password';b.textContent=h?t('pfHide'):t('pfShow');}
function pfPwLive(name){
  if(name!==undefined)GS.nm=name;
  const gm=$('gmsg');if(gm)gm.textContent='';
  const pw=gv('npw'),r=pfRules(pw,GS.nm||''),s=pfStrength(pw);
  [0,1,2].forEach(i=>{const e=$('mt'+i);if(e)e.className=(pw&&pfRulesOk(r)&&i<s)?'on s'+s:'';});
  const l=$('mtl');if(l)l.textContent=pw?(pfRulesOk(r)?t('pfS'+s):t('pfS0')):'';
  const rl=$('rl');if(rl)rl.innerHTML=[['len','pfR1'],['let','pfR2'],['num','pfR3'],['common','pfR4']].map(x=>'<li class="'+(r[x[0]]?'ok':'')+'">'+(r[x[0]]?'✓ ':'○ ')+t(x[1])+'</li>').join('');
  const c=gv('npw2'),mm=$('mm');if(mm){mm.textContent=c?(c===pw?'✓ '+t('pfMatch'):t('pfNoMatch')):'';mm.className='sm '+(c&&c===pw?'okt':'');}
}

function avPicker(){
  return'<div class="lbl">'+t('pfAvatar')+'</div><div class="av-sug">'+AVP.map(n=>'<button class="av-s'+(GS.av.k==='p'&&GS.av.p===n?' on':'')+'" onclick="pfPickPre(\''+n+'\')" aria-label="'+t('pfAvatar')+' '+n+'"><img alt="" loading="lazy" src="img/av/'+n+'.webp"></button>').join('')+'</div>';
}
function pfAvRedraw(){const n=$('gname');if(n)GS.name=n.value;if($('gtour'))GS.tour=$('gtour').checked;if(GS.redraw)GS.redraw();}
function pfPickPre(n){ // change the choice in place: no redraw, so the list keeps its scroll / cambia la selección sin redibujar: la lista no salta arriba
  GS.av={k:'p',p:n};
  const pv=$('avprev');
  if(!pv){pfAvRedraw();return;}
  pv.innerHTML=avHtml(GS.av,104);
  document.querySelectorAll('.av-sug .av-s').forEach(function(b){const im=b.querySelector('img');b.classList.toggle('on',!!im&&im.getAttribute('src')==='img/av/'+n+'.webp');});
}
/* edit profile (name, avatar); delete needs the password / editar perfil; borrar pide la contraseña */
function gEdit(id){
  const p=pfGet(id);if(!p)return;
  GS={av:p.av,name:p.name,edit:{id:id},redraw:function(){gEdit(id);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="gateHide()">'+t('cancel')+'</button><span></span></div><h1 class="lt g-h">'+t('pfEditT')+'</h1><div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form">'+
    '<label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+'<p id="gmsg" class="g-msg"></p>'+
    '<button class="btn pri big wide" onclick="pfEditSave(\''+id+'\')">'+t('save')+'</button></div>');
}
function pfEditSave(id){
  const p=pfGet(id),n=gv('gname').trim();if(!p)return;
  if(!n){$('gmsg').textContent=t('pfNeedName');return;}
  p.name=n.slice(0,20);p.av=pfAv(GS.av);pfSave();pfRenderAv();if(typeof clSchedule==='function')clSchedule();
  gateHide();toast(t('saved'));
}
function gDelete(id){
  const p=pfGet(id);if(!p)return;
  GS={redraw:function(){gDelete(id);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="gateHide()">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfDel')+'</h1><p class="muted">'+t('pfDelP',esc(pfName(p)))+'</p><div class="g-form">'+
    '<p id="gmsg" class="g-msg"></p><button class="btn danger big wide" onclick="pfDelete(\''+id+'\')">🗑 '+t('pfDel')+'</button></div>');
}
function pfDelete(id){
  const p=pfGet(id);if(!p)return;
  const k=pfKeys(id);try{[k.d,k.s,k.a].forEach(x=>localStorage.removeItem(x));if(localStorage.getItem('bl_last')===id)localStorage.removeItem('bl_last');}catch(e){}
  PFS=PFS.filter(x=>x.id!==id);pfSave();
  try{sessionStorage.removeItem('bl_sess');sessionStorage.setItem('bl_pick','1');}catch(e){}
  location.replace(location.pathname);
}

/* in-app profile menu (avatar button) / menú del perfil dentro de la app */
function pfMenu(){
  const p=pfCur();if(!p)return;
  const cl=typeof cloudOn==='function'&&cloudOn();
  sheet('<div class="form"><div class="g-c">'+avHtml(p.av,76)+'<h3 class="g-n">'+esc(pfName(p))+'</h3></div><div class="menu">'+
    (p.g&&cl?'<button class="pri" onclick="sheetClose();gSignup(1,{upg:true})">☁ '+t('clCreate')+'</button><button onclick="clAuthOpen(\'in\')">'+t('wIn')+'</button>':'')+
    '<button onclick="sheetClose();gEdit(\''+p.id+'\')">✎ '+t('pfEditT')+'</button><button onclick="sheetClose();pfLeave()">⇄ '+t('pfSwitch')+'</button><button onclick="sheetClose();gDelete(\''+p.id+'\')">🗑 '+t('pfDelIn')+'</button></div>'+
    (p.g?'<p class="muted sm">'+t('gnP')+'</p>':'')+'<div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
function pfLib(src){return new Promise((ok,no)=>{const id='lib_'+src;if(document.getElementById(id)){ok();return;}const s=document.createElement('script');s.id=id;s.src=src;s.onload=ok;s.onerror=()=>{s.remove();no(new Error('lib'));};document.head.appendChild(s);});}
function pfQrSvg(text){
  const q=qrcode(0,'M');q.addData(text);q.make();const c=q.getModuleCount();let d='';
  for(let r=0;r<c;r++)for(let k=0;k<c;k++)if(q.isDark(r,k))d+='M'+(k+4)+' '+(r+4)+'h1v1h-1z';
  const z=c+8;
  return'<svg viewBox="0 0 '+z+' '+z+'" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="'+z+'" height="'+z+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
}
