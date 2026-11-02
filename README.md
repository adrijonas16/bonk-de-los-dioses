# Bonk de los Dioses

Roguelike 3D de supervivencia en el navegador: eliges un dios de 14 mitologías, sobrevives a hordas, subes de nivel eligiendo armas y dones al azar y vences a jefes y némesis. Modos Historia y Supervivencia por oleadas, cooperativo local y online, clasificación y clanes.

## Tecnología

- **JavaScript** sin framework + **three.js r128** (render 3D, modelos glTF animados de Quaternius/KayKit, CC0).
- **Supabase**: inicio de sesión con Google, Postgres (progreso y clasificación con RLS) y Realtime (salas online).
- **esbuild** (minificado), **ESLint**, **Prettier**, **Playwright** (pruebas), **Vercel** (hosting estático).

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173, recompila al guardar
npm run build      # genera dist/
npm test           # prueba de humo: carga el juego y simula 30 s de partida
npm run bot -- zeus,thor normal 1800   # bot que juega Supervivencia al azar y mide puntos/oleada
npm run lint && npm run format
```

## Estructura

```
src/
  index.html            marcado de la interfaz (el build inyecta CSS y scripts)
  manifest.json         orden de carga de los archivos de código
  styles/               CSS por zona (portada, HUD, menú, pausa…), en el orden de styles/order.json
  platform/             supabase.js (cuentas, base de datos, salas) y web-patch.js
  data/                 contenido: dioses, armas, dones, enemigos, jefes, reinos, objetos, tienda…
  core/                 utilidades y sprites pixel art
  world/                terreno, decorados, estructuras, clima
  net/                  perfil, salas online, sincronización, clasificación
  game/                 estado, entrada, armas, poderes, enemigos, bucle de actualización, niveles
  game/quests/          encargos dentro de la partida (Machu Picchu)
  render/               escena, cámara, proyectiles, capa 2D, bucle de dibujo
  render/models|assets|human/   modelos 3D de dioses, enemigos y jefes
  ui/                   portada, menú, pestañas, HUD, pausa, resultados
public/assets/          modelos .glb
supabase/migrations/    esquema SQL de la base de datos
scripts/                build y servidor de desarrollo
tests/                  prueba de humo y bot de partidas
```

### Cómo se carga el código

Cada carpeta de `src/` (data, core, world, net, game, render, game/quests, render/models, render/assets, render/human, ui) se compila a **un script clásico** y se cargan en ese orden. Los archivos comparten el ámbito global (por ejemplo `G` = partida actual, `players`, `enemies`, `cfg`). El siguiente paso de la arquitectura es convertirlos en módulos ES con imports explícitos, empezando por `data/` y `core/` (sin estado) y moviendo el estado mutable a un objeto `game`.

## Base de datos

- `profiles`: nombre y avatar de cada usuario (lectura pública, escritura propia).
- `docs`: documentos `data/users/<uid>/main` (progreso privado) y `scores/<uid>` (clasificación pública). RLS: cada usuario solo escribe los suyos.
- Las puntuaciones las envía el cliente; para competición pública habría que validarlas en el servidor (Edge Function).

## Configuración

`SUPABASE_URL` y `SUPABASE_ANON_KEY` como variables de entorno en Vercel (si no están, se usan las del proyecto por defecto). La clave anon es pública; la seguridad está en las políticas RLS.
