/* NASM OPT engine: builds plans from the OPT model (phases 1-5) and the CPT7 workout templates.
   Motor NASM OPT: arma planes con el modelo OPT (fases 1-5) y las plantillas de entrenamiento del CPT7.
   Session template: warm-up, activation (core + balance), skill development (plyometric / SAQ), resistance, client's choice, cool-down.
   Plantilla de sesión: calentamiento, activación (core + equilibrio), habilidad (pliométricos / SAQ), resistencia, elección del cliente, enfriamiento.
   Based on NASM CPT7 materials, used with permission. / Basado en materiales NASM CPT7, usados con permiso. */

const OPT_GOALS=['muscle','bodybuilding','strength','fat','general'];
const OPT_PHASES={fat:[1,2,3],general:[1,2,3],muscle:[1,2,3,4],bodybuilding:[1,2,3,4],strength:[1,2,3,4,5],hybrid:[1,2,5],military:[1,2,5],runner:[1,2,5]}; // hybrid / military / runner = NASM Performance handout (1, 2, 5)
const OPT_PERF=['hybrid','military','runner'];
const optPerf=pr=>goalsOf(pr).some(g=>OPT_PERF.indexOf(g)>=0);
const OPT_HEAVY=/^(barbell|dumbbell|machine|cable|kettlebell)$/;
const OPT_WEEKS=4; // weeks per phase / semanas por fase
const optOn=pr=>goalsOf(pr).every(g=>OPT_GOALS.indexOf(g)>=0);
function optAllowed(pr){
  let al=null;
  goalsOf(pr).forEach(g=>{const a=OPT_PHASES[g]||[1,2,3];al=al?al.filter(x=>a.indexOf(x)>=0):a.slice();});
  return al&&al.length?al:[1,2,3];
}
function optAuto(pr){
  if(pr.cond)return 1;
  const lv=lvlEff(pr);
  if(optPerf(pr))return lv==='new'?1:2; // performance plans start by pairing strength and stability / los planes de rendimiento empiezan emparejando fuerza y estabilidad
  return lv==='new'?1:lv==='some'?2:(goalsOf(pr).indexOf('strength')>=0?4:3);
}
/* the phase this profile trains in (own choice, else by level), limited by goal and equipment / la fase del perfil */
function optPhase(pr){
  const al=optAllowed(pr);
  let ph=(pr.ph>=1&&pr.ph<=5)?pr.ph:optAuto(pr);
  if(pr.cond)ph=1;
  if(!(pr.have||[]).some(k=>OPT_HEAVY.test(k)))ph=Math.min(ph,2); // heavy phases need weights / las fases pesadas necesitan pesas
  if(al.indexOf(ph)<0)ph=al.filter(x=>x<=ph).pop()||al[0];
  return ph;
}
function optNext(p){
  const pr=p.prof,al=optAllowed(pr),heavy=(pr.have||[]).some(k=>OPT_HEAVY.test(k));
  return al.filter(x=>x>p.ph&&(heavy||x<=2))[0]||0;
}

/* --- OPT acute variables (CPT7 study guide + handouts) / variables agudas OPT --- */
const OPT_SETS={1:[1,2,3],2:[2,3,4],3:[3,4,5],4:[4,5,6],5:[3,4,5]}; // low / medium / high volume
function optReps(ph,role,goal,power){
  if(ph===1)return{lo:12,hi:20};
  if(ph===2)return{lo:8,hi:12};
  if(ph===3)return(goal==='fat'||goal==='general')?{lo:10,hi:15}:(role==='m'?{lo:6,hi:12}:{lo:8,hi:12});
  if(ph===4)return{lo:3,hi:5};
  return power?{lo:8,hi:10}:{lo:3,hi:5};
}

