/* ---- Tienda ---- */
function renderShop() {
  const box = $('upgrades');
  box.innerHTML = '';
  for (const k in UPGRADES) {
    const u = UPGRADES[k],
      l = PROF.up[k] || 0,
      c = upCost(k),
      max = l >= u.max;
    const d = document.createElement('div');
    d.className = 'shopc';
    d.innerHTML = `<div class="se">${u.em}</div><div class="sb"><b>${esc(u.name)}</b><span>${esc(u.desc)}</span><span class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</span></div><button class="btn ${max ? '' : 'gold'}" ${max || PROF.coins < c ? 'disabled' : ''}>${max ? 'Máximo' : '<i class="cn"></i>' + c}</button>`;
    d.querySelector('button').onclick = () => {
      if (buyUpgrade(k)) renderShop();
    };
    box.appendChild(d);
  }
  const locked = GODS.filter((g) => !owns(g.id));
  const feat = $('featured');
  feat.innerHTML = '';
  locked
    .slice(0)
    .sort(
      (a, b) =>
        hash(a.id.length, new Date().getDate(), a.name.charCodeAt(0)) -
        hash(b.id.length, new Date().getDate(), b.name.charCodeAt(0))
    )
    .slice(0, 4)
    .forEach((g) => {
      const d = document.createElement('button');
      d.className = 'featc';
      const c = document.createElement('canvas');
      portrait(c, g.id, 64);
      d.appendChild(c);
      d.insertAdjacentHTML(
        'beforeend',
        `<span><b>${esc(g.name)}</b><small>${esc(g.pan)} · ${esc(g.pn)}</small></span><span class="tagb price"><i class="cn"></i>${GOD_PRICE(g.id)}</span>`
      );
      d.onclick = () => {
        UI.sel = g.id;
        openTab('dioses');
      };
      feat.appendChild(d);
    });
  if (!locked.length) feat.innerHTML = '<p class="mut">Ya tienes a todos los dioses.</p>';
  $('shopNote').textContent =
    'Los dracmas se ganan jugando: por enemigos, jefes, misiones y misiones diarias. No hay compras con dinero real.';
}
