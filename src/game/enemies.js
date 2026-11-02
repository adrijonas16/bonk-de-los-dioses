/* ---------- enemigos ---------- */
function camera() {
  const hs = players.filter((p) => p.ctrl !== 'ai');
  const L = hs.length ? hs : players;
  let x = 0,
    y = 0;
  for (const p of L) {
    x += p.x;
    y += p.y;
  }
  return { x: x / L.length, y: y / L.length };
}
function realmEnemyList() {
  if (G.realm === 'vacio') {
    const v = G.visited.filter((k) => k !== 'vacio');
    return REALMS[pick(v.length ? v : ['tartaro'])].en;
  }
  return REALMS[G.realm].en;
}
function pickEnemy() {
  const en = realmEnemyList(),
    r = Math.random(),
    rt = G.rt + (G.realm === 'vacio' ? 240 : 0);
  if (rt > 200 && r < 0.1) return en[3] || en[0];
  if (rt > 110 && r < 0.3) return en[2] || en[0];
  if (rt > 40 && r < 0.56) return en[1] || en[0];
  return en[0];
}
function spawnPos(ang) {
  const c = camera();
  for (let t = 0; t < 10; t++) {
    const a = (ang ?? rand(0, 6.2832)) + t * 0.7,
      r = rand(560, 700);
    let x = c.x + Math.cos(a) * r,
      y = c.y + Math.sin(a) * r;
    if (Math.hypot(x, y) < ARENA - 60) return [x, y];
  }
  const a = rand(0, 6.28);
  return [Math.cos(a) * (ARENA - 80), Math.sin(a) * (ARENA - 80)];
}
function waveK() {
  return G.mode === 'libre' ? Math.max(0, (G.wave || 1) - 1) : 0;
}
function spawn(key, ang) {
  const d = ENEMIES[key];
  const [x, y] = spawnPos(ang);
  const coop = players.length > 1 ? 1.35 : 1;
  const hm = (1 + G.ridx * 0.85 + (G.rt / 60) * 0.34 + G.cycle * 0.6) * coop * (1 + 0.3 * remotesHere().length);
  const W = waveK(),
    wh = Math.pow(1.55, W),
    wd = Math.pow(1.3, W);
  const el = G.rt > 50 && Math.random() < 0.035 * DF().el * (1 + 0.25 * W);
  const DD = DF();
  enemies.push({
    key,
    d,
    x,
    y,
    z: groundAt(x, y),
    hp: d.hp * hm * wh * DD.hp * (el ? 7 : 1),
    maxHp: d.hp * hm * wh * DD.hp * (el ? 7 : 1),
    spd:
      d.spd *
      rand(0.9, 1.1) *
      (el ? 0.9 : 1) *
      (DD.hp > 1.5 ? 1.08 : 1) *
      Math.min(2.2, 1 + 0.12 * ((G.wave || 1) - 1)),
    dmg: d.dmg * DD.dmg * (1 + G.ridx * 0.35 + (G.rt / 600) * 0.5) * wd * (el ? 1.5 : 1),
    r: d.r * (el ? 1.4 : 1),
    xp: d.xp * (el ? 6 : 1),
    elite: el,
    flash: 0,
    soul: 0,
    ph: rand(0, 6.28),
    stun: 0,
    slow: 0,
    mark: 0,
    conf: 0,
    shH: 0,
  });
}
const TIER_HP = { mini: 900, boss: 2400, final: 7000 };
function nemesisFor(god) {
  const ks = Object.keys(BOSSES).filter(
    (k) => BOSSES[k].tier !== 'final' && !k.startsWith('sombra_') && (BOSSES[k].weak || []).includes(god)
  );
  if (ks.length) return ks;
  const sk = shadowNemesis(god);
  return sk ? [sk] : [];
}
function shadowNemesis(god) {
  const rel = REL.find((r) => r[2] === 'rival' && (r[0] === god || r[1] === god));
  let rid = rel ? (rel[0] === god ? rel[1] : rel[0]) : null;
  if (!rid || !GOD[rid]) {
    const others = GODS.filter((g) => g.pan !== (GOD[god] && GOD[god].pan) && g.id !== 'khaos');
    let h = 0;
    for (const ch of god) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    rid = others[h % others.length].id;
  }
  const key = 'sombra_' + rid;
  if (!BOSSES[key]) {
    const L = LOOKS[rid] || {};
    BOSSES[key] = {
      name: 'Sombra de ' + GOD[rid].name,
      arch: 'lord',
      col: shade(L.r || '#5a4a6a', -0.45),
      acc: '#b06cff',
      tier: 'mini',
      pats: ['aimed', 'spiral', 'summon', 'charge'],
      heads: 1,
      weak: [],
      friend: [],
      shadowOf: rid,
    };
    if (typeof BHUMAN !== 'undefined')
      BHUMAN[key] = {
        look: Object.assign({}, L, { r: shade(L.r || '#5a4a6a', -0.45), t: '#b06cff', cc: '#1a0a2a' }),
        style: (typeof HSTYLE !== 'undefined' && HSTYLE[rid]) || 'tunic',
        k: 2.4,
      };
  }
  if (!BOSSES[key].weak.includes(god)) BOSSES[key].weak.push(god);
  return key;
}
function scheduleNemesis() {
  G.nemMet = G.nemMet || [];
  const humans = players.filter((p) => p.ctrl === 'p1' || p.ctrl === 'p2');
  if (!humans.length) return;
  const p = pick(humans);
  const c = nemesisFor(p.god).filter((k) => !G.nemMet.includes(k));
  if (!c.length) return;
  const chance = G.nemMet.length ? 0.35 : 0.75;
  if (Math.random() > chance) return;
  const key = pick(c);
  G.nemMet.push(key);
  const t = rand(160, 215);
  G.events.push({ t, key, nem: p.god, corrupt: key.startsWith('sombra_') });
  G.events.sort((a, b) => a.t - b.t);
}
function spawnBoss(key, corrupt, nem) {
  const d = BOSSES[key];
  const [x, y] = spawnPos();
  const coop = players.length > 1 ? 1.5 : 1;
  const hp =
    TIER_HP[d.tier] * G.diff * (1 + G.cycle * 0.9) * Math.pow(1.55, waveK()) * coop * (corrupt ? 1.3 : 1) * DF().hp;
  const r = d.tier === 'final' ? 58 : d.tier === 'boss' ? 42 : 32;
  const e = {
    key,
    d,
    boss: true,
    tier: d.tier,
    x,
    y,
    z: groundAt(x, y),
    hp,
    maxHp: hp,
    spd: d.tier === 'final' ? 55 : 70,
    dmg: (d.tier === 'mini' ? 22 : 30) * (1 + G.ridx * 0.3) * Math.pow(1.3, waveK()) * DF().dmg,
    r,
    xp: d.tier === 'mini' ? 40 : 90,
    flash: 0,
    soul: 0,
    ph: rand(0, 6.28),
    stun: 0,
    slow: 0,
    mark: 0,
    conf: 0,
    pc: 2.5,
    pi: 0,
    charge: 0,
    cvx: 0,
    cvy: 0,
    spiral: 0,
    sa: 0,
    corrupt: !!corrupt,
    hist: [],
    face: 1,
  };
  if (d.arch === 'serpent') {
    e.segs = [];
    const n = d.tier === 'boss' ? 14 : 9;
    for (let i = 0; i < n; i++) e.segs.push({ proxy: e, x, y, r: r * (1 - (i / n) * 0.5) * 0.8 });
    for (let i = 0; i < n * 8; i++) e.hist.push([x, y]);
  }
  if (nem) {
    e.nem = nem;
    e.tier = 'mini';
    e.hp *= d.tier === 'mini' ? 1.4 : 0.8;
    e.maxHp = e.hp;
    e.spd *= 1.15;
  }
  enemies.push(e);
  G.bosses.push(e);
  if (nem) {
    bigBanner(
      '¡TU NÉMESIS: ' + d.name.toUpperCase() + '!',
      `Viene a por ${GOD[nem].name}. Si la vences: cofre rico y +25 000 puntos`
    );
    const pp = players.find((q) => q.god === nem);
    if (pp)
      say(
        pp,
        d.shadowOf
          ? `¿${GOD[d.shadowOf].name}? No... solo su sombra.`
          : pick(['Sabía que vendrías.', 'Otra vez tú...', 'Esta vez acabo contigo.']),
        1.4
      );
  } else
    bigBanner(
      d.name.toUpperCase(),
      d.tier === 'final'
        ? 'La nada que se traga a los dioses'
        : d.tier === 'boss'
          ? 'El guardián del reino despierta'
          : 'Un monstruo se interpone'
    );
  const wk = players.find((p) => d.weak.includes(p.god));
  if (wk) say(wk, 'Ya te vencí una vez.', 1.2);
  const fr = players.find((p) => d.friend.includes(p.god));
  if (fr) say(fr, 'Tranquilo, chico. Muérdelos a ellos.', 1.2);
  if (d.tier === 'final') setTimeout(summonHelper, 2600);
  return e;
}
function summonHelper() {
  if (state !== 'play' && state !== 'levelup') return;
  const ps = players.map((p) => p.god);
  const id = ['dios', 'jesus', 'zeus'].find((k) => !ps.includes(k));
  if (!id) return;
  const c = camera(),
    n = makePlayer(id, 'npc', 2);
  n.x = c.x;
  n.y = c.y - 60;
  n.z = surfaceAt(n.x, n.y) + 260;
  n.air = true;
  n.col = '#fff6e0';
  n.pow = 3;
  n.dmgMul = 1 + G.level * 0.08;
  const w = n.weapons[n.g.w];
  w.lvl = 6;
  npcs.push(n);
  bigBanner(
    id === 'dios' ? 'DIOS DESCIENDE A AYUDAR' : `${n.g.name.toUpperCase()} DESCIENDE A AYUDAR`,
    id === 'dios' ? '«Hágase la luz.»' : 'Hasta los dioses necesitan aliados'
  );
  say(n, id === 'dios' ? 'Khaos, aquí termina tu noche.' : '¡Aguantad, ya estoy aquí!', 1.5);
  flash('#fff6e0', 1);
}
function updNpcs(dt) {
  for (const n of npcs) {
    const c = camera();
    const tx = c.x + Math.cos(T * 0.4) * 90,
      ty = c.y + Math.sin(T * 0.4) * 90 - 40;
    const dx = tx - n.x,
      dy = ty - n.y,
      d = Math.hypot(dx, dy);
    if (d > 6) {
      n.x += (dx / d) * Math.min(d, 200 * dt);
      n.y += (dy / d) * Math.min(d, 200 * dt);
      n.fx = dx / d;
      n.fy = dy / d;
      n.moving = true;
      n.step += dt * 6;
    } else n.moving = false;
    n.z = Math.max(surfaceAt(n.x, n.y) + 30 + Math.sin(T * 2) * 6, n.z - 120 * dt);
    n.sayT -= dt;
    fireWeapons(n, dt);
    n.pow -= dt;
    if (n.pow <= 0) {
      n.pow = 14;
      const m = 1 + G.level * 0.07;
      flash('#fff6e0', 0.7);
      for (const e of enemies) if (!e.dead && onScreen(e)) hurt(e, (e.boss ? 160 : 90) * m, n);
      fx.push({ k: 'ring', x: n.x, y: n.y, r: VIEW, t: 0.8, max: 0.8, col: '#fff6e0' });
      banner(n.g.pn.toUpperCase());
    }
  }
}
function targetFor(e) {
  let best = null,
    bd = 1e12;
  for (const p of players) {
    if (p.down || p.hidden > 0) continue;
    if (e.boss && e.d.friend.includes(p.god)) continue;
    const d = (p.x - e.x) ** 2 + (p.y - e.y) ** 2;
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  for (const a of allies) {
    if (!a.taunt) continue;
    const d = ((a.x - e.x) ** 2 + (a.y - e.y) ** 2) * 0.5;
    if (d < bd) {
      bd = d;
      best = a;
    }
  }
  for (const r of remotes) {
    if (r.dn || r.hidden > 0 || r.realm !== G.realm) continue;
    const d = (r.x - e.x) ** 2 + (r.y - e.y) ** 2;
    if (d < bd) {
      bd = d;
      best = r;
    }
  }
  return best;
}
function bullet(x, y, z, a, sp, dmg, col, r) {
  if (bullets.length < 500)
    bullets.push({ x, y, z, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg, col, r: r || 7, t: 5 });
}
function bossPattern(e, tg) {
  const d = e.d,
    pat = d.pats[e.pi % d.pats.length];
  e.pi++;
  const dmg = 12 * (1 + G.ridx * 0.35) * (d.tier === 'final' ? 1.4 : 1),
    col = d.acc,
    bz = e.z + 22;
  const ta = tg ? Math.atan2(tg.y - e.y, tg.x - e.x) : 0;
  switch (pat) {
    case 'charge':
      if (tg) {
        e.charge = 0.85;
        e.cvx = Math.cos(ta);
        e.cvy = Math.sin(ta);
        fx.push({
          k: 'tele',
          shape: 'line',
          x: e.x,
          y: e.y,
          x2: e.x + Math.cos(ta) * 500,
          y2: e.y + Math.sin(ta) * 500,
          w: e.r * 2,
          t: 0.45,
          max: 0.45,
          dmg: 0,
        });
        e.chargeDelay = 0.45;
      }
      break;
    case 'ring': {
      const n = d.tier === 'mini' ? 14 : 20;
      const off = rand(0, 1);
      for (let i = 0; i < n; i++) bullet(e.x, e.y, bz, ((i + off) / n) * 6.2832, 150, dmg, col);
      break;
    }
    case 'spiral':
      e.spiral = 2.2;
      break;
    case 'aimed':
      for (let i = -2; i <= 2; i++) bullet(e.x, e.y, bz, ta + i * 0.18, 230, dmg, col);
      break;
    case 'summon': {
      const en = realmEnemyList();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * 6.28;
        const k = en[i % 2];
        const dd = ENEMIES[k];
        const hm = 1 + G.ridx * 0.85 + (G.rt / 60) * 0.34;
        const x = e.x + Math.cos(a) * (e.r + 30),
          y = e.y + Math.sin(a) * (e.r + 30);
        enemies.push({
          key: k,
          d: dd,
          x,
          y,
          z: groundAt(x, y),
          hp: dd.hp * hm,
          maxHp: dd.hp * hm,
          spd: dd.spd,
          dmg: dd.dmg * (1 + G.ridx * 0.35),
          r: dd.r,
          xp: dd.xp,
          flash: 0,
          soul: 0,
          ph: rand(0, 6),
          stun: 0,
          slow: 0,
          mark: 0,
          conf: 0,
        });
      }
      break;
    }
    case 'slam':
      for (const p of players) {
        if (p.down) continue;
        fx.push({ k: 'tele', shape: 'circle', x: p.x, y: p.y, r: 60, t: 1, max: 1, dmg: dmg * 2.2 });
      }
      break;
    case 'gaze':
      if (tg)
        fx.push({
          k: 'tele',
          shape: 'line',
          x: e.x,
          y: e.y,
          x2: e.x + Math.cos(ta) * 800,
          y2: e.y + Math.sin(ta) * 800,
          w: 22,
          t: 0.9,
          max: 0.9,
          dmg: dmg * 2.5,
          beam: true,
          col,
        });
      break;
  }
}
function updBoss(e, tg, dt, sp) {
  e.pc -= dt;
  if (e.pc <= 0) {
    bossPattern(e, tg);
    e.pc = e.tier === 'final' ? 1.6 : e.tier === 'boss' ? 2.1 : 2.6;
  }
  if (e.spiral > 0) {
    e.spiral -= dt;
    e.sa += dt * 4;
    e.st_ = (e.st_ || 0) - dt;
    if (e.st_ <= 0) {
      e.st_ = 0.09;
      const dmg = 10 * (1 + G.ridx * 0.35),
        bz = e.z + 22;
      bullet(e.x, e.y, bz, e.sa, 140, dmg, e.d.acc);
      bullet(e.x, e.y, bz, e.sa + Math.PI, 140, dmg, e.d.acc);
      if (e.tier !== 'mini') bullet(e.x, e.y, bz, e.sa + Math.PI / 2, 140, dmg, e.d.acc);
    }
  }
  if (e.chargeDelay > 0) {
    e.chargeDelay -= dt;
    return;
  }
  if (e.charge > 0) {
    e.charge -= dt;
    e.x += e.cvx * sp * 3.6 * dt;
    e.y += e.cvy * sp * 3.6 * dt;
  } else if (tg) {
    const dx = tg.x - e.x,
      dy = tg.y - e.y,
      d = Math.hypot(dx, dy) || 1;
    let ux = dx / d,
      uy = dy / d;
    if (e.d.arch === 'serpent') {
      const w = Math.sin(T * 2.5 + e.ph) * 0.8;
      const nx = ux - uy * w,
        ny = uy + ux * w;
      ux = nx;
      uy = ny;
    }
    if (d > e.r * 1.2 || e.d.arch === 'serpent') {
      e.x += ux * sp * dt;
      e.y += uy * sp * dt;
    }
  }
  if (e.segs) {
    e.hist.unshift([e.x, e.y]);
    if (e.hist.length > e.segs.length * 8 + 8) e.hist.pop();
    for (let i = 0; i < e.segs.length; i++) {
      const h = e.hist[Math.min(e.hist.length - 1, (i + 1) * 7)];
      e.segs[i].x = h[0];
      e.segs[i].y = h[1];
    }
    for (const s of e.segs)
      for (const p of players) {
        if (p.down || p.hidden > 0) continue;
        if (p.z - groundAt(s.x, s.y) > 34) continue;
        if ((p.x - s.x) ** 2 + (p.y - s.y) ** 2 < (s.r + p.r) ** 2) damagePlayer(p, e.dmg * 0.6);
      }
  }
}
function hurt(e, base, p) {
  if (e.proxy) e = e.proxy;
  if (e.dead) return;
  let d = base;
  if (p) d *= pMul(p);
  let crit = false,
    weak = false;
  if (p) {
    if (p.crit && Math.random() < p.crit) {
      d *= 1 + p.critDmg;
      crit = true;
    }
    if (e.boss || e.elite) d *= 1 + p.bossDmg;
    if (e.boss && e.d.weak.includes(p.god)) {
      d *= 2;
      weak = true;
    }
    if (e.mark > 0) d *= 2 * p.markMul;
  }
  if (e.qmul) d *= e.qmul;
  d = Math.max(1, Math.round(d));
  if (e.qcap) d = Math.min(d, e.qcap);
  if (e.qbud != null) {
    d = Math.min(d, Math.floor(e.qbud));
    e.qbud -= d;
  }
  e.hp -= d;
  e.flash = 0.08;
  if (e.qfloor && e.hp < e.maxHp * e.qfloor) {
    e.hp = e.maxHp * e.qfloor;
    if (e.onFloor) e.onFloor(e);
  }
  if (e.onHit) e.onHit(e, d, p);
  if (p && G && G.qfx) qOnHurt(e, p);
  if (p && p.ctrl !== 'net' && G) {
    G.dmgTotal += d;
    G.dmgWin.push([G.t, d]);
  }
  if (p && !e.boss) {
    if (p.stunChance && Math.random() < p.stunChance) e.stun = 0.6;
    if (p.confuse && Math.random() < p.confuse) e.conf = 3;
    if (p.execute && e.hp > 0 && e.hp < e.maxHp * p.execute) e.hp = 0;
  }
  if (texts.length < 110)
    texts.push({
      x: e.x + rand(-6, 6),
      y: e.y,
      z: (e.z || 0) + (e.boss ? e.r * 2.2 : e.r * 2.4),
      v: String(d),
      t: 0.6,
      c: crit ? C.gold : weak ? '#7de0ff' : C.bone,
    });
  if (e.hp <= 0) kill(e, p);
}
function pMul(p) {
  return (
    p.dmgMul *
    (p.rage > 0 ? 1.9 : 1) *
    (p.crown > 0 ? 1.3 : 1) *
    (p.bond ? 1.12 : 1) *
    (p.hidden > 0 ? 2 : 1) *
    (p.giant > 0 ? 1.6 : 1) *
    (1 + p.frenzy * 0.04) *
    (p.growDmg ? 1 + (G.t / 60) * 0.03 : 1)
  );
}
function kill(e, p) {
  if (e.dead) return;
  e.dead = true;
  G.kills++;
  G.warKills++;
  if (p) {
    p.kills++;
    p.mk++;
    if (p.steal) {
      const g = Math.min(p.steal, p.stB || 0);
      if (g > 0) {
        p.stB -= g;
        heal(p, g);
      }
    }
    if (p.frenzyOn) {
      p.frenzy = Math.min(10, p.frenzy + 1);
      p.frenzyT = 2;
    }
  }
  if (e.boss) {
    for (let i = 0; i < 8; i++) gems.push({ x: e.x + rand(-30, 30), y: e.y + rand(-30, 30), v: e.xp / 8, t: 'p' });
  } else if (gems.length < 420) gems.push({ x: e.x, y: e.y, v: e.xp, t: e.xp >= 5 ? 'b' : 'g' });
  else pick(gems).v += e.xp;
  const dm = Math.max(...players.map((q2) => q2.dropMul)),
    lk = teamLuck();
  const hW = 1 / (1 + 0.6 * waveK());
  if (Math.random() < 0.03 * dm * (1 + lk) * hW || e.boss)
    heals.push({ x: e.x + rand(-10, 10), y: e.y + rand(-10, 10) });
  if (!p || p.ctrl !== 'net') {
    if (e.boss || Math.random() < (e.elite ? 0.35 : 0.006) * (1 + lk) * hW)
      drops.push({ k: 'nectar', x: e.x + rand(-14, 14), y: e.y + rand(-14, 14), t: 0 });
    else if (Math.random() < (e.elite ? 0.12 : 0.003) * (1 + lk)) drops.push({ k: 'iman', x: e.x, y: e.y, t: 0 });
    else if (Math.random() < (e.elite ? 0.25 : 0.008) * (1 + lk)) drops.push({ k: 'bolsa', x: e.x, y: e.y, t: 0 });
  }
  const n = e.boss ? 36 : 5;
  for (let i = 0; i < n; i++)
    fx.push({
      k: 'p',
      x: e.x,
      y: e.y,
      z: (e.z || 0) + 12,
      vx: rand(-130, 130),
      vy: rand(-130, 130),
      vz: rand(60, 220),
      t: rand(0.35, 0.7),
      c: e.boss ? e.d.acc : shade(e.d.col, -0.1),
    });
  if (G.conc.inframundo && !e.boss && Math.random() < 0.12 && allies.length < 30 && p)
    allies.push(mkAlly('shade', p, e.x, e.y, 10));
  if (G.conc.guerra && G.warKills >= 100) {
    G.warKills = 0;
    for (const q2 of players) {
      if (q2.down) continue;
      fx.push({ k: 'ring', x: q2.x, y: q2.y, r: 230, t: 0.5, max: 0.5, col: C.blood });
      near(q2.x, q2.y, 270, (ee) => {
        if ((ee.x - q2.x) ** 2 + (ee.y - q2.y) ** 2 < 230 * 230) hurt(ee, 150, q2);
      });
    }
    banner('¡FURIA DE GUERRA!');
  }
  if (!p || p.ctrl !== 'net') {
    const gm = (players[0] && players[0].goldMul) || 1;
    G.money += (e.boss ? 60 : e.elite ? 10 : 0.35) * gm;
    G.realmScore += e.boss ? 150 : e.elite ? 10 : 1;
    G.combo = (G.combo || 0) + 1;
    G.comboT = 3;
    G.bestCombo = Math.max(G.bestCombo || 0, G.combo);
    addScore(e.boss ? (e.tier === 'final' ? 50000 : e.tier === 'mini' ? 2500 : 10000) : e.elite ? 100 : 10);
    G.streak = G.streakT > 0 ? G.streak + 1 : 1;
    G.streakT = 1.6;
    G.bestStreak = Math.max(G.bestStreak, G.streak);
    missionAdd('kills', 1);
    if (e.elite) {
      missionAdd('elites', 1);
      G.elites++;
    }
    if (p && p.air) missionAdd('air', 1);
    if (e.boss && e.tier === 'mini') missionAdd('mini', 1);
    if (e.boss) G.bossKills++;
  }
  if (!p || p.ctrl !== 'net') {
    const nc = e.boss
      ? e.tier === 'mini'
        ? 14
        : 30
      : e.elite
        ? 8
        : Math.random() < Math.min(0.95, 0.7 + 0.25 * teamLuck())
          ? 1
          : 0;
    dropCoins(e.x, e.y, (e.z || groundAt(e.x, e.y)) + 10, nc, 1 + (G.ridx + (G.wave || 1) - 1) * 0.5);
  }
  if (e.elite && Math.random() < 0.4) WORLD.chests.push({ x: e.x, y: e.y, opened: false, rich: false, free: true });
  if (e.boss) WORLD.chests.push({ x: e.x + 20, y: e.y, opened: false, rich: true, free: true });
  if (G.challenge && e.chal) {
    G.challenge.left--;
    if (G.challenge.left <= 0) {
      const c = G.challenge;
      WORLD.chests.push({ x: c.x + 30, y: c.y, opened: false, rich: true, free: true });
      bigBanner('¡DESAFÍO SUPERADO!', 'Un cofre del jefe aparece junto a la estatua');
      G.challenge = null;
    }
  }
  if (e.boss && e.tier === 'boss' && G.diffKey !== 'normal') {
    const st = PROF.stats;
    st.realmHard = st.realmHard || {};
    if (!st.realmHard[G.realm]) {
      st.realmHard[G.realm] = 1;
      checkSecrets(true);
    }
  }
  if (G && G.q) qOnKill(e, p);
  if (e.boss) {
    G.bossKeys.push(e.key);
    if (e.key === 'khaos' && G.diffKey !== 'normal') G.khaosHard = true;
    bossDefeated(e);
  }
}
function dropCoins(x, y, z, n, v) {
  for (let i = 0; i < n && coins.length < 500; i++) {
    const a = rand(0, 6.283),
      sp = n > 1 ? rand(40, 170) : rand(10, 40);
    coins.push({ x, y, z, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rand(160, 300), v, t: 0, ph: rand(0, 6.28) });
  }
}
function addGold(v, p) {
  const m = (p && p.goldMul) || 1;
  const g = v * m;
  G.gold += g;
  G.goldTotal += g;
}
function chestPrice() {
  return Math.round((12 + G.chestsBought * 8) * (1 + G.ridx * 0.4));
}
const SHOP_PRICE = { comun: 22, raro: 45, epico: 85, legendario: 150 };
function shrinePrice(sh) {
  return Math.round((30 + sh.uses * 25) * (1 + G.ridx * 0.4));
}
function noGold(x, y, need) {
  texts.push({ x, y, z: surfaceAt(x, y) + 60, v: `Faltan ${Math.ceil(need)} de oro`, t: 1.1, c: '#ff6a5a' });
}
function useShrine(sh, p) {
  switch (sh.type) {
    case 'fortuna': {
      const pr = shrinePrice(sh);
      if (G.gold < pr) {
        noGold(sh.x, sh.y, pr - G.gold);
        return;
      }
      G.gold -= pr;
      sh.uses++;
      if (sh.uses >= 3) sh.used = true;
      G.itemQueue.push({ p, rich: Math.random() < 0.3 });
      bigBanner('LA FORTUNA SONRÍE', 'Un objeto a cambio de tu oro');
      break;
    }
    case 'desafio': {
      sh.used = true;
      const list = realmEnemyList();
      const n = 5 + G.ridx * 2;
      G.challenge = { x: sh.x, y: sh.y, left: n };
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283;
        const x = sh.x + Math.cos(a) * 170,
          y = sh.y + Math.sin(a) * 170;
        const ek = pick(list),
          d = ENEMIES[ek];
        const hm = (1 + G.ridx * 0.85 + (G.rt / 60) * 0.34) * (players.length > 1 ? 1.35 : 1);
        enemies.push({
          key: ek,
          d,
          x,
          y,
          z: groundAt(x, y),
          hp: d.hp * hm * 7,
          maxHp: d.hp * hm * 7,
          spd: d.spd * 0.9,
          dmg: d.dmg * (1 + G.ridx * 0.35) * 1.5,
          r: d.r * 1.4,
          xp: d.xp * 6,
          elite: true,
          chal: true,
          flash: 0,
          soul: 0,
          ph: rand(0, 6.28),
          stun: 0,
          slow: 0,
          mark: 0,
          conf: 0,
          shH: 0,
        });
        fx.push({ k: 'ring', x, y, r: 60, t: 0.5, max: 0.5, col: '#ff4d5e' });
      }
      bigBanner('¡DESAFÍO!', `Derrota a ${n} élites y gana un cofre del jefe`);
      break;
    }
    case 'fuente': {
      sh.used = true;
      for (const q of players) {
        if (!q.down) heal(q, q.maxHp);
        fx.push({ k: 'ring', x: q.x, y: q.y, r: 120, t: 0.6, max: 0.6, col: '#4fc3ff' });
      }
      bigBanner('FUENTE SAGRADA', 'Vida restaurada');
      break;
    }
    case 'maldito': {
      sh.used = true;
      G.curse++;
      for (const q of players) q.dmgMul *= 1.2;
      bigBanner('PACTO MALDITO', '+20 % de daño, pero los enemigos aguantan más');
      break;
    }
  }
}
function openShop(m, p) {
  state = 'levelup';
  joy = null;
  look = null;
  keys.clear();
  if (document.pointerLockElement)
    try {
      document.exitPointerLock();
    } catch (_) {}
  if (!m.offers) m.offers = itemPicks(Math.random() < 0.25).map((k) => ({ k, sold: false }));
  $('luEyebrow').textContent = 'Mercader';
  $('luWho').textContent = `Tienes ${Math.floor(G.gold)} de oro`;
  const box = $('cards');
  box.innerHTML = '';
  const mul = 1 + G.ridx * 0.4;
  m.offers.forEach((o, i) => {
    const d = ITEMS[o.k],
      n = p.items[o.k] || 0,
      rr = RAR[d.rar],
      pr = Math.round(SHOP_PRICE[d.rar] * mul);
    const bt = document.createElement('button');
    bt.className = 'card rar-' + d.rar;
    bt.style.setProperty('--rc', rr.col);
    bt.innerHTML = `<span class="ch">${o.sold ? 'Vendido' : '<i class="cn gold"></i> ' + pr + ' de oro'}</span><span class="top2"><span class="em">${d.em}</span><span><span class="nm">${d.name}</span><br><span class="pill" style="background:${rr.col}">${rr.name}</span> <span class="lv">x${n + 1} de ${d.max}</span></span></span><span class="ds">${d.desc}</span><kbd>${i + 1}</kbd>`;
    bt.disabled = o.sold || n >= d.max || G.gold < pr;
    bt.onclick = () => {
      if (G.gold < pr) return;
      G.gold -= pr;
      o.sold = true;
      p.items[o.k] = n + 1;
      d.apply(p);
      refreshLoadout();
      openShop(m, p);
    };
    box.appendChild(bt);
  });
  const hp = document.createElement('button');
  const hpP = Math.round(15 * mul);
  hp.className = 'card skip';
  hp.innerHTML = `<span class="nm">Poción de ambrosía · ${hpP} de oro</span><span class="ds">Recupera el 60 % de la vida.</span>`;
  hp.disabled = G.gold < hpP || p.hp >= p.maxHp;
  hp.onclick = () => {
    G.gold -= hpP;
    heal(p, p.maxHp * 0.6);
    openShop(m, p);
  };
  box.appendChild(hp);
  const rr = document.createElement('button');
  const rrP = Math.round((10 + m.rerolls * 6) * mul);
  rr.className = 'card skip';
  rr.innerHTML = `<span class="nm">Renovar mercancía · ${rrP} de oro</span><span class="ds">Tres objetos nuevos.</span>`;
  rr.disabled = G.gold < rrP;
  rr.onclick = () => {
    G.gold -= rrP;
    m.rerolls++;
    m.offers = null;
    openShop(m, p);
  };
  box.appendChild(rr);
  const ex = document.createElement('button');
  ex.className = 'card skip';
  ex.innerHTML = '<span class="nm">Salir de la tienda</span><span class="ds">Esc también cierra.</span>';
  ex.onclick = closeShop;
  box.appendChild(ex);
  G.shopOpen = true;
  show('levelup');
}
function closeShop() {
  G.shopOpen = false;
  show(null);
  state = 'play';
  focusGame();
}
const REALM_STORY = {
  tartaro: 'Khaos rompió las cadenas del Tártaro: los titanes despiertan.',
  jotunheim: 'El hielo de Ymir avanza; los gigantes huelen el Ragnarök.',
  duat: 'Apep se traga la barca de Ra: la noche no termina.',
  kur: 'Tiamat agita las aguas del caos bajo los zigurats.',
  lanka: 'Ravana abre las puertas de su isla dorada a los demonios.',
  yomi: 'Izanami llama a los muertos de la noche eterna.',
  diyu: 'Las diez cortes del infierno están vacías: sus jueces huyeron.',
  mictlan: 'Mictlantecuhtli reclama la Ciudad de los Dioses.',
  xibalba: 'Los Señores de Xibalbá retan a los dioses al juego de pelota.',
  ukupacha: 'Supay sube del mundo de abajo hasta Machu Picchu.',
  orun: 'El cielo de los orishas se oscurece: algo devora la luz de Olodumare.',
  annwn: 'Las brumas de Annwn se tragan a los vivos.',
  vacio: 'Aquí empezó todo. Aquí termina todo.',
};
const REALM_EV = {
  lanka: 'monzon',
  orun: 'tormenta',
  ukupacha: 'granizo',
  tartaro: 'erupcion',
  vacio: 'erupcion',
  jotunheim: 'ventisca',
  annwn: 'ventisca',
  duat: 'arena',
  kur: 'arena',
  cielo: 'juicio',
  mictlan: 'muertos',
  xibalba: 'muertos',
  yomi: 'muertos',
  diyu: 'muertos',
};
function updRealmEvents(dt) {
  G.slowT = Math.max(0, G.slowT - dt);
  G.darkT = Math.max(0, G.darkT - dt);
  G.sandT = Math.max(0, G.sandT - dt);
  if (G.ev) {
    const ev = G.ev;
    ev.t -= dt;
    ev.acc += dt;
    const tgt = () => {
      const al = players.filter((q) => !q.down);
      return pick(al.length ? al : players);
    };
    if (ev.k === 'erupcion' && ev.acc > 0.28 / DF().ev) {
      ev.acc = 0;
      const q = tgt();
      const x = q.x + rand(-240, 240) + q.fx * 80,
        y = q.y + rand(-240, 240) + q.fy * 80;
      fx.push({ k: 'tele', shape: 'circle', x, y, r: rand(45, 70), t: 1.15, dmg: 26 * DF().dmg, col: '#ff6a1a' });
    }
    if (
      (ev.k === 'monzon' || ev.k === 'tormenta' || ev.k === 'granizo') &&
      ev.acc > (ev.k === 'granizo' ? 0.3 : 0.45) / DF().ev
    ) {
      ev.acc = 0;
      const q = tgt();
      const x = q.x + rand(-260, 260),
        y = q.y + rand(-260, 260);
      fx.push({
        k: 'tele',
        shape: 'circle',
        x,
        y,
        r: ev.k === 'granizo' ? 36 : 60,
        t: 1.1,
        dmg: (ev.k === 'granizo' ? 14 : 26) * DF().dmg,
        col: ev.k === 'tormenta' ? '#ffe060' : ev.k === 'granizo' ? '#e8f4ff' : '#5ab0ff',
        snow: ev.k === 'granizo',
      });
      if (ev.k === 'tormenta')
        setTimeout(() => {
          if (G) strike(x, y, 0, null, '#ffe060');
        }, 1100);
    }
    if (ev.k === 'ventisca' && ev.acc > 0.5 / DF().ev) {
      ev.acc = 0;
      const q = tgt();
      fx.push({
        k: 'tele',
        shape: 'circle',
        x: q.x + rand(-220, 220),
        y: q.y + rand(-220, 220),
        r: 50,
        t: 1.2,
        dmg: 20 * DF().dmg,
        col: '#9fe0ff',
        snow: true,
      });
    }
    if (ev.k === 'juicio' && ev.acc > 0.75 / DF().ev) {
      ev.acc = 0;
      const q = tgt();
      const a = rand(0, 6.28),
        L2 = 520;
      fx.push({
        k: 'tele',
        shape: 'line',
        x: q.x - (Math.cos(a) * L2) / 2,
        y: q.y - (Math.sin(a) * L2) / 2,
        x2: q.x + (Math.cos(a) * L2) / 2,
        y2: q.y + (Math.sin(a) * L2) / 2,
        w: 46,
        t: 1.3,
        dmg: 30 * DF().dmg,
        col: '#fff2a0',
        beam: true,
      });
    }
    if (ev.t <= 0) G.ev = null;
    return;
  }
  if (G.portals || G.bosses.length) return;
  G.evT -= dt;
  if (G.evT > 0) return;
  G.evT = rand(32, 50) / DF().ev;
  let k = REALM_EV[G.realm] || 'horda';
  if (G.realm === 'ukupacha' && G.q && G.q.braz.some((b) => b.lit) && Math.random() < 0.5) k = 'ventisca';
  const en = realmEnemyList(),
    a0 = rand(0, 6.28);
  switch (k) {
    case 'erupcion':
      G.ev = { k, t: 7, acc: 0 };
      bigBanner('¡ERUPCIÓN!', 'Llueven rocas de lava: muévete o salta');
      G.shake = Math.max(G.shake, 0.6);
      break;
    case 'ventisca':
      G.ev = { k, t: 12, acc: 0 };
      G.slowT = 12;
      bigBanner(
        '¡VENTISCA!',
        G.q && (G.q.shelters.length || G.q.braz.some((b) => b.lit))
          ? 'Refúgiate en un tambo o junto a un brasero encendido'
          : 'El frío te frena y caen carámbanos'
      );
      break;
    case 'arena':
      G.sandT = 11;
      bigBanner('¡TORMENTA DE ARENA!', 'No ves nada… y algo se acerca');
      for (let i = 0; i < Math.round(16 * DF().sp); i++) spawn(en[1] || en[0], a0 + rand(-0.5, 0.5));
      break;
    case 'monzon':
      G.ev = { k, t: 10, acc: 0 };
      G.slowT = 10;
      bigBanner('¡MONZÓN!', 'La lluvia te frena y los relámpagos caen');
      break;
    case 'tormenta':
      G.ev = { k, t: 9, acc: 0 };
      bigBanner('¡LA IRA DE SHANGÓ!', 'Caen rayos del cielo de Orun');
      break;
    case 'granizo':
      G.ev = { k, t: 9, acc: 0 };
      G.slowT = 9;
      bigBanner('¡GRANIZADA ANDINA!', 'Ccoa suelta el granizo sobre las terrazas');
      break;
    case 'juicio':
      G.ev = { k, t: 10, acc: 0 };
      bigBanner('¡EL JUICIO!', 'Haces de luz barren el cielo');
      break;
    case 'muertos':
      G.darkT = 12;
      bigBanner('LA NOCHE DE LOS MUERTOS', 'Se apaga la luz y salen de todas partes');
      for (let i = 0; i < Math.round(22 * DF().sp); i++) spawn(pick(en), rand(0, 6.28));
      break;
    default:
      bigBanner('¡UNA HORDA!', 'Llegan todos por el mismo lado');
      for (let i = 0; i < Math.round(28 * DF().sp); i++) spawn(pick(en), a0 + rand(-0.35, 0.35));
  }
}
function checkSecrets(live) {
  const out = [];
  for (const id in SECRET_GODS) {
    if (!PROF.owned.includes(id) && SECRET_GODS[id].test(PROF)) {
      PROF.owned.push(id);
      out.push(id);
    }
  }
  if (out.length) {
    saveProfile();
    if (live)
      setTimeout(() => bigBanner('¡DIOS SECRETO DESBLOQUEADO!', out.map((id) => GOD[id].name).join(' y ')), 2500);
    G.unlocked = (G.unlocked || []).concat(out);
  }
  return out;
}
function missionAdd(id, v) {
  if (!G.missions) return;
  for (const m of G.missions) {
    if (m.done || m.id !== id) continue;
    m.prog = Math.min(m.n, m.prog + v);
    if (m.prog >= m.n) missionDone(m);
  }
}
function missionSet(id, v) {
  if (!G.missions) return;
  for (const m of G.missions) {
    if (m.done || m.id !== id) continue;
    m.prog = Math.min(m.n, Math.floor(v));
    if (m.prog >= m.n) missionDone(m);
  }
}
function missionDone(m) {
  m.done = true;
  addScore(1000);
  G.missionsDone++;
  G.money += m.rew;
  dailyAdd('d_missions', 1);
  bigBanner('MISIÓN COMPLETADA', `${m.txt} · +${m.rew} dracmas`);
  const p = players.find((q) => !q.down) || players[0];
  for (let i = 0; i < 10; i++) gems.push({ x: p.x + rand(-50, 50), y: p.y + rand(-50, 50), v: 3, t: 'b' });
}
function bossDefeated(e) {
  if (e.nem) {
    bigBanner('¡NÉMESIS DERROTADA!', `${e.d.name} cae · +25 000 puntos`);
    addScore(25000);
    WORLD.chests.push({ x: e.x - 24, y: e.y, opened: false, rich: true, free: true });
    drops.push({ k: 'nectar', x: e.x, y: e.y + 20, t: 0 });
  }
  G.bosses = G.bosses.filter((bb) => bb !== e);
  const alive = players.filter((p) => !p.down);
  if (alive.length) say(pick(alive), pick(LINES.boss), 0.3);
  if (e.tier === 'final') {
    setTimeout(() => {
      if (state === 'play') endGame(true);
    }, 1800);
    bigBanner('KHAOS HA CAÍDO', 'La creación sigue en pie');
    for (const n of npcs) say(n, 'Bien hecho. Descansad.', 0.6);
    return;
  }
  if (e.tier === 'boss') {
    if (G.mode === 'libre') {
      G.cycle++;
      G.waveT = 6;
      bigBanner('¡OLEADA SUPERADA!', `En 6 s pasas a la oleada ${(G.wave || 1) + 1}`);
      for (const p of players) if (!p.down) heal(p, p.maxHp * 0.25);
      return;
    }
    const c = camera();
    const rest = Object.keys(REALMS).filter((k) => k !== 'vacio' && !G.visited.includes(k));
    const opts = G.ridx >= 2 ? ['vacio'] : shuffle(rest).slice(0, 2);
    G.portals = opts.map((k, i) => {
      let x = c.x + (opts.length === 1 ? 0 : i ? 150 : -150),
        y = c.y - 90;
      const d = Math.hypot(x, y);
      if (d > ARENA - 120) {
        x *= (ARENA - 120) / d;
        y *= (ARENA - 120) / d;
      }
      return { key: k, x, y, t: 0 };
    });
    bigBanner('SE ABREN LOS PORTALES', opts.length === 1 ? 'El Vacío Primordial te espera' : 'Elige tu próximo reino');
  }
}
function damagePlayer(p, amt, src) {
  if (p.down || p.hidden > 0 || p.inv > 0 || p.charging > 0 || p.ctrl === 'npc' || p.ctrl === 'net') return;
  if (p.shield > 0) return;
  if (p.evasion && Math.random() < p.evasion) {
    p.inv = 0.3;
    texts.push({ x: p.x, y: p.y, z: p.z + 60, v: 'ESQUIVA', t: 0.7, c: '#9ad0ff' });
    return;
  }
  if (p.thorns && src && !src.dead) hurt(src, amt * p.thorns, p);
  amt = Math.max(1, amt - p.armor);
  p.hp -= amt;
  if (window.DBGH) DBGH(p, amt, src);
  playerHit(p, amt);
  if (p.qFlame) qFlameHit(p);
  p.inv = 0.45 + p.invBonus;
  p.hurt = 1;
  if (p.ctrl !== 'ai') {
    G.noHitT = 0;
    if (G.combo >= 20) {
      const lost = G.combo - Math.floor(G.combo / 2);
      G.combo = Math.floor(G.combo / 2);
      texts.push({ x: p.x, y: p.y, z: p.z + 76, v: `COMBO -${lost}`, t: 0.9, c: '#ff9a5a' });
    }
  }
  if (G.conc.tierra) {
    near(p.x, p.y, 120, (e) => {
      const ee = e.proxy || e;
      if (!ee.boss && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 100 * 100) ee.stun = 1.5;
    });
    fx.push({ k: 'ring', x: p.x, y: p.y, r: 90, t: 0.3, max: 0.3, col: '#6a8a3a' });
  }
  if (p.hp <= 0) downPlayer(p);
}
let HIT_AC = null;
function hitSound(k) {
  try {
    HIT_AC = HIT_AC || new (window.AudioContext || window.webkitAudioContext)();
    const a = HIT_AC,
      t = a.currentTime,
      o = a.createOscillator(),
      g = a.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(220 - k * 60, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.14);
    g.gain.setValueAtTime(0.06 + k * 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 0.17);
  } catch (_) {}
}
function playerHit(p, amt) {
  if (!G || (p.ctrl !== 'p1' && p.ctrl !== 'p2')) return;
  const k = Math.min(1, amt / Math.max(20, p.maxHp * 0.25));
  p.hurtT = 0.28;
  G.hitT = Math.max(G.hitT || 0, 0.35 + k * 0.35);
  G.shake = Math.min(1, G.shake + 0.18 + k * 0.3);
  texts.push({
    x: p.x + rand(-6, 6),
    y: p.y,
    z: p.z + 56,
    v: '-' + Math.max(1, Math.round(amt)),
    t: 0.85,
    c: '#ff4a4a',
    big: true,
  });
  for (let i = 0; i < 6; i++)
    fx.push({
      k: 'p',
      x: p.x,
      y: p.y,
      z: p.z + 20,
      vx: rand(-90, 90),
      vy: rand(-90, 90),
      vz: rand(60, 180),
      t: 0.35,
      c: '#ff3a3a',
    });
  if (!G.hitSndT || G.t - G.hitSndT > 0.12) {
    G.hitSndT = G.t;
    hitSound(k);
    const c = document.querySelector('.hudcard');
    if (c) {
      c.classList.remove('hit');
      void c.offsetWidth;
      c.classList.add('hit');
    }
  }
}
function downPlayer(p) {
  if (p.lives > 0) {
    p.lives--;
    p.hp = p.maxHp * 0.5;
    p.inv = 2.5;
    say(p, '¡Aún no es mi hora!');
    fx.push({ k: 'ring', x: p.x, y: p.y, r: 120, t: 0.6, max: 0.6, col: C.gold });
  } else {
    p.down = true;
    p.hp = 0;
    p.revive = 0;
    const o = players.find((q2) => q2 !== p && !q2.down);
    if (o) say(o, pick(LINES.down));
  }
}
