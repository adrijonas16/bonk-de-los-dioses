/* Bonk de los Dioses · lógica de juego en 3D */
let state = 'menu',
  G = null,
  players = [],
  npcs = [],
  enemies = [],
  proj = [],
  bullets = [],
  gems = [],
  heals = [],
  drops = [],
  fx = [],
  texts = [],
  allies = [],
  patches = [],
  coins = [];
const cfg = { mode: 'ragnarok', party: 'solo', picks: [], realm: 'tartaro', diff: 'normal', qTest: 'azar' };
const DIFF = {
  normal: { name: 'Normal', hp: 1.1, dmg: 1.1, sp: 1.05, el: 1, rew: 1, ev: 1 },
  dificil: { name: 'Difícil', hp: 1.7, dmg: 1.5, sp: 1.3, el: 2, rew: 1.6, ev: 1.35 },
  pesadilla: { name: 'Pesadilla', hp: 2.6, dmg: 2, sp: 1.6, el: 3, rew: 2.5, ev: 1.7 },
};
function DF() {
  return DIFF[(G && G.diffKey) || 'normal'] || DIFF.normal;
}
const VIEW = 560,
  GRAV = 1150,
  JUMP = 440;

function makePlayer(id, ctrl, i) {
  const g = GOD[id];
  const p = {
    god: id,
    g,
    ctrl,
    idx: i,
    x: i * 40 - 20,
    y: 60,
    z: 0,
    vz: 0,
    air: false,
    r: 14,
    hp: g.hp,
    maxHp: g.hp,
    speed: g.spd * 1.15,
    armor: 0,
    regen: 0,
    steal: 0,
    dmgMul: 1,
    cdMul: 1,
    area: 1,
    magnet: 80,
    xpMul: 1,
    countBonus: 0,
    chainBonus: 0,
    crit: 0,
    bossDmg: 0,
    execute: 0,
    stunChance: 0,
    confuse: 0,
    slowAura: 0,
    healMul: 1,
    dropMul: 1,
    powCdMul: 1,
    lives: 0,
    reviveMul: 1,
    markMul: 1,
    range: 1,
    luck: 0,
    nectar: 1,
    nectarCd: 0,
    fx: 0,
    fy: -1,
    step: 0,
    moving: false,
    inv: 0,
    pow: 4,
    hidden: 0,
    radiant: 0,
    shield: 0,
    rage: 0,
    giant: 0,
    crown: 0,
    charging: 0,
    cvx: 0,
    cvy: 0,
    chHit: null,
    bond: false,
    frenzy: 0,
    frenzyT: 0,
    down: false,
    revive: 0,
    weapons: {},
    passives: {},
    items: {},
    kills: 0,
    mk: 0,
    say: '',
    sayT: 0,
    col: ['#e8b53e', '#7de0ff', '#c8a0ff'][i] || C.bone,
    aiT: 0,
    aiTx: 0,
    aiTy: 0,
    jumpQ: false,
    goldMul: 1,
    evasion: 0,
    thorns: 0,
    extraJumps: 0,
    jumpsLeft: 0,
    critDmg: 1,
    invBonus: 0,
    pocketBolt: 0,
    pbT: 8,
    levelHeal: false,
    dashT: 0,
    dashCd: 0,
    powSeq: 0,
    wantE: false,
  };
  g.set(p);
  if (ctrl === 'p1' || ctrl === 'p2') applyUpgrades(p);
  p.hp = p.maxHp;
  p.weapons[g.w] = { lvl: 1, t: 0.3, ang: 0, tick: 0, acc: 0 };
  return p;
}
function relOf(a, b) {
  for (const r of REL) {
    if ((r[0] === a && r[1] === b) || (r[0] === b && r[1] === a))
      return { type: r[2], a: r[0], la: r[3], lb: r[4], combo: r[5] || '' };
  }
  return null;
}
function needFor(l) {
  return Math.floor(5 + l * 4 + l * l * 0.65);
}

