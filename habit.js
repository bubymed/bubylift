/* Habit helpers (v68): weekly streak, weekly summary, calendar reminders.
   Ayudas de hábito (v68): racha semanal, resumen semanal y recordatorios en el calendario. */
function wkCount(ws){return DATA.workouts.filter(w=>w.t>=ws&&w.t<ws+7*864e5).length;}
/* weekly goal: the plan's days per week, or 3 / meta semanal: días del plan, o 3 */
function wkTarget(){return DATA.plan?DATA.plan.n:3;}
function wkMin(){return Math.max(1,Math.ceil(wkTarget()*0.67));}
/* streak in weeks: a week counts with about two thirds of the target; one missed week is forgiven per streak
   racha en semanas: una semana cuenta con unos dos tercios de la meta; se perdona una semana perdida por racha */
function streakInfo(){
  const now=Date.now(),cw=weekStart(now),min=wkMin();
  if(!DATA.workouts.length)return{n:0,cur:0,min:min,tg:wkTarget(),grace:0};
  const cur=wkCount(cw);
  let n=cur>=min?1:0,grace=0,w=cw-7*864e5,first=DATA.workouts[DATA.workouts.length-1].t;
  while(w+7*864e5>first){
    if(wkCount(w)>=min)n++;
    else if(!grace&&n>0){grace=1;}
    else break;
    w-=7*864e5;
  }
  return{n:n,cur:cur,min:min,tg:wkTarget(),grace:grace};
}
function streakCard(){
  if(!DATA.workouts.length)return'';
  const s=streakInfo(),left=Math.max(0,s.min-s.cur);
  return'<div class="card streak"><span class="st-n">'+ic('bolt')+' '+s.n+'</span><span class="st-t"><b>'+t(s.n===1?'stOne':'stN',s.n)+'</b><small>'+(left?t('stLeft',s.cur,s.tg,left):t('stOk',s.cur,s.tg))+(s.grace?' · '+t('stGrace'):'')+'</small></span></div>';
}
function wkStats(ws){
  const a=DATA.workouts.filter(w=>w.t>=ws&&w.t<ws+7*864e5);
  let sets=0,vol=0,prs=0,ms=0;
  a.forEach(w=>{sets+=wkSets(w);vol+=wkVol(w);w.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr)prs++;}));ms+=Math.max(0,(w.end||w.t)-w.t);});
  return{n:a.length,sets:sets,vol:vol,prs:prs,ms:ms};
}
function wkSumDue(){
  const cw=weekStart(Date.now());if(SET.wkSeen===cw)return false;
  return wkCount(cw-7*864e5)>0;
}
function wkSumCard(){
  if(!wkSumDue())return'';
  return'<div class="card tip"><b>'+t('wsT')+'</b><p class="sm">'+t('wsP')+'</p><div class="row"><button class="btn pri sm" onclick="wkSumOpen()">'+t('wsOpen')+'</button><button class="btn sm" onclick="wkSumHide()">'+t('wsHide')+'</button></div></div>';
}
function wkSumHide(){SET.wkSeen=weekStart(Date.now());saveSet();render();}
function wkSumOpen(){
  const cw=weekStart(Date.now()),a=wkStats(cw-7*864e5),b=wkStats(cw-14*864e5),s=streakInfo();
  const ar=(x,y)=>x>y?'↑ ':(x<y?'↓ ':'= ');
  SET.wkSeen=cw;saveSet();
  sheet('<div class="form"><div class="pick-h"><h3>'+t('wsT')+'</h3><button class="ico" onclick="sheetClose();render()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="stats card"><div><b>'+a.n+'</b><span>'+t('workouts')+'</span></div><div><b>'+a.sets+'</b><span>'+t('sets')+'</span></div><div><b>'+a.prs+'</b><span>PR</span></div></div>'+
    '<p class="muted sm">'+t('workouts')+': '+ar(a.n,b.n)+t('wsVs',b.n)+' · '+t('volume')+': '+wShow(a.vol)+' '+wUnit()+' '+ar(a.vol,b.vol)+t('wsVs',wShow(b.vol)+' '+wUnit())+'</p>'+
    '<p><b>'+t(s.n===1?'stOne':'stN',s.n)+'</b></p><p class="muted sm">'+t('wsNext',DATA.plan?t('planToday'):'')+'</p>'+
    '<div class="row"><button class="btn pri" onclick="sheetClose();render()">'+t('done')+'</button></div></div>');
}
/* reminders: a weekly calendar event on the plan's days; the phone's calendar does the alert (the app works offline and cannot ring by itself)
   recordatorios: evento semanal en tus días de plan; el calendario del teléfono avisa (la app es offline y no puede sonar sola) */
function remOpen(){
  const p=DATA.plan,days=p?(p.wd&&p.wd.length?p.wd:defaultWd(p.ds)):[1,3,5];
  sheet('<div class="form"><div class="pick-h"><h3>'+t('rmT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('rmP')+'</p>'+
    '<p class="sm">'+t('rmDays',days.map(d=>wdName(d)).join(', '))+'</p>'+
    '<label>'+t('rmTime')+'<input id="rmtime" class="in" type="time" value="'+esc(SET.remTime||'18:00')+'"></label>'+
    '<div class="row"><button class="btn pri" onclick="remSave()">'+ic('calendar')+' '+t('rmGo')+'</button><button class="btn" onclick="sheetClose()">'+t('cancel')+'</button></div><p class="muted sm">'+t('rmN')+'</p></div>');
}
function remSave(){
  const p=DATA.plan,days=p?(p.wd&&p.wd.length?p.wd:defaultWd(p.ds)):[1,3,5];
  const tm=($('rmtime').value||'18:00').split(':'),hh=(tm[0]||'18').padStart(2,'0'),mm=(tm[1]||'00').padStart(2,'0');
  SET.remTime=hh+':'+mm;saveSet();
  const BY=['SU','MO','TU','WE','TH','FR','SA'],pad=n=>String(n).padStart(2,'0'),d=new Date();
  const ds=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
  const ev=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bubylift//EN'];
  days.forEach(wd=>{
    ev.push('BEGIN:VEVENT','UID:bubylift-'+wd+'-'+ds+'@bubylift','DTSTAMP:'+ds+'T000000Z','DTSTART:'+ds+'T'+hh+mm+'00','DURATION:PT1H','RRULE:FREQ=WEEKLY;BYDAY='+BY[wd],'SUMMARY:Bubylift 🏋️','DESCRIPTION:'+t('rmDesc'),'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Bubylift','END:VALARM','END:VEVENT');
  });
  ev.push('END:VCALENDAR');
  sheetClose();fileOut('bubylift-reminders.ics',ev.join('\r\n'),'text/calendar');toast(t('rmDone'));
}
function habitCards(){return wkSumCard()+streakCard();}
