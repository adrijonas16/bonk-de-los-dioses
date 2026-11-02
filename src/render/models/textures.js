/* ---------- texturas de la cara y el cuerpo ---------- */
function faceCv(L, id) {
  const skin = L.s,
    hair = L.h || INK,
    hs = L.hs || 'short',
    eye = L.eye || '#2a1a10';
  return pcv(16, 16, (P, R) => {
    R(0, 0, 16, 16, skin);
    // sombreado suave de mejillas y barbilla
    R(0, 14, 16, 2, shade(skin, -0.1));
    R(0, 12, 1, 4, shade(skin, -0.08));
    R(15, 12, 1, 4, shade(skin, -0.08));
    if (hs !== 'bald') {
      const hc = hs === 'flame' ? '#5ab0ff' : hair;
      R(0, 0, 16, 3, hc);
      for (let x = 0; x < 16; x++) {
        if (x % 3 !== 1) P(x, 3, hc);
      }
      R(0, 0, 2, 8, hc);
      R(14, 0, 2, 8, hc);
      if (hs === 'long') {
        R(0, 0, 1, 12, hc);
        R(15, 0, 1, 12, hc);
      }
      for (let x = 1; x < 16; x += 3) P(x, 1, shade(hc, 0.25));
      for (let x = 2; x < 16; x += 4) P(x, 2, shade(hc, -0.2));
    } else {
      R(2, 0, 12, 2, shade(skin, 0.1));
    }
    const br = hs === 'bald' ? shade(skin, -0.4) : shade(hair, -0.15);
    R(3, 5, 3, 1, br);
    R(10, 5, 3, 1, br);
    // ojos 3×2 con brillo
    for (const [x0, dir] of [
      [3, 1],
      [10, -1],
    ]) {
      R(x0, 6, 3, 2, '#ffffff');
      const ix = dir > 0 ? x0 + 1 : x0;
      R(ix, 6, 2, 2, eye);
      P(ix, 7, INK);
      P(ix + (dir > 0 ? 1 : 0), 7, INK);
      P(ix, 6, '#ffffff');
    }
    P(7, 9, shade(skin, -0.18));
    P(8, 9, shade(skin, -0.18));
    P(7, 8, shade(skin, 0.1));
    R(6, 11, 4, 1, shade(skin, -0.45));
    P(5, 11, shade(skin, -0.2));
    P(10, 11, shade(skin, -0.2));
    P(2, 9, '#f09a8a');
    P(3, 9, '#f0a898');
    P(12, 9, '#f0a898');
    P(13, 9, '#f09a8a');
    if (L.b === 'full') {
      const bc = L.bc;
      R(1, 9, 14, 7, bc);
      R(4, 10, 8, 1, shade(bc, 0.15));
      R(6, 11, 4, 1, shade(bc, -0.5));
      for (let x = 2; x < 15; x += 2) R(x, 12 + (x % 4 ? 1 : 0), 1, 3, shade(bc, -0.2));
      for (let x = 3; x < 14; x += 4) P(x, 13, shade(bc, 0.25));
      R(0, 8, 1, 6, bc);
      R(15, 8, 1, 6, bc);
    }
    if (L.b === 'short') {
      const bc = L.bc;
      R(4, 10, 8, 1, bc);
      R(4, 12, 8, 4, bc);
      R(6, 11, 4, 1, shade(skin, -0.45));
      for (let x = 5; x < 12; x += 2) P(x, 14, shade(bc, -0.2));
    }
    if (L.ex === 'eyepatch') {
      R(2, 5, 5, 4, INK);
      for (let x = 0; x < 16; x++) P(x, Math.round(4 - x * 0.15), INK);
    }
    if (L.ex === 'thirdeye') {
      R(7, 3, 2, 2, '#e23a2a');
      P(7, 3, '#f8e060');
    }
    if (L.ex === 'stripes') {
      R(0, 6, 16, 1, '#1c1210');
      R(0, 8, 16, 1, '#e8b53e');
      R(0, 10, 16, 1, '#1c1210');
    }
    if (L.ex === 'mask') {
      for (const x0 of [2, 9]) {
        R(x0, 5, 5, 1, '#2f4f9e');
        R(x0, 8, 5, 1, '#2f4f9e');
        R(x0, 5, 1, 4, '#2f4f9e');
        R(x0 + 4, 5, 1, 4, '#2f4f9e');
      }
      R(5, 12, 6, 2, '#e8e0cc');
      P(6, 14, '#e8e0cc');
      P(9, 14, '#e8e0cc');
    }
  });
}
function sideCv(L) {
  const skin = L.s,
    hair = L.h || INK,
    hs = L.hs || 'short';
  return pcv(16, 16, (P, R) => {
    R(0, 0, 16, 16, skin);
    R(0, 14, 16, 2, shade(skin, -0.1));
    if (hs !== 'bald') {
      const hc = hs === 'flame' ? '#5ab0ff' : hair;
      const deep = hs === 'long' ? 16 : 10;
      R(0, 0, 16, 4, hc);
      R(9, 0, 7, deep, hc);
      for (let y = 4; y < deep; y += 2) P(9, y, shade(hc, -0.2));
      P(3, 1, shade(hc, 0.25));
      P(7, 2, shade(hc, 0.25));
    }
    R(6, 7, 3, 4, shade(skin, -0.12));
    P(7, 8, shade(skin, -0.3));
    if (L.b === 'full') {
      R(0, 9, 6, 7, L.bc);
    }
  });
}
function backCv(L) {
  const skin = L.s,
    hair = L.h || INK,
    hs = L.hs || 'short';
  return pcv(16, 16, (P, R) => {
    R(0, 0, 16, 16, skin);
    if (hs !== 'bald') {
      const hc = hs === 'flame' ? '#5ab0ff' : hair;
      R(0, 0, 16, hs === 'long' ? 16 : 11, hc);
      for (let x = 1; x < 16; x += 3) R(x, 2, 1, hs === 'long' ? 13 : 8, shade(hc, -0.18));
      for (let x = 2; x < 16; x += 5) P(x, 1, shade(hc, 0.25));
    }
  });
}
function topCv(L) {
  const hair = L.hs === 'bald' ? shade(L.s, 0.06) : L.hs === 'flame' ? '#5ab0ff' : L.h || INK;
  return pcv(8, 8, (P, R) => {
    R(0, 0, 8, 8, hair);
    for (let i = 0; i < 8; i++) P((i * 3) % 8, i, shade(hair, 0.2));
  });
}
function chestCv(robe, trim, light, sash) {
  return pcv(16, 16, (P, R) => {
    R(0, 0, 16, 16, robe);
    for (let y = 0; y < 16; y++) {
      P(3, y, shade(robe, -0.1));
      P(12, y, shade(robe, -0.1));
    }
    R(5, 0, 6, 1, shade(robe, -0.2));
    for (let i = 0; i < 4; i++) {
      P(6 + i, 1 + i > 3 ? 3 : 1 + i, trim);
    }
    for (let i = 0; i < 16; i++) {
      P(i, Math.min(15, Math.floor(i * 0.85)), trim);
      P(i, Math.min(15, Math.floor(i * 0.85) + 1), shade(trim, -0.2));
    }
    if (sash)
      for (let i = 0; i < 16; i++) {
        P(15 - i, Math.floor(i * 0.9), sash);
        P(15 - i, Math.floor(i * 0.9) + 1, sash);
      }
    if (light) for (let x = 2; x < 16; x += 3) R(x, 0, 1, 16, '#fff2c8');
  });
}
function skirtCv(robe, trim) {
  return pcv(16, 12, (P, R) => {
    R(0, 0, 16, 12, robe);
    for (let x = 1; x < 16; x += 3) {
      R(x, 1, 1, 8, shade(robe, -0.14));
      P(x + 1, 2, shade(robe, 0.1));
    }
    R(0, 9, 16, 3, trim);
    for (let x = 0; x < 16; x += 2) P(x, 10, shade(trim, -0.35));
    R(0, 9, 16, 1, shade(trim, 0.2));
  });
}
