/* History tab, line/bar charts, per-exercise Progress view and the calendar.
   Pestaña Historial, gráficas de línea/barras, vista de Progreso por ejercicio y calendario.
   Map of all files: docs/CODEMAP.md / Mapa de todos los archivos: docs/CODEMAP.md */
'use strict';
/* History and Progress tabs + small SVG charts.
   Pestañas Historial y Progreso + gráficas SVG pequeñas. */

/* ---------- charts ---------- */
function lineSvg(pts,fmt,goalY,trend){
  if(!pts.length)return'';
  const W=320,H=170,L=42,R=10,T=12,B=26;
  let ys=pts.map(p=>p.y);if(goalY!=null)ys=ys.concat(goalY);if(trend)ys=ys.concat(trend.map(p=>p.y));
  let mn=Math.min.apply(null,ys),mx=Math.max.apply(null,ys);
  if(mn===mx){mn-=1;mx+=1;}
  const pad=(mx-mn)*0.12;mn-=pad;mx+=pad;
  const t0=pts[0].t,t1=pts[pts.length-1].t;
  const X=p=>(pts.length===1||t1===t0)?L+(W-L-R)/2:L+(p.t-t0)/(t1-t0)*(W-L-R);
  const Y=y=>T+(1-(y-mn)/(mx-mn))*(H-T-B);
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="chart">';
  [0,0.5,1].forEach(f=>{const y=T+f*(H-T-B),v=mx-f*(mx-mn);s+='<line class="ch-g" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/><text class="ch-t" x="'+(L-5)+'" y="'+(y+3)+'" text-anchor="end">'+esc(fmt(v))+'</text>';});
  if(goalY!=null)s+='<line class="ch-goal" x1="'+L+'" y1="'+Y(goalY)+'" x2="'+(W-R)+'" y2="'+Y(goalY)+'"/>';
  const pth=a=>a.map((p,i)=>(i?'L':'M')+X(p).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' ');
  if(trend&&trend.length>1)s+='<path class="ch-l" d="'+pth(trend)+'"/>';
  else if(pts.length>1)s+='<path class="ch-l" d="'+pth(pts)+'"/>';
  if(pts.length<=(trend?120:60))pts.forEach(p=>{s+='<circle class="ch-d'+(trend?' lite':'')+'" cx="'+X(p).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="3"/>';});
  const dopt={month:'short',day:'numeric'};
  s+='<text class="ch-t" x="'+L+'" y="'+(H-8)+'">'+esc(dFmt(t0,dopt))+'</text>';
  if(pts.length>1)s+='<text class="ch-t" x="'+(W-R)+'" y="'+(H-8)+'" text-anchor="end">'+esc(dFmt(t1,dopt))+'</text>';
  return s+'</svg>';
}
function barSvg(vals,labels){
  const W=320,H=140,L=8,R=8,T=14,B=24,n=vals.length,mx=Math.max(1,Math.max.apply(null,vals)),bw=(W-L-R)/n;
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="chart">';
  vals.forEach((v,i)=>{
    const h=(H-T-B)*v/mx,x=L+i*bw+bw*0.15,w=bw*0.7;
    s+='<rect class="ch-b'+(i===n-1?' cur':'')+'" x="'+x.toFixed(1)+'" y="'+(H-B-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(h,v?2:0).toFixed(1)+'" rx="3"/>';
    if(v)s+='<text class="ch-t" x="'+(x+w/2).toFixed(1)+'" y="'+(H-B-h-4).toFixed(1)+'" text-anchor="middle">'+v+'</text>';
    s+='<text class="ch-t" x="'+(x+w/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(labels[i])+'</text>';
  });
  return s+'</svg>';
}

/* ---------- history ---------- */
/* Strava activity type → friendly name / tipo de actividad de Strava → nombre */
function spName(s){const k='sp_'+String(s||'').replace(/[^A-Za-z]/g,'');return STR[k]?t(k):(s?String(s).replace(/([a-z])([A-Z])/g,'$1 $2'):t('svWatch'));}
function wkDur(wk){return(wk.end&&wk.end>wk.t)?(wk.end-wk.t)/1000:0;}
function wkPRs(wk){let n=0;wk.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr)n++;}));return n;}
function wkCard(wk){
  if(!isFinite(wk.t))return'';
  const d=wkDur(wk),pr=wkPRs(wk),vol=wkVol(wk),dt=new Date(wk.t);
  return'<div class="wkw"><button class="lrow wkrow" onclick="openWk(\''+wk.id+'\')"><span class="dchip"><b>'+dt.getDate()+'</b><small>'+esc(dFmt(wk.t,{month:'short'}).replace('.',''))+'</small></span>'+
    '<span class="lt2"><b>'+esc(wk.name||dFmt(wk.t,{weekday:'long'}))+(pr?' <span class="pr">'+ic('trophy')+' '+pr+'</span>':'')+'</b>'+
    '<small>'+(d?fmtDur(d)+(wk.ex.length?' · ':''):'')+wkCountTxt(wk)+(vol?' · '+vShow(vol)+' '+wUnit():'')+'</small>'+
    '<small>'+(wk.ex.length?wk.ex.slice(0,3).map(x=>esc(exNameV(x.eid,x.vr,x.n))).join(' · ')+(wk.ex.length>3?' …':''):esc(spName(wk.sp)))+(wk.hr?' · '+ic('heart')+' '+wk.hr.a:'')+(wk.kcal?' · '+wk.kcal+' kcal':'')+'</small></span><span class="lc">›</span></button>'+xBtn('delWkAsk(\''+wk.id+'\')')+'</div>';
}
/* a session made only of stretching/mobility moves lives in its own tab / una sesión solo de estiramiento y movilidad vive en su propia pestaña */
function wkKind(wk){return wk.ex.length&&wk.ex.every(x=>isMobEx(x.eid))?'s':'w';}
function histSet(){const k=UI.ht==='s'?'s':'w';return DATA.workouts.filter(w=>isFinite(w.t)&&wkKind(w)===k);}
function vHistory(){
  const addB='<button class="btn wide" onclick="wkNewOpen()">＋ '+t('logPast')+'</button>';
  if(!DATA.workouts.length)return emptyState('clipboard-list',t('emptyHistT'),t('emptyHistP'),t('emStart'),"go('workout')")+addB;
  const nS=DATA.workouts.filter(w=>isFinite(w.t)&&wkKind(w)==='s').length;if(!nS)UI.ht='w'; // no stretch sessions: nothing to switch to / sin sesiones de estiramiento: no hay a dónde cambiar
  const isS=UI.ht==='s',list=histSet();
  const now=new Date(),ws=weekStart(now.getTime()),ms=new Date(now.getFullYear(),now.getMonth(),1).getTime();
  const wn=list.filter(w=>w.t>=ws).length,mn=list.filter(w=>w.t>=ms).length;
  let h=(isS?'':addB)+(nS?'<div class="seg hseg" role="tablist"><button role="tab" aria-selected="'+!isS+'" class="'+(isS?'':'on')+'" onclick="hTab(\'w\')">'+t('hTabW')+'</button><button role="tab" aria-selected="'+isS+'" class="'+(isS?'on':'')+'" onclick="hTab(\'s\')">'+t('hTabS')+'</button></div>':'')+
    '<div class="stats card calc" role="button" tabindex="0" onclick="calOpen()"><div><b>'+wn+'</b><span>'+t('thisWeek')+'</span></div><div><b>'+mn+'</b><span>'+t('thisMonth')+'</span></div><div><b>'+list.length+'</b><span>'+t('total')+'</span></div><p class="calh">'+ic('calendar')+' '+t('calOpenB')+' ›</p></div>';
  const grs=[];list.forEach(w=>w.ex.forEach(x=>{const e=exById(x.eid);if(e&&e.g&&grs.indexOf(e.g)<0)grs.push(e.g);}));
  const gOrder=isS?[]:EX_GROUPS.filter(g=>grs.indexOf(g)>=0);
  h+='<div class="hsr"><input id="hq" class="in wide" type="search" inputmode="search" autocomplete="off" maxlength="40" placeholder="'+esc(t('hSearchPh'))+'" value="'+esc(UI.hq||'')+'" oninput="hSearch(this.value)" aria-label="'+esc(t('hSearchPh'))+'">'+
    (gOrder.length>1?'<select id="hg" class="in" onchange="hGroup(this.value)" aria-label="'+esc(t('hAll'))+'"><option value="">'+t('hAll')+'</option>'+gOrder.map(g=>'<option value="'+g+'"'+(UI.hg===g?' selected':'')+'>'+t('g_'+g)+'</option>').join('')+'</select>':'')+'</div>';
  return h+'<div id="hlist">'+histList()+'</div>';
}
function hTab(k){UI.hN=0;UI.ht=k==='s'?'s':'w';UI.hq='';UI.hg='';render();}
/* the list below the search box: filtered by name or exercise (any language, accents ignored) and by muscle group / la lista bajo el buscador: filtrada por nombre o ejercicio (cualquier idioma, sin acentos) y por grupo muscular */
function wkMatch(wk,q,g){
  if(g&&!wk.ex.some(x=>{const e=exById(x.eid);return e&&e.g===g;}))return false;
  if(!q)return true;
  if(norm(wk.name).indexOf(q)>=0||norm(wk.note).indexOf(q)>=0)return true;
  const tok=q.split(/\s+/).filter(Boolean); // same matcher as the exercise picker: typos, plurals, synonyms / el mismo buscador que el selector
  return wk.ex.some(x=>{const e=exById(x.eid);return norm(x.n).indexOf(q)>=0||(e&&exRank(e,tok)>=0);});
}
function histList(){
  const q=norm((UI.hq||'').trim()),g=UI.hg||'',all=histSet(),a=all.filter(w=>wkMatch(w,q,g));
  if(!a.length)return'<div class="card tip"><p class="muted">'+t(all.length||UI.ht==='s'?'hNone':'hNoneW')+'</p></div>';
  let h=(q||g)?'<p class="muted sm hcnt">'+t('hCount',a.length)+'</p>':'',last='';
  /* draw 40 workouts first; more on demand (hundreds of cards made the tab slow) / primero 40; más al pedirlos */
  const cap=UI.hN||40,more=a.length-cap;
  a.slice(0,cap).forEach(wk=>{
    const lb=dFmt(wk.t,{month:'long',year:'numeric'});
    if(lb!==last){if(last)h+='</div>';h+='<div class="sec"><h2>'+esc(lb)+'</h2></div><div class="lgrp">';last=lb;}
    h+=wkCard(wk);
  });
  return h+'</div>'+(more>0?'<button class="btn wide" onclick="hMore()">'+t('hMore',Math.min(more,80))+'</button>':'');
}
function hMore(){UI.hN=(UI.hN||40)+80;const l=document.getElementById('hlist');if(l)l.innerHTML=histList();}
function hSearch(v){UI.hN=0;UI.hq=String(v).slice(0,40);const l=document.getElementById('hlist');if(l)l.innerHTML=histList();}
function hGroup(v){UI.hN=0;UI.hg=v||'';const l=document.getElementById('hlist');if(l)l.innerHTML=histList();}
function wkText(wk){
  let s=wk.name+' — '+dFmt(wk.t)+'\n';
  wk.ex.forEach(x=>{const m=exMode(x.eid);s+='\n'+exNameV(x.eid,x.vr,x.n)+'\n';x.sets.forEach((st,i)=>{s+='  '+(i+1)+') '+fmtSet(m,st)+(st.pr?' 🏆':'')+'\n';});});
  if(wk.note)s+='\n'+wk.note+'\n';
  return s+'\nBubylift';
}
function openWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  const d=wkDur(wk);
  let h='<div class="wkd"><h3>'+esc(wk.name)+'</h3><p class="muted">'+esc(dFmt(wk.t,{weekday:'long',month:'long',day:'numeric',year:'numeric'}))+'</p>'+
    '<div class="stats">'+(d?'<div><b>'+fmtDur(d)+'</b><span>'+t('duration')+'</span></div>':'')+''+wkCountBox(wk)+'<div><b>'+vShow(wkVol(wk))+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>'+
    ((wk.hr||wk.kcal)?'<div class="stats svst">'+(wk.hr?'<div><b>'+wk.hr.a+'</b><span>'+t('svAvg')+'</span></div><div><b>'+wk.hr.m+'</b><span>'+t('svMax')+'</span></div>':'')+(wk.kcal?'<div><b>'+wk.kcal+'</b><span>kcal</span></div>':'')+'</div>'+(wk.sv?'<p class="muted sm c">Powered by Strava</p>':''):'');
  wk.ex.forEach(x=>{
    const m=exMode(x.eid);
    h+='<div class="wkd-ex"><b>'+esc(exNameV(x.eid,x.vr,x.n))+'</b>'+x.sets.map((s,i)=>'<div class="wkd-s"><span>'+(i+1)+'</span><span>'+esc(fmtSet(m,s))+'</span>'+(s.pr?'<i class="pr">'+ic('trophy')+'</i>':'')+'</div>').join('')+'</div>';
  });
  if(wk.note)h+='<p class="wkd-note">'+esc(wk.note)+'</p>';
  h+='<div class="menu"><button onclick="repeatWk(\''+id+'\')">↻ '+t('repeat')+'</button><button onclick="saveWkAsRoutine(\''+id+'\')">☰ '+t('saveRoutineS')+'</button>'+(typeof stravaOn==='function'&&stravaOn()?'<button onclick="stravaGet(\''+id+'\')">♥ '+t('svGet')+'</button>':'')+'<button onclick="wkEditOpen(\''+id+'\')">'+ic('pencil')+' '+t('edit')+'</button><button onclick="shareWk(\''+id+'\')">⇪ '+t('share')+'</button><button onclick="wkPic(\''+id+'\')">'+ic('share')+' '+t('cdBtn')+'</button><button class="danger" onclick="delWkAsk(\''+id+'\')">'+ic('trash')+' '+t('delete')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div>';
  sheet(h);
}
function repeatWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  if(ACT){toast(t('finishFirst'));return;}
  sheetClose();
  startWorkout({name:wk.name,ex:wk.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.length,vr:x.vr,mul:x.mul,bar:x.bar,v:x.v}))});
}
function shareWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  const txt=wkText(wk);
  if(navigator.share){navigator.share({text:txt}).catch(()=>{});return;}
  try{navigator.clipboard.writeText(txt).then(()=>toast(t('copied')),()=>toast(t('copyFail')));}catch(e){toast(t('copyFail'));}
}
/* edit a saved workout: fix a typo in weight or reps, rename it, change the note, or remove a set
   editar un entrenamiento guardado: corregir un peso o repeticiones, cambiar el nombre o la nota, o quitar una serie */
