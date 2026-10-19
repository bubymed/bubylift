'use strict';
/* Guided weekly plan: smart builder (goal, focus, schedule, equipment, injuries), substitutions, swipe gestures,
   technique guide, weight suggestions and check-ins. All plans are original Bubylift templates.
   Plan semanal guiado: armador inteligente (meta, enfoque, horario, equipo, lesiones), sustituciones, gestos de deslizar,
   guía de técnica, sugerencias de peso y evaluaciones. Todos los planes son plantillas originales de Bubylift.
   General guidance only — not medical advice. / Solo orientación general — no es consejo médico. */

/* ---------- exercise metadata helpers ---------- */
const _MC={};
function meta(eid){
  if(_MC[eid]!==undefined)return _MC[eid];
  const s=EXM[eid];let r=null;
  if(s){r={mu:s[0],lv:+s[1],st:{}};s.slice(2).replace(/([kbsewhan])(\d)/g,function(m,a,b){r.st[a]=+b;return m;});}
  _MC[eid]=r;return r;
}
const G2MU={chest:'P',back:'B',shoulders:'S',biceps:'I',triceps:'T',legs:'Q',glutes:'G',core:'A',full:'F',balance:'Z',power:'W',cardio:'K'};
function muOf(eid){const m=meta(eid);if(m)return m.mu;const e=exById(eid);return e?(G2MU[e.g]||'F'):'F';}
function injLetters(inj){return(inj||[]).map(k=>INJ[k]||'').join('');}
/* worst stress level (0/1/2) of an exercise for the given injury letters / peor nivel de estrés (0/1/2) */
function stressLvl(eid,L){const m=meta(eid);if(!m||!L)return 0;let r=0;for(const c of L){if(m.st[c]>r)r=m.st[c];}return r;}
function stressJoints(eid,L,min){const m=meta(eid);let r='';if(!m||!L)return r;for(const c of L){if((m.st[c]||0)>=min)r+=c;}return r;}
function avail(eid,have){
  const e=exById(eid);if(!e)return false;
  if(e.custom)return true;
  const q=e.e,nd=NEED[eid];
  return(q==='bodyweight'||q==='other'||have.indexOf(q)>=0)&&(!nd||have.indexOf(nd)>=0);
}
function profNow(){return DATA.plan&&DATA.plan.prof?DATA.plan.prof:null;}
function curHave(){const p=profNow();return p?p.have:(Array.isArray(SET.have)?SET.have:HAVE_KEYS);}
function curInjL(){const p=profNow();return p?injLetters(p.inj):'';}
/* badge shown in lists for the person's injuries / aviso en listas según las lesiones */
function injBadge(eid){
  const L=curInjL();if(!L)return'';
  const l=stressLvl(eid,L);if(!l)return'';
  return' · ⚠ '+(l>=2?t('notRec'):t('caution'));
}
function jointNames(L){return L.split('').map(c=>t('j_'+c)).join(', ');}

/* ---------- builder data ---------- */
const MUS_LOWER='QHGC',MUS_UPPER='PBSIT';
const POOL={
 Q:{m:['squat','legpress','gobsq','hacksq','frontsq','boxsq','bodysq','ballsq','bwstepup'],a:['bulgsplit','stepup','revlunge','legext','latstep','splitsq','lunge','bwlunge','bwstepup','sledpush','slsquat','bodysq','ballsq']},
 H:{m:['rdl','dbrdl','deadlift','hexdl','kbdl','bandrdl','sldl','goodmorn','legcurl','legcurlball'],a:['legcurl','seatlc','sldl','legcurlball','bandrdl','rdl','goodmorn']},
 G:{m:['hipthrust','sumo','glutebr','slbridge','bandbridge','kbdl'],a:['cablekick','bandwalk','frogpump','slbridge','ballbridge','donkeykick','abduct','bandkick','firehydrant','clamshell','glutebr','bandbridge','hipthrust']},
 C:{m:['calf','seatcalf','calfdb'],a:['calf','seatcalf','calfdb']},
 P:{m:['bench','dbbench','chestpress','incbench','dbinc','pushup','incpush','kneepush','bandpress','cablepress'],a:['dbinc','incbench','cablefly','dbfly','pecdeck','pushup','cablepress','declbench','hrpushup','incpush','ballpress','bandpress','susppush','dip','kneepush']},
 B:{m:['latpd','cablerow','bbrow','machrow','dbrow','pullup','assistpu','invrow','suprow','bandrow'],a:['dbrow','cablerow','machrow','straightpd','closepd','facepull','tbar','bentrow','bandrow','suprow','supermanback','hyperext','assistpu','latpd','shrug']},
 S:{m:['dbohp','machsp','ohp','seatpress','arnold','pikepush','bandohp'],a:['latraise','cablelat','reardelt','revfly','scaption','frontraise','bandlat','bandpull','facepull','cubanrot','bandextrot','uprow']},
 I:{m:['dbcurl','hammer','cablecurl','bbcurl','ezcurl','preacher','inccurl','concurl','bandcurl','seatdbcurl'],a:['hammer','cablecurl','inccurl','concurl','dbcurl','preacher','bandcurl','ezcurl','seatdbcurl','bbcurl']},
 T:{m:['pushdown','ropepd','ohext','cgbp','cableohext','bandpd','kickback','diamondpu','benchdip','skull'],a:['ropepd','ohext','kickback','cableohext','bandpd','pushdown','benchdip','diamondpu','skull','lyingext']},
 D:{m:['sdcdrill','sleddrag','sledpush','farmer','kbswing','bearcrawl','burpee'],a:['farmer','coneshuffle','bearcrawl','lowcrawl','burpee','mbslam','suitcase','shuttle','sprint']},
 W:{m:['squatjump','powerstep','skaterjump','boxjump','mbslam','kbswing','broadjump','lungejump','mbchestthrow','kbpower','tuckjump','plyopush'],a:['powerstep','skaterjump','squatjump','mbslam','mbchestthrow','kbswing','boxjump','broadjump','lungejump']},
 V:{m:['ladder','coneshuffle','skaterjump','highknees','buttkick','shuttle','sprint'],a:['coneshuffle','ladder','highknees','buttkick','skaterjump','shuttle','sprint']},
 Z:{m:['balsl','balslreach','balsqtd','balstepup','ballunge','balwind','baltoe','balfoam','baltandem'],a:['balslreach','balsl','balsqtd','balfoam','baltoe','balwind','baltandem','balstepup','ballunge']},
 K:{m:['rower','statbike','bike','elliptical','jumprope','treadmill','run','walk'],a:['statbike','bike','rower','elliptical','walk','run','treadmill']},
 A:{m:['plank','deadbug','birddog','pallof','cablecr','sideplank','revcrunch','bicycle','crunch','hollow','mountain'],a:['deadbug','birddog','pallof','sideplank','plank','proneiso','suitcase','cablecr','revcrunch','hollow','bicycle','crunch','mountain','kneeup','russian']}
};
const DAYSPEC={
 full:[['Q','m'],['P','m'],['B','m'],['S','a'],['H','a'],['A','c']],
 fullL:[['G','m'],['Q','m'],['P','a'],['B','a'],['H','a'],['A','c']],
 up:[['P','m'],['B','m'],['S','a'],['B','a'],['I','a'],['T','a']],
 upLite:[['B','m'],['P','m'],['S','a'],['I','a'],['T','a'],['A','c']],
 push:[['P','m'],['S','m'],['P','a'],['S','a'],['T','a'],['T','a']],
 pull:[['B','m'],['B','a'],['B','a'],['S','a'],['I','a'],['I','a']],
 arms:[['S','m'],['S','a'],['I','a'],['T','a'],['I','a'],['T','a']],
 lowQ:[['Q','m'],['H','a'],['G','a'],['Q','a'],['C','a'],['A','c']],
 lowG:[['G','m'],['H','m'],['Q','a'],['G','a'],['G','a'],['A','c']],
 // hybrid / military: R = run work (i intervals · e easy · t tempo) · D = work capacity (drag, carry, sprint)
 hyStr:[['H','m'],['P','m'],['B','m'],['Q','a'],['A','c']],
 hyStrL:[['H','m'],['Q','m'],['G','a'],['C','a'],['A','c']],
 hyStrU:[['P','m'],['B','m'],['S','a'],['B','a'],['T','a'],['A','c']],
 hyRunI:[['R','i'],['G','a'],['A','c']],
 hyRunE:[['R','e'],['C','a'],['A','c']],
 hyCap:[['D','m'],['D','a'],['R','e'],['A','c']],
 // runner: R = run work (i intervals · e easy · t tempo · l long) + strength that supports running / corredor: carrera + fuerza que la apoya
 runT:[['R','t'],['G','a'],['A','c']],
 runL:[['R','l'],['C','a'],['A','c']],
 runS:[['Q','m'],['H','m'],['G','a'],['C','a'],['A','c']],
 // bodybuilding: more exercises and sets per muscle / fisicoculturismo: más ejercicios y series por músculo
 bbFull:[['Q','m'],['P','m'],['B','m'],['H','a'],['S','a'],['I','a'],['T','a']],
 bbUp:[['P','m'],['B','m'],['S','m'],['P','a'],['B','a'],['S','a'],['I','a'],['T','a']],
 bbLow:[['Q','m'],['H','m'],['G','a'],['Q','a'],['H','a'],['C','a'],['A','c']],
 bbLow2:[['H','m'],['Q','m'],['G','m'],['Q','a'],['H','a'],['C','a'],['A','c']],
 bbPush:[['P','m'],['S','m'],['P','a'],['S','a'],['P','a'],['T','a'],['T','a']],
 bbPull:[['B','m'],['B','m'],['B','a'],['S','a'],['I','a'],['I','a'],['A','c']]
};
const SPLITS={
 bal:{2:['full','full'],3:['full','full','full'],4:['up','lowQ','up','lowG'],5:['push','pull','lowQ','up','lowG']},
 low:{2:['lowG','fullL'],3:['lowG','upLite','lowQ'],4:['lowG','upLite','lowQ','fullL'],5:['lowG','upLite','lowQ','lowG','upLite']},
 up:{2:['full','up'],3:['push','pull','lowQ'],4:['push','pull','lowQ','arms'],5:['push','pull','lowQ','arms','up']},
 run:{2:['hyRunI','runL'],3:['hyRunI','runS','runL'],4:['hyRunE','hyRunI','runS','runL'],5:['hyRunE','hyRunI','runS','runT','runL']},
 bb:{2:['bbFull','bbFull'],3:['bbFull','bbFull','bbFull'],4:['bbUp','bbLow','bbUp','bbLow2'],5:['bbPush','bbPull','bbLow','bbUp','bbLow2']},
 hy:{2:['hyStr','hyRunI'],3:['hyStr','hyRunI','hyCap'],4:['hyStrU','hyRunI','hyStrL','hyCap'],5:['hyStrU','hyRunI','hyStrL','hyCap','hyRunE']}
};
const FOCUS_MU={glutes:['G'],quads:['Q'],hams:['H'],calves:['C'],chest:['P'],back:['B'],shoulders:['S'],arms:['I','T'],abs:['A']};
const PGOALS=['muscle','bodybuilding','strength','fat','general','hybrid','military','runner'],PLVLS=['new','some','adv'],PEMPH=['bal','low','up'],ALLEMPH=['bal','low','up','hy','run','bb'],RACES=['5k','10k','half','full','fit'],RACEF={'5k':0.8,'10k':1,half:1.3,full:1.6,fit:0.8},PSEX=['f','m','x'],TESTS=['aft','usmc','gen'],TW=[0,4,8,12,16];
/* short coaching notes shown under an exercise / notas cortas bajo un ejercicio */
const SKILLS=['strength','power','speed','endurance','balance'];
const isHy=g=>g==='hybrid'||g==='military'; // hybrid athlete (no test) and military test prep share the engine / híbrido (sin prueba) y militar comparten el motor
const NT_KEYS=['ntIntR','ntLong','ntInt','ntEasy','ntTempo','ntSdc','ntMdl','ntHrp','ntPlk','ntSim'];
const NTEID={hexdl:'ntMdl',hrpushup:'ntHrp',plank:'ntPlk',sdcdrill:'ntSdc',sleddrag:'ntSdc'};
const PDAYKEYS=Object.keys(DAYSPEC).concat(['fullA','fullB','fullC','up1','up2','low1','low2']); // old keys stay valid / las claves viejas siguen válidas
const LENMAX={30:4,45:5,60:6,75:7};

