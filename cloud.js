/* Cloud account + sync (Supabase REST, no libraries). Optional: hidden until data/cloudcfg.js is filled in.
   END-TO-END ENCRYPTED: the server only ever stores ciphertext. The phone encrypts with a random data key (AES-256-GCM);
   that key is stored wrapped twice (by the password and by a recovery key). The login password sent to the server is a
   one-way derivation, so the server never sees the real password either.
   Cuenta en la nube + sincronización (REST de Supabase, sin librerías). Opcional: oculta hasta llenar data/cloudcfg.js.
   CIFRADA DE EXTREMO A EXTREMO: el servidor solo guarda texto cifrado. El teléfono cifra con una llave de datos aleatoria
   (AES-256-GCM); esa llave se guarda envuelta dos veces (por la contraseña y por una clave de recuperación). La contraseña
   de acceso que recibe el servidor es una derivación de un solo sentido: tampoco ve tu contraseña real. */
let CL=null,CLBUSY=false,CLT=null,CLAPPLY=false,CLMSG='',CLK=null;
const CL_KEYS=['workouts','routines','body','custom'],CL_SET=['units','sound','rest','hap','have','libHave','libSty','goal','fs','auto','remTime','noEnergy','rh','p531','exRest'],CL_ITER=150000,REC_ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function cloudOn(){const c=window.CLOUD_CFG;return !!(c&&c.url&&c.key&&/^https:\/\//.test(c.url)&&window.crypto&&crypto.subtle);}
/* the session lives inside the profile's settings, so password-protected profiles keep it encrypted / la sesión vive dentro de los ajustes del perfil */
function clLoad(){const o=SET&&SET.cl;CL=(o&&typeof o==='object'&&typeof o.uid==='string'&&typeof o.rt==='string')?o:null;CLK=null;try{const p=pfCur();if(CL&&CL.dek&&p&&!p.acct){p.acct=1;pfSave();}}catch(e){}}
/* a guest that signs in becomes a normal profile named after the e-mail / el invitado que inicia sesión pasa a perfil normal */
function clAdopt(){try{const q=pfCur();if(q&&!q.acct&&CL&&CL.email){q.acct=1;pfSave();}const p=pfCur();if(p&&p.g&&CL&&CL.email){p.g=0;p.tmp=0;const pr=window.__clProf;window.__clProf=null;const mine=pr&&pr.id===p.id;p.name=((mine&&pr.name)||CL.email.split('@')[0]||'Me').slice(0,20);if(mine&&pr.av)p.av=pfAv(pr.av);pfSave();if(typeof pfRenderAv==='function')pfRenderAv();if(typeof renderTabs==='function')renderTabs();}}catch(e){}}
function clSave(){if(CL){SET.cl=CL;saveSet();}}
function clUnlink(){CL=null;CLK=null;if(SET&&SET.cl){delete SET.cl;saveSet();}}
/* tombstones: remember deletions so another phone does not bring the item back / lápidas: recuerdan lo borrado */
function clTomb(id){if(!id)return;DATA.tomb=DATA.tomb||{};DATA.tomb[id]=Date.now();}
/* where e-mail links (confirm / reset) should land: this app's own folder, never the bare domain / adónde deben llevar los enlaces del correo: la carpeta de la app */
const clBack=()=>'redirect_to='+encodeURIComponent(location.origin+location.pathname.replace(/[^\/]*$/,''));
async function clReq(path,m,body,tok,extra){
  const c=window.CLOUD_CFG,h=Object.assign({apikey:c.key,'Content-Type':'application/json',Authorization:'Bearer '+(tok||c.key)},extra||{});
  let r;try{r=await fetch(c.url+path,{method:m||'GET',headers:h,body:body==null?undefined:JSON.stringify(body)});}catch(e){throw new Error('network: '+String(e&&e.message||e).slice(0,60));}
  let j=null;try{j=await r.json();}catch(e){}
  return{ok:r.ok,s:r.status,j:j};
}
function clSession(j){
  if(!j||!j.access_token||!j.refresh_token||!j.user||!j.user.id)return false;
  CL=Object.assign(CL||{},{uid:String(j.user.id),email:String(j.user.email||''),at:j.access_token,rt:j.refresh_token,exp:Date.now()+(+j.expires_in||3600)*1000});delete CL.bad;
  clSave();return true;
}
async function clToken(){
  if(!CL)throw new Error('no');
  if(CL.exp-Date.now()>60000)return CL.at;
  const r=await clReq('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:CL.rt});
  if(!r.ok||!clSession(r.j)){if(r.s>=400&&r.s<500){CL.bad=1;clSave();}throw new Error('auth');}
  return CL.at;
}
/* ---- encryption ---- */
const clEnc8=s=>new TextEncoder().encode(s);
async function clAuthPw(email,pw){return b64(await pbk('auth:'+pw,clEnc8('bubylift-auth|'+email),CL_ITER,256));} // what the server gets / lo que recibe el servidor
function clRecKey(){const u=crypto.getRandomValues(new Uint8Array(24));let s='';for(let i=0;i<24;i++){s+=REC_ABC[u[i]&31];if(i%4===3&&i<23)s+='-';}return s;}
const clRecNorm=s=>String(s||'').toUpperCase().replace(/[^A-Z2-9]/g,'').replace(/[IO]/g,'');
const clRecFmt=s=>clRecNorm(s).replace(/(.{4})(?=.)/g,'$1-');
async function clKeyObj(){if(!CLK){if(!CL||!CL.dek)throw new Error('nokey');CLK=await crypto.subtle.importKey('raw',unb64(CL.dek),'AES-GCM',false,['encrypt','decrypt']);}return CLK;}
async function clSeal(obj){
  if(CL&&CL.plain)return{v:0,p:obj}; // Google accounts: no password, no own key / cuentas de Google: sin contraseña ni llave propia
  const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:clEnc8(CL.uid)},await clKeyObj(),clEnc8(JSON.stringify(obj)));
  return{v:1,iv:b64(iv),ct:b64(ct)};
}
async function clOpen(env){
  if(env&&env.v===0)return(env.p&&typeof env.p==='object')?env.p:null;
  if(!env||env.v!==1||typeof env.iv!=='string'||typeof env.ct!=='string')return null; // empty / vacío
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(env.iv),additionalData:clEnc8(CL.uid)},await clKeyObj(),unb64(env.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}
async function clVault(pw,dek,rec){return{wp:await pfWrap('p:'+pw,dek),wr:await pfWrap('r:'+clRecNorm(rec),dek)};}
/* ---- merge ---- */
function clClean(d){
  const o={workouts:[],routines:[],body:[],custom:[],plan:null,goals:[],aft:null,tomb:{},_u:0};
  if(!d||typeof d!=='object')return o;
  const arr=k=>Array.isArray(d[k])?d[k]:[];
  o.workouts=arr('workouts').map(cleanWk).filter(Boolean);o.routines=arr('routines').map(cleanRt).filter(Boolean);
  o.body=arr('body').map(cleanBody).filter(Boolean);o.custom=arr('custom').map(cleanCx).filter(Boolean);
  o.plan=d.plan?cleanPlan(d.plan):null;o.goals=cleanGoals(d.goals);
  o.prof=(d.prof&&typeof d.prof==='object'&&typeof d.prof.n==='string'&&d.prof.n.trim())?{n:d.prof.n.slice(0,20),a:(d.prof.a&&typeof d.prof.a==='object')?d.prof.a:null}:null;
  if(d.aft&&typeof d.aft==='object'){o.aft={};['mdl','hrp','sdc','plk','run'].forEach(k=>{if(cn(d.aft[k])>0)o.aft[k]=d.aft[k];});}
  if(d.tomb&&typeof d.tomb==='object')Object.keys(d.tomb).slice(0,5000).forEach(k=>{if(ID_RE.test(k)&&isFinite(d.tomb[k]))o.tomb[k]=+d.tomb[k];});
  if(d.set&&typeof d.set==='object'&&d.set.v&&typeof d.set.v==='object'){const v={};CL_SET.forEach(k=>{if(d.set.v[k]!==undefined)v[k]=d.set.v[k];});if(JSON.stringify(v).length<30000)o.set={t:isFinite(d.set.t)?+d.set.t:0,v:v};}
  if(d.act&&typeof d.act==='object'&&isFinite(d.act.u)){const x=d.act.d,good=x&&typeof x==='object'&&Array.isArray(x.ex)&&x.ex.length<=60&&JSON.stringify(x).length<60000;o.act={u:+d.act.u,d:good?x:null};}
  o._u=isFinite(d._u)?+d._u:0;
  return o;
}
function clMerge(a,b){ // a = this phone, b = cloud / a = este teléfono, b = nube
  const tomb=Object.assign({},b.tomb,a.tomb),newer=(a._u||0)>=(b._u||0),out={tomb:tomb};
  CL_KEYS.forEach(k=>{
    const m={};
    (newer?b[k].concat(a[k]):a[k].concat(b[k])).forEach(x=>{if(!tomb[x.id])m[x.id]=x;}); // later entries win / gana el último
    out[k]=Object.keys(m).map(i=>m[i]);
  });
  out.plan=newer?(a.plan||b.plan):(b.plan||a.plan);
  out.goals=(newer?a.goals:b.goals).length?(newer?a.goals:b.goals):(newer?b.goals:a.goals);
  out.aft=newer?(a.aft||b.aft):(b.aft||a.aft);
  out.set=(a.set&&b.set)?((a.set.t||0)>=(b.set.t||0)?a.set:b.set):(a.set||b.set||null); // settings: the most recently changed copy wins / ajustes: gana la copia cambiada más recientemente
  out.act=(a.act&&b.act)?((a.act.u||0)>=(b.act.u||0)?a.act:b.act):(a.act||b.act||null); // workout in progress: latest wins / entrenamiento en curso: gana el último
  out.prof=a.prof||b.prof||null; // this phone's profile is the latest word / el perfil de este teléfono manda
  out.workouts.sort((x,y)=>y.t-x.t);out.body.sort((x,y)=>y.t-x.t);
  return out;
}
function clSame(a,b){return JSON.stringify([a.workouts,a.routines,a.body,a.custom,a.plan,a.goals,a.aft,a.tomb,a.prof||null,a.set||null,a.act||null])===JSON.stringify([b.workouts,b.routines,b.body,b.custom,b.plan,b.goals,b.aft,b.tomb,b.prof||null,b.set||null,b.act||null]);}
function clApply(m){
  CLAPPLY=true;
  CL_KEYS.forEach(k=>{DATA[k]=m[k];});DATA.plan=m.plan;DATA.goals=m.goals;DATA.aft=m.aft||undefined;DATA.tomb=m.tomb;
  saveData();
  let ch=false;const ms=m.set,ma=m.act;
  if(ms&&ms.v&&(ms.t||0)>(SET._st||0)){CL_SET.forEach(k=>{if(ms.v[k]!==undefined)SET[k]=ms.v[k];else delete SET[k];});SET._st=ms.t;SET._sh=clSetHash();jset(K_SET,SET);ch=true;}
  if(ma&&(ma.u||0)>(SET._au||0)){ACT=ma.d;SET._au=ma.u;LASTACT=ACT?JSON.stringify(ACT):'';if(ACT)jset(K_ACT,ACT);else jdel(K_ACT);jset(K_SET,SET);ch=true;}
  CLAPPLY=false;
  if(ch){try{applyTheme();if(!$('gate').hidden||document.body.classList.contains('noscroll'))return;render();}catch(e){}}
}
/* settings + workout in progress travel with the account (small, last-change-wins) / ajustes + entrenamiento en curso viajan con la cuenta */
function clSetDoc(){const v={};CL_SET.forEach(k=>{if(SET[k]!==undefined)v[k]=SET[k];});return v;}
function clSetHash(){const s=JSON.stringify(clSetDoc());let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h;}
function clSetTouch(){const h=clSetHash();if(SET._sh===undefined)SET._sh=h;else if(SET._sh!==h){SET._sh=h;SET._st=Date.now();}if(!CLAPPLY&&typeof clSchedule==='function')clSchedule();}
function clSetOut(){return{t:SET._st||1,v:clSetDoc()};}
function clActOut(){return SET._au?{u:SET._au,d:(ACT&&Array.isArray(ACT.ex))?ACT:null}:null;}
function docOut(m){return{workouts:m.workouts,routines:m.routines,body:m.body,custom:m.custom,plan:m.plan,goals:m.goals,aft:m.aft||null,tomb:m.tomb,prof:m.prof||null,set:m.set||null,act:m.act||null,_u:m._u||Date.now()};}
/* name + picture travel with the account, so logging in on a new phone feels like home / nombre y foto viajan con la cuenta */
function clProfDoc(){const p=pfCur();return(p&&p.name&&!p.g)?{n:p.name,a:p.av&&typeof p.av==='object'?p.av:null}:null;}
function clProfApply(pr){const p=pfCur();if(!p||!pr||!pr.n)return;p.name=pr.n.slice(0,20);if(pr.a)p.av=pfAv(pr.a);pfSave();if(typeof pfRenderAv==='function')pfRenderAv();}
/* ---- sync ---- */
async function cloudSync(manual){
  if(!cloudOn()||!CL||CL.bad||!CL.dek||CLBUSY)return false;
  CLBUSY=true;CLMSG='';let ok=false;
  try{
    const tok=await clToken();
    for(let i=0;i<3&&!ok;i++){
      const g=await clReq('/rest/v1/user_data?select=data,rev&user_id=eq.'+encodeURIComponent(CL.uid),'GET',null,tok);
      if(!g.ok||!Array.isArray(g.j))throw new Error('user_data '+g.s+' '+String(g.j&&(g.j.message||g.j.msg||g.j.hint||g.j.error)||'').slice(0,80));
      const loc=clClean(DATA);loc.goals=DATA.goals||[];loc.prof=clProfDoc();loc.set=clSetOut();loc.act=clActOut();
      if(!g.j.length){
        if(!CL.vault&&!CL.plain)throw new Error('novault');
        const p=await clReq('/rest/v1/user_data','POST',{user_id:CL.uid,rev:1,vault:CL.vault,data:await clSeal(docOut(loc))},tok,{Prefer:'return=representation'});
        if(p.ok&&Array.isArray(p.j)&&p.j.length){CL.rev=1;delete CL.vault;delete CL.fresh;ok=true;}else if(p.s!==409)throw new Error('post');
        continue;
      }
      let rd;try{rd=await clOpen(g.j[0].data);}catch(e){CL.err='key';clSave();CLBUSY=false;if(manual)toast(t('clKeyBad'));if(tab==='more')render();return false;}
      if(CL.fresh){delete CL.fresh;if(rd&&rd.prof){clProfApply(rd.prof);loc.prof=clProfDoc();}}
      const rem=clClean(rd),rev=+g.j[0].rev||1,merged=clMerge(loc,rem);
      if(!clSame(merged,loc))clApply(merged);
      if(rd&&clSame(merged,rem)){CL.rev=rev;ok=true;break;}
      merged._u=Date.now();
      const p=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid)+'&rev=eq.'+rev,'PATCH',{data:await clSeal(docOut(merged)),rev:rev+1,updated_at:new Date().toISOString()},tok,{Prefer:'return=representation'});
      if(!p.ok)throw new Error('patch');
      if(Array.isArray(p.j)&&p.j.length){CL.rev=rev+1;ok=true;}
    }
    if(ok){CL.last=Date.now();delete CL.err;clSave();}else{CL.err='conflict';clSave();}
  }catch(e){CL&&(CL.err=(navigator.onLine===false||/Failed to fetch|NetworkError|Load failed/i.test(String(e&&e.message)))?'off':'fail');if(manual)CLMSG=CL&&CL.err;}
  CLBUSY=false;
  if(manual){toast(ok?t('clSynced'):t(CL&&CL.err==='off'?'clOff':'clFail'));}
  if(tab==='more')render();
  return ok;
}
function clSchedule(){
  if(!CL||CL.bad||CLAPPLY||!cloudOn())return;
  clearTimeout(CLT);CLT=setTimeout(()=>{CLT=0;cloudSync(false);},2500);
}
function clInit(){
  if(!cloudOn())return;
  clLoad();clHash();
  if(window.__clGo){const m=window.__clGo;window.__clGo=null;setTimeout(()=>clAuthOpen(m),400);}
  if(CL&&!CL.bad){setTimeout(()=>cloudSync(false).then(()=>stravaSync(false)),800);if(stravaOn()&&CL.sv==null)setTimeout(stravaStatus,1500);}
  // automatic sync: on open, after every change (saveData), when you come back, when you go away, and when the connection returns / sincronía automática
  document.addEventListener('visibilitychange',()=>{
    if(!CL||CL.bad||!CL.dek)return;
    if(document.hidden){if(CLT){clearTimeout(CLT);CLT=0;cloudSync(false);}return;}
    if(Date.now()-(CL.last||0)>30000)cloudSync(false).then(()=>stravaSync(false));
  });
  window.addEventListener('online',()=>{if(CL&&!CL.bad&&CL.dek)cloudSync(false);});
}
/* links from the e-mail (confirm account / reset password) / enlaces del correo */
(function(){try{const h=location.hash||'';if(/access_token=/.test(h)&&/refresh_token=/.test(h)){sessionStorage.setItem('bl_clh',h.slice(1));history.replaceState(null,'',location.pathname+location.search);}
  else if(/^#strava=(ok|no)$/.test(h)){sessionStorage.setItem('bl_svh',h.slice(8));history.replaceState(null,'',location.pathname+location.search);}}catch(e){}})();
async function clHash(){
  let sv=null;try{sv=sessionStorage.getItem('bl_svh');sessionStorage.removeItem('bl_svh');}catch(e){}
  if(sv&&CL){if(sv==='ok'){CL.sv=true;clSave();toast(t('svOk'));}else toast(t('svNo'));if(tab==='more')render();}
  let h=null;try{h=sessionStorage.getItem('bl_clh');sessionStorage.removeItem('bl_clh');}catch(e){}
  if(!h)return;
  const q=new URLSearchParams(h),at=q.get('access_token'),rt=q.get('refresh_token');if(!at||!rt)return;
  try{
    const u=await clReq('/auth/v1/user','GET',null,at);
    if(!u.ok||!u.j||!u.j.id)return;
    const prov=(u.j.app_metadata&&u.j.app_metadata.provider)||'email';
    if(prov!=='email'){ // signed in with Google: no password, so no own key; the person is simply in / entró con Google: sin contraseña ni llave propia
      const gt=await clReq('/rest/v1/user_data?select=vault&user_id=eq.'+encodeURIComponent(u.j.id),'GET',null,at);
      if(gt.ok&&Array.isArray(gt.j)&&gt.j.length&&gt.j[0].vault){toast(t('oaPw'));return;}
      CL=null;clSession({access_token:at,refresh_token:rt,expires_in:q.get('expires_in')||3600,user:u.j});
      CL.plain=1;CL.dek='plain';CL.fresh=1;CLK=null;clSave();
      if(gt.ok&&Array.isArray(gt.j)&&gt.j.length){SET.tourSeen=1;saveSet();}
      const md=u.j.user_metadata||{},nm=String(md.full_name||md.name||'').trim().split(/\s+/)[0];
      const cp=pfCur();if(cp&&cp.g&&nm)window.__clProf={id:cp.id,name:nm,av:null};
      clAdopt();toast(t('clWelcome'));await cloudSync(false);render();return;
    }
    const keep=CL&&CL.uid===String(u.j.id)?CL.dek:null,kv=CL&&CL.vault;
    CL=null;clSession({access_token:at,refresh_token:rt,expires_in:q.get('expires_in')||3600,user:u.j});
    if(keep){CL.dek=keep;if(kv)CL.vault=kv;clSave();}
    if(q.get('type')==='recovery')clRecoverOpen();else if(!CL.dek){const em=CL.email;clUnlink();clAuthOpen('in','',em);toast(t('clConfirmed'));}else{toast(t('clWelcome'));cloudSync(false);}
  }catch(e){}
}
/* which sign-in providers the project has switched on (the Google button only shows when it works) / qué proveedores están activos */
window.__clProv=window.__clProv||null;
async function clProv(){
  if(window.__clProv||!cloudOn())return window.__clProv||{};
  try{const c=window.CLOUD_CFG,r=await Promise.race([fetch(c.url+'/auth/v1/settings',{headers:{apikey:c.key}}),new Promise((_,j)=>setTimeout(j,2500))]);const j=await r.json();window.__clProv={google:!!(j&&j.external&&j.external.google)};}catch(e){window.__clProv={google:false,off:1};}
  return window.__clProv;
}
function clGoogle(){if(!cloudOn())return;location.href=window.CLOUD_CFG.url+'/auth/v1/authorize?provider=google&'+clBack();}
function oaBtn(){return cloudOn()?'<button class="btn big wide oa-g" onclick="clGoogle()"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg> '+t('oaGoogle')+'</button>':'';}
function oaOr(){return cloudOn()?'<div class="oa-or"><span>'+t('oaOr')+'</span></div>':'';}
/* ---- screens ---- */
function cloudCard(){
  if(!cloudOn())return'';
  if(!CL||CL.bad||!CL.dek){const gu=pfCur()&&pfCur().g&&!(CL&&CL.bad);return'<div class="card cloudc"><span class="li">'+ic('cloud')+'</span><div class="cl-t"><b>'+t(gu?'gnCT':'clT')+'</b><p class="muted sm">'+t(CL&&CL.bad?'clExpired':(gu?'gnCP':'clP'))+'</p></div><div class="row"><button class="btn pri" onclick="clAuthOpen(\'up\')">'+t('wSignUp')+'</button><button class="btn" onclick="clAuthOpen(\'in\')">'+t('wLogIn')+'</button></div></div>';}
  const ago=CL.last?Math.max(0,Math.round((Date.now()-CL.last)/60000)):null;
  const st=CL.err==='key'?t('clKeyBad'):CL.err==='off'?t('clOff'):CL.err?t('clFail'):(ago==null?t('clAuto'):(ago<1?t('clJust'):t('clAgo',ago>=60?Math.round(ago/60)+' h':ago+' min')));
  return'<div class="card cloudc"><span class="li">'+ic('cloud')+'</span><div class="cl-t"><b>'+esc(CL.email)+'</b><p class="muted sm">'+st+'</p></div><div class="row"><button class="btn wide" onclick="clAcctOpen()">'+t('clManage')+'</button></div>'+stravaRow()+'</div>';
}
function clAuthBack(){
  const p=pfCur();
  if(p&&p.tmp){const k=pfKeys(p.id);try{[k.d,k.s,k.a].forEach(x=>localStorage.removeItem(x));}catch(e){}PFS=PFS.filter(x=>x.id!==p.id);pfSave();}
  try{sessionStorage.removeItem('bl_sess');sessionStorage.setItem('bl_pick','1');}catch(e){}
  location.replace(location.pathname);
}
/* is this e-mail registered? (asks the database; null if it cannot tell) / ¿está registrado este correo? */
async function clEmailKnown(em){try{const r=await clReq('/rest/v1/rpc/email_registered','POST',{p_email:em});return r.ok&&typeof r.j==='boolean'?r.j:null;}catch(e){return null;}}
function clAuthOpen(mode,msg,email){
  const up=mode==='up',tmp=!!(pfCur()&&pfCur().tmp);
  if(up&&typeof gSignup==='function'&&(!pfCur()||pfCur().g)){sheetClose();gSignup(1,{upg:!!pfCur(),em:email||''});return;} // creating an account is a full screen, not a pop-up / crear cuenta es una pantalla completa
  if(!up&&typeof gSignin==='function'&&(!pfCur()||pfCur().g)){sheetClose();gSignin(email||'',msg||'');return;} // signing in is a full screen too / iniciar sesión también es pantalla completa
  sheet('<div class="form"><div class="pick-h"><h3>'+t(up?'clCreate':'clIn')+'</h3><button class="ico" onclick="'+(tmp?'clAuthBack()':'sheetClose()')+'" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t(up?'clUpP':'clInP')+'</p>'+(msg?'<p class="clmsg">'+esc(msg)+'</p>':'')+oaBtn()+oaOr()+
    '<label>'+t('clEmail')+'<input id="cle" class="in wide" type="email" autocomplete="email" inputmode="email" value="'+esc(email||'')+'"></label>'+
    '<label>'+t('clPw')+'<input id="clp" class="in wide" type="password" autocomplete="'+(up?'new-password':'current-password')+'"></label>'+
    (up?'<p class="muted sm">'+t('clPwRule')+'</p><p class="clwarn">'+t('clE2eP')+'</p>':'<button class="lnk-d" onclick="clForgot()">'+t('clForgot')+'</button>')+
    '<div class="row"><button class="btn pri wide" id="clgo" onclick="clSubmit(\''+mode+'\')">'+t(up?'clCreate':'clIn')+'</button></div>'+
    '<button class="lnk-d" onclick="clAuthOpen(\''+(up?'in':'up')+'\')">'+t(up?'clHave':'clNo')+'</button></div>');
}
async function clSubmit(mode,pre){
  const em=pre?pre.em:gv('cle').trim().toLowerCase(),pw=pre?pre.pw:gv('clp');
  const fail=function(m,md){if(pre)pre.err(m);else clAuthOpen(md||mode,m,em);};
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)||!pw){if(pre)pre.err(t('clBadEmail'));else toast(t('clBadEmail'));return;}
  if(mode==='up'&&!pfRulesOk(pfRules(pw,em))){if(pre)pre.err(t('clWeak'));else toast(t('clWeak'));return;}
  const b=$('clgo');if(b){b.disabled=true;b.textContent=t('clWait');}
  try{
    const ap=await clAuthPw(em,pw);
    const r=await clReq(mode==='up'?'/auth/v1/signup?'+clBack():'/auth/v1/token?grant_type=password','POST',{email:em,password:ap});
    if(!r.ok){
      const m=String((r.j&&(r.j.msg||r.j.error_description||r.j.message))||'');
      if(mode==='in'&&/invalid|credentials/i.test(m)&&(await clEmailKnown(em))===false){fail(t('clNoAcct'));return;}
      fail(/already|registered/i.test(m)?t('clExists'):(/invalid|credentials/i.test(m)?t('clWrong'):t('clFail')));return;
    }
    if(mode==='up'&&!(r.j&&r.j.access_token)){if(pre){pre.err(t('clCheckMail',em));return;}sheetClose();ask(t('clCheckMail',em),t('done'),function(){},false);return;}
    CL=null;if(!clSession(r.j)){fail(t('clFail'));return;}
    // existing account: unlock the data key with the password; new account: make one / cuenta existente: abrir la llave; nueva: crear
    const tok=CL.at,g=await clReq('/rest/v1/user_data?select=vault&user_id=eq.'+encodeURIComponent(CL.uid),'GET',null,tok);
    if(!g.ok||!Array.isArray(g.j)){clUnlink();throw new Error('user_data '+g.s+' '+String(g.j&&(g.j.message||g.j.msg||g.j.hint||g.j.error||g.j.code)||'').slice(0,90));}
    if(g.j.length&&g.j[0].vault&&g.j[0].vault.wp){
      let dek;try{dek=await pfUnwrap('p:'+pw,g.j[0].vault.wp);}catch(e){clUnlink();fail(t('clKeyBad'));return;}
      SET.tourSeen=1;saveSet();CL.dek=b64(dek);CLK=null;CL.fresh=1;clSave();clAdopt();sheetClose();if(window.__clGate){window.__clGate=0;window.__gKeep=0;gateHide();}toast(t('clWelcome'));await cloudSync(false);render();
    }else{await clSetup(pw);}
  }catch(e){const em2=String(e&&e.message||e);try{console.warn('bubylift cloud',e);}catch(x){}fail(t(/^user_data/.test(em2)?'clHalf':'clOff')+' ['+em2.slice(0,110)+']',mode==='up'&&/^user_data/.test(em2)?'in':mode);}
}
/* brand-new data key + recovery key; the person must see the recovery key before we continue / llave nueva + clave de recuperación */
async function clSetup(pw){
  const dek=crypto.getRandomValues(new Uint8Array(32)),rec=clRecKey();
  CL.dek=b64(dek);CLK=null;CL.vault=await clVault(pw,dek,rec);clSave();
  clRecShow(rec,function(gt){
    clAdopt();
    if(!gt){toast(t('clWelcome'));cloudSync(false).then(render);return;}
    // full-screen sign-up: confirm, make sure the key reached the server, then send the person to sign in / registro en pantalla completa: confirmar y mandar a iniciar sesión
    gateShow('<div class="g-c"><div class="wel-e">☁️</div></div><h1 class="lt g-h">'+t('clWait')+'</h1>');
    const em=CL.email;
    cloudSync(false).then(function(ok){
      if(!ok){gateHide();toast(t('clWelcome'));render();return;}
      clUnlink();window.__suEm=em;
      gateShow('<div class="g-top"><span></span><span></span></div><div class="g-c"><div class="wel-e">✅</div></div><h1 class="lt g-h">'+t('suDoneT')+'</h1><p class="muted g-c">'+t('suDoneP')+'</p><div class="g-form"><button class="btn pri big wide" onclick="suToIn()">'+t('wLogIn')+'</button></div>');
    });
  });
}
function suToIn(){const em=window.__suEm||'';window.__suEm=null;render();gSignin(em,'');}
function clRecShow(rec,done){
  window.__clRec=rec;window.__clDone=done||function(){};
  const body='<p class="muted">'+t('clRecP')+'</p><div class="clrec" id="clrec">'+esc(rec)+'</div>'+
    '<div class="row"><button class="btn" onclick="clRecCopy()">'+ic('link')+' '+t('copy')+'</button><button class="btn" onclick="clRecSave()">'+ic('download')+' '+t('clRecFile')+'</button></div>'+
    '<label class="clchk"><input type="checkbox" id="clsaved" onchange="$(\'clrecgo\').disabled=!this.checked"> '+t('clRecSaved')+'</label>'+
    '<div class="row"><button class="btn pri wide" id="clrecgo" disabled onclick="clRecDone()">'+t('clRecGo')+'</button></div>';
  if(window.__clGate)gateShow('<div class="g-top"><span></span><span class="muted sm">'+t('psStep',3,3)+'</span></div><h1 class="lt g-h">'+t('clRecT')+'</h1><div class="g-form">'+body+'</div>');
  else sheet('<div class="form"><h3>'+t('clRecT')+'</h3>'+body+'</div>');
}
function clRecCopy(){try{navigator.clipboard.writeText(window.__clRec).then(()=>toast(t('copied')),()=>toast(t('copyFail')));}catch(e){toast(t('copyFail'));}}
function clRecSave(){fileOut('bubylift-recovery-key.txt','Bubylift — '+t('clRecT')+'\n\n'+window.__clRec+'\n\n'+t('clRecP')+'\n','text/plain');}
function clRecDone(){const f=window.__clDone,gt=!!window.__clGate;window.__clRec=null;window.__clDone=null;window.__clGate=0;window.__gKeep=0;if(!gt)sheetClose();if(f)f(gt);}
async function clForgot(){
  const em=gv('cle').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){toast(t('clBadEmail'));return;}
  try{const r=await clReq('/auth/v1/recover?'+clBack(),'POST',{email:em});toast(t(r.ok?'clResetSent':'clFail'));}catch(e){toast(t('clOff'));}
}
/* reset link from the e-mail: needs the recovery key to open the data (or a fresh start) / enlace del correo: pide la clave de recuperación (o empezar de cero) */
function clRecoverOpen(){
  sheet('<div class="form"><h3>'+t('clNewPw')+'</h3><p class="muted sm">'+t('clRecoverP')+'</p>'+
    '<label>'+t('clPwNew')+'<input id="clp" class="in wide" type="password" autocomplete="new-password"></label><p class="muted sm">'+t('clPwRule')+'</p>'+
    '<label>'+t('clRecKeyL')+'<input id="clrk" class="in wide" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"></label>'+
    '<div class="row"><button class="btn pri wide" id="clgo" onclick="clRecoverGo()">'+t('save')+'</button></div>'+
    '<button class="lnk-d" onclick="clFreshAsk()">'+t('clLost')+'</button></div>');
}
async function clRecoverGo(){
  const pw=gv('clp'),rk=clRecNorm(gv('clrk'));
  if(!pfRulesOk(pfRules(pw,(CL&&CL.email)||''))){toast(t('clWeak'));return;}
  if(rk.length!==24){toast(t('clRecBad'));return;}
  const b=$('clgo');if(b){b.disabled=true;b.textContent=t('clWait');}
  try{
    const tok=await clToken(),g=await clReq('/rest/v1/user_data?select=vault&user_id=eq.'+encodeURIComponent(CL.uid),'GET',null,tok);
    if(!g.ok||!Array.isArray(g.j)||!g.j.length||!g.j[0].vault||!g.j[0].vault.wr)throw 0;
    let dek;try{dek=await pfUnwrap('r:'+rk,g.j[0].vault.wr);}catch(e){clRecoverOpen();toast(t('clRecBad'));return;}
    const v=await clVault(pw,dek,clRecFmt(rk));
    const u=await clReq('/auth/v1/user','PUT',{password:await clAuthPw(CL.email,pw)},tok);if(!u.ok)throw 0;
    const p=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid),'PATCH',{vault:v},tok);if(!p.ok)throw 0;
    CL.dek=b64(dek);CLK=null;clSave();sheetClose();toast(t('clPwDone'));cloudSync(false).then(render);
  }catch(e){clRecoverOpen();toast(t('clFail'));}
}
function clFreshAsk(){ask(t('clFreshAsk'),t('clFresh'),function(){clFreshOpen();},true);}
function clFreshOpen(){
  sheet('<div class="form"><h3>'+t('clFresh')+'</h3><p class="muted sm">'+t('clFreshP')+'</p>'+
    '<label>'+t('clPwNew')+'<input id="clp" class="in wide" type="password" autocomplete="new-password"></label><p class="muted sm">'+t('clPwRule')+'</p>'+
    '<div class="row"><button class="btn danger wide" id="clgo" onclick="clFreshGo()">'+t('clFresh')+'</button></div></div>');
}
async function clFreshGo(){
  const pw=gv('clp');if(!pfRulesOk(pfRules(pw,(CL&&CL.email)||''))){toast(t('clWeak'));return;}
  const b=$('clgo');if(b){b.disabled=true;b.textContent=t('clWait');}
  try{
    const tok=await clToken();
    const u=await clReq('/auth/v1/user','PUT',{password:await clAuthPw(CL.email,pw)},tok);if(!u.ok)throw 0;
    const d=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid),'DELETE',null,tok);if(!d.ok)throw 0;
    sheetClose();await clSetup(pw);
  }catch(e){toast(t('clFail'));}
}
/* manage account */
function clAcctOpen(){
  sheet('<div class="form"><div class="pick-h"><h3>'+t('clManage')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted">'+esc((CL&&CL.email)||'')+'</p>'+
    '<div class="menu"><button onclick="sheetClose();gEdit(PFID)">✎ '+t('pfEditT')+'</button>'+(CL&&CL.plain?'':'<button onclick="clChPwOpen()">'+t('clChPw')+'</button><button onclick="clNewRecAsk()">'+t('clNewRec')+'</button>')+'<button onclick="sheetClose();clOutAsk()">'+t('clOut')+'</button></div>'+
    '<div class="row"><button class="btn danger wide" onclick="sheetClose();clDelAsk()">'+t('clDel')+'</button></div><p class="muted sm">'+t('clDelP')+'</p></div>');
}
function clChPwOpen(){
  sheet('<div class="form"><h3>'+t('clChPw')+'</h3><label>'+t('clPw')+'<input id="clo" class="in wide" type="password" autocomplete="current-password"></label>'+
    '<label>'+t('clPwNew')+'<input id="clp" class="in wide" type="password" autocomplete="new-password"></label><p class="muted sm">'+t('clPwRule')+'</p>'+
    '<div class="row"><button class="btn pri wide" id="clgo" onclick="clChPwGo()">'+t('save')+'</button></div></div>');
}
async function clChPwGo(){
  const po=gv('clo'),pw=gv('clp');
  if(!pfRulesOk(pfRules(pw,(CL&&CL.email)||''))){toast(t('clWeak'));return;}
  const b=$('clgo');if(b){b.disabled=true;b.textContent=t('clWait');}
  try{
    const tok=await clToken();
    const chk=await clReq('/auth/v1/token?grant_type=password','POST',{email:CL.email,password:await clAuthPw(CL.email,po)});
    if(!chk.ok){clChPwOpen();toast(t('clWrong'));return;}
    const g=await clReq('/rest/v1/user_data?select=vault&user_id=eq.'+encodeURIComponent(CL.uid),'GET',null,tok);
    const old=g.ok&&g.j&&g.j[0]&&g.j[0].vault;if(!old)throw 0;
    const u=await clReq('/auth/v1/user','PUT',{password:await clAuthPw(CL.email,pw)},tok);if(!u.ok)throw 0;
    const v={wp:await pfWrap('p:'+pw,unb64(CL.dek)),wr:old.wr};
    const p=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid),'PATCH',{vault:v},tok);if(!p.ok)throw 0;
    sheetClose();toast(t('clPwDone'));
  }catch(e){toast(t('clFail'));}
}
function clNewRecAsk(){
  sheet('<div class="form"><h3>'+t('clNewRec')+'</h3><p class="muted sm">'+t('clNewRecP')+'</p><label>'+t('clPw')+'<input id="clp" class="in wide" type="password" autocomplete="current-password"></label>'+
    '<div class="row"><button class="btn pri wide" id="clgo" onclick="clNewRecGo()">'+t('clNewRec')+'</button></div></div>');
}
async function clNewRecGo(){
  const pw=gv('clp');if(!pw)return;
  try{
    const tok=await clToken(),chk=await clReq('/auth/v1/token?grant_type=password','POST',{email:CL.email,password:await clAuthPw(CL.email,pw)});
    if(!chk.ok){toast(t('clWrong'));return;}
    const rec=clRecKey(),dek=unb64(CL.dek),v=await clVault(pw,dek,rec);
    const p=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid),'PATCH',{vault:v},tok);if(!p.ok)throw 0;
    clRecShow(rec,function(){toast(t('saved'));});
  }catch(e){toast(t('clFail'));}
}
function clOutAsk(){ask(t('clOutAsk'),t('clOut'),function(){clUnlink();toast(t('clOutDone'));render();},false);}
function clDelAsk(){ask(t('clDelAsk'),t('clDel'),async function(){
  try{const tok=await clToken();const r=await clReq('/rest/v1/rpc/delete_my_account','POST',{},tok);if(!r.ok)throw 0;clUnlink();toast(t('clDelDone'));render();}catch(e){toast(t('clFail'));}
},true);}

