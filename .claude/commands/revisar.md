---
description: Revisa los cambios actuales contra las reglas del proyecto
---
Revisa los cambios de esta rama frente a `main` (`git diff main...HEAD` y lo no confirmado) siguiendo `AGENTS.md` y las reglas de `.claude/rules/` de cada zona tocada.

Comprueba, y cita archivo y línea en cada hallazgo:
1. **Estructura:** cada cambio está en la carpeta correcta; los archivos nuevos están en `src/manifest.json` (o en `styles/order.json`); nada usa al cargar algo de una carpeta posterior.
2. **Datos:** ids únicos, sin renombrar ids existentes, textos en español con tildes.
3. **Rendimiento:** nada que cree objetos por enemigo y fotograma en `update()` o en el render; recursos 3D liberados.
4. **Seguridad:** nombres de jugadores escapados; sin secretos; tablas nuevas con migración y RLS.
5. **Online:** si cambia lo que viaja en `src/net/sync.js`, sigue siendo compatible.
6. **Pruebas:** ejecuta `npm run check`. Si toca equilibrio, ¿hay resultados del bot?

Termina con una lista ordenada por gravedad (bloqueante, importante, menor) y di qué no pudiste comprobar.
