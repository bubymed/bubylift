/* Recovery plans screen (v0.99.8): lives in the Stretch tab. Data: data/rehab.js.
   Pantalla de planes de recuperación (v0.99.8): vive en la pestaña Estirar. Datos: data/rehab.js. */
const RH={plan:null,zone:'all'};
const RH_ZONES=['all','foot','knee','hip','spine','arm'];
function rhZone(z){RH.zone=z;render();}
const L2=p=>p[LANG==='es'?1:0];
function rhPlan(id){return REHAB.find(p=>p.id===id);}
function rhStore(){if(!SET.rh||typeof SET.rh!=='object')SET.rh={};return SET.rh;}
function rhSt(id){return rhStore()[id]||null;}
function rhDay(){try{return new Date().toLocaleDateString('en-CA');}catch(e){return new Date().toISOString().slice(0,10);}}
function rhOpen(id){RH.plan=id;render();window.scrollTo(0,0);}

function rhDose(x){
  const t1=exMode(x.id)==='t'||x.secs;
  let s=t1?t('rhSecs',x.sets,x.secs||30):t('rhReps',x.sets,x.r||10);
  if(x.hold)s+=' · '+t('rhHold',x.hold);
  if(x.side)s+=' · '+t('rhEach');
  return s;
}
function rhRows(ph){
  return ph.ex.map(x=>'<div class="plex">'+exThumb(x.id)+'<span><b>'+esc(exName(x.id))+'</b><small>'+esc(rhDose(x))+(x.note?' — '+esc(L2(x.note)):'')+'</small></span><button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="howOpen(\''+x.id+'\')">'+ic('target')+'</button></div>').join('');
}
function rhRun(){
  const R=REHAB_RUN;
  let h='<div class="card optb"><b>'+t('rhRunT')+'</b><p class="sm">'+esc(L2(R.start))+' '+esc(L2(R.how))+'</p><div class="rh-tbl">';
  h+='<div class="rh-r hd"><span></span><span>'+t('rhDayN',1)+'</span><span>'+t('rhDayN',2)+'</span><span>'+t('rhDayN',3)+'</span></div>';
  R.weeks.forEach((w,i)=>{
    h+='<div class="rh-r"><span>'+t('rhWeekN',i+1)+'</span>'+w.map(d=>'<span>'+(d[0]?t('rhWR',d[0],d[1]):t('rhRunOnly',d[1]))+'</span>').join('')+'</div>';
  });
  h+='</div><p class="sm">'+esc(L2(R.ok))+'</p><b class="sm">'+t('rhRulesT')+'</b><ul class="rh-ul">'+R.rules.map(r=>'<li><b>'+esc(L2([r[0],r[1]]))+'</b> → '+esc(L2([r[2],r[3]]))+'</li>').join('')+'</ul><p class="sm muted">'+esc(L2(R.after))+'</p></div>';
  return h;
}
function rhPainRow(id){
  const st=rhSt(id)||{},p=st.pain||{},today=rhDay();let chips='';
  for(let i=0;i<=10;i++)chips+='<button class="'+(p[today]===i?'on':'')+'" onclick="rhPain(\''+id+'\','+i+')">'+i+'</button>';
  let wk='';
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);let k;try{k=d.toLocaleDateString('en-CA');}catch(e){k=d.toISOString().slice(0,10);}
    const v=p[k];wk+='<span class="rh-d"><i>'+(v==null?'–':v)+'</i><small>'+d.toLocaleDateString(LANG==='es'?'es':'en',{weekday:'narrow'})+'</small></span>';
  }
  return'<div class="card"><b>'+t('rhToday')+'</b><div class="rh-chips">'+chips+'</div><p class="sm muted">'+t('rhLast7')+'</p><div class="rh-wk">'+wk+'</div>'+
    '<ul class="rh-ul"><li class="g">'+t('rhPainG')+'</li><li class="y">'+t('rhPainY')+'</li><li class="r">'+t('rhPainR')+'</li></ul></div>';
}
function rhPain(id,n){const st=rhSt(id);if(!st)return;if(!st.pain)st.pain={};const d=rhDay();if(st.pain[d]===n)delete st.pain[d];else st.pain[d]=n;saveSet();render();}
function rhFlag(){
  const n=document.querySelectorAll('.rh-flag:checked').length,w=$('rhwarn'),b=$('rhgo');
  if(w)w.hidden=!n;if(b)b.disabled=n>0;
}
function rhBegin(id){
  const st=rhStore();st[id]={ph:0,t0:Date.now(),crit:{},pain:{}};saveSet();render();window.scrollTo(0,0);
}
function rhCrit(id,ph,i,on){
  const st=rhSt(id);if(!st)return;
  if(!st.crit)st.crit={};const a=st.crit[ph]||[];a[i]=!!on;st.crit[ph]=a;saveSet();
  const p=rhPlan(id),need=p.phases[ph].adv.length,got=p.phases[ph].adv.filter((_,k)=>a[k]).length;
  const b=$('rhnext');if(b)b.disabled=got<need;
}
function rhNext(id){
  const st=rhSt(id),p=rhPlan(id);if(!st||st.ph>=p.phases.length-1)return;
  st.ph++;st.t0=Date.now();saveSet();render();window.scrollTo(0,0);toast(t('rhMoved',st.ph+1));
}
function rhSwitch(id,ph){
  const st=rhSt(id);if(!st)return;
  ask(t('rhSwitchAsk',ph+1),t('rhSwitchB'),function(){st.ph=ph;st.t0=Date.now();saveSet();render();window.scrollTo(0,0);},false);
}
function rhResetAsk(id){ask(t('rhResetAsk'),t('rhResetB'),function(){delete rhStore()[id];saveSet();render();window.scrollTo(0,0);},true);}
function rhGo(id){
  const p=rhPlan(id),st=rhSt(id);if(!p||!st)return;
  if(ACT){toast(t('finishFirst'));return;}
  const ph=p.phases[st.ph];
  startWorkout({name:L2(p.name).split(' (')[0]+' · '+t('rhPhaseN',st.ph+1),ex:ph.ex.map(x=>{
    const tm=exMode(x.id)==='t';
    return{eid:x.id,sets:Math.min(8,x.sets*(x.side?2:1)),n:(exById(x.id)||{}).en||x.id,tg:tm?{lo:(x.secs||30)/60,hi:(x.secs||30)/60,u:'m',rs:30}:{lo:x.r||10,hi:x.r||10,u:'r',rs:30}};
  })});
}
function rhPhaseCard(p,ph,i,st){
  const cur=st&&st.ph===i,crit=(st&&st.crit&&st.crit[i])||[];
  let h='<details class="card rh-ph'+(cur?' cur':'')+'"'+(cur?' open':'')+'><summary><b>'+t('rhPhaseN',i+1)+' · '+esc(L2(ph.n))+'</b>'+(cur?'<em class="rh-here">'+t('rhHere')+'</em>':'')+'<small>'+esc(L2(ph.wk))+'</small></summary>';
  h+='<p>'+esc(L2(ph.goal))+'</p>'+rhRows(ph)+'<p class="sm muted">'+t('rhPairNote')+'</p><div class="card tip"><p class="sm">'+esc(L2(ph.tip))+'</p></div>';
  if(ph.run)h+=rhRun();
  if(ph.adv.length){
    h+='<b class="sm">'+t('rhGoals')+'</b>';
    h+=ph.adv.map((c,k)=>'<label class="clchk"><input type="checkbox"'+(cur?'':' disabled')+(crit[k]?' checked':'')+' onchange="rhCrit(\''+p.id+'\','+i+','+k+',this.checked)"> '+esc(L2(c))+'</label>').join('');
  }
  if(cur){
    h+='<div class="row"><button class="btn pri wide" onclick="rhGo(\''+p.id+'\')">'+t('rhStart')+'</button></div>';
    if(i<p.phases.length-1)h+='<div class="row"><button class="btn wide" id="rhnext" onclick="rhNext(\''+p.id+'\')"'+(ph.adv.every((_,k)=>crit[k])?'':' disabled')+'>'+t('rhNext')+'</button></div><p class="sm muted">'+t('rhNextHint')+'</p>';
  }else if(st){
    h+='<button class="lnk-d" onclick="rhSwitch(\''+p.id+'\','+i+')">'+t('rhSwitch')+'</button>';
  }
  return h+'</details>';
}
function rhSources(p){
  return'<details class="card"><summary><b>'+t('rhSrc')+'</b></summary><ul class="rh-ul">'+p.src.map(k=>{const s=REHAB_SRC[k];return s?'<li><a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.t)+'</a></li>':'';}).join('')+'</ul></details>';
}
function vRhPlan(p){
  const st=rhSt(p.id);
  let h='<button class="lnk-d" onclick="rhOpen(null)">‹ '+t('rhBackList')+'</button><div class="rh-hd"><span class="rh-em">'+p.em+'</span><div><h2>'+esc(L2(p.name))+'</h2><p class="muted sm">'+esc(L2(p.sub))+'</p></div></div>';
  h+='<p>'+esc(L2(p.intro))+'</p><p class="sm muted">'+esc(L2(p.evid))+'</p>';
  if(!st){
    h+='<div class="card warn"><b>'+t('rhSafeT')+'</b><p class="sm">'+t('rhSafeP')+'</p>'+p.flags.map((f,k)=>'<label class="clchk"><input type="checkbox" class="rh-flag" onchange="rhFlag()"> '+esc(L2(f))+'</label>').join('')+
      '<p class="sm clmsg" id="rhwarn" hidden>'+t('rhWarn')+'</p>'+
      '<div class="row"><button class="btn pri wide" id="rhgo" onclick="rhBegin(\''+p.id+'\')">'+t('rhNone')+'</button></div>'+
      '<div class="row"><button class="btn wide" onclick="rhBegin(\''+p.id+'\')">'+t('rhCleared')+'</button></div></div>';
    h+=p.phases.map((ph,i)=>rhPhaseCard(p,ph,i,null)).join('');
  }else{
    h+=rhPainRow(p.id)+p.phases.map((ph,i)=>rhPhaseCard(p,ph,i,st)).join('')+'<button class="lnk-d" onclick="rhResetAsk(\''+p.id+'\')">'+t('rhReset')+'</button>';
  }
  return h+rhSources(p)+'<p class="muted sm">'+t('rhDisc')+'</p>';
}
function vRehab(){
  const p=RH.plan&&rhPlan(RH.plan);
  if(p)return vRhPlan(p);
  let h='<p class="muted sm">'+t('rhIntro')+'</p>';
  h+='<div class="rh-zones">'+RH_ZONES.map(z=>'<button class="btn'+(RH.zone===z?' pri':'')+'" onclick="rhZone(\''+z+'\')">'+t('rhZ_'+z)+'</button>').join('')+'</div>';
  h+=REHAB.filter(p=>RH.zone==='all'||p.zone===RH.zone).map(p=>{
    const st=rhSt(p.id);
    return'<button class="card rhc" onclick="rhOpen(\''+p.id+'\')"><span class="rh-em">'+p.em+'</span><span class="rhc-t"><b>'+esc(L2(p.name))+'</b><small>'+esc(L2(p.sub))+'</small><small class="rhc-s">'+(st?t('rhStatus',st.ph+1,p.phases.length,esc(L2(p.phases[st.ph].n))):t('rhNotStarted'))+'</small></span><span class="rhc-go">›</span></button>';
  }).join('');
  return h+'<p class="muted sm">'+t('rhDisc')+'</p>';
}
