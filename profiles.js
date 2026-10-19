'use strict';
/* Profiles ("who's training?"), password sign-in, recovery questions, avatars and phone-to-phone transfer by QR.
   Everything stays on this device. The password keeps other people out of the app; it does not encrypt the stored data.
   Perfiles ("¿quién entrena?"), contraseña, preguntas de recuperación, avatares y transferencia entre teléfonos por QR.
   Todo se queda en este dispositivo. La contraseña impide que otros entren a la app; no cifra los datos guardados. */
const PF_MAX=5,PF_ITER=150000,PF_QN=8;
const PF_AVE=['🏋️','🏃','🚴','🥊','🧘','💪','🦁','🐺','🦅','🔥','⚡','🎯','🏆','🧗','🏊','⚽'];
const PF_AVC=[['#FF7A3D','#FF3D6E'],['#FFB340','#FF7A3D'],['#30D158','#0A84FF'],['#0A84FF','#5E5CE6'],['#BF5AF2','#FF375F'],['#64D2FF','#30D158'],['#8E8E93','#48484A'],['#FF453A','#FF9F0A']];
const PF_COMMON=['password','password1','passw0rd','12345678','123456789','1234567890','qwerty123','qwertyui','iloveyou','letmein1','welcome1','admin123','abc12345','11111111','contraseña','contrasena1','bubylift1','gimnasio1'];
const B64_RE=/^[A-Za-z0-9+/]+={0,2}$/;
let PFS=[],PFID=null,GS={};

/* ---------- storage ---------- */
function pfKeys(id){return{d:'bl_d_'+id,s:'bl_s_'+id,a:'bl_a_'+id};}
function pfAv(a){
  if(a&&a.k==='i'&&typeof a.d==='string'&&a.d.length<60000&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(a.d))return{k:'i',d:a.d};
  return{k:'e',e:PF_AVE.indexOf(a&&a.e)>=0?a.e:PF_AVE[0],c:Math.max(0,Math.min(PF_AVC.length-1,(a&&a.c)|0))};
}
function pfRec(r){return r&&typeof r.s==='string'&&typeof r.h==='string'&&B64_RE.test(r.s)&&B64_RE.test(r.h)&&r.s.length<40&&r.h.length<80?{s:r.s,h:r.h,n:Math.max(1000,Math.min(1000000,(r.n|0)||PF_ITER))}:null;}
function pfClean(p){
  if(!p||typeof p!=='object'||typeof p.id!=='string'||!/^[a-z0-9]{3,24}$/.test(p.id))return null;
  const qs=(Array.isArray(p.qs)?p.qs:[]).map(q=>{const r=pfRec(q);return r&&(q.i|0)>=0&&(q.i|0)<PF_QN?Object.assign(r,{i:q.i|0}):null;}).filter(Boolean).slice(0,3);
  return{id:p.id,name:String(p.name||'').trim().slice(0,20)||'Profile',av:pfAv(p.av),pw:pfRec(p.pw),qs:qs,rm:p.rm?1:0,t:+p.t||Date.now()};
}
function pfLoad(){const a=jget('bl_profiles',[]);PFS=(Array.isArray(a)?a:[]).map(pfClean).filter(Boolean).slice(0,PF_MAX);return PFS;}
function pfSave(){jset('bl_profiles',PFS);}
const pfGet=id=>PFS.find(p=>p.id===id);
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
  av=pfAv(av);const st='width:'+sz+'px;height:'+sz+'px';
  if(av.k==='i')return'<span class="av" style="'+st+'"><img alt="" src="'+av.d+'"></span>';
  const c=PF_AVC[av.c];
  return'<span class="av" style="'+st+';background:linear-gradient(135deg,'+c[0]+','+c[1]+');font-size:'+Math.round(sz*0.5)+'px">'+av.e+'</span>';
}
function pfRenderAv(){const b=$('avBtn');if(!b)return;const p=pfCur();if(!p){b.hidden=true;return;}b.hidden=false;b.innerHTML=avHtml(p.av,32);b.setAttribute('aria-label',p.name);}

