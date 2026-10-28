-- Phase 3 : langue de chaque abonnement (la notification s'affiche dans la langue de l'appareil)
alter table public.push_subscriptions add column if not exists lang text not null default 'fr';
alter table public.push_subscriptions add column if not exists updated_at timestamptz not null default now();

-- Appel de la fonction send-prayer-push chaque minute (pg_cron + pg_net).
-- L'adresse et le secret sont lus dans le coffre (vault) : ils ne sont jamais écrits dans ce fichier.
-- Les deux secrets se créent une seule fois, hors du dépôt :
--   select vault.create_secret('<url de la fonction>', 'elhadj_push_url');
--   select vault.create_secret('<CRON_SECRET>', 'elhadj_cron_secret');
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'elhadj-send-prayer-push';
select cron.schedule(
  'elhadj-send-prayer-push',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'elhadj_push_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'elhadj_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);