function planScheme(goal,lvl,role,skills){
  const N=lvl==='new',A=lvl==='adv';
  if(role==='c')return{sets:3,lo:8,hi:12};
  if(role==='p')return{sets:3,lo:3,hi:6};
  if(skills&&skills.indexOf('strength')>=0&&role==='m'&&!isHy(goal)&&goal!=='strength'&&goal!=='runner')goal='strength';
  if(goal==='runner')return role==='m'?(N?{sets:3,lo:8,hi:10}:{sets:3,lo:5,hi:8}):{sets:2,lo:10,hi:12};
  if(goal==='bodybuilding')return role==='m'?(N?{sets:3,lo:8,hi:12}:{sets:4,lo:6,hi:10}):(N?{sets:3,lo:10,hi:15}:{sets:3,lo:10,hi:15});
  if(isHy(goal))return role==='m'?(N?{sets:3,lo:5,hi:8}:{sets:4,lo:3,hi:5}):(N?{sets:2,lo:8,hi:12}:{sets:3,lo:8,hi:12});
  const b=goal==='strength'?(role==='m'?(N?{sets:3,lo:6,hi:8}:{sets:4,lo:4,hi:6}):(N?{sets:2,lo:10,hi:12}:{sets:3,lo:8,hi:10}))
    :goal==='muscle'?(role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:4,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:10,hi:15}))
    :(role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:3,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:12,hi:15}));
  if(A&&role==='m')b.sets=Math.min(5,b.sets+1);
  return b;
}
function planItem(eid,role,prof,extra){
  const m=exMode(eid),sc=planScheme(prof.goal,prof.lvl,role,prof.have.some(k=>/^(barbell|dumbbell|machine|cable|kettlebell)$/.test(k))?prof.skills:[]),L=injLetters(prof.inj);
  const cn=stressJoints(eid,L,1),hy=isHy(prof.goal),nt=hy&&NTEID[eid]&&(prof.test!=='gen'||eid==='sdcdrill'||eid==='sleddrag')?NTEID[eid]:undefined;
  let it;
  if(role==='e')it={eid:eid,sets:1,lo:10,hi:15,u:'m',r:role,cn:cn};
  else if(m==='t'&&role==='p')it={eid:eid,sets:4,lo:0.5,hi:1,u:'m',r:role,cn:cn};
  else if(m==='t')it=(hy&&prof.test!=='gen'&&eid==='plank')?{eid:eid,sets:3,lo:1,hi:2,u:'m',r:role,cn:cn}:(hy&&(eid==='sdcdrill'||eid==='sleddrag'||eid==='firecarry'||eid==='lowcrawl')?{eid:eid,sets:4,lo:0.5,hi:1,u:'m',r:role,cn:cn}:{eid:eid,sets:3,lo:0.5,hi:1,u:'m',r:role,cn:cn});
  else if(hy&&m==='bw'&&role==='m'){const pu=/pullup|chinup|assistpu/.test(eid);it={eid:eid,sets:4,lo:pu?3:8,hi:pu?8:15,u:'r',r:role,cn:cn};}
  else{
    const en=prof.skills&&prof.skills.indexOf('endurance')>=0&&role==='a';
    it={eid:eid,sets:Math.min(6,sc.sets+(extra?1:0)),lo:sc.lo+(en?4:0),hi:sc.hi+(en?5:0),u:'r',r:role,cn:cn};
  }
  if(nt)it.nt=nt;
  return it;
}
function runItem(kind,prof){
  const N=prof.lvl==='new',cn=stressJoints('run',injLetters(prof.inj),1),rn=prof.goal==='runner';
  const rf=Math.min(RACEF[prof.race]||1,N?1.2:9),r5=v=>Math.max(15,Math.round(v/5)*5);
  if(kind==='i')return{eid:'run',sets:N?4:6,lo:1.5,hi:2,u:'m',r:'m',cn:cn,nt:rn?'ntIntR':'ntInt'};
  if(kind==='t')return{eid:'run',sets:1,lo:15,hi:25,u:'m',r:'m',cn:cn,nt:'ntTempo'};
  if(kind==='l')return{eid:'run',sets:1,lo:r5((N?25:40)*rf),hi:r5((N?40:70)*rf),u:'m',r:'m',cn:cn,nt:'ntLong'};
  return{eid:'run',sets:1,lo:N?15:25,hi:N?25:45,u:'m',r:'a',cn:cn,nt:'ntEasy'};
}
/* exercises that mirror each test's events come first / los ejercicios que imitan los eventos de cada prueba van primero */
const HYFIRST={
 aft:{Pm:['hrpushup'],Hm:['hexdl','kbdl','dbrdl'],Am:['plank'],Ac:['plank'],Dm:['sdcdrill'],Da:['sleddrag','farmer']},
 usmc:{Bm:['pullup','chinup','assistpu'],Pm:['pushup','hrpushup'],Am:['plank'],Ac:['plank'],Dm:['firecarry','sleddrag'],Da:['lowcrawl','farmer']},
 gen:{}
};
/* pick the best available exercise for a muscle slot / elige el mejor ejercicio disponible para un hueco */
function pickFor(mu,role,ctx){
  const P=POOL[mu];if(!P)return null;
  const first=(ctx.hy&&HYFIRST[ctx.test]&&HYFIRST[ctx.test][mu+role])||[];
  const list=first.concat(role==='m'?P.m.concat(P.a):P.a.concat(P.m)).filter((x,i,a)=>a.indexOf(x)===i);
  const c=list.filter(id=>{const m=meta(id);return exById(id)&&m&&m.lv<=ctx.maxLv&&avail(id,ctx.have)&&!ctx.day[id]&&stressLvl(id,ctx.L)<=(role==='p'?0:1);});
  c.sort((a,b)=>(stressLvl(a,ctx.L)-stressLvl(b,ctx.L))||((ctx.used[a]||0)-(ctx.used[b]||0)));
  return c[0]||null;
}
function normProf(p){
  const o=Object.assign({sex:'x',goal:'muscle',emph:'bal',focus:[],n:3,len:60,lvl:'new',have:HAVE_PRESETS.gym.slice(),inj:[],cond:0},p||{});
  if(PGOALS.indexOf(o.goal)<0)o.goal='muscle';if(ALLEMPH.indexOf(o.emph)<0)o.emph='bal';if(PLVLS.indexOf(o.lvl)<0)o.lvl='new';if(PSEX.indexOf(o.sex)<0)o.sex='x';
  o.n=Math.max(2,Math.min(5,Math.round(o.n)||3));if(!LENMAX[o.len])o.len=60;
  o.focus=(o.focus||[]).filter(k=>FOCUS_MU[k]).slice(0,3);o.have=(o.have||[]).filter(k=>HAVE_KEYS.indexOf(k)>=0);o.inj=(o.inj||[]).filter(k=>INJ[k]);o.cond=o.cond?1:0;
  o.ff=Math.max(1,Math.min(4,Math.round(o.ff)||2));o.skills=(o.skills||[]).filter((k,i,a)=>SKILLS.indexOf(k)>=0&&a.indexOf(k)===i).slice(0,2);
  if(TESTS.indexOf(o.test)<0)o.test='gen';
  if(o.goal==='hybrid'&&o.test!=='gen')o.goal='military'; // old plans: hybrid with a test is now military / planes viejos: híbrido con prueba ahora es militar
  if(o.goal==='hybrid')o.test='gen';
  if(RACES.indexOf(o.race)<0)o.race='fit';
  o.td=(typeof o.td==='number'&&isFinite(o.td)&&o.td>0&&o.td<4e12)?o.td:0;
  // mix: a second goal with a share for the main goal (50 or 70 percent) / mezcla: una segunda meta; la principal lleva 50 o 70 %
  const mx=o.mix;o.mix=null;
  if(mx&&typeof mx==='object'&&PGOALS.indexOf(mx.g)>=0&&mx.g!==o.goal&&!(isHy(mx.g)&&isHy(o.goal)))o.mix={g:mx.g,p:mx.p===70?70:50};
  if(o.mix&&o.goal==='hybrid')o.test='gen';
  if(PEMPH.indexOf(o.emph)>=0)o.em0=o.emph;else if(PEMPH.indexOf(o.em0)<0)o.em0='bal'; // the person's own balance / low / up choice / elección propia
  if(isHy(o.goal))o.emph='hy';else if(o.goal==='runner')o.emph='run';else if(o.goal==='bodybuilding')o.emph='bb';else if(['hy','run','bb'].indexOf(o.emph)>=0)o.emph='bal';
  if(o.goal!=='military'&&!(o.mix&&o.mix.g==='military'))o.td=0;
  return o;
}
const emphFor=(g,o)=>isHy(g)?'hy':g==='runner'?'run':g==='bodybuilding'?'bb':(PEMPH.indexOf(o.em0)>=0?o.em0:'bal');
const goalsOf=pr=>[pr.goal].concat(pr.mix?[pr.mix.g]:[]);
function goalTxt(pr){return pr.mix?pr.mix.p+'% '+t('pg_'+pr.goal)+' + '+(100-pr.mix.p)+'% '+t('pg_'+pr.mix.g):t('pg_'+pr.goal);}
/* which goal each training day follows / qué meta sigue cada día */
function dayPlan(prof){
  const n=prof.n,mix=prof.mix;
  if(!mix)return{days:SPLITS[prof.emph][n].slice(),goals:days0(prof.goal,n)};
  const nA=prof.mix.p===70?Math.max(1,Math.min(n-1,Math.round(n*0.7-0.01))):Math.ceil(n/2),nB=n-nA;
  const part=(g,k)=>{const sp=SPLITS[emphFor(g,prof)];return(k>=2?sp[k]:sp[2].slice(0,1)).slice();};
  const A=part(prof.goal,nA),B=part(mix.g,nB),isB={};
  for(let j=0;j<nB;j++)isB[Math.floor((j+0.5)*n/nB)]=1;
  const days=[],goals=[];let a=0,b=0;
  for(let i=0;i<n;i++){if(isB[i]){days.push(B[b++]);goals.push(mix.g);}else{days.push(A[a++]);goals.push(prof.goal);}}
  return{days:days,goals:goals};
}
function days0(g,n){const a=[];for(let i=0;i<n;i++)a.push(g);return a;}
function genPlan(prof0){
  const prof=normProf(prof0);
  const eff=Object.assign({},prof);
  if(prof.cond){eff.lvl='new';if(['strength','hybrid','military','bodybuilding'].indexOf(eff.goal)>=0)eff.goal='general';} // medical condition: keep it gentle / condición médica: algo suave
  const L=injLetters(prof.inj),maxLv=eff.lvl==='new'?1:2,have=prof.have;
  const dp=dayPlan(prof),days=dp.days,dgoal=dp.goals;
  const effOf=di=>{ // settings for this day's own goal / ajustes según la meta de cada día
    const g=dgoal[di],e=Object.assign({},eff,{goal:g,test:g==='hybrid'?'gen':prof.test});
    if(prof.cond&&['strength','hybrid','military','bodybuilding'].indexOf(g)>=0)e.goal='general';
    return e;
  };
  const fm=[];prof.focus.forEach(k=>FOCUS_MU[k].forEach(m=>{if(fm.indexOf(m)<0)fm.push(m);}));
  let specs=days.map(k=>DAYSPEC[k].map(s=>[s[0],s[1],0]));
  // focus: one extra slot (+1 set) on days that already train it / enfoque: un hueco extra en los días que ya lo trabajan
  specs.forEach(sp=>fm.forEach(m=>{
    let last=-1;sp.forEach((s,i)=>{if(s[0]===m&&s[1]!=='c')last=i;});
    if(last>=0){sp[last][2]=1;sp.splice(last+1,0,[m,'a',1]);}
  }));
  // focus muscles: train them as many days per week as requested (halves first, then any day) / músculos de enfoque: tantos días por semana como se pidió
  const want=Math.min(prof.ff,prof.n);
  if(prof.n>=2)fm.forEach(m=>{
    const has=()=>specs.filter(sp=>sp.some(s=>s[0]===m)).length;
    const pen=di=>{const k=days[di];return(k==='pull'&&'PT'.indexOf(m)>=0)||(k==='push'&&'BI'.indexOf(m)>=0)?1:0;};
    const order=specs.map((sp,i)=>i).sort((a,b)=>pen(a)-pen(b));
    const lowerM=MUS_LOWER.indexOf(m)>=0,upperM=MUS_UPPER.indexOf(m)>=0;
    const put=(di,strict)=>{
      const sp=specs[di];
      if(has()>=want||sp.some(s=>s[0]===m))return;
      const hasLower=sp.some(s=>MUS_LOWER.indexOf(s[0])>=0),hasUpper=sp.some(s=>MUS_UPPER.indexOf(s[0])>=0);
      if(!strict||(m==='A')||(lowerM&&hasLower)||(upperM&&hasUpper)){let ci=sp.length;for(let i=sp.length-1;i>=0;i--){if(sp[i][1]==='c'){ci=i;break;}}sp.splice(ci,0,[m,'a',1]);}
    };
    order.forEach(di=>put(di,true));
    order.forEach(di=>put(di,false));
  });
  // physical skills: power, speed, balance, endurance add dedicated slots to a couple of days / habilidades: potencia, velocidad, equilibrio y resistencia agregan huecos
  const addSk=(mu,role,count,pred)=>{
    let n=0;
    specs.forEach(sp=>{
      if(n>=count||!pred(sp))return;
      let ci=sp.length;for(let i=sp.length-1;i>=0;i--){if(sp[i][1]==='c'){ci=i;break;}}
      sp.splice(role==='p'&&mu!=='Z'?0:ci,0,[mu,role,1]);n++;
    });
  };
  const lowerDay=sp=>sp.some(s=>'QHG'.indexOf(s[0])>=0)&&!sp.some(s=>s[0]==='R');
  if(prof.skills.indexOf('power')>=0)addSk('W','p',2,lowerDay);
  if(prof.skills.indexOf('speed')>=0)addSk('V','p',2,lowerDay);
  if(prof.skills.indexOf('balance')>=0)addSk('Z','a',2,sp=>!sp.some(s=>s[0]==='R'));
  if(prof.skills.indexOf('endurance')>=0)addSk('K','e',2,sp=>!sp.some(s=>s[0]==='R'||s[0]==='K'));
  const maxEx=LENMAX[prof.len];
  const DROP='ITCSDBPHGQ'; // least important first / menos importante primero
  specs.forEach(sp=>{
    while(sp.length>maxEx){
      let bi=-1,br=99;
      sp.forEach((s,i)=>{if(s[1]==='a'&&!s[2]){const r=DROP.indexOf(s[0]);if(r<=br){br=r;bi=i;}}});
      if(bi<0)sp.forEach((s,i)=>{if(s[1]==='c')bi=i;});
      if(bi<0)sp.forEach((s,i)=>{if(s[1]==='a'){const r=DROP.indexOf(s[0]);if(r<=br){br=r;bi=i;}}});
      if(bi<0)for(let i=sp.length-1;i>=0;i--){if(sp[i][1]!=='m'){bi=i;break;}}
      if(bi<0)break;
      sp.splice(bi,1);
    }
  });
  const used={},ds=days.map((k,di)=>{
    const ed=effOf(di),ctx={have:have,L:L,maxLv:maxLv,used:used,day:{},hy:isHy(dgoal[di]),test:ed.test},ex=[];
    specs[di].forEach(s=>{
      if(s[0]==='R'){ex.push(runItem(s[1],ed));return;}
      const id=pickFor(s[0],s[1],ctx);if(!id)return;
      ctx.day[id]=1;used[id]=(used[id]||0)+1;ex.push(planItem(id,s[1],ed,s[2]));
    });
    // too few options for this equipment/injuries: fill with other safe exercises of the same half of the body / pocos ejercicios: completa con otros seguros de la misma mitad del cuerpo
    if(ex.length<3){
      const upperDay=specs[di].some(s=>MUS_UPPER.indexOf(s[0])>=0)&&!specs[di].some(s=>MUS_LOWER.indexOf(s[0])>=0);
      const order=upperDay?['P','B','S','A','T','I']:(specs[di].some(s=>MUS_UPPER.indexOf(s[0])>=0)?['Q','P','B','H','G','A','S']:['Q','H','G','C','A']);
      for(let r=0;r<3&&ex.length<3;r++)order.forEach(mu=>{
        if(ex.length>=Math.min(3,maxEx))return;
        const id=pickFor(mu,'a',ctx);if(!id)return;
        ctx.day[id]=1;used[id]=(used[id]||0)+1;ex.push(planItem(id,mu==='A'?'c':'a',ed,0));
      });
    }
    if(ed.goal==='fat'){const cid=avail('treadmill',have)?'treadmill':'walk';ex.push({eid:cid,sets:1,lo:15,hi:20,u:'m',r:'a',cn:''});}
    return prof.mix?{k:k,g:dgoal[di],ex:ex}:{k:k,ex:ex};
  });
  return{goal:prof.goal,n:prof.n,lvl:prof.lvl,t0:Date.now(),ct:0,cur:0,ds:ds,wd:defaultWd(ds),wu:0,checks:[],prof:prof};
}
function cleanPlan(p){
  if(!p||typeof p!=='object'||PGOALS.indexOf(p.goal)<0||PLVLS.indexOf(p.lvl)<0||!(p.n>=2&&p.n<=5)||typeof p.t0!=='number'||!Array.isArray(p.ds)||p.ds.length!==p.n)return null;
  const ds=[];
  for(const d of p.ds){
    if(!d||PDAYKEYS.indexOf(d.k)<0||!Array.isArray(d.ex))return null;
    const ex=d.ex.filter(e=>e&&ID_RE.test(String(e.eid))).slice(0,12).map(e=>({eid:String(e.eid),sets:Math.max(1,Math.min(8,Math.round(cn(e.sets)||1))),lo:cn(e.lo)||0,hi:cn(e.hi)||0,u:e.u==='m'?'m':'r',r:['m','a','c','p','e'].indexOf(e.r)>=0?e.r:'a',cn:String(e.cn||'').replace(/[^kbsewhan]/g,'').slice(0,8),nt:NT_KEYS.indexOf(e.nt)>=0?e.nt:undefined}));
    if(!ex.length)return null;ds.push(PGOALS.indexOf(d.g)>=0?{k:d.k,g:d.g,ex:ex}:{k:d.k,ex:ex});
  }
  const checks=(Array.isArray(p.checks)?p.checks:[]).slice(-40).filter(c=>c&&typeof c.t==='number').map(c=>({t:c.t,bw:cn(c.bw)||null,feel:['easy','right','hard'].indexOf(c.feel)>=0?c.feel:'right'}));
  const prof=normProf(p.prof&&typeof p.prof==='object'?Object.assign({},p.prof,{n:p.n,goal:p.goal,lvl:p.lvl}):{n:p.n,goal:p.goal,lvl:p.lvl,have:HAVE_KEYS.slice()});
  const o={goal:prof.goal,n:p.n,lvl:p.lvl,t0:p.t0,ct:cn(p.ct)||0,ds:ds,checks:checks,prof:prof};
  if(Number.isInteger(p.cur)&&p.cur>=0&&p.cur<p.n)o.cur=p.cur;
  const okWd=Array.isArray(p.wd)&&p.wd.length===p.n&&p.wd.every((w,i)=>Number.isInteger(w)&&w>=0&&w<=6&&p.wd.indexOf(w)===i);
  o.wd=okWd?p.wd.slice():defaultWd(ds);o.wu=okWd&&p.wu?1:0;
  return o;
}

