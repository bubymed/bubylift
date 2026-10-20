/* Personalization (v25): preferences, favorites, work type, short days, level test, rotation, and plan adjustment from real logs.
   Personalización (v25): preferencias, favoritos, tipo de trabajo, días cortos, prueba de nivel, rotación y ajuste del plan con datos reales. */

const AVOID=['jump','floor','barbell','machine','ball','overhead'];
const WORKS=['sit','stand'];
/* v39 start assessment: every answer also accepts 'x' = not sure (counts as the most careful tier) / prueba de inicio: 'x' = no estoy seguro */
const AS_OPTS={pl:['p0','p1','p2','p3'],bal:['b0','b1','b2'],sq:['q0','q1','q2'],pull:['r0','r1','r2','r3'],leg:['l0','l1','l2','l3'],hist:['h0','h1','h2']};
const AS_KEYS=['pl','bal','sq','pu','pull','leg','hist'];
const asN=v=>(typeof v==='string'&&/^[a-z](\d)$/.test(v))?+v[1]:0; // p0..p3 → 0..3, 'x' → 0
function asStabFail(pr){return pr.sq!=='q2'||asN(pr.pl)<1||asN(pr.bal)<1;} // movement control first (OPT phase 1) / el control del movimiento primero
function asStr(pr){return asN(pr.pu)+asN(pr.pull)+asN(pr.leg);} // 0..9
function asLevel(pr){
  const ord=['new','some','adv'],d=Math.max(0,ord.indexOf(pr.lvl));
  let a=asStabFail(pr)?0:((asStr(pr)>=6&&asN(pr.hist)>=1)?2:1);
  if(a<d)return ord[a];                       // never start above what the tests show / nunca empezar por encima de lo que muestran las pruebas
  if(d===0&&a>=1&&asStr(pr)>=6)return 'some'; // strong and stable beginners start one step up / principiantes fuertes y estables suben un paso
  return ord[d];
}
const PUS=['p0','p1','p2','p3']; // push-ups in one set: under 5 / 5-14 / 15-29 / 30+ / flexiones seguidas
const MAINS=['squat','deadlift','bench','dbbench','pullup','ohp','hipthrust','bbrow','bulgsplit','rdl']; // lifts a person can ask for / levantamientos que se pueden pedir
const AVOID_T={
  jump:(id,e)=>e.g==='power'||/jump|hop|bound|plyo|burpee|skater|slam|throw/.test(id),
  floor:id=>/crunch|plank|bridge|hollow|superman|bird|deadbug|situp|legraise|bicycle|frogpump|thrust/.test(id),
  barbell:(id,e)=>e.e==='barbell',
  machine:(id,e)=>e.e==='machine',
  ball:(id,e)=>e.e==='ball',
  overhead:id=>/ohp|overhead|machsp|shpress|arnold|pushpress|snatch/.test(id)
};
let PREFPROF=null; // profile being built, read by the pickers / perfil que se está armando

