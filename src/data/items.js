/* ---------- Objetos con rareza (cofres, élites y jefes) ---------- */
const RAR = {
  comun: { name: 'Común', col: '#9aa3c7', w: 60 },
  raro: { name: 'Raro', col: '#3a9bff', w: 28 },
  epico: { name: 'Épico', col: '#b06cff', w: 10 },
  legendario: { name: 'Legendario', col: '#ffb020', w: 3 },
};
const it = (name, em, rar, max, desc, apply) => ({ name, em, rar, max, desc, apply });
const ITEMS = {
  trebol: it('Herradura de Pegaso', '∩', 'raro', 3, '+15 % de suerte: más botín y mejores cofres.', (p) => {
    p.luck += 0.15;
  }),
  arcolargo: it('Arco largo de Odiseo', '➶', 'raro', 3, '+10 % de alcance.', (p) => {
    p.range += 0.1;
  }),
  pluma: it('Pluma de grifo', '🪶', 'comun', 5, '+6 % de velocidad.', (p) => {
    p.speed *= 1.06;
  }),
  anfora: it('Ánfora de néctar', '⚱', 'comun', 5, '+15 de PS máximos.', (p) => {
    p.maxHp += 15;
    p.hp += 15;
  }),
  obolo: it('Óbolo de Caronte', '◉', 'comun', 5, '+12 % de dracmas.', (p) => {
    p.goldMul += 0.12;
  }),
  hoja: it('Hoja del árbol del mundo', '❧', 'comun', 5, '+6 % de área.', (p) => {
    p.area += 0.06;
  }),
  diente: it('Diente de dragón', '⟁', 'comun', 5, '+6 % de daño.', (p) => {
    p.dmgMul += 0.06;
  }),
  arena: it('Arena del Nilo', '⌛', 'comun', 5, 'Recarga 5 % más rápida.', (p) => {
    p.cdMul *= 0.95;
  }),
  sal: it('Sal del salar', '❖', 'comun', 5, '+0,4 PS por segundo.', (p) => {
    p.regen += 0.4;
  }),
  maiz: it('Mazorca sagrada', '✾', 'comun', 5, '+10 % de experiencia.', (p) => {
    p.xpMul += 0.1;
  }),
  sandalia: it('Sandalia alada', '≋', 'raro', 2, 'Un salto extra en el aire.', (p) => {
    p.extraJumps += 1;
  }),
  escama: it('Escama de Jörmungandr', '◈', 'raro', 4, '+2 de armadura.', (p) => {
    p.armor += 2;
  }),
  maat: it('Pluma de Maat', '⚖', 'raro', 4, '+5 % de evasión.', (p) => {
    p.evasion += 0.05;
  }),
  colmillo: it('Colmillo de Fenrir', '⩘', 'raro', 4, 'Cada caído te cura 0,5 PS.', (p) => {
    p.steal += 0.5;
  }),
  huevo: it('Huevo cósmico', '◎', 'raro', 3, '+15 % de experiencia y +8 de imán.', (p) => {
    p.xpMul += 0.15;
    p.magnet += 8;
  }),
  nopal: it('Espinas de nopal', '✳', 'raro', 4, 'Devuelves el 40 % del daño de contacto.', (p) => {
    p.thorns += 0.4;
  }),
  ojoodin: it('Ojo de Mímir', '◐', 'raro', 4, '+8 % de golpe crítico.', (p) => {
    p.crit += 0.08;
  }),
  tambor: it('Tambor de trueno', '◍', 'raro', 3, '+10 % de velocidad de proyectil y daño.', (p) => {
    p.dmgMul += 0.05;
    p.area += 0.04;
  }),
  mjolnirb: it('Mjölnir de bolsillo', '⚒', 'epico', 3, 'Cada 8 s cae un rayo sobre un enemigo cercano.', (p) => {
    p.pocketBolt += 1;
  }),
  hipolita: it('Cinturón de Hipólita', '⊙', 'epico', 3, '+25 % de daño a jefes y élites.', (p) => {
    p.bossDmg += 0.25;
  }),
  calavera: it('Calavera de cristal', '☠', 'epico', 3, 'Los críticos hacen +50 % de daño.', (p) => {
    p.critDmg += 0.5;
    p.crit += 0.03;
  }),
  manto: it('Manto de Tarnhelm', '◭', 'epico', 2, 'Más tiempo invulnerable tras recibir daño.', (p) => {
    p.invBonus += 0.25;
  }),
  gjallar: it('Cuerno Gjallarhorn', '♅', 'epico', 2, '+1 proyectil en todas tus armas.', (p) => {
    p.countBonus += 1;
  }),
  aguja: it('Aguja de Ix Chel', '⟊', 'epico', 3, 'Curas un 50 % más.', (p) => {
    p.healMul += 0.5;
  }),
  dorje: it('Dorje', '✦', 'epico', 2, 'El poder divino recarga 15 % más rápido.', (p) => {
    p.powCdMul *= 0.85;
  }),
  ankh: it('Ankh dorado', '☥', 'legendario', 2, 'Revives una vez con el 60 % de PS.', (p) => {
    p.lives += 1;
  }),
  vellocino: it('Vellocino de oro', '♈', 'legendario', 1, '+30 % de PS máximos y +1 PS por segundo.', (p) => {
    p.maxHp *= 1.3;
    p.hp = p.maxHp;
    p.regen += 1;
  }),
  brisingamen: it('Brisingamen', '❂', 'legendario', 1, '+20 % de daño y +10 % de velocidad.', (p) => {
    p.dmgMul += 0.2;
    p.speed *= 1.1;
  }),
  lagrima: it('Lágrima de Pachamama', '💧', 'legendario', 1, 'Te curas del todo al subir de nivel.', (p) => {
    p.levelHeal = true;
  }),
  caldero: it(
    'Caldero del renacer',
    '♨',
    'legendario',
    1,
    'Tu compañero revive el triple de rápido y +2 armadura.',
    (p) => {
      p.reviveMul *= 3;
      p.armor += 2;
    }
  ),
};
