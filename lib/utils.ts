import { LIQUID_BASE_PER_BATCH_QT, ORDER_REF_PREFIX, SUGAR_SCALE_GRAMS } from './constants'
import type { FlavorCustomizations, FlavorOutput, SpecSheet } from '@/types/flavor'

// ── Batch math ────────────────────────────────────────────────────────────────

export function batchCount(quantityQuarts: number): number {
  return quantityQuarts / 2
}

export function liquidBaseQt(quantityQuarts: number): number {
  return batchCount(quantityQuarts) * LIQUID_BASE_PER_BATCH_QT
}

export function sugarGramsTotal(sweetnessLevel: number, quantityQuarts: number): number {
  const gramsPerQtBase = SUGAR_SCALE_GRAMS[sweetnessLevel] ?? SUGAR_SCALE_GRAMS[5]
  return gramsPerQtBase * liquidBaseQt(quantityQuarts)
}

// ── Fulfillment date ──────────────────────────────────────────────────────────
// Orders ship every Monday; minimum 3 days after order date.

export function calculateShipDate(orderDate: Date): Date {
  const d = new Date(orderDate)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3)                    // advance by minimum 3 days
  const day = d.getDay()                         // 0=Sun 1=Mon ... 6=Sat
  const daysToMonday = day === 1 ? 0 : (8 - day) % 7
  d.setDate(d.getDate() + daysToMonday)
  return d
}

export function formatShipDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Order reference ───────────────────────────────────────────────────────────

export function buildOrderRef(date: Date, sequence: number): string {
  const y  = date.getFullYear()
  const m  = String(date.getMonth() + 1).padStart(2, '0')
  const d  = String(date.getDate()).padStart(2, '0')
  const seq = String(sequence).padStart(4, '0')
  return `${ORDER_REF_PREFIX}-${y}${m}${d}-${seq}`
}

// ── Price formatting ──────────────────────────────────────────────────────────

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ── Spec sheet builder ────────────────────────────────────────────────────────

export function buildSpecSheet(
  flavorCreationId: string,
  customerPrompt:   string,
  flavor:           FlavorOutput,
  customizations:   FlavorCustomizations,
  quantityQuarts:   number,
): SpecSheet {
  const batches  = batchCount(quantityQuarts)
  const baseQts  = liquidBaseQt(quantityQuarts)
  const sugarGrams = SUGAR_SCALE_GRAMS[customizations.sweetnessLevel] ?? SUGAR_SCALE_GRAMS[5]

  return {
    flavorCreationId,
    customerPrompt,
    flavorName:      customizations.customFlavorName ?? flavor.flavorName,
    tagline:         flavor.tagline,
    baseType:         'Whole-Milk Cream',
    milkfatPercent:   flavor.milkfatPercent,
    milkfatRationale: flavor.milkfatRationale,
    primaryFlavor:   flavor.primaryFlavor,
    sweetenerType:   flavor.sweetenerType,
    sweetenerGramsPerQtBase: sugarGrams,
    sweetnessLevel:  customizations.sweetnessLevel,
    mixIns:          flavor.mixIns,
    enabledMixIns:   customizations.enabledMixIns,
    allergenFlags:   flavor.allergenFlags,
    makerNotes:      flavor.makerNotes,
    personalNote:    customizations.personalNote,
    quantityQuarts,
    batchCount:      batches,
    liquidBaseTotalQt: baseQts,
    suggestedColor:  flavor.suggestedColor,
  }
}