/* ---------- boot / enter / leave ---------- */
function boot(){
  pfLoad();
  let sess=null,last=null;try{sess=sessionStorage.getItem('bl_sess');last=localStorage.getItem('bl_last');}catch(e){}
  pfPrefs(last);
  const pick=pfGet(sess)||(last&&pfGet(last)&&pfGet(last).rm?pfGet(last):null);
  if(pick){pfEnter(pick.id,pick.rm);return;}
  if(!PFS.length)gNew(1,{first:true});else gPick();
}
/* language/theme before sign-in come from the last profile / idioma y tema antes de entrar */
function pfPrefs(last){
  const s=last?jget('bl_s_'+last,{}):{};
  let l=null;try{l=localStorage.getItem('bl_lang');}catch(e){}
  SET={theme:s.theme||'system'};LANG=(s.lang||l||(/^es/i.test(navigator.language||'')?'es':'en'))==='es'?'es':'en';
  document.documentElement.lang=LANG;applyTheme();
}
function pfEnter(id,keep){
  const p=pfGet(id);if(!p)return gPick();
  PFID=id;const k=pfKeys(id);K_DATA=k.d;K_SET=k.s;K_ACT=k.a;
  try{sessionStorage.setItem('bl_sess',id);localStorage.setItem('bl_last',id);}catch(e){}
  if(keep!==undefined&&!!p.rm!==!!keep){p.rm=keep?1:0;pfSave();}
  gateHide();pfRenderAv();bootApp();
}
function pfLeave(){
  try{sessionStorage.removeItem('bl_sess');}catch(e){}
  const p=pfCur();if(p&&p.rm){p.rm=0;pfSave();} // switching profile turns "stay signed in" off / al cambiar de perfil se apaga "mantener sesión"
  stopRest&&stopRest();unwake&&unwake();
  location.replace(location.pathname);
}
/* the first profile adopts any log saved before profiles existed / el primer perfil adopta el registro previo */
function pfAdoptLegacy(id){
  const k=pfKeys(id);let any=false;
  [['bl_data',k.d],['bl_settings',k.s],['bl_active',k.a]].forEach(x=>{try{const v=localStorage.getItem(x[0]);if(v!=null){localStorage.setItem(x[1],v);localStorage.removeItem(x[0]);any=true;}}catch(e){}});
  return any;
}
const pfHasLegacy=()=>{try{return localStorage.getItem('bl_data')!=null;}catch(e){return false;}};

/* ---------- gate (full-screen sign-in area) ---------- */
let PFSTOP=null;function pfStopAll(){if(PFSTOP){try{PFSTOP();}catch(e){}PFSTOP=null;}}
function gateShow(html){pfStopAll();const g=$('gate');g.innerHTML='<div class="gate-in">'+html+'</div>';g.hidden=false;document.body.classList.add('noscroll');g.scrollTop=0;}
function gateHide(){pfStopAll();const g=$('gate');g.hidden=true;g.innerHTML='';document.body.classList.remove('noscroll');}
const gv=id=>{const e=$(id);return e?e.value:'';};
function gLang(){return'<div class="g-lang"><button onclick="pfSetLang(\'en\')"'+(LANG==='en'?' class="on"':'')+'>English</button><button onclick="pfSetLang(\'es\')"'+(LANG==='es'?' class="on"':'')+'>Español</button></div>';}
function pfSetLang(l){LANG=l==='es'?'es':'en';try{localStorage.setItem('bl_lang',LANG);}catch(e){}document.documentElement.lang=LANG;const f=GS.redraw;if(f)f();else gPick();}

/* who's training? / ¿quién entrena? */
function gPick(edit){
  GS={redraw:function(){gPick(edit);}};
  const tiles=PFS.map(p=>'<button class="pf-tile" onclick="'+(edit?'gEdit(\''+p.id+'\')':'gPw(\''+p.id+'\')')+'">'+avHtml(p.av,edit?84:92)+(edit?'<i class="pf-pen">✎</i>':'')+'<b>'+esc(p.name)+'</b></button>').join('')+
    (PFS.length<PF_MAX&&!edit?'<button class="pf-tile" onclick="gAdd()"><span class="av av-add" style="width:92px;height:92px">＋</span><b>'+t('pfAdd')+'</b></button>':'');
  gateShow('<div class="g-top"><span></span><button class="g-link" onclick="gPick('+(edit?'false':'true')+')">'+(edit?t('done'):t('edit'))+'</button></div><h1 class="lt g-h">'+t('pfWho')+'</h1><div class="pf-grid">'+tiles+'</div>'+gLang());
}
function gAdd(){
  gateShow('<div class="g-top"><button class="g-link" onclick="gPick()">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfAdd')+'</h1>'+
    '<div class="menu"><button onclick="gNew(1,{})">✨ '+t('pfNew')+'</button><button onclick="gRecv()">📲 '+t('pfBring')+'</button></div>'+gLang());
  GS={redraw:gAdd};
}

