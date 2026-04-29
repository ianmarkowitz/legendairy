import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import FlavorClient from './FlavorClient'
import type { FlavorCreation } from '@/types/flavor'

interface Props { params: { id: string }; searchParams: { vault?: string } }

export default async function FlavorPage({ params, searchParams }: Props) {
  // Read auth session (null for guests)
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  const { data, error } = await supabase
    .from('flavor_creations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  // Map snake_case DB columns → camelCase type
  const flavor: FlavorCreation = {
    id:               data.id,
    customerPrompt:   data.customer_prompt,
    flavorName:       data.flavor_name,
    tagline:          data.tagline,
    description:      data.description,
    whyThisFlavor:    data.why_this_flavor,
    milkfatPercent:   data.milkfat_percent,
    milkfatRationale: data.milkfat_rationale,
    primaryFlavor:    data.primary_flavor,
    sweetnessLevel:   data.sweetness_level,
    sweetenerType:    data.sweetener_type,
    mixIns:           data.mix_ins,
    allergenFlags:    data.allergen_flags ?? [],
    suggestedColor:   data.suggested_color,
    makerNotes:       data.maker_notes ?? '',
    personalNote:     data.personal_note ?? null,
    sessionId:        data.session_id ?? null,
    createdAt:        data.created_at,
  }

  return <FlavorClient flavor={flavor} userId={user?.id ?? null} autoVault={searchParams.vault === '1'} />
}
