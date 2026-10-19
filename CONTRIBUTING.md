# Contributing / Cómo contribuir

**Commits and pull requests are always bilingual: English first, then Spanish.**
**Los commits y pull requests son siempre bilingües: primero inglés, luego español.**

Commit message / Mensaje de commit:
```
Add rest timer sound setting / Agrega ajuste de sonido del temporizador

EN: Short explanation of what changed and why.
ES: Explicación corta de qué cambió y por qué.
```

Rules / Reglas:
- Changes go through a branch and a pull request; merge with "Squash and merge". / Los cambios van en una rama y un pull request; mezcla con "Squash and merge".
- Update `CHANGELOG.md` (both languages) for user-visible changes. / Actualiza `CHANGELOG.md` (ambos idiomas) en cambios visibles.
- Every user-facing text goes in `data/i18n.js` with English **and** Spanish. / Todo texto visible va en `data/i18n.js` con inglés **y** español.
- Anything the user typed or imported is shown through `esc()` — never put it in `innerHTML` raw. / Todo lo que el usuario escribe o importa se muestra con `esc()` — nunca crudo en `innerHTML`.
- Never rename or reuse an exercise `id` in `data/exercises.js`: saved workouts point to it. Add new ids at the end of its group. / Nunca renombres ni reutilices el `id` de un ejercicio en `data/exercises.js`: los entrenamientos guardados apuntan a él. Agrega ids nuevos al final de su grupo.
- Changing how data is stored? Keep old data readable (saved logs live on people's phones). / ¿Cambias cómo se guardan los datos? Mantén legibles los datos viejos (los registros viven en los teléfonos).

## Check before you push / Revisa antes de subir
```
python3 tools/check.py
```
It verifies that the three version numbers match, that every file the service worker caches exists, and that every translation key exists in EN and ES.
Verifica que las tres versiones coincidan, que existan los archivos del service worker y que cada texto exista en EN y ES.

## Releasing a version / Publicar una versión
Bump `APP_VER` in `app.js`, the cache name in `sw.js` **and** `version.json` to the same value (e.g. `v2`). Installed apps compare `version.json` with their `APP_VER` and update themselves. If you add a new file the app needs offline, add it to `FILES` in `sw.js`.
Sube `APP_VER` en `app.js`, el nombre del caché en `sw.js` **y** `version.json` al mismo valor (ej. `v2`). Las apps instaladas comparan `version.json` con su `APP_VER` y se actualizan solas. Si agregas un archivo que la app necesita sin internet, agrégalo a `FILES` en `sw.js`.

For every release with a new feature, add an entry at the **top** of `data/whatsnew.js` (same `v` as `APP_VER`, 1–3 short items, EN + ES). People see it once in a "What's new" card after the update.
En cada versión con algo nuevo, agrega una entrada **arriba** en `data/whatsnew.js` (mismo `v` que `APP_VER`, 1–3 puntos cortos, EN + ES). La gente la ve una vez en la tarjeta "Novedades" después de actualizar.

## Icons / Íconos
`python3 tools/make_icons.py` regenerates everything in `icons/` (needs Pillow). / regenera todo en `icons/` (requiere Pillow).
