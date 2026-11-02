/* ---------- concilios ---------- */
function computeConc() {
  const count = {};
  for (const p of players) {
    if (p.g.tag) count[p.g.tag] = (count[p.g.tag] || 0) + 1;
    for (const k in p.passives) {
      const t = PASSIVES[k].tag;
      if (t) count[t] = (count[t] || 0) + 1;
    }
  }
  G.concFavor = null;
  if (G.qfx && G.qfx.favor) {
    const t = G.qfx.favor.tag || 'trueno';
    count[t] = (count[t] || 0) + 1;
    G.concFavor = t;
  }
  const before = G.conc;
  G.conc = {};
  for (const t in count) if (count[t] >= 3) G.conc[t] = true;
  for (const t in G.conc) if (!before[t]) banner(CONCILIOS[t].name.toUpperCase() + ' ACTIVO');
  G.concCount = count;
  renderConc();
}
