/* Ready routines (v28): focused by muscle and level, plus challenges. / Rutinas listas (v28): enfocadas por músculo y nivel, y retos.
   FOCUS[area][level] = list of slots "alt1,alt2,alt3|lever|sets|lo|hi" (first one the person can do is used; hold exercises use seconds).
   lever = what makes it harder (std standard, rom range of motion, uni one side, prof resistance profile, inst instability, lever longer lever, mom no momentum).
   FOCUS[área][nivel] = lista de espacios "alt1,alt2,alt3|palanca|series|min|max" (se usa el primero que la persona pueda hacer). */
const LIB_AREAS=['chest','back','shoulders','arms','legs','glutes','core'];
const FOCUS={
 chest:[
  ['chestpress,dbbench,kneepush|std|3|10|12','dbinc,incpush,kneepush|std|3|10|12','pecdeck,cablefly,dbfly|std|3|12|15','cablepress,bandpress,ballpress|std|2|12|15','pushdown,ropepd,bandpd,kickback|std|3|12|15'],
  ['dbbench,bench,chestpress|rom|4|8|10','dbinc,incbench,incpush|std|4|8|10','cablefly,dbfly,pecdeck|prof|3|10|12','pushup,hrpushup|std|3|8|15','dip,benchdip|std|3|8|12','pushdown,cgbp,ropepd|std|3|10|12'],
  ['bench,dbbench,chestpress|mom|5|5|8','dbinc,incbench,incpush|rom|4|6|10','cablefly,dbfly|prof|3|10|12','decpush,hrpushup,pushup|lever|3|8|15','susppush,ballpush,pushup|inst|3|8|12','dip,benchdip|lever|4|6|10','skull,cgbp,pushdown|mom|3|8|10']],
 back:[
  ['latpd,assistpu,closepd|std|3|10|12','machrow,cablerow,bandrow|std|3|10|12','straightpd,closepd,bandrow|std|3|12|15','facepull,reardelt,revfly,bandpull,supermanback|std|3|12|15','dbcurl,hammer,bandcurl|std|3|12|15'],
  ['pullup,chinup,assistpu,latpd|rom|4|6|10','dbrow,bentrow|uni|4|8|12','cablerow,machrow,bentrow|std|4|8|12','pullover,straightpd|prof|3|10|12','facepull,reardelt,revfly,supermanback|std|3|12|15','hammer,dbcurl,cablecurl|std|3|10|12'],
  ['bbrow,tbar,bentrow|mom|5|5|8','pullup,chinup,latpd|rom|4|5|8','dbrow,bentrow|uni|4|8|10','suprow,invrow,ballrow|inst|3|8|12','pullover,straightpd|prof|3|10|12','inccurl,preacher,dbcurl|rom|3|8|12','facepull,reardelt,supermanback|std|3|15|15']],
 shoulders:[
  ['machsp,dbohp,seatpress,bandohp,pikepush|std|3|10|12','latraise,cablelat,bandlat|std|3|12|15','reardelt,revfly,bandpull|std|3|12|15','scaption,frontraise,bandlat|std|3|12|12','bandextrot,cubanrot|std|3|12|15'],
  ['dbohp,arnold,machsp,pikepush|rom|4|8|12','latraise,cablelat,bandlat|std|4|12|15','cablelat,latraise|prof|3|12|15','reardelt,revfly,bandpull|std|3|12|15','pikepush,dbohp|lever|3|8|12','cubanrot,bandextrot|std|3|10|12'],
  ['ohp,dbohp,machsp|mom|5|4|6','arnold,dbohp|rom|4|8|10','cablelat,latraise|uni|4|10|15','reardelt,revfly,bandpull|prof|3|12|15','pikepush,dbohp|lever|4|6|10','ballcombo,ballpress,dbohp|inst|3|8|10','cubanrot,bandextrot|std|3|10|10']],
 arms:[
  ['dbcurl,cablecurl,bandcurl|std|3|10|12','pushdown,ropepd,bandpd,diamondpu|std|3|10|12','hammer,seatdbcurl,bandcurl|std|3|10|12','kickback,ohext,bandpd,benchdip,kneepush|std|3|12|15'],
  ['bbcurl,ezcurl,dbcurl|std|4|8|12','cgbp,skull,pushdown,diamondpu|std|4|8|12','inccurl,preacher,dbcurl|rom|3|10|12','cableohext,ohext,pushdown|rom|3|10|12','hammer,cablecurl|std|3|10|12','benchdip,diamondpu,bandpd|std|3|8|15'],
  ['preacher,inccurl,bbcurl|rom|4|8|10','skull,lyingext,cgbp|mom|4|8|10','concurl,dbcurl,cablecurl|uni|3|8|12','cableohext,ohext|prof|3|10|12','diamondpu,benchdip,pushdown|lever|3|8|15','cablecurl,bandcurl,dbcurl|prof|3|12|15','dip,benchdip|lever|3|6|10']],
 legs:[
  ['legpress,gobsq,bodysq|std|3|10|12','legext,gobsq,bwstepup|std|3|12|12','legcurl,seatlc,legcurlball,bandrdl|std|3|12|12','dbrdl,bandrdl,kbdl|std|3|10|12','calf,seatcalf,calfdb|std|3|15|15'],
  ['squat,frontsq,gobsq,legpress|rom|4|6|10','rdl,dbrdl,bandrdl|std|4|8|10','revlunge,lunge,fwdlunge,bwlunge|uni|3|8|12','legcurl,seatlc,legcurlball|prof|3|10|12','legext,hacksq|std|3|10|12','calf,seatcalf,calfdb|rom|4|12|15'],
  ['squat,hacksq,legpress,gobsq|mom|5|4|6','bulgsplit,splitsq,revlunge,bwlunge|uni|4|6|10','rdl,sldl,dbrdl|mom|4|6|8','legcurl,seatlc,legcurlball|prof|4|8|12','sldl,slsquat,stepup|uni|3|8|10','calf,seatcalf,calfdb|mom|4|8|12']],
 glutes:[
  ['glutebr,ballbridge,bandbridge|std|3|12|15','frogpump,bandwalk,clamshell|std|3|15|15','kbdl,dbrdl,bandrdl|std|3|10|12','donkeykick,firehydrant,cablekick,bandkick|std|3|12|15','abduct,clamshell,bandwalk|std|3|15|15'],
  ['hipthrust,glutebr,ballbridge|std|4|8|12','stepup,revlunge,bwstepup|uni|3|8|12','sumo,kbdl,rdl,dbrdl|std|4|8|10','cablekick,donkeykick,bandkick|uni|3|12|15','abduct,bandwalk|std|3|15|15','slbridge,glutebr|uni|3|10|12'],
  ['hipthrust,glutebr|mom|5|5|8','bulgsplit,splitsq,stepup,revlunge|rom|4|6|10','slbridge,glutebr|uni|3|10|12','sumo,rdl,kbdl|std|4|6|8','cablekick,donkeykick,bandkick|prof|3|10|15','bandwalk,abduct|std|3|15|15']],
 core:[
  ['deadbug,birddog|std|3|10|10','plank,ballplank|std|3|30|45','crunch,revcrunch,ballcrunch|std|3|12|15','sideplank|std|3|20|30','pallof,cablechop,bicycle|std|3|10|12'],
  ['hollow,plank|std|3|30|40','legraise,kneeup,vup|std|3|10|15','cablecr,ballcrunch,crunch|prof|3|12|15','russian,mbrot,bicycle|std|3|16|20','sideplank|std|3|35|45','pallof,cablechop|uni|3|10|12'],
  ['abwheel,ballroll,hollow|lever|4|8|12','legraise,kneeup,vup|mom|4|10|15','cablechop,cablelift,pallof|uni|4|10|12','hollow,plank|mom|3|40|50','suitcase,sideplank|uni|3|30|40','ballplank,plank|inst|3|40|50']]
};
/* Challenge movements: "id:qty|id:qty|…" qty = reps, 300m distance, 60s seconds. First one the person can do is used, the last is always bodyweight.
   Movimientos: "id:cantidad|…" cantidad = reps, 300m = distancia, 60s = segundos. Se usa el primero que la persona pueda hacer; el último siempre es de peso corporal. */
