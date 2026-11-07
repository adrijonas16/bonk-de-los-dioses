# Guía para trabajar en Bonk de los Dioses

Este archivo es para cualquiera que cambie el proyecto: personas y asistentes de IA (Claude Code, Codex, Cursor, Copilot…). Léelo entero antes de tocar código. Las reglas por zona están en `.claude/rules/`, las tareas paso a paso en `.claude/skills/` y la arquitectura en `docs/ARQUITECTURA.md`.

## Qué es
Roguelike 3D de supervivencia en el navegador. JavaScript sin framework + three.js r128, Supabase (Google, Postgres, Realtime) y Vercel. Todo el texto del juego está en **español**.

## Comandos
| Para | Comando |
| --- | --- |
| Instalar | `npm install` |
| Jugar en local (recompila al guardar) | `npm run dev` → http://localhost:5173 |
| Compilar | `npm run build` (genera `dist/`) |
| Comprobar todo antes de subir | `npm run check` (lint + formato + build + prueba de humo) |
| Formatear | `npm run format` |
| Medir equilibrio | `npm run bot -- zeus,thor normal 1800` |

## Cómo está hecho el código (léelo, es lo que más errores evita)
- `src/` está dividido por responsabilidad: `data/` (contenido), `core/`, `world/`, `game/`, `game/quests/`, `net/`, `render/`, `render/models|assets|human/`, `ui/`, `styles/`, `platform/`.
- **Cada carpeta se compila a un script clásico**, en el orden de `src/manifest.json`. No son módulos ES: todos comparten el ámbito global (`G` partida actual, `players`, `enemies`, `cfg`, `state`, `PROF`, `NET`…).
  - Un archivo solo puede usar **al cargar** (código de nivel superior) lo que está en carpetas anteriores del manifiesto. Dentro de funciones puede usar cualquier cosa.
  - **Archivo nuevo** → añádelo a `src/manifest.json` en su carpeta y en el orden correcto. **CSS nuevo** → `src/styles/order.json`.
  - `data/` se envuelve en su propio ámbito y solo exporta `window.DATA` (al final de `data/shop.js`); `core/utils.js` lo reparte en globales. Una tabla nueva de datos se añade en los dos sitios.
- No escribas `import`/`export` ni `'use strict'` en `src/` (lo pone el build).
- El paso a módulos ES está planeado (ver `docs/ARQUITECTURA.md`); no lo hagas a medias dentro de otra tarea.

## Reglas de código
1. **Prettier y ESLint mandan.** No formatees a mano ni compactes código en una línea. `npm run lint` y `npm run format:check` deben pasar.
2. **Un archivo, una responsabilidad.** Si un archivo pasa de ~600 líneas o mezcla temas, divídelo (y actualiza el manifiesto).
3. **Nombres claros.** Funciones y variables nuevas con nombres descriptivos en inglés o español, pero coherentes con el archivo. Nada de nombres de una letra fuera de bucles y coordenadas (`x`, `y`, `dt`).
4. **Contenido en `data/`, reglas en `game/`.** Un dios, arma, enemigo o reino nuevo es casi siempre solo datos; si necesitas `if (id === 'x')` en la lógica, piensa primero en un campo de datos.
5. **Globales nuevos solo si hacen falta**, con un comentario de qué guardan. Prefiere campos en `G` (partida) o en el jugador `p`.
6. **Rendimiento:** el bucle corre a 60 fps con cientos de enemigos. En `update()` y en el render no crees objetos, arrays ni closures por enemigo y fotograma; reutiliza (`objFor`, rejilla espacial `near()`, materiales compartidos). Libera geometrías y materiales al cambiar de reino.
7. **Comentarios en español** explicando el *porqué*, no el *qué*. Cada archivo empieza con un comentario de una línea sobre lo que hace.
8. **Textos del juego en español**, cortos, sin tecnicismos, con tildes. Números con coma decimal (`1,5`).
9. **Sin secretos en el código.** La clave `anon` de Supabase es pública; la seguridad está en RLS. Nunca la `service_role`.
10. **No rompas el online:** si cambias algo que viaja en `net/sync.js` (presencia de la sala), mantén compatibilidad o cambia los dos lados a la vez.

## Base de datos (Supabase)
- Cambios de esquema **solo** con un archivo nuevo en `supabase/migrations/AAAAMMDDhhmmss_descripcion.sql`. Nunca edites una migración ya aplicada.
- Toda tabla nueva con **RLS activado** y políticas explícitas. Cada usuario solo escribe lo suyo.
- Ver la skill `migracion-supabase`.

## Pruebas y definición de "terminado"
Un cambio está terminado cuando:
- [ ] `npm run check` pasa (lint, formato, build y prueba de humo).
- [ ] Si toca equilibrio (vida, daño, oleadas, botín), corriste `npm run bot` y anotaste el resultado en el PR.
- [ ] Si toca interfaz, la miraste en escritorio **y** en móvil (390 px de ancho).
- [ ] Si toca base de datos, hay migración y RLS.
- [ ] Explicas en el PR qué se probó de verdad y qué no (no digas "funciona" si solo compila).

## Git
- Trabaja en una rama (`feat/…`, `fix/…`, `chore/…`), nunca directo en `main`. `main` se publica sola en Vercel.
- Commits en español, en imperativo y con un resumen claro: `Añade la némesis de Loki`, `Corrige el alcance inicial de Zeus`.
- Un PR por tema, con la plantilla de `.github/pull_request_template.md`.

## Qué no hacer
- No subir `dist/`, `node_modules/` ni archivos generados.
- No copiar librerías a mano en el repo: van por `package.json`.
- No usar compras con dinero real: la tienda es solo con dracmas del juego.
- No añadir dependencias sin explicar por qué en el PR.
- No desactivar reglas de ESLint ni pruebas para que algo pase.
