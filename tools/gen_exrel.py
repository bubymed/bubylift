#!/usr/bin/env python3
"""Generates data/exrel.js: for every exercise its movement pattern, laterality, difficulty, and the closest
similar exercises + equipment swaps, computed from OUR data (muscle weights in data/musc.js, equipment, group, name).
Genera data/exrel.js: patrón de movimiento, lateralidad, dificultad y los ejercicios más parecidos + cambios de equipo,
calculados con NUESTROS datos (pesos musculares de data/musc.js, equipo, grupo y nombre).

Run after tools/gen_musc.py:  python3 tools/gen_exrel.py        ·   Córrelo después de tools/gen_musc.py.
Progression chains (easier -> harder) are hand-written in tools/exchains.py. / Las cadenas de progresión están escritas a mano en tools/exchains.py.
Writes two files / Escribe dos archivos:
  data/exrel.js   EXREL[id] = 'pattern|U/B|difficulty 1-3|similar|swaps|easier|harder|gentler' (ids separated by spaces)
  data/exinfo.js  EXTAX[id] taxonomy · EXEQ[id] equipment needed/optional/support/assistance · EXALI[id] aliases
Everything is computed by rules from our own data: it is a guide, not reviewed one by one. / Todo se calcula con reglas sobre nuestros datos: es una guía, no se revisó uno por uno.
"""
import re, json, math, os, sys, collections
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()

rows = []
for f in ('data/exercises.js', 'data/exercises2.js'):
    for m in re.finditer(r"^\s*\['([\w]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)','(\w+)','(\w+)'(?:,'(\w+)')?\]", rd(f), re.M):
        rows.append(dict(id=m[1], en=m[2].replace("\\'", "'"), es=m[3], g=m[4], eq=m[5], mode=m[6] or 'wr'))
EXM = {}
for f in ('data/exmeta.js', 'data/exmeta2.js'):
    for m in re.finditer(r"(\w+):'([A-Z])(\d)((?:[a-z]\d)*)'", rd(f)):
        EXM[m[1]] = (m[2], int(m[3]), m[4])
EXMU = {}
for m in re.finditer(r"^\s*(\w+):'([^']*)',?\s*$", rd('data/musc.js').split('const EXMU={')[1], re.M):
    EXMU[m[1]] = {p[0]: float(p[1]) for p in re.findall(r'([a-z]+)([\d.]+)', m[2])}

