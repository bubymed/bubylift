/* Share studio (v95): transparent workout cards in 7 styles — put them over any photo or story, or add a photo here.
   Estudio de tarjetas (v95): tarjetas con fondo transparente en 7 estilos — ponlas sobre cualquier foto o historia, o agrega una foto aquí. */
const CS_STYLES=['classic','stack','poster','chips','lifts','badge','bar'];
let CS=null;
const csAcc=()=>{try{return(getComputedStyle(document.documentElement).getPropertyValue('--accent')||'').trim()||'#ff6a2b';}catch(e){return'#ff6a2b';}};
function csRgba(hex,a){
  let h=String(hex).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const n=parseInt(h,16);if(isNaN(n)||h.length!==6)return'rgba(255,255,255,'+a+')';
  return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';
}
function csOpen(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  CS={wk:wk,style:'classic',fmt:'story',bg:'none',col:'#ffffff',photo:null};
  const chip=(k,v,lbl,extra)=>'<button class="chip'+(CS[k]===v?' on':'')+'" data-k="'+k+'" data-v="'+v+'" onclick="'+(extra||'csSet(\''+k+'\',\''+v+'\')')+'">'+lbl+'</button>';
  const acc=csAcc();
  sheet('<div class="form cs"><div class="pick-h"><h3>'+t('cdBtn')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<p class="muted sm g-c">'+t('csHint')+'</p>'+
    '<div class="cs-th">'+CS_STYLES.map(k=>'<button class="cs-t'+(CS.style===k?' on':'')+'" data-k="style" data-v="'+k+'" onclick="csSet(\'style\',\''+k+'\')"><canvas data-s="'+k+'"></canvas><span>'+t('csS_'+k)+'</span></button>').join('')+'</div>'+
    '<div class="cs-l">'+t('csBgL')+'</div><div class="chips cs-row">'+chip('bg','none',t('csBgNone'))+chip('bg','photo',t('csBgPhoto'),'csBgPhoto()')+chip('bg','dark',t('csBgDark'))+'</div>'+
    '<div class="cs-l">'+t('csFmtL')+'</div><div class="chips cs-row">'+chip('fmt','story',t('csFmtStory'))+chip('fmt','post',t('csFmtPost'))+'</div>'+
    '<div class="cs-l">'+t('csColL')+'</div><div class="cs-sw">'+['#ffffff','#111111',acc].map(c=>'<button class="cs-c'+(CS.col===c?' on':'')+'" data-k="col" data-v="'+c+'" style="background:'+c+'" aria-label="'+c+'" onclick="csSet(\'col\',\''+c+'\')"></button>').join('')+'</div>'+
    '<input id="csf" type="file" accept="image/*" hidden onchange="csPhoto(this)">'+
    '<div class="row"><button class="btn" onclick="csOut(false)">'+t('csSave')+'</button><button class="btn pri" onclick="csOut(true)">'+t('csShare')+'</button></div></div>');
  csDraw();
}
function csSet(k,v){
  if(!CS)return;CS[k]=v;
  document.querySelectorAll('#sheet [data-k="'+k+'"]').forEach(b=>b.classList.toggle('on',b.dataset.v===String(v)));
  if(k!=='style')csDraw();
}
function csBgPhoto(){
  if(!CS)return;
  if(CS.photo){csSet('bg','photo');return;}
  const f=$('csf');if(f)f.click();
}
function csPhoto(inp){
  const f=inp&&inp.files&&inp.files[0];if(!f||!CS)return;
  const url=URL.createObjectURL(f),im=new Image();
  im.onload=function(){CS.photo=im;URL.revokeObjectURL(url);csSet('bg','photo');};
  im.onerror=function(){URL.revokeObjectURL(url);toast(t('copyFail'));};
  im.src=url;inp.value='';
}
/* every style is drawn small, side by side, so you can compare them at a glance / cada estilo se dibuja pequeño, lado a lado, para compararlos de un vistazo */
function csDraw(){
  if(!CS)return;
  document.querySelectorAll('#sheet canvas[data-s]').forEach(v=>{
    let c;try{c=csRender(Object.assign({},CS,{style:v.dataset.s}),.22);}catch(e){return;}
    v.width=c.width;v.height=c.height;v.getContext('2d').drawImage(c,0,0);
  });
}
function csOut(share){
  if(!CS)return;
  let c;try{c=csRender(CS);}catch(e){toast(t('copyFail'));return;}
  const wk=CS.wk,nm='bubylift-'+dInput(wk.t)+(CS.bg==='none'?'-overlay':'')+'.png';
  c.toBlob(function(b){
    if(!b){toast(t('copyFail'));return;}
    const f=new File([b],nm,{type:'image/png'});
    if(share){try{if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Bubylift'}).catch(()=>{});return;}}catch(e){}}
    const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=nm;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast(t('cdSaved'));
  },'image/png');
}
/* the old entry point from the workout detail / punto de entrada desde el detalle del entrenamiento */
function wkPic(id){csOpen(id);}

/* ---------- drawing / dibujo ---------- */
function csFit(g,s,maxW,px,w){
  let p=px;g.font=cardFont(p,w);
  while(g.measureText(s).width>maxW&&p>22){p-=2;g.font=cardFont(p,w);}
  return p;
}
function csTxt(g,s,x,y,px,w,col,al){g.font=cardFont(px,w);g.fillStyle=col;g.textAlign=al||'left';g.fillText(s,x,y);g.textAlign='left';}
function csLogo(g,x,y,sz,col,al){
  g.font=cardFont(Math.round(sz*.82),'800');
  const tw=g.measureText('BUBYLIFT').width,total=sz+Math.round(sz*.28)+tw;
  const x0=al==='center'?x-total/2:al==='right'?x-total:x;
  cardIcon(g,'barbell',x0,y,sz,col);
  csTxt(g,'BUBYLIFT',x0+sz+Math.round(sz*.28),y+sz*.78,Math.round(sz*.82),'800',col);
  return total;
}
function csStats(wk,d){
  const wo=!wk.ex.length,a=[];
  if(d.dur)a.push({v:d.dur,l:t('duration'),i:'stopwatch'});
  if(wo){if(d.hr)a.push({v:d.hr.a+' bpm',l:t('cdHr'),i:'heart'});if(d.kcal)a.push({v:d.kcal+' kcal',l:t('cdKcal'),i:'bolt'});}
  else{a.push({v:String(d.sets),l:t('sets'),i:'clipboard-list'});a.push({v:d.vol,l:t('volume'),i:'barbell'});}
  return a;
}
function csRender(o,sc){
  const wk=o.wk,d=wkCardData(wk),W=1080,H=o.fmt==='post'?1350:1920,c=document.createElement('canvas');sc=sc||1;c.width=Math.round(W*sc);c.height=Math.round(H*sc);
  const g=c.getContext('2d');g.scale(sc,sc);const acc=csAcc(),ink=o.col,light=ink!=='#111111';
  const sub=csRgba(ink,.82),line=csRgba(ink,.35),stats=csStats(wk,d),wo=!wk.ex.length;
  const name=(wk.name||(wo?spName(wk.sp):'')).trim()||spName(wk.sp);
  const B=H-(o.fmt==='post'?100:150); // bottom edge of the block / borde inferior del bloque
  /* background / fondo */
  if(o.bg==='dark'){const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);}
  else if(o.bg==='photo'&&o.photo){
    const im=o.photo,s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,(W-w)/2,(H-h)/2,w,h);
    const sh=g.createLinearGradient(0,H*.35,0,H);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,light?'rgba(0,0,0,.55)':'rgba(255,255,255,.4)');g.fillStyle=sh;g.fillRect(0,H*.35,W,H*.65);
  }
  /* soft shadow so text reads on any photo / sombra suave para leer sobre cualquier foto */
  const shadow=function(on){g.shadowColor=on?(light?'rgba(0,0,0,.5)':'rgba(255,255,255,.45)'):'transparent';g.shadowBlur=on?16:0;g.shadowOffsetY=on?3:0;};
  shadow(true);
  const S=({classic:csClassic,stack:csStack,poster:csPoster,chips:csChips,lifts:csLifts,badge:csBadge,bar:csBar})[o.style]||csClassic;
  S(g,{W:W,H:H,B:B,d:d,wk:wk,wo:wo,name:name,stats:stats,ink:ink,sub:sub,line:line,acc:acc,light:light,shadow:shadow});
  if(d.sv){shadow(false);csTxt(g,'Powered by Strava',W/2,H-40,28,'500',sub,'center');}
  return c;
}
function csPr(g,x,y,v,al){
  if(!v.d.prs)return;
  const tx=v.d.prs+' PR';g.font=cardFont(46,'800');const tw=g.measureText(tx).width+60;
  const x0=al==='center'?x-tw/2:x;cardIcon(g,'trophy',x0,y-40,46,v.acc);csTxt(g,tx,x0+58,y,46,'800',v.acc);
}
/* 1 · classic: logo, name, date and three big numbers / logo, nombre, fecha y tres números grandes */
function csClassic(g,v){
  let y=v.B-640;const W=v.W;
  csLogo(g,80,y,64,v.ink);
  const p=csFit(g,v.name,W-160,92,'800');csTxt(g,v.name,80,y+190,p,'800',v.ink);
  csTxt(g,v.d.date,80,y+250,40,'500',v.sub);
  const n=v.stats.length,cw=(W-160)/Math.max(n,1);
  v.stats.forEach((s,i)=>{const x=80+i*cw,fp=csFit(g,s.v,cw-24,86,'800');csTxt(g,s.v,x,y+390,fp,'800',v.ink);csTxt(g,s.l,x,y+440,32,'500',v.sub);});
  csPr(g,80,y+540,v);
  csTxt(g,'bubymed.github.io/bubylift',80,y+625,30,'500',v.sub);
}
/* 2 · stack: centered labels over big values (the Strava-style column) / etiquetas centradas sobre valores grandes */
function csStack(g,v){
  const W=v.W,cx=W/2,n=v.stats.length,gap=215,top=v.B-(n*gap)-250;
  csLogo(g,cx,top,70,v.ink,'center');
  const p=csFit(g,v.name,W-200,56,'700');csTxt(g,v.name,cx,top+150,p,'700',v.sub,'center');
  v.stats.forEach((s,i)=>{const y=top+260+i*gap;csTxt(g,s.l.toUpperCase(),cx,y,32,'600',v.sub,'center');
    const fp=csFit(g,s.v,W-160,128,'800');csTxt(g,s.v,cx,y+125,fp,'800',v.ink,'center');});
  csPr(g,cx,top+260+n*gap+10,v,'center');
}
/* 3 · poster: one giant number / un solo número gigante */
function csPoster(g,v){
  const W=v.W,y=v.B-660,big=v.wo?v.stats[0]:v.stats[v.stats.length-1];
  const nm=v.name.toUpperCase(),p=csFit(g,nm,W-160,62,'800');csTxt(g,nm,80,y,p,'800',v.acc);
  if(big){const fp=csFit(g,big.v,W-160,250,'800');csTxt(g,big.v,70,y+250,fp,'800',v.ink);csTxt(g,big.l.toUpperCase(),80,y+310,36,'600',v.sub);}
  const rest=v.stats.filter(s=>s!==big);
  csTxt(g,rest.map(s=>s.v).join('   ·   '),80,y+410,50,'700',v.ink);
  csPr(g,80,y+495,v);
  csLogo(g,80,y+560,60,v.ink);
}
/* 4 · chips: translucent pills with an icon each / píldoras translúcidas con un icono */
function csChips(g,v){
  const W=v.W,y=v.B-620;
  csLogo(g,80,y,60,v.ink);
  const p=csFit(g,v.name,W-160,96,'800');csTxt(g,v.name,80,y+190,p,'800',v.ink);
  csTxt(g,v.d.date,80,y+250,38,'500',v.sub);
  const items=v.stats.map(s=>({i:s.i,t:s.v}));
  if(!v.wo){if(v.d.hr)items.push({i:'heart',t:v.d.hr.a+' bpm'});if(v.d.kcal)items.push({i:'bolt',t:v.d.kcal+' kcal'});}
  if(v.d.prs)items.push({i:'trophy',t:v.d.prs+' PR'});
  let x=80,yy=y+300;const h=112;
  items.forEach(it=>{
    g.font=cardFont(48,'800');const w=g.measureText(it.t).width+50+54+44;
    if(x+w>W-80){x=80;yy+=h+22;}
    v.shadow(false);g.fillStyle=v.light?'rgba(0,0,0,.5)':'rgba(255,255,255,.62)';g.beginPath();g.roundRect?g.roundRect(x,yy,w,h,h/2):g.rect(x,yy,w,h);g.fill();
    cardIcon(g,it.i,x+30,yy+h/2-24,48,v.light?'#fff':'#111');csTxt(g,it.t,x+30+48+18,yy+h/2+17,48,'800',v.light?'#fff':'#111');
    v.shadow(true);x+=w+22;
  });
}
/* 5 · lifts: the list of exercises / la lista de ejercicios */
function csLifts(g,v){
  const W=v.W,rows=v.wo?v.stats.map(s=>[s.l,s.v]):v.d.top.slice(0,5).map(x=>{let n=exName(x.eid,x.n);return[n,x.sets+' × '+(x.b?fmtSet(x.m,x.b):'')];});
  const h=104,y=v.B-(rows.length*h)-340;
  const p=csFit(g,v.name,W-160,88,'800');csTxt(g,v.name,80,y,p,'800',v.ink);
  csTxt(g,v.d.date+(v.d.dur?'  ·  '+v.d.dur:''),80,y+62,38,'500',v.sub);
  csPr(g,80,y+150,v);
  let yy=y+(v.d.prs?250:200);
  rows.forEach(r=>{
    let n=r[0];g.font=cardFont(44,'700');while(g.measureText(n).width>560&&n.length>4)n=n.slice(0,-2);if(n!==r[0])n+='…';
    csTxt(g,n,80,yy,44,'700',v.ink);
    let rt=String(r[1]);if(rt.length>24)rt=rt.slice(0,24);csTxt(g,rt,W-80,yy,40,'500',v.sub,'right');
    g.fillStyle=v.line;g.fillRect(80,yy+28,W-160,2);yy+=h;
  });
  csLogo(g,80,yy+30,60,v.ink);
}
/* 6 · badge: a ring with the main number / un anillo con el número principal */
function csBadge(g,v){
  const W=v.W,cx=W/2,R=330,cy=v.B-R-250,big=v.wo?v.stats[0]:v.stats[v.stats.length-1];
  csLogo(g,cx,cy-R-130,66,v.ink,'center');
  g.strokeStyle=v.ink;g.lineWidth=12;g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.stroke();
  g.strokeStyle=v.acc;g.lineWidth=12;g.beginPath();g.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+Math.PI*1.25);g.stroke();
  if(big){csTxt(g,big.l.toUpperCase(),cx,cy-70,34,'600',v.sub,'center');const fp=csFit(g,big.v,R*1.6,130,'800');csTxt(g,big.v,cx,cy+60,fp,'800',v.ink,'center');}
  const rest=v.stats.filter(s=>s!==big).map(s=>s.v).join('  ·  ');csTxt(g,rest,cx,cy+140,38,'600',v.sub,'center');
  const p=csFit(g,v.name,W-160,78,'800');csTxt(g,v.name,cx,cy+R+105,p,'800',v.ink,'center');
  csTxt(g,v.d.date,cx,cy+R+165,36,'500',v.sub,'center');
  if(v.d.prs)csPr(g,cx,cy+R+235,v,'center');
}
/* 7 · bar: one compact strip / una franja compacta */
function csBar(g,v){
  const W=v.W,h=290,y=v.B-h,x=60,w=W-120;
  v.shadow(false);g.fillStyle=v.light?'rgba(0,0,0,.55)':'rgba(255,255,255,.7)';g.beginPath();g.roundRect?g.roundRect(x,y,w,h,40):g.rect(x,y,w,h);g.fill();v.shadow(false);
  const ink=v.light?'#fff':'#111',sub=v.light?'rgba(255,255,255,.75)':'rgba(0,0,0,.65)';
  cardIcon(g,'barbell',x+36,y+34,64,v.acc);
  const p=csFit(g,v.name,w-190-(v.d.prs?190:0),56,'800');csTxt(g,v.name,x+120,y+84,p,'800',ink);
  const n=v.stats.length,cw=(w-72)/Math.max(n,1);
  v.stats.forEach((s,i)=>{const sx=x+36+i*cw,fp=csFit(g,s.v,cw-16,56,'800');csTxt(g,s.v,sx,y+200,fp,'800',ink);csTxt(g,s.l,sx,y+248,28,'500',sub);});
  if(v.d.prs)csTxt(g,v.d.prs+' PR',x+w-36,y+84,44,'800',v.acc,'right');
}