/* password prompt / contraseña */
function gPw(id){
  const p=pfGet(id);if(!p)return gPick();
  if(!p.pw){pfEnter(id,false);return;}
  GS={redraw:function(){gPw(id);}};
  const w=pfWait('p',id);
  gateShow('<div class="g-top"><button class="g-link" onclick="gPick()">‹ '+t('pfSwitch')+'</button><span></span></div><div class="g-c">'+avHtml(p.av,96)+'<h2 class="g-n">'+esc(p.name)+'</h2></div>'+
    '<div class="g-form"><label>'+t('pfPw')+'<span class="pw-w"><input id="gpw" class="in wide" type="password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')pfLogin(\''+id+'\')"><button class="pw-eye" type="button" onclick="pfEye(\'gpw\',this)">'+t('pfShow')+'</button></span></label>'+
    '<label class="chk-l"><input id="gkeep" type="checkbox"'+(p.rm?' checked':'')+'> '+t('pfStay')+'</label>'+
    '<p id="gmsg" class="g-msg">'+(w?t('pfWait',pfWaitTxt(w)):'')+'</p>'+
    '<button class="btn pri big wide" onclick="pfLogin(\''+id+'\')">'+t('pfSignIn')+'</button>'+
    '<button class="btn wide" onclick="gForgot(\''+id+'\')">'+t('pfForgot')+'</button></div>'+gLang());
}
function pfEye(id,b){const e=$(id);if(!e)return;const h=e.type==='password';e.type=h?'text':'password';b.textContent=h?t('pfHide'):t('pfShow');}
async function pfLogin(id){
  const p=pfGet(id),m=$('gmsg');if(!p||!m)return;
  const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  const pw=gv('gpw'),keep=$('gkeep')&&$('gkeep').checked;
  if(!pw){m.textContent=t('pfNeedPw');return;}
  m.textContent='…';let ok=false;
  try{ok=await pfCheck(pw,p.pw);}catch(e){m.textContent=t('pfNoCrypto');return;}
  if(ok){pfOk('p',id);pfEnter(id,keep);return;}
  const x=pfFail('p',id),left=Math.max(0,3-x.n);
  m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',left);
}

