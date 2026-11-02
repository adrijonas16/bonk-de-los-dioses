/* ---------- Tienda ---------- */
const FREE_GODS = ['zeus', 'poseidon', 'artemisa', 'thor', 'ra', 'wukong', 'quetzalcoatl', 'inti', 'shango', 'lugh'];
const SECRET_GODS = {
  ymir: {
    req: 'Derrota al jefe final de Jötunheim en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['jotunheim'],
  },
  set: {
    req: 'Derrota al jefe final de el Duat en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['duat'],
  },
  tiamat: {
    req: 'Derrota al jefe final de Kur en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['kur'],
  },
  ravana: {
    req: 'Derrota al jefe final de Lanka en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['lanka'],
  },
  izanami: {
    req: 'Derrota al jefe final de Yomi en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['yomi'],
  },
  pangu: {
    req: 'Derrota al jefe final de Diyu en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['diyu'],
  },
  mictlantecuhtli: {
    req: 'Derrota al jefe final de Teotihuacan en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['mictlan'],
  },
  kukulkan: {
    req: 'Derrota al jefe final de Chichén Itzá en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['xibalba'],
  },
  supay: {
    req: 'Derrota al jefe final de Machu Picchu en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['ukupacha'],
  },
  olodumare: {
    req: 'Derrota al jefe final de Orun en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['orun'],
  },
  cernunnos: {
    req: 'Derrota al jefe final de Annwn en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['annwn'],
  },
  metatron: {
    req: 'Derrota al jefe final de Los Cielos en Difícil o Pesadilla',
    test: (P) => !!(P.stats.realmHard || {})['cielo'],
  },
  cronos: {
    req: 'Derrota a Cronos como jefe y gana una partida en Difícil',
    test: (P) =>
      (P.stats.bossKeys || {}).cronos > 0 &&
      ((P.stats.winsByDiff || {}).dificil || 0) + ((P.stats.winsByDiff || {}).pesadilla || 0) > 0,
  },
  khaos: { req: 'Derrota a Khaos en Difícil o Pesadilla', test: (P) => (P.stats.khaosHard || 0) > 0 },
};
const GOD_PRICE = (id) =>
  ({
    tyr: 300,
    frigg: 300,
    isis: 300,
    thot: 300,
    shamash: 300,
    nergal: 300,
    tsukuyomi: 400,
    inari: 300,
    guanyu: 400,
    change: 300,
    xochiquetzal: 300,
    xipe: 300,
    kinich: 300,
    itzamna: 300,
    kon: 300,
    mamacocha: 300,
    obatala: 400,
    eshu: 300,
    brigid: 300,
    manannan: 300,
    miguel: 400,
    gabriel: 400,
    hermes: 300,
    ares: 350,
    afrodita: 300,
    hefesto: 300,
    baldr: 300,
    horus: 300,
    ganesha: 350,
    kali: 400,
    dios: 900,
    jesus: 600,
    odin: 400,
    shiva: 400,
    viracocha: 400,
    hades: 350,
    amaterasu: 350,
    anubis: 300,
    vishnu: 350,
    tezcatlipoca: 300,
  })[id] || 250;
const UPGRADES = {
  hp: { name: 'Vitalidad olímpica', em: '❤', desc: '+8 % de PS máximos por nivel.', base: 60, max: 5 },
  luck: {
    name: 'Favor de Tique',
    em: '✤',
    desc: '+5 % de suerte por nivel: más botín y mejores cofres.',
    base: 80,
    max: 5,
  },
  rng: { name: 'Brazo de Atlas', em: '◎', desc: '+5 % de alcance por nivel.', base: 70, max: 5 },
  dmg: { name: 'Fuerza titánica', em: '⚔', desc: '+5 % de daño por nivel.', base: 80, max: 5 },
  spd: { name: 'Pies de Hermes', em: '➹', desc: '+4 % de velocidad por nivel.', base: 70, max: 5 },
  mag: { name: 'Imán de Midas', em: '⟴', desc: '+15 % de radio para recoger por nivel.', base: 50, max: 5 },
  gold: { name: 'Tesoro de Kubera', em: '¤', desc: '+10 % de dracmas por nivel.', base: 90, max: 5 },
  rev: { name: 'Segunda vida', em: '☥', desc: 'Empiezas cada partida con una resurrección.', base: 450, max: 1 },
};

window.DATA = {
  SECRET_GODS,
  C,
  WEAPONS,
  GODS,
  PASSIVES,
  CONCILIOS,
  ENEMIES,
  BOSSES,
  REALMS,
  REL,
  LINES,
  LOOKS,
  THEMES,
  RAR,
  ITEMS,
  RUN_MISSIONS,
  DAILY,
  FREE_GODS,
  GOD_PRICE,
  UPGRADES,
};