/* --- exercise lists by phase and muscle / listas de ejercicios por fase y músculo --- */
const OP1={ // phase 1: patterns, stable and light / patrones estables y ligeros
 Q:['ballsq','gobsq','bodysq','balstepup','stepup','bwstepup','legpress','bwlunge','revlunge'],
 H:['sldl','goodmorn','dbrdl','bandrdl','kbdl','hexdl','rdl'],
 G:['ballbridge','slbridge','glutebr','bandbridge','hipthrust','frogpump'],
 P:['incpush','pushup','kneepush','bandpress','cablepress','ballpress','dbbench','chestpress'],
 B:['bandrow','invrow','suprow','cablerow','ballrow','dbrow','machrow','latpd'],
 S:['bandohp','dbohp','scaption','machsp','seatpress','ballcombo','cubanrot'],
 I:['bandcurl','dbcurl','cablecurl','hammer','seatdbcurl'],
 T:['bandpd','pushdown','kickback','ohext','ropepd'],
 C:['calf','seatcalf','calfdb']
};
const OP2S={ // strength-focused exercise of a superset / ejercicio de fuerza del superset
 Q:['legpress','gobsq','squat','hacksq','frontsq','stepup'],
 H:['dbrdl','rdl','deadlift','hexdl','goodmorn','legcurl'],
 G:['hipthrust','glutebr','kbdl','sumo'],
 P:['chestpress','dbbench','bench','dbinc','incbench','cablepress'],
 B:['latpd','cablerow','machrow','dbrow','bbrow','assistpu','pullup'],
 S:['machsp','dbohp','seatpress','ohp','arnold'],
 I:['cablecurl','dbcurl','bbcurl','hammer'],
 T:['pushdown','ropepd','ohext','cgbp'],
 C:['calf','seatcalf']
};
const PAIR_ST={ // stability-focused partner (same motion, less stable) / compañero de estabilidad (mismo movimiento, menos estable)
 Q:['slsquat','balsqtd','balstepup','ballunge','latstep','bwlunge'],
 H:['sldl','balrdl','slbridge','legcurlball'],
 G:['slbridge','ballbridge','bandkick'],
 P:['pushup','ballpush','susppush','ballpress','incpush','kneepush'],
 B:['ballrow','suprow','invrow','bandrow','dbrow'],
 S:['scaption','ballcombo','cubanrot','revfly','latraise'],
 I:['balcurl','inccurl','concurl','hammer'],
 T:['kickback','diamondpu','benchdip','bandpd'],
 C:['calfdb']
};
const PAIR_PW={ // power-focused partner for phase 5 / compañero de potencia de la fase 5
 Q:['squatjump','tuckjump','boxjump','depthjump','lungejump','powerstep','jumpsquatband'],
 H:['tuckjump','kbpower','broadjump','kbswing','squatjump'],
 G:['broadjump','kbpower','skaterjump'],
 P:['mbchestpass','plyopush','mbchestthrow'],
 B:['mbwood','mbslam','mbrot'],
 S:['mbsoccer','mbchestthrow','mbslam']
};
const OP4={ // phase 4: heavy lifts / levantamientos pesados
 Q:['squat','legpress','hacksq','frontsq','gobsq'],
 H:['rdl','deadlift','hexdl','dbrdl','sldl'],
 G:['hipthrust','sumo','kbdl'],
 P:['bench','incbench','dbbench','dbinc','chestpress','declbench','decldb'],
 B:['bbrow','latpd','cablerow','bentrow','tbar','pullup','machrow','dbrow'],
 S:['ohp','dbohp','machsp','latraise','reardelt','seatpress'],
 I:['bbcurl','hammer','cablecurl','ezcurl','dbcurl'],
 T:['cgbp','pushdown','skull','ropepd'],
 C:['calf','seatcalf']
};
const OACT_CORE={
 1:['glutebr','supermanback','plank','sideplank','ballbridge','firehydrant','pallof','deadbug','birddog','ballplank'],
 2:['ballcrunch','hyperext','cablelift','cablechop','revcrunch','cablerot','pallof','kneeup','cablecr','crunch','bicycle'],
 5:['pallof','cablelift','cablerot','cablechop','ballcrunch','revcrunch','hyperext','mountain']
};
const OACT_BAL={
 1:['balslreach','balsl','balwind','balfoam','baltoe','balrdl'],
 2:['balsqtd','balstepup','ballunge','balrdl','balslreach','balwind','baltoe'],
 5:['balhop','balsqtd','ballunge','balstepup','balrdl']
};
const OSK={1:['squatjump','powerstep','skaterjump','boxjump'],2:['boxjump','lungejump','powerstep','squatjump','skaterjump'],3:['boxjump','powerstep','lungejump','skaterjump','squatjump']};
const OSAQ=['ladder','coneshuffle','shuttle','highknees','buttkick','sprint'];
const OCC=['plank','sideplank','hollow','birddog'];
const OCARDIO=['treadmill','bike','rower','statbike','elliptical','walk'];

