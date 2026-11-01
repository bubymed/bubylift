/* Stretch tab (v49): quick sessions by focus and time, and every stretch by body area.
   Pestaña Estirar (v49): sesiones rápidas por enfoque y tiempo, y todos los estiramientos por zona del cuerpo. */
const STX={sec:'sess',type:'full',min:10,area:'ham'};
const STX_SECS={5:20,10:30,15:40};
function strSecs(){return STX_SECS[STX.min]||30;}
function strSet(k,v){STX[k]=v;if(k==='min')STX.min=+v;render();}
function strIsDyn(id){return STRETCH_DYN.indexOf(id)>=0;}
/* the moves of a session: first option the person can do in every slot, as many as fit the time / los movimientos de una sesión */
function strItems(type,min){
  const secs=STX_SECS[min]||30,n=Math.max(4,Math.round(min*60/(secs+15))),have=curHave(),used={},out=[];
  (STRETCH_SESS[type]||'').split('|').forEach(s=>{
    if(out.length>=n)return;
    const id=s.split(',').find(a=>!used[a]&&avail(a,have));
    if(!id)return;used[id]=1;out.push(strMove(id,secs));
  });
  return out;
}
function strMove(id,secs){
  const hold=exMode(id)==='t';
  return{eid:id,sets:1,secs:secs,hold:hold,tg:hold?{lo:secs/60,hi:secs/60,u:'m',rs:10}:{lo:10,hi:10,u:'r',rs:10}};
}
function strLine(m){return m.hold?t('strHoldS',m.secs):t('strRepsN',10);}
function strRows(list){
  return'<div class="mb-list">'+list.map((m,k)=>'<div class="pv-ex mb-ex" role="button" tabindex="0" style="--i:'+k+'" onclick="howOpen(\''+m.eid+'\')">'+(typeof pvTh==='function'?pvTh(m.eid):exThumb(m.eid))+'<div class="pv-b"><b><i class="mb-n">'+(k+1)+'</i>'+esc(exName(m.eid))+'</b><div class="pv-pills"><span class="pv-p">'+esc(strLine(m))+'</span><span class="pv-p2">'+t(strIsDyn(m.eid)?'strDyn':'strStatic')+'</span></div></div><button class="pv-play" aria-label="'+esc(t('howTo'))+'" onclick="event.stopPropagation();howOpen(\''+m.eid+'\')">'+ic('help-circle')+'</button></div>').join('')+'</div>';
}
function strStart(name,list){
  if(ACT){toast(t('finishFirst'));return;}
  if(!list.length){toast(t('strNone'));return;}
  startWorkout({name:name,ex:list.map(m=>({eid:m.eid,sets:1,tg:m.tg}))});
}
function strSave(name,list){
  if(!list.length)return;
  DATA.routines.push({id:uid(),name:name,ex:list.map(m=>({eid:m.eid,n:(exById(m.eid)||{}).en||m.eid,sets:1}))});
  saveData();toast(t('libSaved'));render();
}
function strSessGo(save){
  const name=t('strT_'+STX.type)+' · '+t('strMin',STX.min),l=strItems(STX.type,STX.min);
  if(save)strSave(name,l);else strStart(name,l);
}
function strAreaList(){const have=curHave();return (STRETCH_BY[STX.area]||[]).filter(id=>avail(id,have)&&exById(id)).map(id=>strMove(id,30));}
function strAreaGo(save){
  const name=t('strA_'+STX.area),l=strAreaList();
  if(save)strSave(name,l);else strStart(name,l);
}
function strHero(){
  const l=strItems(STX.type,STX.min),n=l.length;
  return'<div class="card hero mb-hero"'+skAttr(t('mobToday'),t('strT_'+STX.type)+' · '+t('strMin',STX.min),t('mobGo'),'strSessGo(0)')+'><span class="hero-e">'+t('mobToday')+'</span><h2>'+t('strT_'+STX.type)+' · '+t('strMin',STX.min)+'</h2>'+
    '<div class="mb-stats"><span><b>'+n+'</b>'+t('mbMovesL')+'</span><span><b>'+STX.min+'</b>'+t('mbMinL')+'</span><span><b>'+strSecs()+'s</b>'+t('mbEachL')+'</span></div>'+
    '<div class="pv-mini mb-mini">'+l.slice(0,7).map(m=>pvMiniTh(m.eid)).join('')+(n>7?'<i class="more">+'+(n-7)+'</i>':'')+'</div>'+
    '<button class="btn pri big wide pv-go" onclick="strSessGo(0)">'+ic('stopwatch')+' '+t('mobGo')+'</button></div>';
}
const MB_IC={full:'yoga',lower:'target',upper:'bolt',back:'refresh',warm:'sparkles',cool:'heart'};
function mbTiles(cur){return'<div class="pv-tiles mb-tiles">'+['full','lower','upper','back','warm','cool'].map(k=>'<button class="pv-tile'+(k===cur?' on':'')+'" onclick="strType(\''+k+'\')">'+ic(MB_IC[k])+'<span>'+t('strT_'+k)+'</span><small>'+t('mbSub_'+k)+'</small></button>').join('')+'</div>';}
function mbTimes(cur){return'<div class="mb-times">'+[5,10,15].map(m=>'<button class="mb-time'+(m===cur?' on':'')+'" onclick="strMinSet(\''+m+'\')"><b>'+m+'</b><span>min</span><small>'+t('mbSecEach',STX_SECS[m])+'</small></button>').join('')+'</div>';}
function vStretch(){
  const rhOn=STX.sec==='rehab';
  let h=(rhOn?'':strHero()+'<div class="sec"><h2>'+t('mobCustom')+'</h2></div><details class="dtl pv-dt"><summary><b>'+t('mbTips')+'</b></summary><p class="muted sm">'+t('strIntro')+'</p></details>')+
    '<div class="seg"><button class="'+(STX.sec==='sess'?'on':'')+'" onclick="strSet(\'sec\',\'sess\')">'+ic('stopwatch')+' '+t('strSess')+'</button><button class="'+(STX.sec==='area'?'on':'')+'" onclick="strSet(\'sec\',\'area\')">'+ic('yoga')+' '+t('strArea')+'</button><button class="'+(rhOn?'on':'')+'" onclick="strSet(\'sec\',\'rehab\')">'+ic('heart')+' '+t('rhSeg')+'</button></div>';
  if(rhOn)return h+vRehab();
  if(STX.sec==='sess'){
    const l=strItems(STX.type,STX.min),secs=strSecs();
    h+=libStep(1,'strStep1')+mbTiles(STX.type)+
      libStep(2,'strStep2')+mbTimes(STX.min)+
      libStep(3,'strStep3');
    if(!l.length)return h+'<p class="muted">'+t('strNone')+'</p>';
    h+='<p class="muted sm">'+t('strPlan',l.length,STX.min,secs)+'</p>'+strRows(l)+
      '<p class="muted sm">'+t('strBoth')+'</p>'+
      '<div class="row"><button class="btn pri" onclick="strSessGo(0)">'+t('strStart')+'</button><button class="btn" onclick="strSessGo(1)">'+t('libSave')+'</button></div>';
  }else{
    const l=strAreaList();
    h+=libStep(1,'strStepA')+libChips(STRETCH_AREAS,STX.area,'strAreaSet',k=>t('strA_'+k),1)+libStep(2,'strStepB');
    if(!l.length)return h+'<p class="muted">'+t('strNone')+'</p>';
    h+=strRows(l)+'<p class="muted sm">'+t('strBoth')+'</p>'+
      '<div class="row"><button class="btn pri" onclick="strAreaGo(0)">'+t('strAreaStart')+'</button><button class="btn" onclick="strAreaGo(1)">'+t('libSave')+'</button></div>';
  }
  h+='<div class="card optb"><p class="sm">'+t('strLevels')+'</p><button class="btn sm" onclick="strOpenLib()">'+t('strLevelsBtn')+'</button></div><p class="muted sm">'+t('strSafe')+'</p>';
  return h;
}
function strType(k){STX.type=k;render();}
function strMinSet(k){STX.min=+k;render();}
function strAreaSet(k){STX.area=k;render();}
function strOpenLib(){LIB.tab='focus';LIB.area='stretch';libOpen();}
