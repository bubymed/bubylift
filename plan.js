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
 lowG:[['G','m'],['H','m'],['Q','a'],['G','a'],['G','a'],['A','c']]
};
const SPLITS={
 bal:{2:['full','full'],3:['full','full','full'],4:['up','lowQ','up','lowG'],5:['push','pull','lowQ','up','lowG']},
 low:{2:['lowG','fullL'],3:['lowG','upLite','lowQ'],4:['lowG','upLite','lowQ','fullL'],5:['lowG','upLite','lowQ','lowG','upLite']},
 up:{2:['full','up'],3:['push','pull','lowQ'],4:['push','pull','lowQ','arms'],5:['push','pull','lowQ','arms','up']}
};
const FOCUS_MU={glutes:['G'],quads:['Q'],hams:['H'],calves:['C'],chest:['P'],back:['B'],shoulders:['S'],arms:['I','T'],abs:['A']};
const PGOALS=['muscle','strength','fat','general'],PLVLS=['new','some','adv'],PEMPH=['bal','low','up'],PSEX=['f','m','x'];
const PDAYKEYS=Object.keys(DAYSPEC).concat(['fullA','fullB','fullC','up1','up2','low1','low2']); // old keys stay valid / las claves viejas siguen válidas
const LENMAX={30:4,45:5,60:6,75:7};

