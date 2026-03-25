import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const db = supabaseAdmin()

    // Get industry groups with stock counts
    const { data: groups, error: gErr } = await db
      .from('stocks')
      .select('industry_group')
      .not('industry_group', 'is', null)

    if (gErr) throw gErr

    // Count per group
    const countMap = new Map<string, number>()
    groups?.forEach(({ industry_group }) => {
      if (industry_group) {
        countMap.set(industry_group, (countMap.get(industry_group) ?? 0) + 1)
      }
    })

    // Get top stocks per group (for sidebar preview)
    const { data: stocks, error: sErr } = await db
      .from('screener_view')
      .select('id, name, nse_code, industry_group, industry, current_price, market_cap, roe, piotroski_score')
      .not('industry_group', 'is', null)
      .order('market_cap', { ascending: false })
      .limit(2000)

    if (sErr) throw sErr

    // Group stocks by industry_group, top 10 per group by market_cap
    const groupMap = new Map<string, typeof stocks>()
    stocks?.forEach((s) => {
      if (!s.industry_group) return
      const arr = groupMap.get(s.industry_group) ?? []
      if (arr.length < 10) arr.push(s)
      groupMap.set(s.industry_group, arr)
    })

    // Build sorted response (by total market cap descending)
    const mcapByGroup = new Map<string, number>()
    stocks?.forEach((s) => {
      if (!s.industry_group) return
      mcapByGroup.set(s.industry_group, (mcapByGroup.get(s.industry_group) ?? 0) + (s.market_cap ?? 0))
    })

    const result = Array.from(countMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        stocks: groupMap.get(name) ?? [],
      }))
      .sort((a, b) => (mcapByGroup.get(b.name) ?? 0) - (mcapByGroup.get(a.name) ?? 0))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[industries]', err)
    return NextResponse.json({ error: 'Failed to load industries' }, { status: 500 })
  }
}
