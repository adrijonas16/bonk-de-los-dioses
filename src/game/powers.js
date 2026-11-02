/* ---------- poderes ---------- */
function onScreen(e) {
  const c = camera();
  return (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < VIEW * VIEW;
}
function strike(x, y, dmg, p, col, tgt) {
  if (tgt && !tgt.dead) {
    x = tgt.x;
    y = tgt.y;
  }
  const g = groundAt(x, y);
  fx.push({ k: 'sky', x, y, t: 0.45, t0: 0.45, col: col || C.gold });
  fx.push({ k: 'scorch', x, y, t: 3, r: rand(22, 32) });
  for (let i = 0; i < 10; i++)
    fx.push({
      k: 'p',
      x,
      y,
      z: g + 6,
      vx: rand(-180, 180),
      vy: rand(-180, 180),
      vz: rand(150, 380),
      t: rand(0.3, 0.6),
      c: i % 2 ? '#ffffff' : col || C.gold,
    });
  if (dmg > 0)
    near(x, y, 90, (e) => {
      if ((e.x - x) ** 2 + (e.y - y) ** 2 < (48 + e.r) ** 2) {
        hurt(e, dmg, p);
        e.stun = Math.max(e.stun || 0, 0.25);
      }
    });
  if (dmg > 0 && typeof qOnStrike === 'function') qOnStrike(x, y, p);
  if (!dmg) return;
  const c = camera();
  const dd = Math.hypot(c.x - x, c.y - y);
  G.shake = Math.min(1, G.shake + Math.max(0, 0.35 - dd / 2400));
  G.flashT = Math.max(G.flashT, 0.07);
}
function skybolts(p, n, dmg, stagger) {
  const vis = shuffle(enemies.filter((e) => !e.dead && onScreen(e)));
  const col = p ? WEAPONS[p.g.w].col : C.gold;
  const m = Math.min(n, vis.length);
  for (let i = 0; i < n; i++) {
    const t = vis[i % Math.max(1, m)];
    let x, y;
    if (t) {
      x = t.x;
      y = t.y;
    } else if (p) {
      x = p.x + rand(-220, 220);
      y = p.y + rand(-220, 220);
    } else continue;
    if (stagger)
      G.boltQ.push({
        t: i * stagger + rand(0, 0.05),
        x: x + (i >= m ? rand(-60, 60) : 0),
        y: y + (i >= m ? rand(-60, 60) : 0),
        dmg,
        p,
        col,
        tgt: i < m ? t : null,
      });
    else strike(x, y, dmg, p, col, t);
  }
  if (stagger) G.stormT = Math.max(G.stormT, n * stagger + 0.8);
}
const POW_LV = 5;
function powLocked(p) {
  return p.ctrl !== 'net' && p.ctrl !== 'npc' && G && G.level < POW_LV;
}
function usePower(p) {
  if (!p || p.down || p.pow > 0 || (state !== 'play' && p.ctrl !== 'net')) return;
  if (powLocked(p)) {
    if (p.ctrl !== 'ai' && (!G.lockMsgT || G.t - G.lockMsgT > 2)) {
      G.lockMsgT = G.t;
      banner(`Poder divino bloqueado · se despierta en el nivel ${POW_LV}`);
    }
    return;
  }
  p.powAnim = 0.7;
  const g = p.g,
    [kind, arg] = g.pw.split(':'),
    m = 1 + G.level * 0.07,
    col = WEAPONS[g.w].col,
    pz = p.z + 22;
  switch (kind) {
    case 'storm':
      skybolts(p, 12 + Math.floor(G.level / 2), 55 * m, 0.09);
      break;
    case 'wave':
      fx.push({
        k: 'wave',
        o: p,
        x: p.x,
        y: p.y,
        r: 10,
        max: 300 * p.area,
        hit: new Set(),
        dmg: 50 * m,
        t: 9,
        col: C.sea,
      });
      break;
    case 'tide':
      fx.push({
        k: 'wave',
        o: p,
        x: p.x,
        y: p.y,
        r: 10,
        max: 280 * p.area,
        hit: new Set(),
        dmg: 40 * m,
        t: 9,
        col: '#6fb3bb',
      });
      for (const q2 of players) if (!q2.down) heal(q2, q2.maxHp * 0.3);
      break;
    case 'dashvolley':
      for (let i = 0; i < 8; i++)
        fx.push({
          k: 'p',
          x: p.x,
          y: p.y,
          z: p.z + 10,
          vx: rand(-40, 40),
          vy: rand(-40, 40),
          vz: rand(40, 120),
          t: 0.5,
          c: C.bone,
        });
      tryMove(p, p.fx * 150, p.fy * 150, true);
      p.vz = 300;
      p.air = true;
      p.inv = Math.max(p.inv, 0.7);
      for (let i = 0; i < 24; i++)
        proj.push(
          mkProj(p, 'shot', 'arrow', C.bone, p.x, p.y, pz, (i / 24) * 6.2832, 560, {
            dmg: 16 + 3 * G.level,
            pierce: 3,
            r: 6 * p.area,
            t: 1,
          })
        );
      break;
    case 'stealth':
      p.hidden = 4;
      break;
    case 'radiant':
      p.radiant = 6;
      heal(p, 25);
      break;
    case 'shield':
      p.shield = 5;
      for (let i = 0; i < 8; i++)
        proj.push(
          mkProj(p, 'line', 'spear', C.gold, p.x, p.y, pz, (i / 8) * 6.2832, 390, {
            dmg: 45 + 10 * G.level,
            pierce: 9999,
            r: 12 * p.area,
            t: 1.4,
          })
        );
      break;
    case 'quake': {
      const Rr = 200 * p.area;
      fx.push({ k: 'ring', x: p.x, y: p.y, r: Rr, t: 0.5, max: 0.5, col });
      fx.push({ k: 'ring', x: p.x, y: p.y, r: Rr * 0.6, t: 0.35, max: 0.35, col: C.bone });
      near(p.x, p.y, Rr + 40, (e) => {
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (Rr + e.r) ** 2) {
          hurt(e, 60 * m, p);
          const ee = e.proxy || e;
          if (!ee.boss) {
            ee.stun = 1.5;
            push(ee, p.x, p.y, 30);
          }
        }
      });
      break;
    }
    case 'lance':
      proj.push(
        mkProj(
          p,
          'line',
          arg || 'spear',
          arg === 'serpent' ? '#3aa07a' : arg === 'firespear' ? '#f2a23c' : arg === 'blade' ? '#7ad04a' : C.gold,
          p.x,
          p.y,
          pz,
          facing(p),
          720,
          { dmg: 120 * m, pierce: 9999, r: 26 * p.area, t: 1.6, big: true }
        )
      );
      break;
    case 'summon': {
      const n = arg === 'tornado' ? (g.id === 'marduk' ? 7 : 5) : arg === 'leon' ? 2 : 4;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.28;
        allies.push(mkAlly(arg, p, p.x + Math.cos(a) * 40, p.y + Math.sin(a) * 40, arg === 'tornado' ? 7 : 10));
      }
      break;
    }
    case 'clones':
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * 6.28;
        allies.push(mkAlly('clone', p, p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70, 6));
      }
      break;
    case 'nuke':
      flash(g.id === 'viracocha' ? '#6fb3bb' : g.id === 'shiva' ? '#c8a0ff' : '#fff6e0');
      for (const e of enemies) if (!e.dead && onScreen(e)) hurt(e, 90 * m, p);
      fx.push({ k: 'ring', x: p.x, y: p.y, r: VIEW, t: 0.7, max: 0.7, col: '#fff6e0' });
      break;
    case 'execute':
      flash(C.gold, 0.5);
      for (const e of enemies) {
        if (e.dead || !onScreen(e)) continue;
        if (!e.boss && e.hp < e.maxHp * 0.5) {
          e.hp = 0;
          kill(e, p);
        } else hurt(e, e.boss ? 150 * m : 40 * m, p);
      }
      break;
    case 'rage':
      p.rage = 6;
      break;
    case 'charge':
      p.charging = 0.7;
      p.cvx = p.fx;
      p.cvy = p.fy;
      p.chHit = new Set();
      p.inv = Math.max(p.inv, 0.8);
      break;
    case 'giant':
      p.giant = 8;
      break;
    case 'freeze':
      flash(g.id === 'mamaquilla' ? '#c8ccd8' : '#fff6e0', 0.5);
      for (const e of enemies) {
        if (e.dead || !onScreen(e)) continue;
        e.stun = e.boss ? 1.2 : 3;
        hurt(e, 30 * m, p);
      }
      break;
    case 'mark':
      for (const e of enemies) {
        if (e.dead || !onScreen(e)) continue;
        e.mark = 8;
        hurt(e, 20 * m, p);
      }
      flash(C.blood, 0.35);
      break;
    case 'revive':
      for (const q2 of players) {
        if (q2.down) {
          q2.down = false;
          q2.hp = q2.maxHp * 0.5;
          q2.inv = 2;
          say(q2, pick(LINES.thanks));
        } else heal(q2, q2.maxHp * 0.5);
        q2.inv = Math.max(q2.inv, 1.5);
      }
      flash('#fff6e0', 0.5);
      break;
  }
  p.pow = g.cd * p.cdMul * p.powCdMul;
  if (p.ctrl === 'net') {
    say(p, g.pn + '!');
    return;
  }
  p.powSeq++;
  missionAdd('power', 1);
  banner(g.pn.toUpperCase());
  syncPower(p);
}
function syncPower(p) {
  if (p.idx > 1) return;
  G.lastPow[p.idx] = G.t;
  if (players.length < 2) return;
  const o = players[1 - p.idx];
  if (!o || o.down) return;
  if (G.t - G.lastPow[o.idx] < 4) {
    const rl = G.rel,
      mx = (p.x + o.x) / 2,
      my = (p.y + o.y) / 2,
      m = 1 + G.level * 0.07;
    G.lastPow = [-99, -99];
    if (rl && rl.type === 'aliado') {
      fx.push({ k: 'ring', x: mx, y: my, r: 280, t: 0.7, max: 0.7, col: C.gold });
      flash(C.gold, 0.4);
      near(mx, my, 320, (e) => {
        if ((e.x - mx) ** 2 + (e.y - my) ** 2 < 280 * 280) hurt(e, 200 * m, p);
      });
      for (const q2 of players) heal(q2, q2.maxHp * 0.3);
      bigBanner('COMBO: ' + rl.combo.toUpperCase(), 'Dos panteones, un solo golpe');
    } else if (rl && rl.type === 'rival') {
      fx.push({ k: 'ring', x: mx, y: my, r: 330, t: 0.7, max: 0.7, col: C.blood });
      flash('#ff8a5a', 0.5);
      near(mx, my, 370, (e) => {
        if ((e.x - mx) ** 2 + (e.y - my) ** 2 < 330 * 330) hurt(e, 260 * m, p);
      });
      for (const q2 of players) {
        const d = Math.hypot(q2.x - mx, q2.y - my) || 1;
        tryMove(q2, ((q2.x - mx) / d) * 70, ((q2.y - my) / d) * 70, true);
        q2.vz = 320;
        q2.air = true;
      }
      bigBanner('¡CHOQUE DIVINO!', 'Sus poderes no se soportan');
      say(p, '¡Eso era mío!');
      say(o, '¡Llegué primero!', 0.8);
    } else {
      fx.push({ k: 'ring', x: mx, y: my, r: 200, t: 0.5, max: 0.5, col: C.bone });
      near(mx, my, 240, (e) => {
        if ((e.x - mx) ** 2 + (e.y - my) ** 2 < 200 * 200) hurt(e, 120 * m, p);
      });
      banner('SINCRONÍA DIVINA');
    }
  } else if (G.rel) {
    const rl = G.rel;
    if (rl.type === 'rival' && Math.random() < 0.5) say(o, pick(LINES.rivalTaunt), 0.4);
    else if (rl.type === 'aliado' && Math.random() < 0.4) say(o, pick(LINES.allyCheer), 0.4);
  }
}
function heal(p, v) {
  if (p.down) return;
  const amt = Math.min(p.maxHp - p.hp, v);
  if (amt <= 0) return;
  p.hp += amt;
  if (amt >= 1.5 && texts.length < 100)
    texts.push({ x: p.x, y: p.y, z: p.z + 60, v: '+' + Math.round(amt), t: 0.9, c: '#7de0b0' });
}
