'use client'

interface KpiProps {
  label: string
  value: string
  color?: 'green' | 'red' | 'amber' | 'blue' | 'default'
  sub?: string
}

const COLOR_MAP = {
  green:   'text-emerald-600',
  red:     'text-red-500',
  amber:   'text-amber-600',
  blue:    'text-blue-600',
  default: 'text-gray-900',
}

export function KpiTile({ label, value, color = 'default', sub }: KpiProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-[8px_10px]">
      <div className="text-[9px] text-gray-400 mb-[3px]">{label}</div>
      <div className={`text-[14px] font-semibold font-mono ${COLOR_MAP[color]}`}>{value}</div>
      {sub && <div className="text-[9px] text-gray-400 mt-[2px]">{sub}</div>}
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

export function KpiSection({ title, children }: SectionProps) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-[7px]">{title}</div>
      <div className="grid gap-[6px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))' }}>
        {children}
      </div>
    </div>
  )
}
