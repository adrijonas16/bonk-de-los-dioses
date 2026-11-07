# Arquitectura

## Visión general
El juego es una página estática: `scripts/build.mjs` compila `src/` a `dist/` y Vercel la sirve. No hay servidor propio: las cuentas, los datos y las salas online van a **Supabase**.

```
navegador
 ├─ vendor.js        three.js r128 + cargadores glTF + supabase-js (desde npm)
 ├─ platform.js      adaptador de Supabase (cuentas, documentos, salas)
 ├─ data.js          contenido (window.DATA)
 ├─ core.js … ui.js  un script por carpeta de src/, en el orden de src/manifest.json
 └─ web-patch.js     inicio de sesión con Google, perfil, amigos e invitaciones
Supabase
 ├─ Auth (Google)
 ├─ Postgres: profiles, docs (progreso y clasificación), friends — con RLS
 └─ Realtime: presencia y difusión para las salas online
```

## Carpetas de `src/`
| Carpeta | Responsabilidad |
| --- | --- |
| `data/` | Contenido puro: dioses, armas, dones, objetos, enemigos, jefes, reinos, relaciones, aspectos, temas, misiones, tienda. |
| `core/` | Utilidades (`clamp`, `rand`, `fbm`…), almacenamiento local y sprites pixel art de reserva. |
| `world/` | Terreno, colores, decorados, estructuras, peligros, clima y construcción de cada reino. |
| `net/` | Perfil del jugador, salas online, sincronización durante la partida y clasificación. |
| `game/` | Estado de la partida, entrada, armas, puntuación, poderes, aliados, enemigos y jefes, bucle `update()` y subida de nivel. |
| `game/quests/` | Encargos dentro de la partida (Machu Picchu). |
| `render/` | Escena, cámara, objetos por entidad, proyectiles, capa 2D (números, minimapa), mapa grande y bucle de dibujo. |
| `render/models`, `render/assets`, `render/human` | Modelos 3D: materiales, carga de `.glb`, enemigos y jefes con esqueleto, dioses sobre el maniquí humano, retratos. |
| `ui/` | Portada, menú y pestañas, HUD, pausa, resultados, controles táctiles, retratos y pantalla de carga. |
| `styles/` | CSS por zona, en el orden de `styles/order.json`. |
| `platform/` | Integración con Supabase y ajustes de la versión web. |

## Orden de carga y ámbito global
Cada carpeta es **un script clásico**, no un módulo ES. Todos comparten el ámbito global, así que:
- el código de nivel superior de una carpeta solo puede usar lo definido en carpetas anteriores del manifiesto;
- dentro de funciones se puede usar cualquier cosa, porque se ejecutan cuando todo ya cargó.

Globales principales: `state` (`'menu'`, `'play'`, `'pause'`, `'levelup'`, `'end'`), `G` (partida actual), `cfg` (opciones del menú), `players`, `enemies`, `proj`, `bullets`, `fx`, `WORLD` (reino cargado), `PROF` (perfil guardado), `NET` (red), `AS` (modelos cargados).

## Flujo de una partida
1. `newRun()` crea `G` y los jugadores; `startRealm(clave)` construye el mundo (`buildWorld`) y programa minijefes y jefe.
2. `loop()` llama cada fotograma a `update(dt)` (lógica) y `renderGame(dt)` + `drawOverlay()` (dibujo).
3. Al subir de nivel, `openLevelUp()` ofrece 3 cartas (arma, don o mejora básica).
4. Al vencer al jefe: en Historia se abren portales a otro reino; en Supervivencia pasa a la siguiente oleada.
5. `endGame()` calcula dracmas y puntos, guarda el perfil y envía la puntuación.

## Datos guardados
- **Navegador** (`localStorage`): perfil de invitado, miniaturas de mapas y retratos.
- **Supabase**: `profiles` (nombre y código de amigo), `docs` (`data/users/<uid>/main` progreso privado, `scores/<uid>` clasificación pública), `friends`. Esquema en `supabase/migrations/`.

## Siguiente paso de arquitectura
Pasar a módulos ES con imports explícitos, en este orden:
1. `data/` y `core/` (no tienen estado): exportan e importan sin cambiar nada más.
2. Mover el estado mutable (`state`, `G`, listas) a un objeto `game` que se importa, para que nadie reasigne globales.
3. Ir convirtiendo carpeta a carpeta con el build pasando a esbuild en modo bundle.
Hacerlo como una tarea propia, nunca mezclado con otros cambios.

## Web pública
- `public/` se copia tal cual a `dist/`: modelos (`assets/*.glb`), iconos, `og-image.jpg`, `robots.txt`, `sitemap.xml`, `404.html`, `privacidad.html` y `terminos.html` (Vercel sirve `/privacidad` sin `.html`).
- `vercel.json` define las cabeceras de seguridad (CSP, HSTS, etc.). Si el juego necesita un dominio externo nuevo, añádelo a la CSP o el navegador lo bloqueará.
- `src/platform/consent.js` pide consentimiento y solo entonces carga Google Analytics 4 (`GA4_ID` en el build). Eventos: `login`, `game_start`, `game_end` con `track()`.
- `src/core/validate.js` valida nombre, código de amigo, clan y código de sala; la base de datos repite las mismas reglas (migración `validacion_antispam`).
