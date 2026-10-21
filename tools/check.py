#!/usr/bin/env python3
"""Pre-release sanity check. Run: python3 tools/check.py
Revisión antes de publicar: versiones iguales, archivos del service worker, textos EN/ES completos."""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
errors = []
def err(m): errors.append(m)

# 1) the three version numbers must match / las tres versiones deben coincidir
app_ver = re.search(r"APP_VER\s*=\s*'(v\d+)'", read("app.js")).group(1)
ver_json = json.loads(read("version.json"))["v"]
sw_ver = re.search(r"const C='bubylift-(v\d+)'", read("sw.js")).group(1)
if not (app_ver == ver_json == sw_ver):
    err(f"version mismatch: app.js={app_ver} version.json={ver_json} sw.js={sw_ver}")
wn = re.search(r"\{v:'(v\d+)'", read("data/whatsnew.js"))
if not wn or wn.group(1) != app_ver:
    err(f"top entry of data/whatsnew.js should be {app_ver}, found {wn.group(1) if wn else None}")
if f"## {app_ver}" not in read("CHANGELOG.md") and "## Unreleased" not in read("CHANGELOG.md"):
    err(f"CHANGELOG.md has no section for {app_ver}")

# 2) every file the service worker pre-caches must exist / todo archivo del service worker debe existir
files = re.search(r"const FILES=\[(.*?)\];", read("sw.js"), re.S).group(1)
for f in re.findall(r"'([^']+)'", files):
    if f != "./" and not os.path.exists(os.path.join(ROOT, f)):
        err(f"sw.js lists a missing file: {f}")
# every script/link in index.html must be pre-cached / todo script del index debe estar en el caché
for f in re.findall(r'(?:src|href)="([^"#:]+)"', read("index.html")):
    if f not in files and f not in ("manifest.json",) and not f.startswith("icons/apple"):
        err(f"index.html references {f} but sw.js does not pre-cache it")

# 3) every translation key used in code exists, with both languages / toda clave usada existe con EN y ES
i18n = read("data/i18n.js")
keys = dict(re.findall(r"([A-Za-z0-9_]+):\['((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\]", i18n) and
            [(m[0], (m[1], m[2])) for m in re.findall(r"([A-Za-z0-9_]+):\['((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\]", i18n)])
for k, (en, es) in keys.items():
    if not en.strip() or not es.strip(): err(f"empty translation: {k}")
    for ph in re.findall(r"\{\d\}", en):
        if ph not in es: err(f"placeholder {ph} missing in ES: {k}")
    for ph in re.findall(r"\{\d\}", es):
        if ph not in en: err(f"placeholder {ph} missing in EN: {k}")
used = set()
for js in ("app.js", "workout.js", "history.js", "body.js"):
    src = read(js)
    for m in re.finditer(r"\bt\(", src):
        depth, i = 1, m.end()
        while i < len(src) and depth:
            depth += {"(": 1, ")": -1}.get(src[i], 0); i += 1
        seg = src[m.end():i]
        first = re.match(r"'([A-Za-z][A-Za-z0-9_]*)'", seg)             # t('key', ...)
        if first and not first.group(1).endswith("_"): used.add(first.group(1))
        used.update(re.findall(r"\?'([A-Za-z][A-Za-z0-9_]*)':", seg))    # t(cond ? 'a' : 'b')
        used.update(re.findall(r":'([A-Za-z][A-Za-z0-9_]*)'\)", seg))
    if js == "history.js":
        for q in re.findall(r"\['[a-z0-9]+','([A-Za-z0-9]+)'\]", src): used.add(q)   # METRICS
    for q in re.findall(r"TAB_KEYS=\[(.*?)\];", src, re.S):
        used.update(re.findall(r"'(t[A-Z][a-z]+)'", q))
    for q in re.findall(r"steps=ios\?\[(.*?)\]:\[(.*?)\]", src):
        for part in q: used.update(re.findall(r"'(\w+)'", part))
groups = re.search(r"EX_GROUPS=\[(.*?)\]", (read("data/exercises.js")+read("data/exercises2.js"))).group(1)
for g in re.findall(r"'(\w+)'", groups): used.add("g_" + g)
for row in re.findall(r"^ \['\w+','[^']*','[^']*','\w+','(\w+)'", (read("data/exercises.js")+read("data/exercises2.js")), re.M): used.add("e_" + row)
used.update({"m_wr", "m_bw", "m_t"})
used.update("me_" + k for k in re.findall(r"'(\w+)'", re.search(r"const MEAS=\[(.*?)\]", read("body.js")).group(1)))
for k in sorted(used):
    if k not in keys: err(f"missing translation key: {k}")

# 4) exercise ids unique, groups valid / ids de ejercicios únicos y grupos válidos
rows = re.findall(r"^ \['(\w+)','(?:[^'\\]|\\.)*','(?:[^'\\]|\\.)*','(\w+)','(\w+)'(?:,'(\w+)')?\]", (read("data/exercises.js")+read("data/exercises2.js")), re.M)
ids = [r[0] for r in rows]
if len(ids) != len(set(ids)): err("duplicate exercise ids")
gset = set(re.findall(r"'(\w+)'", groups))
for r in rows:
    if r[1] not in gset: err(f"exercise {r[0]} has unknown group {r[1]}")
    if r[3] not in ("", "bw", "t", "wr"): err(f"exercise {r[0]} has unknown mode {r[3]}")

if errors:
    print("FAILED / FALLÓ"); [print(" -", e) for e in errors]; sys.exit(1)
print(f"OK / BIEN — {app_ver}, {len(keys)} strings, {len(ids)} exercises, {len(used)} keys in use")
