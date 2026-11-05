/* Anatomy figure (v1.1.62): draws the body (data/anatomy.js) and uses it in four places: Recovery (body view), the technique guide,
   "Find by muscle", and the "Body" share card. Muscle codes are the ones in data/musc.js. Main muscle = agonist, helpers = synergists, stabilizers.
   Figura anatómica (v1.1.62): dibuja el cuerpo (data/anatomy.js) y lo usa en cuatro lugares: Recuperación (vista de cuerpo), la guía de técnica,
   «Buscar por músculo» y la tarjeta «Cuerpo». Los códigos de músculo son los de data/musc.js. Músculo principal = agonista, ayudan = sinergistas, estabilizadores. */
const ANA_C=154.23; // the front view is mirrored around this x / la vista frontal es simétrica respecto a esta x
/* cut lines (left side; the right side is mirrored): chest into upper/lower, shoulder cap into side/front / líneas de corte */
const ANA_CUT={u:[[30,20],[80,20],[80,43],[62,44],[48,48],[33,58]],l:[[80,43],[62,44],[48,48],[33,58],[30,80],[80,80]],a:[[0,3],[70,73],[0,73]],f:[[0,3],[70,73],[70,0],[0,0]]};
const anaPoly=(p,m)=>'M '+p.map(q=>(m?+(ANA_C-q[0]).toFixed(1):q[0])+','+q[1]).join(' L ')+' Z';
let _anaN=0;
/* the figure as SVG. fill(code) gives a CSS color; o.sel highlights a part; o.tap names a function called with the part's code / el cuerpo en SVG */
function anaSvg(face,w,fill,o){
  o=o||{};const d=ANA[face],vb=d.vb.split(' ').map(Number),h=Math.round(w*vb[3]/vb[2]),id='an'+(++_anaN);
  let defs='';
  if(face==='front')defs='<defs>'+Object.keys(ANA_CUT).map(k=>'<clipPath id="'+id+k+'L"><path d="'+anaPoly(ANA_CUT[k])+'"/></clipPath><clipPath id="'+id+k+'R"><path d="'+anaPoly(ANA_CUT[k],1)+'"/></clipPath>').join('')+'</defs>';
  const P=(k,dd,clip)=>{
    if(!k)return'<path d="'+dd+'" class="an-sil"/>';
    const f=fill(k),s=o.sel===k;
    return'<path d="'+dd+'" data-m="'+k+'" class="an-m'+(s?' sel':'')+(f?'':' off')+'" style="fill:'+(f||'var(--an-none)')+'"'+(clip?' clip-path="url(#'+id+clip+')"':'')+(o.tap?' onclick="'+o.tap+'(\''+k+'\')"':'')+'/>';
  };
  let b='';
  d.s.forEach(x=>{
    const k=x[0],dd=x[1],left=parseFloat(dd.slice(2))<77?'L':'R';
    if(k==='pec')b+=P('chu',dd,'u'+left)+P('chm',dd,'l'+left);
    else if(k==='dlt')b+=dd.length>200?P('sdl',dd,'a'+left)+P('sdf',dd,'f'+left):P('sdl',dd);
    else b+=P(k,dd);
  });
  return'<svg class="ana" viewBox="'+d.vb+'" width="'+w+'" height="'+h+'" role="img" aria-label="'+esc(t(face==='front'?'anaFront':'anaBack'))+'">'+defs+b+'</svg>';
}
/* roles of an exercise: weight 1 = main (agonist), .5–.8 = helpers (synergists), less = stabilizers / papeles de un ejercicio */
function anaRoles(eid,vr){
  const w=muW(eid,vr)||[],r={main:[],help:[],stab:[]};
  w.forEach(q=>{(q[1]>=.9?r.main:(q[1]>=.5?r.help:r.stab)).push(q[0]);});
  return r;
}
function anaRoleFill(r){
  const m={};r.stab.forEach(k=>{m[k]='var(--an-stab)';});r.help.forEach(k=>{m[k]='var(--an-help)';});r.main.forEach(k=>{m[k]='var(--an-main)';});
  return k=>m[k]||'';
}
const anaNames=a=>a.map(k=>t('ms_'+k)).join(', ');
/* technique guide block: both sides of the body, small, and what each color means / bloque de la guía de técnica */
function anaGuide(eid,vr){
  const r=anaRoles(eid,vr);if(!r.main.length&&!r.help.length)return'';
  const f=anaRoleFill(r),row=(c,k,a)=>a.length?'<div class="ana-r"><i style="background:var(--an-'+c+')"></i><div><b>'+t('anaR_'+c)+'</b><span>'+esc(anaNames(a))+'</span></div></div>':'';
  return'<div class="ana-card"><div class="ana-pair s">'+anaSvg('front',84,f)+anaSvg('back',84,f)+'</div><div class="ana-key">'+row('main','main',r.main)+row('help','help',r.help)+row('stab','stab',r.stab)+'</div></div>';
}
/* exercises that train a part, the most-trained first / ejercicios que trabajan una parte, primero los que más la trabajan */
function anaExFor(code){
  const out=[];
  EXLIB.forEach(function(e){if(e[3]==='mobility'||e[3]==='cardio')return;const w=muW(e[0]);if(!w)return;const q=w.find(function(z){return z[0]===code;});if(q&&q[1]>=.5)out.push([e[0],q[1]]);});
  out.sort(function(a,b){return b[1]-a[1];});return out;
}
/* ----- Recovery: body view ----- */
let ANA_REC=null;
function anaRecFill(r){
  return function(k){const g=muGroup(k);if(!g)return'';const q=r.g[g].subs[k];if(!q||q.pct==null)return'';return q.pct>=100?'var(--an-ok)':(q.pct>=60?'var(--an-mid)':'var(--an-low)');};
}
function anaRecHtml(r){
  const f=anaRecFill(r);
  let h='<div class="ana-card"><div class="ana-pair">'+anaSvg('front',150,f,{sel:ANA_REC,tap:'anaRecTap'})+anaSvg('back',150,f,{sel:ANA_REC,tap:'anaRecTap'})+'</div>'+
    '<div class="rv-leg"><span class="ok">'+t('rlOk')+'</span><span class="mid">'+t('rlMid')+'</span><span class="low">'+t('rlLow')+'</span><span class="none">'+t('anaNone')+'</span></div></div>';
  if(ANA_REC&&MUS_BASE[ANA_REC]){
    const k=ANA_REC,q=r.g[muGroup(k)].subs[k],p=q.pct==null?100:q.pct,c=p>=100?'ok':(p>=60?'mid':'low'),ex=anaExFor(k).slice(0,3);
    h+='<div class="ana-sel rv-s '+c+'" style="--p:'+p+'"><div class="ana-st"><b>'+t('ms_'+k)+'</b><span>'+(q.pct==null?t('anaNone'):(p>=100?t('rlOk'):t('recIn',q.left)))+'</span></div><span class="rv-bar"><u style="width:'+p+'%"></u></span>'+
      '<div class="ana-ch">'+ex.map(function(z){const e=exById(z[0]);return e?'<button class="chip" onclick="howOpen(\''+z[0]+'\',\'sheetClose\')">'+esc(LANG==='es'?e.es:e.en)+'</button>':'';}).join('')+'</div>'+
      '<div class="row"><button class="btn sm" onclick="anaFind(\''+k+'\')">'+t('anaFindBtn')+'</button><button class="btn pri sm" onclick="recSubTap(\''+k+'\')">'+t('recCtaB')+'</button></div></div>';
  }else h+='<p class="muted sm rv-hint">'+t('anaTap')+'</p>';
  return h;
}
function anaRecTap(k){ANA_REC=ANA_REC===k?null:k;render();}
/* ----- Find by muscle ----- */
let ANA_F={face:'front',k:null};
function anaFind(k){if(k){ANA_F.k=k;ANA_F.face=['lat','trp','lbk','sdr','trl','trm','ham','gmx','gmd','clf'].indexOf(k)>=0?'back':'front';}anaFindDraw();}
function anaFindTap(k){ANA_F.k=ANA_F.k===k?null:k;anaFindDraw();}
function anaFace(f){ANA_F.face=f;anaFindDraw();}
function anaFindDraw(){
  const k=ANA_F.k,f=function(c){return c===k?'var(--an-main)':'';},list=k?anaExFor(k):[];
  sheet('<div class="form ana-find"><div class="pick-h"><h3>'+t('anaFindT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div>'+
    '<div class="seg"><button class="'+(ANA_F.face==='front'?'on':'')+'" onclick="anaFace(\'front\')">'+t('anaFront')+'</button><button class="'+(ANA_F.face==='back'?'on':'')+'" onclick="anaFace(\'back\')">'+t('anaBack')+'</button></div>'+
    '<div class="ana-card ana-big">'+anaSvg(ANA_F.face,150,f,{sel:k,tap:'anaFindTap'})+'</div>'+
    (k?'<div class="ana-fh"><b>'+t('ms_'+k)+'</b><span class="muted sm">'+t('anaFindN',list.length)+'</span></div><div class="ana-fl">'+list.slice(0,40).map(function(z){const e=exById(z[0]);return e?'<button class="lrow" onclick="howOpen(\''+z[0]+'\',\'anaFindDraw\')"><span class="lt2"><b>'+esc(LANG==='es'?e.es:e.en)+'</b></span><span class="muted sm">'+t(z[1]>=.9?'anaR_main_s':'anaR_help_s')+'</span></button>':'';}).join('')+'</div>':'<p class="muted sm">'+t('anaTap')+'</p>')+
    '<div class="row"><button class="btn" onclick="sheetClose()">'+t('close')+'</button></div></div>');
}
/* the figure on a canvas (share card): same shapes and cuts as anaSvg / el cuerpo en canvas (tarjeta): mismas formas y cortes */
function anaCanvas(g,face,x,y,w,fill){
  const d=ANA[face],vb=d.vb.split(' ').map(Number),k=w/vb[2];
  g.save();g.translate(x,y);g.scale(k,k);g.translate(-vb[0],-vb[1]);
  const cl={};if(face==='front')Object.keys(ANA_CUT).forEach(function(c){cl[c+'L']=new Path2D(anaPoly(ANA_CUT[c]));cl[c+'R']=new Path2D(anaPoly(ANA_CUT[c],1));});
  const P=function(code,dd,clip){const f=code?fill(code):'#26262e';g.save();if(clip)g.clip(cl[clip]);g.fillStyle=code?f:'rgba(128,128,140,.18)';g.fill(new Path2D(dd));g.lineWidth=1.1;g.strokeStyle='rgba(0,0,0,.35)';g.stroke(new Path2D(dd));g.restore();};
  d.s.forEach(function(q){
    const c=q[0],dd=q[1],left=parseFloat(dd.slice(2))<77?'L':'R';
    if(c==='pec'){P('chu',dd,'u'+left);P('chm',dd,'l'+left);}
    else if(c==='dlt'){if(dd.length>200){P('sdl',dd,'a'+left);P('sdf',dd,'f'+left);}else P('sdl',dd);}
    else P(c,dd);
  });
  g.restore();
}
