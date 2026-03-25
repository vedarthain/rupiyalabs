import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const db = supabaseAdmin()
    const symbol = req.nextUrl.searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json({ error: 'symbol required' }, { status: 400 })
    }

    let query = db.from('stocks').select('id, industry, industry_group')
    if (/^\d+$/.test(symbol)) {
      query = query.eq('id', parseInt(symbol))
    } else {
      query = query.or(`nse_code.ilike.${symbol},bse_code.ilike.${symbol}`)
    }

    const { data: stocks } = await query.limit(1)
    if (!stocks?.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { id, industry, industry_group } = stocks[0]

    const { data: peers, error } = await db
      .from('screener_view')
      .select('id, name, nse_code, market_cap, pe_ratio, pb_ratio, roe, roce, opm, debt_to_equity, sales_growth_5y, piotroski_score, promoter_holding, fii_holding, industry')
      .eq('industry', industry)
      .order('market_cap', { ascending: false })
      .limit(40)

    if (error) throw error

    const avg = (key: string) => {
      const vals = peers?.map((p: any) => p[key]).filter((v: any) => v != null && !isNaN(Number(v))) as number[]
      return vals.length ? vals.reduce((a: number, b: number) => a + Number(b), 0) / vals.length : null
    }

    const sectorAvg = {
      pe_ratio:        avg('pe_ratio'),
      pb_ratio:        avg('pb_ratio'),
      roe:             avg('roe'),
      roce:            avg('roce'),
      opm:             avg('opm'),
      debt_to_equity:  avg('debt_to_equity'),
      sales_growth_5y: avg('sales_growth_5y'),
      piotroski_score: avg('piotroski_score'),
      promoter_holding: avg('promoter_holding'),
    }

    const rankOf = (key: string, higherIsBetter = true) => {
      const sorted = [...(peers ?? [])].sort((a: any, b: any) =>
        higherIsBetter
          ? Number(b[key] ?? 0) - Number(a[key] ?? 0)
          : Number(a[key] ?? 0) - Number(b[key] ?? 0)
      )
      return sorted.findIndex((p: any) => p.id === id) + 1
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
      stock_id:    id,
      industry,
      industry_group,
      total_peers: peers?.length ?? 0,
      peers:       peers ?? [],
      sector_avg:  sectorAvg,
      ranks,
    })
  } catch (err) {
    console.error('[peers]', err)
    return NextResponse.json({ error: 'Failed to load peers' }, { status: 500 })
  }
}