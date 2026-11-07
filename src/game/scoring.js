/* ---------- puntuación ---------- */
// Puntos = base × combo × etapa (reino u oleada) × dificultad. Ver docs/ARQUITECTURA.md.
const SC_DIFF = { normal: 1, dificil: 1.5, pesadilla: 2.5 };
function comboMul() {
  return 1 + Math.min(9, Math.floor((G.combo || 0) / 20) * 0.5);
}
function stageMul() {
  return G.mode === 'libre' ? 1 + 0.5 * ((G.wave || 1) - 1) : 1 + 0.5 * G.ridx;
}
function scoreMul() {
  return comboMul() * stageMul() * (SC_DIFF[G.diffKey] || 1);
}
function addScore(base) {
  if (!G) return;
  G.score = (G.score || 0) + base * scoreMul();
}