/* an exercise the person does not want (style they avoid, or one they dropped) / ejercicio que la persona no quiere */
function prefBad(eid,pr){
  pr=pr||PREFPROF;if(!pr)return false;
  if(pr.no&&pr.no.indexOf(eid)>=0)return true;
  const a=pr.avoid;if(!a||!a.length)return false;
  const e=exById(eid);if(!e||e.custom)return false;
  for(let i=0;i<a.length;i++){const f=AVOID_T[a[i]];if(f&&f(eid,e))return true;}
  return false;
}
/* small stable hash so every person gets their own mix / hash estable: cada persona recibe su propia mezcla */
function ohash(sd,rt,s){
  let h=2166136261;const str=sd+':'+rt+':'+s;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
/* choose among the best few candidates, by person and rotation / elige entre los mejores candidatos según la persona y la rotación */
function persPick(c){
  if(!c.length)return null;
  const pr=PREFPROF;if(!pr||!pr.sd)return c[0];
  return c[ohash(pr.sd,pr.rt|0,c[0])%Math.min(4,c.length)];
}
/* level: self-reported, adjusted by the push-up test / nivel: el declarado, ajustado por la prueba de flexiones */
function lvlEff(pr){
  if(pr.as)return asLevel(pr);
  const l=pr.lvl,u=pr.pu;
  if(!u)return l;
  if(l==='some'&&u==='p0')return 'new';
  if(l==='adv'&&(u==='p0'||u==='p1'))return 'some';
  if(l==='new'&&u==='p3')return 'some';
  return l;
}

/* ---------- wizard step "About you" / paso del asistente "Sobre ti" ---------- */
function pwFav(k){const a=PW.fav,i=a.indexOf(k);if(i>=0)a.splice(i,1);else if(a.length<4)a.push(k);wizDraw();}
/* bodyweight moves are not loaded lifts: reps go by what the person can do, not by a strength rep range
   los movimientos con peso corporal no son levantamientos con carga: las repeticiones dependen de lo que la persona puede hacer */
const BW_PULL=/pullup|chinup|assistpu/;
function bwReps(eid,pr){
  const lv=lvlEff(pr),low='QHGC'.indexOf(muOf(eid))>=0;
  let r=lv==='new'?[8,12]:(lv==='some'?[12,20]:[15,25]);
  if(pr.pu==='p0')r=[5,8];else if(pr.pu==='p1')r=[8,12];else if(pr.pu==='p2')r=[12,20];else if(pr.pu==='p3')r=[20,30];
  if(low&&!pr.pu)r=lv==='new'?[12,15]:(lv==='some'?[15,25]:[20,30]);
  return{lo:r[0],hi:r[1]};
}
function bwFix(it,pr){
  if(!it||it.u==='m'||exMode(it.eid)!=='bw'||BW_PULL.test(it.eid)||(it.r!=='m'&&it.r!=='a'))return it;
  const r=bwReps(it.eid,pr);it.lo=r.lo;it.hi=r.hi;return it;
}

/* ---------- why each day looks like this / por qué cada día es así ---------- */
function wyText(s){
  const a=String(s).split('|'),k=a[0];let x=a[1]||'';
  if(k==='wyMain'||k==='wyFav')x=exName(x);
  else if(k==='wyTest')x=t('te_'+x);
  else if(k==='wySplit')x=t('spl_'+x);
  else if(k==='wyFocus')x=t('fm_'+x);
  else if(k==='wyInj')x=t('inj_'+x);
  else if(k==='wyAvoid')x=t('av_'+x);
  else if(k==='wyLvl'||k==='wyStab')x=t('pl_'+x);
  return t(k,x);
}
function wyCard(d){
  if(!d||!d.wy||!d.wy.length)return'';
  return'<div class="card optb why"><b>'+t('wyT')+'</b><ul class="optul">'+d.wy.map(s=>'<li>'+esc(wyText(s))+'</li>').join('')+'</ul></div>';
}

/* ---------- refresh the exercise mix / renovar la mezcla de ejercicios ---------- */
function planShuffleAsk(){ask(t('shufAsk'),t('shufGo'),function(){planShuffle();},false);}
function planShuffle(){
  const p=DATA.plan;if(!p)return;
  planRegen({rt:((p.prof.rt|0)+1)%1000});planOpen();toast(t('shufDone'));
}

/* ---------- adjust the plan from what was really logged / ajuste del plan con lo registrado ---------- */
function adaptScan(p){
  const out=[];if(!p)return out;
  const logs=planDone();
  let shortN=0,rsN=0;
  p.ds.forEach((d,di)=>{
    const ss=logs.filter(w=>w.pl===di).sort((a,b)=>b.t-a.t).slice(0,3);
    if(ss.length<2)return;
    d.ex.forEach(e=>{
      const at=ss.map(w=>w.ex.find(x=>x.eid===e.eid));
      const last2=at.slice(0,2);
      if(last2.every(x=>!x)){out.push({k:'skip:'+di+':'+e.eid,kind:'skip',d:di,eid:e.eid});return;}
      if(e.sec==='rs'&&last2.every(x=>x)){
        rsN++;if(last2.every(x=>x.sets.length<e.sets))shortN++;
      }
      if(ss.length>=3&&exMode(e.eid)==='wr'&&e.r==='m'&&at.every(x=>x&&x.sets.length)){
        const top=x=>Math.max.apply(null,x.sets.map(s=>(s.w||0)*1000+(s.r||0)));
        // newest first: stuck when the newest is not better than the oldest / más nueva primero: estancado si la nueva no supera a la vieja
        if(top(at[0])<=top(at[2]))out.push({k:'stall:'+di+':'+e.eid,kind:'stall',d:di,eid:e.eid});
      }
    });
  });
  if(rsN>=3&&shortN/rsN>=0.5&&p.prof.vol!=='lo')out.push({k:'vol',kind:'vol',to:p.prof.vol==='hi'?'md':'lo'});
  return out.slice(0,6);
}
function adaptApply(p,list){
  const pr=p.prof;let n=0;
  list.forEach(a=>{
    if(a.kind==='vol'){
      p.ds.forEach(d=>d.ex.forEach(e=>{if(e.sec==='rs'&&e.sets>2)e.sets--;}));
      pr.vol=a.to;n++;return;
    }
    const d=p.ds[a.d],ei=d?d.ex.findIndex(e=>e.eid===a.eid):-1;if(ei<0)return;
    const have=pr.have,L=injLetters(pr.inj),skip={};
    d.ex.forEach(e=>{skip[e.eid]=1;});(pr.no||[]).forEach(id=>{skip[id]=1;});
    const cs=swapCands(a.eid,have,L,skip,lvlEff(pr)==='new'?1:2).filter(c=>!prefBad(c.id,pr));
    pr.no=(pr.no||[]).concat([a.eid]).slice(-40);
    if(cs.length){d.ex[ei].eid=cs[0].id;n++;}
    else if(a.kind==='skip'){d.ex.splice(ei,1);n++;}
  });
  return n;
}
let ADP=[];
function adaptCk(i){const x=ADP[i];if(x)x.on=!x.on;chkDraw();}
function adaptHtml(){
  if(!ADP.length)return'';
  return'<div class="lbl">'+t('adT')+'</div><p class="muted sm">'+t('adP')+'</p>'+
    ADP.map((a,i)=>'<label class="adrow"><input type="checkbox" '+(a.on?'checked ':'')+'onchange="adaptCk('+i+')"> <span>'+esc(t('ad_'+a.kind,a.eid?exName(a.eid):'',a.to?t('vol_'+a.to):''))+'</span></label>').join('');
}

/* why each exercise is where it is / por qué cada ejercicio está donde está */
function rzText(e){
  const g=exById(e.eid),gn=g?t('g_'+g.g).toLowerCase():'';
  return t(e.rz,gn);
}
/* why this plan is yours: every choice traced back to what the person said / por qué este plan es tuyo */
function planWhyCard(p){
  if(!p||!p.ph)return'';
  const pr=p.prof,li=[],heavy=pr.have.some(k=>OPT_HEAVY.test(k)),lv=lvlEff(pr);
  let why;
  if(pr.ph)why='wpOwn';else if(pr.cond)why='wpCond';else if(!heavy&&optAuto(pr)>2)why='wpEq';else why=lv==='new'?'wpNew':(lv==='some'?'wpSome':'wpAdv');
  li.push(t('wpGoal',goalTxt(pr),t('ph_'+p.ph))+' '+t(why));
  if(pr.split&&pr.split!=='auto'){
    const f=mu=>p.ds.filter(d=>d.ex.some(e=>e.sec==='rs'&&muOf(e.eid)===mu)).length;
    li.push(t('wpSplit',t('spl_'+pr.split),f('P'),f('B'),f('Q'))+(p.ph<3||p.ph===5?' '+t('wpSplitPh'):''));
  }
  li.push(t('wpDays',pr.n,pr.len)+(pr.sh?' '+t('wpShort',pr.sh):''));
  li.push(t('wpVol',t('vol_'+pr.vol)));
  if(pr.focus.length)li.push(t('wpFocus',pr.focus.map(k=>t('fm_'+k)).join(', ')));
  if(pr.work)li.push(t('wpWork_'+pr.work));
  if(pr.inj.length)li.push(t('wpInj',pr.inj.map(k=>t('inj_'+k)).join(', ')));
  if(pr.avoid.length)li.push(t('wpAvoid',pr.avoid.map(k=>t('av_'+k)).join(', ')));
  if(pr.fav.length)li.push(t('wpFav',pr.fav.map(k=>exName(k)).join(', ')));
  li.push(t('wpEquip'));
  li.push(t('wpProg'));
  return'<details class="dtl whyp" open><summary><b>'+t('wpT')+'</b></summary><ul class="optul">'+li.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><p class="muted sm">'+t('wpNote')+'</p></details>';
}
