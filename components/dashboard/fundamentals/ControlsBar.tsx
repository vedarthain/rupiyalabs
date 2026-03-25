'use client'
import type { FundamentalsControls, RangeType } from '@/lib/types'

interface Props {
  controls: FundamentalsControls
  onChange: (c: FundamentalsControls) => void
}

const RANGES: RangeType[] = ['3Y', '5Y', '7Y', '10Y']

export default function ControlsBar({ controls, onChange }: Props) {
  const set = (patch: Partial<FundamentalsControls>) => onChange({ ...controls, ...patch })

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg px-3 py-[9px] flex items-center gap-3 flex-wrap mb-3">

      {/* Consolidated ↔ Standalone */}
      <div className="flex items-center gap-[6px]">
        <span className={`text-[10px] ${!controls.statement || controls.statement === 'consolidated' ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          Consolidated
        </span>
        <label className="relative inline-block w-[30px] h-[17px] cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="opacity-0 w-0 h-0 absolute"
            checked={controls.statement === 'standalone'}
            onChange={e => set({ statement: e.target.checked ? 'standalone' : 'consolidated' })}
          />
          <span className={`absolute inset-0 rounded-full transition-colors duration-200 ${controls.statement === 'standalone' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className={`absolute top-[2px] w-[13px] h-[13px] bg-white rounded-full shadow-sm transition-transform duration-200 ${controls.statement === 'standalone' ? 'translate-x-[15px]' : 'translate-x-[2px]'}`} />
        </label>
        <span className={`text-[10px] ${controls.statement === 'standalone' ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          Standalone
        </span>
      </div>

      <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Annual ↔ Quarterly */}
      <div className="flex items-center gap-[6px]">
        <span className={`text-[10px] ${!controls.period || controls.period === 'annual' ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          Annual
        </span>
        <label className="relative inline-block w-[30px] h-[17px] cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="opacity-0 w-0 h-0 absolute"
            checked={controls.period === 'quarterly'}
            onChange={e => set({ period: e.target.checked ? 'quarterly' : 'annual' })}
          />
          <span className={`absolute inset-0 rounded-full transition-colors duration-200 ${controls.period === 'quarterly' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <span className={`absolute top-[2px] w-[13px] h-[13px] bg-white rounded-full shadow-sm transition-transform duration-200 ${controls.period === 'quarterly' ? 'translate-x-[15px]' : 'translate-x-[2px]'}`} />
        </label>
        <span className={`text-[10px] ${controls.period === 'quarterly' ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          Quarterly
        </span>
      </div>

      <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Range ovals */}
      <div className="flex items-center gap-[6px]">
        <span className="text-[9px] text-gray-400 font-medium">Range</span>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => set({ range: r })}
              className={`text-[9px] font-mono font-semibold px-[10px] py-[3px] rounded-full border-[1.5px] transition-all
                ${controls.range === r
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-500 hover:text-emerald-600'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Active state badge */}
      <div className="ml-auto text-[9px] text-gray-400 font-mono whitespace-nowrap">
        <strong className="text-emerald-600">
          {controls.statement === 'standalone' ? 'Standalone' : 'Consolidated'}
        </strong>
        {' · '}
        <span>{controls.period === 'quarterly' ? 'Quarterly' : 'Annual'}</span>
        {' · '}
        <strong className="text-emerald-600">{controls.range}</strong>
      </div>
    </div>
  )
}
