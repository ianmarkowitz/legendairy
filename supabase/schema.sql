-- ─────────────────────────────────────────────────────────────────────────────
-- LEGENDAIRY ICE CREAM — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Linked to Supabase auth.users. Created via trigger on sign-up (Phase 2).
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ── flavor_creations ─────────────────────────────────────────────────────────
-- One row per AI generation. Stored regardless of whether an order is placed.
create table if not exists flavor_creations (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references profiles(id) on delete set null,  -- null for guests
  session_id        text,                                               -- guest session tracking
  customer_prompt   text not null,                                      -- always stored
  flavor_name       text not null,
  tagline           text not null,
  description       text not null,
  why_this_flavor   text not null,
  milkfat_percent   int check (milkfat_percent in (12, 13, 14)),
  milkfat_rationale text,
  primary_flavor    text,
  sweetness_level   int check (sweetness_level between 1 and 10),
  sweetener_type    text,
  mix_ins           jsonb not null default '[]',  -- array of MixIn objects
  allergen_flags    text[] not null default '{}',
  suggested_color   text,
  maker_notes       text,
  personal_note     text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_flavor_creations_session on flavor_creations(session_id);
create index if not exists idx_flavor_creations_user    on flavor_creations(user_id);

-- ── orders ───────────────────────────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('pending', 'paid', 'in_production', 'fulfilled', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_type as enum ('delivery', 'pickup');
exception when duplicate_object then null; end $$;

create table if not exists orders (
  id                       uuid primary key default uuid_generate_v4(),
  order_reference          text not null unique,          -- LD-YYYYMMDD-XXXX
  user_id                  uuid references profiles(id) on delete set null,
  flavor_creation_id       uuid references flavor_creations(id) on delete restrict,
  customer_name            text,
  customer_email           text,
  quantity_quarts          int not null check (quantity_quarts >= 2 and quantity_quarts % 2 = 0),
  batch_count              int not null generated always as (quantity_quarts / 2) stored,
  unit_price_cents         int not null default 1999,
  total_price_cents        int not null,
  stripe_payment_intent_id text,
  stripe_session_id        text unique,                   -- idempotency key
  status                   order_status not null default 'pending',
  delivery_type            delivery_type not null default 'pickup',
  delivery_address         jsonb,
  spec_sheet_sent          boolean not null default false,
  created_at               timestamptz not null default now()
);

create index if not exists idx_orders_status     on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_customer   on orders(customer_email);
create index if not exists idx_orders_reference  on orders(order_reference);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- We use the service role key in all API routes, so RLS doesn't apply there.
-- These policies protect direct DB access.

alter table profiles          enable row level security;
alter table flavor_creations  enable row level security;
alter table orders            enable row level security;

-- Admins can do everything (Phase 3 dashboard will use service role anyway)
create policy "Service role bypass" on profiles
  using (true) with check (true);

-- Flavor creations are readable by anyone with the ID (public by UUID)
create policy "Public read by ID" on flavor_creations
  for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 2 MIGRATIONS — run these in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add vault flag to flavor_creations
alter table flavor_creations
  add column if not exists is_vaulted boolean not null default false;

create index if not exists idx_flavor_creations_vaulted
  on flavor_creations(user_id, is_vaulted);

-- 2. Auto-create profile row when a user signs up via magic link
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Enable magic link / OTP in Supabase Dashboard:
--    Auth → Providers → Email → enable "Magic links"
--    Auth → URL Configuration → add https://www.legendairyicecream.com/auth/callback

-- ─────────────────────────────────────────────────────────────────────────────
-- REFINEMENTS MIGRATIONS — run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 4. Add 'shipped' status + tracking columns
alter type order_status add value if not exists 'shipped';
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists shipped_at timestamptz;
