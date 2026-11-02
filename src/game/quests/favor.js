/* ---------- favor divino ---------- */
function favorUpdate(A, dt) {
  const a = A.a,
    F = FAVORS[a.fid];
  if (A.stalker && A.stalker.dead && !A.stalkerDone) {
    A.stalkerDone = true;
    banner('¡Derrotaste al perseguidor! Ya no volverá');
  }
  if (!A.carrier) {
    const r = A.relic;
    for (const p of qHumans()) {
      if (Math.hypot(p.x - r.x, p.y - r.y) < 36) {
        A.carrier = p;
        p.qRelic = true;
        A.hunt = 2;
        banner(`Tienes ${F.relic} · llévala al altar`);
        if (!A.stalkerDone && (!A.stalker || A.stalker.dead)) {
          {
            const [x, y] = spawnPos(Math.atan2(a.y - p.y, a.x - p.x) + rand(-0.6, 0.6));
            A.stalker = qEnemy('supay', x, y, {
              hp: 900 * (1 + G.ridx * 0.7) * DF().hp,
              spd: 150,
              dmg: 14 * DF().dmg,
              r: 22,
              xp: 20,
              qq: A,
              elite: true,
              qai: stalkAI,
              lcd: 3,
            });
            bigBanner('UN PERSEGUIDOR HUELE LA ILLA', 'Embiste en línea recta: desliza (Shift) para esquivarlo');
          }
        }
        if (A.stalker && !A.stalker.dead) A.stalker.stalk = p;
        break;
      }
    }
    return;
  }
  const c = A.carrier;
  if (c.down) {
    c.qRelic = false;
    A.relic = { x: c.x, y: c.y };
    A.carrier = null;
    if (A.stalker) A.stalker.stalk = null;
    banner('¡Se te cayó la Illa! El perseguidor la vigila');
    return;
  }
  A.relic = { x: c.x, y: c.y };
  A.hunt -= dt;
  if (A.hunt <= 0) {
    A.hunt = Q_HUNT[A.rel] || 6;
    const ah = Math.atan2(a.y - c.y, a.x - c.x);
    for (let i = 0; i < 2; i++) {
      const [x, y] = spawnPos(ah + rand(-0.5, 0.5));
      qEnemy('supay', x, y, {
        hp: ENEMIES.supay.hp * (1 + G.ridx * 0.85 + (G.rt / 60) * 0.34) * DF().hp * 2.5,
        spd: ENEMIES.supay.spd * 1.3,
        dmg: ENEMIES.supay.dmg * DF().dmg * 1.3,
        r: 14,
        xp: 4,
        quest: false,
        heavy: false,
        hunter: true,
      });
    }
  }
  if (Math.hypot(c.x - a.x, c.y - a.y) < 64) {
    c.qRelic = false;
    A.carrier = null;
    G.qfx.favor = { by: a.giver, fid: a.fid, tag: F.tag };
    questEnd(
      A,
      true,
      `FAVOR DE ${GOD[a.giver].name.toUpperCase()}`,
      `${F.title}: ${CONCILIOS[F.tag].name} +1`,
      F.title + ' conseguido'
    );
    computeConc();
    for (let i = 0; i < 4; i++) strike(a.x + rand(-60, 60), a.y + rand(-60, 60), 0, null, '#ffe060');
  }
}
function stalkAI(e, tg, dt) {
  const A = e.qq;
  const t = e.stalk && !e.stalk.down ? e.stalk : null;
  if (e.lunge > 0) {
    e.lunge -= dt;
    e.x += e.lvx * dt;
    e.y += e.lvy * dt;
    return;
  }
  if (e.lwind > 0) {
    e.lwind -= dt;
    if (e.lwind <= 0) {
      e.lunge = 0.38;
      e.lvx = e.ldx * 600;
      e.lvy = e.ldy * 600;
    }
    return;
  }
  if (!t) {
    const r = A && A.relic;
    if (r) {
      const dx = r.x - e.x,
        dy = r.y - e.y,
        d = Math.hypot(dx, dy) || 1;
      if (d > 70) {
        e.x += (dx / d) * 150 * dt;
        e.y += (dy / d) * 150 * dt;
      }
      e.fx = dx;
      e.fy = dy;
    }
    return;
  }
  if (e.recoil > 0) {
    e.recoil -= dt;
    const rx = e.x - t.x,
      ry = e.y - t.y,
      rd = Math.hypot(rx, ry) || 1;
    e.x += (rx / rd) * 120 * dt;
    e.y += (ry / rd) * 120 * dt;
    return;
  }
  e.lcd -= dt;
  const dx = t.x - e.x,
    dy = t.y - e.y,
    d = Math.hypot(dx, dy) || 1;
  e.fx = dx;
  e.fy = dy;
  if (d < e.r + t.r + 8) {
    e.recoil = 0.8;
  }
  if (d < 300 && e.lcd <= 0) {
    e.lcd = A && A.rel === 'rival' ? 4 : 5;
    e.lwind = 0.65;
    e.ldx = dx / d;
    e.ldy = dy / d;
    fx.push({
      k: 'tele',
      shape: 'line',
      x: e.x,
      y: e.y,
      x2: e.x + e.ldx * 240,
      y2: e.y + e.ldy * 240,
      w: 44,
      t: 0.65,
      max: 0.65,
      dmg: 0,
      col: '#ff4d5e',
    });
    texts.push({ x: e.x, y: e.y, z: e.z + 60, v: '¡Embiste!', t: 0.8, c: '#ff4d5e' });
    return;
  }
  const sp = qSpeed(t) * (A && A.rel === 'rival' ? 0.9 : 0.82);
  e.x += (dx / d) * sp * dt;
  e.y += (dy / d) * sp * dt;
}
