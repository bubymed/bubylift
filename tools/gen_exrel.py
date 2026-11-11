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

# movement pattern: first match wins, then the group decides / patrón de movimiento: gana la primera coincidencia y luego manda el grupo
PAT = [
 ('mobility', None, lambda r: r['g'] == 'mobility'),
 ('cardio', None, lambda r: r['g'] == 'cardio'),
 ('carry', r'carry|farmer|suitcase|yoke|waiter|sled|drag|crawl', None),
 ('calf raise', r'calf|heel raise|toe raise|tibialis', None),
 ('power', r'jump|hop|bound|plyo|box jump|skater|burpee|clap|slam|throw|swing|snatch|clean|jerk|high pull|thruster|wall ball|chest pass|man maker|skip', None),
 ('rotation', r'woodchop|chop|twist|rotation|russian|landmine rot|pallof|anti-rot|windmill|turkish|iron cross|judo|car driver|wiper|figure 8|pass between', None),
 ('hip abduction', r'abduct|clamshell|hydrant|side leg|monster|lateral band|side-lying leg raise', None),
 ('hip adduction', r'adduct|copenhagen', None),
 ('hip extension', r'kick|donkey|frog pump|hip lift|butt-up|glute kick', None),
 ('knee flexion', r'leg curl|hamstring curl|nordic', None),
 ('knee extension', r'leg extension|sissy', None),
 ('hinge', r'deadlift|rdl|romanian|good morning|hip thrust|glute bridge|bridge|pull.through|hyperext|back extension|reverse hyper|stiff|hip hinge|glute ham', None),
 ('lunge', r'lunge|split squat|step-?up|step up|bulgarian|cossack|pistol|single.leg squat|skater squat', None),
 ('squat', r'squat|leg press|hack|wall sit|goblet|box squat', None),
 ('vertical pull', r'pull-?up|chin-?up|pulldown|pull-down|lat pull|muscle-up|rope climb|pullover', None),
 ('vertical push', r'overhead press|shoulder press|military|arnold|push press|handstand|pike push|landmine press|z press|cuban|bradford|bent press|kettlebell press|dip', None),
 ('horizontal push', r'bench|push-?up|chest press|fly|flye|pec deck|crossover|cross over|floor press|svend|squeeze press|chest push|incline.*press|decline.*press', None),
 ('horizontal pull', r'row|face pull|inverted|pull-apart|rear delt|reverse fly|reverse flye|y raise|t raise|low-pulley', None),
 ('core flexion', r'crunch|sit-?up|v-up|leg raise|knee raise|toe touch|ab wheel|rollout|jackknife|reverse crunch|hanging|hip raise|elbow to knee|cocoon|heel touch|flutter|pull-in|hip flexion', None),
 ('shoulder raise', r'lateral raise|front raise|raise|shrug|upright|scaption', None),
 ('arm flexion', r'curl|hammer|pronation|supination', None),
 ('arm extension', r'tricep|triceps|skull|pushdown|kickback|jm press|close.grip', None),
 ('core stability', r'plank|dead bug|bird dog|hollow|bear|stability|hold|vacuum|bracing|superman|iso-ab|side bend', None),
]
GROUP_FALL = {'chest': 'horizontal push', 'back': 'horizontal pull', 'shoulders': 'shoulder raise', 'biceps': 'arm flexion',
              'triceps': 'arm extension', 'core': 'core stability', 'glutes': 'hinge', 'legs': 'squat',
              'balance': 'balance', 'power': 'power', 'full': 'full body', 'cardio': 'cardio', 'mobility': 'mobility'}
UNI = r'single|one-arm|one arm|one-leg|one leg|unilateral|alternating|lunge|split squat|step-?up|pistol|bulgarian|cossack|suitcase|windmill|staggered|side-lying'
ADV = r'pistol|muscle-up|one-arm|one arm|handstand|planche|front lever|back lever|nordic|dragon flag|snatch|clean|jerk|iron cross|human flag|man maker|turkish|box jump.*depth|depth jump|ring|weighted pull|kipping'

def pattern(r):
    n = r['en'].lower()
    for name, rx, fn in PAT:
        if fn is not None:
            if fn(r): return name
        elif re.search(rx, n):
            return name
    if r['g'] == 'shoulders' and 'press' in n: return 'vertical push'
    return GROUP_FALL.get(r['g'], 'other')

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

def swaps(a, k=3):
    """same movement and main muscle with other equipment (if yours is missing) / mismo movimiento y músculo con otro equipo (si te falta el tuyo)"""
    if a['g'] == 'mobility': return []
    c = [(score(a, b), b['id']) for b in rows if b['id'] != a['id'] and b['pat'] == a['pat'] and b['eq'] != a['eq']
         and b['g'] == a['g'] and (b['mm'] == a['mm'] or cos(a['w'], b['w']) >= .85)]
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
FAMILY = {'horizontal push': 'push', 'vertical push': 'push', 'arm extension': 'push', 'horizontal pull': 'pull', 'vertical pull': 'pull',
          'arm flexion': 'pull', 'shoulder raise': 'shoulders', 'squat': 'legs', 'lunge': 'legs', 'hinge': 'legs', 'knee flexion': 'legs',
          'knee extension': 'legs', 'calf raise': 'legs', 'hip abduction': 'legs', 'hip adduction': 'legs', 'core flexion': 'core',
          'core stability': 'core', 'rotation': 'core', 'carry': 'full', 'power': 'full', 'full body': 'full', 'balance': 'core',
          'cardio': 'cardio', 'mobility': 'mobility', 'other': 'other'}
