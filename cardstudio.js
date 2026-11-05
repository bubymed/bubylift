/* Share studio (v95): transparent workout cards in 7 styles — put them over any photo or story, or add a photo here.
   Estudio de tarjetas (v95): tarjetas con fondo transparente en 7 estilos — ponlas sobre cualquier foto o historia, o agrega una foto aquí. */
const CS_STYLES=['giant','vert','row','dots','classic','stack','poster','chips','lifts','badge','bar','pr','fun','duo','body'];
const CS_H={giant:1,dots:1,lifts:1,fun:1,duo:1}; // styles that also come in a wide version / estilos que también tienen versión ancha
const CS_CLEAN={giant:1,dots:1,vert:1,row:1}; // already big and bold: no panel needed / ya son grandes y claros: sin panel
let CS=null;
const csAcc=()=>{try{return(getComputedStyle(document.documentElement).getPropertyValue('--accent')||'').trim()||'#ff6a2b';}catch(e){return'#ff6a2b';}};
function csRgba(hex,a){
  let h=String(hex).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const n=parseInt(h,16);if(isNaN(n)||h.length!==6)return'rgba(255,255,255,'+a+')';
  return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';
}
function csOpen(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  CS={wk:wk,fs:0,style:'giant',fmt:'story',ori:'v',pos:'bottom',bg:'none',panel:'on',col:'#ffffff',photo:null,file:null,adv:false,lol:SET.csLol?'on':'off'};
  const chip=(k,v,lbl,extra)=>'<button class="chip'+(CS[k]===v?' on':'')+'" data-k="'+k+'" data-v="'+v+'" onclick="'+(extra||'csSet(\''+k+'\',\''+v+'\')')+'">'+lbl+'</button>';
  const acc=csAcc(),act=(ico,lbl,fn,cls)=>'<button class="cs-a'+(cls?' '+cls:'')+'" onclick="'+fn+'"><span class="cs-ai">'+ic(ico)+'</span><span>'+lbl+'</span></button>';
  sheet('<div class="form cs"><div class="pick-h"><h3>'+t('cdBtn')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="chips cs-ori">'+chip('ori','v',t('csOriV'))+chip('ori','h',t('csOriH'))+'</div>'+
    '<div class="cs-l">'+t('csLolL')+'</div><div class="chips cs-row">'+chip('lol','off',t('csLolOff'))+chip('lol','on',t('csLolOn'))+'</div>'+
    '<div class="cs-grid">'+CS_STYLES.map(k=>'<button class="cs-g'+(CS.style===k?' on':'')+'" data-k="style" data-v="'+k+'" onclick="csSet(\'style\',\''+k+'\')"><canvas data-s="'+k+'"></canvas><i class="cs-ck">'+ic('check')+'</i><span>'+t('csS_'+k)+'</span></button>').join('')+'</div>'+
    '<div class="cs-bar"><div class="cs-adv" id="csAdv" hidden>'+
      '<div class="cs-l">'+t('csBgL')+'</div><div class="chips cs-row">'+chip('bg','none',t('csBgNone'))+chip('bg','photo',t('csBgPhoto'),'csBgPhoto()')+chip('bg','dark',t('csBgDark'))+'</div>'+
      '<div class="cs-l">'+t('csPanL')+'</div><div class="chips cs-row">'+chip('panel','on',t('csPanOn'))+chip('panel','off',t('csPanOff'))+'</div>'+
      '<div class="cs-l">'+t('csFmtL')+'</div><div class="chips cs-row">'+chip('fmt','story',t('csFmtStory'))+chip('fmt','post',t('csFmtPost'))+chip('fmt','square',t('csFmtSq'))+'</div>'+
      '<div class="cs-l">'+t('csPosL')+'</div><div class="chips cs-row">'+chip('pos','top',t('csPosTop'))+chip('pos','mid',t('csPosMid'))+chip('pos','bottom',t('csPosBot'))+'</div>'+
      '<div class="cs-l">'+t('csColL')+'</div><div class="cs-sw">'+['#ffffff','#111111',acc].map(c=>'<button class="cs-c'+(CS.col===c?' on':'')+'" data-k="col" data-v="'+c+'" style="background:'+c+'" aria-label="'+c+'" onclick="csSet(\'col\',\''+c+'\')"></button>').join('')+'</div></div>'+
      '<input id="csf" type="file" accept="image/*" hidden onchange="csPhoto(this)">'+
      '<div class="cs-acts">'+act('brand-instagram',t('csStory'),'csStory()','ig')+act('copy',t('csCopy'),'csCopy()')+act('download',t('csSaveS'),'csOut(false)')+act('share',t('csMore'),'csOut(true)')+'</div>'+
      '<button class="cs-opt" id="csOpt" aria-expanded="false" aria-controls="csAdv" onclick="csAdv()">'+ic('settings')+' <span>'+t('csAdv')+'</span><i class="cs-chv" aria-hidden="true">▾</i></button></div></div>');
  csDraw();
}
function csAdv(){const e=$('csAdv'),b=$('csOpt');if(!e)return;e.hidden=!e.hidden;if(b){b.classList.toggle('on',!e.hidden);b.setAttribute('aria-expanded',e.hidden?'false':'true');}if(!e.hidden&&e.scrollIntoView)e.scrollIntoView({block:'nearest',behavior:'smooth'});}
/* straight to Instagram: copy the card, open the story camera, and paste it as a sticker / directo a Instagram: copia la tarjeta, abre la cámara de historias y se pega como sticker */
function csStory(){
  if(!CS)return;const f=CS.file;
  if(!f){toast(t('csWait'));csPrep();return;}
  const go=function(){toast(t('csStoryHint'));setTimeout(function(){try{location.href='instagram://story-camera';}catch(e){}},350);};
  try{if(navigator.clipboard&&window.ClipboardItem){navigator.clipboard.write([new ClipboardItem({'image/png':f})]).then(go,function(){csOut(true);});return;}}catch(e){}
  csOut(true);
}
function csSet(k,v){
  if(!CS)return;
  if(k==='style'&&v===CS.style&&(v==='fun'||v==='duo'))CS.fs=(CS.fs|0)+1; // tap it again: another object / tocarlo otra vez: otro objeto
  CS[k]=v;
  if(k==='lol'){SET.csLol=v==='on';saveSet();}
  if(k==='ori'){document.querySelectorAll('#sheet .cs-g').forEach(b=>{b.hidden=v==='h'&&!CS_H[b.dataset.v];});if(v==='h'&&!CS_H[CS.style])CS.style='giant';document.querySelectorAll('#sheet [data-k="style"]').forEach(b=>b.classList.toggle('on',b.dataset.v===CS.style));}
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
    document.querySelectorAll('#sheet canvas[data-s]').forEach(v=>{
    let c;try{c=csFinal(Object.assign({},CS,{style:v.dataset.s}),.3);}catch(e){return;}
    v.width=c.width;v.height=c.height;v.getContext('2d').drawImage(c,0,0);
  });
  csPrep();
}
/* render the real PNG ahead of the tap: iPhone only opens the share sheet if it is called right inside the tap / genera el PNG antes del toque: el iPhone solo abre compartir si se llama justo dentro del toque */
let csTm=null;
function csPrep(){
  if(!CS)return;CS.file=null;clearTimeout(csTm);
  const kf=o=>o.style+o.fmt+o.ori+o.pos+o.bg+o.col+o.panel+o.fs,cur=CS,key=kf(cur);
  csTm=setTimeout(function(){
    if(CS!==cur)return;
    let c;try{c=csFinal(Object.assign({},cur,{crop:1}));}catch(e){return;}
    c.toBlob(function(b){
      if(!b||CS!==cur||key!==kf(cur))return;
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
function csFinal(o,sc){return csRender(o,sc);}
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
/* big number: ink left edge at x and ink top at top; returns the baseline / número grande: borde izquierdo de la tinta en x y parte superior en top; devuelve la línea base */
function csNum(g,num,x,top,maxW,px,w,col){
  const fp=csFit(g,num,maxW,px,w);g.font=cardFont(fp,w);const m=g.measureText(num),b=top+m.actualBoundingBoxAscent;
  csTxt(g,num,x+m.actualBoundingBoxLeft,b,fp,w,col);return b;
}
function csLogo(g,x,y,sz,col,al,icol){
  g.font=cardFont(Math.round(sz*.82),'800');
  const tw=g.measureText('BUBYLIFT').width,total=sz+Math.round(sz*.28)+tw;
  const x0=al==='center'?x-total/2:al==='right'?x-total:x;
  cardIcon(g,'barbell',x0,y,sz,icol||col);
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
  d.date=t('csWkL')+'  ·  '+d.date; // tells viewers what the name is / le dice a quien lo ve qué es el nombre
  const B=H-(o.fmt==='post'?100:(o.fmt==='square'?70:150)); // bottom edge of the block / borde inferior del bloque
  /* background / fondo */
  if(o.bg==='dark'){const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);}
  else if(o.bg==='photo'&&o.photo){
    const im=o.photo,s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,(W-w)/2,(H-h)/2,w,h);
    const sh=g.createLinearGradient(0,H*.35,0,H);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,light?'rgba(0,0,0,.55)':'rgba(255,255,255,.4)');g.fillStyle=sh;g.fillRect(0,H*.35,W,H*.65);
  }
  /* soft shadow so text reads on any photo / sombra suave para leer sobre cualquier foto */
  const shadow=function(){g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;}; // no glow behind letters: clean edges / sin brillo detrás de las letras: bordes limpios
  shadow(true);
  const S=({giant:csGiant,vert:csVert,row:csRow,dots:csDots,classic:csClassic,stack:csStack,poster:csPoster,chips:csChips,lifts:csLifts,badge:csBadge,bar:csBar,pr:csPrCard,fun:csFun,duo:csDuo,body:csBody})[o.style]||csClassic;
  /* where the block sits: top, middle or bottom / dónde queda el bloque: arriba, centro o abajo */
  const dy=o.pos==='top'?Math.round(H*.26-(B-330)):(o.pos==='mid'?Math.round(H*.5-(B-330)):0);
  g.save();g.translate(0,dy);
  S(g,{fs:o.fs|0,lol:o.lol==='on',h:o.ori==='h'&&!!CS_H[o.style],W:W,H:H,B:B,d:d,wk:wk,wo:wo,name:name,stats:stats,ink:ink,sub:sub,line:line,acc:acc,light:light,shadow:shadow});
  g.restore();
  if(d.sv){shadow(false);csTxt(g,'Powered by Strava',W/2,H-40,28,'500',sub,'center');}
  if(o.bg==='none'&&o.panel!=='off'&&!CS_CLEAN[o.style])return csPanel(c,light,!!o.crop);
  return c;
}
/* soft panel behind the card so it reads on ANY photo (bright wall, busy mirror…); the exported sticker is cut to the panel
   panel suave detrás de la tarjeta para que se lea sobre CUALQUIER foto (pared clara, espejo…); el sticker exportado se recorta al panel */
function csPanel(c,light,crop){
  const w=c.width,h=c.height,k=w/1080;let d;try{d=c.getContext('2d').getImageData(0,0,w,h).data;}catch(e){return c;}
  let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++){const r=y*w*4;for(let x=0;x<w;x++){if(d[r+x*4+3]>110){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}}
  if(x1<0)return c;
  const pad=Math.round(56*k),m=crop?Math.round(8*k):0;
  const px=Math.max(0,x0-pad),py=Math.max(0,y0-pad),pw=Math.min(w,x1+pad)-px,ph=Math.min(h,y1+pad)-py;
  const out=document.createElement('canvas');out.width=crop?pw+m*2:w;out.height=crop?ph+m*2:h;
  const g=out.getContext('2d'),ox=crop?m-px:0,oy=crop?m-py:0,rx=px+ox,ry=py+oy,r=Math.round(54*k);
  g.fillStyle=light?'rgba(12,12,16,.58)':'rgba(255,255,255,.72)';
  g.beginPath();if(g.roundRect)g.roundRect(rx,ry,pw,ph,r);else g.rect(rx,ry,pw,ph);g.fill();
  g.lineWidth=Math.max(1,2*k);g.strokeStyle=light?'rgba(255,255,255,.14)':'rgba(0,0,0,.10)';g.stroke();
  g.drawImage(c,ox,oy);return out;
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
  if(v.h)return csListH(g,v,false);
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

/* giant: one huge number, almost nothing else (the style that reads on any photo) / un solo número enorme y casi nada más (el estilo que se lee sobre cualquier foto) */
function csGiant(g,v){
  if(v.h)return csGiantH(g,v);
  const W=v.W,y=v.B-700,kg=wkVol(v.wk),num=wShow(kg);
  csLogo(g,80,y,60,v.ink,'left',v.acc);
  csTxt(g,t('csGiantL'),80,y+170,54,'700',v.sub);
  const fp=csFit(g,num,W-140,420,'900');csTxt(g,num,64,y+170+fp*.86,fp,'900',v.ink);
  const y2=y+170+fp*.86+86;
  const ut=wUnit()+'  ·  '+v.d.sets+' '+t('sets').toLowerCase();g.font=cardFont(58,'800');const pw=g.measureText(ut).width+72;
  g.fillStyle=v.acc;g.beginPath();if(g.roundRect)g.roundRect(80,y2-62,pw,92,46);else g.rect(80,y2-62,pw,92);g.fill();
  csTxt(g,ut,80+36,y2+2,58,'800','#ffffff');
  const nn=csFit(g,v.name,W-160,52,'800');csTxt(g,v.name,80,y2+110,nn,'800',v.ink);
  csTxt(g,v.d.date,80,y2+164,36,'600',v.sub);
  if(v.d.prs)csPr(g,80,y2+240,v);
}

/* vert: stats run up the right edge, name bottom-left (like the sideways Strava card) / datos en vertical por el borde derecho, nombre abajo a la izquierda */
function csVert(g,v){
  const W=v.W,H=v.H,n=v.stats.length;
  csLogo(g,80,110,64,v.ink,'left',v.acc);
  g.fillStyle=v.acc;g.fillRect(W-196,Math.round(H*.12),8,Math.round(H*.76));
  v.stats.forEach((s,i)=>{
    const cy=H*.2+(i+.5)*(H*.6/Math.max(n,1));
    g.save();g.translate(W-110,cy);g.rotate(-Math.PI/2);
    g.textAlign='center';
    g.font=cardFont(34,'600');g.fillStyle=v.sub;g.fillText(s.l,0,-92);
    const fp=csFit(g,s.v,H*.6/Math.max(n,1)-60,92,'900');g.font=cardFont(fp,'900');g.fillStyle=v.ink;g.fillText(s.v,0,0);
    g.restore();
  });
  const p=csFit(g,v.name,W-420,104,'900');csTxt(g,v.name,80,H-250,p,'900',v.ink);
  csTxt(g,v.d.date,80,H-190,36,'600',v.sub);
  if(v.d.prs)csPr(g,80,H-120,v);
}
/* row: three big numbers side by side with an accent bar under each / tres números grandes en fila con una barra de color debajo */
function csRow(g,v){
  const W=v.W,y=v.B-560,n=Math.max(v.stats.length,1),cw=(W-160)/n;
  csLogo(g,80,y,60,v.ink,'left',v.acc);
  const p=csFit(g,v.name,W-160,120,'900');csTxt(g,v.name,80,y+200,p,'900',v.ink);
  csTxt(g,v.d.date,80,y+264,38,'600',v.sub);
  const fp=Math.min.apply(null,v.stats.map(s=>csFit(g,s.v,cw-30,118,'900'))); // same size for all so they line up / mismo tamaño para que se alineen
  v.stats.forEach((s,i)=>{
    const x=80+i*cw;
    csTxt(g,s.l,x,y+370,34,'700',v.sub);
    csTxt(g,s.v,x,y+370+fp*.95,fp,'900',v.ink);
    g.fillStyle=v.acc;g.fillRect(x,y+370+fp*.95+30,90,12);
  });
  if(v.d.prs)csPr(g,80,y+620,v);
}
/* dots: bold name and a compact list with dotted leaders / nombre en grande y lista compacta con puntos guía */
function csDots(g,v){
  if(v.h)return csDotsH(g,v);
  const W=v.W,rows=v.wo?v.stats.map(s=>[s.l,s.v]):v.d.top.map(x=>{let n=exName(x.eid,x.n);return[n,x.sets+' × '+(x.b?fmtSet(x.m,x.b):'')];});
  const h=Math.min(78,Math.floor(760/Math.max(rows.length,1))),fs=Math.round(h*.52),y=v.B-(rows.length*h)-290;
  const p=csFit(g,v.name,W-160,112,'900');csTxt(g,v.name,80,y,p,'900',v.ink);
  csTxt(g,v.d.date+(v.d.dur?'  ·  '+v.d.dur:''),80,y+58,38,'600',v.sub);
  g.fillStyle=v.acc;g.fillRect(80,y+92,150,12);
  let yy=y+170;
  rows.forEach(r=>{
    let n=r[0];g.font=cardFont(fs,'800');while(g.measureText(n).width>520&&n.length>4)n=n.slice(0,-2);if(n!==r[0])n+='…';
    csTxt(g,n,80,yy,fs,'800',v.ink);
    let rt=String(r[1]);if(rt.length>24)rt=rt.slice(0,24);csTxt(g,rt,W-80,yy,fs,'700',v.ink,'right');
    g.font=cardFont(fs,'800');const a=80+g.measureText(n).width+22;g.font=cardFont(fs,'700');const b=W-80-g.measureText(rt).width-22;
    g.fillStyle=v.acc;for(let x=a;x<b;x+=17){g.beginPath();g.arc(x,yy-fs*.18,3.2,0,6.3);g.fill();}
    yy+=h;
  });
  if(v.d.prs)csPr(g,80,yy+30,v);
  csLogo(g,80,yy+(v.d.prs?80:40),56,v.ink,'left',v.acc);
}

/* ---- wide versions (landscape cards) / versiones anchas (tarjetas horizontales) ---- */
function csGiantH(g,v){
  const W=v.W,y=v.B-420,kg=wkVol(v.wk),num=wShow(kg);
  csLogo(g,80,y,56,v.ink,'left',v.acc);
  csTxt(g,t('csGiantL'),80,y+150,46,'700',v.sub);
  csNum(g,num,80,y+200,480,300,'900',v.ink);
  const x=620,cw=W-80-x;
  const ut=wUnit()+'  ·  '+v.d.sets+' '+t('sets').toLowerCase();g.font=cardFont(46,'800');const pw=Math.min(cw,g.measureText(ut).width+60);
  g.fillStyle=v.acc;g.beginPath();if(g.roundRect)g.roundRect(x,y+120,pw,76,38);else g.rect(x,y+120,pw,76);g.fill();
  csTxt(g,ut,x+30,y+174,46,'800','#ffffff');
  const nn=csFit(g,v.name,cw,56,'800');csTxt(g,v.name,x,y+270,nn,'800',v.ink);
  {const dq=csFit(g,v.d.date,cw,30,'600');csTxt(g,v.d.date,x,y+318,dq,'600',v.sub);}
  if(v.d.prs)csPr(g,x,y+390,v);
}
function csDotsH(g,v){csListH(g,v,true);}
/* two columns of exercises: dotted (clean) or with lines / dos columnas de ejercicios: con puntos o con líneas */
function csListH(g,v,dots){
  const W=v.W,rows=v.wo?v.stats.map(s=>[s.l,s.v]):v.d.top.map(x=>{let n=exName(x.eid,x.n);return[n,x.sets+' × '+(x.b?fmtSet(x.m,x.b):'')];});
  const two=rows.length>4,per=two?Math.ceil(rows.length/2):rows.length,h=64,fs=two?26:34,cw=two?(W-160-40)/2:W-160,y=v.B-(per*h)-230;
  const p=csFit(g,v.name,W-160,96,'900');csTxt(g,v.name,80,y,p,'900',v.ink);
  csTxt(g,v.d.date+(v.d.dur?'  ·  '+v.d.dur:''),80,y+54,34,'600',v.sub);
  if(dots){g.fillStyle=v.acc;g.fillRect(80,y+84,150,10);}
  rows.forEach((r,i)=>{
    const col=i<per?0:1,x=80+col*(cw+40),yy=y+150+(i%per)*h;
    let rt=String(r[1]);if(rt.length>20)rt=rt.slice(0,20);g.font=cardFont(fs,'700');const rw=g.measureText(rt).width;
    let n=r[0];g.font=cardFont(fs,'800');const mx=cw-rw-32;while(g.measureText(n).width>mx&&n.length>4){n=n.slice(0,-1).trimEnd();}if(n!==r[0]){n+='…';while(g.measureText(n).width>mx&&n.length>2)n=n.slice(0,-2)+'…';}
    csTxt(g,n,x,yy,fs,'800',v.ink);csTxt(g,rt,x+cw,yy,fs,'700',v.ink,'right');
    if(dots){g.font=cardFont(fs,'800');const a=x+g.measureText(n).width+16;g.font=cardFont(fs,'700');const b=x+cw-g.measureText(rt).width-16;g.fillStyle=v.acc;for(let d=a;d<b;d+=15){g.beginPath();g.arc(d,yy-fs*.18,2.8,0,6.3);g.fill();}}
    else{g.fillStyle=v.line;g.fillRect(x,yy+18,cw,2);}
  });
  if(v.d.prs)csPr(g,80,y+150+per*h+30,v);
  csLogo(g,W-80,y+150+per*h+(v.d.prs?14:30),48,v.ink,'right',dots?v.acc:undefined);
}
function csFunH(g,v){
  const W=v.W,kg=wkVol(v.wk),f=csFunObj(kg,csFunSeed(v),v.lol),y=v.B-440,T=y+110;
  csLogo(g,80,y,56,v.ink);csTierPill(g,v,W-80,y);
  const num=f.n>=10?String(Math.round(f.n)):f.n.toFixed(1),nb=csNum(g,num,80,T,430,330,'900',v.acc);
  const x=560,cw=W-80-x;
  /* right text spans exactly from the top of the number to its baseline / el texto de la derecha va del tope del número a su línea base */
  const l1=T+26;csTxt(g,t('csFunT'),x,l1,36,'700',v.sub);
  const nm=t('csObj_'+f.k),p=csFit(g,nm,cw,96,'800'),nB=l1+16+p*.78;csTxt(g,nm,x,nB,p,'800',v.ink);
  const ft=v.d.date,fq=csFit(g,ft,cw,28,'500');csTxt(g,ft,x,nb,fq,'500',v.sub);
  csTxt(g,'= '+wShow(kg)+' '+wUnit()+'  ·  '+v.d.sets+' '+t('sets').toLowerCase(),x,(nB+nb)/2+8,34,'600',v.sub);
}

/* duo: the "fun" card and the exercise list together in ONE image (stacked, or side by side when wide) / la tarjeta curiosa y la lista de ejercicios juntas en UNA imagen (apiladas, o lado a lado en horizontal) */
function csDuo(g,v){
  const W=v.W,kg=wkVol(v.wk),f=csFunObj(kg,csFunSeed(v),v.lol),all=v.wo?v.stats.map(s=>[s.l,s.v]):v.d.top.map(x=>{let n=exName(x.eid,x.n);return[n,x.sets+' × '+(x.b?fmtSet(x.m,x.b):'')];});
  const rows=all.slice(0,6),n=rows.length,h=66,fs=32,num=f.n>=10?String(Math.round(f.n)):f.n.toFixed(1);
  const list=(x,y,cw)=>rows.forEach((r,i)=>{const yy=y+i*h;let rt=String(r[1]);if(rt.length>20)rt=rt.slice(0,20);g.font=cardFont(fs,'700');const mx=cw-g.measureText(rt).width-28;let nm=r[0];g.font=cardFont(fs,'800');while(g.measureText(nm).width>mx&&nm.length>4)nm=nm.slice(0,-1).trimEnd();if(nm!==r[0])nm+='…';csTxt(g,nm,x,yy,fs,'800',v.ink);csTxt(g,rt,x+cw,yy,fs,'700',v.sub,'right');g.fillStyle=v.line;g.fillRect(x,yy+18,cw,2);});
  const nmO=t('csObj_'+f.k);
  if(v.h){
    const y=v.B-Math.max(n*h,330)-250;
    csLogo(g,80,y,52,v.ink);
    const nb=csNum(g,num,80,y+100,340,300,'900',v.acc);
    csTxt(g,t('csFunT'),80,nb+56,28,'700',v.sub);
    const q=csFit(g,nmO,380,44,'800');csTxt(g,nmO,80,nb+104,q,'800',v.ink);
    list(470,y+40,W-80-470);
    return;
  }
  const y=v.B-(n*h)-680;
  csLogo(g,80,y,56,v.ink);
  csNum(g,num,80,y+110,440,260,'900',v.acc);
  const x=560,cw=W-80-x;
  csTxt(g,t('csFunT'),x,y+160,34,'700',v.sub);
  const q=csFit(g,nmO,cw,70,'800');csTxt(g,nmO,x,y+160+q+10,q,'800',v.ink);
  csTxt(g,'= '+wShow(kg)+' '+wUnit(),x,y+160+q+66,32,'600',v.sub);
  g.fillStyle=v.acc;g.fillRect(80,y+380,150,10);
  csTxt(g,v.d.date,80,y+450,32,'600',v.sub);
  list(80,y+520,W-160);
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
const CS_OBJ=[['whl',150000],['jet',41000],['hmp',30000],['fir',18000],['bus',11000],['trx',8000],['ele',6000],['orc',5000],['pck',2500],['rhi',2300],['cnt',2200],['hip',1500],['car',1300],['gir',1200],['shk',900],['cow',700],['hrs',500],['pia',450],['pbr',450],['mot',300],['vnd',250],['tig',220],['lio',190],['gor',160],['sum',150],['pnd',100],['fri',80],['adl',75],['keg',73],['kng',70],['cem',43],['dog',30],['lug',23],['tir',10],['mel',8],['bow',7],['cat',4.5],['bby',3.5],['gal',3.8],['lap',2],['soc',0.43],['b52',83000],['mbt',60000],['c13',34000],['f22',19700],['f35',13300],['a10',11300],['chn',11000],['f16',8600],['blk',5200],['hum',5000],['tmh',1600]].sort(function(a,b){return b[1]-a[1];}); // [key, kg] — sorted heaviest first / [clave, kg] — de más pesado a más ligero
/* what you lifted, as a thing people know. With a seed it picks among the things that give a nice number (1 to 15), epic ones on big days; without one, the heaviest thing you outweigh /
   lo que levantaste, como algo conocido. Con semilla elige entre lo que da un número agradable (1 a 15), cosas épicas en los días grandes; sin semilla, lo más pesado que superaste */
const CS_EPIC={whl:1,jet:1,hmp:1,fir:1,bus:1,trx:1,ele:1,orc:1,pck:1,b52:1,mbt:1,c13:1,f22:1,f35:1,a10:1,chn:1,f16:1,blk:1,hum:1,tmh:1}; // war machines and giants: big days get these / máquinas de guerra y gigantes: los días grandes las reciben
const CS_LOL=[['gsd',34],['chi',2.3],['cor',12],['cap',50],['fgc',9],['rac',9],['gse',5],['pen',36],['fla',3],['trt',0.5],['tco',0.1],['bur',0.6],['piz',1],['pol',1.4],['tam',0.25],['pdc',0.1],['mre',0.7],['mon',0.5],['hlm',1.4],['pla',7],['m4r',3.4],['sbg',18],['wtr',19],['amc',10],['bud',100],['cas',90]]; // funny things: can reach thousands of units / cosas graciosas: pueden llegar a miles de unidades
function csFunObj(kg,seed,lol){
  if(lol){ // funny mode: only the funny things / modo gracioso: solo las cosas graciosas
    const L=CS_LOL.filter(function(o){const n=kg/o[1];return n>=2&&n<=20000;});
    if(L.length)return(function(o){return{k:o[0],n:kg/o[1]};})(seed!=null?L[seed%L.length]:L[0]);
    const o=kg/CS_LOL[CS_LOL.length-1][1]<2?CS_LOL.slice().sort(function(a,b){return a[1]-b[1];})[0]:CS_LOL.slice().sort(function(a,b){return b[1]-a[1];})[0];
    return{k:o[0],n:kg/o[1]};
  }
  const ok=CS_OBJ.filter(function(o){return kg/o[1]>=1;});
  if(!ok.length){const o=CS_OBJ[CS_OBJ.length-1];return{k:o[0],n:kg/o[1]};}
  let pick=ok[0];
  if(seed!=null){
    let pool=[];
    if(csTier(kg)==='epic'||csTier(kg)==='leg')pool=ok.filter(function(o){return CS_EPIC[o[0]]&&kg/o[1]<=10;}); // a big day deserves something epic / un día grande merece algo épico
    if(!pool.length)pool=ok.filter(function(o){return kg/o[1]<=15;});
    if(pool.length)pick=pool[seed%pool.length];
  }
  return{k:pick[0],n:kg/pick[1]};
}
/* the pick comes from the numbers you lifted (volume, sets, reps), never from the date: two workouts in one day give different things, the same numbers give the same thing /
   la elección sale de los números que levantaste (volumen, series, repeticiones), nunca de la fecha: dos entrenamientos el mismo día dan cosas distintas, los mismos números dan lo mismo */
function csFunSeed(v){
  const wk=v.wk||{ex:[]};let sets=0,reps=0;
  (wk.ex||[]).forEach(function(x){(x.sets||[]).forEach(function(q){sets++;reps+=q.r||0;});});
  let h=(Math.round(wkVol(wk))|0)^Math.imul(sets+1,2654435761)^Math.imul(reps+1,40503);
  h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;h=Math.imul(h,3266489909);h^=h>>>16;
  return (h>>>0)+(v.fs|0);
}
/* rarity tag from the volume, like a game: only big days earn one / etiqueta de rareza según el volumen, como en un juego: solo los días grandes la ganan */
function csTier(kg){return kg>=15000?'leg':kg>=8000?'epic':kg>=4000?'rare':'';}
function csTierPill(g,v,xr,y){
  const k=csTier(wkVol(v.wk));if(!k)return;
  const txt=t('csTier_'+k);g.font=cardFont(30,'800');
  const w=g.measureText(txt).width+52,x=xr-w,h=54,gold=k==='leg';
  g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,27);else g.rect(x,y,w,h);
  if(k==='rare'){g.strokeStyle=v.ink;g.lineWidth=3;g.stroke();}else{g.fillStyle=gold?'#FFC93C':v.acc;g.fill();}
  csTxt(g,txt,x+26,y+37,30,'800',k==='rare'?v.ink:(gold?'#2A1A00':'#ffffff'));
}
function csFun(g,v){
  if(v.h)return csFunH(g,v);
  const W=v.W,kg=wkVol(v.wk),f=csFunObj(kg,csFunSeed(v),v.lol),y=v.B-640;
  csLogo(g,80,y-40,60,v.ink);
  csTierPill(g,v,W-80,y-36);
  csTxt(g,t('csFunT'),80,y+110,50,'700',v.sub);
  const num=f.n>=10?String(Math.round(f.n)):f.n.toFixed(1),fp=csFit(g,num,W-160,300,'800');csTxt(g,num,70,y+360,fp,'800',v.acc);
  const nm=t('csObj_'+f.k),p=csFit(g,nm,W-160,110,'800');csTxt(g,nm,80,y+480,p,'800',v.ink);
  csTxt(g,'= '+wShow(kg)+' '+wUnit()+'  ·  '+v.d.sets+' '+t('sets').toLowerCase(),80,y+560,44,'600',v.sub);
  csTxt(g,v.name+'  ·  '+v.d.date,80,y+625,34,'500',v.sub);
}

/* 11 · body: both sides of the body painted by what you trained today (main = accent, helpers = blue, light work = faint blue) /
   cuerpo: los dos lados del cuerpo pintados con lo que entrenaste hoy (principal = acento, ayudan = azul, trabajo ligero = azul tenue) */
function csBody(g,v){
  const W=v.W,y=Math.min(v.B-860,v.H-965),wk=v.wk,sc={};
  (wk.ex||[]).forEach(function(x){const n=(x.sets||[]).filter(function(q){return q.done!==false&&(q.r>0||q.t>0);}).length;if(!n)return;(muW(x.eid,x.vr)||[]).forEach(function(m){sc[m[0]]=(sc[m[0]]||0)+n*m[1];});});
  const keys=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];}),mx=keys.length?sc[keys[0]]:1;
  const col=function(k){const r=(sc[k]||0)/mx;return r>=.6?v.acc:(r>=.25?'#2F9BFF':(r>0?'rgba(47,155,255,.35)':'rgba(128,128,140,.30)'));};
  csLogo(g,80,y-30,60,v.ink);csTxt(g,v.d.date,W-80,y+30,34,'500',v.sub,'right');
  const fw=250,gap=70,x0=(W-2*fw-gap)/2;
  ['front','back'].forEach(function(face,i){anaCanvas(g,face,x0+i*(fw+gap),y+50,fw,col);});
  const top=keys.filter(function(k){return MUS_BASE[k];}).slice(0,2).map(function(k){return t('ms_'+k);}),more=Math.max(0,keys.length-2);
  csTxt(g,t('csBodyT'),80,y+655,44,'700',v.sub);
  const nm=top.length?top.join(' · '):v.name,p=csFit(g,nm,W-160,100,'800');csTxt(g,nm,80,y+740,p,'800',v.ink);
  if(more)csTxt(g,t('csBodyMore',more),80,y+805,48,'800',v.acc);
  const n=Math.min(3,v.stats.length),cw=(W-160)/Math.max(n,1);
  v.stats.slice(0,3).forEach(function(q,i){const x=80+i*cw,fp=csFit(g,q.v,cw-40,64,'800');csTxt(g,q.v,x,y+890,fp,'800',v.ink);csTxt(g,q.l,x,y+930,28,'500',v.sub);});
}
