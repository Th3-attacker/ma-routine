-- ELHADJ : tables synchronisées, une par table locale (Dexie).
-- Chaque ligne appartient à un compte (user_id) ; le contenu est gardé tel quel en JSON (data).
-- updated_at : heure de modification sur le téléphone (ms), pour « la plus récente gagne ».
-- synced_at  : heure d'arrivée sur le serveur, pour récupérer seulement ce qui a changé depuis la dernière synchro.
-- La table locale « security » (code à 4 chiffres) n'existe PAS ici : elle ne quitte jamais le téléphone.

create or replace function public.elhadj_touch_synced_at()
returns trigger
language plpgsql
as $$
begin
  new.synced_at := clock_timestamp();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['settings', 'days', 'transactions', 'projects', 'tasks', 'debts', 'savings_goals', 'recurring']
  loop
    execute format($f$
      create table if not exists public.%1$I (
        user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
        id text not null,
        data jsonb not null default '{}'::jsonb,
        updated_at bigint not null default 0,
        deleted boolean not null default false,
        synced_at timestamptz not null default clock_timestamp(),
        primary key (user_id, id)
      );
      create index if not exists %1$s_synced_idx on public.%1$I (user_id, synced_at);
      alter table public.%1$I enable row level security;

      drop policy if exists "%1$s_select_own" on public.%1$I;
      drop policy if exists "%1$s_insert_own" on public.%1$I;
      drop policy if exists "%1$s_update_own" on public.%1$I;
      drop policy if exists "%1$s_delete_own" on public.%1$I;
      create policy "%1$s_select_own" on public.%1$I for select to authenticated using (user_id = (select auth.uid()));
      create policy "%1$s_insert_own" on public.%1$I for insert to authenticated with check (user_id = (select auth.uid()));
      create policy "%1$s_update_own" on public.%1$I for update to authenticated
        using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
      create policy "%1$s_delete_own" on public.%1$I for delete to authenticated using (user_id = (select auth.uid()));

      drop trigger if exists %1$s_synced_at on public.%1$I;
      create trigger %1$s_synced_at before insert or update on public.%1$I
        for each row execute function public.elhadj_touch_synced_at();
    $f$, t);
  end loop;
end;
$$;

-- Phase 3 : abonnements aux notifications et journal des envois (contre les doublons).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own" on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "push_subscriptions_update_own" on public.push_subscriptions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.push_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, day, kind)
);
-- Écrit seulement par la fonction serveur (clé service) : aucun accès depuis l'app.
alter table public.push_log enable row level security;
