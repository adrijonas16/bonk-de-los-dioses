/* Bonk de los Dioses · personajes con proporciones humanas (maniquí animado de Quaternius, CC0) */
const HK = 38 / 1.83; // escala mundo/modelo
const HSTYLE = {
  // ropa por dios: 'tunic' (túnica corta), 'robe' (túnica larga), 'armor' (peto), 'bare' (torso desnudo)
  zeus: 'robe',
  poseidon: 'bare',
  hades: 'robe',
  artemisa: 'tunic',
  apolo: 'tunic',
  atenea: 'armor',
  thor: 'armor',
  odin: 'robe',
  freya: 'robe',
  loki: 'tunic',
  ra: 'tunic',
  anubis: 'tunic',
  sekhmet: 'tunic',
  marduk: 'robe',
  inanna: 'robe',
  enki: 'robe',
  vishnu: 'tunic',
  shiva: 'bare',
  durga: 'armor',
  hanuman: 'bare',
  susanoo: 'armor',
  amaterasu: 'robe',
  raijin: 'bare',
  wukong: 'armor',
  nezha: 'tunic',
  erlang: 'armor',
  quetzalcoatl: 'tunic',
  huitzilopochtli: 'armor',
  tezcatlipoca: 'tunic',
  tlaloc: 'tunic',
  chaac: 'bare',
  gemelos: 'tunic',
  ixchel: 'robe',
  inti: 'tunic',
  illapa: 'armor',
  mamaquilla: 'robe',
  pachamama: 'robe',
  viracocha: 'robe',
  shango: 'bare',
  ogun: 'bare',
  oya: 'robe',
  yemaya: 'robe',
  lugh: 'armor',
  dagda: 'tunic',
  morrigan: 'robe',
  dios: 'robe',
  jesus: 'robe',
  mercader: 'robe',
  hermes: 'tunic',
  ares: 'armor',
  afrodita: 'robe',
  hefesto: 'bare',
  baldr: 'robe',
  horus: 'tunic',
  ganesha: 'bare',
  kali: 'bare',
  cronos: 'robe',
  khaos: 'robe',
  tyr: 'armor',
  frigg: 'robe',
  isis: 'robe',
  thot: 'tunic',
  shamash: 'robe',
  nergal: 'bare',
  tsukuyomi: 'robe',
  inari: 'robe',
  guanyu: 'armor',
  change: 'robe',
  xochiquetzal: 'robe',
  xipe: 'bare',
  kinich: 'tunic',
  itzamna: 'robe',
  kon: 'tunic',
  mamacocha: 'robe',
  obatala: 'robe',
  eshu: 'tunic',
  brigid: 'robe',
  manannan: 'robe',
  miguel: 'armor',
  gabriel: 'robe',
  ymir: 'bare',
  set: 'bare',
  tiamat: 'robe',
  ravana: 'bare',
  izanami: 'robe',
  pangu: 'bare',
  mictlantecuhtli: 'tunic',
  kukulkan: 'tunic',
  supay: 'robe',
  olodumare: 'robe',
  cernunnos: 'bare',
  metatron: 'robe',
};
function humanSpec(id) {
  const L0 = LOOKS[id] || {},
    light = L0.head === 'light';
  return {
    id,
    light,
    skin: light ? '#fff6e0' : L0.s || C.skin,
    hair: L0.h || INK,
    hs: L0.hs || 'short',
    b: L0.b,
    bc: L0.bc || L0.h || INK,
    robe: light ? '#fff6e0' : L0.r || '#e8e0cc',
    trim: light ? '#f4d27a' : L0.t || C.gold,
    style: HSTYLE[id] || 'tunic',
    L: Object.assign({}, L0, { s: light ? '#fff6e0' : L0.s || C.skin, h: L0.h || INK }),
  };
}
/* color de cada vértice del maniquí según la parte del cuerpo (pose T: altura 1.83, frente +z) */
function humanColor(x, y, z, S, joint) {
  const ax = Math.abs(x);
  let c;
  if (y > 1.55 && ax < 0.11) {
    c = S.skin;
    const hs = S.hs;
    if (hs !== 'bald' && !S.L.head) {
      const top = y > 1.76 || (z < -0.03 && y > 1.62) || (z < 0.03 && ax > 0.07 && y > 1.7);
      const back = hs === 'long' && z < 0.0;
      if (top || back) c = hs === 'flame' ? '#5ab0ff' : S.hair;
    }
    if (S.b === 'full' && z > 0.015 && y < 1.665) c = S.bc;
    if (S.b === 'short' && z > 0.04 && y < 1.625) c = S.bc;
    if (S.L.head)
      c =
        S.L.head === 'light'
          ? '#fff6e0'
          : S.L.head === 'lion' || S.L.head === 'monkey' || S.L.head === 'elephant' || S.L.head === 'dragon'
            ? y > 1.62 || z < 0
              ? S.hair
              : S.skin
            : S.hair;
  } else if (y > 1.48 && ax < 0.11) c = S.skin;
  else if (ax > 0.115) {
    // brazos (pose T)
    if (ax < 0.27) c = S.style === 'bare' ? S.skin : S.style === 'armor' ? S.trim : S.robe;
    else if (ax > 0.66 && ax < 0.72) c = S.trim;
    else c = S.skin;
  } else if (y > 0.84) {
    // torso
    if (S.style === 'bare') {
      c = S.skin;
      if (y < 0.93) c = S.robe;
      if (Math.abs(x - (y - 1.18) * 0.55) < 0.03 && y > 0.95) c = S.trim;
    } else if (S.style === 'armor') {
      c = y > 1.0 ? S.trim : S.robe;
      if (y > 1.0 && Math.abs(x) < 0.02) c = shade(S.trim, -0.2);
    } else {
      c = S.robe;
      if (Math.abs(x + (y - 1.28) * 0.6) < 0.028 && y > 1.0) c = S.trim;
    }
    if (y > 0.86 && y < 0.9) c = shade(S.trim, -0.1);
  } else if (y > 0.5) {
    c = S.style === 'robe' ? S.robe : y > 0.62 ? S.robe : S.skin;
    if (y > 0.6 && y < 0.64 && S.style !== 'robe') c = S.trim;
  } else if (y > 0.1) {
    c = S.style === 'robe' && y > 0.32 ? S.robe : S.skin;
    if (S.style !== 'robe' && y < 0.32 && ((y * 40) | 0) % 3 === 0) c = '#5a3a22';
    if (S.style === 'armor' && y > 0.25) c = shade(S.trim, -0.15);
  } else c = '#6a4a2a';
  return joint ? shade(c, -0.12) : c;
}
const HUMAN = { src: null };
function humanSrc() {
  if (HUMAN.src) return HUMAN.src;
  const g = AS.g.u_man;
  if (!g) return null;
  HUMAN.src = g;
  return g;
}
function hClip(name) {
  const g = humanSrc();
  return g.animations.find((c) => c.name === name) || g.animations.find((c) => c.name === 'Idle_Loop');
}
function buildHumanCore(S, mats) {
  const g = humanSrc();
  const root = THREE.SkeletonUtils.clone(g.scene);
  const tc = new THREE.Color();
  let pi = 0;
  root.traverse((o) => {
    if (!o.isSkinnedMesh) return;
    const joint = pi++ > 0;
    o.geometry = o.geometry.clone();
    const geo = o.geometry;
    const pos = geo.attributes.position,
      n = pos.count,
      col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      tc.set(humanColor(pos.getX(i), pos.getY(i), pos.getZ(i), S, joint));
      col[i * 3] = tc.r;
      col[i * 3 + 1] = tc.g;
      col[i * 3 + 2] = tc.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, skinning: true });
    m.userData.em0 = new THREE.Color('#000000');
    mats.push(m);
    o.material = m;
    o.castShadow = true;
    o.frustumCulled = false;
  });
  root.scale.setScalar(HK);
  return root;
}
/* ropa, cara, tocados y arma pegados a los huesos */
function dressHuman(root, S, ctx, opts) {
  opts = opts || {};
  const { M, MB2, add, bx, cy, sp, piv } = ctx;
  const b = (n) => findBone(root, n);
  const L = S.L;
  const head = b('DEF-head'),
    hips = b('DEF-hips'),
    chest = b('DEF-spine003'),
    handR = b('DEF-handR'),
    armL = b('DEF-forearmL');
  // falda / túnica
  if (hips && S.style !== 'robe') {
    const len = S.style === 'bare' ? 0.3 : 0.36;
    const g = new THREE.CylinderGeometry(0.15, 0.205, len, 14, 1, true);
    const m = add(g, M(S.robe, { side: THREE.DoubleSide }), 0, -len / 2 + 0.04, 0.01, hips);
    m.scale.z = 0.85;
    const t = add(
      new THREE.CylinderGeometry(0.208, 0.21, 0.035, 14, 1, true),
      M(S.trim, { side: THREE.DoubleSide }),
      0,
      -len + 0.06,
      0.01,
      hips
    );
    t.scale.z = 0.85;
  }
  if (hips && S.style === 'robe') {
    const g = new THREE.CylinderGeometry(0.15, 0.27, 0.82, 16, 1, true);
    const m = add(g, M(S.robe, { side: THREE.DoubleSide }), 0, -0.37, 0.01, hips);
    m.scale.z = 0.82;
    const t = add(
      new THREE.CylinderGeometry(0.272, 0.275, 0.04, 16, 1, true),
      M(S.trim, { side: THREE.DoubleSide }),
      0,
      -0.76,
      0.01,
      hips
    );
    t.scale.z = 0.82;
  }
  if (hips) {
    const bt = add(new THREE.TorusGeometry(0.142, 0.018, 5, 16), M(S.trim), 0, 0.06, 0.0, hips, Math.PI / 2);
    bt.scale.y = 0.85;
  }
  if (chest && S.style === 'armor') {
    const p = add(
      new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      M(S.trim),
      0,
      0.02,
      0.0,
      chest,
      Math.PI
    );
    p.scale.set(1, 0.9, 0.8);
    for (const sx of [-1, 1]) {
      const sh = add(
        new THREE.SphereGeometry(0.09, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
        M(shade(S.trim, 0.1)),
        sx * 0.17,
        0.17,
        0,
        chest
      );
      sh.scale.set(1.1, 0.7, 1);
    }
  }
  if (chest && (L.ex === 'cape' || (S.style === 'robe' && S.id !== 'jesus' && opts.cape !== false && L.cc))) {
    const cp = piv(chest, 0, 0.2, -0.13);
    const g = new THREE.CylinderGeometry(0.2, 0.32, 0.95, 12, 1, true, Math.PI * 0.6, Math.PI * 0.8);
    add(g, M(L.cc || shade(S.robe, -0.2), { side: THREE.DoubleSide }), 0, -0.47, 0.05, cp).scale.z = 0.6;
    root.userData.cape = cp;
  }
  if (chest && L.ex === 'sash') {
    add(new THREE.TorusGeometry(0.19, 0.02, 4, 16), M('#e27aa8'), 0, 0.05, 0, chest, Math.PI / 2, 0, 0.6).scale.y = 0.7;
  }
  // cara
  if (head) {
    const hc = piv(head, 0, 0.115, 0.0);
    const eyeW = M('#ffffff'),
      eyeK = M('#1c1210');
    if (!L.head) {
      const iris = M(L.ey || (S.light ? '#c89a3a' : '#5a3a22')),
        hl = MB2('#ffffff'),
        lid = M(shade(S.skin, -0.12));
      for (const sx of [-1, 1]) {
        sp(0.0165, eyeW, sx * 0.034, 0.028, 0.097, hc, 1, 0.72, 0.55);
        sp(0.0098, iris, sx * 0.034, 0.027, 0.105, hc, 1, 1, 0.5);
        sp(0.0052, eyeK, sx * 0.034, 0.027, 0.1095, hc, 1, 1, 0.5);
        sp(0.0024, hl, sx * 0.034 + 0.004, 0.031, 0.1125, hc);
        bx(0.036, 0.006, 0.016, lid, sx * 0.034, 0.04, 0.1, hc, -0.3, 0, 0);
        bx(
          0.046,
          0.011,
          0.014,
          M(S.hs === 'bald' ? shade(S.skin, -0.35) : shade(S.hair, -0.1)),
          sx * 0.036,
          0.056,
          0.104,
          hc,
          0,
          0,
          sx * -0.14
        );
      }
      bx(0.02, 0.032, 0.03, M(shade(S.skin, -0.06)), 0, 0.005, 0.116, hc);
      bx(0.036, 0.007, 0.012, M(shade(S.skin, -0.45)), 0, -0.036, 0.104, hc);
      bx(0.03, 0.006, 0.01, M(shade('#c0605a', -0.05)), 0, -0.043, 0.103, hc);
      sp(0.022, M(shade(S.skin, -0.06)), -0.09, 0.01, 0, hc, 0.5, 1, 0.8);
      sp(0.022, M(shade(S.skin, -0.06)), 0.09, 0.01, 0, hc, 0.5, 1, 0.8);
      if (L.ex === 'eyepatch') {
        bx(0.05, 0.04, 0.01, M(INK), -0.034, 0.03, 0.118, hc);
      }
      if (S.b === 'full') {
        const bc = M(S.bc);
        sp(0.075, bc, 0, -0.045, 0.07, hc, 1, 0.85, 0.55);
        add(new THREE.ConeGeometry(0.055, 0.11, 10), bc, 0, -0.12, 0.075, hc, Math.PI);
        bx(0.06, 0.014, 0.02, bc, 0, -0.022, 0.112, hc);
      }
      if (S.b === 'short') {
        sp(0.06, M(S.bc), 0, -0.06, 0.07, hc, 1, 0.6, 0.5);
      }
      if (S.hs !== 'bald' && S.hs !== 'flame') {
        const cap = add(
          new THREE.SphereGeometry(0.118, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.36),
          M(S.hair),
          0,
          0.012,
          -0.03,
          hc
        );
        cap.scale.set(0.98, 1.08, 1.05);
        cap.rotation.x = -0.25;
        if (S.hs === 'long') {
          const lh = add(
            new THREE.CylinderGeometry(0.11, 0.13, 0.26, 14, 1, true, Math.PI * 0.55, Math.PI * 0.9),
            M(S.hair, { side: THREE.DoubleSide }),
            0,
            -0.1,
            -0.01,
            hc
          );
        }
      }
    }
    const hg = new THREE.Group();
    hc.add(hg);
    hg.position.y = 0.03;
    hg.scale.setScalar(0.112 / 6.2);
    hg.userData.bald = false;
    addHeadGear(
      Object.assign({}, L, { hs: L.head ? L.hs : S.hs === 'long' || S.hs === 'short' ? 'none' : S.hs }),
      hg,
      ctx,
      S.id
    );
    root.userData.headGear = hg;
  }
  // arma
  if (handR && !(L.held === 'none' || S.light) && opts.weapon !== false) {
    const hw = new THREE.Group();
    handR.add(hw);
    hw.scale.setScalar((1 / HK) * 0.8);
    root.userData.pendingHand = hw;
    buildHeld(L.held, L.hc || C.gold, S.id, hw, ctx);
  }
  if (armL && L.ex === 'shield') {
    const sg = piv(armL, 0.0, 0.16, 0.06);
    sg.scale.setScalar(1 / HK);
    cy(6, 6, 1, 16, M(shade(L.t, -0.1)), 0, 0, 0, sg, Math.PI / 2);
    cy(4.2, 4.2, 1.3, 14, M(L.t), 0, 0, 0.3, sg, Math.PI / 2);
    sp(1.6, M(C.gold), 0, 0, 0.9, sg);
  }
  if (chest && L.ex === 'multiarm') {
    const ag = piv(chest, 0, 0.12, -0.02);
    ag.scale.setScalar(1 / HK);
    for (const [sx, a] of [
      [-1, 0.9],
      [1, 0.9],
      [-1, 1.5],
      [1, 1.5],
    ]) {
      const p = piv(ag, sx * 6, 2, -1);
      p.rotation.z = sx * a;
      cy(1.3, 1.1, 13, 8, M(S.skin), 0, -6.5, 0, p);
      sp(1.5, M(S.skin), 0, -13.4, 0, p);
      add(new THREE.TorusGeometry(2.2, 0.5, 4, 12), MB2(C.gold), 0, -16, 0, p);
    }
  }
  if (chest && L.ex === 'drums') {
    const dg = piv(chest, 0, 0.1, -0.28);
    dg.scale.setScalar(1 / HK);
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (0.95 + (i / 7) * 1.1);
      cy(2.4, 2.4, 2, 12, M('#8a3a2a'), Math.cos(a) * 15, Math.sin(a) * 13, 0, dg, Math.PI / 2);
      cy(1.6, 1.6, 2.2, 12, M('#e8c86a'), Math.cos(a) * 15, Math.sin(a) * 13, 0.2, dg, Math.PI / 2);
    }
  }
  if (hips && (L.ex === 'tail' || S.id === 'wukong' || S.id === 'hanuman')) {
    let par = piv(hips, 0, -0.02, -0.12);
    root.userData.tail = par;
    for (let i = 0; i < 7; i++) {
      const s = piv(par, 0, 0, i ? -0.07 : 0);
      add(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), M(shade(S.hair, -0.1)), 0, 0, -0.035, s, Math.PI / 2);
      s.rotation.x = -0.25;
      par = s;
    }
  }
  if (S.light) {
    const gl = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex('#fff2c0'),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      })
    );
    gl.scale.set(4.5, 4.5, 1);
    gl.position.y = 1.1;
    root.add(gl);
  }
}
function fixHand(wrap) {
  const hw = wrap.userData.pendingHand || (wrap.children[0] && wrap.children[0].userData.pendingHand);
  if (!hw) return;
  wrap.updateMatrixWorld(true);
  const qh = new THREE.Quaternion();
  hw.parent.getWorldQuaternion(qh);
  const qw = new THREE.Quaternion();
  wrap.getWorldQuaternion(qw);
  hw.quaternion.copy(qh.invert().multiply(qw));
}
function buildGodH(id) {
  const S = humanSpec(id);
  const mats = [];
  const ctx = mkCtx(mats);
  const root = buildHumanCore(S, mats);
  dressHuman(root, S, ctx);
  const wrap = new THREE.Group();
  wrap.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const act = {};
  const caster = /orb|staff|disc|mirror|none/.test(S.L.held || '') || S.light;
  for (const [n, c] of [
    ['idle', 'Idle_Loop'],
    ['run', 'Jog_Fwd_Loop'],
    ['jump', 'Jump_Loop'],
    ['atk', caster ? 'Spell_Simple_Shoot' : 'Sword_Attack'],
    ['pow', 'Spell_Simple_Shoot'],
    ['die', 'Death01'],
    ['dead', 'Death01'],
    ['hit', 'Hit_Chest'],
    ['dash', 'Roll'],
    ['cheer', 'Dance_Loop'],
  ]) {
    const cl = hClip(c);
    if (cl) act[n] = mixer.clipAction(cl);
  }
  for (const n of ['atk', 'pow', 'die', 'dead', 'hit', 'dash']) {
    if (act[n]) {
      act[n].setLoop(THREE.LoopOnce, 1);
      act[n].clampWhenFinished = true;
    }
  }
  act.idle.play();
  mixer.update(0);
  root.userData.pendingHand && (wrap.userData.pendingHand = root.userData.pendingHand);
  fixHand(wrap);
  delete wrap.userData.pendingHand;
  wrap.userData = {
    kk: true,
    human: true,
    god: id,
    mixer,
    act,
    cur: 'idle',
    mats,
    yaw: 0,
    cape: root.userData.cape,
    tail: root.userData.tail,
    disp: () => {
      mats.forEach((m) => m.dispose());
      ctx.dispose();
      mixer.stopAllAction();
    },
  };
  return wrap;
}
/* jefes humanos grandes (Ares, Cronos, Minotauro...) */
const BHUMAN = {
  ares: {
    look: {
      s: '#d9a87a',
      h: '#3a2a1a',
      hs: 'short',
      b: 'short',
      bc: '#3a2a1a',
      r: '#8a2a1f',
      t: '#c9a15a',
      gear: 'helmet',
      gc: '#c9a15a',
      held: 'sword',
      hc: '#c8ccd8',
      ex: 'shield',
      cc: '#8a2a1f',
    },
    style: 'armor',
    k: 2.4,
  },
  minotauro: {
    look: {
      s: '#6a4a32',
      h: '#3a2a1a',
      hs: 'bald',
      r: '#5a3a22',
      t: '#8a6a3a',
      gear: 'horns',
      gc: '#e8e0cc',
      held: 'doubleaxe',
      hc: '#c8ccd8',
      head: 'lion',
    },
    style: 'bare',
    k: 2.6,
  },
  cronos: {
    look: {
      s: '#c8b8a8',
      h: '#e8e8e8',
      hs: 'long',
      b: 'full',
      bc: '#e8e8e8',
      r: '#4a4a5a',
      t: C.gold,
      gear: 'crown',
      held: 'staff',
      hc: '#8a8a9a',
      ex: 'cape',
      cc: '#2a2a3a',
    },
    style: 'robe',
    k: 2.7,
  },
  hrungnir: {
    look: {
      s: '#8a96a8',
      h: '#c8d8e8',
      hs: 'short',
      b: 'full',
      bc: '#c8d8e8',
      r: '#5a6a7a',
      t: '#9fe0ff',
      gear: 'horns',
      gc: '#9fe0ff',
      held: 'club',
      hc: '#7a8a9a',
    },
    style: 'bare',
    k: 2.8,
  },
  kumbhakarna: {
    look: { s: '#7a5a3a', h: '#1c1210', hs: 'long', r: '#c9a15a', t: C.gold, gear: 'crown', held: 'club', hc: C.gold },
    style: 'bare',
    k: 3,
  },
  zipacna: {
    look: {
      s: '#8a6a4a',
      h: '#1c1210',
      hs: 'long',
      r: '#3aa07a',
      t: C.gold,
      gear: 'feathers',
      gc: '#3aa07a',
      held: 'club',
      hc: '#6a4a2a',
    },
    style: 'bare',
    k: 2.8,
  },
  yanluo: {
    look: {
      s: '#c8a888',
      h: '#1c1210',
      hs: 'long',
      b: 'full',
      bc: '#1c1210',
      r: '#2a2a3a',
      t: C.blood,
      gear: 'hat',
      gc: '#1c1210',
      held: 'staff',
      hc: C.blood,
      ex: 'cape',
      cc: C.blood,
    },
    style: 'robe',
    k: 2.6,
  },
  arawn: {
    look: {
      s: '#b8c0c8',
      h: '#2a2a33',
      hs: 'long',
      r: '#2a3a4a',
      t: '#9ad0e8',
      gear: 'crown',
      gc: '#c8ccd8',
      held: 'sword',
      hc: '#9ad0e8',
      ex: 'cape',
      cc: '#1a2a3a',
    },
    style: 'armor',
    k: 2.6,
  },
  raktabija: {
    look: {
      s: '#7a1a1a',
      h: '#1c1210',
      hs: 'spiky',
      r: '#3a0a0a',
      t: C.gold,
      gear: 'horns',
      gc: '#e8e0cc',
      held: 'sword',
      hc: '#c8ccd8',
    },
    style: 'bare',
    k: 2.6,
  },
  kingu: {
    look: {
      s: '#6a8aa0',
      h: '#1c1210',
      hs: 'long',
      b: 'full',
      bc: '#1c1210',
      r: '#2f4f6a',
      t: C.gold,
      gear: 'crown',
      held: 'spear',
      hc: C.gold,
    },
    style: 'armor',
    k: 2.7,
  },
  coyolxauhqui: {
    look: {
      s: '#d8dce8',
      h: '#1c1210',
      hs: 'long',
      r: '#c8ccd8',
      t: '#e27aa8',
      gear: 'moon',
      held: 'disc',
      hc: '#e8eef8',
    },
    style: 'robe',
    k: 2.4,
  },
  pishtaco: {
    look: {
      s: '#e8d8c8',
      h: '#a89070',
      hs: 'short',
      b: 'short',
      bc: '#a89070',
      r: '#2a2a30',
      t: '#6a6a70',
      gear: 'hat',
      gc: '#2a2a30',
      held: 'machete',
      hc: '#c8ccd8',
    },
    style: 'robe',
    k: 2.4,
  },
  dullahan: {
    look: {
      s: '#2a2a2a',
      h: '#2a2a2a',
      hs: 'bald',
      r: '#2a2a2a',
      t: '#4a3a5a',
      held: 'sword',
      hc: '#9ad0e8',
      ex: 'cape',
      cc: '#1a1a20',
      head: 'light',
    },
    style: 'armor',
    k: 2.5,
  },
  medusa: {
    look: { s: '#8ab07a', h: '#3a8a3a', hs: 'long', r: '#3a6a3a', t: C.gold, held: 'bow', hc: '#6a4a2a' },
    style: 'robe',
    k: 2.3,
    snakes: true,
  },
};
function buildBossHuman(e) {
  const bh = BHUMAN[e.key];
  if (!bh || !AS.ready || !humanSrc()) return null;
  const L0 = Object.assign({}, bh.look);
  const S = {
    id: e.key,
    light: false,
    skin: L0.s,
    hair: L0.h,
    hs: L0.hs,
    b: L0.b,
    bc: L0.bc || L0.h,
    robe: L0.r,
    trim: L0.t,
    style: bh.style,
    L: Object.assign({}, L0, { head: L0.head === 'light' ? null : L0.head }),
  };
  if (e.corrupt) {
    S.skin = shade(S.skin, -0.3);
    S.robe = shade(S.robe, -0.3);
  }
  const mats = [];
  const ctx = mkCtx(mats);
  const root = buildHumanCore(S, mats);
  dressHuman(root, S, ctx, {});
  if (bh.snakes) {
    const hg = root.userData.headGear;
    const sn = new THREE.Group();
    hg.add(sn);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 6.283;
      const p = new THREE.Group();
      p.position.set(Math.cos(a) * 5.4, 3 + Math.sin(i * 1.7), Math.sin(a) * 5.4);
      p.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
      sn.add(p);
      ctx.cy(0.7, 0.45, 8, 6, ctx.M('#3a8a3a'), 0, 4, 0, p);
      ctx.sp(1, ctx.M('#4aa04a'), 0, 8.2, 0.4, p);
    }
  }
  const wrap = new THREE.Group();
  wrap.add(root);
  root.scale.setScalar((e.r * 2.4 * bh.k) / 1.83);
  const mixer = new THREE.AnimationMixer(root);
  const act = {
    run: mixer.clipAction(hClip('Jog_Fwd_Loop')),
    idle: mixer.clipAction(hClip('Sword_Idle')),
    atk: mixer.clipAction(hClip(/staff|disc|bow/.test(L0.held) ? 'Spell_Simple_Shoot' : 'Sword_Attack')),
  };
  act.atk.setLoop(THREE.LoopOnce, 1);
  act.atk.clampWhenFinished = true;
  act.run.play();
  mixer.update(0);
  wrap.userData.pendingHand = root.userData.pendingHand;
  fixHand(wrap);
  wrap.userData = {
    kkBoss: true,
    mixer,
    act,
    cur: 'run',
    mats,
    extra: [],
    yaw: 0,
    base: e.r * 2.4 * bh.k,
    disp: () => {
      mats.forEach((m) => m.dispose());
      ctx.dispose();
    },
  };
  return wrap;
}
/* enemigos humanoides horneados sobre el maniquí */
const EHUMAN = {
  spartoi: ['#d9cfb8', '#b8862f', 'helmet'],
  draugr: ['#9fb4c2', '#5a6a7a', 'horns'],
  esqueleto: ['#e0d8c0', '#3fb3b0', 'bald'],
  guerrero: ['#d9d0b8', '#3aa07a', 'feathers'],
  tzitzimitl: ['#e8e0cc', '#f2a22c', 'bald'],
  jiangshi: ['#7a8a9a', '#2a3a5a', 'hat'],
  ajogun: ['#3a2a3a', C.blood, 'horns'],
  girtablilu: ['#b8865a', '#6a4a2a', 'helmet'],
};
function bakeHuman(key) {
  const k = 'H|' + key;
  if (AS.bakes[k]) return AS.bakes[k];
  const eh = EHUMAN[key],
    d = ENEMIES[key];
  if (!eh || !humanSrc()) return null;
  const S = {
    id: key,
    light: false,
    skin: eh[0],
    hair: shade(eh[0], -0.3),
    hs: eh[2] === 'bald' ? 'bald' : 'short',
    robe: d.acc,
    trim: shade(d.acc, -0.25),
    style: 'tunic',
    L: { gear: eh[2] === 'bald' ? '' : eh[2], gc: eh[1], held: d.feat === 'spear' ? 'spear' : 'sword', hc: '#a8acb8' },
  };
  const mats = [];
  const ctx = mkCtx(mats);
  const root = buildHumanCore(S, mats);
  dressHuman(root, S, ctx, {});
  const wrap = new THREE.Group();
  wrap.add(root);
  const mixer = new THREE.AnimationMixer(root);
  mixer.clipAction(hClip('Idle_Loop')).play();
  mixer.update(0);
  wrap.userData.pendingHand = root.userData.pendingHand;
  fixHand(wrap);
  mixer.stopAllAction();
  const bk = bakeAnim(null, 'Jog_Fwd_Loop', 10, {
    root: wrap,
    clips: humanSrc().animations,
    vc: true,
    tag: key,
    dropFingers: true,
  });
  return (AS.bakes[k] = bk);
}
