/* Recovery plans (v0.99.8): phased, criteria-based home programs built from published guidelines and trials.
   Planes de recuperación (v0.99.8): programas caseros por fases, con criterios, basados en guías y estudios publicados.
   Written for Bubylift in our own words. Not medical advice. / Escritos con nuestras palabras. No son consejo médico.
   Pair = [English, Español]. Exercise ids starting with rh_ are added to the library below; the others already exist. */

/* ---- sources / fuentes ---- */
const REHAB_SRC={
 cpg:{t:"Willy RW et al. Patellofemoral Pain: Clinical Practice Guidelines. J Orthop Sports Phys Ther 2019;49(9):CPG1–CPG95.",u:"https://www.jospt.org/doi/pdf/10.2519/jospt.2019.0302"},
 afp:{t:"Patellofemoral Pain: Guidelines from the American Physical Therapy Association (summary). Am Fam Physician 2020.",u:"https://www.aafp.org/pubs/afp/issues/2020/1001/p442.html"},
 rx3:{t:"Rx3 – Rehab, Refit, Return to Duty. Uniformed Services University (CHAMP) / Human Performance Resource Center (DoD).",u:"https://www.hprc-online.org/physical-fitness/rx3/knee"},
 pttd:{t:"Systematic review of randomised trials of exercise for posterior tibial tendon dysfunction. BMJ Open Sport Exerc Med 2018;4:e000430.",u:"https://bmjopensem.bmj.com/content/4/1/e000430"},
 kulig:{t:"Kulig K et al. Nonsurgical management of posterior tibial tendon dysfunction with orthoses and resistive exercise: a randomized controlled trial. Phys Ther 2009;89(1):26–37.",u:"https://pubmed.ncbi.nlm.nih.gov/19022863/"},
 sfe:{t:"Pabón-Carrasco M et al. Randomized clinical trial: the effect of exercise of the intrinsic muscle on foot pronation. Int J Environ Res Public Health 2020;17:4882.",u:"https://riuma.uma.es/entities/publication/493c68c7-8f8c-45fe-9fe0-357426174849"},
 mtss:{t:"Sanford Health. Medial tibial stress syndrome rehabilitation guideline (criterion-based phases and return-to-run program).",u:"https://www.sanfordhealth.org/-/media/org/files/medical-services/physical-therapy/014000-01467-flyer-sosm-medial-tibial-stress-syndrome-rehab-guideline-8_5x11.pdf"},
 mtss2:{t:"Sanford Health. Medial tibial stress syndrome guideline (stress-fracture screening, soreness rules).",u:"https://www.sanfordhealth.org/-/media/org/files/medical-professionals/resources-and-education/medial-tibial-stress-syndrome-guideline.pdf"},
 sprain:{t:"Mass General Brigham. Rehabilitation protocol for ankle sprain (phases, progression and return-to-sport criteria).",u:"https://www.massgeneralbrigham.org/content/dam/unified-xwalk/pdf/patient-education/english/rehabilitation-protocol-for-ankle-sprain.pdf"}
};

/* ---- return-to-run walk/run table (adapted from the Sanford MTSS guideline) / tabla caminar-correr ---- */
const REHAB_RUN={
 weeks:[
  [[4.5,0.5],[4,1],[3.5,1.5]],
  [[3,2],[2.5,2.5],[2,3]],
  [[1.5,3.5],[1,4],[0.5,4.5]],
  [[0,30],[0,30],[0,30]]
 ],
 start:["Start only when you can walk 30 minutes in a row without pain.","Empieza solo cuando puedas caminar 30 minutos seguidos sin dolor."],
 how:["Each session: 2–5 min brisk walk, a little stretching, then 6 rounds of walk + run (week 4: run 30 min). Do 3 sessions a week with a rest day between.","Cada sesión: 2–5 min de caminata rápida, un poco de estiramiento y 6 rondas de caminar + correr (semana 4: correr 30 min). 3 sesiones por semana con un día de descanso entre ellas."],
 ok:["Mild discomfort is OK only if it is not sharp, stays the same or fades as you go, and you do not limp or change how you run.","Una molestia leve es aceptable solo si no es punzante, se mantiene o se va quitando y no cojeas ni cambias tu forma de correr."],
 rules:[
  ["Soreness in the warm-up that is still there 2 days later","Dolor en el calentamiento que sigue 2 días después","Go back 1 step","Retrocede 1 paso"],
  ["Soreness in the warm-up that goes away","Dolor en el calentamiento que se quita","Stay at the same step","Quédate en el mismo paso"],
  ["Soreness that fades, then returns mid-run and lasts 2 days","Dolor que se quita y vuelve a media carrera y dura 2 días","Go back 1 step","Retrocede 1 paso"],
  ["Soreness the day after (not normal muscle soreness)","Dolor al día siguiente (no es agujeta normal)","Take 1 day off and do not advance","Descansa 1 día y no avances"],
  ["No soreness","Sin dolor","Advance 1 step per week","Avanza 1 paso por semana"]
 ],
 after:["After week 4, build time or pace by no more than 10% per week until you are back to your usual running.","Después de la semana 4, sube tiempo o ritmo máximo un 10% por semana hasta volver a tu nivel normal."]
};

