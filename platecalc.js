/* Plate calculator: tap the plates on the bar and see the total. Opens from the round button next to the rest timer.
   Calculadora de discos: toca los discos que pusiste en la barra y mira el total. Se abre con el botón redondo junto al cronómetro. */
const PC_PLATES={kg:[0.5,1.25,2.5,5,10,15,20,25],lb:[1.25,2.5,5,10,25,35,45]}; // smallest to heaviest / del más pequeño al más pesado
const PC_COL={25:'#d62828',20:'#1d4ed8',15:'#e8b100',10:'#16a34a',5:'#f1f1ee',2.5:'#4b5563',1.25:'#6b7280',0.5:'#9ca3af'}; // kg plates use the competition colors / los discos en kg usan los colores de competencia
const PC_BARS=[['oly',20,45],['wom',15,35],['ez',9,20],['hex',25,55],['train',7,15],['none',0,0]]; // [key, kg, lb]
let PC={n:{},open:0,foc:null};
/* the weight box you touched last, or the first empty weight set: that is where "Use in set" puts the number / la casilla de peso que tocaste por última vez, o la primera serie vacía: ahí pone el número "Usar en la serie" */
document.addEventListener('focusin',function(ev){const el=ev.target;if(el&&el.dataset&&el.dataset.k==='w'&&el.dataset.i!=null&&el.classList.contains('in'))PC.foc={i:+el.dataset.i,j:+el.dataset.j};});
function pcOk(i,j){const x=typeof ACT!=='undefined'&&ACT&&ACT.ex[i];return!!x&&!!x.sets[j]&&exMode(x.eid)==='wr'&&!isDb(x);}
function pcTarget(){
  if(typeof ACT==='undefined'||!ACT)return null;
  if(PC.foc&&pcOk(PC.foc.i,PC.foc.j))return{i:PC.foc.i,j:PC.foc.j,sel:1};
  for(let i=0;i<ACT.ex.length;i++)for(let j=0;j<ACT.ex[i].sets.length;j++){const s=ACT.ex[i].sets[j];if(pcOk(i,j)&&s.w==null&&!s.done)return{i:i,j:j,sel:0};}
  return null;
}
function pcBarEx(x){return barOf(x)>0||barDef(x.eid)>0;} // a barbell exercise: the calculator starts with its bar / ejercicio de barra: la calculadora empieza con su barra

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
function pcOpen(){
  PC.open=1;const g=pcTarget(),x=g&&ACT.ex[g.i];
  if(x&&pcBarEx(x)){ // start with the bar this exercise uses / empieza con la barra que usa este ejercicio
    const kg=barOf(x)>0?barOf(x):barDef(x.eid),u=pcUnit(),w=u==='lb'?kg*KG_LB:kg,b=PC_BARS.find(q=>Math.abs((u==='lb'?q[2]:q[1])-w)<0.5&&q[1]>0);
    if(b)SET.pcBar=b[0];else{SET.pcBar='cus';SET.pcCus=Math.round(w*100)/100;}
    jset(K_SET,SET);
  }
  pcDraw();
}
function pcBarKg(){const w=pcBarW();return pcUnit()==='lb'?w/KG_LB:w;}
/* the bar picked here is remembered for the exercise the calculator is working on / la barra elegida aquí se recuerda para el ejercicio en el que trabaja la calculadora */
function pcKeepBar(){const g=pcTarget(),x=g&&ACT.ex[g.i];if(x&&pcBarEx(x)&&Math.abs(pcBarKg()-barOf(x))>0.05)barKeep(x,pcBarKg());}
/* open on one exercise: its first set without a weight, or the last one / abrir en un ejercicio: su primera serie sin peso, o la última */
function pcOpenEx(i){const x=ACT&&ACT.ex[i];if(!x)return;let j=x.sets.findIndex(s=>!s.done&&s.w==null);if(j<0)j=x.sets.findIndex(s=>!s.done);if(j<0)j=x.sets.length-1;PC.foc={i:i,j:j};PC.n={};PC.rev=null;pcOpen();}
/* put the number in the set: always the total, bar included / pone el número en la serie: siempre el total, con la barra incluida */
function pcUse(){
  const g=pcTarget();if(!g)return;const x=ACT.ex[g.i],u=pcUnit();
  pcKeepBar();
  const val=pcTotal(),inApp=u==='kg'?(imp()?val*KG_LB:val):(imp()?val:val/KG_LB);
  sv(g.i,g.j,'w',String(fmtNum(inApp,2)));
  PC.foc=null;PC.n={};sheetClose();exRedraw(g.i);buzz(8);
  toast(t('pcUsed',exName(x.eid,x.n),g.j+1));
}
/* reverse: type the total you want and get the plates for each side. Exact when the plate set allows it, otherwise the closest weight below
   inverso: escribes el total que quieres y te da los discos de cada lado. Exacto si los discos lo permiten, si no, el peso más cercano por debajo */