let WKE=null;
function wkEditOpen(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  WKE=JSON.parse(JSON.stringify(wk));
  const d=wkDur(wk);WKE.dur=d>0?String(Math.max(1,Math.round(d/60))):'';WKE.dur0=WKE.dur;
  wkEditDraw();
}
function wkEditDraw(){
  const wk=WKE;if(!wk)return;
  let h='<div class="form wke"><div class="pick-h"><h3>'+t(wk.isNew?'logPast':'edit')+'</h3><button class="ico" onclick="wkEditCancel()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
   '<label>'+t('name')+'<input id="wkeN" class="in wide" type="text" maxlength="60" value="'+esc(wk.name||'')+'" oninput="WKE.name=this.value"></label>'+
   '<div class="row"><label>'+t('wkDate')+'<input class="in wide" type="date" value="'+dInput(wk.t)+'" max="'+dInput(Date.now())+'" onchange="wkeDate(this.value)"></label>'+
   '<label>'+t('wkDurMin')+'<input class="in wide" type="text" inputmode="numeric" autocomplete="off" value="'+esc(wk.dur||'')+'" oninput="wkeDur(this.value)"></label></div>';
  wk.ex.forEach((x,xi)=>{
    const m=exMode(x.eid),c1=m==='t'?t('colMin'):(m==='bw'?'+'+wUnit().toUpperCase():wUnit().toUpperCase()),c2=m==='t'?dUnit().toUpperCase():t('colReps');
    h+='<div class="wke-ex">'+esc(exNameV(x.eid,x.vr,x.n))+'</div><div class="wke-s wke-h"><span>'+t('colSet')+'</span><span>'+c1+'</span><span>'+c2+'</span><span></span></div>';
    x.sets.forEach((st,si)=>{
      const f1=m==='t'?'t':'w',f2=m==='t'?'d':'r',v1=st[f1]==null?'':(f1==='t'?fmtNum(st.t):wShow(st.w)),v2=st[f2]==null?'':(f2==='d'?dShow(st.d):String(st.r));
      const bd=wk.tried?wkeBad(m,st):[],c=f=>bd.indexOf(f)>=0?' bad':'';
      h+='<div class="wke-s"><span>'+(si+1)+'</span><input class="in'+c(f1)+'" data-wk="'+xi+'-'+si+'-'+f1+'" type="text" inputmode="decimal" autocomplete="off" value="'+esc(v1)+'" oninput="wkeSet('+xi+','+si+',\''+f1+'\',this.value)"><input class="in'+c(f2)+'" data-wk="'+xi+'-'+si+'-'+f2+'" type="text" inputmode="'+(f2==='r'?'numeric':'decimal')+'" autocomplete="off" value="'+esc(v2)+'" oninput="wkeSet('+xi+','+si+',\''+f2+'\',this.value)"><button class="ico" onclick="wkeRm('+xi+','+si+')" aria-label="'+esc(t('delete'))+'">✕</button></div>';
    });
    h+='<button class="btn wide" onclick="wkeAddSet('+xi+')">＋ '+t('addSet')+'</button>';
  });
  h+='<button class="btn wide" onclick="wkeAddEx()">＋ '+t('addEx')+'</button>'+
    '<label>'+t('note')+'<textarea class="note-in" rows="2" maxlength="500" oninput="WKE.note=this.value">'+esc(wk.note||'')+'</textarea></label>'+
    '<div class="row"><button class="btn pri" onclick="wkEditSave()">'+t('save')+'</button><button class="btn" onclick="wkEditCancel()">'+t('cancel')+'</button></div></div>';
  sheet(h);
}
/* log a workout you forgot to track: same editor, starts empty / registrar un entrenamiento que no anotaste: mismo editor, empieza vacío */
function dayNoon(ts){const d=new Date(ts);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12,0,0).getTime();}
function wkNewOpen(){WKE={id:uid(),isNew:1,t:dayNoon(Date.now()),dur:'',name:'',note:'',ex:[]};wkEditDraw();}
/* changing the date keeps the time of day / cambiar la fecha conserva la hora del día */
function wkeDate(v){
  if(!WKE||!v)return;
  let ts=dFromInput(v);const today=dayNoon(Date.now());
  if(ts>today){ts=today;toast(t('noFuture'));}
  const o=new Date(WKE.t),d=new Date(ts);d.setHours(o.getHours(),o.getMinutes(),o.getSeconds(),0);
  WKE.t=Math.min(d.getTime(),Date.now());
  if(ts===today)wkEditDraw();
}
function wkeDur(v){if(!WKE)return;v=String(v).replace(/\D/g,'').slice(0,4);WKE.dur=v;}
function wkeAddEx(){
  pickEx(function(eid){
    if(!WKE)return;const m=exMode(eid);
    WKE.ex.push({eid:eid,n:exName(eid),sets:[m==='t'?{t:null,d:null}:{w:m==='bw'?0:null,r:null}]});
    wkEditDraw();
  },true);
}
function wkeAddSet(xi){
  const x=WKE&&WKE.ex[xi];if(!x)return;
  const l=x.sets[x.sets.length-1],m=exMode(x.eid);
  x.sets.push(l?{w:l.w,r:l.r,t:l.t,d:l.d}:(m==='t'?{t:null,d:null}:{w:m==='bw'?0:null,r:null}));
  wkEditDraw();
}
function wkeSet(xi,si,f,v){
  const st=WKE&&WKE.ex[xi]&&WKE.ex[xi].sets[si];if(!st)return;
  v=String(v).trim();let n=null;
  if(v!==''){if(f==='w')n=wParse(v);else if(f==='d')n=dParse(v);else if(f==='r'){n=parseInt(v,10);if(!(n>=0))n=null;}else n=numParse(v);}
  if(n!=null&&n>({w:1500,r:999,t:1440,d:1000}[f]||1e9)){n=null;toast(t('tooBig'));}
  st[f]=n;
  if(WKE.tried){const el=document.querySelector('[data-wk="'+xi+'-'+si+'-'+f+'"]');if(el)el.classList.toggle('bad',wkeBad(exMode(WKE.ex[xi].eid),st).indexOf(f)>=0);}
}
function wkeRm(xi,si){
  const x=WKE&&WKE.ex[xi];if(!x)return;
  x.sets.splice(si,1);if(!x.sets.length)WKE.ex.splice(xi,1);
  wkEditDraw();
}
function wkEditCancel(){const id=WKE&&WKE.id,nw=WKE&&WKE.isNew;WKE=null;if(id&&!nw)openWk(id);else sheetClose();}
/* trophies: a set is a record when it beats everything done before it. Recomputed in time order for the given exercises after any change to history
   trofeos: una serie es récord si supera todo lo anterior. Se recalcula en orden cronológico para los ejercicios dados tras cualquier cambio */
