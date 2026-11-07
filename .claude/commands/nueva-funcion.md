---
description: Diseña e implementa una función nueva del juego siguiendo la estructura del proyecto
argument-hint: qué se quiere añadir
---
Función nueva: $ARGUMENTS

1. Lee `AGENTS.md`, `docs/ARQUITECTURA.md` y, si existe, la skill de `.claude/skills/` que encaje (dios, arma, enemigo o jefe, reino, equilibrio, migración).
2. Antes de programar, escribe un plan corto: qué archivos tocas o creas (y en qué carpeta), qué datos nuevos hay, qué ve el jugador y cómo lo vas a probar. Si algo es ambiguo, pregunta.
3. Implementa por partes pequeñas, datos primero y lógica después, con textos en español.
4. Archivo nuevo → `src/manifest.json`. CSS nuevo → `src/styles/order.json`. Tabla de base de datos → migración con RLS.
5. `npm run check`, y si toca equilibrio, `npm run bot`. Mira el resultado en escritorio y en móvil.
6. Resume qué hiciste, cómo probarlo y qué no comprobaste.
