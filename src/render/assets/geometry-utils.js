/* ---------- utilidades de geometría ---------- */
function deint(attr) {
  if (!attr || !attr.isInterleavedBufferAttribute) return attr;
  const n = attr.count,
    k = attr.itemSize,
    a = new Float32Array(n * k);
  for (let i = 0; i < n; i++) {
    a[i * k] = attr.getX(i);
    if (k > 1) a[i * k + 1] = attr.getY(i);
    if (k > 2) a[i * k + 2] = attr.getZ(i);
    if (k > 3) a[i * k + 3] = attr.getW(i);
  }
  return new THREE.BufferAttribute(a, k, attr.normalized);
}
function cleanGeo(g) {
  for (const k of Object.keys(g.attributes)) g.setAttribute(k, deint(g.attributes[k]));
  const keep = ['position', 'normal', 'uv', 'color'];
  for (const k of Object.keys(g.attributes)) if (!keep.includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) {
    const n = g.attributes.position.count;
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (g.index) g = g.toNonIndexed();
  return g;
}
function mergeGeos(list) {
  const BGU = THREE.BufferGeometryUtils;
  return BGU.mergeBufferGeometries(list.map(cleanGeo), false);
}
function normGeo(g) {
  g.computeBoundingBox();
  const b = g.boundingBox;
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  g.computeBoundingBox();
  const s = g.boundingBox.getSize(new THREE.Vector3());
  return { h: s.y, w: Math.max(s.x, s.z) };
}