function prRecalc(keys){
  const best={};
  DATA.workouts.slice().sort((a,b)=>a.t-b.t).forEach(wk=>wk.ex.forEach(x=>{
    const k=xk(x);if(keys&&keys.indexOf(k)<0)return;
    const m=exMode(x.eid);
    x.sets.forEach(s=>{
      const sc=setScore(m,s),b=best[k]||0;
      if(b>0&&sc>b)s.pr=1;else delete s.pr;
      if(sc>b)best[k]=sc;
    });
  }));
}
/* which numbers of a set are missing (after a first failed save they are outlined) / qué números de una serie faltan (tras un guardado fallido se marcan) */
function wkeBad(m,s){return m==='t'?(s.t!=null&&s.t>0?[]:['t']):(m==='bw'?(s.r!=null&&s.r>0?[]:['r']):[s.w==null?'w':'',s.r!=null&&s.r>0?'':'r'].filter(Boolean));}
function wkEditSave(){
  const wk=WKE;if(!wk)return;
  for(let xi=0;xi<wk.ex.length;xi++){const x=wk.ex[xi],m=exMode(x.eid);for(let si=0;si<x.sets.length;si++){
    const bd=wkeBad(m,x.sets[si]);
    if(bd.length){wk.tried=1;toast(t(m==='t'?'needTime':(m==='bw'?'needReps':'needWR')));wkEditDraw();errField(document.querySelector('[data-wk="'+xi+'-'+si+'-'+bd[0]+'"]'));return;}
  }}
  if(!wk.ex.length){toast(t('wkeNone'));return;}
  const old=wk.isNew?null:DATA.workouts.find(w=>w.id===wk.id);
  if(!wk.isNew&&!old){WKE=null;sheetClose();return;}
  const dur=parseInt(wk.dur,10)||0;
  let end=0;
  if(old&&wk.dur===wk.dur0)end=old.end>old.t?old.end+(wk.t-old.t):0; // duration untouched: keep exact length, shift with the date
  else if(dur>0)end=wk.t+dur*6e4;
  const keys=[];
  const o=Object.assign({},wk);delete o.isNew;delete o.dur;delete o.dur0;delete o.tried;
  o.end=end;o.name=(wk.name||'').trim()||(old&&old.name)||autoName(wk.t);o.note=(wk.note||'').trim();
  o.ex=wk.ex.map(x=>{const e=Object.assign({},x);e.sets=x.sets.map(s=>{const q={w:s.w,r:s.r,t:s.t,d:s.d};if(s.ty)q.ty=s.ty;return q;});keys.push(xk(e));return e;});
  if(old){old.ex.forEach(x=>{if(keys.indexOf(xk(x))<0)keys.push(xk(x));});DATA.workouts[DATA.workouts.indexOf(old)]=o;}
  else DATA.workouts.push(o);
  DATA.workouts.sort((a,b)=>b.t-a.t);
  prRecalc(keys);goalsCheck();rkCheck();
  saveData();WKE=null;sheetClose();render();toast(t('saved'));
  if(old)openWk(o.id);
}
function delWkAsk(id){if(!DATA.workouts.some(w=>w.id===id))return;ask(t('delWk'),t('delete'),function(){delWkDo(id);},true);}
function delWkDo(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  const snap=JSON.stringify(DATA.workouts),keys=wk.ex.map(xk);
  DATA.workouts=DATA.workouts.filter(w=>w.id!==id);
  prRecalc(keys); // a later set may now be the record / una serie posterior puede ser ahora el récord
  jset(K_DATA,DATA);sheetClose();render();
  undoDo(t('wkGone'),function(){DATA.workouts=JSON.parse(snap);jset(K_DATA,DATA);render();},function(){DATA.workouts=DATA.workouts.filter(w=>w.id!==id);clTomb(id);saveData();});
}

