-- ============================================================
-- Fundamental Screener — Supabase Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Core stock identity table
CREATE TABLE IF NOT EXISTS stocks (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  bse_code        TEXT,
  nse_code        TEXT,
  isin_code       TEXT,
  industry_group  TEXT,
  industry        TEXT,
  current_price   NUMERIC,
  market_cap      NUMERIC,
  debt_to_equity  NUMERIC,
  face_value      NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Growth metrics (from PNL_1)
CREATE TABLE IF NOT EXISTS stock_growth (
  id                        SERIAL PRIMARY KEY,
  stock_id                  INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  sales_growth_5y           NUMERIC,
  sales_growth_7y           NUMERIC,
  sales_growth_10y          NUMERIC,
  ebidt_growth_3y           NUMERIC,
  ebidt_growth_5y           NUMERIC,
  ebidt_growth_7y           NUMERIC,
  ebidt_growth_10y          NUMERIC,
  eps_growth_3y             NUMERIC,
  eps_growth_5y             NUMERIC,
  eps_growth_7y             NUMERIC,
  eps_growth_10y            NUMERIC,
  profit_growth_7y          NUMERIC,
  profit_growth_10y         NUMERIC,
  avg_earnings_5y           NUMERIC,
  avg_earnings_10y          NUMERIC,
  avg_ebit_5y               NUMERIC,
  avg_ebit_10y              NUMERIC,
  change_promoter_holding_3y NUMERIC
);

-- Annual P&L (from annual_PNL)
CREATE TABLE IF NOT EXISTS stock_pnl (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  sales                       NUMERIC,
  opm                         NUMERIC,
  profit_after_tax            NUMERIC,
  roce                        NUMERIC,
  eps                         NUMERIC,
  operating_profit            NUMERIC,
  interest                    NUMERIC,
  depreciation                NUMERIC,
  ebit                        NUMERIC,
  net_profit                  NUMERIC,
  other_income                NUMERIC,
  tax                         NUMERIC,
  npm                         NUMERIC,
  -- Last year
  sales_ly                    NUMERIC,
  opm_ly                      NUMERIC,
  npm_ly                      NUMERIC,
  pat_ly                      NUMERIC,
  eps_ly                      NUMERIC,
  interest_ly                 NUMERIC,
  depreciation_ly             NUMERIC,
  ebit_ly                     NUMERIC,
  dividend_ly                 NUMERIC,
  -- Preceding year
  sales_py                    NUMERIC,
  opm_py                      NUMERIC,
  npm_py                      NUMERIC,
  pat_py                      NUMERIC,
  eps_py                      NUMERIC,
  -- Growth
  sales_growth_3y             NUMERIC,
  sales_growth_5y             NUMERIC,
  profit_growth_3y            NUMERIC,
  profit_growth_5y            NUMERIC,
  sales_growth_10y            NUMERIC,
  -- QoQ
  qoq_sales                   NUMERIC,
  qoq_profits                 NUMERIC
);

-- Balance sheet (from balance_sheet)
CREATE TABLE IF NOT EXISTS stock_balance_sheet (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  debt                        NUMERIC,
  equity_capital              NUMERIC,
  reserves                    NUMERIC,
  secured_loan                NUMERIC,
  unsecured_loan              NUMERIC,
  balance_sheet_total         NUMERIC,
  gross_block                 NUMERIC,
  accumulated_depreciation    NUMERIC,
  net_block                   NUMERIC,
  capital_wip                 NUMERIC,
  investments                 NUMERIC,
  current_assets              NUMERIC,
  current_liabilities         NUMERIC,
  total_assets                NUMERIC,
  working_capital             NUMERIC,
  inventory                   NUMERIC,
  trade_receivables           NUMERIC,
  cash_equivalents            NUMERIC,
  trade_payables              NUMERIC,
  book_value                  NUMERIC,
  net_worth                   NUMERIC,
  -- Historical working capital
  working_capital_3y          NUMERIC,
  working_capital_5y          NUMERIC,
  working_capital_7y          NUMERIC,
  working_capital_10y         NUMERIC,
  -- Historical debt
  debt_3y                     NUMERIC,
  debt_5y                     NUMERIC,
  debt_7y                     NUMERIC,
  debt_10y                    NUMERIC
);

-- Cash flow (from cash_flow)
CREATE TABLE IF NOT EXISTS stock_cash_flow (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  cfo_ly                      NUMERIC,
  fcf_ly                      NUMERIC,
  cfi_ly                      NUMERIC,
  cff_ly                      NUMERIC,
  net_cash_ly                 NUMERIC,
  cash_end_ly                 NUMERIC,
  -- Preceding year
  cfo_py                      NUMERIC,
  fcf_py                      NUMERIC,
  cfi_py                      NUMERIC,
  cff_py                      NUMERIC,
  -- Aggregates
  fcf_3y                      NUMERIC,
  fcf_5y                      NUMERIC,
  fcf_7y                      NUMERIC,
  fcf_10y                     NUMERIC,
  cfo_3y                      NUMERIC,
  cfo_5y                      NUMERIC,
  cfo_7y                      NUMERIC,
  cfo_10y                     NUMERIC,
  cfi_3y                      NUMERIC,
  cfi_5y                      NUMERIC,
  cfi_7y                      NUMERIC,
  cfi_10y                     NUMERIC,
  -- Historical cash
  cash_3y                     NUMERIC,
  cash_5y                     NUMERIC,
  cash_7y                     NUMERIC
);

-- Ratios 1 (from Ratios_1)
CREATE TABLE IF NOT EXISTS stock_ratios (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  pe_ratio                    NUMERIC,
  dividend_yield              NUMERIC,
  pb_ratio                    NUMERIC,
  roa                         NUMERIC,
  roe                         NUMERIC,
  promoter_holding            NUMERIC,
  pledged_percentage          NUMERIC,
  piotroski_score             NUMERIC,
  g_factor                    NUMERIC,
  asset_turnover              NUMERIC,
  financial_leverage          NUMERIC,
  unpledged_promoter          NUMERIC,
  roic                        NUMERIC,
  debtor_days                 NUMERIC,
  working_capital_days        NUMERIC,
  earnings_yield              NUMERIC,
  enterprise_value            NUMERIC,
  graham_number               NUMERIC,
  cash_conversion_cycle       NUMERIC,
  days_payable                NUMERIC,
  days_receivable             NUMERIC,
  days_inventory              NUMERIC,
  public_holding              NUMERIC,
  fii_holding                 NUMERIC,
  change_fii                  NUMERIC,
  dii_holding                 NUMERIC,
  change_dii                  NUMERIC,
  roce_ly                     NUMERIC,
  roa_ly                      NUMERIC,
  roe_ly                      NUMERIC,
  avg_roe_5y                  NUMERIC,
  avg_roe_3y                  NUMERIC,
  industry_pe                 NUMERIC,
  industry_pbv                NUMERIC,
  quick_ratio                 NUMERIC,
  current_ratio               NUMERIC,
  exports_pct                 NUMERIC,
  book_value_3y               NUMERIC,
  book_value_5y               NUMERIC,
  book_value_10y              NUMERIC
);

-- Ratios 2 (from Ratios_2)
CREATE TABLE IF NOT EXISTS stock_ratios2 (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  avg_roce_3y                 NUMERIC,
  avg_roce_5y                 NUMERIC,
  avg_roce_7y                 NUMERIC,
  avg_roce_10y                NUMERIC,
  avg_roe_7y                  NUMERIC,
  avg_roe_10y                 NUMERIC,
  opm_5y                      NUMERIC,
  opm_10y                     NUMERIC,
  historical_pe_3y            NUMERIC,
  historical_pe_5y            NUMERIC,
  historical_pe_7y            NUMERIC,
  historical_pe_10y           NUMERIC,
  mcap_3y                     NUMERIC,
  mcap_5y                     NUMERIC,
  mcap_7y                     NUMERIC,
  mcap_10y                    NUMERIC,
  avg_debtor_days_3y          NUMERIC,
  debtor_days_3y              NUMERIC,
  debtor_days_5y              NUMERIC,
  roa_3y                      NUMERIC,
  roa_5y                      NUMERIC,
  avg_dividend_5y             NUMERIC,
  avg_dividend_payout_3y      NUMERIC,
  change_fii_3y               NUMERIC,
  change_dii_3y               NUMERIC,
  is_not_sme                  BOOLEAN
);

-- User ratios (from user_ratio)
CREATE TABLE IF NOT EXISTS stock_user_ratios (
  id                          SERIAL PRIMARY KEY,
  stock_id                    INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  price_to_sales              NUMERIC,
  price_to_fcf                NUMERIC,
  ev_ebitda                   NUMERIC,
  current_ratio               NUMERIC,
  interest_coverage           NUMERIC,
  peg_ratio                   NUMERIC,
  wc_to_sales                 NUMERIC,
  net_worth                   NUMERIC,
  mcap_to_sales               NUMERIC,
  ev_to_ebit                  NUMERIC,
  debt_capacity               NUMERIC,
  debt_to_profit              NUMERIC,
  total_capital_employed      NUMERIC,
  dividend_payout             NUMERIC,
  graham                      NUMERIC,
  roce_3y_avg                 NUMERIC,
  mcap_to_cfo                 NUMERIC
);

-- ============================================================
-- Indexes for screener performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stocks_industry_group ON stocks(industry_group);
CREATE INDEX IF NOT EXISTS idx_stocks_industry       ON stocks(industry);
CREATE INDEX IF NOT EXISTS idx_stocks_nse_code       ON stocks(nse_code);
CREATE INDEX IF NOT EXISTS idx_stocks_bse_code       ON stocks(bse_code);
CREATE INDEX IF NOT EXISTS idx_ratios_stock_id       ON stock_ratios(stock_id);
CREATE INDEX IF NOT EXISTS idx_pnl_stock_id          ON stock_pnl(stock_id);
CREATE INDEX IF NOT EXISTS idx_bs_stock_id           ON stock_balance_sheet(stock_id);
CREATE INDEX IF NOT EXISTS idx_cf_stock_id           ON stock_cash_flow(stock_id);

-- ============================================================
-- Screener view — single JOIN for the screener table
-- ============================================================
CREATE OR REPLACE VIEW screener_view AS
SELECT
  s.id,
  s.name,
  s.nse_code,
  s.bse_code,
  s.industry_group,
  s.industry,
  s.current_price,
  s.market_cap,
  s.debt_to_equity,
  -- Profitability
  r.pe_ratio,
  r.pb_ratio,
  r.roe,
  r.roa,
  r.roic,
  r.piotroski_score,
  r.promoter_holding,
  r.fii_holding,
  r.pledged_percentage,
  r.debtor_days,
  r.dividend_yield,
  r.enterprise_value,
  -- P&L
  p.opm,
  p.npm,
  p.roce,
  p.eps,
  p.sales,
  p.profit_after_tax,
  p.qoq_sales,
  p.qoq_profits,
  -- Growth
  g.sales_growth_5y,
  g.sales_growth_10y,
  g.eps_growth_5y,
  g.profit_growth_7y,
  -- Cash flow
  cf.fcf_ly        AS free_cash_flow,
  cf.cfo_ly        AS operating_cash_flow,
  -- Balance sheet
  bs.book_value,
  bs.net_worth,
  bs.cash_equivalents,
  bs.working_capital,
  -- User ratios
  ur.ev_ebitda,
  ur.interest_coverage,
  ur.price_to_sales,
  ur.peg_ratio
FROM stocks s
LEFT JOIN stock_ratios        r   ON r.stock_id  = s.id
LEFT JOIN stock_pnl           p   ON p.stock_id  = s.id
LEFT JOIN stock_growth        g   ON g.stock_id  = s.id
LEFT JOIN stock_cash_flow     cf  ON cf.stock_id = s.id
LEFT JOIN stock_balance_sheet bs  ON bs.stock_id = s.id
LEFT JOIN stock_user_ratios   ur  ON ur.stock_id = s.id;
