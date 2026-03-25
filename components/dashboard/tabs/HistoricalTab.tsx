'use client'
import { useState } from 'react'
import type { StockDetail } from '@/lib/types'
import { fmtPctAbs, fmtX, fmtCr, fmtDays } from '@/lib/utils'

interface Props { stock: StockDetail | null; loading: boolean }

type SubTab = 'profitability' | 'growth' | 'valuation' | 'balance' | 'cashflow' | 'efficiency'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'profitability', label: 'Profitability' },
  { id: 'growth',        label: 'Growth' },
  { id: 'valuation',     label: 'Valuation' },
  { id: 'balance',       label: 'Balance sheet' },
  { id: 'cashflow',      label: 'Cash flow' },
  { id: 'efficiency',    label: 'Efficiency' },
]

function MiniChart({ points, color = '#059669', dashed = false }: {
  points: number[]; color?: string; dashed?: boolean
}) {
  const clean = points.filter(p => p != null && !isNaN(p) && isFinite(p) && p !== 0)
  if (clean.length < 2) return (
    <svg width="100%" height="75" viewBox="0 0 480 75" preserveAspectRatio="none">
      <line x1="0" y1="37" x2="480" y2="37" stroke="#f3f4f6" strokeWidth="1"/>
      <text x="240" y="42" textAnchor="middle" fontSize="10" fill="#d1d5db">No data</text>
    </svg>
  )
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const range = max - min || 1
  const W = 480; const H = 75
  const xs = clean.map((_, i) => (i / (clean.length - 1)) * W)
  const ys = clean.map(p => H - ((p - min) / range) * (H - 15) - 7)
  const poly = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const area = `${xs[0]},${H} ${poly} ${xs[xs.length - 1]},${H}`
  const lastX = xs[xs.length - 1]
  const lastY = ys[ys.length - 1]
  return (
    <svg width="100%" height="75" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <line x1="0" y1="18" x2={W} y2="18" stroke="#f3f4f6" strokeWidth="1"/>
      <line x1="0" y1="37" x2={W} y2="37" stroke="#f3f4f6" strokeWidth="1"/>
      <line x1="0" y1="56" x2={W} y2="56" stroke="#f3f4f6" strokeWidth="1"/>
      <polyline fill={color} fillOpacity="0.07" stroke="none" points={area}/>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? '4,3' : undefined} points={poly}/>
      {!isNaN(lastX) && !isNaN(lastY) && <circle cx={lastX} cy={lastY} r="3" fill={color}/>}
    </svg>
  )
}

interface ChartCard {
  title: string; value: string; trend: string; trendPositive?: boolean
  points: number[]; labels: string[]; values: string[]; footer: string
  color?: string; dashed?: boolean
}

function HCard({ c }: { c: ChartCard }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-[10px_12px]">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[11px] font-medium text-gray-900">{c.title}</span>
        <div className="text-right">
          <div className={`text-[13px] font-semibold font-mono ${c.trendPositive !== false ? 'text-emerald-600' : 'text-amber-600'}`}>{c.value}</div>
          <div className={`text-[10px] font-mono mt-px ${c.trendPositive !== false ? 'text-emerald-600' : 'text-red-500'}`}>{c.trend}</div>
        </div>
      </div>
      <MiniChart points={c.points} color={c.color} dashed={c.dashed} />
      <div className="flex justify-between text-[8.5px] font-mono text-gray-400 mt-0.75">
        {c.labels.map((l: string) => <span key={l}>{l}</span>)}
      </div>
      <div className="flex justify-between text-[8.5px] font-mono text-gray-600 mt-0.5">
        {c.values.map((v: string, i: number) => (
          <span key={i} className={i === c.values.length - 1 ? 'font-semibold text-gray-900' : ''}>{v}</span>
        ))}
      </div>
      <div className="text-[9px] text-gray-400 mt-1.25 pt-1.25 border-t border-gray-100">{c.footer}</div>
    </div>
  )
}

function fmtMcap(v: number | null | undefined) {
  if (v == null) return '—'
  if (v >= 100000) return `₹${(v/100000).toFixed(1)}L Cr`
  if (v >= 1000)   return `₹${(v/1000).toFixed(1)}K Cr`
  return `₹${v.toFixed(0)} Cr`
}
function fmtNum(v: number | null | undefined, d = 2) { return v == null ? '—' : v.toFixed(d) }

