#!/usr/bin/env python3
"""Generates data/musc.js: which muscle subgroups each exercise trains (weights 0-1), for the recovery map.
Rules run top to bottom on the English name; the first match wins. Run: python3 tools/gen_musc.py
Genera data/musc.js: qué subgrupos musculares trabaja cada ejercicio (pesos 0-1), para el mapa de recuperación.
Las reglas se aplican de arriba abajo sobre el nombre en inglés; gana la primera que coincida."""
import re,json,subprocess,sys,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
SUBS={'chest':['chu','chm'],'back':['lat','ubk','trp','lbk'],'shoulders':['sdf','sdl','sdr'],'biceps':['bic','frm'],'triceps':['trl','trm'],'legs':['qd','ham','clf','add'],'glutes':['gmx','gmd'],'core':['abs','obl']}
# base recovery hours per subgroup / horas base de recuperación por subgrupo
BASE={'chu':48,'chm':48,'lat':60,'ubk':48,'trp':48,'lbk':72,'sdf':48,'sdl':36,'sdr':36,'bic':48,'frm':24,'trl':48,'trm':48,'qd':60,'ham':72,'clf':24,'add':48,'gmx':60,'gmd':36,'abs':36,'obl':36}
# group default when no rule matches / valor por defecto del grupo
DEF={'chest':'chm1 chu.4 trm.4 sdf.3','back':'lat1 ubk.6 bic.4 lbk.2','shoulders':'sdf.8 sdl.8 trm.4','biceps':'bic1 frm.4','triceps':'trm1 trl.6','legs':'qd1 gmx.5 ham.3','glutes':'gmx1 gmd.4 ham.3','core':'abs1 obl.4','full':'qd.5 gmx.5 lbk.4 ubk.4 sdf.3 abs.3','power':'qd.6 gmx.5 clf.3','balance':'qd.6 gmx.5 gmd.5 clf.3 abs.2'}
SKIP={'mobility','cardio'}
CLEAN='gmx1 qd.9 ham.7 trp.8 lbk.5 ubk.4 sdf.3 bic.3'
SNATCH='gmx1 qd.8 ham.8 trp.8 sdl.6 sdf.6 lbk.5 trm.3'
SWING='gmx1 ham.8 lbk.5 qd.4 sdf.3 abs.3 ubk.3 frm.4'
RDL='ham1 gmx.8 lbk.6 frm.3 trp.2'
SQ='qd1 gmx.7 add.4 ham.3 lbk.3 abs.3'
LUNGE='qd1 gmx.8 gmd.5 add.3 ham.4'
PRESS='sdf1 sdl.7 trm.7 trl.3 trp.3 abs.2'
BENCH='chm1 chu.5 trm.7 sdf.5'
OHEXT='trl1 trm.6'
RULES=[
 # ---- olympic / kettlebell / power (all groups) ----
 (r'snatch balance|heaving snatch',None,'qd.7 gmx.5 sdf.6 sdl.6 trp.5 abs.6 ubk.4 trm.4'),
 (r'snatch shrug',None,'trp1 gmx.6 ham.5 qd.4 frm.4'),
 (r'snatch (pull|deadlift)',None,'gmx1 ham.9 trp.8 qd.7 lbk.6 ubk.4 frm.4'),
 (r'snatch',None,SNATCH),
 (r'clean and (press|jerk)',None,CLEAN+' sdf.9 trm.6'),
 (r'jerk dip|squat jerk',None,'qd.9 gmx.6 sdf.8 trm.7 sdl.5 abs.4'),
 (r'jerk|push press|rack delivery',None,'qd.5 gmx.3 sdf1 sdl.7 trm.7 trp.3 abs.3'),
 (r'clean shrug',None,'trp1 gmx.6 ham.5 qd.4 frm.4'),
 (r'clean (pull|deadlift)',None,'gmx1 ham.9 trp.8 qd.7 lbk.6 ubk.4 frm.4'),
 (r'clean(?! grip)',None,CLEAN),
 (r'swing|vertical swing',None,SWING),
 (r'high pull(?!ey)',None,'gmx.6 ham.5 trp.8 sdl.6 qd.5 lbk.4 ubk.4'),
 (r'thruster|wall ball|man maker',None,'qd1 gmx.7 sdf.8 trm.6 sdl.5 abs.4 chm.3'),
 (r'turkish get',None,'sdf.6 sdl.4 abs.6 obl.6 gmx.5 qd.4 trm.3'),
 (r'frankenstein squat',None,'qd1 gmx.6 abs.6 ubk.3'),
 (r'burpee.*jump|jump.*burpee',None,'qd.8 gmx.6 clf.5 chm.4 trm.3 sdf.3 abs.4'),
 (r'burpee',None,'qd.7 gmx.5 chm.6 trm.5 sdf.4 abs.5 clf.3'),
 (r'battle rope',None,'sdf.7 sdl.7 abs.5 bic.4 frm.6 lat.4 ubk.3 obl.3 trp.3'),
 (r'bear crawl',None,'sdf.7 chm.4 trm.4 qd.7 abs.7 obl.3'),
 (r'inchworm',None,'ham.6 sdf.5 abs.6 chm.3 trm.3 clf.3'),
 (r'low crawl',None,'sdf.5 chm.4 abs.7 qd.4 lat.3 gmx.3'),
 (r"farmer|suitcase carry|fireman carry|sprint-drag-carry",None,'trp1 frm1 abs.5 obl.6 gmd.5 qd.4 gmx.4 lbk.4 ubk.4'),
 (r'sled drag',None,'ham.7 gmx.7 qd.6 clf.5 abs.3 lbk.3 ubk.3'),
 (r'sled push|prowler',None,'qd1 gmx.7 clf.5 ham.3 abs.3 sdf.3 trm.3'),
 (r'medicine ball slam|overhead slam|one-arm medicine ball slam',None,'abs.8 lat.7 sdf.5 trm.4 obl.4 qd.3'),
 (r'overhead throw|soccer throw|catch and overhead|scoop throw|backward medicine ball|medicine ball overhead',None,'lat.7 sdf.7 trl.5 abs.7 obl.4 qd.3 gmx.3'),
 (r'chest push|chest throw|chest pass|supine .*throw|return push',None,'chm.9 trm.6 sdf.5 chu.3'),
 (r'medicine ball (rotation|woodchop|full twist)',None,'obl1 abs.6 sdf.3 gmd.3 qd.3'),
 (r'plyo.*push|plyometric push',None,'chm1 trm.7 sdf.5 chu.4 abs.3'),
 (r'isometric chest squeeze',None,'chm.8 chu.3 sdf.2'),
 (r'kneeling arm drill|linear acceleration wall|single leg push-off|3-part start',None,'sdf.4 sdl.3 qd.5 gmx.4 abs.3 clf.3'),
 # ---- generic jumps / drills (power) ----
(r'push-up depth jump',None,'chm1 trm.7 sdf.5 chu.4 abs.3'),
 (r'lateral (bound|box|cone|hop)|skater|side hop|side standing|side to side box|single-leg lateral',None,'gmd.8 qd.7 gmx.6 add.5 clf.4'),
 (r'lunge jump|split jump|scissors jump',None,'qd1 gmx.8 gmd.4 ham.3 clf.3'),
 (r'jumping jack',['power'],'clf1 qd.6 gmd.5 sdl.5 gmx.4'),
 (r'butt kick',['power'],'ham1 qd.3 clf.4 gmx.4 abs.3'),
 (r'high knees',['power'],'qd1 clf.5 abs.5 gmx.3 ham.3'),
 (r'jump|hop|bound|leap|skip|squat jump|rocket|star jump|bench sprint',['power'],'qd.9 gmx.7 clf.6 ham.3'),
 (r'ladder|cone|shuttle|carioca|fast skip|stride jump|double leg butt',['power'],'qd1 clf.8 ham.5 gmx.5 gmd.4 abs.3'),
 (r'olympic squat',['power'],'qd1 gmx.7 ham.4 clf.4 abs.3'),
 (r'sprint|quick leap',['power'],'ham.8 gmx.7 qd.7 clf.6 abs.3'),
 (r'mountain climber',None,'abs.8 obl.4 sdf.4 qd.3'),
 (r'moving claw',['power'],'qd.6 gmx.5 clf.4 ham.4'),
 (r'romanian deadlift from deficit|wide stance stiff',None,RDL),
 # ---- chest ----
 (r'dip',['chest'],'chm1 trm.8 trl.6 sdf.5'),
 (r'iron cross',['chest'],'chm1 lat.5 sdf.2'),
 (r'pullover',['chest'],'lat1 chm.9 trl.4 abs.2'),
 (r'svend',['chest'],'chm1 chu.6 sdf.3'),
 (r'(decline|feet.*(on|elevated)|feet-elevated).*push|push.*feet (elevated|on)',['chest'],'chu1 chm.7 sdf.5 trm.5 abs.2'),
 (r'incline.*push|push.*incline',['chest'],'chm1 chu.3 trm.6 sdf.3 abs.2'),
 (r'push-?up|pushup|single-arm push|push up',['chest'],'chm1 chu.5 trm.6 sdf.4 abs.2'),
 (r'low cable crossover',['chest'],'chu1 chm.5 sdf.3'),
 (r'incline.*(fl[yi]e|fly)|incline cable fl',['chest'],'chu1 chm.5 sdf.2'),
 (r'fl[yi]e|fly|cross ?over|pec deck|butterfly|around the world',['chest'],'chm1 chu.5 sdf.2'),
 (r'neck press|guillotine',['chest'],'chu1 chm.6 sdf.5 trm.5'),
 (r'incline',['chest'],'chu1 chm.5 trm.6 sdf.6'),
 (r'decline|dips',['chest'],'chm1 chu.2 trm.7 sdf.3'),
 (r'chest pass',['chest'],'chm.9 trm.6 sdf.5'),
 (r'press|bench|floor',['chest'],BENCH),
 # ---- back ----
 (r'good morning',['back','legs'],'ham1 lbk.9 gmx.6 abs.2'),
 (r'rack pull',None,'lbk.9 trp.9 ubk.6 gmx.6 ham.4 lat.4 frm.5'),
 (r'deadlift',['back'],'lbk1 ham.8 gmx.8 trp.6 lat.4 ubk.4 qd.4 frm.4'),
 (r'hyperext|back extension|superman',['back'],'lbk1 gmx.5 ham.5'),
 (r'face pull',None,'sdr1 ubk.8 trp.4 sdl.3'),
 (r'upright (cable )?row',None,'sdl1 trp.8 sdf.4 bic.3'),
 (r'shrug',['back'],'trp1 ubk.4 frm.4'),
 (r'middle back shrug',['back'],'ubk1 trp.6'),
 (r'renegade',None,'lat1 ubk.9 abs.8 obl.5 sdf.3 chm.3 bic.3'),
 (r'scapular pull',['back'],'ubk.8 lat.6 trp.4'),
 (r'muscle up',['back'],'lat1 bic.6 trm.5 chm.4 ubk.5'),
 (r'\bchin|underhand|reverse grip pulldown|gironda',['back'],'lat1 bic.8 ubk.5 frm.3'),
 (r'straight-arm|pullover|incline pushdown',['back'],'lat1 trl.4 chm.3 abs.2'),
 (r'pull-?ups?|pull ups?|pullup|pulldown|pull-down|lat pull|rocky',['back'],'lat1 ubk.5 bic.6 frm.3 sdr.2'),
 (r'inverted|suspended row|suspension|bodyweight mid row',['back'],'ubk1 lat.7 bic.6 sdr.5 abs.3'),
 (r'high row|high pulley|leverage iso|leverage high',['back'],'lat1 ubk.9 bic.4 sdr.3'),
 (r'bent over|bent-over|barbell row|t-bar|long bar|lying cambered|shotgun|reverse grip',['back'],'ubk1 lat.8 bic.5 sdr.5 lbk.6 trp.4 frm.3'),
 (r'elevated cable row',['back'],'lat1 ubk.9 bic.5 sdr.5 trp.4 frm.3'),
 (r'row',['back'],'ubk1 lat.8 bic.5 sdr.5 lbk.2 trp.4 frm.3'),
 (r'bench pull|incline row',['back'],'ubk1 lat.7 sdr.5 bic.4'),
 (r'kipping',['back'],'lat1 bic.6 abs.5 ubk.5'),
 # ---- shoulders ----
 (r'external rotation|cuban rotation',['shoulders'],'sdr1 ubk.2 sdl.3'),
 (r'internal rotation',['shoulders'],'sdr1 sdf.4 chm.2'),
 (r'isometric neck',['shoulders'],'trp1 ubk.3'),
 (r'halo',['shoulders'],'sdf.6 sdl.6 sdr.5 trl.3 abs.3 obl.3'),
 (r'pirate',['shoulders'],'sdf.6 sdl.6 sdr.4 obl.3'),
 (r'car drivers',['shoulders'],'sdf.7 sdl.5 sdr.3 frm.3 abs.2'),
 (r'linear jammer|landmine',['shoulders'],'qd.5 gmx.4 sdf1 trm.6 abs.3'),
 (r'rear|reverse (machine )?fl|back flyes|pull-apart|bent over low pulley|rear delt|rear lateral',['shoulders'],'sdr1 ubk.6 trp.3 sdl.3'),
 (r'barbell rear delt row|rear-delt rows|row to neck',['shoulders'],'sdr1 ubk.7 lat.3 bic.3 trp.4'),
 (r'handstand|pike',['shoulders'],'sdf1 sdl.6 trm.7 chu.4 abs.2'),
 (r'behind neck|behind the neck',['shoulders'],'sdl1 sdf.7 sdr.3 trm.7 trp.3'),
 (r'arnold',['shoulders'],'sdf1 sdl.8 sdr.2 trm.6 trl.2 trp.3'),
 (r'press|raise.*incline.*shoulder|power partials|anti-gravity|bradford|thruster',['shoulders'],PRESS),
 (r'front|incline shoulder raise|straight raises|scaption|raise.*above head',['shoulders'],'sdf1 chu.4 sdl.2'),
 (r'lateral|side laterals|deltoid raise|side raise|dumbbell raise|single dumbbell raise',['shoulders'],'sdl1 trp.3 sdf.2'),
 (r'.',['shoulders'],'sdf.8 sdl.8 trm.4'),
 # ---- biceps ----
 (r'wrist|finger curl|pronation|supination|wrist rotation',['biceps'],'frm1'),
 (r'reverse|plate curl',['biceps'],'frm1 bic.6'),
 (r'zottman',['biceps'],'bic1 frm.7'),
 (r'hammer|cross body hammer',['biceps'],'bic1 frm.7'),
 (r'bottoms-up clean',['biceps'],'bic.5 frm.6 trp.5 gmx.4 qd.3'),
 (r'.',['biceps'],'bic1 frm.4'),
 # ---- triceps ----
 (r'^(?!.*close)(?!.*reverse triceps).*bench press|reverse band bench',['triceps'],'chm1 chu.5 trm.8 sdf.5'),
 (r'push-?up|diamond',['triceps'],'trm1 chm.7 sdf.4 trl.4 abs.2'),
 (r'dip|body-up|body tricep',['triceps'],'trm1 trl.7 chm.5 sdf.4'),
 (r'tate',['triceps'],'trm1 trl.5'),
 (r'jm press',['triceps'],'trm1 chm.5 trl.5'),
 (r'pushdown|push-down|low cable|low-pulley|kneeling cable|pulley one-arm',['triceps'],'trm1 trl.5'),
 (r'kickback',['triceps'],'trm1 trl.6'),
 (r'bent-over|bent over',['triceps'],'trl.8 trm.8'),
 (r'overhead|behind the head|incline|seated triceps|skull|lying|decline|extension|towel|french',['triceps'],OHEXT),
 (r'close-grip|floor press|board press|pin press|close grip|reverse triceps',['triceps'],'trm1 chm.6 chu.3 sdf.4 trl.5'),
 (r'.',['triceps'],'trm1 trl.6'),
 # ---- legs ----
 (r'plie|sumo(?! deadlift)|wide stance|side split',['legs'],'qd1 gmx.8 add.7 ham.3'),
 (r'sumo deadlift|leverage deadlift|one-arm side deadlift|reverse band sumo',None,'qd.7 gmx.9 add.7 ham.6 lbk.7 trp.4 frm.4 ubk.3'),
 (r'cable deadlift|kettlebell deadlift',None,'gmx.9 ham.8 qd.6 lbk.6 trp.3 frm.4'),
 (r'hyperextension|reverse hyper',['legs'],'gmx1 ham.7 lbk.8'),
 (r'glute.?ham',['legs'],'ham1 gmx.6 lbk.4 clf.3'),
 (r'hamstring slide|prone manual hamstring',['legs'],'ham1 gmx.4 abs.3'),
 (r'leg curl|hamstring curl',['legs'],'ham1 clf.3'),
 (r'leg extension',['legs'],'qd1'),
 (r'good morning',['legs'],'ham1 lbk.9 gmx.7 abs.3'),
 (r'romanian|stiff|deadlift|pull through|one-legged deadlift',['legs'],RDL),
 (r'calf|donkey',['legs'],'clf1'),
 (r'abduct',['legs'],'gmd1 gmx.3'),
 (r'copenhagen',None,'add1 obl.5 abs.4 gmd.3'),
 (r'sumo squat',None,'qd1 gmx.8 add.7 ham.3 lbk.2'),
 (r'adduct',['legs'],'add1'),
 (r'monster walk',['legs'],'gmd1 gmx.5 qd.3'),
 (r'hip flexion',['legs'],'qd.5 abs.5'),
 (r'jump squat',['legs'],'qd1 gmx.7 clf.5 ham.3'),
 (r'overhead.*squat|squat.*overhead',['legs'],'qd1 gmx.6 sdf.5 trm.4 abs.6 ubk.5 trp.4'),
 (r'squat to row',['legs'],'qd.8 gmx.6 ubk.6 lat.5 bic.3'),
 (r'squat to press',['legs'],'qd.8 gmx.6 sdf.6 trm.4'),
 (r'zercher',['legs'],'qd1 gmx.8 lbk.5 abs.5 add.4 bic.4 ubk.3'),
 (r'jefferson',['legs'],'qd.9 gmx.8 add.6 lbk.5 abs.3'),
 (r'front squat|front barbell squat',['legs'],'qd1 gmx.6 add.3 ham.2 ubk.3 abs.4 lbk.3'),
 (r'box squat|squat to a bench|bench squat|speed squat',['legs'],'qd1 gmx.9 ham.5 add.5 lbk.3'),
 (r'sissy',['legs'],'qd1 abs.3'),
 (r'pistol|single-leg squat|one leg barbell squat|single-leg high box',['legs'],'qd1 gmx.8 gmd.6 add.3'),
 (r'lateral lunge|lateral step|side lunge',['legs'],'add.8 qd.8 gmx.6 gmd.5'),
 (r'lunge sprint|lunge pass|rotational lunge',['legs'],'qd.9 gmx.7 abs.3 gmd.4'),
 (r'reverse lunge|rear lunge|back lunge',['legs'],'gmx.9 qd.9 ham.4 gmd.4'),
 (r'lunge|split squat|step-?up|step ups',['legs'],LUNGE),
 (r'leg press|hack|lying machine squat',['legs'],'qd1 gmx.6 add.4 ham.3'),
 (r'narrow stance',['legs'],'qd1 gmx.4 add.2'),
 (r'wall squat|bodyweight squat|chair squat|goblet|dumbbell squat|half-ball',['legs'],'qd1 gmx.6 add.3 abs.3'),
 (r'barbell|squat|back squat',['legs'],'qd1 gmx.8 add.5 ham.4 lbk.4 abs.3'),
 (r'one-arm overhead kettlebell squat',['legs'],'qd1 gmx.6 sdf.6 abs.5 obl.5 trm.3'),
 (r'hip adduction|band hip add',['legs'],'add1'),
 # ---- glutes ----
 (r'single-leg glute bridge|single leg',['glutes'],'gmx1 gmd.5 ham.5 abs.2'),
 (r'thrust|bridge|frog pump|butt lift|hip lift|hip extension',['glutes'],'gmx1 ham.5 gmd.2 abs.2'),
 (r'kickback|donkey|leg lift',['glutes'],'gmx1 ham.3 gmd.3'),
 (r'hydrant|clamshell|band walk|lateral',['glutes'],'gmd1 gmx.4'),
 (r'sumo',['glutes'],'qd.7 gmx.9 add.7 ham.6 lbk.7 trp.4 frm.4'),
 (r'pull through',['glutes'],'gmx1 ham.8 lbk.4'),
 (r'flutter',['glutes'],'abs1 qd.4 gmx.3'),
 (r'step-up with knee',['glutes'],'qd.8 gmx.8 gmd.4 abs.3'),
 (r'kneeling squat',['glutes'],'gmx1 qd.4'),
 (r'kettlebell deadlift',['glutes'],'gmx.9 ham.8 qd.6 lbk.6 trp.3 frm.4'),
 # ---- core ----
 (r'side plank|side bridge',['core'],'obl1 gmd.6 abs.4 sdf.3'),
 (r'bird dog',['core'],'lbk.6 gmx.5 abs.5 obl.3 sdr.2'),
 (r'dead bug|hollow|prone iso|v-up',['core'],'abs1 obl.3 qd.3'),
 (r'plank|spider crawl',['core'],'abs1 obl.5 sdf.3 gmx.3 qd.2'),
 (r'fallout',['core'],'abs1 lat.4 sdf.3'),
 (r'rollout|ab wheel|rollout',['core'],'abs1 lat.5 sdf.4 obl.3 trl.3'),
 (r'pallof',['core'],'obl1 abs.6 sdf.2'),
 (r'windmill',['core'],'obl1 abs.4 gmx.4 ham.4 sdf.4 lbk.3'),
 (r'wood ?chop|chop|cable lift|standing cable lift|medicine ball (rotation|woodchop)',['core'],'obl1 abs.5 sdf.4 gmd.2 qd.2'),
 (r'twist|rotation|side bend|landmine 180|judo|spell caster|oblique|bicycle|cross-body|elbow to knee|heel touch',['core'],'obl1 abs.6'),
 (r'carry',['core'],'obl1 abs.6 trp.8 frm.8 gmd.5 lbk.5'),
 (r'figure 8|pass between',['core'],'abs.5 obl.5 gmx.3 ham.3 frm.3'),
 (r'bent press',['core'],'obl1 sdf.5 sdl.4 abs.5 gmx.3'),
 (r'wind sprint',['core'],'qd.6 gmx.5 clf.4 abs.3'),
 (r'slam',['core'],'abs.8 lat.6 sdf.5 obl.5 trm.3'),
 (r'gorilla',['core'],'abs1 frm.4 lat.4 bic.3'),
 (r'hanging|knee/hip raise|leg raise|knee raise|pike',['core'],'abs1 qd.5 frm.4 obl.2'),
 (r'mountain climb',['core'],'abs.8 obl.4 sdf.4 qd.3'),
 (r'crunch|sit-?up|reverse|pull-in|tuck|hip raise|cocoon|butt-ups|air bike',['core'],'abs1 obl.2 qd.2'),
 (r'step-up',['power'],'qd1 gmx.8 gmd.4 clf.3'),
 # ---- balance ----
 (r'reach|windmill|toe touch|rdl',['balance'],'ham1 gmx.8 gmd.5 lbk.4 clf.3 abs.2'),
 (r'curl to press',['balance'],'qd.8 gmx.6 sdf.7 bic.8 gmd.5 abs.3'),
 (r'squat|lunge|step-up|step up',['balance'],'qd1 gmx.7 gmd.5 clf.3 abs.2'),
 (r'hop',['balance'],'qd1 gmx.7 gmd.6 clf.6 abs.3'),
 (r'balance|pose|stance|tandem',['balance'],'gmd1 clf.6 qd.4 gmx.4 abs.3'),
]
def weights(eid,name,g):
    if g in SKIP:return None
    n=name.lower()
    for rx,gs,w in RULES:
        if gs and g not in gs:continue
        if re.search(rx,n):return w
    return DEF.get(g)
