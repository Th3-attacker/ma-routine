-- Notifications d'adhan sans compte : chaque abonnement porte ce qu'il faut pour calculer les horaires
-- (position arrondie à ~1 km, fuseau, langue, choix de notifications). Ni nom, ni e-mail.
-- Le téléphone écrit par deux fonctions (pas d'accès direct aux tables) ; l'adresse de notification, impossible à
-- deviner, sert de clé.

alter table public.push_subscriptions alter column user_id drop not null;
alter table public.push_subscriptions alter column user_id drop default;
alter table public.push_subscriptions add column if not exists lat double precision;
alter table public.push_subscriptions add column if not exists lng double precision;
alter table public.push_subscriptions add column if not exists timezone text;
alter table public.push_subscriptions add column if not exists notif jsonb;
alter table public.push_subscriptions add column if not exists hijri_adj smallint not null default 0;

-- Journal anti-doublon par abonnement (et non plus par compte).
alter table public.push_log alter column user_id drop not null;
alter table public.push_log add column if not exists sub_id uuid references public.push_subscriptions (id) on delete cascade;
create unique index if not exists push_log_sub_day_kind on public.push_log (sub_id, day, kind);

create or replace function public.save_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_lang text,
  p_lat double precision,
  p_lng double precision,
  p_timezone text,
  p_notif jsonb,
  p_hijri_adj integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Seulement les services de notification des navigateurs (Google, Apple, Mozilla, Microsoft, Huawei).
  if p_endpoint !~ '^https://([a-z0-9-]+\.)*(googleapis\.com|push\.apple\.com|mozilla\.com|notify\.windows\.com|hicloud\.com|dbankcloud\.com)/'
     or length(p_endpoint) > 1000 or length(p_p256dh) > 200 or length(p_auth) > 100 then
    raise exception 'invalid subscription';
  end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'invalid position';
  end if;
  if length(p_timezone) > 64 or jsonb_typeof(p_notif) <> 'object' or length(p_notif::text) > 2000 then
    raise exception 'invalid settings';
  end if;

  insert into public.push_subscriptions as s
    (endpoint, p256dh, auth, lang, lat, lng, timezone, notif, hijri_adj, user_id, updated_at)
  values (
    p_endpoint, p_p256dh, p_auth,
    case when p_lang = 'ar' then 'ar' else 'fr' end,
    round(p_lat::numeric, 2), round(p_lng::numeric, 2),
    p_timezone, p_notif, greatest(-2, least(2, coalesce(p_hijri_adj, 0))), null, now()
  )
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh, auth = excluded.auth, lang = excluded.lang,
    lat = excluded.lat, lng = excluded.lng, timezone = excluded.timezone,
    notif = excluded.notif, hijri_adj = excluded.hijri_adj, user_id = null, updated_at = now();
end;
$$;

create or replace function public.delete_push_subscription(p_endpoint text) returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;

revoke all on function public.save_push_subscription(text, text, text, text, double precision, double precision, text, jsonb, integer) from public;
revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.save_push_subscription(text, text, text, text, double precision, double precision, text, jsonb, integer) to anon, authenticated;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;