/* ---------- targets and suggestions ---------- */
function tgText(e){
  const rg=e.lo===e.hi?fmtNum(e.hi,1):fmtNum(e.lo,1)+'–'+fmtNum(e.hi,1);
  return e.sets+' × '+rg+(e.u==='m'?' '+t('minU'):'');
}
function wInc(){return imp()?5/KG_LB:2.5;}
function wRound(kg){const s=wInc();return Math.max(s,Math.round(kg/s)*s);}
/* progressive overload from the last session / sobrecarga progresiva según la última sesión */
function sugg(eid,tg){
  if(!tg||tg.u==='m')return null;
  const m=exMode(eid),le=lastEx(eid);
  if(m==='bw'){
    if(!le)return{key:'sgFirstBw'};
    const ok=le.x.sets.length&&le.x.sets.every(s=>(s.r||0)>=tg.hi);
    return ok?{key:'sgUpBw'}:{key:'sgHold2'};
  }
  if(m!=='wr')return null;
  if(!le)return{key:'sgFirst'};
  const ss=le.x.sets.filter(s=>s.w!=null&&s.r);
  if(!ss.length)return{key:'sgFirst'};
  const W=Math.max.apply(null,ss.map(s=>s.w));
  if(ss.every(s=>s.r>=tg.hi))return{key:'sgUp',w:wRound(W+wInc())};
  if(ss.some(s=>s.r<tg.lo)){
    const p2=lastEx(eid,le.wk.t),low2=p2&&p2.x.sets.some(s=>s.w!=null&&s.r&&s.r<tg.lo);
    return low2?{key:'sgDown',w:wRound(W*0.9)}:{key:'sgHold',w:W};
  }
  return{key:'sgHold2',w:W};
}
function suggLine(x){
  const L=curInjL(),bd=injBadge(x.eid);
  let h='';
  if(x.tg){
    const s=sugg(x.eid,x.tg);
    h='<div class="goalln">'+((x.tg.lo||x.tg.hi)?'<b>'+t('target')+':</b> '+esc(tgText({sets:x.sets.length,lo:x.tg.lo,hi:x.tg.hi,u:x.tg.u})):'');
    if(s)h+='<br><span class="sg">'+esc(t(s.key,s.w!=null?wShow(s.w)+' '+wUnit():''))+'</span>';
    if(x.tg.nt&&NT_KEYS.indexOf(x.tg.nt)>=0)h+='<br><span class="muted">'+esc(t(x.tg.nt))+'</span>';
    h+='</div>';
  }
  if(L&&stressLvl(x.eid,L))h+='<div class="goalln warnln">⚠ '+esc(t(stressLvl(x.eid,L)>=2?'injNo':'injCare',jointNames(stressJoints(x.eid,L,1))))+'</div>';
  return h;
}

