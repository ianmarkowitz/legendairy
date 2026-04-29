import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { FLAVOR_SYSTEM_PROMPT } from '@/lib/flavorPrompt'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'

// ── Zod schema — mirrors the JSON schema in the system prompt ─────────────────

const MixInSchema = z.object({
  name:        z.string().min(1),
  weightGrams: z.number().positive(),
  foldMethod:  z.enum(['fold-frozen', 'swirl-softened', 'fold-after-churn', 'press-surface', 'layer-during-pack']),
  prepNote:    z.string().nullable(),
})

const FlavorSchema = z.object({
  flavorName:       z.string().min(1),
  tagline:          z.string().min(1),
  description:      z.string().min(1),
  whyThisFlavor:    z.string().min(1),
  milkfatPercent:   z.union([z.literal(12), z.literal(13), z.literal(14)]),
  milkfatRationale: z.string().min(1),
  primaryFlavor:    z.string().min(1),
  sweetnessLevel:   z.number().int().min(1).max(10),
  sweetenerType:    z.string().min(1),
  mixIns:           z.array(MixInSchema).min(2),
  allergenFlags:    z.array(z.string()),
  suggestedColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  makerNotes:       z.string(),
})

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY env var is not set.')
    _anthropic = new Anthropic({ apiKey: key })
  }
  return _anthropic
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.prompt || typeof body.prompt !== 'string') {
    return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
  }

  const prompt:    string = body.prompt.trim().slice(0, 2000) // prevent abuse
  const sessionId: string = body.sessionId ?? null

  // Attach to user account if logged in
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  const userId: string | null = user?.id ?? null

  // Call Claude — retry once on malformed JSON
  let flavorData
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const message = await getAnthropic().messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     FLAVOR_SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: prompt }],
      })

      const raw = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')
        .trim()

      // Strip any accidental markdown code fences
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed  = JSON.parse(cleaned)
      flavorData    = FlavorSchema.parse(parsed)
      break
    } catch (err) {
      if (attempt === 2) {
        console.error('Claude flavor generation failed after 2 attempts:', err)
        return NextResponse.json(
          { error: "We couldn't generate your flavor right now. Please try again." },
          { status: 502 },
        )
      }
      // Short wait before retry
      await new Promise(r => setTimeout(r, 500))
    }
  }

  if (!flavorData) {
    return NextResponse.json({ error: 'Flavor generation failed.' }, { status: 502 })
  }

  // Persist to DB
  const { data: row, error: dbErr } = await supabase
    .from('flavor_creations')
    .insert({
      session_id:       sessionId,
      user_id:          userId,
      customer_prompt:  prompt,
      flavor_name:      flavorData.flavorName,
      tagline:          flavorData.tagline,
      description:      flavorData.description,
      why_this_flavor:  flavorData.whyThisFlavor,
      milkfat_percent:  flavorData.milkfatPercent,
      milkfat_rationale: flavorData.milkfatRationale,
      primary_flavor:   flavorData.primaryFlavor,
      sweetness_level:  flavorData.sweetnessLevel,
      sweetener_type:   flavorData.sweetenerType,
      mix_ins:          flavorData.mixIns,
      allergen_flags:   flavorData.allergenFlags,
      suggested_color:  flavorData.suggestedColor,
      maker_notes:      flavorData.makerNotes,
    })
    .select('id')
    .single()

  if (dbErr || !row) {
    console.error('Supabase insert error:', dbErr)
    return NextResponse.json({ error: 'Failed to save flavor. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ id: row.id, flavor: flavorData })
}
