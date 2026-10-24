'use strict';
/* Body tab (weight, body fat, measurements) and More tab (settings, backup, about).
   Pestaña Cuerpo (peso, grasa, medidas) y pestaña Más (ajustes, respaldo, acerca de). */

/* ---------- body ---------- */
const MEAS=['chest','waist','hips','arm','thigh','neck'];
/* weight trend: smoothed line (time-aware moving average) and pace per week / tendencia del peso: línea suavizada y ritmo por semana */
function bwEma(ws){let e=null,pt=0;return ws.map(b=>{if(e==null)e=b.w;else e+=(1-Math.pow(0.5,Math.max(0.5,(b.t-pt)/864e5)/5))*(b.w-e);pt=b.t;return{t:b.t,y:e};});}
function bwRate(ws){ // kg per week from the last 28 days, or null / kg por semana de los últimos 28 días
  const now=ws[ws.length-1].t,a=ws.filter(b=>b.t>=now-28*864e5);
  if(a.length<3||a[a.length-1].t-a[0].t<6*864e5)return null;
  const x0=a[0].t,xs=a.map(b=>(b.t-x0)/864e5),n=a.length,mx=xs.reduce((p,c)=>p+c,0)/n,my=a.reduce((p,c)=>p+c.w,0)/n;
  let nu=0,de=0;a.forEach((b,k)=>{nu+=(xs[k]-mx)*(b.w-my);de+=(xs[k]-mx)*(xs[k]-mx);});
  return de?nu/de*7:null;
}
function bwRange(v){UI.bwr=v;render();}
function bwStep(d){
  const e=$('bw');if(!e)return;const last=DATA.body.find(b=>b.w);
  let v=numParse(e.value);if(v==null)v=last?parseFloat(wShow(last.w)):null;if(v==null)return;
  e.value=fmtNum(Math.max(0,Math.round((v+d)*10)/10),1);
}
function vBody(){
  const today=dInput(Date.now()),last=DATA.body.find(b=>b.w),sg=d=>(d>0?'+':'')+fmtNum(d,1);
  const toU=kg=>imp()?kg*KG_LB:kg;
  let h='<div class="card form bwhero"><div class="lbl c">'+t('bwTitle')+'</div>'+
    '<div class="bw-row"><button class="bw-st" aria-label="'+esc(t('bwMinus'))+'" onclick="bwStep(-0.1)">−</button>'+
    '<span class="bw-f"><input id="bw" class="bw-in" type="text" inputmode="decimal" autocomplete="off" placeholder="'+esc(last?wShow(last.w):'0.0')+'"><b class="bw-u">'+wUnit()+'</b></span>'+
    '<button class="bw-st" aria-label="'+esc(t('bwPlus'))+'" onclick="bwStep(0.1)">+</button></div>'+
    (last?'<p class="muted sm c">'+t('bwLast',wShow(last.w)+' '+wUnit(),esc(dFmt(last.t,{month:'short',day:'numeric'})))+'</p>':'')+
    '<button class="btn pri big wide" onclick="bodySave()">'+t('bwSave')+'</button>'+
    '<details class="dtl"><summary>'+t('bwMore')+'</summary>'+
    '<label>'+t('date')+'<input id="bd" class="in wide" type="date" value="'+today+'" max="'+today+'"></label>'+
    '<label>'+t('bodyFat')+' (%)<input id="bf" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>'+
    '<div class="lbl">'+t('measure')+' ('+lUnit()+')</div><div class="two">'+MEAS.map(k=>'<label>'+t('me_'+k)+'<input id="bm_'+k+'" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>').join('')+'</div>'+
    '<label>'+t('note')+'<input id="bn" class="in wide" type="text" maxlength="120"></label></details></div>';
  if(!DATA.body.length)return h+'<div class="card tip"><b>'+t('emptyBodyT')+'</b><p>'+t('emptyBodyP')+'</p></div>';

  const ws=DATA.body.filter(b=>b.w>0).slice().reverse();
  if(ws.length){
    const cur=ws[ws.length-1],em=bwEma(ws),tr=em[em.length-1].y,rate=bwRate(ws),goal=SET.goal;
    const rg=UI.bwr||'3',days={'1':30,'3':91,'12':365,A:1e5}[rg]||91,from=cur.t-days*864e5;
    let idx=ws.findIndex(b=>b.t>=from);if(idx<0)idx=ws.length-1;if(idx>ws.length-2)idx=Math.max(0,ws.length-2);
    const pts=ws.slice(idx).map(b=>({t:b.t,y:b.w})),tpts=em.slice(idx);
    h+='<div class="stats card"><div><b>'+wShow(cur.w)+'</b><span>'+t('current')+' ('+wUnit()+')</span></div>'+
      '<div><b>'+wShow(tr)+'</b><span>'+t('bwTrendL')+' ('+wUnit()+')</span></div>'+
      '<div><b>'+(rate==null?'—':sg(toU(rate)))+'</b><span>'+t('bwRate')+' ('+wUnit()+')</span></div></div>';
    h+='<div class="card"><b>'+t('weightTrend')+'</b>'+seg([['1',t('bwRng1')],['3',t('bwRng3')],['12',t('bwRng12')],['A',t('bwRngA')]],rg,'bwRange')+
      lineSvg(pts,v=>wShow(v),goal,tpts)+'<p class="muted sm">'+t('bwDots')+'</p>'+
      (rate==null?'<p class="muted sm">'+t('bwNeed')+'</p>':'')+
      (goal?'<p class="sm">'+(Math.abs(tr-goal)*toU(1)<0.5?t('goalReached'):t('toGo',fmtNum(Math.abs(tr-goal)*toU(1),1)+' '+wUnit()))+'</p>':'')+
      (goal&&rate!=null&&Math.abs(tr-goal)*toU(1)>=0.5?'<p class="muted sm">'+((goal-tr)*rate>0&&Math.abs(rate)>0.02?(function(){const wk=Math.round((goal-tr)/rate);return wk<=104?t('bwEta',Math.max(1,wk)):'';})():t('bwAway'))+'</p>':'')+
      '<details class="dtl"><summary>'+t('bwGoalH')+'</summary><div class="goalrow"><label>'+t('goal')+' ('+wUnit()+')<input id="bg" class="in" type="text" inputmode="decimal" autocomplete="off" value="'+esc(goal?wShow(goal):'')+'"></label><button class="btn sm" onclick="goalSet()">'+t('set')+'</button></div></details></div>';
  }
  const ms=MEAS.map(k=>{const b=DATA.body.find(x=>x.m&&x.m[k]>0);return b?[k,b.m[k],b.t]:null;}).filter(Boolean);
  if(ms.length)h+='<div class="card"><b>'+t('measure')+'</b><div class="mtab">'+ms.map(a=>'<div><span>'+t('me_'+a[0])+'</span><b>'+lShow(a[1])+' '+lUnit()+'</b><small>'+esc(dFmt(a[2],{month:'short',day:'numeric'}))+'</small></div>').join('')+'</div></div>';
  h+='<div class="sec"><h2>'+t('entries')+'</h2></div>';
  DATA.body.slice(0,40).forEach(b=>{
    const parts=[];if(b.w)parts.push(wShow(b.w)+' '+wUnit());if(b.bf)parts.push(fmtNum(b.bf,1)+'%');if(b.m)parts.push(t('nMeas',Object.keys(b.m).length));
    h+='<div class="card bde"><div><b>'+esc(dFmt(b.t))+'</b><div class="muted sm">'+esc(parts.join(' · '))+(b.note?' — '+esc(b.note):'')+'</div></div><button class="ico" aria-label="'+esc(t('delete'))+'" onclick="bodyDel(\''+b.id+'\')">'+ic('trash')+'</button></div>';
  });
  return h;
}
function bodySave(){
  const o={id:uid(),t:dFromInput($('bd').value)};
  const w=wParse($('bw').value),bf=numParse($('bf').value);
  if(w!=null&&w>0&&w<700)o.w=w;
  if(bf!=null&&bf>0&&bf<100)o.bf=bf;
  const m={};MEAS.forEach(k=>{const v=lParse($('bm_'+k).value);if(v!=null&&v>0&&v<500)m[k]=v;});
  if(Object.keys(m).length)o.m=m;
  const n=$('bn').value.trim();if(n)o.note=n;
  if(o.w==null&&o.bf==null&&!o.m){toast(t('needBody'));return;}
  const day=dInput(o.t),ex=DATA.body.find(b=>dInput(b.t)===day); // one entry per day: update it / una entrada por día: se actualiza
  if(ex){if(o.w!=null)ex.w=o.w;if(o.bf!=null)ex.bf=o.bf;if(o.m)ex.m=Object.assign({},ex.m,o.m);if(o.note)ex.note=o.note;saveData();toast(t('bwUpd'));render();return;}
  DATA.body.push(o);DATA.body.sort((a,b)=>b.t-a.t);goalsCheck();saveData();toast(t('saved'));render();
}
function bodyDel(id){ask(t('delEntry'),t('delete'),function(){DATA.body=DATA.body.filter(b=>b.id!==id);saveData();render();},true);}
function goalSet(){
  const v=$('bg').value.trim();
  if(!v){SET.goal=null;}else{const g=wParse(v);if(g==null||g<=0||g>700){toast(t('needBody'));return;}SET.goal=g;}
  saveSet();render();
}

