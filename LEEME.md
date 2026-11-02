# Bonk de los Dioses · versión web

## 1. Supabase (cuentas y base de datos)
1. Crea un proyecto en https://supabase.com (gratis).
2. En **SQL Editor** pega y ejecuta `schema.sql`.
3. En **Authentication → Providers → Google** actívalo y pega el *Client ID* y *Client Secret* de Google (paso 2).
4. En **Authentication → URL Configuration** pon en *Site URL* la dirección de tu web en Vercel (ej. `https://bonk-de-los-dioses.vercel.app`) y añádela también en *Redirect URLs*.
5. En **Project Settings → API** copia *Project URL* y la clave *anon public* y ponlas en `config.js`:
   `window.SB_CONFIG={url:'https://xxxx.supabase.co',anonKey:'eyJ...'};`

## 2. Google (botón «Iniciar sesión con Google»)
1. https://console.cloud.google.com → crea un proyecto.
2. **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo *Externo*, nombre «Bonk de los Dioses», tu correo.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**.
4. En *URI de redirección autorizados* pega: `https://xxxx.supabase.co/auth/v1/callback` (la URL de tu proyecto Supabase + `/auth/v1/callback`).
5. Copia el *ID de cliente* y el *Secreto* en Supabase (paso 1.3).

## 3. Vercel (publicar)
Desde esta carpeta, en tu computador:
```
npx vercel --prod
```
(la primera vez te pide iniciar sesión en Vercel). O súbela a un repositorio de GitHub e impórtalo en https://vercel.com/new.