/* --- day layout by phase / reparto de días por fase --- */
/* famous splits, adapted: id -> days by number of days a week / divisiones famosas adaptadas */
const SPLITS_FAM={
  ul:{2:['up','oLow'],3:['up','oLow','up'],4:['up','oLow','up','oLow'],5:['up','oLow','up','oLow','up']},
  ppl:{3:['oPush','oPull','oLeg'],4:['oPush','oPull','oLeg','up'],5:['oPush','oPull','oLeg','up','oLow']},
  arn:{3:['oCB','arms','oLeg'],4:['oCB','arms','oLeg','oCB'],5:['oCB','arms','oLeg','oCB','arms']},
  bro:{5:['oChest','oBack','oSho','arms','oLeg']},
  ulppl:{5:['up','oLow','oPush','oPull','oLeg']}
};
const SPLIT_IDS=Object.keys(SPLITS_FAM);
const splitOk=(id,n)=>!!(SPLITS_FAM[id]&&SPLITS_FAM[id][n]);
function optDays(ph,pr){
  const n=pr.n;
  if(pr.split&&splitOk(pr.split,n))return SPLITS_FAM[pr.split][n].slice();
  if(ph<=2||ph===5)return days0('full',n);
  const em=pr.em0||pr.emph;
  const base={2:['up','oLeg'],3:['oCB','oLeg','arms'],4:['oCB','oLeg','up','lowG'],5:['oCB','oLeg','arms','oCB','lowG']}[n].slice();
  if(em==='low'){if(n===3)return['lowG','oCB','oLeg'];if(n===4)return['lowG','oCB','oLeg','arms'];if(n===5)return['lowG','oCB','oLeg','arms','lowG'];}
  if(em==='up'){if(n===4)return['oCB','oLeg','arms','oCB'];if(n===5)return['oCB','oLeg','arms','oCB','arms'];}
  return base;
}
const OSLOTS={ // phase 3 / 4 slots, most important first, alternating muscles / huecos de las fases 3 y 4
 oCB:[['P','m'],['B','m'],['P','a'],['B','a'],['P','a'],['B','a']],
 oLeg:[['Q','m'],['H','m'],['Q','a'],['C','a'],['G','a']],
 arms:[['S','m'],['S','a'],['I','a'],['T','a'],['S','a'],['I','a'],['T','a']],
 lowG:[['G','m'],['H','m'],['Q','a'],['G','a'],['C','a']],
 up:[['P','m'],['B','m'],['S','m'],['P','a'],['B','a'],['I','a'],['T','a']],
 oPush:[['P','m'],['S','m'],['P','a'],['T','m'],['S','a'],['T','a'],['P','a']],
 oPull:[['B','m'],['B','m'],['B','a'],['I','m'],['S','a'],['I','a'],['B','a']],
 oLow:[['Q','m'],['H','m'],['G','a'],['Q','a'],['H','a'],['C','a'],['G','a']],
 oChest:[['P','m'],['P','m'],['P','a'],['P','a'],['P','a'],['P','a']],
 oBack:[['B','m'],['B','m'],['B','a'],['B','a'],['B','a'],['B','a']],
 oSho:[['S','m'],['S','m'],['S','a'],['S','a'],['S','a'],['S','a']]
};
const OCAP={ // resistance exercises per session length (30/45/60/75 min) / ejercicios de resistencia según duración
 1:[3,4,5,5],2:[4,6,8,8],3:[3,5,6,7],4:[2,3,4,5],5:[4,6,8,8]
};

function optPick(list,ctx,role,mu){
  let src=list||[];
  const fv=(ctx.fav&&mu&&role==='m')?ctx.fav.filter(id=>muOf(id)===mu):[]; // the person's favorite lifts come first / sus levantamientos favoritos van primero
  if(fv.length)src=fv.concat(src);
  const c=src.filter((id,i,a)=>a.indexOf(id)===i).filter(id=>{const m=meta(id);return exById(id)&&m&&m.lv<=ctx.maxLv&&avail(id,ctx.have)&&!ctx.day[id]&&!prefBad(id)&&stressLvl(id,ctx.L)<=1;});
  const isF=id=>fv.indexOf(id)>=0?0:1;
  c.sort((a,b)=>(stressLvl(a,ctx.L)-stressLvl(b,ctx.L))||(isF(a)-isF(b))||((ctx.used[a]||0)-(ctx.used[b]||0)));
  if(c.length&&isF(c[0])===0)return c[0];
  return persPick(c);
}
function optTake(id,ctx){ctx.day[id]=1;ctx.used[id]=(ctx.used[id]||0)+1;return id;}
/* build one item / arma un ejercicio */
function optItem(eid,o,ctx){
  const m=exMode(eid),it={eid:eid,sets:Math.max(1,Math.min(6,o.sets)),lo:o.lo,hi:o.hi,u:'r',r:o.r,cn:stressJoints(eid,ctx.L,1),sec:o.sec,tp:o.tp,rs:o.rs};
  if(o.rz)it.rz=o.rz;
  if(o.ss)it.ss=o.ss;
  if(o.nt)it.nt=o.nt;
  if(m==='t'){it.u='m';it.lo=o.hold?o.hold[0]:0.5;it.hi=o.hold?o.hold[1]:1;}
  return PREFPROF?bwFix(it,PREFPROF):it;
}

