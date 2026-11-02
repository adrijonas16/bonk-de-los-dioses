/* ---------- render del juego ---------- */
function renderGame(dt) {
  FRAME++;
  const night = LOOK3D[G.realm].night;
  let ns = 0;
  const shadow = (x, y, r, airK) => {
    if (ns < 800) {
      instSet(SHADOWS, ns++, x, groundAt(x, y) + 0.6, y, r * (airK || 1));
    }
  };
  // jugadores y ayudantes
  const all = [...players, ...npcs, ...remotesHere()];
  all.forEach((p, i) => {
    const k = p.giant > 0 ? 2 : 1;
    const mkG = () => (AS.ready ? (AS.g.u_man ? buildGodH(p.god) : buildGodKK(p.god)) : buildGod(p.god));
    let mdl = objFor(p, '_m', mkG);
    if (mdl.userData.god !== p.god || (AS.ready && !mdl.userData.kk)) {
      scene.remove(mdl);
      OBJS.delete(mdl);
      mdl.userData.disp();
      p._m = null;
      mdl = objFor(p, '_m', mkG);
    }
    mdl.position.set(p.x, p.z, p.y);
    {
      const u = mdl.userData;
      if (!u.hmats) {
        u.hmats = [];
        mdl.traverse((o) => {
          if (o.isMesh)
            for (const m of Array.isArray(o.material) ? o.material : [o.material])
              if (m.emissive && !u.hmats.includes(m)) {
                if (!m.userData.em0) m.userData.em0 = m.emissive.clone();
                u.hmats.push(m);
              }
        });
      }
      const on = (p.hurtT || 0) > 0;
      if (on !== u.hon) {
        u.hon = on;
        for (const m of u.hmats) {
          if (on) m.emissive.setRGB(0.9, 0.05, 0.05);
          else m.emissive.copy(m.userData.em0);
        }
      }
    }
    if (mdl.userData.kk) {
      mdl.scale.setScalar(0.92 * k);
      animGodKK(mdl, p, dt);
    } else {
      mdl.scale.setScalar(GOD_SCALE * k);
      animGod(mdl, p, dt);
    }
    shadow(p.x, p.y, p.r * 1.2, clamp(1 - (p.z - groundAt(p.x, p.y)) / 200, 0.4, 1));
    if (p.god === 'dios' || p.ctrl === 'npc') {
      const gl = objFor(p, '_gl', () => glowSprite('#fff2c0', 120));
      gl.position.set(p.x, p.z + 40, p.y);
      gl.material.opacity = 0.6 + 0.2 * Math.sin(T * 3);
    }
    const L = p.ctrl === 'net' ? null : PLIGHTS[i];
    if (L) {
      L.intensity = night ? 1.25 : 0;
      L.position.set(p.x, p.z + 60, p.y);
      L.color.set(p.god === 'dios' ? '#fff6e0' : '#ffd8a0');
    }
    // aura
    const auraK = p.weapons.sol ? 'sol' : p.weapons.creacion ? 'creacion' : null;
    if ((auraK || p.radiant > 0) && !p.down) {
      const Rr = auraK
        ? kst(WEAPONS[auraK], p.weapons[auraK].lvl, p).radius * p.area * (p.radiant > 0 ? 1.8 : 1)
        : 140 * p.area;
      const col = auraK ? WEAPONS[auraK].col : C.gold;
      const d = objFor(p, '_ad', () => flatMesh(DISC, col, 0.14));
      d.scale.set(Rr, Rr, 1);
      d.position.set(p.x, groundAt(p.x, p.y) + 2, p.y);
      const r = objFor(p, '_ar', () => flatMesh(RINGG, col, 0.7));
      r.scale.set(Rr, Rr, 1);
      r.position.set(p.x, groundAt(p.x, p.y) + 2.5, p.y);
      r.rotation.z = T;
    }
    if ((p.ctrl === 'p1' || p.ctrl === 'p2') && !p.down) {
      const Wd = WEAPONS[p.g.w],
        w = p.weapons[p.g.w];
      if (w && Wd.k !== 'aura' && Wd.k !== 'trail') {
        const R = Math.min(650, weaponReach(Wd, kst(Wd, w.lvl, p), p));
        if (R > 20) {
          const rr = objFor(p, '_rng', () => flatMesh(RINGG, Wd.col, 0.16));
          if (rr.userData.R && R > rr.userData.R + 1) rr.userData.pulse = 1;
          rr.userData.R = R;
          rr.userData.pulse = Math.max(0, (rr.userData.pulse || 0) - dt * 1.5);
          const k = R * (1 + (rr.userData.pulse || 0) * 0.15);
          rr.scale.set(k, k, 1);
          rr.position.set(p.x, groundAt(p.x, p.y) + 1.8, p.y);
          rr.material.opacity = 0.32 + 0.5 * (rr.userData.pulse || 0);
        }
      }
    }
    if (p.shield > 0) {
      const r = objFor(p, '_sh', () => flatMesh(RINGW, C.gold, 0.8));
      r.scale.set(34, 34, 1);
      r.position.set(p.x, p.z + 20, p.y);
      r.rotation.z = T * 2;
    }
    if (p.crown > 0) {
      const cr = objFor(p, '_cr', () => {
        const m = new THREE.Mesh(GEO.cyl(9, 8, 6, 8, 1), MB(C.gold));
        return m;
      });
      cr.position.set(p.x, p.z + 80 * k, p.y);
      cr.rotation.y = T * 2;
    }
    if (p.rage > 0) {
      const r = objFor(p, '_rg', () => glowSprite(C.blood, 90));
      r.position.set(p.x, p.z + 30, p.y);
    }
    if (p.down) {
      const r = objFor(p, '_rv', () => flatMesh(RINGG, C.gold, 0.8));
      r.scale.set(30, 30, 1);
      r.position.set(p.x, groundAt(p.x, p.y) + 3, p.y);
    }
    // orbitales
    for (const key in p.weapons) {
      const w = p.weapons[key];
      if (!w.pos || p.down) continue;
      const Wd = WEAPONS[key];
      w._o = w._o || [];
      w.pos.forEach((ps, j) => {
        const holder = (w._o[j] = w._o[j] || {});
        if (Wd.st === 'dove') {
          const d = objFor(holder, '_d', doveMesh);
          d.position.set(ps[0], p.z + 30 + Math.sin(T * 5 + j) * 4, ps[1]);
          d.rotation.y = -(ps[2] + Math.PI / 2);
          const f = Math.sin(T * 20 + j * 1.7);
          d.userData.wl.rotation.x = -0.25 - f * 0.95;
          d.userData.wr.rotation.x = 0.25 + f * 0.95;
          const gl = objFor(holder, '_g', () => glowSprite('#fff6c8', 14));
          gl.position.copy(d.position);
          return;
        }
        const s2 = objFor(holder, '_s', () => {
          const sp = mkSprite(orbV(Wd.st, Wd.col));
          sp.center.set(0.5, 0.5);
          return sp;
        });
        s2.position.set(ps[0], p.z + 26 + Math.sin(T * 4 + j) * 3, ps[1]);
        const gl = objFor(holder, '_g', () => glowSprite(Wd.col, 26));
        gl.position.copy(s2.position);
      });
    }
    if (p.sunPos) {
      const holder = (p._sun = p._sun || {});
      const s2 = objFor(holder, '_s', () => {
        const sp = mkSprite(orbV('sun', C.gold));
        sp.center.set(0.5, 0.5);
        return sp;
      });
      s2.position.set(p.sunPos[0], p.z + 30, p.sunPos[1]);
      const gl = objFor(holder, '_g', () => glowSprite(C.gold, 40));
      gl.position.copy(s2.position);
    }
  });
  for (let i = all.length; i < PLIGHTS.length; i++) PLIGHTS[i].intensity = 0;
  if (players.length > 1 && players[0].bond) {
    const a = players[0],
      b = players[1];
    const rb = objFor(G, '_bond', () => {
      const m = new THREE.Mesh(quadGeo(), addMat(C.gold, 0.35));
      m.userData.disp = () => {
        m.geometry.dispose();
        m.material.dispose();
      };
      return m;
    });
    setQuad(rb.geometry, a.x, a.y, b.x, b.y, 4, a.z + 20, b.z + 20);
  }
  // enemigos
  eniBegin();
  eni2Begin();
  for (const e of enemies) {
    if (e.boss) {
      const s = objFor(e, '_m', () => buildBossKK(e) || buildBoss(e));
      if (s.userData.kkBoss) {
        animBossKK(s, e, dt);
        updBossClip(s);
      } else animBoss(s, e, dt);
      shadow(e.x, e.y, e.r * 1.3);
      if (e.segs)
        e.segs.forEach((sg, i) => {
          const ss = objFor(sg, '_m', () => segMesh(e));
          const k = sg.r * 1.5;
          ss.scale.set(k, k * 0.8, k);
          const nx = e.segs[i - 1] || e;
          ss.rotation.y = Math.atan2(nx.x - sg.x, nx.y - sg.y);
          ss.position.set(sg.x, groundAt(sg.x, sg.y) + k * 0.4 + Math.sin(T * 6 + i * 0.8) * 2, sg.y);
          ss.material.emissive.set(e.flash > 0 ? '#ffffff' : '#000000');
          shadow(sg.x, sg.y, sg.r);
        });
      continue;
    }
    if (!eni2Draw(e, dt)) eniDraw(e, dt);
    if (e.elite) {
      const r = objFor(e, '_el', () => flatMesh(RINGW, C.gold, 0.85));
      r.scale.set(e.r * 1.6, e.r * 1.6, 1);
      r.position.set(e.x, groundAt(e.x, e.y) + 2, e.y);
      r.rotation.z = T * 3;
      const cr = objFor(e, '_ec', () => glowSprite(C.gold, 40));
      cr.position.set(e.x, e.z + e.r * 2.3 + 6, e.y);
    }
    shadow(e.x, e.y, e.r);
  }
  eniEnd();
  eni2End();
  // aliados
  const ms = miscSprites();
  for (const a of allies) {
    let v = null,
      sc = 1;
    switch (a.type) {
      case 'einherjar':
        v = enemySprites('draugr')[Math.floor(T * 4) % 2];
        break;
      case 'leon':
        v = ms.lion[Math.floor(T * 6) % 2];
        break;
      case 'dog':
        v = ms.dog[Math.floor(T * 6) % 2];
        break;
      case 'shade':
        v = enemySprites('sincorazon')[Math.floor(T * 4) % 2];
        break;
      case 'clone':
        v = godSprites(a.o.god)[0];
        break;
    }
    if (a.type === 'tornado') {
      const t = objFor(a, '_s', () => {
        const g = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const m = new THREE.Mesh(
            GEO.tor(6 + i * 4, 1.5),
            new THREE.MeshBasicMaterial({ color: '#d8e8f0', transparent: true, opacity: 0.6 })
          );
          m.rotation.x = Math.PI / 2;
          m.position.y = i * 12;
          g.add(m);
        }
        return g;
      });
      t.position.set(a.x, groundAt(a.x, a.y), a.y);
      t.rotation.y = T * 8;
      continue;
    }
    const s = objFor(a, '_s', () => mkSprite(v));
    const flip = a.fx !== undefined ? a.fx * Math.cos(G.yaw) - (a.fy || 0) * Math.sin(G.yaw) < 0 : false;
    setSprite(s, v, flip, false, sc);
    if (a.type === 'clone') s.material = ghostMat(v);
    s.position.set(a.x, groundAt(a.x, a.y), a.y);
    shadow(a.x, a.y, a.r);
  }
  // curaciones
  for (const d of drops) {
    const s = objFor(d, '_s', () => dropSprite(d.k));
    const bob = Math.sin(T * 3 + d.x) * 3;
    s.position.set(d.x, groundAt(d.x, d.y) + 14 + bob, d.y);
    if (d.t > 34) s.visible = Math.sin(T * 20) > 0;
    const gl = objFor(d, '_g', () =>
      glowSprite(d.k === 'nectar' ? '#7de0ff' : d.k === 'iman' ? '#ff6a6a' : '#ffd34d', 20)
    );
    gl.position.copy(s.position);
    shadow(d.x, d.y, 7);
  }
  for (const h of heals) {
    const s = objFor(h, '_s', () => mkSprite(ms.pom));
    s.position.set(h.x, groundAt(h.x, h.y) + 4 + Math.sin(T * 3) * 2, h.y);
    const hg = objFor(h, '_g', () => glowSprite('#ff5a5a', 18));
    hg.position.copy(s.position);
    shadow(h.x, h.y, 6);
  }
  // proyectiles
  for (const q2 of proj) {
    const o = objFor(q2, '_o', () => projObj(q2));
    o.position.set(q2.x, q2.z, q2.y);
    o.rotation.y = -Math.atan2(q2.vy, q2.vx);
    if (o.userData.spin) {
      o.userData.spin.rotation.z = q2.rot;
      if (q2.st === 'hammer' || q2.st === 'axe' || q2.st === 'staff') {
        o.userData.spin.rotation.z = 0;
        o.rotation.y = q2.rot;
      }
    }
    if (q2.st === 'holysword') {
      const sw = o.userData.sword;
      if (q2.ret && q2.hold <= 0) {
        o.rotation.y = q2.rot * 1.6;
      } else if (q2.ret) {
        sw.rotation.z = -0.9;
      } else {
        sw.rotation.z = Math.sin(T * 30) * 0.08;
      }
    }
    if (q2.st === 'serpent')
      o.children.forEach((m) => {
        if (m.userData.i !== undefined) m.position.z = Math.sin(T * 10 + m.userData.i * 0.8) * 6;
      });
  }
  for (const pa of patches) {
    const m = objFor(pa, '_o', () => flatMesh(DISC, pa.col, 0.5));
    const k = pa.r * (0.6 + (0.4 * pa.t) / pa.life);
    m.scale.set(k, k, 1);
    m.position.set(pa.x, groundAt(pa.x, pa.y) + 1.5, pa.y);
    m.material.opacity = 0.25 + 0.25 * Math.sin(T * 10 + pa.x);
  }
  // efectos
  let ng = 0;
  FLASHL.intensity = Math.max(0, FLASHL.intensity - dt * 8);
  for (const f of fx) {
    switch (f.k) {
      case 'ring': {
        const m = objFor(f, '_o', () => flatMesh(RINGW, f.col, 0.9));
        const k = 1 - f.t / f.max,
          rr = f.r * (0.3 + 0.7 * k);
        m.scale.set(rr, rr, 1);
        m.position.set(f.x, groundAt(f.x, f.y) + 4, f.y);
        m.material.opacity = 0.9 * (1 - k);
        break;
      }
      case 'wave': {
        const m = objFor(f, '_o', () => flatMesh(RINGW, f.col, 0.85));
        m.scale.set(f.r, f.r, 1);
        m.position.set(f.x, groundAt(f.x, f.y) + 6, f.y);
        const m2 = objFor(f, '_o2', () => flatMesh(RINGG, '#ffffff', 0.6));
        m2.scale.set(f.r * 0.97, f.r * 0.97, 1);
        m2.position.copy(m.position);
        break;
      }
      case 'bolt': {
        const pts = [];
        for (let i = 0; i < f.pts.length - 1; i++) {
          const [ax, ay, az] = f.pts[i],
            [bx, by, bz] = f.pts[i + 1];
          for (let s2 = 0; s2 < 4; s2++) {
            const t = s2 / 4,
              j = s2 ? rand(-7, 7) : 0;
            pts.push([ax + (bx - ax) * t + j, az + (bz - az) * t + rand(-4, 4), ay + (by - ay) * t + j]);
          }
        }
        const L2 = f.pts[f.pts.length - 1];
        pts.push([L2[0], L2[2], L2[1]]);
        const m = objFor(f, '_o', () => {
          const mm = new THREE.Mesh(ribbon(pts.length), addMat(f.st === 'smoke' ? '#8a7ab0' : f.col, 1));
          mm.userData.disp = () => {
            mm.geometry.dispose();
            mm.material.dispose();
          };
          return mm;
        });
        if (m.geometry.attributes.position.count === pts.length * 2) setRibbon(m.geometry, pts, 0, 3, 0);
        const m2 = objFor(f, '_o2', () => {
          const mm = new THREE.Mesh(ribbon(pts.length), addMat('#ffffff', 1));
          mm.userData.disp = () => {
            mm.geometry.dispose();
            mm.material.dispose();
          };
          return mm;
        });
        if (m2.geometry.attributes.position.count === pts.length * 2) setRibbon(m2.geometry, pts, 0, 1, 0);
        for (const p of f.pts) {
          if (ng < 400) {
            instSet(GLOWS, ng++, p[0], p[2] + 4, p[1], 40);
          }
        }
        FLASHL.color.set(f.col);
        FLASHL.intensity = 1.4;
        FLASHL.position.set(L2[0], L2[2] + 30, L2[1]);
        break;
      }
      case 'sky': {
        const g0 = groundAt(f.x, f.y);
        if (!f.main || FRAME % 3 === 0) {
          f.main = boltPath(f.x + rand(-30, 30), g0 + 640, f.y + rand(-30, 30), f.x, g0, f.y, 22, 30);
          f.br = [0, 1, 2].map(() => {
            const s0 = f.main[4 + Math.floor(Math.random() * 12)],
              a = rand(0, 6.28),
              L = rand(60, 150);
            return boltPath(
              s0[0],
              s0[1],
              s0[2],
              s0[0] + Math.cos(a) * L,
              s0[1] - rand(70, 170),
              s0[2] + Math.sin(a) * L,
              8,
              16
            );
          });
        }
        const k = clamp(f.t / (f.t0 || 0.45), 0, 1),
          rx = Math.cos(G.yaw),
          rz = -Math.sin(G.yaw);
        const fl = Math.floor(T * 30) % 2 ? 1 : 0.7;
        const m = objFor(f, '_o', () => ribMesh(23, f.col, 0.55));
        setRibbon(m.geometry, f.main, rx * 16, 0, rz * 16);
        m.material.opacity = 0.5 * k * fl;
        const m2 = objFor(f, '_o2', () => ribMesh(23, '#ffffff', 1));
        setRibbon(m2.geometry, f.main, rx * 3.5, 0, rz * 3.5);
        m2.material.opacity = Math.min(1, k * 1.6);
        f.br.forEach((b, bi) => {
          const mb = objFor(f, '_b' + bi, () => ribMesh(9, f.col, 0.9));
          setRibbon(mb.geometry, b, rx * 2.5, 0, rz * 2.5);
          mb.material.opacity = 0.9 * k * fl;
        });
        const m3 = objFor(f, '_r', () => flatMesh(RINGW, f.col, 0.9));
        const kk = 1 - k;
        m3.scale.set(20 + kk * 90, 20 + kk * 90, 1);
        m3.position.set(f.x, g0 + 3, f.y);
        m3.material.opacity = 0.9 * k;
        if (ng < 396) {
          instSet(GLOWS, ng++, f.x, g0 + 18, f.y, 230 * k + 40);
          instSet(GLOWS, ng++, f.main[8][0], f.main[8][1], f.main[8][2], 120 * k);
          instSet(GLOWS, ng++, f.main[16][0], f.main[16][1], f.main[16][2], 90 * k);
        }
        FLASHL.color.set(f.col);
        FLASHL.intensity = Math.max(FLASHL.intensity, 3 * k);
        FLASHL.distance = 900;
        FLASHL.position.set(f.x, g0 + 90, f.y);
        break;
      }
      case 'scorch': {
        const m = objFor(f, '_o', () => {
          const mm = new THREE.Mesh(DISC, SCORCHM.clone());
          mm.rotation.x = -Math.PI / 2;
          mm.rotation.z = rand(0, 6.28);
          mm.userData.disp = () => mm.material.dispose();
          return mm;
        });
        m.scale.set(f.r, f.r * rand(0.98, 1.02), 1);
        m.position.set(f.x, groundAt(f.x, f.y) + 0.8, f.y);
        m.material.opacity = 0.6 * Math.min(1, f.t / 1.2);
        const e2 = objFor(f, '_e', () => flatMesh(DISC, '#ff8a3a', 0.5));
        e2.scale.set(f.r * 0.5, f.r * 0.5, 1);
        e2.position.set(f.x, groundAt(f.x, f.y) + 1.2, f.y);
        e2.material.opacity = 0.5 * Math.max(0, (f.t - 2) / 1);
        break;
      }
      case 'slash': {
        const m = objFor(f, '_o', () => {
          const mm = new THREE.Mesh(
            new THREE.RingGeometry(f.r * 0.55, f.r, 14, 1, -(f.a + f.arc / 2), f.arc),
            addMat(f.col, 0.85)
          );
          mm.rotation.x = -Math.PI / 2;
          mm.renderOrder = 5;
          mm.userData.disp = () => {
            mm.geometry.dispose();
            mm.material.dispose();
          };
          return mm;
        });
        m.position.set(f.x, (f.z || 0) + 18, f.y);
        m.material.opacity = f.t / 0.16;
        break;
      }
      case 'tele': {
        if (f.shape === 'circle') {
          const m = objFor(f, '_o', () => flatMesh(DISC, C.blood, 0.3));
          m.scale.set(f.r, f.r, 1);
          m.position.set(f.x, groundAt(f.x, f.y) + 3, f.y);
          m.material.opacity = 0.2 + 0.25 * (Math.floor(T * 12) % 2);
          const m2 = objFor(f, '_o2', () => flatMesh(RINGG, C.blood, 0.9));
          m2.scale.set(f.r, f.r, 1);
          m2.position.copy(m.position);
        } else {
          const m = objFor(f, '_o', () => {
            const mm = new THREE.Mesh(quadGeo(), addMat(f.beam ? f.col : C.blood, 0.35));
            mm.renderOrder = 5;
            mm.userData.disp = () => {
              mm.geometry.dispose();
              mm.material.dispose();
            };
            return mm;
          });
          setQuad(m.geometry, f.x, f.y, f.x2, f.y2, f.w, groundAt(f.x, f.y) + 4, groundAt(f.x2, f.y2) + 4);
          m.material.opacity = 0.2 + 0.3 * (Math.floor(T * 12) % 2);
        }
        break;
      }
      case 'beam': {
        const m = objFor(f, '_o', () => {
          const mm = new THREE.Mesh(quadGeo(), addMat(f.col, 0.9));
          mm.renderOrder = 5;
          mm.userData.disp = () => {
            mm.geometry.dispose();
            mm.material.dispose();
          };
          return mm;
        });
        const h = groundAt(f.x, f.y) + 24;
        setQuad(m.geometry, f.x, f.y, f.x2, f.y2, f.w * 1.4, h, h);
        m.material.opacity = f.t / f.max;
        break;
      }
    }
  }
  // portales
  if (G.portals)
    for (const pt of G.portals) {
      const o = objFor(pt, '_o', () => {
        const g = new THREE.Group();
        const acc = REALMS[pt.key].acc;
        const t = new THREE.Mesh(GEO.tor(30, 5), MB(acc));
        t.position.y = 36;
        g.add(t);
        const d = new THREE.Mesh(new THREE.CircleGeometry(27, 24), addMat(acc, 0.5));
        d.material.depthTest = true;
        d.position.y = 36;
        g.add(d);
        g.userData.d = d;
        const gl = glowSprite(acc, 160);
        gl.position.y = 36;
        g.add(gl);
        return g;
      });
      o.position.set(pt.x, groundAt(pt.x, pt.y), pt.y);
      o.rotation.y = G.yaw;
      o.userData.d.material.opacity = 0.35 + 0.25 * Math.sin(T * 4);
    }
  // altares y cofres
  for (const al of WORLD.altars) {
    al.gem.visible = !al.used;
    al.gem.rotation.y = T * 2;
    al.gem.position.y = 30 + Math.sin(T * 2 + al.x) * 4;
  }
  for (const sh of WORLD.shrines || []) {
    sh.obj.visible = true;
    sh.gem.rotation.y = T * 1.5;
    if (sh.type !== 'fuente' && sh.type !== 'desafio') sh.gem.position.y = 32 + Math.sin(T * 2 + sh.x) * 4;
    sh.obj.children.forEach((c) => {
      if (c.isSprite) c.visible = !sh.used;
      if (c.geometry && c.geometry.type === 'RingGeometry') c.visible = !sh.used;
    });
  }
  for (const m of WORLD.merchants || []) {
    if (AS.ready) {
      const o = objFor(m, '_m', () => (AS.g.u_man ? buildGodH : buildGodKK)('mercader'));
      o.position.set(m.x, surfaceAt(m.x, m.y), m.y);
      o.scale.setScalar(0.92);
      const pp = players[0];
      const fk = {
        moving: false,
        air: false,
        down: false,
        fx: pp ? pp.x - m.x : 0,
        fy: pp ? pp.y - m.y : 1,
        inv: 0,
        hidden: 0,
        atk: 0,
        powAnim: 0,
      };
      animGodKK(o, fk, dt);
    } else {
      const o = objFor(m, '_s', () => mkSprite(godSprites('mercader')[Math.floor(T * 2) % 2]));
      setSprite(o, godSprites('mercader')[Math.floor(T * 1.5) % 2], Math.sin(T * 0.3 + m.x) > 0);
      o.position.set(m.x, surfaceAt(m.x, m.y), m.y);
    }
    shadow(m.x, m.y, 14);
  }
  {
    let nc = 0;
    for (const c of coins) {
      if (nc >= 500) break;
      const ry = T * 5 + c.ph;
      instSet(COINS, nc, c.x, c.z + 9 + (c.vz === 0 ? Math.sin(T * 4 + c.ph) * 2 : 0), c.y, 1, null, ry);
      instSet(COINR, nc, c.x, c.z + 9 + (c.vz === 0 ? Math.sin(T * 4 + c.ph) * 2 : 0), c.y, 1, null, ry);
      nc++;
      if (ns < 800) shadow(c.x, c.y, 4);
    }
    instDone(COINS, nc);
    instDone(COINR, nc);
  }
  for (const ch of WORLD.chests) {
    if (AS.ready && propAsset('chest_gold')) {
      if (ch.obj) ch.obj.visible = false;
      const o = objFor(ch, '_a', () => {
        const g = new THREE.Group();
        const pa = propAsset(ch.rich ? 'chest_gold' : 'chest');
        const m = new THREE.Mesh(pa.geo, pa.mat.clone());
        const k = (ch.rich ? 30 : 24) / pa.w;
        m.scale.setScalar(k);
        m.castShadow = true;
        g.add(m);
        g.add(glowSprite(ch.rich ? '#c8a0ff' : C.gold, ch.rich ? 90 : 50));
        g.rotation.y = hash(Math.round(ch.x), Math.round(ch.y)) * 6.28;
        return g;
      });
      o.position.set(ch.x, groundAt(ch.x, ch.y), ch.y);
      if (ch.opened) {
        ch.ot = (ch.ot || 0) + dt;
        const k2 = Math.max(0, 1 - ch.ot * 2);
        o.scale.set(1 + ch.ot, k2, 1 + ch.ot);
        if (k2 <= 0) o.visible = false;
      } else o.position.y += Math.abs(Math.sin(T * 2 + ch.x)) * 1.2;
      continue;
    }
    if (!ch.obj) {
      const o = objFor(ch, '_o', () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(GEO.box(22, 14, 16), ML(ch.rich ? '#4b2f6e' : '#7a4a2a'));
        body.position.y = 7;
        g.add(body);
        const lid = new THREE.Mesh(GEO.box(23, 5, 17), MB(ch.rich ? '#c8a0ff' : C.gold));
        lid.position.y = 16;
        g.add(lid);
        g.userData.lid = lid;
        g.add(glowSprite(ch.rich ? '#c8a0ff' : C.gold, ch.rich ? 90 : 50));
        return g;
      });
      o.position.set(ch.x, groundAt(ch.x, ch.y), ch.y);
      ch._lid = o.userData.lid;
      if (ch.opened) {
        ch._lid.rotation.x = -1.1;
        ch._lid.position.set(0, 20, -6);
      }
    } else if (ch.opened) {
      ch.lid.rotation.x = -1.1;
      ch.lid.position.set(0, 20, -6);
    }
  }
  questsDraw(dt);
  // instancias
  let n = 0;
  for (const gm of gems) {
    if (n >= 460) break;
    const col = gm.t === 'p' ? '#c8a0ff' : gm.t === 'b' ? '#3fb3c0' : C.gold;
    instSet(
      GEMS,
      n++,
      gm.x,
      groundAt(gm.x, gm.y) + 8 + Math.sin(T * 4 + gm.x) * 2,
      gm.y,
      gm.t === 'g' ? 1 : 1.5,
      col,
      T * 2 + gm.x
    );
  }
  instDone(GEMS, n);
  n = 0;
  for (const bl of bullets) {
    if (n >= 520) break;
    instSet(BULLETS, n++, bl.x, bl.z, bl.y, bl.r / 6, bl.col);
  }
  instDone(BULLETS, n);
  n = 0;
  for (const f of fx) {
    if (f.k !== 'p' || n >= 900) continue;
    instSet(PARTS, n++, f.x, f.z || 0, f.y, clamp(f.t * 2, 0.3, 1), f.c, f.x);
  }
  instDone(PARTS, n);
  for (let i = 0; i < ng; i++) {
    GLOWS.getMatrixAt(i, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    dummy.quaternion.copy(cam3.quaternion);
    dummy.updateMatrix();
    GLOWS.setMatrixAt(i, dummy.matrix);
  }
  instDone(GLOWS, ng);
  instDone(SHADOWS, ns);
  sweep();
  // agua y cielo
  if (WORLD.hazTex) {
    WORLD.hazTex.offset.x = T * 0.01;
    WORLD.hazTex.offset.y = T * 0.007;
  }
  if (WORLD.aurora)
    WORLD.aurora.forEach((m, i) => {
      m.material.opacity = 0.12 + 0.08 * Math.sin(T * 0.5 + i);
      m.position.x = Math.sin(T * 0.05 + i) * 200;
    });
  const c = camera();
  updWeather(dt, c.x, c.y);
  sunFollow(c.x, c.y);
  animWater();
  if (WORLD.sky) WORLD.sky.position.set(cam3.position.x, 0, cam3.position.z);
  if (WORLD.stars) WORLD.stars.position.set(cam3.position.x, 0, cam3.position.z);
}
