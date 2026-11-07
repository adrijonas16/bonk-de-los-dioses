/* Validación de lo que escribe el jugador (nombre, códigos, clan); la base de datos repite estas reglas */
// Quita < >, caracteres de control y espacios repetidos
function cleanText(value, maxLen) {
  return Array.from(String(value || ''))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return ch !== '<' && ch !== '>' && code > 31 && code !== 127;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// Cada función devuelve { ok, value, msg } para que la interfaz muestre el error al lado del campo
function checkPlayerName(raw) {
  const value = cleanText(raw, 24);
  if (value.length < 2) return { ok: false, value, msg: 'El nombre debe tener entre 2 y 24 caracteres.' };
  if (!/[\p{L}\p{N}]/u.test(value)) return { ok: false, value, msg: 'El nombre necesita al menos una letra o número.' };
  return { ok: true, value, msg: '' };
}

function checkFriendCode(raw) {
  const value = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z0-9]{6}$/.test(value)) return { ok: false, value, msg: 'El código de amigo tiene 6 letras o números.' };
  return { ok: true, value, msg: '' };
}

function checkClanName(raw) {
  const value = cleanText(raw, 20);
  if (value.length < 2) return { ok: false, value, msg: 'El clan debe tener entre 2 y 20 caracteres.' };
  return { ok: true, value, msg: '' };
}

function checkRoomCode(raw) {
  const value = String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  if (value.length < 4) return { ok: false, value, msg: 'El código de sala tiene entre 4 y 8 letras o números.' };
  return { ok: true, value, msg: '' };
}
