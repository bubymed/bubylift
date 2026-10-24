/* Army AFT panel (v71): your best result in each event, your own target, and the weakest event to work on.
   It does not use official score tables: it compares you with the targets you set.
   Panel AFT del Ejército (v71): tu mejor resultado en cada evento, tu meta y el evento más débil. No usa las tablas oficiales de puntos. */
const AFT_EV=[
 {k:'mdl',eid:'hexdl',ic:'barbell',hi:1,fix:['hexdl','rdl','bbrow']},
 {k:'hrp',eid:'hrpushup',ic:'yoga',hi:1,fix:['hrpushup','pushup','dbbench']},
 {k:'sdc',eid:'sdcdrill',ic:'stopwatch',hi:0,fix:['sdcdrill','sprint','farmer']},
 {k:'plk',eid:'plank',ic:'yoga',hi:1,fix:['plank','hollow','sideplank']},
 {k:'run',eid:'run',ic:'stopwatch',hi:0,fix:['run','sprint','lunge']}
];
function aftTg(){DATA.aft=DATA.aft||{};return DATA.aft;}
/* best result per event; run is the best estimated 2-mile time from runs of 3 km or more / mejor resultado por evento; la carrera se estima a 2 millas */
function aftBest(e){
  let b=null;
  DATA.workouts.forEach(wk=>wk.ex.forEach(x=>{if(x.eid!==e.eid)return;x.sets.forEach(s=>{
    let v=null;
    if(e.k==='mdl'){if((s.r||0)>=3&&s.w)v=s.w;}
    else if(e.k==='hrp'){if(s.r)v=s.r;}
    else if(e.k==='run'){if(s.t&&s.d&&s.d>=3)v=s.t*3.218/s.d;}
    else if(s.t)v=s.t;
    if(v!=null&&(b==null||(e.hi?v>b:v<b)))b=v;});}));
  return b;
}
function aftFmt(e,v){
  if(v==null)return'—';
  if(e.k==='mdl')return wShow(v)+' '+wUnit();
  if(e.k==='hrp')return fmtNum(v,0);
  const sec=Math.round(v*60);return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
}
function aftPct(e,v,tg){if(v==null||!tg)return null;return Math.max(0,Math.min(1,e.hi?v/tg:tg/v));}
function aftWeak(){
  let w=null;
  AFT_EV.forEach(e=>{const tg=aftTg()[e.k],p=aftPct(e,aftBest(e),tg);if(p!=null&&(w==null||p<w.p))w={e:e,p:p};});
  return w;
}
function aftOpen(){
  const w=aftWeak();
  sheet('<div class="form"><div class="pick-h"><h3>'+t('afT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('afP')+'</p>'+
    AFT_EV.map(e=>{
      const b=aftBest(e),tg=aftTg()[e.k],p=aftPct(e,b,tg);
      return'<div class="gl"><div class="gl-t"><span><b>'+ic(e.ic)+' '+t('af_'+e.k)+'</b><small>'+t('afBest',aftFmt(e,b))+' · '+(tg?t('afTg',aftFmt(e,tg)):t('afNoTg'))+'</small></span><button class="btn sm" onclick="aftSet(\''+e.k+'\')">'+t('afSet')+'</button></div>'+
        (p!=null?'<div class="gl-r"><div class="gl-bar"><i style="width:'+Math.round(p*100)+'%"></i></div><span class="gl-p">'+Math.round(p*100)+'%</span></div>':'')+'</div>';
    }).join('')+
    (w&&w.p<1?'<div class="card tip"><b>'+t('afWeak',t('af_'+w.e.k))+'</b><p class="sm">'+t('afWeakP')+'</p><div class="row"><button class="btn pri sm" onclick="aftTrain(\''+w.e.k+'\')">'+t('afTrain')+'</button></div></div>':'')+
    '<div class="row"><button class="btn" onclick="simStart(\'aft\')">'+t('sim_aft')+'</button><button class="btn" onclick="sheetClose()">'+t('done')+'</button></div><p class="muted sm">'+t('afN')+'</p></div>');
}
function aftSet(k){
  const e=AFT_EV.find(x=>x.k===k),cur=aftTg()[k];
  const unit=k==='mdl'?' ('+wUnit()+')':(k==='hrp'?'':(k==='plk'||k==='sdc'||k==='run'?' (m:ss)':''));
  sheet('<div class="form"><div class="pick-h"><h3>'+t('af_'+k)+'</h3><button class="ico" onclick="aftOpen()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<label>'+t('afTgL')+unit+'<input id="aftv" class="in wide" type="text" inputmode="'+(k==='mdl'||k==='hrp'?'decimal':'text')+'" autocomplete="off" value="'+esc(cur?(k==='mdl'?wShow(cur):(k==='hrp'?String(cur):aftFmt(e,cur))):'')+'" placeholder="'+(k==='mdl'||k==='hrp'?'':'2:30')+'"></label>'+
    '<div class="row"><button class="btn pri" onclick="aftSave(\''+k+'\')">'+t('save')+'</button><button class="btn" onclick="aftOpen()">'+t('cancel')+'</button></div></div>');
}
function aftSave(k){
  const raw=($('aftv').value||'').trim();let v=null;
  if(!raw){delete aftTg()[k];saveData();aftOpen();return;}
  if(k==='mdl')v=wParse(raw);else if(k==='hrp')v=numParse(raw);
  else{const m=raw.match(/^(\d+):(\d{1,2})$/);if(m)v=(+m[1]*60+ +m[2])/60;else{const n=numParse(raw);if(n!=null)v=n;}}
  if(v==null||v<=0){toast(t('gBad'));return;}
  aftTg()[k]=v;saveData();aftOpen();
}
function aftTrain(k){
  const e=AFT_EV.find(x=>x.k===k);sheetClose();
  startWorkout({name:t('af_'+k),ex:e.fix.filter(id=>exById(id)).map(id=>({eid:id,sets:3}))});
}
