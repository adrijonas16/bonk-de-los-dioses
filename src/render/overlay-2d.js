/* ---------- capa 2D: números, globos, minimapa ---------- */
function drawOverlay() {
  const g = octx;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, W, H);
  g.imageSmoothingEnabled = false;
  if (state === 'menu' || state === 'select' || state === 'realms' || !G) return;
  if (G.darkT > 0) {
    const k = Math.min(1, G.darkT, 12 - G.darkT + 0.01);
    const gr = g.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.75);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, `rgba(4,0,10,${0.85 * Math.min(1, k)})`);
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  }
  if (G.sandT > 0) {
    const k = Math.min(1, G.sandT, 11 - G.sandT + 0.01);
    g.fillStyle = `rgba(214,170,100,${0.42 * Math.min(1, k)})`;
    g.fillRect(0, 0, W, H);
  }
  if (G.slowT > 0) {
    const k = Math.min(1, G.slowT, 12 - G.slowT + 0.01);
    g.fillStyle = `rgba(200,230,255,${0.18 * Math.min(1, k)})`;
    g.fillRect(0, 0, W, H);
  }
  if (G.stormT > 0) {
    g.fillStyle = `rgba(10,14,40,${Math.min(0.35, G.stormT * 0.3)})`;
    g.fillRect(0, 0, W, H);
  }
  {
    const hp = players.filter((p) => p.ctrl === 'p1' || p.ctrl === 'p2');
    const low = hp.length && hp.some((p) => !p.down && p.hp / p.maxHp < 0.3);
    const k = Math.min(1, (G.hitT || 0) * 1.6) + (low ? 0.42 + 0.22 * Math.sin(T * 6) : 0);
    if (k > 0.01) {
      const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.72);
      gr.addColorStop(0, 'rgba(255,0,0,0)');
      gr.addColorStop(1, `rgba(220,0,0,${Math.min(0.75, k * 0.75)})`);
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    }
  }
  if (G.flashT > 0) {
    g.fillStyle = `rgba(255,255,240,${G.flashT * 3.2})`;
    g.fillRect(0, 0, W, H);
  }
  for (const t of texts) {
    const p = toScreen(t.x, t.y, t.z);
    if (!p) continue;
    g.globalAlpha = Math.min(1, t.t * 3);
    if (/^[0-9+]+$/.test(t.v)) pixNum(g, t.v, p[0], p[1], t.c, 2);
    else {
      g.font = t.big ? '900 22px Nunito,sans-serif' : '900 15px Nunito,sans-serif';
      g.textAlign = 'center';
      g.fillStyle = '#000';
      g.fillText(t.v, p[0] + 1, p[1] + 1);
      g.fillStyle = t.c;
      g.fillText(t.v, p[0], p[1]);
    }
  }
  g.globalAlpha = 1;
  if (G.prompt) {
    const p = toScreen(G.prompt.x, G.prompt.y, groundAt(G.prompt.x, G.prompt.y) + 50);
    if (p) {
      g.font = '800 14px Nunito,sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const w = g.measureText(G.prompt.t).width + 24;
      g.fillStyle = 'rgba(20,24,40,.92)';
      roundRect(g, p[0] - w / 2, p[1] - 15, w, 30, 10);
      g.fill();
      g.strokeStyle = THEME_ACC;
      g.lineWidth = 2;
      g.stroke();
      g.fillStyle = G.prompt.bad ? '#ff8a7a' : '#fff';
      g.fillText(G.prompt.t, p[0], p[1] + 1);
    }
  }
  g.font = '800 14px Nunito,sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (G.portals)
    for (const pt of G.portals) {
      const p = toScreen(pt.x, pt.y, groundAt(pt.x, pt.y) + 90);
      if (!p) continue;
      const t = REALMS[pt.key].name;
      const w = g.measureText(t).width + 16;
      g.fillStyle = '#1c1210';
      g.fillRect(p[0] - w / 2, p[1] - 12, w, 24);
      g.fillStyle = REALMS[pt.key].acc;
      g.fillText(t, p[0], p[1] + 1);
    }
  for (const al of WORLD.altars) {
    if (al.used || al.charge <= 0) continue;
    const p = toScreen(al.x, al.y, groundAt(al.x, al.y) + 60);
    if (!p) continue;
    g.strokeStyle = '#1c1210';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(p[0], p[1], 14, 0, 6.283);
    g.stroke();
    g.strokeStyle = C.gold;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(p[0], p[1], 14, -1.57, -1.57 + (al.charge / 2.5) * 6.283);
    g.stroke();
  }
  for (const p of [...players, ...npcs, ...remotesHere()]) {
    const k = p.giant > 0 ? 2 : 1,
      s = toScreen(p.x, p.y, p.z + 44 * k);
    if (!s) continue;
    if (players.length > 1 || p.ctrl === 'npc' || p.ctrl === 'net') {
      g.font = '800 12px Nunito,sans-serif';
      g.fillStyle = p.col;
      g.fillText(
        p.ctrl === 'ai'
          ? 'IA'
          : p.ctrl === 'npc'
            ? p.g.name
            : p.ctrl === 'net'
              ? (p.name || p.g.name) + (p.dn ? ' · caído' : '')
              : 'J' + (p.idx + 1),
        s[0],
        s[1]
      );
    }
    if (p.sayT > 0 && p.say) {
      g.font = '700 14px Nunito,sans-serif';
      const w = Math.min(280, g.measureText(p.say).width + 20),
        bx = clamp(s[0], w / 2 + 8, W - w / 2 - 8),
        by = s[1] - 30;
      g.fillStyle = '#1c1210';
      g.fillRect(bx - w / 2 - 3, by - 17, w + 6, 34);
      g.fillStyle = '#f2e3c6';
      g.fillRect(bx - w / 2, by - 14, w, 28);
      g.fillRect(s[0] - 4, by + 14, 8, 6);
      g.fillStyle = '#1c1210';
      g.fillText(p.say, bx, by + 1, w - 10);
    }
  }
  // flechas a jefes fuera de vista
  for (const e of G.bosses) {
    const s = toScreen(e.x, e.y, e.z + 40);
    if (s && s[0] > 0 && s[0] < W && s[1] > 0 && s[1] < H) continue;
    const c = camera(),
      ddx = e.x - c.x,
      ddy = e.y - c.y,
      cyw = Math.cos(G.yaw),
      syw = Math.sin(G.yaw);
    const a = Math.atan2(ddx * syw + ddy * cyw, ddx * cyw - ddy * syw);
    const rr = Math.min(W, H) / 2 - 40;
    const ax = W / 2 + Math.cos(a) * rr,
      ay = H / 2 + Math.sin(a) * rr;
    g.save();
    g.translate(ax, ay);
    g.rotate(a);
    g.fillStyle = C.blood;
    g.beginPath();
    g.moveTo(16, 0);
    g.lineTo(-10, -11);
    g.lineTo(-10, 11);
    g.closePath();
    g.fill();
    g.restore();
  }
  // minimapa
  const mmR = Math.min(78, W * 0.09),
    mx = W - mmR - 18,
    my = mmR + 18;
  g.fillStyle = 'rgba(10,8,8,.6)';
  g.beginPath();
  g.arc(mx, my, mmR + 4, 0, 6.283);
  g.fill();
  g.strokeStyle = THEME_ACC;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(mx, my, mmR + 4, 0, 6.283);
  g.stroke();
  const sc = mmR / ARENA,
    cy = Math.cos(G.yaw),
    sy = Math.sin(G.yaw);
  const P2 = (x, y) => {
    const rx = x * cy - y * sy,
      ry = x * sy + y * cy;
    return [mx + rx * sc, my + ry * sc];
  };
  g.fillStyle = 'rgba(255,120,120,.75)';
  for (let i = 0; i < enemies.length; i += 2) {
    const e = enemies[i];
    if (e.boss) continue;
    const [a, b2] = P2(e.x, e.y);
    g.fillRect(a - 1, b2 - 1, 2, 2);
  }
  for (const al of WORLD.altars) {
    if (al.used) continue;
    const [a, b2] = P2(al.x, al.y);
    g.fillStyle = C.gold;
    g.fillRect(a - 3, b2 - 3, 6, 6);
  }
  for (const ch of WORLD.chests) {
    if (ch.opened) continue;
    const [a, b2] = P2(ch.x, ch.y);
    g.fillStyle = '#c98a3a';
    g.fillRect(a - 2, b2 - 2, 4, 4);
  }
  if (G.portals)
    for (const pt of G.portals) {
      const [a, b2] = P2(pt.x, pt.y);
      g.fillStyle = REALMS[pt.key].acc;
      g.beginPath();
      g.arc(a, b2, 5, 0, 6.283);
      g.fill();
    }
  for (const e of G.bosses) {
    const [a, b2] = P2(e.x, e.y);
    g.fillStyle = C.blood;
    g.beginPath();
    g.arc(a, b2, 5, 0, 6.283);
    g.fill();
  }
  for (const r of remotesHere()) {
    const [a, b2] = P2(r.x, r.y);
    g.fillStyle = '#7dffb0';
    g.beginPath();
    g.arc(a, b2, 4, 0, 6.283);
    g.fill();
  }
  questsOverlay(g, P2);
  for (const p of players) {
    const [a, b2] = P2(p.x, p.y);
    g.fillStyle = p.col;
    g.beginPath();
    g.arc(a, b2, 4, 0, 6.283);
    g.fill();
    g.strokeStyle = '#000';
    g.lineWidth = 1;
    g.stroke();
  }
  if (joy) {
    g.strokeStyle = 'rgba(242,227,198,.6)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(joy.ox, joy.oy, 50, 0, 6.283);
    g.stroke();
    const dx = joy.x - joy.ox,
      dy = joy.y - joy.oy,
      d = Math.hypot(dx, dy),
      m = Math.min(d, 50) / (d || 1);
    g.fillStyle = 'rgba(242,227,198,.5)';
    g.beginPath();
    g.arc(joy.ox + dx * m, joy.oy + dy * m, 20, 0, 6.283);
    g.fill();
  }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
