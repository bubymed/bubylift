/* First-run tour (v0.99.13): a short spotlight walk through the tabs. Skippable, can be switched off, replay from Settings.
   Tour de primera vez (v0.99.13): recorrido corto con foco sobre las pestañas. Se puede saltar, apagar y repetir desde Ajustes. */
const TOUR=[
 {k:0,em:'💪'},
 {k:1,em:'🏋️',sel:'#tabbar button:nth-child(1)'},
 {k:2,em:'🧘',sel:'#tabbar button:nth-child(2)'},
 {k:3,em:'📈',sel:'#tabbar button:nth-child(3)'},
 {k:4,em:'⚖️',sel:'#tabbar button:nth-child(4)'},
 {k:5,em:'⚙️',sel:'#moreBtn',top:1},
 {k:6,em:'🎉'}
];
let TR={i:0,on:false};
function tourMaybe(n){
  n=n||0;
  try{if(localStorage.getItem('bl_tourpref')==='0'){localStorage.removeItem('bl_tourpref');SET.tour=false;SET.tourSeen=1;saveSet();}}catch(e){}
  if(SET.tourSeen||SET.tour===false||(DATA.workouts&&DATA.workouts.length))return;
  const busy=!$('gate').hidden||!$('sheetov').hidden||ACT||TR.on;
  if(busy){if(n<12)setTimeout(()=>tourMaybe(n+1),2500);return;}
  tourStart(false);
}
function tourStart(force){
  if(TR.on)return;
  if(force&&typeof ACT!=='undefined'&&ACT){toast(t('finishFirst'));return;}
  if(typeof sheetClose==='function'&&!$('sheetov').hidden)sheetClose();
  TR={i:0,on:true};
  if(!force){SET.tourSeen=1;saveSet();}
  go('workout');
  let o=$('tour');if(o)o.remove();
  o=document.createElement('div');o.id='tour';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.innerHTML='<div class="tour-spot" id="tspot"></div><div class="tour-card" id="tcard"></div>';
  document.body.appendChild(o);
  window.addEventListener('resize',tourDraw);
  tourDraw();
}
function tourDraw(){
  if(!TR.on)return;
  const s=TOUR[TR.i],sp=$('tspot'),cd=$('tcard');if(!sp||!cd)return;
  const last=TR.i===TOUR.length-1,first=TR.i===0,L=window.innerWidth,H=window.innerHeight;
  const tg=s.sel?document.querySelector(s.sel):null,r=tg?tg.getBoundingClientRect():null;
  if(r){sp.style.cssText='left:'+(r.left-6)+'px;top:'+(r.top-6)+'px;width:'+(r.width+12)+'px;height:'+(r.height+12)+'px;border-radius:16px;opacity:1';}
  else sp.style.cssText='left:'+(L/2)+'px;top:'+(H/2)+'px;width:0;height:0;border-radius:0;opacity:1';
  let dots='';for(let k=0;k<TOUR.length;k++)dots+='<i'+(k===TR.i?' class="on"':'')+'></i>';
  cd.innerHTML='<div class="tour-em">'+s.em+'</div><h3>'+t('tr'+s.k+'t')+'</h3><p>'+t('tr'+s.k+'p')+'</p><div class="tour-dots">'+dots+'</div>'+
    '<div class="tour-btns">'+(first||last?'':'<button class="btn" onclick="tourGo(-1)">'+t('back')+'</button>')+'<button class="btn pri" onclick="tourGo(1)">'+t(last?'tourGo':'next')+'</button></div>'+
    (last?'':'<button class="btn tour-skip" onclick="tourEnd(true)">'+t('tourSkip')+'</button>');
  cd.style.cssText=r?(s.top?'top:'+Math.min(H-280,r.bottom+18)+'px;bottom:auto':'bottom:'+Math.max(12,H-r.top+18)+'px;top:auto'):'top:50%;bottom:auto;transform:translateY(-50%)';
  const b=cd.querySelector('.btn.pri');if(b)b.focus({preventScroll:true});
}
function tourGo(d){
  const n=TR.i+d;
  if(n>=TOUR.length){tourEnd(false);return;}
  if(n<0)return;
  TR.i=n;tourDraw();
}
/* skip = "don't show again" / saltar = no volver a mostrar */
function tourEnd(skipped){
  TR.on=false;window.removeEventListener('resize',tourDraw);
  const o=$('tour');if(o)o.remove();
  SET.tourSeen=1;if(skipped)SET.tour=false;saveSet();
  if(skipped)toast(t('tourOff'));
  window.scrollTo(0,0);
}
function setTour(v){SET.tour=v==='1';saveSet();render();}
