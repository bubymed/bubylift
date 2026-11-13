/* "What's new" popup — shown once per version after an update, and from More → What's new.
   Ventana "Novedades" — se muestra una vez por versión después de una actualización, y desde Más → Novedades.
   Add a new entry at the TOP for every release with something new (same value as APP_VER). Keep it short: 1–3 items. */
const WHATSNEW=[
 {v:'v1.1.131',items:[
  {i:'link',en:'New public web page that explains Bubylift in 10 seconds, with real screens and install steps for your phone (More → Bubylift web page).',es:'Nueva página web pública que explica Bubylift en 10 segundos, con pantallas reales y pasos para instalar en tu teléfono (Más → Página web de Bubylift).'}
 ]},
 {v:'v1.1.130',items:[
  {i:'trophy',en:'Weekly challenge: one goal a week for everyone (100 pull-ups, 300 push-ups, 4 workouts…), counted from what you already log, with a card to share. In Progress → Overview.',es:'Reto semanal: una meta por semana para todos (100 dominadas, 300 lagartijas, 4 entrenamientos…), contada con lo que ya registras, con tarjeta para compartir. En Progreso → Resumen.'}
 ]},
 {v:'v1.1.129',items:[
  {i:'share',en:'Share cards: 6 clearly different styles, totals always with separators (15,058), no overlapping text, the muscle cards lead with the main muscle and drop “(deep)”, the record card shows your rank, and every card carries the app link. Links to the app now show a preview image in WhatsApp, Instagram and Facebook.',es:'Tarjetas para compartir: 6 estilos bien distintos, totales siempre con separadores (15,058), sin texto encimado, las tarjetas de músculos empiezan por el músculo principal y sin “(profundo)”, la tarjeta de récord muestra tu rango y todas llevan el enlace de la app. El enlace de la app ahora sale con imagen en WhatsApp, Instagram y Facebook.'}
 ]},
 {v:'v1.1.128',items:[
  {i:'cloud',en:'Automatic copies: every day you use the app a copy is kept on your phone (last 7, More → Your data). If the app ever opens empty, it offers to bring your workouts back. The backup reminder now comes every two weeks and says plainly what is at risk.',es:'Copias automáticas: cada día que usas la app se guarda una copia en tu teléfono (las últimas 7, Más → Tus datos). Si la app abre vacía, te ofrece recuperar tus entrenamientos. El recordatorio de respaldo sale cada dos semanas y dice claro qué se arriesga.'}
 ]},
 {v:'v1.1.127',items:[
  {i:'barbell',en:'Supersets in your own workouts (⋯ → Superset with the next exercise: no rest until the last of the pair, kept in routines and history). Sticky notes per exercise (“seat on 4, wide grip”) that show every time. Warm-up sets: one tap ramps up to your working weight on the first barbell lift.',es:'Superseries en tus propios entrenamientos (⋯ → Superserie con el siguiente ejercicio: sin descanso hasta el último de la pareja, se guarda en rutinas e historial). Notas fijas por ejercicio (“asiento en 4, agarre ancho”) que salen cada vez. Series de calentamiento: un toque sube hasta tu peso de trabajo en el primer ejercicio con barra.'}
 ]},
 {v:'v1.1.126',items:[
  {i:'sun',en:'Light mode pass: rank names, the Mobility card numbers and red buttons now read clearly on white.',es:'Repaso del modo claro: los nombres de rango, los números de la tarjeta de Movilidad y los botones rojos ahora se leen bien sobre blanco.'}
 ]},
 {v:'v1.1.125',items:[
  {i:'list',en:'Calmer exercise cards: one tip line (the most important) and the rest behind “more tips”; injury warnings always show. The bar-weight link no longer runs off the screen.',es:'Tarjetas de ejercicio más limpias: una sola línea de consejo (la más importante) y el resto en “más consejos”; los avisos de lesión siempre se ven. El enlace de peso con barra ya no se sale de la pantalla.'}
 ]},
 {v:'v1.1.124',items:[
  {i:'calendar',en:'History one tap away: an “All history” button under your last workout, and the Progress tab reopens on the side you used last.',es:'El historial a un toque: botón “Todo el historial” bajo tu último entrenamiento, y la pestaña Progreso abre en el lado que usaste por última vez.'}
 ]},
 {v:'v1.1.123',items:[
  {i:'home',en:'Cleaner home: one start block on top (train, repeat last, your routines); the plan promo only shows to newcomers and can be dismissed; the guest banner shows once.',es:'Inicio más limpio: un solo bloque arriba para empezar (entrenar, repetir el último, tus rutinas); la promo del plan solo sale a quien empieza y se puede quitar; el aviso de invitado sale una sola vez.'}
 ]},
 {v:'v1.1.122',items:[
  {i:'🩹',en:'<b>New recovery plan: inner thigh / groin pain (adductors)</b>, in 4 phases from squeeze isometrics to the Copenhagen exercise and return to sport. The recovery plans section is now called <b>Injuries</b> (in Mobility), and Body › Muscles has a shortcut: "Pain or an injury?".',es:'<b>Plan nuevo: dolor en la ingle o la cara interna del muslo (aductores)</b>, en 4 fases desde apretar sin moverte hasta el ejercicio Copenhague y el regreso al deporte. La sección de planes de recuperación ahora se llama <b>Lesiones</b> (en Movilidad), y Cuerpo › Músculos tiene un acceso directo: "¿Dolor o una lesión?".'}
 ]},
 {v:'v1.1.121',items:[
  {i:'🧘',en:'Stretches that need gear now say so: the stick stretches (Round the World, Chest and Front of Shoulder) need "Stick or broom", Adductor/Groin needs a partner, On-Your-Back Quad needs a bench and the chair stretches need a chair. They only show up in your sessions when you tick that gear in Mobility.',es:'Los estiramientos que necesitan algo ya lo dicen: los de palo (Alrededor del mundo, Pecho y hombro frontal) piden "Palo o escoba", Aductores pide un compañero, Cuádriceps boca arriba pide un banco y los de silla piden una silla. Solo salen en tus sesiones cuando marcas ese equipo en Movilidad.'}
 ]},
 {v:'v1.1.120',items:[
  {i:'🗂️',en:'<b>Tidier layout</b>: Body now has two tabs, Muscles (recovery, training load and muscle balance, all on the body figure) and Weight & measurements (your log sits under the chart). The Rank tab only shows ranks; the consistency level moved to Summary next to your streak; the 1RM calculator is under Tools at the end of Exercises. Big volume totals no longer wrap.',es:'<b>Todo en su lugar</b>: Cuerpo ahora tiene dos pestañas, Músculos (recuperación, carga y equilibrio muscular, todo en la figura) y Peso y medidas (tu registro va bajo la gráfica). Rango solo muestra rangos; el nivel de constancia pasó a Resumen junto a tu racha; la calculadora de máximo está en Herramientas al final de Ejercicios. Los totales de volumen grandes ya no se parten.'}
 ]},
 {v:'v1.1.119',items:[
  {i:'\ud83e\ude79',en:'Rehab moves now have their own details in the guide: body area, difficulty, equipment, and easier and harder steps taken from the phases of their rehab plan.',es:'Los ejercicios de rehabilitación ahora tienen sus detalles en la guía: zona del cuerpo, dificultad, equipo, y pasos más fáciles y más difíciles según las fases de su plan de rehabilitación.'}
 ]},
 {v:'v1.1.118',items:[
  {i:'\ud83c\udfaf',en:'<b>Up next tells you how much</b>: each suggestion shows sets × reps and a weight from your last time (or a starting range the first time). And when a lift has not improved in 3+ weeks, its card says so and suggests a variation to try or a 10% reset.',es:'<b>Sigue te dice cuánto</b>: cada sugerencia muestra series × repeticiones y un peso según la última vez (o un rango inicial la primera vez). Y cuando un ejercicio no mejora en 3+ semanas, su tarjeta te avisa y sugiere una variante o bajar un 10%.'}
 ]},
 {v:'v1.1.117',items:[
  {i:'\u26a1',en:'Opens lighter: the what\'s-new notes and the imported technique guides now load after the app is open instead of before (22% less to load at start).',es:'Abre más ligera: las novedades y las guías de técnica importadas ahora se cargan después de abrir la app, no antes (22% menos que cargar al inicio).'}
 ]},
 {v:'v1.1.116',items:[
  {i:'\ud83d\udcc8',en:'<b>Bodyweight progressions</b>: when you hit the top of the range on every set two sessions in a row (push-ups, pull-ups, dips…), the workout offers the next harder version with one tap. If the last two sessions were very hard, it offers the easier one so you can build up. It respects your equipment and injuries.',es:'<b>Progresiones con peso corporal</b>: cuando llegas al tope en todas las series dos sesiones seguidas (lagartijas, dominadas, fondos…), el entrenamiento te ofrece la versión más difícil con un toque. Si las dos últimas sesiones fueron muy duras, te ofrece la más fácil para avanzar. Respeta tu equipo y tus lesiones.'}
 ]},
 {v:'v1.1.115',items:[
  {i:'\u2601\ufe0f',en:'<b>Safer sync between phones</b>: if you edit a workout, routine, body entry or custom exercise on one phone while offline, that edit is no longer overwritten by an older copy when another phone synced in between. The copy changed last always wins.',es:'<b>Sincronización más segura entre teléfonos</b>: si editas un entrenamiento, rutina, registro corporal o ejercicio propio en un teléfono sin conexión, esa edición ya no se pierde porque otro teléfono sincronizó en medio. Siempre gana la copia que cambió al final.'}
 ]},
 {v:'v1.1.114',items:[
  {i:'🔎',en:'Search also fixes typos in short words like "remp" or "pusj".',es:'La búsqueda también corrige errores en palabras cortas como "remp" o "pusj".'}
 ]},
 {v:'v1.1.113',items:[
  {i:'🔎',en:'<b>Much better search</b>: finds exercises even with typos ("benh press", "sentadila"), plurals ("lunges", "elevaciones laterales"), Spanish or English names, nicknames and abbreviations (lagartijas, cuclillas, RDL, OHP, DB). Muscle words show that muscle first ("pecho" = chest exercises), the common lift comes first ("curl" = Barbell Curl, "remo" = Remo con barra), what you use most rises to the top, and repeated names are gone. History search uses the same engine.',es:'<b>Búsqueda mucho mejor</b>: encuentra ejercicios aunque escribas con errores ("benh press", "sentadila"), en plural ("lunges", "elevaciones laterales"), en español o inglés, apodos y abreviaturas (lagartijas, cuclillas, RDL, OHP, DB). Las palabras de músculo muestran primero ese músculo ("pecho" = ejercicios de pecho), sale primero el ejercicio común ("curl" = curl con barra, "remo" = remo con barra), lo que más usas sube arriba, y ya no hay nombres repetidos. La búsqueda del historial usa el mismo motor.'}
 ]},
 {v:'v1.1.112',items:[
  {i:'🧹',en:'<b>Cleaner exercise list</b>: 163 variations (grips, angles, bands, chains, Smith, cable versions…) no longer crowd the list. Search still finds them (even by grip alone, like "wide grip"), right under their main exercise, and they are in its guide under "Variations". The plate button moved to the left so it never covers a set\'s ✓, and "Save as routine" now lives only on the finish screen.',es:'<b>Lista de ejercicios más limpia</b>: 163 variantes (agarres, ángulos, bandas, cadenas, Smith, versiones en polea…) ya no llenan la lista. La búsqueda las sigue encontrando (incluso solo por el agarre, como "wide grip"), justo debajo de su ejercicio principal, y están en su guía en "Variantes". El botón de discos pasó a la izquierda para no tapar el ✓ de una serie, y "Guardar como rutina" ahora está solo en la pantalla final.'}
 ]},
 {v:'v1.1.111',items:[
  {i:'🛠️',en:'<b>Fixes and polish</b>: "Up next" now follows your split (a back day stays on back and biceps). Exercises are classified better (rear-delt fly is a pull, not a push). Cleaner "also known as" names, and search understands lagartijas, desplantes, pantorrillas, DB, OHP and more. Duplicate exercises are hidden. The floating buttons no longer cover the last button, the workout header shows the full volume, the swap sheet shows options first, and long lists (picker, history) open faster.',es:'<b>Arreglos y pulido</b>: "Sigue" ahora respeta tu rutina dividida (un día de espalda sigue con espalda y bíceps). Los ejercicios están mejor clasificados (las aperturas posteriores son jalón, no empuje). Alias más limpios, y la búsqueda entiende lagartijas, desplantes, pantorrillas, DB, OHP y más. Se ocultan ejercicios duplicados. Los botones flotantes ya no tapan el último botón, el encabezado muestra el volumen completo, el cambio de ejercicio muestra primero las opciones, y las listas largas (selector, historial) abren más rápido.'}
 ]},
 {v:'v1.1.110',items:[
  {i:'🔆',en:'Easier to read: orange buttons and text have more contrast, especially in light mode and in bright light.',es:'Más fácil de leer: los botones y textos naranjas tienen más contraste, sobre todo en modo claro y con mucha luz.'}
 ]},
 {v:'v1.1.109',items:[
  {i:'✎',en:'<b>Edit your own exercises</b> (name, group, equipment, tracking) or delete them, and the <b>Custom</b> button is now always at the top of the exercise picker (it also offers to create what you searched). Share cards now show the <b>back</b> view first when you trained lats, traps, rhomboids or triceps.',es:'<b>Edita tus ejercicios propios</b> (nombre, grupo, equipo, tipo de registro) o elimínalos, y el botón <b>Propio</b> ahora está siempre arriba en el selector de ejercicios (también te ofrece crear lo que buscaste). Las tarjetas para compartir ahora muestran primero la vista de <b>espalda</b> cuando entrenas dorsales, trapecio, romboides o tríceps.'}
 ]},
 {v:'v1.1.108',items:[
  {i:'➡️',en:'<b>Up next</b>: during a workout the app suggests what to do after the exercises you already have, based on what you trained, muscle recovery, push/pull and leg balance, your equipment and injuries. Add it or skip it.',es:'<b>Sigue</b>: durante el entrenamiento la app sugiere qué hacer después de los ejercicios que ya llevas, según lo que trabajaste, la recuperación muscular, el balance de empuje/jalón y de piernas, tu equipo y tus lesiones. Añádelo u omítelo.'}
 ]},
 {v:'v1.1.107',items:[
  {i:'🧭',en:'<b>Every exercise now has its own map</b>: movement type, difficulty, equipment needed, support and assistance, other names, similar exercises, swaps for missing equipment, easier and harder steps, and gentler options for a sore joint. Search also finds abbreviations and synonyms (DB, OHP, lagartijas…).',es:'<b>Cada ejercicio ahora tiene su mapa</b>: tipo de movimiento, dificultad, equipo necesario, soporte y asistencia, otros nombres, ejercicios parecidos, cambios si falta equipo, pasos más fáciles y más difíciles, y opciones más suaves para una articulación adolorida. La búsqueda también entiende abreviaturas y sinónimos (DB, OHP, lagartijas…).'}
 ]},
 {v:'v1.1.105',items:[
  {i:'👆',en:'Smoother taps: no zoom delay when you log sets fast, no accidental refresh when you pull down mid-workout, and bigger touch areas on the top buttons.',es:'Toques más fluidos: sin retraso de zoom al registrar series rápido, sin recargar por accidente al deslizar hacia abajo en pleno entrenamiento y áreas táctiles más grandes en los botones de arriba.'}
 ]},
 {v:'v1.1.104',items:[
  {i:'⏱️',en:'Holds like the plank now have a minutes box and a seconds box. Cardio keeps minutes and distance.',es:'Los isométricos como la plancha ahora tienen una casilla de minutos y otra de segundos. El cardio conserva minutos y distancia.'}
 ]},
 {v:'v1.1.103',items:[
  {i:'🕸️',en:'The balance radar is back: under the body model in Muscle balance, a chart shows how even your training is across 8 muscle groups.',es:'Volvió el radar de equilibrio: debajo del modelo del cuerpo en Equilibrio muscular, una gráfica muestra qué tan parejo es tu entrenamiento en 8 grupos musculares.'}
 ]},
 {v:'v1.1.102',items:[
  {i:'🛠️',en:'The rank card on the Workout screen is now compact, so your plan and workout buttons show sooner.',es:'La tarjeta de rango en Entrenar ahora es compacta, así tu plan y los botones de entrenar aparecen antes.'}
 ]},
 {v:'v1.1.101',items:[
  {i:'🛠️',en:'Routine cards no longer have the X next to Edit. To delete a routine, open Edit or swipe the card.',es:'Las tarjetas de rutina ya no tienen la X junto a Editar. Para borrar una rutina, abre Editar o desliza la tarjeta.'}
 ]},
 {v:'v1.1.100',items:[
  {i:'🛠️',en:'The plate calculator button now shows only while you are in a workout.',es:'El botón de la calculadora de discos ahora solo aparece durante un entrenamiento.'}
 ]},
 {v:'v1.1.99',items:[
  {i:'🛠️',en:'Fixed: moving an exercise inside a routine no longer drags the whole panel down.',es:'Arreglado: mover un ejercicio dentro de una rutina ya no arrastra todo el panel hacia abajo.'}
 ]},
 {v:'v1.1.98',items:[
  {i:'🏋️',en:'<b>Weight is now the total, bar included</b>, like other apps: for 225 lb on the bar, type 225. Your saved workouts do not change. Pick your bar in the plate calculator; it is remembered per exercise.',es:'<b>El peso ahora es el total, con la barra incluida</b>, como en otras apps: si la barra pesa 225 lb en total, escribe 225. Tus entrenamientos guardados no cambian. Elige tu barra en la calculadora de discos; se recuerda por ejercicio.'}
 ]},
 {v:'v1.1.97',items:[
  {i:'👋',en:'First screen: Continue as guest is now the main button, so you can start training in one tap.',es:'Primera pantalla: Continuar como invitado es ahora el botón principal, para empezar a entrenar con un toque.'}
 ]},
 {v:'v1.1.96',items:[
  {i:'🏋️',en:'Plate calculator works backwards: type the weight you want and it tells you the plates per side.',es:'La calculadora de discos funciona al revés: escribe el peso que quieres y te dice los discos por lado.'}
 ]},
 {v:'v1.1.95',items:[
  {i:'layers',en:'<b>Plan setup remembers you</b>: if you close the setup halfway, it offers to pick up where you stopped (kept for a week). The last screen now shows a preview of your training days before you tap Build my plan.',es:'<b>La configuración del plan te recuerda</b>: si cierras la configuración a la mitad, te ofrece seguir donde te quedaste (se guarda una semana). La última pantalla ahora muestra una vista previa de tus días de entrenamiento antes de tocar Crear mi plan.'}
 ]},
 {v:'v1.1.94',items:[
  {i:'chart',en:'<b>Richer weekly recap</b>: "Your last week" now names the records you set, the muscle you trained most and the time you trained, not just the totals.',es:'<b>Resumen semanal más completo</b>: "Tu semana pasada" ahora nombra los récords que lograste, el músculo que más trabajaste y el tiempo que entrenaste, no solo los totales.'}
 ]},
 {v:'v1.1.93',items:[
  {i:'info',en:'<b>Clearer errors</b>: when a number is missing, the field is now outlined in red and focused instead of only showing a message that disappears. Works in the live workout, the workout editor, the routine name, the custom exercise name and the body entry.',es:'<b>Errores más claros</b>: cuando falta un número, el campo ahora se marca en rojo y se enfoca en vez de solo mostrar un mensaje que desaparece. Funciona en el entrenamiento en vivo, el editor de entrenamientos, el nombre de la rutina, el nombre del ejercicio propio y el registro de peso.'}
 ]},
 {v:'v1.1.92',items:[
  {i:'layers',en:'<b>Stretching has its own tab</b>: History now separates Workouts from Stretch & mobility, so your lifting log is not mixed with stretching sessions. The tab appears once you have a stretching session.',es:'<b>El estiramiento tiene su propia pestaña</b>: el Historial ahora separa Entrenamientos de Estiramiento y movilidad, así tu registro de pesas no se mezcla con las sesiones de estiramiento. La pestaña aparece cuando tienes una sesión de estiramiento.'}
 ]},
 {v:'v1.1.91',items:[
  {i:'undo',en:'<b>Undo for routines and your plan</b>: deleting a routine or your plan now shows an Undo button for a few seconds, just like workouts and body entries.',es:'<b>Deshacer para rutinas y tu plan</b>: al eliminar una rutina o tu plan aparece un botón Deshacer unos segundos, igual que con los entrenamientos y los registros de peso.'}
 ]},
 {v:'v1.1.90',items:[
  {i:'search',en:'<b>Search your history</b>: type a workout name, an exercise or a note, or pick a muscle, to find past workouts fast.',es:'<b>Busca en tu historial</b>: escribe el nombre de un entrenamiento, un ejercicio o una nota, o elige un músculo, para encontrar entrenamientos pasados rápido.'}
 ]},
 {v:'v1.1.89',items:[
  {i:'check',en:'<b>Stretching is not counted as sets</b>: stretch and mobility moves no longer add to your set totals, weekly summary or training load. A stretching-only session shows "8 moves" instead of sets.',es:'<b>El estiramiento no cuenta como series</b>: los movimientos de estiramiento y movilidad ya no suman a tus totales de series, al resumen semanal ni a la carga de entrenamiento. Una sesión solo de estiramiento muestra "8 movimientos" en vez de series.'}
 ]},
 {v:'v1.1.88',items:[
  {i:'info',en:'<b>Better for screen readers</b>: the icon-only buttons (the + and − in the routine editor and plan editor, remove a favorite, the −1 rounds undo) now have names that a screen reader can read out.',es:'<b>Mejor para lectores de pantalla</b>: los botones solo con ícono (el + y − del editor de rutinas y de planes, quitar un favorito, el −1 de las rondas) ahora tienen nombres que un lector de pantalla puede leer.'}
 ]},
 {v:'v1.1.87',items:[
  {i:'refresh',en:'<b>Repeat keeps your setup</b>: repeating a workout, "Repeat last" and saving a workout as a routine now keep the grip/width variation, the dumbbell multiplier and the bar weight of each exercise.',es:'<b>Repetir conserva tu configuración</b>: repetir un entrenamiento, "Repetir el último" y guardarlo como rutina ahora conservan la variante de agarre/ancho, el multiplicador de mancuernas y el peso de la barra de cada ejercicio.'},
  {i:'check',en:'Fixed: importing a backup or syncing with the cloud used to drop the variation (grip/width) from saved exercises. It is kept now.',es:'Corregido: al importar un respaldo o sincronizar con la nube se perdía la variante (agarre/ancho) de los ejercicios guardados. Ahora se conserva.'}
 ]},
 {v:'v1.1.86',items:[
  {i:'chart',en:'<b>Smarter training load</b>: each muscle has its own weekly limit instead of one number for all. Core can take more sets than biceps, and the card now shows each count against its limit (for example Biceps 18/16).',es:'<b>Carga de entrenamiento más inteligente</b>: cada músculo tiene su propio límite semanal en lugar de un solo número. El core aguanta más series que el bíceps, y la tarjeta muestra cada conteo contra su límite (por ejemplo Bíceps 18/16).'}
 ]},
 {v:'v1.1.85',items:[
  {i:'layers',en:'<b>Shorter plan setup</b>: the full setup went from about 27 steps to about 20. The six fitness tests now sit on two screens, and the optional questions (phase, exercises to avoid, favorites, work posture) hide behind one "Fine-tune your plan?" step. Your plan is the same if you skip it.',es:'<b>Configuración más corta</b>: la configuración completa pasó de unos 27 pasos a unos 20. Las seis pruebas de condición física ahora están en dos pantallas, y las preguntas opcionales (fase, ejercicios a evitar, favoritos, postura en el trabajo) quedan detrás de un solo paso "¿Quieres afinar tu plan?". Tu plan es el mismo si lo saltas.'}
 ]},
 {v:'v1.1.84',items:[
  {i:'refresh',en:'<b>Undo a delete</b>: deleting a workout (after confirming) or a body entry now shows an Undo button for a few seconds, so a mistake is no longer permanent.',es:'<b>Deshacer un borrado</b>: al eliminar un entrenamiento (tras confirmar) o un registro de peso aparece un botón Deshacer unos segundos, así un error ya no es permanente.'}
 ]},
 {v:'v1.1.83',items:[
  {i:'pencil',en:'<b>Full workout editing</b>: Edit now also changes the date and duration, and lets you add sets or exercises. Trophies are recalculated in order, so a record only counts if it really beat everything before it.',es:'<b>Edición completa</b>: Editar ahora también cambia la fecha y la duración, y permite agregar series o ejercicios. Los trofeos se recalculan en orden, así que un récord solo cuenta si de verdad superó todo lo anterior.'}
 ]},
 {v:'v1.1.82',items:[
  {i:'calendar',en:'<b>Log a past workout</b>: forgot to track a session? In History tap "Log a past workout", pick the date, add your exercises and sets, and save it.',es:'<b>Registra un entrenamiento pasado</b>: ¿olvidaste anotar una sesión? En Historial toca "Registrar un entrenamiento pasado", elige la fecha, agrega tus ejercicios y series y guárdalo.'}
 ]},
 {v:'v1.1.81',items:[
  {i:'pencil',en:'<b>Edit a saved workout</b>: open it in History and tap Edit to fix a weight or reps, rename it, change the note or remove a set.',es:'<b>Edita un entrenamiento guardado</b>: ábrelo en Historial y toca Editar para corregir un peso o repeticiones, cambiar el nombre o la nota, o quitar una serie.'},
  {i:'check',en:'Many small fixes: "1 set" instead of "1 sets" (and 1 serie / 1 día in Spanish), volume shown as 25,133 lb, "trained today" only for today, typos like 1000000 kg are rejected, the "Bar" share-card style works again, the reminder file message is right, and the week math is correct across daylight-saving changes.',es:'Muchos arreglos pequeños: "1 serie" en vez de "1 series" (y 1 set / 1 day en inglés), volumen como 25,133 lb, "entrenaste hoy" solo para hoy, se rechazan errores como 1000000 kg, el estilo "Barra" de la tarjeta para compartir vuelve a funcionar, el mensaje del archivo de recordatorios es correcto y las semanas se calculan bien con el cambio de hora.'}
 ]},
 {v:'v1.1.80',items:[
  {i:'chart',en:'<b>Training load fixed</b>: new users no longer see a false "Overload". Weeks before your first workout are not counted as rest, and the app needs 2 full weeks of history before it flags a jump in volume. The card now says "last 7 days" because that is what it measures.',es:'<b>Carga de entrenamiento corregida</b>: los usuarios nuevos ya no ven una "Sobrecarga" falsa. Las semanas antes de tu primer entreno no cuentan como descanso, y la app necesita 2 semanas completas de historial para avisar de un salto de volumen. La tarjeta ahora dice "últimos 7 días" porque eso es lo que mide.'}
 ]},
 {v:'v1.1.79',items:[
  {i:'barbell',en:'<b>Plate calculator</b>: a new round button next to the rest timer. Tap the plates you put on the bar and see the total, in kg or lb, for an Olympic, women\'s, EZ or hex bar, one side or both. "Use in set" puts the plates in the box you tapped (or the first empty set), and the app adds the bar once.',es:'<b>Calculadora de discos</b>: un botón redondo nuevo junto al cronómetro. Toca los discos que pusiste en la barra y mira el total, en kg o lb, para barra olímpica, de mujer, EZ o hexagonal, en un lado o en ambos. "Usar en la serie" pone los discos en la casilla que tocaste (o en la primera serie vacía) y la app suma la barra una sola vez.'}
 ]},
 {v:'v1.1.78',items:[
  {i:'arrows-sort',en:'The same drag handle ⠿ now works while you train and when you build a routine. Up/down buttons are gone everywhere, and "Replace exercise" comes first in every exercise menu.',es:'La misma asa ⠿ para arrastrar ahora funciona mientras entrenas y al armar una rutina. Los botones de subir/bajar ya no existen, y "Reemplazar ejercicio" va primero en el menú de cada ejercicio.'}
 ]},
 {v:'v1.1.77',items:[
  {i:'arrows-sort',en:'Reorder exercises by dragging the ⠿ handle to where you want them, and replace any exercise by searching the whole library. The last block of each session is now called "Optional".',es:'Reordena los ejercicios arrastrando el asa ⠿ adonde quieras y reemplaza cualquiera buscando en toda la biblioteca. El último bloque de cada sesión ahora se llama "Opcional".'}
 ]},
 {v:'v1.1.76',items:[
  {i:'medal',en:'Army test plans (AFT) now practice the real events: hand-release push-ups, trap-bar deadlift, sprint-drag-carry and plank.',es:'Los planes para la prueba del Ejército (AFT) ahora practican los eventos reales: flexiones con liberación de manos, peso muerto con barra hexagonal, sprint-arrastre-carga y plancha.'}
 ]},
 {v:'v1.1.75',items:[
  {i:'shield-check',en:'Quick setup now also asks about injuries and health (pregnancy, blood pressure, heart), so nobody gets a plan that ignores them.',es:'El arranque rápido ahora también pregunta por lesiones y salud (embarazo, presión, corazón), para que nadie reciba un plan que las ignore.'}
 ]},
 {v:'v1.1.74',items:[
  {i:'trending-up',en:'Stuck on a lift? The check-in now suggests a lighter week (about 10% less weight) and building back up, instead of swapping the exercise right away.',es:'¿Estancado en un ejercicio? El chequeo ahora sugiere una semana más ligera (cerca de 10% menos peso) y volver a subir, en vez de cambiar el ejercicio de inmediato.'}
 ]},
 {v:'v1.1.73',items:[
  {i:'target',en:'Better plans: every muscle now gets enough sets each week (no more missing triceps, calves or glutes), strength days fit your session time, and rest times match what you see.',es:'Mejores planes: cada músculo recibe suficientes series por semana (sin tríceps, gemelos o glúteos olvidados), los días de fuerza caben en tu tiempo y el descanso coincide con lo que ves.'},
  {i:'walk',en:'Lose fat plans now end each day with a short walk, as promised.',es:'Los planes de bajar grasa ahora cierran cada día con una caminata corta, como se prometía.'}
 ]},
 {v:'v1.1.72',items:[
  {i:'shield-check',en:'Small behind-the-scenes improvements and an updated privacy text.',es:'Pequeñas mejoras internas y un texto de privacidad actualizado.'}
 ]},
 {v:'v1.1.71',items:[
  {i:'cloud',en:'Trying it as a guest? After your first workout and when you rank up, you can now save your progress with one tap and open it on any phone.',es:'¿Lo estás probando como invitado? Después de tu primer entrenamiento y al subir de rango, ahora puedes guardar tu progreso con un toque y abrirlo en cualquier teléfono.'}
 ]},
 {v:'v1.1.70',items:[
  {i:'body',en:'Muscle model rebuilt: every shape on the body figure is now one real muscle (glute max/medius/TFL, three vasti + rectus femoris, gastrocnemius/soleus, serratus, teres, infraspinatus, neck, hip flexors, shin muscles...). Deep muscles (glute minimus, rhomboids, rotator cuff, transverse abdominis) get their own tappable row. All 863 exercise weights re-split.',es:'Modelo muscular rehecho: cada forma de la figura ahora es un músculo real (glúteo mayor/medio/TFL, tres vastos + recto femoral, gastrocnemio/sóleo, serrato, redondos, infraespinoso, cuello, flexores de cadera, músculos de la espinilla...). Los músculos profundos (glúteo menor, romboides, manguito rotador, transverso abdominal) tienen su propia fila para tocar. Se redistribuyeron los pesos de los 863 ejercicios.'}
 ]},
 {v:'v1.1.69',items:[
  {i:'target',en:'Inner thighs (adductors) are now a plan focus you can tap on the body figure, with new exercises: Copenhagen plank, sumo squat, side-lying adduction.',es:'Muslo interno (aductores) ahora es un enfoque del plan que puedes tocar en la figura, con ejercicios nuevos: plancha Copenhague, sentadilla sumo y aducción acostado de lado.'}
 ]},
 {v:'v1.1.68',items:[
  {i:'target',en:'Tap the body to pick your plan focus and cool-down muscles; Balance and Load are now body heat maps; Recovery opens on the body view.',es:'Toca el cuerpo para elegir el enfoque del plan y los músculos del cool down; Equilibrio y Carga son mapas de calor del cuerpo; Recuperación abre en la vista del cuerpo.'}
 ]},
 {v:'v1.1.67',items:[
  {i:'chart',en:'Filters and pickers now swipe sideways in one row instead of piling up: library tabs, muscle/equipment photos, chip rows and recovery zones.',es:'Los filtros ahora se deslizan de lado en una sola fila en vez de amontonarse: pestañas de la biblioteca, fotos de músculos/equipo, chips y zonas de recuperación.'}
 ]},
 {v:'v1.1.66',items:[
  {i:'🏅',en:'The Rank tab header now matches the home card: tinted with your rank\'s color, bigger name and glowing progress bar.',es:'La cabecera de la pestaña Rango ahora igual que la del inicio: teñida con el color de tu rango, nombre más grande y barra con brillo.'}
 ]},
 {v:'v1.1.65',items:[
  {i:'🏅',en:'Your rank now stands out on the Workout home: card tinted with your rank\'s color, bigger name and glowing progress bar. Plus 2 new muscle share cards: Muscle map and Muscles.',es:'Tu rango ahora destaca en el inicio: tarjeta teñida con el color de tu rango, nombre más grande y barra con brillo. Y 2 tarjetas nuevas con músculos para compartir: Mapa y Músculos.'}
 ]},
 {v:'v1.1.64',items:[
  {i:'🏋️',en:'Body share card: crops to the half you trained (upper / lower / full) and has 3 detail levels: Quick, Detailed, Complete. Recovery map now uses a smooth red-to-green gradient.',es:'Tarjeta Cuerpo: se recorta a la mitad que entrenaste (arriba / abajo / completo) y tiene 3 niveles de detalle: Rápida, Detallada, Completa. El mapa de recuperación usa un degradado suave de rojo a verde.'}
 ]},
 {v:'v1.1.63',items:[
  {i:'🎯',en:'Muscle data fixed: every exercise now has a main muscle, and ~30 wrong ones were corrected (hammer curls, cleans, snatches, pullovers, good mornings, jumps and drills, balance work).',es:'Datos musculares corregidos: todo ejercicio tiene músculo principal y se corrigieron ~30 errores (curl martillo, cleans, snatches, pullovers, buenos días, saltos y drills, equilibrio).'}
 ]},
 {v:'v1.1.62',items:[
  {i:'🫀',en:'<b>Body figure:</b> Recovery has a Body view (tap a muscle), the technique guide shows main muscle / helpers / stabilizers on the body, new Find by muscle, and a Body share card. Chest and shoulders are split (upper chest, side delts).',es:'<b>Figura del cuerpo:</b> Recuperación tiene vista de Cuerpo (toca un músculo), la guía de técnica muestra músculo principal / ayudan / estabilizadores en el cuerpo, nuevo Buscar por músculo y una tarjeta Cuerpo. Pecho y hombros están divididos (pecho superior, deltoides lateral).'}
 ]},
 {v:'v1.1.61',items:[
  {i:'😂',en:'<b>Funny cards:</b> a new Serious / Funny switch in the share studio. Funny mode says things like "2000 tortas", "180 German shepherds", "35 MREs" or "12 casualties on a litter" (26 new things: animals, food, army life).',es:'<b>Tarjetas graciosas:</b> nuevo botón Serias / Graciosas en el estudio de compartir. El modo gracioso dice cosas como «2000 tortas», «180 pastores alemanes», «35 MREs» o «12 heridos en camilla» (26 cosas nuevas: animales, comida y vida en el Army).'}
 ]},
 {v:'v1.1.60',items:[
  {i:'⚡',en:'<b>Speed:</b> dates in long lists (History) are formatted with a cached formatter.',es:'<b>Velocidad:</b> las fechas en listas largas (Historial) usan un formateador guardado.'}
 ]},
 {v:'v1.1.59',items:[
  {i:'🛠',en:'<b>Fixes:</b> the "How much time do you have?" sheet no longer shows the Share-the-app title and QR text; the workout clock shows hours past 60 minutes.',es:'<b>Arreglos:</b> la hoja «¿Cuánto tiempo tienes?» ya no muestra el título y texto de «Compartir la app»; el reloj del entrenamiento muestra horas pasados los 60 minutos.'}
 ]},
 {v:'v1.1.58',items:[
  {i:'📷',en:'<b>Share card:</b> fixed Save/Copy/More showing "preparing your picture…" forever and saving nothing.',es:'<b>Tarjeta para compartir:</b> arreglado que Guardar/Copiar/Más mostraran «preparando tu imagen…» para siempre sin guardar nada.'}
 ]},
 {v:'v1.1.57',items:[
  {i:'🏆',en:'<b>Ranks:</b> tap your rank in Progress to see all ranks; the list opens on your rank and scrolls — swipe down only closes it at the top.',es:'<b>Rangos:</b> toca tu rango en Progreso para ver todos; la lista abre en tu rango y se desliza — deslizar hacia abajo solo la cierra cuando estás arriba.'}
 ]},
 {v:'v1.1.56',items:[
  {i:'trophy',en:'New \'All ranks\' window: every rank with the points it asks for, the ones you passed and how far the next ones are. Tap your rank on the home screen to open it. Fixed the missing gap between cards inside the new tabs.',es:'Nueva ventana \'Todos los rangos\': cada rango con los puntos que pide, los que ya superaste y cuánto falta para los siguientes. Toca tu rango en el inicio para abrirla. Arreglado el espacio que faltaba entre tarjetas dentro de las pestañas nuevas.'}
 ]},
 {v:'v1.1.55',items:[
  {i:'layers',en:'Progress and Body are split into tabs with a pill bar: swipe left or right to move between them. Progress: Overview, Rank, Exercises. Body: Recovery, Weight, Log.',es:'Progreso y Cuerpo se dividen en pestañas con una barra de pastillas: desliza a la izquierda o derecha para moverte entre ellas. Progreso: Resumen, Rango, Ejercicios. Cuerpo: Recuperación, Peso, Registro.'}
 ]},
 {v:'v1.1.54',items:[
  {i:'sliders',en:'First time with an exercise now suggests a starting weight range from your body weight. New Seated variation for curls, shoulder presses and raises. Plate exercises no longer ask for a bar. Chair is now optional stretching equipment. The overall rank counts all five lifts (untried ones count 0). The backup reminder no longer shows when your cloud account is syncing.',es:'La primera vez con un ejercicio ahora sugiere un rango de peso inicial según tu peso corporal. Nueva variante Sentado para curls, press de hombros y elevaciones. Los ejercicios con disco ya no piden barra. La silla ahora es equipo opcional para estirar. El rango general cuenta los cinco levantamientos (los no probados cuentan 0). El recordatorio de respaldo ya no sale si tu cuenta en la nube está sincronizando.'}
 ]},
 {v:'v1.1.53',items:[
  {i:'sliders',en:'Exercise variations: choose underhand, neutral, wide or close grip on rows, pulldowns, pull-ups, presses and curls. Each variation shifts the muscle map and keeps its own last time and records.',es:'Variantes de ejercicio: elige agarre supino, neutro, ancho o cerrado en remos, jalones, dominadas, press y curls. Cada variante cambia el mapa muscular y guarda su propia última vez y récords.'}
 ]},
 {v:'v1.1.52',items:[
  {i:'trophy',en:'Bodyweight ranks: pull-ups, push-ups and dips ranked on the same 16-rank ladder by your best set (added weight counts), with the reps needed for the next rank.',es:'Rangos con peso corporal: dominadas, flexiones y fondos en la misma escalera de 16 rangos por tu mejor serie (el peso extra cuenta), con las repeticiones que faltan para el siguiente rango.'}
 ]},
 {v:'v1.1.51',items:[
  {i:'trophy',en:'Your rank now shows on the Workout home, and asks for your body weight or the workouts you still need to reveal it. Also visible on Progress before your first workout.',es:'Tu rango ahora se muestra en el inicio de Entrenar, y te pide tu peso corporal o los entrenamientos que te faltan para revelarlo. También se ve en Progreso antes de tu primer entrenamiento.'}
 ]},
 {v:'v1.1.50',items:[
  {i:'palette',en:'Rank colors: brighter shades on the dark theme, deeper ones on the light theme.',es:'Colores de rango: tonos más vivos en el tema oscuro y más profundos en el claro.'}
 ]},
 {v:'v1.1.49',items:[
  {i:'trophy',en:'Ranks: a 16-rank ladder for each lift and overall (current vs peak), what you need for the next rank with a one-tap goal, a consistency level, and a muscle-balance radar with weakest parts and train buttons. Epic rank names.',es:'Rangos: 16 rangos por levantamiento y general (actual vs máximo), lo que necesitas para el siguiente rango con meta en un toque, nivel de constancia y radar de equilibrio muscular con las partes más atrasadas y botones para entrenarlas. Nombres de rango épicos.'}
 ]},
 {v:'v1.1.48',items:[
  {i:'calendar',en:'<b>Edit goals + calendar</b> — change the target of any goal (pencil or tap it), and tap the week / month / total card to open a calendar of the days you trained.',es:'<b>Editar metas + calendario</b> — cambia la meta de cualquier objetivo (lápiz o tócalo) y toca la tarjeta de semana / mes / total para abrir un calendario con los días que entrenaste.'}
 ]},
 {v:'v1.1.47',items:[
  {i:'heart',en:'<b>Deeper muscle recovery</b> — every exercise now trains several parts with different weight (a deadlift is not a pull-up, leg extensions spare your hamstrings). Tap a muscle to see its parts (21 in all), each with its own recovery time, and tap a ready part to train it.',es:'<b>Recuperación muscular más profunda</b> — cada ejercicio ahora trabaja varias partes con distinto peso (un peso muerto no es una dominada, las extensiones de cuádriceps no cansan los isquiotibiales). Toca un músculo para ver sus partes (21 en total), cada una con su propio tiempo de recuperación, y toca una parte lista para entrenarla.'}
 ]},
 {v:'v1.1.46',items:[
  {i:'yoga',en:'<b>Stretching with equipment</b> — pick what you have (foam roller, band, bench, bar, ball) and get 26 new moves, used first in your cool-down. Wall and floor moves included.',es:'<b>Estiramientos con equipo</b> — elige lo que tengas (rodillo, banda, banco, barra, pelota) y obtén 26 movimientos nuevos, usados primero en tu cool down. Incluye movimientos con pared y piso.'}
 ]},
 {v:'v1.1.45',items:[
  {i:'sparkles',en:'<b>Clearer share button</b> — “Background, size and color” now looks like a button (border, arrow that flips when open).',es:'<b>Botón de compartir más claro</b> — “Fondo, tamaño y color” ahora parece un botón (borde y flecha que gira al abrir).'}
 ]},
 {v:'v1.1.44',items:[
  {i:'share',en:'The \'Fun\' share card now compares your lifted volume to 52 things, from watermelons and tigers to F-35 jets and M1 Abrams tanks. The pick follows the numbers you lifted, so every workout gets its own, and big days earn epic ones and a rarity tag. Tap the style again to shuffle.',es:'La tarjeta \'Curioso\' ahora compara tu volumen con 52 cosas, desde sandías y tigres hasta cazas F-35 y tanques M1 Abrams. La elección sigue los números que levantaste, así que cada entrenamiento tiene la suya, y los días grandes ganan objetos épicos y una etiqueta de rareza. Toca el estilo otra vez para cambiarla.'}
 ]},
 {v:'v1.1.43',items:[
  {i:'heart',en:'Cool-down by muscle group: pick what you trained (legs, chest, back, shoulders, arms, core) and get a stretch session for it. After saving a workout there is a one-tap Cool-down for what you trained.',es:'Cool down por grupo muscular: elige qué entrenaste (piernas, pecho, espalda, hombros, brazos, core) y recibes una sesión de estiramientos para eso. Al guardar un entrenamiento hay un botón de Cool down de lo que entrenaste.'}
 ]},
 {v:'v1.1.42',items:[
  {i:'info',en:'A short note on how to count reps appears on walking lunges, alternating moves and one-side exercises.',es:'Una nota corta explica cómo contar repeticiones en zancadas caminando, ejercicios alternados y de un solo lado.'}
 ]},
 {v:'v1.1.41',items:[
  {i:'trash',en:'Swipe a set to the left to remove it (with Undo).',es:'Desliza una serie a la izquierda para quitarla (con Deshacer).'}
 ]},
 {v:'v1.1.40',items:[
  {i:'check',en:'Sets now count only when you tap the check button, and the app suggests reps for each set (it starts at the bottom of your rep range and moves up as you hit the top).',es:'Las series ahora cuentan solo cuando tocas el botón ✓, y la app sugiere repeticiones para cada serie (empieza en el piso de tu rango y sube cuando llegas al tope).'}
 ]},
 {v:'v1.1.39',items:[
  {i:'share',en:'Wide share cards: the big number now lines up exactly with the logo and the text under it.',es:'Tarjetas anchas: el número grande ahora queda alineado con el logo y el texto de abajo.'}
 ]},
 {v:'v1.1.38',items:[
  {i:'share',en:'Share cards now come in Vertical and Horizontal, plus a new Duo style that puts the fun card and the exercise list together in one image.',es:'Las tarjetas para compartir ahora vienen en Vertical y Horizontal, y hay un nuevo estilo Dúo que junta la tarjeta curiosa y la lista de ejercicios en una sola imagen.'}
 ]},
 {v:'v1.1.37',items:[
  {i:'shield-check',en:'The About section no longer closes by itself, the profile photo no longer flickers, and the privacy text is up to date.',es:'La sección Acerca de ya no se cierra sola, la foto de perfil ya no parpadea y el texto de privacidad está al día.'}
 ]},
 {v:'v1.1.36',items:[
  {i:'share',en:'Share previews keep the full story shape, like they will look on Instagram.',es:'Las vistas previas de compartir mantienen la forma completa de una historia, como se verán en Instagram.'}
 ]},
 {v:'v1.1.35',items:[
  {i:'share',en:'Share screen redesigned: big card gallery, Instagram story button, new Giant, Vertical, Row and Dots styles, clearer text.',es:'Pantalla de compartir rediseñada: galería grande, botón de historia de Instagram, estilos nuevos Gigante, Vertical, En fila y Puntos, y texto más claro.'}
 ]},
 {v:'v1.1.34',items:[
  {i:'device-mobile',en:'A welcome screen helps you put Bubylift on your phone.',es:'Una pantalla de bienvenida te ayuda a poner Bubylift en tu teléfono.'}
 ]},
 {v:'v1.1.33',items:[
  {i:'chevron-left',en:'Swipe any sheet down to close it.',es:'Desliza cualquier hoja hacia abajo para cerrarla.'}
 ]},
 {v:'v1.1.32',items:[
  {i:'✨',en:'<b>Smoother motion</b>: guided sessions now slide between moves, the countdown pulses each second, the done check pops in, new sets slide into place and starting or leaving a session fades in softly.',es:'<b>Movimiento más suave</b>: las sesiones guiadas ahora se deslizan entre movimientos, la cuenta regresiva late cada segundo, la palomita de terminado aparece con un pop, las series nuevas entran deslizándose y empezar o salir de una sesión aparece con suavidad.'}
 ]},
 {v:'v1.1.31',items:[
  {i:'🚪',en:'<b>Clear exits in guided sessions</b>: an Exit button on top (save, discard, list view or keep going), plus Finish this move, List view and Finish session always on screen. Nobody gets stuck.',es:'<b>Salidas claras en las sesiones guiadas</b>: un botón Salir arriba (guardar, descartar, ver lista o seguir), y siempre en pantalla Terminar este movimiento, Ver lista y Terminar sesión. Nadie se queda atrapado.'}
 ]},
 {v:'v1.1.30',items:[
  {i:'🧘',en:'<b>Guided mobility sessions</b>: Mobility now walks you through one move at a time, with a countdown, a short switch between sides for one-sided stretches, and one big button to pause or go to the next move. ⋯ → View as list brings back the old list.',es:'<b>Sesiones de movilidad guiadas</b>: Movilidad ahora te guía un movimiento a la vez, con cuenta regresiva, un cambio corto de lado en los estiramientos de un lado y un botón grande para pausar o pasar al siguiente. ⋯ → Ver como lista trae de vuelta la lista de antes.'}
 ]},
 {v:'v1.1.29',items:[
  {i:'🩹',en:'<b>Picker continues behind the keyboard</b>: the exercise list now keeps going behind the keyboard, and only the search bar floats right above it.',es:'<b>El selector sigue detrás del teclado</b>: la lista de ejercicios ahora sigue hacia abajo detrás del teclado, y solo la barra de búsqueda queda flotando justo encima.'}
 ]},
 {v:'v1.1.28',items:[
  {i:'🩹',en:'<b>Scrolling fixed</b>: long sheets, like a workout\'s details, scroll normally again instead of jumping back to the top.',es:'<b>Desplazamiento arreglado</b>: las hojas largas, como el detalle de un entreno, vuelven a deslizarse normal en vez de brincar al inicio.'}
 ]},
 {v:'v1.1.27',items:[
  {i:'🔁',en:'<b>Your old workouts stay as they were</b>: your earlier workouts keep their weights exactly as you logged them (totals); the new boxes just show the weight of one dumbbell, or the plates without the bar.',es:'<b>Tus entrenos anteriores se quedan como estaban</b>: tus entrenos anteriores conservan los pesos tal como los registraste (totales); las cajas nuevas solo muestran el peso de una mancuerna, o los discos sin la barra.'}
 ]},
 {v:'v1.1.26',items:[
  {i:'🏋️',en:'<b>Two dumbbells count double</b>: type the weight of one dumbbell and the app saves the total for both. Tap the dumbbell line (or ⋯ → Dumbbells) to switch to 1 dumbbell. Changing the bar or dumbbells keeps what you typed and recalculates the total.',es:'<b>Dos mancuernas cuentan doble</b>: escribe el peso de una mancuerna y la app guarda el total de las dos. Toca la línea de mancuernas (o ⋯ → Mancuernas) para cambiar a 1 mancuerna. Al cambiar la barra o las mancuernas, lo que escribiste se queda y el total se recalcula.'}
 ]},
 {v:'v1.1.25',items:[
  {i:'🏋️',en:'<b>Bar weight is added for you</b>: barbell exercises start with the bar included (45 lb; EZ bar 20 lb). Type only the plates and the total is saved. Tap the bar line, or ⋯ → Bar weight, to change it for any exercise (the app remembers your choice).',es:'<b>El peso de la barra se suma solo</b>: los ejercicios con barra empiezan con la barra incluida (45 lb; barra Z 20 lb). Escribe solo los discos y se guarda el total. Toca la línea de la barra, o ⋯ → Peso de la barra, para cambiarla en cualquier ejercicio (la app recuerda tu elección).'}
 ]},
 {v:'v1.1.24',items:[
  {i:'🩹',en:'<b>No more jumping to the top</b>: tapping weight or reps keeps the page where you are.',es:'<b>Adiós al salto hacia arriba</b>: al tocar el peso o las repeticiones, la página se queda donde estás.'}
 ]},
 {v:'v1.1.23',items:[
  {i:'🩹',en:'<b>Search above the keyboard, for real</b>: the exercise picker no longer shifts when the keyboard opens, so the search bar and cursor stay together and no black gap is left.',es:'<b>El buscador sobre el teclado, ahora sí</b>: el selector de ejercicios ya no se mueve al abrir el teclado, así que la barra de búsqueda y el cursor quedan juntos y no sobra espacio negro.'}
 ]},
 {v:'v1.1.22',items:[
  {i:'🩹',en:'<b>No more black gap</b>: after closing the keyboard, the exercise picker fills the whole screen again.',es:'<b>Adiós al espacio negro</b>: al cerrar el teclado, el selector de ejercicios vuelve a ocupar toda la pantalla.'}
 ]},
 {v:'v1.1.21',items:[
  {i:'↩️',en:'<b>Un-mark a set</b>: the exercise menu (⋯) can un-mark the last done set, and removing an exercise asks first whenever it has numbers typed in.',es:'<b>Desmarcar una serie</b>: el menú del ejercicio (⋯) puede desmarcar la última serie hecha, y quitar un ejercicio pregunta primero si ya tiene números escritos.'}
 ]},
 {v:'v1.1.20',items:[
  {i:'⌨️',en:'<b>Exercise picker with keyboard</b>: when you type in the search, only the search bar stays in view; the keyboard now covers the tab bar.',es:'<b>Selector de ejercicios con teclado</b>: al escribir en el buscador, solo queda a la vista la barra de búsqueda; el teclado ahora tapa la barra inferior.'}
 ]},
 {v:'v1.1.19',items:[
  {i:'🛠',en:'<b>Add set / Add exercise fixed</b>: the buttons no longer delete exercises, and a new set starts with the previous set\'s weight and reps — just change it or keep it.',es:'<b>Agregar serie / ejercicio arreglado</b>: los botones ya no borran ejercicios, y la serie nueva empieza con el peso y las repeticiones de la anterior; solo cámbialos o déjalos.'}
 ]},
 {v:'v1.1.18',items:[
  {i:'sparkles',en:'<b>New Bubylift logo</b>: the dumbbell is now the “I” in BUBYLIFT, in the header and welcome screen, and the app icon is a new orange dumbbell. (If you installed the app, remove it and add it again to see the new home-screen icon.)',es:'<b>Nuevo logo de Bubylift</b>: la mancuerna ahora es la “I” de BUBYLIFT, en el encabezado y la pantalla de bienvenida, y el ícono de la app es una nueva mancuerna naranja. (Si instalaste la app, quítala y agrégala de nuevo para ver el ícono nuevo en tu pantalla de inicio.)'}
 ]},
 {v:'v1.1.17',items:[
  {i:'sparkles',en:'<b>The orange card stays with you</b>: when you scroll down in Workout, Mobility and Body, a slim copy (title + main button) pins to the top, so you can start your workout or mobility session from anywhere on the screen.',es:'<b>La tarjeta naranja te acompaña</b>: al deslizar hacia abajo en Entrenar, Movilidad y Cuerpo, una versión delgada (título + botón principal) se queda fija arriba, para empezar tu entrenamiento o sesión de movilidad desde cualquier parte de la pantalla.'}
 ]},
 {v:'v1.1.16',items:[
  {i:'chart-bar',en:'<b>Training load indicator</b> in Body: compares this week\'s hard sets with your last 3 weeks and flags Light, Optimal, High or Overload (big jumps, volume rising for weeks, or over 20 sets for one muscle), with a short tip and a 4-week chart.',es:'<b>Indicador de carga de entrenamiento</b> en Body: compara las series duras de esta semana con tus últimas 3 semanas y marca Ligera, Óptima, Alta o Sobrecarga (saltos grandes, volumen subiendo por semanas, o más de 20 series de un músculo), con un consejo corto y una gráfica de 4 semanas.'}
 ]},
 {v:'v1.1.15',items:[
  {i:'sparkles',en:'<b>Redesigned Mobility and Muscle Recovery</b>: Mobility now has a bold header with your session stats and previews, icon tiles for focus, big time buttons and animated move cards. Recovery shows an overall progress ring and a ring per muscle — tap a ready muscle to train it.',es:'<b>Movilidad y Recuperación muscular rediseñadas</b>: Movilidad ahora tiene un encabezado llamativo con las estadísticas y vistas previas de tu sesión, mosaicos con iconos para el enfoque, botones grandes de tiempo y tarjetas de movimientos animadas. Recuperación muestra un anillo de progreso general y uno por músculo — toca un músculo listo para entrenarlo.'}
 ]},
 {v:'v1.1.14',items:[
  {i:'trash',en:'<b>Deleted plan stays deleted</b>: after you delete your plan, signing in or syncing no longer brings it back from the cloud copy.',es:'<b>El plan eliminado se queda eliminado</b>: después de borrar tu plan, al abrir la app o sincronizar ya no vuelve desde la copia de la nube.'}
 ]},
 {v:'v1.1.13',items:[
  {i:'sparkles',en:'<b>Redesigned "My plan" screen</b>: a bold header with your week progress and a big "Start next workout" button, swipeable day cards, large exercise cards with animated demos and a ▶ how-to button, collapsible Why / Warm-up / Cool-down, and plan options as tappable tiles.',es:'<b>Pantalla "Mi plan" rediseñada</b>: encabezado llamativo con tu progreso de la semana y un botón grande "Empezar siguiente entrenamiento", tarjetas de día deslizables, tarjetas grandes de ejercicio con demos animadas y botón ▶ de cómo hacerlo, secciones plegables de Por qué / Calentamiento / Enfriamiento, y las opciones del plan como botones tipo mosaico.'}
 ]},
 {v:'v1.1.12',items:[
  {i:'trash',en:'<b>Red ✕ to delete your plan</b> on the plan card and in the plan screen (it still asks to confirm; your logged workouts are kept). Removing an exercise with logged sets or from your plan now asks first too.',es:'<b>✕ rojo para eliminar tu plan</b> en la tarjeta del plan y en la pantalla del plan (sigue pidiendo confirmar; tus entrenamientos registrados se conservan). Quitar un ejercicio con series registradas o de tu plan también pregunta antes.'}
 ]},
 {v:'v1.1.11',items:[
  {i:'trash',en:'<b>Red ✕ delete button</b> in the top-right corner of workouts in History, routines, body entries, and exercises in a workout or routine editor — no more hunting for the delete option.',es:'<b>Botón rojo ✕ para eliminar</b> en la esquina superior derecha de los entrenamientos del Historial, rutinas, registros de cuerpo y ejercicios dentro de un entrenamiento o del editor de rutinas — ya no hay que buscar la opción de eliminar.'}
 ]},
 {v:'v1.1.10',items:[
  {i:'sparkles',en:'<b>What\'s new popup shows real icons</b>: the icon names ("share", "stopwatch"…) that appeared as text are now drawn as icons.',es:'<b>Novedades muestra los iconos de verdad</b>: los nombres de icono ("share", "stopwatch"…) que salían como texto ahora se dibujan como iconos.'}
  ,{i:'refresh',en:'<b>Better demo animations</b>: redone Frog Pump, Hand-Release Push-Up, Clamshell, Fire Hydrant, Banded Bridge, Kettlebell Halo (three versions), Speed Ladder, High Knees, Sprint and Shuttle Run so each one looks different and makes sense.',es:'<b>Mejores animaciones</b>: rehechas Frog Pump, Flexiones con liberación de manos, Clamshell, Fire Hydrant, Puente con banda, Kettlebell Halo (tres versiones), Escalera de velocidad, Rodillas altas, Sprint y Shuttle para que cada una se vea distinta y tenga sentido.'}
 ]},
 {v:'v1.1.9',items:[
  {i:'sparkles',en:'<b>73 exercises now have an animated demo</b>: Burpee, Bird Dog, Bear Crawl, band, stability-ball, balance, power and military drills and more show a looping 3D-mannequin animation on a gym background (cached for offline).',es:'<b>73 ejercicios ahora tienen demo animada</b>: Burpee, Bird Dog, Bear Crawl, y los de banda, pelota de estabilidad, balance, potencia y militares muestran una animación en bucle con un maniquí 3D en un gimnasio (queda guardada para usar sin internet).'}
 ]},
 {v:'v1.1.8',items:[
  {i:'share',en:'<b>Transparent share cards keep the full canvas</b>: Story, Post and Square sizes and the Top/Middle/Bottom position work with transparent too.',es:'<b>Las tarjetas transparentes mantienen el lienzo completo</b>: los tamaños Story, Post y Square y la posición Arriba/Medio/Abajo funcionan también en transparente.'}
 ]},
 {v:'v1.1.7',items:[
  {i:'camera',en:'<b>Share studio v2</b>: transparent cards cut to a small sticker you can copy or save and paste over any photo or story, a big live preview, two new cards (Personal record, Fun comparison) and a square size.',es:'<b>Estudio de compartir v2</b>: tarjetas transparentes recortadas como un sticker pequeño que puedes copiar o guardar y pegar sobre cualquier foto o historia, vista previa grande, dos tarjetas nuevas (Récord personal y Curiosa) y tamaño cuadrado.'}
 ]},
 {v:'v1.1.6',items:[
  {i:'stopwatch',en:'<b>Rest timer adjusts in bigger steps</b>: −1:00, −0:30, +0:30 and +1:00 on their own row.',es:'<b>El descanso se ajusta en pasos más grandes</b>: −1:00, −0:30, +0:30 y +1:00 en su propia fila.'}
 ]},
 {v:'v1.1.5',items:[
  {i:'stopwatch',en:'<b>Rest is always your choice</b>: it never starts by itself. A Rest button stays on screen during a workout; auto-start is an optional setting (off by default).',es:'<b>El descanso siempre es tu decisión</b>: nunca empieza solo. Un botón Descanso se queda en pantalla durante el entrenamiento; el inicio automático es un ajuste opcional (apagado por defecto).'}
 ]},
 {v:'v1.1.4',items:[
  {i:'pencil',en:'<b>Sets like Fitbod</b>: big weight and reps boxes, no − / + or check buttons. A set saves itself when you leave it filled in and turns green; clear a box to undo.',es:'<b>Series como en Fitbod</b>: cajas grandes de peso y repeticiones, sin botones − / + ni de confirmar. La serie se guarda sola al salir de ella y se pone verde; borra una caja para deshacerla.'}
 ]},
 {v:'v1.1.3',items:[
  {i:'trophy',en:'<b>Fairer strength score</b>: uses the sex in your plan profile, compares heavier lifters fairly, counts dumbbell and RDL variants, and ignores sets above 12 reps.',es:'<b>Puntaje de fuerza más justo</b>: usa el sexo de tu perfil del plan, compara con justicia a los más pesados, cuenta mancuernas y peso muerto rumano, e ignora series de más de 12 repeticiones.'}
 ]},
 {v:'v1.1.2',items:[
  {i:'trophy',en:'<b>Floating tab bar</b>, a <b>Train what is recovered</b> workout from the muscles that have rested, and a <b>General strength</b> score (0–100) with a chart on Progress.',es:'<b>Barra inferior flotante</b>, un entrenamiento <b>Entrena lo recuperado</b> con los músculos que ya descansaron y un puntaje de <b>Fuerza general</b> (0–100) con gráfica en Progreso.'}
 ]},
 {v:'v1.1.1',items:[
  {i:'body',en:'<b>Muscle recovery</b> on the Body tab: days since your last workout, groups recovered, and a ready-in-hours bar per muscle.',es:'<b>Recuperación muscular</b> en la pestaña Cuerpo: días desde tu último entrenamiento, grupos recuperados y una barra con las horas que faltan por músculo.'}
 ]},
 {v:'v1.1.0',items:[
  {i:'search',en:'<b>New exercise picker</b>: All / By muscle / Categories tabs, A–Z with letters, stretches kept separate, search pinned above the keyboard. New sets copy the last one and Enter walks weight → reps → done.',es:'<b>Selector nuevo</b>: pestañas Todo / Por músculo / Categorías, orden A–Z con letras, estiramientos aparte, búsqueda pegada al teclado. Las series nuevas copian la anterior y Enter va peso → reps → listo.'}
 ]},
 {v:'v1.0.7',items:[
  {i:'swipe',en:'<b>Search that fits the keyboard:</b> exercises show in two compact columns, several at a time, and the list stays above the keyboard so nothing hides behind it.',es:'<b>Búsqueda que cabe con el teclado:</b> los ejercicios salen en dos columnas compactas, varios a la vez, y la lista queda sobre el teclado para que nada se tape.'}
 ]},
 {v:'v1.0.6',items:[
  {i:'stopwatch',en:'<b>A stopwatch like the one on your phone:</b> start, pause and resume your workout clock, and pause the rest countdown too.',es:'<b>Un cronómetro como el de tu teléfono:</b> inicia, pausa y reanuda el reloj del entrenamiento, y pausa también la cuenta del descanso.'}
 ]},
 {v:'v1.0.5',items:[
  {i:'search',en:'<b>Adding exercises is much easier:</b> tick several at once, search by words and equipment, a new Mine tab with the ones you use most, and no more repeated exercises.',es:'<b>Agregar ejercicios es mucho más fácil:</b> elige varios a la vez, busca por palabras y equipo, una pestaña Mis ejercicios con los que más usas, y sin ejercicios repetidos.'}
 ]},
 {v:'v1.0.4',items:[
  {i:'timer',en:'<b>A clock that matches your training:</b> it starts with your first set (or the Start button), and rest is big, easy to see and set per exercise.',es:'<b>Un cronómetro que va con tu entrenamiento:</b> empieza con tu primera serie (o el botón Iniciar), y el descanso se ve grande y se configura por ejercicio.'}
 ]},
 {v:'v1.0.3',items:[
  {i:'grid',en:'<b>Easier set entry:</b> bigger weight and reps boxes with large − and + buttons, the whole number selects when you tap it, and a big green check.',es:'<b>Series más fáciles de anotar:</b> cajas de peso y repeticiones más grandes con botones − y + grandes, el número se selecciona completo al tocarlo y un check verde grande.'}
 ]},
 {v:'v1.0.2',items:[
  {i:'share',en:'<b>Share cards fixed:</b> the exercise list now shows every exercise in your order, the preview opens on a dark background, and Share opens your phone\'s share sheet right away.',es:'<b>Tarjetas de compartir arregladas:</b> la lista muestra todos tus ejercicios en tu orden, la vista previa abre con fondo oscuro y Compartir abre al instante el menú de compartir de tu teléfono.'}
 ]},
 {v:'v1.0.1',items:[
  {i:'book',en:'<b>User manual:</b> a complete illustrated guide to the app, in English and Spanish, and clearer help texts.',es:'<b>Manual del usuario:</b> una guía ilustrada completa de la app, en español e inglés, y textos de ayuda más claros.'}
 ]},
 {v:'v1.0',items:[
  {i:'🎉',en:'<b>Bubylift 1.0:</b> sign in with Google or e-mail, your progress follows you to any phone, a guided plan for every goal, Recovery plans, smart weight suggestions and personal-record celebrations.',es:'<b>Bubylift 1.0:</b> inicia sesión con Google o correo, tu progreso te sigue a cualquier teléfono, un plan guiado para cada meta, planes de Recuperación, sugerencias de peso y celebración de récords.'}
 ]},
 {v:'v0.99.17',items:[
  {i:'☁️',en:'<b>Everything follows you:</b> your settings, Recovery progress and the workout you are in the middle of now appear on any phone you log in on, and profile photo changes no longer get undone.',es:'<b>Todo te sigue:</b> tus ajustes, el progreso de Recuperación y el entrenamiento que llevas a medias ahora aparecen en cualquier teléfono donde inicies sesión, y los cambios de foto de perfil ya no se deshacen.'}
 ]},
 {v:'v0.99.16',items:[
  {i:'🔑',en:'<b>Google everywhere:</b> Continue with Google now appears on every sign-up and log-in screen.',es:'<b>Google en todas partes:</b> Continuar con Google ahora aparece en todas las pantallas de registro e inicio de sesión.'}
 ]},
 {v:'v0.99.15',items:[
  {i:'🧹',en:'<b>Simpler, lighter app:</b> the old on-device password profiles, security questions and phone-to-phone transfer screens are gone, now that sign-in runs through your account.',es:'<b>App más simple y ligera:</b> se quitaron los perfiles con contraseña local, las preguntas de seguridad y la transferencia entre teléfonos, ahora que el acceso va por tu cuenta.'}
 ]},
 {v:'v0.99.14',items:[
  {i:'🏆',en:'<b>Smarter workouts:</b> every lift now suggests what to try today based on your last session, with a one-tap Use button for the weight, and a new personal record gets a gold flash with sparks and your new estimated max.',es:'<b>Entrenamientos más inteligentes:</b> cada ejercicio ahora sugiere qué probar hoy según tu última sesión, con un botón Usar para poner el peso con un toque, y un nuevo récord personal recibe un destello dorado con chispas y tu nuevo máximo estimado.'}
 ]},
 {v:'v0.99.13',items:[
  {i:'🧭',en:'<b>Quick tour and clearer guest mode:</b> the first time you open Bubylift a 30-second tour walks you through the app. Skip it, switch it off in Settings or at sign-up, and replay it anytime. Guest mode now invites you to sign up and save your progress.',es:'<b>Tour rápido y modo invitado más claro:</b> la primera vez que abres Bubylift un tour de 30 segundos te guía por la app. Sáltalo, apágalo en Ajustes o al registrarte, y repítelo cuando quieras. El modo invitado ahora te invita a registrarte para guardar tu progreso.'}
 ]},
 {v:'v0.99.12',items:[
  {i:'🔑',en:'<b>Continue with Google:</b> sign up or log in with one tap. Google accounts need no password, and your workouts save to your account automatically.',es:'<b>Continuar con Google:</b> regístrate o inicia sesión con un toque. Las cuentas de Google no necesitan contraseña y tus entrenamientos se guardan solos en tu cuenta.'}
 ]},
 {v:'v0.99.11',items:[
  {i:'🔑',en:'<b>Log in like any social app:</b> a clean welcome screen (Sign up, Log in, Continue as guest), sign-up is now email + password first and your name and picture after, and log in is one simple full screen. Your workouts now save to your account automatically, so the Sync button is gone.',es:'<b>Inicia sesión como en cualquier red social:</b> pantalla de bienvenida limpia (Registrarme, Iniciar sesión, Continuar como invitado), el registro ahora pide primero correo y contraseña y luego tu nombre y foto, e iniciar sesión es una sola pantalla sencilla. Tus entrenamientos se guardan solos en tu cuenta, así que ya no hay botón de Sincronizar.'}
 ]},
 {v:'v0.99.10',items:[
  {i:'🧭',en:'<b>Clearer buttons and menus:</b> every button now looks like a button (outlined, raised, with pressed feedback) instead of colored text, and History moved inside Progress, so the bottom bar has four tabs: Workout, Mobility, Progress and Body.',es:'<b>Botones y menús más claros:</b> ahora todo botón se ve como botón (con borde, relieve y efecto al presionar) en vez de texto de color, y el Historial pasó a vivir dentro de Progreso, así que la barra inferior queda con cuatro pestañas: Entrenar, Movilidad, Progreso y Cuerpo.'}
 ]},
 {v:'v0.99.9',items:[
  {i:'🩹',en:'<b>Nine more Recovery plans</b> (13 in total): Achilles, plantar heel pain, jumper\'s knee, outer hip, hamstring, low back, neck, shoulder and tennis elbow, each in four phases with a safety check, sources and its own exercise guides. New body-zone filter to find yours fast.',es:'<b>Nueve planes más de Recuperación</b> (13 en total): Aquiles, talón (fascitis plantar), rodilla del saltador, cadera externa, isquiotibiales, espalda baja, cuello, hombro y codo de tenista, cada uno en cuatro fases con revisión de seguridad, fuentes y sus guías de técnica. Nuevo filtro por zona del cuerpo para encontrar el tuyo rápido.'}
 ]},
 {v:'v0.99.8',items:[
  {i:'🩹',en:'New Recovery plans in the Mobility tab: phased home programs for flat foot and inner-ankle pain, runner\'s knee, shin splints and ankle sprains, built from published guidelines, with a safety check, pain log and sources.',es:'Nuevos planes de Recuperación en la pestaña Movilidad: programas caseros por fases para pie plano y dolor de tobillo interno, rodilla del corredor, shin splints y esguinces, basados en guías publicadas, con revisión de seguridad, registro de dolor y fuentes.'}
 ]},
 {v:'v0.99.7',items:[
  {i:'↺',en:'One tap to repeat your last workout, and Undo after clearing a set or removing a set or exercise.',es:'Un toque para repetir tu último entrenamiento, y Deshacer al borrar una serie o quitar una serie o un ejercicio.'}
 ]},
 {v:'v0.99.6',items:[
  {i:'⚡',en:'Faster logging: tapping ✓ or +/− only refreshes that exercise (no flash, no jumping), with a light vibration and a little pop, and the next set scrolls into view.',es:'Registro más rápido: al tocar ✓ o +/− solo se actualiza ese ejercicio (sin parpadeo ni saltos), con una vibración suave y un pequeño efecto, y la siguiente serie se muestra sola.'}
 ]},
 {v:'v0.99.5',items:[
  {i:'📌',en:'Tapping something no longer throws you back to the top: the page, sheets and sign-in screens keep your place when they refresh.',es:'Tocar algo ya no te manda al inicio: la página, las hojas y las pantallas de acceso conservan tu lugar al actualizarse.'}
 ]},
 {v:'v0.99.4',items:[
  {i:'👆',en:'Picking an avatar no longer jumps back to the top of the list.',es:'Elegir un avatar ya no te regresa al inicio de la lista.'}
 ]},
 {v:'v0.99.3',items:[
  {i:'✅',en:'After you create your account you now see "Account created!" and go straight to sign in.',es:'Al crear tu cuenta ahora ves "¡Cuenta creada!" y pasas directo a iniciar sesión.'}
 ]},
 {v:'v0.99.2',items:[
  {i:'✨',en:'Create account is now a full screen: name and avatar, e-mail and password, recovery key, then you\'re in. You can also edit your name and photo from Manage account and as a guest.',es:'Crear cuenta ahora es una pantalla completa: nombre y avatar, correo y contraseña, clave de recuperación y listo. También puedes editar tu nombre y foto desde Administrar cuenta y como invitado.'}
 ]},
 {v:'v0.99.1',items:[
  {i:'🛠️',en:'<b>Sign-up fix</b> — if your account is created but the last setup step fails, the app now says so and tells you to sign in, and shows the exact reason.',es:'<b>Arreglo del registro</b> — si tu cuenta se crea pero falla el último paso de preparación, la app lo dice, te pide iniciar sesión y muestra el motivo exacto.'}
 ]},
 {v:'v0.99',items:[
  {i:'✉️',en:'<b>E-mail links land in the app</b> — confirm and reset-password e-mails now send you straight to Bubylift instead of the bare web address.',es:'<b>Los enlaces del correo llegan a la app</b> — los correos de confirmar y de recuperar contraseña ahora te llevan directo a Bubylift y no a la dirección web sin ruta.'}
 ]},
 {v:'v0.98',items:[
  {i:'🛠️',en:'<b>Clearer account errors</b> — when sign-in or sign-up can\'t reach the server, the message now says exactly which step failed.',es:'<b>Errores de cuenta más claros</b> — cuando el inicio de sesión o el registro no llegan al servidor, el mensaje ahora dice exactamente en qué paso falló.'}
 ]},
 {v:'v0.97',items:[
  {i:'🗑️',en:'<b>Old local profiles retired</b> — password-protected profiles that only lived on one phone are no longer valid. Open yours and create a free account to keep your data, or delete it.',es:'<b>Perfiles locales retirados</b> — los perfiles con contraseña que solo vivían en un teléfono ya no son válidos. Abre el tuyo y crea una cuenta gratis para conservar tus datos, o elimínalo.'}
 ]},
 {v:'v0.96',items:[
  {i:'☁️',en:'<b>Accounts only</b> — with cloud on, the only ways in are your cloud account or guest. Every create-account button now makes a cloud account, sign-in tells you if an email isn\'t registered, and guests can\'t create local profiles.',es:'<b>Solo cuentas</b> — con la nube activa, solo se entra con tu cuenta en la nube o como invitado. Todos los botones de crear cuenta crean una cuenta en la nube, el inicio de sesión avisa si un correo no está registrado, y los invitados ya no crean perfiles locales.'}
 ]},
 {v:'v0.95',items:[
  {i:'🖼️',en:'<b>Share cards, your way</b> — 7 transparent card styles with the Bubylift logo: save the PNG and drop it over any photo or story, or add a photo right in the app. Pick the color and Story or Post size.',es:'<b>Tarjetas a tu manera</b> — 7 estilos de tarjeta transparente con el logo de Bubylift: guarda el PNG y ponlo encima de cualquier foto o historia, o agrega una foto dentro de la app. Elige el color y el tamaño Historia o Publicación.'}
 ]},
 {v:'v94',items:[
  {i:'📌',en:'<b>Always in view</b> — during a workout, warm-up, mobility or stretching, the timer, sets and Finish button now stay pinned at the top while you scroll.',es:'<b>Siempre a la vista</b> — durante un entrenamiento, calentamiento, movilidad o estiramiento, el tiempo, las series y el botón Finish se quedan fijos arriba mientras te desplazas.'}
 ]},
 {v:'v93',items:[
  {i:'✨',en:'<b>Smooth</b> — windows now slide up and fade out, tabs and screens fade in softly, and buttons give a little press feedback. Respects the reduce-motion setting.',es:'<b>Más suave</b> — las ventanas ahora suben y se desvanecen al cerrar, las pestañas y pantallas aparecen con un fundido suave y los botones reaccionan al tocarlos. Respeta el ajuste de reducir movimiento.'}
 ]},
 {v:'v92',items:[
  {i:'👤',en:'<b>Create your account</b> — as a guest, a friendly pop-up now invites you to create a free account or sign in. And Switch profile takes you straight to the start screen when there\'s no other profile.',es:'<b>Crea tu cuenta</b> — si estás como invitado, un aviso amable te invita a crear una cuenta gratis o iniciar sesión. Y Cambiar de perfil te lleva directo a la pantalla de inicio cuando no hay otro perfil.'}
 ]},
 {v:'v91',items:[
  {i:'❤️',en:'<b>Your watch, automatically</b> — every time you open the app it checks Strava: new activities add heart rate and calories to matching workouts, and watch-only workouts show up in History.',es:'<b>Tu reloj, en automático</b> — cada vez que abres la app revisa Strava: las actividades nuevas agregan frecuencia cardíaca y calorías a los entrenamientos que coinciden, y los entrenamientos solo del reloj aparecen en Historial.'}
 ]},
 {v:'v90',items:[
  {i:'🔐',en:'<b>Private by design</b> — your cloud data is now encrypted on your phone. Not even the app\\\'s creator can read it. You get a recovery key when you create your account.',es:'<b>Privado por diseño</b> — tus datos en la nube ahora se cifran en tu teléfono. Ni siquiera el creador de la app puede leerlos. Recibes una clave de recuperación al crear tu cuenta.'},
  {i:'👤',en:'<b>Pick a profile photo</b> — a new Suggested gallery of round pictures to make your profile yours.',es:'<b>Elige tu foto de perfil</b> — una galería nueva de imágenes redondas sugeridas para hacer tu perfil más tuyo.'},
  {i:'✨',en:'<b>A cleaner look</b> — phone emoji are gone: every screen now uses the same set of line icons.',es:'<b>Un look más limpio</b> — se acabaron los emojis del teléfono: todas las pantallas usan el mismo set de iconos de línea.'}
 ]},
 {v:'v89',items:[
  {i:'❤️',en:'<b>Watch data from Strava</b> — connect Strava and bring the heart rate and calories from your watch into any workout, and onto your share card.',es:'<b>Datos de tu reloj con Strava</b> — conecta Strava y trae la frecuencia cardíaca y las calorías de tu reloj a cualquier entrenamiento, y a tu tarjeta para compartir.'}
 ]},
 {v:'v88',items:[
  {i:'☁️',en:'<b>Your progress on any phone</b> — create a free account and your workouts follow you: sign in on another phone and everything is there.',es:'<b>Tu progreso en cualquier teléfono</b> — crea una cuenta gratis y tus entrenamientos te siguen: entra desde otro teléfono y todo está ahí.'}
 ]},
 {v:'v87',items:[
  {i:'🧘',en:'<b>Mobility up front</b> — Mobility is now its own tab and has a card on Train, with a big button to start 10 minutes of mobility. Settings moved to the gear icon at the top.',es:'<b>La movilidad al frente</b> — Movilidad ahora tiene su propia pestaña y una tarjeta en Entrenar, con un botón grande para empezar 10 minutos de movilidad. Los ajustes pasaron al icono de engranaje arriba.'}
 ]},
 {v:'v86',items:[
  {i:'💪',en:'<b>Muscle groups, named right</b> — where you pick what to train, the app now says muscle group (chest, back, legs…) instead of muscle.',es:'<b>Grupos musculares, bien nombrados</b> — donde eliges qué entrenar, la app ahora dice grupo muscular (pecho, espalda, piernas…) en vez de músculo.'}
 ]},
 {v:'v85',items:[
  {i:'🗣️',en:'<b>Plan setup that talks like a coach</b> — every question now explains why it matters and what to expect, plus friendlier challenges, programs and help.',es:'<b>Armar tu plan, como con un entrenador</b> — cada pregunta explica por qué importa y qué esperar, y los retos, programas y la ayuda hablan más cercano.'}
 ]},
 {v:'v84',items:[
  {i:'💬',en:'<b>Friendlier words</b> — messages, buttons and empty screens now talk about what you gain, with a warm note after every workout (first workout, new record, streaks) and clearer hints.',es:'<b>Textos más cercanos</b> — mensajes, botones y pantallas vacías ahora hablan de lo que ganas tú, con una nota cálida al terminar cada entrenamiento (primero, récord nuevo, rachas) y ayudas más claras.'}
 ]},
 {v:'v83',items:[
  {i:'💪',en:'<b>A clearer workout screen</b> — bigger fields, a clear green check when a set is done, and a floating rest timer.',es:'<b>Pantalla de entrenamiento más clara</b> — campos más grandes, un check verde claro al completar una serie y un temporizador de descanso flotante.'}
 ]},
 {v:'v82',items:[
  {i:'🧩',en:'<b>Body, Stretch and More, redesigned</b> — iPhone-style switches, flatter cards and tidier lists across the rest of the app.',es:'<b>Cuerpo, Estirar y Más, rediseñados</b> — selectores estilo iPhone, tarjetas más planas y listas más ordenadas en el resto de la app.'}
 ]},
 {v:'v81',items:[
  {i:'🗓️',en:'<b>History and Progress, redesigned</b> — workouts are tidy rows with the date up front, grouped by month; Progress lists your exercises in one clean list.',es:'<b>Historial y Progreso, rediseñados</b> — los entrenamientos son filas ordenadas con la fecha al frente, agrupadas por mes; Progreso lista tus ejercicios en una sola lista limpia.'}
 ]},
 {v:'v80',items:[
  {i:'🎨',en:'<b>A new look</b> — a cleaner, iPhone-style design: big titles, one accent color, a bold card for today\'s workout, your week at a glance and tidy lists to explore. The Stretch screen moved into Explore.',es:'<b>Un nuevo diseño</b> — más limpio, estilo iPhone: títulos grandes, un solo color de acento, una tarjeta destacada con el entrenamiento de hoy, tu semana de un vistazo y listas ordenadas para explorar. Estirar pasó a Explorar.'}
 ]},
 {v:'v79',items:[
  {i:'📈',en:'<b>Charts for your main lifts</b> — Progress now shows a chart for your top 3 lifts right at the top, plus a 1-rep max calculator with training weights (95%–60%).',es:'<b>Gráficas de tus ejercicios principales</b> — Progreso muestra al inicio la gráfica de tus 3 ejercicios principales y una calculadora de máximo (1 repetición) con pesos de entrenamiento (95%–60%).'}
 ]},
 {v:'v78',items:[
  {i:'📥',en:'<b>Bring your history from Hevy or Strong</b> — More → Import workouts (.csv) now reads Hevy and Strong exports too, keeping warm-ups, drop sets and dates. Unknown exercises are added as your own.',es:'<b>Trae tu historial de Hevy o Strong</b> — Más → Importar entrenamientos (.csv) ahora lee también los archivos de Hevy y Strong, con calentamientos, drop sets y fechas. Los ejercicios desconocidos se agregan como propios.'}
 ]},
 {v:'v77',items:[
  {i:'🧼',en:'<b>Cleaner workout screen</b> — each exercise now has a single ⋯ menu (swap, guide, notes, remove) and Cancel moved out of the way.',es:'<b>Pantalla de entrenamiento más limpia</b> — cada ejercicio tiene un solo menú ⋯ (sustituir, guía, notas, quitar) y Cancelar quedó más apartado.'}
 ]},
 {v:'v76',items:[
  {i:'🏷️',en:'<b>Mark warm-ups, drop sets and failure</b> — tap the set number to mark a set as warm-up (W), drop set (D) or failure (F). Warm-ups do not count for records or volume. The types are saved and included in CSV export and import.',es:'<b>Marca calentamiento, drop sets y fallo</b> — toca el número de la serie para marcarla como calentamiento (W), drop set (D) o fallo (F). Los calentamientos no cuentan para récords ni volumen. Los tipos se guardan y se incluyen al exportar e importar CSV.'}
 ]},
 {v:'v75',items:[
  {i:'🔢',en:'<b>Rep ranges that are easy to follow</b> — every target is now a range with easy numbers (5–8, 10–12, 15–20) instead of odd single numbers like 13 or 17. Famous programs with fixed schemes, like 5×5, keep their exact numbers.',es:'<b>Rangos de repeticiones fáciles de seguir</b> — cada meta ahora es un rango con números fáciles (5–8, 10–12, 15–20) en lugar de números impares sueltos como 13 o 17. Los programas famosos con esquemas fijos, como 5×5, conservan sus números exactos.'}
 ]},
 {v:'v74',items:[
  {i:'✨',en:'<b>A more polished look</b> — clearer section titles, more breathing room, a consistent corner radius, larger small text, better contrast, a little motion (set checks, records, cards) and friendly empty screens with one clear button.',es:'<b>Un aspecto más pulido</b> — títulos de sección más claros, más espacio, esquinas consistentes, texto pequeño más grande, mejor contraste, un poco de movimiento (series, récords, tarjetas) y pantallas vacías amigables con un botón claro.'}
 ]},
 {v:'v73',items:[
  {i:'🧹',en:'<b>A cleaner home</b> — the plan card on Home now keeps only the main actions (Start, Today\'s mode, Short on time, More options). Volume, schedule and the rest moved to the plan options and to a new "My plan" section in More. New Text size setting (A, A+, A++).',es:'<b>Un inicio más limpio</b> — la tarjeta del plan en Inicio ahora conserva solo lo principal (Empezar, Modo de hoy, Poco tiempo, Más opciones). Volumen, horario y lo demás pasaron a las opciones del plan y a una nueva sección "Mi plan" en Más. Nuevo ajuste de tamaño de letra (A, A+, A++).'}
 ]},
 {v:'v72',items:[
  {i:'📸',en:'<b>Share your workout</b> — a picture card of any workout (name, time, sets, volume, records and top exercises) to post or send, a CSV import so you can bring your workouts back, and backups now keep your goals and AFT targets.',es:'<b>Comparte tu entrenamiento</b> — una tarjeta con imagen de cualquier entrenamiento (nombre, tiempo, series, volumen, récords y ejercicios principales) para publicar o enviar, importación de CSV para recuperar tus entrenamientos, y los respaldos ahora conservan tus metas y objetivos del AFT.'}
 ]},
 {v:'v71',items:[
  {i:'🎖️',en:'<b>Army fitness test panel and field mode</b> — in your plan, the AFT panel shows your best result in each event, your own target and the weakest event, with a short workout to train it. "Today\'s mode" now has Field / deployed: a 30 minute workout with only a pack, a pull-up bar and bodyweight.',es:'<b>Panel de la prueba física del Ejército y modo campo</b> — en tu plan, el panel AFT muestra tu mejor resultado en cada evento, tu propia meta y el evento más débil, con un entrenamiento corto para trabajarlo. "Modo de hoy" ahora tiene Campo / despliegue: un entrenamiento de 30 minutos solo con mochila, barra de dominadas y peso corporal.'}
 ]},
 {v:'v70',items:[
  {i:'👆',en:'<b>Easier to log</b> — each exercise shows a small animated demo and a one-line tip, "Same as last time" fills your sets in one tap, and the rest timer is bigger and flashes green when it ends.',es:'<b>Más fácil de registrar</b> — cada ejercicio muestra una mini demostración animada y una pista de una línea, "Igual que la última vez" llena tus series en un toque, y el cronómetro de descanso es más grande y se pone verde al terminar.'}
 ]},
 {v:'v69',items:[
  {i:'🧭',en:'<b>Your day, your way</b> — before a workout the app asks how you feel (tired = an easier version), "Today\'s mode" swaps to hotel, home or dumbbells-only versions, "Another plan like this" mixes the exercises up, and swaps now prefer your training style.',es:'<b>Tu día, a tu manera</b> — antes de entrenar la app pregunta cómo te sientes (cansado = versión más suave), "Modo de hoy" cambia a versiones de hotel, casa o solo mancuernas, "Otro plan parecido" mezcla los ejercicios de nuevo, y los cambios ahora prefieren tu estilo de entrenamiento.'}
 ]},
 {v:'v68',items:[
  {i:'🔥',en:'<b>Keep the habit going</b> — a weekly streak (a week counts with about two thirds of your workouts, and one missed week is forgiven), a summary of your last week, and calendar reminders on your training days (Plan → Reminders).',es:'<b>Mantén el hábito</b> — una racha semanal (una semana cuenta con cerca de dos tercios de tus entrenamientos, y se perdona una semana perdida), un resumen de tu semana pasada y recordatorios en el calendario en tus días de entrenamiento (Plan → Recordatorios).'}
 ]},
 {v:'v67',items:[
  {i:'🏷️',en:'<b>Pick the library by style</b> — in the routine library, tap a training style (gym weights, calisthenics, home, military…) and the equipment list adjusts to it, so the routines match how you like to train.',es:'<b>La biblioteca por estilo</b> — en la biblioteca de rutinas, toca un estilo de entrenamiento (pesas de gimnasio, calistenia, casa, militar…) y el equipo se ajusta, para que las rutinas encajen con cómo te gusta entrenar.'}
 ]},
 {v:'v66',items:[
  {i:'💬',en:'<b>Plain words</b> — training phases now have clear names (Base, Strength with control, Build muscle, Heavy strength, Power), less jargon on screen, and a new Help entry that explains set, rep, superset, pace, phase and estimated max.',es:'<b>Palabras simples</b> — las fases de entrenamiento ahora tienen nombres claros (Base, Fuerza con control, Ganar músculo, Fuerza máxima, Potencia), menos jerga en pantalla, y una nueva entrada en Ayuda que explica serie, repetición, superset, ritmo, fase y máximo estimado.'}
 ]},
 {v:'v65',items:[
  {i:'🎯',en:'<b>Goals with a progress bar</b> — in Progress, set a concrete goal: more reps in an exercise (10 pull-ups), more weight (bench 225 lb), your body weight, or workouts per month. The bar fills as you train and you get a message when you reach it.',es:'<b>Metas con barra de progreso</b> — en Progreso, pon una meta concreta: más repeticiones en un ejercicio (10 dominadas), más peso (banca con 225 lb), tu peso corporal o entrenamientos al mes. La barra se llena mientras entrenas y te avisa cuando la logras.'}
 ]},
 {v:'v64',items:[
  {i:'⏱️',en:'<b>Back after a break, or short on time</b> — after 14+ days without training the home card offers an easy restart (one set fewer, about 15% less weight). The new "Short on time" button builds a 20, 30 or 45 minute version of today\'s workout, keeping the main lifts.',es:'<b>Volver tras una pausa, o poco tiempo</b> — tras 14+ días sin entrenar, la tarjeta de inicio ofrece retomar suave (una serie menos, cerca de 15 % menos peso). El botón nuevo "Poco tiempo" arma una versión de 20, 30 o 45 minutos del entrenamiento de hoy, conservando lo principal.'}
 ]},
 {v:'v63',items:[
  {i:'⚡',en:'<b>Faster and more yours</b> — the plan setup now starts with Quick (4 questions) or Custom. In any exercise you can tap "I like this" (shows up more) or "I don\'t like this" (swapped now and never suggested again). Manage them in Plan → Your tastes.',es:'<b>Más rápido y más tuyo</b> — al crear tu plan eliges Rápido (4 preguntas) o Personalizado. En cualquier ejercicio puedes tocar "Me gusta" (sale más) o "No me gusta" (se cambia al instante y no se vuelve a sugerir). Los administras en Plan → Tus gustos.'}
 ]},
 {v:'v62',items:[
  {i:'💪',en:'<b>Pick how you like to train</b> — the plan setup now asks "How do you like to train?" instead of a gear list. Choose up to two styles (gym weights, heavy strength, calisthenics, Olympic lifting, CrossFit, athletic, home, military) and mix them 50/50 or 75/25. Each card shows what it includes and example exercises. "I don\'t have all of this" opens the equipment list.',es:'<b>Elige cómo te gusta entrenar</b> — al crear tu plan ahora se pregunta "¿Cómo te gusta entrenar?" en vez de una lista de equipo. Elige hasta dos estilos (pesas de gimnasio, fuerza pesada, calistenia, halterofilia, CrossFit, atlético, casa, militar) y mézclalos 50/50 o 75/25. Cada tarjeta muestra qué incluye y ejercicios de ejemplo. "No tengo todo esto" abre la lista de equipo.'}
 ]},
 {v:'v61',items:[
  {i:'🏋️',en:'<b>Conventional gear first</b> — new plans start with standard gym equipment only (barbell, dumbbells, cables, machines, bench, pull-up bar). Stability ball, bands, suspension, kettlebell, sled and the rest are opt-in: turn them on in your equipment list. Even when they are on, the plan picks conventional lifts first.',es:'<b>Primero el equipo convencional</b> — los planes nuevos empiezan solo con equipo de gimnasio estándar (barra, mancuernas, poleas, máquinas, banco, barra de dominadas). La pelota, bandas, suspensión, pesa rusa, trineo y lo demás son opcionales: actívalos en tu lista de equipo. Aun si están activados, el plan elige primero los ejercicios convencionales.'}]},
 {v:'v60',items:[
  {i:'🏛️',en:'<b>Famous splits are classic now</b> — Push/Pull/Legs, Upper/Lower, Arnold and the other famous splits use classic gym lifts only: no stability ball, bands, suspension or special gear, and no NASM phases.',es:'<b>Las divisiones famosas ahora son clásicas</b> — Empuje/Jalón/Piernas, Superior/Inferior, Arnold y las demás divisiones famosas usan solo ejercicios clásicos de gimnasio: sin pelota, bandas, suspensión ni equipo especial, y sin fases NASM.'}]},
 {v:'v59',items:[
  {i:'📷',en:'<b>17 more exercises with photos</b> — hex bar deadlift, Turkish get-up, jump rope, walking, hiking, lunge jumps and more now show photos. About 75 exercises (balance drills, some stability-ball and band moves, sprints) still show a clean icon tile instead of a photo.',es:'<b>17 ejercicios más con foto</b> — peso muerto con barra hexagonal, levantamiento turco, saltar la cuerda, caminar, senderismo, saltos de zancada y más ya muestran fotos. Unos 75 ejercicios (equilibrio, algunos con pelota o bandas, sprints) todavía muestran un icono limpio en vez de foto.'}]},
 {v:'v58',items:[
  {i:'📈',en:'<b>History, Progress and Body redesigned</b> — every workout and every exercise now shows a photo thumbnail, and the totals and your weight card use the app\'s orange accent so they stand out.',es:'<b>Historial, Progreso y Cuerpo rediseñados</b> — cada entrenamiento y cada ejercicio ahora muestra una miniatura con foto, y los totales y la tarjeta de peso usan el naranja de la app para destacar.'}]},
 {v:'v57',items:[
  {i:'🔤',en:'<b>Clearer sub-heading</b> — "…or train with a piece of equipment" is now a bold, easy-to-read heading with a divider line.',es:'<b>Subtítulo más claro</b> — "…o entrena con un equipo" ahora es un encabezado en negritas, fácil de leer y con una línea divisoria.'}]},
 {v:'v56',items:[
  {i:'📐',en:'<b>Smaller photo tiles</b> — the muscle and equipment tiles in the library are about half the size, so you see more at once.',es:'<b>Fichas con foto más pequeñas</b> — las fichas de músculo y equipo en la biblioteca son como la mitad de grandes, así ves más a la vez.'},
  {i:'📍',en:'<b>No more jumping to the top</b> — when you tap a tile, chip or rank inside a sheet, it stays where you are instead of scrolling back up.',es:'<b>Ya no salta hacia arriba</b> — al tocar una ficha, opción o rango dentro de una hoja, se queda donde estás en vez de volver al inicio.'}]},
 {v:'v55',items:[
  {i:'🏁',en:'<b>Photos on challenges and ranks</b> — every challenge shows a photo of one of its moves, and the six rank cards (Seed to Titan) now have a photo background.',es:'<b>Fotos en retos y rangos</b> — cada reto muestra la foto de uno de sus movimientos, y las seis tarjetas de rango (Semilla a Titán) ahora tienen foto de fondo.'}]},
 {v:'v54',items:[
  {i:'🖼️',en:'<b>Photos in the library</b> — pick a muscle or a piece of equipment from photo tiles, and the famous splits and classic programs now have a photo too.',es:'<b>Fotos en la biblioteca</b> — elige un músculo o un equipo en fichas con foto, y las divisiones famosas y los programas clásicos también tienen foto.'}]},
 {v:'v53',items:[
  {i:'📸',en:'<b>Equipment with photos</b> — when you choose your equipment (plan setup, routines) every item now has a photo and a one-line "what is it", so you know what a kettlebell, a sled or a suspension trainer is.',es:'<b>Equipo con fotos</b> — al elegir tu equipo (configurar el plan, rutinas) cada opción tiene una foto y una línea que explica qué es, para que sepas qué es una pesa rusa, un trineo o una suspensión.'}]},
 {v:'v52',items:[
  {i:'🧩',en:'<b>Real icons instead of emojis</b> — the home cards, More menu, plan buttons, history and exercise lists now use a clean, consistent icon set, so they look the same on every phone.',es:'<b>Iconos reales en lugar de emojis</b> — las tarjetas de inicio, el menú Más, los botones del plan, el historial y las listas de ejercicios ahora usan un conjunto de iconos limpio y consistente, así que se ven igual en cualquier teléfono.'}]},
 {v:'v51',items:[
  {i:'🎨',en:'<b>New look</b> — Workout opens with big photo cards, your routines show a photo of their first exercise, and exercise lists everywhere (picker, plan, library, stretch) now have photo thumbnails.',es:'<b>Nuevo aspecto</b> — Entrenar abre con tarjetas grandes con fotos, tus rutinas muestran la foto de su primer ejercicio y las listas de ejercicios (selector, plan, biblioteca, estirar) ahora tienen miniaturas.'},
  {i:'🗂️',en:'<b>More tab, organized</b> — data and app options are now clean list rows with icons, and the plan buttons are grouped in one compact row.',es:'<b>Menú Más ordenado</b> — las opciones de datos y de la app ahora son filas limpias con iconos, y los botones del plan están agrupados en una sola fila compacta.'}]},
 {v:'v50',items:[
  {i:'📷',en:'<b>Photos on the original exercises too</b> — about 150 of the exercises that were already in the app (bench press, pull-up, squat, curls…) now show two alternating photos in their technique guide, like the new ones.',es:'<b>Fotos también en los ejercicios originales</b> — unos 150 de los ejercicios que ya estaban en la app (press de banca, dominadas, sentadilla, curls…) ahora muestran dos fotos que alternan en su guía de técnica, como los nuevos.'},
  {i:'🔔',en:'<b>Equipment routines open anywhere</b> — the kettlebell, dumbbell, band… routines no longer depend on the equipment list above them; picking one shows its routine.',es:'<b>Rutinas por equipo siempre disponibles</b> — las rutinas de pesa rusa, mancuernas, bandas… ya no dependen de la lista de equipo de arriba; al elegir una se muestra su rutina.'}]},
 {v:'v49',items:[
  {i:'🔔',en:'<b>Routines by equipment</b> — Workout → Routines by muscle or equipment now has kettlebell, dumbbell, barbell, cable, machine, band, suspension, medicine ball and bodyweight routines, each at six levels, using the new exercises, plus a Stretch &amp; mobility routine. Mark your equipment to see them.',es:'<b>Rutinas por equipo</b> — Entrenar → Rutinas por músculo o equipo ahora tiene rutinas de pesa rusa, mancuernas, barra, poleas, máquinas, bandas, suspensión, balón medicinal y peso corporal, cada una en seis niveles, con los ejercicios nuevos, y una rutina de Estiramiento y movilidad. Marca tu equipo para verlas.'},
  {i:'🧘',en:'<b>Stretch tab</b> — a new tab just for stretching and mobility: quick sessions (5, 10 or 15 min) for full body, lower, upper, back &amp; core, warm-up or cool-down, and every stretch by body area, with photos.',es:'<b>Pestaña Estirar</b> — una pestaña nueva solo para estiramiento y movilidad: sesiones rápidas (5, 10 o 15 min) de cuerpo completo, parte baja, parte alta, espalda y core, calentamiento o enfriamiento, y todos los estiramientos por zona del cuerpo, con fotos.'},
  {i:'🧩',en:'<b>New exercises in your plan</b> — about 400 of the new exercises now rotate into auto-built plans (mostly as accessories) and swaps.',es:'<b>Ejercicios nuevos en tu plan</b> — unos 400 de los ejercicios nuevos ahora rotan en los planes automáticos (sobre todo como accesorios) y en los cambios.'}]},
 {v:'v48',items:[
  {i:'📚',en:'<b>~750 more exercises</b> — the library now has about 990 moves, each with a short step-by-step guide in English and Spanish and two photos that alternate in the technique guide. A new "Stretch &amp; mobility" group holds stretches and mobility drills; they are not used in auto-built plans. Joint-stress tags on the new exercises are automatic, so treat them as general precautions.',es:'<b>~750 ejercicios más</b> — la biblioteca ahora tiene cerca de 990 movimientos, cada uno con una guía corta paso a paso en español e inglés y dos fotos que alternan en la guía de técnica. Un grupo nuevo "Estiramiento y movilidad" reúne estiramientos y ejercicios de movilidad; no se usan en los planes armados automáticamente. Las etiquetas de estrés articular de los nuevos ejercicios son automáticas, tómalas como precauciones generales.'}]},
 {v:'v47',items:[
  {i:'🛞',en:'<b>More equipment you mark</b> — the Ab Wheel Rollout, balance pad and half-ball moves, and sandbag or ammo-can moves are only suggested if you say you have them. Add them in your equipment list (plan setup, Adjust my plan or the equipment box in routines).',es:'<b>Más equipo que marcas</b> — la rueda abdominal, los ejercicios con almohadilla o media pelota y los de saco de arena o caja de municiones solo se sugieren si dices que los tienes. Agrégalos en tu lista de equipo (configuración del plan, Ajustar mi plan o el cuadro de equipo en las rutinas).'}]},
 {v:'v46',items:[
  {i:'🧍',en:'<b>Full body today</b> — Workout → Routines by muscle now starts with "Full body": squat, push, pull, hinge, shoulders and core in one session, at six levels, with your equipment. Train it now or save it as a routine.',es:'<b>Cuerpo completo hoy</b> — Entrenar → Rutinas por músculo ahora empieza con "Cuerpo completo": sentadilla, empuje, jalón, bisagra, hombros y core en una sola sesión, en seis niveles, con tu equipo. Entrénala ya o guárdala como rutina.'}]},
 {v:'v45',items:[
  {i:'❓',en:'<b>Help & FAQ</b> — new button in More with answers to the most common questions and a box at the bottom for questions, complaints or comments.',es:'<b>Ayuda y preguntas frecuentes</b> — botón nuevo en Más con las respuestas a las dudas más comunes y un recuadro abajo para dudas, quejas o comentarios.'},
  {i:'🗑️',en:'<b>Delete a profile from the app</b> — tap your avatar and choose Delete profile (the password is asked; guests too).',es:'<b>Eliminar un perfil desde la app</b> — toca tu avatar y elige Eliminar perfil (se pide la contraseña; también para el invitado).'}]},
 {v:'v44',items:[
  {i:'👋',en:'<b>Welcome back</b> — opening your profile now shows a very short welcome screen with the app icon, like opening the app again.',es:'<b>Bienvenido de nuevo</b> — al abrir tu perfil ahora sale una pantalla de bienvenida muy corta con el icono de la app, como si abrieras la app otra vez.'},
  {i:'👤',en:'<b>Guest on the profile screen</b> — "Continue as guest" is now right there next to Add profile.',es:'<b>Invitado en la pantalla de perfiles</b> — "Continuar como invitado" ahora está ahí mismo junto a Añadir perfil.'}]},
 {v:'v43',items:[
  {i:'🔓',en:'<b>No password every time</b> — when you sign in, "Keep me signed in on this device" is on, so the app opens straight into your profile. Turn it off any time in the profile menu (avatar button).',es:'<b>Sin contraseña cada vez</b> — al entrar, "Mantener mi sesión en este dispositivo" viene encendido, así la app abre directo en tu perfil. Lo apagas cuando quieras en el menú del perfil (botón del avatar).'},
  {i:'👤',en:'<b>Guest still available</b> — Add profile now includes "Continue as guest", even after you made your own profile.',es:'<b>El invitado sigue disponible</b> — Añadir perfil ahora incluye "Continuar como invitado", aunque ya hayas creado tu perfil.'}]},
 {v:'v42',items:[
  {i:'👆',en:'<b>No more accidental skips</b> — in the plan questions, tapping an option now only selects it. You move on with the Next button, so you can read, change your answer and go back without losing your place.',es:'<b>Sin saltos por accidente</b> — en las preguntas del plan, tocar una opción ahora solo la selecciona. Avanzas con el botón Siguiente, así puedes leer, cambiar tu respuesta y volver sin perder el lugar.'}]},
 {v:'v41',items:[
  {i:'📜',en:'<b>Smooth scrolling in the plan questions</b> — on iPhone the long option lists (like the training split) now scroll normally, and the Next button stays at the bottom.',es:'<b>Deslizar sin trabas en las preguntas del plan</b> — en iPhone las listas largas de opciones (como la división de entrenamiento) ahora se deslizan normal, y el botón Siguiente se queda abajo.'}]},
 {v:'v40',items:[
  {i:'🏆',en:'<b>Classic programs</b> — Full body, StrongLifts 5×5, Starting Strength, 5/3/1, PHUL and German Volume (10×10) are now in Workout → Programs. Each day uses your equipment; train it or save it as a routine. 5/3/1 calculates the weights from your training max.',es:'<b>Programas clásicos</b> — Cuerpo completo, StrongLifts 5×5, Starting Strength, 5/3/1, PHUL y Volumen Alemán (10×10) ya están en Entrenar → Programas. Cada día usa tu equipo; entrénalo o guárdalo como rutina. El 5/3/1 calcula los pesos desde tu máximo de entrenamiento.'}]},
 {v:'v39',items:[
  {i:'🧪',en:'<b>A real starting test</b> — instead of only push-ups, the plan now asks seven quick questions (plank, one-leg balance, squat check, push-ups, pulling, leg strength and training history). They decide your starting level and OPT phase, and the plan tells you why. “Not sure” is always an option and makes the plan start more carefully.',es:'<b>Una prueba de inicio de verdad</b> — en vez de solo flexiones, el plan ahora hace siete preguntas rápidas (plancha, equilibrio en una pierna, sentadilla de control, flexiones, jalón, fuerza de piernas e historial). Fijan tu nivel de inicio y tu fase OPT, y el plan te explica por qué. “No estoy seguro” siempre es una opción y hace que el plan empiece con más cuidado.'}]},
 {v:'v38',items:[
  {i:'🧭',en:'<b>Shorter plan questions</b> — the "physical skill" question is gone from the first setup; you can still add power, speed, balance or endurance later from Adjust my plan.',es:'<b>Preguntas del plan más cortas</b> — la pregunta de "habilidad física" ya no está en la configuración inicial; puedes agregar potencia, velocidad, equilibrio o resistencia después desde Ajustar mi plan.'},
  {i:'📲',en:'<b>Opening from Instagram?</b> If you open the app inside Instagram, Facebook or TikTok, a notice now shows how to open it in Safari or Chrome, where it can be installed.',es:'<b>¿La abriste desde Instagram?</b> Si abres la app dentro de Instagram, Facebook o TikTok, ahora un aviso te explica cómo abrirla en Safari o Chrome, donde sí se puede instalar.'}]},
 {v:'v37',items:[
  {i:'📲',en:'<b>Install guide for everyone</b> — the Install button is now always at the top while you use the app in a browser. It explains why to install (one tap, works offline, safer log, free) and shows the exact steps for iPhone, Android and computers.',es:'<b>Guía de instalación para todos</b> — el botón Instalar ahora siempre está arriba mientras usas la app en un navegador. Explica por qué instalarla (un toque, funciona sin internet, registro más seguro, gratis) y muestra los pasos exactos para iPhone, Android y computadoras.'}]},
 {v:'v36',items:[
  {i:'🖥️',en:'<b>Made for tablets and computers too</b> — on a tablet the start options and cards use two or three columns and windows open centered; on a computer the tabs move to a side menu and the content stays comfortably centered. Phones look the same as before.',es:'<b>Ahora también para tabletas y computadoras</b> — en tableta las opciones de inicio y las tarjetas usan dos o tres columnas y las ventanas se abren al centro; en computadora las pestañas pasan a un menú lateral y el contenido queda centrado y cómodo. En el teléfono todo se ve igual que antes.'}]},
 {v:'v35',items:[
  {i:'✏️',en:'<b>Edit your routines</b> — in your plan you can now move an exercise up or down, send it to another day and rename any day; in My routines you can reorder exercises. Ready routines, splits and challenges stay as designed, but you can save a copy to My routines and edit that.',es:'<b>Edita tus rutinas</b> — en tu plan ahora puedes subir o bajar un ejercicio, mandarlo a otro día y renombrar cualquier día; en Mis rutinas puedes reordenar los ejercicios. Las rutinas listas, las divisiones y los retos se quedan como fueron diseñados, pero puedes guardar una copia en Mis rutinas y editar esa.'}]},
 {v:'v34',items:[
  {i:'💬',en:'<b>Send feedback</b> — new button in More → App that opens a short form (about a minute): how you like the app, what you use, what confused you and what you would like to see. Nothing is sent unless you submit it. After your first routine and first logged set you also get a one-time reminder.',es:'<b>Enviar feedback</b> — botón nuevo en Más → App que abre un formulario corto (alrededor de un minuto): qué tal te parece la app, qué usas, qué te confundió y qué te gustaría ver. No se envía nada a menos que tú lo envíes. Después de tu primera rutina y tu primer set también recibes un aviso una sola vez.'}]},
 {v:'v33',items:[
  {i:'🔀',en:'<b>Go straight to the famous splits</b> — Push/Pull/Legs, Upper/Lower, Arnold, body-part and Upper/Lower + PPL now have their own button on the Workout tab. Pick the split, your experience and the days, see every day with its reasons, train one day right away or make it your plan.',es:'<b>Directo a las divisiones famosas</b> — Empuje/Jalón/Piernas, Torso/Pierna, Arnold, un músculo por día y Torso/Pierna + PPL ahora tienen su propio botón en la pestaña Entrenar. Elige la división, tu experiencia y los días, mira cada día con sus razones, entrena un día de inmediato o conviértela en tu plan.'}]},
 {v:'v32',items:[
  {i:'🧩',en:'<b>Clearer routines and challenges screens</b> — the two sections are now a switch at the top, and each screen is split into numbered steps (muscle, rank, your routine) with rank cards that look different from the muscle buttons.',es:'<b>Pantallas de rutinas y retos más claras</b> — las dos secciones ahora son un interruptor arriba, y cada pantalla se divide en pasos numerados (músculo, rango, tu rutina) con tarjetas de rango que se ven distintas de los botones de músculo.'}]},
 {v:'v31',items:[
  {i:'🏅',en:'<b>Six ranks instead of easy, medium, hard</b> — with names that follow what you train (Pigeon to Mammoth for chest, Foal to Pegasus for legs, Recruit to Warlord for military challenges, and more), for muscle routines and challenges. You start at the rank that fits your level, and each rank adds volume or difficulty with its reason.',es:'<b>Seis rangos en vez de fácil, medio y difícil</b> — con nombres que siguen lo que entrenas (de Paloma a Mamut en pecho, de Potrillo a Pegaso en piernas, de Recluta a Señor de la guerra en los retos militares y más), para las rutinas por músculo y los retos. Empiezas en el rango que corresponde a tu nivel, y cada rango suma volumen o dificultad con su razón.'}]},
 {v:'v30',items:[
  {i:'🧭',en:'<b>Pick how you want to train</b> — the Workout tab now starts with clear choices: let the app make your plan (great if you are new), routines by muscle, challenges, or your own workout if you already know what you want.',es:'<b>Elige cómo quieres entrenar</b> — la pestaña Entrenar ahora empieza con opciones claras: que la app arme tu plan (ideal si estás empezando), rutinas por músculo, retos, o tu propio entrenamiento si ya sabes lo que quieres.'}]},
 {v:'v29',items:[
  {i:'🔧',en:'<b>Challenges no longer repeat movements</b> — when you do not have the equipment, a swapped movement can no longer duplicate another one in the same round (two push-up lines, two squat lines). Swaps now pick a different movement, like glute bridges or Superman holds.',es:'<b>Los retos ya no repiten movimientos</b> — cuando no tienes el equipo, un movimiento cambiado ya no puede duplicar otro de la misma ronda (dos líneas de flexiones, dos de sentadillas). Los cambios ahora usan un movimiento distinto, como puentes de glúteo o el Superman.'}]},
 {v:'v28',items:[
  {i:'📚',en:'<b>Ready routines by muscle</b> — chest, back, shoulders, arms, legs, glutes or core, at three levels. Harder levels use a bigger range of motion, one side at a time, resistance profiles, unstable tools, harder leverage and no momentum, and every exercise says which one it uses.',es:'<b>Rutinas listas por músculo</b> — pecho, espalda, hombros, brazos, piernas, glúteos o abdomen, en tres niveles. Los niveles difíciles usan más rango de movimiento, un lado a la vez, perfiles de resistencia, herramientas inestables, palancas más difíciles y nada de impulso, y cada ejercicio dice cuál usa.'},
  {i:'⏱️',en:'<b>30 challenges</b> — morning PT, CrossFit-style and Hyrox-style sessions with a built-in timer (AMRAP, EMOM, intervals, for time). Mark the equipment you have and each challenge adapts. Your best result is saved, and you can add any routine or challenge to your plan as an extra day.',es:'<b>30 retos</b> — sesiones de PT de la mañana, estilo CrossFit y estilo Hyrox con temporizador incluido (AMRAP, EMOM, intervalos, por tiempo). Marca el equipo que tienes y cada reto se adapta. Tu mejor marca se guarda y puedes agregar cualquier rutina o reto a tu plan como día extra.'}]},
 {v:'v27',items:[
  {i:'🏋️',en:'<b>Choose a famous split</b> — Upper/Lower, Push/Pull/Legs, Arnold split, a classic body-part week or Upper/Lower + PPL. The plan keeps your phase\'s sets, reps, tempo and rest, and every day says why it is built that way.',es:'<b>Elige una división famosa</b> — Torso/Pierna, Empuje/Tirón/Pierna, split Arnold, una semana clásica por músculo o Torso/Pierna + PPL. El plan conserva las series, repeticiones, tempo y descanso de tu fase, y cada día dice por qué está armado así.'}]},
 {v:'v26',items:[
  {i:'🎖️',en:'<b>Hybrid, military and running plans now follow the NASM OPT model too</b> — your test drills and runs stay, and every session now has a warm-up, core and balance activation, strength in the OPT performance phases (with stable and explosive pairs), conditioning and a cool-down, each with its reason.',es:'<b>Los planes híbrido, militar y de carrera también siguen el modelo OPT del NASM</b> — se mantienen tus ejercicios de la prueba y tus carreras, y cada sesión ahora tiene calentamiento, activación de core y equilibrio, fuerza en las fases de rendimiento del OPT (con pares estables y explosivos), acondicionamiento y enfriamiento, cada uno con su razón.'}]},
 {v:'v25',items:[
  {i:'🧭',en:'<b>A plan made for you, with the reasons</b> — the plan setup is now one question per screen, and asks what you like and avoid, your favorite lifts, whether you sit or stand all day, how many days are short, and a quick push-up test. Every day, every exercise and the plan itself say why they are there.',es:'<b>Un plan hecho para ti, con sus razones</b> — armar el plan ahora es una pregunta por pantalla, y pregunta qué te gusta y qué evitas, tus levantamientos favoritos, si pasas el día sentado o de pie, cuántos días son cortos y una prueba rápida de flexiones. Cada día, cada ejercicio y el plan mismo explican por qué están ahí.'},
  {i:'🔀',en:'<b>It changes with you</b> — each plan has its own mix of exercises, you can refresh it from the plan, and at your check-in the app suggests swaps for exercises you skip or stall on and lowers volume if you are not finishing your sets.',es:'<b>Cambia contigo</b> — cada plan tiene su propia mezcla de ejercicios, puedes renovarla desde el plan, y en tu chequeo la app sugiere cambiar ejercicios que saltas o en los que te estancas y baja el volumen si no terminas tus series.'}]},
 {v:'v24',items:[
  {i:'🎯',en:'<b>Workouts now follow the NASM OPT model</b> — five training phases, and every session has a warm-up, core and balance activation, resistance training (with supersets in Phases 2 and 5) and a cool-down, with the sets, reps, tempo and rest from the NASM templates. You start in the phase that fits your level and can move up from More or at your check-in.',es:'<b>Los entrenamientos ahora siguen el modelo OPT del NASM</b> — cinco fases de entrenamiento, y cada sesión tiene calentamiento, activación de core y equilibrio, resistencia (con supersets en las Fases 2 y 5) y enfriamiento, con las series, repeticiones, tempo y descanso de las plantillas del NASM. Empiezas en la fase que corresponde a tu nivel y puedes subir de fase desde el plan o en tu chequeo.'}]},
 {v:'v23',items:[
  {i:'🔄',en:'<b>Check for updates</b> — More › App has a button that looks for a newer version and loads it, and shows which version you have.',es:'<b>Buscar actualizaciones</b> — Más › App tiene un botón que busca una versión nueva y la carga, y muestra qué versión tienes.'}]},
 {v:'v22',items:[
  {i:'📤',en:'<b>Share the app with a QR code</b> — More › Share the app shows a code your friends can scan to open Bubylift, plus buttons to send or copy the link.',es:'<b>Comparte la app con un código QR</b> — Más › Compartir la app muestra un código que tus amigos pueden escanear para abrir Bubylift, con botones para enviar o copiar el enlace.'}]},
 {v:'v21',items:[
  {i:'👤',en:'<b>Try it as a guest</b> — start training right away without a profile. When you want to keep your data safe and move it to another phone with a QR, create a profile and everything you logged comes with you.',es:'<b>Pruébalo como invitado</b> — empieza a entrenar ya sin crear un perfil. Cuando quieras proteger tus datos y pasarlos a otro teléfono con un QR, crea un perfil y todo lo que registraste se viene contigo.'}]},
 {v:'v20',items:[
  {i:'📊',en:'<b>Choose your weekly volume</b> — pick Low, Medium or High when you build a plan, and see a counter of the sets you do per muscle each week, with the recommended range and why it matters.',es:'<b>Elige tu volumen semanal</b> — escoge Bajo, Medio o Alto al crear tu plan y mira un contador de las series que haces por músculo cada semana, con el rango recomendado y por qué importa.'}]},
 {v:'v19',items:[
  {i:'↕️',en:'<b>Moving training days is now easy</b> — tap ▲ ▼ to move a day earlier or later, or drag the ≡ handle to any weekday.',es:'<b>Mover los días de entrenamiento ahora es fácil</b> — toca ▲ ▼ para mover un día antes o después, o arrastra el asa ≡ a cualquier día de la semana.'}]},
 {v:'v18',items:[
  {i:'✕',en:'<b>Clear a set in one tap</b> — every set row has a red ✕ to empty it when you typed something wrong.',es:'<b>Borra una serie con un toque</b> — cada fila de serie tiene una ✕ roja para vaciarla cuando escribiste algo mal.'},
  {i:'🗑',en:'<b>Delete plan is on the plan card</b> — no more digging through menus.',es:'<b>Eliminar plan está en la tarjeta del plan</b> — ya no hay que buscar en los menús.'},
  {i:'📅',en:'<b>Weekly schedule</b> — put each training day on a weekday, see its exercises, and get advice if you stack leg days or hard runs back to back.',es:'<b>Horario semanal</b> — pon cada día de entrenamiento en un día de la semana, mira sus ejercicios y recibe consejos si juntas días de piernas o carreras duras.'}]},
 {v:'v17',items:[
  {i:'⚖️',en:'<b>Easier weigh-ins</b> — big number with − / + buttons, one tap to save. The chart now shows a smoothed trend, your pace per week and how long to reach your goal.',es:'<b>Pesajes más fáciles</b> — número grande con botones − / +, un toque para guardar. La gráfica ahora muestra una tendencia suavizada, tu ritmo por semana y cuánto falta para tu meta.'},
  {i:'🎯',en:'<b>Mix two goals</b> — when building a plan, add a second goal (for example muscle + runner) and choose a 50/50 or 70/30 split. Each training day follows one goal.',es:'<b>Mezcla dos metas</b> — al crear un plan, agrega una segunda meta (por ejemplo músculo + corredor) y elige un reparto 50/50 o 70/30. Cada día de entrenamiento sigue una meta.'}]},
 {v:'v16',items:[
  {i:'📷',en:'<b>Meet the creator</b> — More now has a card about Mike, who built Bubylift, with a link to follow @bubylifts on Instagram.',es:'<b>Conoce al creador</b> — Más ahora tiene una tarjeta sobre Mike, quien creó Bubylift, con un enlace para seguir a @bubylifts en Instagram.'}]},
 {v:'v15',items:[
  {i:'🔐',en:'<b>Your data is now encrypted</b> on this phone (AES-256). Your password unlocks it. If you forget it, you need all three security answers, exactly, to get back in — so choose answers you will remember.',es:'<b>Tus datos ahora están cifrados</b> en este teléfono (AES-256). Tu contraseña los abre. Si la olvidas, necesitas las tres respuestas de seguridad, exactas, para volver a entrar — elige respuestas que recuerdes.'},
  {i:'ℹ️',en:'"Keep me signed in" was removed: it would have meant leaving the key on the phone. You stay signed in until you close the app.',es:'Se quitó "Mantener mi sesión": habría obligado a dejar la llave en el teléfono. Sigues dentro hasta que cierres la app.'}]},
 {v:'v14',items:[
  {i:'👤',en:'<b>Profiles</b> — everyone gets their own log. Pick who is training from a Netflix-style screen, with an avatar or your own photo and a strong password.',es:'<b>Perfiles</b> — cada quien tiene su propio registro. Elige quién entrena en una pantalla estilo Netflix, con avatar o tu propia foto y una contraseña fuerte.'},
  {i:'🔑',en:'<b>Forgot your password?</b> Answer your three security questions to set a new one. The password is a lock for this phone; it does not encrypt your data.',es:'<b>¿Olvidaste tu contraseña?</b> Responde tus tres preguntas de seguridad para crear una nueva. La contraseña es un candado para este teléfono; no cifra tus datos.'},
  {i:'📲',en:'<b>Move to a new phone</b> — Profile menu › Transfer to another phone. Scan an animated QR and type the PIN. It is a one-time copy, not a sync.',es:'<b>Cambia de teléfono</b> — menú del perfil › Transferir a otro teléfono. Escanea un QR animado y escribe el PIN. Es una copia única, no una sincronización.'}]},
 {v:'v13',items:[
  {i:'📅',en:'<b>Date field fixed on iPhone</b> — it now stays inside the card and lines up with the other fields.',es:'<b>Campo de fecha corregido en iPhone</b> — ahora queda dentro de la tarjeta y alineado con los demás campos.'}]},
 {v:'v12',items:[
  {i:'✨',en:'<b>A fresh, calmer look</b> — large titles, softer grouped cards, clear tinted buttons, a translucent tab bar and a simpler More tab. Language and theme are now in More → Preferences.',es:'<b>Un diseño nuevo y más tranquilo</b> — títulos grandes, tarjetas agrupadas más suaves, botones tintados claros, barra de pestañas translúcida y una pestaña Más más simple. El idioma y el tema ahora están en Más → Preferencias.'}]},
 {v:'v11',items:[
  {i:'🎯',en:'<b>More goals</b> — pick Runner, Bodybuilding (max muscle), Hybrid athlete, or Military fitness test. Hybrid and Military are now separate: Hybrid needs no test.',es:'<b>Más metas</b> — elige Corredor, Fisicoculturismo (máximo músculo), Atleta híbrido o Prueba física militar. Híbrido y Militar ahora son separados: Híbrido no necesita prueba.'},
  {i:'🏃',en:'<b>Runner plans</b> — easy, interval, tempo and long runs plus leg and core strength, shaped by your running goal (5K to marathon).',es:'<b>Planes para corredores</b> — carreras suaves, intervalos, tempo y largas más fuerza de piernas y core, según tu meta (de 5K a maratón).'}]},
 {v:'v10',items:[
  {i:'🧹',en:'<b>Cleaner screens</b> — My plan shows one day at a time, the home card is a short summary, exercise buttons have labels (Swap, Guide, Options) and About folds away.',es:'<b>Pantallas más limpias</b> — Mi plan muestra un día a la vez, la tarjeta de inicio es un resumen corto, los botones de ejercicio tienen texto (Sustituir, Guía, Opciones) y Acerca de se pliega.'}]},
 {v:'v9',items:[
  {i:'👆',en:'<b>Easier-to-see buttons</b> — buttons now have clear outlines and bigger tap areas, main actions stand out, and Delete sits apart in red.',es:'<b>Botones más fáciles de ver</b> — los botones ahora tienen contorno claro y áreas más grandes para tocar, las acciones principales resaltan y Eliminar queda aparte en rojo.'}]},
 {v:'v8',items:[
  {i:'🗑️',en:'<b>Delete your plan</b> — My plan now has a Delete this plan button (your logged workouts are kept). You can make a new one any time.',es:'<b>Eliminar tu plan</b> — Mi plan ahora tiene el botón Eliminar este plan (tus entrenamientos registrados se conservan). Puedes crear uno nuevo cuando quieras.'}]},
 {v:'v7',items:[
  {i:'📖',en:'<b>Technique guides for every exercise</b> — tap ⓘ on any of the 227 exercises for clear steps and the most common mistake, in English and Spanish.',es:'<b>Guías de técnica para todos los ejercicios</b> — toca ⓘ en cualquiera de los 227 ejercicios para ver pasos claros y el error más común, en inglés y español.'}]},
 {v:'v6',items:[
  {i:'🍑',en:'<b>Choose your focus</b> — pick the muscles to bring up and how many days a week they get (e.g. glutes 3 days), so a leg-focused week really has more leg days.',es:'<b>Elige tu enfoque</b> — escoge los músculos que quieres destacar y cuántos días a la semana (ej. glúteos 3 días), para que una semana enfocada en pierna tenga de verdad más días de pierna.'},
  {i:'⚡',en:'<b>Physical skills</b> — add strength, power, speed, endurance or balance to your plan. Change your focus any time from My plan → Change focus.',es:'<b>Habilidades físicas</b> — suma fuerza, potencia, velocidad, resistencia o equilibrio a tu plan. Cambia tu enfoque cuando quieras en Mi plan → Cambiar enfoque.'}]},
 {v:'v5',items:[
  {i:'🎖️',en:'<b>Hybrid / military athlete</b> — a plan that mixes strength, running and work capacity around your test: Army AFT or Marines PFT/CFT.',es:'<b>Atleta híbrido / militar</b> — un plan que mezcla fuerza, carrera y capacidad de trabajo alrededor de tu prueba: AFT del Ejército o PFT/CFT de los Marines.'},
  {i:'⏱️',en:'<b>Practice tests</b> — run a practice AFT, PFT or CFT, log your results and compare them over time. Set your test date to see the countdown and test-week tips.',es:'<b>Simulacros</b> — haz un simulacro de AFT, PFT o CFT, anota tus resultados y compáralos con el tiempo. Pon la fecha de tu prueba para ver la cuenta regresiva y consejos para la semana de la prueba.'}]},
 {v:'v4',items:[
  {i:'🎯',en:'<b>Smarter plans</b> — tell Bubylift your goal, the muscles you want to bring up, upper or lower body emphasis, time, experience and equipment.',es:'<b>Planes más inteligentes</b> — dile a Bubylift tu meta, los músculos que quieres destacar, énfasis en tren superior o inferior, tiempo, experiencia y equipo.'},
  {i:'🩹',en:'<b>Injury-aware</b> — pick knee, back, shoulder and more; the plan avoids what stresses them and flags exercises to do lightly.',es:'<b>Adaptado a lesiones</b> — elige rodilla, espalda, hombro y más; el plan evita lo que las carga y marca ejercicios para hacer con poco peso.'},
  {i:'↔️',en:'<b>No machine? Swap it</b> — tap ↔ on any exercise to get alternatives with the equipment you have. Swipe the plan card to skip or change day.',es:'<b>¿No hay máquina? Sustitúyelo</b> — toca ↔ en cualquier ejercicio para ver alternativas con el equipo que tienes. Desliza la tarjeta del plan para saltar o cambiar de día.'}]},
 {v:'v3',items:[
  {i:'🗓️',en:'<b>Guided weekly plan</b> — pick your goal, days and experience; Bubylift tells you what to train each day, with sets and reps.',es:'<b>Plan semanal guiado</b> — elige tu meta, días y experiencia; Bubylift te dice qué entrenar cada día, con series y repeticiones.'},
  {i:'ⓘ',en:'<b>How to do it</b> — tap ⓘ on an exercise for step-by-step technique and the most common mistake.',es:'<b>Cómo hacerlo</b> — toca ⓘ en un ejercicio para ver la técnica paso a paso y el error más común.'},
  {i:'📈',en:'<b>Smart weight suggestions + check-ins</b> — it suggests when to go heavier, and every few weeks a quick check-in adjusts your plan.',es:'<b>Sugerencias de peso y evaluaciones</b> — te sugiere cuándo subir de peso y cada pocas semanas una evaluación rápida ajusta tu plan.'}]},
 {v:'v2',items:[
  {i:'📚',en:'<b>More than 200 exercises</b> — new Balance and Power & agility categories, plus bands, stability ball, medicine ball and suspension trainer.',es:'<b>Más de 200 ejercicios</b> — nuevas categorías de Equilibrio y Potencia y agilidad, y equipo como bandas, pelota de estabilidad, balón medicinal y suspensión.'},
  {i:'🙏',en:'<b>Credits</b> — exercise categories are based on the NASM-CPT program (see More → About).',es:'<b>Créditos</b> — las categorías de ejercicios están basadas en el programa NASM-CPT (ver Más → Acerca de).'}]},
 {v:'v1',items:[
  {i:'🏋️',en:'<b>Welcome to Bubylift</b> — log sets and reps, get a rest timer, save routines and see your records.',es:'<b>Bienvenido a Bubylift</b> — registra series y repeticiones, usa el temporizador de descanso, guarda rutinas y mira tus récords.'},
  {i:'📈',en:'<b>Progress & body</b> — charts per exercise, body weight, body fat and measurements.',es:'<b>Progreso y cuerpo</b> — gráficas por ejercicio, peso corporal, grasa y medidas.'},
  {i:'🔒',en:'<b>Private & offline</b> — no account, data stays on your phone. Back it up from More.',es:'<b>Privada y sin internet</b> — sin cuenta, tus datos se quedan en tu teléfono. Respáldalos desde Más.'}]}
];
