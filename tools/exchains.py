# Progression chains, easiest -> hardest. Hand-written; ids must exist (tools/gen_exrel.py warns if not).
# Cadenas de progresión, de la más fácil a la más difícil. Escritas a mano; los ids deben existir (tools/gen_exrel.py avisa si no).
# An exercise can sit in several chains (e.g. the push-up leads to harder strength AND harder power versions).
# Un ejercicio puede estar en varias cadenas (p. ej. la flexión lleva a versiones más difíciles de fuerza Y de potencia).
# push-ups / flexiones
chain('incpush', 'pushup', 'decpush', 'z_single_arm_push_up')
chain('kneepush', 'pushup', 'diamondpu', 'plyopush')
chain('pushup', 'hrpushup')
chain('pikepush', 'z_handstand_push_ups')
# chest press / press de pecho
chain('chestpress', 'dbbench', 'bench')
chain('benchdip', 'dip', 'z_ring_dips')
# pulling / jalones y dominadas
chain('latpd', 'assistpu', 'pullup', 'z_one_arm_chin_up')
chain('z_band_assisted_pull_up', 'chinup', 'pullup')
chain('cablerow', 'bentrow', 'bbrow')
chain('invrow', 'z_inverted_row_with_straps')
# squat / sentadilla
chain('z_chair_squat', 'bodysq', 'gobsq', 'squat', 'frontsq', 'overheadsq')
chain('splitsq', 'bulgsplit', 'slsquat', 'z_kettlebell_pistol_squat')
chain('bwlunge', 'revlunge', 'lunge', 'z_barbell_lunge')
# hinge and glutes / bisagra y glúteos
chain('glutebr', 'hipthrust')
chain('glutebr', 'slbridge')
chain('kbdl', 'hexdl', 'deadlift', 'z_deficit_deadlift')
chain('dbrdl', 'rdl', 'sldl')
# core
chain('deadbug', 'plank', 'hollow', 'abwheel')
chain('plank', 'ballplank')
chain('sideplank', 'copenhagen')
chain('crunch', 'revcrunch', 'kneeup', 'legraise')
# shoulders / hombros
chain('machsp', 'dbohp', 'ohp')
# calves / pantorrillas
chain('z_calf_raises_with_bands', 'calf', 'calfdb')
chain('seatcalf', 'calf')
# biceps / bíceps
chain('bandcurl', 'dbcurl', 'bbcurl')
chain('dbcurl', 'inccurl')
chain('dbcurl', 'hammer')
# triceps / tríceps
chain('bandpd', 'pushdown', 'ohext')
chain('kickback', 'lyingext', 'skull')
chain('pushdown', 'ropepd')
# shoulders: raises / hombros: elevaciones
chain('bandlat', 'latraise', 'cablelat')
chain('latraise', 'frontraise')
chain('shrug', 'z_barbell_shrug')
chain('z_reverse_flyes', 'reardelt', 'revfly')
# legs / piernas
chain('legext', 'z_single_leg_leg_extension')
chain('legpress', 'z_narrow_stance_leg_press')
chain('legcurl', 'seatlc')
chain('bwstepup', 'stepup', 'z_barbell_step_ups')
chain('stepup', 'balstepup')
chain('bwstepup', 'powerstep')
chain('z_band_good_morning', 'goodmorn', 'z_good_morning_off_pins')
chain('z_hyperextensions_with_no_hyperexten', 'z_weighted_ball_hyperextension')
# power / potencia
chain('squatjump', 'tuckjump')
chain('bodysq', 'squatjump', 'boxjump', 'depthjump')
chain('lungejump', 'skaterjump')
chain('burpee', 'bbj')
chain('kbswing', 'z_one_arm_kettlebell_swings')
chain('kbswing', 'kbclean', 'z_one_arm_kettlebell_snatch')
chain('dbthruster', 'thruster')
# core / abdomen
chain('crunch', 'situp', 'z_jackknife_sit_up')
chain('crunch', 'bicycle')
chain('crunch', 'cablecr')
chain('russian', 'z_cable_russian_twists')
chain('pallof', 'z_pallof_press_with_rotation')
# shoulders: press / press
chain('dbohp', 'arnold')
chain('dbohp', 'thruster')
# chest / pecho
chain('dbfly', 'cablefly')
chain('dbbench', 'z_decline_dumbbell_flyes')
