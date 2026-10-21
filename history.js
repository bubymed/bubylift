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
function wkDur(wk){return(wk.end&&wk.end>wk.t)?(wk.end-wk.t)/1000:0;}
function wkPRs(wk){let n=0;wk.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr)n++;}));return n;}
function wkCard(wk){
  const d=wkDur(wk),pr=wkPRs(wk),vol=wkVol(wk);
  const fx=wk.ex.find(x=>typeof EXPHOTO!=='undefined'&&EXPHOTO.has(x.eid));
  return'<button class="card wkc wkp" onclick="openWk(\''+wk.id+'\')">'+(fx?photoTh(fx.eid):'<span class="hv-th hv-no">'+ic('barbell')+'</span>')+'<span class="wkp-t"><div class="wkc-d"><b>'+esc(dFmt(wk.t,{weekday:'short',month:'short',day:'numeric'}))+'</b>'+(pr?' <span class="pr">'+ic('trophy')+' '+pr+'</span>':'')+'</div>'+
    '<div class="wkc-n">'+esc(wk.name||'')+'</div>'+
    '<div class="muted sm">'+(d?fmtDur(d)+' · ':'')+t('nSetsT',wkSets(wk))+(vol?' · '+wShow(vol)+' '+wUnit():'')+'</div>'+
    '<div class="muted sm">'+wk.ex.slice(0,3).map(x=>esc(exName(x.eid,x.n))).join(' · ')+(wk.ex.length>3?' …':'')+'</div></span></button>';
}
function vHistory(){
  if(!DATA.workouts.length)return'<div class="card tip"><b>'+t('emptyHistT')+'</b><p>'+t('emptyHistP')+'</p></div>';
  const now=new Date(),ws=weekStart(now.getTime()),ms=new Date(now.getFullYear(),now.getMonth(),1).getTime();
  const wn=DATA.workouts.filter(w=>w.t>=ws).length,mn=DATA.workouts.filter(w=>w.t>=ms).length;
  let h='<div class="stats card"><div><b>'+wn+'</b><span>'+t('thisWeek')+'</span></div><div><b>'+mn+'</b><span>'+t('thisMonth')+'</span></div><div><b>'+DATA.workouts.length+'</b><span>'+t('total')+'</span></div></div>';
  let last='';
  DATA.workouts.forEach(wk=>{
    const lb=dFmt(wk.t,{month:'long',year:'numeric'});
    if(lb!==last){h+='<div class="sec"><h2>'+esc(lb)+'</h2></div>';last=lb;}
    h+=wkCard(wk);
  });
  return h;
}
function wkText(wk){
  let s=wk.name+' — '+dFmt(wk.t)+'\n';
  wk.ex.forEach(x=>{const m=exMode(x.eid);s+='\n'+exName(x.eid,x.n)+'\n';x.sets.forEach((st,i)=>{s+='  '+(i+1)+') '+fmtSet(m,st)+(st.pr?' 🏆':'')+'\n';});});
  if(wk.note)s+='\n'+wk.note+'\n';
  return s+'\nBubylift';
}
function openWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  const d=wkDur(wk);
  let h='<div class="wkd"><h3>'+esc(wk.name)+'</h3><p class="muted">'+esc(dFmt(wk.t,{weekday:'long',month:'long',day:'numeric',year:'numeric'}))+'</p>'+
    '<div class="stats">'+(d?'<div><b>'+fmtDur(d)+'</b><span>'+t('duration')+'</span></div>':'')+'<div><b>'+wkSets(wk)+'</b><span>'+t('sets')+'</span></div><div><b>'+wShow(wkVol(wk))+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>';
  wk.ex.forEach(x=>{
    const m=exMode(x.eid);
    h+='<div class="wkd-ex"><b>'+esc(exName(x.eid,x.n))+'</b>'+x.sets.map((s,i)=>'<div class="wkd-s"><span>'+(i+1)+'</span><span>'+esc(fmtSet(m,s))+'</span>'+(s.pr?'<i class="pr">'+ic('trophy')+'</i>':'')+'</div>').join('')+'</div>';
  });
  if(wk.note)h+='<p class="wkd-note">'+esc(wk.note)+'</p>';
  h+='<div class="menu"><button onclick="repeatWk(\''+id+'\')">↻ '+t('repeat')+'</button><button onclick="saveWkAsRoutine(\''+id+'\')">☰ '+t('saveRoutineS')+'</button><button onclick="shareWk(\''+id+'\')">⇪ '+t('share')+'</button><button class="danger" onclick="delWkAsk(\''+id+'\')">'+ic('trash')+' '+t('delete')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div>';
  sheet(h);
}
function repeatWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  if(ACT){toast(t('finishFirst'));return;}
  sheetClose();
  startWorkout({name:wk.name,ex:wk.ex.map(x=>({eid:x.eid,n:x.n,sets:x.sets.length}))});
}
function shareWk(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  const txt=wkText(wk);
  if(navigator.share){navigator.share({text:txt}).catch(()=>{});return;}
  try{navigator.clipboard.writeText(txt).then(()=>toast(t('copied')),()=>toast(t('copyFail')));}catch(e){toast(t('copyFail'));}
}
function delWkAsk(id){ask(t('delWk'),t('delete'),function(){DATA.workouts=DATA.workouts.filter(w=>w.id!==id);saveData();render();},true);}

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

