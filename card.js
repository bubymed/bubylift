/* Share card (v72): a picture of a workout to post or send; and CSV import / tarjeta para compartir (v72) e importar CSV. */
function cardFont(px,w){return(w||'700')+' '+px+'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';}
function wkCardData(wk){
  const top=wk.ex.map(x=>{const m=exMode(x.eid);let b=null,bs=-1;x.sets.forEach(s=>{const sc=setScore(m,s);if(sc>bs){bs=sc;b=s;}});return{eid:x.eid,n:x.n,m:m,b:b,pr:x.sets.some(s=>s.pr),sets:x.sets.length,sc:bs};})
    .sort((a,b)=>(b.pr-a.pr)||(b.sets-a.sets)).slice(0,5);
  return{name:wk.name,date:dFmt(wk.t,{month:'long',day:'numeric',year:'numeric'}),dur:wk.end?fmtDur((wk.end-wk.t)/1000):'',sets:wkSets(wk),vol:wShow(wkVol(wk))+' '+wUnit(),prs:wk.ex.reduce((a,x)=>a+x.sets.filter(s=>s.pr).length,0),top:top};
}
function drawWkCard(wk){
  const d=wkCardData(wk),W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const cs=getComputedStyle(document.documentElement),acc=(cs.getPropertyValue('--accent')||'#d9480f').trim()||'#d9480f';
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#16161a');bg.addColorStop(1,'#2a1a12');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle=acc;g.fillRect(0,0,W,16);
  g.fillStyle=acc;g.font=cardFont(56,'800');g.fillText('BUBYLIFT',80,140);
  g.fillStyle='#ffffff';g.font=cardFont(84,'800');
  let nm=d.name;while(g.measureText(nm).width>W-160&&nm.length>4)nm=nm.slice(0,-2);if(nm!==d.name)nm+='…';
  g.fillText(nm,80,290);
  g.fillStyle='#b9b9c2';g.font=cardFont(40,'500');g.fillText(d.date,80,350);
  const stats=[[d.dur||'—',t('duration')],[String(d.sets),t('sets')],[d.vol,t('volume')]];
  stats.forEach((s,i)=>{const x=80+i*320;g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.roundRect?g.roundRect(x,420,290,170,26):g.rect(x,420,290,170);g.fill();
    g.fillStyle='#fff';g.font=cardFont(s[0].length>9?38:54,'800');g.fillText(s[0],x+24,508);g.fillStyle='#b9b9c2';g.font=cardFont(30,'500');g.fillText(s[1],x+24,558);});
  if(d.prs){g.fillStyle=acc;g.font=cardFont(44,'800');g.fillText('🏆 '+d.prs+' PR',80,680);}
  let y=d.prs?770:700;
  d.top.forEach(x=>{
    g.fillStyle='#fff';g.font=cardFont(44,'700');
    let n=exName(x.eid,x.n);while(g.measureText(n).width>640&&n.length>4)n=n.slice(0,-2);if(n!==exName(x.eid,x.n))n+='…';
    g.fillText(n,80,y);
    g.fillStyle='#b9b9c2';g.font=cardFont(40,'500');const r=x.sets+' × '+(x.b?fmtSet(x.m,x.b):'');
    g.textAlign='right';g.fillText(r.length>26?r.slice(0,26):r,W-80,y);g.textAlign='left';
    g.fillStyle='rgba(255,255,255,.1)';g.fillRect(80,y+26,W-160,2);y+=96;
  });
  g.fillStyle='#8c8c96';g.font=cardFont(34,'500');g.fillText('bubymed.github.io/bubylift',80,H-70);
  return c;
}
function wkPic(id){
  const wk=DATA.workouts.find(w=>w.id===id);if(!wk)return;
  let c;try{c=drawWkCard(wk);}catch(e){toast(t('copyFail'));return;}
  c.toBlob(function(b){
    if(!b){toast(t('copyFail'));return;}
    const f=new File([b],'bubylift-'+dInput(wk.t)+'.png',{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Bubylift'}).catch(()=>{});return;}}catch(e){}
    const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast(t('cdSaved'));
  },'image/png');
}
/* ---- CSV import: reads the file Bubylift exports / lee el archivo que exporta Bubylift ---- */
function csvParse(txt){
  const rows=[];let row=[],cur='',q=false;txt=txt.replace(/^\uFEFF/,'');
  for(let i=0;i<txt.length;i++){const ch=txt[i];
    if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"')q=true;else if(ch===','){row.push(cur);cur='';}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur='';}
    else cur+=ch;}
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows.filter(r=>r.length>1);
}
function eidByName(nm){
  nm=String(nm||'').trim().toLowerCase().replace(/^'/,'');if(!nm)return null;
  const hit=EXLIB.find(r=>String(r[1]).toLowerCase()===nm||String(r[2]).toLowerCase()===nm);if(hit)return hit[0];
  const cx=(DATA.custom||[]).find(c=>String(c.n).toLowerCase()===nm);return cx?cx.id:null;
}
function csvToWorkouts(txt){
  const rows=csvParse(txt);if(rows.length<2||rows[0][0]!=='date'||rows[0].indexOf('exercise')<0)return null;
  const H=rows[0],ix=k=>H.indexOf(k),by={},out=[];let skip=0;
  rows.slice(1).forEach(r=>{
    const eid=eidByName(r[ix('exercise')]),dt=new Date(r[ix('date')]+'T12:00:00');
    if(!eid||isNaN(dt)){skip++;return;}
    const key=r[ix('date')]+'|'+r[ix('workout')];
    let wk=by[key];if(!wk){wk=by[key]={id:'i'+dt.getTime().toString(36)+out.length,t:dt.getTime(),end:0,name:String(r[ix('workout')]||'').slice(0,80),note:'',ex:[]};out.push(wk);}
    let x=wk.ex.find(y=>y.eid===eid);if(!x){x={eid:eid,n:exName(eid),sets:[]};wk.ex.push(x);}
    const lb=/lb/i.test(r[ix('weight_unit')]||''),mi=/mi/i.test(r[ix('distance_unit')]||'');
    const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null;};
    const w=num(r[ix('weight')]),rp=num(r[ix('reps')]),mn=num(r[ix('minutes')]),dd=num(r[ix('distance')]);
    const s={w:w==null?null:(lb?w/KG_LB:w),r:rp==null?null:Math.round(rp),t:mn,d:dd?(mi?dd/KM_MI:dd):null};if(r[ix('pr')])s.pr=1;
    x.sets.push(s);
  });
  return{wks:out.map(cleanWk).filter(Boolean),skip:skip};
}
function importCsv(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(f.size>20e6){toast(t('impBad'));return;}
  const r=new FileReader();
  r.onload=function(){
    const o=csvToWorkouts(String(r.result));if(!o){toast(t('impBad'));return;}
    const have={};DATA.workouts.forEach(w=>{have[Math.round(w.t/864e5)+'|'+w.name]=1;});
    const add=o.wks.filter(w=>!have[Math.round(w.t/864e5)+'|'+w.name]);
    if(!add.length){toast(t('impNone'));return;}
    ask(t('impCsvAsk',add.length),t('import'),function(){add.forEach(w=>DATA.workouts.push(w));DATA.workouts.sort((a,b)=>b.t-a.t);saveData();toast(t('imported'));render();});
  };
  r.onerror=function(){toast(t('impBad'));};r.readAsText(f);
}
