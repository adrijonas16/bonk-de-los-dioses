---
name: nuevo-enemigo-o-jefe
description: Añadir un enemigo común, un minijefe, un jefe o una némesis a Bonk de los Dioses, con su modelo 3D y su reino. Úsala cuando pidan monstruos, jefes o enemigos nuevos.
---
# Añadir un enemigo o un jefe

## Enemigo común
1. `src/data/enemies.js`: `id: e('Nombre', arquetipo, color, acento, rasgo, {opciones})`. Arquetipos en `ARCH` (`blob`, `flyer`, `beast`, `humanoid`, `giant`, `crawler`) con su vida, velocidad y daño base. Las opciones pisan esos valores.
2. Modelo 3D: entrada en `EMODEL` de `src/render/assets/baked-enemies.js` (`[modelo, animación, escala, tinte]`). Sin entrada se dibuja con formas básicas.
3. Para que aparezca, añádelo a la lista `en` de su reino en `src/data/realms.js`.

## Minijefe o jefe
1. `src/data/bosses.js`: `id: b('Nombre', arquetipo, color, acento, 'mini' | 'boss', [ataques], { feat, weak, friend, heads })`.
   - `pats`: ataques existentes (`gaze`, `aimed`, `summon`, `charge`, `ring`, `slam`, `spiral`…). Uno nuevo se programa en `src/game/enemies.js`.
   - `weak`: dioses contra los que es su **némesis** (aparece a por ellos a mitad del reino).
2. Modelo: `BMODEL` en `src/render/assets/rigged-bosses.js` (modelo con esqueleto) o `BHUMAN` en `src/render/human/humans.js` (humano grande). Sin ninguno, forma básica por arquetipo.
3. Añádelo a `minipool` o `bosspool` del reino. Si solo debe salir como némesis, no lo pongas en ningún reino.

## Comprobar
`npm run check`; en `npm run dev`, llámalo desde la consola con `spawnBoss('id')` o `spawn('id', 0)` y pelea con él. Revisa que su vida encaje con los demás de su nivel.
