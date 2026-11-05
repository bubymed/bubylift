/* Ranks, consistency level and muscle balance (v1.1.49), all from your own logs, offline.
   Rangos, nivel de constancia y equilibrio muscular (v1.1.49), todo con tus propios registros, sin conexión. */
const RK_T=[0,4,8,12,17,22,28,34,40,47,54,61,68,75,82,90]; // points where each of the 16 ranks starts / puntos donde empieza cada uno de los 16 rangos
let RKO=null;
function rkIdx(p){let r=0;RK_T.forEach((v,i)=>{if(p>=v)r=i;});return r;}
function rkName(i){return t('rk_'+i);}
function rkOpen(k){RKO=RKO===k?null:k;render();}
/* points → strength ratio (inverse of strPts) / puntos → relación de fuerza (inversa de strPts) */
function strInv(p,th){
  if(p<=0)return 0;
  for(let i=0;i<th.length;i++){const lo=i?th[i-1]:0,pl=i*20,ph=(i+1)*20;if(p<=ph)return lo+(p-pl)/(ph-pl)*(th[i]-lo);}
  return th[th.length-1];
}
/* the 1RM a lift needs for the next rank / el 1RM que pide un levantamiento para el siguiente rango */
function rkTarget(l,d){
  const L=STR_L.find(q=>q[0]===l.k),pc=l.pc!=null?l.pc:l.p;if(!L||pc==null)return null;
  const ix=rkIdx(pc);if(ix>=RK_T.length-1)return null;
  return{e:strInv(RK_T[ix+1],strTh(L,d.sex))*d.bw/strFac(d.bw,d.sex),next:ix+1,from:l.pc!=null?l.ec:l.e};
}
function rkGoal(k){
  const d=strData(),l=d.lifts.find(x=>x.k===k),tg=l&&rkTarget(l,d),L=STR_L.find(q=>q[0]===k);if(!tg||!L)return;
  const eid=L[1][0][0],tv=Math.round(tg.e*10)/10;
  if(goalList().some(g=>!g.done&&g.k==='lift'&&g.eid===eid&&g.tg===tv)){toast(t('rkGoalDup'));return;}
  goalList().push({id:uid(),k:'lift',eid:eid,t:Date.now(),tg:tv});saveData();toast(t('rkGoalOk'));render();
}
function rkLockMsg(n){const l=Math.max(1,3-n);return l===1?t('rkLock1'):t('rkLock',l);}
function rkAsk(){return'<p class="rk-ask"><b>'+t('rkAskT')+'</b><br>'+t('rkAskP')+'</p><button class="btn pri sm" onclick="go(\'body\')">'+t('rkAskGo')+'</button>';}
/* always-visible rank on the workout home / rango siempre visible en el inicio */
function rkTeaser(){
  const d=strData();let b;
  if(!d.bw)b=rkAsk();
  else if(d.n<3||d.score==null)b='<p class="rk-ask">'+rkLockMsg(d.n)+'</p>';
  else{const s=d.cur!=null?d.cur:d.score,ix=rkIdx(s),top=ix>=RK_T.length-1,lo=RK_T[ix],hi=top?100:RK_T[ix+1],pct=top?100:Math.round((s-lo)/(hi-lo)*100);
    return'<button class="card rk-tz rk-tzh" style="--rc:var(--rk'+ix+')" onclick="rkGo()"><div class="lbl">'+t('rkT')+'</div><div class="rk-hero"><span class="rkn rkn'+ix+'">'+esc(rkName(ix))+'</span><b>'+s+' <small>'+t('rkPts')+'</small></b></div><div class="rk-bar"><u style="width:'+pct+'%"></u></div><p class="muted sm rk-nx">'+(top?t('rkTop'):t(hi-s===1?'rkNext1':'rkNext',hi-s,rkName(ix+1)))+'</p></button>';}
  return'<div class="card rk-tz"><div class="lbl">'+t('rkT')+'</div>'+b+'</div>';
}
/* the whole ladder: what each rank asks for, which ones you passed / la escalera completa: qué pide cada rango y cuáles ya superaste */
function rkGo(){UI.pt='rank';go('progress');rkLadder();}
function rkLadder(){
  const d=strData(),has=!!(d.bw&&d.n>=3&&d.score!=null),s=has?(d.cur!=null?d.cur:d.score):0,cur=has?rkIdx(s):-1;
  let h='<div class="form rkl"><div class="pick-h"><h3>'+t('rkLT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('rkLP')+'</p>'+(has?'<p class="rkl-you"><b>'+s+'</b> '+t('rkPts')+'</p>':'<p class="muted sm">'+t('rkLNo')+'</p>')+'<div class="rkl-list">';
  for(let i=RK_T.length-1;i>=0;i--){
    const st=i<cur?'done':(i===cur?'now':'todo'),hi=i<RK_T.length-1?RK_T[i+1]-1:100;
    h+='<div class="rkl-r '+st+'"><span class="rkl-n"><span class="rkn rkn'+i+'">'+esc(rkName(i))+'</span><small>'+RK_T[i]+(RK_T[i]===hi?'':'–'+hi)+' '+t('rkPts')+'</small></span><span class="rkl-s">'+(st==='done'?'✓ '+t('rkPassed'):(st==='now'?t('rkHere'):(has?t('rkToGo',RK_T[i]-s):'')))+'</span></div>';
  }
  sheet(h+'</div><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div>');
  try{const L=document.querySelector('#sheet .rkl-list'),n=L&&L.querySelector('.rkl-r.now');if(n)L.scrollTop=Math.max(0,n.offsetTop-L.offsetTop-(L.clientHeight-n.offsetHeight)/2);}catch(e){}
}
function strCard(){
  const d=strData(),lock=d.n<3||d.score==null;
  let h='<div class="sec"><h2>'+t('rkT')+'</h2></div><div class="card strc rkc">';
  if(!d.bw)return h+rkAsk()+'</div>';
  if(lock)return h+'<p class="rk-ask">'+rkLockMsg(d.n)+'</p></div>';
  const shown=d.cur!=null?d.cur:d.score,ix=rkIdx(shown),pk=rkIdx(d.score),top=ix>=RK_T.length-1,lo=RK_T[ix],hi=top?100:RK_T[ix+1],pct=top?100:Math.round((shown-lo)/(hi-lo)*100);
  h+='<div class="str-top rk-hero" role="button" tabindex="0" onclick="rkLadder()"><span class="rkn rkn'+ix+'">'+esc(rkName(ix))+'</span><b>'+shown+' <small>'+t('rkPts')+'</small></b></div>';
  if(d.cur==null)h+='<p class="rk-back">'+t('rkAway',rkName(pk))+'</p>';
  else if(pk>ix)h+='<p class="rk-back">'+t('rkBack',rkName(pk))+'</p>';
  h+='<div class="rk-bar"><u style="width:'+pct+'%"></u></div><p class="muted sm rk-nx">'+(top?t('rkTop'):t(hi-shown===1?'rkNext1':'rkNext',hi-shown,rkName(ix+1)))+'</p>';
  {const ms=d.lifts.filter(l=>l.p==null);if(ms.length)h+='<p class="muted sm rk-miss">'+t('rkMiss',ms.map(l=>t('sl_'+l.k)).join(', '))+'</p>';}
  h+=(d.pts.length>1?lineSvg(d.pts,function(v){return String(Math.round(v));}):'');
  h+='<div class="rk-l">'+d.lifts.map(l=>{
    const pc=l.pc!=null?l.pc:l.p,tg=rkTarget(l,d),op=RKO===l.k;
    let r='<button class="rk-r'+(op?' open':'')+'" aria-expanded="'+op+'" onclick="rkOpen(\''+l.k+'\')"><span class="rk-n">'+t('sl_'+l.k)+'</span><i><u style="width:'+(l.p||0)+'%"></u></i><span class="rk-c">'+(pc==null?'—':esc(rkName(rkIdx(pc))))+'</span></button>';
    if(op)r+='<div class="rk-d">'+(pc==null?'<p class="muted sm">'+t('rkNoLift')+'</p>':'<p>'+t('rkBest',wShow(l.ec||l.e)+' '+wUnit())+'</p>'+
      (tg?'<p>'+t('rkNeed',esc(rkName(tg.next)),'<b>'+wShow(tg.e)+' '+wUnit()+'</b>',wShow(Math.max(0,tg.e-(tg.from||0)))+' '+wUnit())+'</p><button class="btn sm" onclick="rkGoal(\''+l.k+'\')">'+ic('target')+' '+t('rkSetGoal')+'</button>':'<p>'+t('rkTop')+'</p>'))+'</div>';
    return r;}).join('')+'</div>';
  h+='<details class="dtl pv-dt"><summary><b>'+t('rkInfoT')+'</b></summary><p class="muted sm">'+t('rkInfo')+'</p></details></div>';
  return h;
}
/* a new overall rank: celebrate once (the first time just remember where you are) / un rango general nuevo: se celebra una vez (la primera vez solo se recuerda dónde estás) */
function rkCheck(){
  try{
    const d=strData();if(!d.bw||d.n<3||d.score==null)return;
    const ix=rkIdx(d.score),mx=SET.rkMax;
    if(mx==null||SET.rkV!==2){SET.rkMax=ix;SET.rkV=2;saveSet();return;} // v2: the overall score counts all five lifts / v2: el puntaje general cuenta los cinco levantamientos
    if(ix>mx){SET.rkMax=ix;saveSet();setTimeout(()=>rkUp(ix),1400);}
  }catch(e){}
}
function rkUp(ix){
  sheet('<div class="form rkup"><div class="rk-big">'+ic('trophy')+'<h2>'+t('rkUpT')+'</h2><b class="rkn rkn'+ix+'">'+esc(rkName(ix))+'</b><p class="muted">'+t('rkUpP',esc(rkName(ix)))+'</p></div><div class="row"><button class="btn pri" onclick="sheetClose();go(\'progress\')">'+t('rkUpGo')+'</button><button class="btn" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
/* consistency level: XP from sessions, sets and records; it never goes down / nivel de constancia: XP por sesiones, series y récords; nunca baja */
function xpData(){
  let xp=0;
  DATA.workouts.forEach(wk=>{let n=0;wk.ex.forEach(x=>{n+=x.sets.filter(s=>s.done!==false&&(s.r>0||s.t>0)).length;});xp+=30+2*n+25*wkPRs(wk);});
  const L=Math.floor(Math.sqrt(xp/50))+1;
  return{xp:xp,lv:L,lo:50*(L-1)*(L-1),hi:50*L*L};
}
function xpCard(){
  if(!DATA.workouts.length)return'';
  const d=xpData(),p=Math.round((d.xp-d.lo)/(d.hi-d.lo)*100);
  return'<div class="card xpc"><div class="lbl">'+t('xpT')+'</div><div class="str-top"><b>'+d.lv+'</b><span>'+t('xpLvl')+'</span></div><div class="rk-bar"><u style="width:'+p+'%"></u></div><p class="muted sm rk-nx">'+t('xpTo',d.hi-d.xp,d.lv+1)+'</p>'+
    '<details class="dtl pv-dt"><summary><b>'+t('xpInfoT')+'</b></summary><p class="muted sm">'+t('xpInfo')+'</p></details></div>';
}
/* muscle balance: weekly effective sets per part over the last 4 weeks, against a modest target / equilibrio muscular: series efectivas por semana de cada parte en las últimas 4 semanas, contra una meta modesta */
const MUS_TGT={chu:6,chm:8,lat:8,ubk:8,trp:4,lbk:4,sdf:4,sdl:8,sdr:6,bic:8,frm:4,trl:6,trm:6,qd:10,ham:8,clf:6,add:4,gmx:8,gmd:4,abs:8,obl:4};
function balData(now){
  now=now||Date.now();
  const ws=DATA.workouts.filter(w=>{const e=w.end||w.t;return e>=now-28*864e5&&e<=now;}),eff={};
  const first=DATA.workouts.reduce((a,w)=>Math.min(a,w.t),now),days=Math.max(7,Math.min(28,Math.ceil((now-first)/864e5)));
  ws.forEach(wk=>wk.ex.forEach(x=>{const w=muW(x.eid,x.vr);if(!w)return;const n=x.sets.filter(s=>s.done!==false&&(s.r>0||s.t>0)).length;if(!n)return;w.forEach(m=>{eff[m[0]]=(eff[m[0]]||0)+n*m[1];});}));
  const subs={},g={};
  Object.keys(MUS_TGT).forEach(k=>{const wk=(eff[k]||0)/(days/7);subs[k]={wk:wk,pct:Math.min(100,Math.round(wk/MUS_TGT[k]*100))};});
  REC_G.forEach(k=>{const a=MUS_SUB[k].map(q=>subs[q].pct);g[k]=Math.round(a.reduce((x,y)=>x+y,0)/a.length);});
  return{n:ws.length,subs:subs,g:g};
}
function radarSvg(vals,labels){
  const n=vals.length,cx=160,cy=135,R=84,pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*R*r,cy+Math.sin(a)*R*r];},poly=r=>vals.map((_,i)=>pt(i,r).map(v=>v.toFixed(1)).join(',')).join(' ');
  let s='<svg class="radar" viewBox="0 0 320 270" role="img" aria-label="'+esc(t('balT'))+'">';
  [.5,1].forEach(r=>{s+='<polygon class="rd-ring" points="'+poly(r)+'"/>';});
  vals.forEach((_,i)=>{const p=pt(i,1);s+='<line class="rd-ax" x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'"/>';});
  s+='<polygon class="rd-v" points="'+vals.map((v,i)=>pt(i,Math.max(.04,v/100)).map(c=>c.toFixed(1)).join(',')).join(' ')+'"/>';
  vals.forEach((v,i)=>{const p=pt(i,Math.max(.04,v/100)),q=pt(i,1.2),an=q[0]<cx-8?'end':(q[0]>cx+8?'start':'middle');
    s+='<circle class="rd-d" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.5"/><text class="rd-t" x="'+q[0].toFixed(1)+'" y="'+(q[1]+4).toFixed(1)+'" text-anchor="'+an+'">'+esc(labels[i])+'</text>';});
  return s+'</svg>';
}
function balCard(){
  const d=balData(),h0='<div class="card balc"><div class="lbl">'+t('balT')+'</div>';
  if(d.n<3)return h0+'<p class="muted sm">'+t('balLock')+'</p></div>';
  const weak=Object.keys(d.subs).filter(k=>d.subs[k].pct<100).sort((a,b)=>d.subs[a].pct-d.subs[b].pct).slice(0,3);
  return h0+radarSvg(REC_G.map(g=>d.g[g]),REC_G.map(g=>t('g_'+g)))+
    '<div class="bal-w"><b>'+t('balWeak')+'</b>'+(weak.length?weak.map(k=>'<div class="bal-r"><span><b>'+t('ms_'+k)+'</b><small>'+t('balSets',(Math.round(d.subs[k].wk*10)/10),MUS_TGT[k])+'</small></span><button class="btn sm" onclick="recWorkout(null,\''+k+'\')">'+t('recSubTrain')+'</button></div>').join(''):'<p class="muted sm">'+t('balGood')+'</p>')+'</div>'+
    '<details class="dtl pv-dt"><summary><b>'+t('balInfoT')+'</b></summary><p class="muted sm">'+t('balInfo')+'</p></details></div>';
}

/* bodyweight skills: pull-ups, push-ups and dips ranked by your best set (added weight counts), outside the strength score / habilidades con peso corporal: dominadas, flexiones y fondos por tu mejor serie (el peso extra cuenta), fuera de la puntuación de fuerza */
const BW_L=[['pullup',['pullup','chinup'],[3,8,15,22,30],[1,4,9,14,20]],['pushup',['pushup'],[10,25,40,60,80],[5,15,28,42,60]],['dip',['dip'],[3,10,18,26,35],[1,5,10,16,22]]];
function bwTh(L,sex){return sex==='f'?L[3]:L[2];}
function bwData(now){
  now=now||Date.now();const cut=now-180*864e5,sex=strSex(),bw=(DATA.body.find(x=>x.w)||{}).w||0,rec={},best={};
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{const L=BW_L.find(q=>q[1].indexOf(x.eid)>=0);if(!L)return;x.sets.forEach(s=>{
    if(s.done===false||!(s.r>0))return;const e=s.r*(1+(bw&&s.w>0?s.w/bw:0));
    if(e>(best[L[0]]||0))best[L[0]]=e;if(wk.t>=cut&&e>(rec[L[0]]||0))rec[L[0]]=e;});}));
  return BW_L.map(L=>{const th=bwTh(L,sex),pk=best[L[0]]?strPts(best[L[0]],th):null,cu=rec[L[0]]?strPts(rec[L[0]],th):null;
    const ix=cu!=null?rkIdx(cu):null,nx=ix!=null&&ix<RK_T.length-1?Math.ceil(strInv(RK_T[ix+1],th)):null;
    return{k:L[0],best:best[L[0]]||0,rec:rec[L[0]]||0,pk:pk,cu:cu,ix:ix,pix:pk!=null?rkIdx(pk):null,next:nx,th:th};});
}
function bwCard(){
  const d=bwData(),any=d.some(x=>x.pk!=null),h0='<div class="card bwc"><div class="lbl">'+t('bwT')+'</div>';
  if(!any)return h0+'<p class="rk-ask">'+t('bwEmpty')+'</p></div>';
  return h0+d.map(x=>{
    if(x.pk==null)return'<div class="bw-r"><span class="rk-n">'+t('bw_'+x.k)+'</span><span class="muted sm">—</span></div>';
    const ix=x.ix!=null?x.ix:x.pix,back=x.ix==null?t('rkAway',rkName(x.pix)):(x.pix>x.ix?t('rkBack',rkName(x.pix)):'');
    return'<div class="bw-r"><span class="rk-n">'+t('bw_'+x.k)+'<small>'+t('bwBest',Math.round(x.best*10)/10)+'</small></span><span class="bw-c"><span class="rkn rkn'+ix+'">'+esc(rkName(ix))+'</span>'+
      (back?'<small class="rk-back">'+back+'</small>':'')+(x.next&&x.ix!=null?'<small>'+t('bwReps',x.next,rkName(ix+1))+'</small>':'')+'</span></div>';}).join('')+
    '<details class="dtl pv-dt"><summary><b>'+t('bwInfoT')+'</b></summary><p class="muted sm">'+t('bwInfo')+'</p></details></div>';
}
