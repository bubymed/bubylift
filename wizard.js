/* Plan wizard, one question per screen (v25) / Asistente del plan, una pregunta por pantalla (v25) */

const WZ_IC={
  goal:{muscle:'💪',bodybuilding:'🏆',strength:'🏋️',fat:'🔥',general:'✨',hybrid:'⚡',military:'🎖️',runner:'🏃'},
  sex:{f:'👩',m:'👨',x:'🙂'},
  emph:{bal:'⚖️',low:'🦵',up:'💪'},
  race:{'5k':'🏁','10k':'🏃','half':'🥈','full':'🥇',fit:'🙂'},
  test:{aft:'🪖',usmc:'🦅',gen:'🎯'},
  focus:{glutes:'🍑',quads:'🦵',hams:'🦿',calves:'🦶',chest:'🫁',back:'🔙',shoulders:'🔺',arms:'💪',abs:'🧱'},
  skill:{strength:'🏋️',power:'⚡',speed:'💨',endurance:'🫀',balance:'🧘'},
  vol:{lo:'🌱',md:'🌿',hi:'🌳'},
  lvl:{new:'🌱',some:'🌿',adv:'🔥'},
  have:{barbell:'🏋️',dumbbell:'💪',cable:'🔗',machine:'⚙️',kettlebell:'🔔',band:'🟢',ball:'⚽',medball:'🏐',suspension:'➰',bench:'🛋️',bar:'🧗',sled:'🛷'},
  avoid:{jump:'🦘',floor:'🧎',barbell:'🏋️',machine:'⚙️',ball:'⚽',overhead:'🙌'},
  work:{'':'🤷',sit:'🪑',stand:'🧍'},
  split:{auto:'🤖',ul:'↕️',ppl:'🔁',arn:'🏆',bro:'🧱',ulppl:'🧬'},
  pu:{'':'⏭️',p0:'1️⃣',p1:'5️⃣',p2:'🔟',p3:'💯'}
};
/* card builders / constructores de tarjetas */
function wzOpt(onclick,on,ic,label,desc){
  return'<button class="wopt'+(on?' on':'')+'" onclick="'+onclick+'">'+(ic?'<span class="wi">'+ic+'</span>':'')+'<span class="wt"><b>'+esc(label)+'</b>'+(desc?'<small>'+esc(desc)+'</small>':'')+'</span><i class="wck">✓</i></button>';
}
const wzV=v=>typeof v==='number'?v:"'"+v+"'";
function wzGrid(items,cls){return'<div class="wgrid'+(cls?' '+cls:'')+'">'+items.join('')+'</div>';}
/* single choice: tap = pick and move on / una opción: al tocar elige y avanza */
function wzOne(key,vals,cur,lab,ic,desc,cls){
  return wzGrid(vals.map(v=>wzOpt("wzPick('"+key+"',"+wzV(v)+")",cur===v,ic?ic(v):'',lab(v),desc?desc(v):'')),cls);
}
/* several choices / varias opciones */
function wzMany(key,vals,lab,ic,max,cls){
  return wzGrid(vals.map(v=>wzOpt("wzTogM('"+key+"','"+v+"',"+(max||0)+")",PW[key].indexOf(v)>=0,ic?ic(v):'',lab(v),'')),cls);
}
let _wzT=0;
function wzPick(k,v){
  pwSet(k,v);
  clearTimeout(_wzT);_wzT=setTimeout(()=>wzGo(1),230);
}
function wzTogM(k,v,max){
  const a=PW[k],i=a.indexOf(v);
  if(i>=0)a.splice(i,1);else if(!max||a.length<max)a.push(v);
  wizDraw();
}

