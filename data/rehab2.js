/* Recovery plans, part 2 (v0.99.9): Achilles, plantar heel, patellar tendon, lateral hip, hamstring, low back, neck, shoulder, elbow.
   Planes de recuperación, parte 2 (v0.99.9). Same format as data/rehab.js. Pair = [English, Español]. Not medical advice. */

Object.assign(REHAB_SRC,{
 achilles:{t:"Chimenti RL et al. Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision – 2024. J Orthop Sports Phys Ther 2024;54(12):CPG1–CPG32.",u:"https://www.orthopt.org/uploads/content_files/files/Achilles_Pain_revision_2024.pdf"},
 achclin:{t:"Achilles Foot and Ankle Center. Achilles tendinopathy physical therapy protocol: phases (clinic protocol used for the isometric, heavy slow loading and hop progressions).",u:"https://achillesfootandankle.com/achilles-tendinopathy-physical-therapy-protocol/"},
 heel:{t:"Koc TA Jr et al. Heel Pain – Plantar Fasciitis: Revision 2023. J Orthop Sports Phys Ther 2023.",u:"https://pubmed.ncbi.nlm.nih.gov/38037331/"},
 patt:{t:"Patellar tendinopathy rehabilitation protocol (University of Delaware Physical Therapy Clinic): isometrics, heavy slow resistance, decline squats, return to jumping.",u:"https://bpb-us-w2.wpmucdn.com/sites.udel.edu/dist/c/3448/files/2016/01/Patellar-Tendinopathy.pdf"},
 leap:{t:"Mellor R et al. Education plus exercise versus corticosteroid injection use versus a wait and see approach on global outcome and pain from gluteal tendinopathy. BMJ 2018;361:k1662.",u:"https://wikiMSK.org/w/img_auth.php/4/46/Mellor2018_-_Leap_Trial.pdf"},
 hams:{t:"Sanford Health. Proximal/mid hamstring strain rehabilitation guideline (criterion-based phases).",u:"https://www.sanfordhealth.org/-/media/org/files/medical-professionals/resources-and-education/proximal_mid-hamstring-strains-rehab-guideline.pdf"},
 lbp:{t:"George SZ et al. Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021. J Orthop Sports Phys Ther 2021;51(11):CPG1–CPG60.",u:"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"},
 neck:{t:"Blanpied PR et al. Neck Pain: Revision 2017. Clinical Practice Guidelines. J Orthop Sports Phys Ther 2017;47(7):A1–A83.",u:"https://www.jospt.org/doi/10.2519/jospt.2017.0302"},
 cuff:{t:"Desmeules F et al. Rotator Cuff Tendinopathy Diagnosis, Nonsurgical Medical Care, and Rehabilitation: A Clinical Practice Guideline. J Orthop Sports Phys Ther 2025;55(4):235–274.",u:"https://doi.org/10.2519/jospt.2025.13182"},
 cuffp:{t:"Saint Louis University Sports Medicine. Rotator cuff tendinosis non-operative treatment protocol (three phases: mobility, strengthening, function).",u:"https://slu.edu/medicine/orthopaedic-surgery/-pdf/rotator_cuff_tear_tendinosis_non-operative_treatment_protocol_slu.pdf"},
 elbow:{t:"Mass General Brigham. Rehabilitation protocol for medial and lateral epicondylitis (phases, progression and return criteria).",u:"https://www.massgeneralbrigham.org/content/dam/unified-xwalk/pdf/patient-education/english/rehabilitation-protocol-for-medial-lateral-epicondylitis.pdf"}
});

