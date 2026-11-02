/* ---------- Dones y reliquias ---------- */
const PASSIVES = {
  ambrosia: {
    name: 'Ambrosía',
    em: 'Φ',
    desc: '+20 de vida máxima y regeneras vida.',
    apply: (p) => {
      p.maxHp += 20;
      p.hp += 20;
      p.regen += 0.4;
    },
  },
  ruedafortuna: {
    name: 'Rueda de Fortuna',
    em: '☸',
    desc: '+20 % de suerte: los enemigos sueltan más monedas, néctar y botín, y los cofres dan mejores objetos.',
    apply: (p) => {
      p.luck += 0.2;
    },
  },
  ojohalcon: {
    name: 'Ojo de halcón',
    em: '◎',
    desc: '+12 % de alcance: tus armas llegan más lejos.',
    apply: (p) => {
      p.range += 0.12;
    },
  },
  furia: {
    name: 'Furia de Ares',
    em: 'Δ',
    desc: '+12 % de daño.',
    apply: (p) => {
      p.dmgMul += 0.12;
    },
  },
  clepsidra: {
    name: 'Clepsidra de Cronos',
    em: 'Χ',
    desc: 'Armas y poder recargan 8 % más rápido.',
    apply: (p) => {
      p.cdMul *= 0.92;
    },
  },
  cornucopia: {
    name: 'Cornucopia',
    em: 'Κ',
    desc: 'Atraes la experiencia desde más lejos y ganas +10 %.',
    apply: (p) => {
      p.magnet *= 1.3;
      p.xpMul += 0.1;
    },
  },
  laurel: {
    name: 'Laurel de Delfos',
    em: 'Λ',
    desc: '+12 % de tamaño y alcance de tus ataques.',
    apply: (p) => {
      p.area += 0.12;
    },
  },
  sandalias: {
    name: 'Sandalias de Hermes',
    em: 'Η',
    desc: '+8 % de velocidad.',
    realm: 'tartaro',
    apply: (p) => {
      p.speed *= 1.08;
    },
  },
  egida: {
    name: 'Escudo de bronce',
    em: 'Θ',
    desc: '+1 de armadura.',
    realm: 'tartaro',
    tag: 'guerra',
    apply: (p) => {
      p.armor += 1;
    },
  },
  gleipnir: {
    name: 'Gleipnir',
    em: 'ᛜ',
    desc: 'Los enemigos cercanos se mueven más lento.',
    realm: 'jotunheim',
    tag: 'tierra',
    apply: (p) => {
      p.slowAura += 0.1;
    },
  },
  megingjord: {
    name: 'Megingjörð',
    em: 'ᛗ',
    desc: '+12 % de daño.',
    realm: 'jotunheim',
    tag: 'trueno',
    apply: (p) => {
      p.dmgMul += 0.12;
    },
  },
  ojohorus: {
    name: 'Ojo de Horus',
    em: '𓂀',
    desc: '+12 % de área.',
    realm: 'duat',
    tag: 'sol',
    apply: (p) => {
      p.area += 0.12;
    },
  },
  anj: {
    name: 'Anj',
    em: '☥',
    desc: 'Regeneras vida y +15 de vida.',
    realm: 'duat',
    tag: 'inframundo',
    apply: (p) => {
      p.regen += 0.5;
      p.maxHp += 15;
      p.hp += 15;
    },
  },
  tablilla: {
    name: 'Tablilla de los destinos',
    em: '𒀭',
    desc: '+15 % de experiencia y recarga 5 % más rápida.',
    realm: 'kur',
    apply: (p) => {
      p.xpMul += 0.15;
      p.cdMul *= 0.95;
    },
  },
  arcomarduk: {
    name: 'Arco de Marduk',
    em: '➶',
    desc: '+1 proyectil en tus armas.',
    realm: 'kur',
    tag: 'guerra',
    apply: (p) => {
      p.countBonus += 1;
    },
  },
  loto: {
    name: 'Flor de loto',
    em: '❀',
    desc: '+25 de vida máxima.',
    realm: 'lanka',
    tag: 'tierra',
    apply: (p) => {
      p.maxHp += 25;
      p.hp += 25;
    },
  },
  vajra: {
    name: 'Vajra',
    em: 'ᛉ',
    desc: 'Tus rayos saltan una vez más y +6 % de daño.',
    realm: 'lanka',
    tag: 'trueno',
    apply: (p) => {
      p.chainBonus += 1;
      p.dmgMul += 0.06;
    },
  },
  yasakani: {
    name: 'Joya Yasakani',
    em: '◗',
    desc: 'Recarga 8 % más rápida.',
    realm: 'yomi',
    tag: 'sol',
    apply: (p) => {
      p.cdMul *= 0.92;
    },
  },
  ofuda: {
    name: 'Ofuda',
    em: '卍',
    desc: '+1 de armadura y críticos.',
    realm: 'yomi',
    tag: 'inframundo',
    apply: (p) => {
      p.armor += 1;
      p.crit += 0.05;
    },
  },
  melocoton: {
    name: 'Melocotón de la inmortalidad',
    em: '❥',
    desc: '+30 de vida máxima.',
    realm: 'diyu',
    tag: 'tierra',
    apply: (p) => {
      p.maxHp += 30;
      p.hp += 30;
    },
  },
  calabaza: {
    name: 'Calabaza mágica',
    em: '♁',
    desc: 'Atraes la experiencia desde mucho más lejos.',
    realm: 'diyu',
    tag: 'embaucador',
    apply: (p) => {
      p.magnet *= 1.5;
    },
  },
  obsidiana: {
    name: 'Espejo de obsidiana',
    em: '◆',
    desc: '+10 % de golpes críticos.',
    realm: 'mictlan',
    tag: 'inframundo',
    apply: (p) => {
      p.crit += 0.1;
    },
  },
  cempasuchil: {
    name: 'Flor de cempasúchil',
    em: '✿',
    desc: 'Regeneras vida.',
    realm: 'mictlan',
    tag: 'sol',
    apply: (p) => {
      p.regen += 0.6;
    },
  },
  hule: {
    name: 'Pelota de hule',
    em: '●',
    desc: '+1 proyectil en tus armas.',
    realm: 'xibalba',
    tag: 'embaucador',
    apply: (p) => {
      p.countBonus += 1;
    },
  },
  cacao: {
    name: 'Cacao sagrado',
    em: '❂',
    desc: '+10 % de velocidad y +6 % de daño.',
    realm: 'xibalba',
    apply: (p) => {
      p.speed *= 1.1;
      p.dmgMul += 0.06;
    },
  },
  tumi: {
    name: 'Tumi de oro',
    em: '⟟',
    desc: '+12 % de daño.',
    realm: 'ukupacha',
    tag: 'guerra',
    apply: (p) => {
      p.dmgMul += 0.12;
    },
  },
  chakana: {
    name: 'Chakana',
    em: '✚',
    desc: '+12 % de área.',
    realm: 'ukupacha',
    tag: 'sol',
    apply: (p) => {
      p.area += 0.12;
    },
  },
  opele: {
    name: 'Opele de Ifá',
    em: '⁘',
    desc: '+15 % de experiencia.',
    realm: 'orun',
    apply: (p) => {
      p.xpMul += 0.15;
    },
  },
  aguamar: {
    name: 'Agua de Yemayá',
    em: '≈',
    desc: 'Regeneras vida.',
    realm: 'orun',
    tag: 'mar',
    apply: (p) => {
      p.regen += 0.6;
    },
  },
  caldero: {
    name: 'Caldero de Dagda',
    em: '♨',
    desc: '+20 de vida y las granadas curan más.',
    realm: 'annwn',
    tag: 'tierra',
    apply: (p) => {
      p.maxHp += 20;
      p.hp += 20;
      p.healMul *= 1.4;
    },
  },
  piedrafal: {
    name: 'Piedra de Fal',
    em: '▲',
    desc: '+1 de armadura y +6 % de daño.',
    realm: 'annwn',
    tag: 'guerra',
    apply: (p) => {
      p.armor += 1;
      p.dmgMul += 0.06;
    },
  },
};