/* ---- plans / planes ---- */
const REHAB=[
 {
  id:"flatfoot",zone:"foot",em:"🦶",
  name:["Flat foot & inner-ankle pain","Pie plano y dolor en el tobillo interno"],
  sub:["Posterior tibial tendon / arch overload","Sobrecarga del tendón tibial posterior y del arco"],
  intro:["Flat feet are common and often painless. Pain on the inside of the ankle that builds up over time can come from the tendon that holds up the arch (the posterior tibial tendon) being overloaded. Strengthening that tendon, the calf and the small muscles of the foot is the first-line, non-surgical approach, usually together with good footwear or arch supports. It is slow: expect weeks to months, not days. The evidence for exercise here is real but limited, and the best-tested part is slow, loaded heel work.","Los pies planos son comunes y muchas veces no duelen. El dolor en el lado interno del tobillo que va aumentando con el tiempo puede venir del tendón que sostiene el arco (tibial posterior) cuando se sobrecarga. Fortalecer ese tendón, la pantorrilla y los músculos pequeños del pie es el primer tratamiento sin cirugía, normalmente junto con buen calzado o plantillas. Es lento: cuenta en semanas o meses, no en días. La evidencia del ejercicio aquí es real pero limitada, y lo mejor probado es el trabajo lento y con carga del talón."],
  evid:["Evidence: limited to moderate (small randomised trials; slow heel lowering reduced pain and disability at 12 weeks).","Evidencia: limitada a moderada (ensayos aleatorizados pequeños; bajar el talón despacio redujo dolor y discapacidad a las 12 semanas)."],
  flags:[
   ["Sudden pain or a pop after a fall or twist, or you cannot put weight on the foot","Dolor repentino o un chasquido tras una caída o torcedura, o no puedes apoyar el pie"],
   ["The inner ankle is clearly swollen, red or warm","El tobillo interno está claramente hinchado, rojo o caliente"],
   ["Numbness, tingling, or pain that wakes you at night","Adormecimiento, hormigueo o dolor que te despierta de noche"],
   ["Over recent weeks the arch has visibly dropped or the heel tilts outward on one side","En las últimas semanas el arco se ve más caído o el talón se inclina hacia afuera de un solo lado"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Calm it down & wake up the arch","Calma el dolor y despierta el arco"],wk:["2–3 weeks · daily","2–3 semanas · a diario"],
    goal:["Settle the irritation and learn to lift the arch without curling your toes.","Bajar la irritación y aprender a levantar el arco sin encoger los dedos."],
    ex:[
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1,note:["Seated first, then standing.","Primero sentado, luego de pie."]},
     {id:"rh_dlheel",sets:2,r:15},
     {id:"rh_bandinv",sets:2,r:15,side:1},
     {id:"rh_towelcurl",sets:2,r:15,side:1},
     {id:"z_calf_stretch_hands_against_wall",sets:3,secs:30,side:1},
     {id:"balsl",sets:3,secs:30,side:1}
    ],
    tip:["Keep daily activity going but cut the amount that flares you up (long walks on hard floors, running) by about half. Wear supportive shoes, even at home. Ask your clinic about ready-made arch supports.","Sigue activo pero reduce a la mitad lo que te brota el dolor (caminatas largas en piso duro, correr). Usa calzado con buen soporte, también en casa. Pregunta en tu clínica por plantillas prefabricadas."],
    adv:[["Walking 20–30 min with pain 3/10 or less and not worse the next morning","Caminar 20–30 min con dolor de 3/10 o menos y sin empeorar a la mañana siguiente"],["Short foot held 10 seconds standing, toes relaxed","Pie corto sostenido 10 segundos de pie, con los dedos relajados"],["Two-leg heel raises 2×15 with pain 3/10 or less","Elevaciones de talón con dos pies 2×15 con dolor de 3/10 o menos"]]
   },
   {
    n:["Build strength","Construye fuerza"],wk:["4–6 weeks · 3–4 days/week","4–6 semanas · 3–4 días por semana"],
    goal:["Load the tendon and calf slowly. The slow lowering phase of the heel raise is the key move.","Cargar el tendón y la pantorrilla despacio. La fase lenta de bajada del talón es el movimiento clave."],
    ex:[
     {id:"rh_eccheel",sets:3,r:10,side:1,note:["Add reps toward 15 before you add weight.","Sube repeticiones hacia 15 antes de añadir peso."]},
     {id:"rh_bandinv",sets:3,r:15,side:1,note:["Use a heavier band than in phase 1.","Usa una banda más fuerte que en la fase 1."]},
     {id:"rh_bandev",sets:2,r:15,side:1},
     {id:"bodysq",sets:2,r:12,note:["Keep the arch lifted the whole time.","Mantén el arco levantado todo el tiempo."]},
     {id:"clamshell",sets:2,r:15,side:1},
     {id:"balfoam",sets:3,secs:30,side:1}
    ],
    tip:["Slow and controlled beats heavy. Pain up to 3/10 while you train is fine if it settles within an hour and is not worse the next morning.","Lento y controlado vale más que pesado. Dolor de hasta 3/10 mientras entrenas es aceptable si se calma en una hora y no empeora al día siguiente."],
    adv:[["25 single-leg heel raises on each side with good form","25 elevaciones de talón a un pie de cada lado con buena técnica"],["Single-leg balance 30 s on a soft surface without the arch collapsing","Equilibrio a un pie 30 s sobre superficie blanda sin que el arco se caiga"],["Walking or hiking 45–60 min with pain 3/10 or less","Caminar o hacer senderismo 45–60 min con dolor de 3/10 o menos"]]
   },
   {
    n:["Load it & get back to activity","Cárgalo y vuelve a la actividad"],wk:["4–8 weeks · 2–3 days/week","4–8 semanas · 2–3 días por semana"],
    goal:["Add weight and single-leg work so the foot handles real life: rucks, running, sport.","Añadir peso y trabajo a una pierna para que el pie aguante la vida real: rucksack, correr, deporte."],
    ex:[
     {id:"rh_eccheel",sets:3,r:12,side:1,note:["Hold a dumbbell or wear a loaded backpack.","Sostén una mancuerna o usa una mochila con peso."]},
     {id:"calfdb",sets:3,r:15,side:1},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"latstep",sets:3,r:10,side:1},
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"balslreach",sets:3,r:8,side:1}
    ],
    tip:["Bring back rucking or running in small steps: add no more than about 10% a week. If you run, use the return-to-run table below.","Reintroduce el rucksack o correr en pasos pequeños: no más de un 10% por semana. Si corres, usa la tabla de vuelta a correr de abajo."],
    run:1,
    adv:[["Two weeks at full phase 3 with pain 3/10 or less and no next-day flare-ups","Dos semanas con la fase 3 completa, dolor de 3/10 o menos y sin brotes al día siguiente"],["Back to your normal training or ruck without more pain than your baseline","De vuelta a tu entrenamiento o rucksack normal sin más dolor que antes"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two short sessions a week keep the tendon strong. Go back a phase if it flares.","Dos sesiones cortas a la semana mantienen fuerte el tendón. Si se brota, regresa una fase."],
    ex:[
     {id:"rh_eccheel",sets:2,r:12,side:1},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1},
     {id:"rh_bandinv",sets:2,r:15,side:1},
     {id:"clamshell",sets:2,r:15,side:1}
    ],
    tip:["Keep wearing supportive shoes for long days on your feet.","Sigue usando calzado con soporte en días largos de pie."],
    adv:[]
   }
  ],
  src:["pttd","kulig","sfe","mtss"]
 },
 {
  id:"knee",zone:"knee",em:"🦵",
  name:["Runner's knee (pain around the kneecap)","Rodilla del corredor (dolor alrededor de la rótula)"],
  sub:["Patellofemoral pain","Dolor patelofemoral"],
  intro:["Pain at the front of the knee around or behind the kneecap, worse with running, stairs, squatting or sitting for a long time. Current clinical guidelines say the best-supported treatment is exercise that strengthens the hips and thighs, in fairly high volume, built up gradually. You do not need complete rest: you reduce the load that flares it and train around it.","Dolor al frente de la rodilla, alrededor o detrás de la rótula, peor al correr, subir escaleras, hacer sentadillas o estar sentado mucho rato. Las guías clínicas actuales dicen que el tratamiento con mejor respaldo es el ejercicio que fortalece cadera y muslos, en buen volumen y subiendo poco a poco. No necesitas reposo total: reduces la carga que lo brota y entrenas alrededor del dolor."],
  evid:["Evidence: strong for hip and thigh strengthening (international clinical practice guideline).","Evidencia: sólida para el fortalecimiento de cadera y muslo (guía clínica internacional)."],
  flags:[
   ["Pain after a fall, a direct blow or a twist, or the knee is clearly swollen","Dolor tras una caída, un golpe directo o una torcedura, o la rodilla está claramente hinchada"],
   ["The knee locks, catches so you cannot straighten it, or gives way","La rodilla se bloquea, se traba y no la puedes estirar, o falla"],
   ["The kneecap has ever slipped out of place, or it feels like it will","La rótula se ha salido de su lugar alguna vez, o sientes que se va a salir"],
   ["Red, hot, or fever; or pain at night or at rest that keeps getting worse","Enrojecimiento, calor o fiebre; o dolor de noche o en reposo que sigue empeorando"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Calm it down & activate","Calma el dolor y activa"],wk:["1–3 weeks · daily","1–3 semanas · a diario"],
    goal:["Settle the knee, wake up the thigh and hip muscles, and keep moving without flares.","Calmar la rodilla, despertar los músculos del muslo y la cadera, y seguir moviéndote sin brotes."],
    ex:[
     {id:"rh_quadset",sets:3,r:10,hold:5,side:1},
     {id:"rh_slr",sets:3,r:10,side:1},
     {id:"clamshell",sets:3,r:15,side:1},
     {id:"rh_sideabd",sets:3,r:15,side:1},
     {id:"glutebr",sets:3,r:12},
     {id:"z_quad_stretch",sets:2,secs:30,side:1},
     {id:"z_calf_stretch_hands_against_wall",sets:2,secs:30,side:1}
    ],
    tip:["Cut the things that flare it (hills, deep squats, long stairs, long runs) by about half, but keep moving. Easy cycling with the seat high and low resistance is usually fine.","Reduce a la mitad lo que lo brota (cuestas, sentadillas profundas, escaleras largas, carreras largas), pero sigue moviéndote. Bicicleta suave con el asiento alto y poca resistencia suele estar bien."],
    adv:[["Walking 30 min and taking stairs with pain 3/10 or less","Caminar 30 min y subir escaleras con dolor de 3/10 o menos"],["No swelling in the knee","Sin hinchazón en la rodilla"],["10 bodyweight squats to about 45–60° with pain 3/10 or less","10 sentadillas con tu peso hasta unos 45–60° con dolor de 3/10 o menos"]]
   },
   {
    n:["Strengthen (higher volume)","Fortalece (más volumen)"],wk:["3–6 weeks · 3 days/week","3–6 semanas · 3 días por semana"],
    goal:["Build the hips and thighs. The guideline favours high volume, up to 3 sets of 30 or more reps, 3 times a week as you tolerate it.","Fortalecer cadera y muslos. La guía favorece volumen alto, hasta 3 series de 30 o más repeticiones, 3 veces por semana según lo toleres."],
    ex:[
     {id:"rh_wallsit",sets:3,secs:30},
     {id:"z_chair_squat",sets:3,r:15,note:["Work toward 30 reps per set over the weeks.","Sube hacia 30 repeticiones por serie con las semanas."]},
     {id:"bwstepup",sets:3,r:12,side:1},
     {id:"rh_stepdown",sets:3,r:10,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"sideplank",sets:3,secs:20,side:1}
    ],
    tip:["Knee over the middle toes, never caving inward. Pain up to 3/10 during the work is acceptable if it settles within an hour and is not worse the next morning.","Rodilla sobre los dedos del medio, sin caer hacia adentro. Dolor de hasta 3/10 durante el trabajo es aceptable si se calma en una hora y no empeora al día siguiente."],
    adv:[["Step-down 3×15 with the knee tracking well and pain 3/10 or less","Bajada de escalón 3×15 con buena alineación de rodilla y dolor de 3/10 o menos"],["Single-leg squat to about 45–60°, 10 reps, knee not caving in, pain 3/10 or less","Sentadilla a una pierna hasta unos 45–60°, 10 repeticiones, sin que la rodilla caiga hacia adentro, dolor de 3/10 o menos"],["Cycling or brisk walking 30–45 min with pain 3/10 or less","Bicicleta o caminata rápida 30–45 min con dolor de 3/10 o menos"]]
   },
   {
    n:["Load & get back to running","Carga y vuelve a correr"],wk:["4–8 weeks · 2–3 days/week","4–8 semanas · 2–3 días por semana"],
    goal:["Single-leg strength and control, then a gradual return to impact.","Fuerza y control a una pierna, y luego un regreso gradual al impacto."],
    ex:[
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"slsquat",sets:3,r:8,side:1},
     {id:"latstep",sets:3,r:10,side:1},
     {id:"sldl",sets:3,r:8,side:1},
     {id:"balslreach",sets:3,r:8,side:1}
    ],
    tip:["For running, a slightly faster step rate (about 5–10% more steps per minute) and fewer hills early on can lower knee load. Use the return-to-run table below.","Para correr, un paso un poco más rápido (5–10% más pasos por minuto) y menos cuestas al inicio pueden reducir la carga en la rodilla. Usa la tabla de vuelta a correr de abajo."],
    run:1,
    adv:[["Finish the 4-week walk/run program following the soreness rules","Terminar el programa de 4 semanas de caminar y correr siguiendo las reglas de dolor"],["10 single-leg hops without pain","10 saltos a una pierna sin dolor"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two sessions a week keep the hips and thighs strong. Go back a phase if it flares.","Dos sesiones a la semana mantienen fuertes cadera y muslos. Si se brota, regresa una fase."],
    ex:[
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"sideplank",sets:2,secs:30,side:1}
    ],
    tip:["Keep increasing running load gradually, by about 10% a week at most.","Sigue subiendo la carga de carrera poco a poco, máximo un 10% por semana."],
    adv:[]
   }
  ],
  src:["cpg","afp","rx3","mtss"]
 },
 {
  id:"shin",zone:"knee",em:"🦴",
  name:["Shin splints (inner shin pain)","Shin splints (dolor en la espinilla interna)"],
  sub:["Medial tibial stress syndrome","Síndrome de estrés tibial medial"],
  intro:["A dull, spread-out ache along the inner edge of the shinbone that starts when you run or march and eases with rest. It is an overload problem, so treatment is relative rest from the aggravating load, then criteria-based strengthening and a gradual return to running. This plan follows a published clinical guideline: you move on when you meet the criteria, not just when the weeks are up.","Un dolor sordo y extendido a lo largo del borde interno de la tibia que empieza al correr o marchar y mejora con el reposo. Es un problema de sobrecarga, así que el tratamiento es descansar de la carga que lo provoca, después fortalecer con criterios y volver a correr poco a poco. Este plan sigue una guía clínica publicada: avanzas cuando cumples los criterios, no solo cuando pasan las semanas."],
  evid:["Evidence: expert clinical guidelines and low-quality studies. No single cure has been proven, so the plan is conservative.","Evidencia: guías clínicas de expertos y estudios de baja calidad. No hay una cura única comprobada, por eso el plan es conservador."],
  flags:[
   ["Pain you can point to with one finger on a small spot (under about 5 cm) of the bone, or pain when you hop on one leg or just walk","Dolor que puedes señalar con un dedo en un punto pequeño (menos de unos 5 cm) del hueso, o dolor al saltar con una pierna o solo al caminar"],
   ["Pain at rest or that wakes you at night","Dolor en reposo o que te despierta de noche"],
   ["A tight, burning lower leg with numbness or tingling that comes on predictably with exercise and stops with rest","La pierna baja tensa y con ardor, con adormecimiento u hormigueo que llega de forma predecible con el ejercicio y se quita al descansar"],
   ["Clear swelling, redness or warmth in the shin","Hinchazón, enrojecimiento o calor evidentes en la espinilla"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Calm down & keep fit","Calma el dolor y mantén la forma"],wk:["1–4 weeks · daily","1–4 semanas · a diario"],
    goal:["Take the load off the shin, keep strength, mobility and balance, and stay fit without impact.","Quitarle carga a la espinilla, mantener fuerza, movilidad y equilibrio, y no perder condición sin impacto."],
    ex:[
     {id:"clamshell",sets:3,r:15,side:1},
     {id:"rh_hydrant",sets:3,r:12,side:1},
     {id:"plank",sets:3,secs:30},
     {id:"sideplank",sets:3,secs:20,side:1},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1},
     {id:"rh_bandev",sets:2,r:15,side:1},
     {id:"z_calf_stretch_hands_against_wall",sets:2,secs:30,side:1},
     {id:"rh_soleus",sets:2,secs:30,side:1},
     {id:"balsl",sets:3,secs:30,side:1}
    ],
    tip:["Replace running with cycling, swimming, pool running or upper-body work. If walking around the house hurts, ask a provider about a boot or splint for a couple of weeks.","Sustituye correr por bicicleta, natación, correr en alberca o trabajo de tren superior. Si caminar en casa te duele, pregunta a un profesional por una bota o férula por un par de semanas."],
    adv:[["No pain when you press along the inner shin","Sin dolor al presionar a lo largo de la espinilla interna"],["Everyday activities are pain-free","Las actividades diarias no duelen"],["Ankle bend (knee-to-wall) within about 5° of the other side","Flexión del tobillo (rodilla a la pared) a unos 5° del otro lado"]]
   },
   {
    n:["Rebuild strength","Reconstruye la fuerza"],wk:["2–6 weeks · 3 days/week","2–6 semanas · 3 días por semana"],
    goal:["Calf, foot and hip strength with controlled single-leg work. Return to activity at less than half your previous volume.","Fuerza de pantorrilla, pie y cadera con trabajo controlado a una pierna. Vuelve a la actividad con menos de la mitad de tu volumen anterior."],
    ex:[
     {id:"calfdb",sets:3,r:15,side:1},
     {id:"balfoam",sets:3,secs:30,side:1},
     {id:"bodysq",sets:3,r:15},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"rh_stepdown",sets:3,r:10,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1}
    ],
    tip:["Follow the soreness rules: soreness the next day means one day off and no step forward. Start any walking or jogging at under half your old volume.","Sigue las reglas de dolor: dolor al día siguiente significa un día de descanso y no avanzar. Empieza a caminar o trotar con menos de la mitad de tu volumen anterior."],
    adv:[["15 single-leg hops without pain","15 saltos a una pierna sin dolor"],["30-minute walk with little or no increase in pain","Caminata de 30 minutos con poco o ningún aumento de dolor"],["Squat holds: 6 reps of 6 seconds, holding about 60% of your body weight","Sentadilla isométrica: 6 repeticiones de 6 segundos sosteniendo cerca del 60% de tu peso"],["More than 25 single-leg heel raises on each side","Más de 25 elevaciones de talón a un pie de cada lado"]]
   },
   {
    n:["Impact & return to running","Impacto y vuelta a correr"],wk:["2–8 weeks · 3 days/week","2–8 semanas · 3 días por semana"],
    goal:["Soft landings and a graded return to running. Avoid hills, uneven and very hard surfaces at first.","Aterrizajes suaves y regreso gradual a correr. Evita cuestas, terreno irregular y superficies muy duras al principio."],
    ex:[
     {id:"balhop",sets:3,r:8},
     {id:"z_single_leg_hop_progression",sets:3,r:6,side:1},
     {id:"calfdb",sets:3,r:15,side:1},
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"balslreach",sets:3,r:8,side:1}
    ],
    tip:["Land softly, hips back and a little forward lean. A slightly shorter, quicker stride helps absorb shock.","Aterriza suave, cadera atrás y un poco de inclinación hacia adelante. Un paso un poco más corto y rápido ayuda a absorber el impacto."],
    run:1,
    adv:[["Finish the interval running program pain-free","Terminar el programa de carrera por intervalos sin dolor"]]
   },
   {
    n:["Back to full activity","Vuelta a la actividad completa"],wk:["Ongoing","Continuo"],
    goal:["Rebuild mileage and training under the 10%-a-week rule, and keep the strength work going twice a week.","Reconstruye kilometraje y entrenamiento con la regla del 10% por semana, y mantén el trabajo de fuerza dos veces por semana."],
    ex:[
     {id:"calfdb",sets:3,r:15,side:1},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"sideplank",sets:2,secs:30,side:1}
    ],
    tip:["If the pain comes back, drop one step in the plan and see a provider if it does not settle.","Si el dolor regresa, baja un paso en el plan y consulta a un profesional si no se calma."],
    adv:[]
   }
  ],
  src:["mtss","mtss2","rx3"]
 },
 {
  id:"sprain",zone:"foot",em:"🩹",
  name:["Sprained or unstable ankle","Esguince o tobillo inestable"],
  sub:["Return to full ankle function","Volver a la función completa del tobillo"],
  intro:["After a sprain, or if your ankle keeps rolling, the goal is to get motion back, rebuild strength and balance, and only then add jumping and cutting. Guidelines move you forward by what you can do (walking without a limp, balance, 25 single-leg heel raises, hop tests), so the weeks are only a guide.","Después de un esguince, o si el tobillo se te sigue doblando, el objetivo es recuperar el movimiento, reconstruir fuerza y equilibrio y solo después añadir saltos y cambios de dirección. Las guías te hacen avanzar por lo que puedes hacer (caminar sin cojear, equilibrio, 25 elevaciones de talón a un pie, pruebas de salto), así que las semanas son solo una guía."],
  evid:["Evidence: published rehabilitation protocols with progression criteria (guideline-based).","Evidencia: protocolos de rehabilitación publicados con criterios de progresión (basados en guías)."],
  flags:[
   ["You could not take 4 steps right after the injury, or you cannot now","No pudiste dar 4 pasos justo después de la lesión, o no puedes ahora"],
   ["Pressing on the bony bumps at the back of the ankle bones or the outer midfoot hurts a lot","Presionar los huesos del tobillo por atrás o la parte exterior del medio pie duele mucho"],
   ["The ankle looks deformed, or you have numbness, tingling or a cold foot","El tobillo se ve deformado, o tienes adormecimiento, hormigueo o el pie frío"],
   ["Severe swelling or bruising, or it is not improving after 1–2 weeks","Hinchazón o moretón severos, o no mejora después de 1–2 semanas"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Protect & start moving","Protege y empieza a moverte"],wk:["0–2 weeks · several times a day","0–2 semanas · varias veces al día"],
    goal:["Control swelling, get gentle motion back and walk with a normal heel-to-toe step.","Controlar la hinchazón, recuperar movimiento suave y caminar con un paso normal talón-punta."],
    ex:[
     {id:"z_ankle_circles",sets:2,secs:30,side:1},
     {id:"rh_seatheel",sets:3,r:15},
     {id:"rh_towelcurl",sets:2,r:15,side:1},
     {id:"balsl",sets:3,secs:20,side:1,note:["Only if it does not hurt. Hold a wall if needed.","Solo si no duele. Apóyate en una pared si hace falta."]}
    ],
    tip:["A brace or tape during walking helps early on. Raise the foot and use ice for swelling. Walk as normally as pain allows; do not limp on purpose.","Una férula o cinta al caminar ayuda al inicio. Eleva el pie y usa hielo para la hinchazón. Camina lo más normal que el dolor permita; no cojees a propósito."],
    adv:[["Full weight on the foot with little pain","Apoyo completo del pie con poco dolor"],["Swelling is minimal","La hinchazón es mínima"]]
   },
   {
    n:["Motion & strength","Movimiento y fuerza"],wk:["3–6 weeks · daily","3–6 semanas · a diario"],
    goal:["Full range of motion and band strength in all four directions, plus balance on firm and soft ground.","Rango de movimiento completo y fuerza con banda en las cuatro direcciones, más equilibrio en superficie firme y blanda."],
    ex:[
     {id:"rh_kneewall",sets:2,r:10,side:1},
     {id:"z_calf_stretch_hands_against_wall",sets:2,secs:30,side:1},
     {id:"rh_banddf",sets:2,r:15,side:1},
     {id:"rh_bandev",sets:2,r:15,side:1},
     {id:"rh_bandinv",sets:2,r:15,side:1},
     {id:"rh_dlheel",sets:3,r:15},
     {id:"balfoam",sets:3,secs:30,side:1}
    ],
    tip:["Keep the brace for sport and uneven ground. Pain up to 3/10 while you train is fine if it settles quickly.","Mantén la férula para deporte y terreno irregular. Dolor de hasta 3/10 mientras entrenas es aceptable si se calma pronto."],
    adv:[["Walking with a normal, non-limping stride","Caminar con un paso normal, sin cojear"],["Single-leg balance equal on both sides (30 s)","Equilibrio a un pie igual en ambos lados (30 s)"],["Full ankle motion compared with the other side","Movimiento completo del tobillo comparado con el otro lado"]]
   },
   {
    n:["Single-leg strength & control","Fuerza y control a una pierna"],wk:["7–10 weeks · 3 days/week","7–10 semanas · 3 días por semana"],
    goal:["Single-leg heel raises, reaching in different directions, and the first small hops.","Elevaciones de talón a un pie, alcances en distintas direcciones y los primeros saltos pequeños."],
    ex:[
     {id:"calfdb",sets:3,r:15,side:1,note:["Build toward 25 each side.","Sube hacia 25 de cada lado."]},
     {id:"balslreach",sets:3,r:8,side:1},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"latstep",sets:3,r:10,side:1},
     {id:"balhop",sets:3,r:8}
    ],
    tip:["Wear a lace-up brace for sport if it still feels unsure.","Usa una férula con agujetas para el deporte si todavía se siente inseguro."],
    adv:[["25 single-leg heel raises, or the same as the other side","25 elevaciones de talón a un pie, o igual que el otro lado"],["Reaching in all directions on one leg looks and feels the same on both sides","Alcanzar en todas las direcciones sobre una pierna se ve y se siente igual en ambos lados"],["Confident on uneven ground","Seguridad en terreno irregular"]]
   },
   {
    n:["Return to sport","Regreso al deporte"],wk:["11–16 weeks · 3 days/week","11–16 semanas · 3 días por semana"],
    goal:["Hops, change of direction and a return-to-running progression.","Saltos, cambios de dirección y progresión de regreso a correr."],
    ex:[
     {id:"z_single_leg_hop_progression",sets:3,r:6,side:1},
     {id:"z_single_leg_lateral_hop",sets:3,r:6,side:1},
     {id:"z_lateral_cone_hops",sets:3,r:8},
     {id:"calfdb",sets:3,r:20,side:1},
     {id:"splitsq",sets:3,r:10,side:1}
    ],
    tip:["Ready for full sport when single-leg hop tests are at least 90% of the other side and there is no pain or swelling afterwards. A clinic can test this.","Listo para el deporte completo cuando las pruebas de salto a una pierna llegan al menos al 90% del otro lado y no hay dolor ni hinchazón después. Una clínica puede medirlo."],
    run:1,
    adv:[]
   }
  ],
  src:["sprain","mtss"]
 }
];

