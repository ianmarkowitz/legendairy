-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 3 — lead capture table
-- ─────────────────────────────────────────────────────────────────────────────

-- 6. Lead capture table (guests who submit email on flavor page without ordering)
create table if not exists leads (
  id                 uuid primary key default uuid_generate_v4(),
  email              text not null,
  flavor_creation_id uuid references flavor_creations(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (email, flavor_creation_id)
);

create index if not exists idx_leads_email      on leads(email);
create index if not exists idx_leads_created_at on leads(created_at desc);
