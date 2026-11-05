#!/usr/bin/env python3
"""Regenerates docs/CODEMAP.md: where to look for what, plus every top-level function with its line.
Run: python3 tools/gen_codemap.py   ·   Regenera docs/CODEMAP.md: dónde buscar cada cosa y cada función con su línea."""
import os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# (file, English, Español) — keep in loading order of index.html / en el orden de carga de index.html
CODE = [
 ("app.js", "Core: storage (jget/jset), units, language, theme, sheets/modals, tabs & router (go/render), install, auto-update, What's new",
            "Núcleo: almacenamiento (jget/jset), unidades, idioma, tema, hojas/modales, pestañas y navegación (go/render), instalación, auto-actualización, Novedades"),
 ("workout.js", "Workout tab: start screen, active workout, set logging, PR detection, rest timer, exercise picker",
                "Pestaña Entrenar: inicio, entrenamiento activo, registro de series, detección de récords, descanso, selector de ejercicios"),
 ("plan.js", "Plan engine and screens: generating the week, suggested weights, plan editor, swaps, plan setup",
             "Motor y pantallas del plan: generar la semana, pesos sugeridos, editor del plan, cambios, configuración"),
 ("opt.js", "NASM OPT model: phases 1-5, CPT7 templates", "Modelo NASM OPT: fases 1-5, plantillas CPT7"),
 ("pers.js", "Personalization: favorites, preferences, level test, plan adjustment from real logs",
             "Personalización: favoritos, preferencias, prueba de nivel, ajuste del plan según tus registros"),
 ("wizard.js", "Plan questionnaire, one question per screen", "Cuestionario del plan, una pregunta por pantalla"),
 ("faq.js", "Help / feedback sheet", "Hoja de ayuda y comentarios"),
 ("library.js", "Ready routines by muscle/equipment, challenges, classic programs (screens)",
                "Rutinas listas por músculo/equipo, retos, programas clásicos (pantallas)"),
 ("stretch.js", "Stretch tab: quick sessions and every stretch by body area", "Pestaña Estirar: sesiones rápidas y estiramientos por zona"),
 ("guide.js", "Guided mobility session (one move at a time, countdown)", "Sesión guiada de movilidad (un movimiento a la vez, cuenta regresiva)"),
 ("rehab.js", "Recovery plans screens (data in data/rehab*.js)", "Pantallas de planes de Recuperación (datos en data/rehab*.js)"),
 ("tour.js", "First-run tour", "Recorrido de primera vez"),
 ("history.js", "History tab, charts (lineSvg/barSvg), Progress tab per-exercise view, calendar",
                "Pestaña Historial, gráficas (lineSvg/barSvg), vista de Progreso por ejercicio, calendario"),
 ("goals.js", "Goals with progress bars", "Metas con barra de progreso"),
 ("habit.js", "Weekly streak, summary, calendar reminders", "Racha semanal, resumen, recordatorios de calendario"),
 ("aft.js", "Army AFT panel", "Panel del AFT del Ejército"),
 ("card.js", "Workout card drawing helpers (canvas)", "Dibujo de tarjetas de entrenamiento (canvas)"),
 ("cardstudio.js", "Share studio: card styles, preview, PNG render, save/copy/share/Instagram story",
                   "Estudio de compartir: estilos, vista previa, PNG, guardar/copiar/compartir/historia de Instagram"),
 ("body.js", "Body tab, More tab (settings, backup/import/export), Recovery tab, strength score (strData), sub-tabs with swipe",
             "Pestaña Cuerpo, pestaña Más (ajustes, respaldo/importar/exportar), pestaña Recuperación, puntaje de fuerza (strData), subpestañas con deslizar"),
 ("ranks.js", "Ranks (16), bodyweight ranks, XP level, muscle balance, rank ladder and celebration",
              "Rangos (16), rangos de peso corporal, nivel de XP, balance muscular, escalera de rangos y celebración"),
 ("anatomy.js", "Anatomy figure: draws the body, muscle roles (agonist/synergist/stabilizer), Recovery body view, Find by muscle",
                "Figura anatómica: dibuja el cuerpo, roles musculares (agonista/sinergista/estabilizador), vista de cuerpo en Recuperación, Buscar por músculo"),
 ("variants.js", "Exercise variations (grip, width): own records and muscle emphasis",
                 "Variantes de ejercicio (agarre, ancho): récords propios y énfasis muscular"),
 ("cloud.js", "Account + sync (Supabase REST), encryption, merge", "Cuenta + sincronización (Supabase REST), cifrado, fusión"),
 ("profiles.js", "Profiles, sign-in/sign-up gate screens, boot() entry point", "Perfiles, pantallas de entrada/registro, punto de arranque boot()"),
 ("emo.js", "Swaps emoji for line icons", "Cambia emojis por iconos de línea"),
 ("sw.js", "Service worker: offline cache (file list + version)", "Service worker: caché sin conexión (lista de archivos + versión)"),
]
DATA = [
 ("data/i18n.js", "ALL interface strings: key → [English, Español]", "TODOS los textos de la interfaz: clave → [English, Español]"),
 ("data/exercises.js", "Built-in exercise library (names, muscles, equipment)", "Biblioteca de ejercicios incluida (nombres, músculos, equipo)"),
 ("data/exercises2.js", "Imported exercises (Free Exercise DB)", "Ejercicios importados (Free Exercise DB)"),
 ("data/exmeta.js", "Exercise metadata for plan, substitutions, injuries, needed equipment", "Metadatos de ejercicios para el plan, sustituciones, lesiones y equipo"),
 ("data/exmeta2.js", "Metadata for imported exercises", "Metadatos de ejercicios importados"),
 ("data/musc.js", "Muscle map: subgroup and weight per exercise (recovery view, balance)", "Mapa muscular: subgrupo y peso por ejercicio (recuperación, balance)"),
 ("data/anatomy.js", "Body shapes (front/back), one per muscle part, with muscle codes", "Formas del cuerpo (frente/espalda), una por parte del músculo, con códigos"),
 ("data/howto*.js", "Technique guides (howto.js … howto6.js)", "Guías de técnica (howto.js … howto6.js)"),
 ("data/rehab.js", "Recovery plans (part 1); rehab2.js part 2", "Planes de Recuperación (parte 1); rehab2.js parte 2"),
 ("data/library.js", "Routine definitions by muscle/level and challenges; library2.js by equipment", "Rutinas por músculo/nivel y retos; library2.js por equipo"),
 ("data/programs.js", "Classic programs (StrongLifts, 5/3/1, PHUL…)", "Programas clásicos (StrongLifts, 5/3/1, PHUL…)"),
 ("data/poolx.js", "Extra exercise pools for the plan builder", "Listas extra de ejercicios para el armado del plan"),
 ("data/styles.js", "Training styles", "Estilos de entrenamiento"),
 ("data/stretch.js", "Stretch tab data", "Datos de la pestaña Estirar"),
 ("data/whatsnew.js", "What's new popup entries (newest first)", "Entradas de Novedades (la más nueva primero)"),
 ("data/icons.js, emoicons.js, avatars.js, exphotos.js", "Icon sets, profile photos, exercise photo list", "Iconos, fotos de perfil, lista de fotos de ejercicios"),
 ("data/cloudcfg.js", "Public Supabase settings (never the service_role key)", "Ajustes públicos de Supabase (nunca la llave service_role)"),
]
FIND = [
 ("Change a text / translate", "Cambiar o traducir un texto", "`data/i18n.js` (search the key; check.py enforces EN+ES)"),
 ("Add or edit an exercise", "Agregar o editar un ejercicio", "`data/exercises.js` + `data/exmeta.js` (+ `data/musc.js`, `data/howto*.js`)"),
 ("How a set is saved / PR trophy", "Cómo se guarda una serie / trofeo de récord", "`workout.js`: `sv`, `setScore`, `bestScore`, `prBurst`"),
 ("Suggested weight / reps range", "Peso sugerido / rango de repeticiones", "`plan.js`: `sugg`, `firstRange`, `startLine`"),
 ("Strength score and ranks", "Puntaje de fuerza y rangos", "`body.js`: `strData`, `strPts`; `ranks.js`: `strCard`, `rkLadder`"),
 ("Sheets / modals / swipe to close", "Hojas / modales / deslizar para cerrar", "`app.js`: `sheet`, `sheetClose` and the touch handler below them"),
 ("Tabs and navigation", "Pestañas y navegación", "`app.js`: `go`, `render`; sub-tabs in `body.js`: `subBar`, `subWrap`"),
 ("Saving / loading data", "Guardar / cargar datos", "`app.js`: `loadAll`, `saveData`, `jget`, `jset`; profiles in `profiles.js`"),
 ("Cloud sync / encryption", "Sincronización / cifrado", "`cloud.js`; `server/schema.sql`"),
 ("Backup export / import", "Exportar / importar respaldo", "`body.js`: `exportJSON`, `importFile`, `clean*`"),
 ("Body figure / muscle roles", "Cuerpo / roles musculares", "`anatomy.js`: `anaSvg`, `anaRoles`; shapes in `data/anatomy.js`"),
 ("Share card", "Tarjeta para compartir", "`cardstudio.js`: `csOpen`, `csPrep`, `csOut`"),
 ("Colors, fonts, layout", "Colores, fuentes, diseño", "`design.css` (loaded last, wins), then `style.css`; rank fonts in `fonts/`"),
 ("Offline cache / new release", "Caché sin conexión / versión nueva", "`sw.js`, `app.js` APP_VER, `version.json`, `tools/check.py`"),
 ("Tests", "Pruebas", "`tests/smoke.js` (jsdom), `npm test`"),
]

