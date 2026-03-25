'use client'
import type { StockDetail } from '@/lib/types'
import { fmtMcap, fmtPctAbs } from '@/lib/utils'

interface Props { stock: StockDetail | null; loading: boolean }

const NEWS = [
  { src: 'Economic Times', time: '12m', hl: 'Company raises guidance after strong quarterly deal wins', tags: ['Bullish', 'Results'] },
  { src: 'Mint',           time: '1h',  hl: 'Sector cautious as US clients delay discretionary spending', tags: ['Bearish', 'Sector'] },
  { src: 'NDTV Profit',    time: '2h',  hl: 'Bags multi-year deal with European financial firm', tags: ['Deal win'] },
  { src: 'Reuters',        time: '6h',  hl: 'RBI holds rates; stocks rally on improved rupee outlook', tags: ['Macro'] },
  { src: 'MoneyControl',   time: '8h',  hl: 'FII buying hits 3-month high amid global risk-on sentiment', tags: ['FII'] },
]

const TAG_COLOR: Record<string, string> = {
  Bullish:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Bearish:  'bg-red-50 text-red-700 border-red-200',
  'Deal win': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Macro:    'bg-blue-50 text-blue-700 border-blue-200',
  FII:      'bg-blue-50 text-blue-700 border-blue-200',
  Results:  'bg-blue-50 text-blue-700 border-blue-200',
  Sector:   'bg-blue-50 text-blue-700 border-blue-200',
}

function Skeleton() {
  return (
    <div className="p-3 space-y-3">
      <div className="bg-white rounded-lg p-4 space-y-2">
        {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" style={{width: `${70 + i*7}%`}} />)}
      </div>
    </div>
  )
}

export default function OverviewTab({ stock, loading }: Props) {
  if (loading) return <Skeleton />
  if (!stock) return <div className="p-6 text-center text-[11px] text-gray-400">Select a stock to view details</div>

  const { ratios, pnl, balance_sheet } = stock

  return (
    <div className="p-3 space-y-3">

      {/* About */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-[10px] border-b border-gray-100 text-[11px] font-medium text-gray-900">
          About {stock.name}
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] text-gray-600 leading-[1.75]">
            {stock.name} operates in the {stock.industry} sector under the {stock.industry_group} industry group.
            {pnl?.sales != null && ` The company reported revenues of ₹${pnl.sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr in the most recent annual period.`}
            {ratios?.roe != null && ` Return on equity stands at ${ratios.roe.toFixed(1)}%, reflecting the company's capital efficiency.`}
            {balance_sheet?.debt != null && balance_sheet.debt === 0 && ' The company is debt-free, indicating strong financial discipline.'}
            {ratios?.piotroski_score != null && ` Piotroski F-Score of ${ratios.piotroski_score}/9 signals ${ratios.piotroski_score >= 7 ? 'high' : ratios.piotroski_score >= 4 ? 'moderate' : 'low'} fundamental quality.`}
          </p>

          {/* Meta grid */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 flex-wrap">
            {[
              { label: 'Industry Group', value: stock.industry_group },
              { label: 'Industry',       value: stock.industry },
              { label: 'NSE Code',       value: stock.nse_code },
              { label: 'BSE Code',       value: stock.bse_code },
              { label: 'Market Cap',     value: fmtMcap(stock.market_cap) },
              { label: 'Face Value',     value: stock.face_value != null ? `₹${stock.face_value}` : null },
              { label: 'ROE',            value: ratios?.roe != null ? fmtPctAbs(ratios.roe) : null },
              { label: 'Piotroski',      value: ratios?.piotroski_score != null ? `${ratios.piotroski_score}/9` : null },
            ].filter(m => m.value).map(m => (
              <div key={m.label} className="flex flex-col gap-[2px]">
                <span className="text-[9px] text-gray-400 uppercase tracking-wide">{m.label}</span>
                <span className="text-[11px] font-medium text-gray-900">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 py-[7px] border-b border-gray-100 flex items-center gap-2">
          <span className="text-[11px] font-medium text-gray-900">Market news</span>
          <span className="text-[9px] px-[7px] py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">● Live</span>
          <div className="flex gap-1 ml-2">
            {['Company', 'Sector', 'Market'].map(f => (
              <span key={f} className={`text-[10px] px-2 py-[2px] rounded-full border cursor-pointer
                ${f === 'Company' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="flex overflow-x-auto">
          {NEWS.map((n, i) => (
            <div key={i} className="min-w-[194px] p-[10px] border-r border-gray-100 flex-shrink-0 cursor-pointer hover:bg-gray-50 last:border-r-0">
              <div className="flex justify-between mb-[3px]">
                <span className="text-[9px] font-mono text-gray-400">{n.src}</span>
                <span className="text-[9px] text-gray-400">{n.time}</span>
              </div>
              <div className="text-[11px] text-gray-900 leading-[1.4] line-clamp-2">{n.hl}</div>
              <div className="flex gap-[3px] mt-1">
                {n.tags.map(t => (
                  <span key={t} className={`text-[9px] px-[5px] py-[1px] rounded-sm border ${TAG_COLOR[t] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
