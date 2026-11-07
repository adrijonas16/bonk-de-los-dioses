---
name: ajustar-equilibrio
description: Ajustar la dificultad, el daño, la vida, el botín, las oleadas o la puntuación de Bonk de los Dioses y medir el efecto con el bot. Úsala cuando digan que algo es muy fácil, muy difícil, muy fuerte o muy débil.
---
# Ajustar el equilibrio

1. **Mide antes de cambiar**: `npm run build && npm run bot -- zeus,thor,artemisa normal 1800`. Apunta oleada, minuto, nivel y puntos de cada uno.
2. **Encuentra el valor**:
   - Dificultad por tiempo, reino y oleada: `spawn()` en `src/game/enemies.js` y `waveK()`.
   - Vida y daño de jefes: `spawnBoss()`.
   - Botín y curaciones: `kill()` en `src/game/enemies.js` (monedas, granadas, néctar, imán, bolsa).
   - Armas: `kst0()` en `src/game/weapons.js`. Mejoras al subir de nivel: `STAT_UPS` en `src/game/leveling.js`.
   - Puntos: `addScore()` y `scoreMul()` en `src/game/scoring.js`.
   - Dificultades: `DIFF` en `src/game/state.js` (Normal, Difícil, Pesadilla).
3. **Cambia una cosa cada vez** y deja un comentario con el porqué si no es obvio.
4. **Vuelve a medir** con los mismos dioses y compara.
5. En el PR pon una tabla **antes / después** y di que el bot solo esquiva y recoge: una persona juega distinto.

Objetivo actual de Supervivencia: una build mala muere en la oleada 1–2; una buena, hacia la oleada 6–8 y unos 40 minutos.
