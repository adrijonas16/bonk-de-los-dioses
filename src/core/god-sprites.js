/* ---------- dioses en alta resolución (32×44) con su arma ---------- */
const INK = C.ink;
function drawGod(id, fr) {
  const L = LOOKS[id] || {};
  const light = L.head === 'light';
  const c = fromFn(68, 92, ({ put, rect, ell, clear, ln }) => {
    const O = 1; // margen; todo se dibuja a 2× nativo
    const X = (x) => x + O,
      Y = (y) => y + O,
      Z = (v) => Math.round(2 * (v + O));
    const skin = light ? '#fff6e0' : L.s,
      robe = light ? '#fff6e0' : L.r,
      trim = light ? '#f4d27a' : L.t,
      hair = L.h || INK,
      hc = L.hc || C.gold;
    const P = (x, y, c2) => rect(Z(x), Z(y), 2, 2, c2),
      RR = (x, y, w, h, c2) => rect(Z(x), Z(y), Math.round(w * 2), Math.round(h * 2), c2),
      EL = (x, y, rx, ry, c2) => ell(2 * X(x), 2 * Y(y), rx * 2, ry * 2, c2),
      LN = (a, b, c1, d, c2) => {
        const n = Math.ceil(Math.max(Math.abs(c1 - a), Math.abs(d - b)) * 2) + 1;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          rect(Z(a + (c1 - a) * t), Z(b + (d - b) * t), 2, 2, c2);
        }
      },
      Q = (x, y, c2) => rect(Z(x), Z(y), 1, 1, c2),
      HL = (x, y, w, c2) => rect(Z(x), Z(y), Math.round(w * 2), 1, c2),
      VL = (x, y, h, c2) => rect(Z(x), Z(y), 1, Math.round(h * 2), c2),
      CLR = (x, y, w, h) => clear(Z(x), Z(y), w * 2, h * 2);
    // detrás del cuerpo
    if (L.ex === 'drums') {
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (0.95 + (i / 6) * 1.1);
        const dx = 16 + Math.cos(a) * 15,
          dy = 20 + Math.sin(a) * 13;
        EL(dx, dy, 2.6, 2.6, '#8a3a2a');
        EL(dx, dy, 1.4, 1.4, '#e8c86a');
      }
      LN(3, 20, 29, 20, '#5a3a2a');
    }
    if (L.ex === 'cape')
      for (let y = 19; y < 39; y++)
        RR(9 - Math.floor((y - 19) / 6), y, 14 + Math.floor((y - 19) / 3), 1, y % 5 ? L.cc : shade(L.cc, -0.15));
    if (L.hs === 'long' && !L.head) RR(10, 9, 12, 15, hair);
    if (L.ex === 'tail') {
      for (let i = 0; i < 10; i++) P(10 - i * 0.6, 34 - i * 0.9 - (i > 6 ? (i - 6) * 0.6 : 0), shade(L.h, -0.1));
    }
    if (L.ex === 'multiarm') {
      for (const [ax, ay, bx, by] of [
        [11, 22, 3, 14],
        [21, 22, 29, 14],
        [11, 24, 2, 22],
        [21, 24, 30, 22],
      ]) {
        LN(ax, ay, bx, by, skin);
        LN(ax, ay + 1, bx, by + 1, shade(skin, -0.15));
        RR(bx - 1, by - 1, 2, 2, skin);
      }
      RR(1, 10, 1, 5, '#c8ccd8');
      RR(30, 10, 1, 5, '#c8ccd8');
      EL(2, 22, 1.5, 1.5, C.gold);
      EL(30, 22, 1.5, 1.5, '#e27aa8');
    }
    // piernas
    const lo = fr ? 2 : 0;
    RR(12 - lo, 33, 3, 8, skin);
    RR(18 + lo, 33, 3, 8, skin);
    RR(11 - lo, 41, 5, 2, '#6a4a2a');
    RR(17 + lo, 41, 5, 2, '#6a4a2a');
    RR(12 - lo, 38, 3, 1, '#6a4a2a');
    RR(18 + lo, 38, 3, 1, '#6a4a2a');
    // túnica
    for (let y = 20; y <= 36; y++) {
      const half = Math.round(6 + (y - 20) * 0.3);
      RR(16 - half, y, half * 2, 1, robe);
    }
    for (let y = 21; y <= 34; y += 1) {
      RR(16 + Math.round(2 + (y - 20) * 0.25), y, 1, 1, shade(robe, -0.12));
    }
    RR(16 - 11, 35, 22, 2, trim);
    RR(10, 27, 12, 2, trim);
    LN(11, 20, 19, 27, trim);
    // detalle 2×: pliegues, ribete y sandalias
    {
      const fold = shade(robe, -0.16),
        hi = shade(robe, 0.12);
      for (const fx of [12.5, 15, 17.5, 20]) VL(fx, 27.5 + ((fx * 2) % 3) * 0.5, 7, fold);
      for (const fx of [13.5, 18.5]) VL(fx, 29, 5, hi);
      for (let x = 6; x < 27; x += 1.5) Q(x, 35.5, shade(trim, -0.3));
      HL(5, 36.5, 22, shade(trim, 0.2));
      HL(10, 27, 12, shade(trim, 0.25));
      Q(16, 27.5, '#ffffff');
      Q(15.5, 27.5, shade(trim, 0.35));
      const st = '#3a2416';
      for (const lx of [12 - lo, 18 + lo]) {
        HL(lx, 39.5, 3, st);
        HL(lx, 40.5, 3, st);
        VL(lx + 1.5, 38.5, 2, st);
      }
    }
    if (L.ex === 'sash') {
      LN(10, 22, 24, 30, '#e27aa8');
      LN(10, 23, 24, 31, '#e27aa8');
    }
    if (light) {
      for (let i = 0; i < 5; i++) RR(11 + i * 2, 22 + (i % 2), 1, 12, '#fff2c8');
    }
    // brazos
    const none = L.held === 'none' || light;
    RR(7, 21, 3, 9, skin);
    RR(7, 30, 3, 2, skin);
    if (none) {
      RR(22, 21, 3, 9, skin);
      RR(22, 30, 3, 2, skin);
      if (light || id === 'jesus') {
        RR(5, 29, 2, 2, skin);
        RR(25, 29, 2, 2, skin);
      }
    } else {
      RR(22, 21, 3, 5, skin);
      RR(23, 18, 3, 4, skin);
      RR(23, 17, 3, 2, shade(skin, -0.08));
    }
    RR(9, 20, 4, 2, shade(robe, 0.1));
    RR(19, 20, 4, 2, shade(robe, 0.1));
    VL(7, 21, 9, shade(skin, 0.15));
    VL(9.5, 21, 9, shade(skin, -0.18));
    HL(7, 29.5, 3, shade(skin, -0.1));
    // cuello
    RR(14, 18, 4, 3, shade(skin, -0.08));
    // cabeza
    const hd = L.head;
    if (hd === 'jackal') {
      const k = L.h;
      EL(16, 12, 5, 5, k);
      RR(19, 11, 7, 3, k);
      RR(24, 13, 2, 1, INK);
      LN(12, 8, 11, 0, k);
      LN(13, 8, 13, 0, k);
      LN(18, 8, 19, 0, k);
      LN(17, 8, 17, 0, k);
      P(12, 3, C.gold);
      P(18, 3, C.gold);
      P(18, 10, C.gold);
      P(19, 10, INK);
      RR(11, 17, 10, 2, C.gold);
      RR(11, 18, 10, 1, C.sea);
    } else if (hd === 'falcon') {
      const k = L.h;
      EL(16, 11, 6, 6, k);
      EL(17, 12, 4, 4, '#e8e0cc');
      RR(20, 10, 4, 2, C.gold);
      P(23, 12, C.gold);
      P(22, 12, shade(C.gold, -0.3));
      RR(17, 10, 2, 2, INK);
      LN(17, 12, 15, 16, INK);
      RR(9, 11, 2, 9, '#2f4f9e');
      RR(21, 13, 2, 6, '#2f4f9e');
      RR(9, 14, 2, 1, C.gold);
    } else if (hd === 'lion') {
      EL(16, 12, 8, 8, L.h);
      EL(16, 13, 5, 5, L.s);
      RR(13, 11, 2, 1, C.gold);
      RR(18, 11, 2, 1, C.gold);
      P(14, 11, INK);
      P(19, 11, INK);
      RR(15, 14, 3, 2, '#6a3a2a');
      RR(15, 17, 3, 1, '#8a2a1f');
    } else if (hd === 'monkey') {
      EL(16, 12, 6, 6, L.h);
      EL(9, 12, 2, 2.5, L.h);
      EL(23, 12, 2, 2.5, L.h);
      EL(16, 13, 4.5, 4, L.s);
      RR(13, 11, 2, 2, '#ffffff');
      RR(18, 11, 2, 2, '#ffffff');
      P(14, 12, INK);
      P(19, 12, INK);
      RR(15, 15, 3, 1, '#6a3a2a');
    } else if (light) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 6.283;
        LN(
          16 + Math.cos(a) * 6,
          11 + Math.sin(a) * 6,
          16 + Math.cos(a) * (i % 2 ? 11 : 9),
          11 + Math.sin(a) * (i % 2 ? 11 : 9),
          i % 2 ? '#f4d27a' : '#fff6e0'
        );
      }
      EL(16, 11, 6, 6.5, '#fff6e0');
      EL(16, 11, 4, 4.5, '#ffffff');
    } else {
      EL(16, 12, 6, 6.5, skin);
      RR(9, 11, 1, 3, skin);
      RR(22, 11, 1, 3, skin);
      RR(12, 11, 2, 2, '#ffffff');
      RR(18, 11, 2, 2, '#ffffff');
      P(13, 12, INK);
      P(19, 12, INK);
      RR(12, 10, 2, 1, shade(hair, -0.1));
      RR(18, 10, 2, 1, shade(hair, -0.1));
      P(16, 14, shade(skin, -0.18));
      Q(16, 13.5, shade(skin, 0.12));
      RR(15, 16, 3, 0.5, shade(skin, -0.4));
      Q(15, 16.5, shade(skin, -0.15));
      Q(17.5, 16.5, shade(skin, -0.15));
      for (const ex of [12, 18]) {
        Q(ex + 1, 12, '#ffffff');
        Q(ex + 1.5, 12, L.eye || '#3a2a1a');
        Q(ex + 1.5, 12.5, INK);
        Q(ex + 1, 12.5, L.eye || '#3a2a1a');
        HL(ex - 0.5, 10.5, 2.5, shade(skin, -0.45));
        Q(ex, 11, '#e8e8f0');
      }
      HL(11, 14, 1.5, '#f0a090');
      HL(19.5, 14, 1.5, '#f0a090');
      VL(9.5, 11.5, 2, shade(skin, -0.2));
      VL(22, 11.5, 2, shade(skin, -0.2));
      // pelo
      const hs = L.hs;
      if (hs === 'flame') {
        EL(16, 7, 6.5, 4, hair);
        for (let i = 0; i < 6; i++) RR(10 + i * 2, 1 + (i % 2) * 2, 2, 5 - (i % 2) * 2, i % 2 ? '#7ad0ff' : hair);
      } else if (hs !== 'bald') {
        EL(16, 7, 6.8, 4, hair);
        RR(9, 7, 2, 5, hair);
        RR(21, 7, 2, 5, hair);
        RR(12, 7, 8, 1, shade(hair, 0.15));
      }
      if (hs !== 'bald' && hs !== 'flame') {
        const hd2 = shade(hair, -0.22),
          hl2 = shade(hair, 0.28);
        for (let i = 0; i < 6; i++) {
          LN(11 + i * 2.2, 4.5, 10.5 + i * 2.2, 7.5, hd2);
        }
        for (let i = 0; i < 5; i++) Q(12 + i * 2, 4, hl2);
        HL(12.5, 4.5, 6, hl2);
        if (hs === 'long') {
          for (const sx of [9, 21.5]) for (let y = 8; y < 12; y += 1) Q(sx + (y % 2) * 0.5, y, hd2);
        }
      }
      if (hs === 'bun') EL(16, 2, 3, 2.5, hair);
      if (hs === 'buns') {
        EL(10, 4, 2.5, 2.5, hair);
        EL(22, 4, 2.5, 2.5, hair);
      }
      if (hs === 'spiky') for (let i = 0; i < 5; i++) LN(10 + i * 3, 6, 9 + i * 3, 1, hair);
      if (hs === 'bald') RR(12, 6, 8, 1, shade(skin, 0.12));
      // barba
      if (L.b === 'full') {
        EL(16, 17, 6, 4.5, L.bc);
        RR(10, 13, 2, 4, L.bc);
        RR(20, 13, 2, 4, L.bc);
        const bd = shade(L.bc, -0.2),
          bh = shade(L.bc, 0.22);
        for (let x = 11; x < 22; x += 1.5) VL(x, 16.5 + ((x * 2) % 2) * 0.5, 3, bd);
        for (let x = 12; x < 21; x += 3) VL(x + 0.5, 17, 2, bh);
        RR(15, 16, 3, 0.5, shade(L.bc, -0.45));
        HL(14, 19.5, 4, bh);
      }
      if (L.b === 'short') {
        EL(16, 17.5, 4, 2.5, L.bc);
        RR(15, 16, 3, 1, shade(skin, -0.35));
      }
      // extras de cara
      if (L.ex === 'eyepatch') {
        RR(12, 10, 3, 3, INK);
        LN(9, 9, 22, 8, INK);
      }
      if (L.ex === 'thirdeye') {
        RR(16, 8, 1, 2, C.blood);
        P(16, 8, '#f8e060');
      }
      if (L.ex === 'stripes') {
        RR(10, 11, 12, 1, INK);
        RR(10, 13, 12, 1, '#e8b53e');
        RR(10, 15, 12, 1, INK);
      }
      if (L.ex === 'mask') {
        for (const ex of [12, 18]) {
          RR(ex - 1, 10, 4, 1, '#2f4f9e');
          RR(ex - 1, 13, 4, 1, '#2f4f9e');
          RR(ex - 1, 10, 1, 4, '#2f4f9e');
          RR(ex + 2, 10, 1, 4, '#2f4f9e');
        }
        RR(14, 17, 5, 2, '#e8e0cc');
      }
    }
    // tocado
    const gc = L.gc || C.gold;
    switch (L.gear) {
      case 'laurel':
        for (let i = 0; i < 7; i++) {
          const x = 10 + i * 2,
            y = 6 + (i === 0 || i === 6 ? 1 : 0);
          P(x, y, gc === '#e8b53e' ? '#6f9a4c' : gc);
          P(x + 1, y - 1, shade(gc === '#e8b53e' ? '#6f9a4c' : gc, 0.2));
        }
        break;
      case 'crown':
        RR(10, 4, 12, 2, gc);
        for (const x of [10, 13, 16, 19, 21]) RR(x, 1 + (x === 16 ? 0 : 1), 1, 3, gc);
        P(16, 4, C.blood);
        P(12, 4, '#7de0ff');
        P(20, 4, '#7de0ff');
        break;
      case 'helmet':
        EL(16, 7, 7, 5, gc);
        RR(9, 7, 14, 1, shade(gc, -0.2));
        RR(15, 9, 2, 5, gc);
        RR(11, 0, 11, 3, C.blood);
        RR(11, 0, 11, 1, shade(C.blood, 0.2));
        CLR(12, 10, 2, 2);
        CLR(18, 10, 2, 2);
        RR(12, 11, 2, 1, '#ffffff');
        RR(18, 11, 2, 1, '#ffffff');
        break;
      case 'horns':
        LN(11, 6, 8, 1, gc);
        LN(12, 6, 9, 1, gc);
        LN(21, 6, 24, 1, gc);
        LN(20, 6, 23, 1, gc);
        break;
      case 'feathers':
        for (let i = -3; i <= 3; i++) {
          const tx = 16 + i * 3,
            ty = Math.abs(i) < 2 ? -0 : 1;
          LN(16, 6, tx, ty, i % 2 ? gc : shade(gc, 0.25));
          P(tx, ty, i % 2 ? C.gold : C.blood);
        }
        RR(10, 5, 12, 2, C.gold);
        P(13, 5, C.sea);
        P(19, 5, C.sea);
        break;
      case 'sun':
        EL(16, 3, 3.5, 3, C.gold);
        EL(16, 3, 2.2, 1.8, '#f2622c');
        RR(11, 6, 10, 1, C.gold);
        break;
      case 'moon':
        EL(16, 3, 3.5, 3, '#e8eef8');
        CLR(15, 0, 5, 4);
        RR(14, 0, 1, 1, '#e8eef8');
        RR(11, 6, 10, 1, '#c8ccd8');
        break;
      case 'halo':
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * 6.283;
          P(16 + Math.cos(a) * 6, 2 + Math.sin(a) * 1.6, '#f4d27a');
        }
        break;
      case 'band':
        RR(10, 6, 12, 2, gc);
        P(9, 8, gc);
        P(22, 8, gc);
        break;
      case 'hat':
        RR(7, 5, 18, 2, gc);
        EL(16, 3, 5, 3, gc);
        RR(11, 4, 10, 1, shade(gc, 0.2));
        break;
      case 'diadem':
        RR(11, 5, 10, 1, gc);
        P(16, 4, gc);
        P(16, 3, '#7de0ff');
        break;
    }
    // escudo en el brazo izquierdo
    if (L.ex === 'shield') {
      EL(8, 27, 5, 5.5, shade(trim, -0.1));
      EL(8, 27, 3.6, 4, trim);
      EL(8, 27, 1.5, 1.5, C.gold);
    }
    // arma en la mano derecha (mano en 24,18)
    const wd = shade(hc, -0.25),
      wl = shade(hc, 0.35),
      wood = '#6a4a2a';
    switch (L.held) {
      case 'trident':
        RR(25, 2, 1, 40, wd);
        RR(24, 2, 1, 38, hc);
        RR(21, 6, 8, 1, hc);
        RR(21, 2, 1, 5, hc);
        RR(28, 2, 1, 5, hc);
        P(21, 1, wl);
        P(28, 1, wl);
        P(24, 0, wl);
        P(24, 1, hc);
        break;
      case 'bident':
        RR(24, 3, 1, 39, hc);
        RR(25, 3, 1, 39, wd);
        RR(21, 6, 7, 1, hc);
        RR(21, 1, 1, 6, hc);
        RR(27, 1, 1, 6, hc);
        P(21, 0, wl);
        P(27, 0, wl);
        break;
      case 'bolt':
        for (const [a, b2, c2, d] of [
          [27, 1, 22, 10],
          [22, 10, 26, 10],
          [26, 10, 21, 21],
        ]) {
          LN(a, b2, c2, d, hc);
          LN(a + 1, b2, c2 + 1, d, hc);
        }
        LN(27, 2, 23, 10, '#ffffff');
        LN(25, 11, 22, 19, '#ffffff');
        break;
      case 'bow':
        for (let i = 0; i <= 24; i++) {
          const t = i / 24;
          P(25 + Math.round(4 * Math.sin(Math.PI * t)), 6 + i, i % 3 ? hc : wd);
        }
        LN(25, 6, 25, 30, '#e8e0cc');
        break;
      case 'spear':
        RR(24, 3, 1, 40, wood);
        RR(25, 3, 1, 40, shade(wood, -0.2));
        RR(23, 0, 3, 4, hc);
        P(24, -0, wl);
        RR(23, 4, 3, 1, C.gold);
        break;
      case 'hammer':
        RR(24, 14, 2, 14, wood);
        RR(20, 8, 10, 7, hc);
        RR(20, 8, 10, 1, wl);
        RR(20, 14, 10, 1, wd);
        RR(22, 10, 1, 3, '#c9a15a');
        RR(27, 10, 1, 3, '#c9a15a');
        break;
      case 'axe':
        RR(24, 6, 2, 26, wood);
        EL(28, 10, 3, 4.5, hc);
        RR(26, 6, 1, 8, wd);
        P(29, 7, wl);
        break;
      case 'doubleaxe':
        RR(24, 4, 2, 28, wood);
        EL(20.5, 9, 3, 4, hc);
        EL(29.5, 9, 3, 4, hc);
        P(19, 6, wl);
        P(31, 6, wl);
        RR(23, 8, 4, 2, C.gold);
        break;
      case 'club':
        RR(24, 14, 2, 14, wood);
        EL(25, 10, 3.5, 4.5, hc);
        P(24, 7, wl);
        break;
      case 'mace':
        RR(24, 14, 2, 14, shade(hc, -0.4));
        EL(25, 10, 3.5, 3.5, hc);
        for (const [a, b2] of [
          [25, 5],
          [21, 10],
          [29, 10],
          [25, 14],
        ])
          P(a, b2, wl);
        break;
      case 'sword':
        RR(24, 1, 2, 16, hc);
        P(24, 0, wl);
        RR(25, 1, 1, 16, wd);
        RR(21, 17, 8, 1, C.gold);
        RR(24, 18, 2, 3, wood);
        break;
      case 'katana':
        for (let i = 0; i < 18; i++) {
          P(24 + Math.round(i * 0.22), 17 - i, hc);
          P(25 + Math.round(i * 0.22), 17 - i, wl);
        }
        RR(22, 18, 6, 1, C.gold);
        RR(24, 19, 2, 4, '#3a2a5a');
        break;
      case 'khopesh':
        RR(24, 16, 2, 6, wood);
        for (let i = 0; i < 10; i++) RR(25 + Math.round(Math.sin((i / 9) * 2.4) * 4), 15 - i, 2, 1, hc);
        RR(24, 5, 3, 1, hc);
        break;
      case 'machete':
        for (let i = 0; i < 12; i++) RR(24 + Math.round(i * 0.15), 4 + i, 3, 1, i < 2 ? wl : hc);
        RR(24, 16, 2, 5, wood);
        break;
      case 'staff':
        RR(24, 0, 2, 42, hc);
        RR(25, 0, 1, 42, wd);
        EL(25, 1, 2.5, 2.5, id === 'wukong' ? C.gold : wl);
        if (id === 'quetzalcoatl') {
          for (let i = 0; i < 5; i++) P(22 + i, 2 + (i % 2), C.gold);
        }
        if (id === 'ra') {
          RR(24, 1, 4, 1, hc);
          P(27, 2, hc);
        }
        break;
      case 'orb':
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * 6.283;
          P(25 + Math.cos(a) * 5, 13 + Math.sin(a) * 5, shade(hc, 0.2));
        }
        EL(25, 13, 3.5, 3.5, hc);
        EL(24, 12, 1.5, 1.5, wl);
        P(24, 11, '#ffffff');
        break;
      case 'disc':
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * 6.283;
          P(25 + Math.cos(a) * 4.5, 12 + Math.sin(a) * 4.5, hc);
          P(25 + Math.cos(a) * 3.5, 12 + Math.sin(a) * 3.5, wd);
        }
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * 6.283;
          LN(25, 12, 25 + Math.cos(a) * 3, 12 + Math.sin(a) * 3, wl);
        }
        RR(24, 16, 2, 3, skin);
        break;
      case 'mirror':
        EL(26, 14, 4.5, 4.5, C.gold);
        EL(26, 14, 3.5, 3.5, hc);
        P(25, 12, '#ffffff');
        P(24, 13, '#ffffff');
        RR(25, 18, 2, 4, wood);
        break;
      case 'net':
        for (let i = 0; i <= 8; i += 2) {
          LN(20, 8 + i, 30, 8 + i, hc);
          LN(20 + i + 1, 8, 20 + i + 1, 16, hc);
        }
        break;
      case 'sling':
        LN(24, 18, 28, 8, '#c8a878');
        LN(26, 18, 29, 9, '#c8a878');
        EL(28.5, 7, 2, 2, hc);
        P(28, 6, '#ffffff');
        break;
      case 'ball':
        EL(26, 15, 3.5, 3.5, '#3a2a1a');
        P(25, 13, '#7a5a3a');
        P(26, 13, '#7a5a3a');
        break;
    }
  });
  return variants(hiPaint(c, light ? '#b8862f' : INK));
}
const GSPR = {};
function godSprites(id) {
  if (!GSPR[id]) GSPR[id] = [drawGod(id, 0), drawGod(id, 1)];
  return GSPR[id];
}