const WQ=[
 {id:'goal',ic:'🎯',title:()=>t('psGoal'),sub:()=>t('wzGoalS'),body:()=>wzOne('goal',PGOALS,PW.goal,v=>t('pg_'+v),v=>WZ_IC.goal[v],v=>t('pgd_'+v),'c1')},
 {id:'mix',ic:'🧩',title:()=>t('psMix'),sub:()=>t('psMixH'),multi:1,body:()=>{
    const opts=PGOALS.filter(g=>g!==PW.goal&&!(isHy(g)&&isHy(PW.goal)));
    return wzGrid([wzOpt('pwMix(null)',!PW.mix,'🚫',t('psMixNone'),'')].concat(opts.map(g=>wzOpt("pwMix('"+g+"')",PW.mix&&PW.mix.g===g,WZ_IC.goal[g],t('pg_'+g),''))))+
      (PW.mix?'<div class="lbl">'+t('psMixSplit')+'</div>'+wzGrid([50,70].map(p=>wzOpt('pwMixP('+p+')',PW.mix.p===p,'',p+' / '+(100-p),'')))+'<p class="muted sm">'+t('psMixP',PW.mix.p,t('pg_'+PW.goal),100-PW.mix.p,t('pg_'+PW.mix.g))+'</p>':'');}},
 {id:'sex',ic:'🙂',title:()=>t('psSex'),sub:()=>t('psSexP'),body:()=>wzOne('sex',PSEX,PW.sex,v=>t('sex_'+v),v=>WZ_IC.sex[v])},
 {id:'emph',ic:'⚖️',title:()=>t('psEmph'),sub:()=>t('wzEmphS'),show:()=>goalsOf(PW).some(g=>['hybrid','bodybuilding','runner','military'].indexOf(g)<0),
  body:()=>wzOne('emph',PEMPH,PW.em0||PW.emph,v=>t('em_'+v),v=>WZ_IC.emph[v],v=>t('emd_'+v),'c1')},
 {id:'race',ic:'🏃',title:()=>t('psRace'),sub:()=>t('psRaceP'),show:()=>goalsOf(PW).indexOf('runner')>=0,body:()=>wzOne('race',RACES,PW.race,v=>t('rc_'+v),v=>WZ_IC.race[v])},
 {id:'test',ic:'🎖️',title:()=>t('psTest'),sub:()=>t('wzTestS'),show:()=>goalsOf(PW).indexOf('military')>=0,body:()=>wzOne('test',TESTS,PW.test,v=>t('te_'+v),v=>WZ_IC.test[v],v=>t('ted_'+v),'c1')},
 {id:'tw',ic:'📅',title:()=>t('psTw'),sub:()=>t('wzTwS'),show:()=>goalsOf(PW).indexOf('military')>=0,body:()=>wzOne('tw',TW,PW.tw,v=>v?t('psTwN',v):t('psTwNone'),v=>v?'📅':'🚫')},
 {id:'focus',ic:'🔍',title:()=>t('psFocus'),sub:()=>t('psFocusP'),multi:1,body:()=>wzMany('focus',Object.keys(FOCUS_MU),v=>t('fm_'+v),v=>WZ_IC.focus[v],3)},
 {id:'ff',ic:'🔁',title:()=>t('psFreq'),sub:()=>t('psFreqP'),show:()=>PW.focus.length>0,body:()=>wzOne('ff',[1,2,3,4],PW.ff,v=>t('psDaysN',v),()=>'')},
 {id:'skills',ic:'⚡',title:()=>t('psSkill'),sub:()=>t('psSkillP'),multi:1,show:()=>false,body:()=>wzMany('skills',SKILLS,v=>t('sk_'+v),v=>WZ_IC.skill[v],2)},
 {id:'n',ic:'📆',title:()=>t('psDays'),sub:()=>t('wzDaysS'),body:()=>wzOne('n',[2,3,4,5],PW.n,v=>t('psDaysN',v),()=>'')},
 {id:'split',ic:'🗂️',title:()=>t('psSplit'),sub:()=>t('wzSplitS'),show:()=>optOn(PW),body:()=>{
    const cur=splitOk(PW.split,PW.n)?PW.split:'auto';
    return wzOne('split',['auto'].concat(SPLIT_IDS.filter(id=>splitOk(id,PW.n))),cur,v=>t('spl_'+v),v=>WZ_IC.split[v],v=>t('spld_'+v),'c1');}},
 {id:'len',ic:'⏱️',title:()=>t('psLen'),sub:()=>t('psLenP'),body:()=>wzOne('len',[30,45,60,75],PW.len,v=>t('psLenN',v),()=>'')},
 {id:'sh',ic:'⚡',title:()=>t('psShort'),sub:()=>t('psShortP'),show:()=>optOn(PW),body:()=>{
    const mx=Math.min(2,PW.n-1),a=[];for(let i=0;i<=mx;i++)a.push(i);if(PW.sh>mx)PW.sh=mx;
    return wzOne('sh',a,PW.sh|0,v=>t('shN',v),()=>'');}},
 {id:'vol',ic:'📊',title:()=>t('psVol'),sub:()=>t('wzVolS'),body:()=>wzOne('vol',['lo','md','hi'],PW.vol,v=>t('vol_'+v),v=>WZ_IC.vol[v],v=>t('vold_'+v),'c1')},
 {id:'lvl',ic:'📈',title:()=>t('psLvl'),sub:()=>t('wzLvlS'),body:()=>wzOne('lvl',PLVLS,PW.lvl,v=>t('pl_'+v),v=>WZ_IC.lvl[v],v=>t('pld_'+v),'c1')},
 {id:'pu',ic:'🤸',title:()=>t('psPu'),sub:()=>(PW.pu&&lvlEff(PW)!==PW.lvl?t('puAdj',t('pl_'+lvlEff(PW))):t('psPuP')),body:()=>wzOne('pu',['',].concat(PUS),PW.pu,v=>t('pu_'+(v||'none')),v=>WZ_IC.pu[v])},
 {id:'ph',ic:'🎯',title:()=>t('phT'),sub:()=>t('wzPhS'),body:()=>{
    const al=optAllowed(PW),auto=optPhase(Object.assign({},PW,{ph:0}));
    return wzGrid([wzOpt("wzPick('ph',0)",!PW.ph,'🤖',t('phAuto'),t('phAutoP',auto,t('ph_'+auto)))].concat(al.map(v=>wzOpt("wzPick('ph',"+v+")",PW.ph===v,String(v),t('ph_'+v),t('phd_'+v)))),'c1');}},
 {id:'have',ic:'🏋️',title:()=>t('psEquip'),sub:()=>t('psEquipP'),multi:1,body:()=>
    '<div class="chips wrap">'+['gym','db','home','none'].map(k=>'<button class="chip" onclick="pwPreset(\''+k+'\')">'+t('eqp_'+k)+'</button>').join('')+'</div>'+
    wzMany('have',HAVE_KEYS,v=>t('hv_'+v),v=>WZ_IC.have[v],0,'c3')+'<p class="muted sm">'+t('psEquipN')+'</p>'},
 {id:'inj',ic:'🩹',title:()=>t('psInj'),sub:()=>t('psInjP'),multi:1,body:()=>wzMany('inj',Object.keys(INJ),v=>t('inj_'+v),()=>'🩹',0,'c2')+'<p class="muted sm">'+t('psInjN')+'</p>'},
 {id:'cond',ic:'🔄',title:()=>t('psCond'),sub:()=>t('wzCondS'),body:()=>wzOne('cond',[0,1],PW.cond,v=>v?t('psCondB'):t('wzNo'),v=>v?'🔄':'👍','','c1')+(PW.cond?'<div class="card warn"><p>'+t('condNote')+'</p></div>':'')},
 {id:'avoid',ic:'🚫',title:()=>t('psAvoid'),sub:()=>t('psAvoidP'),multi:1,body:()=>wzMany('avoid',AVOID,v=>t('av_'+v),v=>WZ_IC.avoid[v],0,'c2')},
 {id:'fav',ic:'⭐',title:()=>t('psFav'),sub:()=>t('psFavP'),multi:1,show:()=>optOn(PW),body:()=>wzMany('fav',MAINS.filter(k=>exById(k)),v=>exName(v),()=>'⭐',4,'c2')},
 {id:'work',ic:'🪑',title:()=>t('psWork'),sub:()=>t('psWorkP'),body:()=>wzOne('work',['','sit','stand'],PW.work,v=>t('wk_'+(v||'none')),v=>WZ_IC.work[v],()=>'','c1')},
 {id:'sum',ic:'✅',title:()=>t('psSum'),sub:()=>t('wzSumS'),body:()=>wzSummary()}
];
const wzList=()=>WQ.filter(q=>!q.show||q.show());
function wzIdx(l){const i=l.findIndex(q=>q.id===PW.q);return i<0?0:i;}
function wzGo(d){
  const l=wzList(),i=wzIdx(l),j=Math.max(0,Math.min(l.length-1,i+d));
  PW.q=l[j].id;wizDraw();
}
function wzSummary(){
  const row=(ic,txt)=>'<li><span class="wi">'+ic+'</span><span>'+esc(txt)+'</span></li>';
  const gs=[PW.goal].concat(PW.mix?[PW.mix.g]:[]);
  const det=gs.map(g=>g==='military'?t('te_'+PW.test)+(PW.tw?' · '+t('psTwN',PW.tw):''):g==='runner'?t('rc_'+PW.race):(['hybrid','bodybuilding'].indexOf(g)>=0?'':t('em_'+(PW.em0||PW.emph)))).filter(Boolean);
  const auto=optOn(PW)?(PW.ph||optPhase(Object.assign({},PW,{ph:0}))):0;
  return'<ul class="wsum">'+
    row('🎯',goalTxt(PW)+(det.length?' · '+det.join(' · '):''))+
    (PW.focus.length?row('🔍',t('planFocus',PW.focus.map(k=>t('fm_'+k)).join(', '))+' · '+t('psDaysN',PW.ff)):'')+
    (PW.skills.length?row('⚡',t('planSkill',PW.skills.map(k=>t('sk_'+k)).join(', '))):'')+
    (optOn(PW)&&splitOk(PW.split,PW.n)?row('🗂️',t('spl_'+PW.split)):'')+
    row('📆',t('psDaysN',PW.n)+' · '+t('psLenN',PW.len)+(optOn(PW)&&PW.sh?' · '+t('shN',PW.sh):''))+
    row('📈',t('pl_'+lvlEff(PW))+' · '+t('psVol')+': '+t('vol_'+PW.vol))+
    (auto?row('🧭',t('phNow',auto,t('ph_'+auto))):'')+
    row('🏋️',PW.have.length?PW.have.map(k=>t('hv_'+k)).join(', '):t('eqp_none'))+
    (PW.inj.length?row('🩹',t('planInj',PW.inj.map(k=>t('inj_'+k)).join(', '))):'')+
    (PW.avoid.length?row('🚫',t('sumAvoid',PW.avoid.map(k=>t('av_'+k)).join(', '))):'')+
    (optOn(PW)&&PW.fav.length?row('⭐',t('sumFav',PW.fav.map(k=>exName(k)).join(', '))):'')+
    (PW.work?row(WZ_IC.work[PW.work],t('wk_'+PW.work)):'')+'</ul><p class="muted sm">'+t('planNote')+'</p>';
}
function wzDraw(){
  const l=wzList(),i=wzIdx(l),q=l[i];PW.q=q.id;
  const last=i===l.length-1,pct=Math.round(i/(l.length-1)*100);
  const has=q.id==='mix'?(PW.mix?1:0):(Array.isArray(PW[q.id])?PW[q.id].length:1);
  const nextLbl=last?t('planCreate'):((q.multi&&!has&&q.id!=='have')?t('wzSkip'):t('next'))+' ›';
  const fresh=PW._lq!==q.id,st=$('sheet').scrollTop;PW._lq=q.id;
  sheet('<div class="wz"><div class="wz-top"><button class="ico" '+(i>0?'onclick="wzGo(-1)" aria-label="'+esc(t('back'))+'"':'disabled')+'>‹</button>'+
    '<div class="wz-bar"><i style="width:'+pct+'%"></i></div><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="wz-in'+(fresh?' fresh':'')+'"><div class="wz-ic">'+q.ic+'</div><h2 class="wz-q">'+esc(q.title())+'</h2><p class="wz-s">'+esc(q.sub())+'</p>'+
    '<div class="wz-body">'+q.body()+'</div></div>'+
    '<div class="wz-foot"><button class="btn pri wide" onclick="'+(last?'planCreate()':'wzGo(1)')+'">'+nextLbl+'</button></div></div>');
  $('sheet').classList.add('wzs');if(!fresh)$('sheet').scrollTop=st;
}
