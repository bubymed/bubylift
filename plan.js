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
const G2MU={chest:'P',back:'B',shoulders:'S',biceps:'I',triceps:'T',legs:'Q',glutes:'G',core:'A',full:'F',balance:'Z',power:'W',cardio:'K',mobility:'F'};
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
function curHave(){const p=profNow();return p?p.have:(Array.isArray(SET.have)?SET.have:HAVE_CONV);}
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
const OPT_SEC_OK=['ac','sk','rs','cd','cc'];
const NT_KEYS=['ntTired','ntIntR','ntLong','ntInt','ntEasy','ntTempo','ntSdc','ntMdl','ntHrp','ntPlk','ntSim','ntBal','ntLand','ntSoft'];
const NTEID={hexdl:'ntMdl',hrpushup:'ntHrp',plank:'ntPlk',sdcdrill:'ntSdc',sleddrag:'ntSdc'};
const PDAYKEYS=Object.keys(DAYSPEC).concat(['fullA','fullB','fullC','up1','up2','low1','low2','oCB','oLeg','oPush','oPull','oLow','oChest','oBack','oSho']); // old keys stay valid / las claves viejas siguen válidas
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
  return bwFix(it,prof);
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
/* ---------- weekly volume: hard sets per muscle per week / volumen semanal: series duras por músculo por semana ---------- */
const VOLMU='QHGCPBSITA';
const OPT_VF={1:[0.4,0.7],2:[0.5,1.9],3:[0.4,1.3],4:[0.35,1.2],5:[0.4,1.5]}; // OPT phases change how many sets a muscle gets (low,high factor) / las fases OPT cambian las series por músculo
const VOLR={lo:{M:[6,9],m:[4,6],A:[4,6]},md:{M:[10,14],m:[6,10],A:[6,10]},hi:{M:[15,20],m:[10,16],A:[10,15]}};
function volFactor(prof){
  const gs=goalsOf(prof),lowv=g=>isHy(g)||g==='runner';
  return gs.every(lowv)?0.6:gs.some(lowv)?0.8:(gs[0]==='strength'?0.85:1);
}
function volRange(mu,vol,prof,ph){
  const c='QHGPB'.indexOf(mu)>=0?'M':mu==='A'?'A':'m',r=(VOLR[vol]||VOLR.md)[c],vf=(ph&&optPerf(prof))?1:volFactor(prof);
  if(ph){ // OPT: core is trained every session as activation / el core se entrena en cada sesión como activación
    const n=prof.n||3,vi={lo:0,md:1,hi:2}[vol]!=null?{lo:0,md:1,hi:2}[vol]:1;
    if(mu==='A')return[[1,2,3][vi]*n,Math.round([4,6,8][vi]*n*(optPerf(prof)?1.5:1))];
    const o=OPT_VF[ph]||[1,1],fq=n>=4?(ph===3||ph===4?(n>=5?2.4:1.8):1.7):1; // more days = more weekly sets / más días = más series semanales
    const lw=('HGIT'.indexOf(mu)>=0?0.5:1)*(n<=2?0.45:1),up=mu==='S'?1.6:(mu==='G'?1.6:1); // hamstrings/glutes also work in squats; shoulders appear in every pair day / isquios y glúteos trabajan en otras; el hombro aparece en todos los días
    // performance plans are built around running or a test: strength only needs a base, so the floor is low / los planes de rendimiento giran en torno a la carrera o la prueba: la fuerza solo necesita una base
    const spl=prof.split&&prof.split!=='auto'; // a chosen split trains some muscles once a week, others twice / una división elegida entrena algunos músculos una vez y otros dos
    const lo=optPerf(prof)?1:Math.max(2,Math.round(r[0]*vf*o[0]*lw*(spl?0.5:1)));
    return[lo,Math.max(3,Math.round(r[1]*vf*o[1]*fq*up*(spl?1.6:1)))];
  }
  const f=vf;
  return[Math.max(2,Math.round(r[0]*f)),Math.max(3,Math.round(r[1]*f))];
}
function volCounts(e){return(e.r==='m'||e.r==='a'||e.r==='c')&&VOLMU.indexOf(muOf(e.eid))>=0;}
function volOfDs(ds){const o={};ds.forEach(d=>d.ex.forEach(e=>{if(volCounts(e)){const m=muOf(e.eid);o[m]=(o[m]||0)+e.sets;}}));return o;}
function volDone(){
  const ws=weekStart(),o={};
  DATA.workouts.forEach(w=>{if(w.t>=ws)w.ex.forEach(x=>{const m=muOf(x.eid);if(VOLMU.indexOf(m)>=0)o[m]=(o[m]||0)+x.sets.length;});});
  return o;
}
/* pick the best available exercise for a muscle slot / elige el mejor ejercicio disponible para un hueco */
/* test-specific drills only appear for that test / los ejercicios propios de una prueba solo salen con esa prueba */
const TESTONLY={sdcdrill:'aft',firecarry:'usmc',ammolift:'usmc'};
/* conventional gear first: ball, bands, suspension... only fill in when nothing conventional is left / equipo convencional primero: pelota, bandas, suspensión... solo si no queda nada convencional */
function isSpecial(id){const q=exById(id);return(q&&HAVE_SPECIAL.indexOf(q.e)>=0)||(NEED[id]&&HAVE_SPECIAL.indexOf(NEED[id])>=0)?1:0;}
function pickFor(mu,role,ctx){
  const P=POOL[mu];if(!P)return null;
  const first=(ctx.hy&&HYFIRST[ctx.test]&&HYFIRST[ctx.test][mu+role])||[],own=styOwner();
  const list=first.concat(role==='m'?P.m.concat(P.a):P.a.concat(P.m),styExtras(own,mu)).filter((x,i,a)=>a.indexOf(x)===i);
  const c=list.filter(id=>{const m=meta(id);return exById(id)&&m&&(!TESTONLY[id]||TESTONLY[id]===ctx.test)&&m.lv<=ctx.maxLv&&avail(id,ctx.have)&&!ctx.day[id]&&!prefBad(id)&&stressLvl(id,ctx.L)<=(role==='p'?0:1);});
  c.sort((a,b)=>(stressLvl(a,ctx.L)-stressLvl(b,ctx.L))||(persLike(a)-persLike(b))||(own?styFit(own,a)-styFit(own,b):0)||(isSpecial(a)-isSpecial(b))||((ctx.used[a]||0)-(ctx.used[b]||0)));
  // v49: on every third accessory pick, prefer an imported exercise that ties with the best one / cada tercera opción de accesorio prefiere un ejercicio importado empatado con la mejor
  if(c.length>1&&role!=='m'&&role!=='p'&&Object.keys(ctx.used).length%2===0){
    const k=x=>stressLvl(x,ctx.L)+'/'+(ctx.used[x]||0),j=c.findIndex(x=>x.slice(0,2)==='z_'&&k(x)===k(c[0]));
    if(j>0)c.unshift(c.splice(j,1)[0]);
  }
  const pk=persPick(c);styNote(pk,own);return pk;
}
function normProf(p){
  const o=Object.assign({sex:'x',goal:'muscle',emph:'bal',focus:[],n:3,len:60,lvl:'new',have:HAVE_PRESETS.gym.slice(),inj:[],cond:0},p||{});
  if(PGOALS.indexOf(o.goal)<0)o.goal='muscle';if(ALLEMPH.indexOf(o.emph)<0)o.emph='bal';if(PLVLS.indexOf(o.lvl)<0)o.lvl='new';if(PSEX.indexOf(o.sex)<0)o.sex='x';
  o.n=Math.max(2,Math.min(5,Math.round(o.n)||3));if(!LENMAX[o.len])o.len=60;
  o.focus=(o.focus||[]).filter(k=>FOCUS_MU[k]).slice(0,3);o.have=(o.have||[]).filter(k=>HAVE_KEYS.indexOf(k)>=0);o.inj=(o.inj||[]).filter(k=>INJ[k]);o.cond=o.cond?1:0;
  o.ff=Math.max(1,Math.min(4,Math.round(o.ff)||2));o.skills=(o.skills||[]).filter((k,i,a)=>SKILLS.indexOf(k)>=0&&a.indexOf(k)===i).slice(0,2);
  if(['lo','md','hi'].indexOf(o.vol)<0)o.vol='md';
  // v25 personalization / personalización
  o.avoid=(o.avoid||[]).filter((k,i,a)=>AVOID.indexOf(k)>=0&&a.indexOf(k)===i);
  o.fav=(o.fav||[]).filter((k,i,a)=>MAINS.indexOf(k)>=0&&a.indexOf(k)===i).slice(0,4);
  o.work=WORKS.indexOf(o.work)>=0?o.work:'';
  o.sh=Math.max(0,Math.min(Math.min(2,o.n-1),Math.round(o.sh)||0));
  o.pu=PUS.indexOf(o.pu)>=0?o.pu:'';
  Object.keys(AS_OPTS).forEach(k=>{o[k]=(AS_OPTS[k].indexOf(o[k])>=0||o[k]==='x')?o[k]:'x';});
  o.as=o.as?1:0;
  o.split=(typeof splitOk==='function'&&splitOk(o.split,o.n))?o.split:'auto';
  o.sd=(Number.isInteger(o.sd)&&o.sd>0&&o.sd<1e9)?o.sd:0;
  o.rt=(Number.isInteger(o.rt)&&o.rt>=0&&o.rt<1000)?o.rt:0;
  o.lk=(Array.isArray(o.lk)?o.lk:[]).filter((k,i,a)=>typeof k==='string'&&ID_RE.test(k)&&a.indexOf(k)===i).slice(-30);
  o.no=(Array.isArray(o.no)?o.no:[]).filter((k,i,a)=>typeof k==='string'&&ID_RE.test(k)&&a.indexOf(k)===i).slice(-40);
  o.ph=(o.ph>=1&&o.ph<=5)?Math.round(o.ph):0; // 0 = chosen by level / 0 = según el nivel
  if(TESTS.indexOf(o.test)<0)o.test='gen';
  if(o.goal==='hybrid'&&o.test!=='gen')o.goal='military'; // old plans: hybrid with a test is now military / planes viejos: híbrido con prueba ahora es militar
  if(o.goal==='hybrid')o.test='gen';
  if(RACES.indexOf(o.race)<0)o.race='fit';
  o.td=(typeof o.td==='number'&&isFinite(o.td)&&o.td>0&&o.td<4e12)?o.td:0;
  // mix: a second goal with a share for the main goal (50 or 70 percent) / mezcla: una segunda meta; la principal lleva 50 o 70 %
  const mx=o.mix;o.mix=null;
  if(mx&&typeof mx==='object'&&PGOALS.indexOf(mx.g)>=0&&mx.g!==o.goal&&!(isHy(mx.g)&&isHy(o.goal)))o.mix={g:mx.g,p:mx.p===70?70:50};
  if(o.mix&&o.goal==='hybrid')o.test='gen';
  // training styles: up to two, with a share for the first (25, 50 or 75 %) / estilos: hasta dos, con un porcentaje para el primero
  o.sty=(Array.isArray(o.sty)?o.sty:[]).filter((k,i,a)=>STY[k]&&a.indexOf(k)===i).slice(0,2);o.stp=o.sty.length===2&&[25,50,75].indexOf(o.stp)>=0?o.stp:50;
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
  PREFPROF=prof;
  if(typeof optOn==='function'&&optOn(prof))return genOpt(prof); // NASM OPT engine / motor NASM OPT
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
  if(prof.skills.indexOf('power')>=0||prof.sty.some(k=>k==='oly'||k==='ath'))addSk('W','p',2,lowerDay);
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
  // weekly volume: nudge sets (or add one exercise) so every trained muscle lands in its range / volumen semanal: ajusta series (o agrega un ejercicio) para que cada músculo caiga en su rango
  const vv=prof.cond&&prof.vol==='hi'?'md':prof.vol;
  VOLMU.split('').forEach(mu=>{
    const rg=volRange(mu,vv,prof),cnt=()=>volOfDs(ds)[mu]||0,cap=e=>e.r==='m'&&e.u!=='m'?5:4;
    let tot=cnt(),g=40;
    if(!tot)return;
    while(tot<rg[0]&&g-->0){
      let best=null;
      ds.forEach(d=>d.ex.forEach(e=>{if(volCounts(e)&&muOf(e.eid)===mu&&e.sets<cap(e)&&(!best||e.sets<best.sets))best=e;}));
      if(best){best.sets++;tot++;continue;}
      let add=false;
      ds.map((d,di)=>di).sort((x,y)=>ds[x].ex.length-ds[y].ex.length).forEach(di=>{
        if(add)return;const d=ds[di];if(d.ex.length>=(vv==='hi'?maxEx+1:maxEx))return;
        const has=d.ex.some(e=>muOf(e.eid)===mu),half=MUS_LOWER.indexOf(mu)>=0?MUS_LOWER:MUS_UPPER;
        if(!has&&mu!=='A'&&!d.ex.some(e=>half.indexOf(muOf(e.eid))>=0))return;
        const dayIds={};d.ex.forEach(e=>{dayIds[e.eid]=1;});
        const id=pickFor(mu,mu==='A'?'c':'a',{have:have,L:L,maxLv:maxLv,used:used,day:dayIds,hy:isHy(dgoal[di]),test:effOf(di).test});
        if(!id)return;
        used[id]=(used[id]||0)+1;
        const it=planItem(id,mu==='A'?'c':'a',effOf(di),0);let ins=d.ex.length;
        while(ins>0&&muOf(d.ex[ins-1].eid)==='K'&&d.ex[ins-1].r!=='m')ins--;
        d.ex.splice(ins,0,it);tot+=it.sets;add=true;
      });
      if(!add)break;
    }
    g=40;
    while(tot>rg[1]&&g-->0){
      let best=null;
      ds.forEach(d=>d.ex.forEach(e=>{if(volCounts(e)&&muOf(e.eid)===mu&&e.sets>2&&(!best||(e.r==='m')<(best.r==='m')||((e.r==='m')===(best.r==='m')&&e.sets>best.sets)))best=e;}));
      if(!best)break;best.sets--;tot--;
    }
  });
  const res={goal:prof.goal,n:prof.n,lvl:prof.lvl,t0:Date.now(),ct:0,cur:0,ds:ds,wd:defaultWd(ds),wu:0,checks:[],prof:prof};
  return optPerf(prof)?optWrap(res,prof):res; // NASM OPT structure for performance plans / estructura OPT para planes de rendimiento
}
function cleanPlan(p){
  if(!p||typeof p!=='object'||PGOALS.indexOf(p.goal)<0||PLVLS.indexOf(p.lvl)<0||!(p.n>=2&&p.n<=5)||typeof p.t0!=='number'||!Array.isArray(p.ds)||p.ds.length!==p.n)return null;
  const ds=[];
  for(const d of p.ds){
    if(!d||PDAYKEYS.indexOf(d.k)<0||!Array.isArray(d.ex))return null;
    const ex=d.ex.filter(e=>e&&ID_RE.test(String(e.eid))).slice(0,20).map(e=>({eid:String(e.eid),sets:Math.max(1,Math.min(8,Math.round(cn(e.sets)||1))),lo:cn(e.lo)||0,hi:cn(e.hi)||0,u:e.u==='m'?'m':'r',r:['m','a','c','p','e','z','y'].indexOf(e.r)>=0?e.r:'a',sec:OPT_SEC_OK.indexOf(e.sec)>=0?e.sec:undefined,tp:['sl','md','ex','ct','rp'].indexOf(e.tp)>=0?e.tp:undefined,rs:(e.rs>=0&&e.rs<=600)?Math.round(e.rs):undefined,ss:/^[A-H]$/.test(e.ss)?e.ss:undefined,cn:String(e.cn||'').replace(/[^kbsewhan]/g,'').slice(0,8),nt:NT_KEYS.indexOf(e.nt)>=0?e.nt:undefined,mn:e.mn?1:undefined,rz:/^rz[A-Za-z]{1,12}$/.test(e.rz||'')?e.rz:undefined}));
    if(!ex.length)return null;const dd=PGOALS.indexOf(d.g)>=0?{k:d.k,g:d.g,ex:ex}:{k:d.k,ex:ex};
    if(typeof d.nm==='string'&&d.nm.trim())dd.nm=d.nm.trim().slice(0,30);
    if(Array.isArray(d.wy)){const wy=d.wy.filter(x=>typeof x==='string'&&/^wy[A-Za-z0-9]{1,14}(\|[A-Za-z0-9_-]{1,40})?$/.test(x)).slice(0,8);if(wy.length)dd.wy=wy;}
    ds.push(dd);
  }
  const checks=(Array.isArray(p.checks)?p.checks:[]).slice(-40).filter(c=>c&&typeof c.t==='number').map(c=>({t:c.t,bw:cn(c.bw)||null,feel:['easy','right','hard'].indexOf(c.feel)>=0?c.feel:'right'}));
  const prof=normProf(p.prof&&typeof p.prof==='object'?Object.assign({},p.prof,{n:p.n,goal:p.goal,lvl:p.lvl}):{n:p.n,goal:p.goal,lvl:p.lvl,have:HAVE_CONV.slice()});
  const o={goal:prof.goal,n:p.n,lvl:p.lvl,t0:p.t0,ct:cn(p.ct)||0,ds:ds,checks:checks,prof:prof};
  if(Number.isInteger(p.ph)&&p.ph>=1&&p.ph<=5){o.ph=p.ph;o.pt=(typeof p.pt==='number'&&p.pt>0&&p.pt<4e12)?p.pt:p.t0;}
  if(Number.isInteger(p.cur)&&p.cur>=0&&p.cur<p.n)o.cur=p.cur;
  const okWd=Array.isArray(p.wd)&&p.wd.length===p.n&&p.wd.every((w,i)=>Number.isInteger(w)&&w>=0&&w<=6&&p.wd.indexOf(w)===i);
  o.wd=okWd?p.wd.slice():defaultWd(ds);o.wu=okWd&&p.wu?1:0;
  if(Array.isArray(p.xd)){const xd=p.xd.filter(k=>typeof k==='string'&&/^[fc]:[a-z0-9]{2,12}:[0-5]$/.test(k)).slice(0,6);if(xd.length)o.xd=xd;}
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
  if(!tg||tg.u==='m'||tg.fx)return null;
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
    if(typeof x.tg.ln==='string'&&x.tg.ln)h+='<br><span class="sg">'+esc(x.tg.ln.slice(0,200))+'</span>';
    if(x.tg.nt&&NT_KEYS.indexOf(x.tg.nt)>=0)h+='<br><span class="muted">'+esc(t(x.tg.nt))+'</span>';
    if(x.tg.tp){const ss=x.tg.ss?optSsLabelAct(x):'';h+='<br><span class="muted">'+(ss?'<i class="ssl">'+ss+'</i> ':'')+esc(optLine(x.tg))+'</span>'+(ss?'<br><span class="muted">'+esc(t('ssHint'))+'</span>':'');}
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
  if(d.nm)return t('planDay',i+1)+' · '+d.nm;
  return t('planDay',i+1)+' · '+t('pd_'+d.k)+(same>1?' '+String.fromCharCode(65+idx):'');
}
function planExList(d,di,withEdit){
  let last='';
  return d.ex.map((e,ei)=>{
    let h='';
    if(e.sec&&e.sec!==last){h+='<div class="secl">'+t('sec_'+e.sec)+'</div>';}
    last=e.sec||last;
    const ss=optSsLabel(d,ei),ln=optLine(e);
    return h+'<div class="plex'+(withEdit?' tap':'')+'"'+(withEdit?' role="button" tabindex="0" onclick="planEdit('+di+','+ei+')"':'')+'>'+exThumb(e.eid)+'<span><b>'+(ss?'<i class="ssl">'+ss+'</i>':'')+(e.mn?'<i class="mnl" title="'+esc(t('mainT'))+'">★</i> ':'')+esc(exName(e.eid))+'</b><small>'+esc(tgText(e))+(ln?' · '+esc(ln):'')+'</small>'+
    (e.nt?'<small>'+esc(t(e.nt))+'</small>':'')+(e.rz?'<small class="rz">↳ '+esc(rzText(e))+'</small>':'')+(e.cn?'<small class="warnt">⚠ '+esc(t('injCare',jointNames(e.cn)))+'</small>':'')+'</span>'+
    (withEdit?'<em class="go">'+t('edit')+' ›</em>':'')+'</div>';
  }).join('');
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
function planCard(){const p=DATA.plan;return(p?awayHtml(p):'')+planCard1();}
function planCard1(){
  const p=DATA.plan;
  if(!p)return'<div class="card tip"><b>'+t('planT')+'</b><p>'+t('planP')+'</p><div class="row"><button class="btn pri" onclick="planSetup()">'+t('planMake')+'</button></div></div>';
  const i=planNext(),d=p.ds[i];
  let h='<div class="swp"><div class="swp-h swp-hl">'+t('swSkip')+'</div><div class="swp-h swp-hr">'+t('swChange')+'</div><div class="card plan swp-in" data-l="planSkipAsk" data-r="planPickDay"><div class="plh"><b>'+t('planToday')+'</b><span class="muted sm">'+t('planWeek',planWeek(),p.n)+'</span></div><h3>'+esc(dayName(i))+'</h3>'+planBrief(d)+
    (p.wu?'<p class="muted sm">'+ic('calendar')+' '+(p.wd.indexOf(new Date().getDay())>=0?t('schCardOn',wdName(new Date().getDay())):t('schCardRest'))+'</p>':'')+
    '<div class="row"><button class="btn pri" onclick="planGo('+i+')">'+t('planStart')+'</button><button class="btn" onclick="planOpen()">'+t('planAll')+'</button></div>'+
    (p.ph?'<p class="muted sm">'+ic('target')+' '+esc(phLine(p))+'</p>':'')+
    '<div class="row plsec"><button class="btn sm" onclick="modeOpen()">'+ic('refresh')+' '+t('mdBtn')+'</button><button class="btn sm" onclick="shortOpen()">'+ic('stopwatch')+' '+t('shBtn')+'</button><button class="btn sm" onclick="schedOpen()">'+ic('calendar')+' '+t('schBtn')+'</button><button class="btn sm" onclick="volOpen()">'+ic('chart-bar')+' '+t('volBtn')+'</button>'+(p.ph?'<button class="btn sm" onclick="phOpen()">'+ic('target')+' '+t('phBtn')+'</button>':'')+'<button class="btn sm danger" onclick="planDelAsk()">'+ic('trash')+' '+t('planDelShort')+'</button></div>'+
    '<p class="muted sm swhint">'+t('swHint')+'</p>'+testLine(p);
  if(checkDue())h+='<div class="pldue"><b>'+t('chkDue')+'</b><button class="btn sm" onclick="chkOpen()">'+t('chkOpen')+'</button></div>';
  return h+'</div></div>';
}
/* ---------- coming back after a break + short on time / volver tras una pausa + poco tiempo ---------- */
function awayDays(){const w=DATA.workouts&&DATA.workouts[0];return w?Math.floor((Date.now()-w.t)/864e5):0;}
function awayHtml(p){
  const d=awayDays();if(d<14||(p.rs&&Date.now()-p.rs<7*864e5))return'';
  return'<div class="card tip away"><b>'+t('awT',d)+'</b><p class="sm">'+t(d>=42?'awP2':'awP')+'</p><div class="row"><button class="btn pri" onclick="planStartSoft('+planNext()+')">'+t('awSoft')+'</button><button class="btn" onclick="awayHide()">'+t('awNormal')+'</button></div></div>';
}
function awayHide(){const p=DATA.plan;if(!p)return;p.rs=Date.now();saveData();render();}
/* easy restart: one set fewer on the bigger lifts and about 15% less weight / retomar suave: una serie menos y ~15 % menos peso */
function planStartSoft(i,mode){
  const p=DATA.plan;if(!p)return;
  sheetClose();
  startWorkout({name:dayName(i),pl:i,ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets>=3?e.sets-1:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:mode==='tired'?'ntTired':'ntSoft',tp:e.tp,rs:e.rs,ss:e.ss,sec:e.sec}}))});
  if(ACT){ACT.ex.forEach(x=>{if(x.sg)x.sg=Math.round(x.sg*(mode==='tired'?0.9:0.85)*2)/2;});saveAct();render();}
  if(mode!=='tired'){p.rs=Date.now();saveData();}
}
/* how do you feel today? tired = easy version / ¿cómo te sientes hoy? cansado = versión suave */
function planGo(i){
  if(SET.noEnergy){planStart(i);return;}
  sheet('<div class="form"><div class="pick-h"><h3>'+t('enT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('enP')+'</p>'+
    ['good','ok','tired'].map(k=>'<button class="exrow" onclick="enPick('+i+',\''+k+'\')"><b>'+t('en_'+k)+'</b><small>'+t('end_'+k)+'</small></button>').join('')+
    '<label class="sm"><input type="checkbox" onchange="SET.noEnergy=this.checked?1:0;saveSet()"> '+t('enNo')+'</label></div>');
}
function enPick(i,k){if(k==='tired')planStartSoft(i,'tired');else planStart(i);}
/* another plan like this: same profile, new exercise mix / otro plan parecido: mismo perfil, otra mezcla */
function planAnother(){ask(t('anAsk'),t('anGo'),function(){const p=DATA.plan;if(!p)return;planRegen({rt:((p.prof.rt|0)+1)%1000,sd:(Math.random()*1e6|0)+1});sheetClose();toast(t('anDone'));});}
/* today's mode: hotel, home, dumbbells only, short / modo de hoy: hotel, casa, solo mancuernas, corto */
function modeOpen(){
  const p=DATA.plan;if(!p)return;
  sheet('<div class="form"><div class="pick-h"><h3>'+t('mdT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('mdP')+'</p>'+
    [['none','mdHotel'],['home','mdHome'],['db','mdDb']].map(a=>'<button class="exrow" onclick="planStartAlt('+planNext()+',\''+a[0]+'\')"><b>'+t(a[1])+'</b><small>'+t(a[1]+'D')+'</small></button>').join('')+
    '<button class="exrow" onclick="shortOpen()"><b>'+t('mdBusy')+'</b><small>'+t('mdBusyD')+'</small></button></div>');
}
function planStartAlt(i,k){
  const p=DATA.plan;if(!p)return;sheetClose();
  const have=HAVE_PRESETS[k],L=curInjL(),skip={},maxLv=lvlEff(p.prof)==='new'?1:2;
  p.ds[i].ex.forEach(e=>{skip[e.eid]=1;});
  const ex=p.ds[i].ex.map(e=>{
    let id=e.eid;
    if(!avail(id,have)){const c=swapCands(id,have,L,skip,maxLv).filter(x=>!prefBad(x.id,p.prof));if(c.length){id=c[0].id;skip[id]=1;}else return null;}
    return{eid:id,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:e.nt,tp:e.tp,rs:e.rs,ss:e.ss,sec:e.sec}};
  }).filter(Boolean);
  if(!ex.length){toast(t('tkNoAlt'));return;}
  startWorkout({name:dayName(i)+' · '+t('md_'+k),pl:i,ex:ex});
}
function exMins(e){return e.sets*(((e.rs||60)/60)+0.9)+0.5;}
/* keep the main lifts first and stop when the time is used / deja primero lo principal y para cuando se acaba el tiempo */
function shortDay(ex,min){
  const rank=e=>e.r==='m'?0:(e.sec==='rs'?1:(e.sec==='ac'?2:3));
  const idx=ex.map((e,i)=>({e:e,i:i,k:rank(e)})).sort((a,b)=>(a.k-b.k)||(a.i-b.i));
  let used=0;const keep={};
  idx.forEach(o=>{const m=exMins(o.e);if(used+m<=min||used===0){used+=m;keep[o.i]=1;}});
  return ex.filter((e,i)=>keep[i]);
}
function shortOpen(){
  const p=DATA.plan;if(!p)return;const i=planNext();
  sheet('<div class="form"><div class="pick-h"><h3>'+t('shT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('shP')+'</p>'+
    [20,30,45].map(m=>{const n=shortDay(p.ds[i].ex,m).length;return'<button class="exrow" onclick="planStartShort('+i+','+m+')"><b>'+t('shMin',m)+'</b><small>'+t('shN2',n,p.ds[i].ex.length)+'</small></button>';}).join('')+'</div>');
}
function planStartShort(i,m){
  const p=DATA.plan;if(!p)return;sheetClose();
  const ex=shortDay(p.ds[i].ex,m);
  startWorkout({name:dayName(i)+' · '+m+' min',pl:i,ex:ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:e.nt,tp:e.tp,rs:e.rs,ss:e.ss,sec:e.sec}}))});
}
function testLine(p){
  const pr=p.prof;if(goalsOf(pr).indexOf('military')<0||!pr.td)return'';
  const left=pr.td-Date.now();if(left<=0)return'<p class="sm testln">'+t('testDone')+'</p>';
  const wk=Math.ceil(left/(7*864e5));
  return'<p class="sm testln">'+ic('target')+' '+t('testIn',t('te_'+pr.test),wk)+(left<=7*864e5?'<br>'+t('taperNote'):'')+'</p>';
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
  startWorkout({name:dayName(i),pl:i,ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u,nt:e.nt,tp:e.tp,rs:e.rs,ss:e.ss,sec:e.sec}}))});
}

