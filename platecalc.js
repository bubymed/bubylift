/* Plate calculator: tap the plates on the bar and see the total. Opens from the round button next to the rest timer.
   Calculadora de discos: toca los discos que pusiste en la barra y mira el total. Se abre con el botón redondo junto al cronómetro. */
const PC_PLATES={kg:[0.5,1.25,2.5,5,10,15,20,25],lb:[1.25,2.5,5,10,25,35,45]}; // smallest to heaviest / del más pequeño al más pesado
const PC_COL={25:'#d62828',20:'#1d4ed8',15:'#e8b100',10:'#16a34a',5:'#f1f1ee',2.5:'#4b5563',1.25:'#6b7280',0.5:'#9ca3af'}; // kg plates use the competition colors / los discos en kg usan los colores de competencia
const PC_BARS=[['oly',20,45],['wom',15,35],['ez',9,20],['hex',25,55],['train',7,15],['none',0,0]]; // [key, kg, lb]
let PC={n:{},open:0};
function pcUnit(){return SET.pcUnit==='lb'||SET.pcUnit==='kg'?SET.pcUnit:(imp()?'lb':'kg');}
function pcSides(){return SET.pcSides===1?1:2;}
function pcBarKey(){return SET.pcBar||'oly';}
function pcBarW(){
  const k=pcBarKey(),u=pcUnit();
  if(k==='cus')return Math.max(0,+SET.pcCus||0);
  const b=PC_BARS.find(x=>x[0]===k)||PC_BARS[0];return u==='lb'?b[2]:b[1];
}
function pcPlatesSum(){let s=0;Object.keys(PC.n).forEach(k=>{s+=(+k)*PC.n[k];});return s;}
function pcTotal(){return pcBarW()+pcPlatesSum()*pcSides();}
function pcFmt(v){return fmtNum(v,2);}
/* round button next to the rest timer: only on the Workout tab / botón redondo junto al cronómetro: solo en la pestaña Entrenar */
function plateFab(){
  const b=$('platefab');if(!b)return;
  const on=tab==='workout'&&!(ACT&&ACT.guide&&!ACT.gOff);
  b.hidden=!on;document.body.classList.toggle('resting',!!(typeof REST!=='undefined'&&REST));
  if(on&&!b.innerHTML){b.innerHTML=ic('barbell');b.setAttribute('aria-label',t('pcT'));}
}
function pcOpen(){PC.open=1;pcDraw();}
function pcDraw(){
  const u=pcUnit(),bk=pcBarKey(),pl=PC_PLATES[u],mx=pl[pl.length-1],sides=pcSides();
  const chip=(on,fn,label)=>'<button class="chip'+(on?' on':'')+'" onclick="'+fn+'">'+label+'</button>';
  const bars=PC_BARS.map(b=>{const w=u==='lb'?b[2]:b[1];return chip(bk===b[0],"pcBar('"+b[0]+"')",esc(t('pc_'+b[0]))+(w?' · '+w+' '+u:''));}).join('')+chip(bk==='cus',"pcBar('cus')",esc(t('pc_cus')));
  // one side of the bar: heaviest next to the collar / un lado de la barra: el más pesado junto al tope
  const stack=pl.slice().reverse().map(v=>{const c=PC.n[v]||0,h=18+Math.round(v/mx*44);let s='';for(let i=0;i<Math.min(c,8);i++)s+='<i class="pc-d" style="height:'+h+'px;background:'+(u==='kg'?(PC_COL[v]||'#6b7280'):'#3a3f47')+'"></i>';return s;}).join('');
  const grid=pl.map(v=>{
    const c=PC.n[v]||0,sz=40+Math.round(v/mx*30),bg=u==='kg'?(PC_COL[v]||'#6b7280'):'#3a3f47',fg=(u==='kg'&&v===5)?'#222':'#fff';
    return'<div class="pc-c"><button class="pc-p" style="width:'+sz+'px;height:'+sz+'px;background:'+bg+';color:'+fg+'" onclick="pcAdd('+v+')" aria-label="'+esc(t('pcAddA',v+' '+u))+'">'+v+(c?'<em>'+c+'</em>':'')+'</button>'+
      '<button class="pc-m" onclick="pcSub('+v+')" aria-label="'+esc(t('pcSubA',v+' '+u))+'"'+(c?'':' disabled')+'>−</button></div>';}).join('');
  const tot=pcTotal(),other=u==='kg'?tot*KG_LB:tot/KG_LB,ps=pcPlatesSum();
  sheet('<div class="form pcalc"><div class="pick-h"><h3>'+t('pcT')+'</h3><span class="pc-u">'+chip(u==='kg',"pcSetUnit('kg')",'kg')+chip(u==='lb',"pcSetUnit('lb')",'lb')+'</span><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="lbl">'+t('pcBarL')+'</div><div class="chips wrap">'+bars+'</div>'+
    (bk==='cus'?'<label class="sm">'+t('pcCusP')+' ('+u+') <input id="pccus" class="in" type="text" inputmode="decimal" autocomplete="off" value="'+esc(SET.pcCus!=null?String(SET.pcCus):'')+'" oninput="pcCus(this.value)"></label>':'')+
    '<div class="lbl">'+t('pcSidesL')+'</div><div class="chips">'+chip(sides===2,'pcSetSides(2)',t('pcBoth'))+chip(sides===1,'pcSetSides(1)',t('pcOne'))+'</div>'+
    '<div class="pc-bar" aria-hidden="true"><span class="pc-shaft"></span><span class="pc-stack">'+stack+'</span></div><p class="muted sm pc-cap">'+t(sides===2?'pcEach':'pcOneCap')+(ps?' · '+pcFmt(ps)+' '+u:'')+'</p>'+
    '<div class="pc-g">'+grid+'</div><p class="muted sm">'+t('pcTap')+'</p>'+
    '<div class="pc-tot"><div class="pc-tw"><span class="pc-tl">'+t('pcTotal')+'</span><b class="pc-tv">'+pcFmt(tot)+' '+u+'</b></div>'+
    '<div class="pc-act"><button class="btn" onclick="pcClear()"'+(ps?'':' disabled')+'>'+t('pcClear')+'</button><button class="btn pri" onclick="sheetClose()">'+t('done')+'</button></div>'+
    '<div class="pc-bd muted sm">≈ '+pcFmt(other)+' '+(u==='kg'?'lb':'kg')+' · '+esc(t('pcBarW',pcFmt(pcBarW())+' '+u))+(ps?' + '+sides+' × '+pcFmt(ps)+' '+u:'')+'</div></div></div>');
}
function pcAdd(v){PC.n[v]=Math.min(20,(PC.n[v]||0)+1);if(navigator.vibrate&&SET.hap!==false)try{navigator.vibrate(6);}catch(e){}pcDraw();}
function pcSub(v){if(PC.n[v]>0){PC.n[v]--;if(!PC.n[v])delete PC.n[v];}pcDraw();}
function pcClear(){PC.n={};pcDraw();}
function pcSetUnit(u){if(u===pcUnit())return;SET.pcUnit=u;PC.n={};jset(K_SET,SET);pcDraw();} // the plate sets differ, so the count starts over / los juegos de discos son distintos, se empieza de cero
function pcBar(k){SET.pcBar=k;jset(K_SET,SET);pcDraw();const el=$('pccus');if(el)el.focus();}
function pcSetSides(n){SET.pcSides=n;jset(K_SET,SET);pcDraw();}
function pcCus(v){const n=numParse(v);SET.pcCus=n==null||n<0?0:Math.min(n,500);jset(K_SET,SET);const el=document.querySelector('.pc-tv');if(el){const u=pcUnit();el.textContent=pcFmt(pcTotal())+' '+u;}}