/* ---------- More ---------- */
function seg(opts,cur,fn){return'<div class="seg">'+opts.map(o=>'<button class="'+(String(o[0])===String(cur)?'on':'')+'" onclick="'+fn+'(\''+o[0]+'\')">'+esc(o[1])+'</button>').join('')+'</div>';}
function setAuto(v){SET.auto=v==='1';saveSet();render();}
function setSound(v){SET.sound=v==='1';saveSet();render();}
function setRest(v){SET.rest=parseInt(v,10)||90;saveSet();}
function mrow(ic,lab,act,sub){
  const inner='<span class="mi">'+ic+'</span><span class="mt">'+lab+(sub?'<small>'+sub+'</small>':'')+'</span><span class="mc">›</span>';
  return/^https?:/.test(act)?'<a class="mrow" href="'+act+'" target="_blank" rel="noopener">'+inner+'</a>':'<button class="mrow" onclick="'+act+'">'+inner+'</button>';
}
function vMore(){
  // iOS-style grouped list: one card, one row per setting / lista agrupada estilo iOS: una tarjeta, una fila por ajuste
  const row=(lab,ctl)=>'<div class="lrow"><span>'+lab+'</span>'+ctl+'</div>';
  const gp=(typeof pfCur==='function'&&pfCur());
  let h=(gp&&gp.g?'<div class="card tip"><b>'+ic('user')+' '+t('gnT')+'</b><p class="sm">'+t('gnP')+'</p><div class="row"><button class="btn pri" onclick="gSave()">'+t('gnYes')+'</button></div></div>':'')+'<div class="sec"><h2>'+t('prefs')+'</h2></div><div class="card grp">'+
    row(t('language'),seg([['en','English'],['es','Español']],LANG,'setLang'))+
    row(t('textSize'),seg([['s','A'],['m','A+'],['l','A++']],SET.fs||'s','setFs'))+
    row(t('appearance'),seg([['system',t('thSystem')],['dark',t('thDark')],['light',t('thLight')]],SET.theme||'system','setTheme'))+
    row(t('units'),seg([['imperial','lb·in·mi'],['metric','kg·cm·km']],SET.units,'setUnits'))+
    row(t('restTimer'),seg([['1',t('on')],['0',t('off')]],SET.auto?'1':'0','setAuto'))+
    row(t('restLen'),'<select class="in" onchange="setRest(this.value)">'+[30,45,60,90,120,150,180,240,300].map(s=>'<option value="'+s+'"'+(s===SET.rest?' selected':'')+'>'+fmtClock(s)+'</option>').join('')+'</select>')+
    row(t('sound'),seg([['1',t('on')],['0',t('off')]],SET.sound?'1':'0','setSound'))+'</div>';
  if(DATA.plan)h+='<div class="sec"><h2>'+t('myPlanS')+'</h2></div><div class="card grp mlist">'+
    mrow(ic('calendar'),t('rmT'),'remOpen()')+mrow(ic('heart'),t('tkBtn'),'tasteOpen()')+mrow(ic('calendar'),t('schBtn'),'schedOpen()')+mrow(ic('chart-bar'),t('volBtn'),'volOpen()')+
    (DATA.plan.prof&&DATA.plan.prof.test==='aft'?mrow(ic('target'),t('afT'),'aftOpen()'):'')+mrow(ic('compass'),t('planAll'),'planOpen()')+'</div>';
  h+='<div class="sec"><h2>'+t('yourData')+'</h2></div><div class="card grp mlist">'+
    mrow(ic('download'),t('exportBackup'),'exportJSON()',SET.lastExport?t('lastBackup',dFmt(SET.lastExport)):t('noBackup'))+
    mrow(ic('file-text'),t('exportCsv'),'exportCSV()')+
    '<label class="mrow"><span class="mi">'+ic('upload')+'</span><span class="mt">'+t('importCsv')+'</span><span class="mc">›</span><input type="file" accept=".csv,text/csv" onchange="importCsv(this)" hidden></label>'+
    '<label class="mrow"><span class="mi">'+ic('upload')+'</span><span class="mt">'+t('importBackup')+'</span><span class="mc">›</span><input type="file" accept=".json,application/json" onchange="importFile(this)" hidden></label></div>'+
    '<p class="muted sm mnote">'+t('dataP',DATA.workouts.length,DATA.body.length)+'</p>';
  h+='<div class="sec"><h2>'+t('app')+'</h2></div><div class="card grp mlist">'+
    (canInstall()?mrow(ic('device-mobile'),t('install'),'installApp()'):'')+
    mrow(ic('sparkles'),t('whatsNew'),'wnShow(true)')+
    mrow(ic('help-circle'),t('faqBtn'),'faqOpen()')+
    mrow(ic('message-circle'),t('fbT'),'https://tally.so/r/KpY5MA')+
    mrow(ic('share'),t('shT'),'shareOpen()')+
    mrow(ic('refresh'),t('updChk'),'checkUpd()',APP_VER)+'</div>'+
    '<div class="card creator"><div class="cr-top"><span class="cr-av">M<img src="icons/creator.jpg" alt="" onerror="this.remove()"></span><div><b>Mike</b><div class="muted sm">@bubylifts</div></div></div>'+
    '<p class="sm">'+t('crBio')+'</p><a class="btn pri wide" href="https://www.instagram.com/bubylifts/" target="_blank" rel="noopener">'+ic('brand-instagram')+' '+t('crFollow')+'</a></div>'+
    '<div class="card"><details class="dtl nob"><summary>'+t('about')+' · Bubylift '+APP_VER+'</summary><p class="sm">'+t('privacy')+'</p><p class="muted sm">'+t('credits')+'</p><p class="muted sm">'+t('disclaimer')+'</p>'+
    '<p class="sm"><a href="https://github.com/bubymed/bubylift" target="_blank" rel="noopener">github.com/bubymed/bubylift</a></p></details></div>';
  h+='<div class="card"><button class="btn danger wide" onclick="eraseAsk()">'+t('eraseAll')+'</button></div>';
  return h;
}