# movement pattern: the library group narrows the choice, then the name decides (first match wins); a name alone is too ambiguous
# ("bench" in a wrist curl, "fly" in a rear-delt fly, "kickback" for triceps and glutes).
# patrón de movimiento: el grupo de la biblioteca acota y luego decide el nombre (gana la primera coincidencia); el nombre solo es ambiguo.
POWER_RX = r'jump|hop\b|bound|plyo|skater|burpee|clap|slam|throw|toss|swing|snatch|jerk|thruster|wall ball|chest pass|man maker|\bskip|push press|high pull'
BY_GROUP = {
 'chest': [('power', r'chest pass|plyo|clap|throw|chest push|bench sprint'), ('vertical push', r'\bdips?\b'), ('vertical pull', r'pullover'), ('horizontal push', r'')],
 'back': [('vertical pull', r'pull.?ups?\b|chin.?ups?\b|chins?\b|pulldown|pull-down|lat pull|muscle.up|rope climb|pullover|straight-arm|high pulley|high-pulley|pushdown'),
          ('shoulder raise', r'shrug|upright'), ('hinge', r'deadlift|good morning|hyperext|back extension|rack pull|superman|reverse hyper'),
          ('power', r'snatch|clean|jerk|sumo high pull'), ('horizontal pull', r'')],
 'shoulders': [('power', r'snatch|clean|jerk|thruster|push press'), ('full body', r'get-up|combo'),
               ('horizontal pull', r'rear.delt|reverse.*fl|back fl|face pull|pull-apart|bent.over|rear lateral|lying rear|\by raise|\bt raise|straight raises on incline'),
               ('shoulder rotation', r'rotation|cuban|car driver|rotator|l-fly'),
               ('vertical push', r'press|handstand|pike|bradford'), ('shoulder raise', r'')],
 'biceps': [('power', r'clean'), ('arm flexion', r'')],
 'triceps': [('vertical push', r'\bdips?\b'), ('horizontal push', r'bench press|close-?grip.*press|push-?up|board press|floor press|jm press|tate press'), ('arm extension', r'')],
 'legs': [('calf raise', r'calf|heel raise|toe raise|tibialis|donkey calf'), ('knee flexion', r'leg curl|hamstring|nordic|glute-ham|glute ham'), ('knee extension', r'leg extension|sissy'),
          ('hip adduction', r'adduct|copenhagen'), ('hip abduction', r'abduct|monster|band walk'), ('core flexion', r'hip flexion'),
          ('power', r'jump|hop\b|bound|jerk|snatch|skater|swing'), ('carry', r'sled|prowler|yoke|farmer'),
          ('lunge', r'lunge|split squat|step.?ups?|bulgarian|pistol|cossack|single.leg squat|one.leg.*squat'),
          ('squat', r'squat|leg press|hack|wall sit'), ('power', r'clean'),
          ('hinge', r'deadlift|rdl|romanian|good morning|stiff|pull.through|hip hinge|hyperext|back extension'), ('squat', r'')],
 'glutes': [('hip abduction', r'abduct|clamshell|hydrant|side-lying|monster|lateral band|side leg'), ('core flexion', r'flutter'),
            ('hip extension', r'kickback|donkey|frog pump|hip lift|glute kick|butt'), ('lunge', r'lunge|step-?ups?|split squat|bulgarian'),
            ('squat', r'squat'), ('hinge', r'')],
 'core': [('carry', r'carry|crawl'), ('power', r'throw|slam|toss'), ('vertical push', r'bent press'),
          ('rotation', r'twist|rotation|chop|russian|windmill|wiper|oblique|side bend|pallof press with rot|judo|figure 8|pass between|cable lift|180|spell caster'),
          ('core flexion', r'crunch|sit-?up'),
          ('core stability', r'plank|dead bug|bird dog|hollow|hold|vacuum|pallof|stir|bridge|rollout|ab wheel|fallout|iso-ab|bracing|superman|bear|body saw|l-sit'),
          ('core flexion', r'')],
 'full': [('carry', r'carry|farmer|yoke|sled'), ('power', POWER_RX + r'|clean'), ('full body', r'')],
 'power': [('hinge', r'deadlift|stiff'), ('squat', r'squat$|olympic squat|frankenstein'), ('power', r'')],
 'balance': [('balance', r'')], 'cardio': [('cardio', r'')], 'mobility': [('mobility', r'')],
}
UNI = r'single|one-arm|one arm|one-leg|one leg|unilateral|alternating|lunge|split squat|step-?up|pistol|bulgarian|cossack|suitcase|windmill|staggered|side-lying'
ADV = r'pistol|muscle-up|one-arm|one arm|handstand|planche|front lever|back lever|nordic|dragon flag|snatch|clean|jerk|iron cross|human flag|man maker|turkish|box jump.*depth|depth jump|ring|weighted pull|kipping'

def pattern(r):
    n = r['en'].lower()
    for name, rx in BY_GROUP.get(r['g'], []):
        if not rx or re.search(rx, n): return name
    return 'other'

def difficulty(r):
    """1 beginner · 2 needs some experience · 3 advanced / 1 principiante · 2 con algo de experiencia · 3 avanzado"""
    n = r['en'].lower()
    if r['g'] in ('mobility',): return 1
    if re.search(ADV, n): return 3
    m = EXM.get(r['id'])
    if m: return 2 if m[1] >= 2 else 1
    return 2 if r['eq'] in ('barbell',) else 1

def category(r, pat):
    if r['g'] == 'mobility': return 'mobility'
    if r['g'] == 'cardio' or pat == 'cardio': return 'cardio'
    if pat == 'power': return 'power'
    return 'strength'

def main_muscle(w): return max(w.items(), key=lambda x: x[1])[0] if w else ''
def cos(a, b):
    ks = set(a) | set(b)
    na = math.sqrt(sum(v * v for v in a.values())); nb = math.sqrt(sum(v * v for v in b.values()))
    return sum(a.get(k, 0) * b.get(k, 0) for k in ks) / (na * nb) if na and nb else 0

EQW = set('barbell dumbbell dumbbells cable cables band bands machine smith kettlebell kettlebells ez ez-bar bar chains chain with a the on to using weighted bodyweight resistance medicine ball stability exercise lever sled'.split())
def toks(name):
    t = re.findall(r'[a-z]+', name.lower())
    return set(x for x in t if x not in EQW)
def jac(a, b): return len(a & b) / len(a | b) if (a | b) else 0

info = {}
for r in rows:
    w = EXMU.get(r['id']) or {}
    r['pat'] = pattern(r); r['uni'] = bool(re.search(UNI, r['en'].lower())); r['mm'] = main_muscle(w); r['w'] = w
    r['tk'] = toks(r['en']); r['diff'] = difficulty(r); r['cat'] = category(r, r['pat'])
    info[r['id']] = r

