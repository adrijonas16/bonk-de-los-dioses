---
paths:
  - "src/data/**"
---
# Reglas para `src/data/` (contenido del juego)

- Aquí solo hay **datos**: tablas de dioses, armas, dones, objetos, enemigos, jefes, reinos, relaciones, aspectos, temas, misiones y tienda. Nada de lógica de partida ni acceso al DOM.
- Todo `data/` se ejecuta dentro de un ámbito propio y solo sale por `window.DATA` (final de `shop.js`). Una tabla nueva se añade a `window.DATA` y a la desestructuración de `src/core/utils.js`.
- **Claves únicas:** cada `id` de dios, arma, don, objeto, enemigo, jefe o reino es único en su tabla. ESLint (`no-dupe-keys`) avisa: no lo ignores; una clave repetida pisa la anterior en silencio.
- Las claves son ids estables: van en partidas guardadas, en la clasificación y en la base de datos. **No renombres un id existente**; si hace falta, añade uno nuevo.
- Textos en español, frases cortas, tildes correctas. `desc` de armas y dones: qué hace en una frase, sin números si la carta ya los muestra.
- Mantén el orden y el formato de los vecinos (mismos campos, mismo orden). Copia una entrada parecida y cámbiala.
- Colores en hexadecimal (`'#c8ccd8'`) o de la paleta `C`.
- Si añades contenido de un panteón nuevo, añade también su tema en `themes.js`.
