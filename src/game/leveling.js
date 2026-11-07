/* ---------- nivel ---------- */
function itemPicks(rich, lk) {
  const keys = Object.keys(ITEMS);
  const out = [];
  for (let t = 0; t < 40 && out.length < 3; t++) {
    let r = Math.min(99.9, Math.random() * 100 + (lk || 0) * 30);
    let rar =
      r < (rich ? 0 : 58) ? 'comun' : r < (rich ? 55 : 86) ? 'raro' : r < (rich ? 88 : 97) ? 'epico' : 'legendario';
    const pool = keys.filter((k) => ITEMS[k].rar === rar && !out.includes(k));
    const k = pick(pool);
    if (k) out.push(k);
  }
  return out;
}
function openItems() {
  const it = G.itemQueue[0],
    p = it.p;
  state = 'levelup';
  joy = null;
  look = null;
  keys.clear();
  $('luEyebrow').textContent = it.rich ? 'Cofre del jefe' : 'Cofre';
  $('luWho').textContent = players.length > 1 ? `${p.g.name} elige un objeto` : 'Elige un objeto';
  const box = $('cards');
  box.innerHTML = '';
  itemPicks(it.rich, it.p && it.p.luck).forEach((k, i) => {
    const d = ITEMS[k],
      n = p.items[k] || 0,
      rr = RAR[d.rar];
    const bt = document.createElement('button');
    bt.className = 'card rar-' + d.rar;
    bt.id = 'card-' + i;
    bt.style.setProperty('--rc', rr.col);
    bt.innerHTML = `<span class="ch">Objeto</span><span class="top2"><span class="em">${d.em}</span><span><span class="nm">${d.name}</span><br><span class="pill" style="background:${rr.col}">${rr.name}</span> <span class="lv">${n ? `x${n + 1} de ${d.max}` : `x1 de ${d.max}`}</span></span></span><span class="ds">${d.desc}</span><kbd>${i + 1}</kbd>`;
    bt.disabled = n >= d.max;
    bt.onclick = () => {
      p.items[k] = n + 1;
      d.apply(p);
      G.itemQueue.shift();
      refreshLoadout();
      afterPick();
    };
    box.appendChild(bt);
  });
  const sk = document.createElement('button');
  sk.className = 'card skip';
  sk.innerHTML = '<span class="nm">Llevar dracmas</span><span class="ds">+25 dracmas en lugar de un objeto.</span>';
  sk.onclick = () => {
    G.money += 25;
    G.itemQueue.shift();
    afterPick();
  };
  box.appendChild(sk);
  show('levelup');
}
function afterPick() {
  if (G.itemQueue.length || G.queue.length || G.pending > 0) openLevelUp();
  else {
    show(null);
    state = 'play';
    applyTheme(players[0].g.pan);
    computeConc();
  }
}
function openLevelUp() {
  if (G.itemQueue.length) {
    openItems();
    return;
  }
  if (!G.queue.length) {
    while (G.pending > 0) {
      G.pending--;
      for (const p of players) {
        if (p.ctrl === 'ai') autoPick(p);
        else G.queue.push(p);
      }
    }
  }
  if (!G.queue.length) {
    state = 'play';
    computeConc();
    return;
  }
  state = 'levelup';
  joy = null;
  look = null;
  keys.clear();
  const p = G.queue[0];
  $('luEyebrow').textContent =
    `Nivel ${G.level} · Armas ${Object.keys(p.weapons).length}/${MAX_WEAPONS} · Dones ${Object.keys(p.passives).length}/${MAX_PASSIVES}`;
  $('luWho').textContent = players.length > 1 ? `${p.g.name} elige un don` : 'Los dioses te ofrecen un don';
  applyTheme(p.g.pan);
  const picks = options(p);
  const box = $('cards');
  box.innerHTML = '';
  picks.forEach((o, i) => {
    const bt = document.createElement('button');
    bt.className = 'card k-' + o.t;
    bt.id = 'card-' + i;
    const info = optInfo(p, o);
    bt.innerHTML = `<span class="ch">${o.t === 'w' ? 'Arma' : o.t === 'p' ? 'Don' : o.t === 's' ? 'Mejora' : 'Curación'}</span><span class="top2"><span class="em">${info.em}</span><span><span class="nm">${info.nm}</span><br><span class="lv">${info.lv}</span></span></span><span class="ds">${info.ds}</span>${info.tag ? `<span class="tg">${info.tag}</span>` : ''}<kbd>${i + 1}</kbd>`;
    bt.onclick = () => {
      applyOpt(p, o);
      G.queue.shift();
      refreshLoadout();
      afterPick();
    };
    box.appendChild(bt);
  });
  show('levelup');
}
// mejoras básicas: no ocupan hueco de don y siempre puede salir al menos una al subir de nivel
const STAT_UPS = {
  vida: {
    name: 'Vitalidad',
    em: '❤',
    max: 10,
    desc: '+20 de vida máxima y te curas 20.',
    apply: (p) => ((p.maxHp += 20), heal(p, 20)),
  },
  fuerza: {
    name: 'Fuerza',
    em: '⚔',
    max: 10,
    desc: '+8 % de daño con todas tus armas.',
    apply: (p) => (p.dmgMul += 0.08),
  },
  regen: { name: 'Regeneración', em: '✚', max: 10, desc: '+0,4 de vida por segundo.', apply: (p) => (p.regen += 0.4) },
  veloc: {
    name: 'Agilidad',
    em: '➹',
    max: 6,
    desc: '+5 % de velocidad de movimiento.',
    apply: (p) => (p.speed *= 1.05),
  },
  guardia: {
    name: 'Guardia',
    em: '⛨',
    max: 5,
    desc: '+1 de armadura: cada golpe te quita 1 menos.',
    apply: (p) => (p.armor += 1),
  },
};
const MAX_WEAPONS = 4,
  MAX_PASSIVES = 6;