/* ---------- progress through the plan ---------- */
function planDone(){const p=DATA.plan;return p?DATA.workouts.filter(w=>w.pl!=null&&w.t>=p.t0):[];}
function weekStart(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}
function planNext(){const p=DATA.plan;if(!p)return 0;
  if(p.wu&&Array.isArray(p.wd)){const i=p.wd.indexOf(new Date().getDay());if(i>=0&&!planDone().some(w=>w.pl===i&&dInput(w.t)===dInput(Date.now())))return i;} // your own schedule decides today / tu horario decide hoy
  return Number.isInteger(p.cur)?p.cur%p.n:planDone().length%p.n;}
function planWeek(){const ws=weekStart();return planDone().filter(w=>w.t>=ws).length;}
function checkDue(){
  const p=DATA.plan;if(!p)return false;
  const since=planDone().filter(w=>w.t>(p.ct||p.t0));
  return since.length>=p.n*4||(Date.now()-(p.ct||p.t0)>=28*864e5&&since.length>=2);
}
function dayName(i){
  const p=DATA.plan,d=p.ds[i];let same=0,idx=0;
  p.ds.forEach((x,j)=>{if(x.k===d.k){same++;if(j<i)idx++;}});
  return t('planDay',i+1)+' · '+t('pd_'+d.k)+(same>1?' '+String.fromCharCode(65+idx):'');
}
function planExList(d,di,withEdit){
  return d.ex.map((e,ei)=>'<div class="plex'+(withEdit?' tap':'')+'"'+(withEdit?' role="button" tabindex="0" onclick="planEdit('+di+','+ei+')"':'')+'><span><b>'+esc(exName(e.eid))+'</b><small>'+esc(tgText(e))+'</small>'+
    (e.nt?'<small>'+esc(t(e.nt))+'</small>':'')+(e.cn?'<small class="warnt">⚠ '+esc(t('injCare',jointNames(e.cn)))+'</small>':'')+'</span>'+
    (withEdit?'<em class="go">'+t('edit')+' ›</em>':'')+'</div>').join('');
}
/* short list for the home card: names only / lista corta para la tarjeta de inicio */
function planBrief(d){
  const n=d.ex.length,nm=d.ex.slice(0,3).map(e=>exName(e.eid));
  return'<p class="brief"><b>'+t('planExN',n)+'</b></p><p class="muted">'+esc(nm.join(' · '))+(n>3?' · '+t('planMoreN',n-3):'')+'</p>';
}

/* ---------- swipe gestures / gestos de deslizar ---------- */
(function(){
  let sx=0,sy=0,el=null,dx=0,lock=false;
  document.addEventListener('touchstart',function(ev){
    const t0=ev.target.closest&&ev.target.closest('.swp-in');
    if(!t0||ev.touches.length!==1){el=null;return;}
    el=t0;sx=ev.touches[0].clientX;sy=ev.touches[0].clientY;dx=0;lock=false;el.style.transition='none';
  },{passive:true});
  document.addEventListener('touchmove',function(ev){
    if(!el)return;
    const x=ev.touches[0].clientX-sx,y=ev.touches[0].clientY-sy;
    if(!lock){if(Math.abs(y)>Math.abs(x)&&Math.abs(y)>8){el=null;return;}if(Math.abs(x)>10)lock=true;else return;}
    dx=Math.max(-140,Math.min(140,x));el.style.transform='translateX('+dx+'px)';
    const w=el.parentNode;w.classList.toggle('l',dx<-20);w.classList.toggle('r',dx>20);
  },{passive:true});
  document.addEventListener('touchend',function(){
    if(!el)return;
    const e=el,w=e.parentNode,d=dx;el=null;
    e.style.transition='transform .18s';e.style.transform='';w.classList.remove('l','r');
    swipeDone(e,d);
  },{passive:true});
})();
function swipeDone(e,d){
  const fn=d<=-90?e.getAttribute('data-l'):(d>=90?e.getAttribute('data-r'):null);
  if(fn&&typeof window[fn]==='function')window[fn](e.getAttribute('data-a')||'');
}

