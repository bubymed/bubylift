/* "What's new" popup — shown once per version after an update, and from More → What's new.
   Ventana "Novedades" — se muestra una vez por versión después de una actualización, y desde Más → Novedades.
   Add a new entry at the TOP for every release with something new (same value as APP_VER). Keep it short: 1–3 items. */
const WHATSNEW=[
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