def score(a, b):
    s = 45 * cos(a['w'], b['w'])
    s += 25 if a['pat'] == b['pat'] else 0
    s += 12 if a['g'] == b['g'] else 0
    s += 8 if a['uni'] == b['uni'] else 0
    s += 5 if a['eq'] == b['eq'] else 0
    s += 5 if a['mm'] == b['mm'] else 0
    return s

def pick(a, cands, k, per_eq):
    """best first, skipping near-identical names and capping each equipment / mejores primero, sin nombres casi idénticos y con tope por equipo"""
    out, eqc = [], collections.Counter()
    for s, i in cands:
        b = info[i]
        if i in DUP: continue                                       # hidden duplicate of a curated exercise / duplicado oculto
        if jac(a['tk'], b['tk']) >= .85 and out: continue            # same exercise written another way / mismo ejercicio escrito distinto
        if any(jac(info[o]['tk'], b['tk']) >= .85 for o in out): continue
        if eqc[b['eq']] >= per_eq: continue
        out.append(i); eqc[b['eq']] += 1
        if len(out) >= k: break
    return out

MIN_SCORE = 68
def similar(a, k=4):
    if a['g'] == 'mobility': return []
    c = [(score(a, b), b['id']) for b in rows if b['id'] != a['id'] and b['g'] != 'mobility' and b['pat'] == a['pat']]
    c = [x for x in c if x[0] >= MIN_SCORE]
    c.sort(key=lambda x: (-x[0], x[1]))
    return pick(a, c, k, 2)

def mech_of(r):
    if 'mech' not in r: r['mech'] = taxonomy(r).split('|')[1]
    return r['mech']

def swaps(a, k=3):
    """same movement and main muscle with other equipment (if yours is missing) / mismo movimiento y músculo con otro equipo (si te falta el tuyo)"""
    if a['g'] == 'mobility': return []
    c = [(score(a, b), b['id']) for b in rows if b['id'] != a['id'] and b['pat'] == a['pat'] and b['eq'] != a['eq']
         and b['g'] == a['g'] and (b['mm'] == a['mm'] or cos(a['w'], b['w']) >= .85) and mech_of(b) == mech_of(a)]  # a big lift is never swapped for a single-joint move / un básico nunca se cambia por uno de una articulación
    c = [x for x in c if x[0] >= MIN_SCORE]
    c.sort(key=lambda x: (-x[0], x[1]))
    return pick(a, c, k, 1)

# ---- hand-written progression chains, easiest -> hardest / cadenas de progresión escritas a mano, de la más fácil a la más difícil
CHAINS = []
def chain(*names):
    ids = []
    for n in names:
        h = [r['id'] for r in rows if r['id'] == n or r['en'].lower() == n.lower()]
        if not h:
            print('!! chain: not found', n, file=sys.stderr); continue
        ids.append(h[0])
    if len(ids) >= 2: CHAINS.append(ids)
exec(open(os.path.join(ROOT, 'tools', 'exchains.py'), encoding='utf-8').read()) if os.path.exists(os.path.join(ROOT, 'tools', 'exchains.py')) else None


# ---------------------------------------------------------------- progressions / progresiones
def chain_nb(eid):
    up, dn = [], []
    for c in CHAINS:
        if eid in c:
            k = c.index(eid)
            if k > 0 and c[k-1] not in up: up.append(c[k-1])
            if k < len(c) - 1 and c[k+1] not in dn: dn.append(c[k+1])
    return up, dn

def auto_dir(a, harder, k=2):
    """no hand chain: nearest exercise of the same movement one level easier/harder / sin cadena: el más cercano del mismo movimiento un nivel más fácil/difícil"""
    if a['g'] == 'mobility': return []
    c = [(score(a, b), b['id']) for b in rows if b['id'] != a['id'] and b['pat'] == a['pat'] and b['g'] == a['g']
         and (b['diff'] > a['diff'] if harder else b['diff'] < a['diff']) and b['uni'] == a['uni'] and b['eq'] == a['eq'] and jac(a['tk'], b['tk']) >= .5]
    c = [x for x in c if x[0] >= MIN_SCORE + 8]
    c.sort(key=lambda x: (-x[0], x[1]))
    return pick(a, c, k, 1)

# ---------------------------------------------------------------- gentler on a joint / más suave con una articulación
def stress(eid):
    m = EXM.get(eid)
    return {j: int(v) for j, v in re.findall(r'([a-z])(\d)', m[2])} if m else {}

