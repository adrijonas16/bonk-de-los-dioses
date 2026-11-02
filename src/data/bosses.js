/* ---------- Jefes ---------- */
const b = (name, arch, col, acc, tier, pats, o) =>
  Object.assign({ name, arch, col, acc, tier, pats, heads: 1, weak: [], friend: [] }, o || {});
const BOSSES = {
  medusa: b('Medusa', 'gorgon', '#5a7a4a', '#f8e060', 'mini', ['gaze', 'aimed', 'summon'], { weak: ['atenea'] }),
  cerbero: b('Cerbero', 'beast', '#2a2020', C.blood, 'mini', ['charge', 'ring'], { heads: 3, friend: ['hades'] }),
  hecatonquiros: b('Los Hecatónquiros', 'hundred', '#8a6a58', C.gold, 'boss', ['slam', 'ring', 'charge', 'summon']),
  garm: b('Garm', 'beast', '#5a2a2a', '#e8e0cc', 'mini', ['charge', 'aimed']),
  nidhogg: b('Níðhöggr', 'flyer', '#3a4a2a', C.gold, 'mini', ['spiral', 'aimed'], { feat: 'dragon' }),
  fenrir: b('Fenrir', 'beast', '#6a7480', '#9fe0ff', 'boss', ['charge', 'ring', 'summon', 'slam'], {
    weak: ['odin', 'thor'],
  }),
  ammit: b('Ammit', 'beast', '#6b8a3a', C.blood, 'mini', ['charge', 'aimed'], { feat: 'mane' }),
  esfinge: b('La Esfinge', 'beast', '#c9a15a', '#2f4f9e', 'mini', ['gaze', 'ring'], { feat: 'mane' }),
  apep: b('Apep', 'serpent', '#5a2f6e', C.gold, 'boss', ['spiral', 'aimed', 'summon'], { weak: ['ra'] }),
  humbaba: b('Humbaba', 'lord', '#5a6b2f', C.gold, 'mini', ['slam', 'aimed']),
  lamashtu: b('Lamashtu', 'flyer', '#4b2f3a', C.blood, 'mini', ['spiral', 'summon']),
  tiamat: b('Tiamat', 'hydra', '#2f6f6a', '#f2e3c6', 'boss', ['spiral', 'ring', 'summon', 'slam'], {
    heads: 5,
    weak: ['marduk'],
  }),
  mahishasura: b('Mahishasura', 'beast', '#2b2b30', C.blood, 'mini', ['charge', 'slam'], {
    feat: 'horns',
    weak: ['durga'],
  }),
  vritra: b('Vritra', 'serpent', '#6a6a3a', C.gold, 'mini', ['aimed', 'spiral']),
  ravana: b('Ravana', 'lord', '#8a3a2a', C.gold, 'boss', ['aimed', 'ring', 'summon', 'slam'], {
    heads: 10,
    weak: ['hanuman', 'vishnu'],
  }),
  gashadokuro: b('Gashadokuro', 'lord', '#e0dccb', '#d83a2a', 'mini', ['slam', 'ring'], { feat: 'skull' }),
  nue: b('Nue', 'flyer', '#6a5a3a', C.gold, 'mini', ['spiral', 'aimed']),
  orochi: b('Yamata no Orochi', 'hydra', '#6a7a3a', C.blood, 'boss', ['spiral', 'aimed', 'summon', 'slam'], {
    heads: 8,
    weak: ['susanoo'],
  }),
  nian: b('Nian', 'beast', '#c23a2a', C.gold, 'mini', ['charge', 'ring'], { feat: 'horns' }),
  toro: b('Rey Demonio Toro', 'lord', '#3a3a3a', C.blood, 'mini', ['charge', 'slam'], {
    feat: 'horns',
    weak: ['wukong'],
  }),
  gonggong: b('Gonggong', 'serpent', '#2a6a8a', '#f2e3c6', 'boss', ['spiral', 'ring', 'summon']),
  cipactli: b('Cipactli', 'beast', '#4a6a3a', C.gold, 'mini', ['charge', 'summon']),
  mictlantecuhtli: b('Guardián del Mictlán', 'lord', '#e8e0cc', '#f2a22c', 'mini', ['slam', 'ring'], { feat: 'skull' }),
  itzpapalotl: b('Itzpapálotl', 'flyer', '#2a2230', '#c8a0e0', 'boss', ['spiral', 'aimed', 'summon', 'ring'], {
    feat: 'butterfly',
    weak: ['quetzalcoatl'],
  }),
  camazotz: b('Camazotz', 'flyer', '#3a2030', C.blood, 'mini', ['charge', 'spiral'], { feat: 'bat' }),
  vucub: b('Vucub Caquix', 'flyer', '#d03a2a', C.gold, 'mini', ['aimed', 'ring'], { feat: 'bird', weak: ['gemelos'] }),
  senores: b('Uno Muerte y Siete Muerte', 'lord', '#e0d8c0', '#3fb3b0', 'boss', ['slam', 'aimed', 'ring', 'summon'], {
    feat: 'skull',
    heads: 2,
    weak: ['gemelos'],
  }),
  ccoa: b('Ccoa, gato del granizo', 'beast', '#7a7a8a', '#f2f6ff', 'mini', ['charge', 'ring']),
  yacumama: b('Yacumama', 'serpent', '#3a6a3a', C.gold, 'mini', ['aimed', 'spiral']),
  amaru: b('Amaru', 'serpent', '#3aa0a0', C.gold, 'boss', ['spiral', 'ring', 'summon', 'aimed'], {
    feat: 'double',
    weak: ['illapa'],
  }),
  arun: b('Àrùn', 'lord', '#6a7a3a', '#d8f07a', 'mini', ['ring', 'summon']),
  ofo: b('Òfò', 'flyer', '#4a4a6a', '#c8ccd8', 'mini', ['spiral', 'aimed']),
  iku: b('Ikú', 'lord', '#1c1210', '#f2e3c6', 'boss', ['slam', 'spiral', 'summon', 'gaze'], {
    feat: 'skull',
    weak: ['ogun', 'shango'],
  }),
  dullahan: b('El Dullahan', 'lord', '#2a2a2a', '#9ad0e8', 'mini', ['charge', 'aimed'], { feat: 'headless' }),
  cathpalug: b('Cath Palug', 'beast', '#2a2a2a', '#9ad0e8', 'mini', ['charge', 'ring']),
  balor: b('Balor del ojo maligno', 'lord', '#3a4a3a', C.blood, 'boss', ['gaze', 'slam', 'summon', 'ring'], {
    feat: 'oneeye',
    weak: ['lugh'],
  }),

  ares: b('Ares, dios de la guerra', 'lord', '#8a2a1f', C.gold, 'mini', ['charge', 'slam', 'aimed'], {
    feat: 'helmet',
    weak: ['atenea'],
  }),
  minotauro: b('El Minotauro', 'lord', '#6a4a32', '#e8e0cc', 'mini', ['charge', 'slam'], { feat: 'horns' }),
  quimera: b('La Quimera', 'beast', '#c9862a', '#ff6a1a', 'mini', ['charge', 'spiral', 'ring'], {
    heads: 3,
    feat: 'mane',
  }),
  escila: b('Escila', 'hydra', '#3a6a7a', '#e8e0cc', 'mini', ['aimed', 'ring', 'summon'], {
    heads: 6,
    weak: ['poseidon'],
  }),
  tifon: b('Tifón, padre de monstruos', 'hydra', '#4a3a2a', '#ff6a1a', 'boss', ['spiral', 'ring', 'summon', 'slam'], {
    heads: 7,
    weak: ['zeus'],
  }),
  cronos: b('Cronos el titán', 'lord', '#5a5a6a', C.gold, 'boss', ['slam', 'ring', 'summon', 'gaze'], {
    feat: 'scythe',
    weak: ['zeus'],
  }),
  hrungnir: b('Hrungnir', 'lord', '#7a8090', '#9fe0ff', 'mini', ['slam', 'ring'], { feat: 'horns' }),
  surtr: b('Surtr', 'lord', '#3a1a10', '#ff6a1a', 'boss', ['slam', 'spiral', 'ring', 'summon'], {
    feat: 'horns',
    weak: ['freya'],
  }),
  jormungandr: b('Jörmungandr', 'serpent', '#3a6a4a', '#e8e0cc', 'boss', ['spiral', 'aimed', 'summon', 'ring'], {
    weak: ['thor'],
  }),
  sobek: b('Sobek desatado', 'beast', '#4a6a3a', '#e8e0cc', 'mini', ['charge', 'aimed']),
  set: b('Set, señor del caos', 'lord', '#8a3a2a', '#2f4f9e', 'boss', ['charge', 'aimed', 'ring', 'summon'], {
    feat: 'horns',
    weak: ['ra', 'anubis'],
  }),
  pazuzu: b('Pazuzu', 'flyer', '#5a5a3a', C.gold, 'mini', ['spiral', 'summon'], { feat: 'bat' }),
  kingu: b('Kingu', 'lord', '#2f4f6a', C.gold, 'boss', ['slam', 'aimed', 'ring', 'summon'], {
    feat: 'horns',
    weak: ['marduk'],
  }),
  kumbhakarna: b('Kumbhakarna', 'lord', '#5a4a3a', C.gold, 'mini', ['slam', 'charge']),
  raktabija: b('Raktabija', 'lord', '#7a1a1a', C.gold, 'boss', ['summon', 'ring', 'aimed', 'slam'], {
    weak: ['durga'],
  }),
  ushioni: b('Ushi-oni', 'beast', '#2a2a30', '#d83a2a', 'mini', ['charge', 'ring'], { feat: 'horns' }),
  omukade: b('Ōmukade', 'serpent', '#6a2a1a', C.gold, 'mini', ['spiral', 'aimed']),
  shuten: b('Shuten-dōji', 'lord', '#c23a2a', '#e8e0cc', 'boss', ['slam', 'summon', 'ring', 'aimed'], {
    feat: 'horns',
    weak: ['susanoo'],
  }),
  baigujing: b('Baigujing', 'lord', '#e8e0cc', '#e27aa8', 'mini', ['aimed', 'summon'], {
    feat: 'skull',
    weak: ['wukong'],
  }),
  yanluo: b('Yanluo, juez del inframundo', 'lord', '#2a2a3a', C.blood, 'boss', ['gaze', 'slam', 'ring', 'summon'], {
    feat: 'crown',
  }),
  coyolxauhqui: b('Coyolxauhqui', 'lord', '#c8ccd8', '#e27aa8', 'mini', ['spiral', 'aimed'], {
    weak: ['huitzilopochtli'],
  }),
  tlaltecuhtli: b('Tlaltecuhtli', 'beast', '#4a5a3a', C.blood, 'boss', ['charge', 'slam', 'summon', 'ring'], {
    feat: 'horns',
  }),
  zipacna: b('Zipacná', 'lord', '#7a5a3a', C.gold, 'mini', ['slam', 'charge'], { weak: ['gemelos'] }),
  ahpuch: b('Ah Puch', 'lord', '#e0d8c0', '#3fb3b0', 'boss', ['gaze', 'slam', 'summon', 'aimed'], {
    feat: 'skull',
    weak: ['chaac', 'ixchel'],
  }),
  pishtaco: b('El Pishtaco', 'lord', '#3a3a40', '#c8ccd8', 'mini', ['charge', 'aimed']),
  supayrey: b('Supay, rey del Uku Pacha', 'lord', '#6a2a2a', C.gold, 'boss', ['slam', 'ring', 'summon', 'spiral'], {
    feat: 'horns',
    weak: ['inti'],
  }),
  aroni: b('Aroni', 'beast', '#5a4a2a', '#7ad04a', 'mini', ['charge', 'ring']),
  aje: b('La gran Ajé', 'flyer', '#2a1a2a', '#d8f07a', 'boss', ['spiral', 'aimed', 'summon', 'ring'], {
    feat: 'bird',
    weak: ['oya'],
  }),
  twrch: b('Twrch Trwyth', 'beast', '#4a4040', '#e8e0cc', 'mini', ['charge', 'slam'], { feat: 'horns' }),
  arawn: b('Arawn, señor de Annwn', 'lord', '#2a3a4a', '#9ad0e8', 'boss', ['gaze', 'ring', 'summon', 'slam'], {
    feat: 'crown',
    weak: ['lugh'],
  }),
  ziz: b('Ziz', 'flyer', '#e8e0cc', C.gold, 'mini', ['spiral', 'aimed'], { feat: 'bird' }),
  abadon: b('Abadón', 'lord', '#2a1a1a', '#ff6a1a', 'boss', ['slam', 'spiral', 'summon', 'gaze'], {
    feat: 'horns',
    weak: ['jesus', 'dios'],
  }),
  khaos: b('Khaos', 'titan', '#08050c', '#b07aff', 'final', ['spiral', 'ring', 'summon', 'slam', 'gaze']),
};