function pcSolve(per,u){
  const pl=PC_PLATES[u].map(v=>Math.round(v*4)),tg=Math.floor(per*4+1e-6),dp=new Array(tg+1).fill(-1),ch=new Array(tg+1).fill(0);
  dp[0]=0;
  for(let a=1;a<=tg;a++)for(let k=0;k<pl.length;k++){const p=pl[k];if(a>=p&&dp[a-p]>=0&&(dp[a]<0||dp[a-p]+1<dp[a])){dp[a]=dp[a-p]+1;ch[a]=k;}}
  let a=tg;while(a>0&&dp[a]<0)a--;
  const n={};let r=a;while(r>0){const k=ch[r],v=PC_PLATES[u][k];n[v]=(n[v]||0)+1;r-=pl[k];}
  return{n:n,got:a/4};
}
function pcReverse(){
  const el=$('pcrev'),v=numParse(el?el.value:''),u=pcUnit(),bar=pcBarW(),sides=pcSides();
  PC.rev={in:el?el.value:''};
  if(v==null||v<=0||v>2000){PC.rev.m=['pcRevBad'];pcDraw();return;}
  if(v<bar-1e-6){PC.rev.m=['pcRevLow',pcFmt(bar),u];pcDraw();return;}
  const per=(v-bar)/sides,r=pcSolve(per,u),got=bar+r.got*sides;
  PC.n=r.n;
  PC.rev.m=Math.abs(got-v)<1e-6?['pcRevOk',pcFmt(got),u]:['pcRevNear',pcFmt(v),u,pcFmt(got),pcFmt(v-got)];
  pcDraw();
}
function pcDraw(){
  const u=pcUnit(),bk=pcBarKey(),pl=PC_PLATES[u],mx=pl[pl.length-1],sides=pcSides();
  const chip=(on,fn,label)=>'<button class="chip'+(on?' on':'')+'" onclick="'+fn+'">'+label+'</button>';
  const bars=PC_BARS.map(b=>{const w=u==='lb'?b[2]:b[1];return chip(bk===b[0],"pcBar('"+b[0]+"')",esc(t('pcs_'+b[0]))+(w?' <small>'+w+'</small>':''));}).join('')+chip(bk==='cus',"pcBar('cus')",esc(t('pc_cus')));
  // one side of the bar: heaviest next to the collar / un lado de la barra: el más pesado junto al tope
  const stack=pl.slice().reverse().map(v=>{const c=PC.n[v]||0,h=16+Math.round(v/mx*34);let s='';for(let i=0;i<Math.min(c,8);i++)s+='<i class="pc-d" style="height:'+h+'px;background:'+(u==='kg'?(PC_COL[v]||'#6b7280'):'#3a3f47')+'"></i>';return s;}).join('');
  const grid=pl.map(v=>{
    const c=PC.n[v]||0,sz=40+Math.round(v/mx*30),bg=u==='kg'?(PC_COL[v]||'#6b7280'):'#3a3f47',fg=(u==='kg'&&v===5)?'#222':'#fff';
    return'<div class="pc-c"><button class="pc-p" style="width:'+sz+'px;height:'+sz+'px;background:'+bg+';color:'+fg+'" onclick="pcAdd('+v+')" aria-label="'+esc(t('pcAddA',v+' '+u))+'">'+v+(c?'<em>'+c+'</em>':'')+'</button>'+
      '<button class="pc-m" onclick="pcSub('+v+')" aria-label="'+esc(t('pcSubA',v+' '+u))+'"'+(c?'':' disabled')+'>−</button></div>';}).join('');
  const tot=pcTotal(),other=u==='kg'?tot*KG_LB:tot/KG_LB,ps=pcPlatesSum();
  sheet('<div class="form pcalc"><div class="pick-h"><h3>'+t('pcT')+'</h3><span class="pc-u">'+chip(u==='kg',"pcSetUnit('kg')",'kg')+chip(u==='lb',"pcSetUnit('lb')",'lb')+'</span><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    pcTgHtml(ps,sides,u)+
    '<div class="lbl">'+t('pcBarL')+' · '+esc(t('pc_'+bk))+' '+pcFmt(pcBarW())+' '+u+'</div><div class="chips wrap">'+bars+'</div>'+
    (bk==='cus'?'<label class="sm">'+t('pcCusP')+' ('+u+') <input id="pccus" class="in" type="text" inputmode="decimal" autocomplete="off" value="'+esc(SET.pcCus!=null?String(SET.pcCus):'')+'" oninput="pcCus(this.value)"></label>':'')+
    '<div class="pc-row"><span class="lbl">'+t('pcSidesL')+'</span><div class="chips">'+chip(sides===2,'pcSetSides(2)',t('pcBoth'))+chip(sides===1,'pcSetSides(1)',t('pcOne'))+'</div></div>'+
    '<div class="pc-rev"><label class="sm">'+t('pcRevL',u)+' <input id="pcrev" class="in" type="text" inputmode="decimal" autocomplete="off" placeholder="'+(u==='kg'?'102.5':'225')+'" value="'+esc((PC.rev&&PC.rev.in)||'')+'" onkeydown="if(event.key===\'Enter\'){event.preventDefault();pcReverse();}"></label><button class="btn" onclick="pcReverse()">'+t('pcRevB')+'</button></div>'+
    (PC.rev&&PC.rev.m?'<p class="sm pc-revm'+(PC.rev.m[0]==='pcRevOk'?' ok':' warn')+'" role="status">'+esc(t.apply(null,PC.rev.m))+'</p>':'')+
    '<div class="pc-bar" aria-hidden="true"><span class="pc-shaft"></span><span class="pc-stack">'+stack+'</span></div><p class="muted sm pc-cap">'+t(sides===2?'pcEach':'pcOneCap')+(ps?' · '+pcFmt(ps)+' '+u:'')+'</p>'+
    '<div class="pc-g">'+grid+'</div><p class="muted sm">'+t('pcTap')+'</p>'+
    '<div class="pc-tot"><div class="pc-tw"><span class="pc-tl">'+t('pcTotal')+'</span><b class="pc-tv">'+pcFmt(tot)+' '+u+'</b></div>'+
    '<div class="pc-act"><button class="btn" onclick="pcClear()"'+(ps?'':' disabled')+'>'+t('pcClear')+'</button><button class="btn pri" onclick="sheetClose()">'+t('done')+'</button></div>'+
    '<div class="pc-bd muted sm">≈ '+pcFmt(other)+' '+(u==='kg'?'lb':'kg')+' · '+esc(t('pcBarW',pcFmt(pcBarW())+' '+u))+(ps?' + '+sides+' × '+pcFmt(ps)+' '+u:'')+'</div></div></div>');
}
function pcTgHtml(ps,sides,u){
  const g=pcTarget();if(!g)return'';const x=ACT.ex[g.i];
  return'<div class="pc-tg"><div><small>'+t(g.sel?'pcTgSel':'pcTgAuto')+'</small><b>'+esc(exName(x.eid,x.n))+' · '+t('pcSetN',g.j+1)+'</b>'+
    '<small>'+t('pcAll',pcFmt(pcTotal())+' '+u)+'</small></div><button class="btn pri" onclick="pcUse()">'+t('pcUse')+'</button></div>';
}
function pcAdd(v){PC.n[v]=Math.min(20,(PC.n[v]||0)+1);if(navigator.vibrate&&SET.hap!==false)try{navigator.vibrate(6);}catch(e){}pcDraw();}
function pcSub(v){if(PC.n[v]>0){PC.n[v]--;if(!PC.n[v])delete PC.n[v];}pcDraw();}
function pcClear(){PC.n={};PC.rev=null;pcDraw();}
function pcSetUnit(u){if(u===pcUnit())return;SET.pcUnit=u;PC.n={};PC.rev=null;jset(K_SET,SET);pcDraw();} // the plate sets differ, so the count starts over / los juegos de discos son distintos, se empieza de cero
function pcBar(k){SET.pcBar=k;jset(K_SET,SET);pcKeepBar();pcDraw();const el=$('pccus');if(el)el.focus();}
function pcSetSides(n){SET.pcSides=n;jset(K_SET,SET);pcDraw();}
function pcCus(v){const n=numParse(v);SET.pcCus=n==null||n<0?0:Math.min(n,500);jset(K_SET,SET);const el=document.querySelector('.pc-tv');if(el){const u=pcUnit();el.textContent=pcFmt(pcTotal())+' '+u;}}
