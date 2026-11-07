---
paths:
  - "tests/**"
  - "scripts/**"
---
# Reglas para pruebas y scripts

- `tests/smoke.test.mjs` debe seguir siendo rápido (menos de 5 minutos en CI) y fallar con un mensaje claro.
- Las pruebas usan Playwright con Chromium; el código dentro de `page.evaluate` puede usar los globales del juego.
- Las pruebas no dependen de Supabase: bloquean `supabase.co` y el juego funciona como invitado.
- `tests/bot.mjs` mide equilibrio; no es una prueba de aprobado o suspenso. Anota sus resultados en el PR.
- `scripts/build.mjs` debe seguir generando nombres con hash y un script por carpeta de `src/` (ver `AGENTS.md`).