function planScheme(goal,lvl,role){
  const N=lvl==='new',A=lvl==='adv';
  if(role==='c')return{sets:3,lo:8,hi:12};
  const b=goal==='strength'?(role==='m'?(N?{sets:3,lo:6,hi:8}:{sets:4,lo:4,hi:6}):(N?{sets:2,lo:10,hi:12}:{sets:3,lo:8,hi:10}))
    :goal==='muscle'?(role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:4,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:10,hi:15}))
    :(role==='m'?(N?{sets:3,lo:10,hi:12}:{sets:3,lo:8,hi:12}):(N?{sets:2,lo:12,hi:15}:{sets:3,lo:12,hi:15}));
  if(A&&role==='m')b.sets=Math.min(5,b.sets+1);
  return b;
}
function planItem(eid,role,prof,extra){
  const m=exMode(eid),sc=planScheme(prof.goal,prof.lvl,role),L=injLetters(prof.inj);
  const cn=stressJoints(eid,L,1);
  if(m==='t')return{eid:eid,sets:3,lo:0.5,hi:1,u:'m',r:role,cn:cn};
  return{eid:eid,sets:Math.min(6,sc.sets+(extra?1:0)),lo:sc.lo,hi:sc.hi,u:'r',r:role,cn:cn};
}
/* pick the best available exercise for a muscle slot / elige el mejor ejercicio disponible para un hueco */
function pickFor(mu,role,ctx){
  const P=POOL[mu];if(!P)return null;
  const list=(role==='m'?P.m.concat(P.a):P.a.concat(P.m)).filter((x,i,a)=>a.indexOf(x)===i);
  const c=list.filter(id=>{const m=meta(id);return exById(id)&&m&&m.lv<=ctx.maxLv&&avail(id,ctx.have)&&!ctx.day[id]&&stressLvl(id,ctx.L)<=1;});
  c.sort((a,b)=>(stressLvl(a,ctx.L)-stressLvl(b,ctx.L))||((ctx.used[a]||0)-(ctx.used[b]||0)));
  return c[0]||null;
}
function normProf(p){
  const o=Object.assign({sex:'x',goal:'muscle',emph:'bal',focus:[],n:3,len:60,lvl:'new',have:HAVE_PRESETS.gym.slice(),inj:[],cond:0},p||{});
  if(PGOALS.indexOf(o.goal)<0)o.goal='muscle';if(PEMPH.indexOf(o.emph)<0)o.emph='bal';if(PLVLS.indexOf(o.lvl)<0)o.lvl='new';if(PSEX.indexOf(o.sex)<0)o.sex='x';
  o.n=Math.max(2,Math.min(5,Math.round(o.n)||3));if(!LENMAX[o.len])o.len=60;
  o.focus=(o.focus||[]).filter(k=>FOCUS_MU[k]).slice(0,3);o.have=(o.have||[]).filter(k=>HAVE_KEYS.indexOf(k)>=0);o.inj=(o.inj||[]).filter(k=>INJ[k]);o.cond=o.cond?1:0;
  return o;
}
function genPlan(prof0){
  const prof=normProf(prof0);
  const eff=Object.assign({},prof);
  if(prof.cond){eff.lvl='new';if(eff.goal==='strength')eff.goal='general';} // medical condition: keep it gentle / condición médica: algo suave
  const L=injLetters(prof.inj),maxLv=eff.lvl==='new'?1:2,have=prof.have;
  const days=SPLITS[prof.emph][prof.n].slice();
  const fm=[];prof.focus.forEach(k=>FOCUS_MU[k].forEach(m=>{if(fm.indexOf(m)<0)fm.push(m);}));
  let specs=days.map(k=>DAYSPEC[k].map(s=>[s[0],s[1],0]));
  // focus: one extra slot (+1 set) on days that already train it / enfoque: un hueco extra en los días que ya lo trabajan
  specs.forEach(sp=>fm.forEach(m=>{
    let last=-1;sp.forEach((s,i)=>{if(s[0]===m&&s[1]!=='c')last=i;});
    if(last>=0){sp[last][2]=1;sp.splice(last+1,0,[m,'a',1]);}
  }));
  // make sure a focus muscle is trained at least twice a week when possible / que el músculo de enfoque se trabaje 2 veces por semana
  if(prof.n>=3)fm.forEach(m=>{
    const has=()=>specs.filter(sp=>sp.some(s=>s[0]===m)).length;
    const pen=di=>{const k=days[di];return(k==='pull'&&'PT'.indexOf(m)>=0)||(k==='push'&&'BI'.indexOf(m)>=0)?1:0;};
    const order=specs.map((sp,i)=>i).sort((a,b)=>pen(a)-pen(b));
    order.forEach(di=>{
      const sp=specs[di];
      if(has()>=2||sp.some(s=>s[0]===m))return;
      const lowerM=MUS_LOWER.indexOf(m)>=0,upperM=MUS_UPPER.indexOf(m)>=0;
      const hasLower=sp.some(s=>MUS_LOWER.indexOf(s[0])>=0),hasUpper=sp.some(s=>MUS_UPPER.indexOf(s[0])>=0);
      if((m==='A')||(lowerM&&hasLower)||(upperM&&hasUpper)){let ci=sp.length;for(let i=sp.length-1;i>=0;i--){if(sp[i][1]==='c'){ci=i;break;}}sp.splice(ci,0,[m,'a',1]);}
    });
  });
  const maxEx=LENMAX[prof.len];
  const DROP='ITCSBPHGQ'; // least important first / menos importante primero
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
    const ctx={have:have,L:L,maxLv:maxLv,used:used,day:{}},ex=[];
    specs[di].forEach(s=>{
      const id=pickFor(s[0],s[1],ctx);if(!id)return;
      ctx.day[id]=1;used[id]=(used[id]||0)+1;ex.push(planItem(id,s[1],eff,s[2]));
    });
    // too few options for this equipment/injuries: fill with other safe exercises of the same half of the body / pocos ejercicios: completa con otros seguros de la misma mitad del cuerpo
    if(ex.length<3){
      const upperDay=specs[di].some(s=>MUS_UPPER.indexOf(s[0])>=0)&&!specs[di].some(s=>MUS_LOWER.indexOf(s[0])>=0);
      const order=upperDay?['P','B','S','A','T','I']:(specs[di].some(s=>MUS_UPPER.indexOf(s[0])>=0)?['Q','P','B','H','G','A','S']:['Q','H','G','C','A']);
      for(let r=0;r<3&&ex.length<3;r++)order.forEach(mu=>{
        if(ex.length>=Math.min(3,maxEx))return;
        const id=pickFor(mu,'a',ctx);if(!id)return;
        ctx.day[id]=1;used[id]=(used[id]||0)+1;ex.push(planItem(id,mu==='A'?'c':'a',eff,0));
      });
    }
    if(eff.goal==='fat'){const cid=avail('treadmill',have)?'treadmill':'walk';ex.push({eid:cid,sets:1,lo:15,hi:20,u:'m',r:'a',cn:''});}
    return{k:k,ex:ex};
  });
  return{goal:prof.goal,n:prof.n,lvl:prof.lvl,t0:Date.now(),ct:0,cur:0,ds:ds,checks:[],prof:prof};
}
function cleanPlan(p){
  if(!p||typeof p!=='object'||PGOALS.indexOf(p.goal)<0||PLVLS.indexOf(p.lvl)<0||!(p.n>=2&&p.n<=5)||typeof p.t0!=='number'||!Array.isArray(p.ds)||p.ds.length!==p.n)return null;
  const ds=[];
  for(const d of p.ds){
    if(!d||PDAYKEYS.indexOf(d.k)<0||!Array.isArray(d.ex))return null;
    const ex=d.ex.filter(e=>e&&ID_RE.test(String(e.eid))).slice(0,12).map(e=>({eid:String(e.eid),sets:Math.max(1,Math.min(8,Math.round(cn(e.sets)||1))),lo:cn(e.lo)||0,hi:cn(e.hi)||0,u:e.u==='m'?'m':'r',r:['m','a','c'].indexOf(e.r)>=0?e.r:'a',cn:String(e.cn||'').replace(/[^kbsewhan]/g,'').slice(0,8)}));
    if(!ex.length)return null;ds.push({k:d.k,ex:ex});
  }
  const checks=(Array.isArray(p.checks)?p.checks:[]).slice(-40).filter(c=>c&&typeof c.t==='number').map(c=>({t:c.t,bw:cn(c.bw)||null,feel:['easy','right','hard'].indexOf(c.feel)>=0?c.feel:'right'}));
  const prof=normProf(p.prof&&typeof p.prof==='object'?Object.assign({},p.prof,{n:p.n,goal:p.goal,lvl:p.lvl}):{n:p.n,goal:p.goal,lvl:p.lvl,have:HAVE_KEYS.slice()});
  const o={goal:p.goal,n:p.n,lvl:p.lvl,t0:p.t0,ct:cn(p.ct)||0,ds:ds,checks:checks,prof:prof};
  if(Number.isInteger(p.cur)&&p.cur>=0&&p.cur<p.n)o.cur=p.cur;
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
    h='<div class="goalln"><b>'+t('target')+':</b> '+esc(tgText({sets:x.sets.length,lo:x.tg.lo,hi:x.tg.hi,u:x.tg.u}));
    if(s)h+='<br><span class="sg">'+esc(t(s.key,s.w!=null?wShow(s.w)+' '+wUnit():''))+'</span>';
    h+='</div>';
  }
  if(L&&stressLvl(x.eid,L))h+='<div class="goalln warnln">⚠ '+esc(t(stressLvl(x.eid,L)>=2?'injNo':'injCare',jointNames(stressJoints(x.eid,L,1))))+'</div>';
  return h;
}