const M_RUN='run:{0}m',M_PUSH='pushup:{0}',M_SQ='bodysq:{0}';
/* CH[id] = {ty: type, cap: minutes, w: work s, r: rest s (interval), rd: rounds, lv: [Foundation, Standard, Hard] multiplier,
   tg: tags, mv: movements per round (or a station list), rest: seconds between rounds} */
const CHALLENGES=[
 {id:'bar20',ty:'amrap',cap:20,tg:['pt','cf'],lv:[0.6,1,1.4],mv:['pullup:5|invrow:8|bandrow:10|supermanback:12','pushup:10','bodysq:15']},
 {id:'first',ty:'time',cap:25,tg:['pt'],lv:[0.6,1,1.4],rd:1,mv:['run:400m|jumprope:120s|jjack:80','bodysq:50','situp:40','pushup:30','run:400m|jumprope:120s|jjack:80']},
 {id:'count',ty:'time',cap:30,tg:['pt','cf'],lv:[0.5,1,1.5],rd:1,mv:['bodysq:100','situp:80','pushup:60','bwlunge:40','burpee:20']},
 {id:'tabata',ty:'interval',cap:16,w:20,r:10,rd:8,hw:30,tg:['pt','cf'],lv:[0.5,1,1],mv:['burpee:max','mountain:max','squatjump:max|bodysq:max','pushup:max|kneepush:max']},
 {id:'ladder',ty:'time',cap:35,tg:['pt','run'],lv:[0.6,1,1.4],rd:1,mv:['run:200m','run:400m','run:600m','run:400m','run:200m'],rest:90},
 {id:'swing',ty:'emom',cap:20,tg:['cf'],lv:[0.7,1,1.3],mv:['kbswing:15|dbrdl:15|glutebr:20','gobsq:12|bodysq:15','burpee:10','plank:40s|situp:15']},
 {id:'triple',ty:'time',cap:20,tg:['cf'],lv:[0.5,1,1.5],rd:3,rr:[21,15,9],mv:['dbthruster:{a}|thruster:{a}|bodysq:{a}','pullup:{a}|invrow:{a}|pushup:{a}']},
 {id:'carry',ty:'amrap',cap:12,tg:['cf','hy'],lv:[0.6,1,1.4],mv:['boxjump:10|squatjump:10','kbswing:12|dbrdl:12|bodysq:15','farmer:100m|firecarry:50m|lowcrawl:20m']},
 {id:'row5',ty:'time',cap:30,tg:['cf','hy'],lv:[0.6,1,1.4],rd:5,mv:['rower:500m|skierg:500m|run:400m|jumprope:150s','wallball:15|dbthruster:15|bodysq:20','burpee:10']},
 {id:'iron',ty:'time',cap:40,tg:['cf'],lv:[0.5,1,1.4],rd:4,mv:['run:400m','thruster:10|dbthruster:10|bodysq:15']},
 {id:'mini',ty:'time',cap:45,tg:['hy','cf'],lv:[0.6,1,1.4],rd:1,mv:['run:400m','skierg:500m|rower:500m|jumprope:150s|jjack:60','run:400m','sledpush:25m|sandlunge:25m|bwlunge:30','run:400m','bbj:40m|burpee:15','run:400m','wallball:50|dbthruster:30|bodysq:50']},
 {id:'hyrox',ty:'time',cap:120,tg:['hy'],lv:[0.4,0.7,1],rd:1,mv:['run:1000m','skierg:1000m|rower:1000m|jumprope:300s|burpee:40','run:1000m','sledpush:50m|sandlunge:50m|bwlunge:60','run:1000m','sleddrag:50m|firecarry:50m|lowcrawl:30m','run:1000m','bbj:80m|burpee:30','run:1000m','rower:1000m|skierg:1000m|jumprope:300s|burpee:40','run:1000m','farmer:200m|firecarry:100m|bearcrawl:50m','run:1000m','sandlunge:100m|bwlunge:100','run:1000m','wallball:100|dbthruster:60|bodysq:100']},
 {id:'engine',ty:'amrap',cap:30,tg:['hy','pt'],lv:[0.6,1,1.4],mv:['run:400m','wallball:15|dbthruster:10|bodysq:15','farmer:50m|firecarry:25m|lowcrawl:15m','bbj:20m|burpee:8']},
 {id:'ruck',ty:'time',cap:50,tg:['pt','mil','run'],lv:[0.5,1,1.5],rd:1,mv:['ruck:1600m|run:1600m|walk:1600m','pushup:40','bodysq:60','situp:40','ruck:1600m|run:1600m|walk:1600m']},
 {id:'primer',ty:'amrap',cap:15,tg:['pt','mil'],lv:[0.6,1,1.4],mv:['deadlift:6|dbrdl:8|bodysq:12','hrpushup:6|pushup:8|kneepush:8','legraise:6|situp:10']},
 {id:'drill',ty:'time',cap:25,tg:['mil','pt','bw'],lv:[0.5,1,1.5],rd:3,mv:['sprint:50m|run:50m','lowcrawl:25m|bearcrawl:25m','firecarry:50m|farmer:50m','sleddrag:25m|bearcrawl:25m']},
 {id:'ten',ty:'time',cap:25,tg:['pt','bw'],lv:[0.6,1,1.4],rd:10,rr:[10,9,8,7,6,5,4,3,2,1],mv:['pushup:{a}|kneepush:{a}','bodysq:{a}','situp:{a}']},
 {id:'hundred',ty:'time',cap:25,tg:['pt','bw'],lv:[0.5,1,1.5],rd:1,mv:['burpee:100']},
 {id:'rope',ty:'interval',cap:12,w:40,r:20,rd:3,tg:['pt','cf'],lv:[0.67,1,1],mv:['jumprope:max|jjack:max','mountain:max','jumprope:max|jjack:max','plank:max|situp:max']},
 {id:'tlegs',ty:'interval',cap:16,w:20,r:10,rd:8,hw:30,tg:['pt','cf','bw'],lv:[0.5,1,1],mv:['bodysq:max','bwlunge:max','squatjump:max|jjack:max','bwstepup:max|glutebr:max']},
 {id:'tupper',ty:'interval',cap:16,w:20,r:10,rd:8,hw:30,tg:['pt','cf','bw'],lv:[0.5,1,1],mv:['pushup:max|kneepush:max','pikepush:max|pushup:max','diamondpu:max|kneepush:max','decpush:max|hrpushup:max']},
 {id:'bell',ty:'amrap',cap:15,tg:['cf'],lv:[0.6,1,1.4],mv:['kbswing:10|dbrdl:10|glutebr:15','kbclean:6|dbsnatch:6|burpee:6','gobsq:8|bodysq:12']},
 {id:'barb',ty:'emom',cap:16,tg:['cf'],lv:[0.7,1,1.3],mv:['deadlift:6|dbrdl:10|glutebr:20','bench:6|dbbench:8|pushup:12','bbrow:6|dbrow:8|bandrow:10|supermanback:12','squat:6|gobsq:10|bodysq:20']},
 {id:'dbtri',ty:'amrap',cap:18,tg:['cf'],lv:[0.6,1,1.4],mv:['dbthruster:8|bodysq:12','dbsnatch:6|kbswing:10|burpee:6','dbrow:10|invrow:10|pushup:10']},
 {id:'rowsp',ty:'time',cap:25,tg:['cf','hy','run'],lv:[0.5,1,1.5],rd:6,mv:['rower:250m|skierg:250m|run:200m|jumprope:60s','bodysq:15','burpee:6']},
 {id:'sledr',ty:'time',cap:35,tg:['hy','mil'],lv:[0.5,1,1.5],rd:4,mv:['sledpush:25m|sandlunge:25m|bwlunge:30','sleddrag:25m|firecarry:25m|lowcrawl:15m','run:400m']},
 {id:'wallc',rep:1,ty:'time',cap:35,tg:['hy','cf'],lv:[0.5,1,1.5],rd:1,mv:['run:400m','wallball:50|dbthruster:30|bodysq:50','run:400m','wallball:50|dbthruster:30|bodysq:50','run:400m']},
 {id:'finish',ty:'time',cap:30,tg:['hy'],lv:[0.5,1,1.5],rd:1,mv:['farmer:200m|firecarry:100m','sandlunge:100m|bwlunge:100','bbj:40m|burpee:15','wallball:50|dbthruster:30|bodysq:50']},
 {id:'mile',ty:'time',cap:20,tg:['run','pt'],lv:[0.5,1,1],rd:1,mv:['run:1600m|walk:1600m']},
 {id:'fivek',ty:'time',cap:60,tg:['run'],lv:[0.5,1,1],rd:1,mv:['run:5000m|walk:5000m']}
];
