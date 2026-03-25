'use client'
import type { StockDetail } from '@/lib/types'
import { fmtMcap, fmtX, fmtPctAbs, fmtNum } from '@/lib/utils'

interface Props {
  stock: StockDetail | null
  peers: any
  loading: boolean
}

function Bar({ val, max, color }: { val: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((val / max) * 100, 100) : 0
  return (
    <div className="flex-1 h-[7px] bg-gray-100 rounded-full overflow-hidden border border-gray-200">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function BarChart({ title, data, metric, higherBetter = true }: {
  title: string
  data: any[]
  metric: string
  higherBetter?: boolean
}) {
  const vals  = data.map(d => d[metric]).filter((v: any) => v != null) as number[]
  const max   = Math.max(...vals.map(Math.abs))
  const sorted = [...data].sort((a, b) =>
    higherBetter ? (b[metric] ?? 0) - (a[metric] ?? 0) : (a[metric] ?? 0) - (b[metric] ?? 0)
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-[10px] py-[6px] border-b border-gray-100 text-[11px] font-medium text-gray-900">{title}</div>
      <div className="px-[10px] py-[7px] flex flex-col gap-[5px]">
        {sorted.map((peer: any) => {
          const v   = peer[metric]
          const isSelf = peer.is_self
          const isAvg  = peer.is_avg
          return (
            <div key={peer.name || 'avg'} className="flex items-center gap-[6px]">
              <span className={`text-[10px] w-[70px] truncate flex-shrink-0 ${isSelf ? 'text-emerald-800 font-medium' : isAvg ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSelf ? `${peer.name?.split(' ')[0]} ★` : isAvg ? 'Sector avg' : peer.name?.split(' ')[0]}
              </span>
              <Bar val={Math.abs(v ?? 0)} max={max} color={isSelf ? '#059669' : isAvg ? '#9ca3af' : '#059669'} />
              <span className={`text-[9px] font-mono w-8 text-right flex-shrink-0 ${isSelf ? 'text-emerald-800 font-semibold' : isAvg ? 'text-gray-400' : 'text-gray-500'}`}>
                {v?.toFixed(1) ?? '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PeerTab({ stock, peers, loading }: Props) {
  if (loading) return (
    <div className="p-3 space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse h-24" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse h-40" />)}
      </div>
    </div>
  )

  if (!stock || !peers) return <div className="p-6 text-center text-[11px] text-gray-400">No peer data available</div>

  const { ranks, sector_avg } = peers
  const peerList = peers.peers ?? []

  // Build chart data — mark self and avg
  const chartData = [
    ...peerList.map((p: any) => ({ ...p, is_self: p.id === stock.id, is_avg: false })),
    { name: 'Sector avg', ...sector_avg, is_avg: true, is_self: false },
  ]

  const rankBadge = (rank: number | null, total: number) => {
    if (rank == null) return null
    const isTop = rank <= 3
    return (
      <span className={`text-[10px] px-[9px] py-[3px] rounded-full border font-mono
        ${isTop ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
        <strong>{isTop ? '' : ''}{rank === 1 ? '#1' : `#${rank}`}</strong> / {total}
      </span>
    )
  }

  return (
    <div className="p-3 space-y-3">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-[10px_14px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[14px] font-semibold text-gray-900">{stock.name}</span>
          <span className="text-[10px] text-gray-400">vs peers in</span>
          <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {peers.industry} · {peers.total_peers} stocks
          </span>
        </div>
        <div className="flex gap-[5px] flex-wrap">
          {ranks && Object.entries(ranks).map(([key, val]: [string, any]) =>
            val != null ? (
              <span key={key} className={`text-[10px] px-[9px] py-[3px] rounded-full border font-mono
                ${val <= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                {key.replace(/_/g,' ')} <strong>#{val}</strong>/{peers.total_peers}
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Bar charts */}
      <div className="grid grid-cols-2 gap-3">
        <BarChart title="ROE %"             data={chartData} metric="roe"             higherBetter />
        <BarChart title="PE Ratio"          data={chartData} metric="pe_ratio"        higherBetter={false} />
        <BarChart title="Sales Growth 5Y %" data={chartData} metric="sales_growth_5y" higherBetter />
        <BarChart title="OPM %"             data={chartData} metric="opm"             higherBetter />
      </div>

      {/* Full table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-[7px] border-b border-gray-200 text-[11px] font-medium text-gray-900">
          Side-by-side
          <span className="text-[10px] text-gray-400 font-normal ml-2">Latest annual · sector avg as benchmark</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                {['Company','Mkt Cap','PE','PB','ROE %','ROCE %','OPM %','D/E','Sales 5Y%','Piotroski','Promo %'].map(h => (
                  <th key={h} className="px-[9px] py-[5px] text-right first:text-left text-[10px] font-medium text-gray-400 border-b border-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...peerList].sort((a:any,b:any) => (b.market_cap??0)-(a.market_cap??0)).map((peer: any, i: number) => {
                const isSelf = peer.id === stock.id
                return (
                  <tr key={peer.id} className={`border-b border-gray-50 ${isSelf ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-[9px] py-[5px] text-[11px] font-medium whitespace-nowrap ${isSelf ? 'text-emerald-800' : 'text-gray-900'}`}>
                      <span className={`inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[9px] font-semibold mr-1
                        ${i<3 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                      {peer.name}
                    </td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{fmtMcap(peer.market_cap)}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{peer.pe_ratio?.toFixed(1) ?? '—'}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{peer.pb_ratio?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(peer.roe??0)>=15?'text-emerald-600':'text-gray-700'}`}>{peer.roe?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(peer.roce??0)>=15?'text-emerald-600':'text-gray-700'}`}>{peer.roce?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(peer.opm??0)>=20?'text-emerald-600':'text-gray-700'}`}>{peer.opm?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(peer.debt_to_equity??0)===0?'text-emerald-600':'text-gray-700'}`}>{peer.debt_to_equity?.toFixed(2) ?? '—'}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{peer.sales_growth_5y?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(peer.piotroski_score??0)>=7?'text-emerald-600':'text-gray-700'}`}>{peer.piotroski_score != null ? `${peer.piotroski_score}/9` : '—'}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{peer.promoter_holding?.toFixed(1) ?? '—'}</td>
                  </tr>
                )
              })}
              {/* Sector avg row */}
              <tr className="bg-gray-50">
                <td className="px-[9px] py-[5px] text-[11px] text-gray-400 italic">— Sector avg</td>
                <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-400">—</td>
                {['pe_ratio','pb_ratio','roe','roce','opm','debt_to_equity','sales_growth_5y','piotroski_score','promoter_holding'].map(k => (
                  <td key={k} className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-400">
                    {sector_avg?.[k]?.toFixed(1) ?? '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
