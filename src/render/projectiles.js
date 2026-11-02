/* ---------- proyectiles ---------- */
function projObj(q) {
  const g = new THREE.Group(),
    c = q.col,
    big = q.big,
    len = big ? 70 : Math.max(18, q.r * 2.2);
  const box = (w, h, d, col, x, y, z) => {
    const m = new THREE.Mesh(GEO.box(w, h, d), MB(col));
    m.position.set(x || 0, y || 0, z || 0);
    g.add(m);
    return m;
  };
  switch (q.st) {
    case 'arrow':
      box(16, 1.6, 1.6, '#e8e0cc');
      box(4, 3, 3, '#8a8a8a', 9);
      box(3, 3, 0.8, C.blood, -8);
      break;
    case 'trident':
      if (q.k === 'line') {
        box(len, 3, 3, c);
        box(3, 3, 14, c, len / 2 - 2);
        box(8, 2, 2, c, len / 2 + 3, 0, 5);
        box(8, 2, 2, c, len / 2 + 3, 0, -5);
        box(10, 2, 2, c, len / 2 + 4);
      } else {
        box(20, 2, 2, c);
        box(2, 2, 10, C.gold, 8);
        box(6, 2, 2, C.gold, 11, 0, 4);
        box(6, 2, 2, C.gold, 11, 0, -4);
        box(7, 2, 2, C.gold, 12);
      }
      break;
    case 'spear':
    case 'firespear':
    case 'blade':
      box(len, big ? 5 : 3, big ? 5 : 3, q.st === 'blade' ? c : '#6a4a2a');
      box(big ? 16 : 7, big ? 7 : 4, big ? 7 : 4, q.st === 'spear' ? C.gold : c, len / 2 + 2);
      if (q.st !== 'spear' || big) g.add(glowSprite(c, big ? 90 : 30));
      break;
    case 'holysword': {
      const s = new THREE.Group();
      const bl = new THREE.Mesh(GEO.box(34, 1.6, 5), ML('#fff4d0', { emissive: '#ffb347' }));
      bl.position.x = 12;
      s.add(bl);
      const tip = new THREE.Mesh(GEO.cone(2.6, 7, 4), ML('#fff4d0', { emissive: '#ffb347' }));
      tip.rotation.z = -Math.PI / 2;
      tip.position.x = 32;
      s.add(tip);
      const cg = new THREE.Mesh(GEO.box(2.6, 3, 15), ML(C.gold, { emissive: '#8a5a00' }));
      cg.position.x = -5;
      s.add(cg);
      const hl = new THREE.Mesh(GEO.box(9, 2.4, 2.4), ML('#6a3a1a'));
      hl.position.x = -10.5;
      s.add(hl);
      const pm = new THREE.Mesh(GEO.sph(2.2, 6, 5), ML(C.gold, { emissive: '#8a5a00' }));
      pm.position.x = -15.5;
      s.add(pm);
      const fl = glowSprite('#ff8a3a', 26);
      fl.position.x = 14;
      s.add(fl);
      s.rotation.x = Math.PI / 2;
      g.add(s);
      g.userData.sword = s;
      g.scale.setScalar(1.35);
      break;
    }
    case 'beam':
      box(len, 4, 4, c);
      box(len, 1.6, 1.6, '#ffffff');
      g.add(glowSprite(c, 50));
      break;
    case 'serpent':
      for (let i = 0; i < 8; i++) {
        const m = box(10, 8, 8, i % 2 ? c : C.gold, -i * 9);
        m.userData.i = i;
      }
      box(10, 10, 10, C.blood, 10);
      g.add(glowSprite(c, 80));
      break;
    case 'fire': {
      const m = new THREE.Mesh(GEO.sph(4.5, 6, 5), MB(c));
      g.add(m);
      g.add(glowSprite(c, 26));
      break;
    }
    case 'net': {
      const m = new THREE.Mesh(GEO.box(16, 1, 16), MB(c, { wireframe: true }));
      g.add(m);
      break;
    }
    case 'stone': {
      g.add(new THREE.Mesh(GEO.sph(3, 6, 5), MB('#d8dce8')));
      g.add(glowSprite(c, 18));
      break;
    }
    case 'tear': {
      g.add(new THREE.Mesh(GEO.sph(3, 6, 5), MB(c)));
      break;
    }
    case 'hammer':
    case 'axe':
    case 'staff': {
      const s = new THREE.Group();
      const h = new THREE.Mesh(GEO.box(q.st === 'staff' ? 30 : 16, 2, 2), MB(q.st === 'staff' ? c : '#6a4a2a'));
      s.add(h);
      if (q.st !== 'staff') {
        const hd = new THREE.Mesh(GEO.box(8, 7, 9), MB(c));
        hd.position.x = 8;
        s.add(hd);
        if (q.st === 'axe') {
          const h2 = hd.clone();
          h2.position.x = -8;
          s.add(h2);
        }
      }
      g.add(s);
      g.userData.spin = s;
      if (c === '#7de0ff' || c === '#e23a2a') g.add(glowSprite(c, 30));
      break;
    }
    case 'disc':
    case 'ring': {
      const t = new THREE.Mesh(GEO.tor(6, 1.6), MB(c));
      t.rotation.x = Math.PI / 2;
      g.add(t);
      g.userData.spin = t;
      g.add(glowSprite(c, 22));
      break;
    }
    case 'ball':
      g.add(new THREE.Mesh(GEO.sph(5, 8, 6), MB('#3a2a1a')));
      break;
    case 'crow': {
      const s = mkSprite(miscSprites().crow, 1);
      s.center.set(0.5, 0.5);
      g.add(s);
      break;
    }
    case 'wind': {
      const t = new THREE.Mesh(GEO.tor(5, 1.2), MB(c));
      g.add(t);
      g.userData.spin = t;
      break;
    }
    case 'thread':
      box(14, 1, 1, c);
      break;
    default:
      g.add(new THREE.Mesh(GEO.sph(4, 6, 5), MB(c)));
  }
  return g;
}
function glowSprite(col, size) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex(col),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  );
  s.scale.set(size, size, 1);
  s.userData.glow = true;
  return s;
}
