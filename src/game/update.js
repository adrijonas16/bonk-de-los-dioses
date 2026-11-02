/* ---------- actualización ---------- */
function update(dt) {
  if (G.comboT > 0) {
    G.comboT -= dt;
    if (G.comboT <= 0) G.combo = 0;
  }
  G.t += dt;
  G.rt += dt;
  G.hitT = Math.max(0, (G.hitT || 0) - dt);
  for (const p of players) p.hurtT = Math.max(0, (p.hurtT || 0) - dt);
  G.noHitT += dt;
  missionSet('nohit', G.noHitT);
  G.streakT -= dt;
  if (G.dmgWin.length > 400 || (G.dmgWin.length && G.dmgWin[0][0] < G.t - 4))
    G.dmgWin = G.dmgWin.filter((w) => w[0] >= G.t - 4);
  updRemotes(dt);
  for (const p of players) {
    p.inv -= dt;
    p.pow = Math.max(0, p.pow - dt);
    p.hidden -= dt;
    p.radiant -= dt;
    p.shield -= dt;
    p.rage -= dt;
    p.giant -= dt;
    p.crown -= dt;
    p.sayT -= dt;
    p.hurt = Math.max(0, (p.hurt || 0) - dt * 2);
    if (p.frenzyT > 0) {
      p.frenzyT -= dt;
      if (p.frenzyT <= 0) p.frenzy = 0;
    }
    if (p.down) continue;
    p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
    if (p.steal) {
      const cap = 2 + p.steal * 4;
      p.stB = Math.min(cap, (p.stB || 0) + cap * dt);
    }
    let mx = 0,
      my = 0;
    if (p.ctrl === 'ai') [mx, my] = aiMove(p, dt);
    else [mx, my] = moveInput(p);
    const ml = Math.hypot(mx, my);
    p.moving = ml > 0.05;
    const hz = hazardAt(p.x, p.y);
    p.dashT -= dt;
    p.dashCd -= dt;
    const spd =
      p.speed *
      (G.slowT > 0 && !inShelter(p) ? 0.72 : 1) *
      (p.qRelic ? 0.9 : 1) *
      (p.rage > 0 ? 1.35 : 1) *
      (hz && hz.k === 'water' && !p.air ? 0.7 : 1) *
      (p.dashT > 0 ? 2.6 : 1);
    if (p.pocketBolt) {
      p.pbT -= dt;
      if (p.pbT <= 0) {
        p.pbT = 8 / p.pocketBolt;
        skybolts(p, 1, 60 + G.level * 5);
      }
    }
    if (p.charging > 0) {
      p.charging -= dt;
      tryMove(p, p.cvx * spd * 3.6 * dt, p.cvy * spd * 3.6 * dt);
      near(p.x, p.y, 60, (e) => {
        const ee = e.proxy || e;
        if (p.chHit.has(ee)) return;
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + p.r + 10) ** 2) {
          p.chHit.add(ee);
          hurt(e, 70 * (1 + G.level * 0.07), p);
          if (!ee.boss) push(ee, p.x, p.y, 40);
        }
      });
      if (Math.random() < 0.6)
        fx.push({
          k: 'p',
          x: p.x,
          y: p.y,
          z: p.z + 10,
          vx: rand(-30, 30),
          vy: rand(-30, 30),
          vz: rand(20, 80),
          t: 0.4,
          c: WEAPONS[p.g.w].col,
        });
    } else if (p.moving || p.dashT > 0) {
      if (!p.moving) {
        mx = p.fx;
        my = p.fy;
      } else if (ml > 1) {
        mx /= ml;
        my /= ml;
      }
      const moved = tryMove(p, mx * spd * dt, my * spd * dt);
      const n = Math.hypot(mx, my);
      p.fx = mx / n;
      p.fy = my / n;
      p.step += dt * 8;
      if (!moved && p.ctrl === 'ai') jump(p);
    }
    physics(p, dt);
    p.lavaT = (p.lavaT || 0) - dt;
    if (!hz && !p.air) p.safe = [p.x, p.y];
    if (p.lavaBack > 0 && p.safe) {
      p.lavaBack -= dt;
      const dx = p.safe[0] - p.x,
        dy = p.safe[1] - p.y,
        d = Math.hypot(dx, dy);
      if (d > 4) tryMove(p, (dx / d) * Math.min(d, 420 * dt), (dy / d) * Math.min(d, 420 * dt), true);
    }
    if (hz && !p.air && hz.k === 'lava' && p.lavaT <= 0) {
      p.lavaT = 0.55;
      p.lavaBack = 0.6;
      const dm = 16 * DF().dmg;
      p.hp -= dm;
      if (window.DBGH) DBGH(p, dm, { key: 'LAVA' });
      playerHit(p, dm);
      p.vz = 430;
      p.air = true;
      p.burn = 2.6;
      p.hurt = 1;
      texts.push({ x: p.x, y: p.y, z: p.z + 60, v: '¡LAVA!', t: 0.8, c: '#ff8a3a' });
      for (let i = 0; i < 14; i++)
        fx.push({
          k: 'p',
          x: p.x + rand(-10, 10),
          y: p.y + rand(-10, 10),
          z: p.z,
          vx: rand(-90, 90),
          vy: rand(-90, 90),
          vz: rand(120, 320),
          t: 0.6,
          c: i % 2 ? '#ffb040' : '#ff4a1a',
        });
      G.noHitT = 0;
    }
    if (hz && !p.air && hz.k === 'void') {
      const sf = p.safe || [0, 0];
      p.hp -= p.maxHp * 0.2 * DF().dmg;
      playerHit(p, p.maxHp * 0.2 * DF().dmg);
      p.x = sf[0];
      p.y = sf[1];
      p.z = surfaceAt(p.x, p.y) + 120;
      p.vz = 0;
      p.air = true;
      p.inv = Math.max(p.inv, 1);
      texts.push({ x: p.x, y: p.y, z: p.z, v: '¡AL VACÍO!', t: 1, c: '#b07aff' });
      G.noHitT = 0;
    }
    if (p.burn > 0) {
      p.burn -= dt;
      p.hp -= dt * 7 * DF().dmg;
      if (Math.random() < 0.4)
        fx.push({
          k: 'p',
          x: p.x + rand(-7, 7),
          y: p.y + rand(-7, 7),
          z: p.z + rand(5, 30),
          vx: 0,
          vy: 0,
          vz: rand(30, 80),
          t: 0.4,
          c: Math.random() < 0.5 ? '#ff8a3a' : '#ffd060',
        });
    }
    if (p.hp <= 0) {
      p.hp = 1;
      if (!p.inv || p.inv <= 0) {
        p.hp = 0;
        downPlayer(p);
      }
    }
    p.r = p.giant > 0 ? 26 : 14;
  }
  if (G.coop) {
    const hs = players.filter((p) => p.ctrl !== 'ai' && !p.down);
    if (hs.length === 2) {
      const [a, b] = hs,
        d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 520) {
        const k = (d - 520) / d / 2;
        const dx = (b.x - a.x) * k,
          dy = (b.y - a.y) * k;
        tryMove(a, dx, dy, true);
        tryMove(b, -dx, -dy, true);
      }
    }
  }
  for (const p of players) {
    if (p.ctrl === 'ai') {
      const c = camera();
      if (Math.hypot(p.x - c.x, p.y - c.y) > 650) {
        p.x = c.x + rand(-60, 60);
        p.y = c.y + rand(-60, 60);
        p.z = surfaceAt(p.x, p.y) + 80;
        p.air = true;
      }
    }
  }
  for (const p of players) {
    if (!p.down) continue;
    let reviving = false;
    for (const o of [...players, ...remotesHere()]) {
      if (o === p || o.down) continue;
      if (Math.hypot(o.x - p.x, o.y - p.y) < 40) {
        p.revive += dt * (o.reviveMul || 1);
        reviving = true;
      }
    }
    if (!reviving) p.revive = Math.max(0, p.revive - dt * 0.5);
    if (p.revive >= 2.5) {
      p.down = false;
      p.hp = p.maxHp * 0.4;
      p.inv = 2;
      say(p, pick(LINES.thanks));
    }
  }
  if (players.length > 1) {
    const [a, b] = players;
    const rl = G.rel;
    a.bond = b.bond = false;
    if (rl && rl.type === 'aliado' && !a.down && !b.down && Math.hypot(a.x - b.x, a.y - b.y) < 150)
      a.bond = b.bond = true;
    G.duelT -= dt;
    if (G.duelT <= 0) {
      G.duelT = 60;
      if (rl && rl.type === 'rival' && (a.mk || b.mk)) {
        const w = a.mk >= b.mk ? a : b,
          l = w === a ? b : a;
        w.crown = 60;
        bigBanner(w.g.name.toUpperCase() + ' GANA EL MINUTO', `${w.mk} a ${l.mk} contra ${l.g.name}`);
        say(w, pick(LINES.crown), 0.5);
        say(l, 'La próxima es mía.', 2);
      }
      a.mk = b.mk = 0;
    }
  }
  while (G.events.length && G.rt >= G.events[0].t) {
    const ev = G.events.shift();
    spawnBoss(ev.key, ev.corrupt, ev.nem);
  }
  {
    const per = waveK() >= 2 ? 30 : 60,
      nr = 24 + waveK() * 6;
    if (G.rt >= 30 && Math.floor(G.rt) % per === 0 && Math.floor(G.rt - dt) % per !== 0 && !G.portals) {
      const a0 = rand(0, 6.28),
        en = realmEnemyList();
      for (let i = 0; i < nr; i++) spawn(en[0], a0 + (i / nr) * 6.28);
      banner('¡TE RODEAN!');
    }
  }
  updRealmEvents(dt);
  if (!G.portals) {
    G.spawnAcc =
      (G.spawnAcc || 0) +
      (1.4 + G.rt / 11 + G.ridx * 1.2 + G.cycle + waveK() * 2.5) * (players.length > 1 ? 1.3 : 1) * DF().sp * dt;
    while (G.spawnAcc >= 1) {
      G.spawnAcc--;
      if (enemies.length < 320) spawn(pickEnemy());
    }
  }
  if (G.conc.trueno) {
    G.trueT -= dt;
    if (G.trueT <= 0) {
      G.trueT = 3.5;
      skybolts(players.find((p) => !p.down) || null, 1, 50 + G.level * 4);
    }
  }
  buildGrid();
  const c = camera(),
    slowMar = G.conc.mar ? 0.85 : 1;
  for (const e of enemies) {
    if (e.dead) continue;
    e.flash -= dt;
    e.mark -= dt;
    e.slow -= dt;
    const fly = e.boss ? e.d.arch === 'flyer' || e.d.arch === 'titan' : e.d.arch === 'flyer';
    e.z = groundAt(e.x, e.y) + (fly ? (e.boss ? 40 : 26) + Math.sin(T * 3 + e.ph) * 4 : 0);
    if (
      !fly &&
      !e.boss &&
      WORLD.haz &&
      WORLD.haz.k === 'lava' &&
      groundAt(e.x, e.y) < WORLD.haz.lv &&
      Math.random() < dt * 4
    )
      hurt(e, e.maxHp * 0.12 + 10, null);
    if (e.stun > 0) {
      e.stun -= dt;
      continue;
    }
    if (!e.boss && !e.quest && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 > 900 * 900) {
      const [x, y] = spawnPos();
      e.x = x;
      e.y = y;
      continue;
    }
    let sp = e.spd * (e.slow > 0 ? 0.5 : 1) * slowMar;
    for (const p of players) {
      if (p.slowAura && !p.down && (p.x - e.x) ** 2 + (p.y - e.y) ** 2 < 110 * 110) sp *= 1 - p.slowAura;
    }
    const tg = targetFor(e);
    if (tg) e.face = (tg.x - e.x) * Math.cos(G.yaw) - (tg.y - e.y) * Math.sin(G.yaw) < 0 ? -1 : 1;
    if (e.qai) {
      e.qai(e, tg, dt, sp);
    } else if (e.boss) {
      updBoss(e, tg, dt, sp);
    } else if (!tg || e.conf > 0) {
      if (e.conf > 0) e.conf -= dt;
      e.ph += dt * rand(-1, 1);
      e.x += Math.cos(e.ph) * sp * 0.5 * dt;
      e.y += Math.sin(e.ph) * sp * 0.5 * dt;
    } else {
      const dx = tg.x - e.x,
        dy = tg.y - e.y,
        d = Math.hypot(dx, dy) || 1;
      const wob = e.d.arch === 'flyer' ? Math.sin(T * 6 + e.ph) * 0.5 : 0;
      const ux = dx / d,
        uy = dy / d;
      const hop = e.d.feat === 'hop' ? (Math.sin(T * 6 + e.ph) > 0 ? 1.4 : 0.2) : 1;
      e.x += (ux - uy * wob) * sp * hop * dt;
      e.y += (uy + ux * wob) * sp * hop * dt;
    }
    const dd0 = Math.hypot(e.x, e.y);
    if (dd0 > ARENA - 40) {
      e.x *= (ARENA - 40) / dd0;
      e.y *= (ARENA - 40) / dd0;
    }
    near(e.x, e.y, e.r + 30, (o) => {
      if (o === e || o.proxy === e) return;
      const sx = e.x - o.x,
        sy = e.y - o.y,
        sd = Math.hypot(sx, sy),
        mn = e.r + o.r;
      if (sd > 0 && sd < mn) {
        const pp = (mn - sd) * 0.35 * (o.boss || o.proxy || o.heavy ? 2 : 1) * (e.boss || e.heavy ? 0.08 : 1);
        e.x += (sx / sd) * pp;
        e.y += (sy / sd) * pp;
      }
    });
    for (const p of players) {
      if (p.down || p.hidden > 0) continue;
      if (e.boss && e.d.friend.includes(p.god)) continue;
      if (Math.abs(p.z - e.z) > (e.boss ? e.r * 1.2 : 26) + (fly ? 10 : 0)) continue;
      const dd = (p.x - e.x) ** 2 + (p.y - e.y) ** 2,
        rr = e.r + p.r + (p.shield > 0 ? 8 : 0);
      if (dd > rr * rr) continue;
      if (p.shield > 0 || p.giant > 0) {
        if (T > e.shH) {
          e.shH = T + 0.4;
          hurt(e, (25 + 2 * G.level) * (p.giant > 0 ? 1.5 : 1), p);
          push(e, p.x, p.y, 40);
        }
      } else damagePlayer(p, e.dmg, e);
    }
  }
  for (const p of players) if (!p.down) fireWeapons(p, dt);
  updNpcs(dt);
  updAllies(dt);
  for (const q2 of proj) {
    if (q2.k === 'boomer') {
      const sp = Math.hypot(q2.vx, q2.vy);
      q2.trav += sp * dt;
      if (!q2.ret && q2.trav >= q2.range) {
        q2.ret = true;
        q2.hit.clear();
      }
      if (q2.ret) {
        const dx = q2.o.x - q2.x,
          dy = q2.o.y - q2.y,
          d = Math.hypot(dx, dy) || 1;
        q2.vx = (dx / d) * sp * 1.1;
        q2.vy = (dy / d) * sp * 1.1;
        q2.z += (q2.o.z + 22 - q2.z) * 0.1;
        if (d < 18) q2.t = 0;
      }
    }
    if (q2.k === 'sword') {
      if (!q2.ret) {
        if (q2.tg && !q2.tg.dead) {
          q2.tx = q2.tg.x;
          q2.ty = q2.tg.y;
        }
        const dx = q2.tx - q2.x,
          dy = q2.ty - q2.y,
          d = Math.hypot(dx, dy) || 1,
          sp = Math.hypot(q2.vx, q2.vy);
        q2.vx = (dx / d) * sp;
        q2.vy = (dy / d) * sp;
        q2.z += (((q2.tg && q2.tg.z) || groundAt(q2.x, q2.y)) + 16 - q2.z) * 0.15;
        if (d < 22) {
          q2.ret = true;
          swordSlash(q2);
          q2.vx *= -0.2;
          q2.vy *= -0.2;
          q2.hold = 0.12;
        }
      } else {
        q2.hold -= dt;
        if (q2.hold <= 0) {
          const dx = q2.o.x - q2.x,
            dy = q2.o.y - q2.y,
            d = Math.hypot(dx, dy) || 1;
          q2.vx = (dx / d) * 900;
          q2.vy = (dy / d) * 900;
          q2.z += (q2.o.z + 28 - q2.z) * 0.15;
          if (d < 24) q2.t = 0;
        } else {
          q2.vx = 0;
          q2.vy = 0;
        }
      }
      if (Math.random() < 0.6)
        fx.push({
          k: 'p',
          x: q2.x,
          y: q2.y,
          z: q2.z,
          vx: rand(-40, 40),
          vy: rand(-40, 40),
          vz: rand(10, 70),
          t: rand(0.2, 0.4),
          c: Math.random() < 0.5 ? '#ffb347' : '#fff0a0',
        });
    }
    if (q2.k === 'homing') {
      q2.rt -= dt;
      if (q2.rt <= 0 || !q2.tg || q2.tg.dead) {
        q2.rt = 0.25;
        q2.tg = nearestE(q2.x, q2.y, 400 * ((q2.o && q2.o.range) || 1));
      }
      if (q2.tg) {
        const want = Math.atan2(q2.tg.y - q2.y, q2.tg.x - q2.x),
          cur = Math.atan2(q2.vy, q2.vx);
        const da = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
        const na = cur + clamp(da, -7 * dt, 7 * dt);
        q2.vx = Math.cos(na) * q2.sp;
        q2.vy = Math.sin(na) * q2.sp;
        q2.z += (q2.tg.z + 14 - q2.z) * 0.08;
      }
    }
    q2.x += q2.vx * dt;
    q2.y += q2.vy * dt;
    q2.t -= dt;
    q2.rot += dt * 14;
    if (q2.k !== 'homing' && q2.k !== 'boomer' && q2.k !== 'sword') {
      const g = groundAt(q2.x, q2.y) + 8;
      if (q2.z < g) q2.z += (g - q2.z) * 0.5;
    }
    near(q2.x, q2.y, q2.r + 40, (e) => {
      if (q2.pierce <= 0) return;
      const key = e.proxy || e;
      if (q2.hit.has(key)) return;
      if ((e.x - q2.x) ** 2 + (e.y - q2.y) ** 2 < (e.r + q2.r) ** 2) {
        q2.hit.add(key);
        hurt(e, q2.dmg, q2.o);
        q2.pierce--;
        if (q2.slow) key.slow = 1.5;
        if (q2.k === 'shot' && q2.st !== 'arrow' && !key.boss) push(key, q2.x - q2.vx, q2.y - q2.vy, 6);
        if (q2.k === 'bounce' && q2.bn > 0) {
          q2.bn--;
          const n2 = nearestE(q2.x, q2.y, 240, q2.hit);
          if (n2) {
            const a = Math.atan2(n2.y - q2.y, n2.x - q2.x),
              s = Math.hypot(q2.vx, q2.vy);
            q2.vx = Math.cos(a) * s;
            q2.vy = Math.sin(a) * s;
            q2.pierce = 1;
            q2.t = Math.max(q2.t, 1);
          }
        }
      }
    });
    if (q2.pierce <= 0) q2.t = 0;
  }
  proj = proj.filter((q2) => q2.t > 0);
  for (const pa of patches) {
    pa.t -= dt;
    pa.tick -= dt;
    if (pa.tick <= 0) {
      pa.tick = 0.3;
      near(pa.x, pa.y, pa.r + 40, (e) => {
        if ((e.x - pa.x) ** 2 + (e.y - pa.y) ** 2 < (pa.r + e.r) ** 2) hurt(e, pa.dmg, pa.o);
      });
    }
  }
  patches = patches.filter((pa) => pa.t > 0);
  for (const bl of bullets) {
    bl.x += bl.vx * dt;
    bl.y += bl.vy * dt;
    bl.t -= dt;
    if (groundAt(bl.x, bl.y) > bl.z + 10) bl.t = 0;
    for (const p of players) {
      if (p.down || p.hidden > 0) continue;
      if (Math.abs(p.z + 18 - bl.z) > 22) continue;
      if ((p.x - bl.x) ** 2 + (p.y - bl.y) ** 2 < (p.r + bl.r) ** 2) {
        if (p.shield > 0 || p.giant > 0) {
          bl.t = 0;
        } else if (p.inv <= 0) {
          damagePlayer(p, bl.dmg);
          bl.t = 0;
        }
      }
    }
  }
  bullets = bullets.filter((bl) => bl.t > 0);
  for (const f of fx) {
    if (f.k === 'wave') {
      f.r += 380 * dt;
      near(f.x, f.y, f.r + 40, (e) => {
        const key = e.proxy || e;
        if (f.hit.has(key)) return;
        if (Math.hypot(e.x - f.x, e.y - f.y) < f.r + e.r) {
          f.hit.add(key);
          hurt(e, f.dmg, f.o);
          push(key, f.x, f.y, 70);
        }
      });
      for (const bl of bullets) if (Math.abs(Math.hypot(bl.x - f.x, bl.y - f.y) - f.r) < 20) bl.t = 0;
      if (f.r > f.max) f.t = 0;
      continue;
    }
    f.t -= dt;
    if (f.k === 'p') {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx *= 0.92;
      f.vy *= 0.92;
      f.vz = (f.vz || 0) - 500 * dt;
      f.z = (f.z || 0) + f.vz * dt;
      const g = groundAt(f.x, f.y);
      if (f.z < g) {
        f.z = g;
        f.vz *= -0.3;
      }
    }
    if (f.k === 'tele' && f.t <= 0 && f.dmg) {
      for (const p of players) {
        if (p.down) continue;
        if (p.z - groundAt(p.x, p.y) > 26) continue;
        let hit = false;
        if (f.shape === 'circle') hit = Math.hypot(p.x - f.x, p.y - f.y) < f.r + p.r;
        else {
          const vx = f.x2 - f.x,
            vy = f.y2 - f.y,
            L2 = vx * vx + vy * vy,
            tt = clamp(((p.x - f.x) * vx + (p.y - f.y) * vy) / L2, 0, 1);
          hit = Math.hypot(p.x - (f.x + vx * tt), p.y - (f.y + vy * tt)) < f.w / 2 + p.r;
        }
        if (hit && f.snow && inShelter(p)) hit = false;
        if (hit) {
          p.inv = 0;
          damagePlayer(p, f.dmg);
        }
      }
      if (f.qslam) questSlam(f);
      fx.push(
        f.shape === 'circle'
          ? { k: 'ring', x: f.x, y: f.y, r: f.r, t: 0.3, max: 0.3, col: f.col || C.blood }
          : { k: 'beam', x: f.x, y: f.y, x2: f.x2, y2: f.y2, w: f.w, t: 0.3, max: 0.3, col: f.col || C.blood }
      );
    }
  }
  fx = fx.filter((f) => f.t > 0);
  enemies = enemies.filter((e) => !e.dead);
  for (const gm of gems) {
    let best = null,
      bd = 1e12;
    for (const p of players) {
      if (p.down) continue;
      const d = (p.x - gm.x) ** 2 + (p.y - gm.y) ** 2;
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    if (!best) continue;
    const d = Math.sqrt(bd) || 1;
    if (gm.pull || d < best.magnet) {
      gm.pull = true;
      const s = Math.max(260, 620 - d);
      gm.x += ((best.x - gm.x) / d) * s * dt;
      gm.y += ((best.y - gm.y) / d) * s * dt;
    }
    if (d < best.r + 8) {
      gm.done = true;
      G.xp += gm.v * best.xpMul;
    }
  }
  gems = gems.filter((gm) => !gm.done);
  for (const h of heals)
    for (const p of players) {
      if (p.down || h.done) continue;
      if (Math.hypot(p.x - h.x, p.y - h.y) < p.r + 14) {
        h.done = true;
        heal(p, 30 * p.healMul);
      }
    }
  heals = heals.filter((h) => !h.done);
  updDrops(dt);
  for (const p of players) {
    if (p.nectarCd > 0) p.nectarCd -= dt;
    if (p.healGlow > 0) p.healGlow -= dt;
  }
  for (const c of coins) {
    c.t += dt;
    c.vz -= 900 * dt;
    c.z += c.vz * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.vx *= 0.96;
    c.vy *= 0.96;
    const g = surfaceAt(c.x, c.y);
    if (c.z < g) {
      c.z = g;
      c.vz = c.vz < -60 ? -c.vz * 0.35 : 0;
      c.vx *= 0.6;
      c.vy *= 0.6;
    }
    if (c.t < 0.35) continue;
    let best = null,
      bd = 1e12;
    for (const p of players) {
      if (p.down) continue;
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    if (!best) continue;
    const d = Math.sqrt(bd) || 1;
    if (c.pull || d < best.magnet * 1.1) {
      c.pull = true;
      const sp = Math.max(320, 700 - d);
      c.x += ((best.x - c.x) / d) * sp * dt;
      c.y += ((best.y - c.y) / d) * sp * dt;
      c.z += (best.z + 10 - c.z) * Math.min(1, dt * 8);
    }
    if (d < best.r + 10) {
      c.done = true;
      addGold(c.v, best);
    }
  }
  coins = coins.filter((c) => !c.done);
  // rayos en cola (tormentas escalonadas)
  if (G.boltQ.length) {
    for (const b of G.boltQ) {
      b.t -= dt;
      if (b.t <= 0) strike(b.x, b.y, b.dmg, b.p, b.col, b.tgt);
    }
    G.boltQ = G.boltQ.filter((b) => b.t > 0);
  }
  G.shake = Math.max(0, G.shake - dt * 2.2);
  G.flashT = Math.max(0, G.flashT - dt);
  G.stormT = Math.max(0, G.stormT - dt);
  // altares y cofres (E para interactuar)
  G.prompt = null;
  for (const al of WORLD.altars) {
    if (al.used) continue;
    let any = null;
    for (const p of players) {
      if (p.down || p.ctrl === 'ai') continue;
      if (Math.hypot(p.x - al.x, p.y - al.y) < 44) {
        any = p;
        break;
      }
    }
    if (any) {
      if (any.wantE || isTouch) {
        al.active = true;
        any.eUsed = true;
      }
      if (al.active) {
        al.charge += dt;
        if (al.charge >= 2.5) {
          al.used = true;
          G.queue.push(any);
          missionAdd('altars', 1);
          bigBanner('ALTAR ACTIVADO', 'Un don extra de los dioses');
        }
      } else G.prompt = { x: al.x, y: al.y, t: 'E · Activar altar' };
    } else {
      al.charge = Math.max(0, al.charge - dt);
      al.active = false;
    }
  }
  for (const ch of WORLD.chests) {
    if (ch.opened) continue;
    for (const p of players) {
      if (p.down || p.ctrl === 'ai') continue;
      if (Math.hypot(p.x - ch.x, p.y - ch.y) < 34) {
        const pr = ch.free ? 0 : chestPrice();
        if (p.wantE || (isTouch && (ch.free || G.gold >= pr))) {
          p.eUsed = true;
          if (G.gold < pr) {
            noGold(ch.x, ch.y, pr - G.gold);
          } else {
            G.gold -= pr;
            if (!ch.free) G.chestsBought++;
            ch.opened = true;
            G.chestsOpened++;
            addScore(200);
            missionAdd('chests', 1);
            G.itemQueue.push({ p, rich: !!ch.rich || Math.random() < (p.luck || 0) * 0.3 });
            if (!ch.rich && (p.luck || 0) > 0 && Math.random() < p.luck * 0.5)
              drops.push({ k: Math.random() < 0.5 ? 'nectar' : 'bolsa', x: ch.x + rand(-20, 20), y: ch.y + 30, t: 0 });
            heal(p, 15);
            dropCoins(ch.x, ch.y, surfaceAt(ch.x, ch.y) + 20, ch.rich ? 10 : 3, 1);
          }
        } else
          G.prompt = {
            x: ch.x,
            y: ch.y,
            t: ch.rich ? 'E · Abrir cofre del jefe' : pr ? `E · Abrir cofre · ${pr} de oro` : 'E · Abrir cofre',
            bad: G.gold < pr,
          };
        break;
      }
    }
  }
  for (const sh of WORLD.shrines || []) {
    if (sh.used) continue;
    for (const p of players) {
      if (p.down || p.ctrl === 'ai') continue;
      if (Math.hypot(p.x - sh.x, p.y - sh.y) < 46) {
        if (p.wantE) {
          p.eUsed = true;
          useShrine(sh, p);
        } else {
          const nm = {
            fortuna: `E · Altar de la Fortuna · ${shrinePrice(sh)} de oro`,
            desafio: 'E · Estatua del Desafío (élites → cofre)',
            fuente: 'E · Fuente Sagrada (curar)',
            maldito: 'E · Altar Maldito (+daño, enemigos más duros)',
          }[sh.type];
          G.prompt = { x: sh.x, y: sh.y, t: nm, bad: sh.type === 'fortuna' && G.gold < shrinePrice(sh) };
        }
        break;
      }
    }
  }
  for (const m of WORLD.merchants || []) {
    for (const p of players) {
      if (p.down || p.ctrl === 'ai' || p.ctrl === 'net') continue;
      if (Math.hypot(p.x - m.x, p.y - m.y) < 60) {
        if (p.wantE && state === 'play') {
          p.wantE = false;
          p.eUsed = true;
          openShop(m, p);
        } else G.prompt = { x: m.x, y: m.y, t: 'E · Comerciar con el mercader' };
        break;
      }
    }
  }
  questsUpdate(dt);
  for (const p of players) {
    p.wantE = false;
    p.eUsed = false;
  }
  for (const t of texts) {
    t.t -= dt;
    t.z += 40 * dt;
  }
  texts = texts.filter((t) => t.t > 0);
  if (bannerT > 0) {
    bannerT -= dt;
    if (bannerT <= 0) $('banner').classList.remove('on');
  }
  if (G.waveT > 0) {
    G.waveT -= dt;
    if (G.waveT <= 0) {
      nextWave();
      return;
    }
  }
  if (G.portals) {
    for (const pt of G.portals) {
      pt.t += dt;
      for (const p of players) {
        if (p.ctrl === 'ai' || p.down) continue;
        if (Math.hypot(p.x - pt.x, p.y - pt.y) < 30) {
          G.ridx++;
          startRealm(pt.key);
          return;
        }
      }
    }
  }
  while (G.xp >= G.need) {
    G.xp -= G.need;
    G.level++;
    addScore(G.level * 50);
    if (G.level === POW_LV) {
      const p0 = players[0];
      bigBanner('¡PODER DIVINO DESPERTADO!', `${p0.g.pn} · pulsa R`);
    }
    G.need = needFor(G.level);
    G.pending++;
    for (const p of players) {
      if (p.thirdEye && !p.down) skybolts(p, 6, 60 + G.level * 4);
      if (p.levelHeal) heal(p, p.maxHp);
    }
  }
  if (players.every((p) => p.down) && !remotesHere().some((r) => !r.dn)) {
    endGame(false);
    return;
  }
  if ((G.pending > 0 || G.queue.length || G.itemQueue.length) && state === 'play') openLevelUp();
}
function aiMove(p, dt) {
  const h = players.find((q2) => q2 !== p);
  let tx = p.x,
    ty = p.y;
  if (h) {
    if (h.down) {
      tx = h.x;
      ty = h.y;
    } else {
      p.aiT -= dt;
      if (p.aiT <= 0) {
        p.aiT = 1.2;
        const a = rand(0, 6.28),
          rr = rand(60, 110);
        p.aiTx = Math.cos(a) * rr;
        p.aiTy = Math.sin(a) * rr;
      }
      tx = h.x + p.aiTx;
      ty = h.y + p.aiTy;
    }
  }
  let mx = tx - p.x,
    my = ty - p.y;
  const d = Math.hypot(mx, my);
  if (d < 10) {
    mx = 0;
    my = 0;
  } else {
    mx /= d;
    my /= d;
  }
  if (!(h && h.down)) {
    const e = nearestE(p.x, p.y, 70);
    if (e) {
      const ax = p.x - e.x,
        ay = p.y - e.y,
        ad = Math.hypot(ax, ay) || 1;
      mx += (ax / ad) * 1.4;
      my += (ay / ad) * 1.4;
    }
  }
  if (h && h.z - p.z > 20 && d < 120) jump(p);
  for (const bl of bullets) {
    if ((bl.x - p.x) ** 2 + (bl.y - p.y) ** 2 < 45 * 45) {
      jump(p);
      break;
    }
  }
  if (p.pow <= 0) {
    let n = 0;
    for (const e of enemies) {
      if (!e.dead && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 160 * 160) n++;
    }
    if (n >= 7 || (G.bosses.length && Math.random() < 0.01) || (h && h.down && p.g.pw === 'revive')) usePower(p);
  }
  return [clamp(mx, -1, 1), clamp(my, -1, 1)];
}
