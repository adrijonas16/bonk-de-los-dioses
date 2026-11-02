/* ---------- enemigos "horneados": animación esquelética → fotogramas instanciados ---------- */
function bakeAnim(file, clipName, frames, opts) {
  const key = (file || 'root') + '|' + clipName + '|' + ((opts && opts.tag) || '');
  if (AS.bakes[key]) return AS.bakes[key];
  const g = file ? AS.g[file] : null;
  opts = opts || {};
  if (!g && !opts.root) return null;
  const root = opts.root || THREE.SkeletonUtils.clone(g.scene);
  root.updateMatrixWorld(true);
  const clips = opts.clips || (g.animations.length ? g.animations : AS.g.c_knight.animations);
  let clip = clips.find((c) => c.name === clipName) || clips.find((c) => /Run|Walk|Fly/.test(c.name)) || clips[0];
  const mixer = new THREE.AnimationMixer(root);
  if (clip) mixer.clipAction(clip).play();
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && o.visible && !(opts.hide && opts.hide.test(o.name))) meshes.push(o);
  });
  const out = [];
  let mat = null,
    norm = null;
  const v = new THREE.Vector3();
  const F = clip ? frames : 1;
  for (let f = 0; f < F; f++) {
    if (clip) {
      mixer.setTime((clip.duration * f) / F);
    }
    root.updateMatrixWorld(true);
    const parts = [];
    for (const m of meshes) {
      const src = m.geometry;
      const pos = deint(src.attributes.position),
        n = pos.count;
      const arr = new Float32Array(n * 3);
      if (m.isSkinnedMesh) {
        m.skeleton.update();
        for (let i = 0; i < n; i++) {
          v.fromBufferAttribute(pos, i);
          m.boneTransform(i, v);
          v.applyMatrix4(m.matrixWorld);
          arr[i * 3] = v.x;
          arr[i * 3 + 1] = v.y;
          arr[i * 3 + 2] = v.z;
        }
      } else {
        for (let i = 0; i < n; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
          arr[i * 3] = v.x;
          arr[i * 3 + 1] = v.y;
          arr[i * 3 + 2] = v.z;
        }
      }
      const gg = new THREE.BufferGeometry();
      gg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      if (src.attributes.uv) gg.setAttribute('uv', deint(src.attributes.uv).clone());
      if (src.index) {
        let idx = src.index;
        if (opts.dropFingers && m.isSkinnedMesh) {
          if (!m.userData.fidx) {
            const ji = src.attributes.skinIndex,
              w = src.attributes.skinWeight,
              bones = m.skeleton.bones,
              bad = new Uint8Array(n);
            for (let i = 0; i < n; i++) {
              let bj = 0,
                bw = -1;
              const ws4 = [w.getX(i), w.getY(i), w.getZ(i), w.getW(i)],
                js4 = [ji.getX(i), ji.getY(i), ji.getZ(i), ji.getW(i)];
              for (let c = 0; c < 4; c++) {
                if (ws4[c] > bw) {
                  bw = ws4[c];
                  bj = js4[c];
                }
              }
              bad[i] = /f_|thumb/.test(bones[bj].name) ? 1 : 0;
            }
            const src2 = idx.array,
              keep = [];
            for (let t = 0; t < src2.length; t += 3) {
              if (bad[src2[t]] && bad[src2[t + 1]] && bad[src2[t + 2]]) continue;
              keep.push(src2[t], src2[t + 1], src2[t + 2]);
            }
            m.userData.fidx = new THREE.BufferAttribute(new Uint32Array(keep), 1);
          }
          idx = m.userData.fidx;
        }
        gg.setIndex(idx.clone());
      }
      if (opts.vc) {
        let ca = src.attributes.color ? deint(src.attributes.color).clone() : null;
        if (!ca) {
          const mc = (Array.isArray(m.material) ? m.material[0] : m.material).color || new THREE.Color('#ffffff');
          const a = new Float32Array(n * 3);
          for (let i = 0; i < n; i++) {
            a[i * 3] = mc.r;
            a[i * 3 + 1] = mc.g;
            a[i * 3 + 2] = mc.b;
          }
          ca = new THREE.BufferAttribute(a, 3);
        }
        gg.setAttribute('color', ca);
      }
      parts.push(gg);
      mat = mat || (Array.isArray(m.material) ? m.material[0] : m.material);
    }
    const geo = mergeGeos(parts);
    geo.computeVertexNormals();
    if (!norm) {
      geo.computeBoundingBox();
      const b = geo.boundingBox;
      norm = { cx: (b.min.x + b.max.x) / 2, cz: (b.min.z + b.max.z) / 2, y0: b.min.y, h: b.max.y - b.min.y };
    }
    geo.translate(-norm.cx, -norm.y0, -norm.cz);
    const s = 1 / norm.h;
    geo.scale(s, s, s);
    if (opts.rotY) geo.rotateY(opts.rotY);
    out.push(geo);
  }
  const m = opts.vc
    ? new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#141414' })
    : new THREE.MeshLambertMaterial({
        map: mat && mat.map ? (opts.gray ? grayTex(mat.map) : mat.map) : null,
        color: mat && mat.map ? '#ffffff' : mat ? mat.color : '#ffffff',
        emissive: '#1e1e1e',
      });
  if (opts.extra) opts.extra(out);
  return (AS.bakes[key] = { frames: out, mat: m });
}

