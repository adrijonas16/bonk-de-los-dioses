---
paths:
  - "src/net/**"
  - "src/platform/**"
  - "supabase/**"
---
# Reglas para red, cuentas y base de datos

- `src/platform/supabase.js` es la única puerta a Supabase: imita la interfaz `window.claude.use('user' | 'db' | 'room')` que usa el juego y expone `SBX` (perfil y amigos). El resto del código no llama a Supabase directamente.
- Documentos: `data/users/<uid>/main` (progreso privado) y `scores/<uid>` (clasificación pública) en la tabla `docs`. Perfiles en `profiles`, amigos en `friends`.
- **Esquema solo por migraciones** en `supabase/migrations/` con nombre `AAAAMMDDhhmmss_descripcion.sql`. Nunca edites una migración ya aplicada; crea otra.
- Toda tabla con **RLS** y políticas mínimas: leer lo necesario, escribir solo lo propio (`auth.uid()`).
- Nunca pongas la clave `service_role` ni secretos en el cliente. La URL y la clave `anon` se pueden sobrescribir con `SUPABASE_URL` y `SUPABASE_ANON_KEY` en Vercel.
- Salas online: presencia lenta (`track`) para datos que cambian poco y difusión (`broadcast`) para posiciones, como mucho ~8 veces por segundo por jugador. No subas la frecuencia sin medir los límites de Supabase.
- Las puntuaciones las envía el cliente: no confíes en ellas para nada importante sin validarlas en el servidor.