REHAB.push(
 {
  id:"achilles",zone:"foot",em:"🦶",
  name:["Achilles tendon pain","Dolor del tendón de Aquiles"],
  sub:["Midportion Achilles tendinopathy","Tendinopatía del Aquiles (parte media)"],
  intro:["Pain and stiffness in the Achilles tendon, 2–6 cm above the heel bone, worst first thing in the morning and when you start to run. The best-supported treatment is progressive loading of the calf and tendon, as heavy as you can tolerate, and you do not need complete rest. Tendons adapt slowly: expect 3 months or more.","Dolor y rigidez en el tendón de Aquiles, a 2–6 cm del hueso del talón, peor al levantarte y al empezar a correr. El tratamiento con mejor respaldo es cargar de forma progresiva la pantorrilla y el tendón, lo más pesado que toleres, sin necesidad de reposo total. Los tendones se adaptan despacio: cuenta 3 meses o más."],
  evid:["Evidence: strong for progressive tendon loading (clinical practice guideline, grade A). Doses here also use a published clinic protocol.","Evidencia: sólida para la carga progresiva del tendón (guía clínica, grado A). Las dosis también usan un protocolo clínico publicado."],
  flags:[
   ["You felt or heard a pop or snap at the back of the ankle and cannot push off or rise on your toes","Sentiste u oíste un chasquido en la parte de atrás del tobillo y no puedes empujar ni ponerte de puntillas"],
   ["A gap you can feel in the tendon, or sudden severe pain with bruising","Un hueco que se siente en el tendón, o dolor intenso repentino con moretón"],
   ["The pain started after taking a fluoroquinolone antibiotic (ciprofloxacin, levofloxacin)","El dolor empezó después de tomar un antibiótico fluoroquinolona (ciprofloxacino, levofloxacino)"],
   ["Pain in the heel bone itself, redness, heat, or swelling of the whole ankle","Dolor en el hueso del talón mismo, enrojecimiento, calor o hinchazón de todo el tobillo"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Settle it & isometric holds","Calma y sostenidos isométricos"],wk:["2–4 weeks · daily","2–4 semanas · a diario"],
    goal:["Calm the tendon and get pain relief from holding the calf contracted without moving.","Calmar el tendón y aliviar el dolor sosteniendo la pantorrilla contraída sin moverla."],
    ex:[
     {id:"rh_isocalf",sets:5,secs:45,side:1,note:["Rise up about 2–3 inches, knee straight, and hold. Rest 2 minutes between holds.","Sube unos 5–7 cm con la rodilla recta y sostén. Descansa 2 minutos entre sostenidos."]},
     {id:"rh_dlheel",sets:2,r:15},
     {id:"balsl",sets:3,secs:30,side:1},
     {id:"glutebr",sets:3,r:12}
    ],
    tip:["Pain up to 5/10 during is acceptable if it settles to your usual level within 24 hours. Cut jumping, sprinting and hills for now, and break up long walks. Cushioned shoes with a modest heel can help.","Dolor de hasta 5/10 durante el ejercicio es aceptable si vuelve a tu nivel habitual en 24 horas. Por ahora evita saltos, sprints y cuestas y divide las caminatas largas. Calzado amortiguado con algo de tacón ayuda."],
    adv:[["Daily pain mostly 3/10 or less","Dolor diario casi siempre de 3/10 o menos"],["20–30 min of walking is tolerated","Toleras caminar 20–30 min"]]
   },
   {
    n:["Heavy, slow loading","Carga pesada y lenta"],wk:["6–8+ weeks · daily or every other day","6–8+ semanas · a diario o cada tercer día"],
    goal:["Build the tendon: slow lowering and slow raising, adding weight as it gets easy. The guideline says as heavy as you can tolerate.","Fortalecer el tendón: bajar y subir despacio, añadiendo peso cuando sea fácil. La guía dice lo más pesado que toleres."],
    ex:[
     {id:"rh_eccheel",sets:3,r:15,side:1,note:["Hold a weight or wear a backpack and add a little every 4–5 days.","Sostén peso o usa una mochila y añade un poco cada 4–5 días."]},
     {id:"calfdb",sets:3,r:12,side:1},
     {id:"seatcalf",sets:3,r:12,note:["Bent-knee version works the deeper calf muscle.","La versión con rodilla doblada trabaja el músculo profundo de la pantorrilla."]},
     {id:"clamshell",sets:2,r:15,side:1}
    ],
    tip:["Morning stiffness that gets shorter is the sign it is working. If pain is still raised the next day, you did too much: halve the reps, then cut the load by a quarter.","Que la rigidez de la mañana dure menos es la señal de que funciona. Si el dolor sigue elevado al día siguiente, hiciste demasiado: reduce las repeticiones a la mitad y luego baja la carga un cuarto."],
    adv:[["5 holds of 60 s with pain 3/10 or less","5 sostenidos de 60 s con dolor de 3/10 o menos"],["Morning stiffness under 10 minutes","Rigidez matutina menor de 10 minutos"],["Walking 30–40 min with no flare-up","Caminar 30–40 min sin brotes"]]
   },
   {
    n:["Spring & hops","Rebote y saltos"],wk:["4–6 weeks · 3 days/week, 48 h apart","4–6 semanas · 3 días por semana, con 48 h entre sesiones"],
    goal:["Teach the tendon to store and release energy: hops from small to bigger, with short ground contact.","Enseñar al tendón a almacenar y soltar energía: saltos de pequeños a más grandes, con contacto corto con el piso."],
    ex:[
     {id:"rh_eccheel",sets:3,r:12,side:1},
     {id:"balhop",sets:3,r:10,note:["Start with small two-foot hops in place.","Empieza con saltos pequeños en el lugar con los dos pies."]},
     {id:"z_single_leg_hop_progression",sets:3,r:5,side:1},
     {id:"splitsq",sets:3,r:10,side:1}
    ],
    tip:["Start only if you can do 20 two-leg calf raises in a row without more than 4/10 pain or a next-day flare. Do hops on a soft, flat surface.","Empieza solo si puedes hacer 20 elevaciones seguidas con dos pies sin más de 4/10 de dolor ni brote al día siguiente. Haz los saltos en una superficie plana y blanda."],
    adv:[["Single-leg hops without pain and no flare the next day","Saltos a una pierna sin dolor y sin brote al día siguiente"],["Strong single-leg heel raises with good control","Elevaciones de talón a un pie fuertes y con buen control"]]
   },
   {
    n:["Back to running","Vuelta a correr"],wk:["6–8 weeks · every other day","6–8 semanas · cada tercer día"],
    goal:["A gradual walk/run return, while keeping the calf strength work twice a week.","Regreso gradual caminando y corriendo, manteniendo el trabajo de fuerza de pantorrilla dos veces por semana."],
    ex:[
     {id:"rh_eccheel",sets:3,r:12,side:1},
     {id:"calfdb",sets:3,r:12,side:1},
     {id:"balslreach",sets:3,r:8,side:1}
    ],
    tip:["Increase weekly running load by about 10% at most. If pain goes above 3/10 during a run or is up the next morning, repeat the week.","Sube la carga semanal de carrera máximo un 10%. Si el dolor pasa de 3/10 al correr o está elevado al día siguiente, repite la semana."],
    run:1,
    adv:[]
   }
  ],
  src:["achilles","achclin","mtss"]
 },
 {
  id:"plantar",zone:"foot",em:"🦶",
  name:["Heel pain (plantar fasciitis)","Dolor de talón (fascitis plantar)"],
  sub:["Plantar heel pain","Dolor plantar del talón"],
  intro:["Pain under the heel, sharpest with the first steps in the morning or after sitting, easing as you warm up. Guidelines support two things: stretching the plantar fascia and calf, and progressive heavy strengthening of the calf and foot. Taping for a few weeks and a night splint can add relief. It often takes months.","Dolor bajo el talón, más fuerte con los primeros pasos de la mañana o después de estar sentado, y que mejora al calentar. Las guías respaldan dos cosas: estirar la fascia plantar y la pantorrilla, y fortalecer de forma progresiva y pesada la pantorrilla y el pie. Una cinta por unas semanas y una férula nocturna pueden ayudar. Suele tardar meses."],
  evid:["Evidence: strong for stretching and for high-load strengthening, which beat stretching alone at 3 months in one trial (clinical practice guideline).","Evidencia: sólida para estiramiento y para fortalecimiento de carga alta, que superó al estiramiento solo a los 3 meses en un ensayo (guía clínica)."],
  flags:[
   ["Heel pain after a fall, a jump from height, or a direct blow","Dolor de talón tras una caída, un salto desde altura o un golpe directo"],
   ["Numbness, tingling or burning in the foot or heel","Adormecimiento, hormigueo o ardor en el pie o el talón"],
   ["You cannot put weight on the heel, or it is swollen, red or hot, or you have a fever","No puedes apoyar el talón, o está hinchado, rojo o caliente, o tienes fiebre"],
   ["Both heels hurt together with back stiffness or joint pain elsewhere","Duelen los dos talones junto con rigidez de espalda o dolor en otras articulaciones"],
   ["Pain at night or at rest that does not ease","Dolor de noche o en reposo que no cede"]
  ],
  phases:[
   {
    n:["Stretch & calm","Estira y calma"],wk:["1–3 weeks · daily","1–3 semanas · a diario"],
    goal:["Stretch the arch and calf, and cut the load that irritates the heel.","Estirar el arco y la pantorrilla, y reducir la carga que irrita el talón."],
    ex:[
     {id:"rh_pfstretch",sets:3,secs:30,side:1,note:["Do it before your first steps in the morning.","Hazlo antes de dar tus primeros pasos de la mañana."]},
     {id:"z_calf_stretch_hands_against_wall",sets:3,secs:30,side:1},
     {id:"rh_soleus",sets:3,secs:30,side:1},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1},
     {id:"rh_towelcurl",sets:2,r:15,side:1}
    ],
    tip:["Avoid going barefoot on hard floors and wear cushioned, supportive shoes. Short-term taping (1–6 weeks) or a night splint (1–3 months) can help if the first step in the morning is the worst.","Evita andar descalzo en pisos duros y usa calzado amortiguado y con soporte. Una cinta a corto plazo (1–6 semanas) o una férula nocturna (1–3 meses) puede ayudar si el primer paso de la mañana es el peor."],
    adv:[["First-step pain is clearly lower than at the start","El dolor del primer paso es claramente menor que al inicio"],["Daily pain mostly 3/10 or less","Dolor diario casi siempre de 3/10 o menos"]]
   },
   {
    n:["High-load heel raises","Elevaciones de talón con carga alta"],wk:["6–12 weeks · every other day","6–12 semanas · cada tercer día"],
    goal:["Slow, heavy heel raises with the toes lifted on a towel roll, the key strengthening in the trial that beat stretching.","Elevaciones de talón lentas y pesadas con los dedos elevados sobre un rollo de toalla, el trabajo de fuerza clave del ensayo que superó al estiramiento."],
    ex:[
     {id:"rh_towelheel",sets:3,r:12,note:["Take 3 s up, hold 2 s, 3 s down. Add weight so the last reps are hard, working toward 8 reps.","Sube en 3 s, sostén 2 s, baja en 3 s. Añade peso para que las últimas repeticiones sean difíciles, hacia 8 repeticiones."]},
     {id:"rh_pfstretch",sets:2,secs:30,side:1},
     {id:"z_calf_stretch_hands_against_wall",sets:2,secs:30,side:1},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1}
    ],
    tip:["Pain of 3–4/10 during is acceptable if it settles within a day. Aim for a heavy final set, not volume.","Dolor de 3–4/10 durante el ejercicio es aceptable si se calma en un día. Busca una última serie pesada, no volumen."],
    adv:[["Heel raises with added weight at 8 reps with pain 3/10 or less","Elevaciones de talón con peso añadido a 8 repeticiones con dolor de 3/10 o menos"],["Walking 30–45 min without a flare-up","Caminar 30–45 min sin brotes"]]
   },
   {
    n:["Back to impact","Vuelta al impacto"],wk:["3–6 weeks · 3 days/week","3–6 semanas · 3 días por semana"],
    goal:["Single-leg control, then hops and a walk/run return.","Control a una pierna, luego saltos y regreso caminando y corriendo."],
    ex:[
     {id:"rh_towelheel",sets:3,r:10},
     {id:"calfdb",sets:3,r:12,side:1},
     {id:"balslreach",sets:3,r:8,side:1},
     {id:"balhop",sets:3,r:8}
    ],
    tip:["Build running by no more than about 10% a week. Keep the shoes cushioned.","Sube la carrera máximo un 10% por semana. Mantén el calzado amortiguado."],
    run:1,
    adv:[["Finish the 4-week walk/run program with pain 3/10 or less","Terminar el programa de 4 semanas de caminar y correr con dolor de 3/10 o menos"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two short sessions a week keep the arch and calf strong. Go back a phase if it flares.","Dos sesiones cortas a la semana mantienen fuertes el arco y la pantorrilla. Si se brota, regresa una fase."],
    ex:[
     {id:"rh_towelheel",sets:2,r:10},
     {id:"rh_pfstretch",sets:2,secs:30,side:1},
     {id:"rh_shortfoot",sets:2,r:10,hold:5,side:1}
    ],
    tip:["Replace worn running shoes and avoid sudden jumps in distance.","Cambia los tenis gastados y evita saltos bruscos de distancia."],
    adv:[]
   }
  ],
  src:["heel","rx3"]
 },
 {
  id:"patellar",zone:"knee",em:"🦵",
  name:["Patellar tendon pain (jumper's knee)","Dolor del tendón rotuliano (rodilla del saltador)"],
  sub:["Patellar tendinopathy","Tendinopatía rotuliana"],
  intro:["Pain right below the kneecap, worse with jumping, landing, squatting and stairs. It is a tendon overload problem, so the plan is progressive loading of the thigh: first isometric holds to calm it, then heavy slow strength work, then jumping. Pain up to 5/10 during exercise is allowed as long as it is back to normal by the next morning.","Dolor justo debajo de la rótula, peor al saltar, aterrizar, hacer sentadillas y subir escaleras. Es un problema de sobrecarga del tendón, así que el plan es cargar el muslo de forma progresiva: primero sostenidos isométricos para calmarlo, luego fuerza pesada y lenta, y después saltos. Se permite dolor de hasta 5/10 durante el ejercicio si al día siguiente ya está normal."],
  evid:["Evidence: moderate (loading programs and clinic protocols; the doses come from a published protocol).","Evidencia: moderada (programas de carga y protocolos clínicos; las dosis vienen de un protocolo publicado)."],
  flags:[
   ["Sudden sharp pain with a pop, a gap below the kneecap, or you cannot lift the straight leg","Dolor agudo repentino con chasquido, un hueco bajo la rótula, o no puedes levantar la pierna recta"],
   ["The knee locks, gives way, or is clearly swollen","La rodilla se bloquea, falla o está claramente hinchada"],
   ["Pain after a fall or a direct blow","Dolor tras una caída o un golpe directo"],
   ["Red, hot, or fever; or pain at night or at rest that keeps getting worse","Rojo, caliente o fiebre; o dolor de noche o en reposo que sigue empeorando"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"]
  ],
  phases:[
   {
    n:["Calm it: isometric holds","Calma: sostenidos isométricos"],wk:["1–3 weeks · daily","1–3 semanas · a diario"],
    goal:["Hold the thigh contracted at a knee angle that is comfortable, and keep the hips strong.","Mantener el muslo contraído en un ángulo de rodilla cómodo y conservar fuertes las caderas."],
    ex:[
     {id:"rh_wallsit",sets:5,secs:45,note:["Knees bent 45–60°. A slightly deeper angle is fine if it does not hurt more.","Rodillas dobladas 45–60°. Un ángulo algo más profundo está bien si no duele más."]},
     {id:"clamshell",sets:3,r:15,side:1},
     {id:"rh_sideabd",sets:3,r:15,side:1},
     {id:"glutebr",sets:3,r:12}
    ],
    tip:["Cut jumping and deep squats by about half but keep moving. Pain up to 5/10 during is fine if it returns to normal by morning.","Reduce a la mitad los saltos y las sentadillas profundas pero sigue moviéndote. Dolor de hasta 5/10 durante es aceptable si vuelve a lo normal para la mañana."],
    adv:[["Isometric holds and sit-to-stands cause 5/10 pain or less","Los sostenidos isométricos y levantarte de una silla causan dolor de 5/10 o menos"]]
   },
   {
    n:["Heavy, slow strength","Fuerza pesada y lenta"],wk:["4–8 weeks · every other day","4–8 semanas · cada tercer día"],
    goal:["3 seconds down, 3 seconds up, with weight that makes the last reps hard. Move from 15 reps to about 6 over the weeks.","3 segundos bajando, 3 segundos subiendo, con un peso que haga difíciles las últimas repeticiones. Baja de 15 repeticiones hacia unas 6 con las semanas."],
    ex:[
     {id:"legpress",sets:3,r:12,note:["Use 90° to nearly straight. Add weight every week.","Usa de 90° a casi recto. Añade peso cada semana."]},
     {id:"z_chair_squat",sets:3,r:12},
     {id:"rh_stepdown",sets:3,r:10,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"rh_wallsit",sets:3,secs:45}
    ],
    tip:["No leg press? Slow bodyweight squats to a chair, holding a weight, do the same job.","¿No tienes prensa? Sentadillas lentas a una silla, con peso en las manos, cumplen lo mismo."],
    adv:[["Single-leg squat to a chair 3×8 with pain 5/10 or less and normal by the next morning","Sentadilla a una pierna hacia una silla 3×8 con dolor de 5/10 o menos y normal a la mañana siguiente"]]
   },
   {
    n:["Rebuild: decline squats","Reconstruye: sentadillas en declive"],wk:["4–6 weeks","4–6 semanas"],
    goal:["Single-leg work and the decline squat, which loads the tendon harder, going from 3×8 to 3×15.","Trabajo a una pierna y la sentadilla en declive, que carga más el tendón, de 3×8 a 3×15."],
    ex:[
     {id:"rh_declinesq",sets:3,r:10,side:1,note:["Stand on a board or stack of books tilted about 25° and squat slowly.","Párate sobre una tabla o libros inclinados unos 25° y haz la sentadilla despacio."]},
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"latstep",sets:3,r:10,side:1},
     {id:"sldl",sets:3,r:8,side:1}
    ],
    tip:["Move from daily to every other day if the tendon feels sore the next morning.","Pasa de diario a cada tercer día si el tendón amanece adolorido."],
    adv:[["Single-leg decline squat 3×15 with pain 5/10 or less","Sentadilla en declive a una pierna 3×15 con dolor de 5/10 o menos"],["Light hopping in place causes no more than 3/10","Saltitos ligeros en el lugar causan no más de 3/10"]]
   },
   {
    n:["Back to jumping","Vuelta a los saltos"],wk:["4+ weeks","4+ semanas"],
    goal:["Jump, land, accelerate, change direction. Raise volume first, then intensity.","Saltar, aterrizar, acelerar, cambiar de dirección. Sube primero el volumen y luego la intensidad."],
    ex:[
     {id:"balhop",sets:3,r:8},
     {id:"z_single_leg_hop_progression",sets:3,r:6,side:1},
     {id:"z_lateral_cone_hops",sets:3,r:8},
     {id:"rh_declinesq",sets:3,r:12,side:1}
    ],
    tip:["Keep strength work 2 times a week for good. Return to full training step by step, not all at once.","Mantén el trabajo de fuerza 2 veces por semana. Vuelve al entrenamiento completo paso a paso, no de golpe."],
    run:1,
    adv:[]
   }
  ],
  src:["patt","cpg"]
 },
 {
  id:"hiplat",zone:"hip",em:"🦴",
  name:["Outer hip pain (gluteal tendinopathy)","Dolor en el lado externo de la cadera (tendinopatía glútea)"],
  sub:["Greater trochanteric pain","Dolor trocantérico"],
  intro:["An ache over the bony point on the outside of the hip, worse lying on that side, climbing stairs, standing on one leg or after running. It is usually the gluteal tendons being irritated by compression and overload. In a good trial, education to avoid compression plus a progressive hip-strengthening program beat both a steroid injection and doing nothing at 8 weeks and at a year.","Dolor sobre el punto óseo del lado externo de la cadera, peor al acostarte de ese lado, subir escaleras, pararte en una pierna o después de correr. Suele ser que los tendones de los glúteos se irritan por compresión y sobrecarga. En un buen ensayo, la educación para evitar la compresión más un programa progresivo de fuerza de cadera superó tanto a la inyección de esteroides como a no hacer nada a las 8 semanas y al año."],
  evid:["Evidence: good (randomised trial; education plus exercise success 77% at 8 weeks).","Evidencia: buena (ensayo aleatorizado; éxito de educación más ejercicio del 77% a las 8 semanas)."],
  flags:[
   ["Hip or groin pain after a fall, or you limp or cannot put weight on the leg","Dolor de cadera o ingle tras una caída, o cojeas o no puedes apoyar la pierna"],
   ["Deep groin pain when running that gets worse each run (possible stress fracture)","Dolor profundo en la ingle al correr que empeora en cada carrera (posible fractura por estrés)"],
   ["Constant night pain that does not depend on lying on the sore side","Dolor nocturno constante que no depende de acostarte sobre el lado adolorido"],
   ["Fever, redness or heat over the hip","Fiebre, enrojecimiento o calor sobre la cadera"],
   ["Back pain with numbness or weakness down the leg","Dolor de espalda con adormecimiento o debilidad en la pierna"]
  ],
  phases:[
   {
    n:["Protect the tendon & isometrics","Protege el tendón e isométricos"],wk:["2–3 weeks · daily","2–3 semanas · a diario"],
    goal:["Take compression off the tendon and start gentle, pain-free isometric work.","Quitarle compresión al tendón y empezar con trabajo isométrico suave y sin dolor."],
    ex:[
     {id:"rh_isoabd",sets:3,secs:30,side:1,note:["Press the outside of the thigh into a wall or a belt, with the knee slightly bent.","Presiona la parte externa del muslo contra una pared o un cinturón, con la rodilla un poco doblada."]},
     {id:"glutebr",sets:3,r:12},
     {id:"balsl",sets:3,secs:20,side:1,note:["Keep the pelvis level; do not let it drop.","Mantén la pelvis nivelada; no dejes que caiga."]},
     {id:"rh_sideabd",sets:2,r:10,side:1}
    ],
    tip:["Avoid compression: do not cross your legs, do not stand with weight hanging on one hip, sit with hips higher than knees, and put a pillow between your knees if you sleep on your side. Do not stretch the outer hip (cross-body knee pull); it compresses the tendon.","Evita la compresión: no cruces las piernas, no te pares dejando el peso colgando de una cadera, siéntate con las caderas más altas que las rodillas y pon una almohada entre las rodillas si duermes de lado. No estires la parte externa de la cadera (rodilla cruzada al pecho); comprime el tendón."],
    adv:[["Exercises cause 3/10 pain or less","Los ejercicios causan dolor de 3/10 o menos"],["Night pain is clearly lower","El dolor nocturno es claramente menor"]]
   },
   {
    n:["Strengthen the hip","Fortalece la cadera"],wk:["3–6 weeks · daily or every other day","3–6 semanas · a diario o cada tercer día"],
    goal:["Progressively load the hip abductors and learn to keep the pelvis level.","Cargar de forma progresiva los abductores de cadera y aprender a mantener la pelvis nivelada."],
    ex:[
     {id:"rh_sideabd",sets:3,r:15,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"clamshell",sets:3,r:15,side:1}
    ],
    tip:["Pain up to 3/10 during is fine if it is settled by the next morning. Progress slowly; tendons dislike big jumps in load.","Dolor de hasta 3/10 durante es aceptable si amanece calmado. Progresa despacio: a los tendones no les gustan los saltos grandes de carga."],
    adv:[["Single-leg stance 30 s with the pelvis level","Equilibrio a una pierna 30 s con la pelvis nivelada"],["Step-up 3×10 without the hip dropping","Subida de escalón 3×10 sin que caiga la cadera"]]
   },
   {
    n:["Function: single-leg control","Función: control a una pierna"],wk:["4–8 weeks · 3 days/week","4–8 semanas · 3 días por semana"],
    goal:["Training for walking, stairs and running: step-downs, lunges and side planks.","Entrenar para caminar, escaleras y correr: bajadas de escalón, zancadas y planchas laterales."],
    ex:[
     {id:"rh_stepdown",sets:3,r:10,side:1},
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"sldl",sets:3,r:8,side:1},
     {id:"latstep",sets:3,r:10,side:1},
     {id:"sideplank",sets:3,secs:20,side:1}
    ],
    tip:["Keep avoiding compressed positions. Bring running back with the walk/run table below.","Sigue evitando posiciones de compresión. Regresa a correr con la tabla de caminar y correr de abajo."],
    run:1,
    adv:[["Walking 30–45 min and stairs without a flare-up","Caminar 30–45 min y escaleras sin brotes"],["Complete the walk/run program with pain 3/10 or less","Terminar el programa de caminar y correr con dolor de 3/10 o menos"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two sessions a week keep the hip strong. Go back a phase if it flares.","Dos sesiones a la semana mantienen fuerte la cadera. Si se brota, regresa una fase."],
    ex:[
     {id:"rh_sideabd",sets:3,r:15,side:1},
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"rh_stepdown",sets:3,r:10,side:1}
    ],
    tip:["Keep avoiding long periods in compressing positions.","Sigue evitando periodos largos en posiciones que comprimen."],
    adv:[]
   }
  ],
  src:["leap","rx3"]
 },
 {
  id:"hamstring",zone:"hip",em:"🦵",
  name:["Hamstring strain (pulled hamstring)","Distensión de isquiotibiales (desgarro leve)"],
  sub:["Back-of-thigh muscle strain","Lesión muscular en la parte de atrás del muslo"],
  intro:["A sudden or gradual pain in the back of the thigh, often while sprinting or stretching. Recovery is criteria-based: calm it with gentle isometrics, build strength in reduced hip flexion, then add lengthening and speed. A typical return is 4–9 weeks, shorter for sprinting-type injuries and longer for stretching-type ones.","Dolor repentino o gradual en la parte de atrás del muslo, a menudo al correr rápido o estirar. La recuperación es por criterios: calmarlo con isométricos suaves, ganar fuerza con poca flexión de cadera y luego añadir alargamiento y velocidad. El regreso típico es de 4–9 semanas, menos en lesiones de sprint y más en las de estiramiento."],
  evid:["Evidence: clinical guideline with criteria; the exact exercise doses are conventional ones.","Evidencia: guía clínica con criterios; las dosis exactas de ejercicio son las convencionales."],
  flags:[
   ["A pop with immediate severe pain, large bruising, or you cannot walk","Un chasquido con dolor intenso inmediato, un moretón grande o no puedes caminar"],
   ["Pain at the sitting bone (high in the buttock) after a hard stretch or fall","Dolor en el hueso de sentarse (alto en el glúteo) tras un estiramiento fuerte o una caída"],
   ["Numbness, tingling or weakness down the leg","Adormecimiento, hormigueo o debilidad en la pierna"],
   ["Swelling or pain in one calf (possible blood clot)","Hinchazón o dolor en una sola pantorrilla (posible coágulo)"],
   ["Fever, or pain at night or at rest that keeps getting worse","Fiebre, o dolor de noche o en reposo que sigue empeorando"]
  ],
  phases:[
   {
    n:["Calm it: gentle isometrics","Calma: isométricos suaves"],wk:["Days 1–7+ · daily","Días 1–7+ · a diario"],
    goal:["Limit pain and swelling, avoid end-range stretching, and keep the trunk and hips working.","Limitar el dolor y la hinchazón, evitar estiramientos al límite y mantener activos el tronco y las caderas."],
    ex:[
     {id:"rh_hamiso",sets:5,secs:10,side:1,note:["Gentle effort at first, then up to about 50–70%. Pain 3/10 or less.","Esfuerzo suave al inicio y luego hasta un 50–70%. Dolor de 3/10 o menos."]},
     {id:"rh_bridgehold",sets:3,secs:20},
     {id:"plank",sets:3,secs:30},
     {id:"sideplank",sets:3,secs:20,side:1},
     {id:"balsl",sets:3,secs:20,side:1}
    ],
    tip:["Do not stretch the hamstring hard and avoid heavy resisted work of the injured leg for now. Gentle walking is fine.","No estires fuerte el isquiotibial y evita por ahora el trabajo con resistencia pesada de la pierna lesionada. Caminar suave está bien."],
    adv:[["Walking without a limp","Caminar sin cojera"],["Isometric contraction at 50–70% effort without pain","Contracción isométrica al 50–70% de esfuerzo sin dolor"],["Pain 3/10 or less during exercises; single-leg bridge tolerated","Dolor de 3/10 o menos durante los ejercicios; puente a una pierna tolerado"]]
   },
   {
    n:["Strength in reduced hip flexion","Fuerza con poca flexión de cadera"],wk:["Weeks 1–3 · 3–4 days/week","Semanas 1–3 · 3–4 días por semana"],
    goal:["Regain strength and pain-free motion, keeping movement mostly side-to-side and rotational so you do not overstretch.","Recuperar fuerza y movimiento sin dolor, con movimientos sobre todo laterales y rotacionales para no sobreestirar."],
    ex:[
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"rh_slidercurl",sets:3,r:10,side:1,note:["Heels on a towel on a smooth floor; slide the heels in and out.","Talones sobre una toalla en piso liso; desliza los talones hacia adentro y afuera."]},
     {id:"rh_bridgewalk",sets:3,r:8},
     {id:"bwstepup",sets:3,r:10,side:1},
     {id:"plank",sets:3,secs:30}
    ],
    tip:["Start easy jogging only when walking is symmetrical and pain-free.","Empieza a trotar suave solo cuando caminas simétrico y sin dolor."],
    adv:[["Pain-free moderate forward and backward jog","Trote moderado hacia adelante y hacia atrás sin dolor"],["Single-leg Romanian deadlift (arabesque) with bodyweight, 3/10 pain or less","Peso muerto rumano a una pierna (arabesque) con tu peso, dolor de 3/10 o menos"]]
   },
   {
    n:["Advanced strengthening","Fortalecimiento avanzado"],wk:["Weeks 2–6 · 3 days/week","Semanas 2–6 · 3 días por semana"],
    goal:["Strength through full range, hinge and lengthening work, then speed drills.","Fuerza en todo el rango, trabajo de bisagra y alargamiento, y luego ejercicios de velocidad."],
    ex:[
     {id:"sldl",sets:3,r:8,side:1},
     {id:"rh_nordic",sets:3,r:5,note:["Kneel, hold your feet, lower as slowly as you can, and catch yourself with your hands.","De rodillas, con los pies sujetos, baja lo más lento que puedas y frena con las manos."]},
     {id:"splitsq",sets:3,r:10,side:1},
     {id:"slbridge",sets:3,r:12,side:1},
     {id:"rh_slidercurl",sets:3,r:12,side:1}
    ],
    tip:["Add shuffles, carioca and skips, then accelerations of 5, 10 and 30 yards. All at 3/10 or less.","Añade desplazamientos laterales, carioca y skips, luego aceleraciones de 5, 10 y 30 yardas. Todo con 3/10 o menos."],
    run:1,
    adv:[["Loading tests and arabesque at 3/10 or less","Pruebas de carga y arabesque con 3/10 o menos"],["Single-leg strength within about 85% of the other leg","Fuerza a una pierna a un 85% de la otra, aproximadamente"]]
   },
   {
    n:["Return to sport","Regreso al deporte"],wk:["Weeks 4+ · gradual","Semanas 4+ · gradual"],
    goal:["Sprint-speed drills, bounding and cutting, with pain 3/10 or less.","Ejercicios a velocidad de sprint, saltos largos y cambios de dirección, con dolor de 3/10 o menos."],
    ex:[
     {id:"rh_nordic",sets:3,r:6},
     {id:"sldl",sets:3,r:8,side:1},
     {id:"z_hurdle_hops",sets:3,r:6},
     {id:"z_side_hop_sprint",sets:3,r:6},
     {id:"z_lateral_cone_hops",sets:3,r:8}
    ],
    tip:["Ready for full sport when strength is within about 5–10% of the other leg, motion is full and pain-free, and you can repeat sport movements near full speed without pain. Keep the strength work going after you return.","Listo para el deporte completo cuando la fuerza está a un 5–10% de la otra pierna, el movimiento es completo y sin dolor, y repites movimientos del deporte casi a máxima velocidad sin dolor. Sigue con el trabajo de fuerza después de volver."],
    adv:[]
   }
  ],
  src:["hams","rx3"]
 },
 {
  id:"lowback",zone:"spine",em:"🦴",
  name:["Low back pain","Dolor de espalda baja"],
  sub:["Non-specific low back pain","Dolor lumbar inespecífico"],
  intro:["Most low back pain is not caused by something serious and gets better. The guidelines are clear that staying active and doing general exercise helps, and that there is no single magic exercise. So the plan starts with gentle movement and walking, then builds trunk and hip strength, then capacity for lifting and running.","La mayoría de los dolores de espalda baja no se deben a algo grave y mejoran. Las guías son claras: mantenerte activo y hacer ejercicio general ayuda, y no hay un solo ejercicio mágico. Por eso el plan empieza con movimiento suave y caminar, luego fortalece tronco y caderas y después la capacidad para cargar y correr."],
  evid:["Evidence: strong for staying active and general exercise (clinical practice guideline, grade A for chronic pain). The specific exercises are standard, not a single protocol.","Evidencia: sólida para mantenerte activo y hacer ejercicio general (guía clínica, grado A en dolor crónico). Los ejercicios concretos son los habituales, no un protocolo único."],
  flags:[
   ["Numbness in the groin or saddle area, or new trouble controlling your bladder or bowels","Adormecimiento en la ingle o la zona de la montura, o problemas nuevos para controlar la vejiga o el intestino"],
   ["Weakness in one or both legs that is getting worse, or numbness spreading down the leg","Debilidad en una o ambas piernas que va empeorando, o adormecimiento que se extiende por la pierna"],
   ["Pain after a fall, accident or a heavy blow, or you have osteoporosis","Dolor tras una caída, accidente o golpe fuerte, o tienes osteoporosis"],
   ["Fever, unexplained weight loss, or a history of cancer","Fiebre, pérdida de peso sin explicación o antecedente de cáncer"],
   ["Constant, severe pain that does not change with position, especially at night","Dolor constante e intenso que no cambia con la posición, sobre todo de noche"]
  ],
  phases:[
   {
    n:["Keep moving & calm it","Muévete y calma el dolor"],wk:["1–3 weeks · several times a day","1–3 semanas · varias veces al día"],
    goal:["Gentle movement and short walks. Resting in bed is not recommended; moving within comfort is.","Movimiento suave y caminatas cortas. No se recomienda el reposo en cama; sí moverte dentro de lo cómodo."],
    ex:[
     {id:"rh_catcamel",sets:2,r:10},
     {id:"rh_pelvictilt",sets:2,r:10},
     {id:"z_one_knee_to_chest",sets:2,secs:30,side:1},
     {id:"glutebr",sets:2,r:10},
     {id:"birddog",sets:2,r:6,side:1}
    ],
    tip:["Walk 10–20 minutes, two or three times a day, at an easy pace. Some discomfort is expected; sharp pain or pain that spreads down the leg is a cue to ease off.","Camina 10–20 minutos, dos o tres veces al día, a ritmo fácil. Algo de molestia es esperable; el dolor punzante o que baja por la pierna es señal de bajar el ritmo."],
    adv:[["Walking 30 minutes with pain 3/10 or less","Caminar 30 minutos con dolor de 3/10 o menos"],["You can sit, stand and bend over for daily tasks without big flare-ups","Puedes sentarte, pararte e inclinarte para tareas diarias sin brotes grandes"]]
   },
   {
    n:["Trunk & hip control","Control de tronco y cadera"],wk:["3–6 weeks · 3–4 days/week","3–6 semanas · 3–4 días por semana"],
    goal:["Build endurance of the muscles that support the spine, and learn to hinge at the hips instead of bending the back.","Desarrollar la resistencia de los músculos que sostienen la columna y aprender a flexionar desde la cadera en vez de la espalda."],
    ex:[
     {id:"birddog",sets:3,r:8,side:1},
     {id:"deadbug",sets:3,r:8},
     {id:"plank",sets:3,secs:20},
     {id:"sideplank",sets:3,secs:20,side:1},
     {id:"slbridge",sets:3,r:10,side:1},
     {id:"rh_hiphinge",sets:3,r:10}
    ],
    tip:["Keep the spine in a neutral, relaxed position. Quality over reps.","Mantén la columna en posición neutra y relajada. Calidad sobre cantidad."],
    adv:[["Plank and side planks 30–45 s each with good form","Plancha y planchas laterales de 30–45 s cada una con buena técnica"],["Hip hinge 3×10 without pain","Bisagra de cadera 3×10 sin dolor"]]
   },
   {
    n:["Strength & capacity","Fuerza y capacidad"],wk:["4–8 weeks · 3 days/week","4–8 semanas · 3 días por semana"],
    goal:["Add real load: squats, single-leg hinges and carries, then jogging if you run.","Añadir carga real: sentadillas, bisagras a una pierna y cargas, y luego trotar si corres."],
    ex:[
     {id:"gobsq",sets:3,r:10},
     {id:"sldl",sets:3,r:8,side:1},
     {id:"bandwalk",sets:3,r:12},
     {id:"sideplank",sets:3,secs:30,side:1},
     {id:"plank",sets:3,secs:40}
    ],
    tip:["Build the weight slowly. If you jog, use the return-to-run table below.","Sube el peso despacio. Si trotas, usa la tabla de vuelta a correr de abajo."],
    run:1,
    adv:[["Lifting and carrying everyday loads without a flare-up","Levantar y cargar pesos cotidianos sin brotes"],["Back to your usual training with pain 3/10 or less","De vuelta a tu entrenamiento habitual con dolor de 3/10 o menos"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2–3 days/week","Continuo · 2–3 días por semana"],
    goal:["Keep a regular mix of walking and strength work. Staying active is what prevents repeat episodes.","Mantén una mezcla regular de caminar y fuerza. Mantenerte activo es lo que previene los episodios repetidos."],
    ex:[
     {id:"birddog",sets:2,r:8,side:1},
     {id:"sideplank",sets:2,secs:30,side:1},
     {id:"sldl",sets:3,r:8,side:1},
     {id:"gobsq",sets:3,r:10}
    ],
    tip:["If the pain flares, stay moving, drop back one phase, and see a provider if it has not improved after about 6 weeks.","Si el dolor se brota, sigue moviéndote, baja una fase y consulta a un profesional si no ha mejorado después de unas 6 semanas."],
    adv:[]
   }
  ],
  src:["lbp","rx3"]
 },
 {
  id:"neck",zone:"spine",em:"🦴",
  name:["Neck pain","Dolor de cuello"],
  sub:["Neck pain with mobility deficits","Dolor de cuello con limitación de movimiento"],
  intro:["Stiff, sore neck, often from desk work, driving, sleeping badly, or carrying gear. The neck pain guideline supports exercise that combines neck and shoulder-blade strengthening, endurance and mobility, along with staying active. The plan: gentle motion and deep neck muscle activation first, then shoulder-blade strength, then capacity.","Cuello rígido y adolorido, a menudo por trabajo de escritorio, manejar, dormir mal o cargar equipo. La guía de dolor de cuello respalda el ejercicio que combina fuerza y resistencia de cuello y escápulas con movilidad, además de mantenerse activo. El plan: movimiento suave y activación de los músculos profundos del cuello, luego fuerza de escápulas y después capacidad."],
  evid:["Evidence: moderate (clinical practice guideline). Specific doses are standard practice, not from a single protocol.","Evidencia: moderada (guía clínica). Las dosis concretas son práctica habitual, no de un solo protocolo."],
  flags:[
   ["Neck pain after a fall, accident or blow to the head","Dolor de cuello tras una caída, accidente o golpe en la cabeza"],
   ["Weakness, numbness or tingling spreading down an arm, or clumsy hands or trouble walking","Debilidad, adormecimiento u hormigueo que baja por un brazo, o torpeza en las manos o problemas para caminar"],
   ["A sudden, severe headache, or dizziness, double vision, trouble speaking or swallowing with the neck pain","Un dolor de cabeza repentino e intenso, o mareo, visión doble, dificultad para hablar o tragar junto con el dolor de cuello"],
   ["Fever, unexplained weight loss, or a history of cancer","Fiebre, pérdida de peso sin explicación o antecedente de cáncer"],
   ["Constant severe pain that does not ease with rest or position","Dolor constante e intenso que no cede con el reposo ni con la posición"]
  ],
  phases:[
   {
    n:["Ease it & wake up the deep muscles","Alivia y despierta los músculos profundos"],wk:["1–3 weeks · daily","1–3 semanas · a diario"],
    goal:["Gentle motion, relax the tight upper traps and start the deep neck flexors.","Movimiento suave, relajar los trapecios superiores tensos y empezar con los flexores profundos del cuello."],
    ex:[
     {id:"rh_neckrot",sets:2,r:10,side:1},
     {id:"rh_chinnod",sets:2,r:10,hold:5,note:["Lie on your back; nod as if saying yes, a small movement.","Acostado boca arriba; asiente como diciendo sí, con un movimiento pequeño."]},
     {id:"rh_uptrapstretch",sets:3,secs:30,side:1},
     {id:"rh_scapsqueeze",sets:2,r:10,hold:5},
     {id:"rh_thoracicext",sets:2,r:10}
    ],
    tip:["Break up long sitting every 30–45 minutes with a few of these. Keep the screen at eye level.","Interrumpe el tiempo sentado cada 30–45 minutos con algunos de estos ejercicios. Mantén la pantalla a la altura de los ojos."],
    adv:[["Neck motion nearly back to normal in all directions","Movimiento del cuello casi normal en todas las direcciones"],["Daily pain mostly 3/10 or less","Dolor diario casi siempre de 3/10 o menos"]]
   },
   {
    n:["Strengthen neck & shoulder blades","Fortalece cuello y escápulas"],wk:["3–6 weeks · 3–4 days/week","3–6 semanas · 3–4 días por semana"],
    goal:["Build the endurance of the deep neck flexors and the muscles between the shoulder blades.","Desarrollar la resistencia de los flexores profundos del cuello y los músculos entre las escápulas."],
    ex:[
     {id:"rh_chinnod",sets:3,r:10,hold:10},
     {id:"rh_bandrow",sets:3,r:12},
     {id:"rh_wallangel",sets:3,r:10},
     {id:"z_isometric_neck_exercise_front_and_",sets:2,secs:5,note:["Press your head gently into your hand, no movement. Do each direction.","Presiona la cabeza suavemente contra tu mano, sin movimiento. Haz cada dirección."]},
     {id:"z_isometric_neck_exercise_sides",sets:2,secs:5},
     {id:"rh_thoracicext",sets:2,r:10}
    ],
    tip:["Isometrics at light effort. No neck pain beyond 3/10, and no arm symptoms.","Isométricos con esfuerzo ligero. Dolor de cuello no mayor a 3/10 y sin síntomas en el brazo."],
    adv:[["Chin nod held 10 s × 10 without the neck muscles taking over","Chin nod sostenido 10 s × 10 sin que los músculos superficiales del cuello tomen el mando"],["Band rows 3×12 with shoulders low and relaxed","Remos con banda 3×12 con los hombros bajos y relajados"]]
   },
   {
    n:["Shoulder-blade capacity","Capacidad de las escápulas"],wk:["4–8 weeks · 3 days/week","4–8 semanas · 3 días por semana"],
    goal:["More load and range for the posture muscles you use every day: lower traps, mid back and rotator cuff.","Más carga y rango para los músculos de la postura que usas a diario: trapecio inferior, espalda media y manguito rotador."],
    ex:[
     {id:"rh_ytw",sets:3,r:8},
     {id:"rh_bandrow",sets:3,r:15},
     {id:"bandextrot",sets:3,r:12},
     {id:"rh_pluspu",sets:3,r:10},
     {id:"rh_chinnod",sets:2,r:10,hold:10}
    ],
    tip:["Keep the neck long and relaxed during all of these.","Mantén el cuello largo y relajado durante todos estos ejercicios."],
    adv:[["Training and daily activities with pain 3/10 or less and no flare-ups for 2 weeks","Entrenar y actividades diarias con dolor de 3/10 o menos y sin brotes durante 2 semanas"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two short sessions a week plus regular movement breaks.","Dos sesiones cortas a la semana más pausas regulares para moverte."],
    ex:[
     {id:"rh_bandrow",sets:3,r:12},
     {id:"rh_chinnod",sets:2,r:10,hold:10},
     {id:"rh_wallangel",sets:2,r:10},
     {id:"rh_thoracicext",sets:2,r:10}
    ],
    tip:["Go back a phase if the neck flares and see a provider if it does not settle.","Regresa una fase si el cuello se brota y consulta a un profesional si no se calma."],
    adv:[]
   }
  ],
  src:["neck","rx3"]
 },
 {
  id:"shoulder",zone:"arm",em:"💪",
  name:["Shoulder pain (rotator cuff)","Dolor de hombro (manguito rotador)"],
  sub:["Rotator cuff tendinopathy / overhead pain","Tendinopatía del manguito / dolor al elevar el brazo"],
  intro:["Pain on the front or side of the shoulder, worse reaching overhead, behind the back, lifting, or lying on it at night. The newest clinical guideline for rotator cuff tendinopathy backs exercise-based rehabilitation as the main treatment. This plan follows the usual three steps: restore motion and calm it, strengthen the rotator cuff and shoulder blade, then rebuild function.","Dolor al frente o al lado del hombro, peor al alcanzar arriba, detrás de la espalda, al levantar o al acostarte sobre él de noche. La guía clínica más reciente de tendinopatía del manguito rotador respalda la rehabilitación con ejercicio como tratamiento principal. Este plan sigue los tres pasos habituales: recuperar movimiento y calmar, fortalecer el manguito y la escápula y reconstruir la función."],
  evid:["Evidence: moderate (2025 clinical practice guideline). Specific doses are standard practice, not from a single protocol.","Evidencia: moderada (guía clínica 2025). Las dosis concretas son práctica habitual, no de un solo protocolo."],
  flags:[
   ["Sudden pain and weakness after a fall or injury, or you cannot lift the arm","Dolor y debilidad repentinos tras una caída o lesión, o no puedes levantar el brazo"],
   ["The shoulder looks out of place or deformed","El hombro se ve fuera de lugar o deformado"],
   ["Chest tightness, shortness of breath, sweating, or pain spreading to the jaw or arm with the shoulder pain","Opresión en el pecho, falta de aire, sudor o dolor que se extiende a la mandíbula o al brazo junto con el dolor de hombro"],
   ["Numbness or tingling down the arm, or neck pain with arm symptoms","Adormecimiento u hormigueo por el brazo, o dolor de cuello con síntomas en el brazo"],
   ["Fever, redness or heat over the joint, or constant severe night pain","Fiebre, enrojecimiento o calor sobre la articulación, o dolor nocturno constante e intenso"]
  ],
  phases:[
   {
    n:["Calm it & restore motion","Calma y recupera movimiento"],wk:["1–3 weeks · daily","1–3 semanas · a diario"],
    goal:["Keep the shoulder moving without provoking it, and start isometric cuff work.","Mantener el hombro en movimiento sin provocarlo y empezar con trabajo isométrico del manguito."],
    ex:[
     {id:"rh_pendulum",sets:2,secs:30,side:1},
     {id:"rh_wallangel",sets:2,r:10},
     {id:"rh_scapsqueeze",sets:2,r:10,hold:5},
     {id:"rh_isoER",sets:3,secs:10,side:1,note:["Press the back of your hand into a wall, elbow at your side, no movement.","Presiona el dorso de la mano contra la pared, con el codo pegado al costado, sin movimiento."]},
     {id:"rh_thoracicext",sets:2,r:10}
    ],
    tip:["Stay under 3/10 pain. Avoid long reaching overhead and carrying heavy loads away from your body for now. Sleep with a pillow under the arm if lying on it hurts.","Mantente por debajo de 3/10 de dolor. Evita por ahora alcanzar arriba por mucho rato y cargar peso lejos del cuerpo. Duerme con una almohada bajo el brazo si acostarte sobre él duele."],
    adv:[["Shoulder motion nearly normal without sharp pain","Movimiento del hombro casi normal sin dolor punzante"],["Daily pain mostly 3/10 or less","Dolor diario casi siempre de 3/10 o menos"]]
   },
   {
    n:["Strengthen cuff & shoulder blade","Fortalece manguito y escápula"],wk:["3–8 weeks · 3 days/week","3–8 semanas · 3 días por semana"],
    goal:["Slow, controlled rotator cuff and shoulder-blade strengthening. Use light loads and increase gradually.","Fortalecimiento lento y controlado del manguito y de la escápula. Usa cargas ligeras y súbelas poco a poco."],
    ex:[
     {id:"bandextrot",sets:3,r:12},
     {id:"z_internal_rotation_with_band",sets:3,r:12},
     {id:"rh_sideER",sets:3,r:12,side:1},
     {id:"rh_bandrow",sets:3,r:12},
     {id:"rh_scaption",sets:3,r:10},
     {id:"rh_pluspu",sets:3,r:10}
    ],
    tip:["Pain up to 3/10 during is fine if it settles within a day. Do not shrug your shoulders up.","Dolor de hasta 3/10 durante es aceptable si se calma en un día. No encojas los hombros hacia arriba."],
    adv:[["Light band and dumbbell exercises 3×12 without more pain","Ejercicios ligeros con banda y mancuerna 3×12 sin más dolor"],["Reaching overhead with pain 3/10 or less","Alcanzar arriba con dolor de 3/10 o menos"]]
   },
   {
    n:["Rebuild function","Reconstruye la función"],wk:["4–8 weeks · 3 days/week","4–8 semanas · 3 días por semana"],
    goal:["Heavier loading and functional movements like pressing, pulling and overhead work.","Carga más pesada y movimientos funcionales como empujar, jalar y trabajo por encima de la cabeza."],
    ex:[
     {id:"rh_ytw",sets:3,r:8},
     {id:"rh_scaption",sets:3,r:10},
     {id:"rh_bandrow",sets:3,r:15},
     {id:"rh_pluspu",sets:3,r:12},
     {id:"bandextrot",sets:3,r:15}
    ],
    tip:["Return to pressing and overhead lifting with lighter weights than before, and add load a little each week.","Vuelve a empujar y a levantar por encima de la cabeza con pesos menores que antes, y añade carga poco a poco cada semana."],
    adv:[["Training and daily tasks with pain 3/10 or less and no flare-ups for 2 weeks","Entrenamiento y tareas diarias con dolor de 3/10 o menos y sin brotes durante 2 semanas"]]
   },
   {
    n:["Keep it up","Mantenimiento"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Two sessions a week keep the cuff and shoulder blade strong. Go back a phase if it flares.","Dos sesiones a la semana mantienen fuertes el manguito y la escápula. Si se brota, regresa una fase."],
    ex:[
     {id:"bandextrot",sets:3,r:12},
     {id:"rh_bandrow",sets:3,r:12},
     {id:"rh_ytw",sets:2,r:8}
    ],
    tip:["Keep a balance of pulling and pressing in your regular training.","Mantén un equilibrio entre jalar y empujar en tu entrenamiento regular."],
    adv:[]
   }
  ],
  src:["cuff","cuffp"]
 },
 {
  id:"elbow",zone:"arm",em:"💪",
  name:["Outer elbow pain (tennis elbow)","Dolor en el lado externo del codo (codo de tenista)"],
  sub:["Lateral epicondylalgia","Epicondilalgia lateral"],
  intro:["Pain on the outer side of the elbow that shows up when you grip, lift with the palm down, or shake hands. It is a tendon overload problem of the wrist extensors. The protocol progresses from gentle isometrics and stretching to slow eccentric and concentric strengthening of the wrist and forearm, plus shoulder-blade work.","Dolor en el lado externo del codo que aparece al agarrar, levantar con la palma hacia abajo o dar la mano. Es un problema de sobrecarga del tendón de los extensores de la muñeca. El protocolo avanza de isométricos suaves y estiramiento a fortalecimiento lento excéntrico y concéntrico de la muñeca y el antebrazo, más trabajo de escápulas."],
  evid:["Evidence: moderate (hospital protocol with phases and criteria). Doses are conventional ones, not from a trial.","Evidencia: moderada (protocolo hospitalario con fases y criterios). Las dosis son las convencionales, no de un ensayo."],
  flags:[
   ["Pain after a fall or a direct blow, or you cannot fully straighten the elbow","Dolor tras una caída o un golpe directo, o no puedes estirar del todo el codo"],
   ["Numbness, tingling or weakness in the hand","Adormecimiento, hormigueo o debilidad en la mano"],
   ["Neck pain with symptoms down the arm","Dolor de cuello con síntomas por el brazo"],
   ["Swelling, redness, heat or fever at the elbow","Hinchazón, enrojecimiento, calor o fiebre en el codo"],
   ["Constant severe pain at rest or at night","Dolor constante e intenso en reposo o de noche"]
  ],
  phases:[
   {
    n:["Calm it & isometrics","Calma e isométricos"],wk:["0–2 weeks · daily","0–2 semanas · a diario"],
    goal:["Reduce aggravating gripping and begin gentle isometric loading of the wrist extensors.","Reducir los agarres que lo irritan y empezar con carga isométrica suave de los extensores de la muñeca."],
    ex:[
     {id:"rh_wristisoext",sets:5,secs:30,side:1,note:["Back of the hand pushes up against the other hand, no movement.","El dorso de la mano empuja hacia arriba contra la otra mano, sin movimiento."]},
     {id:"rh_scapsqueeze",sets:2,r:10,hold:5},
     {id:"rh_gripsq",sets:2,r:10,side:1}
    ],
    tip:["Avoid heavy repetitive gripping and carrying with the palm down. Keep the pain at 3/10 or less.","Evita agarres repetitivos y pesados y cargar con la palma hacia abajo. Mantén el dolor en 3/10 o menos."],
    adv:[["Full elbow and wrist motion without pain when unloaded","Movimiento completo de codo y muñeca sin dolor sin carga"]]
   },
   {
    n:["Stretch & scapular control","Estiramiento y control escapular"],wk:["2–4 weeks · daily","2–4 semanas · a diario"],
    goal:["Gentle stretching with the elbow bent at 90° and activation of the shoulder-blade muscles.","Estiramiento suave con el codo doblado a 90° y activación de los músculos de la escápula."],
    ex:[
     {id:"rh_wriststretch",sets:3,secs:30,side:1,note:["Elbow bent 90° for now.","Codo doblado a 90° por ahora."]},
     {id:"rh_wristisoext",sets:3,secs:30,side:1},
     {id:"rh_scapsqueeze",sets:2,r:10,hold:5},
     {id:"rh_wallangel",sets:2,r:10}
    ],
    tip:["Everyday tasks with a light load should no longer flare it.","Las tareas diarias con carga ligera ya no deberían brotarlo."],
    adv:[["Stretch tolerated at 90° elbow bend","Estiramiento tolerado con el codo a 90°"],["Light everyday tasks without more pain","Tareas diarias ligeras sin más dolor"],["About 70% of the other arm's strength","Cerca del 70% de la fuerza del otro brazo"]]
   },
   {
    n:["Strengthen: slow loading","Fortalece: carga lenta"],wk:["4–6+ weeks · 3 days/week","4–6+ semanas · 3 días por semana"],
    goal:["Slow lowering and raising of the wrist and forearm with light weight, adding a little each week.","Bajar y subir despacio la muñeca y el antebrazo con peso ligero, añadiendo un poco cada semana."],
    ex:[
     {id:"rh_eccwrist",sets:3,r:15,side:1,note:["Raise with the other hand, lower slowly over 3–4 seconds.","Sube con la otra mano y baja despacio en 3–4 segundos."]},
     {id:"rh_wristcurl",sets:3,r:15,side:1},
     {id:"rh_pronsup",sets:3,r:12,side:1},
     {id:"rh_bandrow",sets:3,r:12},
     {id:"rh_wriststretch",sets:2,secs:30,side:1,note:["Elbow straight now.","Codo estirado ahora."]}
    ],
    tip:["Soreness after the session should settle by the next day. If it does not, lighten the weight.","El dolor después de la sesión debería calmarse al día siguiente. Si no, baja el peso."],
    adv:[["About 90% of the other arm's strength","Cerca del 90% de la fuerza del otro brazo"],["You can manage symptoms yourself and know how to avoid flare-ups","Puedes manejar los síntomas tú mismo y sabes cómo evitar brotes"]]
   },
   {
    n:["Back to full activity","Vuelta a la actividad completa"],wk:["Ongoing · 2 days/week","Continuo · 2 días por semana"],
    goal:["Return to full gripping and training, with maintenance strengthening twice a week.","Volver a los agarres y entrenamiento completos, con fortalecimiento de mantenimiento dos veces por semana."],
    ex:[
     {id:"rh_eccwrist",sets:3,r:15,side:1},
     {id:"rh_wristcurl",sets:3,r:15,side:1},
     {id:"rh_bandrow",sets:3,r:12}
    ],
    tip:["Add grip-heavy training back gradually, and check your technique and equipment (grip size, load).","Reincorpora poco a poco el entrenamiento con mucho agarre y revisa tu técnica y equipo (grosor de agarre, carga)."],
    adv:[]
   }
  ],
  src:["elbow"]
 }
);

REHAB_EX.push(
 ["rh_isocalf","Isometric Single-Leg Calf Hold","Sostenido isométrico de pantorrilla a un pie","legs","bodyweight","t"],
 ["rh_pfstretch","Plantar Fascia Stretch (toe pull)","Estiramiento de la fascia plantar (jalar los dedos)","mobility","bodyweight","t"],
 ["rh_towelheel","Heel Raise with Towel Under Toes","Elevación de talón con toalla bajo los dedos","legs","bodyweight","bw"],
 ["rh_declinesq","Decline Squat","Sentadilla en declive","legs","bodyweight","bw"],
 ["rh_isoabd","Isometric Hip Abduction","Abducción isométrica de cadera","glutes","bodyweight","t"],
 ["rh_hamiso","Heel-Dig Hamstring Isometric","Isométrico de isquiotibiales (presionar el talón)","legs","bodyweight","t"],
 ["rh_bridgehold","Glute Bridge Hold","Puente de glúteo sostenido","glutes","bodyweight","t"],
 ["rh_bridgewalk","Bridge Walkout","Puente con pasos hacia afuera","glutes","bodyweight","bw"],
 ["rh_slidercurl","Towel Slide Bridge Curl","Curl de pierna en puente con toalla deslizante","legs","bodyweight","bw"],
 ["rh_nordic","Assisted Nordic Hamstring Lower","Nórdico de isquiotibiales asistido","legs","bodyweight","bw"],
 ["rh_catcamel","Cat-Camel","Gato-camello","mobility","bodyweight","bw"],
 ["rh_pelvictilt","Pelvic Tilt","Inclinación pélvica","core","bodyweight","bw"],
 ["rh_hiphinge","Hip Hinge","Bisagra de cadera","glutes","bodyweight","bw"],
 ["rh_chinnod","Chin Nod (deep neck flexors)","Asentir con la barbilla (flexores profundos del cuello)","mobility","bodyweight","bw"],
 ["rh_neckrot","Gentle Neck Rotation","Rotación suave del cuello","mobility","bodyweight","bw"],
 ["rh_uptrapstretch","Upper Trapezius Stretch","Estiramiento del trapecio superior","mobility","bodyweight","t"],
 ["rh_scapsqueeze","Shoulder Blade Squeeze","Juntar las escápulas","back","bodyweight","bw"],
 ["rh_thoracicext","Seated Thoracic Extension","Extensión torácica sentado","mobility","bodyweight","bw"],
 ["rh_bandrow","Band Row","Remo con banda","back","band","bw"],
 ["rh_wallangel","Wall Slide","Deslizamiento en la pared","shoulders","bodyweight","bw"],
 ["rh_ytw","Prone Y-T-W Raise","Elevaciones Y-T-W boca abajo","back","bodyweight","bw"],
 ["rh_pendulum","Pendulum Swing","Péndulo de hombro","mobility","bodyweight","t"],
 ["rh_isoER","Isometric Shoulder Rotation Press","Presión isométrica de rotación del hombro","shoulders","bodyweight","t"],
 ["rh_sideER","Side-Lying External Rotation","Rotación externa acostado de lado","shoulders","dumbbell","wr"],
 ["rh_scaption","Scaption Raise","Elevación en escapción (plano de la escápula)","shoulders","dumbbell","wr"],
 ["rh_pluspu","Push-Up Plus","Flexión con protracción de escápula","chest","bodyweight","bw"],
 ["rh_wristisoext","Isometric Wrist Extension","Extensión isométrica de muñeca","biceps","bodyweight","t"],
 ["rh_eccwrist","Slow Wrist Extension Lowering","Bajada lenta de la extensión de muñeca","biceps","dumbbell","wr"],
 ["rh_wristcurl","Wrist Flexion Curl","Curl de muñeca (flexión)","biceps","dumbbell","wr"],
 ["rh_pronsup","Forearm Rotation (hammer)","Rotación de antebrazo (martillo)","biceps","dumbbell","wr"],
 ["rh_wriststretch","Wrist Extensor Stretch","Estiramiento de extensores de muñeca","mobility","bodyweight","t"],
 ["rh_gripsq","Towel Grip Squeeze","Apretar una toalla enrollada","biceps","bodyweight","bw"]
);
Object.assign(REHAB_HOW,{
 rh_isocalf:["Stand on one foot next to a wall, hands on it for balance.|Rise onto the ball of the foot about 5–7 cm, knee straight, and hold that position.|Hold for the time shown, then lower slowly. Rest 2 minutes between holds.","De pie sobre un pie junto a una pared, con las manos apoyadas para el equilibrio.|Sube sobre la punta del pie unos 5–7 cm, con la rodilla recta, y sostén esa posición.|Sostén el tiempo indicado y baja despacio. Descansa 2 minutos entre sostenidos.","Letting the heel drop or bending the knee.","Dejar caer el talón o doblar la rodilla."],
 rh_pfstretch:["Sit and cross the sore foot over the opposite knee.|Hold the toes and pull them back toward the shin until you feel a stretch in the arch.|Hold the time shown. Press a thumb along the arch to feel it tight.","Siéntate y cruza el pie adolorido sobre la rodilla contraria.|Toma los dedos y llévalos hacia atrás, hacia la espinilla, hasta sentir el estiramiento en el arco.|Sostén el tiempo indicado. Con el pulgar sobre el arco notarás que se tensa.","Pulling so hard it hurts sharply.","Jalar tan fuerte que duele de forma punzante."],
 rh_towelheel:["Roll a towel and place it under the toes (ball of the foot on the towel, heel on the floor). Hold a support.|Rise up over about 3 seconds, hold 2 seconds, and lower over 3 seconds. Add weight (a backpack) as it gets easier.|Work toward heavy sets of about 8 reps.","Enrolla una toalla y colócala bajo los dedos (la base de los dedos sobre la toalla y el talón en el piso). Agárrate de un apoyo.|Sube en unos 3 segundos, sostén 2 segundos y baja en 3 segundos. Añade peso (una mochila) cuando sea más fácil.|Trabaja hacia series pesadas de unas 8 repeticiones.","Going fast or letting the ankle roll outward.","Ir rápido o dejar que el tobillo gire hacia afuera."],
 rh_declinesq:["Stand on a board or books tilted about 25°, heels higher than toes, on one leg (or two when starting).|Bend the knee slowly to about 60–90° and push back up.|Keep the knee over the middle toes and the trunk upright.","Párate sobre una tabla o libros inclinados unos 25°, con los talones más altos que los dedos, en una pierna (o con dos al empezar).|Dobla la rodilla despacio hasta unos 60–90° y empuja para subir.|Mantén la rodilla sobre los dedos del medio y el tronco erguido.","Letting the knee cave inward or dropping quickly.","Dejar que la rodilla caiga hacia adentro o bajar rápido."],
 rh_isoabd:["Stand with your sore-side hip next to a wall and a slightly bent knee. Or lie on your back with a belt around both thighs.|Push the outside of the thigh sideways against the wall or belt, no movement.|Hold the time shown. Keep the pelvis level.","De pie, con el lado adolorido junto a una pared y la rodilla un poco doblada. O acostado boca arriba con un cinturón alrededor de ambos muslos.|Empuja la parte externa del muslo hacia el lado contra la pared o el cinturón, sin movimiento.|Sostén el tiempo indicado. Mantén la pelvis nivelada.","Leaning the body into the wall instead of using the hip.","Recargar el cuerpo en la pared en vez de usar la cadera."],
 rh_hamiso:["Lie on your back with your knee bent about 30–45° and the heel on the floor or bed.|Gently dig the heel down and back as if pulling it toward your butt, no movement.|Hold the time shown at the effort your plan says.","Acostado boca arriba con la rodilla doblada unos 30–45° y el talón apoyado en el piso o la cama.|Presiona el talón hacia abajo y hacia atrás como si lo jalaras hacia el glúteo, sin movimiento.|Sostén el tiempo indicado con el esfuerzo que indique tu plan.","Going to maximum effort too soon.","Hacer esfuerzo máximo demasiado pronto."],
 rh_bridgehold:["Lie on your back, knees bent, feet flat.|Lift the hips until the body is straight from shoulders to knees.|Hold the time shown, squeezing the glutes. Keep the ribs down.","Acostado boca arriba con las rodillas dobladas y los pies planos.|Eleva la cadera hasta que el cuerpo quede recto de hombros a rodillas.|Sostén el tiempo indicado apretando los glúteos. Mantén las costillas abajo.","Arching the lower back to get higher.","Arquear la espalda baja para subir más."],
 rh_bridgewalk:["Lie on your back with knees bent and lift into a bridge.|Walk your feet away a few small steps while keeping the hips up, then walk them back.|Keep the hips level and move slowly.","Acostado boca arriba con rodillas dobladas, elévate al puente.|Camina con los pies hacia afuera unos pasos cortos manteniendo la cadera arriba y luego regresa.|Mantén la cadera nivelada y muévete despacio.","Letting the hips drop or twist.","Dejar caer o girar la cadera."],
 rh_slidercurl:["Lie on your back with heels on a towel on a smooth floor, and lift into a bridge.|Slide the heels away until the legs are almost straight, then pull them back in.|Keep the hips high the whole time.","Acostado boca arriba con los talones sobre una toalla en piso liso, elévate al puente.|Desliza los talones hacia afuera hasta casi estirar las piernas y luego jálalos de regreso.|Mantén la cadera alta todo el tiempo.","Dropping the hips as the legs straighten.","Dejar caer la cadera al estirar las piernas."],
 rh_nordic:["Kneel on a pad with your feet held under a sturdy object or by a partner. Keep the body straight from knees to head.|Lean forward as slowly as you can, using your hamstrings to control the fall.|Catch yourself with your hands, push back up, and repeat. Start with a short range.","De rodillas sobre una almohadilla con los pies sujetos bajo un objeto firme o por un compañero. Mantén el cuerpo recto de rodillas a cabeza.|Inclínate hacia adelante lo más lento que puedas, controlando la caída con los isquiotibiales.|Frena con las manos, empuja para subir y repite. Empieza con un rango corto.","Bending at the hips instead of keeping the body straight.","Doblar la cadera en vez de mantener el cuerpo recto."],
 rh_catcamel:["Start on hands and knees, hands under shoulders, knees under hips.|Slowly round your back toward the ceiling, then slowly sag it toward the floor.|Move only within comfort, breathing steadily.","En cuatro apoyos, manos bajo los hombros y rodillas bajo la cadera.|Redondea la espalda despacio hacia el techo y luego déjala caer despacio hacia el piso.|Muévete solo dentro de lo cómodo, respirando con calma.","Forcing the end of the range.","Forzar el final del rango."],
 rh_pelvictilt:["Lie on your back, knees bent, feet flat.|Gently flatten your lower back into the floor by tilting the pelvis, then release.|Move slowly, 10 times.","Acostado boca arriba con las rodillas dobladas y los pies planos.|Aplana suavemente la espalda baja contra el piso inclinando la pelvis y suelta.|Muévete despacio, 10 veces.","Pushing with the legs or holding your breath.","Empujar con las piernas o aguantar la respiración."],
 rh_hiphinge:["Stand with feet hip-width apart, a slight bend in the knees.|Push the hips back as if closing a car door with your butt, keeping the back flat and the chest forward.|Squeeze the glutes to stand tall again. A stick along the spine helps check the posture.","De pie con los pies al ancho de las caderas y las rodillas un poco dobladas.|Lleva la cadera hacia atrás como si cerraras la puerta de un carro con el glúteo, con la espalda plana y el pecho al frente.|Aprieta los glúteos para volver a pararte erguido. Un palo a lo largo de la columna ayuda a revisar la postura.","Rounding the back or squatting instead of hinging.","Redondear la espalda o hacer sentadilla en vez de bisagra."],
 rh_chinnod:["Lie on your back with a small towel under the neck and knees bent.|Gently nod the head, as if saying yes, to lengthen the back of the neck. Do not lift the head off the floor.|Hold the time shown, relaxing the jaw and keeping the front-of-neck muscles soft.","Acostado boca arriba con una toalla pequeña bajo el cuello y las rodillas dobladas.|Asiente suavemente con la cabeza, como diciendo sí, para alargar la parte de atrás del cuello. No levantes la cabeza del piso.|Sostén el tiempo indicado, con la mandíbula relajada y los músculos del frente del cuello suaves.","Pushing the chin forward, or squeezing the jaw or the front neck muscles.","Empujar la barbilla hacia adelante o apretar la mandíbula o los músculos del frente del cuello."],
 rh_neckrot:["Sit tall with shoulders relaxed.|Slowly turn the head to one side as far as is comfortable, then to the other.|Move within comfort, 10 times each way.","Siéntate erguido con los hombros relajados.|Gira la cabeza despacio hacia un lado hasta donde sea cómodo y luego hacia el otro.|Muévete dentro de lo cómodo, 10 veces hacia cada lado.","Forcing the turn or shrugging the shoulders.","Forzar el giro o encoger los hombros."],
 rh_uptrapstretch:["Sit tall and hold the seat with one hand to keep that shoulder down.|Tilt your head to the opposite side, gently, until you feel a stretch on the side of the neck.|Hold the time shown, breathing slowly.","Siéntate erguido y sujeta el asiento con una mano para mantener ese hombro abajo.|Inclina la cabeza suavemente hacia el lado contrario hasta sentir el estiramiento en el lado del cuello.|Sostén el tiempo indicado, respirando despacio.","Pulling on the head or lifting the shoulder.","Jalar la cabeza o subir el hombro."],
 rh_scapsqueeze:["Sit or stand tall with arms by your sides.|Gently draw the shoulder blades back and down, as if tucking them into your back pockets.|Hold the time shown, then relax.","Sentado o de pie y erguido, con los brazos a los lados.|Lleva las escápulas hacia atrás y hacia abajo, como si las guardaras en los bolsillos traseros.|Sostén el tiempo indicado y relaja.","Shrugging toward the ears or arching the back.","Subir los hombros hacia las orejas o arquear la espalda."],
 rh_thoracicext:["Sit on a chair with a back that ends at mid back, hands behind the head.|Gently arch the upper back over the chair back, looking slightly up, then return.|Move only the upper back, not the low back.","Siéntate en una silla cuyo respaldo llegue a la espalda media, con las manos detrás de la cabeza.|Arquea suavemente la parte alta de la espalda sobre el respaldo, mirando un poco hacia arriba, y regresa.|Mueve solo la espalda alta, no la baja.","Arching from the low back.","Arquear desde la espalda baja."],
 rh_bandrow:["Anchor a band at chest height (a door anchor works) and hold the ends, arms straight.|Pull the elbows back, squeezing the shoulder blades together, hands to the ribs.|Return slowly. Keep the shoulders down.","Ancla una banda a la altura del pecho (un ancla de puerta sirve) y sujeta los extremos con los brazos estirados.|Lleva los codos hacia atrás juntando las escápulas, con las manos hacia las costillas.|Regresa despacio. Mantén los hombros abajo.","Shrugging or leaning back.","Encoger los hombros o inclinarte hacia atrás."],
 rh_wallangel:["Stand with your back, head and hips against a wall, elbows bent to about 90° against the wall.|Slide the arms up the wall as far as you can without the back arching or the ribs flaring.|Slide back down slowly.","De pie con la espalda, la cabeza y la cadera contra una pared y los codos doblados a unos 90° contra la pared.|Desliza los brazos hacia arriba por la pared hasta donde puedas sin arquear la espalda ni abrir las costillas.|Baja despacio.","Arching the lower back or lifting the arms off the wall.","Arquear la espalda baja o separar los brazos de la pared."],
 rh_ytw:["Lie face down with the forehead resting on a rolled towel, arms on the floor.|Lift the arms into a Y shape (overhead), then a T (out to the sides), then a W (elbows bent, pulled back), thumbs up.|Lift only a few centimetres, squeezing the shoulder blades. One Y, one T, one W is a rep.","Acostado boca abajo con la frente sobre una toalla enrollada y los brazos en el piso.|Levanta los brazos formando una Y (por encima de la cabeza), luego una T (hacia los lados) y luego una W (codos doblados hacia atrás), con los pulgares arriba.|Levanta solo unos centímetros apretando las escápulas. Una Y, una T y una W es una repetición.","Shrugging or lifting the head.","Encoger los hombros o levantar la cabeza."],
 rh_pendulum:["Lean forward with one hand on a table and let the other arm hang loose.|Gently swing the hanging arm in small circles using body sway, not arm muscles.|Do both directions, then switch arms if needed.","Inclínate hacia adelante con una mano sobre una mesa y deja colgar el otro brazo.|Balancea suavemente el brazo colgando en círculos pequeños usando el movimiento del cuerpo, no los músculos del brazo.|Haz ambos sentidos y cambia de brazo si hace falta.","Using the arm muscles to swing it.","Usar los músculos del brazo para moverlo."],
 rh_isoER:["Stand beside a wall, elbow bent 90° and tucked at your side, a small towel between elbow and ribs.|Press the back of your hand into the wall, no movement.|Hold the time shown. Do the same pressing the palm into a doorframe for internal rotation if you like.","De pie junto a una pared, con el codo doblado 90° y pegado al costado y una toalla pequeña entre el codo y las costillas.|Presiona el dorso de la mano contra la pared, sin movimiento.|Sostén el tiempo indicado. Puedes hacer lo mismo presionando la palma contra el marco de una puerta para la rotación interna.","Letting the elbow drift away from the body.","Dejar que el codo se aleje del cuerpo."],
 rh_sideER:["Lie on your side, elbow bent 90° and tucked against the ribs, a small towel under it, holding a light weight (1–3 lb).|Rotate the forearm upward, away from your stomach, keeping the elbow in.|Lower slowly over 3 seconds.","Acostado de lado con el codo doblado 90° y pegado a las costillas, una toalla pequeña debajo, y un peso ligero en la mano (0.5–1.5 kg).|Rota el antebrazo hacia arriba, alejándolo del abdomen, manteniendo el codo pegado.|Baja despacio en 3 segundos.","Using too heavy a weight, or lifting the elbow.","Usar demasiado peso o levantar el codo."],
 rh_scaption:["Stand with a light dumbbell in each hand, arms at your sides, thumbs up.|Raise the arms diagonally forward, about 30° in front of the body sides, to shoulder height, then lower slowly.|Keep the shoulders down and the neck relaxed.","De pie con una mancuerna ligera en cada mano, brazos a los lados y pulgares arriba.|Eleva los brazos en diagonal hacia adelante, unos 30° delante del plano lateral del cuerpo, hasta la altura del hombro y baja despacio.|Mantén los hombros abajo y el cuello relajado.","Shrugging or going higher than shoulder level.","Encoger los hombros o subir por encima del nivel del hombro."],
 rh_pluspu:["Start in a wall, incline or knee push-up position with the body straight.|Lower and press up as normal, then at the top push the floor away to round the upper back slightly and spread the shoulder blades.|Lower under control.","Empieza en posición de flexión en la pared, inclinada o de rodillas con el cuerpo recto.|Baja y sube como una flexión normal y al final empuja el piso para redondear un poco la espalda alta y separar las escápulas.|Baja con control.","Letting the lower back sag.","Dejar caer la espalda baja."],
 rh_wristisoext:["Sit with the forearm resting on a table, palm down, and hold a fist or open hand.|With the other hand pressing down on the back of the hand, push the hand up against it, no movement.|Hold the time shown at a comfortable effort.","Sentado con el antebrazo apoyado en una mesa, palma hacia abajo, con el puño o la mano abierta.|Con la otra mano presionando hacia abajo el dorso de la mano, empuja hacia arriba contra ella, sin movimiento.|Sostén el tiempo indicado con un esfuerzo cómodo.","Making it painful; it should be easy.","Hacerlo doloroso; debe ser fácil."],
 rh_eccwrist:["Rest the forearm on a table or your thigh, palm down, wrist off the edge, holding a light dumbbell.|Use the other hand to help lift the wrist up, then lower it slowly over 3–4 seconds with the sore arm only.|Start very light (about 1 lb).","Apoya el antebrazo en una mesa o en el muslo, palma hacia abajo y la muñeca fuera del borde, con una mancuerna ligera.|Ayúdate con la otra mano para subir la muñeca y bájala despacio en 3–4 segundos solo con el brazo adolorido.|Empieza con muy poco peso (unos 0.5 kg).","Dropping the weight fast or going too heavy.","Dejar caer el peso rápido o usar demasiado peso."],
 rh_wristcurl:["Rest the forearm on a table, palm up, wrist off the edge, holding a light dumbbell.|Curl the wrist up, then lower slowly.|Keep the forearm still on the table.","Apoya el antebrazo en una mesa, palma hacia arriba y la muñeca fuera del borde, con una mancuerna ligera.|Flexiona la muñeca hacia arriba y baja despacio.|Mantén el antebrazo quieto sobre la mesa.","Lifting the forearm off the table.","Levantar el antebrazo de la mesa."],
 rh_pronsup:["Hold a hammer or a light dumbbell by one end with the elbow bent 90° at your side.|Slowly rotate the forearm so the palm faces up, then down.|Keep the elbow tucked and move in a controlled way.","Sostén un martillo o una mancuerna ligera por un extremo con el codo doblado 90° a tu costado.|Gira el antebrazo despacio para que la palma mire hacia arriba y luego hacia abajo.|Mantén el codo pegado y muévete con control.","Swinging the elbow away from the body.","Balancear el codo lejos del cuerpo."],
 rh_wriststretch:["Hold the arm in front of you, palm down, and bend the wrist so the fingers point to the floor.|With the other hand, gently pull the hand toward you until you feel a stretch on top of the forearm.|Hold the time shown. Start with the elbow bent 90°, later the elbow straight.","Sostén el brazo frente a ti con la palma hacia abajo y dobla la muñeca para que los dedos apunten al piso.|Con la otra mano, jala suavemente la mano hacia ti hasta sentir un estiramiento en la parte superior del antebrazo.|Sostén el tiempo indicado. Empieza con el codo doblado 90° y luego con el codo estirado.","Pulling into sharp pain.","Jalar hasta sentir dolor punzante."],
 rh_gripsq:["Roll a small towel or use a soft ball.|Squeeze gently for about 5 seconds, then release.|Keep the wrist straight.","Enrolla una toalla pequeña o usa una pelota blanda.|Aprieta con suavidad unos 5 segundos y suelta.|Mantén la muñeca recta.","Squeezing hard enough to hurt the elbow.","Apretar tan fuerte que duela el codo."]
});
(function(){REHAB_EX.forEach(function(a){if(!EXLIB.some(function(b){return b[0]===a[0];}))EXLIB.push(a);});for(const k in REHAB_HOW)if(!HOWTO[k])HOWTO[k]=REHAB_HOW[k];})();