function genOpt(prof){
  const ph=optPhase(prof),vi={lo:0,md:1,hi:2}[prof.vol]!=null?{lo:0,md:1,hi:2}[prof.vol]:1;
  const L=injLetters(prof.inj),lve=lvlEff(prof),maxLv=(prof.cond||lve==='new')?1:2,have=prof.have;
  const dp=dayPlan(prof),dgoal=dp.goals,days=optDays(ph,prof);
  const LIX={30:0,45:1,60:2,75:3};
  const sets=(prof.split&&splitOk(prof.split,prof.n)&&ph===1)?Math.max(2,OPT_SETS[ph][vi]):OPT_SETS[ph][vi],used={};
  const fm=[];prof.focus.forEach(k=>FOCUS_MU[k].forEach(m=>{if(fm.indexOf(m)<0)fm.push(m);}));
  const sk=prof.skills||[],em=prof.em0||prof.emph;
  const lowerL='QHGC',upperL='PBSIT';
  // which focus muscles each day already trains / qué músculos de enfoque trabaja ya cada día
  const want=Math.min(prof.ff||2,prof.n);
  const focusDays={};fm.forEach(m=>{focusDays[m]=0;});
  const ds=days.map((k,di)=>{
    const short=prof.sh>0&&di>=prof.n-prof.sh,dl=short?30:prof.len,cap=OCAP[ph][LIX[dl]!=null?LIX[dl]:2];
    const g=dgoal[di],ctx={have:have,L:L,maxLv:maxLv,used:used,day:{},fav:ph>=2?prof.fav:[]},res=[],wyx={};
    const alt=di%2===1; // alternate legs: squat day / hinge day / alterna piernas: sentadilla / bisagra
    let slots=[]; // [muscle, role]
    const famDay=!!(prof.split&&splitOk(prof.split,prof.n)&&OSLOTS[k]);
    if(famDay){ // chosen split: its day layout in every phase / división elegida: su reparto en todas las fases
      const np=ph===1||ph>=3?cap:Math.max(1,Math.floor(cap/2));
      slots=OSLOTS[k].slice(0,np).map(s=>s.slice());
    }else if(ph===1){
      const ord=alt?['H','P','B','Q','S']:['Q','P','B','H','S'],keep=ord.slice(0,cap);
      slots=['Q','H','P','B','S'].filter(x=>keep.indexOf(x)>=0).map(x=>[x,'m']);
    }else if(ph===2||ph===5){
      const ord=alt?['H','B','P','S']:['Q','P','B','S'],np=Math.max(1,Math.floor(cap/2)),keep=ord.slice(0,np);
      slots=['Q','H','P','B','S'].filter(x=>keep.indexOf(x)>=0).map(x=>[x,'m']);
      if(prof.n>=4){ // 4-5 days: split the pairs so each muscle is trained 2-3 times, not every day / 4-5 días: reparte los pares
        const o4=alt?['H','B',ph===2?'I':'S']:['Q','P','S'];
        slots=o4.slice(0,Math.max(2,Math.min(3,np))).map(x=>[x,'m']);
      }
      if(prof.n<4&&ph===2&&cap>=8&&dl===75&&(g==='muscle'||g==='bodybuilding'))slots.push([alt?'T':'I','m']);
    }else{
      const base=OSLOTS[k]||OSLOTS.up;
      slots=base.slice(0,cap).map(s=>s.slice());
    }
    // emphasis in full-body phases: swap shoulders for a lower-body slot / énfasis en fases de cuerpo completo
    if(!famDay&&(ph<=2||ph===5)&&em==='low'&&slots.length>=4&&slots.some(s=>s[0]==='S')){slots=slots.filter(s=>s[0]!=='S');slots.push([alt?'Q':'H','m']);}
    if(!famDay&&(ph<=2||ph===5)&&em==='up'&&slots.length>=4&&slots.filter(s=>s[0]==='Q'||s[0]==='H').length>1){const i=slots.map(s=>s[0]).lastIndexOf(alt?'Q':'H');if(i>=0)slots.splice(i,1);}
    // extras: emphasis and focus muscles / extras: énfasis y músculos de enfoque
    const ex=[];
    const has=m=>slots.some(s=>s[0]===m);
    if(dl>=45){
      if(em==='low'&&(has('Q')||has('H'))&&!has('G'))ex.push(['G','a',0,'rzEmphLow']);
      if(em==='up'&&(has('P')||has('B'))){if(!has('I'))ex.push(['I','a',0,'rzEmphUp']);if(!has('T'))ex.push(['T','a',0,'rzEmphUp']);}
    }
    if(dl>=45&&prof.work){ // desk or standing job: posture and calves / trabajo sentado o de pie
      const upD=slots.some(s=>'PBS'.indexOf(s[0])>=0),loD=slots.some(s=>'QH'.indexOf(s[0])>=0);
      if(prof.work==='sit'){
        if(upD&&!has('B')){ex.push(['B','a',0,'rzSit']);wyx.sit=1;}
        else if(loD&&!has('G')){ex.push(['G','a',0,'rzSit']);wyx.sit=1;}
      }else if(prof.work==='stand'&&loD&&!has('C')){ex.push(['C','a',0,'rzStand']);wyx.stand=1;}
    }
    fm.forEach(m=>{
      if(m==='A')return;
      const half=lowerL.indexOf(m)>=0?'l':'u';
      if(has(m)){focusDays[m]++;slots.forEach(s=>{if(s[0]===m)s[2]=1;});return;}
      const hasHalf=slots.some(s=>(half==='l'?lowerL:upperL).indexOf(s[0])>=0);
      if(focusDays[m]<want&&(hasHalf||(!famDay&&(ph<=2||ph===5)))){focusDays[m]++;ex.push([m,'a',1]);}
    });
    const slotsAll=slots.concat(ex);
    // -- activation (core + balance) / activación
    const ac=[],actPh=ph>=5?5:(ph>=2?2:1);
    const nCore=dl===30?1:2,nBal=sk.indexOf('balance')>=0?2:1;
    const aset=ph===1?[1,2,2][vi]:(vi===0?1:2);
    for(let i=0;i<nCore;i++){
      const id=optPick(OACT_CORE[actPh],ctx,'c');if(!id)break;optTake(id,ctx);
      ac.push(optItem(id,{sets:aset,lo:ph===1?12:10,hi:ph===1?15:12,r:'c',sec:'ac',tp:ph===5?'sl':(ph===1?'sl':'md'),rs:0,rz:'rzCore'},ctx));
    }
    for(let i=0;i<nBal;i++){
      const id=optPick(OACT_BAL[actPh],ctx,'z');if(!id)break;optTake(id,ctx);
      ac.push(optItem(id,{sets:aset,lo:ph===1?12:10,hi:ph===1?16:12,r:'z',sec:'ac',tp:ph===5?'ct':(ph===1?'sl':'md'),rs:ph===1?90:60,nt:'ntBal',rz:'rzBal'},ctx));
    }
    // -- skill development (plyometric / SAQ) / habilidad
    const skl=[],lowDay=slots.some(s=>'QH'.indexOf(s[0])>=0);
    const wantPly=ph<=3&&lowDay&&((g==='fat'||g==='general')||sk.indexOf('power')>=0)&&dl>=45;
    if(wantPly){
      const id=optPick(OSK[ph],ctx,'y');
      if(id){optTake(id,ctx);skl.push(optItem(id,{sets:ph===1?(vi===0?1:2):2,lo:8,hi:8,r:'y',sec:'sk',tp:ph===1?'sl':'rp',rs:ph===1?90:60,nt:ph===1?'ntLand':undefined,rz:'rzSk'},ctx));}
    }
    if(sk.indexOf('speed')>=0&&ph<=3&&(di<2)){
      const id=optPick(OSAQ,ctx,'y');
      if(id){optTake(id,ctx);skl.push(optItem(id,{sets:2,lo:0.5,hi:1,r:'y',sec:'sk',tp:'rp',rs:60,rz:'rzSaq'},ctx));}
    }
    // -- resistance / resistencia
    const out=[];let grp=0;
    const rep=(role,power)=>optReps(ph,role,g,power);
    let curRz='rzAcc';
    const mk=(id,role,extra,tp,rs,ss,power)=>{const r=rep(role,power),s=Math.min(6,sets+(extra?1:0));return optItem(id,{sets:s,lo:r.lo,hi:r.hi,r:role,sec:'rs',tp:tp,rs:rs,ss:ss,rz:curRz},ctx);};
    const fall=(mu,role)=>pickFor(mu,role,{have:have,L:L,maxLv:maxLv,used:used,day:ctx.day,hy:false,test:'gen'});
    slotsAll.forEach((s,si)=>{
      const mu=s[0],role=s[1],extra=s[2];
      curRz=s[3]||(extra?'rzFocus':(role==='m'?'rzMus':'rzAcc'));
      if(ph===1){
        const id=optPick(OP1[mu],ctx,role,mu)||fall(mu,role);if(!id)return;optTake(id,ctx);
        out.push(mk(id,role,extra,'sl',0));
      }else if(ph===2||ph===5){
        const id=optPick(OP2S[mu],ctx,role,mu)||fall(mu,role);if(!id)return;optTake(id,ctx);
        const pw=ph===5,single=si>=slots.length; // extras are single exercises / los extras van solos
        const pid=single?null:optPick((pw?PAIR_PW:PAIR_ST)[mu],ctx,role);
        if(pid){
          optTake(pid,ctx);const gl=String.fromCharCode(65+grp++);
          out.push(mk(id,role,extra,ph===5?'ex':'md',0,gl));
          curRz=pw?'rzPairPw':'rzPair';const pit=mk(pid,role,extra,ph===5?'ex':'sl',ph===5?120:60,gl,pw);
          if(pw){pit.sets=Math.min(6,sets+(extra?1:0));}
          out.push(pit);
        }else out.push(mk(id,role,extra,ph===5?'ex':'md',ph===5?120:60));
      }else if(ph===3){
        const id=optPick([],ctx,role,mu)||fall(mu,role);if(!id)return;optTake(id,ctx);
        out.push(mk(id,role,extra,'md',30));
      }else{
        const id=optPick(OP4[mu],ctx,role,mu)||fall(mu,role);if(!id)return;optTake(id,ctx);
        out.push(mk(id,role,extra,'ex',('SIT'.indexOf(mu)>=0)?300:180));
      }
    });
    // -- client's choice / elección del cliente
    const cc=[];
    if(dl>=45||fm.indexOf('A')>=0){
      const id=optPick(OCC,ctx,'c');
      if(id){optTake(id,ctx);cc.push(optItem(id,{sets:2,lo:0.5,hi:1,r:'c',sec:'cc',tp:'sl',rs:60,hold:[0.5,1],rz:'rzCc'},ctx));}
    }
    if(fm.indexOf('A')>=0&&di<want+1){
      const id=optPick(OACT_CORE[2],ctx,'c');
      if(id){optTake(id,ctx);cc.push(optItem(id,{sets:2,lo:10,hi:12,r:'c',sec:'cc',tp:'md',rs:60,rz:'rzCc'},ctx));}
    }
    if(sk.indexOf('endurance')>=0&&di<2){
      const id=optPick(OCARDIO,ctx,'e');
      if(id){optTake(id,ctx);cc.push({eid:id,sets:1,lo:15,hi:20,u:'m',r:'e',cn:'',sec:'cc',rz:'rzCard'});}
    }
    const mi=out.find(e=>e.r==='m');if(mi){mi.mn=1;mi.rz=(ctx.fav&&ctx.fav.indexOf(mi.eid)>=0)?'rzFav':'rzMain';}
    // why this day looks like this / por qué el día es así
    const wy=famDay||ph===3||ph===4?['wyK'+k,'wyPh'+ph]:['wyPh'+ph];
    if(famDay)wy.splice(1,0,'wySplit|'+prof.split);
    if(mi)wy.push('wyMain|'+mi.eid);
    if(ctx.fav&&ctx.fav.length){const f=out.find(e=>ctx.fav.indexOf(e.eid)>=0&&e!==mi);if(f)wy.push('wyFav|'+f.eid);else if(mi&&ctx.fav.indexOf(mi.eid)>=0)wy.splice(wy.indexOf('wyMain|'+mi.eid),1,'wyFav|'+mi.eid);}
    const dm=out.map(e=>muOf(e.eid)).join('');
    let nf=0;prof.focus.forEach(fk=>{if(nf<2&&FOCUS_MU[fk].some(m=>dm.indexOf(m)>=0)){wy.push('wyFocus|'+fk);nf++;}});
    if(dl>=45&&em==='low'&&dm.indexOf('G')>=0)wy.push('wyEmphlow');
    if(dl>=45&&em==='up'&&(dm.indexOf('I')>=0||dm.indexOf('T')>=0))wy.push('wyEmphup');
    if(wyx.sit)wy.push('wySit');if(wyx.stand)wy.push('wyStand');
    if(prof.inj.length)wy.push('wyInj|'+prof.inj[0]);
    if(prof.avoid.length)wy.push('wyAvoid|'+prof.avoid[0]);
    if(short)wy.push('wyShort');
    wy.push('wyOrd');
    if(di===0&&lve!==prof.lvl&&(prof.pu||prof.as))wy.push((prof.as&&asStabFail(prof)?'wyStab|':'wyLvl|')+lve);
    const exs=ac.concat(skl,out,cc);
    const dd=prof.mix?{k:k,g:g,ex:exs}:{k:k,ex:exs};dd.wy=wy.slice(0,8);return dd;
  });
  return{goal:prof.goal,n:prof.n,lvl:prof.lvl,t0:Date.now(),ct:0,cur:0,ds:ds,wd:defaultWd(ds),wu:0,checks:[],prof:prof,ph:ph,pt:Date.now()};
}

