/* Exercise metadata used by the plan builder, substitutions and injury warnings.
   Metadatos de ejercicios para el armador de planes, las sustituciones y los avisos por lesión.
   EXM[id] = muscle letter + level digit + stress pairs.
   muscle: Q quads · H hamstrings/hinge · G glutes · C calves · P chest · B back · S shoulders · I biceps · T triceps · A core · W power · F full body · Z balance · K cardio
   level: 1 = fine for beginners · 2 = needs some experience
   stress: joint letter + 1 (go light / pain-free range) or 2 (not recommended with an injury there)
   joints: k knee · b low back · s shoulder · e elbow · w wrist · h hip · a ankle/foot · n neck
   General precautions only — not medical advice. / Solo precauciones generales — no es consejo médico. */
const EXM={
 // chest
 bench:'P2s1',incbench:'P2s1',declbench:'P2s1',dbbench:'P1s1',dbinc:'P1s1',decldb:'P1s1',chestpress:'P1s1',dbfly:'P1s2',cablefly:'P1s1',pecdeck:'P1s1',
 pushup:'P1w1s1',hrpushup:'P2w1s1',dip:'P2s2e1w1',incpush:'P1w1s1',kneepush:'P1w1',ballpush:'P2w1s1',susppush:'P2w1s1',cablepress:'P1s1',bandpress:'P1s1',ballpress:'P1s1',
 // back
 pullup:'B2s1e1',chinup:'B2s1e1',assistpu:'B1s1e1',latpd:'B1s1',closepd:'B1s1',straightpd:'B1',bbrow:'B2b2',tbar:'B2b2',bentrow:'B2b2',dbrow:'B1',cablerow:'B1',machrow:'B1',
 ballrow:'B1',bandrow:'B1',invrow:'B1s1',suprow:'B1s1',facepull:'B1',hyperext:'B1b2',supermanback:'B1b2',shrug:'B1n1',pullover:'B1s2',
 // shoulders
 ohp:'S2s2n1b1',dbohp:'S1s2',machsp:'S1s2',arnold:'S2s2',seatpress:'S1s2',latraise:'S1s1',frontraise:'S1s1',reardelt:'S1',uprow:'S2s2e1w1',cablelat:'S1s1',scaption:'S1s1',
 revfly:'S1',bandpull:'S1',bandextrot:'S1',cubanrot:'S1s1',pushpress:'S2s2k1b1',pikepush:'S2s2w2',bandohp:'S1s2',bandlat:'S1s1',
 // arms
 bbcurl:'I1e1w1',ezcurl:'I1e1',dbcurl:'I1e1',hammer:'I1e1',preacher:'I1e1',cablecurl:'I1e1',inccurl:'I1e1s1',concurl:'I1e1',bandcurl:'I1e1',seatdbcurl:'I1e1',
 cgbp:'T2s1e1w1',pushdown:'T1e1',ropepd:'T1e1',skull:'T2e2',ohext:'T1e1s1',cableohext:'T1e1s1',benchdip:'T1s2e1w1',kickback:'T1e1',lyingext:'T2e2',bandpd:'T1e1',diamondpu:'T2w2e1',
 // quads
 squat:'Q2k1b1h1a1',frontsq:'Q2k1w1b1',overheadsq:'Q2k1b1s1',boxsq:'Q2k1b1',gobsq:'Q1k1',legpress:'Q1k1',hacksq:'Q2k1',lunge:'Q1k2h1',fwdlunge:'Q1k2h1',revlunge:'Q1k1h1',latlunge:'Q1k1h1',
 splitsq:'Q1k2h1',bulgsplit:'Q2k2h1',stepup:'Q1k1',latstep:'Q1k1',legext:'Q1k2',bodysq:'Q1k1',ballsq:'Q1k1',slsquat:'Q2k2a1',sledpush:'Q1k1a1',bwlunge:'Q1k1h1',bwstepup:'Q1k1',sqpress:'F2k1s1',
 // hamstrings / hinge
 rdl:'H2b1',deadlift:'H2b2h1',hexdl:'H2b1h1',goodmorn:'H2b2',sldl:'H2b1a1',dbrdl:'H1b1',sleddrag:'D1k1a1',sdcdrill:'D1k1a1b1',ruck:'K1k1a1b1s1',firecarry:'D2b1k1',ammolift:'S1s2n1',lowcrawl:'D1w1s1',legcurl:'H1',seatlc:'H1',legcurlball:'H1',bandrdl:'H1b1',
 // glutes
 sumo:'G2b1h1k1',hipthrust:'G1',glutebr:'G1',slbridge:'G1',ballbridge:'G1',frogpump:'G1',firehydrant:'G1',donkeykick:'G1',clamshell:'G1',bandwalk:'G1',kbdl:'G1b1',cablekick:'G1',abduct:'G1h1',adduct:'G1h1',bandbridge:'G1',bandkick:'G1',
 // calves
 calf:'C1a1',seatcalf:'C1a1',calfdb:'C1a1',
 // core
 plank:'A1w1s1',sideplank:'A1s1',crunch:'A1b1n1',legraise:'A2b1h1s1',cablecr:'A1b1n1',russian:'A1b1',abwheel:'A2b2s1',deadbug:'A1',revcrunch:'A1b1',ballcrunch:'A1b1n1',bicycle:'A1n1',
 kneeup:'A2b1h1s1',cablechop:'A1b1',cablelift:'A1b1',cablerot:'A1b1',pallof:'A1',birddog:'A1',ballplank:'A1s1w1',ballroll:'A2s1b1',mbrot:'W1b1',mbwood:'W1b1',mountain:'A1w1',vup:'A2b1',hollow:'A1b1',suitcase:'A1',proneiso:'A1',
 // power / agility
 squatjump:'W2k2a1b1h1',tuckjump:'W2k2a2b1h1',boxjump:'W2k2a1',boxdrop:'W2k2a2',lungejump:'W2k2a1h1',powerstep:'W1k1',broadjump:'W2k2a1b1',skaterjump:'W1k1a1',buttkick:'W1k1',highknees:'W1k1',
 ladder:'W1a1',coneshuffle:'W1k1a1',sprint:'W2k1a1b1h1',shuttle:'W2k1a1',mbchestpass:'W1w1',mbchestthrow:'W1s1',mbsoccer:'W1b1s1',plyopush:'W2w2s1e1',kbpower:'W2b1',jumpsquatband:'W2k2a1',depthjump:'W2k2a2',
 // full body
 clean:'F2b1w1s1k1',kbswing:'F2b1',thruster:'F2s1k1',burpee:'F1w1s1k1b1',farmer:'F1',dbsnatch:'F2s1b1',getup:'F2s1',mbslam:'F1b1',battleropes:'F1s1',bearcrawl:'F1w1s1',inchworm:'F1w1s1',manmaker:'F2w1s1b1',kbclean:'F2w1b1',ballcombo:'S1',
 // balance
 balsl:'Z1a1',balslreach:'Z1a1',balsqtd:'Z1k1a1',balstepup:'Z1k1',ballunge:'Z1k1h1',balwind:'Z1b1',balhop:'Z2k1a2',balfoam:'Z1a1',balrdl:'Z1b1',baltoe:'Z1b1',balcurl:'Z1',balyoga:'Z1',balbosu:'Z1k1',baltandem:'Z1',
 skierg:'K1b1s1',wallball:'F1k1s1',bbj:'F2k1w1s1b1',sandlunge:'Q1k1h1',situp:'A1b1n1',dbthruster:'F2s1k1',jjack:'W1a1',decpush:'P2w1s1',
 // cardio
 walk:'K1',treadmill:'K1',run:'K1k1a1',jumprope:'K1k1a1',hike:'K1k1a1',stairs:'K1k1',statbike:'K1',bike:'K1',rower:'K1b1',elliptical:'K1',swim:'K1s1'
};
/* Things an exercise needs besides its main equipment: 'bench' (bench or sturdy box) or 'bar' (pull-up / dip bar).
   Cosas extra que necesita un ejercicio además de su equipo principal: 'bench' (banco o cajón firme) o 'bar' (barra de dominadas / paralelas). */
