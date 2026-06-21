-- ─────────────────────────────────────────────────────────────────────────────
-- Enable Row Level Security on leads.
--
-- Without this, Supabase flags the table "Unrestricted": it's reachable through
-- the public Data API with the anon key (which ships in the frontend), exposing
-- captured email addresses. Every app code path touches leads via the
-- service-role key (lib/supabase.ts), which BYPASSES RLS — so enabling RLS with
-- no policies locks out anon/public access while leaving the app fully working.
-- This matches how profiles / flavor_creations / orders are already secured.
-- ─────────────────────────────────────────────────────────────────────────────

alter table leads enable row level security;