/* --- warm-up and cool-down text (CPT7 template) / calentamiento y enfriamiento --- */
function optWarm(d,p,cool){
  const cl=WD_DT[d.k]||'lu',key=cl==='l'?'l':(cl==='u'?'u':'lu');
  const fat=goalsOf(p.prof).indexOf('fat')>=0;
  let h='<div class="card optb"><b>'+(cool?t('optCd'):t('optWu'))+'</b><ul class="optul">';
  if(!cool&&fat)h+='<li>'+t('optCardio')+'</li>';
  h+='<li>'+t('optFoam',t('optM_'+key))+'</li>';
  h+='<li>'+(cool?t('optStatic',t('optM_'+key)):t('optActive',t('optM_'+key)))+'</li>';
  if(!cool)h+='<li>'+t('optDyn')+'</li>';
  if(cool&&fat)h+='<li>'+t('optCardioCd')+'</li>';
  return h+'</ul></div>';
}
const OPT_TP={sl:'tpSl',md:'tpMd',ex:'tpEx',ct:'tpCt',rp:'tpRp'};
function optRestTxt(s){return s===0?t('rsNone'):(s>=120?t('rsMin',fmtNum(s/60,1)):t('rsSec',s));}
/* one line with tempo and rest / una línea con tempo y descanso */
function optLine(e){
  if(!e||!e.tp)return'';
  return t(OPT_TP[e.tp]||'tpMd')+' · '+optRestTxt(e.rs|0);
}
/* superset labels A1 A2... / etiquetas de superset */
function optSsLabel(d,ei){
  const e=d.ex[ei];if(!e||!e.ss)return'';
  let n=0;for(let i=0;i<=ei;i++){if(d.ex[i].ss===e.ss)n++;}
  return e.ss+n;
}
function optSsLabelAct(x){ // label for the exercise in the running workout / etiqueta en el entrenamiento en curso
  if(!ACT||!x.tg||!x.tg.ss)return'';
  let n=0;for(const y of ACT.ex){if(y.tg&&y.tg.ss===x.tg.ss)n++;if(y===x)break;}
  return x.tg.ss+n;
}
const OPT_SEC=['ac','sk','rs','cd','cc'];

