/* ---------- enemigos: plantillas por arquetipo ---------- */
function enemyParts(d, boss) {
  const c = d.col,
    dk = shade(c, -0.28),
    hi = shade(c, 0.2),
    a = d.acc,
    bone = '#e8e0cc',
    eye = lum(a) > 0.5 ? a : '#fff0a0';
  const f = d.feat || '';
  const out = [];
  const P = (w, h, dd, col, pv, of, an, i, geo) => out.push({ w, h, d: dd, col, pv, of, an: an || '', i: i || 0, geo });
  const col = (k) => ({ c, d: dk, h: hi, a, b: bone, e: eye, k: INK, w: '#7a5a3a', s: '#c8ccd8' })[k] || k;
  switch (d.arch) {
    case 'humanoid':
    case 'lord': {
      const sk = f === 'skull';
      const hc = sk ? 'b' : 'c';
      P(3.6, 9, 3.6, 'd', [-2.3, 9, 0], [0, -4.5, 0], 'legA');
      P(3.6, 9, 3.6, 'd', [2.3, 9, 0], [0, -4.5, 0], 'legB');
      P(9.5, 10.5, 6.2, 'c', [0, 9, 0], [0, 5, 0], 'torso');
      P(10, 2, 6.6, 'a', [0, 9, 0], [0, 1.2, 0], 'torso');
      P(2.8, 9.5, 2.8, hc, [-6, 18, 0], [0, -4.5, 0], 'armA');
      P(2.8, 9.5, 2.8, hc, [6, 18, 0], [0, -4.5, 0], 'armB');
      if (f !== 'headless') {
        const heads = boss && d.heads > 1 ? Math.min(d.heads, 10) : 1;
        for (let h = 0; h < heads; h++) {
          const hx = (h - (heads - 1) / 2) * (heads > 3 ? 5.2 : 8.5),
            hy = heads > 3 ? -Math.abs(h - (heads - 1) / 2) * 0.8 : 0,
            hs = heads > 3 ? 0.75 : 1;
          P(8.2 * hs, 8 * hs, 7.6 * hs, hc, [hx, 19 + hy, 0], [0, 4 * hs, 0], 'head', h);
          if (f === 'oneeye') {
            P(3.6, 3.6, 0.6, 'e', [hx, 19 + hy, 0], [0, 4.4 * hs, 3.9 * hs], 'head', h);
            P(1.6, 1.6, 0.7, 'k', [hx, 19 + hy, 0], [0, 4.4 * hs, 4.1 * hs], 'head', h);
          } else {
            P(1.7, 1.7, 0.6, sk ? 'k' : 'e', [hx, 19 + hy, 0], [-1.9 * hs, 4.6 * hs, 3.9 * hs], 'head', h);
            P(1.7, 1.7, 0.6, sk ? 'k' : 'e', [hx, 19 + hy, 0], [1.9 * hs, 4.6 * hs, 3.9 * hs], 'head', h);
          }
          if (sk) {
            P(4, 1.2, 0.6, 'k', [hx, 19 + hy, 0], [0, 1.6 * hs, 3.9 * hs], 'head', h);
          }
          if (f === 'horns') {
            P(1.5, 4.5, 1.5, 'b', [hx, 19 + hy, 0], [-3.2 * hs, 9.6 * hs, 0], 'head', h);
            P(1.5, 4.5, 1.5, 'b', [hx, 19 + hy, 0], [3.2 * hs, 9.6 * hs, 0], 'head', h);
          }
          if (f === 'helmet') {
            P(9, 3.6, 8.6, 'a', [hx, 19 + hy, 0], [0, 7.4 * hs, 0], 'head', h);
            P(1.6, 4, 8.8, '#b3301f', [hx, 19 + hy, 0], [0, 10.4 * hs, 0], 'head', h);
          }
          if (f === 'crown') {
            P(8.8, 2, 8.4, C.gold, [hx, 19 + hy, 0], [0, 8.6 * hs, 0], 'head', h);
            for (const x of [-3, 0, 3])
              P(1.4, 2.2, 1.4, C.gold, [hx, 19 + hy, 0], [x * hs, 10.4 * hs, 3.6 * hs], 'head', h);
          }
        }
      } else P(4, 4, 4, '#9ad0e8', [0, 19, 0], [0, 3, 0], 'flame');
      if (f === 'spear' || f === 'scythe') {
        P(1, 24, 1, 'w', [6, 18, 0], [0, -3, 3], 'armB');
        if (f === 'scythe') P(1, 2.4, 9, 's', [6, 18, 0], [0, 9, 6.5], 'armB');
        else P(1.6, 4, 1.6, 's', [6, 18, 0], [0, 10.5, 3], 'armB');
      }
      if (f === 'hop') {
        P(10, 2, 1, '#f2d23a', [0, 19, 0], [0, 6.5, 3.9], 'head');
      }
      if (f === 'stinger') {
        P(2, 2, 7, 'a', [0, 9, -3], [0, 2, -3], 'tail');
      }
      if (boss && d.arch === 'lord') {
        P(12, 3, 7, 'a', [0, 9, 0], [0, 10.4, 0], 'torso');
        P(4, 4, 5, 'a', [-6, 18, 0], [0, 0, 0], 'armA');
        P(4, 4, 5, 'a', [6, 18, 0], [0, 0, 0], 'armB');
      }
      break;
    }
    case 'flyer': {
      const by = 22;
      const wc = f === 'butterfly' ? 'a' : f === 'dragon' ? 'd' : 'c';
      P(7.5, 6.5, 10, 'c', [0, by, 0], [0, 0, 0], 'bob');
      P(6.4, 6, 6.4, 'c', [0, by, 0], [0, 1.4, 6.6], 'bob');
      P(1.6, 1.6, 0.6, 'e', [0, by, 0], [-1.6, 2.2, 9.9], 'bob');
      P(1.6, 1.6, 0.6, 'e', [0, by, 0], [1.6, 2.2, 9.9], 'bob');
      P(15, 1.1, 9, wc, [-3.6, by + 2, 0], [-7.5, 0, 0], 'wingL');
      P(15, 1.1, 9, wc, [3.6, by + 2, 0], [7.5, 0, 0], 'wingR');
      if (f === 'butterfly') {
        P(11, 1.2, 7, 'h', [-3.6, by + 2, 0], [-6, 0, -6], 'wingL');
        P(11, 1.2, 7, 'h', [3.6, by + 2, 0], [6, 0, -6], 'wingR');
      }
      P(4.5, 1.2, 6, 'd', [0, by, -5], [0, 0, -3], 'tail');
      if (f === 'beak' || f === 'bird') P(2.4, 2.2, 3.4, 'a', [0, by, 0], [0, 0.8, 10.8], 'bob');
      if (f === 'ears' || f === 'bat') {
        P(1.6, 3.4, 1.2, 'd', [0, by, 0], [-2, 5.4, 6], 'bob');
        P(1.6, 3.4, 1.2, 'd', [0, by, 0], [2, 5.4, 6], 'bob');
      }
      if (f === 'dragon') {
        P(2.4, 2.4, 6, 'c', [0, by, 0], [0, 1.4, 11], 'bob');
        P(1.2, 3.4, 1.2, 'b', [0, by, 0], [-2, 5.6, 6], 'bob');
        P(1.2, 3.4, 1.2, 'b', [0, by, 0], [2, 5.6, 6], 'bob');
      }
      P(1.4, 4, 1.4, 'd', [-2, by - 3, 0], [0, -2, 0], 'legA');
      P(1.4, 4, 1.4, 'd', [2, by - 3, 0], [0, -2, 0], 'legB');
      break;
    }
    case 'blob': {
      P(12, 11, 11, 'c', [0, 3, 0], [0, 5.5, 0], 'squash');
      P(9, 4, 9, 'h', [0, 3, 0], [0, 12, 0], 'squash');
      P(2.2, 2.6, 0.6, 'e', [0, 3, 0], [-2.6, 8, 5.6], 'squash');
      P(2.2, 2.6, 0.6, 'e', [0, 3, 0], [2.6, 8, 5.6], 'squash');
      P(3, 1.2, 0.6, 'k', [0, 3, 0], [0, 4.6, 5.6], 'squash');
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * 6.283 + 0.6;
        P(2.4, 6, 2.4, 'd', [Math.cos(a) * 3.6, 3.4, Math.sin(a) * 3.6], [0, -3, 0], 'tent', i);
      }
      if (f === 'hair') P(12.4, 10, 4, 'k', [0, 3, 0], [0, 8, -4.2], 'squash');
      break;
    }
    case 'giant': {
      P(5, 8, 5, 'd', [-3.4, 8, 0], [0, -4, 0], 'legA');
      P(5, 8, 5, 'd', [3.4, 8, 0], [0, -4, 0], 'legB');
      P(15, 14, 10.5, 'c', [0, 8, 0], [0, 7, 0], 'torso');
      P(12, 3, 9, 'h', [0, 8, 0], [0, 13.4, 0], 'torso');
      P(4, 14, 4, 'c', [-9.4, 19, 0], [0, -6.5, 0], 'armA');
      P(4, 14, 4, 'c', [9.4, 19, 0], [0, -6.5, 0], 'armB');
      P(4.8, 4.6, 4.8, 'd', [-9.4, 19, 0], [0, -14, 0], 'armA');
      P(4.8, 4.6, 4.8, 'd', [9.4, 19, 0], [0, -14, 0], 'armB');
      if (f === 'oneeye') {
        P(5, 5, 0.8, 'b', [0, 8, 0], [0, 10, 5.4], 'torso');
        P(2.4, 2.4, 1, 'a', [0, 8, 0], [0, 10, 5.8], 'torso');
      } else {
        P(2, 2, 0.6, 'e', [0, 8, 0], [-2.6, 10.4, 5.4], 'torso');
        P(2, 2, 0.6, 'e', [0, 8, 0], [2.6, 10.4, 5.4], 'torso');
      }
      P(6, 1.4, 0.6, 'k', [0, 8, 0], [0, 5.6, 5.4], 'torso');
      if (f === 'horns') {
        P(1.8, 5, 1.8, 'b', [0, 8, 0], [-5, 16.4, 0], 'torso');
        P(1.8, 5, 1.8, 'b', [0, 8, 0], [5, 16.4, 0], 'torso');
      }
      break;
    }
    case 'beast': {
      const heads = boss ? d.heads || 1 : 1;
      P(8.5, 7.5, 15, 'c', [0, 9.5, 0], [0, 0, 0], 'bodyB');
      P(8.8, 2, 13, 'h', [0, 9.5, 0], [0, 4, 0], 'bodyB');
      for (let h = 0; h < heads; h++) {
        const hx = (h - (heads - 1) / 2) * 7.4;
        P(7.2, 6.8, 7.2, 'c', [hx, 11, 8], [0, 1.6, 3], 'headB', h);
        P(4.4, 3.6, 4.4, 'h', [hx, 11, 8], [0, 0, 7.6], 'headB', h);
        P(1.6, 1.2, 0.6, 'k', [hx, 11, 8], [0, 0.8, 9.9], 'headB', h);
        P(1.6, 1.6, 0.6, 'e', [hx, 11, 8], [-1.9, 3.2, 6.7], 'headB', h);
        P(1.6, 1.6, 0.6, 'e', [hx, 11, 8], [1.9, 3.2, 6.7], 'headB', h);
        P(1.8, 3.4, 1.2, 'd', [hx, 11, 8], [-2.4, 6.2, 2], 'headB', h);
        P(1.8, 3.4, 1.2, 'd', [hx, 11, 8], [2.4, 6.2, 2], 'headB', h);
        if (f === 'horns') {
          P(1.4, 5, 1.4, 'b', [hx, 11, 8], [-3, 7, 3], 'headB', h);
          P(1.4, 5, 1.4, 'b', [hx, 11, 8], [3, 7, 3], 'headB', h);
        }
        if (f === 'mane') P(10, 10, 4, 'a', [hx, 11, 8], [0, 1.6, 0], 'headB', h);
      }
      for (const [x, z, an] of [
        [-2.9, 5, 'legA'],
        [2.9, 5, 'legB'],
        [-2.9, -5, 'legB'],
        [2.9, -5, 'legA'],
      ])
        P(2.9, 8, 2.9, 'd', [x, 8, z], [0, -4, 0], an);
      const tails = f === 'tails' ? 3 : 1;
      for (let t = 0; t < tails; t++)
        P(1.8, 1.8, 9, tails > 1 ? 'h' : 'd', [0, 11, -7.5], [(t - (tails - 1) / 2) * 3, 1.4, -4.5], 'tail', t);
      break;
    }
    default: {
      // crawler
      P(9.5, 4.4, 12, 'c', [0, 4.5, 0], [0, 0, 0], 'bodyB');
      P(8, 2, 9, 'h', [0, 4.5, 0], [0, 2.6, 0], 'bodyB');
      P(1.6, 1.6, 0.6, 'e', [0, 4.5, 0], [-1.8, 2, 6.1], 'bodyB');
      P(1.6, 1.6, 0.6, 'e', [0, 4.5, 0], [1.8, 2, 6.1], 'bodyB');
      for (let i = 0; i < 3; i++) {
        P(7, 1.2, 1.4, 'd', [-4, 4, -3 + i * 3.2], [-3, -1, 0], i % 2 ? 'crawlA' : 'crawlB', i);
        P(7, 1.2, 1.4, 'd', [4, 4, -3 + i * 3.2], [3, -1, 0], i % 2 ? 'crawlB' : 'crawlA', i);
      }
      P(3.2, 2.8, 5, 'a', [-4.4, 4.5, 6], [0, 0, 3], 'armA');
      P(3.2, 2.8, 5, 'a', [4.4, 4.5, 6], [0, 0, 3], 'armB');
      P(2.6, 2.6, 6, 'c', [0, 6, -6], [0, 3, -2], 'tail');
      P(2, 2, 6, 'c', [0, 6, -6], [0, 8.5, -0.5], 'tail');
      P(1.6, 4, 1.6, 'a', [0, 6, -6], [0, 12, 1.5], 'tail');
    }
  }
  return out.map((p) => Object.assign(p, { color: col(p.col) }));
}
const _e3 = new THREE.Euler(),
  _s3 = new THREE.Vector3(1, 1, 1),
  _p3 = new THREE.Vector3(),
  _m4 = new THREE.Matrix4(),
  _b4 = new THREE.Matrix4(),
  _q3 = new THREE.Quaternion();
