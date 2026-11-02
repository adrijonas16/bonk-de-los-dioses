/* Bonk de los Dioses · perfil, tienda en la nube, clasificación y cooperativo online */
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
function freshProfile() {
  return {
    coins: 150,
    owned: [...FREE_GODS],
    up: { hp: 0, dmg: 0, spd: 0, mag: 0, gold: 0, rev: 0 },
    clan: '',
    best: { score: 0, byMap: {}, endless: 0 },
    runs: 0,
    god: 'zeus',
    daily: { day: '', prog: {}, claimed: {} },
    stats: { kills: 0, bosses: 0, chests: 0, wins: 0 },
    at: 0,
  };
}
let PROF = freshProfile();
try {
  const s = store && JSON.parse(store.getItem('bonk-perfil') || 'null');
  if (s) PROF = Object.assign(freshProfile(), s);
} catch (err) {}
const NET = {
  ready: false,
  db: null,
  room: null,
  user: null,
  uid: null,
  myName: '',
  names: {},
  lobby: [],
  sala: null,
  code: '',
  salaPeers: [],
  isHost: false,
  inRun: false,
  lastSend: 0,
  online: 0,
  salas: [],
  board: null,
  boardAt: 0,
};
let remotes = [];
