/* Cloud account + sync (Supabase REST, no libraries). Optional: hidden until data/cloudcfg.js is filled in.
   Cuenta en la nube + sincronización (REST de Supabase, sin librerías). Opcional: oculta hasta llenar data/cloudcfg.js. */
let CL=null,CLBUSY=false,CLT=null,CLAPPLY=false,CLMSG='';
const CL_KEYS=['workouts','routines','body','custom'];
const clKey=()=>'bl_cloud_'+(PFID||'x');
function cloudOn(){const c=window.CLOUD_CFG;return !!(c&&c.url&&c.key&&/^https:\/\//.test(c.url));}
function clLoad(){const o=jget(clKey(),null);CL=(o&&typeof o==='object'&&typeof o.uid==='string'&&typeof o.rt==='string')?o:null;}
function clSave(){if(CL)jset(clKey(),CL);}
function clUnlink(){CL=null;try{localStorage.removeItem(clKey());}catch(e){}}
/* tombstones: remember deletions so another phone does not bring the item back / lápidas: recuerdan lo borrado */
function clTomb(id){if(!id)return;DATA.tomb=DATA.tomb||{};DATA.tomb[id]=Date.now();}
async function clReq(path,m,body,tok,extra){
  const c=window.CLOUD_CFG,h=Object.assign({apikey:c.key,'Content-Type':'application/json',Authorization:'Bearer '+(tok||c.key)},extra||{});
  const r=await fetch(c.url+path,{method:m||'GET',headers:h,body:body==null?undefined:JSON.stringify(body)});
  let j=null;try{j=await r.json();}catch(e){}
  return{ok:r.ok,s:r.status,j:j};
}
function clSession(j){
  if(!j||!j.access_token||!j.refresh_token||!j.user||!j.user.id)return false;
  CL=Object.assign(CL||{},{uid:String(j.user.id),email:String(j.user.email||''),at:j.access_token,rt:j.refresh_token,exp:Date.now()+(+j.expires_in||3600)*1000});
  clSave();return true;
}
async function clToken(){
  if(!CL)throw new Error('no');
  if(CL.exp-Date.now()>60000)return CL.at;
  const r=await clReq('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:CL.rt});
  if(!r.ok||!clSession(r.j)){if(r.s>=400&&r.s<500){CL.bad=1;clSave();}throw new Error('auth');}
  return CL.at;
}
/* ---- merge ---- */
function clClean(d){
  const o={workouts:[],routines:[],body:[],custom:[],plan:null,goals:[],aft:null,tomb:{},_u:0};
  if(!d||typeof d!=='object')return o;
  const arr=k=>Array.isArray(d[k])?d[k]:[];
  o.workouts=arr('workouts').map(cleanWk).filter(Boolean);o.routines=arr('routines').map(cleanRt).filter(Boolean);
  o.body=arr('body').map(cleanBody).filter(Boolean);o.custom=arr('custom').map(cleanCx).filter(Boolean);
  o.plan=d.plan?cleanPlan(d.plan):null;o.goals=cleanGoals(d.goals);
  if(d.aft&&typeof d.aft==='object'){o.aft={};['mdl','hrp','sdc','plk','run'].forEach(k=>{if(cn(d.aft[k])>0)o.aft[k]=d.aft[k];});}
  if(d.tomb&&typeof d.tomb==='object')Object.keys(d.tomb).slice(0,5000).forEach(k=>{if(ID_RE.test(k)&&isFinite(d.tomb[k]))o.tomb[k]=+d.tomb[k];});
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
  out.workouts.sort((x,y)=>y.t-x.t);out.body.sort((x,y)=>y.t-x.t);
  return out;
}
function clSame(a,b){return JSON.stringify([a.workouts,a.routines,a.body,a.custom,a.plan,a.goals,a.aft,a.tomb])===JSON.stringify([b.workouts,b.routines,b.body,b.custom,b.plan,b.goals,b.aft,b.tomb]);}
function clApply(m){
  CLAPPLY=true;
  CL_KEYS.forEach(k=>{DATA[k]=m[k];});DATA.plan=m.plan;DATA.goals=m.goals;DATA.aft=m.aft||undefined;DATA.tomb=m.tomb;
  saveData();CLAPPLY=false;
}
/* ---- sync ---- */
async function cloudSync(manual){
  if(!cloudOn()||!CL||CL.bad||CLBUSY)return false;
  CLBUSY=true;CLMSG='';let ok=false;
  try{
    const tok=await clToken();
    for(let i=0;i<3&&!ok;i++){
      const g=await clReq('/rest/v1/user_data?select=data,rev&user_id=eq.'+encodeURIComponent(CL.uid),'GET',null,tok);
      if(!g.ok||!Array.isArray(g.j))throw new Error('get');
      const loc=clClean(DATA);loc.goals=DATA.goals||[];
      if(!g.j.length){
        const p=await clReq('/rest/v1/user_data','POST',{user_id:CL.uid,rev:1,data:docOut(loc)},tok,{Prefer:'return=representation'});
        if(p.ok&&Array.isArray(p.j)&&p.j.length){CL.rev=1;ok=true;}else if(p.s!==409)throw new Error('post');
        continue;
      }
      const rem=clClean(g.j[0].data),rev=+g.j[0].rev||1,merged=clMerge(loc,rem);
      if(!clSame(merged,loc))clApply(merged);
      if(clSame(merged,rem)){CL.rev=rev;ok=true;break;}
      merged._u=Date.now();
      const p=await clReq('/rest/v1/user_data?user_id=eq.'+encodeURIComponent(CL.uid)+'&rev=eq.'+rev,'PATCH',{data:docOut(merged),rev:rev+1,updated_at:new Date().toISOString()},tok,{Prefer:'return=representation'});
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
function docOut(m){return{workouts:m.workouts,routines:m.routines,body:m.body,custom:m.custom,plan:m.plan,goals:m.goals,aft:m.aft||null,tomb:m.tomb,_u:m._u||Date.now()};}
function clSchedule(){
  if(!CL||CL.bad||CLAPPLY||!cloudOn())return;
  clearTimeout(CLT);CLT=setTimeout(()=>{if(!document.hidden)cloudSync(false);},5000);
}
function clInit(){
  if(!cloudOn())return;
  clLoad();clHash();
  if(CL&&!CL.bad){setTimeout(()=>cloudSync(false),800);if(stravaOn()&&CL.sv==null)setTimeout(stravaStatus,1500);}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&CL&&!CL.bad&&Date.now()-(CL.last||0)>120000)cloudSync(false);});
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
    clSession({access_token:at,refresh_token:rt,expires_in:q.get('expires_in')||3600,user:u.j});
    if(q.get('type')==='recovery')clNewPwOpen();else{toast(t('clWelcome'));cloudSync(false);}
  }catch(e){}
}
/* ---- screens ---- */
function cloudCard(){
  if(!cloudOn())return'';
  if(!CL||CL.bad)return'<div class="card cloudc"><span class="li">'+ic('cloud')+'</span><div class="cl-t"><b>'+t('clT')+'</b><p class="muted sm">'+t(CL&&CL.bad?'clExpired':'clP')+'</p></div><div class="row"><button class="btn pri" onclick="clAuthOpen(\'up\')">'+t('clCreate')+'</button><button class="btn" onclick="clAuthOpen(\'in\')">'+t('clIn')+'</button></div></div>';
  const ago=CL.last?Math.max(0,Math.round((Date.now()-CL.last)/60000)):null;
  const st=CL.err==='off'?t('clOff'):CL.err?t('clFail'):(ago==null?t('clNever'):(ago<1?t('clJust'):t('clAgo',ago>=60?Math.round(ago/60)+' h':ago+' min')));
  return'<div class="card cloudc"><span class="li">'+ic('cloud')+'</span><div class="cl-t"><b>'+esc(CL.email)+'</b><p class="muted sm">'+st+'</p></div><div class="row"><button class="btn pri" onclick="cloudSync(true)">'+t('clSyncNow')+'</button><button class="btn" onclick="clAcctOpen()">'+t('clManage')+'</button></div>'+stravaRow()+'</div>';
}
function clAuthOpen(mode,msg){
  const up=mode==='up';
  sheet('<div class="form"><div class="pick-h"><h3>'+t(up?'clCreate':'clIn')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t(up?'clUpP':'clInP')+'</p>'+(msg?'<p class="clmsg">'+esc(msg)+'</p>':'')+
    '<label>'+t('clEmail')+'<input id="cle" class="in wide" type="email" autocomplete="email" inputmode="email"></label>'+
    '<label>'+t('clPw')+'<input id="clp" class="in wide" type="password" autocomplete="'+(up?'new-password':'current-password')+'"></label>'+
    (up?'<p class="muted sm">'+t('clPwRule')+'</p>':'<button class="lnk-d" onclick="clForgot()">'+t('clForgot')+'</button>')+
    '<div class="row"><button class="btn pri wide" id="clgo" onclick="clSubmit(\''+mode+'\')">'+t(up?'clCreate':'clIn')+'</button></div>'+
    '<button class="lnk-d" onclick="clAuthOpen(\''+(up?'in':'up')+'\')">'+t(up?'clHave':'clNo')+'</button></div>');
}
async function clSubmit(mode){
  const em=gv('cle').trim().toLowerCase(),pw=gv('clp');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){toast(t('clBadEmail'));return;}
  if(mode==='up'&&!pfRulesOk(pfRules(pw,em))){toast(t('clWeak'));return;}
  if(!pw){toast(t('clBadEmail'));return;}
  const b=$('clgo');if(b){b.disabled=true;b.textContent=t('clWait');}
  try{
    const r=await clReq(mode==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password','POST',{email:em,password:pw});
    if(!r.ok){
      const m=String((r.j&&(r.j.msg||r.j.error_description||r.j.message))||'');
      clAuthOpen(mode,/already|registered/i.test(m)?t('clExists'):(/invalid|credentials/i.test(m)?t('clWrong'):t('clFail')));return;
    }
    if(mode==='up'&&!(r.j&&r.j.access_token)){sheetClose();ask(t('clCheckMail',em),t('done'),function(){},false);return;}
    CL=null;if(!clSession(r.j.access_token?r.j:null)){clAuthOpen(mode,t('clFail'));return;}
    sheetClose();toast(t('clWelcome'));await cloudSync(false);render();
  }catch(e){clAuthOpen(mode,t('clOff'));}
}
async function clForgot(){
  const em=gv('cle').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){toast(t('clBadEmail'));return;}
  try{const r=await clReq('/auth/v1/recover','POST',{email:em});toast(t(r.ok?'clResetSent':'clFail'));}catch(e){toast(t('clOff'));}
}
function clNewPwOpen(){
  sheet('<div class="form"><h3>'+t('clNewPw')+'</h3><label>'+t('clPw')+'<input id="clp" class="in wide" type="password" autocomplete="new-password"></label><p class="muted sm">'+t('clPwRule')+'</p><div class="row"><button class="btn pri wide" onclick="clNewPwGo()">'+t('save')+'</button></div></div>');
}
async function clNewPwGo(){
  const pw=gv('clp');if(!pfRulesOk(pfRules(pw,(CL&&CL.email)||''))){toast(t('clWeak'));return;}
  try{const tok=await clToken(),r=await clReq('/auth/v1/user','PUT',{password:pw},tok);if(r.ok){sheetClose();toast(t('saved'));cloudSync(false);}else toast(t('clFail'));}catch(e){toast(t('clFail'));}
}
function clAcctOpen(){
  sheet('<div class="form"><div class="pick-h"><h3>'+t('clManage')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted">'+esc((CL&&CL.email)||'')+'</p>'+
    '<div class="row"><button class="btn wide" onclick="sheetClose();clOutAsk()">'+t('clOut')+'</button></div>'+
    '<div class="row"><button class="btn danger wide" onclick="sheetClose();clDelAsk()">'+t('clDel')+'</button></div><p class="muted sm">'+t('clDelP')+'</p></div>');
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
