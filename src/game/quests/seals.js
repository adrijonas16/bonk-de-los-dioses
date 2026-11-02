/* ---------- C · sellos y guardián ---------- */
function sealsLeft() {
  return G.q.seals.filter((s) => s.hp > 0).length;
}
function spawnGiant(A, x, y) {
  const DD = DF();
  const hp = 2200 * (1 + G.ridx * 0.7) * DD.hp * (players.length > 1 ? 1.4 : 1);
  const e = qEnemy('apu', x, y, {
    hp,
    spd: 46,
    dmg: 22 * DD.dmg * (1 + G.ridx * 0.3),
    r: 34,
    xp: 40,
    qq: A,
    qai: giantAI,
    qmul: 0.35,
    qfloor: 0.3,
    wind: 0,
    cool: 1.5,
    onHit: (e2, d, p) => {
      if (e2.qmul < 1 && p && (!e2.armT || G.t - e2.armT > 6)) {
        e2.armT = G.t;
        texts.push({
          x: e2.x,
          y: e2.y,
          z: e2.z + 110,
          v: `Coraza de sellos: solo 35 % · quedan ${sealsLeft()}`,
          t: 1.6,
          c: '#c8a0ff',
        });
      }
    },
    onFloor: (e2) => {
      if (!e2.kneelT || G.t - e2.kneelT > 10) {
        e2.kneelT = G.t;
        e2.stun = 2.5;
        e2.wind = 0;
        banner('Los sellos lo mantienen en pie: atrae su golpe hacia un sello');
      }
    },
  });
  fx.push({ k: 'ring', x, y, r: 110, t: 0.6, max: 0.6, col: '#c8a0ff' });
  G.shake = Math.max(G.shake, 0.5);
  return e;
}
function giantAI(e, tg, dt, sp) {
  if (e.wind > 0) {
    e.wind -= dt;
    return;
  }
  if (e.cool > 0) e.cool -= dt;
  if (!tg) return;
  const dx = tg.x - e.x,
    dy = tg.y - e.y,
    d = Math.hypot(dx, dy) || 1;
  e.fx = dx;
  e.fy = dy;
  if (d < 200 && e.cool <= 0) {
    fx.push({
      k: 'tele',
      shape: 'circle',
      x: tg.x,
      y: tg.y,
      r: 92,
      t: 1.2,
      max: 1.2,
      dmg: 26 * DF().dmg * (1 + G.ridx * 0.3),
      col: '#c8a0ff',
      qslam: e,
    });
    e.wind = 1.25;
    e.cool = 1.9;
    texts.push({ x: e.x, y: e.y, z: e.z + 90, v: '¡GOLPE!', t: 0.8, c: '#c8a0ff' });
    return;
  }
  if (d > 60) {
    e.x += (dx / d) * sp * dt;
    e.y += (dy / d) * sp * dt;
  }
}
function questSlam(f) {
  const q = G.q;
  if (!q) return;
  const A = qActive('sellos');
  G.shake = Math.max(G.shake, 0.55);
  for (let i = 0; i < 18; i++)
    fx.push({
      k: 'p',
      x: f.x + rand(-40, 40),
      y: f.y + rand(-40, 40),
      z: groundAt(f.x, f.y) + 4,
      vx: rand(-120, 120),
      vy: rand(-120, 120),
      vz: rand(100, 280),
      t: rand(0.4, 0.8),
      c: i % 2 ? '#a8a090' : '#c8a0ff',
    });
  near(f.x, f.y, f.r + 40, (e) => {
    const ee = e.proxy || e;
    if (ee === f.qslam || ee.boss) return;
    if ((e.x - f.x) ** 2 + (e.y - f.y) ** 2 < (f.r + e.r) ** 2) hurt(e, 80 + G.level * 6, null);
  });
  if (!A) return;
  let broke = false;
  for (const s of q.seals) {
    if (s.hp <= 0) continue;
    if (Math.hypot(s.x - f.x, s.y - f.y) < f.r + s.r * 0.6) {
      s.hp = 0;
      broke = true;
      s.parts.forEach((m) => (m.visible = false));
      s.disk.rotation.z = 0.25;
      s.disk.position.y = 2;
      for (let i = 0; i < 24; i++)
        fx.push({
          k: 'p',
          x: s.x,
          y: s.y,
          z: groundAt(s.x, s.y) + 16,
          vx: rand(-160, 160),
          vy: rand(-160, 160),
          vz: rand(120, 320),
          t: rand(0.5, 0.9),
          c: '#c8a0ff',
        });
      const left = sealsLeft();
      banner(left ? `¡Sello roto! Quedan ${left}` : '¡El último sello se rompe!');
      if (!left) {
        openGate(A, true);
        return;
      }
    }
  }
  if (!broke && (!A.hintT || G.t - A.hintT > 10)) {
    A.hintT = G.t;
    const near2 = q.seals.filter((s) => s.hp > 0).map((s) => Math.hypot(s.x - f.x, s.y - f.y));
    if (Math.min(...near2) > f.r + 60)
      banner('Ese golpe no tocó ningún sello: colócate junto a uno antes de que pegue');
  }
}
function openGate(A, full) {
  const a = A.a;
  a.barrier.visible = false;
  const rng = Math.random;
  const ix = a.x - Math.cos(a.ang) * 40,
    iy = a.y - Math.sin(a.ang) * 40;
  {
    const [x, y] = qNearSpot(G.q.R, rng, ix, iy, 40);
    WORLD.chests.push({ x, y, opened: false, rich: full, free: true });
  }
  if (full) {
    const [x, y] = qNearSpot(G.q.R, rng, a.x - Math.cos(a.ang) * 110, a.y - Math.sin(a.ang) * 110, 60);
    const gg = new THREE.Group();
    gg.position.set(x, groundAt(x, y) + 6, y);
    WORLD.group.add(gg);
    qMesh(GEO.cyl(20, 24, 12, 8), MLT('#8a8a8a', 'stone'), 0, 0, 0, gg);
    const gem = new THREE.Mesh(GEO.oct(9), MB('#c8a0ff'));
    gem.position.y = 32;
    gg.add(gem);
    WORLD.altars.push({ x, y, charge: 0, used: false, obj: gg, gem });
  }
  const e = A.e;
  if (e && !e.dead) {
    if (full) {
      e.qmul = 1;
      e.qfloor = 0;
      e.elite = true;
    } else {
      e.qfloor = 0;
      e.hp = 0;
      kill(e, null);
    }
  }
  questEnd(
    A,
    full,
    full ? '¡LA PUERTA DEL APU SE ABRE!' : 'EL GUARDIÁN SE DESMORONA',
    full
      ? 'Dentro: un cofre del jefe y un altar · el Guardián pierde su coraza'
      : 'Se acabó el tiempo: la puerta cede a medias y deja un cofre normal',
    full ? 'Puerta abierta' : 'Puerta a medias (tiempo)'
  );
  if (full)
    setTimeout(() => {
      if (G && state === 'play') banner('Aprendido: algunos jefes se hieren con sus propios golpes');
    }, 3600);
}
function sealsUpdate(A, dt) {
  A.left -= dt;
  if (A.left <= 0) openGate(A, false);
}
