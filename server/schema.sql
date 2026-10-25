-- Bubylift cloud schema (Supabase / PostgreSQL). Run once in: Supabase → SQL Editor.
-- Esquema de la nube de Bubylift. Ejecútalo una vez en: Supabase → SQL Editor.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
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

-- "Delete my account" button / botón "Eliminar mi cuenta"
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
