import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ symbol: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const db = supabaseAdmin()
    const { symbol } = await params

    // Get the stock's industry
    let query = db.from('stocks').select('id, industry, industry_group')
    if (/^\d+$/.test(symbol)) {
      query = query.eq('id', parseInt(symbol))
    } else {
      query = query.or(`nse_code.ilike.${symbol},bse_code.ilike.${symbol}`)
    }

    const { data: stocks } = await query.limit(1)
    if (!stocks?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id, industry, industry_group } = stocks[0]

    // Fetch all peers in same industry (up to 40)
    const { data: peers, error } = await db
      .from('screener_view')
      .select('id, name, nse_code, market_cap, pe_ratio, pb_ratio, roe, roce, opm, debt_to_equity, sales_growth_5y, piotroski_score, promoter_holding, fii_holding, industry')
      .eq('industry', industry)
      .order('market_cap', { ascending: false })
      .limit(40)

    if (error) throw error

    // Sector averages
    const numPeers = peers?.length ?? 0
    const avg = (key: string) => {
      const vals = peers?.map((p) => p[key as keyof typeof p]).filter((v) => v != null && !isNaN(Number(v))) as number[]
      return vals.length ? vals.reduce((a, b) => a + Number(b), 0) / vals.length : null
    }

    const sectorAvg = {
      pe_ratio:       avg('pe_ratio'),
      pb_ratio:       avg('pb_ratio'),
      roe:            avg('roe'),
      roce:           avg('roce'),
      opm:            avg('opm'),
      debt_to_equity: avg('debt_to_equity'),
      sales_growth_5y: avg('sales_growth_5y'),
      piotroski_score: avg('piotroski_score'),
      promoter_holding: avg('promoter_holding'),
    }

    // Rank the current stock within peers
    const rankOf = (key: string, higherIsBetter = true) => {
      const self = peers?.find((p) => p.id === id)
      if (!self) return null
      const sorted = [...(peers ?? [])].sort((a, b) =>
        higherIsBetter
          ? Number(b[key as keyof typeof b] ?? 0) - Number(a[key as keyof typeof b] ?? 0)
          : Number(a[key as keyof typeof b] ?? 0) - Number(b[key as keyof typeof b] ?? 0)
      )
      return sorted.findIndex((p) => p.id === id) + 1
    }

    const ranks = {
      roe:             rankOf('roe'),
      roce:            rankOf('roce'),
      debt_to_equity:  rankOf('debt_to_equity', false),
      piotroski_score: rankOf('piotroski_score'),
      pe_ratio:        rankOf('pe_ratio', false),
      sales_growth_5y: rankOf('sales_growth_5y'),
      market_cap:      rankOf('market_cap'),
    }

    return NextResponse.json({
      stock_id:     id,
      industry,
      industry_group,
      total_peers:  numPeers,
      peers:        peers ?? [],
      sector_avg:   sectorAvg,
      ranks,
    })
  } catch (err) {
    console.error('[peers]', err)
    return NextResponse.json({ error: 'Failed to load peers' }, { status: 500 })
  }
}
