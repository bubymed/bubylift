# Bubylift — workout log / registro de entrenamientos

A free workout, progress and body log that lives on your phone. **No account, no ads, no tracking** — it works offline and installs like an app on Android and iPhone.
Un registro gratis de entrenamientos, progreso y cuerpo que vive en tu teléfono. **Sin cuenta, sin anuncios, sin rastreo** — funciona sin internet y se instala como app en Android y iPhone.

**[▶ Open the app / Abrir la app](https://bubymed.github.io/bubylift/)**

## What it does / Qué hace
- **Workout / Entrenar:** start by choosing how you want to train: let the app build your plan (great if you are new), pick a ready routine by muscle, jump straight to the famous splits, take a challenge, or log your own workout. Log weight × reps, bodyweight reps or time & distance; see last time's numbers; rest timer; 🏆 for new records. / empieza eligiendo cómo quieres entrenar: que la app arme tu plan (ideal si empiezas), una rutina lista por músculo, directo a las divisiones famosas, un reto, o tu propio entrenamiento. Registra peso × repeticiones, repeticiones con peso corporal o tiempo y distancia; mira los números de la vez anterior; temporizador de descanso; 🏆 en récords nuevos.
- **Your plan / Tu plan:** a weekly plan built from your goal, experience, days, equipment, injuries and preferences, using the NASM OPT phases. Every exercise and every number comes with the reason it was chosen. Hybrid, military and running goals included. / un plan semanal armado con tu meta, experiencia, días, equipo, lesiones y preferencias, con las fases OPT de NASM. Cada ejercicio y cada número trae la razón por la que se eligió. Incluye metas híbridas, militares y de carrera.
- **Famous splits / Divisiones famosas:** Upper/Lower, Push/Pull/Legs, Arnold, one muscle per day and Upper/Lower + PPL. Train a single day right away or use the split as your plan. / Torso/Pierna, Empuje/Jalón/Piernas, Arnold, un músculo por día y Torso/Pierna + PPL. Entrena un día de inmediato o úsala como tu plan.
- **Classic programs / Programas clásicos:** Full body, StrongLifts 5×5, Starting Strength, 5/3/1 (Wendler), PHUL and German Volume (10×10), built with your equipment; 5/3/1 calculates each set's weight from your training max. / Cuerpo completo, StrongLifts 5×5, Starting Strength, 5/3/1 (Wendler), PHUL y Volumen Alemán (10×10), armados con tu equipo; el 5/3/1 calcula el peso de cada serie desde tu máximo de entrenamiento.
- **Ready routines by muscle / Rutinas listas por músculo:** chest, back, shoulders, arms, legs, glutes and core, in six ranks with their own names. Higher ranks use more range of motion, single-side work, resistance profiles, instability, harder leverage and no momentum, and each exercise says which one it uses. / pecho, espalda, hombros, brazos, piernas, glúteos y abdomen, en seis rangos con nombres propios. Los rangos altos usan más rango de movimiento, trabajo unilateral, perfiles de resistencia, inestabilidad, palancas más difíciles y nada de impulso, y cada ejercicio dice cuál usa.
- **Challenges / Retos:** 30 morning-PT, CrossFit-style and Hyrox-style sessions with a built-in timer (AMRAP, EMOM, intervals, for time). Mark the equipment you have and each challenge adapts; your best result is saved. Any routine or challenge can be added to your plan as an extra day. / 30 sesiones de PT de la mañana, estilo CrossFit y estilo Hyrox con temporizador incluido (AMRAP, EMOM, intervalos, por tiempo). Marca el equipo que tienes y cada reto se adapta; tu mejor marca se guarda. Cualquier rutina o reto se puede agregar a tu plan como día extra.
- **Exercise library / Biblioteca de ejercicios:** 990 exercises in English and Spanish with technique guides. / cerca de 990 ejercicios en español e inglés con guías de técnica.
- **History / Historial:** every workout by month; repeat, share or delete. / cada entrenamiento por mes; repetir, compartir o eliminar.
- **Progress / Progreso:** charts per exercise (estimated 1RM, top weight, volume, reps, time) and workouts per week. / gráficas por ejercicio (1RM estimado, peso máximo, volumen, repeticiones, tiempo) y entrenamientos por semana.
- **Body / Cuerpo:** weight, body fat and measurements with a trend chart and optional goal. / peso, grasa corporal y medidas con gráfica de tendencia y meta opcional.
- **Any screen / Cualquier pantalla:** designed for phones, with tablet (two/three columns, centered windows) and computer (side menu) layouts. / diseñada para teléfonos, con vistas para tableta (dos/tres columnas, ventanas al centro) y computadora (menú lateral).
- **More / Más:** EN / ES, dark / light, lb · in · mi or kg · cm · km, profiles with password, backup export / import (.json), workouts export (.csv), and a **Send feedback** button. / EN / ES, oscuro / claro, lb · in · mi o kg · cm · km, perfiles con contraseña, exportar / importar respaldo (.json), exportar entrenamientos (.csv) y un botón **Enviar feedback**.

## Install on your phone / Instalar en tu teléfono
- **Android (Chrome):** open the link → **📲 Install** (or menu ⋮ → Install app).
- **iPhone (Safari):** open the link → Share ⬆︎ → **Add to Home Screen**. Log your workouts inside the installed app — the Home Screen app and Safari keep separate data.
- Android (Chrome): abre el link → **📲 Instalar** (o menú ⋮ → Instalar app). iPhone (Safari): abre el link → Compartir ⬆︎ → **Agregar a pantalla de inicio**. Registra dentro de la app instalada — la app de inicio y Safari guardan datos separados.

The app updates itself when a new version is published and shows what's new once.
La app se actualiza sola cuando se publica una versión nueva y muestra las novedades una vez.

## Privacy / Privacidad
- Everything runs in your browser. **Your training data is never sent to any server.** The only thing that leaves the app is what you type in the optional feedback form, and only if you submit it. / Todo corre en tu navegador. **Tus datos de entrenamiento nunca se envían a ningún servidor.** Lo único que sale de la app es lo que escribas en el formulario opcional de feedback, y solo si lo envías.
- Your log is stored in the phone's local storage. If you clear browser data or delete the app it is gone — **export a backup now and then** (More → Export backup). / Tu registro se guarda en el almacenamiento local del teléfono. Si borras los datos del navegador o eliminas la app se pierde — **exporta un respaldo de vez en cuando** (Más → Exportar respaldo).

## Use it / Úsala
- Publish the repo with GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) and open the link on a phone. / Publica el repo con GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) y abre el link en el teléfono.
- To run locally: `python3 -m http.server` in this folder, then open `http://localhost:8000`. / Para correr local: `python3 -m http.server` en esta carpeta y abre `http://localhost:8000`.

