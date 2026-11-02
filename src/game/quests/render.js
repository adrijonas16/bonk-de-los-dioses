/* ---------- objetos 3D dinámicos ---------- */
function questsDraw(dt) {
  const q = G && G.q;
  if (!q) return;
  for (const A of q.active) {
    if (A.id === 'ladron' && A.e && !A.e.dead) {
      const e = A.e;
      const o = objFor(A, '_ch', () => {
        const g = new THREE.Group();
        const b = new THREE.Mesh(GEO.box(16, 10, 12), ML('#7a4a2a'));
        g.add(b);
        const l = new THREE.Mesh(GEO.box(17, 4, 13), MB(C.gold));
        l.position.y = 7;
        g.add(l);
        const gw = qGlow('#ffd060', 34);
        gw.material.opacity = 0.6;
        g.add(gw);
        return g;
      });
      o.position.set(e.x, e.z + 40, e.y);
      o.rotation.y = T * 3;
    }
    if (A.id === 'llama') {
      const c = A.carrier;
      if (c && A.weak == null) {
        const o = objFor(A, '_fl', () => {
          const g = new THREE.Group();
          const f = new THREE.Mesh(GEO.cone(6, 16, 6), MB('#ffb040'));
          g.add(f);
          g.add(qGlow('#ff8a2a', 70));
          return g;
        });
        const k = 0.55 + 0.45 * clamp(A.f / 100, 0, 1);
        o.scale.setScalar(k);
        o.position.set(c.x, c.z + 66, c.y);
        const r = objFor(A, '_fr', () => flatMesh(RINGG, '#ffb040', 0.7));
        r.scale.set(24, 24, 1);
        r.position.set(c.x, groundAt(c.x, c.y) + 2, c.y);
        if (Math.random() < 0.4)
          fx.push({
            k: 'p',
            x: c.x + rand(-4, 4),
            y: c.y + rand(-4, 4),
            z: c.z + 70,
            vx: rand(-10, 10),
            vy: rand(-10, 10),
            vz: rand(30, 70),
            t: 0.4,
            c: Math.random() < 0.5 ? '#ffd060' : '#ff6a1a',
          });
      }
      const em =
        c && A.weak != null
          ? { x: c.x, y: c.y, z: c.z + 62, held: true }
          : A.ember
            ? { x: A.ember.x, y: A.ember.y, z: groundAt(A.ember.x, A.ember.y) + 8 }
            : null;
      if (em) {
        const o = objFor(A, '_em', () => {
          const g = new THREE.Group();
          const coal = new THREE.Mesh(GEO.ico(6), MB('#a02010'));
          g.add(coal);
          g.add(qGlow('#ff3a1a', 44));
          return g;
        });
        o.position.set(em.x, em.z, em.y);
        o.children[1].material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(T * 5));
        const r = objFor(A, '_er', () => flatMesh(RINGG, '#ff4a2a', 0.85));
        r.scale.set(28, 28, 1);
        r.position.set(em.x, groundAt(em.x, em.y) + 2, em.y);
        r.rotation.z = T * 2;
        if (Math.random() < 0.3)
          fx.push({
            k: 'p',
            x: em.x + rand(-3, 3),
            y: em.y + rand(-3, 3),
            z: em.z + 6,
            vx: rand(-8, 8),
            vy: rand(-8, 8),
            vz: rand(20, 50),
            t: 0.8,
            c: '#5a5a62',
          });
      }
    }
    if (A.id === 'sellos' && A.e && !A.e.dead) {
      const e = A.e;
      if (e.qmul < 1) {
        const sh = objFor(A, '_sh', () => flatMesh(RINGW, '#c8a0ff', 0.85));
        sh.scale.set(e.r * 1.9, e.r * 1.9, 1);
        sh.position.set(e.x, groundAt(e.x, e.y) + 3, e.y);
        sh.rotation.z = T * 1.5;
        const gl = objFor(A, '_sg', () => {
          const s = qGlow('#c8a0ff', 150);
          s.material.opacity = 0.45;
          return s;
        });
        gl.position.set(e.x, e.z + 50, e.y);
        for (const s of q.seals) {
          if (s.hp <= 0) continue;
          const m = objFor(s, '_bm', () => {
            const mm = new THREE.Mesh(quadGeo(), addMat('#c8a0ff', 0.4));
            mm.renderOrder = 5;
            mm.userData.disp = () => {
              mm.geometry.dispose();
              mm.material.dispose();
            };
            return mm;
          });
          setQuad(m.geometry, s.x, s.y, e.x, e.y, 6, groundAt(s.x, s.y) + 26, e.z + 60);
          m.material.opacity = 0.25 + 0.2 * Math.sin(T * 6 + s.x);
        }
      }
    }
    if (A.id === 'favor') {
      const r = A.carrier
        ? { x: A.carrier.x, y: A.carrier.y, z: A.carrier.z + 64 }
        : { x: A.relic.x, y: A.relic.y, z: groundAt(A.relic.x, A.relic.y) + 18 };
      const o = objFor(A, '_rl', () => {
        const g = new THREE.Group();
        const s = new THREE.Mesh(GEO.dod(13), MB('#ffe060'));
        g.add(s);
        g.add(qGlow('#ffe060', 90));
        const pil = qPillar('#ffe060');
        g.add(pil);
        g.userData.pil = pil;
        return g;
      });
      o.position.set(r.x, r.z, r.y);
      o.rotation.y = T * 2;
      o.userData.pil.visible = !A.carrier;
    }
  }
  for (const b of q.braz) {
    if (!b.lit && qActive('llama')) {
      const o = objFor(b, '_pl', () => {
        const g = new THREE.Group();
        g.add(qPillar('#ff8a2a'));
        return g;
      });
      o.position.set(b.x, groundAt(b.x, b.y), b.y);
    }
    if (b.lit && Math.random() < 0.3)
      fx.push({
        k: 'p',
        x: b.x + rand(-8, 8),
        y: b.y + rand(-8, 8),
        z: groundAt(b.x, b.y) + 58,
        vx: rand(-10, 10),
        vy: rand(-10, 10),
        vz: rand(50, 110),
        t: 0.5,
        c: Math.random() < 0.5 ? '#ffd060' : '#ff6a1a',
      });
  }
  const fl = qActive('llama');
  for (const s of q.shelters) {
    const ins = qHumans().some((p) => (p.x - s.x) ** 2 + (p.y - s.y) ** 2 < (s.r + 30) ** 2);
    s.roof.material.opacity += ((ins ? 0.3 : 1) - s.roof.material.opacity) * Math.min(1, dt * 8);
    s.roof.material.depthWrite = !ins;
    s.ring.material.opacity = fl && (fl.storm > 0 || fl.weak != null) ? 0.55 + 0.4 * Math.sin(T * 8) : 0.75;
  }
  for (const s of q.seals)
    if (s.hp > 0) {
      s.glyph.rotation.y = T * 2;
      s.glyph.position.y = 26 + Math.sin(T * 2 + s.x) * 3;
    }
  const fa = q.anch.find((a) => a.id === 'favor');
  if (fa && fa.state !== 'done' && AS.ready && AS.g.u_man && typeof buildGodH === 'function') {
    const o = objFor(fa, '_god', () => buildGodH(fa.giver));
    if (o) {
      o.position.set(fa.x, groundAt(fa.x, fa.y) + 19, fa.y);
      o.scale.setScalar(0.92);
      const pp = players[0];
      const fk = {
        moving: false,
        air: false,
        down: false,
        fx: pp ? pp.x - fa.x : 0,
        fy: pp ? pp.y - fa.y : 1,
        inv: 0,
        hidden: 0,
        atk: 0,
        powAnim: 0,
      };
      try {
        animGodKK(o, fk, dt);
      } catch (_) {}
    }
  }
  for (const o of q.puddles) {
    const m = objFor(o, '_o', () => flatMesh(DISC, '#4fa8ff', 0.4));
    m.scale.set(o.r, o.r, 1);
    m.position.set(o.x, groundAt(o.x, o.y) + 1.6, o.y);
    m.material.opacity = (o.flash > 0 ? 0.8 : 0.24) * Math.min(1, o.t);
    m.material.color.set(o.flash > 0 ? '#dff4ff' : '#4fa8ff');
  }
  for (const e of enemies) {
    if (e.hunter && !e.dead) {
      const r = objFor(e, '_hq', () => flatMesh(RINGW, '#ff4d5e', 0.85));
      r.scale.set(e.r * 1.6, e.r * 1.6, 1);
      r.position.set(e.x, groundAt(e.x, e.y) + 2, e.y);
      r.rotation.z = -T * 3;
    }
    if (e.burnQ > 0 && !e.dead && !e.boss) {
      const f = objFor(e, '_bq', () => qGlow('#ff6a1a', 30));
      f.position.set(e.x, (e.z || 0) + e.r * 1.6, e.y);
    }
  }
}
