import type { Metadata } from 'next'
import DreamInput from '@/components/DreamInput'
import RecentFlavors from '@/components/RecentFlavors'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Legendairy — Custom Artisan Ice Cream Made to Order',
  description:
    'Describe any flavor — a memory, a feeling, a craving — and we\'ll turn it into a one-of-one artisan ice cream recipe. Churned fresh and shipped to your door.',
  keywords: [
    'custom ice cream', 'personalized ice cream', 'made to order ice cream',
    'artisan ice cream', 'unique ice cream flavors', 'custom ice cream flavors',
    'AI ice cream', 'design your own ice cream', 'one of a kind ice cream',
    'custom ice cream gift', 'small batch ice cream', 'ice cream shipped to door',
  ],
  openGraph: {
    title: 'Legendairy — Custom Artisan Ice Cream Made to Order',
    description: 'Describe any flavor and we\'ll churn it from scratch. One-of-one artisan ice cream made just for you and shipped to your door.',
    url: 'https://www.legendairyicecream.com',
    siteName: 'Legendairy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legendairy — Custom Artisan Ice Cream Made to Order',
    description: 'Describe any flavor and we\'ll churn it from scratch. One-of-one artisan ice cream made just for you.',
  },
  alternates: {
    canonical: 'https://www.legendairyicecream.com',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.legendairyicecream.com/#organization',
      name: 'Legendairy',
      url: 'https://www.legendairyicecream.com',
      logo: 'https://www.legendairyicecream.com/icon.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@legendairyicecream.com',
        contactType: 'customer service',
      },
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'MA',
        addressCountry: 'US',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.legendairyicecream.com/#website',
      url: 'https://www.legendairyicecream.com',
      name: 'Legendairy',
      publisher: { '@id': 'https://www.legendairyicecream.com/#organization' },
    },
    {
      '@type': 'Product',
      name: 'Custom Artisan Ice Cream',
      description:
        'One-of-one artisan ice cream made from your description. Each recipe is AI-generated specifically for your prompt, then churned fresh and shipped to your door on dry ice.',
      brand: { '@type': 'Brand', name: 'Legendairy' },
      offers: {
        '@type': 'Offer',
        price: '19.99',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '19.99',
          priceCurrency: 'USD',
          unitText: 'per quart',
        },
        availability: 'https://schema.org/InStock',
        url: 'https://www.legendairyicecream.com',
        seller: { '@id': 'https://www.legendairyicecream.com/#organization' },
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is every flavor really one-of-one?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Each recipe is generated specifically for your prompt and never reused.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does custom ice cream cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '$19.99 per quart with a two-quart minimum order. No hidden fees.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does delivery take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Typically 5–7 business days from order confirmation to your front door, shipped on dry ice.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I save and re-order my custom flavor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — every flavor gets a permanent page. Save it to your Vault and reorder anytime.',
          },
        },
      ],
    },
  ],
}

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DreamInput />
      <RecentFlavors />
    </main>
  )
}