function statOptions(p) {
  p.sups = p.sups || {};
  return Object.keys(STAT_UPS)
    .filter((k) => (p.sups[k] || 0) < STAT_UPS[k].max)
    .map((k) => ({ t: 's', k }));
}
function options(p) {
  const pool = [];
  const r = REALMS[G.realm];
  for (const k in p.weapons) if (p.weapons[k].lvl < 7) pool.push({ t: 'w', k }, { t: 'w', k });
  if (Object.keys(p.weapons).length < MAX_WEAPONS) {
    const pan = r.pan;
    const loc = Object.keys(WEAPONS).filter((k) => WEAPONS[k].pan === pan && !p.weapons[k]);
    const other = shuffle(Object.keys(WEAPONS).filter((k) => !p.weapons[k] && WEAPONS[k].pan !== pan)).slice(0, 3);
    for (const k of [...loc, ...loc, ...other]) pool.push({ t: 'w', k });
  }
  const pc = Object.keys(p.passives).length;
  for (const k in PASSIVES) {
    const d = PASSIVES[k],
      l = p.passives[k] || 0;
    if (l >= 5) continue;
    if (!l && pc >= MAX_PASSIVES) continue;
    if (d.realm && d.realm !== G.realm && !l) continue;
    pool.push({ t: 'p', k });
    if (d.realm === G.realm && !l) pool.push({ t: 'p', k });
  }
  shuffle(pool);
  const picks = [];
  for (const o of pool) {
    if (!picks.some((q2) => q2.k === o.k)) picks.push(o);
    if (picks.length === 3) break;
  }
  // una de las tres cartas es siempre una mejora básica (vida, fuerza, regeneración…)
  const st = shuffle(statOptions(p));
  if (st.length) {
    if (picks.length >= 3) picks[2] = st[0];
    else picks.push(st[0]);
    if (picks.length < 3 && st[1]) picks.push(st[1]);
  }
  if (!picks.length) picks.push({ t: 'heal' });
  return picks;
}