def topd(d):
    t=max(d.values())
    return d if t>=.9 else {k:round(v/t,2) for k,v in d.items()}  # top muscle is always main (>= .9), others scale with it
def topw(w):
    d=topd(norm(w));return ' '.join('%s%s'%(k,('%g'%v).lstrip('0')) for k,v in d.items())
def norm(w):
    out={}
    for p in w.split():
        m=re.match(r'^([a-z]+)([\d.]+)$',p);out[m.group(1)]=float(m.group(2))
    return out
def main():
    ex=json.loads(subprocess.check_output(['node','-e',r"""
global.window=global;const fs=require('fs');
let src=fs.readFileSync('data/exercises.js','utf8').replace(/^const EXLIB=/m,'var EXLIB=').replace(/^const /mg,'var ');
let s2=fs.readFileSync('data/exercises2.js','utf8');
const f=new Function(src+';'+s2+';return EXLIB');
console.log(JSON.stringify(f()));"""],cwd=R).decode())
    lines=[];unk=0
    for e in ex:
        w=weights(e[0],e[1],e[3])
        if w is None:continue
        d=topd(norm(w))  # every exercise has a main muscle / todo ejercicio tiene músculo principal
        lines.append(" %s:'%s'"%(e[0],' '.join('%s%s'%(k,('%g'%v).lstrip('0')) for k,v in d.items())))
    out="""/* Muscle map for the recovery view (v1.1.47): which subgroup each exercise trains and how much (1 = main, .5 = helper).
   Generated by tools/gen_musc.py from the exercise names; edit the rules there, not this file. Exercises without an entry fall back to their group.
   Mapa muscular para la vista de recuperación (v1.1.47): qué subgrupo trabaja cada ejercicio y cuánto (1 = principal, .5 = ayuda).
   Generado por tools/gen_musc.py a partir de los nombres; edita las reglas allí, no este archivo. Los ejercicios sin entrada usan su grupo.

   Muscle codes / Códigos de músculo:
   chu upper chest / pecho superior · chm mid+lower chest / pecho medio e inferior · lat lats / dorsales · ubk upper back / espalda alta
   trp traps / trapecios · lbk lower back / espalda baja · sdf front delts / deltoides frontal · sdl side delts / lateral · sdr rear delts / posterior
   bic biceps / bíceps · frm forearms / antebrazos · trl triceps long head / tríceps cabeza larga · trm triceps side+inner / tríceps lateral e interna
   qd quads / cuádriceps · ham hamstrings / isquiotibiales · clf calves / pantorrillas · add adductors / aductores
   gmx glute max / glúteo mayor · gmd side glutes / glúteo medio · abs abs / abdominales · obl obliques / oblicuos
   Weight bands (anatomy.js anaRoles): >= .9 main (agonist) · .5-.8 helper (synergist) · < .5 stabilizer. Every exercise has at least one main muscle.
   Bandas de peso (anatomy.js anaRoles): >= .9 principal (agonista) · .5-.8 ayuda (sinergista) · < .5 estabilizador. Todo ejercicio tiene al menos un músculo principal. */
const MUS_SUB=%s;
const MUS_BASE=%s;
const MUS_DEF=%s;
const EXMU={
%s
};
"""%(json.dumps(SUBS,separators=(',',':')),json.dumps(BASE,separators=(',',':')),json.dumps({g:topw(DEF[g]) for g in DEF},separators=(',',':')),",\n".join(lines))
    open(os.path.join(R,'data','musc.js'),'w').write(out)
    print(len(lines),'exercises mapped')
main()
