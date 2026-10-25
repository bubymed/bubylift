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