function wStats(Wd, l, p) {
  const s = kst(Wd, l, p),
    out = [];
  const add = (k, label, v, txt, low) => out.push({ k, label, v, txt: txt || String(v), low: !!low });
  if (s.dmg != null) add('dmg', 'Daño', Math.round(s.dmg * pMul(p)));
  if (s.cd != null) {
    const c = s.cd * p.cdMul;
    add('cd', 'Recarga', +c.toFixed(2), c.toFixed(2).replace('.', ',') + ' s', true);
  }
  if (s.tick != null) add('cd', 'Golpea cada', s.tick, String(s.tick).replace('.', ',') + ' s', true);
  if (Wd.k === 'chain') {
    add('cnt', 'Rayos', s.bolts);
    add('chn', 'Saltos', s.chains);
  } else if (Wd.k === 'orbit') add('cnt', 'Orbes', s.count);
  else if (Wd.k === 'sword') {
    add('cnt', 'Espadas', s.count);
    add('sr', 'Tajo', Math.round(s.sr * p.area));
  } else if (s.count != null) add('cnt', 'Proyectiles', s.count);
  if (s.pierce != null && Wd.k === 'shot') add('prc', 'Atraviesa', s.pierce);
  if (s.bounces != null) add('bnc', 'Rebotes', s.bounces);
  if (s.radius != null)
    add('rad', 'Radio', Math.round(s.radius * p.area * (Wd.k === 'orbit' ? 1 : 1 + ((p.range || 1) - 1) * 0.5)));
  else {
    const rc = Math.round(weaponReach(Wd, s, p));
    if (rc) add('rch', 'Alcance', rc);
  }
  if (s.rot != null) add('rot', 'Giro', +s.rot.toFixed(2), s.rot.toFixed(2).replace('.', ','));
  if (s.life != null && Wd.k === 'trail')
    add('life', 'Duración', +s.life.toFixed(2), s.life.toFixed(2).replace('.', ',') + ' s');
  if (s.arc != null) add('arc', 'Barrido', Math.round(s.arc * 57.3), Math.round(s.arc * 57.3) + '°');
  if (s.both != null) add('both', 'Ambos lados', s.both ? 1 : 0, s.both ? 'Sí' : 'No');
  return out;
}
function wStatsHtml(Wd, cur, nxt, p) {
  const B = wStats(Wd, nxt, p),
    A = cur ? wStats(Wd, cur, p) : null;
  return (
    '<span class="wst">' +
    B.map((b, i) => {
      const a = A && A.find((x) => x.label === b.label);
      if (!a) return `<span><em>${b.label}</em><b>${b.txt}</b></span>`;
      const up = b.low ? b.v < a.v : b.v > a.v,
        same = b.v === a.v;
      return same
        ? `<span class="same"><em>${b.label}</em><b>${b.txt}</b></span>`
        : `<span class="${up ? 'up' : 'dn'}"><em>${b.label}</em><b>${a.txt} → ${b.txt}</b></span>`;
    }).join('') +
    '</span>'
  );
}
function optInfo(p, o) {
  if (o.t === 'w') {
    const d = WEAPONS[o.k],
      w = p.weapons[o.k];
    return {
      em: d.em,
      nm: d.name.toUpperCase(),
      lv: w ? `Nivel ${w.lvl} → ${w.lvl + 1}` : `Arma nueva · ${d.pan}`,
      ds: (w ? '' : esc(d.desc)) + wStatsHtml(d, w ? w.lvl : 0, w ? w.lvl + 1 : 1, p),
    };
  }
  if (o.t === 'p') {
    const d = PASSIVES[o.k],
      l = p.passives[o.k] || 0;
    return {
      em: d.em,
      nm: d.name.toUpperCase(),
      lv: l ? `Nivel ${l} → ${l + 1}` : d.realm ? `Reliquia de ${REALMS[d.realm].name}` : 'Don nuevo',
      ds: d.desc,
      tag: d.tag ? CONCILIOS[d.tag].name : '',
    };
  }
  if (o.t === 's') {
    const d = STAT_UPS[o.k],
      l = (p.sups && p.sups[o.k]) || 0;
    return { em: d.em, nm: d.name.toUpperCase(), lv: `Mejora ${l} → ${l + 1} de ${d.max}`, ds: d.desc };
  }
  return { em: '✚', nm: 'NÉCTAR', lv: 'Curación', ds: 'Recuperas 40 de vida.' };
}
function applyOpt(p, o) {
  if (o.t === 'w') {
    if (p.weapons[o.k]) p.weapons[o.k].lvl++;
    else p.weapons[o.k] = { lvl: 1, t: 0.3, ang: 0, tick: 0, acc: 0 };
  } else if (o.t === 'p') {
    p.passives[o.k] = (p.passives[o.k] || 0) + 1;
    PASSIVES[o.k].apply(p);
  } else if (o.t === 's') {
    p.sups = p.sups || {};
    p.sups[o.k] = (p.sups[o.k] || 0) + 1;
    STAT_UPS[o.k].apply(p);
  } else heal(p, 40);
}
function autoPick(p) {
  const o = pick(options(p));
  applyOpt(p, o);
  refreshLoadout();
}