export default function HistoricalTab({ stock, loading }: Props) {
  const [sub, setSub] = useState<SubTab>('profitability')

  if (loading) return (
    <div className="p-3 space-y-3">
      {[1,2].map(i => <div key={i} className="bg-white rounded-lg border p-3 animate-pulse h-40"/>)}
    </div>
  )
  if (!stock) return <div className="p-6 text-center text-[11px] text-gray-400">Select a stock</div>

  const { ratios, ratios2, pnl, cash_flow, balance_sheet } = stock

  const CHARTS: Record<SubTab, ChartCard[]> = {
    profitability: [
      { title: 'ROE %', value: fmtPctAbs(ratios?.roe), trend: '↑ improving', trendPositive: true, color: '#059669',
        points: [ratios?.avg_roe_3y??0, ratios?.avg_roe_5y??0, ratios2?.avg_roe_7y??0, ratios2?.avg_roe_10y??0, ratios?.roe??0],
        labels: ['3Y avg','5Y avg','7Y avg','10Y avg','Now'],
        values: [fmtPctAbs(ratios?.avg_roe_3y), fmtPctAbs(ratios?.avg_roe_5y), fmtPctAbs(ratios2?.avg_roe_7y), fmtPctAbs(ratios2?.avg_roe_10y), fmtPctAbs(ratios?.roe)],
        footer: `3Y avg ${fmtPctAbs(ratios?.avg_roe_3y)} · 10Y avg ${fmtPctAbs(ratios2?.avg_roe_10y)}` },
      { title: 'ROCE %', value: fmtPctAbs(pnl?.roce), trend: '↑ improving', trendPositive: true, color: '#059669',
        points: [ratios2?.avg_roce_3y??0, ratios2?.avg_roce_5y??0, ratios2?.avg_roce_7y??0, ratios2?.avg_roce_10y??0, pnl?.roce??0],
        labels: ['3Y avg','5Y avg','7Y avg','10Y avg','Now'],
        values: [fmtPctAbs(ratios2?.avg_roce_3y), fmtPctAbs(ratios2?.avg_roce_5y), fmtPctAbs(ratios2?.avg_roce_7y), fmtPctAbs(ratios2?.avg_roce_10y), fmtPctAbs(pnl?.roce)],
        footer: `3Y avg ${fmtPctAbs(ratios2?.avg_roce_3y)} · 10Y avg ${fmtPctAbs(ratios2?.avg_roce_10y)}` },
      { title: 'OPM %', value: fmtPctAbs(pnl?.opm), trend: '5Y / 10Y avg', trendPositive: true, color: '#d97706',
        points: [ratios2?.opm_5y??0, pnl?.opm??0],
        labels: ['5Y avg','Now'], values: [fmtPctAbs(ratios2?.opm_5y), fmtPctAbs(pnl?.opm)],
        footer: `5Y avg ${fmtPctAbs(ratios2?.opm_5y)} · 10Y avg ${fmtPctAbs(ratios2?.opm_10y)}` },
      { title: 'Net Profit Margin %', value: fmtPctAbs(pnl?.npm), trend: '↑ improving', trendPositive: true, color: '#059669',
        points: [pnl?.npm_ly??0, pnl?.npm??0],
        labels: ['Last yr','Now'], values: [fmtPctAbs(pnl?.npm_ly), fmtPctAbs(pnl?.npm)],
        footer: 'Latest annual NPM' },
    ],
    growth: [
      { title: 'Sales Growth 5Y %', value: fmtPctAbs(pnl?.sales_growth_5y), trend: '5Y CAGR',
        trendPositive: (pnl?.sales_growth_5y??0)>0, color: '#2563eb',
        points: [pnl?.sales_growth_3y??0, pnl?.sales_growth_5y??0],
        labels: ['3Y','5Y'], values: [fmtPctAbs(pnl?.sales_growth_3y), fmtPctAbs(pnl?.sales_growth_5y)],
        footer: `3Y: ${fmtPctAbs(pnl?.sales_growth_3y)} · 5Y: ${fmtPctAbs(pnl?.sales_growth_5y)}` },
      { title: 'EPS Growth 5Y %', value: fmtPctAbs(stock.growth?.eps_growth_5y), trend: '5Y CAGR',
        trendPositive: (stock.growth?.eps_growth_5y??0)>0, color: '#2563eb',
        points: [stock.growth?.eps_growth_3y??0, stock.growth?.eps_growth_5y??0, stock.growth?.eps_growth_7y??0, stock.growth?.eps_growth_10y??0],
        labels: ['3Y','5Y','7Y','10Y'],
        values: [fmtPctAbs(stock.growth?.eps_growth_3y), fmtPctAbs(stock.growth?.eps_growth_5y), fmtPctAbs(stock.growth?.eps_growth_7y), fmtPctAbs(stock.growth?.eps_growth_10y)],
        footer: `3Y: ${fmtPctAbs(stock.growth?.eps_growth_3y)} · 10Y: ${fmtPctAbs(stock.growth?.eps_growth_10y)}` },
      { title: 'Profit Growth 7Y %', value: fmtPctAbs(stock.growth?.profit_growth_7y), trend: '7Y CAGR',
        trendPositive: (stock.growth?.profit_growth_7y??0)>0, color: '#059669',
        points: [pnl?.profit_growth_3y??0, pnl?.profit_growth_5y??0, stock.growth?.profit_growth_7y??0, stock.growth?.profit_growth_10y??0],
        labels: ['3Y','5Y','7Y','10Y'],
        values: [fmtPctAbs(pnl?.profit_growth_3y), fmtPctAbs(pnl?.profit_growth_5y), fmtPctAbs(stock.growth?.profit_growth_7y), fmtPctAbs(stock.growth?.profit_growth_10y)],
        footer: `7Y: ${fmtPctAbs(stock.growth?.profit_growth_7y)} · 10Y: ${fmtPctAbs(stock.growth?.profit_growth_10y)}` },
      { title: 'EPS Growth (all periods)', value: fmtPctAbs(stock.growth?.eps_growth_5y), trend: 'multi-period',
        trendPositive: (stock.growth?.eps_growth_5y??0)>0, color: '#2563eb',
        points: [stock.growth?.eps_growth_3y??0, stock.growth?.eps_growth_5y??0, stock.growth?.eps_growth_7y??0, stock.growth?.eps_growth_10y??0],
        labels: ['3Y','5Y','7Y','10Y'],
        values: [fmtPctAbs(stock.growth?.eps_growth_3y), fmtPctAbs(stock.growth?.eps_growth_5y), fmtPctAbs(stock.growth?.eps_growth_7y), fmtPctAbs(stock.growth?.eps_growth_10y)],
        footer: 'Earnings per share growth across periods' },
    ],
    valuation: [
      { title: 'PE Ratio', value: fmtX(ratios?.pe_ratio), trend: 'vs historical avg',
        trendPositive: (ratios?.pe_ratio??0)<(ratios2?.historical_pe_5y??0), color: '#d97706',
        points: [ratios2?.historical_pe_3y??0, ratios2?.historical_pe_5y??0, ratios2?.historical_pe_7y??0, ratios2?.historical_pe_10y??0, ratios?.pe_ratio??0],
        labels: ['3Y avg','5Y avg','7Y avg','10Y avg','Now'],
        values: [fmtX(ratios2?.historical_pe_3y), fmtX(ratios2?.historical_pe_5y), fmtX(ratios2?.historical_pe_7y), fmtX(ratios2?.historical_pe_10y), fmtX(ratios?.pe_ratio)],
        footer: `Historical 3Y: ${fmtX(ratios2?.historical_pe_3y)} · 10Y: ${fmtX(ratios2?.historical_pe_10y)}` },
      { title: 'Mcap History', value: fmtMcap(stock.market_cap), trend: '3Y / 5Y / 7Y',
        trendPositive: (stock.market_cap??0)>(ratios2?.mcap_3y??0), color: '#7c3aed',
        points: [ratios2?.mcap_10y??0, ratios2?.mcap_7y??0, ratios2?.mcap_5y??0, ratios2?.mcap_3y??0, stock.market_cap??0],
        labels: ['10Y','7Y','5Y','3Y','Now'],
        values: [fmtMcap(ratios2?.mcap_10y), fmtMcap(ratios2?.mcap_7y), fmtMcap(ratios2?.mcap_5y), fmtMcap(ratios2?.mcap_3y), fmtMcap(stock.market_cap)],
        footer: `3Y ago: ${fmtMcap(ratios2?.mcap_3y)} · 10Y ago: ${fmtMcap(ratios2?.mcap_10y)}` },
      { title: 'Book Value / Share', value: `₹${fmtNum(ratios?.book_value_3y,0)}`, trend: 'BV trend',
        trendPositive: true, color: '#7c3aed',
        points: [ratios?.book_value_10y??0, ratios?.book_value_5y??0, ratios?.book_value_3y??0],
        labels: ['10Y','5Y','3Y'],
        values: [`₹${fmtNum(ratios?.book_value_10y,0)}`, `₹${fmtNum(ratios?.book_value_5y,0)}`, `₹${fmtNum(ratios?.book_value_3y,0)}`],
        footer: `3Y: ₹${ratios?.book_value_3y?.toFixed(0)??'—'} · 10Y: ₹${ratios?.book_value_10y?.toFixed(0)??'—'}` },
      { title: 'Dividend Yield %', value: fmtPctAbs(ratios?.dividend_yield), trend: 'current yield',
        trendPositive: true, color: '#059669',
        points: [ratios?.dividend_yield??0], labels: ['Now'], values: [fmtPctAbs(ratios?.dividend_yield)],
        footer: `5Y avg dividend: ${ratios2?.avg_dividend_5y?.toFixed(2)??'—'}` },
    ],
    balance: [
      { title: 'Working Capital (Cr)', value: fmtCr(balance_sheet?.working_capital), trend: 'trend',
        trendPositive: (balance_sheet?.working_capital??0)>0, color: '#7c3aed',
        points: [balance_sheet?.working_capital_7y??0, balance_sheet?.working_capital_5y??0, balance_sheet?.working_capital_3y??0, balance_sheet?.working_capital??0],
        labels: ['7Y','5Y','3Y','Now'],
        values: [fmtCr(balance_sheet?.working_capital_7y), fmtCr(balance_sheet?.working_capital_5y), fmtCr(balance_sheet?.working_capital_3y), fmtCr(balance_sheet?.working_capital)],
        footer: `3Y: ${fmtCr(balance_sheet?.working_capital_3y)}` },
      { title: 'Debt (Cr)', value: fmtCr(balance_sheet?.debt), trend: 'debt history',
        trendPositive: (balance_sheet?.debt??0)===0, color: (balance_sheet?.debt??0)===0?'#059669':'#dc2626',
        points: [balance_sheet?.debt_10y??0, balance_sheet?.debt_7y??0, balance_sheet?.debt_5y??0, balance_sheet?.debt_3y??0, balance_sheet?.debt??0],
        labels: ['10Y','7Y','5Y','3Y','Now'],
        values: [fmtCr(balance_sheet?.debt_10y), fmtCr(balance_sheet?.debt_7y), fmtCr(balance_sheet?.debt_5y), fmtCr(balance_sheet?.debt_3y), fmtCr(balance_sheet?.debt)],
        footer: `Current: ${fmtCr(balance_sheet?.debt)} · 3Y ago: ${fmtCr(balance_sheet?.debt_3y)}` },
      { title: 'Cash & Equivalents (Cr)', value: fmtCr(balance_sheet?.cash_equivalents), trend: 'cash position',
        trendPositive: true, color: '#059669',
        points: [balance_sheet?.cash_equivalents??0], labels: ['Now'], values: [fmtCr(balance_sheet?.cash_equivalents)],
        footer: 'Latest balance sheet cash position' },
      { title: 'Reserves (Cr)', value: fmtCr(balance_sheet?.reserves), trend: 'FY25',
        trendPositive: true, color: '#7c3aed',
        points: [balance_sheet?.reserves??0], labels: ['Now'], values: [fmtCr(balance_sheet?.reserves)],
        footer: 'Total reserves and surplus' },
    ],
    cashflow: [
      { title: 'Operating CF (Cr)', value: fmtCr(cash_flow?.cfo_ly), trend: 'CAGR trend',
        trendPositive: (cash_flow?.cfo_ly??0)>0, color: '#059669',
        points: [cash_flow?.cfo_10y??0, cash_flow?.cfo_7y??0, cash_flow?.cfo_5y??0, cash_flow?.cfo_3y??0, cash_flow?.cfo_ly??0],
        labels: ['10Y','7Y','5Y','3Y','Now'],
        values: [fmtCr(cash_flow?.cfo_10y), fmtCr(cash_flow?.cfo_7y), fmtCr(cash_flow?.cfo_5y), fmtCr(cash_flow?.cfo_3y), fmtCr(cash_flow?.cfo_ly)],
        footer: `3Y total: ${fmtCr(cash_flow?.cfo_3y)} · 10Y total: ${fmtCr(cash_flow?.cfo_10y)}` },
      { title: 'Free CF (Cr)', value: fmtCr(cash_flow?.fcf_ly), trend: 'FCF trend',
        trendPositive: (cash_flow?.fcf_ly??0)>0, color: '#059669',
        points: [cash_flow?.fcf_10y??0, cash_flow?.fcf_7y??0, cash_flow?.fcf_5y??0, cash_flow?.fcf_3y??0, cash_flow?.fcf_ly??0],
        labels: ['10Y','7Y','5Y','3Y','Now'],
        values: [fmtCr(cash_flow?.fcf_10y), fmtCr(cash_flow?.fcf_7y), fmtCr(cash_flow?.fcf_5y), fmtCr(cash_flow?.fcf_3y), fmtCr(cash_flow?.fcf_ly)],
        footer: `3Y total FCF: ${fmtCr(cash_flow?.fcf_3y)} · 10Y: ${fmtCr(cash_flow?.fcf_10y)}` },
      { title: 'Investing CF (Cr)', value: fmtCr(cash_flow?.cfi_ly), trend: 'investing trend',
        trendPositive: false, color: '#dc2626',
        points: [cash_flow?.cfi_ly??0, cash_flow?.cfi_py??0],
        labels: ['Last yr','Prev yr'], values: [fmtCr(cash_flow?.cfi_ly), fmtCr(cash_flow?.cfi_py)],
        footer: 'Negative = capital being deployed' },
      { title: 'Cash Position (Cr)', value: fmtCr(cash_flow?.cash_3y ?? balance_sheet?.cash_equivalents), trend: 'end of year',
        trendPositive: true, color: '#059669',
        points: [cash_flow?.cash_7y??0, cash_flow?.cash_5y??0, cash_flow?.cash_3y??0],
        labels: ['7Y','5Y','3Y'],
        values: [fmtCr(cash_flow?.cash_7y), fmtCr(cash_flow?.cash_5y), fmtCr(cash_flow?.cash_3y)],
        footer: `5Y: ${fmtCr(cash_flow?.cash_5y)} · 3Y: ${fmtCr(cash_flow?.cash_3y)}` },
    ],
    efficiency: [
      { title: 'Debtor Days', value: fmtDays(ratios?.debtor_days), trend: 'vs 3Y avg',
        trendPositive: (ratios?.debtor_days??0)<=(ratios2?.debtor_days_3y??999), color: '#dc2626',
        points: [ratios2?.debtor_days_5y??0, ratios2?.debtor_days_3y??0, ratios?.debtor_days??0],
        labels: ['5Y','3Y','Now'],
        values: [fmtDays(ratios2?.debtor_days_5y), fmtDays(ratios2?.debtor_days_3y), fmtDays(ratios?.debtor_days)],
        footer: `3Y avg ${fmtDays(ratios2?.debtor_days_3y)}` },
      { title: 'ROA %', value: fmtPctAbs(ratios?.roa), trend: '3Y / 5Y avg',
        trendPositive: (ratios?.roa??0)>0, color: '#2563eb',
        points: [ratios2?.roa_5y??0, ratios2?.roa_3y??0, ratios?.roa_ly??0, ratios?.roa??0],
        labels: ['5Y','3Y','Last yr','Now'],
        values: [fmtPctAbs(ratios2?.roa_5y), fmtPctAbs(ratios2?.roa_3y), fmtPctAbs(ratios?.roa_ly), fmtPctAbs(ratios?.roa)],
        footer: `3Y avg ${fmtPctAbs(ratios2?.roa_3y)} · 5Y avg ${fmtPctAbs(ratios2?.roa_5y)}` },
      { title: 'Asset Turnover', value: `${fmtNum(ratios?.asset_turnover,2)}×`, trend: 'efficiency',
        trendPositive: true, color: '#6b7280',
        points: [ratios?.asset_turnover??0], labels: ['Now'], values: [`${fmtNum(ratios?.asset_turnover,2)}×`],
        footer: 'Higher = more efficient use of assets' },
      { title: 'Interest Coverage', value: fmtX(stock.user_ratios?.interest_coverage), trend: 'debt safety',
        trendPositive: (stock.user_ratios?.interest_coverage??0)>3, color: '#059669',
        points: [stock.user_ratios?.interest_coverage??0], labels: ['Now'], values: [fmtX(stock.user_ratios?.interest_coverage)],
        footer: '>3× considered safe; >10× = very strong' },
    ],
  }

  return (
    <div className="p-3">
      <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className={`flex-1 text-[10px] py-2 border-r border-gray-200 last:border-r-0 font-sans transition-colors
              ${sub===t.id ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CHARTS[sub].map((c, i) => <HCard key={i} c={c} />)}
      </div>
    </div>
  )
}