/* qué modelo usa cada enemigo */
const EMODEL = {
  spartoi: ['s_warrior', 'Running_A', 1.1, '#e8dcc0'],
  draugr: ['s_warrior', 'Running_A', 1.15, '#a8c0d0'],
  esqueleto: ['s_minion', 'Running_A', 1, '#ffffff'],
  guerrero: ['s_warrior', 'Running_A', 1.05, '#e0f0e0'],
  tzitzimitl: ['s_mage', 'Running_A', 1.05, '#fff0d0'],
  jiangshi: ['s_rogue', 'Running_A', 1, '#c8d8e8'],
  supay: ['q_demon', 'Run', 1.1, '#ffffff'],
  oni: ['q_demon', 'Run', 1.2, '#ff9a8a'],
  rakshasa: ['q_bluedemon', 'Run', 1.15, '#e8a0ff'],
  ajogun: ['s_warrior', 'Running_A', 1.05, '#8a7a8a'],
  demonio: ['q_demon', 'Run', 1.1, '#ffffff'],
  girtablilu: ['q_cactoro', 'Run', 1.1, '#e8c090'],
  harpia: ['q_hywirl', 'Fast_Flying', 1, '#e8b0a0'],
  tengu: ['q_hywirl', 'Fast_Flying', 1, '#ff8a6a'],
  murcielago: ['q_ghost', 'Fast_Flying', 1, '#c08080'],
  buho: ['q_hywirl', 'Fast_Flying', 1, '#d8c0a0'],
  almapena: ['q_ghost', 'Fast_Flying', 1, '#e0f0ff'],
  sluagh: ['q_ghost', 'Fast_Flying', 1, '#a0b0c0'],
  caido: ['q_ghost', 'Fast_Flying', 1, '#ffffff'],
  langosta: ['q_hywirl', 'Fast_Flying', 0.9, '#c0e080'],
  empusa: ['q_ghost', 'Fast_Flying', 1, '#ff8a8a'],
  sincorazon: ['q_ghost', 'Fast_Flying', 1, '#e0d0a0'],
  galla: ['q_mushnub', 'Walk', 1, '#d0a070'],
  kappa: ['q_mushnub', 'Walk', 1, '#80d080'],
  onryo: ['q_ghost', 'Fast_Flying', 1, '#ffffff'],
  condenado: ['q_ghost', 'Fast_Flying', 1, '#c0d0ff'],
  ajogunsombra: ['q_ghost', 'Fast_Flying', 1, '#707070'],
  banshee: ['q_ghost', 'Fast_Flying', 1, '#e0f0ff'],
  ciclope: ['q_bluedemon', 'Run', 1.35, '#ffd0a0'],
  gigante: ['q_bluedemon', 'Run', 1.4, '#c0e0ff'],
  asura: ['q_bluedemon', 'Run', 1.3, '#ffa0a0'],
  fomoriano: ['q_mushroomking', 'Run', 1.35, '#a0b0c0'],
  huargo: ['fox', 'Run', 0.61, '#8a9098'],
  chacal: ['fox', 'Run', 0.55, '#e8c890'],
  mushhushshu: ['q_dino', 'Run', 1.15, '#a0c0ff'],
  yaoguai: ['q_dino', 'Run', 1.1, '#c0a0e0'],
  hulijing: ['fox', 'Run', 0.55, '#ffffff'],
  ahuizotl: ['fox', 'Run', 0.55, '#6080a0'],
  ajogunbestia: ['q_dino', 'Run', 1.1, '#d0a080'],
  escorpion: ['q_cactoro', 'Run', 1, '#e8a070'],
  naga: ['q_dino', 'Run', 1.1, '#80c0a0'],
  atoq: ['fox', 'Run', 0.8, '#e09a50'],
  apu: ['q_bluedemon', 'Run', 1.0, '#b8b0a0'],
};
const ENI2 = {};
function eni2For(key) {
  if (key in ENI2) return ENI2[key];
  try {
    return eni2ForX(key);
  } catch (err) {
    console.warn('eni2', key, err);
    return (ENI2[key] = null);
  }
}
function eni2ForX(key) {
  let em = EMODEL[key];
  let bk = null;
  if (AS.ready && EHUMAN[key] && humanSrc()) {
    bk = bakeHuman(key);
    if (bk) em = ['u_man', 'Jog', 1.15, '#ffffff'];
  }
  if (!bk) {
    if (!em || !AS.ready || !AS.g[em[0]]) {
      return (ENI2[key] = null);
    }
    const fox = em[0] === 'fox';
    bk = bakeAnim(em[0], em[1], 10, { rotY: fox ? -Math.PI / 2 : 0, gray: fox });
  }
  if (!bk) return (ENI2[key] = null);
  const cap = 320,
    list = bk.frames.map((geo) => {
      const im = new THREE.InstancedMesh(geo, bk.mat, cap);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      im.castShadow = false;
      for (let i = 0; i < cap; i++) im.setColorAt(i, tmpC.set('#ffffff'));
      im.count = 0;
      scene.add(im);
      return { im, n: 0 };
    });
  return (ENI2[key] = { list, tint: new THREE.Color(em[3]), hk: em[2], flyer: /Fly/.test(em[1]) });
}
function eni2Begin() {
  for (const k in ENI2) {
    const E = ENI2[k];
    if (E) E.list.forEach((L) => (L.n = 0));
  }
}
function eni2End() {
  for (const k in ENI2) {
    const E = ENI2[k];
    if (!E) continue;
    for (const L of E.list) {
      L.im.count = L.n;
      L.im.instanceMatrix.needsUpdate = true;
      if (L.im.instanceColor) L.im.instanceColor.needsUpdate = true;
    }
  }
}
const _p5 = new THREE.Vector3(),
  _q5 = new THREE.Quaternion(),
  _s5 = new THREE.Vector3(),
  _m5 = new THREE.Matrix4(),
  _up5 = new THREE.Vector3(0, 1, 0),
  _c5 = new THREE.Color();
