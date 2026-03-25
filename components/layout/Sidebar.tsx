'use client'
import { useState } from 'react'
import type { IndustryGroup } from '@/lib/types'
import { fmtPrice, fmtPct } from '@/lib/utils'

interface Props {
  industries: IndustryGroup[]
  loading: boolean
  selectedSymbol: string | null
  onSelectStock: (symbol: string) => void
}

export default function Sidebar({ industries, loading, selectedSymbol, onSelectStock }: Props) {
  const [openGroup, setOpenGroup] = useState<string | null>(industries[0]?.name ?? null)
  const [sortBy, setSortBy] = useState('market_cap')

  // Open first group once data loads
  if (industries.length > 0 && openGroup === null) {
    setOpenGroup(industries[0].name)
  }

  return (
    <div className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <span className="text-[11px] font-medium text-gray-900">Industries</span>
        <span className="text-[10px] text-gray-400 font-mono">{industries.reduce((a, b) => a + b.count, 0)}</span>
      </div>

      {/* Sort */}
      <div className="px-2 py-1 border-b border-gray-200 flex items-center gap-1 flex-shrink-0">
        <span className="text-[10px] text-gray-400">Sort by</span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-[10px] border-none bg-transparent text-gray-600 outline-none cursor-pointer"
        >
          <option value="market_cap">Mkt Cap ↓</option>
          <option value="roe">ROE ↓</option>
          <option value="pe_ratio">PE ↓</option>
          <option value="piotroski_score">Piotroski ↓</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-[11px] text-gray-400">Loading...</div>
        )}
        {industries.map(group => (
          <div key={group.name} className="border-b border-gray-100">
            {/* Group header */}
            <div
              onClick={() => setOpenGroup(openGroup === group.name ? null : group.name)}
              className={`px-3 py-[7px] flex justify-between items-center cursor-pointer border-l-[3px] select-none
                ${openGroup === group.name
                  ? 'bg-emerald-50 border-l-emerald-500'
                  : 'bg-gray-50 border-l-transparent hover:bg-gray-100'
                }`}
            >
              <span className={`text-[11px] font-medium ${openGroup === group.name ? 'text-emerald-800' : 'text-gray-900'}`}>
                {group.name}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] px-[5px] py-[1px] rounded-full font-mono border
                  ${openGroup === group.name
                    ? 'bg-emerald-200 text-emerald-800 border-transparent'
                    : 'bg-white text-gray-400 border-gray-200'
                  }`}>
                  {group.count}
                </span>
                <span className={`text-[9px] transition-transform duration-150 ${openGroup === group.name ? 'rotate-90 text-emerald-500' : 'text-gray-400'}`}>
                  ▶
                </span>
              </div>
            </div>

            {/* Stocks */}
            {openGroup === group.name && (
              <div className="bg-white">
                {group.stocks.map((stock, i) => {
                  const symbol = stock.nse_code || String(stock.id)
                  const isSelected = selectedSymbol === symbol
                  const chg = stock.day_change_pct
                  return (
                    <div
                      key={stock.id}
                      onClick={() => onSelectStock(symbol)}
                      className={`px-2 py-[7px] pl-3 border-b border-gray-50 cursor-pointer flex items-center gap-1
                        ${isSelected ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-emerald-50/40'}`}
                    >
                      <span className="text-[9px] text-gray-400 w-3 text-right font-mono flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-gray-900 truncate">{stock.name}</div>
                        <div className="flex justify-between mt-[1px]">
                          <span className="text-[10px] font-mono text-gray-900">{fmtPrice(stock.current_price)}</span>
                          <span className={`text-[10px] font-mono ${chg != null && chg >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {chg != null ? `${chg >= 0 ? '+' : ''}${chg.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-400 italic truncate mt-[1px]">{stock.industry}</div>
                        <div className="text-[9px] text-gray-400 mt-[1px]">
                          ROE {stock.roe?.toFixed(1) ?? '—'}% · Pio {stock.piotroski_score ?? '—'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-shrink-0">
                        <div className="w-[14px] h-[14px] rounded-sm border border-gray-200 bg-gray-50 flex items-center justify-center text-[8px] text-gray-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">▲</div>
                        <div className="w-[14px] h-[14px] rounded-sm border border-gray-200 bg-gray-50 flex items-center justify-center text-[8px] text-gray-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">▼</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
