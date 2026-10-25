-- Bubylift cloud schema (Supabase / PostgreSQL). Run once in: Supabase → SQL Editor.
-- Esquema de la nube de Bubylift. Ejecútalo una vez en: Supabase → SQL Editor.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,   -- ciphertext only / solo texto cifrado
  vault      jsonb,                                       -- data key wrapped by password + recovery key / llave envuelta
  rev        integer     not null default 1,
  updated_at timestamptz not null default now(),
  constraint user_data_size check (octet_length(data::text) < 10000000)
);

alter table public.user_data enable row level security;

-- Each person can only see and change their own row / cada persona solo ve y cambia su propia fila
drop policy if exists "own select" on public.user_data;
drop policy if exists "own insert" on public.user_data;
drop policy if exists "own update" on public.user_data;
drop policy if exists "own delete" on public.user_data;
create policy "own select" on public.user_data for select to authenticated using (auth.uid() = user_id);
create policy "own insert" on public.user_data for insert to authenticated with check (auth.uid() = user_id);
create policy "own update" on public.user_data for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own delete" on public.user_data for delete to authenticated using (auth.uid() = user_id);

-- if you ran an older version of this file / si ejecutaste una versión anterior:
alter table public.user_data add column if not exists vault jsonb;

-- "Delete my account" button / botón "Eliminar mi cuenta"
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---- Strava link (v89) / conexión con Strava ----
-- Only the edge function (service role) reads these. No policies on purpose = nobody else can.
-- Solo la función de borde (service role) las lee. Sin políticas a propósito = nadie más puede.
create table if not exists public.strava_tokens (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint,
  access     text not null,
  refresh    text not null,
  expires_at bigint not null,
  updated_at timestamptz not null default now()
);
alter table public.strava_tokens enable row level security;
create table if not exists public.strava_state (
  state      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.strava_state enable row level security;

-- v0.96: lets the sign-in screen say "this e-mail is not registered" / permite decir "este correo no está registrado"
create or replace function public.email_registered(p_email text) returns boolean
language sql security definer set search_path = public, auth stable as $$
  select exists(select 1 from auth.users where lower(email) = lower(p_email));
$$;
revoke all on function public.email_registered(text) from public;
grant execute on function public.email_registered(text) to anon, authenticated;