/* ---------- export / import ---------- */
function fileOut(name,text,mime){
  const f=new File([text],name,{type:mime});
  try{if((matchMedia('(pointer: coarse)').matches)&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(()=>{});return;}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}
function exportJSON(){
  const o={app:'bubylift',v:APP_VER,t:Date.now(),data:DATA};
  fileOut('bubylift-backup-'+dInput(Date.now())+'.json',JSON.stringify(o),'application/json');
  SET.lastExport=Date.now();saveSet();toast(t('exported'));if(tab==='more'||tab==='workout')render();
}
function csvCell(v){
  if(typeof v==='string'&&/^[=+\-@\t\r]/.test(v))v="'"+v;
  v=v==null?'':String(v);
  return/[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
}
function exportCSV(){
  const rows=[['date','workout','exercise','set','weight','weight_unit','reps','minutes','distance','distance_unit','pr']];
  DATA.workouts.slice().reverse().forEach(wk=>wk.ex.forEach(x=>x.sets.forEach((s,i)=>{
    rows.push([dInput(wk.t),wk.name,exName(x.eid,x.n),i+1,s.w!=null?wShow(s.w):'',wUnit(),s.r!=null?s.r:'',s.t!=null?s.t:'',s.d?dShow(s.d):'',dUnit(),s.pr?1:'']);
  })));
  fileOut('bubylift-workouts-'+dInput(Date.now())+'.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\n'),'text/csv');
  toast(t('exported'));
}
const ID_RE=/^[A-Za-z0-9_-]{1,40}$/;
const cn=v=>(typeof v==='number'&&isFinite(v)&&v>=0&&v<1e7)?v:null;
function cleanSet(s){if(!s||typeof s!=='object')return null;const o={w:cn(s.w),r:cn(s.r)==null?null:Math.round(s.r),t:cn(s.t),d:cn(s.d)};if(s.pr)o.pr=1;return o;}
function cleanCh(c){
  if(!c||typeof c!=='object'||!/^[a-z0-9]{2,12}$/.test(String(c.id))||![0,1,2,3,4,5].includes(c.lv)||!c.sc||typeof c.sc!=='object')return undefined;
  const n=v=>(typeof v==='number'&&isFinite(v)&&v>=0&&v<1e6)?v:0;
  return{id:String(c.id),lv:c.lv,v:c.v===2?2:undefined,sc:{v:n(c.sc.v),r:n(c.sc.r),x:n(c.sc.x)}};
}
function cleanWk(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||typeof x.t!=='number'||!isFinite(x.t)||!Array.isArray(x.ex))return null;
  const ex=[];
  x.ex.forEach(e=>{if(!e||!ID_RE.test(String(e.eid))||!Array.isArray(e.sets))return;const sets=e.sets.map(cleanSet).filter(Boolean);if(sets.length)ex.push({eid:String(e.eid),n:String(e.n||e.eid).slice(0,80),sets:sets});});
  if(!ex.length)return null;
  return{id:String(x.id),t:x.t,end:(typeof x.end==='number'&&isFinite(x.end))?x.end:0,name:String(x.name||'').slice(0,80),note:String(x.note||'').slice(0,500),ex:ex,pl:(Number.isInteger(x.pl)&&x.pl>=0&&x.pl<5)?x.pl:undefined,ch:cleanCh(x.ch)};
}
function cleanBody(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||typeof x.t!=='number'||!isFinite(x.t))return null;
  const o={id:String(x.id),t:x.t};
  if(cn(x.w)>0)o.w=x.w;if(cn(x.bf)>0&&x.bf<100)o.bf=x.bf;
  if(x.m&&typeof x.m==='object'){const m={};MEAS.forEach(k=>{if(cn(x.m[k])>0)m[k]=x.m[k];});if(Object.keys(m).length)o.m=m;}
  if(x.note)o.note=String(x.note).slice(0,120);
  return(o.w||o.bf||o.m)?o:null;
}
function cleanRt(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||!Array.isArray(x.ex))return null;
  const ex=x.ex.filter(e=>e&&ID_RE.test(String(e.eid))).map(e=>({eid:String(e.eid),n:String(e.n||e.eid).slice(0,80),sets:Math.max(1,Math.min(20,Math.round(cn(e.sets)||1)))}));
  return ex.length?{id:String(x.id),name:String(x.name||'').slice(0,60),ex:ex}:null;
}
function cleanCx(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||!x.n)return null;
  return{id:String(x.id),n:String(x.n).slice(0,60),g:EX_GROUPS.indexOf(x.g)>=0?x.g:'full',e:'other',m:['wr','bw','t'].indexOf(x.m)>=0?x.m:'wr'};
}
function cleanGoals(a){
  if(!Array.isArray(a))return[];
  return a.map(g=>{
    if(!g||typeof g!=='object'||!ID_RE.test(String(g.id))||['reps','lift','bw','ses'].indexOf(g.k)<0||!(cn(g.tg)>0))return null;
    const o={id:String(g.id),k:g.k,t:cn(g.t)||Date.now(),tg:g.tg};
    if((g.k==='reps'||g.k==='lift')){if(typeof g.eid!=='string'||!ID_RE.test(g.eid))return null;o.eid=String(g.eid);}
    if(g.k==='bw')o.st=cn(g.st)||g.tg;
    if(cn(g.done)>0)o.done=g.done;
    return o;
  }).filter(Boolean).slice(0,40);
}
function importFile(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(f.size>20e6){toast(t('impBad'));return;}
  const r=new FileReader();
  r.onload=function(){
    let o;try{o=JSON.parse(r.result);}catch(e){toast(t('impBad'));return;}
    if(!o||o.app!=='bubylift'||!o.data||typeof o.data!=='object'){toast(t('impBad'));return;}
    const d=o.data,arr=k=>Array.isArray(d[k])?d[k]:[];
    const have=k=>{const s={};DATA[k].forEach(x=>{s[x.id]=1;});return s;};
    const nw=arr('workouts').map(cleanWk).filter(Boolean),nb=arr('body').map(cleanBody).filter(Boolean),nr=arr('routines').map(cleanRt).filter(Boolean),nc=arr('custom').map(cleanCx).filter(Boolean),np=(!DATA.plan&&d.plan)?cleanPlan(d.plan):null,ng=cleanGoals(d.goals),na=(d.aft&&typeof d.aft==='object')?d.aft:null;
    const hw=have('workouts'),hb=have('body'),hr=have('routines'),hc=have('custom');
    const aw=nw.filter(x=>!hw[x.id]),ab=nb.filter(x=>!hb[x.id]),ar=nr.filter(x=>!hr[x.id]),ac=nc.filter(x=>!hc[x.id]);
    const gAdd=ng.filter(g=>!(DATA.goals||[]).some(x=>x.id===g.id));
    if(!aw.length&&!ab.length&&!ar.length&&!ac.length&&!np&&!gAdd.length){toast(t('impNone'));return;}
    ask(t('impAsk',aw.length,ab.length),t('import'),function(){
      aw.forEach(x=>DATA.workouts.push(x));ab.forEach(x=>DATA.body.push(x));ar.forEach(x=>DATA.routines.push(x));ac.forEach(x=>DATA.custom.push(x));if(np)DATA.plan=np;
      if(gAdd.length){DATA.goals=(DATA.goals||[]).concat(gAdd);}
      if(na&&!DATA.aft){DATA.aft={};['mdl','hrp','sdc','plk','run'].forEach(k=>{if(cn(na[k])>0)DATA.aft[k]=na[k];});}
      DATA.workouts.sort((a,b)=>b.t-a.t);DATA.body.sort((a,b)=>b.t-a.t);
      saveData();toast(t('imported'));render();
    });
  };
  r.onerror=function(){toast(t('impBad'));};
  r.readAsText(f);
}