/* ---------- progress ---------- */
function loggedEx(){
  const m={};
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{const o=m[x.eid]||(m[x.eid]={eid:x.eid,n:x.n,last:0,cnt:0});o.last=Math.max(o.last,wk.t);o.cnt++;}));
  return Object.keys(m).map(k=>m[k]).sort((a,b)=>b.last-a.last);
}
function bestSet(eid){
  const m=exMode(eid);let b=null,bs=0;
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(x.eid===eid)x.sets.forEach(s=>{const sc=setScore(m,s);if(sc>bs||!b){bs=sc;b=s;}});}));
  return b;
}
function exSessions(eid){
  const m=exMode(eid),out=[];
  DATA.workouts.slice().reverse().forEach(wk=>{
    const x=wk.ex.find(y=>y.eid===eid);if(!x||!x.sets.length)return;
    const o={t:wk.t,top:0,e1:0,vol:0,maxr:0,totr:0,time:0,dist:0,sets:x.sets};
    x.sets.forEach(s=>{o.top=Math.max(o.top,s.w||0);o.e1=Math.max(o.e1,setScore(m,s));o.vol+=setVol(s);o.maxr=Math.max(o.maxr,s.r||0);o.totr+=s.r||0;o.time+=s.t||0;o.dist+=s.d||0;});
    out.push(o);
  });
  return out;
}
const METRICS={wr:[['e1','mEst1rm'],['top','mTop'],['vol','mVol']],bw:[['maxr','mMaxReps'],['totr','mTotReps'],['top','mAddW']],t:[['time','mTime'],['dist','mDist']]};
function metricFmt(k){return k==='maxr'||k==='totr'?(v=>String(Math.round(v))):(k==='time'?(v=>fmtNum(v,0)):(k==='dist'?(v=>dShow(v)):(v=>wShow(v))));}
function openProg(eid){UI.prog=eid;UI.pm=METRICS[exMode(eid)][0][0];render();window.scrollTo(0,0);}
function setPm(k){UI.pm=k;render();}
function closeProg(){UI.prog=null;render();window.scrollTo(0,0);}