def gentler(a, k=3):
    """same movement, clearly less joint stress where this one is hardest: 'id:letters' / mismo movimiento con claramente menos estrés donde este es más duro"""
    sa = stress(a['id'])
    if not sa or a['g'] == 'mobility': return []
    c = []
    for b in rows:
        if b['id'] == a['id'] or b['pat'] != a['pat'] or b['g'] != a['g']: continue
        sb = stress(b['id'])
        better = [j for j, v in sa.items() if sb.get(j, 0) < v]
        if not better or any(sb.get(j, 0) > sa.get(j, 0) for j in sb): continue   # never worse anywhere / nunca peor en ningún lado
        if sum(sa.values()) - sum(sb.values()) < 1: continue
        sc = score(a, b)
        if sc < MIN_SCORE: continue
        c.append((sc + 6 * len(better), b['id'], ''.join(sorted(better))))
    c.sort(key=lambda x: (-x[0], x[1]))
    got = pick(a, [(s_, i) for s_, i, _ in c], k, 1)
    lm = {i: j for _, i, j in c}
    return ['%s:%s' % (i, lm[i]) for i in got]

# ---------------------------------------------------------------- taxonomy / taxonomía
FAMILY = {'shoulder rotation': 'shoulders', 'hip extension': 'legs', 'horizontal push': 'push', 'vertical push': 'push', 'arm extension': 'push', 'horizontal pull': 'pull', 'vertical pull': 'pull',
          'arm flexion': 'pull', 'shoulder raise': 'shoulders', 'squat': 'legs', 'lunge': 'legs', 'hinge': 'legs', 'knee flexion': 'legs',
          'knee extension': 'legs', 'calf raise': 'legs', 'hip abduction': 'legs', 'hip adduction': 'legs', 'core flexion': 'core',
          'core stability': 'core', 'rotation': 'core', 'carry': 'full', 'power': 'full', 'full body': 'full', 'balance': 'core',
          'cardio': 'cardio', 'mobility': 'mobility', 'other': 'other'}
ISO = {'shoulder rotation', 'hip extension', 'shoulder raise', 'arm flexion', 'arm extension', 'knee flexion', 'knee extension', 'calf raise', 'hip abduction', 'hip adduction', 'core flexion'}
PUSH = {'horizontal push', 'vertical push', 'arm extension', 'squat', 'lunge', 'knee extension', 'calf raise'}
PULL = {'horizontal pull', 'vertical pull', 'arm flexion', 'knee flexion', 'hinge'}
FRONTAL = r'lateral|side|abduct|adduct|cossack|jumping jack|windmill|copenhagen|clamshell|hydrant|monster|upright|y raise'
TRANSV = r'rotation|twist|chop|russian|pallof|fly|flye|pec deck|crossover|reverse fly|pull-apart|face pull|rear delt|t raise|woodchop|landmine rot'
def taxonomy(r):
    n = r['en'].lower(); pat = r['pat']; w = r['w']
    fam = FAMILY.get(pat, 'other')
    big = sum(1 for v in w.values() if v >= .5)
    mech = 'I' if (pat in ISO or re.search(r'\bfly|flye|flies|raise|kickback|pullover|pushdown|shrug|crossover|pec deck|butterfly|straight-arm|pull-apart|hyperext|back extension|superman|reverse hyper', n) or (big <= 2 and pat not in ('hinge', 'squat', 'lunge', 'horizontal push', 'vertical push', 'horizontal pull', 'vertical pull'))) else 'C'
    if pat in ('mobility', 'cardio'): mech = '-'
    force = 'S' if (r['mode'] == 't' or re.search(r'\bhold|isometric|wall sit|plank|hollow|dead hang|bridge hold|l-sit|bracing', n)) else 'P' if pat in PUSH else 'L' if pat in PULL else 'O'
    plane = 'F' if re.search(FRONTAL, n) else 'T' if re.search(TRANSV, n) else 'S'
    if pat in ('hip abduction', 'hip adduction'): plane = 'F'
    if re.search(r'incline|decline', n) and pat in ('horizontal push',): plane = 'S'
    if re.search(r'hanging|pull-?up|chin-?up|dead hang|muscle-up|rope climb|toes to bar|knee raise.*hang', n): pos = 'hang'
    elif re.search(r'kneeling|half-kneeling|tall kneeling', n): pos = 'kneel'
    elif re.search(r'prone|face down|superman|reverse hyper|back extension|hyperext|bird dog|bear|push-?up|pushup|plank|mountain climber|burpee|inverted|\bdip\b', n): pos = 'prone'
    elif re.search(r'lying|supine|bench press|skull|floor press|crunch|sit-?up|bridge|hip thrust|leg raise|dead bug|hollow|pullover|on back|flat bench|incline|decline|v-up|leg curl.*lying|lying', n) and not re.search(r'seated|standing', n): pos = 'lie'
    elif r['g'] == 'chest' and re.search(r'\bfly|flye', n) and r['eq'] == 'dumbbell': pos = 'lie'
    elif re.search(r'seated|sitting|machine|leg press|leg extension|pec deck|chest press|pulldown|lat pull|cable row|low row', n): pos = 'sit'
    else: pos = 'stand'
    ang = 'inc' if 'incline' in n else 'dec' if 'decline' in n else ''
    eqc = {'barbell': 'free', 'dumbbell': 'free', 'kettlebell': 'free', 'cable': 'stack', 'machine': 'stack', 'bodyweight': 'body', 'band': 'elastic',
           'suspension': 'body', 'bench': 'body', 'bar': 'body'}.get(r['eq'], 'other')
    if re.search(r'weighted', n) and r['eq'] == 'bodyweight': eqc = 'free'
    up = sum(w.get(k, 0) for k in ('chu','chm','ser','lat','ter','inf','rho','trp','nck','sdf','sdl','sdr','rtc','bic','bra','brd','frm','trl','trm'))
    lo = sum(w.get(k, 0) for k in ('rf','vl','vm','sar','add','bfm','smt','gas','sol','tib','per','hfl','gmx','gmd','gmn','tfl','lbk','ql'))
    co = sum(w.get(k, 0) for k in ('abs','tva','obl'))
    region = 'full' if pat in ('power', 'full body', 'carry') or (up > 0 and lo > 0 and min(up, lo) > .6 * max(up, lo)) else max((('up', up), ('lo', lo), ('core', co)), key=lambda x: x[1])[0] if (up + lo + co) else 'full'
    if r['g'] == 'core': region = 'core'
    flags = ''.join(f for f, ok in (('C', mech == 'C'), ('U', r['uni']), ('A', bool(re.search(r'assist', n))), ('W', bool(re.search(r'weighted', n)))) if ok)
    return '|'.join((fam, mech, force, plane, pos, ang, eqc, region, flags))

