'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import type { ScreenerRow } from '@/lib/types'
import { fmtMcap, fmtPctAbs, fmtX, fmtPrice } from '@/lib/utils'
import Link from 'next/link'

type Preset = 'quality' | 'value' | 'growth' | 'debtfree' | null

export default function ScreenerPage() {
  const [rows, setRows]         = useState<ScreenerRow[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [indGrp, setIndGrp]     = useState('')
  const [peMin, setPeMin]       = useState('')
  const [peMax, setPeMax]       = useState('')
  const [roeMin, setRoeMin]     = useState('')
  const [preset, setPreset]     = useState<Preset>(null)
  const [sortBy, setSortBy]     = useState('market_cap')
  const [sortDir, setSortDir]   = useState<'asc'|'desc'>('desc')
  const [industries, setIndustries] = useState<string[]>([])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)  params.set('search',  search)
    if (indGrp)  params.set('industry_group', indGrp)
    if (peMin)   params.set('pe_min',  peMin)
    if (peMax)   params.set('pe_max',  peMax)
    if (roeMin)  params.set('roe_min', roeMin)
    if (preset)  params.set('preset',  preset)
    params.set('sort_by',  sortBy)
    params.set('sort_dir', sortDir)
    params.set('page',     String(page))
    params.set('per_page', '50')

    fetch(`/api/stocks?${params}`)
      .then(r => r.json())
      .then(data => {
        setRows(data.data ?? [])
        setTotal(data.total ?? 0)
        setPages(data.pages ?? 1)
      })
      .finally(() => setLoading(false))
  }, [search, indGrp, peMin, peMax, roeMin, preset, sortBy, sortDir, page])

  useEffect(() => { fetchData() }, [fetchData])

  // Load industry groups for dropdown
  useEffect(() => {
    fetch('/api/industries').then(r => r.json()).then(data => {
      setIndustries(data.map((d: any) => d.name))
    })
  }, [])

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  const handlePreset = (p: Preset) => {
    setPreset(prev => prev === p ? null : p)
    setPage(1)
  }

  const Th = ({ col, label }: { col: string; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-[9px] py-[5px] text-right first:text-left text-[10px] font-medium text-gray-400 border-b border-gray-200 whitespace-nowrap cursor-pointer hover:text-gray-700 select-none"
    >
      {label}{sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </th>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Topbar />

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-[7px] flex gap-2 items-center flex-wrap flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-[7px] top-1/2 -translate-y-1/2 w-[11px] h-[11px] text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, NSE / BSE…"
            className="text-[11px] pl-[22px] pr-2 py-[5px] rounded-lg border border-gray-300 bg-gray-50 w-[175px] outline-none focus:border-emerald-400"
          />
        </div>

        {/* Industry group */}
        <select
          value={indGrp}
          onChange={e => { setIndGrp(e.target.value); setPage(1) }}
          className="text-[11px] px-2 py-[5px] rounded-md border border-gray-300 bg-gray-50 outline-none cursor-pointer"
        >
          <option value="">All Industry Groups</option>
          {industries.map(ig => <option key={ig} value={ig}>{ig}</option>)}
        </select>

        {/* PE range */}
        <span className="text-[10px] text-gray-400">PE</span>
        <input value={peMin} onChange={e => { setPeMin(e.target.value); setPage(1) }} placeholder="Min" className="text-[11px] px-2 py-[5px] rounded-md border border-gray-300 bg-gray-50 w-[58px] outline-none" />
        <input value={peMax} onChange={e => { setPeMax(e.target.value); setPage(1) }} placeholder="Max" className="text-[11px] px-2 py-[5px] rounded-md border border-gray-300 bg-gray-50 w-[58px] outline-none" />

        {/* ROE min */}
        <span className="text-[10px] text-gray-400">ROE ≥</span>
        <input value={roeMin} onChange={e => { setRoeMin(e.target.value); setPage(1) }} placeholder="15" className="text-[11px] px-2 py-[5px] rounded-md border border-gray-300 bg-gray-50 w-[58px] outline-none" />

        {/* Presets */}
        <div className="flex gap-1">
          {([['quality','⭐ Quality'],['value','💎 Value'],['growth','🚀 Growth'],['debtfree','🔒 Debt-free']] as [Preset,string][]).map(([p,l]) => (
            <button
              key={p!}
              onClick={() => handlePreset(p)}
              className={`text-[10px] px-[9px] py-[3px] rounded-full border whitespace-nowrap transition-colors
                ${preset === p ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[10px] font-mono text-gray-400">{total.toLocaleString()} results</span>

        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (indGrp) params.set('industry_group', indGrp)
            if (preset) params.set('preset', preset)
            params.set('per_page', '2000')
            window.open(`/api/stocks?${params}`, '_blank')
          }}
          className="text-[10px] px-[10px] py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
        >
          ↓ Export
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-3">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th col="name"           label="Name" />
                  <Th col="industry_group" label="Group" />
                  <Th col="industry"       label="Industry" />
                  <Th col="market_cap"     label="Mkt Cap ↓" />
                  <Th col="current_price"  label="Price ₹" />
                  <Th col="pe_ratio"       label="PE" />
                  <Th col="roe"            label="ROE %" />
                  <Th col="roce"           label="ROCE %" />
                  <Th col="opm"            label="OPM %" />
                  <Th col="debt_to_equity" label="D/E" />
                  <Th col="sales_growth_5y" label="Sales 5Y%" />
                  <Th col="eps_growth_5y"  label="EPS 5Y%" />
                  <Th col="free_cash_flow" label="FCF Cr" />
                  <Th col="piotroski_score" label="Pio" />
                  <Th col="promoter_holding" label="Promo %" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={15} className="text-center py-12 text-[11px] text-gray-400">Loading...</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={15} className="text-center py-12 text-[11px] text-gray-400">No results found</td></tr>
                )}
                {!loading && rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-[9px] py-[5px] text-[11px] font-medium text-gray-900 whitespace-nowrap">
                      <Link href={`/dashboard?stock=${row.nse_code || row.id}`} className="hover:text-emerald-600">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-[9px] py-[5px] text-[9px]">
                      <span className="px-[5px] py-[1px] rounded bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">{row.industry_group}</span>
                    </td>
                    <td className="px-[9px] py-[5px] text-[9px]">
                      <span className="px-[5px] py-[1px] rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">{row.industry}</span>
                    </td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700 whitespace-nowrap">{fmtMcap(row.market_cap)}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700 whitespace-nowrap">{fmtPrice(row.current_price)}</td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{row.pe_ratio?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.roe??0)>=15?'text-emerald-600':'text-gray-700'}`}>{row.roe?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.roce??0)>=15?'text-emerald-600':'text-gray-700'}`}>{row.roce?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.opm??0)>=20?'text-emerald-600':'text-gray-700'}`}>{row.opm?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.debt_to_equity??0)===0?'text-emerald-600':'text-gray-700'}`}>{row.debt_to_equity?.toFixed(2) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.sales_growth_5y??0)>=15?'text-emerald-600':'text-gray-700'}`}>{row.sales_growth_5y?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.eps_growth_5y??0)>=15?'text-emerald-600':'text-gray-700'}`}>{row.eps_growth_5y?.toFixed(1) ?? '—'}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.free_cash_flow??0)>0?'text-emerald-600':'text-red-500'}`}>{fmtMcap(row.free_cash_flow)}</td>
                    <td className={`px-[9px] py-[5px] text-[11px] text-right font-mono ${(row.piotroski_score??0)>=7?'text-emerald-600':'text-gray-700'}`}>
                      {row.piotroski_score != null ? `${row.piotroski_score}/9` : '—'}
                    </td>
                    <td className="px-[9px] py-[5px] text-[11px] text-right font-mono text-gray-700">{row.promoter_holding?.toFixed(1) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="bg-white border-t border-gray-200 px-4 py-[5px] flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="text-[10px] px-[7px] py-[2px] rounded border border-gray-200 bg-gray-50 text-gray-500 disabled:opacity-40">‹</button>
              {Array.from({length: Math.min(pages,7)}, (_,i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => setPage(p)} className={`text-[10px] px-[7px] py-[2px] rounded border ${page===p?'bg-emerald-50 text-emerald-700 border-emerald-300':'bg-gray-50 text-gray-500 border-gray-200'}`}>{p}</button>
                )
              })}
              {pages > 7 && <span className="text-[10px] text-gray-400">…</span>}
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="text-[10px] px-[7px] py-[2px] rounded border border-gray-200 bg-gray-50 text-gray-500 disabled:opacity-40">›</button>
              <span className="ml-auto text-[10px] font-mono text-gray-400">{total.toLocaleString()} results · 50/page</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
