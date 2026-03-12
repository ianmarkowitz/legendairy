interface Props { flags: string[] }

export default function AllergenBadges({ flags }: Props) {
  if (flags.length === 0) return null
  return (
    <div>
      <p className="text-red-400 font-semibold text-sm mb-2">⚠️ Contains Allergens</p>
      <div className="flex flex-wrap gap-2">
        {flags.map(flag => (
          <span
            key={flag}
            className="text-xs font-semibold uppercase tracking-wide bg-red-950/40 text-red-400 border border-red-800/30 rounded-full px-3 py-1"
          >
            {flag}
          </span>
        ))}
      </div>
    </div>
  )
}
