'use client'
import type { StockDetail } from '@/lib/types'
import { fmtPctAbs, fmtX, fmtCr, fmtMcap } from '@/lib/utils'

interface Props { stock: StockDetail | null; loading: boolean }

function scoreColor(score: number, max: number) {
  const pct = score / max
  if (pct >= 0.75) return '#059669'
  if (pct >= 0.5)  return '#d97706'
  return '#dc2626'
}

function ScoreRow({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-600 w-[115px] flex-shrink-0">{label}</span>
      <div className="flex-1 h-[7px] bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div className="h-full rounded-full" style={{ width: `${(score/max)*100}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono font-semibold w-8 text-right flex-shrink-0" style={{ color }}>{score.toFixed(1)}</span>
      <span className="text-[9px] text-gray-400 w-6 flex-shrink-0">/ {max}</span>
    </div>
  )
}

function VCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-[11px_13px]">
      <div className="text-[10px] font-semibold uppercase tracking-wide mb-[7px]" style={{ color }}>{title}</div>
      {children}
    </div>
  )
}

function Vp({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-[6px] text-[11px] text-gray-600 leading-[1.55] mb-1 last:mb-0">
      <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-1" style={{ background: dot }} />
      <span>{children}</span>
    </div>
  )
}

export default function VerdictTab({ stock, loading }: Props) {
  if (loading) return <div className="p-3 space-y-3"><div className="bg-white rounded-lg border p-4 animate-pulse h-40"/></div>
  if (!stock) return <div className="p-6 text-center text-[11px] text-gray-400">Select a stock</div>

  const { ratios, ratios2, pnl, balance_sheet, cash_flow, user_ratios } = stock

  // ── Compute scores ──────────────────────────────────────────
  const roe     = ratios?.roe ?? 0
  const roce    = pnl?.roce ?? 0
  const opm     = pnl?.opm ?? 0
  const npm     = pnl?.npm ?? 0
  const de      = stock.debt_to_equity ?? 99
  const pe      = ratios?.pe_ratio ?? 99
  const pb      = ratios?.pb_ratio ?? 99
  const piotr   = ratios?.piotroski_score ?? 0
  const promo   = ratios?.promoter_holding ?? 0
  const pledge  = ratios?.pledged_percentage ?? 99
  const fii     = ratios?.fii_holding ?? 0
  const sg5     = pnl?.sales_growth_5y ?? 0
  const pg7     = stock.growth?.profit_growth_7y ?? 0
  const hpe5    = ratios2?.historical_pe_5y ?? pe
  const fcf     = cash_flow?.fcf_ly ?? 0
  const pat     = pnl?.profit_after_tax ?? 1
  const ic      = user_ratios?.interest_coverage ?? 0

  // Profitability /20
  const profScore = Math.min(20,
    (roe >= 20 ? 7 : roe >= 15 ? 5 : roe >= 10 ? 3 : 1) +
    (opm >= 25 ? 7 : opm >= 15 ? 5 : opm >= 10 ? 3 : 1) +
    (npm >= 15 ? 6 : npm >= 10 ? 4 : npm >= 5 ? 2 : 0)
  )
  // Growth /20
  const growScore = Math.min(20,
    (sg5 >= 20 ? 7 : sg5 >= 15 ? 6 : sg5 >= 10 ? 4 : sg5 >= 5 ? 2 : 0) +
    (pg7 >= 20 ? 7 : pg7 >= 15 ? 6 : pg7 >= 10 ? 4 : pg7 >= 5 ? 2 : 0) +
    (pnl?.qoq_sales ?? 0 > 5 ? 6 : pnl?.qoq_sales ?? 0 > 0 ? 4 : 2)
  )
  // Valuation /20
  const valScore = Math.min(20,
    (pe < hpe5 * 0.9 ? 8 : pe < hpe5 ? 6 : pe < hpe5 * 1.1 ? 4 : 2) +
    (pb < 2 ? 7 : pb < 4 ? 5 : pb < 7 ? 3 : 1) +
    (ratios?.dividend_yield ?? 0 >= 2 ? 5 : ratios?.dividend_yield ?? 0 >= 1 ? 3 : 2)
  )
  // Balance sheet /10
  const bsScore = Math.min(10,
    (de === 0 ? 5 : de < 0.3 ? 4 : de < 0.5 ? 3 : de < 1 ? 2 : 0) +
    (user_ratios?.current_ratio ?? 0 >= 2 ? 3 : user_ratios?.current_ratio ?? 0 >= 1.5 ? 2 : 1) +
    (piotr >= 8 ? 2 : piotr >= 6 ? 1 : 0)
  )
  // Cash flow /10
  const cfScore = Math.min(10,
    (fcf > 0 ? 4 : 1) +
    (pat > 0 && fcf / pat > 0.8 ? 4 : fcf / pat > 0.5 ? 3 : fcf / pat > 0 ? 2 : 0) +
    (ic > 10 ? 2 : ic > 3 ? 1 : 0)
  )
  // Efficiency /10
  const effScore = Math.min(10,
    (ratios?.debtor_days ?? 999 < 60 ? 4 : ratios?.debtor_days ?? 999 < 90 ? 3 : ratios?.debtor_days ?? 999 < 120 ? 2 : 1) +
    (ratios?.asset_turnover ?? 0 > 1 ? 3 : ratios?.asset_turnover ?? 0 > 0.5 ? 2 : 1) +
    (ratios?.roa ?? 0 >= 15 ? 3 : ratios?.roa ?? 0 >= 10 ? 2 : ratios?.roa ?? 0 >= 5 ? 1 : 0)
  )
  // Ownership /10
  const ownScore = Math.min(10,
    (promo >= 60 ? 4 : promo >= 40 ? 3 : promo >= 20 ? 2 : 1) +
    (pledge === 0 ? 3 : pledge < 5 ? 2 : pledge < 20 ? 1 : 0) +
    (fii >= 15 ? 2 : fii >= 5 ? 1 : 0) +
    (piotr >= 8 ? 1 : 0)
  )

  const total = profScore + growScore + valScore + bsScore + cfScore + effScore + ownScore

  const verdict = total >= 75 ? { label: 'Buy', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
                : total >= 60 ? { label: 'Accumulate', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
                : total >= 45 ? { label: 'Hold', cls: 'bg-amber-50 text-amber-800 border-amber-200' }
                : total >= 30 ? { label: 'Watch', cls: 'bg-blue-50 text-blue-800 border-blue-200' }
                :               { label: 'Avoid', cls: 'bg-red-50 text-red-800 border-red-200' }

  const targetPe = hpe5 > 0 ? hpe5 : (pe > 0 ? pe * 1.1 : 0)
  const targetPrice = targetPe > 0 && pnl?.eps != null ? targetPe * pnl.eps : null
  const upside = targetPrice && stock.current_price ? ((targetPrice - stock.current_price) / stock.current_price) * 100 : null

  return (
    <div className="p-3 space-y-3">

      {/* Badge + Score */}
      <div className="flex gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-[14px_18px] flex flex-col items-center justify-center gap-[5px] min-w-[130px] flex-shrink-0">
          <div className="text-[9px] uppercase tracking-wide text-gray-400">Verdict</div>
          <span className={`text-[15px] font-semibold px-4 py-[5px] rounded-full border ${verdict.cls}`}>
            {verdict.label}
          </span>
          {targetPrice && (
            <>
              <div className="text-[10px] text-gray-500 mt-1">Target price</div>
              <div className="text-[14px] font-semibold font-mono text-emerald-600">₹{targetPrice.toFixed(0)}</div>
              {upside != null && (
                <div className={`text-[10px] ${upside >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% upside
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-[12px_14px]">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-[10px]">
            Score breakdown · current + historical
          </div>
          <div className="flex flex-col gap-[6px]">
            <ScoreRow label="Profitability"    score={profScore} max={20} color={scoreColor(profScore,20)} />
            <ScoreRow label="Growth quality"   score={growScore} max={20} color={scoreColor(growScore,20)} />
            <ScoreRow label="Valuation"        score={valScore}  max={20} color={scoreColor(valScore,20)} />
            <ScoreRow label="Balance sheet"    score={bsScore}   max={10} color={scoreColor(bsScore,10)} />
            <ScoreRow label="Cash flow"        score={cfScore}   max={10} color={scoreColor(cfScore,10)} />
            <ScoreRow label="Efficiency trend" score={effScore}  max={10} color={scoreColor(effScore,10)} />
            <ScoreRow label="Ownership quality" score={ownScore} max={10} color={scoreColor(ownScore,10)} />
          </div>
          <div className="flex items-center gap-2 mt-[7px] pt-2 border-t border-gray-200">
            <span className="text-[11px] font-medium w-[115px] flex-shrink-0">Total</span>
            <div className="flex-1 h-[9px] bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div className="h-full rounded-full" style={{ width: `${total}%`, background: 'linear-gradient(90deg,#dc2626 0%,#d97706 40%,#059669 72%)' }}/>
            </div>
            <span className="text-[13px] font-semibold font-mono text-emerald-600 w-8 text-right">{total}</span>
            <span className="text-[9px] text-gray-400 w-6">/ 100</span>
          </div>
        </div>
      </div>

      {/* 4-card grid */}
      <div className="grid grid-cols-2 gap-3">
        <VCard title="✓ Strengths" color="#059669">
          {roe >= 15    && <Vp dot="#059669">ROE {fmtPctAbs(roe)} — strong return on equity</Vp>}
          {de === 0     && <Vp dot="#059669">Debt-free balance sheet</Vp>}
          {de > 0 && de < 0.5 && <Vp dot="#059669">Low debt — D/E {de.toFixed(2)}</Vp>}
          {piotr >= 7   && <Vp dot="#059669">High Piotroski F-Score {piotr}/9</Vp>}
          {sg5 >= 10    && <Vp dot="#059669">5Y sales CAGR {fmtPctAbs(sg5)}</Vp>}
          {fcf > 0      && <Vp dot="#059669">Positive free cash flow {fmtCr(fcf)}</Vp>}
          {opm >= 20    && <Vp dot="#059669">Strong operating margins {fmtPctAbs(opm)}</Vp>}
        </VCard>

        <VCard title="✗ Risks" color="#dc2626">
          {de > 1       && <Vp dot="#dc2626">High debt — D/E {de.toFixed(2)}</Vp>}
          {promo < 25   && <Vp dot="#dc2626">Low promoter holding {fmtPctAbs(promo)}</Vp>}
          {pledge > 10  && <Vp dot="#dc2626">Pledged shares {fmtPctAbs(pledge)}</Vp>}
          {sg5 < 5      && <Vp dot="#dc2626">Weak revenue growth {fmtPctAbs(sg5)}</Vp>}
          {opm < 10     && <Vp dot="#dc2626">Thin operating margins {fmtPctAbs(opm)}</Vp>}
          {roe < 10     && <Vp dot="#dc2626">Low ROE {fmtPctAbs(roe)}</Vp>}
          {fcf < 0      && <Vp dot="#dc2626">Negative free cash flow</Vp>}
          {pe > hpe5 * 1.2 && <Vp dot="#dc2626">PE {fmtX(pe)} above historical avg {fmtX(hpe5)}</Vp>}
        </VCard>

        <VCard title="⚠ Watch" color="#d97706">
          {ratios?.debtor_days != null && ratios.debtor_days > 90 && <Vp dot="#d97706">Debtor days elevated at {fmtDays(ratios.debtor_days)}</Vp>}
          {pb > 4       && <Vp dot="#d97706">PB ratio {fmtX(pb)} — elevated vs book value</Vp>}
          {promo >= 25 && promo < 40 && <Vp dot="#d97706">Moderate promoter holding {fmtPctAbs(promo)}</Vp>}
          {pledge > 0 && pledge <= 10 && <Vp dot="#d97706">Some shares pledged {fmtPctAbs(pledge)}</Vp>}
          {sg5 >= 5 && sg5 < 10 && <Vp dot="#d97706">Modest sales growth {fmtPctAbs(sg5)}</Vp>}
          {pnl?.qoq_sales != null && pnl.qoq_sales < 0 && <Vp dot="#d97706">QoQ revenue declined {fmtPctAbs(pnl.qoq_sales)}</Vp>}
        </VCard>

        <VCard title="📊 Historical context" color="#2563eb">
          {hpe5 > 0 && <Vp dot="#2563eb">5Y historical PE avg {fmtX(hpe5)} vs current {fmtX(pe)}</Vp>}
          {ratios2?.avg_roe_5y != null && <Vp dot="#2563eb">5Y avg ROE {fmtPctAbs(ratios2.avg_roe_5y)} vs current {fmtPctAbs(roe)}</Vp>}
          {ratios2?.mcap_3y != null && <Vp dot="#2563eb">Mcap 3Y ago {fmtMcap(ratios2.mcap_3y)} vs now {fmtMcap(stock.market_cap)}</Vp>}
          {ratios2?.opm_5y != null && <Vp dot="#2563eb">5Y avg OPM {fmtPctAbs(ratios2.opm_5y)} vs current {fmtPctAbs(opm)}</Vp>}
        </VCard>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-[12px_14px]">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-[6px]">Summary</div>
        <p className="text-[11px] text-gray-600 leading-[1.75]">
          <strong className="text-gray-900">{stock.name}</strong> scores <strong className="text-gray-900">{total}/100</strong> — <strong className="text-gray-900">{verdict.label}</strong> category.
          {roe >= 15 && ` ROE of ${fmtPctAbs(roe)} indicates strong capital efficiency.`}
          {de === 0 && ` Zero debt gives significant financial flexibility.`}
          {sg5 > 0 && ` Revenue has compounded at ${fmtPctAbs(sg5)} over 5 years.`}
          {targetPrice && stock.current_price && ` Based on historical PE of ${fmtX(hpe5)}, fair value estimate is ₹${targetPrice.toFixed(0)} — ${upside != null && upside >= 0 ? `${upside.toFixed(1)}% upside` : 'limited upside at current price'}.`}
        </p>
      </div>

    </div>
  )
}

function fmtDays(v: number | null | undefined) { return v == null ? '—' : `${Math.round(v)}d` }
