'use client'
import type { StockDetail } from '@/lib/types'
import { fmtPrice, fmtMcap, fmtX, fmtNum } from '@/lib/utils'

interface Props {
  stock: StockDetail | null
  loading: boolean
}

export default function StockHeader({ stock, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 h-[62px]">
        <div className="flex-1">
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-4 w-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
        <div className="text-right">
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse mb-1 ml-auto" />
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse ml-auto" />
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center flex-shrink-0 h-[62px]">
        <span className="text-[11px] text-gray-400">Select a stock from the sidebar</span>
      </div>
    )
  }

  const price = stock.current_price
  const mcap  = stock.market_cap
  const pe    = stock.ratios?.pe_ratio
  const bv    = stock.ratios?.book_value_3y

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-[9px] flex items-start gap-3 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-gray-900">{stock.name}</div>
        <div className="flex gap-[3px] mt-[3px] flex-wrap">
          {stock.nse_code && (
            <span className="text-[10px] px-[6px] py-[1px] rounded-sm bg-gray-100 text-gray-600 border border-gray-200 font-mono">
              NSE: {stock.nse_code}
            </span>
          )}
          {stock.bse_code && (
            <span className="text-[10px] px-[6px] py-[1px] rounded-sm bg-gray-100 text-gray-600 border border-gray-200 font-mono">
              BSE: {stock.bse_code}
            </span>
          )}
          {stock.industry_group && (
            <span className="text-[10px] px-[6px] py-[1px] rounded-sm bg-purple-50 text-purple-700 border border-purple-200 font-mono">
              {stock.industry_group}
            </span>
          )}
          {stock.industry && (
            <span className="text-[10px] px-[6px] py-[1px] rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              {stock.industry}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[20px] font-semibold font-mono text-emerald-600">
          {fmtPrice(price)}
        </div>
        <div className="text-[10px] text-gray-400 mt-[2px]">
          Mkt Cap {fmtMcap(mcap)}
          {pe   != null && <> &nbsp;·&nbsp; PE {fmtX(pe)}</>}
          {bv   != null && <> &nbsp;·&nbsp; BV {fmtNum(bv, 0)}</>}
        </div>
      </div>
    </div>
  )
}