/* ---- extra exercises for the library / ejercicios extra para la biblioteca ---- */
/* [id, English, Español, group, equipment, mode] */
const REHAB_EX=[
 ["rh_shortfoot","Short Foot (arch lift)","Pie corto (levantar el arco)","balance","bodyweight","bw"],
 ["rh_towelcurl","Towel Toe Scrunch","Arrugar la toalla con los dedos","balance","bodyweight","bw"],
 ["rh_bandinv","Band Ankle Inversion","Inversión de tobillo con banda","legs","band","bw"],
 ["rh_bandev","Band Ankle Eversion","Eversión de tobillo con banda","legs","band","bw"],
 ["rh_banddf","Band Toe Raise (dorsiflexion)","Elevar la punta del pie con banda","legs","band","bw"],
 ["rh_dlheel","Slow Two-Leg Heel Raise","Elevación de talón lenta con dos pies","legs","bodyweight","bw"],
 ["rh_seatheel","Seated Heel Raise","Elevación de talón sentado","legs","bodyweight","bw"],
 ["rh_eccheel","Slow Single-Leg Heel Lowering","Bajada lenta del talón a un pie","legs","bodyweight","bw"],
 ["rh_kneewall","Knee-to-Wall Ankle Mobility","Movilidad de tobillo rodilla a la pared","mobility","bodyweight","bw"],
 ["rh_soleus","Bent-Knee Calf Stretch (soleus)","Estiramiento de pantorrilla con rodilla flexionada","mobility","bodyweight","t"],
 ["rh_quadset","Quad Set (press the knee down)","Contracción de cuádriceps (presionar la rodilla)","legs","bodyweight","bw"],
 ["rh_slr","Straight-Leg Raise","Elevación de pierna recta","legs","bodyweight","bw"],
 ["rh_sideabd","Side-Lying Hip Abduction","Abducción de cadera acostado de lado","glutes","bodyweight","bw"],
 ["rh_hydrant","Fire Hydrant","Hidrante (levantar la rodilla de lado)","glutes","bodyweight","bw"],
 ["rh_wallsit","Wall Sit","Sentadilla isométrica en la pared","legs","bodyweight","t"],
 ["rh_stepdown","Slow Step-Down","Bajada lenta de escalón","legs","bodyweight","bw"]
];
const REHAB_HOW={
 rh_shortfoot:["Sit with your foot flat. Without curling your toes, draw the ball of the foot toward the heel so the arch lifts.|Hold 5 seconds, relax, repeat. Keep the toes long and the heel and the ball of the foot on the floor.|When it feels easy, do it standing on both feet, then on one foot.","Siéntate con el pie apoyado. Sin encoger los dedos, acerca la base del dedo gordo hacia el talón para que el arco se eleve.|Sostén 5 segundos, relaja y repite. Mantén los dedos largos y el talón y la base de los dedos pegados al piso.|Cuando sea fácil, hazlo de pie con los dos pies y luego con un solo pie.","Curling the toes or rolling onto the outside of the foot.","Encoger los dedos o irse hacia el borde externo del pie."],
 rh_towelcurl:["Sit with your foot flat on a small towel.|Scrunch the toes to pull the towel toward you, then push it back out.|Keep the heel down.","Siéntate con el pie sobre una toalla pequeña.|Encoge los dedos para jalar la toalla hacia ti y luego empújala hacia afuera.|Mantén el talón abajo.","Lifting the heel to pull harder.","Levantar el talón para jalar con más fuerza."],
 rh_bandinv:["Sit with the leg straight and a band looped around the front of the foot, anchored on the outside (a table leg works).|Turn the sole of the foot inward against the band, slowly, over about 2 seconds.|Return slowly over 2–3 seconds. Move only the ankle, not the whole leg.","Siéntate con la pierna estirada y una banda alrededor de la parte delantera del pie, anclada por el lado externo (una pata de mesa sirve).|Gira la planta del pie hacia adentro contra la banda, despacio, en unos 2 segundos.|Regresa en 2–3 segundos. Mueve solo el tobillo, no toda la pierna.","Rotating the whole leg or hip instead of the ankle.","Girar toda la pierna o la cadera en lugar del tobillo."],
 rh_bandev:["Sit with the leg straight and a band around the front of the foot, anchored on the inside.|Turn the sole of the foot outward against the band, slowly.|Return slowly. Move only the ankle.","Siéntate con la pierna estirada y una banda alrededor de la parte delantera del pie, anclada por dentro.|Gira la planta del pie hacia afuera contra la banda, despacio.|Regresa despacio. Mueve solo el tobillo.","Letting the knee roll to help.","Dejar que la rodilla gire para ayudar."],
 rh_banddf:["Sit with the leg straight and a band around the top of the foot, anchored in front of you.|Pull the toes up toward your shin against the band, slowly.|Lower slowly.","Siéntate con la pierna estirada y una banda sobre el empeine, anclada frente a ti.|Jala los dedos hacia la espinilla contra la banda, despacio.|Baja despacio.","Moving fast or using the knee.","Moverse rápido o usar la rodilla."],
 rh_dlheel:["Stand on both feet, holding a wall for balance if you need to.|Rise onto the balls of your feet over 2 seconds, pause, and lower over 3 seconds.|Keep weight over the big toe side and the arch lifted.","De pie con los dos pies; apóyate en la pared si necesitas equilibrio.|Sube sobre la punta de los pies en 2 segundos, pausa y baja en 3 segundos.|Mantén el peso hacia el lado del dedo gordo y el arco levantado.","Rolling onto the outside of the feet.","Irse hacia el borde externo de los pies."],
 rh_seatheel:["Sit with feet flat on the floor.|Lift both heels as high as you can, then lower slowly.|Keep the toes on the floor.","Siéntate con los pies planos en el piso.|Levanta los dos talones lo más alto que puedas y baja despacio.|Mantén la punta de los pies en el piso.","Bouncing instead of controlling the lowering.","Rebotar en lugar de controlar la bajada."],
 rh_eccheel:["Stand on a step (or flat floor) next to a wall for balance. Rise onto your toes using both feet.|Shift your weight to one foot and lower the heel slowly over about 3 seconds.|Come back up with both feet and repeat. Add a held weight only when 15 reps are easy.","Párate en un escalón (o en el piso) junto a una pared. Sube sobre la punta de los pies con los dos pies.|Pasa el peso a un solo pie y baja el talón despacio en unos 3 segundos.|Sube con los dos pies y repite. Añade peso en la mano solo cuando 15 repeticiones sean fáciles.","Dropping fast, or letting the ankle roll outward on the way down.","Bajar rápido o dejar que el tobillo gire hacia afuera al bajar."],
 rh_kneewall:["Stand facing a wall with one foot about a hand-width from it, heel down.|Bend the knee forward to touch the wall without lifting the heel.|Return and repeat. Move the foot back a little each week as it gets easy.","De frente a una pared, con un pie a un palmo de ella y el talón abajo.|Dobla la rodilla hacia adelante para tocar la pared sin levantar el talón.|Regresa y repite. Aleja el pie un poco cada semana cuando sea fácil.","Lifting the heel or letting the arch collapse.","Levantar el talón o dejar caer el arco."],
 rh_soleus:["Face a wall, one foot back with the knee bent and the heel flat.|Lean forward until you feel a stretch lower in the calf, near the Achilles.|Hold for the time shown.","De frente a la pared, un pie atrás con la rodilla flexionada y el talón plano.|Inclínate hacia adelante hasta sentir el estiramiento en la parte baja de la pantorrilla, cerca del Aquiles.|Sostén el tiempo indicado.","Lifting the heel.","Levantar el talón."],
 rh_quadset:["Sit or lie with the leg straight and a small rolled towel under the knee.|Tighten the front thigh and press the back of the knee down into the towel.|Hold 5 seconds, relax.","Sentado o acostado con la pierna estirada y una toalla enrollada bajo la rodilla.|Aprieta el muslo y presiona la parte de atrás de la rodilla contra la toalla.|Sostén 5 segundos y relaja.","Holding your breath.","Aguantar la respiración."],
 rh_slr:["Lie on your back, one knee bent, the other leg straight.|Tighten the thigh and lift the straight leg to the height of the other knee.|Lower slowly. Keep the knee fully straight.","Acostado boca arriba, una rodilla flexionada y la otra pierna estirada.|Aprieta el muslo y levanta la pierna estirada hasta la altura de la otra rodilla.|Baja despacio. Mantén la rodilla totalmente estirada.","Arching the lower back or bending the knee.","Arquear la espalda baja o doblar la rodilla."],
 rh_sideabd:["Lie on your side with the bottom knee bent for balance and the top leg straight in line with your body.|Lift the top leg toward the ceiling, toes pointing forward or slightly down.|Lower slowly. Do not roll the hips back.","Acostado de lado con la rodilla de abajo flexionada y la pierna de arriba recta, alineada con el cuerpo.|Levanta la pierna de arriba hacia el techo con los dedos al frente o un poco hacia abajo.|Baja despacio. No gires la cadera hacia atrás.","Rolling the hips backward and using the back instead of the glute.","Girar la cadera hacia atrás y usar la espalda en lugar del glúteo."],
 rh_hydrant:["Start on hands and knees, back flat.|Keeping the knee bent, lift one knee out to the side to about hip height.|Lower slowly without shifting your body.","En cuatro apoyos, espalda recta.|Con la rodilla doblada, levanta una rodilla hacia el lado hasta la altura de la cadera.|Baja despacio sin desplazar el cuerpo.","Twisting the trunk to get the knee higher.","Girar el tronco para subir más la rodilla."],
 rh_wallsit:["Lean your back on a wall and slide down until your knees are bent about 45–60° (not deep).|Feet under the knees, weight even through both feet.|Hold for the time shown.","Apoya la espalda en la pared y desliza hacia abajo hasta flexionar las rodillas unos 45–60° (no muy profundo).|Pies bajo las rodillas, peso parejo en ambos pies.|Sostén el tiempo indicado.","Going too deep, or letting the knees cave inward.","Bajar demasiado o dejar que las rodillas caigan hacia adentro."],
 rh_stepdown:["Stand on a low step (about 10–15 cm) on one foot, the other foot hanging off the edge.|Bend the standing knee and lower the other heel slowly toward the floor over about 3 seconds, knee over the middle toes.|Tap lightly and come back up using the standing leg.","Párate en un escalón bajo (unos 10–15 cm) con un pie y deja el otro colgando.|Dobla la rodilla de apoyo y baja el otro talón despacio hacia el piso en unos 3 segundos, con la rodilla sobre los dedos del medio.|Toca ligero y sube usando la pierna de apoyo.","Letting the knee drift inward or the hip drop.","Dejar que la rodilla se vaya hacia adentro o que la cadera caiga."]
};
/* join the new exercises to the library and the how-to guide / sumar los ejercicios a la biblioteca y a la guía */
(function(){REHAB_EX.forEach(function(a){if(!EXLIB.some(function(b){return b[0]===a[0];}))EXLIB.push(a);});for(const k in REHAB_HOW)if(!HOWTO[k])HOWTO[k]=REHAB_HOW[k];})();
