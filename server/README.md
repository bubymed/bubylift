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

Una sola fila por persona (`user_data`) con sus entrenamientos, rutinas, medidas, plan y metas. Los datos no están cifrados de extremo a extremo: quien administre el proyecto de Supabase puede verlos. La política de privacidad debe decirlo.
One row per person with their workouts, routines, body entries, plan and goals. Data is not end-to-end encrypted: whoever administers the Supabase project can see it.

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
