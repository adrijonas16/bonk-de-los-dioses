---
name: nueva-arma
description: Añadir o modificar un arma en Bonk de los Dioses (datos, tipo de comportamiento, aspecto del proyectil y equilibrio). Úsala cuando pidan un arma, ataque o habilidad automática nueva.
---
# Añadir un arma

## 1. Elige el tipo (`k`)
Cada arma reutiliza un comportamiento de `src/game/weapons.js` (`kst0` define sus números por nivel, `fireWeapons` cómo dispara):
`chain` (rayo que salta), `shot` (proyectiles), `orbit` (gira alrededor), `aura` (daño alrededor), `line` (rayo recto), `boomer` (va y vuelve), `bounce` (rebota), `homing` (persigue), `nova` (estallido), `trail` (rastro en el suelo), `melee` (tajo), `sword` (espada que vuela al enemigo).
Si ningún tipo encaja, crea uno nuevo: caso en `kst0`, rama en `fireWeapons`, su alcance en `weaponReach` y sus filas en `wStats` (para que la carta muestre sus números).

## 2. Datos — `src/data/weapons.js`
```js
idarma: { k: 'shot', st: 'arrow', col: '#e8c86a', name: 'Arco de Ejemplo', em: '➶', pan: 'Griega', desc: 'Una frase de qué hace.' },
```
- `id` único (ESLint avisa de duplicados: una clave repetida pisa a la otra).
- `st`: estilo visual existente en `src/render/projectiles.js` (`projObj`). Uno nuevo se añade ahí.
- `pan` = panteón del dios que la usa.

## 3. Equilibrio
- Compara su daño por segundo con armas del mismo tipo en nivel 1, 4 y 7.
- El alcance de las armas a distancia crece con el nivel (`lvR` en `weapons.js`): no lo dupliques en sus números.
- `npm run bot -- <dios> normal 900` con un dios que la lleve.

## 4. Comprobar
`npm run check`, y en `npm run dev` súbela de nivel y mira la carta (sus números) y el efecto en pantalla.
