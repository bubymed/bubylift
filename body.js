'use strict';
/* Body tab (weight, body fat, measurements) and More tab (settings, backup, about).
   Pestaña Cuerpo (peso, grasa, medidas) y pestaña Más (ajustes, respaldo, acerca de). */

/* ---------- body ---------- */
const MEAS=['chest','waist','hips','arm','thigh','neck'];
function vBody(){
  const today=dInput(Date.now()),last=DATA.body.find(b=>b.w);
  let h='<div class="card form"><h2>'+t('logBody')+'</h2>'+
    '<label>'+t('date')+'<input id="bd" class="in wide" type="date" value="'+today+'" max="'+today+'"></label>'+
    '<div class="two"><label>'+t('weight')+' ('+wUnit()+')<input id="bw" class="in wide" type="text" inputmode="decimal" autocomplete="off" placeholder="'+esc(last?wShow(last.w):'')+'"></label>'+
    '<label>'+t('bodyFat')+' (%)<input id="bf" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label></div>'+
    '<details><summary>'+t('measure')+' ('+lUnit()+')</summary><div class="two">'+MEAS.map(k=>'<label>'+t('me_'+k)+'<input id="bm_'+k+'" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>').join('')+'</div></details>'+
    '<label>'+t('note')+'<input id="bn" class="in wide" type="text" maxlength="120"></label>'+
    '<button class="btn pri wide" onclick="bodySave()">'+t('save')+'</button></div>';
  if(!DATA.body.length)return h+'<div class="card tip"><b>'+t('emptyBodyT')+'</b><p>'+t('emptyBodyP')+'</p></div>';

  const ws=DATA.body.filter(b=>b.w>0).slice().reverse();
  if(ws.length){
    const cur=ws[ws.length-1],first=ws[0],prev=ws.length>1?ws[ws.length-2]:null;
    const ago=cur.t-30*864e5,base=ws.filter(b=>b.t<=ago).pop()||first;
    const ch=(a,b)=>{const d=(imp()?(a-b)*KG_LB:(a-b));return(d>0?'+':'')+fmtNum(d,1);};
    h+='<div class="stats card"><div><b>'+wShow(cur.w)+'</b><span>'+t('current')+' ('+wUnit()+')</span></div>'+
      '<div><b>'+(prev?ch(cur.w,prev.w):'—')+'</b><span>'+t('vsLast')+'</span></div>'+
      '<div><b>'+(base!==cur?ch(cur.w,base.w):'—')+'</b><span>'+t('vs30')+'</span></div></div>';
    const goal=SET.goal;
    h+='<div class="card"><b>'+t('weightTrend')+'</b>'+lineSvg(ws.slice(-90).map(b=>({t:b.t,y:b.w})),v=>wShow(v),goal)+
      '<div class="goalrow"><label>'+t('goal')+' ('+wUnit()+')<input id="bg" class="in" type="text" inputmode="decimal" autocomplete="off" value="'+esc(goal?wShow(goal):'')+'"></label><button class="btn sm" onclick="goalSet()">'+t('set')+'</button></div>'+
      (goal?'<p class="muted sm">'+(Math.abs(cur.w-goal)*(imp()?KG_LB:1)<0.5?t('goalReached'):t('toGo',fmtNum(Math.abs(cur.w-goal)*(imp()?KG_LB:1),1)+' '+wUnit()))+'</p>':'')+'</div>';
  }
  const ms=MEAS.map(k=>{const b=DATA.body.find(x=>x.m&&x.m[k]>0);return b?[k,b.m[k],b.t]:null;}).filter(Boolean);
  if(ms.length)h+='<div class="card"><b>'+t('measure')+'</b><div class="mtab">'+ms.map(a=>'<div><span>'+t('me_'+a[0])+'</span><b>'+lShow(a[1])+' '+lUnit()+'</b><small>'+esc(dFmt(a[2],{month:'short',day:'numeric'}))+'</small></div>').join('')+'</div></div>';
  h+='<div class="sec"><h2>'+t('entries')+'</h2></div>';
  DATA.body.slice(0,40).forEach(b=>{
    const parts=[];if(b.w)parts.push(wShow(b.w)+' '+wUnit());if(b.bf)parts.push(fmtNum(b.bf,1)+'%');if(b.m)parts.push(t('nMeas',Object.keys(b.m).length));
    h+='<div class="card bde"><div><b>'+esc(dFmt(b.t))+'</b><div class="muted sm">'+esc(parts.join(' · '))+(b.note?' — '+esc(b.note):'')+'</div></div><button class="ico" aria-label="'+esc(t('delete'))+'" onclick="bodyDel(\''+b.id+'\')">🗑</button></div>';
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
  DATA.body.push(o);DATA.body.sort((a,b)=>b.t-a.t);saveData();toast(t('saved'));render();
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
function vMore(){
  let h='<div class="card"><h2>'+t('language')+'</h2>'+seg([['en','English'],['es','Español']],LANG,'setLang')+'</div>';
  h+='<div class="card"><h2>'+t('appearance')+'</h2>'+seg([['system',t('thSystem')],['dark',t('thDark')],['light',t('thLight')]],SET.theme||'system','setTheme')+'</div>';
  h+='<div class="card"><h2>'+t('units')+'</h2>'+seg([['imperial','lb · in · mi'],['metric','kg · cm · km']],SET.units,'setUnits')+'</div>';
  h+='<div class="card"><h2>'+t('restTimer')+'</h2>'+seg([['1',t('on')],['0',t('off')]],SET.auto?'1':'0','setAuto')+
    '<label class="lblrow">'+t('restLen')+'<select class="in" onchange="setRest(this.value)">'+[30,45,60,90,120,150,180,240,300].map(s=>'<option value="'+s+'"'+(s===SET.rest?' selected':'')+'>'+fmtClock(s)+'</option>').join('')+'</select></label>'+
    '<div class="lblrow">'+t('sound')+seg([['1',t('on')],['0',t('off')]],SET.sound?'1':'0','setSound')+'</div></div>';
  h+='<div class="card"><h2>'+t('yourData')+'</h2><p class="muted sm">'+t('dataP',DATA.workouts.length,DATA.body.length)+'</p>'+
    '<div class="menu"><button onclick="exportJSON()">⬇ '+t('exportBackup')+'</button><button onclick="exportCSV()">⬇ '+t('exportCsv')+'</button><label class="btnl">⬆ '+t('importBackup')+'<input type="file" accept=".json,application/json" onchange="importFile(this)" hidden></label></div>'+
    '<p class="muted sm">'+(SET.lastExport?t('lastBackup',dFmt(SET.lastExport)):t('noBackup'))+'</p></div>';
  h+='<div class="card"><h2>'+t('app')+'</h2><div class="menu">'+(canInstall()?'<button onclick="installApp()">📲 '+t('install')+'</button>':'')+'<button onclick="wnShow(true)">✨ '+t('whatsNew')+'</button></div></div>';
  h+='<div class="card"><h2>'+t('about')+'</h2><p class="muted sm">Bubylift '+APP_VER+'</p><p class="sm">'+t('privacy')+'</p><p class="muted sm">'+t('disclaimer')+'</p>'+
    '<p class="sm"><a href="https://github.com/bubymed/bubylift" target="_blank" rel="noopener">github.com/bubymed/bubylift</a></p></div>';
  h+='<div class="card"><h2>'+t('danger')+'</h2><button class="btn danger wide" onclick="eraseAsk()">'+t('eraseAll')+'</button></div>';
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
function cleanWk(x){
  if(!x||typeof x!=='object'||!ID_RE.test(String(x.id))||typeof x.t!=='number'||!isFinite(x.t)||!Array.isArray(x.ex))return null;
  const ex=[];
  x.ex.forEach(e=>{if(!e||!ID_RE.test(String(e.eid))||!Array.isArray(e.sets))return;const sets=e.sets.map(cleanSet).filter(Boolean);if(sets.length)ex.push({eid:String(e.eid),n:String(e.n||e.eid).slice(0,80),sets:sets});});
  if(!ex.length)return null;
  return{id:String(x.id),t:x.t,end:(typeof x.end==='number'&&isFinite(x.end))?x.end:0,name:String(x.name||'').slice(0,80),note:String(x.note||'').slice(0,500),ex:ex};
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
function importFile(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(f.size>20e6){toast(t('impBad'));return;}
  const r=new FileReader();
  r.onload=function(){
    let o;try{o=JSON.parse(r.result);}catch(e){toast(t('impBad'));return;}
    if(!o||o.app!=='bubylift'||!o.data||typeof o.data!=='object'){toast(t('impBad'));return;}
    const d=o.data,arr=k=>Array.isArray(d[k])?d[k]:[];
    const have=k=>{const s={};DATA[k].forEach(x=>{s[x.id]=1;});return s;};
    const nw=arr('workouts').map(cleanWk).filter(Boolean),nb=arr('body').map(cleanBody).filter(Boolean),nr=arr('routines').map(cleanRt).filter(Boolean),nc=arr('custom').map(cleanCx).filter(Boolean);
    const hw=have('workouts'),hb=have('body'),hr=have('routines'),hc=have('custom');
    const aw=nw.filter(x=>!hw[x.id]),ab=nb.filter(x=>!hb[x.id]),ar=nr.filter(x=>!hr[x.id]),ac=nc.filter(x=>!hc[x.id]);
    if(!aw.length&&!ab.length&&!ar.length&&!ac.length){toast(t('impNone'));return;}
    ask(t('impAsk',aw.length,ab.length),t('import'),function(){
      aw.forEach(x=>DATA.workouts.push(x));ab.forEach(x=>DATA.body.push(x));ar.forEach(x=>DATA.routines.push(x));ac.forEach(x=>DATA.custom.push(x));
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
  try{[K_DATA,K_SET,K_ACT].forEach(k=>localStorage.removeItem(k));}catch(e){}
  stopRest();unwake();
  location.replace(location.pathname);
}
