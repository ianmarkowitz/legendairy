// ─────────────────────────────────────────────────────────────────────────────
// LEGENDAIRY — SHARED TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MixIn {
  name:        string
  weightGrams: number
  foldMethod:  'fold-frozen' | 'swirl-softened' | 'fold-after-churn' | 'press-surface' | 'layer-during-pack'
  prepNote:    string | null
}

/** Full flavor object as returned by the Claude API and stored in the DB */
export interface FlavorOutput {
  flavorName:       string
  tagline:          string
  description:      string
  whyThisFlavor:    string
  milkfatPercent:   12 | 13 | 14
  milkfatRationale: string
  primaryFlavor:    string
  sweetnessLevel:   number
  sweetenerType:    string
  mixIns:           MixIn[]
  allergenFlags:    string[]
  suggestedColor:   string
  makerNotes:       string
}

/** Customer's runtime customizations (client-side state) */
export interface FlavorCustomizations {
  vegan:           boolean
  enabledMixIns:   string[]          // names of mix-ins that are ON
  sweetnessLevel:  number
  customFlavorName: string | null
  personalNote:    string | null
}

/** flavor_creations row as returned from Supabase */
export interface FlavorCreation extends FlavorOutput {
  id:               string
  customerPrompt:   string
  personalNote:     string | null
  sessionId:        string | null
  createdAt:        string
}

/** Spec sheet data computed at checkout time */
export interface SpecSheet {
  flavorCreationId: string
  customerPrompt:   string
  flavorName:       string
  tagline:          string
  baseType:         string
  milkfatPercent:   number
  milkfatRationale: string
  primaryFlavor:    string
  sweetenerType:    string
  sweetenerGramsPerQtBase: number
  sweetnessLevel:   number
  mixIns:           MixIn[]
  enabledMixIns:    string[]
  allergenFlags:    string[]
  makerNotes:       string
  personalNote:     string | null
  quantityQuarts:   number
  batchCount:       number
  liquidBaseTotalQt: number
  suggestedColor:   string
}
