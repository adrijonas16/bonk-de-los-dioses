/* ---------- estilo por panteón ---------- */
let curTheme = '',
  THEME_ACC = '#e8b53e';
function applyTheme(pan) {
  const th = THEMES[pan] || THEMES.Griega;
  if (curTheme === pan) return;
  curTheme = pan;
  const r = document.documentElement.style;
  r.setProperty('--th1', th.panel);
  r.setProperty('--th2', th.acc);
  r.setProperty('--thb', th.band);
  r.setProperty('--pat', th.pat);
  r.setProperty('--thd', th.deep);
  THEME_ACC = th.acc;
  document.querySelectorAll('[data-themetag]').forEach((el) => (el.textContent = `${pan} · ${th.tag}`));
}
