/* Share studio (v95): transparent workout cards in 7 styles — put them over any photo or story, or add a photo here.
   Estudio de tarjetas (v95): tarjetas con fondo transparente en 7 estilos — ponlas sobre cualquier foto o historia, o agrega una foto aquí. */
const CS_STYLES=['classic','stack','poster','chips','lifts','badge','bar','pr','fun'];
let CS=null;
const csAcc=()=>{try{return(getComputedStyle(document.documentElement).getPropertyValue('--accent')||'').trim()||'#ff6a2b';}catch(e){return'#ff6a2b';}};
function csRgba(hex,a){
  let h=String(hex).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const n=parseInt(h,16);if(isNaN(n)||h.length!==6)return'rgba(255,255,255,'+a+')';
  return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';
}
function csOpen(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  CS={wk:wk,style:'classic',fmt:'story',pos:'bottom',bg:'none',col:'#ffffff',photo:null,file:null};
  const chip=(k,v,lbl,extra)=>'<button class="chip'+(CS[k]===v?' on':'')+'" data-k="'+k+'" data-v="'+v+'" onclick="'+(extra||'csSet(\''+k+'\',\''+v+'\')')+'">'+lbl+'</button>';
  const acc=csAcc();
  sheet('<div class="form cs"><div class="pick-h"><h3>'+t('cdBtn')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="cs-pvw"><canvas id="csPv"></canvas></div>'+
    '<div class="cs-th">'+CS_STYLES.map(k=>'<button class="cs-t'+(CS.style===k?' on':'')+'" data-k="style" data-v="'+k+'" onclick="csSet(\'style\',\''+k+'\')"><canvas data-s="'+k+'"></canvas><span>'+t('csS_'+k)+'</span></button>').join('')+'</div>'+
    '<div class="cs-l">'+t('csBgL')+'</div><div class="chips cs-row">'+chip('bg','none',t('csBgNone'))+chip('bg','photo',t('csBgPhoto'),'csBgPhoto()')+chip('bg','dark',t('csBgDark'))+'</div>'+
    '<div class="cs-fp"><div class="cs-l">'+t('csFmtL')+'</div><div class="chips cs-row">'+chip('fmt','story',t('csFmtStory'))+chip('fmt','post',t('csFmtPost'))+chip('fmt','square',t('csFmtSq'))+'</div>'+
    '<div class="cs-l">'+t('csPosL')+'</div><div class="chips cs-row">'+chip('pos','top',t('csPosTop'))+chip('pos','mid',t('csPosMid'))+chip('pos','bottom',t('csPosBot'))+'</div></div>'+
    '<div class="cs-l">'+t('csColL')+'</div><div class="cs-sw">'+['#ffffff','#111111',acc].map(c=>'<button class="cs-c'+(CS.col===c?' on':'')+'" data-k="col" data-v="'+c+'" style="background:'+c+'" aria-label="'+c+'" onclick="csSet(\'col\',\''+c+'\')"></button>').join('')+'</div>'+
    '<input id="csf" type="file" accept="image/*" hidden onchange="csPhoto(this)">'+
    '<div class="row"><button class="btn" onclick="csOut(false)">'+t('csSave')+'</button><button class="btn" onclick="csCopy()">'+t('csCopy')+'</button><button class="btn pri" onclick="csOut(true)">'+t('csShare')+'</button></div></div>');
  const sh=$('sheet').querySelector('.cs');if(sh)sh.classList.toggle('cs-tr',CS.bg==='none');
  csDraw();
}
function csSet(k,v){
  if(!CS)return;CS[k]=v;
  if(k==='bg'){const sh=$('sheet').querySelector('.cs');if(sh)sh.classList.toggle('cs-tr',v==='none');}
  document.querySelectorAll('#sheet [data-k="'+k+'"]').forEach(b=>b.classList.toggle('on',b.dataset.v===String(v)));
  csDraw();
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
  const pv=$('csPv');if(pv){try{const c=csFinal(CS,.34);pv.width=c.width;pv.height=c.height;const x=pv.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(c,0,0);}catch(e){}}
  document.querySelectorAll('#sheet canvas[data-s]').forEach(v=>{
    let c;try{c=csFinal(Object.assign({},CS,{style:v.dataset.s}),.22);}catch(e){return;}
    v.width=c.width;v.height=c.height;v.getContext('2d').drawImage(c,0,0);
  });
  csPrep();
}
/* render the real PNG ahead of the tap: iPhone only opens the share sheet if it is called right inside the tap / genera el PNG antes del toque: el iPhone solo abre compartir si se llama justo dentro del toque */
let csTm=null;
function csPrep(){
  if(!CS)return;CS.file=null;clearTimeout(csTm);
  const cur=CS,key=cur.style+cur.fmt+cur.pos+cur.bg+cur.col;
  csTm=setTimeout(function(){
    if(CS!==cur)return;
    let c;try{c=csFinal(cur);}catch(e){return;}
    c.toBlob(function(b){
      if(!b||CS!==cur||key!==cur.style+cur.fmt+cur.pos+cur.bg+cur.col)return;
      cur.file=new File([b],'bubylift-'+dInput(cur.wk.t)+(cur.bg==='none'?'-overlay':'')+'.png',{type:'image/png'});
    },'image/png');
  },120);
}
function csOut(share){
  if(!CS)return;
  const f=CS.file;
  if(!f){toast(t('csWait'));csPrep();return;}
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Bubylift'}).catch(()=>{});return;}}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast(t('cdSaved'));
}
/* a transparent card is cut to just its content, so it pastes as a small sticker instead of covering the whole story / la tarjeta transparente se recorta a su contenido: se pega como sticker pequeño y no cubre toda la historia */
function csCrop(c){
  const w=c.width,h=c.height,g=c.getContext('2d');let d;try{d=g.getImageData(0,0,w,h).data;}catch(e){return c;}
  let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++){const r=y*w*4;for(let x=0;x<w;x++){if(d[r+x*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}}
  if(x1<0)return c;
  const p=Math.round(w*.04);x0=Math.max(0,x0-p);y0=Math.max(0,y0-p);x1=Math.min(w-1,x1+p);y1=Math.min(h-1,y1+p);
  const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);return o;
}
function csFinal(o,sc){const c=csRender(o,sc);return o.bg==='none'?csCrop(c):c;}
function csCopy(){
  if(!CS)return;const f=CS.file;
  if(!f){toast(t('csWait'));csPrep();return;}
  try{if(navigator.clipboard&&window.ClipboardItem){navigator.clipboard.write([new ClipboardItem({'image/png':f})]).then(function(){toast(t('csCopied'));},function(){csOut(false);});return;}}catch(e){}
  csOut(false);
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
  else{a.push({v:String(d.sets),l:t('sets'),i:'clipboard-list'});a.push({v:d.vol,l:t('csTotal'),i:'barbell'});}
  return a;
}
function csRender(o,sc){
  const wk=o.wk,d=wkCardData(wk),W=1080,H=o.fmt==='post'?1350:(o.fmt==='square'?1080:1920),c=document.createElement('canvas');sc=sc||1;c.width=Math.round(W*sc);c.height=Math.round(H*sc);
  const g=c.getContext('2d');g.scale(sc,sc);const acc=csAcc(),ink=o.col,light=ink!=='#111111';
  const sub=csRgba(ink,.82),line=csRgba(ink,.35),stats=csStats(wk,d),wo=!wk.ex.length;
  const name=(wk.name||(wo?spName(wk.sp):'')).trim()||spName(wk.sp);
  const B=H-(o.fmt==='post'?100:(o.fmt==='square'?70:150)); // bottom edge of the block / borde inferior del bloque
  /* background / fondo */
  if(o.bg==='dark'){const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);}
  else if(o.bg==='photo'&&o.photo){
    const im=o.photo,s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,(W-w)/2,(H-h)/2,w,h);
    const sh=g.createLinearGradient(0,H*.35,0,H);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,light?'rgba(0,0,0,.55)':'rgba(255,255,255,.4)');g.fillStyle=sh;g.fillRect(0,H*.35,W,H*.65);
  }
  /* soft shadow so text reads on any photo / sombra suave para leer sobre cualquier foto */
  const shadow=function(on){g.shadowColor=on?(light?'rgba(0,0,0,.5)':'rgba(255,255,255,.45)'):'transparent';g.shadowBlur=on?16:0;g.shadowOffsetY=on?3:0;};
  shadow(true);
  const S=({classic:csClassic,stack:csStack,poster:csPoster,chips:csChips,lifts:csLifts,badge:csBadge,bar:csBar,pr:csPrCard,fun:csFun})[o.style]||csClassic;
  /* where the block sits: top, middle or bottom / dónde queda el bloque: arriba, centro o abajo */
  const dy=o.pos==='top'?Math.round(H*.26-(B-330)):(o.pos==='mid'?Math.round(H*.5-(B-330)):0);
  g.save();g.translate(0,dy);
  S(g,{W:W,H:H,B:B,d:d,wk:wk,wo:wo,name:name,stats:stats,ink:ink,sub:sub,line:line,acc:acc,light:light,shadow:shadow});
  g.restore();
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
  v.stats.forEach((s,i)=>{const x=80+i*cw,fp=csFit(g,s.v,cw-56,86,'800');csTxt(g,s.v,x,y+390,fp,'800',v.ink);csTxt(g,s.l,x,y+440,32,'500',v.sub);});
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
  const W=v.W,rows=v.wo?v.stats.map(s=>[s.l,s.v]):v.d.top.map(x=>{let n=exName(x.eid,x.n);return[n,x.sets+' × '+(x.b?fmtSet(x.m,x.b):'')];});
  const n0=rows.length,h=n0>7?Math.max(56,Math.floor(728/n0)):104,fs=h>=96?44:Math.max(30,Math.round(h*.42)),y=v.B-(rows.length*h)-340;
  const p=csFit(g,v.name,W-160,88,'800');csTxt(g,v.name,80,y,p,'800',v.ink);
  csTxt(g,v.d.date+(v.d.dur?'  ·  '+v.d.dur:''),80,y+62,38,'500',v.sub);
  csPr(g,80,y+150,v);
  let yy=y+(v.d.prs?250:200);
  rows.forEach(r=>{
    let n=r[0];g.font=cardFont(fs,'700');while(g.measureText(n).width>560&&n.length>4)n=n.slice(0,-2);if(n!==r[0])n+='…';
    csTxt(g,n,80,yy,fs,'700',v.ink);
    let rt=String(r[1]);if(rt.length>24)rt=rt.slice(0,24);csTxt(g,rt,W-80,yy,Math.round(fs*.9),'500',v.sub,'right');
    g.fillStyle=v.line;g.fillRect(80,yy+Math.round(h*.27),W-160,2);yy+=h;
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

/* ---------- v2 styles: PR spotlight, fun comparison / estilos nuevos: récord y comparación ---------- */
/* 9 · pr: your best moment of the day, huge / tu mejor momento del día, enorme */
function csPrCard(g,v){
  const W=v.W,L=v.d.top.filter(x=>x.b&&x.m==='wr'),pick=(L.filter(x=>x.pr).sort((a,b)=>b.sc-a.sc)[0])||L.sort((a,b)=>b.sc-a.sc)[0]||v.d.top[0],y=v.B-640;
  csLogo(g,80,y-40,60,v.ink);
  if(!pick||!pick.b){csTxt(g,v.name,80,y+200,90,'800',v.ink);return;}
  const isPr=pick.pr;
  if(isPr){cardIcon(g,'trophy',80,y+70,70,v.acc);csTxt(g,t('csPrNew'),170,y+125,60,'800',v.acc);}else csTxt(g,t('csTopLift'),80,y+125,50,'800',v.acc);
  const nm=exName(pick.eid,pick.n),p=csFit(g,nm,W-160,86,'800');csTxt(g,nm,80,y+250,p,'800',v.ink);
  const big=wShow(pick.b.w)+' '+wUnit(),fp=csFit(g,big,W-160,230,'800');csTxt(g,big,70,y+470,fp,'800',v.ink);
  csTxt(g,'× '+pick.b.r+' '+t('colReps').toLowerCase(),80,y+545,60,'700',v.sub);
  csTxt(g,v.d.date,80,y+620,36,'500',v.sub);
}
/* 10 · fun: what you lifted, in things people know / lo que levantaste, en cosas conocidas */
const CS_OBJ=[['bus',11000],['ele',6000],['car',1300],['pia',450],['fri',80],['bow',7]];
function csFunObj(kg){for(let i=0;i<CS_OBJ.length;i++){const n=kg/CS_OBJ[i][1];if(n>=1)return{k:CS_OBJ[i][0],n:n};}const o=CS_OBJ[CS_OBJ.length-1];return{k:o[0],n:kg/o[1]};}
function csFun(g,v){
  const W=v.W,kg=wkVol(v.wk),f=csFunObj(kg),y=v.B-640;
  csLogo(g,80,y-40,60,v.ink);
  csTxt(g,t('csFunT'),80,y+110,50,'700',v.sub);
  const num=f.n>=10?String(Math.round(f.n)):f.n.toFixed(1),fp=csFit(g,num,W-160,300,'800');csTxt(g,num,70,y+360,fp,'800',v.acc);
  const nm=t('csObj_'+f.k),p=csFit(g,nm,W-160,110,'800');csTxt(g,nm,80,y+480,p,'800',v.ink);
  csTxt(g,'= '+wShow(kg)+' '+wUnit()+'  ·  '+v.d.sets+' '+t('sets').toLowerCase(),80,y+560,44,'600',v.sub);
  csTxt(g,v.name+'  ·  '+v.d.date,80,y+625,34,'500',v.sub);
}
