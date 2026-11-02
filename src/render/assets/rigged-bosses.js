/* ---------- jefes con esqueleto real ---------- */
const BMODEL = {
  lilith: [
    'c_mage',
    { primary: '#3a1838', cape: '#c82a6a', skin: '#e0c0d0', hair: '#1a0a1a' },
    2.7,
    { keep: /Cape|2H_Staff/, horns: '#2a0a1a' },
  ],
  ares: ['c_knight', { primary: '#c9a15a', metal: '#8a2a1f', trim: C.gold }, 2.6, { keep: /Helmet|Cape|^1H_Sword$/ }],
  minotauro: [
    'c_barbarian',
    { skin: '#6a4a32', hair: '#3a2a1a', primary: '#5a3a22' },
    2.8,
    { keep: /^2H_Axe$/, horns: '#e8e0cc' },
  ],
  cronos: [
    'c_mage',
    { primary: '#4a4a5a', skin: '#c8b8a8', hair: '#e8e8e8', cape: '#2a2a3a' },
    2.9,
    { keep: /Cape|2H_Staff/, crown: C.gold },
  ],
  hrungnir: [
    'c_barbarian',
    { skin: '#8a96a8', primary: '#5a6a7a', hair: '#c8d8e8' },
    3,
    { keep: /^2H_Axe$/, horns: '#9fe0ff' },
  ],
  kumbhakarna: [
    'c_barbarian',
    { skin: '#7a5a3a', primary: '#c9a15a', hair: '#1c1210' },
    3.1,
    { keep: /^2H_Axe$/, crown: C.gold },
  ],
  zipacna: ['c_barbarian', { skin: '#8a6a4a', primary: '#3aa07a' }, 3, {}],
  yanluo: [
    'c_mage',
    { primary: '#2a2a3a', cape: C.blood, skin: '#c8a888', hair: '#1c1210' },
    2.7,
    { keep: /Cape/, crown: C.gold },
  ],
  arawn: [
    'c_knight',
    { metal: '#2a3a4a', primary: '#9ad0e8', trim: '#c8ccd8' },
    2.7,
    { keep: /Helmet|Cape|^2H_Sword$/ },
  ],
  raktabija: ['c_barbarian', { skin: '#7a1a1a', primary: '#3a0a0a', hair: '#1c1210' }, 2.8, { horns: '#e8e0cc' }],
  kingu: ['c_knight', { metal: '#2f4f6a', primary: C.gold }, 2.8, { keep: /Helmet|Cape|^1H_Sword$/ }],
  coyolxauhqui: ['c_rogue', { skin: '#d8dce8', primary: '#c8ccd8', hair: '#1c1210' }, 2.5, { crown: '#e27aa8' }],
  pishtaco: ['c_rogue_hooded', { primary: '#2a2a30', skin: '#e8d8c8' }, 2.6, { keep: /^Knife$/ }],
  dullahan: ['c_knight', { metal: '#2a2a2a', primary: '#4a3a5a' }, 2.6, { keep: /Cape|^2H_Sword$/, headless: true }],
  humbaba: ['q_demon', { tint: '#8ab060' }, 2.6],
  toro: ['q_demon', { tint: '#606060' }, 2.7, { horns: '#e8e0cc' }],
  abadon: ['q_demon', { tint: '#c04020' }, 3.1],
  surtr: ['q_demon', { tint: '#ff8a3a' }, 3.3],
  shuten: ['q_demon', { tint: '#ff6a5a' }, 3],
  set: ['q_bluedemon', { tint: '#c06050' }, 3],
  supayrey: ['q_demon', { tint: '#c0a060' }, 3],
  mahishasura: ['q_bluedemon', { tint: '#505060' }, 2.8, { horns: '#e8e0cc' }],
  balor: ['q_bluedemon', { tint: '#6a8a6a' }, 3.2],
  arun: ['q_mushroomking', { tint: '#b0d080' }, 2.6],
  hecatonquiros: ['q_bluedemon', { tint: '#c09070' }, 3.4, { arms: true }],
  gashadokuro: ['s_warrior', { tint: '#ffffff' }, 3.4],
  mictlantecuhtli: ['s_mage', { tint: '#fff0c0' }, 2.8],
  senores: ['s_rogue', { tint: '#e0f0f0' }, 3],
  iku: ['s_mage', { tint: '#606070' }, 3.1],
  baigujing: ['s_rogue', { tint: '#ffd0e8' }, 2.6],
  ahpuch: ['s_warrior', { tint: '#d0f0e0' }, 3.1],
  medusa: ['c_rogue', { skin: '#8ab07a', primary: '#3a6a3a', hair: '#3a8a3a' }, 2.4, { snakes: true }],
  cerbero: ['fox', { tint: '#3a3438' }, 1.1, { heads: 3 }],
  quimera: ['fox', { tint: '#ffb060' }, 1.05, { heads: 3 }],
  garm: ['fox', { tint: '#8a4040' }, 1.0],
  fenrir: ['fox', { tint: '#9aa4b0' }, 1.3],
  cathpalug: ['fox', { tint: '#404048' }, 1.0],
  ccoa: ['fox', { tint: '#d0d8e0' }, 1.0],
  nian: ['fox', { tint: '#ff7060' }, 1.05],
  aroni: ['fox', { tint: '#a08050' }, 0.95],
  esfinge: ['fox', { tint: '#e8c070' }, 1.05],
  twrch: ['q_dino', { tint: '#8a7a70' }, 2.4],
  ushioni: ['q_dino', { tint: '#505058' }, 2.5],
  ammit: ['q_dino', { tint: '#a0c070' }, 2.3],
  cipactli: ['q_dino', { tint: '#80a070' }, 2.4],
  tlaltecuhtli: ['q_dino', { tint: '#a06050' }, 2.9],
  sobek: ['q_dino', { tint: '#70a060' }, 2.4],
  behemot: ['q_dino', { tint: '#a080c0' }, 3],
  nidhogg: ['q_hywirl', { tint: '#80a060' }, 2.4],
  lamashtu: ['q_ghost', { tint: '#c08090' }, 2.2],
  nue: ['q_hywirl', { tint: '#c0a060' }, 2.2],
  itzpapalotl: ['q_ghost', { tint: '#806090' }, 2.6],
  camazotz: ['q_ghost', { tint: '#a05050' }, 2.3],
  vucub: ['q_hywirl', { tint: '#ff7050' }, 2.3],
  ofo: ['q_ghost', { tint: '#9090c0' }, 2.2],
  pazuzu: ['q_ghost', { tint: '#c0b060' }, 2.3],
  aje: ['q_hywirl', { tint: '#604060' }, 2.7],
  ziz: ['q_hywirl', { tint: '#ffffff' }, 2.4],
};
function buildBossKK(e) {
  const hb = typeof buildBossHuman === 'function' && buildBossHuman(e);
  if (hb) return hb;
  const bm = BMODEL[e.key];
  if (!bm || !AS.ready || !AS.g[bm[0]]) return null;
  const [file, col, hk, o] = bm;
  const opt = o || {};
  const g = AS.g[file];
  const mats = [];
  const make = () => {
    const r = THREE.SkeletonUtils.clone(g.scene);
    r.traverse((x) => {
      if (!x.isMesh) return;
      if (file.startsWith('c_')) {
        if (KK_HIDE.test(x.name) && !(opt.keep && opt.keep.test(x.name))) {
          x.visible = false;
          return;
        }
        if (opt.headless && /_Head/.test(x.name)) {
          x.visible = false;
          return;
        }
        const pal = Object.assign(
          {
            skin: C.skin,
            hair: INK,
            primary: '#888',
            primaryD: '#666',
            trim: C.gold,
            cape: '#444',
            leather: '#7a5234',
            leatherD: '#5a3a24',
            metal: '#9aa4ae',
            dark: '#3a3438',
            accent: C.gold,
          },
          col
        );
        if (!col.primaryD) pal.primaryD = shade(pal.primary, -0.25);
        const m = x.material.clone();
        m.map = kkTexture(file, pal);
        mats.push(m);
        x.material = m;
      } else {
        const m = (Array.isArray(x.material) ? x.material[0] : x.material).clone();
        if (file === 'fox' && m.map) m.map = grayTex(m.map);
        if (col.tint) m.color.set(col.tint);
        if (e.corrupt) m.color.multiplyScalar(0.6);
        mats.push(m);
        x.material = m;
      }
      x.castShadow = true;
      x.frustumCulled = false;
    });
    return r;
  };
  const root = make();
  const wrap = new THREE.Group();
  wrap.add(root);
  const H = skinH(root);
  const base = e.r * 2.4 * hk;
  const k = base / H;
  root.scale.setScalar(k);
  const fox = file === 'fox';
  if (fox) root.rotation.y = -Math.PI / 2;
  const clips = g.animations.length ? g.animations : AS.g.c_knight.animations;
  const mixer = new THREE.AnimationMixer(root);
  const pick2 = (...ns) => {
    for (const n of ns) {
      const c = clips.find((c) => c.name === n);
      if (c) return c;
    }
    return clips[0];
  };
  const act = {
    run: mixer.clipAction(pick2('Running_A', 'Run', 'Fast_Flying', 'Walk')),
    idle: mixer.clipAction(pick2('Idle', 'Survey', 'Flying_Idle')),
    atk: mixer.clipAction(
      pick2('2H_Melee_Attack_Chop', '1H_Melee_Attack_Chop', 'Punch', 'Headbutt', 'Bite_Front', 'Weapon', 'Run')
    ),
  };
  act.atk.setLoop(THREE.LoopOnce, 1);
  act.atk.clampWhenFinished = true;
  act.run.play();
  const extra = [];
  if (opt.heads > 1) {
    for (const sx of [-1, 1]) {
      const h2 = make();
      root.parent.add(h2);
      h2.scale.setScalar(k * 0.92);
      h2.position.set(sx * base * 0.16, 0, -base * 0.05);
      h2.rotation.y = sx * 0.42 + (fox ? -Math.PI / 2 : 0);
      extra.push(h2);
      const m2 = new THREE.AnimationMixer(h2);
      m2.clipAction(act.run.getClip()).play();
      h2.userData.mixer = m2;
      h2.userData.side = sx;
    }
    const pl = [];
    for (const m of mats) {
      m.clippingPlanes = null;
    }
  }
  const ctx = mkCtx(mats);
  const headB = findBone(root, 'head') || findBone(root, 'Head');
  if (headB && (opt.horns || opt.crown || opt.snakes)) {
    const hg = new THREE.Group();
    headB.add(hg);
    hg.scale.setScalar((1 / k) * 1.3 * (base / 90));
    hg.position.set(0, file.startsWith('c_') ? 0.36 : 0.3, 0);
    if (opt.horns)
      for (const sx of [-1, 1]) {
        ctx.add(new THREE.ConeGeometry(1.6, 9, 6), ctx.M(opt.horns), sx * 6, 6, 0, hg, 0, 0, sx * -0.9);
      }
    if (opt.crown) {
      ctx.add(
        new THREE.CylinderGeometry(6.2, 6, 2.6, 16, 1, true),
        ctx.M(opt.crown, { side: THREE.DoubleSide }),
        0,
        5,
        0,
        hg
      );
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        ctx.add(new THREE.ConeGeometry(1, 3.4, 4), ctx.M(opt.crown), Math.cos(a) * 6, 7.6, Math.sin(a) * 6, hg);
      }
    }
    if (opt.snakes) {
      const sn = new THREE.Group();
      hg.add(sn);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 6.283;
        const p = new THREE.Group();
        p.position.set(Math.cos(a) * 5, 3, Math.sin(a) * 5);
        p.rotation.set(Math.sin(a) * 1, 0, -Math.cos(a) * 1);
        sn.add(p);
        ctx.cy(0.8, 0.5, 8, 6, ctx.M('#3a8a3a'), 0, 4, 0, p);
        ctx.sp(1.1, ctx.M('#4aa04a'), 0, 8.4, 0.4, p);
      }
      hg.userData.snakes = sn;
    }
  }
  if (opt.arms) {
    const ch = findBone(root, 'Torso') || findBone(root, 'Body') || root;
    const ag = new THREE.Group();
    ch.add(ag);
    ag.scale.setScalar((1 / k) * (base / 40));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 6.283;
      const p = new THREE.Group();
      p.position.set(Math.cos(a) * 8, 10 + Math.sin(i * 2.1) * 3, Math.sin(a) * 4);
      p.rotation.z = Math.cos(a) * 1.3;
      p.rotation.x = Math.sin(a) * 0.6;
      ag.add(p);
      ctx.cy(1.8, 1.4, 14, 7, ctx.M('#a07a60'), 0, 7, 0, p);
      ctx.sp(2.2, ctx.M('#b08a70'), 0, 14.6, 0, p);
      p.userData.i = i;
    }
    wrap.userData.arms = ag;
  }
  wrap.userData = {
    kkBoss: true,
    mixer,
    act,
    cur: 'run',
    mats,
    extra,
    yaw: 0,
    arms: wrap.userData.arms,
    base,
    disp: () => {
      mats.forEach((m) => m.dispose());
      ctx.dispose();
    },
  };
  return wrap;
}
function animBossKK(m, e, dt) {
  const u = m.userData;
  const yaw = enemyYaw(e, dt);
  m.rotation.y = yaw;
  let by = e.z;
  const bm = BMODEL[e.key];
  if (bm && /hywirl|ghost/.test(bm[0])) by += 10 + Math.sin(T * 2) * 5;
  m.position.set(e.x, by, e.y);
  const mv = e._mv > 0.2;
  const want = mv ? 'run' : 'idle';
  if (want !== u.cur && !u.atkOn) {
    u.act[want].reset().play();
    u.act[u.cur].crossFadeTo(u.act[want], 0.25, false);
    u.cur = want;
  }
  if ((e.charge > 0 || e.pc < 0.3) && !u.atkOn) {
    u.atkOn = true;
    u.act.atk.reset().play();
    u.act.atk.setEffectiveWeight(1);
  }
  if (u.atkOn && !u.act.atk.isRunning()) {
    u.atkOn = false;
    u.act.atk.stop();
  }
  u.mixer.update(dt);
  for (const x of u.extra) {
    x.userData.mixer.update(dt);
  }
  if (u.arms)
    u.arms.children.forEach((p, i) => {
      p.rotation.x = Math.sin(T * 3 + i * 1.3) * 0.6;
    });
  const fl = e.flash > 0;
  if (u.fl !== fl) {
    u.fl = fl;
    for (const mm of u.mats) if (mm.emissive && !mm.userData.basic) mm.emissive.set(fl ? '#ffffff' : '#000000');
  }
}
/* las cabezas laterales de Cerbero: recortamos el cuerpo con planos de corte */
const _cp = new THREE.Vector3(),
  _cn = new THREE.Vector3();
function updBossClip(m) {
  const u = m.userData;
  if (!u.extra || !u.extra.length) return;
  for (const x of u.extra) {
    if (!x.userData.plane) {
      x.userData.plane = new THREE.Plane();
      x.traverse((o) => {
        if (o.isMesh) {
          o.material = o.material.clone();
          o.material.clippingPlanes = [x.userData.plane];
          o.material.clipShadows = true;
          u.mats.push(o.material);
        }
      });
    }
    x.updateMatrixWorld(true);
    _cn.set(0, 0, 1).transformDirection(x.matrixWorld);
    _cp.set(0, 0, u.base * 0.12).applyMatrix4(m.matrixWorld);
    x.userData.plane.setFromNormalAndCoplanarPoint(_cn, _cp);
  }
}
