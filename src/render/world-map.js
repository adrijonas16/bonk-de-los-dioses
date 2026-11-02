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
  // con el mapa abierto se necesita el cursor para señalar y marcar
  if (G.mapOpen && document.pointerLockElement)
    try {
      document.exitPointerLock();
    } catch (err) {}
}
// tipos de lugar: icono propio, nombre y qué hace (se ve en la leyenda y al pasar el ratón)
const MAP_KINDS = {
  chest: {
    name: 'Cofre',
    col: '#c98a3a',
    tip: (o) => (o.free ? 'Cofre gratis: ábrelo con E' : `Cofre: ábrelo con E por ${chestPrice()} de oro`),
  },
  rich: { name: 'Cofre rico', col: '#ffd34d', tip: () => 'Cofre rico: objetos raros o mejores' },
  altar: { name: 'Altar de don', col: '#e8b53e', tip: () => 'Altar: quédate dentro hasta cargarlo y ganas un don' },
  fortuna: {
    name: 'Altar de la Fortuna',
    col: '#ffc23a',
    tip: (o) => `Fortuna: paga ${shrinePrice(o)} de oro por un objeto`,
  },
  desafio: {
    name: 'Estatua del Desafío',
    col: '#ff4d5e',
    tip: () => 'Desafío: llama a una horda; si la vences, cofre rico',
  },
  fuente: { name: 'Fuente Sagrada', col: '#4fc3ff', tip: () => 'Fuente: te cura toda la vida (una vez)' },
  maldito: { name: 'Altar Maldito', col: '#9b5cff', tip: () => 'Maldito: enemigos más duros a cambio de más premio' },
  merchant: { name: 'Mercader', col: '#3ccf6e', tip: () => 'Mercader: compra objetos con tu oro' },
  boss: { name: 'Jefe', col: '#ff4d5e', tip: (o) => `${o.d.name}: ¡derrótalo!` },
  portal: { name: 'Portal', col: '#b06cff', tip: (o) => `Portal a ${REALMS[o.key].name}` },
  mark: { name: 'Tu marca', col: '#7de0ff', tip: () => 'Tu marca: toca de nuevo para quitarla' },
  me: { name: 'Tú', col: '#ffffff', tip: () => 'Tú' },
};
// iconos dibujados a mano (todos distintos, con borde negro para leerse sobre cualquier terreno)
function mapIcon(g, kind, a, b, s) {
  const K = MAP_KINDS[kind];
  g.save();
  g.translate(a, b);
  g.lineJoin = 'round';
  g.lineWidth = 2;
  g.strokeStyle = '#120c08';
  const circ = (r, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.arc(0, 0, r, 0, 6.283);
    g.fill();
    g.stroke();
  };
  const glyph = (t, col, size) => {
    g.fillStyle = col;
    g.font = `900 ${size}px Nunito, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(t, 0, 1);
  };
  switch (kind) {
    case 'chest':
    case 'rich': {
      const w = s * 1.1,
        h = s * 0.8;
      g.fillStyle = K.col;
      g.fillRect(-w / 2, -h / 2, w, h);
      g.strokeRect(-w / 2, -h / 2, w, h);
      g.beginPath();
      g.moveTo(-w / 2, -h / 8);
      g.lineTo(w / 2, -h / 8);
      g.stroke();
      g.fillStyle = kind === 'rich' ? '#fff6c8' : '#ffd34d';
      g.fillRect(-2, -h / 8 - 2, 4, 5);
      break;
    }
    case 'altar':
      g.fillStyle = '#6a5a4a';
      g.fillRect(-s * 0.55, s * 0.15, s * 1.1, s * 0.4);
      g.strokeRect(-s * 0.55, s * 0.15, s * 1.1, s * 0.4);
      g.fillStyle = K.col;
      g.beginPath();
      g.moveTo(0, -s * 0.75);
      g.lineTo(s * 0.4, -s * 0.2);
      g.lineTo(0, s * 0.2);
      g.lineTo(-s * 0.4, -s * 0.2);
      g.closePath();
      g.fill();
      g.stroke();
      break;
    case 'fortuna':
      circ(s * 0.62, K.col);
      glyph('★', '#5a3a00', s * 0.85);
      break;
    case 'desafio':
      circ(s * 0.62, K.col);
      glyph('⚔', '#fff', s * 0.8);
      break;
    case 'fuente':
      circ(s * 0.62, K.col);
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(0, -s * 0.4);
      g.quadraticCurveTo(s * 0.32, 0, 0, s * 0.35);
      g.quadraticCurveTo(-s * 0.32, 0, 0, -s * 0.4);
      g.fill();
      break;
    case 'maldito':
      circ(s * 0.62, K.col);
      glyph('✶', '#fff', s * 0.85);
      break;
    case 'merchant':
      g.fillStyle = '#9a6a3a';
      g.beginPath();
      g.moveTo(-s * 0.35, -s * 0.35);
      g.quadraticCurveTo(-s * 0.7, s * 0.2, -s * 0.4, s * 0.55);
      g.lineTo(s * 0.4, s * 0.55);
      g.quadraticCurveTo(s * 0.7, s * 0.2, s * 0.35, -s * 0.35);
      g.closePath();
      g.fill();
      g.stroke();
      glyph('$', '#ffd34d', s * 0.65);
      break;
    case 'boss':
      circ(s * 0.75, K.col);
      glyph('☠', '#fff', s * 1.05);
      break;
    case 'portal':
      g.lineWidth = 4;
      g.strokeStyle = '#120c08';
      g.beginPath();
      g.ellipse(0, 0, s * 0.45, s * 0.7, 0, 0, 6.283);
      g.stroke();
      g.lineWidth = 2.5;
      g.strokeStyle = K.col;
      g.stroke();
      break;
    case 'mark':
      g.fillStyle = K.col;
      g.beginPath();
      g.moveTo(-s * 0.15, s * 0.7);
      g.lineTo(-s * 0.15, -s * 0.7);
      g.lineTo(s * 0.6, -s * 0.42);
      g.lineTo(-s * 0.15, -s * 0.14);
      g.stroke();
      g.fill();
      break;
  }
  g.restore();
}
// lista de lugares visibles en el mapa (para dibujarlos, la leyenda y el ratón)
function mapPlaces() {
  const out = [];
  for (const ch of WORLD.chests)
    if (!ch.opened) out.push({ kind: ch.rich ? 'rich' : 'chest', o: ch, x: ch.x, y: ch.y });
  for (const al of WORLD.altars) if (!al.used) out.push({ kind: 'altar', o: al, x: al.x, y: al.y });
  for (const sh of WORLD.shrines) if (!sh.used) out.push({ kind: sh.type, o: sh, x: sh.x, y: sh.y });
  for (const m of WORLD.merchants) out.push({ kind: 'merchant', o: m, x: m.x, y: m.y });
  if (G.portals) for (const pt of G.portals) out.push({ kind: 'portal', o: pt, x: pt.x, y: pt.y });
  for (const e of G.bosses) out.push({ kind: 'boss', o: e, x: e.x, y: e.y });
  if (G.mark) out.push({ kind: 'mark', o: G.mark, x: G.mark.x, y: G.mark.y });
  return out;
}
const MAPUI = { mx: -1, my: -1, geo: null };
function mapGeo(W, H) {
  const S = Math.min(W, H) * 0.86;
  return { S, R: S / 2, cx: W / 2, cy: (H - S) / 2 + 10 + S / 2 };
}
function mapToWorld(px, py) {
  const m = MAPUI.geo;
  if (!m) return null;
  const dx = px - m.cx,
    dy = py - m.cy;
  if (Math.hypot(dx, dy) > m.R) return null;
  return [(dx / m.R) * ARENA, (dy / m.R) * ARENA];
}
// clic en el mapa: marca o quita la marca; fuera del círculo cierra
function mapClick(px, py) {
  const w = mapToWorld(px, py);
  if (!w) return toggleWorldMap(false);
  const m = MAPUI.geo,
    sc = m.R / ARENA;
  if (G.mark && Math.hypot(G.mark.x - w[0], G.mark.y - w[1]) * sc < 14) G.mark = null;
  else {
    // si tocas cerca de un lugar, la marca se pone justo encima
    let best = null,
      bd = 14 / sc;
    for (const pl of mapPlaces()) {
      if (pl.kind === 'mark') continue;
      const d = Math.hypot(pl.x - w[0], pl.y - w[1]);
      if (d < bd) {
        bd = d;
        best = pl;
      }
    }
    G.mark = best
      ? { x: best.x, y: best.y, label: MAP_KINDS[best.kind].name }
      : { x: w[0], y: w[1], label: 'Tu marca' };
  }
}
function drawWorldMap(g, W, H) {
  const geo = (MAPUI.geo = mapGeo(W, H)),
    { S, R, cx, cy } = geo,
    ox = cx - R,
    oy = cy - R;
  g.fillStyle = 'rgba(6,8,16,.74)';
  g.fillRect(0, 0, W, H);
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
  const P = (x, y) => [cx + (x / ARENA) * R, cy + (y / ARENA) * R];
  for (let i = 0; i < enemies.length; i += 3) {
    const e = enemies[i];
    if (e.boss) continue;
    const [a, b] = P(e.x, e.y);
    g.fillStyle = 'rgba(255,110,110,.65)';
    g.fillRect(a - 1, b - 1, 2.5, 2.5);
  }
  if (typeof questsOverlay === 'function') questsOverlay(g, P);
  const places = mapPlaces();
  let hover = null,
    hd = 16;
  for (const pl of places) {
    const [a, b] = P(pl.x, pl.y);
    mapIcon(g, pl.kind, a, b, pl.kind === 'boss' ? 22 : 15);
    const d = Math.hypot(a - MAPUI.mx, b - MAPUI.my);
    if (d < hd) {
      hd = d;
      hover = { pl, a, b };
    }
  }
  // línea hasta la marca
  const me = players.find((p) => p.ctrl === 'p1') || players[0];
  if (G.mark && me) {
    const [a1, b1] = P(me.x, me.y),
      [a2, b2] = P(G.mark.x, G.mark.y);
    g.setLineDash([6, 6]);
    g.strokeStyle = '#7de0ff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(a1, b1);
    g.lineTo(a2, b2);
    g.stroke();
    g.setLineDash([]);
  }
  for (const r of remotesHere()) {
    const [a, b] = P(r.x, r.y);
    g.fillStyle = '#7dffb0';
    g.beginPath();
    g.arc(a, b, 6, 0, 6.283);
    g.fill();
    g.strokeStyle = '#000';
    g.stroke();
  }
  for (const p of players) {
    const [a, b] = P(p.x, p.y),
      ang = Math.atan2(p.fy, p.fx);
    g.save();
    g.translate(a, b);
    g.rotate(ang);
    g.fillStyle = p.col;
    g.strokeStyle = '#000';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(11, 0);
    g.lineTo(-7, 7);
    g.lineTo(-3, 0);
    g.lineTo(-7, -7);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }
  // etiqueta al pasar el ratón
  if (hover) {
    const K = MAP_KINDS[hover.pl.kind],
      t1 = K.name,
      t2 = K.tip(hover.pl.o),
      d = me ? Math.round(Math.hypot(hover.pl.x - me.x, hover.pl.y - me.y) / 10) : 0;
    g.font = '900 14px Nunito, sans-serif';
    const w1 = g.measureText(t1 + ' · 000 m').width;
    g.font = '700 12px Nunito, sans-serif';
    const w = Math.max(w1, g.measureText(t2).width) + 24;
    let x = hover.a + 14,
      y = hover.b - 44;
    if (x + w > W - 8) x = hover.a - w - 14;
    if (y < 8) y = hover.b + 14;
    g.fillStyle = 'rgba(16,18,32,.95)';
    roundRect(g, x, y, w, 46, 10);
    g.fill();
    g.strokeStyle = K.col;
    g.lineWidth = 2;
    g.stroke();
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = K.col;
    g.font = '900 14px Nunito, sans-serif';
    g.fillText(`${t1} · ${d} m`, x + 12, y + 7);
    g.fillStyle = '#e8ecff';
    g.font = '700 12px Nunito, sans-serif';
    g.fillText(t2, x + 12, y + 26);
  }
  // título
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
      ? '¡Hay un jefe en el mapa!'
      : G.portals
        ? 'Portales abiertos'
        : '';
  g.font = '800 14px Nunito, sans-serif';
  g.strokeText(sub, W / 2, 38);
  g.fillStyle = '#ffd34d';
  g.fillText(sub, W / 2, 38);
  // leyenda con el icono real de cada lugar y cuántos quedan
  const count = {};
  for (const pl of places) count[pl.kind] = (count[pl.kind] || 0) + 1;
  const order = [
    'chest',
    'rich',
    'altar',
    'fortuna',
    'desafio',
    'fuente',
    'maldito',
    'merchant',
    'boss',
    'portal',
    'mark',
  ];
  const rows = order.filter((k) => count[k] || k === 'mark');
  const lw = W > 760 ? 210 : 170,
    lh = 26,
    lx = 14,
    ly0 = Math.max(70, H / 2 - (rows.length * lh) / 2);
  g.fillStyle = 'rgba(16,18,32,.85)';
  roundRect(g, lx - 6, ly0 - 34, lw, rows.length * lh + 44, 12);
  g.fill();
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffd34d';
  g.font = '900 12px Nunito, sans-serif';
  g.fillText('LEYENDA', lx + 4, ly0 - 18);
  rows.forEach((k, i) => {
    const y = ly0 + i * lh;
    mapIcon(g, k, lx + 14, y, 15);
    g.fillStyle = '#fff';
    g.font = '800 13px Nunito, sans-serif';
    g.fillText(MAP_KINDS[k].name, lx + 32, y);
    if (count[k] && k !== 'mark') {
      g.fillStyle = '#9aa3c7';
      g.textAlign = 'right';
      g.fillText('×' + count[k], lx + lw - 18, y);
      g.textAlign = 'left';
    }
  });
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.font = '800 12px Nunito, sans-serif';
  g.fillStyle = '#c8d0f0';
  g.fillText(
    (G.online ? '' : 'Partida en pausa · ') + 'Toca el mapa para poner una marca · M o Esc para cerrar',
    W / 2,
    H - 12
  );
}
// marca en el mundo: columna de luz, flecha en el borde de la pantalla y distancia
function drawMarkHint(g, W, H) {
  if (!G.mark || G.mapOpen) return;
  const me = players.find((p) => p.ctrl === 'p1') || players[0];
  if (!me) return;
  const d = Math.hypot(G.mark.x - me.x, G.mark.y - me.y);
  if (d < 50) {
    G.mark = null;
    return;
  }
  const s = toScreen(G.mark.x, G.mark.y, groundAt(G.mark.x, G.mark.y) + 40);
  const label = `${G.mark.label} · ${Math.round(d / 10)} m`;
  g.font = '900 13px Nunito, sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 4;
  g.strokeStyle = '#000';
  if (s && s[0] > 30 && s[0] < W - 30 && s[1] > 30 && s[1] < H - 30) {
    mapIcon(g, 'mark', s[0], s[1] - 10, 18);
    g.strokeText(label, s[0], s[1] + 16);
    g.fillStyle = '#7de0ff';
    g.fillText(label, s[0], s[1] + 16);
    return;
  }
  // fuera de pantalla: flecha en el borde en la dirección de la marca
  const ps = toScreen(me.x, me.y, me.z + 20) || [W / 2, H / 2];
  let ang;
  if (s) ang = Math.atan2(s[1] - ps[1], s[0] - ps[0]);
  else {
    const dx = G.mark.x - me.x,
      dy = G.mark.y - me.y,
      c = Math.cos(G.yaw),
      sn = Math.sin(G.yaw);
    ang = Math.atan2(dx * sn + dy * c, dx * c - dy * sn);
  }
  const r = Math.min(W, H) * 0.42,
    ax = W / 2 + Math.cos(ang) * r,
    ay = H / 2 + Math.sin(ang) * r;
  g.save();
  g.translate(ax, ay);
  g.rotate(ang);
  g.fillStyle = '#7de0ff';
  g.strokeStyle = '#000';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(16, 0);
  g.lineTo(-8, 10);
  g.lineTo(-3, 0);
  g.lineTo(-8, -10);
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
  g.strokeText(label, ax, ay + 26);
  g.fillStyle = '#7de0ff';
  g.fillText(label, ax, ay + 26);
}
