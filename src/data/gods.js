/* ---------- Dioses ----------
 pw = tipo de poder (con :variante) · tag = concilio */
const P_CD = {
  storm: 16,
  wave: 14,
  tide: 14,
  dashvolley: 10,
  stealth: 20,
  radiant: 18,
  shield: 16,
  quake: 13,
  lance: 11,
  summon: 18,
  clones: 16,
  nuke: 24,
  execute: 20,
  rage: 18,
  charge: 10,
  giant: 22,
  freeze: 22,
  mark: 16,
  revive: 30,
};
const g = (id, name, pan, title, tag, hp, spd, w, pw, pn, pd, bd, set, head, crown, pal) => ({
  id,
  name,
  pan,
  title,
  tag,
  hp,
  spd,
  w,
  pw,
  pn,
  pd,
  bd,
  set: set || (() => {}),
  look: { head, crown, pal },
});
const GODS = [
  g(
    'hermes',
    'Hermes',
    'Griega',
    'Mensajero de los dioses',
    null,
    90,
    190,
    'caduceo',
    'dashvolley',
    'Sandalias aladas',
    'Saltas hacia delante y lanzas una ráfaga.',
    'El más veloz del Olimpo',
    (p) => {
      p.speed *= 1.05;
    },
    'human',
    '',
    {}
  ),
  g(
    'ares',
    'Ares',
    'Griega',
    'Dios de la guerra',
    null,
    130,
    148,
    'lanzaares',
    'rage',
    'Furia de la guerra',
    'Más velocidad y daño durante unos segundos.',
    '+10 % de daño',
    (p) => {
      p.dmgMul *= 1.1;
    },
    'human',
    '',
    {}
  ),
  g(
    'afrodita',
    'Afrodita',
    'Griega',
    'Diosa del amor',
    null,
    95,
    156,
    'cinturon',
    'freeze',
    'Encanto divino',
    'Los enemigos quedan hechizados y quietos.',
    'Curas un 20 % más',
    (p) => {
      p.healMul *= 1.2;
    },
    'human',
    '',
    {}
  ),
  g(
    'hefesto',
    'Hefesto',
    'Griega',
    'Herrero de los dioses',
    null,
    140,
    128,
    'forja',
    'quake',
    'Golpe de la forja',
    'Un martillazo que sacude la tierra.',
    '+2 de armadura',
    (p) => {
      p.armor += 2;
    },
    'human',
    '',
    {}
  ),
  g(
    'baldr',
    'Baldr',
    'Nórdica',
    'El dios de la luz',
    null,
    105,
    150,
    'luzbaldr',
    'radiant',
    'Luz invulnerable',
    'Brillas y quemas todo a tu alrededor.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '',
    {}
  ),
  g(
    'horus',
    'Horus',
    'Egipcia',
    'El halcón del cielo',
    null,
    100,
    162,
    'ojohorus',
    'mark',
    'El ojo que todo lo ve',
    'Marca a los enemigos: reciben más daño.',
    '+6 % de daño',
    (p) => {
      p.dmgMul *= 1.06;
    },
    'human',
    '',
    {}
  ),
  g(
    'ganesha',
    'Ganesha',
    'Hindú',
    'El que aparta obstáculos',
    null,
    145,
    132,
    'hachaganesha',
    'shield',
    'Romper obstáculos',
    'Un escudo divino te protege.',
    '+15 % de dracmas',
    (p) => {
      p.goldMul *= 1.15;
    },
    'human',
    '',
    {}
  ),
  g(
    'kali',
    'Kali',
    'Hindú',
    'La destructora',
    null,
    105,
    158,
    'espadakali',
    'rage',
    'Danza de la destrucción',
    'Furia: más velocidad y daño.',
    'Cada caído te cura un poco',
    (p) => {
      p.steal = (p.steal || 0) + 0.25;
    },
    'human',
    '',
    {}
  ),
  g(
    'zeus',
    'Zeus',
    'Griega',
    'Señor del rayo',
    'trueno',
    100,
    150,
    'rayo',
    'storm',
    'Tormenta del Olimpo',
    'Caen rayos del cielo sobre los enemigos a la vista.',
    'Recarga 8 % más rápido',
    (p) => {
      p.cdMul *= 0.92;
    },
    'human',
    '..g.g..g.g..',
    { H: C.bone, B: C.bone, R: '#e8e0cc', A: C.gold }
  ),
  g(
    'poseidon',
    'Poseidón',
    'Griega',
    'Agitador de la tierra',
    'mar',
    130,
    138,
    'tridente',
    'wave',
    'Maremoto',
    'Una ola gigante sale de ti y empuja a todos.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '...g.gg.g...',
    { H: '#1f5560', B: '#2c7480', R: C.sea, A: C.gold }
  ),
  g(
    'hades',
    'Hades',
    'Griega',
    'Rey del inframundo',
    'inframundo',
    110,
    145,
    'almas',
    'stealth',
    'Yelmo de las tinieblas',
    '4 s invisible e intocable, con el doble de daño.',
    'Cada caído te cura un poco',
    (p) => {
      p.steal = 0.35;
    },
    'human',
    '..f.ff.ff.f.',
    { H: '#2a1d3d', B: '#2a1d3d', R: '#5a3a80', A: C.flame }
  ),
  g(
    'artemisa',
    'Artemisa',
    'Griega',
    'Cazadora de la luna',
    null,
    85,
    182,
    'flechas',
    'dashvolley',
    'Cacería lunar',
    'Saltas hacia delante y disparas flechas en círculo.',
    'La más rápida del Olimpo',
    null,
    'female',
    '.....bb.....',
    { H: '#4a2e1e', R: '#e9e2d0', A: C.leaf }
  ),
  g(
    'apolo',
    'Apolo',
    'Griega',
    'Dios del sol',
    'sol',
    105,
    152,
    'sol',
    'radiant',
    'Carro del Sol',
    '6 s con un aura gigante que quema y te cura.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.7;
    },
    'human',
    '..l.l..l.l..',
    { H: C.gold, R: '#f4d27a', A: '#e07a2e' }
  ),
  g(
    'atenea',
    'Atenea',
    'Griega',
    'Estratega de la guerra',
    'guerra',
    115,
    145,
    'lanza',
    'shield',
    'Égida',
    'Escudo de 5 s que hiere a quien te toca y lanza 8 lanzas.',
    '+2 de armadura',
    (p) => {
      p.armor += 2;
    },
    'female',
    '....rrrr....',
    { H: '#b8862f', R: '#8a96a0', A: C.sea }
  ),

  g(
    'thor',
    'Thor',
    'Nórdica',
    'Dios del trueno',
    'trueno',
    130,
    140,
    'mjolnir',
    'quake',
    'Golpe del trueno',
    'Mjölnir golpea el suelo: daño y aturdimiento alrededor.',
    '+25 % de daño a jefes',
    (p) => {
      p.bossDmg += 0.25;
    },
    'human',
    '............',
    { H: '#c2452d', B: '#c2452d', R: '#5a6b7a', A: '#c9a15a' }
  ),
  g(
    'odin',
    'Odín',
    'Nórdica',
    'Padre de todo',
    null,
    110,
    145,
    'cuervos',
    'lance:spear',
    'Gungnir',
    'Una lanza que cruza la pantalla y nunca falla.',
    'Atraes la experiencia desde lejos',
    (p) => {
      p.magnet *= 1.4;
    },
    'human',
    '..bbbbbbbb..',
    { H: '#8a8a8a', B: '#d8d8d8', R: '#3a4a6a', A: C.gold }
  ),
  g(
    'freya',
    'Freya',
    'Nórdica',
    'Señora de Fólkvangr',
    'tierra',
    100,
    155,
    'seidr',
    'summon:einherjar',
    'Fólkvangr',
    'Cuatro guerreros caídos pelean a tu lado.',
    '+15 % de experiencia',
    (p) => {
      p.xpMul += 0.15;
    },
    'female',
    '.g.g.g.g.g..',
    { H: '#e8c86a', R: '#7a3a5a', A: '#e27aa8' }
  ),
  g(
    'loki',
    'Loki',
    'Nórdica',
    'El embaucador',
    'embaucador',
    95,
    165,
    'fuegoloki',
    'clones',
    'Cambiaformas',
    'Tres clones atraen a los enemigos y explotan.',
    'A veces confundes a los enemigos',
    (p) => {
      p.confuse = 0.05;
    },
    'human',
    '..l......l..',
    { H: '#1c1210', B: C.skin, R: '#2f6a3a', A: C.gold }
  ),

  g(
    'ra',
    'Ra',
    'Egipcia',
    'Señor del sol',
    'sol',
    110,
    145,
    'rayosolar',
    'nuke',
    'Barca solar',
    'La luz del sol arrasa toda la pantalla.',
    '+10 % de área',
    (p) => {
      p.area += 0.1;
    },
    'falcon',
    '....rrrr....',
    { H: '#7a5a3a', S: C.tan, R: '#e8e0cc', A: C.gold }
  ),
  g(
    'anubis',
    'Anubis',
    'Egipcia',
    'Guardián de los muertos',
    'inframundo',
    110,
    148,
    'khopesh',
    'execute',
    'Pesaje del corazón',
    'Los enemigos débiles a la vista mueren de golpe.',
    'Remata a enemigos con poca vida',
    (p) => {
      p.execute = 0.12;
    },
    'jackal',
    '',
    { H: '#2b2420', S: C.brown, R: '#e8e0cc', A: C.gold }
  ),
  g(
    'sekhmet',
    'Sekhmet',
    'Egipcia',
    'La poderosa',
    'guerra',
    115,
    150,
    'aliento',
    'rage',
    'Furia de leona',
    '6 s con casi el doble de daño y más velocidad.',
    'Matar seguido aumenta tu daño',
    (p) => {
      p.frenzyOn = true;
    },
    'lion',
    '....rrrr....',
    { H: '#c98a3a', S: '#e0b060', R: C.blood, A: C.gold }
  ),

  g(
    'marduk',
    'Marduk',
    'Mesopotámica',
    'Rey de los dioses',
    'guerra',
    120,
    145,
    'red',
    'summon:tornado',
    'Los siete vientos',
    'Siete torbellinos barren el campo.',
    '+25 % de daño a jefes',
    (p) => {
      p.bossDmg += 0.25;
    },
    'human',
    '..gggggggg..',
    { H: '#1c1210', B: '#1c1210', S: C.tan, R: '#2f4f9e', A: C.gold }
  ),
  g(
    'inanna',
    'Inanna',
    'Mesopotámica',
    'Reina del cielo',
    'tierra',
    100,
    155,
    'estrella',
    'summon:leon',
    'Leones de Ishtar',
    'Dos leones pelean contigo.',
    'Revives una vez al caer',
    (p) => {
      p.lives = 1;
    },
    'female',
    '.g..g.g..g..',
    { H: '#1c1210', S: C.tan, R: '#e27aa8', A: C.gold }
  ),
  g(
    'enki',
    'Enki',
    'Mesopotámica',
    'Señor del Abzu',
    'mar',
    115,
    145,
    'abzu',
    'tide',
    'Diluvio',
    'Una ola que te cura a ti y a los tuyos y empuja a todos.',
    'Regeneras más rápido',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '...ssssss...',
    { H: '#e8e0cc', B: '#e8e0cc', S: C.tan, R: C.sea, A: '#6fb3bb' }
  ),

  g(
    'vishnu',
    'Vishnu',
    'Hindú',
    'El preservador',
    null,
    110,
    150,
    'chakra',
    'rage',
    'Avatar',
    '6 s en forma de avatar: casi el doble de daño.',
    'Recarga 8 % más rápido',
    (p) => {
      p.cdMul *= 0.92;
    },
    'human',
    '...gggggg...',
    { H: '#1c1210', S: '#5a7fb8', B: '#5a7fb8', R: C.gold, A: C.blood }
  ),
  g(
    'shiva',
    'Shiva',
    'Hindú',
    'El destructor',
    null,
    105,
    148,
    'trishula',
    'nuke',
    'Tandava',
    'Su danza destruye todo lo que hay en pantalla.',
    'Al subir de nivel lanza un rayo del tercer ojo',
    (p) => {
      p.thirdEye = true;
    },
    'human',
    '.....bb.....',
    { H: '#2a1d3d', S: '#7aa0c8', B: '#7aa0c8', R: '#7a5a3a', A: '#e8e0cc' }
  ),
  g(
    'durga',
    'Durga',
    'Hindú',
    'La invencible',
    'guerra',
    115,
    150,
    'diezbrazos',
    'charge',
    'Monta al león',
    'Embistes arrasando todo a tu paso.',
    '+1 proyectil en tus armas',
    (p) => {
      p.countBonus += 1;
    },
    'female',
    '...gggggg...',
    { H: '#1c1210', S: C.tan, R: C.blood, A: C.gold }
  ),
  g(
    'hanuman',
    'Hanuman',
    'Hindú',
    'Hijo del viento',
    null,
    135,
    150,
    'gada',
    'giant',
    'Crece hasta el cielo',
    '8 s gigante: aplastas a quien tocas.',
    'Mucha vida',
    null,
    'monkey',
    '...gggggg...',
    { H: '#c2452d', S: '#e0a070', R: '#e07a2e', A: C.gold }
  ),

  g(
    'susanoo',
    'Susanoo',
    'Japonesa',
    'Dios de las tormentas',
    'mar',
    115,
    150,
    'kusanagi',
    'wave',
    'Tempestad',
    'Una ola de tormenta golpea y empuja.',
    'Doble daño a Yamata no Orochi',
    null,
    'human',
    '...kkkkkk...',
    { H: '#1c1210', B: '#1c1210', R: '#2f4f6a', A: '#9ad0e8' }
  ),
  g(
    'amaterasu',
    'Amaterasu',
    'Japonesa',
    'Diosa del sol',
    'sol',
    100,
    150,
    'yata',
    'freeze',
    'Salir de la cueva',
    'Su luz ciega y paraliza a todos 3 s.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.4;
    },
    'female',
    '..g.gggg.g..',
    { H: '#1c1210', R: '#f2e3c6', A: '#d83a2a' }
  ),
  g(
    'raijin',
    'Raijin',
    'Japonesa',
    'Señor del trueno',
    'trueno',
    120,
    145,
    'tambores',
    'quake',
    'Tambores del trueno',
    'Un trueno en anillo aturde a todos alrededor.',
    'Tus golpes a veces aturden',
    (p) => {
      p.stunChance = 0.06;
    },
    'human',
    '..k......k..',
    { H: '#e8e0cc', B: '#e8e0cc', S: '#c84a3a', R: '#3a2a5a', A: C.gold }
  ),

  g(
    'wukong',
    'Sun Wukong',
    'China',
    'Rey Mono',
    'embaucador',
    110,
    168,
    'ruyi',
    'clones',
    '72 transformaciones',
    'Clones de pelo distraen y explotan.',
    'Muy rápido',
    null,
    'monkey',
    '...gggggg...',
    { H: '#c98a3a', S: '#e0b080', R: '#d8a02a', A: C.blood }
  ),
  g(
    'nezha',
    'Nezha',
    'China',
    'Príncipe del loto',
    null,
    95,
    170,
    'qiankun',
    'charge',
    'Ruedas de viento y fuego',
    'Embistes sobre ruedas de fuego.',
    '+10 % de daño',
    (p) => {
      p.dmgMul += 0.1;
    },
    'human',
    '..kk....kk..',
    { H: '#1c1210', B: C.skin, R: C.blood, A: '#e27aa8' }
  ),
  g(
    'erlang',
    'Erlang Shen',
    'China',
    'El de tres ojos',
    null,
    115,
    148,
    'trespuntas',
    'mark',
    'Tercer ojo',
    'Marca a todos a la vista: reciben doble daño 8 s.',
    'Lo acompaña su perro Xiaotian',
    (p) => {
      p.dog = true;
    },
    'human',
    '...gggggg...',
    { H: '#1c1210', B: C.skin, R: '#e8e0cc', A: C.sea }
  ),

  g(
    'quetzalcoatl',
    'Quetzalcóatl',
    'Mexica',
    'Serpiente emplumada',
    null,
    110,
    155,
    'ehecatl',
    'lance:serpent',
    'Vuelo de la serpiente',
    'Una serpiente emplumada cruza la pantalla.',
    'Atraes la experiencia desde lejos',
    (p) => {
      p.magnet *= 1.5;
    },
    'human',
    '..llllllll..',
    { H: '#1c1210', S: C.brown, B: C.brown, R: '#3aa07a', A: C.gold }
  ),
  g(
    'huitzilopochtli',
    'Huitzilopochtli',
    'Mexica',
    'Sol de guerra',
    'sol',
    120,
    148,
    'xiuhcoatl',
    'radiant',
    'Sol de guerra',
    '6 s ardiendo con un aura que quema todo.',
    'Tu daño crece con el tiempo',
    (p) => {
      p.growDmg = true;
    },
    'human',
    '.ssssssss...',
    { H: '#1c1210', S: C.brown, B: C.brown, R: '#3a5ab0', A: C.gold }
  ),
  g(
    'tezcatlipoca',
    'Tezcatlipoca',
    'Mexica',
    'Espejo humeante',
    'inframundo',
    105,
    155,
    'espejo',
    'stealth',
    'Noche',
    '4 s invisible e intocable, con el doble de daño.',
    'Golpes críticos',
    (p) => {
      p.crit += 0.12;
    },
    'human',
    '..kkkkkkkk..',
    { H: '#1c1210', S: C.brown, B: '#2a2430', R: '#2a2430', A: C.gold }
  ),
  g(
    'tlaloc',
    'Tláloc',
    'Mexica',
    'Señor de la lluvia',
    'trueno',
    115,
    145,
    'lluvia',
    'storm',
    'Tormenta',
    'Rayos y lluvia caen sobre los enemigos.',
    'Ralentizas a los enemigos cercanos',
    (p) => {
      p.slowAura = 0.2;
    },
    'human',
    '..ssssssss..',
    { H: '#1c1210', S: C.brown, B: '#2f4f9e', R: C.sea, A: '#e8e0cc' }
  ),

  g(
    'chaac',
    'Chaac',
    'Maya',
    'Señor de la lluvia',
    'trueno',
    120,
    145,
    'hachachaac',
    'storm',
    'Lluvia de los cuatro rumbos',
    'Rayos caen sobre los enemigos a la vista.',
    '+10 % de daño',
    (p) => {
      p.dmgMul += 0.1;
    },
    'human',
    '..ssssssss..',
    { H: '#1c1210', S: '#7aa08a', B: '#7aa08a', R: '#2f6a5a', A: C.gold }
  ),
  g(
    'gemelos',
    'Hunahpú e Ixbalanqué',
    'Maya',
    'Héroes Gemelos',
    'embaucador',
    105,
    160,
    'pelota',
    'clones',
    'Engaño a Xibalbá',
    'Clones engañan a los enemigos y explotan.',
    'El poder recarga más rápido',
    (p) => {
      p.powCdMul = 0.8;
    },
    'human',
    '..........',
    { H: '#1c1210', S: C.brown, B: C.brown, R: '#e8e0cc', A: '#d8a02a' }
  ),
  g(
    'ixchel',
    'Ix Chel',
    'Maya',
    'Señora de la luna',
    'tierra',
    100,
    150,
    'telar',
    'tide',
    'Inundación de la luna',
    'Una marea que te cura a ti y a los tuyos y empuja a todos.',
    'Las granadas curan el doble',
    (p) => {
      p.healMul = 2;
    },
    'female',
    '.....bb.....',
    { H: '#1c1210', S: C.brown, R: C.sea, A: '#e8e0cc' }
  ),

  g(
    'inti',
    'Inti',
    'Andina',
    'Padre sol',
    'sol',
    115,
    148,
    'discos',
    'radiant',
    'Mediodía',
    '6 s de sol que quema todo alrededor y te cura.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '.gggggggggg.',
    { H: '#1c1210', S: C.andes, B: C.andes, R: '#d8a02a', A: C.blood }
  ),
  g(
    'illapa',
    'Illapa',
    'Andina',
    'Señor del rayo',
    'trueno',
    110,
    155,
    'huaraca',
    'storm',
    'Granizo y trueno',
    'Caen rayos y granizo sobre los enemigos.',
    'Tus rayos saltan una vez más',
    (p) => {
      p.chainBonus += 1;
    },
    'human',
    '..b......b..',
    { H: '#1c1210', S: C.andes, B: C.andes, R: '#5a6b8a', A: '#e8e0cc' }
  ),
  g(
    'mamaquilla',
    'Mama Quilla',
    'Andina',
    'Madre luna',
    'tierra',
    100,
    150,
    'lagrimas',
    'freeze',
    'Eclipse',
    'Todo queda congelado 3 s.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'female',
    '.....bb.....',
    { H: '#1c1210', S: C.andes, R: '#c8ccd8', A: '#e8e0cc' }
  ),
  g(
    'pachamama',
    'Pachamama',
    'Andina',
    'Madre tierra',
    'tierra',
    140,
    138,
    'raices',
    'quake',
    'Terremoto',
    'La tierra se abre: daño y aturdimiento alrededor.',
    'Mucha vida',
    null,
    'female',
    '..l.l..l.l..',
    { H: '#1c1210', S: C.brown, R: '#6a8a3a', A: '#d23a5a' }
  ),
  g(
    'viracocha',
    'Viracocha',
    'Andina',
    'El creador',
    null,
    110,
    145,
    'creacion',
    'nuke',
    'Unu Pachakuti',
    'El gran diluvio barre la pantalla.',
    'Revives el doble de rápido a tu compañero',
    (p) => {
      p.reviveMul = 2;
    },
    'human',
    '...gggggg...',
    { H: '#e8e0cc', B: '#e8e0cc', S: C.andes, R: '#e8e0cc', A: '#d8a02a' }
  ),

  g(
    'shango',
    'Shangó',
    'Yoruba',
    'Señor del trueno',
    'trueno',
    120,
    150,
    'oshe',
    'quake',
    'Fuego por la boca',
    'Una explosión de fuego y trueno a tu alrededor.',
    'Tus rayos saltan una vez más',
    (p) => {
      p.chainBonus += 1;
    },
    'human',
    '..rrbbbbrr..',
    { H: '#1c1210', S: C.dark, B: C.dark, R: C.blood, A: C.bone }
  ),
  g(
    'ogun',
    'Ogún',
    'Yoruba',
    'Señor del hierro',
    'guerra',
    125,
    145,
    'machete',
    'lance:blade',
    'Abre caminos',
    'Un tajo que arrasa todo en línea recta.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '............',
    { H: '#1c1210', S: C.dark, B: C.dark, R: '#3a6a3a', A: '#2a2a2a' }
  ),
  g(
    'oya',
    'Oyá',
    'Yoruba',
    'Señora de los vientos',
    null,
    105,
    162,
    'viento',
    'summon:tornado',
    'Tornado de las nueve puertas',
    'Torbellinos barren el campo.',
    'Muy rápida',
    null,
    'female',
    '..p.pppp.p..',
    { H: '#1c1210', S: C.dark, R: '#7a3a2a', A: '#e27aa8' }
  ),
  g(
    'yemaya',
    'Yemayá',
    'Yoruba',
    'Madre de las aguas',
    'mar',
    115,
    145,
    'olas',
    'tide',
    'Marea',
    'La marea te cura a ti y a los tuyos y empuja a todos.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'female',
    '.bbbbbbbb...',
    { H: '#1c1210', S: C.dark, R: '#3a6ab0', A: C.bone }
  ),

  g(
    'lugh',
    'Lugh',
    'Celta',
    'El de muchas artes',
    null,
    110,
    155,
    'lughlanza',
    'lance:firespear',
    'Lanza Areadbhair',
    'Una lanza de fuego cruza la pantalla.',
    'Domina todo: daño y recarga mejores',
    (p) => {
      p.dmgMul += 0.08;
      p.cdMul *= 0.95;
    },
    'human',
    '...gggggg...',
    { H: C.gold, B: C.skin, R: '#3a6a3a', A: C.gold }
  ),
  g(
    'dagda',
    'Dagda',
    'Celta',
    'El buen dios',
    'tierra',
    145,
    135,
    'maza',
    'revive',
    'Caldero',
    'Te cura a ti y a tu compañero, y lo revive.',
    'Mucha vida',
    null,
    'human',
    '............',
    { H: '#7a4a2a', B: '#7a4a2a', R: '#5a3a2a', A: '#c9a15a' }
  ),
  g(
    'morrigan',
    'Morrígan',
    'Celta',
    'La gran reina',
    'guerra',
    100,
    158,
    'cuervosm',
    'mark',
    'Profecía',
    'Marca a todos a la vista: reciben doble daño 8 s.',
    'Aún más daño a los marcados',
    (p) => {
      p.markMul = 1.3;
    },
    'female',
    '..k.k..k.k..',
    { H: '#1c1210', S: '#e9d8c8', R: '#2a2a33', A: C.blood }
  ),

  g(
    'dios',
    'Dios',
    'Cristiana',
    'El Creador',
    null,
    120,
    145,
    'luz',
    'nuke',
    'Hágase la luz',
    'Una luz que barre la pantalla entera.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'light',
    '',
    { W: '#fff6e0', y: '#f4d27a', R: '#fff6e0', S: '#fff6e0', A: '#f4d27a' }
  ),
  g(
    'jesus',
    'Jesús',
    'Cristiana',
    'El Hijo',
    null,
    110,
    150,
    'palomas',
    'revive',
    'Resurrección',
    'Revive a tu compañero y os cura a los dos.',
    'Aparecen más granadas y curan más',
    (p) => {
      p.healMul = 1.5;
      p.dropMul = 2;
    },
    'human',
    '...yyyyyy...',
    { H: '#5a3a22', B: '#5a3a22', R: '#f2e3c6', A: C.blood }
  ),
  g(
    'tyr',
    'Tyr',
    'Nórdica',
    'El dios manco de la justicia',
    null,
    125,
    148,
    'martillotyr',
    'shield',
    'Juramento de Tyr',
    'Un escudo sagrado te protege.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '',
    {}
  ),
  g(
    'frigg',
    'Frigg',
    'Nórdica',
    'La que conoce el destino',
    null,
    100,
    150,
    'husofrigg',
    'revive',
    'Hilar el destino',
    'Revive y cura a tus aliados.',
    'Curas un 20 % más',
    (p) => {
      p.healMul *= 1.2;
    },
    'human',
    '',
    {}
  ),
  g(
    'isis',
    'Isis',
    'Egipcia',
    'La gran maga',
    null,
    95,
    155,
    'alasisis',
    'tide',
    'Magia de Isis',
    'Una ola mágica que cura y empuja.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '',
    {}
  ),
  g(
    'thot',
    'Thot',
    'Egipcia',
    'El escriba de los dioses',
    null,
    95,
    150,
    'plumathot',
    'mark',
    'Palabra de poder',
    'Marca a todos: reciben más daño.',
    'Recarga 10 % más rápido',
    (p) => {
      p.cdMul *= 0.9;
    },
    'human',
    '',
    {}
  ),
  g(
    'shamash',
    'Shamash',
    'Mesopotámica',
    'El sol de la justicia',
    null,
    110,
    150,
    'discoshamash',
    'radiant',
    'Luz del juicio',
    'Brillas y quemas todo a tu alrededor.',
    '+6 % de daño',
    (p) => {
      p.dmgMul *= 1.06;
    },
    'human',
    '',
    {}
  ),
  g(
    'nergal',
    'Nergal',
    'Mesopotámica',
    'Señor de la plaga',
    null,
    130,
    140,
    'plaganergal',
    'rage',
    'Pestilencia',
    'Furia: más velocidad y daño.',
    'Cada caído te cura un poco',
    (p) => {
      p.steal = (p.steal || 0) + 0.25;
    },
    'human',
    '',
    {}
  ),
  g(
    'tsukuyomi',
    'Tsukuyomi',
    'Japonesa',
    'Dios de la luna',
    null,
    100,
    158,
    'lunatsuk',
    'stealth',
    'Noche sin luna',
    'Te vuelves invisible y haces el doble de daño.',
    '+8 % de velocidad',
    (p) => {
      p.speed *= 1.08;
    },
    'human',
    '',
    {}
  ),
  g(
    'inari',
    'Inari',
    'Japonesa',
    'Señora de los zorros',
    null,
    100,
    160,
    'zorrosinari',
    'clones',
    'Nueve colas',
    'Zorros-clon pelean a tu lado.',
    '+15 % de dracmas',
    (p) => {
      p.goldMul *= 1.15;
    },
    'human',
    '',
    {}
  ),
  g(
    'guanyu',
    'Guan Yu',
    'China',
    'El dios de la guerra leal',
    null,
    140,
    140,
    'alabarda',
    'charge',
    'Carga del caballo rojo',
    'Embistes en línea recta arrasando todo.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '',
    {}
  ),
  g(
    'change',
    "Chang'e",
    'China',
    'La diosa de la luna',
    null,
    90,
    160,
    'conejo',
    'freeze',
    'Elixir lunar',
    'Congela a los enemigos a la vista.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '',
    {}
  ),
  g(
    'xochiquetzal',
    'Xochiquétzal',
    'Mexica',
    'Diosa de las flores',
    null,
    95,
    158,
    'flores',
    'tide',
    'Lluvia de pétalos',
    'Una ola de flores que cura y empuja.',
    'Curas un 20 % más',
    (p) => {
      p.healMul *= 1.2;
    },
    'human',
    '',
    {}
  ),
  g(
    'xipe',
    'Xipe Tótec',
    'Mexica',
    'Señor de la renovación',
    null,
    125,
    145,
    'pielxipe',
    'revive',
    'Renacer',
    'Revive y cura a tus aliados.',
    '+15 de PS máximos',
    (p) => {
      p.maxHp += 15;
      p.hp += 15;
    },
    'human',
    '',
    {}
  ),
  g(
    'kinich',
    'Kinich Ahau',
    'Maya',
    'El sol de los mayas',
    null,
    105,
    152,
    'solkinich',
    'nuke',
    'Ojo del sol',
    'Una explosión de sol que barre la pantalla.',
    '+6 % de daño',
    (p) => {
      p.dmgMul *= 1.06;
    },
    'human',
    '',
    {}
  ),
  g(
    'itzamna',
    'Itzamná',
    'Maya',
    'El sabio creador',
    null,
    100,
    148,
    'codice',
    'shield',
    'Códice sagrado',
    'Un escudo divino te protege.',
    'Recarga 10 % más rápido',
    (p) => {
      p.cdMul *= 0.9;
    },
    'human',
    '',
    {}
  ),
  g(
    'kon',
    'Kon',
    'Andina',
    'Dios del viento y la lluvia',
    null,
    100,
    165,
    'vientokon',
    'summon:tornado',
    'Remolino',
    'Invocas tornados que arrastran enemigos.',
    '+8 % de velocidad',
    (p) => {
      p.speed *= 1.08;
    },
    'human',
    '',
    {}
  ),
  g(
    'mamacocha',
    'Mama Cocha',
    'Andina',
    'Madre del mar',
    null,
    115,
    145,
    'marcocha',
    'wave',
    'Marea andina',
    'Una ola gigante empuja a todos.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '',
    {}
  ),
  g(
    'obatala',
    'Obatalá',
    'Yoruba',
    'Rey de la tela blanca',
    null,
    130,
    140,
    'telablanca',
    'revive',
    'Paz de Obatalá',
    'Revive y cura a tus aliados.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.5;
    },
    'human',
    '',
    {}
  ),
  g(
    'eshu',
    'Eshu',
    'Yoruba',
    'Guardián de los caminos',
    null,
    95,
    170,
    'cruce',
    'clones',
    'Mil caminos',
    'Clones tuyos confunden a los enemigos.',
    '+15 % de dracmas',
    (p) => {
      p.goldMul *= 1.15;
    },
    'human',
    '',
    {}
  ),
  g(
    'brigid',
    'Brigid',
    'Celta',
    'Diosa del fuego y la forja',
    null,
    105,
    150,
    'llamabrigid',
    'radiant',
    'Llama eterna',
    'Brillas y quemas todo a tu alrededor.',
    'Curas un 20 % más',
    (p) => {
      p.healMul *= 1.2;
    },
    'human',
    '',
    {}
  ),
  g(
    'manannan',
    'Manannán',
    'Celta',
    'Señor del mar',
    null,
    115,
    152,
    'olasmanannan',
    'wave',
    'Marea de Manannán',
    'Una ola gigante empuja a todos.',
    '+8 % de velocidad',
    (p) => {
      p.speed *= 1.08;
    },
    'human',
    '',
    {}
  ),
  g(
    'miguel',
    'Arcángel Miguel',
    'Cristiana',
    'Príncipe de los ejércitos',
    null,
    135,
    150,
    'espadamiguel',
    'charge',
    'Carga celestial',
    'Embistes con la espada de fuego.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '',
    {}
  ),
  g(
    'gabriel',
    'Arcángel Gabriel',
    'Cristiana',
    'El mensajero',
    null,
    100,
    160,
    'trompeta',
    'nuke',
    'Última trompeta',
    'Una onda que barre la pantalla.',
    'Recarga 10 % más rápido',
    (p) => {
      p.cdMul *= 0.9;
    },
    'human',
    '',
    {}
  ),
  g(
    'ymir',
    'Ymir',
    'Nórdica',
    'El gigante primordial',
    null,
    200,
    128,
    'glaciar',
    'freeze',
    'Invierno eterno',
    'Congela a todos los enemigos.',
    '+30 de PS máximos',
    (p) => {
      p.maxHp += 30;
      p.hp += 30;
    },
    'human',
    '',
    {}
  ),
  g(
    'set',
    'Set',
    'Egipcia',
    'Señor del caos y el desierto',
    null,
    140,
    155,
    'tormentaset',
    'rage',
    'Tormenta roja',
    'Furia: más velocidad y daño.',
    '+10 % de daño',
    (p) => {
      p.dmgMul *= 1.1;
    },
    'human',
    '',
    {}
  ),
  g(
    'tiamat',
    'Tiamat',
    'Mesopotámica',
    'Madre de los monstruos',
    null,
    170,
    140,
    'fauces',
    'summon:tornado',
    'Aguas del caos',
    'Invocas remolinos de agua.',
    '+1 de armadura',
    (p) => {
      p.armor += 1;
    },
    'human',
    '',
    {}
  ),
  g(
    'ravana',
    'Ravana',
    'Hindú',
    'El rey de diez cabezas',
    null,
    160,
    145,
    'cabezas',
    'clones',
    'Diez cabezas',
    'Clones tuyos atacan contigo.',
    '+10 % de daño',
    (p) => {
      p.dmgMul *= 1.1;
    },
    'human',
    '',
    {}
  ),
  g(
    'izanami',
    'Izanami',
    'Japonesa',
    'Reina de Yomi',
    null,
    120,
    150,
    'muerteizanami',
    'stealth',
    'Velo de Yomi',
    'Invisible y con el doble de daño.',
    'Cada caído te cura un poco',
    (p) => {
      p.steal = (p.steal || 0) + 0.3;
    },
    'human',
    '',
    {}
  ),
  g(
    'pangu',
    'Pangu',
    'China',
    'El que separó cielo y tierra',
    null,
    190,
    135,
    'hachapangu',
    'quake',
    'Partir el mundo',
    'Un golpe que sacude la tierra.',
    '+2 de armadura',
    (p) => {
      p.armor += 2;
    },
    'human',
    '',
    {}
  ),
  g(
    'mictlantecuhtli',
    'Mictlantecuhtli',
    'Mexica',
    'Señor del Mictlán',
    null,
    140,
    148,
    'osamenta',
    'execute',
    'Juicio de los muertos',
    'Remata a los que tienen poca vida.',
    'Cada caído te cura un poco',
    (p) => {
      p.steal = (p.steal || 0) + 0.3;
    },
    'human',
    '',
    {}
  ),
  g(
    'kukulkan',
    'Kukulkán',
    'Maya',
    'La serpiente emplumada',
    null,
    135,
    158,
    'plumaserpiente',
    'lance:serpent',
    'Descenso de la serpiente',
    'Una serpiente gigante atraviesa a todos.',
    '+8 % de velocidad',
    (p) => {
      p.speed *= 1.08;
    },
    'human',
    '',
    {}
  ),
  g(
    'supay',
    'Supay',
    'Andina',
    'Señor del Uku Pacha',
    null,
    150,
    148,
    'fuegosupay',
    'nuke',
    'Fuego de abajo',
    'Una explosión que barre la pantalla.',
    '+10 % de daño',
    (p) => {
      p.dmgMul *= 1.1;
    },
    'human',
    '',
    {}
  ),
  g(
    'olodumare',
    'Olodumare',
    'Yoruba',
    'El creador supremo',
    null,
    160,
    145,
    'alientoolodumare',
    'radiant',
    'Aliento de vida',
    'Brillas y quemas todo a tu alrededor.',
    'Regeneras vida',
    (p) => {
      p.regen += 0.8;
    },
    'human',
    '',
    {}
  ),
  g(
    'cernunnos',
    'Cernunnos',
    'Celta',
    'El dios astado del bosque',
    null,
    150,
    152,
    'astas',
    'summon:leon',
    'Llamada salvaje',
    'Bestias del bosque pelean contigo.',
    '+15 de PS máximos',
    (p) => {
      p.maxHp += 15;
      p.hp += 15;
    },
    'human',
    '',
    {}
  ),
  g(
    'metatron',
    'Metatrón',
    'Cristiana',
    'La voz del trono',
    null,
    150,
    150,
    'ruedas',
    'shield',
    'Muro de luz',
    'Un escudo divino te protege.',
    'Recarga 15 % más rápido',
    (p) => {
      p.cdMul *= 0.85;
    },
    'human',
    '',
    {}
  ),
  g(
    'cronos',
    'Cronos',
    'Primordial',
    'El titán del tiempo',
    null,
    165,
    145,
    'guadana',
    'freeze',
    'Detener el tiempo',
    'Congela a todos los enemigos a la vista.',
    'Recarga 15 % más rápido',
    (p) => {
      p.cdMul *= 0.85;
    },
    'human',
    '',
    {}
  ),
  g(
    'khaos',
    'Khaos',
    'Primordial',
    'El vacío antes de todo',
    null,
    190,
    150,
    'abismo',
    'nuke',
    'Big Bang',
    'Una explosión que borra la pantalla.',
    '+20 % de daño',
    (p) => {
      p.dmgMul *= 1.2;
    },
    'human',
    '',
    {}
  ),
];
for (const d of GODS) {
  d.cd = P_CD[d.pw.split(':')[0]];
}
