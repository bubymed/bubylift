/* Exercise variations (grip, width): same exercise, its own "last time" and records, a different muscle emphasis.
   Variantes de ejercicio (agarre, ancho): el mismo ejercicio, con su propio "última vez" y récords, y otro énfasis muscular. */
const VAR_OPT={pull:['under','neut','wide','close'],pullb:['under','wide','close'],pullup:['neut','wide','close'],press:['wide','close'],pressdb:['neut','close'],curl:['wide','close']};
const VAR_FOR={latpd:'pull',cablerow:'pull',machrow:'pull',bbrow:'pullb',bentrow:'pullb',tbar:'pullb',pullup:'pullup',bench:'press',incbench:'press',declbench:'press',ohp:'press',pushup:'press',dbbench:'pressdb',dbinc:'pressdb',bbcurl:'curl'};
const VAR_MG={pull:'pull',pullb:'pull',pullup:'pull',press:'press',pressdb:'press',curl:'curl'};
/* change in muscle weight per variation / cambio del peso muscular por variante */
const VAR_MOD={pull:{under:'bic.3 lat.1',neut:'frm.2 bic.1',wide:'lat.2 ubk-.1',close:'bic.1 lat-.1 ubk.1'},press:{wide:'chm.2 trl-.2 sdf-.1',close:'trl.35 chm-.15',neut:'trl.15 chm-.05'},curl:{wide:'bic.15 frm-.1',close:'bic.1 frm.1'}};
function exVars(eid){return VAR_OPT[VAR_FOR[eid]]||[];}
function xk(x){return x.eid+(x.vr?'~'+x.vr:'');} // key of an entry: records and "last time" are kept per variation / clave de un ejercicio: récords y "última vez" por variante
function varName(v){return t('var_'+v);}
function exNameV(eid,vr,fb){return exName(eid,fb)+(vr?' · '+varName(vr):'');}
function muVar(w,eid,vr){
  const g=VAR_MG[VAR_FOR[eid]],md=g&&vr&&VAR_MOD[g]&&VAR_MOD[g][vr];if(!md||!w)return w;
  const r=w.map(q=>q.slice());
  md.split(' ').forEach(p=>{const m=/^([a-z]+)(-?[\d.]+)$/.exec(p);if(!m)return;const q=r.find(z=>z[0]===m[1]);if(q)q[1]=Math.max(.1,Math.round((q[1]+ +m[2])*100)/100);else if(+m[2]>0)r.push([m[1],+m[2]]);});
  return r;
}
function varChip(i,x){
  if(!exVars(x.eid).length)return'';
  return'<button class="varchip" onclick="varOpen('+i+')">'+(x.vr?'<b>'+varName(x.vr)+'</b>':t('varB')+': '+t('varStd'))+' ▾</button>';
}
function varOpen(i){
  const x=ACT.ex[i];if(!x)return;
  sheet('<h3>'+esc(exName(x.eid,x.n))+'</h3><p class="muted sm">'+t('varP')+'</p><div class="menu">'+
    ['',...exVars(x.eid)].map(v=>'<button class="'+((x.vr||'')===v?'on':'')+'" onclick="varSet('+i+',\''+v+'\')">'+(v?varName(v):t('varStd'))+((x.vr||'')===v?' ✓':'')+'</button>').join('')+'</div>');
}
function varSet(i,v){const x=ACT.ex[i];if(!x)return;if(v)x.vr=v;else delete x.vr;saveAct();sheetClose();render();}
