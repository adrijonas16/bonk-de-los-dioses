/* ---------- objetivos actuales (flechas y minimapa) ---------- */
function qTargets() {
  const q = G && G.q;
  const out = [];
  if (!q) return out;
  for (const A of q.active) {
    const col = qInfo(A.a).col;
    switch (A.id) {
      case 'ladron':
        if (A.e && !A.e.dead) out.push({ x: A.e.x, y: A.e.y, col, t: 'Atoq' });
        break;
      case 'llama':
        if (A.carrier && (A.weak != null || A.storm > 0 || A.warn > 0)) {
          const c = A.carrier;
          let best = null,
            bd = 1e12;
          for (const z of q.shelters.concat(q.braz.filter((b) => b.lit))) {
            const d = (z.x - c.x) ** 2 + (z.y - c.y) ** 2;
            if (d < bd) {
              bd = d;
              best = z;
            }
          }
          if (best) out.push({ x: best.x, y: best.y, col: '#8fd8ff', t: 'Tambo' });
        }
        if (A.carrier && A.weak == null) {
          for (const b of q.braz) if (!b.lit) out.push({ x: b.x, y: b.y, col, t: 'Brasero' });
        } else if (A.ember) out.push({ x: A.ember.x, y: A.ember.y, col: '#ff4a2a', t: 'Brasa' });
        break;
      case 'sellos':
        for (const s of q.seals) if (s.hp > 0) out.push({ x: s.x, y: s.y, col, t: 'Sello' });
        break;
      case 'favor':
        out.push(A.carrier ? { x: A.a.x, y: A.a.y, col, t: 'Altar' } : { x: A.relic.x, y: A.relic.y, col, t: 'Illa' });
        break;
    }
  }
  return out;
}
function questsOverlay(g, P2) {
  const q = G && G.q;
  if (!q) return;
  g.font = '800 12px Nunito,sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const c = camera();
  for (const a of q.anch) {
    if (a.state !== 'offer') continue;
    const inf = qInfo(a);
    const d = Math.hypot(a.x - c.x, a.y - c.y);
    if (d > 900) continue;
    const s = toScreen(a.x, a.y, groundAt(a.x, a.y) + (a.id === 'sellos' ? 140 : 90));
    if (!s) continue;
    g.fillStyle = 'rgba(18,22,38,.9)';
    g.beginPath();
    g.arc(s[0], s[1], 15, 0, 6.283);
    g.fill();
    g.strokeStyle = inf.col;
    g.lineWidth = 3;
    g.stroke();
    g.font = '15px sans-serif';
    g.fillStyle = '#fff';
    g.fillText(inf.icon, s[0], s[1] + 1);
    if (d < 520) {
      g.font = '800 12px Nunito,sans-serif';
      const w = g.measureText(inf.name).width + 14;
      g.fillStyle = 'rgba(18,22,38,.85)';
      g.fillRect(s[0] - w / 2, s[1] + 19, w, 18);
      g.fillStyle = inf.col;
      g.fillText(inf.name, s[0], s[1] + 28);
    }
  }
  for (const A of q.active) {
    if (A.id === 'llama') {
      const p = A.carrier;
      if (p) {
        const s = toScreen(p.x, p.y, p.z + 70);
        if (s) {
          if (A.weak != null) {
            g.font = '900 12px Nunito,sans-serif';
            g.fillStyle = '#000';
            g.fillText(`BRASA ${Math.ceil(A.weak)} s`, s[0] + 1, s[1] + 1);
            g.fillStyle = '#ff6a4a';
            g.fillText(`BRASA ${Math.ceil(A.weak)} s`, s[0], s[1]);
          } else {
            g.fillStyle = 'rgba(0,0,0,.6)';
            g.fillRect(s[0] - 22, s[1] - 4, 44, 8);
            g.fillStyle = A.f > 40 ? '#ffb040' : '#ff4d3a';
            g.fillRect(s[0] - 21, s[1] - 3, 42 * clamp(A.f / 100, 0, 1), 6);
          }
        }
      } else if (A.ember) {
        const s = toScreen(A.ember.x, A.ember.y, groundAt(A.ember.x, A.ember.y) + 36);
        if (s) {
          g.font = '900 12px Nunito,sans-serif';
          g.fillStyle = '#000';
          g.fillText(`Brasa · ${Math.ceil(A.ember.t)} s`, s[0] + 1, s[1] + 1);
          g.fillStyle = '#ff6a4a';
          g.fillText(`Brasa · ${Math.ceil(A.ember.t)} s`, s[0], s[1]);
        }
      }
    }
  }
  const tg = qTargets();
  const cyw = Math.cos(G.yaw),
    syw = Math.sin(G.yaw);
  for (const t of tg) {
    const s = toScreen(t.x, t.y, groundAt(t.x, t.y) + 30);
    if (s && s[0] > 30 && s[0] < W - 30 && s[1] > 30 && s[1] < H - 30) {
      g.strokeStyle = t.col;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(s[0], s[1], 12 + Math.sin(T * 6) * 2, 0, 6.283);
      g.stroke();
      continue;
    }
    const ddx = t.x - c.x,
      ddy = t.y - c.y;
    const a = Math.atan2(ddx * syw + ddy * cyw, ddx * cyw - ddy * syw);
    const rr = Math.min(W, H) / 2 - 56;
    const ax = W / 2 + Math.cos(a) * rr,
      ay = H / 2 + Math.sin(a) * rr;
    g.save();
    g.translate(ax, ay);
    g.rotate(a);
    g.fillStyle = t.col;
    g.strokeStyle = '#000';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(14, 0);
    g.lineTo(-8, -9);
    g.lineTo(-8, 9);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
    g.font = '800 11px Nunito,sans-serif';
    g.fillStyle = '#000';
    g.fillText(t.t, ax + 1 - Math.cos(a) * 22, ay + 1 - Math.sin(a) * 22);
    g.fillStyle = t.col;
    g.fillText(t.t, ax - Math.cos(a) * 22, ay - Math.sin(a) * 22);
  }
  for (const a of q.anch) {
    if (a.state !== 'offer') continue;
    const [x, y] = P2(a.x, a.y);
    g.fillStyle = qInfo(a).col;
    g.beginPath();
    g.moveTo(x, y - 5);
    g.lineTo(x + 5, y);
    g.lineTo(x, y + 5);
    g.lineTo(x - 5, y);
    g.closePath();
    g.fill();
    g.strokeStyle = '#000';
    g.lineWidth = 1;
    g.stroke();
  }
  for (const t of tg) {
    const [x, y] = P2(t.x, t.y);
    g.strokeStyle = t.col;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, 4, 0, 6.283);
    g.stroke();
  }
  for (const s of q.shelters) {
    const [x, y] = P2(s.x, s.y);
    g.fillStyle = '#8fd8ff';
    g.fillRect(x - 2, y - 2, 4, 4);
  }
  for (const b of q.braz) {
    if (!b.lit) continue;
    const [x, y] = P2(b.x, b.y);
    g.fillStyle = '#ff8a2a';
    g.beginPath();
    g.arc(x, y, 3.5, 0, 6.283);
    g.fill();
  }
}
