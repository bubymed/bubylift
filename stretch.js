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
  return list.map(m=>'<div class="plex">'+exThumb(m.eid)+'<span><b>'+esc(exName(m.eid))+'</b><small>'+esc(strLine(m))+' · '+t(strIsDyn(m.eid)?'strDyn':'strStatic')+'</small></span><button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="howOpen(\''+m.eid+'\')">ⓘ</button></div>').join('');
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
function vStretch(){
  let h='<p class="muted sm">'+t('strIntro')+'</p>'+
    '<div class="seg"><button class="'+(STX.sec==='sess'?'on':'')+'" onclick="strSet(\'sec\',\'sess\')">⏱ '+t('strSess')+'</button><button class="'+(STX.sec==='area'?'on':'')+'" onclick="strSet(\'sec\',\'area\')">🧍 '+t('strArea')+'</button></div>';
  if(STX.sec==='sess'){
    const l=strItems(STX.type,STX.min),secs=strSecs();
    h+=libStep(1,'strStep1')+libChips(['full','lower','upper','back','warm','cool'],STX.type,'strType',k=>t('strT_'+k),1)+
      libStep(2,'strStep2')+libChips([5,10,15],STX.min,'strMinSet',k=>t('strMin',k),1)+
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
