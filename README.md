# Bubylift — workout log / registro de entrenamientos

A free workout, progress and body log that lives on your phone. **No account, no ads, no tracking** — it works offline and installs like an app on Android and iPhone.
Un registro gratis de entrenamientos, progreso y cuerpo que vive en tu teléfono. **Sin cuenta, sin anuncios, sin rastreo** — funciona sin internet y se instala como app en Android y iPhone.

**[▶ Open the app / Abrir la app](https://bubymed.github.io/bubylift/)**

## What it does / Qué hace
- **Workout / Entrenar:** log weight × reps, bodyweight reps or time & distance; see last time's numbers; rest timer; 🏆 for new records; routines. / registra peso × repeticiones, repeticiones con peso corporal o tiempo y distancia; mira los números de la vez anterior; temporizador de descanso; 🏆 en récords nuevos; rutinas.
- **History / Historial:** every workout by month; repeat, share or delete. / cada entrenamiento por mes; repetir, compartir o eliminar.
- **Progress / Progreso:** charts per exercise (estimated 1RM, top weight, volume, reps, time) and workouts per week. / gráficas por ejercicio (1RM estimado, peso máximo, volumen, repeticiones, tiempo) y entrenamientos por semana.
- **Body / Cuerpo:** weight, body fat and measurements with a trend chart and optional goal. / peso, grasa corporal y medidas con gráfica de tendencia y meta opcional.
- **More / Más:** EN / ES, dark / light, lb · in · mi or kg · cm · km, backup export / import (.json), workouts export (.csv).

## Install on your phone / Instalar en tu teléfono
- **Android (Chrome):** open the link → **📲 Install** (or menu ⋮ → Install app).
- **iPhone (Safari):** open the link → Share ⬆︎ → **Add to Home Screen**. Log your workouts inside the installed app — the Home Screen app and Safari keep separate data.
- Android (Chrome): abre el link → **📲 Instalar** (o menú ⋮ → Instalar app). iPhone (Safari): abre el link → Compartir ⬆︎ → **Agregar a pantalla de inicio**. Registra dentro de la app instalada — la app de inicio y Safari guardan datos separados.

The app updates itself when a new version is published and shows what's new once.
La app se actualiza sola cuando se publica una versión nueva y muestra las novedades una vez.

## Privacy / Privacidad
- Everything runs in your browser. **Nothing is sent to any server.** / Todo corre en tu navegador. **No se envía nada a ningún servidor.**
- Your log is stored in the phone's local storage. If you clear browser data or delete the app it is gone — **export a backup now and then** (More → Export backup). / Tu registro se guarda en el almacenamiento local del teléfono. Si borras los datos del navegador o eliminas la app se pierde — **exporta un respaldo de vez en cuando** (Más → Exportar respaldo).

## Use it / Úsala
- Publish the repo with GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) and open the link on a phone. / Publica el repo con GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) y abre el link en el teléfono.
- To run locally: `python3 -m http.server` in this folder, then open `http://localhost:8000`. / Para correr local: `python3 -m http.server` en esta carpeta y abre `http://localhost:8000`.

## Structure / Estructura
```
index.html          page shell / estructura de la página
style.css           styles, dark + light / estilos, oscuro + claro
app.js              core: storage, units, language, theme, install, auto-update, what's new
workout.js          Workout tab: logging, rest timer, finish, routines, exercise picker
history.js          History and Progress tabs, SVG charts
body.js             Body and More tabs, export / import
data/exercises.js   built-in exercise library (EN/ES) / biblioteca de ejercicios (EN/ES)
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
Source-available, all rights reserved. You may view the code and use the app personally. Copying, modifying or redistributing it requires written permission from the author. See `LICENSE`.

## Credits / Créditos
Exercise categories and training concepts are based on the NASM-CPT program. Bubylift is independent and not endorsed by NASM. / Las categorías de ejercicios y los conceptos de entrenamiento están basados en el programa NASM-CPT. Bubylift es independiente y no está avalada por NASM.
