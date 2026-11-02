/* ---------- Misiones ---------- */
const RUN_MISSIONS = [
  { id: 'kills', txt: (n) => `Derrota a ${n} enemigos en este reino`, n: [120, 180, 250], rew: 60 },
  { id: 'chests', txt: (n) => `Abre ${n} cofres`, n: [2, 3], rew: 70 },
  { id: 'altars', txt: (n) => `Activa ${n} altares`, n: [1, 2], rew: 80 },
  { id: 'elites', txt: (n) => `Derrota a ${n} enemigos élite`, n: [2, 3], rew: 80 },
  { id: 'mini', txt: () => 'Derrota a un minijefe', n: [1], rew: 90 },
  { id: 'nohit', txt: (n) => `Aguanta ${n} s seguidos sin recibir daño`, n: [30, 45], rew: 90 },
  { id: 'air', txt: (n) => `Derrota a ${n} enemigos mientras estás en el aire`, n: [15, 25], rew: 70 },
  { id: 'power', txt: (n) => `Usa tu poder divino ${n} veces`, n: [3, 4], rew: 50 },
];
const DAILY = [
  { id: 'd_runs', txt: 'Juega 2 partidas', n: 2, rew: 120 },
  { id: 'd_boss', txt: 'Derrota a 3 jefes o minijefes', n: 3, rew: 160 },
  { id: 'd_kills', txt: 'Derrota a 600 enemigos', n: 600, rew: 150 },
  { id: 'd_chests', txt: 'Abre 6 cofres', n: 6, rew: 120 },
  { id: 'd_online', txt: 'Juega una partida online con alguien', n: 1, rew: 200 },
  { id: 'd_realms', txt: 'Visita 3 reinos distintos', n: 3, rew: 140 },
  { id: 'd_missions', txt: 'Completa 5 misiones de reino', n: 5, rew: 180 },
  { id: 'd_elites', txt: 'Derrota a 8 élites', n: 8, rew: 150 },
];