/* ---------- erase everything ---------- */
function eraseAsk(){ask(t('eraseAsk'),t('continue'),function(){ask(t('eraseAsk2'),t('eraseAll'),eraseAll,true);},true);}
function eraseAll(){
  [K_DATA,K_SET,K_ACT].forEach(jdel);
  stopRest();unwake();
  const go=function(){location.replace(location.pathname);};
  if(ENC)pfFlush().then(go,go);else go();
}

/* share the app with a QR code / compartir la app con un código QR */
const APP_URL='https://bubymed.github.io/bubylift/';
async function shareOpen(){
  sheet('<div class="form"><div class="pick-h"><h3>'+ic('share')+' '+t('shT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted">'+t('shP')+'</p><div class="qrbox" id="shqr" style="cursor:default"></div><p class="g-c"><b>'+APP_URL.replace('https://','')+'</b></p>'+
    '<div class="row">'+(navigator.share?'<button class="btn pri" onclick="shareNative()">'+ic('share')+' '+t('shSend')+'</button>':'')+'<button class="btn" onclick="shareCopy()">'+ic('link')+' '+t('shCopy')+'</button></div><div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
  try{await pfLib('lib/qrcode.min.js');const e=$('shqr');if(e)e.innerHTML=pfQrSvg(APP_URL);}catch(e){const x=$('shqr');if(x)x.remove();}
}
function shareNative(){try{navigator.share({title:'Bubylift',text:t('shMsg'),url:APP_URL}).catch(function(){});}catch(e){}}
function shareCopy(){
  const ok=()=>toast(t('shCopied'));
  try{navigator.clipboard.writeText(APP_URL).then(ok,()=>prompt(t('shCopy'),APP_URL));}catch(e){prompt(t('shCopy'),APP_URL);}
}
