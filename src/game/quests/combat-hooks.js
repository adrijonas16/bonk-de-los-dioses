/* ---------- transformaciones de combate ---------- */
function qOnHurt(e, p) {
  if (Q_BURN || !p || !G.qfx || !G.qfx.fire || e.dead) return;
  e.burnQ = 2.5;
  e.burnBy = p;
}
function addPuddle(x, y, t) {
  const q = G.q;
  if (!q) return;
  const o = q.puddles.find((z) => Math.hypot(z.x - x, z.y - y) < 35);
  if (o) {
    o.t = Math.max(o.t, t);
    return;
  }
  if (q.puddles.length >= 18) {
    q.puddles.sort((a, b) => a.t - b.t);
    q.puddles.shift();
  }
  q.puddles.push({ x, y, r: 40, t });
}
function qOnKill(e, p) {
  if (G.qfx && G.qfx.favor && p && !e.boss && G.q && Math.random() < 0.5) addPuddle(e.x, e.y, 7);
  if (e === G.qPrio) {
    const A = e.qq;
    G.qPrio = null;
    if (A && A.a.state === 'active') {
      WORLD.chests.push({ x: e.x, y: e.y, opened: false, rich: true, free: true });
      questEnd(A, true, '¡COFRE RECUPERADO!', 'Ábrelo con E y elige tu objeto', 'Cofre recuperado');
    }
  }
}
let Q_ZAP = 0;
function puddleZap(pd, p, mult) {
  const q = G.q;
  const zid = ++Q_ZAP;
  const net = q.puddles.filter((o) => Math.hypot(o.x - pd.x, o.y - pd.y) < 260);
  const dmg = (30 + G.level * 4) * (G.conc.trueno ? 1.5 : 1) * (mult || 1);
  let hit = 0;
  for (const o of net) {
    near(o.x, o.y, o.r + 60, (e) => {
      const ee = e.proxy || e;
      if (ee._zapT === zid) return;
      if ((e.x - o.x) ** 2 + (e.y - o.y) ** 2 < (o.r + e.r) ** 2) {
        ee._zapT = zid;
        hurt(e, dmg * (ee.boss ? 0.7 : 1), p);
        hit++;
      }
    });
    o.flash = 0.3;
  }
  if (net.length > 1) {
    const pts = net.slice(0, 6).map((o) => [o.x, o.y, groundAt(o.x, o.y) + 6]);
    fx.push({ k: 'bolt', pts, t: 0.25, col: '#9ad8ff', st: 'bolt' });
  }
  return hit;
}
function qOnStrike(x, y, p) {
  const q = G.q;
  if (!q || !G.qfx || !G.qfx.favor || q.zapCd > 0) return;
  const pd = q.puddles.find((o) => Math.hypot(o.x - x, o.y - y) < o.r + 50);
  if (pd) {
    q.zapCd = 0.35;
    puddleZap(pd, p, 0.8);
  }
}
function questsTick(dt) {
  const q = G.q;
  if (!q) return;
  if (G.qfx && G.qfx.fire) {
    Q_BURN = true;
    for (const e of enemies) {
      if (!(e.burnQ > 0) || e.dead) continue;
      e.burnQ -= dt;
      e.burnTick = (e.burnTick || 0) - dt;
      if (e.burnTick <= 0) {
        e.burnTick = 0.5;
        hurt(e, (5 + G.level * 1.2) * (e.boss ? 0.6 : 1), e.burnBy);
        if (Math.random() < 0.5)
          fx.push({
            k: 'p',
            x: e.x + rand(-6, 6),
            y: e.y + rand(-6, 6),
            z: (e.z || 0) + rand(6, 24),
            vx: 0,
            vy: 0,
            vz: rand(40, 90),
            t: 0.4,
            c: Math.random() < 0.5 ? '#ff8a3a' : '#ffd060',
          });
      }
    }
    Q_BURN = false;
  }
  q.zapCd = Math.max(0, (q.zapCd || 0) - dt);
  for (const o of q.puddles) {
    o.t -= dt;
    o.flash = Math.max(0, (o.flash || 0) - dt);
  }
  q.puddles = q.puddles.filter((o) => o.t > 0);
  if (G.qfx && G.qfx.favor) {
    // contra jefes: la tormenta moja a jefes y élites cercanos aunque no mueran enemigos normales
    q.wetT -= dt;
    if (q.wetT <= 0) {
      q.wetT = 4;
      const c = camera();
      for (const e of enemies) {
        if (e.dead || !(e.boss || e.elite)) continue;
        if (Math.hypot(e.x - c.x, e.y - c.y) < 520) addPuddle(e.x, e.y, 6);
      }
    }
    if (q.puddles.length) {
      q.zapT -= dt;
      if (q.zapT <= 0) {
        q.zapT = 2.5;
        let best = null,
          bn = 0;
        for (const o of q.puddles) {
          let n = 0;
          near(o.x, o.y, o.r + 60, (e) => {
            const ee = e.proxy || e;
            if ((e.x - o.x) ** 2 + (e.y - o.y) ** 2 < (o.r + e.r) ** 2) n += ee.boss ? 4 : 1;
          });
          if (n > bn) {
            bn = n;
            best = o;
          }
        }
        if (best) {
          const p = players.find((z) => !z.down) || players[0];
          strike(best.x, best.y, 0, p, '#9ad8ff');
          puddleZap(best, p);
        }
      }
    }
  }
}
