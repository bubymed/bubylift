/* Guided mobility session: one move at a time, with a countdown, a side switch and one big button.
   Sesión de movilidad guiada: un movimiento a la vez, con cuenta regresiva, cambio de lado y un botón grande. */
let GD=null,GDT=0;
const GD_PREP=3,GD_SWAP=6; // seconds to get ready / to switch sides / segundos para prepararte y para cambiar de lado
const GD_SIDE_RE=/\b(switch|other (side|leg|arm|knee|foot|elbow|hand)|opposite (side|leg|arm|knee|foot|elbow|hand)|each (side|leg|arm)|both (sides|legs|arms)|one (leg|arm|knee|foot|elbow|hand|side)|then repeat|repeat on|alternate sides)\b/i;
function gdOnNow(){return !!ACT&&!!ACT.guide&&!ACT.gOff;}
/* holds done one side at a time (read from the how-to text) / estiramientos que se hacen un lado y luego el otro (según el texto de cómo hacerlo) */
function gdUni(eid){const h=(typeof HOWTO!=='undefined'&&HOWTO[eid]||[])[0]||'';return GD_SIDE_RE.test(h);}
function gdInfo(i){
  const x=ACT.ex[i],tg=x.tg||{},reps=exMode(x.eid)!=='t'||tg.u==='r';
  if(reps)return{reps:true,n:Math.max(1,Math.round(tg.lo||10)),secs:0,sides:1};
  const secs=Math.max(5,Math.round((tg.lo||0.5)*60));
  return{reps:false,secs:secs,sides:gdUni(x.eid)?2:1};
}
function gdFirst(){for(let i=0;i<ACT.ex.length;i++)if(!ACT.ex[i].sets.every(s=>s.done))return i;return ACT.ex.length-1;}
function gdLoad(i,en){
  i=Math.max(0,Math.min(ACT.ex.length-1,i));const f=gdInfo(i),done=ACT.ex[i].sets.every(s=>s.done);
  GD={i:i,f:f,ph:done?'done':(f.reps?'reps':'ready'),side:0,dur:0,tEnd:0,left:0,paused:false,enter:en||'x'};
}
function gdPhase(ph,sec){GD.ph=ph;GD.dur=sec*1000;GD.tEnd=Date.now()+GD.dur;GD.left=GD.dur;GD.paused=false;}
function gdStamp(){if(!ACT.ts){ACT.ts=Date.now();ACT.sn=ACT.ts;ACT.acc=0;ACT.pz=false;}else if(ACT.pz){ACT.pz=false;ACT.sn=Date.now();}}
function gdMark(sec){
  const x=ACT.ex[GD.i],s=x.sets[0];gdStamp();
  if(GD.f.reps)s.r=GD.f.n;else s.t=(sec!=null?sec:GD.f.secs*GD.f.sides)/60;
  x.sets.forEach(q=>{q.done=true;});saveAct();
}
function gdMain(){
  unlockAudio();if(!GD)gdLoad(gdFirst());
  const p=GD.ph;
  if(p==='ready'){gdStamp();gdPhase('prep',GD_PREP);}
  else if(p==='reps'){gdMark();GD.ph='done';buzz(12);}
  else if(p==='done'){if(GD.i>=ACT.ex.length-1){finishAsk();return;}gdLoad(GD.i+1,'f');}
  else if(GD.paused){GD.paused=false;GD.tEnd=Date.now()+GD.left;}
  else{GD.paused=true;GD.left=Math.max(0,GD.tEnd-Date.now());}
  saveAct();render();gdTick();
}
/* end this move now: keeps what you already held / terminar este movimiento ya: guarda lo que ya mantuviste */
function gdFinMove(){
  if(!GD)return;const f=GD.f;let sec=null;
  if(!f.reps){const left=GD.paused?GD.left:Math.max(0,GD.tEnd-Date.now()),done=(GD.ph==='swap'?1:(GD.ph==='hold'?GD.side:0))*f.secs+(GD.ph==='hold'?Math.max(0,(GD.dur-left)/1000):0);sec=Math.max(1,Math.round(done));}
  gdMark(sec);GD.ph='done';buzz(12);render();
}
function gdSkip(d){if(!GD)gdLoad(gdFirst());const n=GD.i+d;if(n<0||n>=ACT.ex.length)return;gdLoad(n,d>0?'f':'b');render();}
function gdAdvance(){ // a countdown reached 0 / una cuenta llegó a 0
  const p=GD.ph;beep();buzz([60,40,60]);
  if(p==='prep'){GD.side=0;gdPhase('hold',GD.f.secs);}
  else if(p==='hold'){if(GD.f.sides===2&&GD.side===0)gdPhase('swap',GD_SWAP);else{gdMark();GD.ph='done';}}
  else if(p==='swap'){GD.side=1;gdPhase('hold',GD.f.secs);}
  render();
}
function gdTick(){
  if(!gdOnNow()){if(GDT){clearInterval(GDT);GDT=0;}return;}
  if(!GD||GD.paused||!(GD.ph==='prep'||GD.ph==='hold'||GD.ph==='swap'))return;
  const left=Math.max(0,GD.tEnd-Date.now()),s=Math.ceil(left/1000),n=document.getElementById('gdN'),r=document.getElementById('gdR');
  if(n&&n.textContent!==String(s)){n.textContent=s;n.classList.remove('tk','tk3');void n.offsetWidth;n.classList.add(s>0&&s<=3?'tk3':'tk');if(s>0&&s<=3)buzz(10);}
  if(r)r.style.strokeDashoffset=String(Math.round(534*(1-(GD.dur?left/GD.dur:0))));
  if(left<=0)gdAdvance();
}
setInterval(gdTick,200);
function gdOn(){if(!ACT)return;delete ACT.gOff;saveAct();render();pgAnim();}
function gdMenu(){
  sheet('<h3>'+t('gdExitT')+'</h3><div class="menu"><button onclick="sheetClose();finishAsk()">✓ '+t('gdSave')+'</button><button onclick="sheetClose();ACT.gOff=1;saveAct();render();pgAnim()">☰ '+t('gdList')+'</button><button onclick="sheetClose();gdLoad(GD?GD.i:gdFirst());render()">↺ '+t('gdRestart')+'</button><button class="danger" onclick="sheetClose();cancelAsk()">✕ '+t('gdDiscard')+'</button></div><button class="btn wide" onclick="sheetClose()">'+t('gdStay')+'</button>');
}
/* which part of the body switches (arm, leg…), read from the how-to text / qué parte del cuerpo cambia (brazo, pierna…), según el texto de cómo hacerlo */
function gdPart(eid){
  const e=exById(eid),n=((e&&e.en)||'')+' '+String(eid).replace(/^z_/,'').replace(/_/g,' ');
  if(/hamstring|quad|calf|\bhip|groin|glute|thigh|ankle|foot|knee|\blegs?\b|lunge|adductor|achilles|soleus|gastroc|peroneal|tibialis|split|runner|\bit band|dancer|scissor|locust|world/i.test(n))return'leg';
  if(/tricep|bicep|shoulder|wrist|deltoid|forearm|\barms?\b|elbow|\blat\b|chest stretch|handed/i.test(n))return'arm';
  if(/neck|spin|torso|lateral|\bback\b|\bside\b|crossover|overhead/i.test(n))return'side';
  const h=(typeof HOWTO!=='undefined'&&HOWTO[eid]||[])[0]||'';
  const m=h.match(/\b(?:other|opposite|each|one|both)\s+(arm|leg|knee|foot|elbow|hand)s?\b/i)||h.match(/\bswitch(?:ing)?\s+(arm|leg|knee|foot|elbow|hand)s?\b/i);
  return m?({hand:'arm',foot:'leg',knee:'leg',elbow:'arm'}[m[1].toLowerCase()]||m[1].toLowerCase()):'side';
}
function gdDyn(){return typeof STRETCH_DYN!=='undefined'&&STRETCH_DYN.indexOf(ACT.ex[GD.i].eid)>=0;}
function gdLabel(){
  const f=GD.f,p=GD.ph;
  if(p==='ready')return f.reps?t('gdReps',f.n):(gdDyn()?t('gdMove',f.secs):(f.sides===2?t('gdE_'+gdPart(ACT.ex[GD.i].eid),f.secs):t('gdHold',f.secs)));
  if(p==='reps')return t('gdReps',f.n);
  if(p==='prep')return t('gdPrep');
  if(p==='swap')return t('gdW_'+gdPart(ACT.ex[GD.i].eid));
  if(p==='done')return t('gdDone');
  if(gdDyn())return t('gdMoving');
  return f.sides===2?t((GD.side?'gdS_':'gdF_')+gdPart(ACT.ex[GD.i].eid))+' — '+t('gdHoldW'):t('gdHolding');
}
function vGuide(){
  if(!GD||GD.i>=ACT.ex.length)gdLoad(gdFirst());
  const n=ACT.ex.length,i=GD.i,x=ACT.ex[i],e=exById(x.eid),es=LANG==='es',src=typeof HOWTO!=='undefined'?HOWTO[x.eid]:null;
  const steps=src?(src[es?1:0]||'').split('|').filter(Boolean):[],p=GD.ph,run=p==='prep'||p==='hold'||p==='swap';
  const left=run?(GD.paused?GD.left:Math.max(0,GD.tEnd-Date.now())):0,secs=Math.ceil(left/1000);
  const big=run?'<span id="gdN">'+secs+'</span>':(p==='done'?'<span class="gd-ok">'+ic('check')+'</span>':(GD.f.reps?'<span>'+GD.f.n+'</span><small>'+t('colReps')+'</small>':'<span>'+GD.f.secs+'</span><small>s</small>'));
  const off=run?Math.round(534*(1-(GD.dur?left/GD.dur:0))):(p==='done'?0:534);
  const nx=ACT.ex[i+1],last=i>=n-1;
  const btn=p==='ready'?[ic('play'),t('gdStart')]:(p==='reps'?[ic('check'),t('gdRepsDone')]:(p==='done'?(last?[ic('check'),t('gdFinish')]:[ic('play'),t('gdNext',exName(nx.eid,nx.n))]):(GD.paused?[ic('play'),t('gdResume')]:[ic('pause'),t('gdPause')])));
  const segs=ACT.ex.map((q,k)=>'<i class="'+(q.sets.every(s=>s.done)?'ok':(k===i?'cur':''))+'"></i>').join('');
  const en=GD.enter;GD.enter='';
  return'<div class="gd gd-'+p+(en?' gd-e-'+en:'')+'">'+
    '<div class="gd-top"><button class="gd-exit" onclick="gdMenu()">'+ic('chevron-left')+' '+t('gdExit')+'</button><div class="gd-prog">'+segs+'</div><span class="gd-cnt">'+(i+1)+'/'+n+'</span></div>'+
    '<h2 class="gd-name">'+esc(exName(x.eid,x.n))+'</h2>'+
    ((typeof EXPHOTO!=='undefined'&&EXPHOTO.has(x.eid))?'<div class="eximg gd-img">'+exImgs(x.eid)+'</div>':'')+
    '<div class="gd-lbl">'+esc(gdLabel())+'</div>'+
    '<div class="gd-ring"><svg viewBox="0 0 190 190" aria-hidden="true"><circle class="bg" cx="95" cy="95" r="85"/><circle id="gdR" class="fg" cx="95" cy="95" r="85" style="stroke-dashoffset:'+off+'"/></svg><div class="gd-num">'+big+'</div></div>'+
    '<div class="gd-ctl"><button class="gd-s" onclick="gdSkip(-1)" aria-label="'+esc(t('gdBack'))+'"'+(i<1?' disabled':'')+'>'+ic('chevron-left')+'</button><button class="gd-main" onclick="gdMain()">'+btn[0]+'<span>'+esc(btn[1])+'</span></button><button class="gd-s" onclick="gdSkip(1)" aria-label="'+esc(t('gdSkip'))+'"'+(last?' disabled':'')+'>'+ic('chevron-right')+'</button></div>'+
    (run?'<button class="gd-fm" onclick="gdFinMove()">'+ic('check')+' '+t('gdFinMove')+'</button>':'')+
    '<div class="gd-acts"><button onclick="ACT.gOff=1;saveAct();render();pgAnim()">☰ '+t('gdListB')+'</button><button onclick="finishAsk()">■ '+t('gdEnd')+'</button></div>'+
    (steps.length?'<div class="gd-how"><div class="lbl">'+t('howSteps')+'</div><ol class="how">'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></div>':'')+
  '</div>';
}
