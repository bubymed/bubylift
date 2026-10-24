/* Training styles / estilos de entrenamiento.
   Each style = the equipment it uses + the exercises it prefers per muscle (P chest, B back, S shoulders, I biceps, T triceps, Q quads, H hamstrings, G glutes, A abs, W power).
   Cada estilo = el equipo que usa + los ejercicios que prefiere por músculo. Up to two styles can be mixed (25/50/75 %). */
const STY_IDS=['gym','strength','cali','oly','cf','ath','home','mil'];
const STY={
 gym:{img:'bench',have:['barbell','dumbbell','cable','machine','bench','bar'],eq:['barbell','dumbbell','cable','machine'],
  ex:['bench','latpd','legpress']},
 strength:{img:'squat',have:['barbell','dumbbell','bench','bar'],eq:['barbell'],
  ex:['squat','bench','deadlift'],
  x:{Q:['squat','frontsq'],H:['deadlift','rdl'],P:['bench','incbench'],B:['bbrow','deadlift'],S:['ohp','pushpress']}},
 cali:{img:'pullup',have:['bar','bench'],eq:['bodyweight','suspension'],
  ex:['pullup','dip','pushup'],
  x:{Q:['bodysq','slsquat','bulgsplit','lunge'],P:['pushup','dip','hrpushup','pikepush'],B:['pullup','chinup','invrow'],S:['pikepush'],I:['chinup'],T:['dip','benchdip'],A:['plank','hollow','vup'],H:['glutebr','slbridge'],G:['slbridge','frogpump']}},
 oly:{img:'z_clean_and_jerk',have:['barbell','bench','bar'],ids:/clean|snatch|jerk|pushpress|push_press|frontsq|front_squat/,
  ex:['z_clean_and_jerk','z_snatch','frontsq'],
  x:{W:['clean','z_hang_clean','z_power_clean_from_blocks','z_power_snatch','z_hang_snatch','z_clean_and_jerk','z_split_jerk','z_power_jerk','z_snatch','z_clean_pull'],S:['pushpress','z_push_press_behind_the_neck'],Q:['frontsq','z_front_squat_clean_grip','squat'],H:['deadlift','z_clean_deadlift','rdl']}},
 cf:{img:'kbswing',have:['barbell','dumbbell','kettlebell','medball','bar','bench'],eq:['kettlebell','medball'],ids:/thruster|burpee|wallball|kbswing|boxjump|getup|sandlunge|bbj/,
  ex:['thruster','kbswing','pullup'],
  x:{Q:['thruster','dbthruster','gobsq','wallball'],W:['kbswing','mbslam','boxjump','wallball'],H:['kbdl','kbswing'],B:['pullup','dbrow'],S:['pushpress','dbohp'],P:['pushup','dbbench'],A:['situp','hollow']}},
 ath:{img:'boxjump',have:['barbell','dumbbell','medball','sled','bench','bar'],eq:['medball','other'],groups:['power'],
  ex:['boxjump','sledpush','mbslam'],
  x:{W:['boxjump','broadjump','mbslam','skaterjump','squatjump','mbchestthrow'],Q:['bulgsplit','stepup','squat'],H:['rdl','sldl','deadlift'],P:['bench','plyopush'],B:['pullup','bbrow']}},
 home:{img:'bandpull',have:['dumbbell','band','bench'],eq:['dumbbell','band','bodyweight'],
  ex:['gobsq','dbbench','dbrow'],
  x:{Q:['gobsq','lunge','bodysq'],P:['dbbench','pushup','bandpress'],B:['dbrow','bandrow'],S:['dbohp'],H:['dbrdl','glutebr'],G:['glutebr','slbridge']}},
 mil:{img:'farmer',have:['bar','bench','kettlebell','pack','sled'],eq:['other'],ids:/ruck|firecarry|sandlunge|bbj|burpee|pullup|pushup|kbswing|farmer|sledpush|lowcrawl|bearcrawl/,
  ex:['pullup','pushup','ruck'],
  x:{B:['pullup','chinup','invrow'],P:['pushup','hrpushup'],Q:['sandlunge','lunge','bodysq'],A:['plank','hollow'],K:['ruck','run']}}
};
/* does an exercise fit a style? 0 = yes, 1 = no / ¿el ejercicio encaja con el estilo? */
function styFit(k,id){
  const s=STY[k],q=exById(id);if(!s||!q)return 1;
  if(s.ids&&s.ids.test(id))return 0;
  if(s.groups&&s.groups.indexOf(q.g)>=0)return 0;
  return s.eq&&s.eq.indexOf(q.e)>=0?0:1;
}
/* which style "owns" the next pick, so a 75/25 mix gives about three of four picks to the first style
   qué estilo se lleva la siguiente elección: una mezcla 75/25 da tres de cada cuatro al primero */
function styOwner(){
  const P=PREFPROF;if(!P||!P.sty||!P.sty.length)return null;
  if(P.sty.length===1)return P.sty[0];
  const c=P._sc||(P._sc={}),w=[P.stp/100,1-P.stp/100],tot=(c[P.sty[0]]||0)+(c[P.sty[1]]||0);
  let best=0,bd=-9;P.sty.forEach((k,i)=>{const d=w[i]*(tot+1)-(c[k]||0);if(d>bd){bd=d;best=i;}});
  return P.sty[best];
}
function styNote(id,own){
  const P=PREFPROF;if(!P||!P.sty||P.sty.length<2||!id)return;
  const c=P._sc||(P._sc={});
  const k=styFit(own,id)===0?own:P.sty.find(x=>x!==own&&styFit(x,id)===0);
  if(k)c[k]=(c[k]||0)+1;
}
function styExtras(own,mu){return own&&STY[own]&&STY[own].x&&STY[own].x[mu]?STY[own].x[mu]:[];}
function styHave(sty){const u=[];(sty||[]).forEach(k=>{if(STY[k])STY[k].have.forEach(h=>{if(u.indexOf(h)<0)u.push(h);});});return u;}
function styTxt(p){
  if(!p.sty||!p.sty.length)return'';
  return p.sty.length===1?t('sty_'+p.sty[0]):(p.stp+'% '+t('sty_'+p.sty[0])+' + '+(100-p.stp)+'% '+t('sty_'+p.sty[1]));
}
