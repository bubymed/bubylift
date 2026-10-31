/* draws a line icon on the canvas / dibuja un icono de línea en el canvas */
function cardIcon(g,n,x,y,sz,col){
  const src=ICONS[n];if(!src||typeof Path2D==='undefined')return;
  g.save();g.translate(x,y);g.scale(sz/24,sz/24);g.strokeStyle=col;g.lineWidth=1.9;g.lineCap='round';g.lineJoin='round';
  (src.match(/ d="([^"]+)"/g)||[]).forEach(m=>{try{g.stroke(new Path2D(m.slice(4,-1)));}catch(e){}});
  g.restore();
}
/* Card data (v72) and CSV import; the picture itself is drawn in cardstudio.js / datos de la tarjeta (v72) e importar CSV; la imagen se dibuja en cardstudio.js */
function cardFont(px,w){return(w||'700')+' '+px+'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';}
function wkCardData(wk){
  const top=wk.ex.map(x=>{const m=exMode(x.eid);let b=null,bs=-1;x.sets.forEach(s=>{const sc=setScore(m,s);if(sc>bs){bs=sc;b=s;}});return{eid:x.eid,n:x.n,m:m,b:b,pr:x.sets.some(s=>s.pr),sets:x.sets.length,sc:bs};})
    ;
  return{name:wk.name,date:dFmt(wk.t,{month:'long',day:'numeric',year:'numeric'}),dur:wk.end?fmtDur((wk.end-wk.t)/1000):'',sets:wkSets(wk),vol:wShow(wkVol(wk))+' '+wUnit(),hr:wk.hr||null,kcal:wk.kcal||0,sv:!!wk.sv,prs:wk.ex.reduce((a,x)=>a+x.sets.filter(s=>s.pr).length,0),top:top};
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
