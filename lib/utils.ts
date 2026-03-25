// ── Number formatters ─────────────────────────────────────────

/** Format rupee market cap: 14200 → ₹14.2K Cr, 760000 → ₹7.6L Cr */
export function fmtMcap(val: number | null | undefined): string {
  if (val == null) return '—'
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`
  if (val >= 1000)   return `₹${(val / 1000).toFixed(1)}K Cr`
  return `₹${val.toFixed(0)} Cr`
}

/** Format crore amount: 24840 → ₹24,840 Cr */
export function fmtCr(val: number | null | undefined): string {
  if (val == null) return '—'
  if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`
  if (Math.abs(val) >= 1000)   return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`
  return `₹${val.toFixed(1)} Cr`
}

/** Format price: 1842.5 → ₹1,842 */
export function fmtPrice(val: number | null | undefined): string {
  if (val == null) return '—'
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

/** Format percentage: 29.4 → 29.4% */
export function fmtPct(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(decimals)}%`
}

/** Format percentage without sign: 29.4 → 29.4% */
export function fmtPctAbs(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return `${val.toFixed(decimals)}%`
}

/** Format multiple: 24.1 → 24.1× */
export function fmtX(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return `${val.toFixed(decimals)}×`
}

/** Format days: 74.2 → 74d */
export function fmtDays(val: number | null | undefined): string {
  if (val == null) return '—'
  return `${Math.round(val)}d`
}

/** Format generic number */
export function fmtNum(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toFixed(decimals)
}

// ── Color helpers ─────────────────────────────────────────────
type ColorClass = 'text-emerald-600' | 'text-red-500' | 'text-amber-600' | 'text-blue-600' | 'text-gray-500'

/** Returns Tailwind text color class based on value vs threshold */
export function valColor(
  val: number | null | undefined,
  goodThreshold: number,
  warnThreshold: number,
  higherIsBetter = true
): ColorClass {
  if (val == null) return 'text-gray-500'
  if (higherIsBetter) {
    if (val >= goodThreshold) return 'text-emerald-600'
    if (val >= warnThreshold) return 'text-amber-600'
    return 'text-red-500'
  } else {
    if (val <= goodThreshold) return 'text-emerald-600'
    if (val <= warnThreshold) return 'text-amber-600'
    return 'text-red-500'
  }
}

/** Sign color: positive → green, negative → red, zero → gray */
export function signColor(val: number | null | undefined): ColorClass {
  if (val == null) return 'text-gray-500'
  if (val > 0) return 'text-emerald-600'
  if (val < 0) return 'text-red-500'
  return 'text-gray-500'
}

// ── Range avg lookup ─────────────────────────────────────────
// Used in Fundamentals tab KPI subtitles
export type RangeKey = '3Y' | '5Y' | '7Y' | '10Y'

export function rangeLabel(range: RangeKey, type: 'avg' | 'cagr', suffix?: string): string {
  return suffix ? `${range} ${type} ${suffix}` : `${range} ${type}`
}