/* ---- Strava (heart rate + calories from your watch, via Strava) / (frecuencia cardíaca y calorías de tu reloj, vía Strava) ---- */
const stravaOn=()=>cloudOn()&&!!window.CLOUD_CFG.strava&&!!CL&&!CL.bad;
async function clFn(a,body){
  const tok=await clToken(),c=window.CLOUD_CFG;
  const r=await fetch(c.url+'/functions/v1/strava?a='+a,{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:JSON.stringify(body||{})});
  let j=null;try{j=await r.json();}catch(e){}
  return{ok:r.ok,s:r.status,j:j};
}
async function stravaStatus(){try{const r=await clFn('status');if(r.ok&&r.j){CL.sv=!!r.j.connected;clSave();if(tab==='more')render();}}catch(e){}}
function stravaRow(){
  if(!stravaOn())return'';
  return'<div class="svrow"><span class="sv-t"><b>'+(CL.sv?t('svConnected'):t('svT'))+'</b><small>'+(CL.sv?t('svConnectedP'):t('svP'))+'</small></span>'+
    (CL.sv?'<button class="btn sm" onclick="stravaOff()">'+t('svOff')+'</button>':'<button class="btn sm pri" onclick="stravaConnect()">'+t('svConnect')+'</button>')+'<small class="sv-pw">Powered by Strava</small></div>';
}
async function stravaConnect(){
  try{const r=await clFn('start');if(r.ok&&r.j&&/^https:\/\/www\.strava\.com\//.test(r.j.url)){location.href=r.j.url;return;}}catch(e){}
  toast(t('clFail'));
}
function stravaOff(){ask(t('svOffAsk'),t('svOff'),async function(){try{await clFn('disconnect');CL.sv=false;clSave();toast(t('svOffDone'));render();}catch(e){toast(t('clFail'));}},false);}
/* Automatic import: on open, look for new Strava activities. Match them to workouts (add heart rate + calories) or create watch-only workouts.
   Importación automática: al abrir busca actividades nuevas en Strava; las une a tus entrenamientos o crea los que solo hiciste con el reloj. */
let SVB=false;
async function stravaSync(manual){
  if(!stravaOn()||!CL||!CL.sv||CL.bad||!CL.dek||SVB)return;
  SVB=true;
  try{
    const now=Math.floor(Date.now()/1000),after=Math.max((CL.svLast||0)-3600,now-14*86400);
    const r=await clFn('recent',{after:after});
    if(r.s===409){CL.sv=false;clSave();if(tab==='more')render();return;}
    if(!r.ok||!r.j||!Array.isArray(r.j.activities))throw 0;
    const known={};DATA.workouts.forEach(w=>{if(w.sid)known[w.sid]=1;});DATA.tomb=DATA.tomb||{};
    let att=0,add=0;
    r.j.activities.slice().sort((x,y)=>x.start-y.start).forEach(a=>{
      if(!a||!/^\d{1,15}$/.test(String(a.id))||known[a.id]||DATA.tomb['sv'+a.id])return;
      const st=+a.start*1000,sec=Math.round(+a.seconds);
      if(!isFinite(st)||st<=0||!(sec>=60&&sec<172800))return;
      const en=st+sec*1000,hr0=Math.round(+a.avg_hr),mx=Math.round(+a.max_hr),k=Math.round(+a.kcal);
      const hr=(hr0>=30&&hr0<=230)?{a:hr0,m:(mx>=hr0&&mx<=250)?mx:hr0}:undefined,kc=(k>0&&k<=10000)?k:undefined;
      const m=DATA.workouts.find(w=>!w.sid&&w.ex&&w.ex.length&&Math.min(w.end>w.t?w.end:w.t+3*3600000,en)-Math.max(w.t,st)>=300000);
      if(m){if(hr)m.hr=hr;if(kc)m.kcal=kc;m.sv=1;m.sid=String(a.id);m.sp=String(a.type||'').slice(0,30);att++;}
      else{DATA.workouts.push({id:'sv'+a.id,t:st,end:en,name:String(a.name||'').slice(0,80),note:'',ex:[],hr:hr,kcal:kc,sv:1,sid:String(a.id),sp:String(a.type||'').slice(0,30),sec:sec});add++;}
      known[a.id]=1;
    });
    CL.svLast=now;clSave();
    if(att||add){DATA.workouts.sort((x,y)=>y.t-x.t);saveData();toast(t('svAuto',att+add));if(typeof render==='function')render();}
    else if(manual)toast(t('svNothing'));
  }catch(e){if(manual)toast(t('clFail'));}
  SVB=false;
}
async function stravaGet(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk||!stravaOn())return;
  if(!CL.sv){sheetClose();go('more');toast(t('svNeed'));return;}
  toast(t('clWait'));
  const from=Math.floor((wk.t-600000)/1000),to=Math.min(from+43200,Math.floor(((wk.end>wk.t?wk.end:wk.t+3*3600000)+600000)/1000));
  try{
    const r=await clFn('activity',{from:from,to:to});
    if(r.s===409){CL.sv=false;clSave();sheetClose();go('more');toast(t('svNeed'));return;}
    if(!r.ok||!r.j)throw 0;
    if(!r.j.found){toast(t('svNone'));return;}
    const a=Math.round(+r.j.avg_hr),m=Math.round(+r.j.max_hr),k=Math.round(+r.j.kcal);
    if(a>=30&&a<=230)wk.hr={a:a,m:(m>=a&&m<=250)?m:a};
    if(k>0&&k<=10000)wk.kcal=k;
    if(!wk.hr&&!wk.kcal){toast(t('svNone'));return;}
    wk.sv=1;saveData();sheetClose();openWk(id);toast(t('svGot'));
  }catch(e){toast(t('clFail'));}
}

/* slim reminder for guests: no account exists until they sign up or log in / aviso breve para invitados */
function guestBar(){
  const p=typeof pfCur==='function'&&pfCur();
  if(!cloudOn()||!p||!p.g||(CL&&CL.dek))return'';
  return'<div class="card guestbar"><span>'+t('gbT')+'</span><div class="row"><button class="btn pri sm" onclick="clAuthOpen(\'up\')">'+t('wSignUp')+'</button><button class="btn sm" onclick="clAuthOpen(\'in\')">'+t('wLogIn')+'</button></div></div>';
}
