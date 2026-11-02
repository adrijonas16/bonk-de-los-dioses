/* ---------- reparto de decorados ---------- */
const AK = {
  tree1: ['tree_single_A', 80, 0.12, 'tree'],
  tree2: ['tree_single_B', 84, 0.12, 'tree'],
  treesL: ['trees_A_large', 95, 0.22, 'tree'],
  treesM: ['trees_A_medium', 100, 0.2, 'tree'],
  treesBL: ['trees_B_large', 105, 0.22, 'tree'],
  treesBM: ['trees_B_medium', 98, 0.2, 'tree'],
  rockA: ['rock_single_A', 14, 0.4, 'rock'],
  rockB: ['rock_single_B', 22, 0.4, 'rock'],
  rockC: ['rock_single_C', 30, 0.4, 'rock'],
  rockD: ['rock_single_D', 26, 0.4, 'rock'],
  rockE: ['rock_single_E', 34, 0.4, 'rock'],
  stones: ['resource_stone', 26, 0.35, 'rock'],
  deadL: ['tree_dead_large', 120, 0.07, 'deadtree'],
  deadM: ['tree_dead_medium', 100, 0.07, 'deadtree'],
  deadS: ['tree_dead_small', 70, 0.08, 'deadtree'],
  pineO: ['tree_pine_orange_large', 130, 0.1, 'pine'],
  pineY: ['tree_pine_yellow_large', 130, 0.1, 'pine'],
  pineOM: ['tree_pine_orange_medium', 105, 0.1, 'pine'],
  grave: ['grave_A', 20, 0.4, 'rock'],
  graveB: ['grave_B', 20, 0.4, 'rock'],
  gstone: ['gravestone', 20, 0.3, 'menhir'],
  gmark: ['gravemarker_A', 16, 0, 'menhir'],
  crypt: ['crypt', 95, 0.42, 'shrine'],
  lantern: ['lantern_standing', 20, 0, 'toro'],
  postlan: ['post_lantern', 52, 0, 'redlantern'],
  postskull: ['post_skull', 52, 0, 'skullpile'],
  skull: ['skull', 11, 0, 'skullpile'],
  skullc: ['skull_candle', 14, 0, 'candle'],
  bone: ['bone_A', 7, 0, 'skullpile'],
  rib: ['ribcage', 16, 0, 'skullpile'],
  arch: ['arch', 80, 0, 'torii'],
  fence: ['fence', 22, 0, 'rock'],
  shrinec: ['shrine_candles', 30, 0.3, 'candle'],
  candles: ['candle_triple', 13, 0, 'candle'],
  coffin: ['coffin_decorated', 14, 0.3, 'rock'],
  pumpkin: ['pumpkin_orange', 12, 0, 'pot'],
  column: ['column', 48, 0.35, 'column'],
  pillar: ['pillar', 100, 0.32, 'column'],
  pillarD: ['pillar_decorated', 105, 0.28, 'column'],
  torch: ['torch_lit', 34, 0, 'candle'],
  bannerR: ['banner_patternA_red', 62, 0, 'column'],
  bannerT: ['banner_thin_yellow', 62, 0, 'column'],
  rubble: ['rubble_large', 55, 0.38, 'rock'],
  rubbleH: ['rubble_half', 45, 0.38, 'rock'],
  barrel: ['barrel_large', 22, 0.4, 'pot'],
  crates: ['crates_stacked', 30, 0.4, 'rock'],
  coins: ['coin_stack_large', 12, 0, 'pot'],
  swords: ['sword_shield_gold', 26, 0, 'rock'],
  cloudB: ['cloud_big', 80, 0, 'cloud'],
  cloudS: ['cloud_small', 60, 0, 'cloud'],
  lily: ['waterlily_A', 8, 0, 'lotus'],
  wplant: ['waterplant_A', 14, 0, 'reeds'],
  wplant2: ['waterplant_B', 18, 0, 'reeds'],
  tent: ['tent', 60, 0.4, 'shrine'],
};
const REALM_PROPS = {
  tartaro: [
    ['brokencol', 40],
    ['A:rockC', 60, 0, '#8a6a60'],
    ['A:rockE', 40, 0, '#7a5a50'],
    ['chainpost', 26],
    ['A:pillar', 16, 0, '#e0c8b0'],
    ['A:column', 30, 0, '#e0c8b0'],
    ['A:rubble', 16, 0, '#d0b8a0'],
    ['A:rubbleH', 14, 0, '#d0b8a0'],
    ['A:deadL', 22, 0, '#5a4040'],
    ['A:deadM', 22, 0, '#5a4040'],
    ['A:skull', 30],
    ['A:rib', 14],
    ['A:torch', 30],
    ['obsidian', 40],
  ],
  jotunheim: [
    ['A:pineO', 60, 0, '#a8d8c8'],
    ['A:pineOM', 50, 0, '#98c8b8'],
    ['pine', 70],
    ['A:rockC', 40, 0, '#c8d8e8'],
    ['A:rockE', 30, 0, '#c8d8e8'],
    ['icecrystal', 50],
    ['runestone', 20],
    ['A:deadM', 20, 0, '#8a9aa8'],
  ],
  duat: [
    ['palm', 70],
    ['A:rockC', 30, 0, '#f0d0a0'],
    ['A:rockE', 25, 0, '#f0d0a0'],
    ['A:stones', 14, 0, '#f0d8a8'],
    ['reeds', 60, 'wet'],
    ['A:wplant', 40, 'wet'],
    ['obelisk', 16],
    ['A:pillar', 10, 0, '#f0d8a8'],
  ],
  kur: [
    ['reeds', 80, 'wet'],
    ['palm', 50],
    ['A:rockC', 25, 0, '#d8b090'],
    ['tablets', 60],
    ['A:barrel', 12],
    ['A:crates', 8],
    ['A:bannerT', 10],
    ['A:torch', 24],
  ],
  lanka: [
    ['A:treesL', 40],
    ['A:treesBL', 30],
    ['A:tree1', 60],
    ['A:tree2', 60],
    ['palm', 50],
    ['lotus', 50, 'wet'],
    ['A:lily', 60, 'wet'],
    ['A:rockD', 30],
    ['stupa', 10],
  ],
  yomi: [
    ['bamboo', 80],
    ['toro', 40],
    ['A:lantern', 40],
    ['A:gstone', 30],
    ['A:gmark', 24],
    ['A:deadL', 24, 0, '#6a7a6a'],
    ['A:treesBM', 30, 0, '#5a7a60'],
    ['A:rockC', 30, 0, '#7a8a7a'],
  ],
  diyu: [
    ['redlantern', 50],
    ['A:postlan', 30],
    ['plumtree', 70],
    ['A:rockC', 40, 0, '#a07070'],
    ['A:coffin', 10],
    ['A:skullc', 30],
    ['A:bannerR', 14],
  ],
  mictlan: [
    ['skullpile', 30],
    ['A:skull', 40],
    ['A:skullc', 50],
    ['A:candles', 60],
    ['candle', 40],
    ['A:grave', 20],
    ['A:gstone', 20],
    ['A:shrinec', 12],
    ['A:pumpkin', 24],
    ['obsidian', 30],
    ['nopal', 60],
    ['agave', 60],
  ],
  xibalba: [
    ['A:treesBL', 40, 0, '#6a9a6a'],
    ['A:treesL', 40, 0, '#6a9a6a'],
    ['A:tree2', 60, 0, '#7aa07a'],
    ['jtreedark', 60],
    ['fern', 120],
    ['stele', 36],
    ['A:postskull', 16],
    ['A:rockC', 40, 0, '#8a9a8a'],
  ],
  ukupacha: [
    ['incahouse', 0],
    ['apacheta', 20],
    ['A:rockC', 40, 0, '#c8c0b0'],
    ['A:rockE', 30, 0, '#c8c0b0'],
    ['A:stones', 20, 0, '#d0c8b8'],
    ['qeuña', 50],
    ['A:tree1', 20],
    ['agave', 30],
  ],
  orun: [
    ['A:treesL', 50],
    ['A:treesM', 40],
    ['A:tree1', 70],
    ['A:tree2', 70],
    ['A:rockD', 40],
    ['A:wplant2', 40, 'wet'],
    ['A:lily', 40, 'wet'],
    ['pot', 40],
  ],
  annwn: [
    ['menhir', 40],
    ['A:pineY', 40],
    ['A:pineOM', 40],
    ['A:deadM', 40],
    ['A:rockC', 40, 0, '#a8b0b8'],
    ['A:gstone', 20],
    ['A:fence', 14],
    ['A:tree2', 30],
  ],
  cielo: [
    ['A:cloudB', 50],
    ['A:cloudS', 60],
    ['cloud', 60],
    ['A:pillarD', 20, 0, '#fff8e0'],
    ['A:column', 24, 0, '#ffffff'],
    ['goldpillar', 20],
  ],
  vacio: [
    ['crystal', 90],
    ['floatrock', 60],
    ['A:pillar', 20, 0, '#7a5a9a'],
    ['A:rubble', 14, 0, '#6a5a8a'],
    ['A:deadL', 20, 0, '#8a6ab0'],
    ['torii', 6],
    ['obelisk', 8],
  ],
};
function extraKinds() {
  const g = GEO,
    K = propKinds();
  if (K.incahouse) return K;
  Object.assign(K, {
    incahouse: {
      c: 24,
      h: 40,
      p: [
        [g.box(44, 22, 32), MLT('#b8b0a0', 'wall'), 0, 11, 0],
        [g.cone(34, 26, 4), MLT('#c8a050', 'thatch'), 0, 35, 0, 0, 0.785, 0],
      ],
    },
    incawall: { c: 0, h: 0, p: [[g.box(60, 16, 10), MLT('#b0a898', 'wall'), 0, 8, 0]] },
    suntemple: {
      c: 40,
      h: 50,
      p: [
        [g.cyl(40, 44, 40, 12), MLT('#c0b8a8', 'wall'), 0, 20, 0],
        [g.cyl(44, 46, 6, 12), MLT('#a8a090', 'wall'), 0, 2, 0],
      ],
    },
    intihuatana: {
      c: 10,
      h: 30,
      p: [
        [g.box(30, 14, 30), MLT('#a8a090', 'wall'), 0, 7, 0],
        [g.box(12, 20, 8), MLT('#c0b8a8', 'wall'), 0, 24, 0, 0, 0.3, 0],
      ],
    },
    qeuña: {
      c: 4,
      h: 44,
      p: [
        [g.cyl(2.5, 3.5, 26, 6), MLT('#7a4a32', 'bark'), 0, 13, 0],
        [g.ico(14), MLT('#4a7a3a', 'leaf'), 0, 32, 0],
        [g.ico(10), MLT('#5a8a42', 'leaf'), 5, 40, 3],
      ],
    },
    agave: {
      c: 0,
      h: 0,
      p: [
        [g.cone(3, 18, 4), ML('#5a8a6a'), 0, 8, 0, 0, 0, 0.5],
        [g.cone(3, 18, 4), ML('#4a7a5a'), 0, 8, 0, 0, 1.57, 0.5],
        [g.cone(3, 18, 4), ML('#5a8a6a'), 0, 8, 0, 0, 3.14, 0.5],
        [g.cone(3, 18, 4), ML('#6a9a7a'), 0, 8, 0, 0, 4.7, 0.5],
      ],
    },
    nopal: {
      c: 0,
      h: 0,
      p: [
        [g.box(10, 14, 3), ML('#4a8a4a'), 0, 7, 0],
        [g.box(8, 10, 3), ML('#5a9a5a'), 6, 16, 0, 0, 0, 0.4],
        [g.box(8, 10, 3), ML('#4a8a4a'), -5, 15, 0, 0, 0, -0.4],
      ],
    },
    bigstatue: {
      c: 30,
      h: 120,
      p: [
        [g.box(40, 10, 40), MLT('#8a7a6a', 'wall'), 0, 5, 0],
        [g.box(26, 50, 18), ML('#6a5a50'), 0, 40, 0],
        [g.box(18, 18, 16), ML('#6a5a50'), 0, 74, 0],
        [g.box(8, 40, 8), ML('#5a4a40'), -18, 60, 0, 0, 0, 0.5],
        [g.box(8, 40, 8), ML('#5a4a40'), 18, 60, 0, 0, 0, -0.5],
      ],
    },
  });
  const tr = (leaf, bark, h, r) => ({
    c: 4,
    h: h + r,
    p: [
      [g.cyl(r * 0.17, r * 0.25, h, 6), ML(bark), 0, h / 2, 0],
      [g.box(r * 0.12, r * 0.12, r * 0.9), ML(bark), r * 0.25, h * 0.7, 0, 0, 0.6, 0.5],
      [g.ico(r, 1), ML(leaf), 0, h + r * 0.5, 0],
      [g.ico(r * 0.75, 1), ML(shade(leaf, 0.12)), r * 0.55, h + r * 0.95, r * 0.25],
      [g.ico(r * 0.7, 1), ML(shade(leaf, -0.12)), -r * 0.6, h + r * 0.35, -r * 0.2],
      [g.ico(r * 0.6, 1), ML(shade(leaf, 0.2)), r * 0.1, h + r * 1.25, -r * 0.45],
      [g.ico(r * 0.5, 0), ML(shade(leaf, -0.05)), -r * 0.3, h - r * 0.05, r * 0.6],
    ],
  });
  K.tree = tr('#3a6a2a', '#5a3a22', 30, 20);
  K.jtree = tr('#2f6a2a', '#5a4a2a', 26, 19);
  K.jtreedark = tr('#1f4a2a', '#3a2a1a', 26, 19);
  K.plumtree = tr('#f2a8c8', '#3a2020', 20, 14);
  K.pine = {
    c: 4,
    h: 64,
    p: [
      [g.cyl(2.6, 3.6, 18, 6), ML('#5a3a2a'), 0, 9, 0],
      [g.cone(19, 26, 8), ML('#2f5a4a'), 0, 24, 0],
      [g.cone(15, 22, 8), ML('#3a6a54'), 0, 37, 0],
      [g.cone(10, 18, 8), ML('#467a60'), 0, 49, 0],
      [g.cone(6, 8, 8), ML('#f4f8fb'), 0, 58, 0],
    ],
  };
  K.rock = {
    c: 9,
    h: 20,
    p: [
      [g.dod(14), ML('#4a3a36'), 0, 6, 0],
      [g.dod(8), ML('#5a4a44'), 10, 3, 4],
      [g.dod(6), ML('#3a2e2a'), -8, 2, -6],
    ],
  };
  K.rockgrey = {
    c: 9,
    h: 22,
    p: [
      [g.dod(14), ML('#7a8a96'), 0, 6, 0],
      [g.dod(9), ML('#8a98a2'), 10, 3, 5],
      [g.dod(8), ML('#f4f8fb'), 3, 14, 0],
      [g.dod(5), ML('#6a7a86'), -9, 2, -4],
    ],
  };
  K.rockmoss = {
    c: 9,
    h: 20,
    p: [
      [g.dod(13), ML('#5a6a4a'), 0, 5, 0],
      [g.dod(7), ML('#3f8a3a'), 2, 12, 0],
      [g.dod(7), ML('#6a7a5a'), -9, 2, 5],
    ],
  };
  for (const k of ['pine', 'jtree', 'jtreedark', 'tree', 'plumtree', 'bigtree']) {
    const p = K[k].p;
    for (const part of p) {
      const m = part[1];
      if (m.color && part[0].type === 'IcosahedronGeometry') {
        part[1] = MLT('#' + m.color.getHexString(), 'leaf');
      }
      if (part[0].type === 'CylinderGeometry' && k !== 'bamboo') part[1] = MLT('#' + m.color.getHexString(), 'bark');
    }
  }
  for (const k of ['column', 'brokencol']) {
    for (const part of K[k].p) part[1] = MLT('#' + part[1].color.getHexString(), 'stone');
  }
  return K;
}
