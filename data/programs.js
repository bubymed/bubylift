/* Classic programs, kept as the well-known templates (sets × reps, rest). Rows: "option1,option2|sets|reps low|reps high|rest seconds[|m]".
   The first option the person's equipment allows is used. 'm' = minutes (holds).
   Programas clásicos, tal como se conocen (series × repeticiones, descanso). Se usa la primera opción que permita el equipo.
   Order here = order of the cards. */
const PROGRAMS={
  fb:{wk:3,days:[
    ['squat,gobsq,legpress,bodysq|3|8|10|120','bench,dbbench,chestpress,pushup|3|8|10|120','bbrow,dbrow,cablerow,machrow,invrow|3|8|10|120','rdl,dbrdl,sldl,glutebr|3|10|12|90','ohp,dbohp,machsp,pikepush|2|10|12|90','plank,deadbug|3|0.5|1|60|m'],
    ['legpress,lunge,bulgsplit,bodysq|3|8|12|120','dbinc,incbench,chestpress,incpush|3|8|10|120','latpd,pullup,chinup,assistpu,invrow|3|8|10|120','hipthrust,glutebr,kbdl|3|10|12|90','dbcurl,bbcurl,hammer,bandcurl|2|10|12|60','pushdown,ohext,skull,benchdip|2|10|12|60','sideplank,pallof|3|0.5|1|60|m']
  ]},
  sl:{wk:3,days:[
    ['squat,gobsq,legpress,bodysq|5|5|5|180','bench,dbbench,chestpress,pushup|5|5|5|180','bbrow,dbrow,cablerow,machrow|5|5|5|180'],
    ['squat,gobsq,legpress,bodysq|5|5|5|180','ohp,dbohp,machsp,pikepush|5|5|5|180','deadlift,hexdl,rdl,kbdl|1|5|5|240']
  ]},
  ss:{wk:3,days:[
    ['squat,gobsq,legpress,bodysq|3|5|5|180','bench,dbbench,chestpress,pushup|3|5|5|180','deadlift,hexdl,rdl,kbdl|1|5|5|240'],
    ['squat,gobsq,legpress,bodysq|3|5|5|180','ohp,dbohp,machsp,pikepush|3|5|5|180','clean,kbclean,kbswing|5|3|3|150']
  ]},
  w531:{wk:4,days:[ // main lift first; its sets come from the week's percentages / el levantamiento principal sale de los porcentajes de la semana
    ['ohp,dbohp,machsp|M','dip,pushup,dbbench|5|10|10|90','chinup,pullup,latpd,assistpu|5|10|10|90','legraise,crunch,plank|5|10|15|60'],
    ['deadlift,hexdl,rdl,kbdl|M','hyperext,glutebr,rdl|5|10|10|90','legraise,crunch,hollow|5|10|15|60','shrug,facepull|3|10|12|60'],
    ['bench,dbbench,chestpress,pushup|M','dbrow,cablerow,bbrow,machrow|5|10|10|90','dbcurl,bbcurl,hammer|5|10|10|60','pushdown,ohext,skull|5|10|10|60'],
    ['squat,gobsq,legpress,bodysq|M','legcurl,legcurlball,rdl|5|10|10|90','lunge,bulgsplit,stepup|5|10|10|90','calf,calfdb|5|10|15|60']
  ]},
  phul:{wk:4,days:[
    ['bench,dbbench,chestpress,pushup|4|3|5|180','dbinc,incbench,chestpress,incpush|3|6|10|120','bbrow,dbrow,cablerow,machrow|4|3|5|180','latpd,pullup,chinup,assistpu|3|6|10|120','ohp,dbohp,machsp,pikepush|2|5|8|120','bbcurl,dbcurl,ezcurl,bandcurl|2|6|10|90','skull,ohext,pushdown,benchdip|2|6|10|90'],
    ['squat,gobsq,legpress,bodysq|4|3|5|180','deadlift,hexdl,rdl,kbdl|3|3|5|180','legpress,hacksq,lunge,bulgsplit|5|10|15|120','legcurl,seatlc,legcurlball,rdl|3|6|10|90','calf,seatcalf,calfdb|4|6|10|60'],
    ['incbench,dbinc,chestpress,incpush|4|8|12|90','dbfly,cablefly,pecdeck,pushup|4|8|12|60','cablerow,machrow,dbrow,invrow|4|8|12|90','dbrow,tbar,bentrow,invrow|3|8|12|90','latraise,cablelat,bandlat|3|8|12|60','inccurl,dbcurl,cablecurl,bandcurl|3|8|12|60','ohext,cableohext,pushdown,ropepd|3|8|12|60'],
    ['frontsq,squat,hacksq,legpress,gobsq|4|8|12|120','lunge,bulgsplit,stepup,bwlunge|3|8|12|90','legext,sqtouch,bodysq|3|10|15|60','legcurl,seatlc,legcurlball,rdl|3|10|15|60','calf,calfdb|4|10|15|60','seatcalf,calfdb|3|10|15|60']
  ]},
  gvt:{wk:3,days:[
    ['bench,dbbench,chestpress,pushup|10|10|10|75','bbrow,dbrow,cablerow,machrow,invrow|10|10|10|75','dbinc,incbench,chestpress,incpush|3|10|12|60','latpd,pullup,chinup,assistpu|3|10|12|60'],
    ['squat,gobsq,legpress,bodysq|10|10|10|90','legcurl,seatlc,legcurlball,rdl|10|10|10|75','calf,seatcalf,calfdb|3|15|15|45','legraise,crunch,hollow|3|15|15|45'],
    ['dip,cgbp,benchdip,pushdown|10|10|10|75','bbcurl,dbcurl,ezcurl,bandcurl|10|10|10|75','latraise,cablelat,bandlat|3|12|15|45','reardelt,revfly,facepull|3|12|15|45']
  ]}
};
const PROG_IDS=Object.keys(PROGRAMS);
/* 5/3/1: week → [[percent of training max, reps]], last work set is "as many reps as possible" except the deload / semana → [[porcentaje, repeticiones]] */
const W531=[[[65,5],[75,5],[85,5]],[[70,3],[80,3],[90,3]],[[75,5],[85,3],[95,1]],[[40,5],[50,5],[60,5]]];
const W531_MAIN=['ohp','deadlift','bench','squat']; // training max keys, in day order / llaves de máximo de entrenamiento, en orden de día
