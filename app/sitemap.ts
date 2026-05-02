import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://www.legendairyicecream.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: flavors } = await supabase
    .from('flavor_creations')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  const flavorUrls: MetadataRoute.Sitemap = (flavors ?? []).map(f => ({
    url:          `${BASE}/flavor/${f.id}`,
    lastModified: new Date(f.created_at),
    changeFrequency: 'never',
    priority: 0.6,
  }))

  return [
    { url: BASE,             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/refunds`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...flavorUrls,
  ]
}