/* forgot password: answer the 3 questions / recuperar: responde las 3 preguntas */
function gForgot(id){
  const p=pfGet(id);if(!p)return gPick();
  GS={redraw:function(){gForgot(id);}};
  if(!p.qs.length){gateShow('<div class="g-top"><button class="g-link" onclick="gPw(\''+id+'\')">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfRecT')+'</h1><p class="muted">'+t('pfNoQ')+'</p>'+gLang());return;}
  gateShow('<div class="g-top"><button class="g-link" onclick="gPw(\''+id+'\')">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfRecT')+'</h1><p class="muted">'+t('pfRecP')+'</p><div class="g-form">'+
    p.qs.map((q,i)=>'<label>'+t('pfQ'+q.i)+'<input id="ga'+i+'" class="in wide" autocomplete="off" autocapitalize="off"></label>').join('')+
    '<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="pfRecover(\''+id+'\')">'+t('pfVerify')+'</button></div>'+gLang());
}
async function pfRecover(id){
  const p=pfGet(id),m=$('gmsg');if(!p||!m)return;
  const w=pfWait('q',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  m.textContent='…';let good=0;
  try{for(let i=0;i<p.qs.length;i++)if(await pfCheck(pfNormAns(gv('ga'+i)),p.qs[i]))good++;}catch(e){m.textContent=t('pfNoCrypto');return;}
  if(good===p.qs.length){pfOk('q',id);gSetPw(id);return;}
  const x=pfFail('q',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('q',id))):t('pfRecBad');
}
/* set a new password (recovery or change) / nueva contraseña */
function gSetPw(id,inApp){
  const p=pfGet(id);if(!p)return gPick();
  GS={redraw:function(){gSetPw(id,inApp);}};
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
    p.pw=await pfHash(pw);pfSave();pfOk('p',id);
  }catch(e){m.textContent=t('pfNoCrypto');return;}
  if(inApp){gateHide();toast(t('saved'));}else pfEnter(id,false);
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
  if(!GS.av)GS.av={k:'e',e:PF_AVE[0],c:0};
  if(GS.name===undefined)GS.name='';
  GS.step=step;GS.redraw=function(){gNew(GS.step);};
  const first=!!GS.first,back=first?'':'<button class="g-link" onclick="'+(step===1?'gAdd()':'gNew('+(step-1)+')')+'">‹ '+t('back')+'</button>';
  let b='';
  if(step===1){
    b='<div class="g-c" id="avprev">'+avHtml(GS.av,104)+'</div><div class="g-form"><label>'+t('pfName')+'<input id="gname" class="in wide" maxlength="20" autocomplete="off" value="'+esc(GS.name)+'"></label>'+avPicker()+
      (first&&pfHasLegacy()?'<p class="note">'+t('pfLegacy')+'</p>':'')+'<p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="gNewNext1()">'+t('next')+' ›</button>'+(first?'<button class="btn wide" onclick="gRecv()">📲 '+t('pfBring')+'</button>':'')+'</div>';
  }else if(step===2){
    b='<h1 class="lt g-h">'+t('pfPw')+'</h1><p class="muted">'+t('pfPwP')+'</p><div class="g-form">'+(hasCrypto()?pfPwFields(GS.name):'<p class="note">'+t('pfNoCrypto')+'</p>')+
      '<label class="chk-l"><input id="gkeep" type="checkbox"'+(GS.keep?' checked':'')+'> '+t('pfStay')+'</label><p id="gmsg" class="g-msg"></p><button class="btn pri big wide" onclick="gNewNext2()">'+t('next')+' ›</button></div>';
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
  return'<div class="lbl">'+t('pfAvatar')+'</div><div class="chips wrap av-ch">'+PF_AVE.map(e=>'<button class="chip av-e'+(GS.av.k==='e'&&GS.av.e===e?' on':'')+'" onclick="pfPickAv(\''+e+'\')">'+e+'</button>').join('')+'</div>'+
    '<div class="chips wrap av-ch">'+PF_AVC.map((c,i)=>'<button class="av-c'+(GS.av.k==='e'&&GS.av.c===i?' on':'')+'" style="background:linear-gradient(135deg,'+c[0]+','+c[1]+')" aria-label="'+t('pfColor')+' '+(i+1)+'" onclick="pfPickCol('+i+')"></button>').join('')+'</div>'+
    '<label class="btn wide" style="margin-top:10px">📷 '+t('pfPhoto')+'<input type="file" accept="image/*" hidden onchange="pfPhoto(this)"></label>';
}
function pfAvRedraw(){const n=$('gname');if(n)GS.name=n.value;if(GS.redraw)GS.redraw();}
function pfPickAv(e){GS.av=GS.av.k==='e'?{k:'e',e:e,c:GS.av.c}:{k:'e',e:e,c:0};pfAvRedraw();}
function pfPickCol(c){GS.av={k:'e',e:GS.av.k==='e'?GS.av.e:PF_AVE[0],c:c};pfAvRedraw();}
/* own photo: center-crop to a small square JPEG / foto propia: recorte cuadrado pequeño */
function pfPhoto(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=function(){
    const im=new Image();
    im.onload=function(){
      try{
        const S=192,c=document.createElement('canvas');c.width=c.height=S;
        const m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;
        c.getContext('2d').drawImage(im,sx,sy,m,m,0,0,S,S);
        GS.av={k:'i',d:c.toDataURL('image/jpeg',0.82)};
        if(GS.edit&&GS.edit.live){/* editor keeps same flow */}
        pfAvRedraw();
      }catch(e){toast(t('pfPhotoBad'));}
    };
    im.onerror=function(){toast(t('pfPhotoBad'));};
    im.src=r.result;
  };
  r.onerror=function(){toast(t('pfPhotoBad'));};
  r.readAsDataURL(f);
}
function gNewNext1(){
  const n=gv('gname').trim();GS.name=n;
  if(!n){$('gmsg').textContent=t('pfNeedName');return;}
  gNew(2);
}
function gNewNext2(){
  GS.keep=!!($('gkeep')&&$('gkeep').checked);
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
    const prof={id:'p'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:GS.name,av:GS.av,pw:null,qs:[],rm:GS.keep?1:0,t:Date.now()};
    if(hasCrypto()&&GS.pw1){prof.pw=await pfHash(GS.pw1);prof.qs=await Promise.all(q.map(async x=>Object.assign(await pfHash(pfNormAns(x.a)),{i:x.i})));}
    if(PFS.length>=PF_MAX){m.textContent=t('pfMax');return;}
    const first=PFS.length===0;PFS.push(prof);pfSave();
    if(first)pfAdoptLegacy(prof.id);
    const k=pfKeys(prof.id);
    if(!localStorage.getItem(k.s)){jset(k.s,{lang:LANG});}
    const keep=GS.keep;GS={};pfEnter(prof.id,keep);
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
function gDelete(id){
  const p=pfGet(id);if(!p)return;
  GS={redraw:function(){gDelete(id);}};
  gateShow('<div class="g-top"><button class="g-link" onclick="gEdit(\''+id+'\')">‹ '+t('back')+'</button><span></span></div><h1 class="lt g-h">'+t('pfDel')+'</h1><p class="muted">'+t('pfDelP',esc(p.name))+'</p><div class="g-form">'+
    (p.pw?'<label>'+t('pfPw')+'<input id="gpw" class="in wide" type="password" autocomplete="current-password"></label>':'')+'<p id="gmsg" class="g-msg"></p><button class="btn danger big wide" onclick="pfDelete(\''+id+'\')">🗑 '+t('pfDel')+'</button></div>');
}
async function pfDelete(id){
  const p=pfGet(id),m=$('gmsg');if(!p)return;
  const w=pfWait('p',id);if(w){m.textContent=t('pfWait',pfWaitTxt(w));return;}
  try{if(p.pw&&!(await pfCheck(gv('gpw'),p.pw))){const x=pfFail('p',id);m.textContent=x.u>Date.now()?t('pfWait',pfWaitTxt(pfWait('p',id))):t('pfWrong',Math.max(0,3-x.n));return;}}catch(e){m.textContent=t('pfNoCrypto');return;}
  const k=pfKeys(id);try{[k.d,k.s,k.a,'bl_thp_'+id,'bl_thq_'+id].forEach(x=>localStorage.removeItem(x));}catch(e){}
  PFS=PFS.filter(x=>x.id!==id);pfSave();
  try{if(localStorage.getItem('bl_last')===id)localStorage.removeItem('bl_last');}catch(e){}
  if(!PFS.length){GS={};gNew(1,{first:true});}else gPick(true);
}

/* in-app profile menu (avatar button) / menú del perfil dentro de la app */
function pfMenu(){
  const p=pfCur();if(!p)return;
  sheet('<div class="form"><div class="g-c">'+avHtml(p.av,76)+'<h3 class="g-n">'+esc(p.name)+'</h3></div><div class="menu">'+
    '<button onclick="sheetClose();pfLeave()">⇄ '+t('pfSwitch')+'</button><button onclick="sheetClose();gEdit(\''+p.id+'\',true)">✎ '+t('pfEditT')+'</button>'+
    (p.pw?'<button onclick="sheetClose();gSetPw(\''+p.id+'\',true)">🔑 '+t('pfChange')+'</button><button onclick="sheetClose();gQuest(\''+p.id+'\')">❓ '+t('pfQT')+'</button>':'')+
    '<button onclick="sheetClose();gSend()">📲 '+t('pfTx')+'</button></div><p class="muted sm">'+t('pfNote')+'</p><div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
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
    pfOk('p',id);p.qs=await Promise.all(q.map(async x=>Object.assign(await pfHash(pfNormAns(x.a)),{i:x.i})));pfSave();
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
    const bytes=await pfPack({v:1,p:{name:p.name,av:p.av,pw:p.pw,qs:p.qs},d:DATA,s:SET},pin);
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
  const back=PFS.length?'gAdd()':'gNew(1,{first:true})';
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
    const base=pfClean({id:'p'+uid().slice(-9).replace(/[^a-z0-9]/g,'x'),name:pl.p.name,av:pl.p.av,pw:pl.p.pw,qs:pl.p.qs,rm:0,t:Date.now()});
    if(!base)throw new Error('prof');
    const k=pfKeys(base.id),set=pfSafeSet(pl.s);
    if(!set.lang)set.lang=LANG;
    if(!jset(k.d,pfSafeData(pl.d))||!jset(k.s,set))throw new Error('save');
    PFS.push(base);pfSave();GS={};pfEnter(base.id,false);
  }catch(e){m.textContent=t('pfTxBad');}
}
