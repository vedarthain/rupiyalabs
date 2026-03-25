// ── Core stock identity ───────────────────────────────────────
export interface Stock {
  id:             number
  name:           string
  nse_code:       string | null
  bse_code:       string | null
  isin_code:      string | null
  industry_group: string | null
  industry:       string | null
  current_price:  number | null
  market_cap:     number | null
  debt_to_equity: number | null
  face_value:     number | null
}

// ── Screener row (from screener_view) ────────────────────────
export interface ScreenerRow {
  id:                   number
  name:                 string
  nse_code:             string | null
  bse_code:             string | null
  industry_group:       string | null
  industry:             string | null
  current_price:        number | null
  market_cap:           number | null
  debt_to_equity:       number | null
  // Ratios
  pe_ratio:             number | null
  pb_ratio:             number | null
  roe:                  number | null
  roa:                  number | null
  roic:                 number | null
  piotroski_score:      number | null
  promoter_holding:     number | null
  fii_holding:          number | null
  pledged_percentage:   number | null
  debtor_days:          number | null
  dividend_yield:       number | null
  enterprise_value:     number | null
  // P&L
  opm:                  number | null
  npm:                  number | null
  roce:                 number | null
  eps:                  number | null
  sales:                number | null
  profit_after_tax:     number | null
  qoq_sales:            number | null
  qoq_profits:          number | null
  // Growth
  sales_growth_5y:      number | null
  sales_growth_10y:     number | null
  eps_growth_5y:        number | null
  profit_growth_7y:     number | null
  // Cash flow
  free_cash_flow:       number | null
  operating_cash_flow:  number | null
  // Balance sheet
  book_value:           number | null
  net_worth:            number | null
  cash_equivalents:     number | null
  working_capital:      number | null
  // User ratios
  ev_ebitda:            number | null
  interest_coverage:    number | null
  price_to_sales:       number | null
  peg_ratio:            number | null
}

// ── Dashboard — full stock detail ────────────────────────────
export interface StockDetail extends Stock {
  pnl:          StockPnl | null
  growth:       StockGrowth | null
  balance_sheet: StockBalanceSheet | null
  cash_flow:    StockCashFlow | null
  ratios:       StockRatios | null
  ratios2:      StockRatios2 | null
  user_ratios:  StockUserRatios | null
}

export interface StockGrowth {
  sales_growth_5y:             number | null
  sales_growth_7y:             number | null
  sales_growth_10y:            number | null
  eps_growth_3y:               number | null
  eps_growth_5y:               number | null
  eps_growth_7y:               number | null
  eps_growth_10y:              number | null
  profit_growth_7y:            number | null
  profit_growth_10y:           number | null
  avg_earnings_5y:             number | null
  avg_earnings_10y:            number | null
  change_promoter_holding_3y:  number | null
}

export interface StockPnl {
  sales:            number | null
  opm:              number | null
  profit_after_tax: number | null
  roce:             number | null
  eps:              number | null
  npm:              number | null
  operating_profit: number | null
  interest:         number | null
  depreciation:     number | null
  ebit:             number | null
  net_profit:       number | null
  other_income:     number | null
  qoq_sales:        number | null
  qoq_profits:      number | null
  sales_ly:         number | null
  pat_ly:           number | null
  eps_ly:           number | null
  sales_growth_3y:  number | null
  sales_growth_5y:  number | null
  profit_growth_3y: number | null
  profit_growth_5y: number | null
}

export interface StockBalanceSheet {
  debt:               number | null
  equity_capital:     number | null
  reserves:           number | null
  net_block:          number | null
  investments:        number | null
  current_assets:     number | null
  current_liabilities: number | null
  working_capital:    number | null
  inventory:          number | null
  trade_receivables:  number | null
  cash_equivalents:   number | null
  trade_payables:     number | null
  net_worth:          number | null
  working_capital_3y: number | null
  working_capital_5y: number | null
  working_capital_7y: number | null
  debt_3y:            number | null
  debt_5y:            number | null
  debt_7y:            number | null
  debt_10y:           number | null
}

