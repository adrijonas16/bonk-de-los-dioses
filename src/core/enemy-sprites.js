/* ---------- enemigos: arte base + escalado EPX ---------- */
function enemyBase(d, fr) {
  const c = d.col,
    a = d.acc,
    hi = shade(c, 0.25),
    lw = shade(c, -0.3),
    bone = '#e8e0cc';
  switch (d.arch) {
    case 'blob':
      return fromFn(12, 13, ({ put, rect, ell }) => {
        ell(6, 5, 5, 5, c);
        rect(1, 5, 10, 5, c);
        for (let i = 0; i < 5; i++) rect(1 + i * 2, 10, 1, 2 + ((i + fr) % 2), c);
        rect(3, 1, 5, 1, hi);
        if (d.feat === 'hair') {
          rect(1, 0, 10, 3, '#14100e');
          rect(1, 3, 2, 8, '#14100e');
          rect(9, 3, 2, 8, '#14100e');
        }
        if (d.feat === 'flame') {
          rect(4, 0, 1, 2, a);
          rect(6, 0, 1, 1, a);
          rect(7, 0, 1, 2, a);
        }
        rect(4, 5, 1, 2, a);
        rect(7, 5, 1, 2, a);
      });
    case 'flyer':
      return fromFn(16, 11, ({ put, rect, ell }) => {
        for (let i = 0; i < 6; i++) {
          const o = fr ? Math.round(i * 0.5) : -Math.round(i * 0.6);
          rect(1 + i, 4 + o, 1, 2, c);
          rect(14 - i, 4 + o, 1, 2, c);
        }
        ell(8, 5, 3, 3, c);
        rect(7, 8, 1, 2, lw);
        rect(9, 8, 1, 2, lw);
        put(7, 4, a);
        put(9, 4, a);
        rect(7, 3, 3, 1, hi);
        if (d.feat === 'beak') rect(10, 5, 3, 1, a);
        if (d.feat === 'ears') {
          put(6, 1, c);
          put(10, 1, c);
        }
      });
    case 'beast':
      return fromFn(16, 11, ({ put, rect, ell }) => {
        ell(7, 5, 6, 3, c);
        rect(2, 3, 10, 1, hi);
        ell(13, 3, 3, 3, c);
        rect(14, 4, 2, 2, c);
        put(13, 2, a);
        const l = fr ? 1 : 0;
        rect(3 + l, 8, 1, 3, lw);
        rect(5 - l, 8, 1, 3, lw);
        rect(9 + l, 8, 1, 3, lw);
        rect(11 - l, 8, 1, 3, lw);
        rect(0, 3, 2, 1, c);
        if (d.feat === 'horns') {
          put(11, 0, bone);
          put(12, 0, bone);
          put(15, 0, bone);
          put(15, 1, bone);
        }
        if (d.feat === 'tails') {
          rect(0, 1, 2, 1, a);
          rect(0, 5, 2, 1, a);
          put(1, 0, a);
        }
        if (d.feat === 'ears') {
          put(12, 0, c);
          put(14, 0, c);
        }
      });
    case 'humanoid':
      return fromFn(11, 15, ({ put, rect, ell }) => {
        const sk = d.feat === 'skull';
        ell(5, 3, 3, 3, sk ? bone : c);
        rect(3, 6, 5, 5, c);
        rect(3, 6, 5, 1, hi);
        const l = fr ? 1 : 0;
        if (d.feat === 'hop') {
          rect(0, 7, 3, 1, c);
          rect(8, 7, 3, 1, c);
          rect(3, 11, 2, 3, lw);
          rect(6, 11, 2, 3, lw);
          rect(4, 1, 3, 2, a);
        } else {
          rect(2, 7, 1, 3, c);
          rect(8, 7, 1, 3, c);
          rect(3 + l, 11, 2, 3, lw);
          rect(6 - l, 11, 2, 3, lw);
        }
        put(4, 3, sk ? INK : a);
        put(6, 3, sk ? INK : a);
        if (d.feat === 'helmet') {
          rect(2, 0, 7, 2, a);
          rect(5, 0, 1, 1, shade(a, 0.3));
        }
        if (d.feat === 'horns') {
          put(2, 0, bone);
          put(8, 0, bone);
          put(2, 1, bone);
          put(8, 1, bone);
        }
        if (sk) {
          rect(3, 7, 5, 1, bone);
          rect(3, 9, 5, 1, bone);
        }
        if (d.feat === 'stinger') {
          put(9, 5, a);
          put(10, 4, a);
          put(10, 3, a);
        }
        if (d.feat === 'spear') {
          rect(9, 1, 1, 12, '#8a6a3a');
          put(9, 0, '#c8c8c8');
        }
      });
    case 'giant':
      return fromFn(18, 20, ({ put, rect, ell }) => {
        ell(9, 9, 8, 7, c);
        rect(4, 4, 10, 1, hi);
        const l = fr ? 1 : 0;
        rect(4 + l, 15, 4, 4, lw);
        rect(10 - l, 15, 4, 4, lw);
        rect(0, 7, 2, 6, c);
        rect(16, 7, 2, 6, c);
        if (d.feat === 'oneeye') {
          ell(9, 6, 3, 2, C.bone);
          put(9, 6, a);
          put(9, 7, a);
        } else {
          put(7, 6, a);
          put(11, 6, a);
        }
        if (d.feat === 'horns') {
          put(5, 1, bone);
          put(4, 0, bone);
          put(13, 1, bone);
          put(14, 0, bone);
        }
        rect(7, 10, 5, 1, lw);
      });
    default:
      return fromFn(16, 9, ({ put, rect, ell }) => {
        ell(8, 4, 6, 2, c);
        rect(3, 3, 10, 1, hi);
        const l = fr ? 1 : 0;
        for (let i = 0; i < 4; i++) {
          put(4 + i * 2, 7 + ((i + l) % 2), lw);
          put(4 + i * 2, 1 - ((i + l) % 2), lw);
        }
        if (d.feat === 'tail') {
          put(1, 4, c);
          put(0, 3, c);
          put(0, 2, c);
          put(1, 1, a);
        } else {
          rect(13, 3, 3, 2, c);
          put(15, 3, a);
        }
        put(12, 3, a);
      });
  }
}
function hiSprite(base, ol) {
  return variants(hiPaint(epx(epx(base)), ol));
}
const ESPR = {};
function enemySprites(key) {
  if (ESPR[key]) return ESPR[key];
  const d = ENEMIES[key];
  const ol = lum(d.col) < 0.2 ? shade(d.col, 0.55) : INK;
  ESPR[key] = [0, 1].map((fr) => hiSprite(enemyBase(d, fr), ol));
  return ESPR[key];
}
const MISC = {};
function miscSprites() {
  if (MISC.done) return MISC;
  const rows = (rs, pal) =>
    fromFn(Math.max(...rs.map((r) => r.length)), rs.length, ({ put }) => {
      rs.forEach((r, j) => {
        for (let i = 0; i < r.length; i++) {
          const ch = r[i];
          if (ch !== '.') put(i, j, pal[ch]);
        }
      });
    });
  const P = {
    k: INK,
    b: C.bone,
    g: C.gold,
    r: C.blood,
    s: C.sea,
    p: C.purple,
    w: '#ffffff',
    y: '#f4d27a',
    t: '#6a4a2a',
    n: '#2a2a33',
  };
  MISC.skull = hiSprite(
    rows(['.bbbbb.', 'bbbbbbb', 'bkbbbkb', 'bkbbbkb', 'bbbbbbb', '.bbkbb.', '.b.b.b.'], P),
    C.purple
  );
  MISC.dove = hiSprite(rows(['w.....w', 'ww...ww', '.wwwww.', '..wwwg.', '...ww..'], P), '#b8b0a0');
  MISC.crow = hiSprite(rows(['n.....n', 'nn...nn', '.nnnnn.', '..nnng.', '...nn..'], P), '#5a5a6a');
  MISC.pom = hiSprite(rows(['..kk..', '.rrrr.', 'rrbrrr', 'rrrrrr', 'rrrrrr', '.rrrr.'], P), INK);
  MISC.llama = hiSprite(
    rows(
      ['........ww', '........wwk', '.......www', 'wwwwwwwww.', 'wwwrwswww.', 'wwwwwwwww.', '.w.w..w.w.', '.w.w..w.w.'],
      P
    ),
    '#8a8070'
  );
  MISC.lion = [0, 1].map((fr) => hiSprite(enemyBase({ arch: 'beast', col: '#d8a02a', acc: INK, feat: '' }, fr), INK));
  MISC.dog = [0, 1].map((fr) =>
    hiSprite(enemyBase({ arch: 'beast', col: '#e8e0cc', acc: INK, feat: 'ears' }, fr), INK)
  );
  MISC.done = true;
  return MISC;
}
