import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import CreationCard from '@/components/CreationCard'
import Link from 'next/link'

export const revalidate = 0

export default async function VaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: vaulted } = await serviceClient
    .from('flavor_creations')
    .select('id, flavor_name, tagline, suggested_color, created_at, is_vaulted')
    .eq('user_id', user.id)
    .eq('is_vaulted', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[#0F0F1F]">The Vault</h1>
        <p className="text-sm text-[#0F0F1F]/50 mt-0.5">
          Your pinned favorites — kept forever
        </p>
      </div>

      {!vaulted || vaulted.length === 0 ? (
        <div className="text-center py-20 text-[#0F0F1F]/40">
          <p className="text-4xl mb-4">♡</p>
          <p className="text-lg font-serif mb-2">Your vault is empty</p>
          <p className="text-sm mb-6">
            Tap the ♡ button on any creation to pin it here permanently.
          </p>
          <Link href="/account/creations" className="text-[#0F0F1F] underline underline-offset-2 text-sm">
            Browse your creations →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaulted.map(c => (
            <CreationCard
              key={c.id}
              id={c.id}
              flavorName={c.flavor_name}
              tagline={c.tagline}
              color={c.suggested_color ?? '#C4922A'}
              createdAt={c.created_at}
              isVaulted={true}
              showVault={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
