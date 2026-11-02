/* ---------- jefes (dibujo por cuadro) ---------- */
let BOSSDRAW = false;
function drawBoss(e, x, y) {
  const d = e.d,
    fl = e.flash > 0,
    c = fl ? '#fff6e0' : e.corrupt ? shade(d.col, -0.25) : d.col,
    a = d.acc,
    s = Math.round(e.r / S),
    cd = shade(c, -0.22),
    ch = shade(c, 0.2);
  const f = e.face || 1;
  if (e.corrupt) dither(x, y, s + 6, '#b07aff', 3);
  switch (d.arch) {
    case 'hundred': {
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * 6.283 + Math.sin(T * 2 + i) * 0.3,
          L = s + 7 + Math.sin(T * 4 + i * 1.7) * 3,
          ex = x + Math.cos(ang) * L,
          ey = y + Math.sin(ang) * L;
        line(x + Math.cos(ang) * s * 0.6, y + Math.sin(ang) * s * 0.6, ex, ey, cd, 2);
        ellD(ex, ey, 1.5, 1.5, c);
      }
      ellD(x, y, s, s * 0.85, c);
      ellD(x, y - 2, s * 0.7, s * 0.5, ch);
      for (let i = 0; i < 5; i++) {
        const hx = x - 8 + i * 4,
          hy = y - s + 1 - (i % 2);
        ellD(hx, hy, 2.2, 2.2, c);
        R(hx, hy, 1, 1, a);
      }
      break;
    }
    case 'gorgon': {
      ellD(x, y + 5, s, s * 0.5, cd);
      ellD(x, y + 3, s * 0.7, s * 0.35, c);
      ellD(x, y - 3, s * 0.45, s * 0.55, c);
      const hy = y - s * 0.75;
      for (let i = 0; i < 9; i++) {
        const ang = -Math.PI + (i / 8) * Math.PI;
        let px = x,
          py = hy;
        for (let j = 1; j <= 6; j++) {
          const w = Math.sin(T * 6 + i + j) * 1.2;
          px = x + Math.cos(ang) * (3 + j) + Math.cos(ang + 1.57) * w;
          py = hy + Math.sin(ang) * (3 + j) + Math.sin(ang + 1.57) * w;
          R(px, py, 1, 1, '#3a8a3a');
        }
        R(px, py, 1, 1, '#b3301f');
      }
      ellD(x, hy, 3.5, 3.5, '#a8c08a');
      R(x - 2, hy, 1, 1, a);
      R(x + 1, hy, 1, 1, a);
      break;
    }
    case 'beast': {
      const n = d.heads || 1,
        l = Math.sin(T * 8) > 0 ? 1 : 0;
      R(x - s * 0.7 + l, y + s * 0.35, 3, s * 0.5, cd);
      R(x - s * 0.3 - l, y + s * 0.35, 3, s * 0.5, cd);
      R(x + s * 0.2 + l, y + s * 0.35, 3, s * 0.5, cd);
      R(x + s * 0.55 - l, y + s * 0.35, 3, s * 0.5, cd);
      ellD(x, y, s, s * 0.6, c);
      R(x - s * 0.8, y - s * 0.5, s * 1.4, 1, ch);
      for (let i = 0; i < n; i++) {
        const hx = x + f * s * 0.85,
          hy = y - s * 0.35 + (i - (n - 1) / 2) * 6;
        ellD(hx, hy, 4.5, 3.8, c);
        R(hx + (f > 0 ? 3 : -6), hy, 3, 2, c);
        R(hx + f * 1, hy - 1, 1, 1, a);
        R(hx + f * 3, hy - 1, 1, 1, a);
        if (d.feat === 'horns') {
          R(hx - 2, hy - 6, 1, 3, '#e8e0cc');
          R(hx + 2, hy - 6, 1, 3, '#e8e0cc');
        }
        if (d.feat === 'mane') ringD(hx, hy, 5, a);
      }
      break;
    }
    case 'serpent': {
      if (d.feat === 'double') {
        triD(x - s, y, x - s * 2.2, y - s * 1.2 + Math.sin(T * 6) * 3, x - s * 0.3, y - s * 0.4, shade(a, -0.1));
        triD(x + s, y, x + s * 2.2, y - s * 1.2 + Math.sin(T * 6) * 3, x + s * 0.3, y - s * 0.4, shade(a, -0.1));
      }
      ellD(x, y, s, s, c);
      ellD(x, y, s * 0.6, s * 0.5, ch);
      R(x - 3, y - 2, 2, 2, a);
      R(x + 2, y - 2, 2, 2, a);
      R(x - 2, y + s - 2, 1, 2, '#f2e3c6');
      R(x + 2, y + s - 2, 1, 2, '#f2e3c6');
      break;
    }
    case 'hydra': {
      const n = d.heads || 3;
      ellD(x, y + 4, s, s * 0.7, c);
      ellD(x, y + 2, s * 0.7, s * 0.4, ch);
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (i - (n - 1) / 2) * (2.6 / n),
          L = s + 8 + Math.sin(T * 3 + i) * 3,
          ex = x + Math.cos(ang) * L + Math.sin(T * 2 + i * 2) * 2,
          ey = y + Math.sin(ang) * L;
        line(x + Math.cos(ang) * s * 0.4, y + Math.sin(ang) * s * 0.3, ex, ey, cd, 3);
        ellD(ex, ey, 3, 2.5, c);
        R(ex - 1, ey - 1, 1, 1, a);
        R(ex + 1, ey - 1, 1, 1, a);
      }
      break;
    }
    case 'lord': {
      const n = d.heads || 1;
      ellD(x, y + 4, s * 0.75, s * 0.75, c);
      R(x - s * 0.75, y + 2, s * 1.5, 1, ch);
      const sw = Math.sin(T * 3) * 3;
      line(x - s * 0.6, y, x - s * 1.1, y + 4 + sw, cd, 3);
      line(x + s * 0.6, y, x + s * 1.1, y + 4 - sw, cd, 3);
      const hy = y - s * 0.6;
      const skull = d.feat === 'skull',
        hc = skull ? '#e8e0cc' : shade(c, 0.1);
      if (d.feat === 'headless') {
        R(x - 2, hy + 2, 4, 2, cd);
        dither(x + s * 0.9, y - 2, 3, '#9ad0e8', 1);
      } else if (n > 2) {
        for (let i = 0; i < n; i++) {
          const hx = x + (i - (n - 1) / 2) * 4,
            hh = hy - 2 + Math.abs(i - (n - 1) / 2) * 0.5;
          ellD(hx, hh, 2.2, 2.4, hc);
          R(hx, hh, 1, 1, a);
        }
      } else
        for (let i = 0; i < n; i++) {
          const hx = x + (n > 1 ? (i ? 6 : -6) : 0);
          ellD(hx, hy, 4.5, 4.5, hc);
          if (d.feat === 'oneeye') {
            const open = e.pi % 2 === 1 ? 1 : 0.3;
            ellD(hx, hy, 3, 2.4 * open, '#f2e3c6');
            R(hx, hy, 1, 1, a);
          } else {
            R(hx - 2, hy - 1, skull ? 2 : 1, skull ? 2 : 1, skull ? INK : a);
            R(hx + 1, hy - 1, skull ? 2 : 1, skull ? 2 : 1, skull ? INK : a);
            if (skull) R(hx - 1, hy + 2, 3, 1, INK);
          }
          if (d.feat === 'horns') {
            line(hx - 3, hy - 3, hx - 6, hy - 7, '#e8e0cc');
            line(hx + 3, hy - 3, hx + 6, hy - 7, '#e8e0cc');
          }
        }
      break;
    }
    case 'flyer': {
      const fl2 = Math.sin(T * 8) * s * 0.4,
        span = s * 1.8;
      const wc = d.feat === 'butterfly' ? shade(c, 0.1) : cd;
      triD(x, y, x - span, y - s * 0.6 + fl2, x - s * 0.4, y + s * 0.6, wc);
      triD(x, y, x + span, y - s * 0.6 + fl2, x + s * 0.4, y + s * 0.6, wc);
      if (d.feat === 'butterfly') {
        triD(x, y + 2, x - span * 0.8, y + s * 0.9 - fl2 * 0.5, x - 2, y + s, shade(c, 0.2));
        triD(x, y + 2, x + span * 0.8, y + s * 0.9 - fl2 * 0.5, x + 2, y + s, shade(c, 0.2));
        for (let i = 0; i < 6; i++) {
          R(x - span + i * 3, y - s * 0.6 + fl2 + i, 1, 1, a);
          R(x + span - i * 3, y - s * 0.6 + fl2 + i, 1, 1, a);
        }
      }
      ellD(x, y, s * 0.45, s * 0.6, c);
      R(x - 2, y - s * 0.3, 1, 1, a);
      R(x + 1, y - s * 0.3, 1, 1, a);
      if (d.feat === 'bat') {
        R(x - 3, y - s * 0.8, 1, 3, c);
        R(x + 2, y - s * 0.8, 1, 3, c);
      }
      if (d.feat === 'bird' || d.feat === 'dragon') R(x + (f > 0 ? 3 : -7), y - s * 0.2, 4, 2, a);
      break;
    }
    case 'titan': {
      const pal = ['#b07aff', '#5a3a9a', '#e27aa8', '#7de0ff', '#3a2a5a'];
      for (let i = 0; i < 60; i++) {
        const ang = T * 0.8 + i * 0.41,
          rr = s * (0.35 + ((i % 12) / 12) * 0.95);
        R(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.85, 2, 2, pal[i % pal.length]);
      }
      ellD(x, y, s * 0.62, s * 0.62, '#050308');
      ringD(x, y, s * 0.62, '#b07aff');
      for (let i = 0; i < 7; i++) {
        const ang = T * 0.3 + i * 0.9,
          ex = x + Math.cos(ang) * s * 0.4,
          ey = y + Math.sin(ang) * s * 0.35;
        ellD(ex, ey, 2.2, 1.6, '#f2e3c6');
        R(ex, ey, 1, 1, '#b07aff');
      }
      break;
    }
  }
  if (e.charge > 0 || e.chargeDelay > 0) R(x - 1, y - s - 4, 3, 3, C.blood);
}
function segSprite(col, acc) {
  const base = fromFn(14, 14, ({ ell, rect }) => {
    ell(7, 7, 6.5, 6.5, col);
    ell(7, 6, 4, 3, shade(col, 0.18));
    rect(6, 1, 2, 2, acc);
  });
  return hiSprite(base, INK);
}
