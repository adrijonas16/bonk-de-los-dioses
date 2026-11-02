/* ---------- A · ladrón ---------- */
function thiefAI(e, tg, dt) {
  const A = e.qq,
    a = A.a;
  const [h, d] = qNearest(e.x, e.y);
  let k = d > 460 ? 0.42 : d > 300 ? 0.78 : d < 130 ? 1.06 : 0.95;
  e.qbud = Math.min(e.maxHp * 0.25, e.qbud + e.maxHp * 0.12 * dt); // como mucho ~12 % de su aguante por segundo
  if (A.burst > 0) {
    A.burst -= dt;
    k = 1.7;
  }
  if (A.burst > 0) {
    // arranque: sin tropiezos mientras dura la ventaja inicial
  } else if (A.stum > 0) {
    A.stum -= dt;
    k = 0;
  } else {
    A.nextSt -= dt;
    if (A.nextSt <= 0) {
      A.nextSt = rand(3.6, 5);
      A.stum = 0.9;
      texts.push({ x: e.x, y: e.y, z: e.z + 40, v: '¡Tropieza!', t: 0.9, c: '#ffd060' });
    }
  }
  if (e.stag > 0) {
    e.stag -= dt;
    k *= 0.55;
  }
  e.spd = h ? qSpeed(h) : 170; // se adapta a tu velocidad actual (ventisca, furia, mejoras)
  const w = a.route[A.wp % a.route.length];
  const dx = w[0] - e.x,
    dy = w[1] - e.y,
    dd = Math.hypot(dx, dy) || 1;
  if (dd < 34) A.wp++;
  const sp = e.spd * k;
  if (d <= 620) {
    e.x += (dx / dd) * sp * dt;
    e.y += (dy / dd) * sp * dt;
  }
  e.fx = dx;
  e.fy = dy;
  const g0 = groundAt(e.x, e.y);
  e.hop = Math.max(0, (e.hop || 0) - dt * 3);
  if (Math.abs(g0 - (e.lg || g0)) > 8) e.hop = 1;
  e.lg = g0;
  e.z = g0 + Math.sin(e.hop * Math.PI) * 26;
}
function thiefUpdate(A, dt) {
  A.left -= dt;
  if (A.e.dead) return;
  if (A.left <= 0) {
    questEnd(A, false, 'ATOQ ESCAPÓ', 'Se esfumó con el cofre. La partida sigue.', 'Atoq escapó');
  }
}
