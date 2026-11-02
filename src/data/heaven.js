/* ---------- Los Cielos ---------- */
Object.assign(ENEMIES, {
  caido: e('Ángel caído', 'flyer', '#3a3040', '#f4d27a', 'ears', { hp: 14, spd: 100 }),
  demonio: e('Demonio', 'humanoid', '#8a2a2a', C.gold, 'horns'),
  langosta: e('Langosta del abismo', 'flyer', '#8a7a2a', C.blood, 'beak', { spd: 120 }),
});
Object.assign(BOSSES, {
  behemot: b('Behemot', 'beast', '#5a4a3a', C.gold, 'mini', ['charge', 'slam', 'ring'], { feat: 'horns' }),
  leviatan: b('Leviatán', 'serpent', '#2a5a7a', '#9ad0e8', 'mini', ['spiral', 'aimed'], { weak: ['poseidon', 'dios'] }),
  lilith: b('Lilith', 'lord', '#3a1838', '#e0407a', 'mini', ['spiral', 'summon', 'aimed', 'gaze'], {
    feat: 'horns',
    weak: ['dios', 'jesus', 'miguel', 'gabriel', 'metatron'],
  }),
  dragon7: b(
    'El Dragón de siete cabezas',
    'hydra',
    '#b3301f',
    C.gold,
    'boss',
    ['spiral', 'ring', 'summon', 'slam', 'aimed'],
    { heads: 7, weak: ['dios', 'jesus'] }
  ),
});
REALMS.cielo = {
  minipool: ['behemot', 'leviatan', 'ziz'],
  bosspool: ['dragon7', 'abadon'],
  name: 'Los Cielos',
  pan: 'Cristiana',
  sub: 'Sobre las nubes, ante las puertas de oro',
  g1: '#e4e0fa',
  g2: '#c8d2f0',
  det: '#e8d8a0',
  acc: '#f4d27a',
  dark: 0,
  dcol: '#000000',
  weather: 'feathers',
  en: ['caido', 'demonio', 'langosta', 'demonio'],
  minis: ['behemot', 'leviatan'],
  boss: 'dragon7',
};
