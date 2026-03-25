'use client'
import type { StockDetail, FundamentalsControls, RangeType } from '@/lib/types'
import { fmtPctAbs, fmtX, fmtCr, fmtNum, fmtDays } from '@/lib/utils'
import ControlsBar from '@/components/dashboard/fundamentals/ControlsBar'
import { KpiTile, KpiSection } from '@/components/dashboard/fundamentals/KpiTile'

interface Props {
  stock: StockDetail | null
  loading: boolean
  controls: FundamentalsControls
  onControlsChange: (c: FundamentalsControls) => void
}

function n(v: number | null | undefined) { return v ?? null }

// Returns sub label based on selected range
function avgSub(range: RangeType, label: string) { return `${range} avg ${label}` }
function cagrSub(range: RangeType) { return `${range} CAGR` }

// Color helper
type C = 'green' | 'red' | 'amber' | 'blue' | 'default'
function col(val: number | null, good: number, warn: number, higher = true): C {
  if (val == null) return 'default'
  if (higher) {
    if (val >= good) return 'green'
    if (val >= warn) return 'amber'
    return 'red'
  } else {
    if (val <= good) return 'green'
    if (val <= warn) return 'amber'
    return 'red'
  }
}

function Skeleton() {
  return (
    <div className="p-3 space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="bg-white rounded-lg p-3 space-y-2">
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map(j => (
              <div key={j} className="h-14 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FundamentalsTab({ stock, loading, controls, onControlsChange }: Props) {
  if (loading) return <Skeleton />
  if (!stock) return <div className="p-6 text-center text-[11px] text-gray-400">Select a stock</div>

  const { ratios, ratios2, pnl, balance_sheet, cash_flow, user_ratios } = stock
  const r  = controls.range

  // Derived values
  const roe    = n(ratios?.roe)
  const roce   = n(pnl?.roce)
  const opm    = n(pnl?.opm)
  const npm    = n(pnl?.npm)
  const pe     = n(ratios?.pe_ratio)
  const pb     = n(ratios?.pb_ratio)
  const de     = n(stock.debt_to_equity)
  const piotr  = n(ratios?.piotroski_score)
  const promo  = n(ratios?.promoter_holding)
  const fii    = n(ratios?.fii_holding)
  const pledge = n(ratios?.pledged_percentage)
  const dd     = n(ratios?.debtor_days)

  // Range-based avg labels
  const roeAvgMap:  Record<RangeType, string> = { '3Y': ratios?.avg_roe_3y?.toFixed(1)+'%' ?? '—', '5Y': ratios?.avg_roe_5y?.toFixed(1)+'%' ?? '—', '7Y': ratios2?.avg_roe_7y?.toFixed(1)+'%' ?? '—', '10Y': ratios2?.avg_roe_10y?.toFixed(1)+'%' ?? '—' }
  const roceAvgMap: Record<RangeType, string> = { '3Y': ratios2?.avg_roce_3y?.toFixed(1)+'%' ?? '—', '5Y': ratios2?.avg_roce_5y?.toFixed(1)+'%' ?? '—', '7Y': ratios2?.avg_roce_7y?.toFixed(1)+'%' ?? '—', '10Y': ratios2?.avg_roce_10y?.toFixed(1)+'%' ?? '—' }
  const opmAvgMap:  Record<RangeType, string> = { '3Y': '—', '5Y': ratios2?.opm_5y?.toFixed(1)+'%' ?? '—', '7Y': '—', '10Y': ratios2?.opm_10y?.toFixed(1)+'%' ?? '—' }
  const peAvgMap:   Record<RangeType, string> = { '3Y': ratios2?.historical_pe_3y?.toFixed(1)+'×' ?? '—', '5Y': ratios2?.historical_pe_5y?.toFixed(1)+'×' ?? '—', '7Y': ratios2?.historical_pe_7y?.toFixed(1)+'×' ?? '—', '10Y': ratios2?.historical_pe_10y?.toFixed(1)+'×' ?? '—' }

  return (
    <div className="p-3">

      {/* Price chart placeholder */}
      <div className="bg-white border border-gray-200 rounded-t-lg overflow-hidden mb-0">
        <div className="px-3 py-[7px] border-b border-gray-100 flex items-center gap-2">
          <span className="text-[11px] font-medium">{stock.nse_code || stock.name}</span>
          <span className="text-[11px] font-mono font-medium text-emerald-600">
            {stock.current_price != null ? `₹${stock.current_price.toLocaleString('en-IN')}` : '—'}
          </span>
          <div className="flex gap-[1px] bg-gray-100 rounded-md p-[2px] ml-auto">
            {['1D','1W','1M','1Y','3Y','5Y'].map((t,i) => (
              <button key={t} className={`text-[10px] px-[7px] py-[2px] rounded-sm ${i===3?'bg-white text-gray-900 font-medium border border-gray-200':'text-gray-500'}`}>{t}</button>
            ))}
          </div>
          {['MA','RSI','MACD','BB'].map((ind,i) => (
            <button key={ind} className={`text-[10px] px-[6px] py-[2px] rounded border ml-[2px] ${i===0?'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-500 border-gray-200'}`}>{ind}</button>
          ))}
        </div>
        {/* Simple SVG placeholder chart */}
        <div className="px-3 pt-2 pb-0">
          <svg width="100%" height="110" viewBox="0 0 700 110" preserveAspectRatio="none">
            <line x1="0" y1="27" x2="700" y2="27" stroke="#f3f4f6" strokeWidth="1"/>
            <line x1="0" y1="55" x2="700" y2="55" stroke="#f3f4f6" strokeWidth="1"/>
            <line x1="0" y1="83" x2="700" y2="83" stroke="#f3f4f6" strokeWidth="1"/>
            <polyline fill="#059669" fillOpacity="0.06" stroke="none" points="0,95 60,82 120,74 180,78 240,60 300,52 360,45 420,57 480,38 540,26 600,34 660,15 700,10 700,110 0,110"/>
            <polyline fill="none" stroke="#059669" strokeWidth="1.5" points="0,95 60,82 120,74 180,78 240,60 300,52 360,45 420,57 480,38 540,26 600,34 660,15 700,10"/>
            <circle cx="700" cy="10" r="3" fill="#059669"/>
          </svg>
          <div className="flex gap-2 py-[5px] border-t border-gray-100 flex-wrap">
            {[['MA20','#d97706'],['MA50','#7c3aed'],['RSI','#111'],['MACD','#059669'],['Vol','#111'],['ATR','#111']].map(([k,c]) => (
              <span key={k} className="text-[10px] font-mono"><span className="text-gray-400">{k} </span><span style={{color:c}} className="font-semibold">—</span></span>
            ))}
          </div>
        </div>
        {/* 52w bar */}
        <div className="px-3 pb-2 border-t border-gray-100">
          <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1 mt-1">
            <span>52w Low</span><span>Now</span><span>52w High</span>
          </div>
          <div className="h-[4px] bg-gray-100 rounded-full relative border border-gray-200">
            <div className="absolute top-0 h-full bg-emerald-500 rounded-full" style={{left:'15%',width:'50%'}}/>
            <div className="absolute top-[-3px] w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" style={{left:'calc(15% + 50% - 4px)'}}/>
          </div>
        </div>
      </div>

      {/* Controls bar — attached to chart bottom */}
      <ControlsBar controls={controls} onChange={onControlsChange} />

      {/* KPI sections */}
      <KpiSection title={`Profitability · FY25`}>
        <KpiTile label="ROE"  value={fmtPctAbs(roe)}  color={col(roe,20,12)}  sub={avgSub(r, roeAvgMap[r])} />
        <KpiTile label="ROCE" value={fmtPctAbs(roce)} color={col(roce,20,12)} sub={avgSub(r, roceAvgMap[r])} />
        <KpiTile label="ROA"  value={fmtPctAbs(n(ratios?.roa))} color={col(n(ratios?.roa),12,6)} sub="FY25" />
        <KpiTile label="ROIC" value={fmtPctAbs(n(ratios?.roic))} color={col(n(ratios?.roic),15,8)} sub="FY25" />
        <KpiTile label="OPM"  value={fmtPctAbs(opm)}  color={col(opm,20,12)} sub={avgSub(r, opmAvgMap[r])} />
        <KpiTile label="NPM"  value={fmtPctAbs(npm)}  color={col(npm,15,8)}  sub="FY25" />
      </KpiSection>

      <KpiSection title="Valuation · FY25">
        <KpiTile label="PE Ratio"     value={fmtX(pe)}  color={col(pe,15,25,false)}  sub={avgSub(r, peAvgMap[r])} />
        <KpiTile label="Price / Book" value={fmtX(pb)}  color={col(pb,1.5,3,false)}  sub="FY25" />
        <KpiTile label="EV / EBITDA"  value={fmtX(n(user_ratios?.ev_ebitda))} color="amber" sub="FY25" />
        <KpiTile label="PEG Ratio"    value={fmtNum(n(user_ratios?.peg_ratio))} sub="FY25" />
        <KpiTile label="Div Yield"    value={fmtPctAbs(n(ratios?.dividend_yield))} color="green" sub="FY25" />
        <KpiTile label="Graham No."   value={n(user_ratios?.graham) != null ? `₹${user_ratios!.graham!.toFixed(0)}` : '—'} color="blue" sub={`CMP ₹${stock.current_price?.toFixed(0) ?? '—'}`} />
      </KpiSection>

      <KpiSection title="Growth · FY25">
        <KpiTile label="Sales CAGR"    value={fmtPctAbs(n(pnl?.sales_growth_5y))}  color="blue" sub={cagrSub(r)} />
        <KpiTile label="EPS CAGR"      value={fmtPctAbs(n(stock.growth?.eps_growth_5y))} color="blue" sub={cagrSub(r)} />
        <KpiTile label="PAT CAGR"      value={fmtPctAbs(n(pnl?.profit_growth_5y))} color="blue" sub={cagrSub(r)} />
        <KpiTile label="Sales CAGR 10Y" value={fmtPctAbs(n(pnl?.sales_growth_10y))} color="blue" sub="10Y CAGR" />
        <KpiTile label="QoQ Revenue"   value={fmtPctAbs(n(pnl?.qoq_sales))}    color={col(n(pnl?.qoq_sales),5,0)}   sub="Latest Q" />
        <KpiTile label="QoQ PAT"       value={fmtPctAbs(n(pnl?.qoq_profits))}  color={col(n(pnl?.qoq_profits),5,0)} sub="Latest Q" />
      </KpiSection>

      <KpiSection title="Balance Sheet · FY25">
        <KpiTile label="D/E Ratio"     value={fmtNum(de,2)}   color={col(de,0,0.5,false)} sub={de === 0 ? 'Debt-free' : 'FY25'} />
        <KpiTile label="Current Ratio" value={fmtX(n(user_ratios?.current_ratio))} color={col(n(user_ratios?.current_ratio),2,1)} sub="FY25" />
        <KpiTile label="Cash"          value={fmtCr(n(balance_sheet?.cash_equivalents))} color="green" sub="FY25" />
        <KpiTile label="Net Worth"     value={fmtCr(n(balance_sheet?.net_worth))} sub="FY25" />
        <KpiTile label="Book Value"    value={fmtCr(n(balance_sheet?.book_value))} sub="per share" />
        <KpiTile label="Total Debt"    value={fmtCr(n(balance_sheet?.debt))} color={de === 0 ? 'green' : 'default'} sub="FY25" />
      </KpiSection>

      <KpiSection title="Cash Flow · FY25">
        <KpiTile label="Oper. CF"    value={fmtCr(n(cash_flow?.cfo_ly))}  color="green"  sub={cagrSub(r)} />
        <KpiTile label="Free CF"     value={fmtCr(n(cash_flow?.fcf_ly))}  color="green"  sub={cagrSub(r)} />
        <KpiTile label="FCF Yield"   value={fmtPctAbs(n(user_ratios?.price_to_fcf) != null ? (1/user_ratios!.price_to_fcf!) * 100 : null)} color="green" sub={`${r} avg`} />
        <KpiTile label="FCF / PAT"   value={n(cash_flow?.fcf_ly) != null && n(pnl?.profit_after_tax) != null ? fmtNum(cash_flow!.fcf_ly! / pnl!.profit_after_tax!, 2) + '×' : '—'} color="green" sub="quality" />
        <KpiTile label="Capex"       value={n(cash_flow?.cfo_ly) != null && n(cash_flow?.fcf_ly) != null ? fmtCr(cash_flow!.cfo_ly! - cash_flow!.fcf_ly!) : '—'} sub="FY25" />
        <KpiTile label="Investing CF" value={fmtCr(n(cash_flow?.cfi_ly))} color="red"   sub="FY25" />
      </KpiSection>

      <KpiSection title={`Efficiency & Ownership · FY25`}>
        <KpiTile label="Debtor Days"   value={fmtDays(dd)}   color={col(dd,45,70,false)} sub={`${r} avg`} />
        <KpiTile label="Int. Coverage" value={fmtX(n(user_ratios?.interest_coverage))} color={col(n(user_ratios?.interest_coverage),5,2)} sub="FY25" />
        <KpiTile label="Piotroski"     value={piotr != null ? `${piotr}/9` : '—'} color={col(piotr,7,4)} sub="F-Score" />
        <KpiTile label="Promoter %"    value={fmtPctAbs(promo)} color={col(promo,50,25)} sub="↓ watch if declining" />
        <KpiTile label="FII %"         value={fmtPctAbs(fii)} color="blue" sub="FY25" />
        <KpiTile label="Pledged %"     value={fmtPctAbs(pledge)} color={col(pledge,0,10,false)} sub={pledge === 0 ? 'clean' : 'FY25'} />
      </KpiSection>

    </div>
  )
}