function weekEvent() {
  const wk = Math.floor((Date.now() / 864e5 + 3) / 7);
  const ks = Object.keys(REALMS).filter((k) => k !== 'vacio' && k !== 'cielo');
  const realm = ks[(wk * 7 + 3) % ks.length];
  const ends = (wk + 1) * 7 * 864e5 - 3 * 864e5;
  return { realm, ends, wk };
}
function newRun() {
  setTimeout(focusGame, 0);
  allies = [];
  npcs = [];
  players = cfg.picks.map((pk, i) => makePlayer(pk.id, pk.ctrl, i));
  if (cfg.party !== 'online') {
    remotes = [];
  }
  G = {
    mode: cfg.mode,
    score: 0,
    combo: 0,
    comboT: 0,
    bestCombo: 0,
    wave: 1,
    waveT: 0,
    lowTip: 0,
    t: 0,
    kills: 0,
    level: 1,
    xp: 0,
    need: needFor(1),
    pending: 0,
    queue: [],
    ridx: 0,
    visited: [],
    realm: null,
    rt: 0,
    events: [],
    bosses: [],
    portals: null,
    cycle: 0,
    lastPow: [-99, -99],
    duelT: 60,
    conc: {},
    trueT: 4,
    warKills: 0,
    rel: players.length > 1 ? relOf(players[0].god, players[1].god) : null,
    coop: players.filter((p) => p.ctrl !== 'ai').length > 1,
    yaw: 0,
    pitch: 0.82,
    zoom: 1,
    online: cfg.party === 'online',
    itemQueue: [],
    money: 0,
    diffKey: cfg.diff || 'normal',
    evT: 40,
    slowT: 0,
    darkT: 0,
    sandT: 0,
    bossKeys: [],
    khaosHard: false,
    gold: 0,
    goldTotal: 0,
    chestsBought: 0,
    boltQ: [],
    shake: 0,
    flashT: 0,
    stormT: 0,
    curse: 0,
    challenge: null,
    dmgTotal: 0,
    dmgWin: [],
    streak: 0,
    streakT: 0,
    bestStreak: 0,
    bossKills: 0,
    mapScore: {},
    realmScore: 0,
    noHitT: 0,
    chestsOpened: 0,
    elites: 0,
    missionsDone: 0,
  };
  applyTheme(players[0].g.pan);
  startRealm(cfg.realm);
  show(null);
  buildHud();
  $('hud').hidden = false;
  state = 'play';
}
function startRealm(key) {
  if (G.realm) G.mapScore[G.realm] = Math.max(G.mapScore[G.realm] || 0, G.realmScore);
  G.realmScore = 0;
  G.realm = key;
  G.rt = 0;
  G.visited.push(key);
  G.portals = null;
  G.bosses = [];
  enemies = [];
  bullets = [];
  proj = [];
  patches = [];
  fx = [];
  texts = [];
  npcs = [];
  for (const gm of gems) G.xp += gm.v;
  gems = [];
  heals = [];
  drops = [];
  for (const c of coins) addGold(c.v, players[0]);
  coins = [];
  G.boltQ = [];
  G.challenge = null;
  allies = allies.filter((a) => a.type === 'dog');
  buildWorld(key);
  clearObjs();
  const [sx, sy] = spawnPt(key);
  questsStart(key);
  players.forEach((p, i) => {
    p.x = sx + i * 40 - 20;
    p.y = sy;
    p.z = surfaceAt(p.x, p.y);
    p.vz = 0;
    if (p.down) {
      p.down = false;
      p.hp = p.maxHp * 0.4;
    }
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.3);
    p.inv = 2;
  });
  for (const p of players)
    if (p.dog && !allies.some((a) => a.type === 'dog' && a.o === p)) allies.push(mkAlly('dog', p, p.x, p.y, Infinity));
  G.diff = 1 + G.ridx * 0.7;
  const r = REALMS[key];
  if (key === 'vacio') {
    const prev = G.visited.filter((v) => v !== 'vacio');
    {
      const rr = REALMS[pick(prev.length ? prev : ['tartaro'])];
      G.events = [
        { t: 80, key: pick(rr.bosspool || [rr.boss]), corrupt: true },
        { t: 180, key: 'khaos' },
      ];
    }
  } else {
    const [m1, m2] = shuffle((r.minipool || r.minis).slice());
    G.events = [
      { t: 120, key: m1 },
      { t: 240, key: m2 || m1 },
      { t: 360, key: pick(r.bosspool || [r.boss]) },
    ];
    if (G.mode === 'libre' && (G.wave || 1) > 1) G.events.forEach((ev) => (ev.t *= 0.7));
    scheduleNemesis();
  }
  G.missions = shuffle(RUN_MISSIONS.slice())
    .slice(0, 3)
    .map((m) => ({ id: m.id, n: pick(m.n), prog: 0, done: false, rew: m.rew, txt: '' }));
  G.missions.forEach((m) => {
    m.txt = RUN_MISSIONS.find((x) => x.id === m.id).txt(m.n);
  });
  G.noHitT = 0;
  bigBanner(r.name, r.sub);
  if (REALM_STORY[key] && key !== 'cielo')
    setTimeout(() => {
      if (state === 'play' && G.realm === key) banner(REALM_STORY[key]);
    }, 3600);
  if (key === 'cielo') setTimeout(() => cieloVoice(), 3400);
  if (G.ridx === 0 && players.length > 1) introLines();
}
function cieloVoice() {
  if (state !== 'play' || G.realm !== 'cielo') return;
  const ps = players.map((p) => p.god);
  if (ps.includes('dios')) bigBanner('«BIENVENIDOS A CASA»', 'Los cielos reconocen a su Creador');
  else if (ps.includes('zeus')) bigBanner('«ZEUS, AQUÍ EL TRONO YA TIENE DUEÑO»', 'Una voz retumba entre las nubes');
  else bigBanner(`«BIENVENIDO A MIS CIELOS, ${players[0].g.name.toUpperCase()}»`, 'Una voz retumba entre las nubes');
}
function introLines() {
  const [a, b] = players;
  const rl = G.rel;
  if (rl) {
    const la = rl.a === a.god ? rl.la : rl.lb,
      lb = rl.a === a.god ? rl.lb : rl.la;
    say(a, la, 0.2);
    say(b, lb, 2.4);
  } else {
    const l = pick(LINES.neutral);
    say(a, l[0], 0.2);
    say(b, l[1], 2.4);
  }
}
