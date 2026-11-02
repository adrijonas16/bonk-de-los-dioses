/* ---------- mapa grande (tecla M, botón MAPA o tocando el minimapa) ---------- */
// Dibuja el reino visto desde arriba con todo lo que hay: cofres, altares, santuarios, mercaderes,
// encargos, jefes, portales y jugadores. Mientras está abierto la partida se pausa (salvo online).
const MAPIMG = { rk: null, c: null };
function worldMapImage() {
  if (MAPIMG.rk === WORLD.rk && MAPIMG.c) return MAPIMG.c;
  const N = 220,
    c = mkCanvas(N, N),
    g = c.getContext('2d'),
    img = g.createImageData(N, N),
    rk = WORLD.rk;
  const H = new Float32Array(N * N);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N) * 2 * ARENA - ARENA,
        y = ((j + 0.5) / N) * 2 * ARENA - ARENA;
      H[j * N + i] = groundAt(x, y);
    }
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N) * 2 * ARENA - ARENA,
        y = ((j + 0.5) / N) * 2 * ARENA - ARENA,
        o = (j * N + i) * 4;
      if (Math.hypot(x, y) > ARENA) {
        img.data[o + 3] = 0;
        continue;
      }
      const h = H[j * N + i],
        hz = hazardAt(x, y);
      let col;
      if (hz) col = new THREE.Color(hz.k === 'lava' ? '#ff6a1a' : hz.k === 'void' ? '#2a1040' : '#2f7fd0');
      else col = terrainColor(rk, x / WS, y / WS, h / WS, slopeAt(x, y)).clone();
      // sombreado por relieve: la luz viene del noroeste
      const hl = H[j * N + Math.max(0, i - 1)],
        hu = H[Math.max(0, j - 1) * N + i];
      const sh = Math.max(-0.35, Math.min(0.35, (h - hl + (h - hu)) * 0.012));
      col.offsetHSL(0, 0, sh);
      img.data[o] = col.r * 255;
      img.data[o + 1] = col.g * 255;
      img.data[o + 2] = col.b * 255;
      img.data[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  MAPIMG.rk = rk;
  MAPIMG.c = c;
  return c;
}
function toggleWorldMap(open) {
  if (!G || (state !== 'play' && !G.mapOpen)) return;
  G.mapOpen = open === undefined ? !G.mapOpen : open;
  const b = $('mapBtn');
  if (b) b.setAttribute('aria-pressed', G.mapOpen ? 'true' : 'false');
  document.body.classList.toggle('map-open', !!G.mapOpen);
}
function drawWorldMap(g, W, H) {
  const S = Math.min(W, H) * 0.86,
    ox = (W - S) / 2,
    oy = (H - S) / 2 + 10,
    R = S / 2;
  g.fillStyle = 'rgba(6,8,16,.72)';
  g.fillRect(0, 0, W, H);
  const cx = ox + R,
    cy = oy + R;
  g.save();
  g.beginPath();
  g.arc(cx, cy, R, 0, 6.283);
  g.clip();
  g.imageSmoothingEnabled = true;
  g.drawImage(worldMapImage(), ox, oy, S, S);
  g.restore();
  g.strokeStyle = THEME_ACC;
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cy, R + 2, 0, 6.283);
  g.stroke();
  // norte arriba, igual que el mundo visto con la cámara sin girar
  const P = (x, y) => [cx + (x / ARENA) * R, cy + (y / ARENA) * R];
  const dot = (x, y, r, fill, stroke) => {
    const [a, b] = P(x, y);
    g.fillStyle = fill;
    g.beginPath();
    g.arc(a, b, r, 0, 6.283);
    g.fill();
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = 2;
      g.stroke();
    }
  };
  const sq = (x, y, r, fill) => {
    const [a, b] = P(x, y);
    g.fillStyle = '#000';
    g.fillRect(a - r - 1.5, b - r - 1.5, r * 2 + 3, r * 2 + 3);
    g.fillStyle = fill;
    g.fillRect(a - r, b - r, r * 2, r * 2);
  };
  const icon = (x, y, ch, col, size) => {
    const [a, b] = P(x, y);
    g.font = `900 ${size || 16}px Nunito, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 4;
    g.strokeStyle = '#000';
    g.strokeText(ch, a, b);
    g.fillStyle = col;
    g.fillText(ch, a, b);
  };
  for (let i = 0; i < enemies.length; i += 3) {
    const e = enemies[i];
    if (!e.boss) dot(e.x, e.y, 1.6, 'rgba(255,110,110,.7)');
  }
  for (const ch of WORLD.chests) if (!ch.opened) sq(ch.x, ch.y, ch.rich ? 6 : 4, ch.rich ? '#ffd34d' : '#c98a3a');
  for (const al of WORLD.altars) if (!al.used) icon(al.x, al.y, '◆', C.gold, 15);
  for (const sh of WORLD.shrines) if (!sh.used) icon(sh.x, sh.y, '▲', SHRINE_T[sh.type].col, 15);
  for (const m of WORLD.merchants) icon(m.x, m.y, '$', '#7dffa8', 17);
  if (typeof questsOverlay === 'function') questsOverlay(g, P);
  if (G.portals) for (const pt of G.portals) dot(pt.x, pt.y, 9, REALMS[pt.key].acc, '#fff');
  for (const e of G.bosses) icon(e.x, e.y, '☠', '#ff4d5e', 24);
  for (const r of remotesHere()) dot(r.x, r.y, 6, '#7dffb0', '#000');
  for (const p of players) {
    dot(p.x, p.y, 7, p.col, '#000');
    const [a, b] = P(p.x, p.y);
    g.strokeStyle = '#fff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(a, b);
    g.lineTo(a + p.fx * 14, b + p.fy * 14);
    g.stroke();
  }
  // título y leyenda
  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '900 22px Nunito, sans-serif';
  g.lineWidth = 5;
  g.strokeStyle = '#000';
  const title = REALMS[G.realm].name;
  g.strokeText(title, W / 2, 12);
  g.fillStyle = '#fff';
  g.fillText(title, W / 2, 12);
  const nx = G.events[0];
  const sub = nx
    ? `${BOSSES[nx.key].tier === 'mini' ? 'Minijefe' : BOSSES[nx.key].tier === 'final' ? 'Jefe final' : 'Jefe'}: ${BOSSES[nx.key].name} en ${fmt(nx.t - G.rt)}`
    : G.bosses.length
      ? '¡Jefe en el mapa! (☠)'
      : G.portals
        ? 'Portales abiertos'
        : '';
  g.font = '800 14px Nunito, sans-serif';
  g.strokeText(sub, W / 2, 38);
  g.fillStyle = '#ffd34d';
  g.fillText(sub, W / 2, 38);
  const L = [
    ['■', '#c98a3a', 'Cofre'],
    ['■', '#ffd34d', 'Cofre rico'],
    ['◆', C.gold, 'Altar de don'],
    ['▲', '#ffc23a', 'Santuario'],
    ['$', '#7dffa8', 'Mercader'],
    ['☠', '#ff4d5e', 'Jefe'],
    ['●', '#fff', 'Tú'],
  ];
  g.font = '800 13px Nunito, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  let lx = 16,
    ly = H - 22 - (L.length - 1) * 20;
  if (W > 700) ly = H / 2 - (L.length * 20) / 2;
  for (const [ch, col, name] of L) {
    g.fillStyle = col;
    g.strokeStyle = '#000';
    g.lineWidth = 3;
    g.strokeText(ch, lx, ly);
    g.fillText(ch, lx, ly);
    g.fillStyle = '#fff';
    g.strokeText(name, lx + 20, ly);
    g.fillText(name, lx + 20, ly);
    ly += 20;
  }
  g.textAlign = 'center';
  g.font = '800 12px Nunito, sans-serif';
  g.fillStyle = '#9aa3c7';
  g.fillText(G.online ? 'M o Esc para cerrar' : 'Partida en pausa · M o Esc para cerrar', W / 2, H - 14);
}
