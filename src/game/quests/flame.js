/* ---------- B · llama ---------- */
function flameUpdate(A, dt) {
  const q = G.q;
  const c = A.carrier;
  if (A.storm > 0) {
    A.storm -= dt;
    A.sAcc = (A.sAcc || 0) + dt;
    if (A.sAcc > 0.5 / DF().ev) {
      A.sAcc = 0;
      const t = c || pick(qHumans()) || players[0];
      fx.push({
        k: 'tele',
        shape: 'circle',
        x: t.x + rand(-240, 240),
        y: t.y + rand(-240, 240),
        r: 46,
        t: 1.2,
        dmg: 16 * DF().dmg,
        col: '#9fe0ff',
        snow: true,
      });
    }
    if (A.storm <= 0) {
      A.next = rand(28, 36);
      banner('La ventisca amaina');
    }
  } else if (A.warn > 0) {
    A.warn -= dt;
    if (A.warn <= 0) {
      A.storm = 11;
      G.slowT = Math.max(G.slowT, 11);
      bigBanner('¡VENTISCA!', 'Métete en un tambo: fuera de él la llama se debilita');
    }
  } else {
    A.next -= dt;
    if (A.next <= 0) {
      A.warn = 5;
      bigBanner('SE ACERCA UNA VENTISCA', 'Tienes 5 s para llegar a un tambo (anillo azul)');
    }
  }
  if (c) {
    if (c.down) {
      dropFlame(A);
      return;
    }
    const safe = inShelter(c);
    if (A.weak != null) {
      A.weak -= dt;
      if (safe) {
        A.weak = null;
        A.f = 40;
        banner('¡La llama revive! (40 %)');
        for (let i = 0; i < 14; i++)
          fx.push({
            k: 'p',
            x: c.x,
            y: c.y,
            z: c.z + 66,
            vx: rand(-60, 60),
            vy: rand(-60, 60),
            vz: rand(60, 160),
            t: 0.5,
            c: '#ffd060',
          });
      } else if (A.weak <= 0) {
        c.qFlame = false;
        A.carrier = null;
        flameFail(A);
        return;
      }
      for (const b of q.braz)
        if (!b.lit && Math.hypot(c.x - b.x, c.y - b.y) < 60 && (!A.msgT || G.t - A.msgT > 2)) {
          A.msgT = G.t;
          texts.push({
            x: b.x,
            y: b.y,
            z: groundAt(b.x, b.y) + 80,
            v: 'La brasa no basta: reavívala en un tambo',
            t: 1.4,
            c: '#ffb040',
          });
        }
      return;
    }
    if (A.storm > 0 && !safe) A.f -= 8 * dt;
    else if (safe) A.f = Math.min(100, A.f + 12 * dt);
    for (const b of q.braz) {
      if (b.lit) continue;
      if (Math.hypot(c.x - b.x, c.y - b.y) < 60) {
        b.lit = true;
        b.fire.forEach((m) => (m.visible = true));
        b.mark.visible = false;
        A.lit++;
        A.f = 100;
        for (let i = 0; i < 26; i++)
          fx.push({
            k: 'p',
            x: b.x,
            y: b.y,
            z: groundAt(b.x, b.y) + 50,
            vx: rand(-120, 120),
            vy: rand(-120, 120),
            vz: rand(80, 300),
            t: rand(0.4, 0.8),
            c: i % 2 ? '#ffd060' : '#ff6a1a',
          });
        if (A.lit >= q.braz.length) {
          c.qFlame = false;
          A.carrier = null;
          G.qfx.fire = true;
          questEnd(
            A,
            true,
            '¡FUEGO DE INTI!',
            'Tus golpes queman · los braseros son refugios en las ventiscas',
            'Fuego de Inti conseguido'
          );
          return;
        }
        banner(`Brasero encendido (${A.lit}/${q.braz.length}) · la llama recupera su fuerza`);
      }
    }
    if (A.f <= 0) {
      A.f = 0;
      A.weak = Q_EMBER;
      bigBanner(
        'LA LLAMA SE HA REDUCIDO A UNA BRASA',
        `Llévala a un tambo o a un brasero encendido antes de ${Q_EMBER} s`
      );
      fx.push({ k: 'ring', x: c.x, y: c.y, r: 50, t: 0.5, max: 0.5, col: '#ff4a2a' });
    }
  } else {
    const em = A.ember;
    if (!em) return;
    em.t -= dt;
    if (em.t <= 0) {
      A.ember = null;
      flameFail(A);
      return;
    }
    for (const p of qHumans()) {
      if (Math.hypot(p.x - em.x, p.y - em.y) < 36) {
        A.carrier = p;
        p.qFlame = true;
        A.weak = em.t;
        A.ember = null;
        banner('Recoges la brasa · reavívala en un tambo');
        break;
      }
    }
  }
}
function flameFail(A) {
  const a = A.a;
  for (let i = 0; i < 20; i++)
    fx.push({
      k: 'p',
      x: a.x + rand(-10, 10),
      y: a.y + rand(-10, 10),
      z: groundAt(a.x, a.y) + 40,
      vx: rand(-20, 20),
      vy: rand(-20, 20),
      vz: rand(30, 90),
      t: 1.2,
      c: '#6a6a72',
    });
  questEnd(
    A,
    false,
    'LA LLAMA SE APAGÓ DEL TODO',
    A.lit ? 'Encargo fallido · los braseros que encendiste siguen dando refugio' : 'Encargo fallido · la partida sigue',
    'La llama se apagó'
  );
}
function dropFlame(A) {
  const c = A.carrier;
  if (!c) return;
  c.qFlame = false;
  A.carrier = null;
  const t = A.weak != null ? A.weak : Q_EMBER;
  A.weak = null;
  A.f = 0;
  A.ember = { x: c.x, y: c.y, t };
  banner(`La brasa cayó al suelo · recógela antes de ${Math.ceil(t)} s`);
  fx.push({ k: 'ring', x: c.x, y: c.y, r: 50, t: 0.5, max: 0.5, col: '#ff4a2a' });
}
function qFlameHit(p) {
  const A = qActive('llama');
  if (A && A.carrier === p && A.weak == null) A.f -= 5;
}
