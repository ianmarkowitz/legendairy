// ─────────────────────────────────────────────────────────────────────────────
// LEGENDAIRY ICE CREAM — PRODUCTION CONSTANTS
// Single source of truth. Never hardcode these values elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── Pricing ──────────────────────────────────────────────────────────────────
export const PRICE_PER_QUART_CENTS = 50            // ⚠️ TEST MODE — change back to 1999 before launch
export const MIN_QUARTS            = 2
export const QUART_INCREMENT       = 2             // UI stepper increment

// ── Batch Math ───────────────────────────────────────────────────────────────
// 1 batch = 1.5 qt liquid base → 2 qt finished ice cream
export const LIQUID_BASE_PER_BATCH_QT  = 1.5      // qt of liquid base per batch
export const FINISHED_PER_BATCH_QT     = 2        // qt of finished product per batch
export const LIQUID_BASE_PER_BATCH_ML  = 1419     // ml equivalent of 1.5 qt

// ── Sugar Scale ───────────────────────────────────────────────────────────────
// Grams of cane sugar per quart of liquid base, indexed by sweetness level 1–10.
// Level 5 (~130g) ≈ 13% sugar by base weight — standard balanced sweetness.
// Never go below 90g (causes iciness) or above 180g (cloying).
export const SUGAR_SCALE_GRAMS: Record<number, number> = {
  1:  90,
  2: 100,
  3: 110,
  4: 120,
  5: 130,  // default
  6: 140,
  7: 150,
  8: 160,
  9: 170,
  10: 180,
}
export const DEFAULT_SWEETNESS_LEVEL = 5

// ── Base Types ────────────────────────────────────────────────────────────────
export const BASE_WHOLE_CREAM  = 'whole-cream'    // 12–14% butterfat, AI selects

// ── Operations ───────────────────────────────────────────────────────────────
export const MAKER_EMAIL = 'ian@ianmarkowitz.com'

// ── Order Reference ───────────────────────────────────────────────────────────
// Format: LD-YYYYMMDD-XXXX
export const ORDER_REF_PREFIX = 'LD'

// ── Allergen Display Colors ───────────────────────────────────────────────────
// Allergen badges are always shown in red — food safety non-negotiable.
export const ALLERGEN_COLOR = 'text-red-600 bg-red-50 border-red-200'
