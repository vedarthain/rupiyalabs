/**
 * scripts/seed.ts
 * Reads the 7 CSV files and loads them into Supabase.
 *
 * Usage (run once from project root):
 *   npx ts-node --project tsconfig.seed.json scripts/seed.ts
 *
 * Place your 7 CSV files in the /data folder first.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DATA_DIR = path.join(process.cwd(), 'data')
const BATCH = 50 // rows per upsert batch

// ── helpers ──────────────────────────────────────────────────
function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  File not found: ${filePath} — skipping`)
    return []
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  const result = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  console.log(`  ✓ Parsed ${result.data.length} rows from ${filename}`)
  return result.data
}

function n(val: string | undefined): number | null {
  if (val === undefined || val === null || val.trim() === '' || val.trim() === '-') return null
  const parsed = parseFloat(val.trim())
  return isNaN(parsed) ? null : parsed
}

function b(val: string | undefined): boolean {
  return val?.trim() === '1'
}

async function upsertBatch(table: string, rows: object[]) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from(table).upsert(batch)
    if (error) {
      console.error(`  ✗ Error upserting to ${table}:`, error.message)
      throw error
    }
  }
}

// ── Step 1: Build stock identity map ─────────────────────────
async function seedStocks(rows: Record<string, string>[]) {
  console.log('\n📦 Seeding stocks table...')
  const records = rows.map((r) => ({
    name:           r['Name']?.trim(),
    bse_code:       r['BSE Code']?.trim() || null,
    nse_code:       r['NSE Code']?.trim() || null,
    isin_code:      r['ISIN Code']?.trim() || null,
    industry_group: r['Industry Group']?.trim() || null,
    industry:       r['Industry']?.trim() || null,
    current_price:  n(r['Current Price']),
    market_cap:     n(r['Market Capitalization']),
    debt_to_equity: n(r['Debt to equity']),
    face_value:     n(r['Face value']),
  })).filter((r) => r.name)

  await upsertBatch('stocks', records)
  console.log(`  ✓ ${records.length} stocks upserted`)
}

// ── Step 2: Fetch id map (name → id) ─────────────────────────
async function getStockIdMap(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('stocks')
    .select('id, name')
    .limit(2000)
  if (error) throw error
  const map = new Map<string, number>()
  data?.forEach((s) => map.set(s.name, s.id))
  console.log(`  ✓ Loaded ${map.size} stock IDs`)
  return map
}

// ── Step 3: Seed each related table ──────────────────────────
async function seedGrowth(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n📈 Seeding stock_growth...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:                   id,
      sales_growth_5y:            n(r['Sales growth 5years median']),
      sales_growth_7y:            n(r['Sales growth 7Years']),
      sales_growth_10y:           n(r['Sales growth 10Years']),
      ebidt_growth_3y:            n(r['EBIDT growth 3Years']),
      ebidt_growth_5y:            n(r['EBIDT growth 5Years']),
      ebidt_growth_7y:            n(r['EBIDT growth 7Years']),
      ebidt_growth_10y:           n(r['EBIDT growth 10Years']),
      eps_growth_3y:              n(r['EPS growth 3Years']),
      eps_growth_5y:              n(r['EPS growth 5Years']),
      eps_growth_7y:              n(r['EPS growth 7Years']),
      eps_growth_10y:             n(r['EPS growth 10Years']),
      profit_growth_7y:           n(r['Profit growth 7Years']),
      profit_growth_10y:          n(r['Profit growth 10Years']),
      avg_earnings_5y:            n(r['Average Earnings 5Year']),
      avg_earnings_10y:           n(r['Average Earnings 10Year']),
      avg_ebit_5y:                n(r['Average EBIT 5Year']),
      avg_ebit_10y:               n(r['Average EBIT 10Year']),
      change_promoter_holding_3y: n(r['Change in promoter holding 3Years']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_growth', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedPnl(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n💰 Seeding stock_pnl...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:          id,
      sales:             n(r['Sales']),
      opm:               n(r['OPM']),
      profit_after_tax:  n(r['Profit after tax']),
      roce:              n(r['Return on capital employed']),
      eps:               n(r['EPS']),
      operating_profit:  n(r['Operating profit']),
      interest:          n(r['Interest']),
      depreciation:      n(r['Depreciation']),
      ebit:              n(r['EBIT']),
      net_profit:        n(r['Net profit']),
      other_income:      n(r['Other income']),
      tax:               n(r['Tax']),
      npm:               n(r['NPM last year']),
      sales_ly:          n(r['Sales last year']),
      opm_ly:            n(r['OPM last year']),
      npm_ly:            n(r['NPM last year']),
      pat_ly:            n(r['Profit after tax last year']),
      eps_ly:            n(r['EPS last year']),
      interest_ly:       n(r['Interest last year']),
      depreciation_ly:   n(r['Depreciation last year']),
      ebit_ly:           n(r['EBIT last year']),
      dividend_ly:       n(r['Dividend last year']),
      sales_py:          n(r['Sales preceding year']),
      opm_py:            n(r['OPM preceding year']),
      npm_py:            n(r['NPM preceding year']),
      pat_py:            n(r['Profit after tax preceding year']),
      eps_py:            n(r['EPS preceding year']),
      sales_growth_3y:   n(r['Sales growth 3Years']),
      sales_growth_5y:   n(r['Sales growth 5Years']),
      profit_growth_3y:  n(r['Profit growth 3Years']),
      profit_growth_5y:  n(r['Profit growth 5Years']),
      sales_growth_10y:  n(r['Sales growth 10years median']),
      qoq_sales:         n(r['QoQ Sales']),
      qoq_profits:       n(r['QoQ Profits']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_pnl', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedBalanceSheet(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n🏦 Seeding stock_balance_sheet...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:                 id,
      debt:                     n(r['Debt']),
      equity_capital:           n(r['Equity capital']),
      reserves:                 n(r['Reserves']),
      secured_loan:             n(r['Secured loan']),
      unsecured_loan:           n(r['Unsecured loan']),
      balance_sheet_total:      n(r['Balance sheet total']),
      gross_block:              n(r['Gross block']),
      accumulated_depreciation: n(r['Accumulated depreciation']),
      net_block:                n(r['Net block']),
      capital_wip:              n(r['Capital work in progress']),
      investments:              n(r['Investments']),
      current_assets:           n(r['Current assets']),
      current_liabilities:      n(r['Current liabilities']),
      total_assets:             n(r['Total Assets']),
      working_capital:          n(r['Working capital']),
      inventory:                n(r['Inventory']),
      trade_receivables:        n(r['Trade receivables']),
      cash_equivalents:         n(r['Cash Equivalents']),
      trade_payables:           n(r['Trade Payables']),
      book_value:               n(r['Book value of unquoted investments']),
      net_worth:                n(r['Reserves']),
      working_capital_3y:       n(r['Working capital 3Years back']),
      working_capital_5y:       n(r['Working capital 5Years back']),
      working_capital_7y:       n(r['Working capital 7Years back']),
      working_capital_10y:      n(r['Working capital 10Years back']),
      debt_3y:                  n(r['Debt 3Years back']),
      debt_5y:                  n(r['Debt 5Years back']),
      debt_7y:                  n(r['Debt 7Years back']),
      debt_10y:                 n(r['Debt 10Years back']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_balance_sheet', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedCashFlow(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n💵 Seeding stock_cash_flow...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:    id,
      cfo_ly:      n(r['Cash from operations last year']),
      fcf_ly:      n(r['Free cash flow last year']),
      cfi_ly:      n(r['Cash from investing last year']),
      cff_ly:      n(r['Cash from financing last year']),
      net_cash_ly: n(r['Net cash flow last year']),
      cash_end_ly: n(r['Cash end of last year']),
      cfo_py:      n(r['Cash from operations preceding year']),
      fcf_py:      n(r['Free cash flow preceding year']),
      cfi_py:      n(r['Cash from investing preceding year']),
      cff_py:      n(r['Cash from financing preceding year']),
      fcf_3y:      n(r['Free cash flow 3years']),
      fcf_5y:      n(r['Free cash flow 5years']),
      fcf_7y:      n(r['Free cash flow 7years']),
      fcf_10y:     n(r['Free cash flow 10years']),
      cfo_3y:      n(r['Operating cash flow 3years']),
      cfo_5y:      n(r['Operating cash flow 5years']),
      cfo_7y:      n(r['Operating cash flow 7years']),
      cfo_10y:     n(r['Operating cash flow 10years']),
      cfi_3y:      n(r['Investing cash flow 3years']),
      cfi_5y:      n(r['Investing cash flow 5years']),
      cfi_7y:      n(r['Investing cash flow 7years']),
      cfi_10y:     n(r['Investing cash flow 10years']),
      cash_3y:     n(r['Cash 3Years back']),
      cash_5y:     n(r['Cash 5Years back']),
      cash_7y:     n(r['Cash 7Years back']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_cash_flow', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedRatios(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n📊 Seeding stock_ratios...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:              id,
      pe_ratio:              n(r['Price to Earning']),
      dividend_yield:        n(r['Dividend yield']),
      pb_ratio:              n(r['Price to book value']),
      roa:                   n(r['Return on assets']),
      roe:                   n(r['Return on equity']),
      promoter_holding:      n(r['Promoter holding']),
      pledged_percentage:    n(r['Pledged percentage']),
      piotroski_score:       n(r['Piotroski score']),
      g_factor:              n(r['G Factor']),
      asset_turnover:        n(r['Asset Turnover Ratio']),
      financial_leverage:    n(r['Financial leverage']),
      unpledged_promoter:    n(r['Unpledged promoter holding']),
      roic:                  n(r['Return on invested capital']),
      debtor_days:           n(r['Debtor days']),
      working_capital_days:  n(r['Working Capital Days']),
      earnings_yield:        n(r['Earnings yield']),
      enterprise_value:      n(r['Enterprise Value']),
      graham_number:         n(r['Graham Number']),
      cash_conversion_cycle: n(r['Cash Conversion Cycle']),
      days_payable:          n(r['Days Payable Outstanding']),
      days_receivable:       n(r['Days Receivable Outstanding']),
      days_inventory:        n(r['Days Inventory Outstanding']),
      public_holding:        n(r['Public holding']),
      fii_holding:           n(r['FII holding']),
      change_fii:            n(r['Change in FII holding']),
      dii_holding:           n(r['DII holding']),
      change_dii:            n(r['Change in DII holding']),
      roce_ly:               n(r['Return on capital employed preceding year']),
      roa_ly:                n(r['Return on assets preceding year']),
      roe_ly:                n(r['Return on equity preceding year']),
      avg_roe_5y:            n(r['Average return on equity 5Years']),
      avg_roe_3y:            n(r['Average return on equity 3Years']),
      industry_pe:           n(r['Industry PE']),
      industry_pbv:          n(r['Industry PBV']),
      quick_ratio:           n(r['Quick ratio']),
      current_ratio:         n(r['Current ratio']),
      exports_pct:           n(r['Exports percentage']),
      book_value_3y:         n(r['Book value 3years back']),
      book_value_5y:         n(r['Book value 5years back']),
      book_value_10y:        n(r['Book value 10years back']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_ratios', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedRatios2(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n📉 Seeding stock_ratios2...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:              id,
      avg_roce_3y:           n(r['Average return on capital employed 3Years']),
      avg_roce_5y:           n(r['Average return on capital employed 5Years']),
      avg_roce_7y:           n(r['Average return on capital employed 7Years']),
      avg_roce_10y:          n(r['Average return on capital employed 10Years']),
      avg_roe_7y:            n(r['Average return on equity 7Years']),
      avg_roe_10y:           n(r['Average return on equity 10Years']),
      opm_5y:                n(r['OPM 5Year']),
      opm_10y:               n(r['OPM 10Year']),
      historical_pe_3y:      n(r['Historical PE 3Years']),
      historical_pe_5y:      n(r['Historical PE 5Years']),
      historical_pe_7y:      n(r['Historical PE 7Years']),
      historical_pe_10y:     n(r['Historical PE 10Years']),
      mcap_3y:               n(r['Market Capitalization 3years back']),
      mcap_5y:               n(r['Market Capitalization 5years back']),
      mcap_7y:               n(r['Market Capitalization 7years back']),
      mcap_10y:              n(r['Market Capitalization 10years back']),
      avg_debtor_days_3y:    n(r['Average debtor days 3years']),
      debtor_days_3y:        n(r['Debtor days 3years back']),
      debtor_days_5y:        n(r['Debtor days 5years back']),
      roa_3y:                n(r['Return on assets 3years']),
      roa_5y:                n(r['Return on assets 5years']),
      avg_dividend_5y:       n(r['Average 5years dividend']),
      avg_dividend_payout_3y: n(r['Average dividend payout 3years']),
      change_fii_3y:         n(r['Change in FII holding 3Years']),
      change_dii_3y:         n(r['Change in DII holding 3Years']),
      is_not_sme:            b(r['Is not SME']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_ratios2', records)
  console.log(`  ✓ ${records.length} rows`)
}

async function seedUserRatios(rows: Record<string, string>[], idMap: Map<string, number>) {
  console.log('\n🧮 Seeding stock_user_ratios...')
  const records = rows.map((r) => {
    const id = idMap.get(r['Name']?.trim())
    if (!id) return null
    return {
      stock_id:              id,
      price_to_sales:        n(r['Price to Sales']),
      price_to_fcf:          n(r['Price to Free Cash Flow']),
      ev_ebitda:             n(r['EVEBITDA']),
      current_ratio:         n(r['Current ratio']),
      interest_coverage:     n(r['Interest Coverage Ratio']),
      peg_ratio:             n(r['PEG Ratio']),
      wc_to_sales:           n(r['Working Capital to Sales ratio']),
      net_worth:             n(r['Net worth']),
      mcap_to_sales:         n(r['Market Cap to Sales']),
      ev_to_ebit:            n(r['Enterprise Value to EBIT']),
      debt_capacity:         n(r['Debt Capacity']),
      debt_to_profit:        n(r['Debt To Profit']),
      total_capital_employed: n(r['Total Capital Employed']),
      dividend_payout:       n(r['Dividend Payout']),
      graham:                n(r['Graham']),
      roce_3y_avg:           n(r['ROCE3yr avg']),
      mcap_to_cfo:           n(r['Market Capt to Cash Flow']),
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  await upsertBatch('stock_user_ratios', records)
  console.log(`  ✓ ${records.length} rows`)
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting seed...\n')
  console.log('Reading CSV files...')

  const pnl1     = readCsv('fundamental-strongPNL_1.csv')
  const pnlAnn   = readCsv('fundamental-strong__annual_PNL_.csv')
  const bs       = readCsv('fundamental-strong_balance_sheet.csv')
  const cf       = readCsv('fundamental-strong_cash_flow.csv')
  const ratios1  = readCsv('fundamental-strong_Ratios_1.csv')
  const ratios2  = readCsv('fundamental-strong_Ratios_2.csv')
  const userRat  = readCsv('fundamental-strong_user_ratio.csv')

  // Use ratios1 as the source of truth for stock identity
  // (it has face_value which others don't)
  await seedStocks(ratios1)

  const idMap = await getStockIdMap()

  await seedGrowth(pnl1, idMap)
  await seedPnl(pnlAnn, idMap)
  await seedBalanceSheet(bs, idMap)
  await seedCashFlow(cf, idMap)
  await seedRatios(ratios1, idMap)
  await seedRatios2(ratios2, idMap)
  await seedUserRatios(userRat, idMap)

  console.log('\n✅ Seed complete!')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
