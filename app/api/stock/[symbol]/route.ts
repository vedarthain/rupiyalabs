import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ symbol: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const db = supabaseAdmin()
    const { symbol } = await params

    // Find stock by NSE code, BSE code, or numeric id
    let query = db.from('stocks').select('*')
    if (/^\d+$/.test(symbol)) {
      query = query.eq('id', parseInt(symbol))
    } else {
      query = query.or(`nse_code.ilike.${symbol},bse_code.ilike.${symbol}`)
    }

    const { data: stocks, error: sErr } = await query.limit(1)
    if (sErr) throw sErr
    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    const stock = stocks[0]
    const id = stock.id

    // Fetch all related tables in parallel
    const [pnl, growth, bs, cf, ratios, ratios2, userRatios] = await Promise.all([
      db.from('stock_pnl').select('*').eq('stock_id', id).single(),
      db.from('stock_growth').select('*').eq('stock_id', id).single(),
      db.from('stock_balance_sheet').select('*').eq('stock_id', id).single(),
      db.from('stock_cash_flow').select('*').eq('stock_id', id).single(),
      db.from('stock_ratios').select('*').eq('stock_id', id).single(),
      db.from('stock_ratios2').select('*').eq('stock_id', id).single(),
      db.from('stock_user_ratios').select('*').eq('stock_id', id).single(),
    ])

    return NextResponse.json({
      ...stock,
      pnl:           pnl.data,
      growth:        growth.data,
      balance_sheet: bs.data,
      cash_flow:     cf.data,
      ratios:        ratios.data,
      ratios2:       ratios2.data,
      user_ratios:   userRatios.data,
    })
  } catch (err) {
    console.error('[stock detail]', err)
    return NextResponse.json({ error: 'Failed to load stock' }, { status: 500 })
  }
}
