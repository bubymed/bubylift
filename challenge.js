/* ---------- weekly challenge: one simple goal per week, the same for everyone, with a card to share ----------
   Reto semanal: una meta simple por semana, la misma para todos, con tarjeta para compartir.
   It counts what you already log; nothing to join. The week runs Monday to Sunday.
   Cuenta lo que ya registras; no hay que inscribirse. La semana va de lunes a domingo. */
const WC_LIST=[
  {k:'pull',n:100,u:'r'},   // pull-ups and chin-ups / dominadas
  {k:'push',n:300,u:'r'},   // push-ups / lagartijas
  {k:'squat',n:200,u:'r'},  // squats of any kind / sentadillas de cualquier tipo
  {k:'wk',n:4,u:'w'},       // workouts / entrenamientos
  {k:'dip',n:150,u:'r'},    // dips / fondos
  {k:'lunge',n:150,u:'r'},  // lunges, each rep / zancadas
  {k:'sets',n:60,u:'s'}     // working sets / series de trabajo
];
/* which moves count for each challenge, from the exercise map / qué ejercicios cuentan, según el mapa de ejercicios */
function wcMatch(k,eid){
  const r=typeof exRelOf==='function'?exRelOf(eid):null,x=typeof exTaxOf==='function'?exTaxOf(eid):null,pat=r?r.pat:'',body=!!x&&x.load==='body';
  if(k==='pull')return pat==='vertical pull'&&body;
  if(k==='push')return pat==='horizontal push'&&body;
  if(k==='dip')return pat==='vertical push'&&body&&/dip/.test(eid);
  if(k==='squat')return pat==='squat';
  if(k==='lunge')return pat==='lunge';
  return false;
}
function wcWeekNo(ts){const d=new Date(weekStart(ts));return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+3)/7);} // from the calendar date of your Monday, so every time zone gets the same challenge / por la fecha de tu lunes: el mismo reto en cualquier zona horaria
function wcNow(ts){
  const now=ts||Date.now(),c=WC_LIST[wcWeekNo(now)%WC_LIST.length],a=weekStart(now),b=a+7*864e5;
  let v=0;
  DATA.workouts.forEach(w=>{if(w.t<a||w.t>=b)return;
    if(c.u==='w'){if(w.ex&&w.ex.some(x=>x.sets&&x.sets.length))v++;return;}
    (w.ex||[]).forEach(x=>{(x.sets||[]).forEach(s=>{if(s.ty==='w')return;if(c.u==='s'){if(!isMobEx(x.eid))v++;}else if(wcMatch(c.k,x.eid)&&s.r>0)v+=s.r;});});
  });
  const left=Math.max(0,Math.ceil((b-now)/864e5));
  return{k:c.k,n:c.n,u:c.u,v:v,done:v>=c.n,pct:Math.min(1,v/c.n),a:a,b:b,left:left};
}
function wcTitle(c){return t('wc_'+c.k,c.n);}
function wcCard(){
  if(!DATA.workouts.length)return'';
  const c=wcNow();
  return'<div class="card wcc'+(c.done?' done':'')+'"><div class="wcc-h"><span class="hero-e">'+t('wcT')+'</span><span class="muted sm">'+(c.done?ic('check')+' '+t('wcDone'):t(c.left===1?'wcLeft1':'wcLeft',c.left))+'</span></div>'+
    '<h3>'+esc(wcTitle(c))+'</h3><div class="wcc-bar"><u style="width:'+Math.round(c.pct*100)+'%"></u></div>'+
    '<div class="wcc-f"><b>'+Math.min(c.v,99999)+'</b><span class="muted"> / '+c.n+'</span><button class="btn sm" onclick="wcShare()">'+ic('share')+' '+t('wcShare')+'</button></div></div>';
}
/* the card to share: 1080×1350 / la tarjeta para compartir */
function wcCanvas(){
  const c=wcNow(),W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');if(!g)return null;
  const acc=csAcc(),ink='#ffffff',sub='rgba(255,255,255,.78)';
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);
  csLogo(g,80,110,64,ink,'left',acc);
  csTxt(g,t('wcT').toUpperCase(),80,330,46,'800',acc);
  const tt=wcTitle(c).toUpperCase(),fp=csFit(g,tt,W-160,130,'900');csTxt(g,tt,80,330+fp*1.05,fp,'900',ink);
  const by=620;g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.roundRect(80,by,W-160,44,22);g.fill();
  g.fillStyle=c.done?'#32D74B':acc;g.beginPath();g.roundRect(80,by,Math.max(44,(W-160)*c.pct),44,22);g.fill();
  const big=String(c.v),bp=csFit(g,big,560,260,'900');csTxt(g,big,70,by+60+bp*.86,bp,'900',ink);
  g.font=cardFont(bp,'900');const bw=g.measureText(big).width;csTxt(g,'/ '+c.n,70+bw+24,by+60+bp*.86,72,'800',sub);
  csTxt(g,c.done?t('wcDoneCard'):t(c.left===1?'wcLeft1':'wcLeft',c.left),80,by+60+bp*.86+90,48,'800',c.done?'#32D74B':acc);
  const d0=new Date(c.a),d1=new Date(c.b-864e5),f=x=>x.toLocaleDateString(LANG==='es'?'es':'en',{month:'short',day:'numeric'});
  csTxt(g,f(d0)+' – '+f(d1),80,H-190,38,'600',sub);
  csTxt(g,t('wcJoin'),80,H-130,38,'700',ink);
  csTxt(g,'bubymed.github.io/bubylift',80,H-80,34,'600',sub);
  return cv;
}
function wcShare(){
  const cv=wcCanvas();if(!cv){toast(t('impBad'));return;}
  cv.toBlob(function(b){if(!b)return;const name='bubylift-challenge-'+dInput(Date.now())+'.png',f=new File([b],name,{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:t('wcT'),text:wcTitle(wcNow())+' · bubymed.github.io/bubylift'}).catch(()=>{});return;}}catch(e){}
    const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  },'image/png');
}