/* ---------- home card ---------- */
function planCard(){
  const p=DATA.plan;
  if(!p)return'<div class="card tip"><b>'+t('planT')+'</b><p>'+t('planP')+'</p><div class="row"><button class="btn pri" onclick="planSetup()">'+t('planMake')+'</button></div></div>';
  const i=planNext(),d=p.ds[i];
  let h='<div class="swp"><div class="swp-h swp-hl">'+t('swSkip')+'</div><div class="swp-h swp-hr">'+t('swChange')+'</div><div class="card plan swp-in" data-l="planSkipAsk" data-r="planPickDay"><div class="plh"><b>'+t('planToday')+'</b><span class="muted sm">'+t('planWeek',planWeek(),p.n)+'</span></div><h3>'+esc(dayName(i))+'</h3>'+planBrief(d)+
    (p.wu?'<p class="muted sm">📅 '+(p.wd.indexOf(new Date().getDay())>=0?t('schCardOn',wdName(new Date().getDay())):t('schCardRest'))+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="planStart('+i+')">'+t('planStart')+'</button><button class="btn" onclick="planOpen()">'+t('planAll')+'</button></div>'+
    '<div class="row"><button class="btn" onclick="schedOpen()">📅 '+t('schBtn')+'</button><button class="btn danger" onclick="planDelAsk()">🗑 '+t('planDelShort')+'</button></div>'+
    '<p class="muted sm swhint">'+t('swHint')+'</p>'+testLine(p);
  if(checkDue())h+='<div class="pldue"><b>'+t('chkDue')+'</b><button class="btn sm" onclick="chkOpen()">'+t('chkOpen')+'</button></div>';
  return h+'</div></div>';
}
function testLine(p){
  const pr=p.prof;if(goalsOf(pr).indexOf('military')<0||!pr.td)return'';
  const left=pr.td-Date.now();if(left<=0)return'<p class="sm testln">'+t('testDone')+'</p>';
  const wk=Math.ceil(left/(7*864e5));
  return'<p class="sm testln">🎯 '+t('testIn',t('te_'+pr.test),wk)+(left<=7*864e5?'<br>'+t('taperNote'):'')+'</p>';
}
function simStart(k){
  if(ACT){toast(t('finishFirst'));return;}
  const T=(lo,hi,u)=>({lo:lo,hi:hi,u:u||'m',nt:'ntSim'});
  const L={
   aft:[['hexdl',3,{lo:3,hi:3,u:'r',nt:'ntSim'}],['hrpushup',1,T(0,0)],['sdcdrill',1,T(0,0)],['plank',1,T(0,0)],['run',1,T(0,0)]],
   pft:[['pullup',1,T(0,0)],['plank',1,T(0,0)],['run',1,T(0,0)]],
   cft:[['sprint',1,T(0,0)],['ammolift',1,T(0,0)],['lowcrawl',1,T(0,0)],['sleddrag',1,T(0,0)],['firecarry',1,T(0,0)],['pushup',1,T(0,0)]]
  }[k];
  sheetClose();
  startWorkout({name:t('sim_'+k),ex:L.map(r=>({eid:r[0],sets:r[1],tg:r[2]}))});
}
function planSkipAsk(){ask(t('skipAsk'),t('swSkipB'),function(){const p=DATA.plan;if(!p)return;p.cur=(planNext()+1)%p.n;saveData();render();toast(t('skipped'));});}
function planPickDay(){
  const p=DATA.plan;if(!p)return;
  sheet('<div class="form"><div class="pick-h"><h3>'+t('swChange')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('pickDayP')+'</p>'+
    p.ds.map((d,i)=>'<button class="exrow" onclick="planStart('+i+')"><b>'+esc(dayName(i))+'</b><small>'+d.ex.slice(0,4).map(e=>esc(exName(e.eid))).join(' · ')+'</small></button>').join('')+'</div>');
}
function planStart(i){
  const p=DATA.plan;if(!p)return;
  sheetClose();
  startWorkout({name:dayName(i),pl:i,ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:e.nt}}))});
}

/* ---------- full plan view and editing ---------- */
let PV=0;
function planOpen(d){
  const p=DATA.plan;if(!p){planSetup();return;}
  if(typeof d==='number')PV=d;if(PV<0||PV>=p.ds.length)PV=0;
  const pr=p.prof,i=PV;
  let h='<div class="form"><div class="pick-h"><h3>'+t('planMine')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('planInfo',goalTxt(p.prof),p.n,t('pl_'+p.lvl))+'</p>'+
    (pr.focus.length?'<p class="muted sm">'+t('planFocus',pr.focus.map(k=>t('fm_'+k)).join(', '))+'</p>':'')+
    (pr.skills.length?'<p class="muted sm">'+t('planSkill',pr.skills.map(k=>t('sk_'+k)).join(', '))+'</p>':'')+
    (pr.inj.length?'<p class="muted sm">⚠ '+t('planInj',pr.inj.map(k=>t('inj_'+k)).join(', '))+'</p>':'')+
    (pr.cond?'<div class="card warn"><p>'+t('condNote')+'</p></div>':'')+
    '<div class="chips wrap daytabs">'+p.ds.map((d,k)=>'<button class="chip'+(k===i?' on':'')+'" onclick="planOpen('+k+')">'+esc(dayName(k).split(' · ')[0])+'</button>').join('')+'</div>'+
    '<h3 class="dayh">'+esc(dayName(i))+'</h3>'+(p.ds[i].g?'<p class="muted sm daytag">'+esc(t('pg_'+p.ds[i].g))+'</p>':'')+planExList(p.ds[i],i,true)+
    '<div class="row"><button class="btn pri" onclick="planStart('+i+')">▶ '+t('planStart')+'</button><button class="btn" onclick="planAddEx('+i+')">＋ '+t('addEx')+'</button></div>';
  let tips='';
  const gs=goalsOf(pr),hyg=gs.filter(isHy)[0];
  if(gs.indexOf('runner')>=0)tips+='<h4>'+t('runT')+'</h4><p class="sm">'+t('runTips1')+'</p><p class="sm">'+t('runTips2')+'</p>';
  if(gs.indexOf('bodybuilding')>=0)tips+='<h4>'+t('bbT')+'</h4><p class="sm">'+t('bbTips1')+'</p><p class="sm">'+t('bbTips2')+'</p>';
  if(hyg)tips+='<h4>'+t(hyg==='military'?'hyT':'hyT2')+'</h4>'+(pr.test==='aft'?'<p class="sm">'+t('hyAft')+'</p><div class="row"><button class="btn sm" onclick="simStart(\'aft\')">'+t('sim_aft')+'</button></div>':'')+(pr.test==='usmc'?'<p class="sm">'+t('hyUsmc')+'</p><div class="row"><button class="btn sm" onclick="simStart(\'pft\')">'+t('sim_pft')+'</button><button class="btn sm" onclick="simStart(\'cft\')">'+t('sim_cft')+'</button></div>':'')+'<p class="sm">'+t('hyOrder')+'</p><p class="sm">'+t('hyRun')+'</p><p class="muted sm">'+t('hyOfficial')+'</p>';
  tips+='<h4>'+t('guideT')+'</h4><p class="sm">'+t('guideWarm')+'</p><p class="sm">'+t('guideRest')+'</p><p class="sm">'+t('guideEffort')+'</p><p class="sm">'+t('guideProg')+'</p><p class="muted sm">'+t('planNote')+'</p>';
  h+='<div class="lbl">'+t('planOpts')+'</div><div class="row stack"><button class="btn" onclick="chkOpen()">📋 '+t('chkOpen')+'</button><button class="btn" onclick="schedOpen()">📅 '+t('schBtn')+'</button><button class="btn" onclick="focusOpen()">🎯 '+t('focusT')+'</button><button class="btn" onclick="planSetup()">⚙ '+t('planChange')+'</button></div>'+
    '<details class="dtl"><summary>'+t('tipsT')+'</summary>'+tips+'</details>'+
    '<div class="dz"><button class="btn danger" onclick="planDelAsk()">🗑 '+t('planDel')+'</button></div></div>';
  sheet(h);
}
let PE={d:0,e:0};
function planEdit(d,e){PE={d:d,e:e};peDraw();}
function peDraw(){
  const p=DATA.plan,x=p&&p.ds[PE.d]&&p.ds[PE.d].ex[PE.e];if(!x){planOpen();return;}
  const stp=(f,v,step)=>'<div class="pe-r"><span>'+t('pe_'+f)+'</span><span class="pe-s"><button class="stp" onclick="peStep(\''+f+'\','+(-step)+')">−</button><b>'+fmtNum(v,1)+'</b><button class="stp" onclick="peStep(\''+f+'\','+step+')">+</button></span></div>';
  sheet('<div class="form"><div class="pick-h"><h3>'+esc(exName(x.eid))+'</h3><button class="ico" onclick="planOpen()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    stp('sets',x.sets,1)+stp('lo',x.lo,x.u==='m'?0.5:1)+stp('hi',x.hi,x.u==='m'?0.5:1)+
    '<p class="muted sm">'+esc(tgText(x))+'</p>'+
    '<div class="row"><button class="btn" onclick="planSwapOpen('+PE.d+','+PE.e+')">↔ '+t('swapB')+'</button><button class="btn" onclick="howOpen(\''+x.eid+'\')">ⓘ '+t('howTo')+'</button></div>'+
    '<div class="row"><button class="btn pri" onclick="planOpen()">'+t('done')+'</button><button class="btn" onclick="peRemove()">'+t('remove')+'</button></div></div>');
}
function peStep(f,d){
  const x=DATA.plan.ds[PE.d].ex[PE.e];
  if(f==='sets')x.sets=Math.max(1,Math.min(8,x.sets+d));
  else{x[f]=Math.max(x.u==='m'?0.5:1,Math.min(x.u==='m'?120:60,x[f]+d));if(x.lo>x.hi){if(f==='lo')x.hi=x.lo;else x.lo=x.hi;}}
  saveData();peDraw();
}
function peRemove(){
  const d=DATA.plan.ds[PE.d];
  if(d.ex.length<=1){toast(t('needOne'));return;}
  d.ex.splice(PE.e,1);saveData();planOpen();
}
function planAddEx(di){
  pickEx(function(eid){
    const p=DATA.plan;if(!p)return;
    p.ds[di].ex.push(planItem(eid,'a',p.prof,0));saveData();planOpen();render();
  });
}

