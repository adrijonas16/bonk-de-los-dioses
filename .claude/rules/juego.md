---
paths:
  - "src/game/**"
---
# Reglas para `src/game/` (reglas y bucle de la partida)

- `G` es el estado de la partida actual (se crea en `newRun()` de `state.js`); `players`, `enemies`, `proj`, `bullets`, `gems`, `coins`, `heals`, `drops` y `fx` son las listas vivas. Campos nuevos de partida: inicialízalos en `newRun()`.
- `update(dt)` corre 60 veces por segundo con cientos de enemigos: **no crees objetos, arrays ni funciones por enemigo y fotograma**. Usa la rejilla espacial (`near()`), contadores y bucles simples.
- El daño a enemigos pasa siempre por `hurt(e, d, p)` y al jugador por `damagePlayer(p, amt, src)`; las curaciones por `heal(p, amt)`. No restes `hp` a mano.
- Lo que depende del tiempo se escala con `dt`; nada de valores "por fotograma".
- Cambios de equilibrio (vida, daño, aparición, botín, oleadas): documenta el valor anterior y el nuevo en el PR y pasa el bot (`npm run bot`). Ver la skill `ajustar-equilibrio`.
- Los enemigos de cada jugador se simulan en su propio navegador; lo que viaja por red está en `src/net/sync.js`. Si un cambio afecta a otros jugadores, piensa en el online.
- Mensajes al jugador con `banner()` / `bigBanner()` y textos flotantes en `texts` (`{x, y, z, v, t, c}`), en español.
- Mejoras al subir de nivel: armas (máx. `MAX_WEAPONS`), dones (máx. `MAX_PASSIVES`) y mejoras básicas `STAT_UPS` en `leveling.js`.