# ---------------------------------------------------------------- equipment needed / support / assistance / equipo
def equipment(r):
    n = r['en'].lower(); pat = r['pat']; eq = r['eq']
    need, opt, sup, ast = [], [], [], []
    def add(l, x):
        if x not in l: l.append(x)
    base = {'barbell': ['barbell', 'plates'], 'dumbbell': ['dumbbells'], 'kettlebell': ['kettlebell'], 'cable': ['cable'], 'machine': ['machine'],
            'band': ['band'], 'ball': ['ball'], 'medball': ['medball'], 'suspension': ['susp'], 'roller': ['roller'], 'bench': ['bench'], 'bar': ['pullbar']}.get(eq, [])
    for x in base: add(need, x)
    if 'smith' in n: need[:] = ['smith']
    if re.search(r'pull-?up|chin-?up|hanging|muscle-up|dead hang|toes to bar|rope climb', n) and eq in ('bodyweight', 'other', 'bar'): add(need, 'pullbar')
    if re.search(r'\bdip\b|dips', n) and 'bench' not in n: add(need, 'dipstation')
    if re.search(r'bench dip', n): add(need, 'bench')
    if re.search(r'inverted row', n) and eq != 'suspension': add(need, 'pullbar'); add(opt, 'susp')
    if re.search(r'box jump|step-?up|box squat|depth', n): add(need, 'box')
    if re.search(r'wall sit|wall ball|against wall|wall angel|wall push|handstand', n): add(sup, 'wall')
    if re.search(r'push-?up|pushup', n) and re.search(r'incline', n): add(sup, 'bench'); add(opt, 'box')
    elif re.search(r'bench|incline|decline|preacher|skull|pullover|hip thrust|bulgarian', n) and eq in ('barbell', 'dumbbell', 'cable', 'kettlebell', 'bodyweight', 'bench', 'machine') and eq != 'machine':
        add(need, 'bench')
    elif re.search(r'seated|step-?up', n) and eq in ('barbell', 'dumbbell', 'cable', 'kettlebell'):
        add(sup, 'bench'); add(opt, 'chair')
    if eq == 'barbell' and re.search(r'squat|bench|press|shrug|rack|good morning', n) and not re.search(r'landmine|jefferson|zercher', n):
        add(sup, 'rack')
        if re.search(r'squat|bench|overhead|military|front', n): add(ast, 'spotter')
    if eq == 'barbell' and re.search(r'deadlift|row|shrug|clean|snatch', n): add(opt, 'straps')
    if eq == 'barbell' and re.search(r'squat|deadlift', n): add(opt, 'belt')
    if eq in ('bodyweight', 'other', 'bench') and r['g'] in ('core', 'chest', 'glutes', 'legs', 'back', 'full', 'mobility', 'balance') and re.search(r'lying|crunch|sit-?up|plank|bridge|push-?up|dead bug|bird dog|hollow|superman|clamshell|hydrant|bear|burpee|mountain|leg raise|v-up|supine|prone|floor|stretch', n):
        add(opt, 'mat')
    if re.search(r'assist', n):
        if 'machine' in n: add(need, 'machine')
        else: add(need, 'band') if 'band' in n else add(ast, 'partner')
    if pat in ('vertical pull',) and 'pullup' not in n and eq == 'bodyweight' and not re.search(r'assist', n): add(ast, 'band'); add(ast, 'assistmachine')
    if pat == 'horizontal push' and eq == 'bodyweight' and re.search(r'push-?up|pushup', n) and not re.search(r'knee|incline|decline|wall', n): add(ast, 'incline')
    if re.search(r'weighted', n) and eq == 'bodyweight': add(need, 'plates'); add(opt, 'belt')
    if eq == 'dumbbell' and re.search(r'press|row|curl|raise', n) and 'bench' not in sup and re.search(r'incline|flat|bench', n): add(sup, 'bench')
    if eq in ('dumbbell', 'barbell', 'cable') and re.search(r'press|row|squat|deadlift|curl', n): (add(opt, 'wraps') if re.search(r'press', n) else add(opt, 'straps') if re.search(r'row|deadlift', n) else None) if eq != 'cable' else None
    if eq in ('dumbbell', 'barbell', 'kettlebell') and pat in ('hinge', 'squat', 'lunge') and re.search(r'heel', n): add(opt, 'plates')
    if eq == 'cable' and re.search(r'pulldown|pushdown|curl|extension|pull-?through|face pull|row|kickback|crunch', n):
        if re.search(r'pulldown|pushdown|curl|crunch|kickback|extension', n): add(need, 'handle')
        if re.search(r'tricep|pushdown', n): add(opt, 'rope')
        if re.search(r'face pull', n): add(need, 'rope')
    for l in (opt, sup, ast): l[:] = [x for x in l if x not in need]
    for l in (sup, ast): l[:] = [x for x in l if x not in opt]
    if not need and eq == 'bodyweight': need = ['none']
    return ' '.join(need), ' '.join(opt), ' '.join(sup), ' '.join(ast)