/* ---------- substitutions: "I don't have this equipment" / sustituciones: "no tengo este equipo" ---------- */
let SW={mode:'act',i:0,d:0,e:0,eid:'',have:[]};
function swapCands(eid,have,L,skip,maxLv){
  const mu=muOf(eid),ex0=exById(eid),g0=ex0?ex0.g:'',m0=exMode(eid);
  const out=[];
  EXLIB.forEach(r=>{
    const id=r[0];if(id===eid||skip[id])return;
    const m=meta(id);if(!m||m.mu!==mu||m.lv>maxLv||!avail(id,have))return;
    const sl=stressLvl(id,L);if(sl>=2)return;
    out.push({id:id,sl:sl,same:(r[3]===g0?0:1)+(exMode(id)===m0?0:1)});
  });
  out.sort((a,b)=>(a.sl-b.sl)||(a.same-b.same));
  return out.slice(0,14);
}
function swapOpen(i){
  const x=ACT&&ACT.ex[i];if(!x)return;
  SW={mode:'act',i:i,eid:x.eid,have:curHave().slice()};swapDraw();
}
function planSwapOpen(d,e){
  const x=DATA.plan&&DATA.plan.ds[d]&&DATA.plan.ds[d].ex[e];if(!x)return;
  SW={mode:'plan',d:d,e:e,eid:x.eid,have:curHave().slice()};swapDraw();
}
function swTog(k){const a=SW.have,i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.push(k);swapDraw();}
function swPreset(k){SW.have=HAVE_PRESETS[k].slice();swapDraw();}
function swSave(){
  const p=profNow();
  if(p)p.have=SW.have.slice();else SET.have=SW.have.slice();
  saveData();saveSet();toast(t('equipSaved'));
}
function swapDraw(){
  const p=profNow(),L=curInjL(),maxLv=p&&p.lvl==='new'?1:2;
  const skip={};
  if(SW.mode==='plan')DATA.plan.ds[SW.d].ex.forEach(e=>{skip[e.eid]=1;});else ACT.ex.forEach(e=>{skip[e.eid]=1;});
  const c=swapCands(SW.eid,SW.have,L,skip,maxLv);
  sheet('<div class="form"><div class="pick-h"><h3>'+t('swapT')+'</h3><button class="ico" onclick="swapClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('swapP',esc(exName(SW.eid)))+'</p>'+
    '<div class="lbl">'+t('equipHave')+'</div>'+haveChips(SW.have,'swTog')+
    '<div class="row"><button class="btn sm" onclick="swPreset(\'gym\')">'+t('eqp_gym')+'</button><button class="btn sm" onclick="swPreset(\'db\')">'+t('eqp_db')+'</button><button class="btn sm" onclick="swPreset(\'home\')">'+t('eqp_home')+'</button><button class="btn sm" onclick="swPreset(\'none\')">'+t('eqp_none')+'</button></div>'+
    '<div class="lbl">'+t('swapOpts')+'</div>'+
    (c.length?c.map(o=>'<div class="plex"><span><b>'+esc(exName(o.id))+'</b><small>'+t('e_'+exById(o.id).e)+(NEED[o.id]&&NEED[o.id]!==exById(o.id).e?' + '+t('hv_'+NEED[o.id]):'')+(o.sl?' · ⚠ '+esc(t('caution')):'')+'</small></span><button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="swHow(\''+o.id+'\')">ⓘ</button><button class="btn sm pri" onclick="swapUse(\''+o.id+'\')">'+t('use')+'</button></div>').join(''):'<p class="muted">'+t('swapNone')+'</p>')+
    '<div class="row"><button class="btn" onclick="swSave()">'+t('equipSave')+'</button><button class="btn" onclick="swapClose()">'+t('cancel')+'</button></div></div>');
}
function swHow(id){howOpen(id,'swapDraw');}
function swapClose(){if(SW.mode==='plan')peDraw();else sheetClose();}
function swapUse(id){
  if(SW.mode==='act'){
    const x=ACT&&ACT.ex[SW.i];if(!x)return;
    if(x.sets.some(s=>s.done)){toast(t('swapDone'));return;}
    const e=exById(id);x.eid=id;x.n=e?e.en:id;x.sets=x.sets.map(()=>newSet());delete x.sg;
    if(x.tg){const sg=sugg(id,x.tg);if(sg&&sg.w!=null)x.sg=sg.w;}
    saveAct();sheetClose();render();toast(t('swapped'));return;
  }
  const it=DATA.plan.ds[SW.d].ex[SW.e],pr=DATA.plan.prof;
  const n=planItem(id,it.r,pr,0);n.sets=it.sets;
  if(n.u===it.u){n.lo=it.lo;n.hi=it.hi;}
  DATA.plan.ds[SW.d].ex[SW.e]=n;saveData();toast(t('swapped'));peDraw();
}
function haveChips(have,fn){return'<div class="chips wrap">'+HAVE_KEYS.map(k=>'<button class="chip'+(have.indexOf(k)>=0?' on':'')+'" onclick="'+fn+'(\''+k+'\')">'+t('hv_'+k)+'</button>').join('')+'</div>';}

/* ---------- setup wizard: 7 short steps / asistente de 7 pasos ---------- */
let PW={step:1};
const PW_STEPS=7;
function planSetup(){
  const base=DATA.plan?DATA.plan.prof:normProf({});
  PW=Object.assign({step:1,touched:!!DATA.plan},JSON.parse(JSON.stringify(base)));
  PW.tw=0;if(PW.td>Date.now()){const w=(PW.td-Date.now())/(7*864e5);PW.tw=TW.slice(1).reduce((a,b)=>Math.abs(b-w)<Math.abs(a-w)?b:a);}
  wizDraw();
}
function pwSet(k,v){
  PW[k]=v;
  if(k==='sex'&&!PW.touched){PW.emph=v==='f'?'low':'bal';PW.em0=PW.emph;}
  if(k==='emph'){PW.touched=true;PW.em0=v;}
  if(k==='goal'&&v==='military'&&PW.test==='gen')PW.test='aft';
  if(k==='goal'&&v==='hybrid')PW.test='gen';
  if(k==='goal'&&PW.mix&&(PW.mix.g===v||(isHy(v)&&isHy(PW.mix.g))))PW.mix=null;
  wizDraw();
}
/* second goal and split / segunda meta y reparto */
function pwMix(g){PW.mix=g?{g:g,p:PW.mix?PW.mix.p:50}:null;if(g==='military'&&PW.test==='gen')PW.test='aft';wizDraw();}
function pwMixP(p){if(PW.mix){PW.mix.p=p;wizDraw();}}
function mixBlock(){
  const opts=PGOALS.filter(g=>g!==PW.goal&&!(isHy(g)&&isHy(PW.goal)));
  return'<div class="lbl">'+t('psMix')+'</div><div class="chips wrap"><button class="chip'+(PW.mix?'':' on')+'" onclick="pwMix(null)">'+t('psMixNone')+'</button>'+
    opts.map(g=>'<button class="chip'+(PW.mix&&PW.mix.g===g?' on':'')+'" onclick="pwMix(\''+g+'\')">'+t('pg_'+g)+'</button>').join('')+'</div>'+
    (PW.mix?'<div class="lbl">'+t('psMixSplit')+'</div><div class="chips wrap">'+[50,70].map(p=>'<button class="chip'+(PW.mix.p===p?' on':'')+'" onclick="pwMixP('+p+')">'+p+' / '+(100-p)+'</button>').join('')+'</div>'+
    '<p class="muted sm">'+t('psMixP',PW.mix.p,t('pg_'+PW.goal),100-PW.mix.p,t('pg_'+PW.mix.g))+'</p>':'<p class="muted sm">'+t('psMixH')+'</p>');
}
/* step 2 options for one goal / opciones del paso 2 para una meta */
function goalOpts(g){
  if(g==='runner')return'<div class="lbl">'+t('psRace')+'</div>'+wch('race',RACES,PW.race,v=>t('rc_'+v))+'<p class="muted sm">'+t('psRaceP')+'</p>';
  if(g==='military')return'<div class="lbl">'+t('psTest')+'</div>'+wch('test',TESTS,PW.test,v=>t('te_'+v))+'<p class="muted sm">'+t('ted_'+PW.test)+'</p>'+
    '<div class="lbl">'+t('psTw')+'</div>'+wch('tw',TW,PW.tw,v=>v?t('psTwN',v):t('psTwNone'));
  if(g==='hybrid'||g==='bodybuilding')return'';
  return'<div class="lbl">'+t('psEmph')+'</div>'+wch('emph',PEMPH,PW.em0||PW.emph,v=>t('em_'+v))+'<p class="muted sm">'+t('emd_'+(PW.em0||PW.emph))+'</p>';
}
function pwTog(k,v,max){
  const a=PW[k],i=a.indexOf(v);
  if(i>=0)a.splice(i,1);else if(!max||a.length<max)a.push(v);
  wizDraw();
}
function pwPreset(k){PW.have=HAVE_PRESETS[k].slice();wizDraw();}
function pwGo(d){PW.step=Math.max(1,Math.min(PW_STEPS,PW.step+d));wizDraw();}
function wch(key,vals,cur,lab){return'<div class="chips wrap">'+vals.map(v=>'<button class="chip'+(cur===v?' on':'')+'" onclick="pwSet(\''+key+'\','+(typeof v==='number'?v:'\''+v+'\'')+')">'+esc(lab(v))+'</button>').join('')+'</div>';}
function wchm(key,vals,lab,max){return'<div class="chips wrap">'+vals.map(v=>'<button class="chip'+(PW[key].indexOf(v)>=0?' on':'')+'" onclick="pwTog(\''+key+'\',\''+v+'\''+(max?','+max:'')+')">'+esc(lab(v))+'</button>').join('')+'</div>';}
function focusBlock(){
  return'<div class="lbl">'+t('psFocus')+'</div>'+wchm('focus',Object.keys(FOCUS_MU),v=>t('fm_'+v),3)+'<p class="muted sm">'+t('psFocusP')+'</p>'+
    (PW.focus.length?'<div class="lbl">'+t('psFreq')+'</div>'+wch('ff',[1,2,3,4],PW.ff,v=>t('psDaysN',v))+'<p class="muted sm">'+t('psFreqP')+'</p>':'')+
    '<div class="lbl">'+t('psSkill')+'</div>'+wchm('skills',SKILLS,v=>t('sk_'+v),2)+'<p class="muted sm">'+t('psSkillP')+'</p>';
}
function focusOpen(){
  const base=DATA.plan?DATA.plan.prof:normProf({});
  PW=Object.assign({step:1,mini:1,tw:0},JSON.parse(JSON.stringify(base)));
  wizDraw();
}
function wizDraw(){
  if(PW.mini){
    sheet('<div class="form"><div class="pick-h"><h3>'+t('focusT')+'</h3><button class="ico" onclick="planOpen()" aria-label="'+esc(t('close'))+'">✕</button></div>'+focusBlock()+
      '<p class="muted sm">'+t('focusN')+'</p><div class="row"><button class="btn" onclick="planOpen()">'+t('cancel')+'</button><button class="btn pri" onclick="focusApply()">'+t('focusApply')+'</button></div></div>');
    return;
  }
  const s=PW.step;let b='';
  if(s===1){
    b='<div class="lbl">'+t('psGoal')+'</div>'+wch('goal',PGOALS,PW.goal,v=>t('pg_'+v))+'<p class="muted sm">'+t('pgd_'+PW.goal)+'</p>'+mixBlock()+
      '<div class="lbl">'+t('psSex')+'</div>'+wch('sex',PSEX,PW.sex,v=>t('sex_'+v))+'<p class="muted sm">'+t('psSexP')+'</p>';
  }else if(s===2&&PW.mix){
    b=[PW.goal,PW.mix.g].map(g=>{const o=goalOpts(g);return o?'<h4 class="mixh">'+t('pg_'+g)+'</h4>'+o:'';}).join('')+focusBlock();
  }else if(s===2&&PW.goal==='runner'){
    b='<div class="lbl">'+t('psRace')+'</div>'+wch('race',RACES,PW.race,v=>t('rc_'+v))+'<p class="muted sm">'+t('psRaceP')+'</p>';
  }else if(s===2&&(PW.goal==='hybrid'||PW.goal==='bodybuilding')){
    b=focusBlock();
  }else if(s===2&&PW.goal==='military'){
    b='<div class="lbl">'+t('psTest')+'</div>'+wch('test',TESTS,PW.test,v=>t('te_'+v))+'<p class="muted sm">'+t('ted_'+PW.test)+'</p>'+
      '<div class="lbl">'+t('psTw')+'</div>'+wch('tw',TW,PW.tw,v=>v?t('psTwN',v):t('psTwNone'))+
      '<div class="lbl">'+t('psFocus')+'</div>'+wchm('focus',Object.keys(FOCUS_MU),v=>t('fm_'+v),3);
  }else if(s===2){
    b='<div class="lbl">'+t('psEmph')+'</div>'+wch('emph',PEMPH,PW.emph,v=>t('em_'+v))+'<p class="muted sm">'+t('emd_'+PW.emph)+'</p>'+
      '<div class="lbl">'+t('psFocus')+'</div>'+focusBlock();
  }else if(s===3){
    b='<div class="lbl">'+t('psDays')+'</div>'+wch('n',[2,3,4,5],PW.n,v=>t('psDaysN',v))+
      '<div class="lbl">'+t('psLen')+'</div>'+wch('len',[30,45,60,75],PW.len,v=>t('psLenN',v))+'<p class="muted sm">'+t('psLenP')+'</p>';
  }else if(s===4){
    b='<div class="lbl">'+t('psLvl')+'</div>'+wch('lvl',PLVLS,PW.lvl,v=>t('pl_'+v))+'<p class="muted sm">'+t('pld_'+PW.lvl)+'</p>';
  }else if(s===5){
    b='<div class="lbl">'+t('psEquip')+'</div><p class="muted sm">'+t('psEquipP')+'</p>'+
      '<div class="row"><button class="btn sm" onclick="pwPreset(\'gym\')">'+t('eqp_gym')+'</button><button class="btn sm" onclick="pwPreset(\'db\')">'+t('eqp_db')+'</button><button class="btn sm" onclick="pwPreset(\'home\')">'+t('eqp_home')+'</button><button class="btn sm" onclick="pwPreset(\'none\')">'+t('eqp_none')+'</button></div>'+
      wchm('have',HAVE_KEYS,v=>t('hv_'+v))+'<p class="muted sm">'+t('psEquipN')+'</p>';
  }else if(s===6){
    b='<div class="lbl">'+t('psInj')+'</div><p class="muted sm">'+t('psInjP')+'</p>'+wchm('inj',Object.keys(INJ),v=>t('inj_'+v))+
      '<div class="lbl">'+t('psCond')+'</div><div class="chips wrap"><button class="chip'+(PW.cond?' on':'')+'" onclick="pwSet(\'cond\','+(PW.cond?0:1)+')">'+t('psCondB')+'</button></div>'+
      (PW.cond?'<div class="card warn"><p>'+t('condNote')+'</p></div>':'')+'<p class="muted sm">'+t('psInjN')+'</p>';
  }else{
    const L=injLetters(PW.inj);
    b='<div class="lbl">'+t('psSum')+'</div><ul class="sumul"><li>'+goalTxt(PW)+[PW.goal].concat(PW.mix?[PW.mix.g]:[]).map(g=>g==='military'?t('te_'+PW.test)+(PW.tw?' · '+t('psTwN',PW.tw):''):g==='runner'?t('rc_'+PW.race):(['hybrid','bodybuilding'].indexOf(g)>=0?'':t('em_'+(PW.em0||PW.emph)))).filter(Boolean).map(x=>' · '+x).join('')+'</li>'+
      (PW.focus.length?'<li>'+t('planFocus',PW.focus.map(k=>t('fm_'+k)).join(', '))+' · '+t('psDaysN',PW.ff)+'</li>':'')+
      (PW.skills.length?'<li>'+t('planSkill',PW.skills.map(k=>t('sk_'+k)).join(', '))+'</li>':'')+
      '<li>'+t('psDaysN',PW.n)+' · '+t('psLenN',PW.len)+' · '+t('pl_'+PW.lvl)+'</li>'+
      '<li>'+t('psEquip')+': '+(PW.have.length?PW.have.map(k=>t('hv_'+k)).join(', '):t('eqp_none'))+'</li>'+
      (PW.inj.length?'<li>⚠ '+t('planInj',PW.inj.map(k=>t('inj_'+k)).join(', '))+(L?'':'')+'</li>':'')+'</ul><p class="muted sm">'+t('planNote')+'</p>';
  }
  sheet('<div class="form"><div class="pick-h"><h3>'+t('planMake')+'</h3><span class="muted sm">'+t('psStep',s,PW_STEPS)+'</span></div>'+b+
    '<div class="row">'+(s>1?'<button class="btn" onclick="pwGo(-1)">‹ '+t('back')+'</button>':'<button class="btn" onclick="sheetClose()">'+t('cancel')+'</button>')+
    (s<PW_STEPS?'<button class="btn pri" onclick="pwGo(1)">'+t('next')+' ›</button>':'<button class="btn pri" onclick="planCreate()">'+t('planCreate')+'</button>')+'</div></div>');
}
function focusApply(){
  const prof=normProf(Object.assign({},DATA.plan.prof,{focus:PW.focus,ff:PW.ff,skills:PW.skills}));
  const old=DATA.plan,p=genPlan(prof);p.checks=old.checks;DATA.plan=p;saveData();render();planOpen();toast(t('planReady'));
}
function planCreate(){
  const prof=normProf({sex:PW.sex,goal:PW.goal,mix:PW.mix,emph:PW.em0||PW.emph,focus:PW.focus,ff:PW.ff,skills:PW.skills,race:PW.race,n:PW.n,len:PW.len,lvl:PW.lvl,have:PW.have,inj:PW.inj,cond:PW.cond,test:PW.test,td:PW.tw?Date.now()+PW.tw*7*864e5:0});
  const old=DATA.plan,p=genPlan(prof);
  if(old){p.checks=old.checks;}
  DATA.plan=p;saveData();render();
  const few=p.ds.some(d=>d.ex.length<3);
  planOpen();toast(t(few?'planFew':'planReady'));
}