function eni2Draw(e, dt) {
  const E = eni2For(e.key);
  if (!E) return false;
  const yaw = enemyYaw(e, dt);
  const F = E.list.length;
  const f = Math.floor((T * (E.flyer ? 1.2 : 1.6) + e.ph) * F) % F;
  const L = E.list[(f + F) % F];
  if (L.n >= 320) return true;
  const h = e.r * 2.6 * E.hk;
  let by = e.z;
  if (E.flyer) by += 8 + Math.sin(T * 3 + e.ph) * 4;
  _q5.setFromAxisAngle(_up5, yaw);
  _m5.compose(_p5.set(e.x, by, e.y), _q5, _s5.set(h, h, h));
  L.im.setMatrixAt(L.n, _m5);
  L.im.setColorAt(
    L.n,
    e.flash > 0 ? _c5.set('#ffffff').multiplyScalar(2.2) : e.elite ? _c5.copy(E.tint).lerp(EL_GOLD, 0.35) : E.tint
  );
  L.n++;
  return true;
}

function skinH(root) {
  root.updateMatrixWorld(true);
  let lo = 1e9,
    hi = -1e9;
  const v = new THREE.Vector3();
  root.traverse((m) => {
    if (!m.isMesh || !m.visible) return;
    const pos = m.geometry.attributes.position;
    const st = Math.max(1, Math.floor(pos.count / 300));
    for (let i = 0; i < pos.count; i += st) {
      v.fromBufferAttribute(pos, i);
      if (m.isSkinnedMesh) {
        m.skeleton.update();
        m.boneTransform(i, v);
      }
      v.applyMatrix4(m.matrixWorld);
      lo = Math.min(lo, v.y);
      hi = Math.max(hi, v.y);
    }
  });
  return hi - lo || 1;
}
