# Cuentas en la nube de Bubylift / Bubylift cloud accounts

La app funciona igual sin esto. Esto solo **enciende** las cuentas y la sincronización. Todo es gratis (plan gratuito de Supabase) y toma unos 10 minutos.
The app works the same without this. These steps only **turn on** accounts and sync. Free Supabase plan, about 10 minutes.

## Pasos / Steps

1. Entra a https://supabase.com y crea una cuenta. Pulsa **New project**. Ponle nombre `bubylift`, elige una contraseña para la base de datos (guárdala) y la región más cercana (por ejemplo *East US*). Espera 1–2 minutos.
2. En el menú izquierdo abre **SQL Editor** → **New query**. Pega todo el contenido de `server/schema.sql` y pulsa **Run**. Debe decir *Success*.
3. Abre **Authentication → Providers → Email**. Déjalo activado. Apaga **Confirm email** por ahora (el plan gratuito solo envía 2 correos por hora; con la confirmación encendida, la gente no podría registrarse rápido). Cuando haya más usuarios se configura un servicio de correo propio.
4. Abre **Authentication → URL Configuration**. En **Site URL** pon `https://bubymed.github.io/bubylift/` y añade esa misma dirección en **Redirect URLs**. Así los enlaces de "olvidé mi contraseña" abren la app.
5. Abre **Project Settings → API**. Copia dos valores: **Project URL** y la clave **anon public**. Pásamelos en el chat. Los dos son públicos por diseño: la clave *anon* se puede publicar porque cada tabla está protegida por seguridad por filas (RLS).
   **Nunca** me pases ni publiques la clave `service_role`.

Yo los pongo en `data/cloudcfg.js`, y la tarjeta "Tu progreso, en cualquier teléfono" aparece en Más.

## Qué se guarda / What is stored

Una sola fila por persona (`user_data`) con sus datos **cifrados de extremo a extremo** en el teléfono (AES-256-GCM): quien administre el proyecto de Supabase solo ve texto cifrado, el tamaño y la fecha, más el correo. La llave de datos se guarda envuelta por la contraseña y por una clave de recuperación que solo ve la persona; la contraseña que recibe Supabase es una derivación de un solo sentido. Si se pierden la contraseña y la clave de recuperación, los datos de la nube no se pueden recuperar (los del teléfono siguen ahí). Si ya habías ejecutado `schema.sql`, vuelve a ejecutarlo: agrega la columna `vault`.
One row per person (`user_data`) with their data **end-to-end encrypted** on the phone (AES-256-GCM): whoever administers the Supabase project only sees ciphertext, its size and timestamp, plus the e-mail. The data key is stored wrapped by the password and by a recovery key only the person sees; the password Supabase receives is a one-way derivation. If both the password and the recovery key are lost, the cloud data cannot be recovered (data on the phone stays). If you already ran `schema.sql`, run it again: it adds the `vault` column.

---

## Strava (frecuencia cardíaca y calorías de tu reloj) / Strava (heart rate and calories from your watch)

Requiere que ya funcionen las cuentas (arriba). Es opcional. / Needs accounts working first. Optional.

1. Entra a https://www.strava.com/settings/api y crea tu app: nombre `Bubylift`, categoría *Training*, sitio web `https://bubymed.github.io/bubylift/`. En **Authorization Callback Domain** pon `TU-PROYECTO.supabase.co` (sin `https://`; es el dominio de tu *Project URL*). Sube un icono (`icons/icon-512.png`). Copia el **Client ID** y el **Client Secret**.
2. En Supabase, abre el **SQL Editor** y vuelve a ejecutar `server/schema.sql` (es seguro repetirlo; agrega las tablas de Strava).
3. Instala la CLI de Supabase y, desde la carpeta del repositorio:
   ```
   supabase login
   supabase link --project-ref TU-PROYECTO
   supabase secrets set STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... APP_URL=https://bubymed.github.io/bubylift/
   supabase functions deploy strava --no-verify-jwt --project-ref TU-PROYECTO
   ```
   (`--no-verify-jwt` es necesario porque Strava vuelve sin sesión; la función revisa la sesión por su cuenta en cada paso, y la vuelta de Strava solo se acepta con un código de un solo uso.)
4. Avísame y pongo `strava:true` en `data/cloudcfg.js`.

**Ojo con las reglas de Strava** (https://developers.strava.com/guidelines/): una app nueva empieza limitada a **un solo atleta** (tú) hasta que Strava aprueba más cupo; se muestra "Powered by Strava"; y los datos de Strava solo se le muestran a la persona dueña. La tarjeta para compartir con datos de Strava es una imagen que la propia persona decide publicar; revisa que esto cumpla las reglas vigentes antes de abrirla a más gente.


> v91: the Strava function has a new action (`recent`). Redeploy it: `supabase functions deploy strava --no-verify-jwt`.
> v91: la función de Strava tiene una acción nueva (`recent`). Vuelve a desplegarla: `supabase functions deploy strava --no-verify-jwt`.
