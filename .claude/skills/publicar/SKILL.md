---
name: publicar
description: Publicar una versión de Bonk de los Dioses en Vercel (comprobaciones, fusión a main, verificación). Úsala cuando pidan subir, desplegar o publicar cambios.
---
# Publicar

`main` se publica sola en Vercel (compila con `npm run build` y sirve `dist/`, ver `vercel.json`).

1. En tu rama: `npm run check` en verde.
2. Si hay migraciones nuevas en `supabase/migrations/`, aplícalas **antes** de publicar el código que las usa.
3. Abre el PR con la plantilla, espera a que pase la CI y fusiónalo a `main`.
4. Cuando Vercel termine, abre la web:
   - la pantalla de carga termina y se ve la portada;
   - entrar con Google funciona y vuelve a la web (si vuelve a `localhost`, revisa *Site URL* y *Redirect URLs* en Supabase → Authentication → URL Configuration);
   - empieza una partida de cada modo durante un minuto.
5. Si algo falla, vuelve a la publicación anterior desde el panel de Vercel (*Promote* / *Rollback*) y arregla en una rama.

Variables de entorno opcionales en Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `GA4_ID` (ID de medición `G-XXXX`; sin él no se carga Google Analytics ni sale el banner de cookies).

Antes de publicar algo que cambie qué datos se guardan o qué servicios externos se usan, actualiza `public/privacidad.html` (y su fecha) y la cabecera `Content-Security-Policy` de `vercel.json`. Si añades una página, añádela también a `public/sitemap.xml`.