## Structure / Estructura
```
index.html          page shell / estructura de la página
style.css           styles, dark + light / estilos, oscuro + claro
app.js              core: storage, units, language, theme, install, auto-update, what's new
workout.js          Workout tab: start chooser, logging, rest timer, finish, routines, exercise picker
data/programs.js    classic programs / programas clásicos
plan.js, opt.js     plan engines (legacy and NASM OPT), famous splits / motores de plan y divisiones famosas
pers.js             personalization: injuries, preferences, reasons / personalización: lesiones, preferencias, razones
library.js          ready routines by muscle, ranks, challenges and timer / rutinas por músculo, rangos, retos y temporizador
wizard.js           plan questionnaire / cuestionario del plan
profiles.js         profiles, password, encryption, QR transfer / perfiles, contraseña, cifrado, transferencia QR
history.js          History and Progress tabs, SVG charts
body.js             Body and More tabs, export / import
data/exercises.js   built-in exercise library (EN/ES) / biblioteca de ejercicios (EN/ES)
data/exercises2.js  imported exercises (Free Exercise DB) / ejercicios importados (Free Exercise DB)
data/library.js     muscle routines and challenges / rutinas por músculo y retos
stretch.js          Stretch tab / pestaña Estirar
data/howto*.js      technique guides / guías de técnica
data/i18n.js        interface strings EN/ES / textos de la interfaz EN/ES
data/whatsnew.js    "What's new" cards / tarjetas de "Novedades"
manifest.json, sw.js, version.json   install, offline and auto-update / instalación, offline y auto-actualización
tools/check.py      pre-release sanity check / revisión antes de publicar
tools/make_icons.py regenerates icons/ / regenera icons/
```