/* ---------- routines: swipe to delete / edit ---------- */
function planDelAsk(){ask(t('delPlan'),t('delete'),function(){DATA.plan=null;saveData();render();toast(t('planDeleted'));},true);}
function rtDelAsk(id){ask(t('delRoutine'),t('delete'),function(){DATA.routines=DATA.routines.filter(x=>x.id!==id);saveData();render();},true);}
function rtEdit(id){rbOpen(id);}

/* ---------- periodic check-in / evaluación periódica ---------- */
let CK={feel:'right'};
function chkOpen(){CK={feel:'right'};chkDraw();}
function ckFeel(v){CK.feel=v;const w=$('ckw');CK.w=w?w.value:'';chkDraw();}
function chkDraw(){
  const p=DATA.plan;if(!p)return;
  const since=planDone().filter(w=>w.t>(p.ct||p.t0));
  let prs=0;since.forEach(w=>w.ex.forEach(x=>x.sets.forEach(s=>{if(s.pr)prs++;})));
  const bw=DATA.body.filter(b=>b.w);
  const first=bw.length?bw[bw.length-1].w:null,last=bw.length?bw[0].w:null;
  sheet('<div class="form"><h3>'+t('chkT')+'</h3>'+
    '<div class="stats"><div><b>'+since.length+'</b><span>'+t('chkSess')+'</span></div><div><b>'+prs+'</b><span>'+t('chkPr')+'</span></div><div><b>'+(first!=null&&last!=null&&bw.length>1?(last-first>0?'+':'')+wShow(last-first)+' '+wUnit():'—')+'</b><span>'+t('chkBw')+'</span></div></div>'+
    '<label>'+t('chkWeight')+' ('+wUnit()+')<input id="ckw" class="in wide" type="text" inputmode="decimal" autocomplete="off" value="'+esc(CK.w||'')+'" placeholder="'+esc(last!=null?wShow(last):'')+'"></label>'+
    '<div class="lbl">'+t('chkFeel')+'</div>'+chips2([['easy','chkEasy'],['right','chkRight'],['hard','chkHard']])+
    '<p class="muted sm">'+t('chkEff_'+CK.feel)+'</p>'+
    '<div class="row"><button class="btn pri" onclick="chkSave()">'+t('save')+'</button><button class="btn" onclick="sheetClose()">'+t('cancel')+'</button></div></div>');
}
function chips2(a){return'<div class="chips wrap">'+a.map(x=>'<button class="chip'+(CK.feel===x[0]?' on':'')+'" onclick="ckFeel(\''+x[0]+'\')">'+t(x[1])+'</button>').join('')+'</div>';}
function chkSave(){
  const p=DATA.plan;if(!p)return;
  const w=wParse(($('ckw')||{}).value||''),now=Date.now();
  if(w!=null&&w>0&&w<700){DATA.body.push({id:uid(),t:now,w:w});DATA.body.sort((a,b)=>b.t-a.t);}
  const dlt=CK.feel==='easy'?1:(CK.feel==='hard'?-1:0);
  if(dlt)p.ds.forEach(d=>d.ex.forEach(e=>{if(e.r==='m')e.sets=Math.max(2,Math.min(5,e.sets+dlt));}));
  p.checks.push({t:now,bw:w!=null&&w>0&&w<700?w:null,feel:CK.feel});if(p.checks.length>40)p.checks.shift();
  p.ct=now;saveData();sheetClose();render();toast(t('chkSaved'));
}

