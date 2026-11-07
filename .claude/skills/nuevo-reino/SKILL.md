---
name: nuevo-reino
description: Añadir un reino (mapa) nuevo a Bonk de los Dioses con su terreno, colores, enemigos, jefes y estructuras. Úsala cuando pidan un mapa, mundo, nivel o reino nuevo.
---
# Añadir un reino

Es la tarea más grande: copia un reino existente parecido (por ejemplo `duat`) y cambia por partes.

1. **Datos** — `src/data/realms.js`: `name`, `pan`, `sub`, colores (`g1`, `g2`, `det`, `acc`, `dark`, `dcol`), `weather`, enemigos `en`, minijefes `minis`/`minipool`, jefe `boss`/`bosspool`.
2. **Terreno** — `TER` en `src/world/terrain.js`: función `(x, y) => altura` (usa `fbm`, `hash`). Mantén el centro jugable y suave.
3. **Aspecto 3D** — `LOOK3D` en `src/world/terrain.js` (cielo, horizonte, niebla, luz) y colores del suelo en `terrainColor` de `src/world/terrain-colors.js`.
4. **Decorados y estructuras** — `src/world/props.js` (qué decorados reparte) y `src/world/structures.js` (piezas únicas como pirámides o templos).
5. **Peligros** (lava, agua, vacío): `haz` en `LOOK3D`; comprueba que `hazardAt` y el mapa grande lo pintan bien.
6. **Enemigos y jefes** que no existan: skill `nuevo-enemigo-o-jefe`.
7. **Comprobar**:
   - `npm run check`.
   - `npm run dev` → elígelo en Jugar, recórrelo entero y abre el mapa grande (M).
   - `npm run bot -- zeus normal 600` empezando en ese reino (que el bot no se quede atascado).