function vProgress(){
  if(!DATA.workouts.length)return'<div class="card tip"><b>'+t('emptyProgT')+'</b><p>'+t('emptyProgP')+'</p></div>';
  if(UI.prog)return vExProg(UI.prog);
  const now=Date.now(),ws=weekStart(now),vals=[],labels=[];
  for(let i=7;i>=0;i--){const a=ws-i*7*864e5,b=a+7*864e5;vals.push(DATA.workouts.filter(w=>w.t>=a&&w.t<b).length);labels.push(dFmt(a,{month:'numeric',day:'numeric'}));}
  let vol=0,sets=0;DATA.workouts.forEach(w=>{vol+=wkVol(w);sets+=wkSets(w);});
  let h='<div class="stats card"><div><b>'+DATA.workouts.length+'</b><span>'+t('workouts')+'</span></div><div><b>'+sets+'</b><span>'+t('sets')+'</span></div><div><b>'+wShow(vol)+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div></div>';
  h+='<div class="card"><b>'+t('perWeek')+'</b>'+barSvg(vals,labels)+'</div>';
  h+='<div class="sec"><h2>'+t('exercises')+'</h2></div>';
  loggedEx().forEach(o=>{
    const m=exMode(o.eid),b=bestSet(o.eid);
    h+='<button class="card exp wkp" onclick="openProg(\''+o.eid+'\')">'+(typeof EXPHOTO!=='undefined'&&EXPHOTO.has(o.eid)?photoTh(o.eid):'<span class="hv-th hv-no">'+ic('barbell')+'</span>')+'<span class="wkp-t"><b>'+esc(exName(o.eid,o.n))+'</b><div class="muted sm">'+t('sessions',o.cnt)+(b?' · '+t(m==='t'?'longest':'best')+': '+esc(fmtSet(m,b)):'')+'</div></span></button>';
  });
  return h;
}
function vExProg(eid){
  const m=exMode(eid),ss=exSessions(eid),mets=METRICS[m],cur=mets.find(a=>a[0]===UI.pm)||mets[0],k=cur[0],f=metricFmt(k);
  const pts=ss.map(o=>({t:o.t,y:o[k]})).filter(p=>p.y>0);
  let h='<button class="btn sm" onclick="closeProg()">← '+t('back')+'</button><div class="sec"><h2>'+esc(exName(eid,(loggedEx().find(o=>o.eid===eid)||{}).n))+'</h2></div>';
  h+='<div class="chips">'+mets.map(a=>'<button class="chip'+(a[0]===k?' on':'')+'" onclick="setPm(\''+a[0]+'\')">'+t(a[1])+'</button>').join('')+'</div>';
  h+='<div class="card">'+(pts.length?lineSvg(pts,f):'<p class="muted">'+t('noData')+'</p>')+'</div>';
  const b=bestSet(eid);let tv=0,tt=0,td=0,tr=0,e1=0;
  ss.forEach(o=>{tv+=o.vol;tt+=o.time;td+=o.dist;tr+=o.totr;e1=Math.max(e1,o.e1);});
  let cards='';
  if(m==='wr')cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('bestSet')+'</span></div><div><b>'+wShow(e1)+'</b><span>'+t('mEst1rm')+' ('+wUnit()+')</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div><div><b>'+wShow(tv)+'</b><span>'+t('volume')+' ('+wUnit()+')</span></div>';
  else if(m==='bw')cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('bestSet')+'</span></div><div><b>'+tr+'</b><span>'+t('mTotReps')+'</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div>';
  else cards='<div><b>'+esc(b?fmtSet(m,b):'—')+'</b><span>'+t('longest')+'</span></div><div><b>'+fmtNum(tt,0)+'</b><span>'+t('mTime')+'</span></div><div><b>'+dShow(td)+' '+dUnit()+'</b><span>'+t('mDist')+'</span></div><div><b>'+ss.length+'</b><span>'+t('sessionsL')+'</span></div>';
  h+='<div class="stats card grid2">'+cards+'</div>';
  h+='<div class="sec"><h2>'+t('recentSessions')+'</h2></div>';
  ss.slice(-6).reverse().forEach(o=>{h+='<div class="card sm-card"><b>'+esc(dFmt(o.t))+'</b><div class="muted sm">'+o.sets.map(s=>esc(fmtSet(m,s))).join(' · ')+'</div></div>';});
  return h;
}