# ---------------------------------------------------------------- aliases / alias
# search-only synonyms: what a person types -> words that ARE in the English name (matched at a word start), or g:<group>. Not shown anywhere.
# sinónimos solo para buscar: lo que la persona escribe -> una palabra que SÍ está en el nombre en inglés. No se muestran.
SEARCH = {
 'db': 'dumbbell', 'bb': 'barbell', 'kb': 'kettlebell', 'ez': 'ez-bar|ez bar', 'ohp': 'overhead press|shoulder press', 'rdl': 'romanian deadlift', 'sldl': 'stiff-legged|stiff leg',
 'ghr': 'glute ham|glute-ham', 'pressup': 'push-up', 'pressups': 'push-up', 'pushup': 'push-up|pushup', 'pushups': 'push-up|pushup', 'pullup': 'pull-up|pullup', 'pullups': 'pull-up|pullup',
 'chinup': 'chin-up', 'chinups': 'chin-up', 'chins': 'chin', 'situp': 'sit-up', 'situps': 'sit-up', 'stepup': 'step-up|step up', 'stepups': 'step-up|step up',
 'skullcrusher': 'skull', 'skullcrushers': 'skull', 'military': 'military|overhead press', 'pulldowns': 'pulldown', 'flye': 'fly', 'flyes': 'fly', 'flies': 'fly', 'pec': 'g:chest',
 'lats': 'lat pull|pulldown|pull-up', 'abs': 'g:core', 'delts': 'g:shoulders', 'traps': 'shrug', 'hamstrings': 'leg curl|hamstring|romanian', 'quads': 'leg extension|squat', 'calves': 'calf',
 'glutes': 'g:glutes', 'tricep': 'g:triceps', 'bicep': 'g:biceps',
 'lagartijas': 'push-up|pushup', 'lagartija': 'push-up|pushup', 'planchas': 'push-up|plank', 'cuclillas': 'squat', 'cuclilla': 'squat', 'desplantes': 'lunge', 'desplante': 'lunge',
 'estocadas': 'lunge', 'estocada': 'lunge', 'tijeras': 'lunge|scissor', 'zancadas': 'lunge', 'barras': 'pull-up|chin-up', 'pantorrillas': 'calf', 'pantorrilla': 'calf', 'gemelos': 'calf',
 'chamorros': 'calf', 'abdominales': 'crunch|sit-up', 'abdominal': 'crunch|sit-up', 'lumbares': 'back extension|hyperext|superman', 'jalones': 'pulldown', 'encogimientos': 'shrug',
 'rompecraneos': 'skull', 'predicador': 'preacher', 'scott': 'preacher', 'aperturas': 'fly|pec deck|crossover', 'cristos': 'fly', 'vuelos': 'raise', 'pajaros': 'rear delt|reverse fl',
 'patada': 'kickback|donkey', 'patadas': 'kickback|donkey', 'puente': 'bridge|hip thrust', 'granjero': 'farmer', 'escaladores': 'mountain climber', 'alpinistas': 'mountain climber',
 'polichinelas': 'jumping jack', 'sentadillas': 'squat', 'dominadas': 'pull-up|chin-up|pullup', 'fondos': 'dip', 'remos': 'row', 'flexiones': 'push-up|pushup', 'curls': 'curl',
 'femoral': 'leg curl|hamstring', 'femorales': 'leg curl|hamstring', 'cuadriceps': 'leg extension|squat|leg press', 'gluteo': 'g:glutes', 'gluteos': 'g:glutes',
 'biceps': 'g:biceps', 'triceps': 'g:triceps', 'trapecio': 'shrug', 'trapecios': 'shrug', 'hombros': 'g:shoulders', 'pecho': 'g:chest',
 'espalda': 'g:back', 'pierna': 'g:legs', 'piernas': 'g:legs', 'prensa': 'leg press', 'polea': 'cable', 'mancuerna': 'dumbbell', 'mancuernas': 'dumbbell',
 'barra': 'barbell', 'pesa': 'kettlebell|dumbbell', 'liga': 'band', 'ligas': 'band', 'banda': 'band',
}
CUR = {}
def alias(eid, *names):
    if eid not in info: print('!! alias: not found', eid, file=sys.stderr); return
    CUR[eid] = list(names)
