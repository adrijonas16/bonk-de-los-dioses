/* ---------- armas ---------- */
const RM_K = { chain: 1, shot: 1, line: 1, boomer: 1, bounce: 1, homing: 1, sword: 1 };
function lvR(l) {
  return 0.62 + 0.08 * (l - 1);
}
function kst(Wd, l, p) {
  const s = kst0(Wd, l, p);
  if (s) s.rm = RM_K[Wd.k] ? lvR(l) : 1;
  return s;
}
function kst0(Wd, l, p) {
  const k = Wd.k,
    cb = p.countBonus + (G.conc.embaucador ? 1 : 0);
  switch (k) {
    case 'chain':
      return {
        cd: Math.max(0.45, 1.45 - 0.12 * l),
        dmg: 20 + 9 * l,
        chains: 1 + l + p.chainBonus + (G.conc.trueno ? 2 : 0),
        bolts: l >= 4 ? 2 : 1,
        range: 330,
      };
    case 'shot': {
      const qq = Wd.p;
      return {
        cd: Math.max(0.3, qq.cd - 0.07 * l),
        dmg: qq.dmg + qq.dmgL * l,
        count: qq.count + Math.floor(l * qq.countL) + cb,
        pierce: qq.pierce + Math.floor(l / 3),
        speed: qq.speed,
        spread: qq.spread,
        life: qq.life,
        r: qq.r,
      };
    }
    case 'orbit':
      return {
        count: 2 + Math.floor(l * 0.85) + Math.min(cb, 1),
        dmg: 11 + 6 * l,
        radius: 50 + 5 * l,
        rot: 3 + 0.25 * l,
      };
    case 'aura':
      return { radius: 66 + 13 * l, dmg: 7 + 5 * l, tick: 0.45 };
    case 'line':
      return {
        cd: Math.max(0.9, 2.1 - 0.16 * l),
        dmg: 40 + 18 * l,
        r: 9 + 2 * l,
        count: 1 + (l >= 4 ? 1 : 0) + Math.min(cb, 1),
        speed: 390,
      };
    case 'boomer':
      return {
        cd: Math.max(0.8, 1.8 - 0.12 * l),
        dmg: 30 + 12 * l,
        count: 1 + (l >= 3) + (l >= 6) + cb,
        range: 220 + 15 * l,
        speed: 380,
        r: 10 + l,
      };
    case 'bounce':
      return {
        cd: Math.max(0.6, 1.4 - 0.1 * l),
        dmg: 22 + 9 * l,
        bounces: 3 + l,
        count: 1 + (l >= 5 ? 1 : 0) + cb,
        speed: 430,
      };
    case 'homing':
      return {
        cd: Math.max(0.5, 1.3 - 0.1 * l),
        dmg: 14 + 6 * l,
        count: 1 + Math.ceil(l / 2) + cb,
        speed: 260,
        life: 2.5,
      };
    case 'nova':
      return { cd: Math.max(0.9, 2.4 - 0.18 * l), dmg: 25 + 10 * l, radius: 90 + 15 * l };
    case 'trail':
      return { life: 1.4 + 0.15 * l, dmg: 8 + 4 * l, r: 14 + 2 * l };
    case 'sword':
      return {
        cd: Math.max(0.55, 1.3 - 0.09 * l),
        dmg: 34 + 13 * l,
        count: 1 + (l >= 4 ? 1 : 0) + (l >= 7 ? 1 : 0) + Math.min(cb, 1),
        range: 260,
        sr: 44 + 5 * l,
        speed: 760,
      };
    case 'melee':
      return { cd: Math.max(0.4, 1 - 0.08 * l), dmg: 28 + 11 * l, range: 48 + 5 * l, arc: 1.6 + 0.1 * l, both: l >= 5 };
  }
}
function weaponReach(Wd, s, p) {
  const r = (p.range || 1) * (s.rm || 1);
  switch (Wd.k) {
    case 'chain':
      return s.range * p.area * r;
    case 'shot':
      return s.speed * s.life * r;
    case 'line':
      return 390 * 1.6 * r;
    case 'boomer':
      return s.range * p.area * r;
    case 'bounce':
      return 430 * 2.2 * r;
    case 'homing':
      return 400 * r;
    case 'nova':
    case 'aura':
      return s.radius * p.area * (1 + (r - 1) * 0.5);
    case 'orbit':
      return s.radius * p.area;
    case 'sword':
      return s.range * p.area * r;
    case 'melee':
      return s.range * p.area * r;
    default:
      return 0;
  }
}
function swordSlash(q2) {
  const R = q2.sr,
    a = Math.atan2(q2.vy, q2.vx);
  let hit = 0;
  fx.push({
    k: 'slash',
    x: q2.x - Math.cos(a) * R * 0.4,
    y: q2.y - Math.sin(a) * R * 0.4,
    z: q2.z - 16,
    a: a + rand(-0.4, 0.4),
    r: R * 1.25,
    arc: 2.6,
    t: 0.22,
    col: '#ffd27a',
    st: 'blade',
  });
  fx.push({ k: 'ring', x: q2.x, y: q2.y, r: R, t: 0.25, max: 0.25, col: '#ff8a3a' });
  near(q2.x, q2.y, R + 40, (e) => {
    if ((e.x - q2.x) ** 2 + (e.y - q2.y) ** 2 < (R + e.r) ** 2) {
      hurt(e, q2.sdmg, q2.o);
      hit++;
      const ee = e.proxy || e;
      if (!ee.boss) push(ee, q2.x - q2.vx, q2.y - q2.vy, 26);
      for (let i = 0; i < 6; i++)
        fx.push({
          k: 'p',
          x: e.x,
          y: e.y,
          z: (e.z || 0) + 14,
          vx: rand(-160, 160),
          vy: rand(-160, 160),
          vz: rand(80, 240),
          t: rand(0.25, 0.5),
          c: i % 2 ? '#ff5a2a' : (e.d && e.d.col) || '#fff',
        });
    }
  });
  if (hit && q2.o && (q2.o.ctrl === 'p1' || q2.o.ctrl === 'p2')) G.shake = Math.min(1, G.shake + 0.12 + hit * 0.03);
}
const SC_DIFF = { normal: 1, dificil: 1.5, pesadilla: 2.5 };
function comboMul() {
  return 1 + Math.min(9, Math.floor((G.combo || 0) / 20) * 0.5);
}
function stageMul() {
  return G.mode === 'libre' ? 1 + 0.5 * ((G.wave || 1) - 1) : 1 + 0.5 * G.ridx;
}
function scoreMul() {
  return comboMul() * stageMul() * (SC_DIFF[G.diffKey] || 1);
}
function addScore(base) {
  if (!G) return;
  G.score = (G.score || 0) + base * scoreMul();
}
function teamLuck() {
  let m = 0;
  for (const q of players) if (q.ctrl !== 'net') m = Math.max(m, q.luck || 0);
  return m;
}
function drinkNectar(p) {
  if (!G || state !== 'play' || p.down) return;
  if (p.nectar <= 0) {
    if (p.ctrl === 'p1' || p.ctrl === 'p2')
      texts.push({ x: p.x, y: p.y, z: p.z + 50, v: 'Sin néctar', t: 0.9, c: '#9aa3c7', big: false });
    return;
  }
  if (p.hp >= p.maxHp) {
    texts.push({ x: p.x, y: p.y, z: p.z + 50, v: 'Vida llena', t: 0.8, c: '#9aa3c7' });
    return;
  }
  if (p.nectarCd > 0) return;
  p.nectar--;
  p.nectarCd = 1.2;
  const amt = Math.round(p.maxHp * 0.45);
  heal(p, amt);
  p.healGlow = 0.8;
  for (let i = 0; i < 18; i++)
    fx.push({
      k: 'p',
      x: p.x + rand(-14, 14),
      y: p.y + rand(-14, 14),
      z: p.z + rand(0, 30),
      vx: rand(-30, 30),
      vy: rand(-30, 30),
      vz: rand(60, 160),
      t: rand(0.4, 0.8),
      c: i % 2 ? '#7dffa8' : '#ffe680',
    });
  fx.push({ k: 'ring', x: p.x, y: p.y, r: 60, t: 0.35, max: 0.35, c: '#7dffa8' });
  refreshNectar();
}
function refreshNectar() {
  const p = players.find((q) => q.ctrl === 'p1');
  const el = $('nectarN');
  if (el && p) {
    el.textContent = '×' + p.nectar;
    $('nectarBox').classList.toggle('empty', p.nectar <= 0);
  }
  const tb = $('tNectar');
  if (tb && p) tb.textContent = 'NÉCTAR ×' + p.nectar;
}
function updDrops(dt) {
  for (const d of drops) {
    d.t += dt;
    if (d.t > 40) {
      d.done = true;
      continue;
    }
    for (const p of players) {
      if (p.down || d.done || p.ctrl === 'net') continue;
      const dd = Math.hypot(p.x - d.x, p.y - d.y);
      if (dd < p.magnet * 0.5 && dd > 1) {
        d.x += ((p.x - d.x) / dd) * 260 * dt;
        d.y += ((p.y - d.y) / dd) * 260 * dt;
      }
      if (dd < p.r + 16) {
        d.done = true;
        if (d.k === 'nectar') {
          heal(p, Math.round(p.maxHp * 0.45 * p.healMul));
          for (let i = 0; i < 14; i++)
            fx.push({
              k: 'p',
              x: p.x + rand(-14, 14),
              y: p.y + rand(-14, 14),
              z: p.z + rand(0, 30),
              vx: rand(-30, 30),
              vy: rand(-30, 30),
              vz: rand(60, 160),
              t: rand(0.4, 0.8),
              c: i % 2 ? '#7dffa8' : '#7de0ff',
            });
          fx.push({ k: 'ring', x: p.x, y: p.y, r: 60, t: 0.35, max: 0.35, col: '#7dffa8' });
        } else if (d.k === 'iman') {
          for (const c of coins) c.pull = true;
          for (const gm of gems) {
            gm.x = p.x + rand(-8, 8);
            gm.y = p.y + rand(-8, 8);
          }
          texts.push({ x: p.x, y: p.y, z: p.z + 50, v: '¡IMÁN!', t: 1.2, c: '#ff6a6a', big: true });
          fx.push({ k: 'ring', x: p.x, y: p.y, r: 300, t: 0.5, max: 0.5, c: '#ff6a6a' });
        } else if (d.k === 'bolsa') {
          dropCoins(d.x, d.y, surfaceAt(d.x, d.y) + 12, 8, 1 + (G.ridx + (G.wave || 1) - 1) * 0.5);
          texts.push({ x: p.x, y: p.y, z: p.z + 50, v: '¡Bolsa de oro!', t: 1.2, c: '#ffd34d', big: true });
        }
      }
    }
  }
  drops = drops.filter((d) => !d.done);
}
function nextWave() {
  if (!G || G.mode !== 'libre') return;
  G.wave = (G.wave || 1) + 1;
  const ks = Object.keys(REALMS).filter((k) => k !== 'vacio' && k !== 'cielo' && k !== G.realm);
  startRealm(pick(ks));
  setTimeout(() => {
    if (G && state === 'play') bigBanner(`OLEADA ${G.wave}`, 'Todo empieza de nuevo, más rápido y más fuerte');
  }, 2600);
}
function facing(p) {
  return Math.atan2(p.fy, p.fx);
}
function nearestE(x, y, max, skip) {
  const qp = G && G.qPrio;
  let best = null,
    bd = max * max,
    bn = 1e12;
  for (const e of enemies) {
    if (e.dead || (skip && skip.has(e))) continue;
    const d = (e.x - x) ** 2 + (e.y - y) ** 2;
    if (e !== qp && d < bn) bn = d;
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  // Atoq tiene prioridad solo si no hay una amenaza pegada (120) más cerca que él
  if (qp && !qp.dead && !(skip && skip.has(qp))) {
    const dq = (qp.x - x) ** 2 + (qp.y - y) ** 2;
    if (dq < Math.min(max, 300) ** 2 && (bn > 120 * 120 || dq < bn)) return qp;
  }
  return best;
}
function aimAt(p, max) {
  const t = nearestE(p.x, p.y, (max || 600) * (p.range || 1));
  return t ? Math.atan2(t.y - p.y, t.x - p.x) : facing(p);
}
function mkProj(o, k, st, col, x, y, z, a, sp, extra) {
  return Object.assign(
    { k, o, st, col, x, y, z, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, hit: new Set(), rot: 0 },
    extra
  );
}
function fireWeapons(p, dt) {
  const pz = p.z + 22;
  const pr0 = p.range || 1;
  for (const key in p.weapons) {
    const w = p.weapons[key],
      Wd = WEAPONS[key],
      s = kst(Wd, w.lvl, p);
    p.range = pr0 * s.rm;
    if (Wd.k === 'orbit') {
      w.ang += s.rot * dt;
      w.br = (w.br || 0) + dt * 2.6;
      const Rr = s.radius * p.area * (0.62 + 0.38 * (0.5 + 0.5 * Math.sin(w.br)));
      w.pos = [];
      for (let i = 0; i < s.count; i++) {
        const a = w.ang + (i * 6.2832) / s.count,
          x = p.x + Math.cos(a) * Rr,
          y = p.y + Math.sin(a) * Rr;
        w.pos.push([x, y, a]);
        near(x, y, 60, (e) => {
          const ee = e.proxy || e;
          if (G.t > ee.soul && (e.x - x) ** 2 + (e.y - y) ** 2 < (e.r + 17) ** 2) {
            ee.soul = G.t + 0.4;
            hurt(e, s.dmg, p);
            if (!ee.boss) push(ee, p.x, p.y, key === 'palomas' ? 18 : 8);
          }
        });
      }
      continue;
    }
    if (Wd.k === 'aura') {
      w.tick -= dt;
      if (w.tick <= 0) {
        w.tick = s.tick;
        const big = p.radiant > 0,
          Rr = s.radius * p.area * (1 + (p.range - 1) * 0.5) * (big ? 1.8 : 1);
        near(p.x, p.y, Rr + 40, (e) => {
          if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (Rr + e.r) ** 2) hurt(e, s.dmg * (big ? 2 : 1), p);
        });
      }
      continue;
    }
    if (Wd.k === 'trail') {
      w.acc += dt;
      if (w.acc >= 0.13) {
        w.acc = 0;
        patches.push({
          o: p,
          x: p.x + rand(-4, 4),
          y: p.y + rand(-4, 4),
          r: s.r * p.area,
          t: s.life,
          life: s.life,
          dmg: s.dmg,
          tick: 0,
          col: Wd.col,
        });
      }
      continue;
    }
    w.t -= dt;
    if (w.t > 0) continue;
    p.atk = 0.22;
    const cd = s.cd * p.cdMul;
    switch (Wd.k) {
      case 'chain': {
        let fired = false;
        const rg = s.range * p.area * p.range;
        for (let bI = 0; bI < s.bolts; bI++) {
          const hit = new Set();
          let cur = nearestE(p.x, p.y, rg);
          if (bI && cur) {
            const alt = enemies.filter((e) => !e.dead && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < rg * rg);
            cur = pick(alt) || cur;
          }
          if (!cur) break;
          fired = true;
          const sky = w.lvl >= 3;
          if (sky) strike(cur.x, cur.y, 0, p, Wd.col, cur);
          const pts = sky ? [] : [[p.x + p.fx * 8, p.y + p.fy * 8, pz + 6]];
          for (let c = 0; c <= s.chains && cur; c++) {
            hit.add(cur);
            pts.push([cur.x, cur.y, (cur.z || 0) + 14]);
            hurt(cur, s.dmg * (c ? 0.8 : 1), p);
            if (c && w.lvl >= 5 && c <= 2) strike(cur.x, cur.y, 0, p, Wd.col, cur);
            cur = nearestE(cur.x, cur.y, 160 * p.area, hit);
          }
          fx.push({ k: 'bolt', pts, t: 0.2, col: Wd.col, st: Wd.st });
        }
        w.t = fired ? cd : 0.2;
        break;
      }
      case 'shot': {
        const a = aimAt(p, 600),
          n = s.count;
        for (let i = 0; i < n; i++) {
          const aa = a + (i - (n - 1) / 2) * s.spread;
          proj.push(
            mkProj(p, 'shot', Wd.st, Wd.col, p.x, p.y, pz, aa, s.speed, {
              dmg: s.dmg,
              pierce: s.pierce,
              r: s.r * p.area,
              t: s.life * p.range,
              slow: Wd.p.slow,
            })
          );
        }
        w.t = cd;
        break;
      }
      case 'line': {
        const a = facing(p);
        for (let i = 0; i < s.count; i++)
          proj.push(
            mkProj(p, 'line', Wd.st, Wd.col, p.x, p.y, pz, a + i * Math.PI, s.speed, {
              dmg: s.dmg,
              pierce: 9999,
              r: s.r * p.area,
              t: 1.6 * p.range,
            })
          );
        w.t = cd;
        break;
      }
      case 'boomer': {
        const base = aimAt(p, s.range + 100);
        for (let i = 0; i < s.count; i++)
          proj.push(
            mkProj(p, 'boomer', Wd.st, Wd.col, p.x, p.y, pz, base + (i - (s.count - 1) / 2) * 0.5, s.speed, {
              dmg: s.dmg,
              pierce: 9999,
              r: s.r * p.area,
              t: 4 * p.range,
              range: s.range * p.area * p.range,
              trav: 0,
              ret: false,
            })
          );
        w.t = cd;
        break;
      }
      case 'bounce': {
        for (let i = 0; i < s.count; i++)
          proj.push(
            mkProj(p, 'bounce', Wd.st, Wd.col, p.x, p.y, pz, aimAt(p, 500) + i * 0.6, s.speed, {
              dmg: s.dmg,
              pierce: 1,
              bn: s.bounces,
              r: 8 * p.area,
              t: 2.2 * p.range,
            })
          );
        w.t = cd;
        break;
      }
      case 'homing': {
        for (let i = 0; i < s.count; i++)
          proj.push(
            mkProj(p, 'homing', Wd.st, Wd.col, p.x, p.y, pz, rand(0, 6.28), s.speed, {
              sp: s.speed,
              dmg: s.dmg,
              pierce: 1,
              r: 7 * p.area,
              t: s.life * p.range,
              tg: null,
              rt: 0,
            })
          );
        w.t = cd;
        break;
      }
      case 'nova': {
        const Rr = s.radius * p.area * (1 + (p.range - 1) * 0.5);
        fx.push({ k: 'ring', x: p.x, y: p.y, r: Rr, t: 0.35, max: 0.35, col: Wd.col });
        near(p.x, p.y, Rr + 40, (e) => {
          if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (Rr + e.r) ** 2) {
            hurt(e, s.dmg, p);
            const ee = e.proxy || e;
            if (Wd.stun && !ee.boss) ee.stun = Wd.stun;
            else if (!ee.boss) push(ee, p.x, p.y, 10);
          }
        });
        w.t = cd;
        break;
      }
      case 'sword': {
        const rg = s.range * p.area * p.range,
          used = new Set();
        let any = false;
        for (let i = 0; i < s.count; i++) {
          const t = nearestE(p.x, p.y, rg, used);
          if (!t) break;
          used.add(t);
          any = true;
          const a = Math.atan2(t.y - p.y, t.x - p.x);
          proj.push(
            mkProj(p, 'sword', Wd.st, Wd.col, p.x, p.y, pz + 6, a, s.speed, {
              dmg: Math.round(s.dmg * 0.5),
              sdmg: s.dmg,
              sr: s.sr * p.area,
              pierce: 9999,
              r: 12,
              t: 3,
              tg: t,
              tx: t.x,
              ty: t.y,
              ret: false,
              ky: key,
            })
          );
        }
        w.t = any ? cd : 0.2;
        break;
      }
      case 'melee': {
        const rg = s.range * p.area * p.range;
        const t = nearestE(p.x, p.y, rg * 1.8);
        const a = t ? Math.atan2(t.y - p.y, t.x - p.x) : facing(p);
        const dirs = s.both ? [a, a + Math.PI] : [a];
        for (const d of dirs) {
          fx.push({ k: 'slash', x: p.x, y: p.y, z: p.z, a: d, r: rg, arc: s.arc, t: 0.16, col: Wd.col, st: Wd.st });
          near(p.x, p.y, rg + 40, (e) => {
            const dx = e.x - p.x,
              dy = e.y - p.y;
            if (dx * dx + dy * dy > (rg + e.r) ** 2) return;
            let da = Math.atan2(dy, dx) - d;
            da = Math.atan2(Math.sin(da), Math.cos(da));
            if (Math.abs(da) <= s.arc / 2) {
              hurt(e, s.dmg, p);
              const ee = e.proxy || e;
              if (!ee.boss) push(ee, p.x, p.y, Wd.st === 'mace' ? 22 : 10);
            }
          });
        }
        w.t = cd;
        break;
      }
    }
  }
  p.range = pr0;
  if (G.conc.sol) {
    p.sunA = (p.sunA || 0) + dt * 2;
    const x = p.x + Math.cos(p.sunA) * 55,
      y = p.y + Math.sin(p.sunA) * 55;
    p.sunPos = [x, y];
    near(x, y, 50, (e) => {
      const ee = e.proxy || e;
      if (T > (ee.sunH || 0) && (e.x - x) ** 2 + (e.y - y) ** 2 < (e.r + 12) ** 2) {
        ee.sunH = T + 0.4;
        hurt(e, 20 + G.level * 2, p);
      }
    });
  } else p.sunPos = null;
  if (p.radiant > 0 && !p.weapons.sol) {
    p.radT = (p.radT || 0) - dt;
    if (p.radT <= 0) {
      p.radT = 0.4;
      const Rr = 140 * p.area;
      near(p.x, p.y, Rr + 40, (e) => {
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (Rr + e.r) ** 2) hurt(e, 22 + G.level * 2, p);
      });
    }
  }
}