/* ---------- progress through the plan ---------- */
function planDone(){const p=DATA.plan;return p?DATA.workouts.filter(w=>w.pl!=null&&w.t>=p.t0):[];}
function weekStart(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}
function planNext(){const p=DATA.plan;if(!p)return 0;return Number.isInteger(p.cur)?p.cur%p.n:planDone().length%p.n;}
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
  return d.ex.map((e,ei)=>'<div class="plex"><span><b>'+esc(exName(e.eid))+'</b><small>'+esc(tgText(e))+'</small>'+
    (e.cn?'<small class="warnt">⚠ '+esc(t('injCare',jointNames(e.cn)))+'</small>':'')+'</span>'+
    (withEdit?'<button class="ico" aria-label="'+esc(t('howTo'))+'" onclick="howOpen(\''+e.eid+'\')">ⓘ</button><button class="ico" aria-label="'+esc(t('edit'))+'" onclick="planEdit('+di+','+ei+')">✎</button>':'')+'</div>').join('');
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
  let h='<div class="swp"><div class="swp-h swp-hl">'+t('swSkip')+'</div><div class="swp-h swp-hr">'+t('swChange')+'</div><div class="card plan swp-in" data-l="planSkipAsk" data-r="planPickDay"><div class="plh"><b>'+t('planToday')+'</b><span class="muted sm">'+t('planWeek',planWeek(),p.n)+'</span></div><h3>'+esc(dayName(i))+'</h3>'+planExList(d,i,false)+
    '<div class="row"><button class="btn pri" onclick="planStart('+i+')">'+t('planStart')+'</button><button class="btn" onclick="planOpen()">'+t('planAll')+'</button></div>'+
    '<p class="muted sm swhint">'+t('swHint')+'</p>';
  if(checkDue())h+='<div class="pldue"><b>'+t('chkDue')+'</b><button class="btn sm" onclick="chkOpen()">'+t('chkOpen')+'</button></div>';
  return h+'</div></div>';
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
  startWorkout({name:dayName(i),pl:i,ex:p.ds[i].ex.map(e=>({eid:e.eid,sets:e.sets,tg:{lo:e.lo,hi:e.hi,u:e.u}}))});
}

