/* ---------- decorados estáticos (por paquete) ---------- */
function asPrepProps() {
  for (const pk of ['p_hex', 'p_hw', 'p_dg']) {
    const g = AS.g[pk];
    if (!g) continue;
    g.scene.updateMatrixWorld(true);
    for (const node of g.scene.children) {
      const inv = new THREE.Matrix4().copy(node.matrixWorld).invert();
      const list = [];
      let mat = null;
      node.traverse((o) => {
        if (o.isMesh) {
          const gg = o.geometry.clone();
          gg.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
          list.push(gg);
          mat = mat || o.material;
        }
      });
      if (!list.length) continue;
      const geo = mergeGeos(list);
      const sz = normGeo(geo);
      const m = mat.clone();
      m.vertexColors = false;
      m.emissive = new THREE.Color('#000000');
      AS.props[node.name] = { geo, mat: m, h: sz.h, w: sz.w };
    }
  }
}
function propAsset(name) {
  return AS.ready ? AS.props[name] : null;
}
