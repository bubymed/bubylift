/* Ranks, consistency level and muscle balance (v1.1.49), all from your own logs, offline.
   Rangos, nivel de constancia y equilibrio muscular (v1.1.49), todo con tus propios registros, sin conexión. */
const RK_T=[0,12,25,40,55,70,85]; // points where each of the 7 ranks starts / puntos donde empieza cada uno de los 7 rangos
let RKO=null;
function rkIdx(p){let r=0;RK_T.forEach((v,i)=>{if(p>=v)r=i;});return r;}
function rkName(i){return t((SET.rkTheme==='m'?'rkM_':'rkN_')+i);}
function rkTheme(k){SET.rkTheme=k;saveSet();render();}
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
function strCard(){
  const d=strData(),lock=d.n<3||d.score==null;
  let h='<div class="sec"><h2>'+t('rkT')+'</h2></div><div class="card strc rkc">';
  if(!d.bw)return h+'<p class="muted sm">'+t('strBw')+'</p><button class="btn sm" onclick="go(\'body\')">'+t('strBwGo')+'</button></div>';
  if(lock)return h+'<p class="muted sm">'+t('strLock',Math.max(0,3-d.n))+'</p></div>';
  const shown=d.cur!=null?d.cur:d.score,ix=rkIdx(shown),pk=rkIdx(d.score),top=ix>=RK_T.length-1,lo=RK_T[ix],hi=top?100:RK_T[ix+1],pct=top?100:Math.round((shown-lo)/(hi-lo)*100);
  h+='<div class="str-top"><b>'+shown+'</b><span>'+esc(rkName(ix))+'</span></div>';
  if(d.cur==null)h+='<p class="rk-back">'+t('rkAway',rkName(pk))+'</p>';
  else if(pk>ix)h+='<p class="rk-back">'+t('rkBack',rkName(pk))+'</p>';
  h+='<div class="rk-bar"><u style="width:'+pct+'%"></u></div><p class="muted sm rk-nx">'+(top?t('rkTop'):t('rkNext',hi-shown,rkName(ix+1)))+'</p>';
  h+=(d.pts.length>1?lineSvg(d.pts,function(v){return String(Math.round(v));}):'');
  h+='<div class="rk-l">'+d.lifts.map(l=>{
    const pc=l.pc!=null?l.pc:l.p,tg=rkTarget(l,d),op=RKO===l.k;
    let r='<button class="rk-r'+(op?' open':'')+'" aria-expanded="'+op+'" onclick="rkOpen(\''+l.k+'\')"><span class="rk-n">'+t('sl_'+l.k)+'</span><i><u style="width:'+(l.p||0)+'%"></u></i><span class="rk-c">'+(pc==null?'—':esc(rkName(rkIdx(pc))))+'</span></button>';
    if(op)r+='<div class="rk-d">'+(pc==null?'<p class="muted sm">'+t('rkNoLift')+'</p>':'<p>'+t('rkBest',wShow(l.ec||l.e)+' '+wUnit())+'</p>'+
      (tg?'<p>'+t('rkNeed',esc(rkName(tg.next)),'<b>'+wShow(tg.e)+' '+wUnit()+'</b>',wShow(Math.max(0,tg.e-(tg.from||0)))+' '+wUnit())+'</p><button class="btn sm" onclick="rkGoal(\''+l.k+'\')">'+ic('target')+' '+t('rkSetGoal')+'</button>':'<p>'+t('rkTop')+'</p>'))+'</div>';
    return r;}).join('')+'</div>';
  h+='<div class="rk-th"><span class="muted sm">'+t('rkTheme')+'</span><button class="chip'+(SET.rkTheme==='m'?'':' on')+'" onclick="rkTheme(\'n\')">'+t('rkThN')+'</button><button class="chip'+(SET.rkTheme==='m'?' on':'')+'" onclick="rkTheme(\'m\')">'+t('rkThM')+'</button></div>'+
    '<details class="dtl pv-dt"><summary><b>'+t('rkInfoT')+'</b></summary><p class="muted sm">'+t('rkInfo')+'</p></details></div>';
  return h;
}
/* a new overall rank: celebrate once (the first time just remember where you are) / un rango general nuevo: se celebra una vez (la primera vez solo se recuerda dónde estás) */
function rkCheck(){
  try{
    const d=strData();if(!d.bw||d.n<3||d.score==null)return;
    const ix=rkIdx(d.score),mx=SET.rkMax;
    if(mx==null){SET.rkMax=ix;saveSet();return;}
    if(ix>mx){SET.rkMax=ix;saveSet();setTimeout(()=>rkUp(ix),1400);}
  }catch(e){}
}
function rkUp(ix){
  sheet('<div class="form rkup"><div class="rk-big">'+ic('trophy')+'<h2>'+t('rkUpT')+'</h2><b>'+esc(rkName(ix))+'</b><p class="muted">'+t('rkUpP',esc(rkName(ix)))+'</p></div><div class="row"><button class="btn pri" onclick="sheetClose();go(\'progress\')">'+t('rkUpGo')+'</button><button class="btn" onclick="sheetClose()">'+t('close')+'</button></div></div>');
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
  ws.forEach(wk=>wk.ex.forEach(x=>{const w=muW(x.eid);if(!w)return;const n=x.sets.filter(s=>s.done!==false&&(s.r>0||s.t>0)).length;if(!n)return;w.forEach(m=>{eff[m[0]]=(eff[m[0]]||0)+n*m[1];});}));
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