def funcs(path):
    out = []
    for i, line in enumerate(open(os.path.join(ROOT, path), encoding="utf-8"), 1):
        m = re.match(r"(?:async )?function ([A-Za-z0-9_$]+)", line)
        if m: out.append((m.group(1), i))
    return out

L = ["# Code map / Mapa del código", "",
 "Generated by `python3 tools/gen_codemap.py` — do not edit by hand. / Generado por `tools/gen_codemap.py` — no editar a mano.", "",
 "Bubylift has no build step: every `.js` file is loaded by `index.html` in order and shares one global scope. Each file starts with a comment saying what it owns.",
 "Bubylift no se compila: cada `.js` lo carga `index.html` en orden y todos comparten un mismo ámbito global. Cada archivo empieza con un comentario que dice qué le pertenece.", "",
 "## I want to… / Quiero…", "", "| Task / Tarea | Look in / Busca en |", "|---|---|"]
for en, es, w in FIND: L.append(f"| {en} / {es} | {w} |")
L += ["", "## Code files (load order) / Archivos de código (orden de carga)", ""]
for f, en, es in CODE:
    fn = funcs(f)
    L += [f"### `{f}`", f"{en}.  ", f"{es}.", ""]
    if fn: L += ["Functions / Funciones: " + ", ".join(f"`{n}`:{ln}" for n, ln in fn), ""]
L += ["## Data files / Archivos de datos", "", "| File | What / Qué |", "|---|---|"]
for f, en, es in DATA: L.append(f"| `{f}` | {en} / {es} |")
L += ["", "## Other / Otros", "",
 "- `design.css` / `style.css`: styles; design.css loads last and overrides. / estilos; design.css carga al final y reemplaza.",
 "- `fonts/`: 16 rank fonts. `icons/`, `img/`: images. `lib/`: QR libraries. / 16 fuentes de rango; imágenes; librerías QR.",
 "- `server/`: Supabase schema and functions. `tools/`: check.py (pre-release), icon/muscle generators. `tests/`: smoke.js.",
 "- `docs/`: manuals, ARCHITECTURE.md (design), this map. / manuales, ARCHITECTURE.md (diseño) y este mapa.", ""]
open(os.path.join(ROOT, "docs/CODEMAP.md"), "w", encoding="utf-8").write("\n".join(L))
print("docs/CODEMAP.md written")
