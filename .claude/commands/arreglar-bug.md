---
description: Investiga y arregla un error del juego paso a paso
argument-hint: descripción del error
---
Error a arreglar: $ARGUMENTS

1. Reprodúcelo antes de tocar nada: con `npm run dev` o con un script de Playwright como `tests/smoke.test.mjs`. Si no puedes reproducirlo, dilo y explica qué probaste.
2. Encuentra la causa (no solo el síntoma). Explica en dos frases por qué ocurría.
3. Arréglalo con el cambio más pequeño que respete `AGENTS.md` y las reglas de la zona.
4. Si es posible, añade una comprobación a `tests/smoke.test.mjs` que habría detectado el error.
5. `npm run check`. Resume: causa, arreglo, cómo lo comprobaste y qué queda sin comprobar.