/* ---------- technique guide ---------- */
function howOpen(eid,back){
  const e=exById(eid);if(!e)return;
  const es=LANG==='es',src=HOWTO[eid],gen=HOWGEN[e.g]||HOWGEN.full;
  const steps=(src?src[es?1:0]:gen[es?1:0]).split('|');
  const mis=src?src[es?3:2]:'';
  const L=curInjL(),inj=L&&stressLvl(eid,L)?'<div class="card warn"><p>⚠ '+esc(t(stressLvl(eid,L)>=2?'injNo':'injCare',jointNames(stressJoints(eid,L,1))))+'</p></div>':'';
  sheet('<div class="form"><div class="pick-h"><h3>'+esc(es?e.es:e.en)+'</h3><button class="ico" onclick="'+(back||'sheetClose')+'()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('g_'+e.g)+' · '+t('e_'+e.e)+'</p>'+inj+
    '<div class="lbl">'+t('howSteps')+'</div><ol class="how">'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
    (mis?'<div class="lbl">'+t('howMis')+'</div><p>'+esc(mis)+'</p>':(src?'':'<p class="muted sm">'+t('howGen')+'</p>'))+
    '<p class="muted sm">'+esc(HOWSAFE[es?1:0])+'</p>'+
    '<div class="row"><button class="btn pri" onclick="'+(back||'sheetClose')+'()">'+t('done')+'</button></div></div>');
}


/* ---------- weekly schedule: put each training day on a weekday, with advice / horario semanal: cada día de entrenamiento en un día de la semana, con consejos ---------- */
// l = loads the legs · u = upper body · R = hard run or work-capacity day · r = easy run / l = piernas · u = tren superior · R = carrera dura o capacidad · r = carrera suave
const WD_DT={full:'lu',fullL:'lu',fullA:'lu',fullB:'lu',fullC:'lu',up:'u',up1:'u',up2:'u',upLite:'u',push:'u',pull:'u',arms:'u',lowQ:'l',lowG:'l',low1:'l',low2:'l',hyStr:'lu',hyStrL:'l',hyStrU:'u',hyRunI:'R',hyRunE:'r',hyCap:'R',runT:'R',runL:'R',runS:'l',bbFull:'lu',bbUp:'u',bbLow:'l',bbLow2:'l',bbPush:'u',bbPull:'u'};
const wdHas=(k,c)=>(WD_DT[k]||'').indexOf(c)>=0;
const wdName=(w,short)=>new Date(2023,0,1+w).toLocaleDateString(LANG==='es'?'es':'en-US',{weekday:short?'short':'long'});
function wdAt(wd){const at=[-1,-1,-1,-1,-1,-1,-1];wd.forEach((w,i)=>{at[w]=i;});return at;}
function wdWarn(ds,wd){
  const at=wdAt(wd),out=[];
  for(let w=0;w<7;w++){
    const a=at[w],b=at[(w+1)%7];if(a<0||b<0||a===b)continue;
    const ka=ds[a].k,kb=ds[b].k,la=wdHas(ka,'l'),lb=wdHas(kb,'l'),ra=wdHas(ka,'R'),rb=wdHas(kb,'R');
    if(la&&lb)out.push({t:'lo',a:a,b:b,w:w});
    else if((la&&rb)||(ra&&lb))out.push({t:'runlo',a:a,b:b,w:w});
    else if(ra&&rb)out.push({t:'runrun',a:a,b:b,w:w});
    else if(ka===kb&&wdHas(ka,'u')&&!la)out.push({t:'upup',a:a,b:b,w:w});
  }
  return out;
}
/* best weekdays for the plan: no clashes, evenly spread, weekdays preferred / mejores días: sin choques, repartidos, entre semana primero */
function defaultWd(ds){
  const n=ds.length;let best=null,bs=1e9;
  for(let m=0;m<128;m++){
    const sel=[];for(let w=0;w<7;w++)if(m&(1<<w))sel.push(w);
    if(sel.length!==n)continue;
    let sc=wdWarn(ds,sel).length*100+sel.filter(w=>w===0||w===6).length*2+(sel[0]===0?1:0);
    for(let i=0;i<n;i++){const g=((sel[(i+1)%n]-sel[i])+7)%7||7;sc+=Math.pow(g-7/n,2);}
    if(sc<bs){bs=sc;best=sel;}
  }
  return best||ds.map((d,i)=>i);
}
function wdFix(ds,wd){
  const cur=wdWarn(ds,wd).length,at=wdAt(wd);let best=null,bc=1e9;
  ds.forEach((d,i)=>{for(let w2=0;w2<7;w2++){
    if(w2===wd[i])continue;
    const nw=wd.slice(),j=at[w2];nw[i]=w2;if(j>=0)nw[j]=wd[i];
    const c=wdWarn(ds,nw).length;if(c>=cur)continue;
    const cost=c*10+Math.min(Math.abs(w2-wd[i]),7-Math.abs(w2-wd[i]));
    if(cost<bc){bc=cost;best=nw;}
  }});
  return best;
}
/* move a day with big arrows or by dragging the handle / mover un día con flechas grandes o arrastrando el asa */
function schedDraw(){
  const p=DATA.plan;if(!p)return;
  const at=wdAt(p.wd),today=new Date().getDay();
  const rows=[0,1,2,3,4,5,6].map(w=>{
    const i=at[w],tag=w===today?' <span class="schtd">'+t('schToday')+'</span>':'';
    if(i<0)return'<div class="schr rest" data-w="'+w+'"><div class="schw">'+esc(wdName(w))+tag+'</div><div class="schb muted">'+t('schRest')+'</div><span></span><span></span></div>';
    const d=p.ds[i],names=d.ex.map(e=>esc(exName(e.eid))).join(' · ');
    return'<div class="schr tr" data-w="'+w+'" data-i="'+i+'"><div class="schw">'+esc(wdName(w))+tag+'</div><div class="schb"><b>'+esc(dayName(i))+'</b>'+(d.g?'<span class="muted sm"> · '+esc(t('pg_'+d.g))+'</span>':'')+'<small>'+names+'</small></div>'+
      '<div class="schar"><button class="sar" aria-label="'+esc(t('schUp'))+'"'+(w===0?' disabled':'')+' onclick="schedStep('+i+',-1)">▲</button><button class="sar" aria-label="'+esc(t('schDn'))+'"'+(w===6?' disabled':'')+' onclick="schedStep('+i+',1)">▼</button></div>'+
      '<button class="sdrag" aria-label="'+esc(t('schDrag'))+'" title="'+esc(t('schDrag'))+'">≡</button></div>';
  }).join('');
  const W=wdWarn(p.ds,p.wd);
  const adv=W.map(x=>'<li>⚠ '+esc(t('schW_'+x.t,dayName(x.a),dayName(x.b),wdName(x.w,1),wdName((x.w+1)%7,1)))+'</li>');
  // three or more training days in a row / tres o más días seguidos
  let run=0,mx=0,st=-1;for(let k=0;k<14;k++){const w=k%7;if(at[w]>=0){run++;if(run>mx){mx=run;st=k-run+1;}}else run=0;}
  if(mx>=3&&mx<7)adv.push('<li>ℹ️ '+esc(t('schStreak',mx,wdName(st%7,1)))+'</li>');
  const fix=W.length?wdFix(p.ds,p.wd):null;
  sheet('<div class="form"><div class="pick-h"><h3>'+t('schT')+'</h3><button class="ico" onclick="planOpen()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('schP')+'</p><div id="schlist">'+rows+'</div>'+
    '<div class="lbl">'+t('schAdv')+'</div><div class="card schadv"><ul class="schul">'+(adv.length?adv.join(''):'<li>✓ '+t('schOk')+'</li>')+'</ul>'+
    (W.length?(fix?'<button class="btn pri wide" onclick="schedFix()">'+t('schFix')+'</button>':'<p class="muted sm">'+t('schNoFix')+'</p>'):'')+'</div>'+
    '<div class="row"><button class="btn" onclick="schedReset()">'+t('schReset')+'</button><button class="btn pri" onclick="planOpen()">'+t('done')+'</button></div></div>');
}
/* put training day i on weekday w2 (swap if taken) / poner el día i en el día de la semana w2 (intercambia si está ocupado) */
function schedTo(i,w2){
  const p=DATA.plan;if(!p||w2<0||w2>6||p.wd[i]===w2)return;
  const at=wdAt(p.wd),j=at[w2],from=p.wd[i];
  p.wd[i]=w2;if(j>=0)p.wd[j]=from;p.wu=1;saveData();render();schedDraw();
}
function schedStep(i,d){const p=DATA.plan;if(p)schedTo(i,p.wd[i]+d);}
(function(){
  let drag=null;
  document.addEventListener('pointerdown',function(ev){
    const h=ev.target.closest&&ev.target.closest('.sdrag');if(!h)return;
    const row=h.closest('.schr');if(!row)return;
    ev.preventDefault();drag={row:row,i:+row.dataset.i,y0:ev.clientY,to:null,id:ev.pointerId};
    try{h.setPointerCapture(ev.pointerId);}catch(e){}
    row.classList.add('lift');
  });
  document.addEventListener('pointermove',function(ev){
    if(!drag)return;
    drag.row.style.transform='translateY('+(ev.clientY-drag.y0)+'px)';
    let to=null;document.querySelectorAll('#schlist .schr').forEach(r=>{
      const b=r.getBoundingClientRect(),over=r!==drag.row&&ev.clientY>=b.top&&ev.clientY<=b.bottom;
      r.classList.toggle('drop',over);if(over)to=+r.dataset.w;
    });
    drag.to=to;
  });
  const end=function(ev){
    if(!drag)return;
    const d=drag;drag=null;d.row.classList.remove('lift');d.row.style.transform='';
    document.querySelectorAll('#schlist .schr.drop').forEach(r=>r.classList.remove('drop'));
    if(ev.type==='pointerup'&&d.to!=null)schedTo(d.i,d.to);
  };
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',end);
})();
function schedFix(){const p=DATA.plan;if(!p)return;const f=wdFix(p.ds,p.wd);if(f){p.wd=f;p.wu=1;saveData();render();}schedDraw();}
function schedReset(){const p=DATA.plan;if(!p)return;p.wd=defaultWd(p.ds);p.wu=0;saveData();render();schedDraw();}
function schedOpen(){schedDraw();}
