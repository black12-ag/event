create extension if not exists pgcrypto;

create table if not exists public.event_settings (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  subtitle text not null default '',
  opening_eyebrow text not null default '',
  opening_title text not null default '',
  opening_description text not null default '',
  hero_title text not null,
  hero_description text not null default '',
  hero_guest_prefix text not null default 'Dear',
  hero_pending_label text not null default 'Awaiting your RSVP',
  hero_attending_label text not null default 'Confirmed attendance',
  hero_not_attending_label text not null default 'Unable to attend',
  opening_note text not null default '',
  event_date timestamptz not null,
  venue_name text not null,
  venue_address text not null default '',
  map_link text not null default '',
  map_embed_url text not null default '',
  music_url text not null default '',
  autoplay_music boolean not null default false,
  story_title text not null default '',
  story_body text not null default '',
  schedule_title text not null default '',
  schedule_description text not null default '',
  rsvp_title text not null default '',
  rsvp_description text not null default '',
  wishes_title text not null default '',
  footer_note text not null default '',
  primary_button_label text not null default 'Open Invitation',
  directions_button_label text not null default 'Get Directions',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  whatsapp_url text not null default '',
  telegram_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  slug text not null unique,
  is_generic boolean not null default false,
  allowed_guests integer not null default 1 check (allowed_guests >= 1),
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'attending', 'not_attending')),
  bringing_count integer not null default 0 check (bringing_count >= 0),
  opened_at timestamptz,
  responded_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.invites(id) on delete cascade,
  name text not null,
  message text not null,
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'attending', 'not_attending')),
  guests integer not null default 0 check (guests >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null unique,
  type text not null check (type in ('image', 'audio')),
  label text not null default '',
  public_url text not null default '',
  storage_path text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invites add column if not exists is_generic boolean not null default false;
alter table public.event_settings add column if not exists opening_eyebrow text not null default '';
alter table public.event_settings add column if not exists opening_title text not null default '';
alter table public.event_settings add column if not exists opening_description text not null default '';
alter table public.event_settings add column if not exists hero_guest_prefix text not null default 'Dear';
alter table public.event_settings add column if not exists hero_pending_label text not null default 'Awaiting your RSVP';
alter table public.event_settings add column if not exists hero_attending_label text not null default 'Confirmed attendance';
alter table public.event_settings add column if not exists hero_not_attending_label text not null default 'Unable to attend';

create index if not exists invites_slug_idx on public.invites(slug);
create index if not exists invites_created_at_idx on public.invites(created_at desc);
create index if not exists invites_is_generic_idx on public.invites(is_generic);
create index if not exists wishes_created_at_idx on public.wishes(created_at desc);
create index if not exists media_assets_slot_key_idx on public.media_assets(slot_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_event_settings_updated_at on public.event_settings;
create trigger set_event_settings_updated_at
before update on public.event_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_invites_updated_at on public.invites;
create trigger set_invites_updated_at
before update on public.invites
for each row execute function public.set_updated_at();

drop trigger if exists set_wishes_updated_at on public.wishes;
create trigger set_wishes_updated_at
before update on public.wishes
for each row execute function public.set_updated_at();

drop trigger if exists set_media_assets_updated_at on public.media_assets;
create trigger set_media_assets_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

alter table public.event_settings enable row level security;
alter table public.invites enable row level security;
alter table public.wishes enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "Public read wishes" on public.wishes;
create policy "Public read wishes"
on public.wishes
for select
using (true);

drop policy if exists "Public insert wishes" on public.wishes;
create policy "Public insert wishes"
on public.wishes
for insert
with check (true);

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-audio', 'event-audio', true)
on conflict (id) do nothing;
