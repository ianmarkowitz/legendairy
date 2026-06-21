# legendairy

## Database migrations

Schema changes live as versioned files in `supabase/migrations/`, applied with
the Supabase CLI instead of pasting SQL into the dashboard by hand.

One-time setup (per machine, once per project):

```bash
npx supabase login              # opens a browser to authenticate your Supabase account
npm run db:link -- --project-ref <your-project-ref>   # find this in Supabase → Project Settings → General
```

After that, applying schema changes is just:

```bash
npm run db:push                 # applies any migrations not yet run on the linked project
```

To add a new schema change, create a new file with `npm run db:new -- <name>`
and write SQL into it, then `npm run db:push`. Never edit a migration that's
already been pushed — add a new one instead.

`supabase/schema.sql` is kept only as a historical, single-file reference of
the full schema — it is not run directly and is not updated for new changes.
