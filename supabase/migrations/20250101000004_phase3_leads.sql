-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 3 — lead capture table
-- ─────────────────────────────────────────────────────────────────────────────

-- 6. Lead capture table (guests who submit email on flavor page without ordering)
-- Uses gen_random_uuid() (Postgres core) rather than uuid_generate_v4() from the
-- uuid-ossp extension: on Supabase that extension lives in the `extensions`
-- schema, which isn't on the search_path when the CLI applies migrations, so
-- uuid_generate_v4() fails to resolve at CREATE TABLE time.
create table if not exists leads (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  flavor_creation_id uuid references flavor_creations(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (email, flavor_creation_id)
);

create index if not exists idx_leads_email      on leads(email);
create index if not exists idx_leads_created_at on leads(created_at desc);
