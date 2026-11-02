/* ajustes de la versión web: inicio de sesión con Google y textos */

(function () {
  const g = document.getElementById('hGoogle');
  if (g) g.onclick = () => window.SB_LOGIN && SB_LOGIN();
  const acc = document.getElementById('hAcc');
  if (acc) {
    acc.style.cursor = 'pointer';
    acc.title = 'Cerrar sesión';
    acc.onclick = () => {
      if (window.NET && NET.uid && confirm('¿Cerrar sesión?')) SB_LOGOUT();
    };
  }
  const pn = document.getElementById('pname');
  if (pn) {
    pn.style.cursor = 'pointer';
    pn.title = 'Cerrar sesión';
    pn.onclick = () => {
      if (NET.uid) {
        if (confirm('¿Cerrar sesión?')) SB_LOGOUT();
      } else SB_LOGIN();
    };
  }
})();