/* ---------- full plan view and editing ---------- */
let PV=0;
function planOpen(d){
  const p=DATA.plan;if(!p){planSetup();return;}
  if(typeof d==='number')PV=d;if(PV<0||PV>=p.ds.length)PV=0;
  const pr=p.prof,i=PV;
  let h='<div class="form"><div class="pick-h"><h3>'+t('planMine')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('planInfo',goalTxt(p.prof),p.n,t('pl_'+p.lvl))+'</p>'+
    (p.ph?'<p class="sm"><b>'+esc(phLine(p))+'</b> <button class="btn sm" onclick="phOpen()">'+ic('target')+' '+t('phBtn')+'</button></p>':'')+planWhyCard(p)+
    (pr.focus.length?'<p class="muted sm">'+t('planFocus',pr.focus.map(k=>t('fm_'+k)).join(', '))+'</p>':'')+
    (pr.skills.length?'<p class="muted sm">'+t('planSkill',pr.skills.map(k=>t('sk_'+k)).join(', '))+'</p>':'')+
    (pr.inj.length?'<p class="muted sm">⚠ '+t('planInj',pr.inj.map(k=>t('inj_'+k)).join(', '))+'</p>':'')+
    (pr.cond?'<div class="card warn"><p>'+t('condNote')+'</p></div>':'')+
    '<div class="chips wrap daytabs">'+p.ds.map((d,k)=>'<button class="chip'+(k===i?' on':'')+'" onclick="planOpen('+k+')">'+esc(dayName(k).split(' · ')[0])+'</button>').join('')+'</div>'+
    '<h3 class="dayh">'+esc(dayName(i))+' <button class="ico" onclick="dayRen('+i+')" aria-label="'+esc(t('dayRen'))+'">✎</button></h3>'+(p.ds[i].g?'<p class="muted sm daytag">'+esc(t('pg_'+p.ds[i].g))+'</p>':'')+wyCard(p.ds[i])+(p.ph?optWarm(p.ds[i],p):'')+planExList(p.ds[i],i,true)+(p.ph?optWarm(p.ds[i],p,true):'')+
    '<div class="row"><button class="btn pri" onclick="planStart('+i+')">▶ '+t('planStart')+'</button><button class="btn" onclick="planAddEx('+i+')">＋ '+t('addEx')+'</button></div>';
  let tips='';
  const gs=goalsOf(pr),hyg=gs.filter(isHy)[0];
  if(gs.indexOf('runner')>=0)tips+='<h4>'+t('runT')+'</h4><p class="sm">'+t('runTips1')+'</p><p class="sm">'+t('runTips2')+'</p>';
  if(gs.indexOf('bodybuilding')>=0)tips+='<h4>'+t('bbT')+'</h4><p class="sm">'+t('bbTips1')+'</p><p class="sm">'+t('bbTips2')+'</p>';
  if(hyg)tips+='<h4>'+t(hyg==='military'?'hyT':'hyT2')+'</h4>'+(pr.test==='aft'?'<p class="sm">'+t('hyAft')+'</p><div class="row"><button class="btn sm" onclick="simStart(\'aft\')">'+t('sim_aft')+'</button></div>':'')+(pr.test==='usmc'?'<p class="sm">'+t('hyUsmc')+'</p><div class="row"><button class="btn sm" onclick="simStart(\'pft\')">'+t('sim_pft')+'</button><button class="btn sm" onclick="simStart(\'cft\')">'+t('sim_cft')+'</button></div>':'')+'<p class="sm">'+t('hyOrder')+'</p><p class="sm">'+t('hyRun')+'</p><p class="muted sm">'+t('hyOfficial')+'</p>';
  tips+='<h4>'+t('guideT')+'</h4><p class="sm">'+t('guideWarm')+'</p><p class="sm">'+t('guideRest')+'</p><p class="sm">'+t('guideEffort')+'</p><p class="sm">'+t('guideProg')+'</p><p class="muted sm">'+t('planNote')+'</p>';
  h+='<div class="lbl">'+t('planOpts')+'</div><div class="row stack"><button class="btn" onclick="planAnother()">'+ic('arrows-shuffle')+' '+t('anBtn')+'</button><button class="btn" onclick="remOpen()">'+ic('calendar')+' '+t('rmT')+'</button><button class="btn" onclick="tasteOpen()">'+ic('heart')+' '+t('tkBtn')+'</button><button class="btn" onclick="chkOpen()">'+ic('clipboard-list')+' '+t('chkOpen')+'</button><button class="btn" onclick="schedOpen()">'+ic('calendar')+' '+t('schBtn')+'</button><button class="btn" onclick="focusOpen()">'+ic('target')+' '+t('focusT')+'</button><button class="btn" onclick="planShuffleAsk()">'+ic('arrows-shuffle')+' '+t('shufBtn')+'</button><button class="btn" onclick="planSetup()">'+ic('settings')+' '+t('planChange')+'</button></div>'+
    '<details class="dtl"><summary>'+t('tipsT')+'</summary>'+tips+'</details>'+
    (typeof xdHtml==='function'?xdHtml():'')+'<div class="dz"><button class="btn danger" onclick="planDelAsk()">'+ic('trash')+' '+t('planDel')+'</button></div></div>';
  sheet(h);
}
/* ---------- tastes: like / dislike an exercise / gustos: me gusta / no me gusta ---------- */
function tastePr(){return DATA.plan?DATA.plan.prof:null;}
function tasteOf(id){const pr=tastePr();if(!pr)return'';return(pr.lk||[]).indexOf(id)>=0?'lk':((pr.no||[]).indexOf(id)>=0?'no':'');}
function tasteLike(id){
  const pr=tastePr();if(!pr){toast(t('tkNeed'));return;}
  pr.lk=pr.lk||[];pr.no=(pr.no||[]).filter(k=>k!==id);
  const i=pr.lk.indexOf(id);if(i>=0){pr.lk.splice(i,1);toast(t('tkUnliked'));}else{pr.lk=pr.lk.concat([id]).slice(-30);toast(t('tkLikedT'));}
  saveData();
}
/* "I don't like this": never again, and swap it for the closest one now / "no me gusta": nunca más, y cambia por el más parecido */
function tasteDis(mode,a,b){
  const pr=tastePr(),eid=mode==='plan'?DATA.plan.ds[a].ex[b].eid:ACT.ex[a].eid;
  if(!pr){toast(t('tkNeed'));return;}
  if(mode==='act'&&ACT.ex[a].sets.some(s=>s.done)){toast(t('swapDone'));return;}
  pr.no=(pr.no||[]).filter(k=>k!==eid).concat([eid]).slice(-40);pr.lk=(pr.lk||[]).filter(k=>k!==eid);
  const skip={};
  (mode==='plan'?DATA.plan.ds[a].ex:ACT.ex).forEach(e=>{skip[e.eid]=1;});(pr.no||[]).forEach(k=>{skip[k]=1;});
  const cs=swapCands(eid,pr.have||curHave(),curInjL(),skip,lvlEff(pr)==='new'?1:2).filter(c=>!prefBad(c.id,pr));
  saveData();
  if(!cs.length){toast(t('tkNoAlt'));if(mode==='plan')peDraw();else sheetClose();return;}
  SW=mode==='plan'?{mode:'plan',d:a,e:b,eid:eid,have:(pr.have||curHave()).slice()}:{mode:'act',i:a,eid:eid,have:(pr.have||curHave()).slice()};
  swapUse(cs[0].id);toast(t('tkSwapped',exName(eid),exName(cs[0].id)));
}
function tasteOpen(){
  const pr=tastePr();if(!pr){sheetClose();return;}
  const row=(id,k)=>'<div class="plex"><span><b>'+esc(exName(id))+'</b></span><button class="btn sm" onclick="tasteDel(\''+k+'\',\''+id+'\')">✕</button></div>';
  sheet('<div class="form"><div class="pick-h"><h3>'+t('tkBtn')+'</h3><button class="ico" onclick="planOpen()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('tkP')+'</p>'+
    '<div class="lbl">'+ic('heart')+' '+t('tkLikeH')+'</div>'+((pr.lk||[]).length?pr.lk.map(i=>row(i,'lk')).join(''):'<p class="muted sm">'+t('tkNone')+'</p>')+
    '<div class="lbl">'+ic('ban')+' '+t('tkDisH')+'</div>'+((pr.no||[]).length?pr.no.map(i=>row(i,'no')).join(''):'<p class="muted sm">'+t('tkNone')+'</p>')+
    '<div class="row"><button class="btn pri" onclick="planOpen()">'+t('done')+'</button></div></div>');
}
function tasteDel(k,id){const pr=tastePr();if(!pr)return;pr[k]=(pr[k]||[]).filter(x=>x!==id);saveData();tasteOpen();}
let PE={d:0,e:0};
function planEdit(d,e){PE={d:d,e:e};peDraw();}
function peDraw(){
  const p=DATA.plan,x=p&&p.ds[PE.d]&&p.ds[PE.d].ex[PE.e];if(!x){planOpen();return;}
  const stp=(f,v,step)=>'<div class="pe-r"><span>'+t('pe_'+f)+'</span><span class="pe-s"><button class="stp" onclick="peStep(\''+f+'\','+(-step)+')">−</button><b>'+fmtNum(v,1)+'</b><button class="stp" onclick="peStep(\''+f+'\','+step+')">+</button></span></div>';
  sheet('<div class="form"><div class="pick-h"><h3>'+esc(exName(x.eid))+'</h3><button class="ico" onclick="planOpen()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    stp('sets',x.sets,1)+stp('lo',x.lo,x.u==='m'?0.5:1)+stp('hi',x.hi,x.u==='m'?0.5:1)+
    '<p class="muted sm">'+esc(tgText(x))+'</p>'+(x.rz?'<p class="sm rz">↳ '+esc(rzText(x))+'</p>':'')+
    '<div class="row"><button class="btn" onclick="peMove(-1)"'+(PE.e<1?' disabled':'')+'>↑ '+t('moveUp')+'</button><button class="btn" onclick="peMove(1)"'+(PE.e>=p.ds[PE.d].ex.length-1?' disabled':'')+'>↓ '+t('moveDn')+'</button></div>'+
    '<label class="sm">'+t('moveDay')+' <select class="in" onchange="peMoveDay(this.value)"><option value="">—</option>'+p.ds.map((d,k)=>k===PE.d?'':'<option value="'+k+'">'+esc(dayName(k))+'</option>').join('')+'</select></label>'+
    '<div class="row"><button class="btn'+(tasteOf(x.eid)==='lk'?' on':'')+'" onclick="tasteLike(\''+x.eid+'\');peDraw()">'+ic('heart')+' '+t(tasteOf(x.eid)==='lk'?'tkLiked':'tkLike')+'</button><button class="btn" onclick="tasteDis(\'plan\','+PE.d+','+PE.e+')">'+ic('ban')+' '+t('tkDis')+'</button></div>'+
    '<div class="row"><button class="btn" onclick="planSwapOpen('+PE.d+','+PE.e+')">↔ '+t('swapB')+'</button><button class="btn" onclick="howOpen(\''+x.eid+'\')">ⓘ '+t('howTo')+'</button></div>'+
    '<div class="row"><button class="btn pri" onclick="planOpen()">'+t('done')+'</button><button class="btn" onclick="peRemove()">'+t('remove')+'</button></div></div>');
}
function peStep(f,d){
  const x=DATA.plan.ds[PE.d].ex[PE.e];
  if(f==='sets')x.sets=Math.max(1,Math.min(8,x.sets+d));
  else{x[f]=Math.max(x.u==='m'?0.5:1,Math.min(x.u==='m'?120:60,x[f]+d));if(x.lo>x.hi){if(f==='lo')x.hi=x.lo;else x.lo=x.hi;}}
  saveData();peDraw();
}
function peMove(d){
  const a=DATA.plan.ds[PE.d].ex,j=PE.e+d;
  if(j<0||j>=a.length)return;
  const x=a[PE.e];a[PE.e]=a[j];a[j]=x;PE.e=j;saveData();peDraw();
}
function peMoveDay(k){
  k=parseInt(k,10);const p=DATA.plan;
  if(isNaN(k)||!p.ds[k]||k===PE.d)return;
  const src=p.ds[PE.d];
  if(src.ex.length<=1){toast(t('needOne'));peDraw();return;}
  const x=src.ex.splice(PE.e,1)[0];p.ds[k].ex.push(x);
  saveData();toast(t('movedTo',dayName(k)));planOpen(k);render();
}
function dayRen(i){
  const d=DATA.plan.ds[i];
  sheet('<div class="form"><h3>'+t('dayRen')+'</h3><label>'+t('name')+'<input id="dayrn" class="in wide" type="text" maxlength="30" value="'+esc(d.nm||'')+'" placeholder="'+esc(t('pd_'+d.k))+'"></label><p class="muted sm">'+t('dayRenP')+'</p>'+
    '<div class="row"><button class="btn pri" onclick="dayRenSave('+i+')">'+t('save')+'</button><button class="btn" onclick="planOpen('+i+')">'+t('cancel')+'</button></div></div>');
}
function dayRenSave(i){
  const d=DATA.plan.ds[i],v=($('dayrn').value||'').trim().slice(0,30);
  if(v)d.nm=v;else delete d.nm;
  saveData();planOpen(i);render();
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
  const sty=DATA.plan&&DATA.plan.prof&&DATA.plan.prof.sty&&DATA.plan.prof.sty[0]&&STY[DATA.plan.prof.sty[0]]?DATA.plan.prof.sty[0]:'';
  out.sort((a,b)=>(a.sl-b.sl)||(sty?styFit(sty,a.id)-styFit(sty,b.id):0)||(a.same-b.same));
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
const EQ_IMG={barbell:'bench-0',dumbbell:'dbcurl-0',cable:'cablefly-0',machine:'legpress-0',kettlebell:'kbswing-0',band:'bandpull-0',ball:'ballbridge-0',medball:'mbslam-0',suspension:'suprow-0',bench:'benchdip-0',bar:'pullup-0',sled:'sledpush-0',wheel:'abwheel-1',pad:'z_bosu_ball_cable_crunch_with_side_b-0',pack:'farmer-1'};
function eqThumb(k){return'<span class="hv-th" style="background-image:url(img/ex/'+(EQ_IMG[k]||'bench-0')+'.jpg)"></span>';}
/* equipment picker: photo + what it is, so nobody has to guess / selector de equipo: foto y qué es, para no adivinar */
function haveChips(have,fn){return'<div class="hvg">'+HAVE_KEYS.map(k=>'<button class="hv'+(have.indexOf(k)>=0?' on':'')+'" onclick="'+fn+'(\''+k+'\')">'+eqThumb(k)+'<span class="hv-t"><b>'+t('hv_'+k)+'</b><small>'+t('hvd_'+k)+'</small></span><i class="hv-ck">✓</i></button>').join('')+'</div>';}

/* ---------- setup wizard: 7 short steps / asistente de 7 pasos ---------- */
let PW={step:1};
function planSetup(){
  const base=DATA.plan?DATA.plan.prof:normProf({});
  PW=Object.assign({step:1,touched:!!DATA.plan,fresh:!DATA.plan},JSON.parse(JSON.stringify(base)));
  PW.a={};if(PW.as)AS_KEYS.forEach(k=>{PW.a[k]=1;});
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
/* training styles: pick up to two, then the equipment follows / estilos: elige hasta dos y el equipo se ajusta solo */
function pwSty(k){
  const i=PW.sty.indexOf(k);
  if(i>=0)PW.sty.splice(i,1);else if(PW.sty.length<2)PW.sty.push(k);else{PW.sty.shift();PW.sty.push(k);}
  if(PW.sty.length<2)PW.stp=50;else if([25,50,75].indexOf(PW.stp)<0)PW.stp=50;
  if(PW.sty.length)PW.have=styHave(PW.sty);
  wizDraw();
}
function pwStp(p){PW.stp=p;wizDraw();}
function pwEqToggle(){PW.eqOpen=!PW.eqOpen;wizDraw();}
function pwMixP(p){if(PW.mix){PW.mix.p=p;wizDraw();}}
function pwTog(k,v,max){
  const a=PW[k],i=a.indexOf(v);
  if(i>=0)a.splice(i,1);else if(!max||a.length<max)a.push(v);
  wizDraw();
}
function pwPreset(k){PW.have=HAVE_PRESETS[k].slice();wizDraw();}
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
  wzDraw();
}
function focusApply(){
  const prof=normProf(Object.assign({},DATA.plan.prof,{focus:PW.focus,ff:PW.ff,skills:PW.skills}));
  const old=DATA.plan,p=genPlan(prof);p.checks=old.checks;DATA.plan=p;saveData();render();planOpen();toast(t('planReady'));
}
function planCreate(){
  const prof=normProf({sex:PW.sex,goal:PW.goal,mix:PW.mix,sty:PW.sty,stp:PW.stp,emph:PW.em0||PW.emph,focus:PW.focus,ff:PW.ff,skills:PW.skills,race:PW.race,n:PW.n,len:PW.len,vol:PW.vol,ph:PW.ph,lvl:PW.lvl,have:PW.have,inj:PW.inj,cond:PW.cond,avoid:PW.avoid,fav:PW.fav,work:PW.work,sh:PW.sh,pu:PW.pu,as:AS_KEYS.every(k=>PW.a&&PW.a[k])?1:0,pl:PW.pl,bal:PW.bal,sq:PW.sq,pull:PW.pull,leg:PW.leg,hist:PW.hist,split:PW.split,sd:PW.sd||((Math.random()*1e6|0)+1),rt:PW.rt,no:PW.no,lk:PW.lk,test:PW.test,td:PW.tw?Date.now()+PW.tw*7*864e5:0});
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
function chkOpen(){CK={feel:'right'};ADP=adaptScan(DATA.plan).map(a=>Object.assign({on:true},a));chkDraw();}
function ckAdv(v){CK.adv=v;const w=$('ckw');CK.w=w?w.value:'';chkDraw();}
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
    '<p class="muted sm">'+t('chkEff_'+CK.feel)+'</p>'+adaptHtml()+(p.ph&&optNext(p)?'<div class="lbl">'+t('phT')+'</div><p class="muted sm">'+t('phAdvP',p.ph,phWeek(p))+'</p><div class="chips wrap"><button class="chip'+(CK.adv?'':' on')+'" onclick="ckAdv(0)">'+t('phStay')+'</button><button class="chip'+(CK.adv?' on':'')+'" onclick="ckAdv(1)">'+t('phMove',optNext(p))+'</button></div>':'')+
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
  p.ct=now;
  const ap=ADP.filter(a=>a.on);let adj=0;if(ap.length)adj=adaptApply(p,ap);ADP=[];
  const nx=p.ph&&CK.adv?optNext(p):0;
  if(nx){planRegen({ph:nx,rt:((p.prof.rt|0)+1)%1000,no:p.prof.no,lk:p.prof.lk,vol:p.prof.vol});toast(t('phMoved',nx));sheetClose();return;}
  saveData();sheetClose();render();toast(adj?t('adDone',adj):t('chkSaved'));
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
    (EXPHOTO.has(eid)?'<div class="eximg"><img src="img/ex/'+eid+'-0.jpg" alt="" onerror="this.parentNode.remove()"><img class="b" src="img/ex/'+eid+'-1.jpg" alt="" onerror="this.remove()"></div>':'')+
    '<div class="lbl">'+t('howSteps')+'</div><ol class="how">'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
    (mis?'<div class="lbl">'+t('howMis')+'</div><p>'+esc(mis)+'</p>':(src?'':'<p class="muted sm">'+t('howGen')+'</p>'))+
    '<p class="muted sm">'+esc(HOWSAFE[es?1:0])+'</p>'+
    '<div class="row"><button class="btn pri" onclick="'+(back||'sheetClose')+'()">'+t('done')+'</button></div></div>');
}