OLD = {}
def old(eid, name):
    if eid not in info: print('!! old: not found', eid, file=sys.stderr); return
    OLD[name.replace("\\'", "'").lower()] = eid
DUP = {}
def same(hidden, shown):
    if hidden not in info or shown not in info: print('!! same: not found', hidden, shown, file=sys.stderr); return
    DUP[hidden] = shown; CUR.setdefault(shown, []).append(info[hidden]['en'])
exec(open(os.path.join(ROOT, 'tools', 'exalias.py'), encoding='utf-8').read())
def norm(s): return re.sub(r'[^a-z0-9 ]', '', ''.join(c for c in __import__('unicodedata').normalize('NFD', s.lower()) if __import__('unicodedata').category(c) != 'Mn')).strip()
def exkey(r):
    return ' '.join(re.sub(r's$', '', re.sub(r'(ups|up)$', 'up', w)) for w in norm(r['en']).split()) + '|' + r['g']
def aliases(r, by_key):
    """hand-written names first, then the same exercise written another way in the library; abbreviations live in SEARCH / primero los escritos a mano y luego duplicados de la biblioteca; las abreviaturas van en SEARCH"""
    en, es = r['en'], r['es']
    seen = {norm(en), norm(es)}; out = []
    def put(x):
        k = norm(x)
        if k and k not in seen and len(out) < 5: seen.add(k); out.append(x.replace(';', ','))
    for a in CUR.get(r['id'], []): put(a)
    for o in by_key.get(exkey(r), []):
        if o['id'] != r['id']: put(o['en'])
    return ';'.join(out)

def fix_chain_difficulty():
    """the hand-written order is the truth: a later step is never rated easier than an earlier one / el orden escrito a mano manda"""
    ch = True
    while ch:
        ch = False
        for c in CHAINS:
            for x, y in zip(c, c[1:]):
                if info[y]['diff'] < info[x]['diff']: info[y]['diff'] = info[x]['diff']; ch = True