function endGame(win) {
  if (state === 'end') return;
  state = 'end';
  joy = null;
  look = null;
  if (document.pointerLockElement)
    try {
      document.exitPointerLock();
    } catch (err) {}
  if (G.realm) G.mapScore[G.realm] = Math.max(G.mapScore[G.realm] || 0, G.realmScore);
  track('game_end', { win: !!win, score: Math.round(G.score || 0), level: G.level, mode: cfg.mode });
  const evK = weekEvent().realm,
    evOn = G.visited.includes(evK);
  const coins = Math.round((G.money + G.goldTotal * 0.2 + (win ? 500 : 0) + G.level * 5) * DF().rew * (evOn ? 1.5 : 1));
  {
    const st = PROF.stats;
    st.bossKeys = st.bossKeys || {};
    for (const k of G.bossKeys) st.bossKeys[k] = (st.bossKeys[k] || 0) + 1;
    st.winsByDiff = st.winsByDiff || {};
    if (win) st.winsByDiff[G.diffKey] = (st.winsByDiff[G.diffKey] || 0) + 1;
    if (G.khaosHard) st.khaosHard = (st.khaosHard || 0) + 1;
    checkSecrets(false);
  }
  PROF.coins += coins;
  PROF.runs++;
  PROF.stats.kills += G.kills;
  PROF.stats.bosses += G.bossKills;
  PROF.stats.chests += G.chestsOpened;
  if (win) PROF.stats.wins++;
  dailyAdd('d_runs', 1);
  dailyAdd('d_kills', G.kills);
  dailyAdd('d_boss', G.bossKills);
  dailyAdd('d_chests', G.chestsOpened);
  dailyAdd('d_realms', new Set(G.visited).size);
  dailyAdd('d_elites', G.elites);
  saveProfile();
  const sc = runScore(win);
  uiEnd(win, coins, { sc });
  if (evOn) {
    const r = $('enRoute');
    if (r)
      r.insertAdjacentHTML(
        'afterbegin',
        `<div class="unlockmsg">Evento de la semana: ×1,5 dracmas en ${REALMS[evK].name}</div>`
      );
  }
  if (G.unlocked && G.unlocked.length) {
    const r = $('enRoute');
    if (r)
      r.insertAdjacentHTML(
        'afterbegin',
        `<div class="unlockmsg">¡Dios secreto desbloqueado: ${G.unlocked.map((id) => GOD[id].name).join(' y ')}!</div>`
      );
  }
  submitScore(win)
    .then((r) => uiEndScore(r))
    .catch(() => {});
  if (NET.sala) {
    NET.inRun = false;
    salaPresence({ phase: 'lobby' });
  }
}