export interface StockCashFlow {
  cfo_ly:   number | null
  fcf_ly:   number | null
  cfi_ly:   number | null
  cff_ly:   number | null
  cfo_py:   number | null
  fcf_py:   number | null
  fcf_3y:   number | null
  fcf_5y:   number | null
  fcf_7y:   number | null
  fcf_10y:  number | null
  cfo_3y:   number | null
  cfo_5y:   number | null
  cfo_7y:   number | null
  cfo_10y:  number | null
  cash_3y:  number | null
  cash_5y:  number | null
  cash_7y:  number | null
}

export interface StockRatios {
  pe_ratio:             number | null
  pb_ratio:             number | null
  roe:                  number | null
  roa:                  number | null
  roic:                 number | null
  roce_ly:              number | null
  promoter_holding:     number | null
  fii_holding:          number | null
  dii_holding:          number | null
  change_fii:           number | null
  pledged_percentage:   number | null
  piotroski_score:      number | null
  debtor_days:          number | null
  working_capital_days: number | null
  graham_number:        number | null
  cash_conversion_cycle: number | null
  dividend_yield:       number | null
  enterprise_value:     number | null
  industry_pe:          number | null
  quick_ratio:          number | null
  current_ratio:        number | null
  avg_roe_5y:           number | null
  avg_roe_3y:           number | null
  book_value_3y:        number | null
  book_value_5y:        number | null
  book_value_10y:       number | null
}

export interface StockRatios2 {
  avg_roce_3y:   number | null
  avg_roce_5y:   number | null
  avg_roce_7y:   number | null
  avg_roce_10y:  number | null
  avg_roe_7y:    number | null
  avg_roe_10y:   number | null
  opm_5y:        number | null
  opm_10y:       number | null
  historical_pe_3y:  number | null
  historical_pe_5y:  number | null
  historical_pe_7y:  number | null
  historical_pe_10y: number | null
  mcap_3y:       number | null
  mcap_5y:       number | null
  mcap_7y:       number | null
  mcap_10y:      number | null
  debtor_days_3y: number | null
  debtor_days_5y: number | null
  roa_3y:        number | null
  roa_5y:        number | null
  is_not_sme:    boolean | null
}

export interface StockUserRatios {
  ev_ebitda:          number | null
  interest_coverage:  number | null
  peg_ratio:          number | null
  price_to_sales:     number | null
  price_to_fcf:       number | null
  current_ratio:      number | null
  dividend_payout:    number | null
  graham:             number | null
  roce_3y_avg:        number | null
  mcap_to_cfo:        number | null
  net_worth:          number | null
}

// ── Sidebar industry group ────────────────────────────────────
export interface IndustryGroup {
  name:  string
  count: number
  stocks: SidebarStock[]
}

export interface SidebarStock {
  id:             number
  name:           string
  nse_code:       string | null
  current_price:  number | null
  day_change_pct: number | null
  industry:       string | null
  roe:            number | null
  piotroski_score: number | null
}

// ── Screener filter params ────────────────────────────────────
export interface ScreenerFilters {
  search?:        string
  industry_group?: string
  industry?:      string
  pe_min?:        number
  pe_max?:        number
  roe_min?:       number
  preset?:        'quality' | 'value' | 'growth' | 'debtfree'
  sort_by?:       keyof ScreenerRow
  sort_dir?:      'asc' | 'desc'
  page?:          number
  per_page?:      number
}

// ── Controls state (Fundamentals tab) ────────────────────────
export type StatementType = 'consolidated' | 'standalone'
export type PeriodType    = 'annual' | 'quarterly'
export type RangeType     = '3Y' | '5Y' | '7Y' | '10Y'

export interface FundamentalsControls {
  statement: StatementType
  period:    PeriodType
  range:     RangeType
}