const NEED={pullup:'bar',chinup:'bar',assistpu:'machine',legraise:'bar',kneeup:'bar',dip:'bar',invrow:'bar',
 bench:'bench',incbench:'bench',declbench:'bench',dbbench:'bench',dbinc:'bench',decldb:'bench',cgbp:'bench',skull:'bench',lyingext:'bench',benchdip:'bench',hipthrust:'bench',
 bulgsplit:'bench',stepup:'bench',latstep:'bench',bwstepup:'bench',boxjump:'bench',boxdrop:'bench',powerstep:'bench',balstepup:'bench',inccurl:'bench',concurl:'bench',seatpress:'bench',seatdbcurl:'bench',pullover:'bench',preacher:'machine',sledpush:'sled',abwheel:'wheel',decpush:'bench',sleddrag:'sled',dbfly:'bench',ballpress:'ball'};
/* Equipment the person can say they have. / Equipo que la persona puede decir que tiene. */
const HAVE_KEYS=['barbell','dumbbell','cable','machine','kettlebell','band','ball','medball','suspension','bench','bar','sled','wheel'];
const HAVE_PRESETS={gym:HAVE_KEYS.slice(),db:['dumbbell','bench'],home:['band'],none:[]};
/* Which injuries exist in the app: key → joint letters. / Lesiones disponibles: clave → letras de articulación. */
const INJ={knee:'k',back:'b',shoulder:'s',elbow:'e',wrist:'w',hip:'h',ankle:'a',neck:'n'};