/* big totals fit their box: 1,151,805 -> 1.15 M, 245,300 -> 245 k / los totales grandes caben en su caja */
function vShort(kg){const x=imp()?kg*KG_LB:kg,n=v=>{try{return v.toLocaleString(loc(),{maximumFractionDigits:2});}catch(e){return String(v);}};return x>=1e6?n(Math.round(x/1e4)/100)+' M':x>=1e5?n(Math.round(x/1e3))+' k':vShow(kg);}
function vProgress(){
  if(!DATA.workouts.length)return goalsCard()+strCard()+bwCard()+emptyState('chart-bar',t('emptyProgT'),t('emptyProgP'),t('emStart'),"go('workout')");
  if(UI.prog)return vExProg(UI.prog);
  const now=Date.now(),ws=weekStart(now),vals=[],labels=[];
  for(let i=7;i>=0;i--){const a=wkOff(ws,-i),b=wkOff(ws,1-i);vals.push(DATA.workouts.filter(w=>w.t>=a&&w.t<b).length);labels.push(dFmt(a,{month:'numeric',day:'numeric'}));}
  let vol=0,sets=0;DATA.workouts.forEach(w=>{vol+=wkVol(w);sets+=wkSets(w);});
  const pt=UI.pt||'sum';
  let h=streakCard()+xpCard()+goalsCard()+'<div class="stats card"><div><b>'+DATA.workouts.length+'</b><span>'+t('workouts')+'</span></div><div><b>'+sets+'</b><span>'+t('sets')+'</span></div><div><b>'+vShort(vol)+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>';
  h+='<div class="card"><b>'+t('perWeek')+'</b>'+barSvg(vals,labels)+'</div>';
  const rk=strCard()+bwCard(); // consistency level moved to Summary, muscle balance to Body > Muscles / constancia a Resumen, equilibrio a Cuerpo > Músculos
  let ex=featCharts()+'<div class="sec"><h2>'+t('exercises')+'</h2></div><div class="lgrp">';
  loggedEx().forEach(o=>{
    const m=exMode(o.eid),b=bestSet(o.eid);
    ex+='<button class="lrow" onclick="openProg(\''+o.eid+'\')">'+(typeof EXPHOTO!=='undefined'&&EXPHOTO.has(o.eid)?photoTh(o.eid):'<span class="li">'+ic('barbell')+'</span>')+'<span class="lt2"><b>'+esc(exName(o.eid,o.n))+'</b><small>'+t('sessions',o.cnt)+(b?' · '+t(m==='t'?'longest':'best')+': '+esc(fmtSet(m,b)):'')+'</small></span><span class="lc">›</span></button>';
  });
  ex+='</div>';
  ex+='<details class="dtl tools"><summary>'+t('toolsT')+'</summary>'+rmCalc()+'</details>'; // calculators folded at the end / calculadoras plegadas al final
  return subBar('pt',[['sum',t('psOv')],['rank',t('psRank')],['ex',t('psEx')]],pt)+subWrap(pt==='rank'?rk:(pt==='ex'?ex:h));
}
/* Top lifts with a chart right on the Progress home / las ejercicios principales con gráfica en Progreso */
function featCharts(){
  const c=loggedEx().filter(o=>exMode(o.eid)==='wr').slice().sort((a,b)=>b.cnt-a.cnt),out=[];
  for(let i=0;i<c.length&&out.length<3;i++){const ss=exSessions(c[i].eid),pts=ss.map(o=>({t:o.t,y:o.e1})).filter(p=>p.y>0);if(pts.length>=2)out.push({o:c[i],pts:pts});}
  if(!out.length)return'';
  let h='<div class="sec"><h2>'+t('topLifts')+'</h2></div>';
  out.forEach(x=>{const a=x.pts[0].y,b=x.pts[x.pts.length-1].y,d=b-a;
    h+='<button class="card tl" onclick="openProg(\''+x.o.eid+'\')"><div class="tl-h"><b>'+esc(exName(x.o.eid,x.o.n))+'</b><span class="tl-d '+(d>=0?'up':'dn')+'">'+(d>=0?'▲ +':'▼ ')+wShow(Math.abs(d)*(d>=0?1:-1)).replace(/^-/,'')+' '+wUnit()+'</span></div><div class="muted sm">'+t('mEst1rm')+': '+wShow(b)+' '+wUnit()+'</div>'+lineSvg(x.pts,v=>wShow(v))+'</button>';});
  return h;
}
/* Visible 1RM calculator / calculadora de 1RM a la vista */
const RM_PCT=[95,90,85,80,75,70,65,60];
function rmCalc(){
  return '<div class="card rmc"><b>'+t('rmCalc')+'</b><div class="muted sm">'+t('rmHint')+'</div><div class="rmc-in"><label>'+t('rmW')+' ('+wUnit()+')<input id="rmw" class="in wide" inputmode="decimal" oninput="rmUpdate()"></label><label>'+t('rmR')+'<input id="rmr" class="in wide" inputmode="numeric" oninput="rmUpdate()"></label></div><div id="rmout" class="rmc-out"></div></div>';
}
function rmUpdate(){
  const o=$('rmout');if(!o)return;const w=wParse($('rmw').value),r=parseInt($('rmr').value,10),m=(w>0&&r>0&&r<=30)?e1rm(w,r):0;
  if(!m){o.innerHTML='';return;}
  o.innerHTML='<div class="rmc-big"><b>'+wShow(m)+' '+wUnit()+'</b><span>'+t('mEst1rm')+'</span></div><div class="rmc-grid">'+RM_PCT.map(p=>'<div><b>'+wShow(m*p/100)+'</b><span>'+p+'%</span></div>').join('')+'</div>';
}
function vExProg(eid){
  const m=exMode(eid),ss=exSessions(eid),mets=METRICS[m],cur=mets.find(a=>a[0]===UI.pm)||mets[0],k=cur[0],f=metricFmt(k);
  const pts=ss.map(o=>({t:o.t,y:o[k]})).filter(p=>p.y>0);
  let h='<button class="btn sm" onclick="closeProg()">← '+t('back')+'</button><div class="sec"><h2>'+esc(exName(eid,(loggedEx().find(o=>o.eid===eid)||{}).n))+'</h2></div>';
  h+='<div class="chips">'+mets.map(a=>'<button class="chip'+(a[0]===k?' on':'')+'" onclick="setPm(\''+a[0]+'\')">'+t(a[1])+'</button>').join('')+'</div>';
  if(k==='e1')h+='<p class="muted sm hlp">'+t('mHelp')+'</p>';
  h+='<div class="card">'+(pts.length?lineSvg(pts,f):'<p class="muted">'+t('noData')+'</p>')+'</div>';
  const b=bestSet(eid);let tv=0,tt=0,td=0,tr=0,e1=0;
  ss.forEach(o=>{tv+=o.vol;tt+=o.time;td+=o.dist;tr+=o.totr;e1=Math.max(e1,o.e1);});
  let cards='';
  if(m==='wr')cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('bestSet')+'</span></div><div><b>'+wShow(e1)+'</b><span>'+t('mEst1rm')+' ('+wUnit()+')</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div><div><b>'+wShow(tv)+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div>';
  else if(m==='bw')cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('bestSet')+'</span></div><div><b>'+tr+'</b><span>'+t('mTotReps')+'</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div>';
  else cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('longest')+'</span></div><div><b>'+fmtNum(tt,0)+'</b><span>'+t('mTime')+'</span></div><div><b>'+dShow(td)+' '+dUnit()+'</b><span>'+t('mDist')+'</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div>';
  h+='<div class="stats card grid2">'+cards+'</div>';
  if(m==='wr'&&e1>0){h+='<div class="card rmc"><b>'+t('rmTable')+'</b><div class="rmc-grid">'+RM_PCT.map(p=>'<div><b>'+wShow(e1*p/100)+'</b><span>'+p+'%</span></div>').join('')+'</div></div>';}
  h+='<div class="sec"><h2>'+t('recentSessions')+'</h2></div>';
  ss.slice(-6).reverse().forEach(o=>{h+='<div class="card sm-card"><b>'+esc(dFmt(o.t))+'</b><div class="muted sm">'+o.sets.map(s=>esc(fmtSet(m,s))).join(' · ')+'</div></div>';});
  return h;
}