function partAnim(p, ph, mv, t, e) {
  _e3.set(0, 0, 0);
  _s3.set(1, 1, 1);
  const s = Math.sin(ph);
  switch (p.an) {
    case 'legA':
      _e3.x = s * 0.75 * mv;
      break;
    case 'legB':
      _e3.x = -s * 0.75 * mv;
      break;
    case 'armA':
      _e3.x = -s * 0.6 * mv - (e && e.atk ? e.atk : 0);
      break;
    case 'armB':
      _e3.x = s * 0.6 * mv - (e && e.atk ? e.atk : 0);
      break;
    case 'wingL':
      _e3.z = Math.sin(t * 14 + ph) * 0.75;
      break;
    case 'wingR':
      _e3.z = -Math.sin(t * 14 + ph) * 0.75;
      break;
    case 'head':
      _e3.y = Math.sin(t * 1.3 + p.i) * 0.12;
      _e3.x = Math.sin(t * 2 + p.i) * 0.05;
      break;
    case 'headB':
      _e3.x = Math.sin(ph * 2 + p.i) * 0.08;
      _e3.y = Math.sin(t * 1.1 + p.i * 1.7) * 0.15;
      break;
    case 'tail':
      _e3.y = Math.sin(t * 5 + ph + p.i) * 0.45;
      _e3.x = -0.15;
      break;
    case 'squash': {
      const k = Math.sin(t * 5 + ph) * 0.08;
      _s3.set(1 - k * 0.6, 1 + k, 1 - k * 0.6);
      break;
    }
    case 'tent':
      _e3.x = Math.sin(t * 6 + ph + p.i) * 0.4;
      _e3.z = Math.cos(t * 5 + ph + p.i) * 0.3;
      break;
    case 'crawlA':
      _e3.y = s * 0.35 * mv;
      break;
    case 'crawlB':
      _e3.y = -s * 0.35 * mv;
      break;
    case 'torso':
      _e3.y = Math.sin(ph * 0.5) * 0.06 * mv;
      break;
    case 'flame':
      _s3.set(1, 1 + Math.sin(t * 14) * 0.3, 1);
      break;
  }
}

function partGeo(pt) {
  const { w, h, d } = pt;
  const mx = Math.max(w, h, d),
    mn = Math.min(w, h, d);
  let g;
  if (mx < 2.6 || mn < 1.3) {
    g = new THREE.BoxGeometry(w, h, d);
  } else if (/^(legA|legB|armA|armB|tent|crawlA|crawlB)$/.test(pt.an) && h >= Math.max(w, d)) {
    g = new THREE.CylinderGeometry(Math.min(w, d) / 2, (Math.min(w, d) / 2) * 0.78, h, 9);
  } else if (pt.an === 'tail' && d >= Math.max(w, h)) {
    g = new THREE.CylinderGeometry((Math.min(w, h) / 2) * 0.7, Math.min(w, h) / 2, d, 8);
    g.rotateX(Math.PI / 2);
  } else if (/^(wingL|wingR)$/.test(pt.an)) {
    g = new THREE.BoxGeometry(w, h, d);
  } else {
    g = new THREE.SphereGeometry(0.5, 12, 9);
    g.scale(w * 1.1, h * 1.1, d * 1.1);
  }
  g.translate(pt.of[0], pt.of[1], pt.of[2]);
  return g;
}