## Changelog / Registro de cambios
See [CHANGELOG.md](CHANGELOG.md) (EN/ES). Contribution rules: [CONTRIBUTING.md](CONTRIBUTING.md).
Ver [CHANGELOG.md](CHANGELOG.md) (EN/ES). Reglas para contribuir: [CONTRIBUTING.md](CONTRIBUTING.md).

## Known limits / Límites conocidos
- Estimated 1RM uses the Epley formula and is only a guide. / El 1RM estimado usa la fórmula de Epley y es solo una guía.
- No cloud sync: moving to another phone means exporting and importing a backup. / Sin sincronización en la nube: para cambiar de teléfono exporta e importa un respaldo.
- The rest-timer sound can be silent on iPhone if the ringer is off; vibration is not available on iPhone. / El sonido del temporizador puede no sonar en iPhone si el timbre está en silencio; la vibración no existe en iPhone.
- Spanish text was written for gym use and has not been reviewed by a native editor. / El texto en español no ha sido revisado por un editor nativo.

## Disclaimer / Aviso
Bubylift is a logging tool, not medical or coaching advice. Exercise carries risk; use good judgment and ask a professional if unsure.
Bubylift es una herramienta de registro, no un consejo médico ni de entrenamiento. El ejercicio tiene riesgos; usa tu criterio y consulta a un profesional si tienes dudas.

## License
Source-available, all rights reserved (same terms as the Sick Call tool). Everyone may view the code and use the app for personal, non-commercial use. Copying, modifying, redistributing, hosting or using it commercially requires written permission from the author. See `LICENSE`.
Código visible, todos los derechos reservados (mismos términos que la herramienta Sick Call). Cualquiera puede ver el código y usar la app para uso personal no comercial. Copiarla, modificarla, redistribuirla, alojarla o usarla comercialmente requiere permiso por escrito del autor. Ver `LICENSE`.

## Credits / Créditos
Exercise names, steps and photos (`img/ex/`) of the imported moves are adapted from the Free Exercise DB (https://github.com/yuhonas/free-exercise-db, Unlicense), rewritten and translated. / Los nombres y pasos de `data/exercises2.js` están adaptados de Free Exercise DB (Unlicense), reescritos y traducidos.
Workout structure, training phases (OPT model), exercise categories and training concepts are based on NASM-CPT7 materials, used with permission. Bubylift is independent and not endorsed by NASM. / La estructura de los entrenamientos, las fases (modelo OPT), las categorías de ejercicios y los conceptos están basados en los materiales NASM-CPT7, usados con permiso. Bubylift es independiente y no está avalada por NASM.

## Profiles, password, encryption & transfer / Perfiles, contraseña, cifrado y transferencia
- EN: Up to 5 profiles per device, each with its own data. Data is stored encrypted (AES-256-GCM) with a random master key, wrapped by the password and by the three security answers together (PBKDF2-SHA256). Forgetting both means the data cannot be recovered. Profile name, avatar, language and theme are not encrypted. QR transfer is a one-time copy encrypted with an 8-digit PIN shown on the sending phone (it carries the key too).
- ES: Hasta 5 perfiles por dispositivo, cada uno con sus datos. Los datos se guardan cifrados (AES-256-GCM) con una llave maestra aleatoria, envuelta por la contraseña y por las tres respuestas de seguridad juntas (PBKDF2-SHA256). Si se olvidan ambas, los datos no se pueden recuperar. El nombre, avatar, idioma y tema no se cifran. La transferencia por QR es una copia única cifrada con un PIN de 8 dígitos que muestra el teléfono de origen (también lleva la llave).
- Third-party libraries in `lib/` / Librerías de terceros en `lib/`: qrcode-generator (MIT), jsQR (Apache-2.0); see the license files / ver los archivos de licencia.
