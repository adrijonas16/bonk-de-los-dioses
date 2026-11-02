/* ---------- aliados ---------- */
function mkAlly(type, o, x, y, t) {
  const base = { type, o, x, y, t, cd: 0, ph: rand(0, 6.28) };
  switch (type) {
    case 'einherjar':
      return { ...base, spd: 150, dmg: 22, r: 10 };
    case 'leon':
      return { ...base, spd: 170, dmg: 30, r: 12 };
    case 'tornado':
      return { ...base, spd: 120, dmg: 10, r: 22, vx: rand(-1, 1), vy: rand(-1, 1) };
    case 'shade':
      return { ...base, spd: 140, dmg: 14, r: 9 };
    case 'clone':
      return { ...base, spd: 0, dmg: 0, r: 12, taunt: true };
    case 'dog':
      return { ...base, spd: 200, dmg: 16, r: 9 };
  }
}
function updAllies(dt) {
  for (const a of allies) {
    a.t -= dt;
    a.cd -= dt;
    const o = a.o;
    if (a.type === 'clone') {
      a.x += Math.cos(T * 2 + a.ph) * 10 * dt;
      if (a.t <= 0) {
        fx.push({ k: 'ring', x: a.x, y: a.y, r: 90, t: 0.4, max: 0.4, col: '#7ad04a' });
        near(a.x, a.y, 130, (e) => {
          if ((e.x - a.x) ** 2 + (e.y - a.y) ** 2 < (90 + e.r) ** 2) hurt(e, 60 + G.level * 5, o);
        });
      }
      continue;
    }
    if (a.type === 'tornado') {
      const t = nearestE(a.x, a.y, 260);
      let dx = a.vx,
        dy = a.vy;
      if (t) {
        dx = t.x - a.x;
        dy = t.y - a.y;
      }
      const d = Math.hypot(dx, dy) || 1;
      a.x += (dx / d) * a.spd * dt + Math.cos(T * 5 + a.ph) * 30 * dt;
      a.y += (dy / d) * a.spd * dt + Math.sin(T * 5 + a.ph) * 30 * dt;
      if (a.cd <= 0) {
        a.cd = 0.25;
        near(a.x, a.y, a.r + 40, (e) => {
          if ((e.x - a.x) ** 2 + (e.y - a.y) ** 2 < (a.r + e.r) ** 2) {
            hurt(e, a.dmg + G.level * 1.5, o);
            const ee = e.proxy || e;
            if (!ee.boss) push(ee, a.x, a.y, -6);
          }
        });
      }
      continue;
    }
    let tg = nearestE(a.x, a.y, a.type === 'dog' ? 220 : 400);
    if (a.type === 'dog' && (!tg || Math.hypot(o.x - a.x, o.y - a.y) > 260)) tg = null;
    const tx = tg ? tg.x : o.x + Math.cos(T + a.ph) * 40,
      ty = tg ? tg.y : o.y + Math.sin(T + a.ph) * 40;
    const dx = tx - a.x,
      dy = ty - a.y,
      d = Math.hypot(dx, dy) || 1;
    if (d > 4) {
      a.x += (dx / d) * a.spd * dt;
      a.y += (dy / d) * a.spd * dt;
    }
    a.fx = dx;
    a.fy = dy;
    if (tg && a.cd <= 0 && d < tg.r + a.r + 4) {
      a.cd = 0.4;
      hurt(tg, a.dmg + G.level * (a.type === 'dog' ? 2 : 1.5), o);
    }
  }
  allies = allies.filter((a) => a.t > 0);
}
