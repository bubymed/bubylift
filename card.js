/* draws a line icon on the canvas / dibuja un icono de línea en el canvas */
function cardIcon(g,n,x,y,sz,col){
  const src=ICONS[n];if(!src||typeof Path2D==='undefined')return;
  g.save();g.translate(x,y);g.scale(sz/24,sz/24);g.strokeStyle=col;g.lineWidth=1.9;g.lineCap='round';g.lineJoin='round';
  (src.match(/ d="([^"]+)"/g)||[]).forEach(m=>{try{g.stroke(new Path2D(m.slice(4,-1)));}catch(e){}});
  g.restore();
}
/* Share card (v72): a picture of a workout to post or send; and CSV import / tarjeta para compartir (v72) e importar CSV. */
function cardFont(px,w){return(w||'700')+' '+px+'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';}
function wkCardData(wk){
  const top=wk.ex.map(x=>{const m=exMode(x.eid);let b=null,bs=-1;x.sets.forEach(s=>{const sc=setScore(m,s);if(sc>bs){bs=sc;b=s;}});return{eid:x.eid,n:x.n,m:m,b:b,pr:x.sets.some(s=>s.pr),sets:x.sets.length,sc:bs};})
    .sort((a,b)=>(b.pr-a.pr)||(b.sets-a.sets)).slice(0,5);
  return{name:wk.name,date:dFmt(wk.t,{month:'long',day:'numeric',year:'numeric'}),dur:wk.end?fmtDur((wk.end-wk.t)/1000):'',sets:wkSets(wk),vol:wShow(wkVol(wk))+' '+wUnit(),hr:wk.hr||null,kcal:wk.kcal||0,sv:!!wk.sv,prs:wk.ex.reduce((a,x)=>a+x.sets.filter(s=>s.pr).length,0),top:top};
}
function drawWkCard(wk){
  const d=wkCardData(wk),W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const cs=getComputedStyle(document.documentElement),acc=(cs.getPropertyValue('--accent')||'#d9480f').trim()||'#d9480f';
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle=acc;g.fillRect(0,0,W,16);
  g.fillStyle=acc;g.font=cardFont(56,'800');g.fillText('BUBYLIFT',80,140);
  g.fillStyle='#ffffff';g.font=cardFont(84,'800');
  let nm=d.name;while(g.measureText(nm).width>W-160&&nm.length>4)nm=nm.slice(0,-2);if(nm!==d.name)nm+='…';
  g.fillText(nm,80,290);
  g.fillStyle='#b9b9c2';g.font=cardFont(40,'500');g.fillText(d.date,80,350);
  const wo=!wk.ex.length; // watch-only workout (from Strava) / entrenamiento solo del reloj
  const stats=wo?[[d.dur||'—',t('duration')],[d.hr?d.hr.a+' bpm':'—',t('cdHr')],[d.kcal?d.kcal+' kcal':'—',t('cdKcal')]]:[[d.dur||'—',t('duration')],[String(d.sets),t('sets')],[d.vol,t('volume')]];
  stats.forEach((s,i)=>{const x=80+i*320;g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.roundRect?g.roundRect(x,420,290,170,26):g.rect(x,420,290,170);g.fill();
    g.fillStyle='#fff';g.font=cardFont(s[0].length>9?38:54,'800');g.fillText(s[0],x+24,508);g.fillStyle='#b9b9c2';g.font=cardFont(30,'500');g.fillText(s[1],x+24,558);});
  const ex0=(!wo&&(d.hr||d.kcal))?70:0;
  if(!wo&&(d.hr||d.kcal)){g.fillStyle='#ffffff';g.font=cardFont(40,'700');const tx=[d.hr?d.hr.a+' avg · '+d.hr.m+' max':'',d.kcal?d.kcal+' kcal':''].filter(Boolean).join('   ·   ');if(d.hr){cardIcon(g,'heart',80,624,44,'#ffffff');g.fillText(tx,140,660);}else g.fillText(tx,80,660);}
  if(d.prs){g.fillStyle=acc;g.font=cardFont(44,'800');cardIcon(g,'trophy',80,642+ex0,48,acc);g.fillText(d.prs+' PR',142,680+ex0);}
  let y=(d.prs?770:700)+ex0;
  d.top.slice(0,ex0?4:5).forEach(x=>{
    g.fillStyle='#fff';g.font=cardFont(44,'700');
    let n=exName(x.eid,x.n);while(g.measureText(n).width>640&&n.length>4)n=n.slice(0,-2);if(n!==exName(x.eid,x.n))n+='…';
    g.fillText(n,80,y);
    g.fillStyle='#b9b9c2';g.font=cardFont(40,'500');const r=x.sets+' × '+(x.b?fmtSet(x.m,x.b):'');
    g.textAlign='right';g.fillText(r.length>26?r.slice(0,26):r,W-80,y);g.textAlign='left';
    g.fillStyle='rgba(255,255,255,.1)';g.fillRect(80,y+26,W-160,2);y+=96;
  });
  g.fillStyle='#8c8c96';g.font=cardFont(34,'500');g.fillText('bubymed.github.io/bubylift',80,H-70);if(d.sv){g.textAlign='right';g.fillText('Powered by Strava',W-80,H-70);g.textAlign='left';}
  return c;
}
function wkPic(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  let c;try{c=drawWkCard(wk);}catch(e){toast(t('copyFail'));return;}
  c.toBlob(function(b){
    if(!b){toast(t('copyFail'));return;}
    const f=new File([b],'bubylift-'+dInput(wk.t)+'.png',{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Bubylift'}).catch(()=>{});return;}}catch(e){}
    const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast(t('cdSaved'));
  },'image/png');
}
/* ---- CSV import: reads the file Bubylift exports / lee el archivo que exporta Bubylift ---- */
function csvParse(txt){
  const rows=[];let row=[],cur='',q=false;txt=txt.replace(/^\uFEFF/,'');
  for(let i=0;i<txt.length;i++){const ch=txt[i];
    if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"')q=true;else if(ch===','){row.push(cur);cur='';}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur='';}
    else cur+=ch;}
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows.filter(r=>r.length>1);
}
function eidByName(nm){
  nm=String(nm||'').trim().toLowerCase().replace(/^'/,'');if(!nm)return null;
  const hit=EXLIB.find(r=>String(r[1]).toLowerCase()===nm||String(r[2]).toLowerCase()===nm);if(hit)return hit[0];
  const cx=(DATA.custom||[]).find(c=>String(c.n).toLowerCase()===nm);return cx?cx.id:null;
}
function exMatch(nm){
  nm=String(nm||'').trim();let id=eidByName(nm);if(id)return id;
  const m=nm.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if(m){id=eidByName(m[2]+' '+m[1])||eidByName(m[1]);if(id)return id;}
  return null;
}
/* Normalise Bubylift / Hevy / Strong rows to one shape / normaliza filas de Bubylift, Hevy y Strong */
function csvNorm(rows){
  const H=rows[0].map(h=>String(h).trim().toLowerCase().replace(/^﻿/,'')),body=rows.slice(1);
  const fi=p=>H.findIndex(h=>h.indexOf(p)===0),has=k=>H.indexOf(k)>=0;
  const num=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:null;};
  const tyOf=v=>{v=String(v||'').toLowerCase();return(v==='w'||v==='warmup'||v==='warm up')?'w':(v==='d'||v==='dropset'||v==='drop set')?'d':(v==='f'||v==='failure')?'f':'';};
  const out=[];
  if(has('date')&&has('exercise')){
    const ix=k=>H.indexOf(k);
    body.forEach(r=>{const lb=/lb/i.test(r[ix('weight_unit')]||''),mi=/mi/i.test(r[ix('distance_unit')]||'');
      const w=num(r[ix('weight')]),d=num(r[ix('distance')]);
      out.push({t:new Date(r[ix('date')]+'T12:00:00').getTime(),end:0,wk:r[ix('workout')],ex:r[ix('exercise')],w:w==null?null:(lb?w/KG_LB:w),r:num(r[ix('reps')]),m:num(r[ix('minutes')]),d:d?(mi?d/KM_MI:d):null,ty:tyOf(r[ix('set_type')]),pr:!!r[ix('pr')]});});
    return out;
  }
  if(has('exercise_title')&&has('start_time')){
    const iw=fi('weight_'),lbW=/lb/.test(H[iw]||''),idd=fi('distance_'),miD=/mi/.test(H[idd]||''),k=n=>H.indexOf(n);
    body.forEach(r=>{const w=num(r[iw]),d=num(r[idd]),sc=num(r[k('duration_seconds')]);
      out.push({t:new Date(r[k('start_time')]).getTime(),end:new Date(r[k('end_time')]).getTime()||0,wk:r[k('title')],ex:r[k('exercise_title')],w:w==null?null:(lbW?w/KG_LB:w),r:num(r[k('reps')]),m:sc?sc/60:null,d:d?(miD?d/KM_MI:d):null,ty:tyOf(r[k('set_type')]),pr:false});});
    return out;
  }
  if(has('workout name')&&has('exercise name')){
    const iw=fi('weight'),lbW=/lb/.test(H[iw]||'')||(H[iw]==='weight'&&imp()),idd=fi('distance'),k=n=>H.indexOf(n);
    body.forEach(r=>{const w=num(r[iw]),d=num(r[idd]),sc=num(r[k('seconds')]);
      out.push({t:new Date(String(r[k('date')]).replace(' ','T')).getTime(),end:0,wk:r[k('workout name')],ex:r[k('exercise name')],w:w==null?null:(lbW?w/KG_LB:w),r:num(r[k('reps')]),m:sc?sc/60:null,d:d?d/1000:null,ty:tyOf(r[k('set order')]),pr:false});});
    return out;
  }
  return null;
}
function csvToWorkouts(txt){
  const rows=csvParse(txt);if(rows.length<2)return null;
  const nr=csvNorm(rows);if(!nr)return null;
  const by={},out=[],cx={};let skip=0;
  nr.forEach(r=>{
    if(!isFinite(r.t)||!String(r.ex||'').trim()){skip++;return;}
    let eid=exMatch(r.ex);
    if(!eid){const key=String(r.ex).trim().toLowerCase();
      if(!cx[key])cx[key]={id:'c_'+uid(),n:String(r.ex).trim().slice(0,60),g:'full',e:'other',m:(r.w==null&&r.r==null&&r.m)?'t':(r.w==null&&r.r!=null)?'bw':'wr'};
      eid=cx[key].id;}
    const nm=String(r.wk||'').slice(0,80),key=new Date(r.t).toDateString()+'|'+nm;
    let wk=by[key];if(!wk){wk=by[key]={id:'i'+r.t.toString(36)+out.length,t:r.t,end:r.end>r.t?r.end:0,name:nm,note:'',ex:[]};out.push(wk);}
    let x=wk.ex.find(y=>y.eid===eid);if(!x){x={eid:eid,n:cx&&Object.keys(cx).some(k=>cx[k].id===eid)?String(r.ex).trim().slice(0,80):exName(eid),sets:[]};wk.ex.push(x);}
    const s={w:r.w,r:r.r==null?null:Math.round(r.r),t:r.m,d:r.d};if(r.pr)s.pr=1;if(r.ty)s.ty=r.ty;
    x.sets.push(s);
  });
  const wks=out.map(cleanWk).filter(Boolean),used={};wks.forEach(w=>w.ex.forEach(e=>used[e.eid]=1));
  return{wks:wks,skip:skip,cx:Object.keys(cx).map(k=>cx[k]).filter(c=>used[c.id])};
}
function importCsv(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(f.size>20e6){toast(t('impBad'));return;}
  const r=new FileReader();
  r.onload=function(){
    const o=csvToWorkouts(String(r.result));if(!o){toast(t('impBad'));return;}
    const have={};DATA.workouts.forEach(w=>{have[Math.round(w.t/864e5)+'|'+w.name]=1;});
    const add=o.wks.filter(w=>!have[Math.round(w.t/864e5)+'|'+w.name]);
    if(!add.length){toast(t('impNone'));return;}
    ask(t('impCsvAsk',add.length),t('import'),function(){const uc={};add.forEach(w=>w.ex.forEach(e=>uc[e.eid]=1));(o.cx||[]).forEach(c=>{if(uc[c.id])DATA.custom.push(c);});add.forEach(w=>DATA.workouts.push(w));DATA.workouts.sort((a,b)=>b.t-a.t);saveData();toast(t('imported'));render();});
  };
  r.onerror=function(){toast(t('impBad'));};r.readAsText(f);
}
