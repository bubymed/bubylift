# Bubylift architecture / Arquitectura de Bubylift

Short technical overview. The full, illustrated version is chapter 14 of the user manuals in this folder.
Resumen técnico corto. La versión completa e ilustrada es el capítulo 14 de los manuales de esta carpeta.

## Principles / Principios
- No build step: plain JavaScript, HTML and CSS served as-is. / Sin compilación: JavaScript, HTML y CSS puros, servidos tal cual.
- Offline first: a service worker (`sw.js`) caches every file, network-first online. / Primero sin conexión: un service worker guarda todo; con internet usa la red primero.
- Local data first: everything lives in `localStorage` per profile; the cloud is optional. / Datos locales primero: todo vive en `localStorage` por perfil; la nube es opcional.
- Bilingual: every string in `data/i18n.js` exists in EN and ES; `tools/check.py` enforces it. / Bilingüe: cada texto de `data/i18n.js` existe en EN y ES; `tools/check.py` lo exige.

## Boot / Arranque
`index.html` loads scripts in order (cloud config → strings → exercise data → `app.js` → tabs → `cloud.js` → `profiles.js`). `boot()` in `profiles.js` picks the entry: session → account profile; Google return without profile → create one; no profiles → welcome; otherwise last guest profile.
`index.html` carga los scripts en orden (config de nube → textos → ejercicios → `app.js` → pestañas → `cloud.js` → `profiles.js`). `boot()` en `profiles.js` elige la entrada: sesión → perfil de cuenta; regreso de Google sin perfil → crear uno; sin perfiles → bienvenida; si no, el último perfil de invitado.

## Modules / Módulos
| File | Role / Función |
|---|---|
| `app.js` | storage, units, language, theme, install, auto-update, navigation / almacenamiento, unidades, idioma, tema, instalación, actualización, navegación |
| `workout.js` | Workout tab, set logging, rest timer, routines / pestaña Entrenar, series, descanso, rutinas |
| `plan.js`, `opt.js`, `pers.js`, `wizard.js` | plan engines (NASM OPT), personalization, questionnaire / motores del plan, personalización, cuestionario |
| `library.js`, `data/library*.js`, `data/programs.js` | muscle routines, ranks, challenges, classic programs / rutinas, rangos, retos, programas |
| `stretch.js`, `rehab.js`, `data/rehab*.js` | Mobility and 13 Recovery plans / Movilidad y 13 planes de Recuperación |
| `history.js`, `goals.js`, `habit.js`, `aft.js` | History, charts, goals, streak, AFT / Historial, gráficas, metas, racha, AFT |
| `body.js`, `card.js`, `cardstudio.js` | Body/More tabs, share cards / pestañas Cuerpo/Más, tarjetas |
| `cloud.js`, `profiles.js` | accounts, encryption, sync; profiles and boot / cuentas, cifrado, sincronización; perfiles y arranque |
| `server/` | Supabase `schema.sql`, Strava function, setup guide / esquema, función de Strava, guía |
| `tests/smoke.js`, `tools/check.py` | jsdom smoke test (~510 checks), pre-release check / prueba de humo y revisión previa |

## Cloud & sync / Nube y sincronización
- One table `user_data(user_id, data, vault, rev, updated_at)` with row-level security: each user reaches only their own row. / Una tabla con seguridad por filas: cada persona solo accede a su fila.
- E-mail accounts: random data key (AES-256-GCM) wrapped by the password and a recovery key (PBKDF2-SHA256); the server stores ciphertext only. Google accounts: plain envelope under RLS. Guests: local only. / Cuentas de correo: llave aleatoria envuelta por contraseña y clave de recuperación; el servidor solo guarda texto cifrado. Google: sobre sin cifrado adicional bajo RLS. Invitados: solo local.
- Sync: 2.5 s debounce, download → merge (last change wins, per-item timestamps, tombstones for deletions) → upload. Covers workouts, routines, body, custom exercises, plan, goals, settings, Recovery progress, profile and the workout in progress. / Sincronización: espera de 2.5 s, bajar → combinar (último cambio gana, marcas por elemento, lápidas para borrados) → subir. Cubre entrenamientos, rutinas, cuerpo, ejercicios propios, plan, metas, ajustes, progreso de Recuperación, perfil y entrenamiento en curso.

## Release & tests / Versiones y pruebas
Each release bumps `sw.js` cache name, `APP_VER` in `app.js` and `version.json`, plus CHANGELOG and What's new. `npm test` runs `tools/check.py` and `tests/smoke.js`; GitHub Actions runs it on every PR.
Cada versión sube el nombre del caché en `sw.js`, `APP_VER` en `app.js` y `version.json`, más CHANGELOG y Novedades. `npm test` corre `tools/check.py` y `tests/smoke.js`; GitHub Actions lo corre en cada PR.
