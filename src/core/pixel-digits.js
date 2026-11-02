/* ---------- números pixel ---------- */
const DIG = {
  0: '111101101101111',
  1: '010110010010111',
  2: '111001111100111',
  3: '111001111001111',
  4: '101101111001001',
  5: '111100111001111',
  6: '111100111101111',
  7: '111001001001001',
  8: '111101111101111',
  9: '111101111001111',
  '+': '000010111010000',
};
function pixNum(g, str, x, y, col, k) {
  let ox = Math.round(x - ((str.length * 4 - 1) * k) / 2);
  y = Math.round(y);
  for (const ch of str) {
    const m = DIG[ch];
    if (m) {
      g.fillStyle = INK;
      for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(ox + (i % 3) * k + k, y + ((i / 3) | 0) * k + k, k, k);
      g.fillStyle = col;
      for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(ox + (i % 3) * k, y + ((i / 3) | 0) * k, k, k);
    }
    ox += 4 * k;
  }
}