/* weekly volume counter / contador de volumen semanal */
let VS=null;
function volOpen(){const p=DATA.plan;if(!p)return;VS=p.prof.vol;volDraw();}
function volSet(v){VS=v;volDraw();}
function volDraw(){
  const p=DATA.plan;if(!p)return;
  const pr=p.prof,plan=volOfDs(p.ds),done=volDone(),rg={};let mx=6,sd=0,sp=0;
  VOLMU.split('').forEach(m=>{rg[m]=volRange(m,VS,pr,p.ph);mx=Math.max(mx,rg[m][1],plan[m]||0,done[m]||0);sd+=done[m]||0;sp+=plan[m]||0;});
  mx=Math.ceil(mx*1.1);
  const rows=VOLMU.split('').filter(m=>plan[m]||done[m]).map(m=>{
    const a=rg[m],pl=plan[m]||0,dn=done[m]||0,st=pl<a[0]?'Under':pl>a[1]?'Over':'Ok';
    return'<div class="vrow"><div class="vh"><b>'+esc(t('vm_'+m))+'</b><span class="vs v'+st+'">'+t('vol'+st)+'</span></div>'+
      '<div class="vbar"><i class="vz" style="left:'+(a[0]/mx*100)+'%;width:'+((a[1]-a[0])/mx*100)+'%"></i><i class="vf" style="width:'+Math.min(100,dn/mx*100)+'%"></i><i class="vp" style="left:'+Math.min(99,pl/mx*100)+'%"></i></div>'+
      '<div class="muted sm">'+t('volLine',dn,pl,a[0]+'–'+a[1])+'</div></div>';
  }).join('');
  sheet('<div class="form"><div class="pick-h"><h3>'+ic('chart-bar')+' '+t('volT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="sm"><b>'+t('volWeek',sd,sp)+'</b></p>'+
    '<div class="card tip"><b>'+t('volWhyT')+'</b><p class="sm">'+t('volWhy')+'</p></div>'+
    '<div class="lbl">'+t('psVol')+'</div><div class="chips wrap">'+['lo','md','hi'].map(v=>'<button class="chip'+(VS===v?' on':'')+'" onclick="volSet(\''+v+'\')">'+t('vol_'+v)+'</button>').join('')+'</div><p class="muted sm">'+t('vold_'+VS)+'</p>'+
    (VS!==pr.vol?'<div class="row"><button class="btn pri" onclick="volApply()">'+t('volApply',t('vol_'+VS))+'</button></div><p class="muted sm">'+t('volApplyP')+'</p>':'')+
    '<div class="vleg"><span><i class="vz"></i>'+t('volLgGoal')+'</span><span><i class="vf"></i>'+t('volLgDone')+'</span><span><i class="vp"></i>'+t('volLgPlan')+'</span></div>'+rows+
    '<p class="muted sm">'+t('volNote')+'</p><p class="muted sm">'+t('volTime')+'</p>'+
    '<div class="row"><button class="btn" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
/* rebuild the plan with a change, keeping history, schedule and progress / rehace el plan con un cambio, conservando historial, horario y progreso */
function planRegen(patch){
  const old=DATA.plan;if(!old)return;
  const p=genPlan(Object.assign({},old.prof,patch));
  p.checks=old.checks;p.t0=old.t0;p.ct=old.ct;if(old.xd&&old.xd.length)p.xd=old.xd;
  if(p.n===old.n){p.wd=old.wd;p.wu=old.wu;p.cur=old.cur;}
  if(p.ph&&old.ph&&p.ph===old.ph)p.pt=old.pt;
  DATA.plan=p;saveData();render();
}
function volApply(){
  planRegen({vol:VS});volOpen();toast(t('planReady'));
}

/* ---------- weekly schedule: put each training day on a weekday, with advice / horario semanal: cada día de entrenamiento en un día de la semana, con consejos ---------- */
// l = loads the legs · u = upper body · R = hard run or work-capacity day · r = easy run / l = piernas · u = tren superior · R = carrera dura o capacidad · r = carrera suave
const WD_DT={full:'lu',fullL:'lu',fullA:'lu',fullB:'lu',fullC:'lu',up:'u',up1:'u',up2:'u',upLite:'u',push:'u',pull:'u',arms:'u',lowQ:'l',lowG:'l',low1:'l',low2:'l',hyStr:'lu',hyStrL:'l',hyStrU:'u',hyRunI:'R',hyRunE:'r',hyCap:'R',runT:'R',runL:'R',runS:'l',bbFull:'lu',bbUp:'u',bbLow:'l',bbLow2:'l',bbPush:'u',bbPull:'u',oCB:'u',oLeg:'l',oPush:'u',oPull:'u',oLow:'l',oChest:'u',oBack:'u',oSho:'u'};
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
