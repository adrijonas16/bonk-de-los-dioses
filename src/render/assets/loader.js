/* Bonk de los Dioses · modelos 3D externos (KayKit, Quaternius, Khronos Fox — CC0 / CC-BY) */
const AS = { ready: false, failed: false, g: {}, prog: 0, props: {}, bakes: {}, recol: {}, boxes: {} };
const AS_FILES = [
  'u_man',
  'c_knight',
  'c_barbarian',
  'c_mage',
  'c_rogue',
  'c_rogue_hooded',
  's_warrior',
  's_minion',
  's_mage',
  's_rogue',
  'q_demon',
  'q_bluedemon',
  'q_dino',
  'q_cactoro',
  'q_mushroomking',
  'q_mushnub',
  'q_ghost',
  'q_hywirl',
  'fox',
  'p_hex',
  'p_hw',
  'p_dg',
];
function asLoad() {
  if (!THREE.GLTFLoader) {
    AS.failed = true;
    return Promise.resolve();
  }
  const L = new THREE.GLTFLoader();
  let done = 0;
  return Promise.all(
    AS_FILES.map(
      (k) =>
        new Promise((res) => {
          L.load(
            'assets/' + k + '.glb',
            (g) => {
              asFix(g.scene);
              AS.g[k] = g;
              done++;
              AS.prog = done / AS_FILES.length;
              res();
            },
            undefined,
            (err) => {
              console.warn('asset', k, err);
              done++;
              AS.prog = done / AS_FILES.length;
              res();
            }
          );
        })
    )
  ).then(() => {
    try {
      asPrepProps();
      AS.ready = !!(AS.g.c_knight && AS.g.c_mage);
      if (!AS.ready) AS.failed = true;
    } catch (err) {
      console.error(err);
      AS.failed = true;
    }
    if (typeof onAssetsReady === 'function') onAssetsReady();
  });
}
function asFix(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    o.castShadow = true;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    const nm = ms.map((m) => {
      if (m.map) {
        m.map.encoding = THREE.LinearEncoding;
        m.map.magFilter = THREE.NearestFilter;
        m.map.needsUpdate = true;
      }
      const l = new THREE.MeshLambertMaterial({
        map: m.map || null,
        color: m.color ? m.color.clone() : new THREE.Color('#ffffff'),
        skinning: !!o.isSkinnedMesh,
        vertexColors: !!(o.geometry && o.geometry.attributes.color && !m.map),
      });
      l.name = m.name;
      return l;
    });
    o.material = Array.isArray(o.material) ? nm : nm[0];
  });
}
