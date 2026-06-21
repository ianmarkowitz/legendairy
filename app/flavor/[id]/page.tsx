import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import FlavorClient from './FlavorClient'
import type { FlavorCreation } from '@/types/flavor'
import { PRICE_PER_QUART_CENTS } from '@/lib/constants'

interface Props { params: { id: string }; searchParams: { vault?: string } }

const BASE = 'https://www.legendairyicecream.com'
const PRICE_DISPLAY = (PRICE_PER_QUART_CENTS / 100).toFixed(2)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('flavor_creations')
    .select('flavor_name, tagline, suggested_color, created_at')
    .eq('id', params.id)
    .single()

  if (!data) return {}

  const title = `${data.flavor_name} — Legendairy Custom Ice Cream`
  const description = `${data.tagline} A one-of-one artisan ice cream, churned fresh and shipped to your door by Legendairy.`
  const url = `${BASE}/flavor/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Legendairy',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default async function FlavorPage({ params, searchParams }: Props) {
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  const { data, error } = await supabase
    .from('flavor_creations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: flavor.flavorName,
    description: flavor.tagline,
    brand: { '@type': 'Brand', name: 'Legendairy' },
    offers: {
      '@type': 'Offer',
      price: PRICE_DISPLAY,
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: PRICE_DISPLAY,
        priceCurrency: 'USD',
        unitText: 'per quart',
      },
      availability: 'https://schema.org/InStock',
      url: `${BASE}/flavor/${flavor.id}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FlavorClient flavor={flavor} userId={user?.id ?? null} autoVault={searchParams.vault === '1'} />
    </>
  )
}
