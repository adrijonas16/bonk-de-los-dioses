# Bonk de los Dioses

Roguelike 3D de supervivencia en el navegador. Eliges un dios de una de 14 mitologías, aguantas hordas de monstruos, subes de nivel eligiendo armas, dones y mejoras al azar y vences a jefes y némesis. Tiene modo Historia (cruzar reinos hasta el Vacío Primordial), Supervivencia por oleadas, cooperativo local y online, clasificación, clanes y amigos, con inicio de sesión con Google.

## Instalar
Necesitas Node.js 18 o superior.
```bash
npm install
```

## Jugar en local
```bash
npm run dev
```
Abre http://localhost:5173. Se recompila solo al guardar cambios.

**Controles:** WASD o flechas para moverte, Espacio para saltar, Shift para deslizarte, R para el poder divino, E para abrir cofres y usar altares, M para el mapa y Esc para pausar. Las armas disparan solas. En el celular hay controles táctiles.

## Probar
```bash
npm run check   # lint, formato, compilación y prueba de humo
npm run bot -- zeus,thor normal 1800   # un bot juega Supervivencia y mide hasta dónde llega
```

## Compilar y publicar
```bash
npm run build   # genera dist/
```
La rama `main` se publica sola en Vercel. Opcional: variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` para usar otro proyecto de Supabase.

## Contribuir
Lee [`CONTRIBUTING.md`](CONTRIBUTING.md) y [`AGENTS.md`](AGENTS.md).