ISO = {'shoulder raise', 'arm flexion', 'arm extension', 'knee flexion', 'knee extension', 'calf raise', 'hip abduction', 'hip adduction', 'core flexion'}
PUSH = {'horizontal push', 'vertical push', 'arm extension', 'squat', 'lunge', 'knee extension', 'calf raise'}
PULL = {'horizontal pull', 'vertical pull', 'arm flexion', 'knee flexion', 'hinge'}
FRONTAL = r'lateral|side|abduct|adduct|cossack|jumping jack|windmill|copenhagen|clamshell|hydrant|monster|upright|y raise'
TRANSV = r'rotation|twist|chop|russian|pallof|fly|flye|pec deck|crossover|reverse fly|pull-apart|face pull|rear delt|t raise|woodchop|landmine rot'
def taxonomy(r):
    n = r['en'].lower(); pat = r['pat']; w = r['w']
    fam = FAMILY.get(pat, 'other')
    big = sum(1 for v in w.values() if v >= .5)
    mech = 'I' if (pat in ISO or (big <= 2 and pat not in ('hinge', 'squat', 'lunge', 'horizontal push', 'vertical push', 'horizontal pull', 'vertical pull'))) else 'C'
    if pat in ('mobility', 'cardio'): mech = '-'
    force = 'S' if (r['mode'] == 't' or re.search(r'\bhold|isometric|wall sit|plank|hollow|dead hang|bridge hold|l-sit|bracing', n)) else 'P' if pat in PUSH else 'L' if pat in PULL else 'O'
    plane = 'F' if re.search(FRONTAL, n) else 'T' if re.search(TRANSV, n) else 'S'
    if pat in ('hip abduction', 'hip adduction'): plane = 'F'
    if re.search(r'incline|decline', n) and pat in ('horizontal push',): plane = 'S'
    if re.search(r'hanging|pull-?up|chin-?up|dead hang|muscle-up|rope climb|toes to bar|knee raise.*hang', n): pos = 'hang'
    elif re.search(r'kneeling|half-kneeling|tall kneeling', n): pos = 'kneel'
    elif re.search(r'prone|face down|superman|reverse hyper|back extension|hyperext|bird dog|bear|push-?up|pushup|plank|mountain climber|burpee|inverted|\bdip\b', n): pos = 'prone'
    elif re.search(r'lying|supine|bench press|skull|floor press|crunch|sit-?up|bridge|hip thrust|leg raise|dead bug|hollow|pullover|fly\b|flye|on back|flat bench|incline|decline|v-up|leg curl.*lying|lying', n) and not re.search(r'seated|standing', n): pos = 'lie'
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
ABBR = [(r'\bdumbbell\b', ['DB']), (r'\bbarbell\b', ['BB']), (r'\bkettlebell\b', ['KB']), (r'\bromanian deadlift\b', ['RDL']),
        (r'\bstiff-?legged deadlift\b', ['SLDL']), (r'\boverhead press\b', ['OHP']), (r'\bsingle[- ]leg\b', ['SL']), (r'\bsingle[- ]arm\b', ['SA']),
        (r'\bez[- ]bar\b', ['EZ']), (r'\bglute[- ]ham raise\b', ['GHR'])]
