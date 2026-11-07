---
paths:
  - "src/ui/**"
  - "src/styles/**"
  - "src/index.html"
---
# Reglas para la interfaz (`src/ui/`, `src/styles/`, `src/index.html`)

- El marcado vive en `src/index.html`; los estilos en `src/styles/` (orden en `styles/order.json`); la lógica en `src/ui/`. No pongas `<style>` ni `<script>` en el HTML.
- Usa las variables de color del tema (`--th1`, `--th2`, `--gold`, `--mut`, `--line`…) en vez de colores fijos, para que el tema por panteón funcione.
- Todo texto en español, corto y claro, como en un juego: nada de párrafos largos ni jerga técnica.
- Cualquier pantalla debe funcionar en **móvil (390 px)** y con **teclado y ratón**. Botones de al menos 40 px de alto en táctil.
- Texto que viene de jugadores (nombres, clanes) siempre con `esc()` o `textContent`, nunca concatenado en `innerHTML` sin escapar.
- Accesibilidad básica: `aria-label` en botones de solo icono, foco visible, contraste legible.
- Las pantallas se muestran con `show(id)` / `openTab(tab)`; la portada con `openHome()` / `closeHome()`.
