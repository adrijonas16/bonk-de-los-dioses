/* ---------- ofertas y aceptación ---------- */
function relWord(p, giver) {
  const rl = relOf(p.god, giver);
  return rl ? rl.type : 'neutral';
}
function favorText(a, p) {
  const F = FAVORS[a.fid],
    giver = GOD[a.giver];
  p = p || players[0];
  const rw = relWord(p, a.giver);
  const cnt = (G.concCount && G.concCount[F.tag]) || 0;
  const rel = {
    aliado: `${giver.name} es aliado de ${p.g.name}: cazadores cada ${Q_HUNT.aliado} s.`,
    neutral: `${giver.name} no tiene relación con ${p.g.name}: cazadores cada ${Q_HUNT.neutral} s.`,
    rival: `${giver.name} es rival de ${p.g.name}: cazadores cada ${Q_HUNT.rival} s y el perseguidor es más rápido.`,
  }[rw];
  return {
    icon: F.icon,
    col: F.col,
    name: `Favor de ${giver.name}`,
    give: `Lo ofrece ${giver.name}; puede aceptarlo cualquier dios. Trae ${F.relic}, una piedra sagrada lejana, hasta su altar.`,
    rew: `${F.title} toda la partida. ${F.desc} Además suma 1 de las 3 fuentes del ${CONCILIOS[F.tag].name} (ahora tienes ${cnt}/3); con el Concilio activo, +50 % de daño.`,
    risk: `La Illa pesa (−10 % de velocidad). Un perseguidor te sigue y embiste (desliza para esquivarlo) y los cazadores salen por delante. ${rel}`,
    meta: rel,
  };
}
function qInfo(a) {
  return a.id === 'favor' ? favorText(a, G.q && G.q.offerP) : QDEF[a.id];
}
function qThiefHp() {
  let best = 0;
  for (const p of qHumans()) {
    let s = 0;
    for (const k in p.weapons) {
      const W = WEAPONS[k],
        l = p.weapons[k].lvl,
        st = kst(W, l, p),
        cd = (st.cd || 1) * p.cdMul;
      switch (W.k) {
        case 'chain':
          s += (st.dmg * st.bolts) / cd;
          break;
        case 'shot':
          s += (st.dmg * Math.min(st.count, 3)) / cd;
          break;
        case 'line':
        case 'bounce':
        case 'nova':
        case 'melee':
          s += st.dmg / cd;
          break;
        case 'boomer':
          s += (st.dmg * Math.min(st.count, 2) * 1.5) / cd;
          break;
        case 'homing':
          s += (st.dmg * st.count) / cd;
          break;
        case 'sword':
          s += (st.dmg * 1.5 * st.count) / cd;
          break;
        case 'orbit':
          s += st.dmg * 2;
          break;
        case 'aura':
          s += st.dmg / st.tick;
          break;
        case 'trail':
          s += st.dmg;
          break;
      }
    }
    best = Math.max(best, s * pMul(p));
  }
  return Math.max(160, best * 9);
}
function questAccept(a, p) {
  const q = G.q;
  if (q.active.length >= QMAX) {
    texts.push({ x: a.x, y: a.y, z: groundAt(a.x, a.y) + 70, v: 'Máximo 2 encargos a la vez', t: 1.2, c: '#ff6a5a' });
    return;
  }
  q.offerP = p;
  const inf = qInfo(a);
  a.state = 'active';
  const A = { id: a.id, a, t: 0, by: p };
  q.active.push(A);
  banner(`Encargo aceptado: ${inf.name}`);
  switch (a.id) {
    case 'ladron': {
      a.chest.forEach((m) => (m.visible = false));
      const hp = qThiefHp();
      A.e = qEnemy('atoq', a.x + 20, a.y, {
        hp,
        qcap: hp * 0.25,
        qbud: hp * 0.1,
        spd: 170,
        dmg: 4,
        r: 16,
        xp: 6,
        qq: A,
        qai: thiefAI,
        onHit: (e) => {
          e.stag = 0.45;
        },
      });
      A.wp = 0;
      A.left = 50;
      A.stum = 0;
      A.burst = 1.8;
      A.nextSt = rand(4, 5);
      G.qPrio = A.e;
      say(p, '¡Eh, eso es mío!', 0.2);
      bigBanner('¡ATOQ ROBA EL COFRE!', 'Corre casi como tú: pégate a él y salta los muros');
      break;
    }
    case 'llama': {
      A.carrier = p;
      p.qFlame = true;
      A.f = 100;
      A.lit = 0;
      A.storm = 0;
      A.warn = 0;
      A.next = 7;
      A.weak = null;
      a.fire.forEach((m) => (m.visible = false));
      bigBanner(
        'LLEVAS LA LLAMA DE INTI',
        'Enciende los dos braseros · refúgiate en los tambos cuando llegue la ventisca'
      );
      break;
    }
    case 'sellos': {
      const gx = a.x + Math.cos(a.ang) * 60,
        gy = a.y + Math.sin(a.ang) * 60;
      A.e = spawnGiant(A, gx, gy);
      A.left = Q_SEAL_TIME;
      bigBanner(
        'EL GUARDIÁN DESPIERTA',
        'Los sellos lo protegen: ponte junto a uno y esquiva su golpe para que lo rompa'
      );
      break;
    }
    case 'favor': {
      A.carrier = null;
      A.relic = { x: a.relic.x, y: a.relic.y };
      A.hunt = 0;
      A.rel = relWord(p, a.giver);
      bigBanner(
        `${GOD[a.giver].name.toUpperCase()} ESPERA ${FAVORS[a.fid].relic.toUpperCase()}`,
        'Sigue el haz de luz dorada'
      );
      say(p, 'Iré por ella.', 0.3);
      break;
    }
  }
}
function questEnd(A, ok, msg, sub, recentTxt) {
  const q = G.q;
  q.active = q.active.filter((x) => x !== A);
  A.a.state = ok ? 'done' : 'failed';
  if (!ok && A.e && !A.e.dead) {
    A.e.dead = true;
    fx.push({ k: 'ring', x: A.e.x, y: A.e.y, r: 70, t: 0.5, max: 0.5, col: '#ffffff' });
  }
  if (A.stalker && !A.stalker.dead) {
    A.stalker.dead = true;
    fx.push({ k: 'ring', x: A.stalker.x, y: A.stalker.y, r: 80, t: 0.5, max: 0.5, col: '#ff4d5e' });
    for (let i = 0; i < 16; i++)
      fx.push({
        k: 'p',
        x: A.stalker.x,
        y: A.stalker.y,
        z: A.stalker.z + 20,
        vx: rand(-90, 90),
        vy: rand(-90, 90),
        vz: rand(60, 200),
        t: 0.6,
        c: '#3a1a1a',
      });
  }
  if (A.carrier) {
    A.carrier.qFlame = false;
    A.carrier.qRelic = false;
  }
  if (G.qPrio && A.e === G.qPrio) G.qPrio = null;
  if (ok) G.qfx.done++;
  qRecent(A, ok, recentTxt || (ok ? 'Completado' : 'Fallido'));
  bigBanner(msg, sub || '');
}
function questAbandon(A) {
  questEnd(A, false, 'ENCARGO ABANDONADO', qInfo(A.a).name, 'Abandonado');
}
