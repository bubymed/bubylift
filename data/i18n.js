/* Interface strings: key → [English, Español]. {0}, {1} are placeholders. Exercise names live in data/exercises.js.
   Textos de la interfaz: clave → [English, Español]. {0}, {1} son marcadores. Los nombres de ejercicios están en data/exercises.js. */
const STR={
 // tabs
 tWorkout:['Workout','Entrenar'],tHistory:['History','Historial'],tProgress:['Progress','Progreso'],tBody:['Body','Cuerpo'],tMore:['More','Más'],
 // generic
 cancel:['Cancel','Cancelar'],close:['Close','Cerrar'],save:['Save','Guardar'],saved:['Saved ✓','Guardado ✓'],delete:['Delete','Eliminar'],edit:['Edit','Editar'],
 done:['Done','Listo'],continue:['Continue','Continuar'],later:['Later','Después'],back:['Back','Atrás'],set:['Set','Fijar'],on:['On','Sí'],off:['Off','No'],
 name:['Name','Nombre'],note:['Note','Nota'],date:['Date','Fecha'],all:['All','Todos'],options:['Options','Opciones'],discard:['Discard','Descartar'],
 saveFail:['Could not save — your device storage may be full.','No se pudo guardar — puede que el almacenamiento del dispositivo esté lleno.'],
 install:['Install','Instalar'],installed:['Installed ✓ — open it from your home screen','Instalada ✓ — ábrela desde tu pantalla de inicio'],
 updating:['Updating to {0}…','Actualizando a {0}…'],updated:['UPDATED','ACTUALIZADA'],whatsNew:['What\'s new','Novedades'],gotIt:['Got it','Entendido'],
 copied:['Copied ✓','Copiado ✓'],copyFail:['Could not copy','No se pudo copiar'],
 // install help
 instT:['Add Bubylift to your Home Screen','Agrega Bubylift a tu pantalla de inicio'],
 instP:['It opens full screen, works offline and keeps your log on your phone.','Se abre en pantalla completa, funciona sin internet y guarda tu registro en tu teléfono.'],
 iosS1:['Open this page in <b>Safari</b>.','Abre esta página en <b>Safari</b>.'],
 iosS2:['Tap <b>Share</b> <span class="ib">⬆︎</span> (it may be under <b>⋯</b>).','Toca <b>Compartir</b> <span class="ib">⬆︎</span> (puede estar en <b>⋯</b>).'],
 iosS3:['Scroll and tap <b>Add to Home Screen</b> ➕.','Baja y toca <b>Agregar a pantalla de inicio</b> ➕.'],
 iosS4:['Tap <b>Add</b>. Open <b>Bubylift</b> from your home screen from now on.','Toca <b>Agregar</b>. De ahora en adelante abre <b>Bubylift</b> desde tu pantalla de inicio.'],
 andS1:['Open this page in <b>Chrome</b>.','Abre esta página en <b>Chrome</b>.'],
 andS2:['Tap the menu <span class="ib">⋮</span> (top right).','Toca el menú <span class="ib">⋮</span> (arriba a la derecha).'],
 andS3:['Tap <b>Install app</b> or <b>Add to Home screen</b>.','Toca <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.'],
 andS4:['Confirm. Open <b>Bubylift</b> from your home screen from now on.','Confirma. De ahora en adelante abre <b>Bubylift</b> desde tu pantalla de inicio.'],
 iosNote:['On iPhone the Home Screen app and Safari keep separate data. Log your workouts inside the installed app, and use Export / Import backup to move data between them.','En iPhone la app de la pantalla de inicio y Safari guardan datos separados. Registra tus entrenamientos dentro de la app instalada y usa Exportar / Importar respaldo para pasar datos entre ellas.'],
 // workout: start
 startEmpty:['Start empty workout','Empezar entrenamiento vacío'],routines:['Routines','Rutinas'],newRoutine:['New routine','Nueva rutina'],editRoutine:['Edit routine','Editar rutina'],
 noRoutines:['No routines yet. Save one from a workout, or create it here.','Aún no tienes rutinas. Guarda una desde un entrenamiento o créala aquí.'],
 start:['Start','Empezar'],lastWorkout:['Last workout','Último entrenamiento'],
 welcomeT:['Welcome to Bubylift','Bienvenido a Bubylift'],
 welcomeP:['Tap "Start empty workout", add exercises and log your sets. Everything stays on your phone — no account.','Toca "Empezar entrenamiento vacío", agrega ejercicios y registra tus series. Todo se queda en tu teléfono — sin cuenta.'],
 bkT:['Back up your data','Respalda tus datos'],
 bkP:['Your log lives only on this phone. Export a backup file now and then so you never lose it.','Tu registro vive solo en este teléfono. Exporta un respaldo de vez en cuando para no perderlo.'],
 // workout: active
 wkNamePh:['Workout name (optional)','Nombre del entrenamiento (opcional)'],wkNotePh:['Workout notes (optional)','Notas del entrenamiento (opcional)'],
 setsDone:['{0}/{1} sets','{0}/{1} series'],finish:['Finish','Terminar'],cancelWk:['Cancel workout','Cancelar entrenamiento'],
 addEx:['Add exercise','Agregar ejercicio'],addSet:['Add set','Agregar serie'],saveRoutine:['Save as routine','Guardar como rutina'],saveRoutineS:['Save as routine','Guardar como rutina'],
 lastTime:['Last time ({0}): {1}','Última vez ({0}): {1}'],firstTime:['First time — no history yet','Primera vez — aún sin historial'],
 colSet:['SET','SERIE'],colPrev:['PREV','ANT.'],colReps:['REPS','REPS'],colMin:['MIN','MIN'],doneSet:['Mark set done','Marcar serie hecha'],
 needWR:['Enter weight and reps first','Escribe primero peso y repeticiones'],needReps:['Enter the reps first','Escribe primero las repeticiones'],needTime:['Enter the time first','Escribe primero el tiempo'],
 newPR:['🏆 New personal record!','🏆 ¡Nuevo récord personal!'],
 moveUp:['Move up','Subir'],moveDown:['Move down','Bajar'],rmLastSet:['Remove last set','Quitar última serie'],rmEx:['Remove exercise','Quitar ejercicio'],
 noDone:['No sets are completed. Discard this workout?','No hay series completadas. ¿Descartar este entrenamiento?'],
 undone:['{0} sets are not completed and will be dropped. Finish the workout?','{0} series no están completadas y se descartarán. ¿Terminar el entrenamiento?'],
 cancelAsk:['Discard this workout? Nothing will be saved.','¿Descartar este entrenamiento? No se guardará nada.'],
 finishFirst:['Finish or cancel your current workout first','Termina o cancela primero tu entrenamiento actual'],
 wkMorning:['Morning workout','Entrenamiento de la mañana'],wkAfternoon:['Afternoon workout','Entrenamiento de la tarde'],wkEvening:['Evening workout','Entrenamiento de la noche'],
 wkSaved:['Workout saved','Entrenamiento guardado'],duration:['Duration','Duración'],sets:['Sets','Series'],volume:['Volume','Volumen'],prsT:['New records','Nuevos récords'],
 rest:['Rest','Descanso'],restOver:['Rest over — go!','Descanso terminado — ¡dale!'],skip:['Skip','Saltar'],
 // picker / custom
 search:['Search exercises','Buscar ejercicios'],recent:['Recent','Recientes'],allEx:['All exercises','Todos los ejercicios'],noMatch:['No matches. Create a custom exercise below.','Sin resultados. Crea un ejercicio propio abajo.'],
 customEx:['Custom exercise','Ejercicio propio'],custom:['custom','propio'],group:['Muscle group','Grupo muscular'],trackAs:['Track as','Registrar como'],needName:['Enter a name','Escribe un nombre'],
 m_wr:['Weight × reps','Peso × repeticiones'],m_bw:['Bodyweight reps','Repeticiones con peso corporal'],m_t:['Time & distance','Tiempo y distancia'],
 g_chest:['Chest','Pecho'],g_back:['Back','Espalda'],g_shoulders:['Shoulders','Hombros'],g_biceps:['Biceps','Bíceps'],g_triceps:['Triceps','Tríceps'],g_legs:['Legs','Piernas'],g_glutes:['Glutes','Glúteos'],g_core:['Core','Abdomen'],g_full:['Full body','Cuerpo completo'],g_balance:['Balance','Equilibrio'],g_power:['Power & agility','Potencia y agilidad'],g_cardio:['Cardio','Cardio'],
 e_barbell:['Barbell','Barra'],e_dumbbell:['Dumbbell','Mancuernas'],e_machine:['Machine','Máquina'],e_cable:['Cable','Polea'],e_bodyweight:['Bodyweight','Peso corporal'],e_kettlebell:['Kettlebell','Pesa rusa'],e_band:['Band','Banda'],e_ball:['Stability ball','Pelota de estabilidad'],e_medball:['Medicine ball','Balón medicinal'],e_suspension:['Suspension trainer','Entrenador de suspensión'],e_other:['Other','Otro'],
 // routines
 exercises:['Exercises','Ejercicios'],noEx:['No exercises yet.','Aún no hay ejercicios.'],nSets:['{0} sets','{0} series'],needEx:['Add at least one exercise','Agrega al menos un ejercicio'],
 delRoutine:['Delete this routine?','¿Eliminar esta rutina?'],
 // history
 emptyHistT:['No workouts yet','Aún no hay entrenamientos'],emptyHistP:['Finish your first workout and it will show up here.','Termina tu primer entrenamiento y aparecerá aquí.'],
 thisWeek:['This week','Esta semana'],thisMonth:['This month','Este mes'],total:['Total','Total'],nSetsT:['{0} sets','{0} series'],
 repeat:['Repeat workout','Repetir entrenamiento'],share:['Share','Compartir'],delWk:['Delete this workout? This cannot be undone.','¿Eliminar este entrenamiento? No se puede deshacer.'],
 // progress
 emptyProgT:['Nothing to chart yet','Aún no hay nada que graficar'],emptyProgP:['Log a few workouts and your progress will appear here.','Registra algunos entrenamientos y tu progreso aparecerá aquí.'],
 workouts:['Workouts','Entrenamientos'],perWeek:['Workouts per week','Entrenamientos por semana'],sessions:['{0} sessions','{0} sesiones'],sessionsL:['Sessions','Sesiones'],
 best:['Best','Mejor'],longest:['Longest','Más largo'],bestSet:['Best set','Mejor serie'],noData:['Not enough data for this chart yet.','Aún no hay datos suficientes para esta gráfica.'],recentSessions:['Recent sessions','Sesiones recientes'],
 mEst1rm:['Est. 1RM','1RM estimado'],mTop:['Top weight','Peso máximo'],mVol:['Volume','Volumen'],mMaxReps:['Best reps','Mejores reps'],mTotReps:['Total reps','Reps totales'],mAddW:['Added weight','Peso añadido'],mTime:['Time (min)','Tiempo (min)'],mDist:['Distance','Distancia'],
 // body
 logBody:['Log body stats','Registrar medidas del cuerpo'],weight:['Weight','Peso'],bodyFat:['Body fat','Grasa corporal'],measure:['Measurements','Medidas'],
 me_chest:['Chest','Pecho'],me_waist:['Waist','Cintura'],me_hips:['Hips','Cadera'],me_arm:['Arm','Brazo'],me_thigh:['Thigh','Muslo'],me_neck:['Neck','Cuello'],
 needBody:['Enter at least one valid value','Escribe al menos un valor válido'],delEntry:['Delete this entry?','¿Eliminar este registro?'],
 emptyBodyT:['No body entries yet','Aún no hay registros del cuerpo'],emptyBodyP:['Log your weight or measurements above to see your trend.','Registra tu peso o medidas arriba para ver tu tendencia.'],
 current:['Current','Actual'],vsLast:['vs last','vs anterior'],vs30:['vs 30 days','vs 30 días'],weightTrend:['Weight trend','Tendencia de peso'],goal:['Goal weight','Peso meta'],
 toGo:['{0} to go','Faltan {0}'],goalReached:['Goal reached 🎉','Meta alcanzada 🎉'],entries:['Entries','Registros'],nMeas:['{0} measurements','{0} medidas'],
 // more
 language:['Language','Idioma'],appearance:['Appearance','Apariencia'],thSystem:['System','Sistema'],thDark:['Dark','Oscuro'],thLight:['Light','Claro'],units:['Units','Unidades'],
 restTimer:['Rest timer','Temporizador de descanso'],restLen:['Default rest','Descanso por defecto'],sound:['Sound & vibration','Sonido y vibración'],
 yourData:['Your data','Tus datos'],dataP:['{0} workouts and {1} body entries are stored only on this device.','{0} entrenamientos y {1} registros del cuerpo se guardan solo en este dispositivo.'],
 exportBackup:['Export backup (.json)','Exportar respaldo (.json)'],exportCsv:['Export workouts (.csv)','Exportar entrenamientos (.csv)'],importBackup:['Import backup','Importar respaldo'],exported:['File ready ✓','Archivo listo ✓'],
 lastBackup:['Last backup: {0}','Último respaldo: {0}'],noBackup:['No backup yet.','Aún no hay respaldo.'],
 impBad:['That file is not a valid Bubylift backup.','Ese archivo no es un respaldo válido de Bubylift.'],impNone:['Nothing new to import.','No hay nada nuevo que importar.'],
 impAsk:['Add {0} workouts and {1} body entries from this backup? Nothing you already have will be replaced.','¿Agregar {0} entrenamientos y {1} registros del cuerpo de este respaldo? No se reemplaza nada de lo que ya tienes.'],import:['Import','Importar'],imported:['Imported ✓','Importado ✓'],
 app:['App','App'],about:['About','Acerca de'],
 privacy:['Everything stays on this device. No account, no tracking, no ads — nothing is sent to any server. If you clear your browser data or delete the app, your log is gone, so export a backup now and then.','Todo se queda en este dispositivo. Sin cuenta, sin rastreo, sin anuncios — no se envía nada a ningún servidor. Si borras los datos del navegador o eliminas la app, tu registro se pierde; exporta un respaldo de vez en cuando.'],
 credits:['Exercise categories and training concepts in Bubylift are based on the NASM Certified Personal Trainer (NASM-CPT) program materials. Bubylift is an independent app: it is not made, reviewed or endorsed by NASM, and the descriptions are written in our own words. NASM is a trademark of its owner.','Las categorías de ejercicios y los conceptos de entrenamiento de Bubylift están basados en los materiales del programa NASM Certified Personal Trainer (NASM-CPT). Bubylift es una app independiente: no está hecha, revisada ni avalada por NASM, y las descripciones están escritas con nuestras propias palabras. NASM es una marca registrada de su titular.'],
 disclaimer:['Bubylift is a logging tool, not medical or coaching advice. Exercise carries risk; use good judgment and ask a professional if unsure.','Bubylift es una herramienta de registro, no un consejo médico ni de entrenamiento. El ejercicio tiene riesgos; usa tu criterio y consulta a un profesional si tienes dudas.'],
 danger:['Danger zone','Zona de riesgo'],eraseAll:['Erase all data','Borrar todos los datos'],
 eraseAsk:['This deletes every workout, routine and body entry on this device. Export a backup first if you want to keep them.','Esto borra todos los entrenamientos, rutinas y registros del cuerpo de este dispositivo. Exporta un respaldo antes si quieres conservarlos.'],
 eraseAsk2:['Last chance: erase everything for good?','Última oportunidad: ¿borrar todo para siempre?']
};
function t(k){
  const e=STR[k];if(!e)return k;
  let s=e[LANG==='es'?1:0];
  for(let i=1;i<arguments.length;i++)s=s.split('{'+(i-1)+'}').join(arguments[i]);
  return s;
}
