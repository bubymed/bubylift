/* Concrete goals with a progress bar (v65): more reps, more weight, body weight, or training consistency.
   Metas concretas con barra de progreso (v65): más repeticiones, más peso, peso corporal o constancia. */
const G_KINDS=['reps','lift','bw','ses'];
let GN={k:'',eid:'',tg:''};
function goalList(){return Array.isArray(DATA.goals)?DATA.goals:(DATA.goals=[]);}
function goalCur(g){
  if(g.k==='reps'||g.k==='lift'){
    let b=0;
    DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(x.eid===g.eid)x.sets.forEach(s=>{
      if(g.k==='reps')b=Math.max(b,s.r||0);else if((s.r||0)>=1)b=Math.max(b,s.w||0);});}));
    return b;
  }
  if(g.k==='bw'){const l=DATA.body.find(b=>b.w);return l?l.w:null;}
  const a=Date.now()-30*864e5;return DATA.workouts.filter(w=>w.t>=a).length;
}
function goalPct(g){
  const c=goalCur(g);if(c==null)return 0;
  if(g.k==='bw'){const d=g.st-g.tg;if(!d)return 1;return Math.max(0,Math.min(1,(g.st-c)/d));}
  return Math.max(0,Math.min(1,c/g.tg));
}
function goalFmt(g,v){return g.k==='lift'||g.k==='bw'?wShow(v)+' '+wUnit():fmtNum(v,0);}
function goalName(g){
  if(g.k==='reps')return t('gReps',g.tg,exName(g.eid));
  if(g.k==='lift')return t('gLift',goalFmt(g,g.tg),exName(g.eid));
  if(g.k==='bw')return t('gBw',goalFmt(g,g.tg));
  return t('gSes',g.tg);
}
function goalLeft(g){
  const c=goalCur(g);
  if(c==null)return t('gNoBw');
  if(goalPct(g)>=1)return t('gDone');
  const left=g.k==='bw'?Math.abs(c-g.tg):g.tg-c;
  return t(g.k==='reps'?'gLeftR':(g.k==='ses'?'gLeftS':'gLeftW'),g.k==='lift'||g.k==='bw'?goalFmt(g,left):fmtNum(left,0));
}
/* mark the goals that were just reached / marca las metas recién logradas */
function goalsCheck(){
  const out=[];goalList().forEach(g=>{if(!g.done&&goalPct(g)>=1&&(g.k!=='bw'||goalCur(g)!=null)){g.done=Date.now();out.push(g);}});
  if(out.length)setTimeout(()=>toast(t('gGot',goalName(out[0]))),out.length?1200:0);
  return out;
}
function goalsCard(){
  const gs=goalList(),act=gs.filter(g=>!g.done),dn=gs.filter(g=>g.done);
  let h='<div class="card goals"><div class="gl-h"><b>'+ic('target')+' '+t('gT')+'</b><button class="btn sm" onclick="goalNew()">＋ '+t('gNew')+'</button></div>';
  if(!gs.length)h+='<p class="muted sm">'+t('gEmpty')+'</p>';
  act.forEach(g=>{const p=Math.round(goalPct(g)*100);
    h+='<div class="gl"><div class="gl-t"><span><b>'+esc(goalName(g))+'</b><small>'+esc(goalLeft(g))+'</small></span><button class="ico" aria-label="'+esc(t('remove'))+'" onclick="goalDel(\''+g.id+'\')">✕</button></div><div class="gl-r"><div class="gl-bar"><i style="width:'+p+'%"></i></div><span class="gl-p">'+p+'%</span></div></div>';});
  dn.forEach(g=>{h+='<div class="gl done"><div class="gl-t"><span><b>✅ '+esc(goalName(g))+'</b><small>'+esc(dFmt(g.done,{month:'short',day:'numeric'}))+'</small></span><button class="ico" aria-label="'+esc(t('remove'))+'" onclick="goalDel(\''+g.id+'\')">✕</button></div></div>';});
  return h+'</div>';
}
function goalDel(id){DATA.goals=goalList().filter(g=>g.id!==id);saveData();render();}
function goalNew(){
  GN={k:'',eid:'',tg:''};
  sheet('<div class="form"><div class="pick-h"><h3>'+t('gNew')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('gP')+'</p>'+
    G_KINDS.map(k=>'<button class="exrow" onclick="goalKind(\''+k+'\')"><b>'+t('gk_'+k)+'</b><small>'+t('gkd_'+k)+'</small></button>').join('')+'</div>');
}
function goalKind(k){
  GN.k=k;
  if(k==='reps'||k==='lift'){pickEx(function(eid){GN.eid=eid;goalTarget();});return;}
  goalTarget();
}
function goalTarget(){
  const k=GN.k,chips=k==='reps'?[5,8,10,12,15,20]:(k==='ses'?[8,12,16,20]:[]);
  const cur=k==='bw'?(DATA.body.find(b=>b.w)||{}).w:null;
  sheet('<div class="form"><div class="pick-h"><h3>'+t('gk_'+k)+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    (GN.eid?'<p><b>'+esc(exName(GN.eid))+'</b></p>':'')+
    (k==='bw'&&cur==null?'<p class="muted sm">'+t('gNoBw')+'</p>':'')+
    (k==='bw'&&cur!=null?'<p class="muted sm">'+t('gNowBw',wShow(cur)+' '+wUnit())+'</p>':'')+
    (k==='lift'?'<p class="muted sm">'+t('gNowLift',goalFmt({k:'lift'},goalCur({k:'lift',eid:GN.eid})))+'</p>':'')+
    (k==='reps'?'<p class="muted sm">'+t('gNowReps',goalCur({k:'reps',eid:GN.eid}))+'</p>':'')+
    (chips.length?'<div class="chips wrap">'+chips.map(c=>'<button class="chip" onclick="document.getElementById(\'gtg\').value=\''+c+'\'">'+c+'</button>').join('')+'</div>':'')+
    '<label>'+t('gTarget')+(k==='lift'||k==='bw'?' ('+wUnit()+')':'')+'<input id="gtg" class="in wide" type="text" inputmode="decimal" autocomplete="off"></label>'+
    '<div class="row"><button class="btn pri" onclick="goalSave()">'+t('save')+'</button><button class="btn" onclick="sheetClose()">'+t('cancel')+'</button></div></div>');
}
function goalSave(){
  const raw=numParse($('gtg').value);if(raw==null||raw<=0){toast(t('gBad'));return;}
  const k=GN.k,g={id:uid(),k:k,t:Date.now(),tg:k==='lift'||k==='bw'?wParse($('gtg').value):Math.round(raw)};
  if(GN.eid)g.eid=GN.eid;
  if(k==='bw'){const l=DATA.body.find(b=>b.w);if(l){g.st=l.w;if(Math.abs(l.w-g.tg)<0.05){toast(t('gBad'));return;}}else g.st=g.tg;}
  goalList().push(g);saveData();sheetClose();render();
}
