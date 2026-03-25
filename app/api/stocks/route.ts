import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ScreenerFilters } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const db = supabaseAdmin()
    const { searchParams } = req.nextUrl

    const filters: ScreenerFilters = {
      search:         searchParams.get('search')         ?? undefined,
      industry_group: searchParams.get('industry_group') ?? undefined,
      industry:       searchParams.get('industry')       ?? undefined,
      pe_min:         searchParams.get('pe_min')  ? Number(searchParams.get('pe_min'))  : undefined,
      pe_max:         searchParams.get('pe_max')  ? Number(searchParams.get('pe_max'))  : undefined,
      roe_min:        searchParams.get('roe_min') ? Number(searchParams.get('roe_min')) : undefined,
      preset:         (searchParams.get('preset') as ScreenerFilters['preset']) ?? undefined,
      sort_by:        (searchParams.get('sort_by') as ScreenerFilters['sort_by']) ?? 'market_cap',
      sort_dir:       (searchParams.get('sort_dir') as 'asc' | 'desc') ?? 'desc',
      page:           searchParams.get('page')     ? Number(searchParams.get('page'))     : 1,
      per_page:       searchParams.get('per_page') ? Number(searchParams.get('per_page')) : 50,
    }

    let query = db.from('screener_view').select('*', { count: 'exact' })

    // Search
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,nse_code.ilike.%${filters.search}%,bse_code.ilike.%${filters.search}%`
      )
    }

    // Filters
    if (filters.industry_group) query = query.eq('industry_group', filters.industry_group)
    if (filters.industry)       query = query.eq('industry',       filters.industry)
    if (filters.pe_min != null) query = query.gte('pe_ratio', filters.pe_min)
    if (filters.pe_max != null) query = query.lte('pe_ratio', filters.pe_max)
    if (filters.roe_min != null) query = query.gte('roe',     filters.roe_min)

    // Presets
    switch (filters.preset) {
      case 'quality':
        query = query
          .gte('roe',            15)
          .gte('piotroski_score', 7)
          .lte('debt_to_equity',  1)
        break
      case 'value':
        query = query
          .lte('pe_ratio', 15)
          .lte('pb_ratio',  2)
          .gte('roe',       10)
        break
      case 'growth':
        query = query
          .gte('sales_growth_5y',  15)
          .gte('profit_growth_7y', 15)
          .gte('roe',              15)
        break
      case 'debtfree':
        query = query.lte('debt_to_equity', 0.1)
        break
    }

    // Exclude SME (is_not_sme filtering happens at stock level — approximate here)
    // Sorting
    const sortCol = filters.sort_by ?? 'market_cap'
    query = query.order(sortCol as string, { ascending: filters.sort_dir === 'asc', nullsFirst: false })

    // Pagination
    const page     = filters.page    ?? 1
    const perPage  = Math.min(filters.per_page ?? 50, 100)
    const from     = (page - 1) * perPage
    const to       = from + perPage - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      data:      data ?? [],
      total:     count ?? 0,
      page,
      per_page:  perPage,
      pages:     Math.ceil((count ?? 0) / perPage),
    })
  } catch (err) {
    console.error('[screener]', err)
    return NextResponse.json({ error: 'Screener query failed' }, { status: 500 })
  }
}