/* ---------- full plan view and editing ---------- */
function planOpen(){
  const p=DATA.plan;if(!p){planSetup();return;}
  const pr=p.prof;
  let h='<div class="form"><div class="pick-h"><h3>'+t('planMine')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm">'+t('planInfo',t('pg_'+p.goal),p.n,t('pl_'+p.lvl))+'</p>'+
    (pr.focus.length?'<p class="muted sm">'+t('planFocus',pr.focus.map(k=>t('fm_'+k)).join(', '))+'</p>':'')+
    (pr.inj.length?'<p class="muted sm">⚠ '+t('planInj',pr.inj.map(k=>t('inj_'+k)).join(', '))+'</p>':'')+
    (pr.cond?'<div class="card warn"><p>'+t('condNote')+'</p></div>':'');
  p.ds.forEach((d,i)=>{h+='<div class="lbl">'+esc(dayName(i))+'</div>'+planExList(d,i,true)+'<div class="row"><button class="btn sm" onclick="planStart('+i+')">'+t('planStart')+'</button><button class="btn sm" onclick="planAddEx('+i+')">＋ '+t('addEx')+'</button></div>';});
  h+='<div class="lbl">'+t('guideT')+'</div><p class="sm">'+t('guideWarm')+'</p><p class="sm">'+t('guideRest')+'</p><p class="sm">'+t('guideEffort')+'</p><p class="sm">'+t('guideProg')+'</p>'+
    '<p class="muted sm">'+t('planNote')+'</p><div class="row"><button class="btn" onclick="chkOpen()">'+t('chkOpen')+'</button><button class="btn" onclick="planSetup()">'+t('planChange')+'</button></div></div>';
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
  wizDraw();
}
function pwSet(k,v){
  PW[k]=v;
  if(k==='sex'&&!PW.touched){PW.emph=v==='f'?'low':'bal';}
  if(k==='emph')PW.touched=true;
  wizDraw();
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
function wizDraw(){
  const s=PW.step;let b='';
  if(s===1){
    b='<div class="lbl">'+t('psGoal')+'</div>'+wch('goal',PGOALS,PW.goal,v=>t('pg_'+v))+'<p class="muted sm">'+t('pgd_'+PW.goal)+'</p>'+
      '<div class="lbl">'+t('psSex')+'</div>'+wch('sex',PSEX,PW.sex,v=>t('sex_'+v))+'<p class="muted sm">'+t('psSexP')+'</p>';
  }else if(s===2){
    b='<div class="lbl">'+t('psEmph')+'</div>'+wch('emph',PEMPH,PW.emph,v=>t('em_'+v))+'<p class="muted sm">'+t('emd_'+PW.emph)+'</p>'+
      '<div class="lbl">'+t('psFocus')+'</div>'+wchm('focus',Object.keys(FOCUS_MU),v=>t('fm_'+v),3)+'<p class="muted sm">'+t('psFocusP')+'</p>';
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
    b='<div class="lbl">'+t('psSum')+'</div><ul class="sumul"><li>'+t('pg_'+PW.goal)+' · '+t('em_'+PW.emph)+'</li>'+
      (PW.focus.length?'<li>'+t('planFocus',PW.focus.map(k=>t('fm_'+k)).join(', '))+'</li>':'')+
      '<li>'+t('psDaysN',PW.n)+' · '+t('psLenN',PW.len)+' · '+t('pl_'+PW.lvl)+'</li>'+
      '<li>'+t('psEquip')+': '+(PW.have.length?PW.have.map(k=>t('hv_'+k)).join(', '):t('eqp_none'))+'</li>'+
      (PW.inj.length?'<li>⚠ '+t('planInj',PW.inj.map(k=>t('inj_'+k)).join(', '))+(L?'':'')+'</li>':'')+'</ul><p class="muted sm">'+t('planNote')+'</p>';
  }
  sheet('<div class="form"><div class="pick-h"><h3>'+t('planMake')+'</h3><span class="muted sm">'+t('psStep',s,PW_STEPS)+'</span></div>'+b+
    '<div class="row">'+(s>1?'<button class="btn" onclick="pwGo(-1)">‹ '+t('back')+'</button>':'<button class="btn" onclick="sheetClose()">'+t('cancel')+'</button>')+
    (s<PW_STEPS?'<button class="btn pri" onclick="pwGo(1)">'+t('next')+' ›</button>':'<button class="btn pri" onclick="planCreate()">'+t('planCreate')+'</button>')+'</div></div>');
}
function planCreate(){
  const prof=normProf({sex:PW.sex,goal:PW.goal,emph:PW.emph,focus:PW.focus,n:PW.n,len:PW.len,lvl:PW.lvl,have:PW.have,inj:PW.inj,cond:PW.cond});
  const old=DATA.plan,p=genPlan(prof);
  if(old){p.checks=old.checks;}
  DATA.plan=p;saveData();render();
  const few=p.ds.some(d=>d.ex.length<3);
  planOpen();toast(t(few?'planFew':'planReady'));
}

/* ---------- routines: swipe to delete / edit ---------- */
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
