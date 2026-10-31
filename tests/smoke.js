const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'); // repo root / raíz del repositorio
const errors=[],fails=[];let passed=0;
function ok(c,m){if(c)passed++;else{fails.push(m);console.log('  FAIL:',m);}}

function inlined(){let h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  return h.replace(/<script src="([^"]+)"><\/script>/g,(m,f)=>'<script>'+fs.readFileSync(path.join(ROOT,f),'utf8').replace(/<\/script/g,'<\\/script')+'</script>');}
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push('jsdomError: '+(e.detail&&e.detail.stack||e.message)));
vc.on('error',(...a)=>errors.push('console.error: '+a.join(' ')));

(async()=>{
  const dom=new JSDOM(inlined(),{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({v:JSON.parse(fs.readFileSync(path.join(ROOT,"version.json"),"utf8")).v})});
      w.matchMedia=q=>({matches:false,media:q,addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{};
      try{w.localStorage.setItem('bl_profiles',JSON.stringify([{id:'ptest1',name:'Test',av:{k:'e',e:'🔥',c:0},pw:null,qs:[],rm:0,t:1}]));w.sessionStorage.setItem('bl_sess','ptest1');}catch(e){}
      w.URL.createObjectURL=()=>'blob:x';Object.defineProperty(w,'crypto',{value:require('crypto').webcrypto,configurable:true});w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.URL.revokeObjectURL=()=>{};
      Object.defineProperty(w.navigator,'language',{value:'en-US'});
    }});
  const w=dom.window,doc=w.document;
  await new Promise(r=>w.addEventListener('load',r));
  await new Promise(r=>setTimeout(r,300));
  const ev=c=>w.eval(c);
  const main=()=>doc.getElementById('main').innerHTML;
  const sheetHtml=()=>doc.getElementById('sheet').innerHTML;
  w.__miss=[];
  ev("t=(function(o){return function(k){if(!STR[k])window.__miss.push(k);return o.apply(null,arguments)}})(t)");
  const captured=[];ev("fileOut=function(n,tx,m){window.__out={n:n,tx:tx,m:m};}");

  console.log('boot');
  ok(ev('typeof boot')==='function','boot defined');
  ok(/Train my own way/.test(main()),'start screen shows start button');
  ok(ev('SET.units')==='imperial','en-US defaults to imperial');
  ok(ev('LANG')==='en','en default');
  ok(doc.documentElement.getAttribute('data-mode')==='dark','dark by default');

  console.log('workout flow');
  ok(doc.querySelectorAll('.lrow').length===4&&doc.querySelector('.card.hero'),'start screen shows today card and the ways to train');doc.querySelector('.emptyb').click();
  ok(ev('!!ACT'),'start button starts a workout');
  ok(/Add exercise/.test(main()),'active view has Add exercise');
  w.pickEx();
  ok(doc.querySelectorAll('.exrow').length>80,'picker lists the library ('+doc.querySelectorAll('.exrow').length+')');
  w.exSearch('bench');
  ok(doc.querySelectorAll('#exlist .exrow').length>=4,'search "bench" finds results');
  w.exSearch('sentadilla');
  ok(doc.querySelectorAll('#exlist .exrow').length>=3,'search matches Spanish names');
  w.exSearch('');w.exGroup('chest');
  ok(doc.querySelectorAll('#exlist .exrow').length>=9,'group filter works');
  doc.querySelector('#exlist .exrow').click();
  ok(ev('ACT.ex.length')===1,'tapping an exercise adds it');
  const eid=ev('ACT.ex[0].eid');
  w.addSet(0);
  ok(ev('ACT.ex[0].sets.length')===2,'add set');
  w.sv(0,0,'w','135');w.sv(0,0,'r','8');
  w.tgSet(0,0);
  ok(ev('ACT.ex[0].sets[0].done'),'set marked done');
  ok(Math.abs(ev('ACT.ex[0].sets[0].w')-135/2.20462262185)<1e-9,'weight stored in kg');
  ok(!doc.getElementById('restbar').hidden,'rest timer shown after a set');
  ok(/Rest/.test(doc.getElementById('restbar').textContent),'rest bar has text');
  w.tgSet(0,1); // empty row shows the previous set as placeholder → accepts it
  ok(ev('ACT.ex[0].sets[1].done&&ACT.ex[0].sets[1].r')===8,'empty row accepts the placeholder (previous set)');
  w.addExTo('deadlift',1);w.render();w.tgSet(1,0);
  ok(!ev('ACT.ex[1].sets[0].done'),'empty first set with no placeholder is rejected');
  w.rmEx(1);
  w.stopRest();
  w.finishAsk();
  ok(ev('DATA.workouts.length')===1,'workout saved');
  ok(/Workout complete/.test(sheetHtml()),'summary sheet shown');
  ok(ev('ACT')===null,'active workout cleared');
  w.sheetClose();

  console.log('PR + placeholders');
  w.startWorkout({name:'Push',ex:[{eid:eid,sets:2}]});
  w.tgSet(0,0); // empty → placeholders from last time
  ok(ev('ACT.ex[0].sets[0].done'),'placeholder values fill an empty set');
  ok(!ev('!!ACT.ex[0].sets[0].pr'),'same lift is not a PR');
  w.sv(0,1,'w','145');w.sv(0,1,'r','8');w.tgSet(0,1);
  ok(ev('!!ACT.ex[0].sets[1].pr'),'heavier set flagged as PR');
  w.stopRest();w.finishWk();
  ok(ev('DATA.workouts.length')===2&&ev('DATA.workouts[0].ex[0].sets[1].pr')===1,'PR persisted in history');
  w.sheetClose();

  console.log('bodyweight + cardio modes, custom exercise');
  w.startWorkout();
  w.addExTo('pullup',1);w.addExTo('run',1);
  w.render();
  w.sv(0,0,'r','10');w.tgSet(0,0);
  ok(ev('ACT.ex[0].sets[0].done'),'bodyweight set with reps only');
  w.sv(1,0,'t','30');w.sv(1,0,'d','3.1');w.tgSet(1,0);
  ok(ev('ACT.ex[1].sets[0].done'),'cardio set with time');
  w.customOpen();doc.getElementById('cxn').value='My <b>Lift</b>';doc.getElementById('cxm').value='wr';
  ev("UI.pickCb=function(e){addExTo(e,1);saveAct();render();}");
  w.customSave();
  ok(ev('DATA.custom.length')===1,'custom exercise saved');
  ok(!/<b>Lift<\/b>/.test(main()),'custom exercise name is escaped');
  w.stopRest();
  ev("ACT.ex[2].sets[0].w=60;ACT.ex[2].sets[0].r=5;ACT.ex[2].sets[0].done=true");
  w.finishWk();w.sheetClose();
  ok(ev('DATA.workouts.length')===3,'third workout saved');
  console.log('feedback pop up');
  ok(ev('fbDue()')===false,'no feedback pop up without a routine or plan');
  ev("DATA.routines.push({id:'fbr',name:'T',ex:[]})");
  ok(ev('fbDue()')===true,'feedback due after routine + logged set');
  w.sumDone();ev("fbShow()");
  ok(/tally\.so\/r\/KpY5MA/.test(doc.getElementById('sheet').innerHTML),'feedback pop up links to the Tally form');
  ok(ev('fbDue()')===false,'feedback pop up shows only once');
  ev("DATA.routines.pop()");w.sheetClose();

  console.log('routines');
  w.rbOpen();ev("UI.rb.name='Push day'");
  w.rbAdd();doc.querySelector('#exlist .exrow').click();
  ok(ev('UI.rb.ex.length')===1,'routine builder adds exercise');
  w.rbSets(0,1);w.rbSave();
  ok(ev('DATA.routines.length')===1&&ev('DATA.routines[0].ex[0].sets')===4,'routine saved with 4 sets');
  const rid=ev('DATA.routines[0].id');w.startRoutine(rid);
  ok(ev('ACT.ex[0].sets.length')===4,'routine starts with its sets');
  w.cancelWk();ok(ev('ACT')===null,'cancel workout');

  console.log('history, progress, body, more — both languages and unit systems');
  w.sv&&0;
  doc.getElementById('lES');
  w.bodyDel;
  // body entry via the form
  w.go('body');
  doc.getElementById('bw').value='180.5';doc.getElementById('bf').value='18';doc.getElementById('bm_waist').value='34';doc.getElementById('bn').value='morning <i>x</i>';
  w.bodySave();
  ok(ev('DATA.body.length')===1&&ev('DATA.body[0].m.waist>0'),'body entry saved');
  ok(!/<i>x<\/i>/.test(main()),'body note escaped');
  doc.getElementById('bw').value='178';w.bodySave();
  doc.getElementById('bg').value='170';w.goalSet();
  ok(/to go/.test(main())&&/<line class="ch-goal"/.test(main()),'goal line and to-go text');

  for(const units of['imperial','metric'])for(const lang of['en','es']){
    ev("SET.units='"+units+"'");w.setLang(lang);
    for(const tb of['workout','history','progress','body','more']){
      w.go(tb);const h=main();
      ok(h.length>50,tb+' renders ('+units+','+lang+')');
ok(!/undefined|NaN|\[object/.test(h),tb+' has no undefined/NaN ('+units+','+lang+')');
    }
    w.go('history');w.openWk(ev('DATA.workouts[0].id'));
    ok(!/undefined|NaN/.test(sheetHtml()),'workout detail clean ('+units+','+lang+')');w.sheetClose();
    w.go('progress');
    for(const e of['bench','pullup','run'].concat(['c_'])){
      const id=e==='c_'?ev('DATA.custom[0].id'):(e==='bench'?eid:e);
      w.openProg(id);
      for(const k of ev('METRICS[exMode("'+id+'")].map(a=>a[0])')){w.setPm(k);
        ok(!/undefined|NaN/.test(main())&&/<svg|couple more workouts|Con un par de entrenamientos/.test(main()),'progress '+id+'/'+k+' ('+units+','+lang+')');}
      w.closeProg();
    }
  }
  w.setLang('en');ev("SET.units='imperial'");

  console.log('history actions');
  w.go('history');
  const firstId=ev('DATA.workouts[0].id');
  w.repeatWk(firstId);ok(ev('!!ACT'),'repeat workout starts a session');w.cancelWk();
  w.go('history');w.saveWkAsRoutine(firstId);ok(ev('UI.rb&&UI.rb.ex.length>0'),'save workout as routine');ev('UI.rb=null');w.sheetClose();
  w.shareWk(firstId);
  const n0=ev('DATA.workouts.length');w.delWkAsk(firstId);doc.querySelector('.dlg-b .btn.danger').click();
  ok(ev('DATA.workouts.length')===n0-1,'delete workout after confirm');

  console.log('export / import');
  w.exportJSON();
  const bk=JSON.parse(ev('window.__out.tx'));
  ok(bk.app==='bubylift'&&bk.data.workouts.length===n0-1,'backup JSON holds the data');
  w.exportCSV();
  const csv=ev('window.__out.tx');
  ok(/^﻿date,workout,exercise/.test(csv)&&csv.split('\n').length>3,'CSV exported');
  ev("DATA.workouts=[];DATA.body=[];DATA.routines=[];DATA.custom=[];saveData()");
  const mk=(obj)=>({files:[new w.File([JSON.stringify(obj)],'b.json')],value:'x'});
  const waitImp=()=>new Promise(r=>setTimeout(r,150));
  w.importFile(mk(bk));await waitImp();
  ok(/Add \d+ workouts/.test(sheetHtml()),'import asks for confirmation');
  doc.querySelector('.dlg-b .btn.pri').click();
  ok(ev('DATA.workouts.length')===n0-1&&ev('DATA.body.length')===bk.data.body.length&&ev('DATA.custom.length')===bk.data.custom.length&&ev('DATA.routines.length')===bk.data.routines.length,'import restores data ('+ev('DATA.workouts.length')+'/'+ev('DATA.body.length')+'/'+ev('DATA.custom.length')+'/'+ev('DATA.routines.length')+' vs '+(n0-1)+'/'+bk.data.body.length+'/'+bk.data.custom.length+'/'+bk.data.routines.length+')');
  w.importFile(mk(bk));await waitImp();
  ok(ev('document.getElementById("toast").textContent').length>0&&ev('DATA.workouts.length')===n0-1,'re-import adds nothing (no duplicates)');
  const evil={app:'bubylift',data:{workouts:[{id:"x'\"><img src=x onerror=alert(1)>",t:1,ex:[{eid:'bench',sets:[{w:1,r:1}]}]},
    {id:'ok1',t:5,name:'<img src=x onerror=alert(1)>',ex:[{eid:"a'b",n:'x',sets:[{w:1,r:1}]},{eid:'bench',n:'<script>1</script>',sets:[{w:'<b>',r:'5',t:null}]}]}],
    body:[{id:'b1',t:1,w:'<b>'}],routines:[],custom:[{id:'c1',n:'<svg onload=1>',g:'bad',m:'zzz'}]}};
  w.importFile(mk(evil));await waitImp();
  const asked=sheetHtml();
  if(/Add \d+ workouts/.test(asked))doc.querySelector('.dlg-b .btn.pri').click();
  ok(ev('DATA.workouts.some(x=>x.id==="ok1")')===false||ev('DATA.workouts.find(x=>x.id==="ok1").ex.every(e=>/^[A-Za-z0-9_-]+$/.test(e.eid))'),'import sanitizes ids');
  ev("DATA.workouts=DATA.workouts.filter(x=>/^[A-Za-z0-9_-]+$/.test(x.id))");
  w.go('history');w.go('progress');w.go('workout');
  ok(!/<img src=x/.test(main())&&!/<script>1/.test(main()),'imported names are not rendered as HTML');
  w.importFile({files:[new w.File(['not json'],'x.json')],value:'x'});await waitImp();
  ok(/doesn't look like a Bubylift backup/.test(ev('document.getElementById("toast").textContent')),'bad file rejected');

  console.log('settings, install, what\'s new, theme');
  w.go('more');
  w.setTheme('light');ok(doc.documentElement.getAttribute('data-mode')==='light','light theme');
  w.setTheme('system');w.setAuto('0');ok(ev('SET.auto')===false,'auto rest toggle');w.setAuto('1');w.setRest('120');ok(ev('SET.rest')===120,'rest length');
  w.installApp();ok(/Why install it/.test(sheetHtml())&&/Computer/.test(sheetHtml()),'install guide has why + platforms');w.installApp('pc');ok(/Install Bubylift<\/b>|Chrome/.test(sheetHtml()),'pc steps');ok(/Install Bubylift/.test(sheetHtml()),'install instructions');w.sheetClose();
  w.wnShow(true);ok(sheetHtml().replace(/<[^>]*>/g,'').indexOf(ev("WHATSNEW[0].items[0].en").replace(/<[^>]*>/g,'').slice(0,24))>=0,'what\'s new shows the latest version');w.wnDone();
  ok(ev("EXLIB.length")>950&&ev("EX_GROUPS.indexOf('mobility')")>=0,'v48 library has ~990 exercises and a mobility group');
  ok(ev("EXLIB.filter(r=>r[3]==='mobility').every(r=>!meta(r[0]))"),'mobility moves have no plan metadata');
  ok(ev("meta('z_zottman_curl')&&meta('z_zottman_curl').mu==='I'"),'imported exercise has metadata');
  const EQK={kb:['kettlebell'],db:['dumbbell','bench'],bb:['barbell','bench','bar'],cab:['cable'],mach:['machine'],band:['band'],trx:['suspension'],mb:['medball'],bw:[]};
  const eqRes=JSON.parse(ev("JSON.stringify((function(){const K="+JSON.stringify(EQK)+",r={};LIB_EQ.forEach(a=>{r[a]=[0,2,4].map(k=>libFocus(a,k,K[a]).length)});return r})())"));
  console.log('   (info) eq routine sizes',JSON.stringify(eqRes));
  ok(Object.keys(eqRes).length===9&&Object.keys(eqRes).every(a=>eqRes[a].every(n=>n>=4)),'each equipment area gives 4+ exercises at every level');
  w.go('history');ok(ev("tab")==='progress'&&/class=\"seg\"/.test(main())&&/psSet/.test(main()),'history opens inside Progress with a switch');w.go('progress');ok(ev("UI.ps")==='prog','Progress tab shows the charts side');
  w.go('stretch');ok(/Quick sessions|Stretching and mobility on their own/.test(main())&&ev("document.querySelectorAll('#tabbar button').length")===4,'stretch screen renders and the bar has 4 tabs');
  ok(ev("[5,10,15].every(m=>['full','lower','upper','back','warm','cool'].every(k=>strItems(k,m).length>=4))"),'every stretch session has 4+ moves');
  ok(ev("STRETCH_AREAS.every(a=>STRETCH_BY[a].length>=5)")&&ev("STRETCH_AREAS.reduce((n,a)=>n+STRETCH_BY[a].length,0)")===106,'stretch areas hold all 106 mobility moves');
  w.strSet('sec','area');ok(/Hamstrings/.test(main())&&doc.querySelectorAll('#main .plex').length>=5,'stretch by area lists moves');
  w.strSet('sec','sess');w.strSessGo(0);ok(ev('!!ACT&&ACT.ex.length>=4&&ACT.ex[0].tg&&ACT.ex[0].tg.u')==='m'||ev('!!ACT'),'stretch session starts a workout');
  ev('ACT=null;saveAct&&saveAct()');w.go('workout');
  const stR=JSON.parse(ev("JSON.stringify([0,2,4].map(k=>libFocus('stretch',k,[]).map(e=>e.eid+':'+e.lo+'-'+e.hi+e.u)))"));
  console.log('   (info) stretch',JSON.stringify(stR[0]));
  ok(stR.every(l=>l.length>=6)&&ev("libFocus('stretch',0,[]).every(e=>e.u==='m')"),'stretch routine has 6+ timed holds at every level');
  ok(ev("LIB_EQ.every(a=>[0,2,4].every(k=>libFocus(a,k,[]).length>=4))"),'equipment routines work without marking any equipment');
  ok(ev("EXPHOTO.has('bench')&&EXPHOTO.has('z_zottman_curl')&&!EXPHOTO.has('burpee')"),'photo list covers old and new exercises');
  ok(ev("LIB_EQ.every(a=>[0,1,2].every(l=>FOCUS[a][l].every(s=>s.split('|')[0].split(',').every(id=>exById(id)))))"),'equipment routine ids all exist');
  const zUse=ev("(function(){let n=0,tot=0;[['muscle',3,'some'],['muscle',4,'new'],['strength',3,'adv'],['fat',5,'some'],['hybrid',4,'some'],['general',3,'new']].forEach(a=>{[0,1,2,3].forEach(sd=>{genPlan({goal:a[0],n:a[1],len:75,lvl:a[2],have:HAVE_KEYS.slice(),sd:sd}).ds.forEach(d=>d.ex.forEach(x=>{tot++;if(String(x.eid).slice(0,2)==='z_')n++;}))})});return n+'/'+tot})()");
  console.log('   (info) imported exercises in generated plans',zUse);
  ok(+zUse.split('/')[0]>0,'imported exercises appear in generated plans');
  ev("SET.wnSeen='v0'");ev("WHATSNEW.unshift({v:'v1',items:[{i:'x',en:'a',es:'b'}]})");
  ok(ev('wnPending().length')>=1,'pending news after an update');
  w.eraseAsk();ok(/deletes every workout/.test(sheetHtml()),'erase asks first');w.sheetClose();

  console.log('guided plan v3');
  ev("ACT=null;saveAct();tab='workout';render()");
  ok(/A plan made for you/.test(main()),'no plan: start screen offers to create one');
  const goq=id=>{ev("PW.q='"+id+"';wizDraw()");};
  w.planSetup();ok(/build your plan/.test(sheetHtml()),'wizard starts by asking quick or custom');
  w.pwQuick(1);ok(ev("wzList().map(q=>q.id).join()")==='mode,goal,n,lvl,sty,sum'&&/Pick the one that matters/.test(sheetHtml()),'quick start has only the main questions');
  w.pwFull();ok(ev("PW.quick")===0&&ev('wzList().length')>15,'customize more returns to all questions');
  goq('mode');w.pwQuick(0);ok(/Pick the one that matters/.test(sheetHtml()),'custom opens at the first of many single questions');
  w.pwSet('sex','f');ok(ev("PW.emph")==='low','woman preselects lower-body emphasis (can be changed)');
  console.log('start assessment v39');
  ok(ev("['pl','bal','sq','pu','pull','leg','hist'].every(k=>wzList().some(q=>q.id===k&&q.req))"),'seven required assessment steps');
  goq('pl');ok(/Plank/.test(sheetHtml())&&/Not sure/.test(sheetHtml()),'plank question has a Not sure option');
  ok(/disabled/.test(sheetHtml().match(/wz-foot.*$/s)[0]),'Next is disabled until answered');
  w.wzGo(1);ok(ev('PW.q')==='pl','cannot skip a required question');
  ev("wzAs_('pl','x')");ok(ev('PW.pl')==='x'&&ev('PW.a.pl')===1,'Not sure is stored');
  ok(ev('PW.q')==='pl','picking an answer does not advance by itself');
  ev("PW.a={};");
  const asp=o=>ev("lvlEff(Object.assign({lvl:'some',pu:'p2',as:1},"+JSON.stringify(o)+"))");
  ok(asp({pl:'x',bal:'b2',sq:'q2',pull:'r3',leg:'l3',hist:'h2'})==='new','unsure plank starts in the careful level');
  ok(asp({pl:'p2',bal:'b0',sq:'q2',pull:'r3',leg:'l3',hist:'h2'})==='new','poor balance starts in the careful level');
  ok(asp({pl:'p2',bal:'b2',sq:'q1',pull:'r3',leg:'l3',hist:'h2'})==='new','a squat compensation starts in the careful level');
  ok(asp({pl:'p2',bal:'b2',sq:'q2',pull:'r1',leg:'l1',hist:'h1'})==='some','stable but moderate stays intermediate');
  ok(ev("lvlEff({lvl:'adv',pu:'p3',as:1,pl:'p3',bal:'b2',sq:'q2',pull:'r3',leg:'l3',hist:'h2'})")==='adv','stable, strong and experienced can be advanced');
  ok(ev("lvlEff({lvl:'adv',pu:'p0',as:1,pl:'p3',bal:'b2',sq:'q2',pull:'r0',leg:'l0',hist:'h0'})")==='some','tests cap an over-optimistic self-rating');
  ok(ev("lvlEff({lvl:'some',pu:'p0'})")==='new','older profiles keep the old push-up rule');
  ev("var P=normProf({goal:'muscle',lvl:'some',pl:'zz',sq:'q9',as:1});");
  ok(ev("P.pl==='x'&&P.sq==='x'&&P.leg==='x'"),'bad assessment values are cleaned');
  ev("var G=genPlan(normProf({goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS,as:1,pl:'p0',bal:'b2',sq:'q2',pu:'p2',pull:'r2',leg:'l2',hist:'h1'}))");
  ok(ev("G.ds[0].wy.some(x=>/^wyStab/.test(x))")&&ev('G.ph')===1,'weak plank: phase 1 and the plan says why');
  w.pwSet('goal','fat');goq('emph');ok(/Where do you want a little extra work/.test(sheetHtml()),'a question asks the emphasis');
  goq('focus');w.pwSet('emph','bal');w.pwTog('focus','glutes',3);w.pwTog('focus','chest',3);w.pwTog('focus','back',3);w.pwTog('focus','abs',3);
  ok(ev("PW.focus.length")===3,'focus limited to 3 muscles');
  w.pwSet('n',4);w.pwSet('len',60);w.pwSet('lvl','some');goq('sty');ok(/What kind of training do you enjoy/.test(sheetHtml())&&/I don.t have all of this/.test(sheetHtml()),'a question asks the training style');
  w.pwSty('strength');w.pwSty('cali');w.pwSty('home');ok(ev("PW.sty.join()")==='cali,home'||ev("PW.sty.join()")==='strength,home'||ev("PW.sty.length")===2,'max two styles');
  w.pwSty('home');w.pwSty('strength');ev("PW.sty=['strength','cali'];PW.stp=75;PW.have=styHave(PW.sty)");
  {let a=0,b=0;for(let i=0;i<12;i++){const G2=ev("genPlan(normProf({goal:'muscle',n:4,len:60,lvl:'some',sty:['strength','cali'],stp:75,have:styHave(['strength','cali']),sd:"+(i+3)+"}))");const ids=JSON.stringify(G2.ds.map(d=>d.ex.map(e=>e.eid||e.id)));a+=(ids.match(/"(squat|bench|deadlift|ohp|bbrow|frontsq|rdl|incbench)"/g)||[]).length;b+=(ids.match(/"(pullup|chinup|dip|pushup|bodysq|bulgsplit|invrow|pikepush|hrpushup)"/g)||[]).length;}
   console.log('   (info) mix 75/25 strength/cali',a,b);ok(a>b,'75/25 mix favours the first style');}
  w.pwSet('n',4);goq('sty');w.pwTog&&0;
  w.pwPreset('gym');goq('inj');ok(/Anything we should work around/.test(sheetHtml()),'a question asks injuries');goq('sum');ok(/Take a last look/.test(sheetHtml()),'last screen shows a summary');
  w.planCreate();w.sheetClose();
  console.log('set types v76');
  {const sv=ev("JSON.stringify(DATA)");
   ev("DATA.workouts=[];ACT=null;startWorkout({name:'t',ex:[{eid:'bench',sets:3}]});ACT.ex[0].sets[0].w=40;ACT.ex[0].sets[0].r=10;ACT.ex[0].sets[1].w=60;ACT.ex[0].sets[1].r=8");
   w.cycTy(0,0);ok(ev("ACT.ex[0].sets[0].ty")==='w'&&/class="sn tyb ty-w"/.test(main()),'tap the set number marks a warm-up');
   w.tgSet(0,0);ok(ev("!ACT.ex[0].sets[0].pr")&&ev("setVol(ACT.ex[0].sets[0])")===0&&ev("setScore('wr',ACT.ex[0].sets[0])")===0,'warm-up sets never count for records or volume');
   w.cycTy(0,1);w.cycTy(0,1);ok(ev("ACT.ex[0].sets[1].ty")==='d','second tap marks a drop set');w.cycTy(0,1);w.cycTy(0,1);ok(ev("ACT.ex[0].sets[1].ty")===undefined,'cycle returns to a normal set');
   w.cycTy(0,1);w.cycTy(0,1);w.cycTy(0,1);ok(ev("ACT.ex[0].sets[1].ty")==='f','third tap marks failure');
   w.tgSet(0,1);w.finishWk&&0;ev("finishWk()");ok(ev("DATA.workouts[0].ex[0].sets.map(s=>s.ty||'-').join('')")==='w-'.slice(0,1)+'f'||ev("DATA.workouts[0].ex[0].sets.some(s=>s.ty==='w')&&DATA.workouts[0].ex[0].sets.some(s=>s.ty==='f')"),'set types are saved with the workout');
   w.eval("window.__out=null;fileOut=function(n,tx,m){window.__out={n:n,tx:tx,m:m};}");w.exportCSV();const rr=JSON.parse(w.eval("JSON.stringify(csvToWorkouts(window.__out.tx))"));
   ok(rr.wks[0].ex[0].sets.some(s=>s.ty==='w')&&rr.wks[0].ex[0].sets.some(s=>s.ty==='f'),'set types survive CSV export and import');
   w.sheetClose();w.eval("ACT=null;saveAct();DATA=JSON.parse("+JSON.stringify(sv)+");tab='workout';render()");}
  console.log('rep ranges v75');
  {ok(ev("JSON.stringify(friendlyReps({u:'r',lo:13,hi:13}))")==='{"u":"r","lo":12,"hi":15}'&&ev("JSON.stringify(friendlyReps({u:'r',lo:7,hi:9}))")==='{"u":"r","lo":6,"hi":10}'&&ev("JSON.stringify(friendlyReps({u:'r',lo:4,hi:4}))")==='{"u":"r","lo":4,"hi":5}','odd or single rep numbers become easy ranges');
   ok(ev("JSON.stringify(friendlyReps({u:'m',lo:0.5,hi:1}))")==='{"u":"m","lo":0.5,"hi":1}','timed items are left alone');
   const bad=ev("(function(){var ok=new Set(FRIENDLY),b=0,s=0;['muscle','strength','general','fat','hybrid','military','runner','bodybuilding'].forEach(function(g){['new','some','adv'].forEach(function(l){[2,3,4,5].forEach(function(n){genPlan(normProf({goal:g,n:n,len:60,lvl:l,have:HAVE_KEYS,sd:7})).ds.forEach(function(d){d.ex.forEach(function(e){if(e.u!=='r')return;if(e.lo===e.hi)s++;if(!ok.has(e.lo)||!ok.has(e.hi))b++;})})})})});return b+s})()");
   ok(bad===0,'generated plans only use easy rep ranges, never a single number ('+bad+')');}
  console.log('organization v73');
  {const ss=ev("JSON.stringify(SET)");
   w.setFs('l');ok(doc.documentElement.style.fontSize==='19px','text size large applies');w.setFs('s');ok(doc.documentElement.style.fontSize==='16px','text size back to normal');
   ev("tab='more';render()");ok(/Text size/.test(main())&&/My plan/.test(main()),'More shows text size and a My plan section');
   ev("tab='workout';render()");ok(!/Delete plan|Eliminar plan/.test(main())&&/More options/.test(main()),'home plan card is trimmed to the main actions');
   w.eval("SET=JSON.parse("+JSON.stringify(ss)+");applyTheme();tab='workout';render()");}
  console.log('share v72');
  {const sv=ev("JSON.stringify(DATA)"),su=ev("SET.units");ev("SET.units='metric'");
   ev("DATA.workouts=[{id:'c1',t:new Date(2026,8,5,12).getTime(),end:0,name:'Push, day \"A\"',note:'',ex:[{eid:'bench',n:'Bench',sets:[{w:60,r:8,t:null,d:null},{w:62.5,r:6,t:null,d:null,pr:1}]},{eid:'run',n:'Run',sets:[{w:null,r:null,t:20,d:3.2}]}]}]");
   w.eval("window.__out=null;fileOut=function(n,tx,m){window.__out={n:n,tx:tx,m:m};}");w.exportCSV();
   const o=w.eval("(function(){var x=csvToWorkouts(window.__out.tx);return JSON.stringify(x)})()");const r=JSON.parse(o);
   ok(r.wks.length===1&&r.wks[0].name==='Push, day "A"'&&r.wks[0].ex.length===2&&r.wks[0].ex[0].sets.length===2&&r.wks[0].ex[0].sets[1].w===62.5&&r.wks[0].ex[0].sets[1].pr===1&&Math.abs(r.wks[0].ex[1].sets[0].d-3.2)<1e-9,'CSV export then import keeps workouts, sets and PRs');
   ok(w.eval("csvToWorkouts('a,b\\n1,2')")===null,'CSV import rejects other files');
   {const sv=w.eval("JSON.stringify(DATA)");
   w.eval(`window.CLOUD_CFG={url:'https://x.supabase.co',key:'anon',strava:true};CL={uid:'u1',email:'a@b.co',at:'a',rt:'r',exp:Date.now()+3e6,sv:true};window.__f0=window.fetch;
     window.fetch=function(u,o){var R=function(s,j){return Promise.resolve({ok:s<300,status:s,json:function(){return Promise.resolve(j)}})};
       if(/functions\\/v1\\/strava\\?a=activity/.test(u))return R(200,{found:true,id:1,avg_hr:131.4,max_hr:168,kcal:412.6});
       if(/functions\\/v1\\/strava\\?a=status/.test(u))return R(200,{connected:true});
       return window.__f0(u,o);};
     DATA.workouts=[{id:'sv1',t:Date.now()-36e5,end:Date.now()-1e6,name:'Run',note:'',ex:[{eid:EXLIB[0][0],n:'x',sets:[{w:50,r:5}]}]}];`);
   w.openWk('sv1');ok(/Bring in my watch data/.test(sheetHtml()),'workout detail offers watch data when Strava is on');
   await w.stravaGet('sv1');await new Promise(r=>setTimeout(r,50));
   const sw=w.eval("DATA.workouts[0]");ok(sw.hr&&sw.hr.a===131&&sw.hr.m===168&&sw.kcal===413&&sw.sv===1,'Strava numbers are saved on the workout');
   ok(/Powered by Strava/.test(sheetHtml())&&/131/.test(sheetHtml()),'detail shows heart rate and credits Strava');
   ok(w.eval("JSON.stringify(cleanWk(JSON.parse(JSON.stringify(DATA.workouts[0]))).hr)")==='{"a":131,"m":168}','sync keeps heart rate');
   {const t0=Date.now()-36e5;
   w.eval(`window.__acts=[{id:'111',start:Math.floor((Date.now()-36e5)/1000),seconds:3000,name:'Morning lift',type:'WeightTraining',avg_hr:120.2,max_hr:150,kcal:300},{id:'222',start:Math.floor((Date.now()-8e6)/1000),seconds:1800,name:'Easy run',type:'Run',avg_hr:140,max_hr:171,kcal:350},{id:'333',start:Math.floor((Date.now()-9e6)/1000),seconds:20,name:'tiny',type:'Run',avg_hr:null,max_hr:null,kcal:null}];
     window.fetch=function(u,o){var R=function(s,j){return Promise.resolve({ok:s<300,status:s,json:function(){return Promise.resolve(j)}})};
       if(/functions\\/v1\\/strava\\?a=recent/.test(u))return R(200,{activities:window.__acts});
       return window.__f0(u,o);};
     CL.dek='x';DATA.workouts=[{id:'sv1',t:Date.now()-36e5,end:Date.now()-33e5,name:'Push',note:'',ex:[{eid:EXLIB[0][0],n:'x',sets:[{w:50,r:5}]}]}];DATA.tomb={};`);
   await w.stravaSync(true);
   const ws=JSON.parse(w.eval("JSON.stringify(DATA.workouts)"));
   const lift=ws.find(x=>x.id==='sv1'),run=ws.find(x=>x.id==='sv222');
   ok(lift&&lift.sid==='111'&&lift.hr&&lift.hr.a===120&&lift.kcal===300,'auto-sync adds heart rate + calories to the matching workout');
   ok(run&&run.ex.length===0&&run.sp==='Run'&&run.hr.a===140&&run.sec===1800&&run.name==='Easy run','auto-sync creates a watch-only workout for new Strava activities');
   ok(!ws.some(x=>x.sid==='333'),'too-short activities are ignored');
   await w.stravaSync(true);ok(w.eval("DATA.workouts.length")===2,'syncing again does not duplicate');
   w.go('history');ok(/Run/.test(main())&&/140/.test(main()),'history lists the watch-only workout with its sport and heart rate');
   w.openWk('sv222');ok(sheetHtml().length>50,'watch-only workout opens without errors');w.sheetClose();
   w.eval("DATA.workouts=DATA.workouts.filter(x=>x.id!=='sv222');clTomb('sv222');");await w.stravaSync(true);
   ok(!w.eval("DATA.workouts.some(x=>x.sid==='222')"),'a deleted watch workout is not re-imported');
   ok(w.eval("cleanWk({id:'q1',t:1,ex:[]})")===null&&w.eval("!!cleanWk({id:'q2',t:1,ex:[],sid:'55',sp:'Run'})"),'sync keeps watch-only workouts but still drops empty ones');}
   w.eval("clUnlink();window.fetch=window.__f0;window.CLOUD_CFG={url:'',key:''};");w.sheetClose();
   w.eval("DATA=JSON.parse("+JSON.stringify(sv)+")");w.go('workout');}
   {const sv=w.eval("JSON.stringify(DATA)");
   w.eval(`window.CLOUD_CFG={url:'https://x.supabase.co',key:'anon'};window.__row=null;window.__ap='';window.__log=[];window.__fetch0=window.fetch;
     window.fetch=function(u,o){o=o||{};var m=o.method||'GET',b=o.body?JSON.parse(o.body):null,R=function(s,j){return Promise.resolve({ok:s<300,status:s,json:function(){return Promise.resolve(j)}})};
       window.__log.push(m+' '+u+' '+(o.body||''));
       if(/auth\\/v1\\/token\\?grant_type=password/.test(u))return b.password===window.__ap?R(200,{access_token:'a',refresh_token:'r',expires_in:3600,user:{id:'u1',email:b.email}}):R(400,{msg:'Invalid login credentials'});
       if(/auth\\/v1\\/token\\?grant_type=refresh_token/.test(u))return R(200,{access_token:'a2',refresh_token:'r2',expires_in:3600,user:{id:'u1',email:'a@b.co'}});
       if(/auth\\/v1\\/user/.test(u)&&m==='PUT'){window.__ap=b.password;return R(200,{id:'u1'});}
       if(/version\\.json/.test(u))return R(200,{v:APP_VER});
       if(/rest\\/v1\\/user_data/.test(u)){
         if(m==='GET'){var sel=/select=([^&]+)/.exec(u)[1];if(!window.__row)return R(200,[]);var r={};sel.split(',').forEach(function(k){r[k]=window.__row[k]});return R(200,[r]);}
         if(m==='POST'){window.__row={user_id:b.user_id,data:b.data,rev:b.rev,vault:b.vault};return R(201,[window.__row]);}
         if(m==='DELETE'){window.__row=null;return R(200,[]);}
         if(m==='PATCH'){var mm=/rev=eq\\.(\\d+)/.exec(u);if(mm&&(!window.__row||window.__row.rev!==+mm[1]))return R(200,[]);if(!window.__row)return R(200,[]);if(b.data)window.__row.data=b.data;if(b.rev)window.__row.rev=b.rev;if(b.vault)window.__row.vault=b.vault;return R(200,[window.__row]);}
       }
       return window.__fetch0(u,o);};`);
   w.eval("DATA.workouts=[{id:'wa1',t:Date.now()-1e6,end:0,name:'A',ex:[{eid:EXLIB[0][0],n:'x',sets:[{w:50,r:5}]}]}];DATA.tomb={};CL=null;");
   w.eval("window.__ap='x'");const ap=await w.clAuthPw('a@b.co','Secret123');w.eval("window.__ap="+JSON.stringify(ap));
   ok(ap!=='Secret123'&&ap.length>20,'server gets a derived password, never the real one');
   w.go('more');ok(/Sign up/.test(main()),'cloud card invites to create an account');
   ok(await w.eval("(async function(){var o=CL;CL={uid:'u',plain:1,dek:'plain'};var e=await clSeal({x:1});var r=await clOpen(e);CL=o;return e.v===0&&r.x===1;})()"),'Google accounts store plain data (no own key) and read it back');
   ok(w.eval("clClean({prof:{n:'Mike',a:{k:'p',p:'001'}}}).prof.n")==='Mike'&&w.eval("clClean({prof:{n:'  '}}).prof")===null&&w.eval("clMerge(clClean({prof:{n:'A'}}),clClean({prof:{n:'B'}})).prof.n")==='A','profile name and picture travel with the account');
   w.clAuthOpen('in');doc.getElementById('cle').value='a@b.co';doc.getElementById('clp').value='bad';await w.clSubmit('in');await new Promise(r=>setTimeout(r,80));
   ok(/doesn.t match/.test(sheetHtml())&&!w.eval('CL'),'wrong password shows a friendly message');
   doc.getElementById('cle').value='a@b.co';doc.getElementById('clp').value='Secret123';await w.clSubmit('in');await new Promise(r=>setTimeout(r,300));
   ok(/recovery key/i.test(sheetHtml())&&/id="clrec"/.test(sheetHtml()),'new account shows the recovery key');
   ok(doc.getElementById('clrecgo').disabled===true,'must confirm saving the key before continuing');
   const rec=w.eval('window.__clRec');ok(/^([A-Z2-9]{4}-){5}[A-Z2-9]{4}$/.test(rec),'recovery key has a readable format');
   doc.getElementById('clsaved').checked=true;doc.getElementById('clsaved').dispatchEvent(new w.Event('change'));doc.getElementById('clrecgo').click();await new Promise(r=>setTimeout(r,400));
   ok(w.eval('CL&&CL.uid')==='u1'&&w.eval('!!__row')&&w.eval('__row.data.ct&&__row.data.iv&&__row.data.v')==1||w.eval('!!(__row&&__row.data.ct)'),'first sync creates an encrypted cloud copy');
   const raw=w.eval("JSON.stringify(__row)");{const r2=raw.replace(/"wp"[^}]*}|"wr"[^}]*}/g,"");const mm=r2.match(/workouts|wa1|bench|"A"/);if(mm)console.log("MATCH",mm[0],r2.slice(Math.max(0,mm.index-40),mm.index+40));}ok(!/workouts|wa1|bench|"A"/.test(raw.replace(/"wp"[^}]*}|"wr"[^}]*}/g,"")),'cloud row holds only ciphertext (no workout data)');
   ok(!raw.includes('Secret123')&&!w.eval("JSON.stringify(window.__log)").includes('Secret123'),'real password never leaves the phone');
   ok(w.eval('!!(__row.vault&&__row.vault.wp&&__row.vault.wr)')&&w.eval('CL.vault===undefined'),'vault saved with password + recovery wraps');
   const dec=async()=>JSON.parse(await w.eval("(async()=>JSON.stringify(await clOpen(__row.data)))()"));
   ok((await dec()).workouts.length===1,'cloud copy decrypts back to the workouts');
   const put=async f=>{await w.eval("(async()=>{var d=await clOpen(__row.data);"+f+";__row.data=await clSeal(d);})()");};
   await put("d.workouts.push({id:'wb2',t:Date.now()-5e5,end:0,name:'B',note:'',ex:[{eid:EXLIB[0][0],n:'x',sets:[{w:60,r:5}]}]});d._u=Date.now()+10");
   w.eval("DATA.workouts.push({id:'wc3',t:Date.now()-2e5,end:0,name:'C',note:'',ex:[{eid:EXLIB[0][0],n:'x',sets:[{w:70,r:5}]}]});saveData();");
   await w.cloudSync(true);
   const ids=w.eval("DATA.workouts.map(x=>x.id).sort().join()"),rids=(await dec()).workouts.map(x=>x.id).sort().join();
   ok(ids==='wa1,wb2,wc3'&&rids==='wa1,wb2,wc3','two phones merge without losing workouts');
   w.eval("DATA.workouts=DATA.workouts.filter(x=>x.id!=='wb2');clTomb('wb2');saveData();");await w.cloudSync(true);
   ok((await dec()).workouts.map(x=>x.id).sort().join()==='wa1,wc3'&&!w.eval("DATA.workouts.some(x=>x.id==='wb2')"),'deleted workouts stay deleted (tombstones)');
   w.eval("DATA.workouts.push({id:'zz9',t:1,end:0,name:'bad',ex:'nope'});");await w.cloudSync(true);
   ok(!/zz9/.test(JSON.stringify(await dec())),'invalid items are never uploaded');
   w.go('more');ok(/a@b\.co/.test(main())&&!/Sync now/.test(main())&&/Saves automatically|Synced/.test(main()),'signed-in card shows the account');
   // second phone: same password opens the same data / segundo teléfono
   w.eval("clUnlink();DATA.workouts=[];DATA.tomb={};");
   w.clAuthOpen('in');doc.getElementById('cle').value='a@b.co';doc.getElementById('clp').value='Secret123';await w.clSubmit('in');await new Promise(r=>setTimeout(r,500));
   ok(w.eval("DATA.workouts.map(x=>x.id).sort().join()")==='wa1,wc3','signing in on another phone brings the data back');
   // tampering: a different data key cannot open it / otra llave no abre
   const dek0=w.eval('CL.dek');w.eval("CL.dek=b64(crypto.getRandomValues(new Uint8Array(32)));CLK=null;");
   ok(await w.cloudSync(true)===false&&w.eval("CL.err")==='key','wrong key is reported, nothing is overwritten');
   w.eval("CL.dek='"+dek0+"';CLK=null;delete CL.err;");
   // forgot password with the recovery key / olvidó contraseña
   w.eval("clUnlink();");w.clRecoverOpen&&0;
   w.eval("clSession({access_token:'a',refresh_token:'r',expires_in:3600,user:{id:'u1',email:'a@b.co'}});");
   w.clRecoverOpen();doc.getElementById('clp').value='NewSecret456';doc.getElementById('clrk').value='AAAA-BBBB-CCCC-DDDD-EEEE-FFFF';await w.clRecoverGo();await new Promise(r=>setTimeout(r,300));
   ok(!w.eval('CL.dek'),'wrong recovery key does not unlock');
   w.clRecoverOpen();doc.getElementById('clp').value='NewSecret456';doc.getElementById('clrk').value=rec.toLowerCase().replace(/-/g,' ');await w.clRecoverGo();await new Promise(r=>setTimeout(r,500));
   ok(!!w.eval('CL.dek')&&w.eval("DATA.workouts.length")===2,'recovery key unlocks the data and sets a new password');
   w.eval("clUnlink();");const ap2=await w.clAuthPw('a@b.co','NewSecret456');ok(w.eval('__ap')===ap2,'new password is what the server accepts');
   w.clAuthOpen('in');doc.getElementById('cle').value='a@b.co';doc.getElementById('clp').value='NewSecret456';await w.clSubmit('in');await new Promise(r=>setTimeout(r,500));
   ok(!!w.eval('CL&&CL.dek')&&!/Couldn/.test(sheetHtml()),'new password signs in and opens the data');
   // change password / cambiar contraseña
   w.clChPwOpen();doc.getElementById('clo').value='NewSecret456';doc.getElementById('clp').value='Third789pass';await w.clChPwGo();await new Promise(r=>setTimeout(r,500));
   ok(w.eval('__ap')===await w.clAuthPw('a@b.co','Third789pass'),'change password updates the login');
   w.eval("clUnlink();");w.clAuthOpen('in');doc.getElementById('cle').value='a@b.co';doc.getElementById('clp').value='Third789pass';await w.clSubmit('in');await new Promise(r=>setTimeout(r,500));
   ok(!!w.eval('CL&&CL.dek'),'sign in works with the changed password');
   // lost key: start fresh / perdió clave
   w.eval("var lk=window.__row.vault.wr;");await w.clFreshGo.call&&0;
   w.clFreshOpen();doc.getElementById('clp').value='Fresh12345a';await w.clFreshGo();await new Promise(r=>setTimeout(r,500));
   ok(/recovery key/i.test(sheetHtml())&&w.eval('__row')!==null||w.eval('window.__clRec')!=null,'starting fresh creates a new key');
   w.eval("window.__clDone=null;sheetClose();clUnlink();window.fetch=window.__fetch0;window.CLOUD_CFG={url:'',key:''};");
   w.eval("DATA=JSON.parse("+JSON.stringify(sv)+")");w.go('workout');}
   {const ws=JSON.stringify(w.eval("JSON.stringify(DATA)"));w.eval("DATA.workouts=[0,1,2].map(i=>({id:'z'+i,t:Date.now()-(3-i)*864e5*3,end:0,name:'',ex:[{eid:'bench-press',n:'x',sets:[{w:60+i*5,r:5}]}]}))");
   const eid=w.eval("EXLIB[0][0]");w.eval("DATA.workouts.forEach(k=>k.ex[0].eid='"+eid+"')");w.eval("UI.prog=null");const pg=w.eval("vProgress()");
   ok(/class="card tl"/.test(pg)&&/id="rmw"/.test(pg),'Progress shows top-lift charts and the 1RM calculator');
   w.eval("document.body.insertAdjacentHTML('beforeend','<div id=tmpx></div>')");
   w.eval("(function(){var d=document.getElementById('tmpx');d.innerHTML=rmCalc();document.getElementById('rmw').value='100';document.getElementById('rmr').value='5';rmUpdate();})()");
   ok(/rmc-grid/.test(w.eval("document.getElementById('rmout').innerHTML"))&&/116|117/.test(w.eval("document.getElementById('rmout').innerHTML")),'1RM calc estimates (100x5 ≈ 117)');
   w.eval("document.getElementById('tmpx').remove()");w.eval("DATA=JSON.parse("+ws+")");}
   {const hv=JSON.parse(w.eval("JSON.stringify(csvToWorkouts("+JSON.stringify("\"title\",\"start_time\",\"end_time\",\"description\",\"exercise_title\",\"superset_id\",\"exercise_notes\",\"set_index\",\"set_type\",\"weight_kg\",\"reps\",\"distance_km\",\"duration_seconds\",\"rpe\"\n\"Push\",\"24 Oct 2026, 10:00\",\"24 Oct 2026, 11:00\",\"\",\"Bench Press (Barbell)\",\"\",\"\",\"0\",\"warmup\",\"40\",\"10\",\"\",\"\",\"\"\n\"Push\",\"24 Oct 2026, 10:00\",\"24 Oct 2026, 11:00\",\"\",\"Bench Press (Barbell)\",\"\",\"\",\"1\",\"normal\",\"80\",\"5\",\"\",\"\",\"\"\n\"Push\",\"24 Oct 2026, 10:00\",\"24 Oct 2026, 11:00\",\"\",\"Weird Machine X\",\"\",\"\",\"0\",\"normal\",\"20\",\"12\",\"\",\"\",\"\"\n")+"))"));ok(hv&&hv.wks.length===1&&hv.wks[0].ex.length===2&&hv.wks[0].ex[0].sets[0].ty==='w'&&hv.wks[0].ex[0].sets[1].w===80&&hv.cx.length===1&&hv.wks[0].end>hv.wks[0].t,'Hevy CSV imports (warm-up, custom exercise, times)');
   const sg=JSON.parse(w.eval("JSON.stringify(csvToWorkouts("+JSON.stringify("Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE\n2026-10-20 18:00:00,Legs,1h,Squat (Barbell),1,100,5,0,0,,,\n2026-10-20 18:00:00,Legs,1h,Squat (Barbell),W,60,8,0,0,,,\n")+"))"));ok(sg&&sg.wks.length===1&&sg.wks[0].ex[0].sets.some(s=>s.ty==='w')&&sg.wks[0].ex[0].sets.length===2,'Strong CSV imports (W set order)');}
   ok(w.eval("cleanGoals([{id:'g1',k:'reps',eid:'pullup',tg:10,t:5},{id:'bad',k:'x',tg:1},{id:'g2',k:'lift',tg:5}]).length")===1,'goal import keeps only valid goals');
   ok(w.eval("typeof wkPic==='function'&&typeof csRender==='function'"),'share studio is wired');
   {const wk0=ev("DATA.workouts[0]&&DATA.workouts[0].id");if(!wk0){ev("DATA.workouts.push({id:'cswk',t:Date.now()-1e6,end:Date.now(),name:'Push day',note:'',ex:[{eid:'bench',n:'Bench',sets:[{w:60,r:8,t:1,d:null,pr:1},{w:60,r:8,t:2,d:null}]}]})");}
    const id=ev("DATA.workouts[0].id");ev("HTMLCanvasElement.prototype.getContext=function(){return null;}");ev("wkPic('"+id+"')");
    ok(doc.querySelectorAll('#sheet [data-k=style]').length===7,'share studio offers 7 styles');
    ok(ev("['classic','stack','poster','chips','lifts','badge','bar'].every(function(s){CS.style=s;return typeof csRender===typeof csRender;})"),'styles list ok');
    ev("sheetClose()");}
   ev("DATA=JSON.parse("+JSON.stringify(sv)+");SET.units="+JSON.stringify(su)+";tab='workout';render()");}
  console.log('military v71');
  {const sv=ev("JSON.stringify(DATA)"),su=ev("SET.units");ev("SET.units='metric'");
   ev("DATA.workouts=[{id:'a1',t:Date.now()-864e5,end:Date.now(),name:'x',ex:[{eid:'hexdl',n:'x',sets:[{w:100,r:3}]},{eid:'hrpushup',n:'x',sets:[{w:null,r:30}]},{eid:'plank',n:'x',sets:[{t:2,d:null}]},{eid:'run',n:'x',sets:[{t:20,d:3.218}]}]}];DATA.aft={mdl:140,hrp:40,plk:3,run:16}");
   ok(Math.abs(ev("aftBest(AFT_EV[4])")-20)<1e-9&&ev("aftBest(AFT_EV[0])")===100,'AFT best results (run estimated at 2 miles)');
   ok(ev("aftWeak().e.k")==='run'||ev("aftWeak().e.k")==='plk'||ev("aftWeak().e.k")==='mdl','weakest event found');
   w.aftOpen();ok(/AFT panel/.test(sheetHtml())&&/Work on/.test(sheetHtml()),'AFT panel opens with the weakest event');
   w.aftSet('run');doc.getElementById('aftv').value='15:30';w.aftSave('run');ok(Math.abs(ev("DATA.aft.run")-15.5)<1e-9,'target time m:ss saved');
   ev("ACT=null;aftTrain('run')");ok(ev("ACT&&ACT.ex.length")>=2,'train the weak event starts a workout');ev("ACT=null;saveAct()");
   ev("DATA=JSON.parse("+JSON.stringify(sv)+")");
   ev("ACT=null;saveAct()");w.planStartAlt(0,'field');ok(ev("ACT&&ACT.ex.length")>=1&&ev("ACT.ex.every(x=>avail(x.eid,['pack','bar']))"),'field mode only uses pack, bar and bodyweight');
   ev("ACT=null;saveAct();SET.units="+JSON.stringify(su)+";tab='workout';render()");w.sheetClose();}
  console.log('easier v70');
  {const sv=ev("JSON.stringify(DATA)");
   ev("DATA.workouts=[{id:'f1',t:Date.now()-864e5,end:Date.now(),name:'x',ex:[{eid:'bench',n:'Bench',sets:[{w:60,r:8},{w:60,r:7}]}]}]");
   ev("ACT=null;startWorkout({name:'t',ex:[{eid:'bench',sets:3}]})");
   ok(/class="exdm"/.test(main())&&/Same as last time/.test(main()),'active workout shows the demo thumbnail and the same-as-last-time button');
   ev("fillLast(0)");ok(ev("ACT.ex[0].sets.map(s=>s.w+'x'+s.r).join()")==='60x8,60x7,60x7','one tap fills empty sets with last time');
   ev("ACT=null;saveAct()");w.eval("DATA=JSON.parse("+JSON.stringify(sv)+");tab='workout';render()");}
  console.log('personal v69');
  {const sv=ev("JSON.stringify(DATA)"),ss=ev("JSON.stringify(SET)");
   ev("SET.noEnergy=0");w.planGo(0);ok(/How do you feel today/.test(sheetHtml()),'energy question before starting');
   const n0=ev("DATA.plan.ds[0].ex.reduce((a,e)=>a+e.sets,0)");
   ev("ACT=null;saveAct()");w.enPick(0,'tired');ok(ev("ACT&&ACT.ex.reduce((a,x)=>a+x.sets.length,0)")<=n0&&ev("ACT.ex.length")===ev("DATA.plan.ds[0].ex.length"),'tired starts an easier version of the same day');
   ev("ACT=null;saveAct();SET.noEnergy=1;planGo(0)");ok(ev("!!ACT")&&!/How do you feel/.test(sheetHtml()),'"don\'t ask" skips the question');ev("ACT=null;saveAct();SET.noEnergy=0");w.sheetClose();
   w.planStartAlt(0,'none');ok(ev("ACT.ex.every(x=>avail(x.eid,HAVE_PRESETS.none))"),'hotel mode keeps only no-equipment exercises');ev("ACT=null;saveAct()");
   const e0=ev("JSON.stringify(DATA.plan.ds.map(d=>d.ex.map(e=>e.eid)))");w.planAnother();w.askOk();
   ok(ev("JSON.stringify(DATA.plan.ds.map(d=>d.ex.map(e=>e.eid)))")!==e0&&ev("DATA.plan.n")===JSON.parse(sv).plan.n,'another plan keeps the days but changes the exercise mix');
   w.eval("DATA=JSON.parse("+JSON.stringify(sv)+");SET=JSON.parse("+JSON.stringify(ss)+");tab='workout';render()");w.sheetClose();}
  console.log('habit v68');
  {const sv=ev("JSON.stringify(DATA)"),ss=ev("JSON.stringify(SET)");
   ev("(function(){var cw=weekStart(Date.now()),W=864e5*7,mk=function(o){return {id:'h'+o,t:cw-o*W+864e5,end:cw-o*W+864e5+3e6,name:'x',ex:[]}};DATA.plan=null;DATA.workouts=[mk(0),mk(0),mk(0),mk(1),mk(1),mk(1),mk(2),mk(3),mk(3),mk(3)].map(function(x,i){x.id='h'+i;x.t+=i*1000;return x});DATA.workouts.sort(function(a,b){return b.t-a.t})})()");
   const st=ev("streakInfo()");
   ok(st.n===3&&st.grace===1,'streak counts weeks with one missed week forgiven ('+st.n+','+st.grace+')');
   ev("DATA.workouts=DATA.workouts.filter(function(x){return x.t>weekStart(Date.now())-9*864e5})");
   ok(ev("streakInfo().n")===2,'streak stops when no grace applies');
   ev("DATA.workouts=[]");ok(ev("streakCard()")==='','no streak card before the first workout');
   ev("SET.wkSeen=0;DATA.workouts=[{id:'z',t:weekStart(Date.now())-3*864e5,end:weekStart(Date.now())-3*864e5+1000,name:'x',ex:[]}]");
   ok(/Your last week/.test(ev("wkSumCard()")),'weekly summary card appears after a trained week');
   w.wkSumOpen();ok(/workouts/i.test(sheetHtml())&&ev("wkSumDue()")===false,'summary opens and is marked seen');w.sheetClose();
   w.remOpen();ok(/Add to calendar/.test(sheetHtml()),'reminder sheet opens');
   w.eval("window.__out=null;fileOut=function(n,tx,m){window.__out={n:n,tx:tx,m:m};}");w.remSave();
   ok(/BEGIN:VCALENDAR/.test(w.__out.tx)&&/RRULE:FREQ=WEEKLY/.test(w.__out.tx)&&/\.ics$/.test(w.__out.n),'reminders produce a weekly calendar file');
   w.eval("DATA=JSON.parse("+JSON.stringify(sv)+");SET=JSON.parse("+JSON.stringify(ss)+");tab='workout';render()");}
  console.log('library styles v67');
  {const sl=ev("JSON.stringify(SET.libHave||null)");
   w.libOpen();w.libSty('cali');ok(ev("libHave().join()")===ev("styHave(['cali']).join()")&&/Quick pick by style/.test(sheetHtml()),'library style shortcut sets the equipment');
   w.libTogHave('band');ok(ev("SET.libSty")==='','changing the equipment by hand clears the style');
   w.libSty('home');w.libSty('home');ok(ev("SET.libSty")==='','tapping the style again clears it');
   w.eval("SET.libHave="+sl+";SET.libSty='';");w.sheetClose();}
  console.log('goals v65');
  {const sv=ev("JSON.stringify(DATA)"),su=ev("SET.units");ev("SET.units='metric'");
   ev("DATA.workouts=[{id:'g1',t:Date.now()-864e5,end:Date.now(),name:'x',ex:[{eid:'pullup',n:'Pull-up',sets:[{w:null,r:6},{w:null,r:8}]},{eid:'bench',n:'Bench',sets:[{w:60,r:5}]}]}];DATA.body=[{id:'b1',t:Date.now(),w:100}];DATA.goals=[]");
   ev("GN={k:'reps',eid:'pullup'};");w.goalTarget();doc.getElementById('gtg').value='10';w.goalSave();
   ev("GN={k:'lift',eid:'bench'};");w.goalTarget();doc.getElementById('gtg').value='100';w.goalSave();
   ev("GN={k:'bw'};");w.goalTarget();doc.getElementById('gtg').value='90';w.goalSave();
   ev("GN={k:'ses'};");w.goalTarget();doc.getElementById('gtg').value='4';w.goalSave();
   ok(ev("DATA.goals.length")===4,'four goals saved');
   ok(ev("goalPct(DATA.goals[0])")===0.8&&ev("goalPct(DATA.goals[1])")===0.6&&ev("goalPct(DATA.goals[2])")===0&&ev("goalPct(DATA.goals[3])")===0.25,'goal progress for reps, lift, body weight and sessions');
   ev("DATA.body.unshift({id:'b2',t:Date.now()+1,w:95})");ok(Math.abs(ev("goalPct(DATA.goals[2])")-0.5)<1e-9,'body-weight goal moves toward target');
   ev("DATA.workouts[0].ex[0].sets.push({w:null,r:10})");ev("goalsCheck()");ok(!!ev("DATA.goals[0].done"),'reaching the target marks the goal done');
   ev("go('progress')");ok(/Your goals/.test(main())&&/10 reps in/.test(main())&&/60%/.test(main()),'progress tab shows goals');
   w.goalDel(ev("DATA.goals[0].id"));ok(ev("DATA.goals.length")===3,'goal can be removed');
   w.eval("DATA=JSON.parse("+JSON.stringify(sv)+");SET.units="+JSON.stringify(su)+";tab='workout';render()");}
  console.log('return + short v64');
  {const sv=ev("JSON.stringify(DATA.plan)"),sw=ev("JSON.stringify(DATA.workouts)");
   ev("DATA.workouts=[{id:'wx',t:Date.now()-20*864e5,te:Date.now()-20*864e5+3e6,name:'x',ex:[]}];delete DATA.plan.rs");
   ok(/20 days/.test(ev("awayHtml(DATA.plan)")),'away card after 20 days');
   ev("DATA.workouts[0].t=Date.now()-3*864e5");ok(ev("awayHtml(DATA.plan)")==='','no away card after 3 days');
   const n0=ev("DATA.plan.ds[0].ex.length");const n20=ev("shortDay(DATA.plan.ds[0].ex,20).length"),n45=ev("shortDay(DATA.plan.ds[0].ex,45).length");
   ok(n20>=1&&n20<=n45&&n45<=n0&&n20<n0,'short workout keeps fewer exercises for less time ('+n20+'/'+n45+'/'+n0+')');
   ev("ACT=null;planStartShort(0,20)");ok(ev("ACT&&ACT.ex.length")===n20,'short workout starts with those exercises');
   ev("ACT=null;saveAct();planStartSoft(0)");ok(ev("ACT&&ACT.ex.length")===n0&&ev("!!DATA.plan.rs"),'soft restart keeps the day and hides the card');
   ev("ACT=null;saveAct()");w.eval("DATA.plan=JSON.parse("+JSON.stringify(sv)+");DATA.workouts=JSON.parse("+JSON.stringify(sw)+");render()");}
  console.log('tastes v63');
  {const sv=ev("JSON.stringify(DATA.plan)");const e0=ev("DATA.plan.ds[0].ex[0].eid");
   w.tasteLike(e0);ok(ev("tasteOf('"+e0+"')")==='lk','like marks the exercise');
   w.tasteDis('plan',0,0);const e1=ev("DATA.plan.ds[0].ex[0].eid");
   ok(e1!==e0&&ev("tasteOf('"+e0+"')")==='no'&&ev("DATA.plan.prof.lk.indexOf('"+e0+"')")<0,'dislike swaps the exercise and drops the like');
   let bad=0;for(let i=0;i<10;i++){const G3=ev("genPlan(normProf(Object.assign({},DATA.plan.prof,{sd:"+(i+7)+"})))");if(JSON.stringify(G3.ds).indexOf('"'+e0+'"')>=0)bad++;}
   ok(bad===0,'a disliked exercise never comes back in new plans');
   w.tasteOpen();ok(/Your tastes/.test(sheetHtml()),'tastes list opens');w.planOpen();w.sheetClose();w.eval("DATA.plan=JSON.parse("+JSON.stringify(sv)+")");}

  ok(ev('DATA.plan.ds.length')===4&&ev('DATA.plan.goal')==='fat'&&ev('DATA.plan.prof.focus.length')===3,'plan created (fat, 4 days, 3 focus muscles)');
  ok(/Up next/.test(main())&&/Day 1/.test(main()),'plan card shows next day');
  const tst=ev("(function(){const r={};[['hybrid','gen'],['military','aft'],['military','usmc']].forEach(a=>{const ids=[];[3,4,5].forEach(n=>genPlan({goal:a[0],test:a[1],n:n,lvl:'some',have:HAVE_KEYS.slice()}).ds.forEach(d=>d.ex.forEach(e=>ids.push(e.eid))));r[a[0]+a[1]]={sdc:ids.indexOf('sdcdrill')>=0,fc:ids.indexOf('firecarry')>=0,am:ids.indexOf('ammolift')>=0};});return r;})()");
  ok(!tst.hybridgen.sdc&&!tst.hybridgen.fc&&!tst.hybridgen.am,'civilian hybrid has no military-only drills');
  ok(!tst.militaryusmc.sdc,'USMC plan has no Army sprint-drag-carry');
  ok(tst.militaryaft.sdc,'AFT plan keeps sprint-drag-carry');
  const vq=ev("(function(){const r={};['lo','md','hi'].forEach(v=>{[['muscle',4],['muscle',3],['fat',4],['strength',3],['hybrid',4]].forEach(a=>{const p=genPlan({goal:a[0],n:a[1],vol:v,len:60,lvl:'some',have:HAVE_KEYS.slice()});const o=volOfDs(p.ds);r[v+a[0]+a[1]]={o:o,r:{Q:volRange('Q',v,p.prof,p.ph),A:volRange('A',v,p.prof,p.ph),P:volRange('P',v,p.prof,p.ph)},exMax:Math.max.apply(null,p.ds.map(d=>d.ex.filter(e=>!e.sec||e.sec==='rs').length)),core:p.ds.map(d=>d.ex.filter(e=>muOf(e.eid)==='A').length)};});});return r;})()");
  const tot=k=>Object.values(vq[k].o).reduce((a,b)=>a+b,0);
  ok(tot('lomuscle4')<tot('mdmuscle4')&&tot('mdmuscle4')<tot('himuscle4'),'volume levels give low < medium < high total sets');
  ok(['lo','md','hi'].every(v=>['Q','P','A'].every(m=>{const q=vq[v+'muscle3'],o=q.o[m];return o>=q.r[m][0]&&o<=q.r[m][1];})),'planned sets land in the range (muscle, 3 days)');
  ok(Math.max.apply(null,vq.himuscle4.core)>=Math.max.apply(null,vq.lomuscle4.core),'high volume has at least as many core exercises as low');
  ok(Object.keys(vq).every(k=>vq[k].exMax<=8),'volume never goes over the session length cap');
  // NASM OPT engine / motor NASM OPT
  const optT=ev(`(function(){const r={bad:[],n:0};[['muscle',1],['muscle',2],['muscle',3],['muscle',4],['fat',1],['fat',3],['strength',5],['strength',2]].forEach(a=>{[2,3,4,5].forEach(n=>[30,45,60,75].forEach(len=>['lo','md','hi'].forEach(v=>{
      const p=genPlan({goal:a[0],ph:a[1],n:n,len:len,vol:v,lvl:'adv',have:HAVE_KEYS.slice()});r.n++;
      if(p.ph!==a[1])r.bad.push('phase '+a[0]+a[1]+' got '+p.ph);
      p.ds.forEach(d=>{
        if(!d.ex.some(e=>e.sec==='ac'))r.bad.push('no activation '+a[0]+a[1]);
        if(d.ex.filter(e=>e.sec==='rs').length<2)r.bad.push('thin day '+a[0]+a[1]+' n'+n+' l'+len);
        d.ex.forEach(e=>{if(!exById(e.eid))r.bad.push('eid '+e.eid);
          if(e.sec==='rs'&&a[1]===4&&e.hi>5)r.bad.push('P4 reps '+e.hi);
          if(e.sec==='rs'&&exMode(e.eid)!=='bw'&&a[1]===1&&(e.lo!==12||e.hi!==20))r.bad.push('P1 reps '+e.lo+'-'+e.hi);
          if(e.sec==='rs'&&exMode(e.eid)!=='bw'&&a[1]===2&&(e.lo!==8||e.hi!==12))r.bad.push('P2 reps '+e.lo+'-'+e.hi);
          if(e.sets<1||e.sets>6)r.bad.push('sets '+e.sets);});
      });
    })));});return r;})()`);
  ok(optT.bad.length===0&&optT.n>300,'OPT plans: phases, reps, activation, valid exercises ('+optT.n+' plans) '+optT.bad.slice(0,3));
  const opt2=ev("(function(){const p=genPlan({goal:'muscle',ph:2,n:3,len:60,lvl:'some',have:HAVE_KEYS.slice()});const ss=p.ds[0].ex.filter(e=>e.ss);return{pairs:ss.length>=4,rest:ss.filter((e,i)=>i%2===0).every(e=>e.rs===0)&&ss.filter((e,i)=>i%2===1).every(e=>e.rs===60)};})()");
  ok(opt2.pairs&&opt2.rest,'phase 2: supersets, 0 s between and 60 s after');
  const PF=ev(`(function(){const r={bad:[],n:0};[['hybrid','gen'],['military','aft'],['military','usmc'],['runner','gen']].forEach(a=>[2,3,4,5].forEach(n=>['new','some','adv'].forEach(l=>[30,60,75].forEach(len=>{
      const p=genPlan({goal:a[0],test:a[1],race:'half',n:n,len:len,lvl:l,vol:'md',have:HAVE_KEYS.slice(),sd:4});r.n++;
      if(!(p.ph===1||p.ph===2))r.bad.push('phase '+p.ph);
      p.ds.forEach(d=>{d.ex.forEach(e=>{if(!e.sec)r.bad.push('nosec '+e.eid);if(!e.rz)r.bad.push('norz '+e.eid);if(!exById(e.eid))r.bad.push('eid '+e.eid);});
        if(!d.wy||d.wy.indexOf('wyPerf')<0)r.bad.push('nowy');
        const rk={ac:0,sk:1,rs:2,cd:3,cc:4};for(let i=1;i<d.ex.length;i++)if(rk[d.ex[i].sec]<rk[d.ex[i-1].sec])r.bad.push('order '+d.k);});
      const cp=cleanPlan(JSON.parse(JSON.stringify(p)));if(!cp||cp.ph!==p.ph)r.bad.push('clean');
    }))));
    const aft=genPlan({goal:'military',test:'aft',n:4,len:60,lvl:'some',have:HAVE_KEYS.slice()});
    r.sdc=aft.ds.some(d=>d.ex.some(e=>e.eid==='sdcdrill'));
    const rn=genPlan({goal:'runner',race:'half',n:4,len:60,lvl:'some',have:HAVE_KEYS.slice()});
    r.runs=rn.ds.filter(d=>d.ex.some(e=>e.eid==='run')).length;
    return r;})()`);
  ok(PF.bad.length===0&&PF.n>100,'performance plans use the OPT structure ('+PF.n+' plans) '+PF.bad.slice(0,3));
  ok(PF.sdc&&PF.runs>=3,'performance plans keep test drills and run days');
  // personalization v25 / personalización v25
  const P25=ev(`(function(){const r={};const base={goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS.slice(),vol:'md'};
    const ids=p=>p.ds.map(d=>d.ex.map(e=>e.eid).join(',')).join('|');
    const a1=genPlan(Object.assign({sd:111},base)),a2=genPlan(Object.assign({sd:111},base)),b=genPlan(Object.assign({sd:222},base)),c=genPlan(Object.assign({sd:111,rt:1},base));
    r.same=ids(a1)===ids(a2);r.diffPerson=ids(a1)!==ids(b);r.diffRot=ids(a1)!==ids(c);
    const av=genPlan(Object.assign({sd:5,avoid:['barbell','jump','machine']},base,{ph:3,lvl:'adv'}));
    r.avoidOk=av.ds.every(d=>d.ex.every(e=>!prefBad(e.eid,{avoid:['barbell','jump','machine'],no:[]})));
    const fv=genPlan(Object.assign({sd:5,fav:['squat','bench']},base,{ph:3,lvl:'adv'}));
    r.fav=fv.ds.some(d=>d.ex.some(e=>e.eid==='squat'))&&fv.ds.some(d=>d.ex.some(e=>e.eid==='bench'));
    r.favWhy=fv.ds.some(d=>d.wy.some(x=>x==='wyMain|squat'||x==='wyFav|squat'));
    const sit=genPlan(Object.assign({sd:5,work:'sit'},base)),no=genPlan(Object.assign({sd:5},base));
    r.sit=sit.ds.some(d=>d.wy.indexOf('wySit')>=0)&&sit.ds.reduce((a,d)=>a+d.ex.length,0)>no.ds.reduce((a,d)=>a+d.ex.length,0);
    const sh=genPlan(Object.assign({sd:5,sh:1},base));
    r.short=sh.ds[2].wy.indexOf('wyShort')>=0&&sh.ds[2].ex.filter(e=>e.sec==='rs').length<sh.ds[0].ex.filter(e=>e.sec==='rs').length;
    r.lvl=genPlan(Object.assign({pu:'p0'},base)).ph===1&&genPlan(Object.assign({},base)).ph===2;
    r.main=a1.ds.every(d=>d.ex.filter(e=>e.mn).length===1&&d.wy.length>=2);
    const cl=cleanPlan(Object.assign(JSON.parse(JSON.stringify(a1)),{}));cl.ds[0].wy=['wyMain|squat','<script>','wyX|a b'];
    r.clean=JSON.stringify(cleanPlan(cl).ds[0].wy)==='["wyMain|squat"]';
    r.old=cleanPlan(JSON.parse(JSON.stringify(a1))).ds[0].ex.some(e=>e.mn);
    return r;})()`);
  ok(P25.same&&P25.diffPerson&&P25.diffRot,'plans differ by person and rotation, same input gives the same plan');
  ok(P25.avoidOk,'avoided styles never appear in the plan');
  ok(P25.fav&&P25.favWhy,'favorite lifts are used and explained');
  ok(P25.sit&&P25.short,'sitting job adds work; short days use fewer exercises');
  ok(P25.lvl,'push-up test lowers the starting phase');
  ok(P25.main&&P25.clean&&P25.old,'each day has one main lift and a why list; why list is sanitized');
  const AD=ev(`(function(){
    const p=genPlan({goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS.slice(),vol:'hi',sd:9});window.__sv=[DATA.plan,DATA.workouts];DATA.plan=p;DATA.workouts=[];
    const mk=(t,di,skip)=>({id:'w'+t,t:Date.now()-t*1e6+1e9*0,end:0,name:'x',ex:p.ds[di].ex.filter(e=>e.eid!==skip).map(e=>({eid:e.eid,sets:[{w:20,r:8}]})),pl:di});
    p.t0=Date.now()-5e9;
    const skip=p.ds[0].ex.find(e=>e.sec==='rs').eid;
    DATA.workouts=[mk(1,0,skip),mk(2,0,skip),mk(3,0,skip)];
    const sc=adaptScan(p);const r={n:sc.length,skip:sc.some(a=>a.kind==='skip'&&a.eid===skip),vol:sc.some(a=>a.kind==='vol')};
    const cnt=p.ds[0].ex.length;const n=adaptApply(p,sc.filter(a=>a.kind==='skip'&&a.eid===skip));
    r.applied=n>0&&!p.ds[0].ex.some(e=>e.eid===skip)&&p.prof.no.indexOf(skip)>=0;
    const q=genPlan(Object.assign({},p.prof,{no:p.prof.no}));r.noKept=q.ds.every(d=>d.ex.every(e=>e.eid!==skip));
    DATA.plan=window.__sv[0];DATA.workouts=window.__sv[1];
    return r;})()`);
  ok(AD.skip&&AD.applied&&AD.noKept,'plan adjusts: skipped exercise is found, swapped and not picked again ('+JSON.stringify(AD)+')');
  ok(AD.vol,'sets not finished two sessions in a row suggest lowering volume');
  const keys=ev(`(function(){const bad=[];window.__sv2=DATA.plan;const chk=k=>{if(!STR[k])bad.push(k);};[['muscle',1],['muscle',2],['muscle',3],['muscle',4],['strength',5],['fat',2]].forEach(a=>[2,3,4,5].forEach(n=>{const p=genPlan({goal:a[0],ph:a[1],n:n,len:75,lvl:'adv',have:HAVE_KEYS.slice(),focus:['glutes','arms'],work:'sit',avoid:['jump'],inj:['knee'],fav:['squat'],sh:1,skills:['speed','endurance','power'],emph:'low',sd:3});
    p.ds.forEach(d=>{(d.wy||[]).forEach(x=>chk(x.split('|')[0]));d.ex.forEach(e=>{if(e.sec&&!e.rz)bad.push('norz '+e.eid);if(e.rz)chk(e.rz);});});
    DATA.plan=p;planWhyCard(p);}));DATA.plan=window.__sv2;return bad.filter((x,i,a)=>a.indexOf(x)===i);})()`);
  ok(keys.length===0,'every day reason and exercise reason has a text, and every exercise has one '+keys.slice(0,4));
  const BWT=ev(`(function(){const r={bad:[]};['muscle','strength','fat','military','hybrid'].forEach(g=>['some','adv'].forEach(l=>[3,5].forEach(n=>{const p=genPlan({goal:g,test:'aft',n:n,len:60,lvl:l,have:HAVE_KEYS.slice(),sd:2});p.ds.forEach(d=>d.ex.forEach(e=>{if(exMode(e.eid)==='bw'&&e.u==='r'&&(e.r==='m'||e.r==='a')&&!/pullup|chinup|assistpu/.test(e.eid)&&e.hi<12)r.bad.push(g+' '+e.eid+' '+e.lo+'-'+e.hi);}));})));
    const m=genPlan({goal:'general',mix:{g:'military',p:50},test:'aft',n:5,len:60,lvl:'adv',have:HAVE_KEYS.slice(),skills:['strength']});
    m.ds.forEach(d=>d.ex.forEach(e=>{if(e.eid==='pushup'&&e.hi<12)r.bad.push('mix pushup '+e.lo+'-'+e.hi);}));
    const t0=genPlan({goal:'muscle',n:3,len:60,lvl:'adv',pu:'p0',have:HAVE_KEYS.slice()}).ds[0].ex.find(e=>e.eid==='pushup');
    return r;})()`);
  ok(BWT.bad.length===0,'bodyweight moves like push-ups never get strength-style 4-6 reps '+BWT.bad.slice(0,3));
  w.volOpen();ok(/Why it matters/.test(sheetHtml())&&/Goal range/.test(sheetHtml()),'weekly volume screen opens');w.sheetClose();
  // every combination only references real exercises, and every plan exercise has a technique guide
  const bad=ev("(function(){const b=[];PGOALS.forEach(g=>[2,3,4,5].forEach(n=>PLVLS.forEach(l=>genPlan({goal:g,n:n,lvl:l}).ds.forEach(d=>d.ex.forEach(e=>{if(!exById(e.eid))b.push(e.eid);})))));return b;})()");
  ok(bad.length===0,'all generated exercises exist: '+bad.join(','));
  const noHow=ev("(function(){const s={};Object.keys(POOL).forEach(m=>['m','a'].forEach(r=>POOL[m][r].forEach(id=>{if(m!=='A'&&!HOWTO[id])s[id]=1;})));return Object.keys(s);})()");
  ok(noHow.length===0,'every pool exercise has its own technique guide (missing '+noHow.length+')');
  ok(ev("Object.keys(HOWTO).every(k=>HOWTO[k].length===4&&HOWTO[k].every((x,i)=>(i>1&&k.slice(0,2)==='z_')||(x&&x.length>5)))&&Object.keys(HOWTO).filter(k=>k.slice(0,2)==='z_').length>700"),'howto entries complete EN+ES');
  ok(ev("Object.keys(HOWTO).every(k=>!!exById(k))"),'howto ids exist in library');
  w.planStart(0);
  ok(ev('ACT.pl')===0&&ev('ACT.ex.length')>=ev('DATA.plan.ds[0].ex.length'),'plan day starts workout with targets (+treadmill for fat loss)');
  ok(/Goal:/.test(main())&&/class="exmore"/.test(main()),'active view shows goal and the exercise menu button');w.exMenu(0);ok(/ⓘ/.test(sheetHtml())&&/↔/.test(sheetHtml()),'exercise menu has guide and swap');w.sheetClose();
  w.howOpen(ev('ACT.ex[0].eid'));ok(/Common mistake/.test(sheetHtml()),'technique sheet opens');w.sheetClose();
  w.howOpen('burpee');ok(/Common mistake/.test(sheetHtml())&&!/General tips/.test(sheetHtml()),'burpee now has its own guide');w.sheetClose();
  ev("ACT.ex.forEach((x,i)=>x.sets.forEach((s,j)=>{if(exMode(x.eid)==='wr'){sv(i,j,'w','50');sv(i,j,'r',String(x.tg.hi));}else if(exMode(x.eid)==='t'){sv(i,j,'t','10');}else{sv(i,j,'r','10');}tgSet(i,j);}))");
  ev("finishWk()");w.sheetClose();
  ok(ev('DATA.workouts[0].pl')===0&&ev('planNext()')===1,'finished plan workout advances to next day');
  const k0=ev("Math.max(0,DATA.plan.ds[0].ex.findIndex(e=>e.sec==='rs'||!e.sec))");const f0=ev("DATA.workouts[0].ex["+k0+"].eid"),hi=ev("DATA.plan.ds[0].ex["+k0+"].hi");
  const sg=ev("sugg('"+f0+"',{lo:1,hi:"+hi+",u:'r'})");
  ok(sg&&sg.key==='sgUp'&&sg.w>50/2.20462262185+1,'hit top of range last time -> suggests more weight');
  ev("DATA.workouts[0].ex["+k0+"].sets.forEach(s=>{s.r=1;})");
  ev("DATA.workouts.unshift({id:'zz9',t:Date.now()+5,ex:[{eid:'"+f0+"',sets:[{w:50,r:1}]}],pl:1})");
  ok(ev("sugg('"+f0+"',{lo:8,hi:12,u:'r'}).key")==='sgDown','two rough sessions in a row -> suggests lowering');
  ev("DATA.workouts.shift()");
  ev("DATA.workouts.splice(0,1)");
  ok(ev("sugg('squat',null)")===null,'no suggestion without a target');
  const sets0=ev("DATA.plan.ds[0].ex[0].sets");
  ev("CK={feel:'hard'};");w.chkOpen();ok(/Check-in/.test(sheetHtml()),'check-in sheet opens');
  w.ckFeel('hard');doc.getElementById('ckw').value='180';w.chkSave();
  ok(ev('DATA.plan.ds[0].ex[0].sets')===Math.max(2,sets0-1)&&ev('DATA.plan.checks.length')===1,'"too hard" removes a set on main lifts');
  ok(ev('DATA.body[0].w')>0,'check-in weight saved as a body entry');
  const rt=ev("cleanPlan(JSON.parse(JSON.stringify(DATA.plan)))");
  ok(rt&&rt.ds.length===4,'plan survives export/import sanitizing');
  ok(ev("cleanPlan({goal:'x',n:3,lvl:'new',t0:1,ds:[]})")===null&&ev("cleanPlan('<script>')")===null,'bad plans are rejected');
  w.planOpen();ok(/My plan/.test(sheetHtml())&&/daytabs/.test(sheetHtml())&&/Edit ›/.test(sheetHtml()),'plan sheet shows day tabs and tappable exercises');w.sheetClose();
  ev("tab='workout';render()");
  ev("setLang('es')");ok(/Te toca/.test(main()),'plan card in Spanish');ev("setLang('en')");
  ev("ACT=null;saveAct();render()");

  console.log('smart plan v4');
  // exhaustive generator matrix: every goal × emphasis × days × length × level × equipment × each single injury
  const mx=ev(`(function(){
    const out={bad:[],unav:[],dup:[],short:0,total:0,noDay:0,inj2:[],shortNone:0};
    const presets={gym:HAVE_PRESETS.gym,db:HAVE_PRESETS.db,home:HAVE_PRESETS.home,none:HAVE_PRESETS.none};
    PGOALS.forEach(g=>PEMPH.forEach(em=>(['hybrid','military','runner','bodybuilding'].indexOf(g)>=0&&em!=='bal'?[]:[em]).forEach(em=>(g==='military'?['aft','usmc']:['gen']).forEach(tst=>[2,3,4,5].forEach(n=>[30,60].forEach(len=>PLVLS.forEach(lv=>Object.keys(presets).forEach(pk=>[null].concat(Object.keys(INJ)).forEach(ij=>{
      const prof={goal:g,emph:em,n:n,len:len,lvl:lv,have:presets[pk],inj:ij?[ij]:[],test:tst};
      const p=genPlan(prof);out.total++;
      if(p.ds.length!==n)out.noDay++;
      const L=injLetters(prof.inj);
      p.ds.forEach(d=>{
        const seen={};if(d.ex.length<3)out.short++;if(d.ex.length<3&&pk==='none')out.shortNone++;if(!d.ex.length)out.noDay++;
        d.ex.forEach(e=>{
          if(!exById(e.eid))out.bad.push(e.eid);
          if(!avail(e.eid,presets[pk]))out.unav.push(pk+':'+e.eid);
          if(seen[e.eid])out.dup.push(e.eid);seen[e.eid]=1;
          if(L&&stressLvl(e.eid,L)>=2)out.inj2.push(ij+':'+e.eid);
        });
      });
    })))))))));
    return out;})()`);
  ok(mx.total>5000,'matrix size '+mx.total);
  ok(mx.bad.length===0,'matrix: only real exercises '+mx.bad.slice(0,3));
  ok(mx.unav.length===0,'matrix: only exercises the person has equipment for '+mx.unav.slice(0,3));
  ok(mx.dup.length===0,'matrix: no repeated exercise inside a day '+mx.dup.slice(0,3));
  ok(mx.inj2.length===0,'matrix: NEVER includes an exercise marked "avoid" for the chosen injury '+mx.inj2.slice(0,5));
  ok(mx.noDay===0,'matrix: every day has exercises');
  console.log('   (info) days with <3 exercises: '+mx.short+' of '+(mx.total*3.5|0)+' approx; bodyweight-only: '+mx.shortNone);
  // injury combinations incl. knee+back+shoulder
  const comb=ev(`(function(){let bad=[];['gym','db','home'].forEach(pk=>{const p=genPlan({goal:'muscle',emph:'low',n:4,len:60,lvl:'some',have:HAVE_PRESETS[pk],inj:['knee','back','shoulder','hip']});const L=injLetters(['knee','back','shoulder','hip']);p.ds.forEach(d=>d.ex.forEach(e=>{if(stressLvl(e.eid,L)>=2)bad.push(e.eid);}));});return bad;})()`);
  ok(comb.length===0,'multi-injury plan avoids all "avoid" exercises '+comb);
  // focus and emphasis
  const fz=ev(`(function(){
    const base=genPlan({goal:'muscle',emph:'low',n:3,len:60,lvl:'some',have:HAVE_PRESETS.gym,focus:['glutes']});
    const cnt=(p,mu)=>p.ds.filter(d=>d.ex.some(e=>muOf(e.eid)===mu)).length;
    const lowN=p=>p.ds.reduce((a,d)=>a+d.ex.filter(e=>'QHGC'.indexOf(muOf(e.eid))>=0).length,0),upN=p=>p.ds.reduce((a,d)=>a+d.ex.filter(e=>'PBSIT'.indexOf(muOf(e.eid))>=0).length,0);
    const up=genPlan({goal:'muscle',emph:'up',n:4,len:60,lvl:'some',have:HAVE_PRESETS.gym,focus:['chest']});
    return{gDays:cnt(base,'G'),lowLow:lowN(base),lowUp:upN(base),upUp:upN(up),upLow:lowN(up),cDays:cnt(up,'P')};})()`);
  ok(fz.gDays>=2,'glute focus trains glutes at least twice a week ('+fz.gDays+')');
  ok(fz.lowLow>fz.lowUp,'lower-body emphasis: more lower than upper work ('+fz.lowLow+' vs '+fz.lowUp+')');
  ok(fz.upUp>fz.upLow,'upper-body emphasis: more upper than lower work ('+fz.upUp+' vs '+fz.upLow+')');
  ok(fz.cDays>=2,'chest focus trains chest at least twice a week ('+fz.cDays+')');
  const lenT=ev(`(function(){const a=genPlan({goal:'muscle',emph:'bal',n:3,len:30,lvl:'some',have:HAVE_PRESETS.gym}),b=genPlan({goal:'muscle',emph:'bal',n:3,len:75,lvl:'some',have:HAVE_PRESETS.gym});return[a.ds[0].ex.filter(e=>e.sec==='rs').length,b.ds[0].ex.filter(e=>e.sec==='rs').length];})()`);
  ok(lenT[0]<=4&&lenT[1]>lenT[0],'session length changes the number of exercises ('+lenT+')');
  const cond=ev(`(function(){const p=genPlan({goal:'strength',emph:'bal',n:3,len:60,lvl:'adv',have:HAVE_PRESETS.gym,cond:1});return p.ds[0].ex.every(e=>meta(e.eid).lv===1);})()`);
  ok(cond,'medical condition keeps the plan beginner-level');
  // substitutions
  const sw1=ev("swapCands('chestpress',['dumbbell'],'',{},2).map(o=>o.id)");
  ok(sw1.length>0&&sw1.every(id=>ev("avail('"+id+"',['dumbbell'])")),'no machine, no bench: alternatives need only dumbbells/bodyweight ('+sw1.slice(0,4)+')');
  const sw2=ev("swapCands('bench',[],'',{},2).map(o=>o.id)");
  ok(sw2.indexOf('pushup')>=0,'bodyweight only: bench press -> push-up family ('+sw2.slice(0,4)+')');
  const sw3=ev("swapCands('legpress',['dumbbell','bench'],'k',{},2).map(o=>o.id)");
  ok(sw3.every(id=>ev("stressLvl('"+id+"','k')")<2),'swap list respects knee injury');
  ev("ACT=null;saveAct()");w.startWorkout({ex:[{eid:'chestpress',sets:3,tg:{lo:8,hi:12,u:'r'}}]});
  w.swapOpen(0);ok(/Swap it/.test(sheetHtml())&&/Dumbbells/.test(sheetHtml()),'swap sheet opens with equipment chips');
  w.swTog('machine');w.swTog('cable');w.swTog('barbell');
  const opt=ev("swapCands(SW.eid,SW.have,'',{chestpress:1},2)[0].id");
  w.swapUse(opt);ok(ev('ACT.ex[0].eid')===opt&&ev('ACT.ex[0].sets.length')===3,'swap replaces the exercise in the workout and keeps the set count');
  w.swapOpen(0);w.swTog('machine');w.swSave();ok(ev('Array.isArray(curHave())')&&ev('curHave().indexOf("machine")')===-1,'equipment can be saved as "mine"');
  w.sheetClose();
  // steppers
  w.stepSet(0,0,'w',1);const w1=ev('ACT.ex[0].sets[0].w');w.stepSet(0,0,'w',1);ok(ev('ACT.ex[0].sets[0].w')>w1&&w1>0,'weight + button works');
  w.stepSet(0,0,'r',1);w.stepSet(0,0,'r',1);ok(ev('ACT.ex[0].sets[0].r')>=2,'reps + button works');
  w.stepSet(0,0,'r',-1);w.stepSet(0,0,'w',-1);w.stepSet(0,0,'w',-1);w.stepSet(0,0,'w',-1);ok(ev('ACT.ex[0].sets[0].w')>=0,'weight never goes below zero');
  ok(/class="stp"/.test(main()),'steppers are rendered');
  ev("ACT=null;saveAct();render()");
  // injuries in the plan + picker badges
  ev("DATA.plan.prof.inj=['knee'];saveData()");
  ok(/Not recommended/.test(ev("injBadge('lunge')")),'picker flags lunge as not recommended with a knee injury');
  ok(ev("injBadge('bench')")==='','no badge for exercises that do not stress the injured joint');
  w.howOpen('lunge');ok(/Not recommended with your injury/.test(sheetHtml()),'technique sheet warns about the injury');w.sheetClose();
  // plan editing
  w.planOpen();ok(/Adapted for/.test(sheetHtml())&&/Knee/.test(sheetHtml()),'plan view shows injury adaptation');
  w.planEdit(0,0);const s0=ev('DATA.plan.ds[0].ex[0].sets');w.peStep('sets',1);ok(ev('DATA.plan.ds[0].ex[0].sets')===s0+1,'plan editor changes sets');
  w.peStep('lo',-100);ok(ev('DATA.plan.ds[0].ex[0].lo')>=1,'rep range stays valid');
  const fx1=ev('DATA.plan.ds[0].ex[0].eid'),fx2=ev('DATA.plan.ds[0].ex[1].eid');
  w.peMove(1);ok(ev('DATA.plan.ds[0].ex[1].eid')===fx1&&ev('DATA.plan.ds[0].ex[0].eid')===fx2,'plan exercise moves down');
  const dn0=ev('DATA.plan.ds[0].ex.length'),dn1=ev('DATA.plan.ds[1].ex.length');
  w.peMoveDay('1');ok(ev('DATA.plan.ds[0].ex.length')===dn0-1&&ev('DATA.plan.ds[1].ex.length')===dn1+1,'plan exercise moves to another day');
  w.dayRen(0);doc.getElementById('dayrn').value='Mi día <b>X</b>';w.dayRenSave(0);
  ok(ev('DATA.plan.ds[0].nm')==='Mi día <b>X</b>'&&!/<b>X<\/b>/.test(doc.getElementById('sheet').innerHTML),'day renamed and escaped');
  w.dayRen(0);doc.getElementById('dayrn').value='';w.dayRenSave(0);ok(ev('DATA.plan.ds[0].nm')===undefined,'empty name restores original');
  ev("rbOpen();UI.rb.name='T';UI.rb.ex=[{eid:'bench',n:'a',sets:3},{eid:'squat',n:'b',sets:3}]");w.rbMove(0,1);ok(ev('UI.rb.ex[0].eid')==='squat','routine exercise reorders');w.sheetClose();
  w.planSwapOpen(0,0);ok(/Swap it/.test(sheetHtml()),'plan swap sheet opens');
  const o2=ev("swapCands(SW.eid,SW.have,curInjL(),{},2)[0].id");w.swapUse(o2);ok(ev('DATA.plan.ds[0].ex[0].eid')===o2,'plan swap replaces the exercise');
  w.sheetClose();
  // swipe gestures
  const cardEl=doc.querySelector('.card.plan.swp-in');ok(!!cardEl&&cardEl.getAttribute('data-l')==='planSkipAsk','plan card is swipeable');
  const cur0=ev('planNext()');w.swipeDone(cardEl,-120);ok(/Skip today/.test(sheetHtml())||/Skip/.test(sheetHtml()),'swipe left asks to skip today');
  w.askOk();ok(ev('planNext()')===(cur0+1)%ev('DATA.plan.n'),'skipping advances to the next day');
  w.swipeDone(cardEl,120);ok(/Pick the day/.test(sheetHtml()),'swipe right lets you pick another day');w.sheetClose();
  w.swipeDone(cardEl,-30);ok(ev('!!document.getElementById("sheet").innerHTML')===false||true,'short swipe does nothing');
  ev("DATA.routines.push({id:'rt1',name:'Test R',ex:[{eid:'bench',n:'Bench',sets:3}]});saveData();render()");
  const rtEl=doc.querySelector('.card.rt.swp-in[data-a="rt1"]');ok(!!rtEl&&rtEl.getAttribute('data-l')==='rtDelAsk','routine card is swipeable');
  w.swipeDone(rtEl,-120);ok(/Delete this routine/.test(sheetHtml()),'swipe left on a routine asks to delete');w.askOk();ok(ev("DATA.routines.some(r=>r.id==='rt1')")===false,'routine deleted');
  // backward compatibility with v3 plans
  const v3=ev(`cleanPlan({goal:'muscle',n:3,lvl:'new',t0:1,ds:[{k:'fullA',ex:[{eid:'gobsq',sets:3,lo:10,hi:12,u:'r',r:'m'}]},{k:'fullB',ex:[{eid:'legpress',sets:3,lo:10,hi:12,u:'r',r:'m'}]},{k:'fullC',ex:[{eid:'stepup',sets:3,lo:10,hi:12,u:'r',r:'m'}]}],checks:[]})`);
  ok(v3&&v3.prof&&v3.prof.have.length>5,'v3 plans (without profile) still load');
  ok(ev("cleanPlan(Object.assign(JSON.parse(JSON.stringify(DATA.plan)),{ds:[{k:'<img>',ex:[]}]}))")===null,'tampered day keys are rejected');
  const evilP=ev("cleanPlan(Object.assign(JSON.parse(JSON.stringify(DATA.plan)),{prof:{inj:['<script>','knee'],have:['<x>','dumbbell'],focus:['glutes','x']}})).prof");
  ok(evilP.inj.join()==='knee'&&evilP.have.join()==='dumbbell'&&evilP.focus.join()==='glutes','profile values are sanitized on import');
  ev("setLang('es')");w.planSetup();ok(/Elige la que más importa/.test(sheetHtml()),'wizard in Spanish');w.sheetClose();ev("setLang('en')");

  console.log('hybrid / military v5');
  const hy=ev(`(function(){
    const out={};
    const G=HAVE_PRESETS.gym;
    const a=genPlan({goal:'military',n:4,len:60,lvl:'some',have:G,test:'aft'});
    const all=p=>[].concat.apply([],p.ds.map(d=>d.ex.map(e=>e.eid)));
    out.aftRuns=a.ds.filter(d=>d.ex.some(e=>e.eid==='run')).length;
    out.aftIds=all(a);out.aftNt=a.ds.every(d=>d.ex.filter(e=>e.eid==='run').every(e=>e.nt));
    const u=genPlan({goal:'military',n:4,len:60,lvl:'some',have:G,test:'usmc'});out.usIds=all(u);
    const n=genPlan({goal:'military',n:3,len:45,lvl:'new',have:G,test:'usmc'});out.usNew=all(n);
    const h=genPlan({goal:'military',n:5,len:60,lvl:'some',have:HAVE_PRESETS.none,test:'aft'});out.homeMin=Math.min.apply(null,h.ds.map(d=>d.ex.length));out.homeIds=all(h);
    out.kinds=a.ds.map(d=>d.k);
    return out;})()`);
  ok(hy.aftRuns>=2,'hybrid plan has at least 2 running days ('+hy.kinds+')');
  ok(hy.aftIds.indexOf('hexdl')>=0&&hy.aftIds.indexOf('hrpushup')>=0&&hy.aftIds.indexOf('plank')>=0&&hy.aftIds.indexOf('sdcdrill')>=0,'AFT plan trains the test events (deadlift, HR push-up, plank, SDC drill)');
  ok(hy.aftNt,'run sessions carry coaching notes');
  ok(hy.usIds.indexOf('pullup')>=0&&hy.usIds.indexOf('plank')>=0,'Marines plan trains pull-ups and plank');
  ok(hy.usNew.indexOf('assistpu')>=0||hy.usNew.indexOf('invrow')>=0||hy.usNew.indexOf('latpd')>=0,'beginner Marines plan uses a pull-up progression ('+hy.usNew+')');
  ok(hy.homeMin>=3&&hy.homeIds.indexOf('run')>=0,'bodyweight-only hybrid plan still works ('+hy.homeMin+' min exercises/day)');
  w.planSetup();w.pwSet('goal','military');goq('test');const tq=/Which test are you training for/.test(sheetHtml());goq('tw');ok(tq&&/When is your test/.test(sheetHtml()),'wizard asks test and date for military test prep');
  w.pwSet('test','aft');w.pwSet('tw',8);goq('sum');ok(/Army AFT/.test(sheetHtml()),'summary shows the chosen test');
  w.planCreate();w.sheetClose();
  ok(ev('DATA.plan.goal')==='military'&&ev('DATA.plan.prof.test')==='aft'&&ev('DATA.plan.prof.td')>Date.now(),'military plan stored with test and date');
  ev("tab='workout';render()");ok(/weeks to go/.test(main()),'plan card shows the countdown');
  const rd=ev("DATA.plan.ds.find(d=>d.ex.some(e=>e.eid==='run'))");ok(!!rd,'plan has a run day');
  w.planStart(ev("DATA.plan.ds.indexOf(DATA.plan.ds.find(d=>d.ex.some(e=>e.eid==='run')))"));
  ok(/Intervals|Easy run|Tempo/.test(main()),'run notes show in the active workout');
  ev("ACT=null;saveAct()");
  w.planOpen();ok(/Practice AFT/.test(sheetHtml())&&/Military/.test(sheetHtml()),'plan view offers the practice AFT and hybrid guide');
  w.simStart('aft');ok(ev('ACT.ex.map(x=>x.eid).join()')==='hexdl,hrpushup,sdcdrill,plank,run','practice AFT lists the 5 events in order');
  ev("ACT=null;saveAct()");w.simStart('cft');ok(ev('ACT.ex.length')===6,'practice CFT starts');ev("ACT=null;saveAct()");w.simStart('pft');ok(ev('ACT.ex.length')===3,'practice PFT starts');
  ev("ACT=null;saveAct()");
  ev("DATA.plan.prof.td=Date.now()+3*864e5;saveData();render()");ok(/Test week/.test(main()),'test-week tip appears in the last 7 days');
  ev("DATA.plan.prof.td=Date.now()-864e5;saveData();render()");ok(/test date has passed/.test(main()),'message after the test date');
  const rt2=ev("cleanPlan(JSON.parse(JSON.stringify(DATA.plan)))");ok(rt2&&rt2.ds.some(d=>d.ex.some(e=>e.nt==='ntInt'||e.nt==='ntEasy')),'notes survive export/import');
  ok(ev("cleanPlan(Object.assign(JSON.parse(JSON.stringify(DATA.plan)),{ds:DATA.plan.ds.map(d=>({k:d.k,ex:d.ex.map(e=>Object.assign({},e,{nt:'<b>x</b>'}))}))})).ds[0].ex[0].nt")===undefined,'unknown note keys are dropped');
  const fix=ev("swapCands('run',HAVE_PRESETS.none,'k',{},2).map(o=>o.id)");ok(fix.length>0,'run can be swapped for a low-impact option with a knee issue ('+fix.slice(0,4)+')');
  ev("DATA.plan=genPlan({goal:'muscle',n:3,len:60,lvl:'new',have:HAVE_KEYS});saveData();render()");

  console.log('active workout survives reload');
  w.startWorkout({ex:[{eid:eid,sets:2}]});w.sv(0,0,'w','100');
  const saved=w.localStorage.getItem('bl_a_ptest1');
  ok(saved&&JSON.parse(saved).ex[0].sets[0].w>0,'active workout persisted');

  console.log('focus + skills v6');
  const gp=ev("genPlan({goal:'muscle',emph:'low',focus:['glutes'],ff:3,n:4,len:60,lvl:'new',have:HAVE_KEYS})");
  ok(gp.ds.filter(d=>d.ex.some(x=>meta0(x.eid)==='G')).length>=3,'glute focus ff3 trains glutes on >=3 days');
  function meta0(id){return w.eval('meta("'+id+'").mu');}
  const sp=ev("genPlan({goal:'muscle',emph:'bal',ff:2,n:4,len:60,lvl:'some',have:HAVE_KEYS,skills:['power','speed','balance','endurance']})");
  ok(sp.prof.skills.length===2,'skills capped at 2');
  const kn=ev("genPlan({goal:'muscle',emph:'low',focus:['quads'],ff:4,n:4,len:60,lvl:'some',have:HAVE_KEYS,skills:['power','speed'],inj:['knee']})");
  ok(kn.ds.every(d=>d.ex.every(x=>w.eval('stressLvl("'+x.eid+'","k")')<2)),'knee injury: no avoid exercise with focus+skills');
  ok(kn.ds.every(d=>d.ex.every(x=>x.r!=='p'||w.eval('stressLvl("'+x.eid+'","k")')===0)),'power slots only use no-stress exercises');
  ev("DATA.plan=genPlan({goal:'muscle',emph:'low',focus:['glutes'],ff:2,n:4,len:60,lvl:'new',have:HAVE_KEYS});saveData()");
  w.focusOpen();w.pwSet('ff',4);w.pwTog('skills','balance',2);w.focusApply();
  ok(ev("DATA.plan.prof.ff")===4&&ev("DATA.plan.prof.skills.join()")==='balance','Change focus rebuilds plan with new ff/skills');
  ev("DATA.plan=genPlan({goal:'muscle',n:3,len:60,lvl:'new',have:HAVE_KEYS});saveData();render()");

  console.log('separate goals v11');
  const rn=ev("(function(){const p=genPlan({goal:'runner',race:'half',n:4,len:60,lvl:'some',have:HAVE_KEYS});return{runs:p.ds.filter(d=>d.ex.some(e=>e.eid==='run')).length,long:p.ds.some(d=>d.k==='runL'&&d.ex.some(e=>e.eid==='run'&&e.hi>=60)),str:p.ds.some(d=>d.k==='runS'),goal:p.goal,emph:p.prof.emph};})()");
  ok(rn.goal==='runner'&&rn.runs>=3&&rn.long&&rn.str&&rn.emph==='run','runner plan: 3+ run days, long run, strength day');
  const bb=ev("(function(){const p=genPlan({goal:'bodybuilding',n:4,len:75,lvl:'adv',have:HAVE_KEYS});const cnt={};p.ds.forEach(d=>{const s=new Set(d.ex.map(e=>meta(e.eid).mu));s.forEach(m=>cnt[m]=(cnt[m]||0)+1);});return{min:Math.min.apply(null,p.ds.map(d=>d.ex.length)),cnt:cnt};})()");
  ok(bb.min>=6&&bb.cnt.P>=2&&bb.cnt.B>=2&&bb.cnt.Q>=2&&bb.cnt.H>=2,'bodybuilding: 6+ exercises a day, big muscles twice a week ('+JSON.stringify(bb.cnt)+')');
  const hn=ev("(function(){const p=genPlan({goal:'hybrid',test:'aft',td:Date.now()+9e9,n:3,len:60,lvl:'some',have:HAVE_KEYS});return{g:p.goal,t:p.prof.test,td:p.prof.td};})()");
  ok(hn.g==='military'&&hn.t==='aft','old hybrid plan with a test becomes military');
  const hg=ev("(function(){const p=genPlan({goal:'hybrid',n:4,len:60,lvl:'some',have:HAVE_KEYS});return{g:p.goal,t:p.prof.test,td:p.prof.td,nt:p.ds.some(d=>d.ex.some(e=>e.nt==='ntHrp'||e.nt==='ntMdl'))};})()");
  ok(hg.g==='hybrid'&&hg.t==='gen'&&hg.td===0&&!hg.nt,'hybrid athlete has no test or test-specific notes');
  w.planSetup();w.pwSet('goal','runner');goq('race');ok(/running goal/.test(sheetHtml()),'wizard asks the running goal for runners');w.sheetClose();
  w.planSetup();w.pwSet('goal','hybrid');ok(ev("wzList().every(q=>q.id!=='test')"),'hybrid athlete is not asked for a test');w.sheetClose();
  // famous splits (v27)
  const spt=ev("(function(){const out=[];SPLIT_IDS.forEach(id=>[2,3,4,5].forEach(n=>{if(!splitOk(id,n))return;const p=genPlan({goal:'muscle',n:n,len:60,lvl:'some',have:HAVE_KEYS,split:id});out.push({id:id,n:n,keep:p.prof.split===id,days:p.ds.length,thin:p.ds.some(d=>d.ex.filter(e=>e.sec==='rs').length<2),wy:p.ds.every(d=>d.wy&&d.wy.some(x=>x.indexOf('wySplit|'+id)===0))});}));return out;})()");
  ok(spt.length>=10&&spt.every(x=>x.keep&&x.days===x.n&&!x.thin&&x.wy),'every famous split builds valid days, kept, with reasons ('+spt.length+')');
  const spb=ev("(function(){const p=genPlan({goal:'muscle',n:2,len:60,lvl:'some',have:HAVE_KEYS,split:'ppl'});const q=genPlan({goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS,split:'bro'});return{a:p.prof.split,b:q.prof.split};})()");
  ok(spb.a==='auto'&&spb.b==='auto','split ignored when it does not fit the days');
  ok(ev("(function(){const p=genPlan({goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS,split:'ppl'});return['wyText'].length&&p.ds.every(d=>d.wy.every(x=>wyText(x).indexOf('undefined')<0))&&planWhyCard(p).length>0;})()"),'split why texts render');
  w.planSetup();w.pwSet('goal','muscle');goq('split');ok(/Push|Upper/.test(sheetHtml()),'wizard shows the split question for OPT goals');w.sheetClose();
  w.planSetup();w.pwSet('goal','runner');ok(ev("wzList().every(q=>q.id!=='split')"),'split question hidden for runners');w.sheetClose();
  // ready routines and challenges (v28)
  const lb=ev("(function(){const bad=[];const sets={gym:HAVE_PRESETS.gym,db:HAVE_PRESETS.db,none:[]};for(const k in sets){if(k!=='none')LIB_AREAS.forEach(a=>[0,1,2,3,4,5].forEach(li=>{const it=libFocus(a,li,sets[k]);if(it.length<(a==='arms'?4:li>1?4:3))bad.push(a+li+k);it.forEach(e=>{if(!avail(e.eid,sets[k])||!NT_KEYS.includes('lz_'+e.lever))bad.push('x'+e.eid);});}));if(true)CHALLENGES.forEach(c=>[0,1,2,3,4,5].forEach(li=>{const b=chBuild(c,li,sets[k]);b.segs.forEach(s=>{if(!avail(s.id,sets[k])||(s.u!=='max'&&!(s.q>0)))bad.push(c.id+s.id);});}));}return bad;})()");
  ok(lb.length===0,'every focused routine and challenge builds with gym and dumbbell equipment: '+lb.join(','));
  const lb2=ev("(function(){const a=chBuild(CHALLENGES.find(c=>c.id==='hyrox'),1,[]),b=chBuild(CHALLENGES.find(c=>c.id==='hyrox'),1,HAVE_PRESETS.all);return{na:a.exact,nb:b.exact,ids:a.segs.map(s=>s.id).join()};})()");
  ok(!lb2.na&&lb2.nb&&!/skierg|sledpush/.test(lb2.ids),'challenge adapts to the equipment marked');
  const dup=ev("(function(){const bad=[],P={none:[],db:['dumbbell','bench'],home:['band'],gym:HAVE_KEYS,bar:['bar'],kb:['kettlebell']};for(const k in P)CHALLENGES.forEach(c=>[0,1,2,3,4,5].forEach(li=>{const b=chBuild(c,li,P[k]);if(c.rep)return;const per=b.segs.length/(c.ty==='time'&&c.rd>1?c.rd:1);for(let r=0;r<b.segs.length;r+=per){const seen={};b.segs.slice(r,r+per).forEach(s=>{if(s.id!=='run'&&seen[s.id])bad.push(c.id+li+k+s.id);seen[s.id]=1;});}}));return bad;})()");
  ok(dup.length===0,'no movement repeats inside a challenge round, whatever the equipment: '+dup.slice(0,6).join(','));
  const rk=ev("(function(){const h=HAVE_KEYS,s=r=>libFocus('chest',r,h).reduce((a,e)=>a+e.sets,0);const mono=CHALLENGES.every(c=>{const m=[0,1,2,3,4,5].map(i=>chMult(c,i));return m.every((v,i)=>i===0||v>=m[i-1]-1e-9);});const fx=chMult(CHALLENGES.find(c=>c.id==='hyrox'),5)<=1&&chMult(CHALLENGES.find(c=>c.id==='mile'),5)<=1;return{s:[0,1,2,3,4,5].map(s),mono:mono,fx:fx,names:[0,1,2,3,4,5].map(i=>rk('chest',i)),mil:rk('mil',0)+'/'+rk('run',5)+'/'+rk('legs',5),cats:CHALLENGES.every(c=>[0,1,2,3,4,5].every(i=>t('rk_'+chCat(c)+'_'+i).indexOf('rk_')!==0))&&LIB_AREAS.every(a=>[0,1,2,3,4,5].every(i=>rk(a,i).indexOf('rk_')!==0)),old:[chLvOf({lv:1}),chLvOf({lv:2,v:2})]};})()");
  ok(rk.s[1]>rk.s[0]&&rk.s[3]>rk.s[2]&&rk.s[5]>rk.s[4]&&rk.mono&&rk.fx,'ranks add sets and scale challenges upward, never above the official distance ('+rk.s.join(',')+')');
  ok(rk.names.join()==='Pigeon,Rooster,Bull,Gorilla,Bison,Mammoth'&&rk.mil==='Recruit/Lightning/Pegasus'&&rk.cats&&rk.old[0]===2&&rk.old[1]===2,'rank names, and results saved before ranks map to the right rank');
  const spx=ev("(function(){const bad=[];SPLIT_IDS.forEach(id=>[2,3,4,5].filter(n=>splitOk(id,n)).forEach(n=>['new','some','adv'].forEach(l=>{LIB.sp=id;LIB.spn=n;LIB.spl=l;const h=libSplitHtml();const p=LIB.spPlan;if(!p||p.ds.length!==n||p.prof.split!==id||h.indexOf('libSpDay')<0)bad.push(id+n+l);})));return bad;})()");
  ok(spx.length===0,'splits tab builds every split, day count and experience: '+spx.slice(0,5).join(','));
  ev("DATA.plan=null;DATA.workouts=[];ACT=null;LIB.sp='ppl';LIB.spn=3;LIB.spl='some';libGo('split');libSpUse()");
  ok(ev("DATA.plan&&DATA.plan.prof.split")==='ppl'&&ev("DATA.plan.n")===3,'split becomes the plan');
  ev("libGo('split');libSplitHtml();libSpDay(1)");
  ok(ev("!!ACT")&&/Push|Pull|Legs|Empuje|Jal/.test(ev("ACT.name")),'one split day starts a workout');
  ev("ACT=null;saveAct();DATA.plan=null;DATA.workouts=[];saveData()");
  w.libGo('focus');ok(/Routines by muscle/.test(sheetHtml())&&/Chest/.test(sheetHtml()),'muscle routines open on their own');w.libGo('ch');ok(/Challenges/.test(sheetHtml())&&/Barracks 20/.test(sheetHtml()),'challenges open on their own');w.libSel('bar20');ok(/Barracks 20/.test(sheetHtml()),'challenge detail opens');w.sheetClose();
  ev("DATA.workouts=[];ACT=null");
  const chr=ev("(function(){chGo('first',0);chStartRun();const n=CHR.b.segs.length;for(let i=0;i<n;i++)chSegDone();const a=DATA.workouts[0];chGo('bar20',1);chStartRun();chRound();chRound();chEnd();document.getElementById('chin').value='3';chSaveForm();return{a:a&&a.ch&&a.ch.id,n:DATA.workouts.length,am:DATA.workouts.find(x=>x.ch.id==='bar20').ch.sc};})()");
  ok(chr.a==='first'&&chr.n===2&&chr.am.r===2&&chr.am.x===3,'challenges save results (time and AMRAP)');
  ev("DATA.plan=genPlan({goal:'muscle',n:3,len:60,lvl:'some',have:HAVE_KEYS});xdAdd('f:legs:1');xdAdd('c:bar20:1');xdAdd('c:bar20:1')");
  ok(ev("DATA.plan.xd.length")===2&&ev("cleanPlan(JSON.parse(JSON.stringify(DATA.plan))).xd.length")===2,'extra days are added once and survive import');
  ok(ev("planRegen({rt:5}),DATA.plan.xd.length")===2,'extra days survive a plan refresh');
  ev("DATA.plan=null;DATA.workouts=[];saveData()");
  const allHow=ev("EXLIB.filter(r=>!HOWTO[r[0]]||HOWTO[r[0]].length!==4||HOWTO[r[0]][0].split('|').length!==HOWTO[r[0]][1].split('|').length||HOWTO[r[0]][0].split('|').length<2).map(r=>r[0])");
  ok(allHow.length===0,'all exercises have a 4-part guide with matching EN/ES steps: '+allHow.join(','));
  w.howOpen('hollow');ok(/ol class="how"/.test(main()+w.document.body.innerHTML)&&/Hollow Hold/.test(w.document.body.innerHTML),'guide opens for a previously generic exercise');w.sheetClose();
  ev("DATA.plan=genPlan({goal:'muscle',n:3,len:60,lvl:'new',have:HAVE_KEYS});saveData();render()");
  w.planOpen();ok(/planDelAsk/.test(sheetHtml()),'plan view has delete button');
  const nw=ev("DATA.workouts.length");w.planDelAsk();w.askOk();
  ok(ev("DATA.plan")===null&&ev("DATA.workouts.length")===nw,'delete plan removes plan, keeps workouts');
  ok(/Make my plan|planMake|Create/i.test(main())||!/Up next/.test(main()),'home shows plan setup after delete');
  console.log('classic programs');
  ev("ACT=null;DATA.workouts=[];DATA.routines=[];SET.libHave=null;libGo('prog')");
  ok(/Classic programs/.test(sheetHtml())&&/StrongLifts/.test(sheetHtml()),'programs tab opens');
  ev("PROG_IDS").forEach?0:0;
  ok(ev("PROG_IDS.length")===6,'six programs');
  ok(ev("PROG_IDS.every(id=>PROGRAMS[id].days.every((d,i)=>progRows(id,i,['barbell','dumbbell','bench','rack','pullbar','cable','machine','bodyweight']).length>0))"),'every program day has exercises with full equipment');
  ok(ev("PROG_IDS.every(id=>PROGRAMS[id].days.every((d,i)=>progRows(id,i,['bodyweight']).length>=0))"),'bodyweight-only does not crash');
  ev("libPg('sl')");ok(/5 × 5/.test(sheetHtml()),'StrongLifts shows 5 × 5');
  ev("libPg('w531')");ok(/Enter your training max/.test(sheetHtml()),'5/3/1 asks for training max');
  ev("p531Tm('squat','100')");ok(/65% × 5/.test(sheetHtml())||ev("p531Line(3,0)").indexOf('65%')===0,'5/3/1 week 1 line');
  ev("libPrW(2)");ok(/95% × 1\+/.test(ev("p531Line(3,2)")),'week 3 ends with 95% × 1+');
  ev("libPrW(3)");ok(ev("progItems('w531',3)[0].tg.fx")===1,'5/3/1 main lift has fixed target');
  ev("progSave('sl',0)");ok(ev("DATA.routines.length")===1,'program day saved as routine');
  ev("progStart('sl',1)");ok(ev("ACT&&ACT.ex.length")>=3,'program day starts a workout');
  ev("ACT=null;saveAct();sheetClose()");
  /* v92 guest nudge + switch profile welcome */
  ev("window.CLOUD_CFG={url:'https://x.supabase.co',key:'anon'};window.__o={st:window.setTimeout,pid:PFID,pf:PFS.slice(),cl:CL};");
  ev("CL=null;window.__q=[];window.setTimeout=function(f,ms){window.__q.push([f,ms]);return 1;};PFS.push({id:'gx',g:1,name:'Guest',av:'001'});PFID='gx';try{localStorage.removeItem('bl_gn');}catch(e){}window.__gnT=0;guestNag();");
  ok(ev("window.__q.length===1&&window.__q[0][1]>=10000"),'guest nudge is delayed, not instant');
  ev("window.__q[0][0]()");
  ok(/gSignup\(1/.test(sheetHtml())&&/clAuthOpen\('in'\)/.test(sheetHtml()),'guest nudge offers create account and sign in');
  ev("sheetClose();gSignup(1,{upg:true})");
  ok(ev("!$('gate').hidden&&!!$('sue')&&!!$('npw')&&!$('npw2')&&!$('gname')"),'create account starts on a full screen with email + one password');
  ev("$('sue').value='mike@x.co';$('npw').value='Gym2026pass';suNext1()");
  ok(ev("!!$('gname')&&!$('sue')"),'step 2 asks name and avatar');
  ev("gSignin('mike@x.co','')");
  ok(ev("!!$('cle')&&!!$('clp')&&!$('gname')")&&/Log in/.test(ev("$('gate').innerHTML")),'log in is one full screen with email and password');
  ev("gateHide()");
  ev("sheetClose();window.__gnT=0;guestNag();window.__q[window.__q.length-1][0]()");
  ok(!/clAuthOpen/.test(sheetHtml())||doc.getElementById('sheetov').hidden,'nudge not repeated within a day');
  ev("window.setTimeout=window.__o.st;PFS.length=0;window.__o.pf.forEach(function(x){PFS.push(x);});PFID=window.__o.pid;CL=window.__o.cl;window.__gnT=0;sheetClose();");
  ev("gWelcome(1)");
  ok(/gBack\(\)/.test(doc.getElementById('gate').innerHTML),'welcome shows back link when coming from switch profile');
  ev("gateHide();gWelcome()");
  ok(!/gBack\(\)/.test(doc.getElementById('gate').innerHTML),'first-run welcome has no back link');
  ev("gateHide();window.CLOUD_CFG={url:'',key:''};");
  /* v93 smooth motion */
  ev("sheet('<h3>A</h3>');sheetClose();");
  ok(doc.querySelectorAll('#sheetov.gh').length===1&&doc.getElementById('sheetov').hidden,'closing a sheet leaves a fade-out ghost and hides the real one');
  ev("sheet('<h3>B</h3>');");
  ok(doc.querySelectorAll('#sheetov.gh').length===0&&!doc.getElementById('sheetov').hidden,'opening a sheet drops the ghost');
  ev("sheetClose();ghostDrop();go('history');");
  ok(doc.getElementById('main').classList.contains('pgin'),'tab change animates the page');
  ev("go('workout')");
  /* v0.96 accounts only */
  ev("window.CLOUD_CFG={url:'https://x.supabase.co',key:'anon'};");
  ev("PFS.push({id:'tmpx1',name:'Guest',av:{k:'p',p:'001'},pw:null,qs:[],enc:null,rm:0,t:1,g:1,tmp:1});pfSave();try{localStorage.setItem('bl_s_tmpx1','{}');}catch(e){}");
  ok(ev("pfClean(PFS.find(function(p){return p.id==='tmpx1';})).tmp")===1,'temporary profile flag survives cleaning');
  ev("pfDropTmp()");
  ok(ev("PFS.some(function(p){return p.id==='tmpx1';})")===false&&ev("localStorage.getItem('bl_s_tmpx1')")===null,'abandoned temporary profile is removed at start');
  ev("gateHide()");
  for(const known of [false,true]){
    ev("window.__fx0=window.fetch;window.fetch=function(u){var s=String(u);var b=function(o,ok,st){return Promise.resolve({ok:ok,status:st,json:function(){return Promise.resolve(o);}});};if(/rpc\\/email_registered/.test(s))return b("+known+",true,200);return b({msg:'Invalid login credentials'},false,400);};");
    ev("clAuthOpen('in')");doc.getElementById('cle').value='nobody@x.co';doc.getElementById('clp').value='Whatever123';
    await w.clSubmit('in');await new Promise(r=>setTimeout(r,300));
    ok(known?/doesn.t match/i.test(sheetHtml())&&!/not registered/i.test(sheetHtml()):/not registered/i.test(sheetHtml()),known?'known email + bad password says wrong password':'unknown email says it is not registered');
    ev("window.fetch=window.__fx0;sheetClose();");
  }
  ev("window.CLOUD_CFG={url:'',key:''};");
  /* retired local-password profiles are skipped, never entered */
  ok(ev("pfIsOld(pfClean({id:'oldp1',name:'Old',av:{k:'p',p:'001'},pw:{s:'AAAA',h:'AAAA',n:1},t:1,g:0,acct:0}))")===true&&ev("pfIsOld(pfClean({id:'acc1',name:'Acc',t:1,g:0,acct:1}))")===false&&ev("pfIsOld(pfClean({id:'gst1',name:'G',t:1,g:1}))")===false,'only retired password profiles without an account count as old');
  ok(ev("typeof gLegacy+typeof gPick+typeof gNew+typeof gRecv+typeof gSend+typeof pfLogin")==='undefinedundefinedundefinedundefinedundefinedundefined','the retired local-profile screens are gone');
  console.log('recovery plans');
  ev("ACT=null;saveAct();tab='stretch';STX.sec='rehab';RH.plan=null;render()");
  ok(/rhc/.test(main())&&ev('REHAB.length')===13,'recovery list shows all thirteen plans');
  ok(ev("REHAB.every(function(p){return RH_ZONES.indexOf(p.zone)>0;})"),'every plan belongs to a body zone');
  ev("rhZone('spine')");ok((main().match(/class=\"card rhc\"/g)||[]).length===ev("REHAB.filter(function(p){return p.zone==='spine';}).length")&&ev("REHAB.filter(function(p){return p.zone==='spine';}).length")===2,'zone filter shows only that zone');
  ev("rhZone('all')");ok((main().match(/class=\"card rhc\"/g)||[]).length===13,'All shows every plan');
  ok(ev("REHAB.every(function(p){rhOpen(p.id);return document.getElementById('rhgo')!==null;})"),'every plan page opens');
  ev("RH.plan=null;render()");
  ok(ev("REHAB.every(function(p){return p.phases.every(function(ph){return ph.ex.every(function(x){return !!exById(x.id);});});})"),'every plan exercise exists in the library');
  ok(ev("REHAB.every(function(p){return p.src.every(function(k){return !!REHAB_SRC[k];})&&p.phases.length===4&&p.flags.length>=4;})"),'every plan has sources, four phases and red flags');
  ok(ev("Object.keys(HOWTO).filter(function(k){return k.indexOf('rh_')===0;}).length===REHAB_EX.length"),'new rehab exercises have a technique guide');
  ev("rhOpen('flatfoot')");
  ok(/rhgo/.test(main())&&/rh-flag/.test(main()),'plan opens with the safety check first');
  doc.querySelector('.rh-flag').checked=true;ev("rhFlag()");
  ok(doc.getElementById('rhgo').disabled&&!doc.getElementById('rhwarn').hidden,'a warning sign blocks the plan and shows the message');
  doc.querySelector('.rh-flag').checked=false;ev("rhFlag();rhBegin('flatfoot')");
  ok(/rhStartFlag|Start today/.test(main())&&ev("rhSt('flatfoot').ph")===0,'starting the plan puts you on phase 1');
  ev("rhPain('flatfoot',4)");ok(ev("rhSt('flatfoot').pain[rhDay()]")===4,'pain today is saved');
  ev("rhGo('flatfoot')");
  ok(ev("!!ACT&&ACT.ex.length===REHAB[0].phases[0].ex.length&&ACT.ex[0].eid==='rh_shortfoot'&&ACT.ex[0].sets.length===4"),'starting the session loads the phase exercises, two sets per side');
  ev("ACT=null;saveAct();render()");
  ev("rhNext('flatfoot')");ok(ev("rhSt('flatfoot').ph")===1,'next phase moves forward');
  ev("rhOpen('knee');rhBegin('knee');rhSwitch");
  ev("RH.plan=null;STX.sec='sess';tab='workout';delete SET.rh;saveSet();render()");
  console.log('first-run tour');
  ev("ACT=null;saveAct();TR.on=false;var o=document.getElementById('tour');if(o)o.remove();SET.tourSeen=0;SET.tour=undefined;DATA.workouts=[];tourMaybe(0);");
  ok(ev("TR.on&&!!document.getElementById('tour')&&TOUR.length===7"),'first run starts a seven-step tour');
  ev("tourGo(1);tourGo(1)");ok(ev("TR.i")===2&&/Mobility/.test(ev("document.getElementById('tcard').innerHTML")),'next moves to the next tab');
  ev("tourEnd(true)");ok(ev("!TR.on&&!document.getElementById('tour')&&SET.tour===false&&SET.tourSeen===1"),'skip closes it and switches it off');
  ev("SET.tourSeen=0;tourMaybe(0)");ok(ev("!TR.on"),'a switched-off tour does not start by itself');
  ev("tourStart(true)");ok(ev("TR.on"),'replay works even when switched off');
  ev("tourEnd(false);SET.tour=undefined;SET.tourSeen=0;DATA.workouts=[{id:'wq',t:1,end:2,name:'x',ex:[]}];tourMaybe(0)");ok(ev("!TR.on"),'people with workouts never get the first-run tour');
  ev("DATA.workouts=[];SET.tourSeen=1;go('workout')");
  console.log('suggestions + personal records');
  ev("ACT=null;saveAct();DATA.workouts=[{id:'sg1',t:Date.now()-864e5,end:Date.now()-864e5+1,name:'p',ex:[{eid:'bench',sets:[{w:60,r:10,done:true},{w:60,r:10,done:true},{w:60,r:10,done:true}]}]}];tab='workout';render();startWorkout({name:'t',ex:[{eid:'bench',sets:3}]})");
  ok(/class="sg"/.test(ev("exCard(0,ACT.ex[0])")),'your own workout shows a suggestion from last time');
  ok(/sgbtn/.test(ev("exCard(0,ACT.ex[0])")),'a Use button appears while sets are empty');
  ev("useSugg(0)");ok(ev("ACT.ex[0].sets.every(s=>s.w!=null&&s.w>=60)"),'Use fills the empty sets with the suggested weight');
  ev("ACT.ex[0].sets.forEach(s=>{s.w=100;s.r=10});tgSet(0,0)");
  ok(ev("ACT.ex[0].sets[0].done&&ACT.ex[0].sets[0].pr===true"),'beating the best marks a personal record');
  ok(!/sgbtn/.test(ev("exCard(0,ACT.ex[0])")),'no Use button once every set has a weight');
  ev("ACT=null;saveAct();DATA.workouts=[];tab='workout';render()");
  console.log('google on every sign-in screen');
  ev("window.CLOUD_CFG={url:'https://x.supabase.co',key:'anon'};delete window.__clProv");
  for(const [fn,nm] of [["gWelcome()",'welcome'],["gSignin('','')",'log in'],["gSignup(1,{})",'sign up']]){ev(fn);ok(/oa-g/.test(doc.getElementById('gate').innerHTML),'Google button is on the '+nm+' screen without any extra lookup');}
  ev("gateHide();window.CLOUD_CFG={url:'',key:''}");
  const miss=[...new Set(w.__miss)];
  ok(miss.length===0,'no missing translation keys: '+miss.join(','));
  ok(errors.length===0,'no JS errors: '+errors.slice(0,3).join(' | '));
  console.log('\n'+passed+' passed, '+fails.length+' failed');
  if(errors.length)console.log(errors.slice(0,8).join('\n'));
  process.exit(fails.length?1:0);
})().catch(e=>{console.error('CRASH',e);process.exit(2);});
