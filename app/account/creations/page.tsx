import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import CreationCard from '@/components/CreationCard'
import Link from 'next/link'

export const revalidate = 0

export default async function CreationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: creations } = await serviceClient
    .from('flavor_creations')
    .select('id, flavor_name, tagline, suggested_color, created_at, is_vaulted')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-[#0F0F1F]">My Creations</h1>
          <p className="text-sm text-[#0F0F1F]/50 mt-0.5">
            Every flavor you&apos;ve dreamed up
          </p>
        </div>
        <Link
          href="/"
          className="text-sm px-4 py-2 bg-[#0F0F1F] text-[#EDE5D5] rounded-xl hover:bg-[#0F0F1F]/90 transition-colors"
        >
          + New flavor
        </Link>
      </div>

      {!creations || creations.length === 0 ? (
        <div className="text-center py-20 text-[#0F0F1F]/40">
          <p className="text-4xl mb-4">🍦</p>
          <p className="text-lg font-serif mb-2">No creations yet</p>
          <p className="text-sm mb-6">Your AI-generated flavors will appear here.</p>
          <Link href="/" className="text-[#0F0F1F] underline underline-offset-2 text-sm">
            Dream up your first flavor →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creations.map(c => (
            <CreationCard
              key={c.id}
              id={c.id}
              flavorName={c.flavor_name}
              tagline={c.tagline}
              color={c.suggested_color ?? '#C4922A'}
              createdAt={c.created_at}
              isVaulted={c.is_vaulted ?? false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
