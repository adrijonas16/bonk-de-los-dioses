---
name: migracion-supabase
description: Cambiar la base de datos de Supabase de Bonk de los Dioses (tablas, columnas, políticas RLS, funciones) con una migración versionada. Úsala para cualquier cambio de esquema o de seguridad de datos.
---
# Migraciones de Supabase

1. Crea `supabase/migrations/AAAAMMDDhhmmss_descripcion_corta.sql` (hora UTC). **Nunca edites una migración ya aplicada.**
2. Escribe SQL que se pueda ejecutar dos veces sin romper: `create table if not exists`, `drop policy if exists` + `create policy`, `add column if not exists`.
3. Toda tabla nueva:
   - `alter table … enable row level security;`
   - Políticas mínimas con `(select auth.uid())`: lectura solo de lo necesario; escritura solo de lo propio.
   - Claves foráneas a `auth.users` con `on delete cascade` para que borrar una cuenta borre sus datos.
4. Funciones: `set search_path = public` y sin `security definer` salvo que sea imprescindible (explícalo).
5. Aplícala al proyecto (panel SQL de Supabase o herramienta de migraciones) y revisa los avisos de seguridad del proyecto.
6. Si el cliente necesita la tabla, añade sus funciones en `src/platform/supabase.js` (en `SBX` o en el adaptador `db`) y nunca llames a Supabase desde otros archivos.
7. Prueba con dos cuentas que una no puede leer ni escribir lo privado de la otra.