/* v0.99.10: History lives inside Progress as a segmented control / el Historial vive dentro de Progreso */
function psSet(k){UI.ps=k;SET.ps=k;saveSet();UI.prog=null;render();}
function vProgTab(){
  if(UI.prog||!DATA.workouts.length)return vProgress();
  if(!UI.ps)UI.ps=SET.ps||'prog';const h=UI.ps==='hist';
  return'<div class="seg"><button class="'+(h?'':'on')+'" onclick="psSet(\'prog\')">'+ic('chart-bar')+' '+t('tProgress')+'</button><button class="'+(h?'on':'')+'" onclick="psSet(\'hist\')">'+ic('calendar')+' '+t('tHistory')+'</button></div>'+(h?vHistory():vProgress());
}

/* calendar: tap the week / month / total card to see which days you trained and open them / calendario: toca la tarjeta semana / mes / total para ver qué días entrenaste y abrirlos */
let CAL={y:0,m:0,sel:null};
function calOpen(){const d=new Date();CAL={y:d.getFullYear(),m:d.getMonth(),sel:null};sheet('<div class="form cal"><div class="pick-h"><h3>'+t('calT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><div id="calb">'+calHtml()+'</div></div>');}
function calMove(d){let m=CAL.m+d,y=CAL.y;if(m<0){m=11;y--;}else if(m>11){m=0;y++;}const n=new Date();if(y>n.getFullYear()||(y===n.getFullYear()&&m>n.getMonth()))return;CAL.y=y;CAL.m=m;CAL.sel=null;calDraw();}
function calSel(d){CAL.sel=CAL.sel===d?null:d;calDraw();}
function calDraw(){const e=$('calb');if(e)e.innerHTML=calHtml();}
function calHtml(){
  const y=CAL.y,m=CAL.m,n=new Date(),by={};
  DATA.workouts.forEach(w=>{const d=new Date(w.t);if(d.getFullYear()===y&&d.getMonth()===m)(by[d.getDate()]=by[d.getDate()]||[]).push(w);});
  const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),isNow=y===n.getFullYear()&&m===n.getMonth(),nDays=Object.keys(by).length,nWk=Object.keys(by).reduce((a,k)=>a+by[k].length,0);
  let h='<div class="cal-h"><button class="ico" onclick="calMove(-1)" aria-label="'+esc(t('calPrev'))+'">‹</button><b>'+esc(dFmt(new Date(y,m,1).getTime(),{month:'long',year:'numeric'}))+'</b><button class="ico" onclick="calMove(1)"'+(isNow?' disabled':'')+' aria-label="'+esc(t('calNext'))+'">›</button></div><div class="cal-g cal-w">';
  for(let i=0;i<7;i++)h+='<span>'+esc(new Date(2024,0,1+i).toLocaleDateString(loc(),{weekday:'narrow'}))+'</span>';
  h+='</div><div class="cal-g">';
  for(let i=0;i<first;i++)h+='<i></i>';
  for(let d=1;d<=days;d++){
    const L=by[d],fut=isNow&&d>n.getDate();
    h+='<button class="cal-d'+(L?' on':'')+(isNow&&d===n.getDate()?' td':'')+(CAL.sel===d?' sel':'')+'"'+(L?' onclick="calSel('+d+')" aria-label="'+esc(dFmt(new Date(y,m,d).getTime(),{weekday:'long',month:'long',day:'numeric'})+' · '+t('calN',L.length))+'"':' disabled')+(fut?' style="opacity:.35"':'')+'><span>'+d+'</span>'+(L?'<u>'+(L.length>1?'●'.repeat(Math.min(3,L.length)):'')+'</u>':'')+'</button>';
  }
  h+='</div><p class="muted sm cal-s">'+(nWk?t('calSum',nWk,nDays):t('calEmpty'))+'</p>';
  if(CAL.sel&&by[CAL.sel])h+='<div class="lgrp">'+by[CAL.sel].map(wkCard).join('')+'</div>';
  return h;
}
