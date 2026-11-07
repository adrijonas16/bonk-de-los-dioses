---
name: nuevo-dios
description: Añadir un dios jugable nuevo a Bonk de los Dioses (datos, aspecto 3D, arma, poder, precio, relaciones y némesis). Úsala cuando pidan un dios, personaje o héroe nuevo.
---
# Añadir un dios

Copia siempre un dios parecido del mismo panteón y cambia lo necesario. No inventes campos.

## 1. Datos del dios — `src/data/gods.js`
Añade una entrada con `g(id, nombre, panteón, título, tag, vida, velocidad, arma, poder, nombrePoder, descPoder, descBonus, bonus, cabeza, corona, paleta)`:
- `id`: minúsculas sin tildes ni espacios, único y **para siempre** (se guarda en partidas y en la base de datos).
- `pan`: un panteón existente (`'Griega'`, `'Nórdica'`, `'Egipcia'`…). Panteón nuevo → paso 6.
- `tag`: un concilio de `src/data/councils.js` (`'trueno'`, `'sol'`…) o `null`.
- `hp` ~80–140 y `spd` ~140–190: compáralo con los dioses de su panteón.
- `w`: id de un arma de `src/data/weapons.js`. Si necesita una nueva, sigue la skill `nueva-arma`.
- `pw`: tipo de poder existente (claves de `P_CD` al principio de `gods.js`), opcionalmente con variante `'tipo:variante'`. Un tipo nuevo exige lógica en `src/game/powers.js`.
- `bonus` (`set`): función corta que modifica al jugador (`p.speed *= 1.05`). Descríbelo en `bd`.

## 2. Aspecto 3D — `src/data/god-looks.js`
Entrada en `LOOKS` con piel `s`, pelo `h`, peinado `hs`, barba `b`, ropa `r`, adorno `t`, tocado `gear`, arma en mano `held`… Para cabezas de animal usa `head` (`'jackal'`, `'falcon'`, `'ibis'`, `'lion'`, `'elephant'`, `'serpent'`, `'dragon'`, `'monkey'`).

## 3. Ropa — `src/render/human/humans.js`
Añade el id a `HSTYLE` con `'tunic'`, `'robe'`, `'armor'` o `'bare'`. Si falta, se usa túnica.

## 4. Cuerpo alternativo — `src/render/assets/god-bodies.js`
Añade el id con el cuerpo KayKit más parecido (se usa si el maniquí humano no carga).

## 5. Precio y relaciones
- Gratis desde el principio: añádelo a `FREE_GODS` en `src/data/shop.js`. Si no, su precio sale de `GOD_PRICE` (puedes fijarlo ahí).
- Diálogos con otros dioses en `src/data/relations.js` (`[a, b, 'aliado' | 'rival', frase de a, frase de b]`). Un rival le da némesis automática (la Sombra de ese dios).
- Némesis de su mito: añade su id al `weak` del jefe correspondiente en `src/data/bosses.js`.

## 6. Panteón nuevo (solo si lo es)
Tema de colores en `src/data/themes.js` y, si tiene reino propio, la skill `nuevo-reino`.

## 7. Comprobar
1. `npm run check`.
2. `npm run dev`: mira su retrato en la pestaña Dioses, juega 2 minutos con él y usa su poder.
3. `npm run bot -- <id> normal 600` para ver que no es mucho más fuerte o débil que los demás.