/* --- phase screen: what each phase is, change phase / pantalla de fases --- */
let PHS=0;
function phWeek(p){return Math.min(OPT_WEEKS+9,Math.floor((Date.now()-(p.pt||p.t0))/(7*864e5))+1);}
function phLine(p){
  if(!p||!p.ph)return'';
  return t('phNow',p.ph,t('ph_'+p.ph))+' · '+t('phWeek',Math.min(phWeek(p),OPT_WEEKS),OPT_WEEKS);
}
function phOpen(){
  const p=DATA.plan;if(!p||!p.ph)return;
  PHS=p.ph;phDraw();
}
function phSet(v){PHS=v;phDraw();}
function phDraw(){
  const p=DATA.plan;if(!p)return;
  const al=optAllowed(p.prof),heavy=p.prof.have.some(k=>OPT_HEAVY.test(k));
  sheet('<div class="form"><div class="pick-h"><h3>🎯 '+t('phT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('phP')+'</p><p class="sm"><b>'+phLine(p)+'</b></p>'+
    '<div class="chips wrap">'+al.map(v=>'<button class="chip'+(PHS===v?' on':'')+'"'+(!heavy&&v>2?' disabled':'')+' onclick="phSet('+v+')">'+t('phShort',v)+'</button>').join('')+'</div>'+
    '<div class="card tip"><b>'+t('ph_'+PHS)+'</b><p class="sm">'+t('phd_'+PHS)+'</p><p class="muted sm">'+t('phv_'+PHS)+'</p></div>'+
    (!heavy?'<p class="muted sm">'+t('phNeedW')+'</p>':'')+
    (PHS!==p.ph?'<div class="row"><button class="btn pri" onclick="phApply()">'+t('phApply',PHS)+'</button></div><p class="muted sm">'+t('phApplyP')+'</p>':'')+
    '<div class="row"><button class="btn wide" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
function phApply(){planRegen({ph:PHS});sheetClose();toast(t('planReady'));}


/* --- hybrid / military / runner: keep the test-specific exercises and runs, put them in the OPT session structure ---
   --- híbrido / militar / corredor: se conservan los ejercicios y carreras específicos, dentro de la estructura de sesión OPT --- */
function optWrap(pl,prof){
  const ph=optPhase(prof),vi={lo:0,md:1,hi:2}[prof.vol];
  const sets=Math.max(2,OPT_SETS[ph][vi!=null?vi:1]),L=injLetters(prof.inj),maxLv=(prof.cond||lvlEff(prof)==='new')?1:2,have=prof.have;
  const actPh=ph>=5?5:(ph>=2?2:1),used={},rank={ac:0,sk:1,rs:2,cd:3,cc:4};
  pl.ds.forEach((d,di)=>{
    const ctx={have:have,L:L,maxLv:maxLv,used:used,day:{}};
    d.ex.forEach(e=>{ctx.day[e.eid]=1;});
    const grp={ac:[],sk:[],rs:[],cd:[],cc:[]};
    let main=null;
    d.ex.forEach(e=>{
      const mu=muOf(e.eid),m=exMode(e.eid);
      if(e.eid==='run'){e.sec='cd';e.rz='rzRun';grp.cd.push(e);}
      else if(mu==='K'||mu==='D'||e.r==='e'){e.sec='cd';e.rz=mu==='D'?'rzTest':'rzCap';grp.cd.push(e);}
      else if(mu==='W'||mu==='V'||e.r==='p'){e.sec='sk';e.rz=mu==='V'?'rzSaq':'rzSk';e.tp='rp';e.rs=60;grp.sk.push(e);}
      else if(mu==='Z'){e.sec='ac';e.rz='rzBal';e.tp='sl';e.rs=60;grp.ac.push(e);}
      else if(mu==='A'||e.r==='c'){e.sec='cc';e.rz='rzCc';e.tp='sl';e.rs=60;grp.cc.push(e);}
      else{
        e.sec='rs';
        if(m!=='t'){
          const rr=optReps(ph,e.r==='m'?'m':'a',prof.goal,false),pu=/pullup|chinup|assistpu/.test(e.eid);
          if(!pu){e.lo=rr.lo;e.hi=rr.hi;bwFix(e,prof);}
          e.sets=Math.min(6,sets);
        }
        e.tp=ph===1?'sl':(ph===5?'ex':'md');e.rs=ph===1?0:(ph===5?120:60);
        if(!main&&e.r==='m'){main=e;e.mn=1;e.rz='rzMain';}else e.rz=e.r==='m'?'rzMus':'rzAcc';
        grp.rs.push(e);
      }
    });
    // phases 2 and 5: pair the big lifts with a stable or explosive partner / fases 2 y 5: se emparejan los ejercicios grandes
    if((ph===2||ph===5)&&prof.len>=45){
      const out=[];let gi=0,np=0;
      grp.rs.forEach(e=>{
        out.push(e);
        const mu=muOf(e.eid),lst=(ph===5?PAIR_PW:PAIR_ST)[mu];
        if(e.r==='m'&&lst&&np<3&&exMode(e.eid)!=='t'&&!e.ss){
          const pid=optPick(lst,ctx,'m');
          if(pid){
            optTake(pid,ctx);const gl=String.fromCharCode(65+gi++);np++;
            e.ss=gl;e.rs=0;
            const pit=optItem(pid,{sets:e.sets,lo:ph===5?8:e.lo,hi:ph===5?10:e.hi,r:e.r,sec:'rs',tp:ph===5?'ex':'sl',rs:ph===5?120:60,ss:gl,rz:ph===5?'rzPairPw':'rzPair'},ctx);
            out.push(pit);
          }
        }
      });
      grp.rs=out;
    }
    // activation: core + balance / activación
    const hasRs=grp.rs.length>0,nCore=hasRs?(prof.len===30?1:2):1,add=[];
    for(let i=0;i<nCore;i++){
      const id=optPick(OACT_CORE[actPh],ctx,'c');if(!id)break;optTake(id,ctx);
      add.push(optItem(id,{sets:ph===1?[1,2,2][vi!=null?vi:1]:(vi===0?1:2),lo:ph===1?12:10,hi:ph===1?15:12,r:'c',sec:'ac',tp:ph<=1||ph===5?'sl':'md',rs:0,rz:'rzCore'},ctx));
    }
    if(hasRs&&!grp.ac.length){
      const id=optPick(OACT_BAL[actPh],ctx,'z');
      if(id){optTake(id,ctx);add.push(optItem(id,{sets:2,lo:10,hi:12,r:'z',sec:'ac',tp:ph===1?'sl':'md',rs:ph===1?90:60,nt:'ntBal',rz:'rzBal'},ctx));}
    }
    d.ex=add.concat(grp.ac,grp.sk,grp.rs,grp.cd,grp.cc);
    // why this day / por qué este día
    const wy=['wyPerf','wyPh'+ph];
    if(main)wy.push('wyMain|'+main.eid);
    if(prof.test!=='gen'&&grp.cd.some(e=>muOf(e.eid)==='D'))wy.push('wyTest|'+prof.test);
    if(grp.cd.some(e=>e.eid==='run'))wy.push('wyRun');
    const dm=grp.rs.map(e=>muOf(e.eid)).join('');let nf=0;
    prof.focus.forEach(fk=>{if(nf<2&&FOCUS_MU[fk].some(m=>dm.indexOf(m)>=0)){wy.push('wyFocus|'+fk);nf++;}});
    if(prof.inj.length)wy.push('wyInj|'+prof.inj[0]);
    if(prof.avoid.length)wy.push('wyAvoid|'+prof.avoid[0]);
    wy.push('wyOrd');
    d.wy=wy.slice(0,8);
  });
  pl.ph=ph;pl.pt=Date.now();
  return pl;
}