def build():
    fix_chain_difficulty()
    by_key = collections.defaultdict(list)
    for r in rows: by_key[exkey(r)].append(r)
    rel, tax, eqm, ali = {}, {}, {}, {}
    for r in rows:
        up, dn = chain_nb(r['id'])
        up = up[:3] or auto_dir(r, False)
        dn = dn[:3] or auto_dir(r, True)
        rel[r['id']] = '%s|%s|%d|%s|%s|%s|%s|%s' % (r['pat'], 'U' if r['uni'] else 'B', r['diff'], ' '.join(similar(r)), ' '.join(swaps(r)), ' '.join(up), ' '.join(dn), ' '.join(gentler(r)))
        tax[r['id']] = taxonomy(r)
        e = equipment(r)
        if any(e): eqm[r['id']] = '|'.join(e)
        a = aliases(r, by_key)
        if a: ali[r['id']] = a
    return rel, tax, eqm, ali

def js(name, d):
    key = lambda k: k if re.fullmatch(r'[A-Za-z_]\w*', k) else json.dumps(k, ensure_ascii=False)
    return 'const %s={\n' % name + ',\n'.join(" %s:%s" % (key(k), json.dumps(v, ensure_ascii=False)) for k, v in d.items()) + '\n};\n'

if __name__ == '__main__':
    rel, tax, eqm, ali = build()
    hdr1 = ("/* GENERATED by tools/gen_exrel.py: do not edit by hand / GENERADO por tools/gen_exrel.py: no lo edites a mano.\n"
            "   EXREL[id] = 'pattern|U one side at a time or B both|difficulty 1-3|similar|swaps (other equipment)|easier|harder|gentler (id:joint letters)'  ids separated by spaces\n"
            "   EXREL[id] = 'patrón|U un lado a la vez o B ambos|dificultad 1-3|parecidos|cambios (otro equipo)|más fácil|más difícil|más suave (id:letras de articulación)'\n"
            "   Computed by rules from our own muscle weights, equipment, group, names and hand-written chains (tools/exchains.py); not copied from any outside library.\n"
            "   Calculado por reglas con nuestros propios pesos musculares, equipo, grupo, nombres y cadenas escritas a mano (tools/exchains.py); no copiado de ninguna biblioteca externa. */\n")
    open(os.path.join(ROOT, 'data', 'exrel.js'), 'w', encoding='utf-8').write(hdr1 + js('EXREL', rel))
    hdr2 = ("/* GENERATED by tools/gen_exrel.py: do not edit by hand / GENERADO por tools/gen_exrel.py: no lo edites a mano.\n"
            "   EXTAX[id] = 'family|mechanic C compound I isolation|force P push L pull S static O other|plane S sagittal F frontal T transverse|position|bench angle|load type|region|flags C compound U unilateral A assisted W weighted'\n"
            "   EXEQ[id]  = 'needed|optional|support (holds you or the setup)|assistance (makes it easier or safer)'  codes separated by spaces\n"
            "   EXALI[id] = other names for the exercise, separated by ;  (shown in the guide, used by search) / otros nombres del ejercicio, separados por ;\n"
            "   EXDUP[hidden id] = id shown instead in the picker (same exercise imported twice; ids are never removed) / id que se muestra en su lugar en el selector\n"
            "   EXOLD[old english name, lowercase] = id (names renamed in the library, so old CSV exports still import) / nombres renombrados, para importar CSV viejos\n"
            "   EXSYN[typed word] = words to look for in the English name, separated by |  (search only, never shown) / EXSYN[palabra escrita] = palabras a buscar en el nombre en inglés\n"
            "   Rule-made guide, not reviewed one by one. / Guía hecha por reglas, no revisada uno por uno. */\n")
    open(os.path.join(ROOT, 'data', 'exinfo.js'), 'w', encoding='utf-8').write(hdr2 + js('EXTAX', tax) + js('EXEQ', eqm) + js('EXALI', ali) + js('EXSYN', SEARCH) + js('EXDUP', DUP) + js('EXOLD', OLD))
    sz = lambda f: os.path.getsize(os.path.join(ROOT, 'data', f))
    print('%d exercises, %d chains | exrel %d B, exinfo %d B | equipment rows %d, alias rows %d' % (len(rel), len(CHAINS), sz('exrel.js'), sz('exinfo.js'), len(eqm), len(ali)))
    for eid in sys.argv[1:]:
        a = info[eid]
        print('\n==', a['en'], '|', rel[eid]); print('  tax', tax[eid]); print('  eq ', eqm.get(eid)); print('  ali', ali.get(eid))