SYN = [
 (r'push-?ups?\b', ['pushup', 'press-up', 'lagartijas', 'flexiones de brazos', 'planchas de pecho']),
 (r'pull-?ups?\b', ['pullup', 'chin up', 'dominadas']),
 (r'chin-?ups?\b', ['chinup', 'dominadas supinas']),
 (r'\bdips?\b', ['fondos', 'parallel bar dip']),
 (r'\blunges?\b', ['zancadas', 'estocadas', 'desplantes']),
 (r'\bsquats?\b', ['sentadillas', 'cuclillas']),
 (r'deadlift', ['peso muerto', 'dead lift']),
 (r'romanian', ['rumano', 'RDL']),
 (r'\bshrugs?\b', ['encogimientos', 'trapezio']),
 (r'calf raise', ['gemelos', 'pantorrillas', 'talones', 'heel raise']),
 (r'sit-?ups?\b', ['abdominales', 'situps']),
 (r'crunch', ['abdominales', 'encogimiento abdominal']),
 (r'\bplank\b', ['plancha', 'isométrico abdominal']),
 (r'bench press', ['press de banca', 'press banco plano', 'press pecho']),
 (r'hip thrust', ['empuje de cadera', 'puente de glúteo con barra']),
 (r'glute bridge', ['puente de glúteos', 'elevación de cadera']),
 (r'pulldown|pull-down', ['jalón al pecho', 'jalones', 'lat pulldown']),
 (r'\brows?\b', ['remo', 'remos']),
 (r'\bfly\b|flye|flies', ['aperturas', 'cruces']),
 (r'lateral raise', ['elevaciones laterales', 'vuelos laterales', 'side raise']),
 (r'front raise', ['elevaciones frontales']),
 (r'skull ?crusher', ['rompecráneos', 'press francés', 'extensión de tríceps acostado']),
 (r'tricep', ['tríceps']),
 (r'bicep', ['bíceps']),
 (r'kickback', ['patada', 'patada de tríceps']),
 (r'leg curl', ['curl femoral', 'flexión de pierna', 'isquiotibiales']),
 (r'leg extension', ['extensión de cuádriceps', 'extensión de pierna']),
 (r'leg press', ['prensa de pierna', 'prensa']),
 (r'overhead press|shoulder press|military press', ['press militar', 'press de hombro', 'press arriba']),
 (r'face pull', ['jalón a la cara', 'face pulls']),
 (r'good morning', ['buenos días']),
 (r'pullover', ['pull over', 'pullover']),
 (r'burpee', ['burpees']),
 (r'jumping jack', ['saltos de tijera', 'polichinelas']),
 (r'mountain climber', ['escaladores', 'alpinista']),
 (r'step-?up', ['subidas al cajón', 'subir banco']),
 (r'farmer', ['paseo del granjero', 'cargada']),
 (r'wall sit', ['sentadilla en pared', 'silla en la pared']),
 (r'bird dog', ['perro de caza', 'bird-dog']),
 (r'dead bug', ['bicho muerto']),
 (r'russian twist', ['giro ruso', 'torsión rusa']),
 (r'woodchop|wood chop', ['leñador', 'hachazo']),
 (r'hammer curl', ['curl martillo']),
 (r'preacher', ['predicador', 'banco scott']),
 (r'upright row', ['remo al mentón', 'remo vertical']),
 (r'clamshell', ['almeja', 'concha']),
 (r'nordic', ['curl nórdico', 'nordic curl']),
 (r'turkish get', ['levantamiento turco', 'get up turco']),
]
EN_ALT = {'pushup', 'press-up', 'pullup', 'chin up', 'chinup', 'parallel bar dip', 'dead lift', 'RDL', 'heel raise', 'situps', 'lat pulldown', 'side raise',
          'pull over', 'pullover', 'face pulls', 'burpees', 'bird-dog', 'nordic curl'}
def norm(s): return re.sub(r'[^a-z0-9 ]', '', ''.join(c for c in __import__('unicodedata').normalize('NFD', s.lower()) if __import__('unicodedata').category(c) != 'Mn')).strip()
def exkey(r):
    return ' '.join(re.sub(r's$', '', re.sub(r'(ups|up)$', 'up', w)) for w in norm(r['en']).split()) + '|' + r['g']
def aliases(r, by_key):
    en, es = r['en'], r['es']
    seen = {norm(en), norm(es)}; out = []
    def put(x):
        k = norm(x)
        if k and k not in seen and len(out) < 5: seen.add(k); out.append(x.replace(';', ','))
    for rx, ab in ABBR:
        if re.search(rx, en, re.I):
            for a in ab: put(re.sub(rx, a, en, count=1, flags=re.I))
    for rx, alt in SYN:
        if re.search(rx, en, re.I):
            for a in alt[:3]:
                if a in EN_ALT: put(re.sub(rx, a, en, count=1, flags=re.I))
                else:
                    if ' ' not in a and norm(a)[:6] in norm(es): continue
                    put(a)
    # the same exercise written differently in the library / el mismo ejercicio escrito distinto en la biblioteca
    for o in by_key.get(exkey(r), []):
        if o['id'] != r['id']: put(o['en'])
    return ';'.join(out)

def build():
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
    return 'const %s={\n' % name + ',\n'.join(" %s:%s" % (k, json.dumps(v, ensure_ascii=False)) for k, v in d.items()) + '\n};\n'

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
            "   EXALI[id] = other names for the exercise, separated by ;  (used by search) / otros nombres del ejercicio, separados por ;  (los usa la búsqueda)\n"
            "   Rule-made guide, not reviewed one by one. / Guía hecha por reglas, no revisada uno por uno. */\n")
    open(os.path.join(ROOT, 'data', 'exinfo.js'), 'w', encoding='utf-8').write(hdr2 + js('EXTAX', tax) + js('EXEQ', eqm) + js('EXALI', ali))
    sz = lambda f: os.path.getsize(os.path.join(ROOT, 'data', f))
    print('%d exercises, %d chains | exrel %d B, exinfo %d B | equipment rows %d, alias rows %d' % (len(rel), len(CHAINS), sz('exrel.js'), sz('exinfo.js'), len(eqm), len(ali)))
    for eid in sys.argv[1:]:
        a = info[eid]
        print('\n==', a['en'], '|', rel[eid]); print('  tax', tax[eid]); print('  eq ', eqm.get(eid)); print('  ali', ali.get(eid))
