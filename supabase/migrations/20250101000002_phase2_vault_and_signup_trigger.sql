-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 2 — vault flag + auto-create profile on sign-up
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

-- 3. Magic link / OTP must still be enabled by hand in the Supabase Dashboard:
--    Auth → Providers → Email → enable "Magic links"
--    Auth → URL Configuration → add https://www.legendairyicecream.com/auth/callback
