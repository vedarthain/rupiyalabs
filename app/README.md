# Fundamental Screener

Indian stock fundamental screener built with Next.js 15, Tailwind CSS, and Supabase.

## Setup

### 1. Install dependencies
```bash
npm install
npm install --save-dev ts-node dotenv @types/node
```

### 2. Environment variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Supabase schema
- Open your Supabase project dashboard
- Go to **SQL Editor** → **New Query**
- Paste the contents of `supabase/schema.sql`
- Click **Run**

### 4. Seed CSV data
- Copy your 7 CSV files into the `/data` folder:
  - `fundamental-strongPNL_1.csv`
  - `fundamental-strong__annual_PNL_.csv`
  - `fundamental-strong_balance_sheet.csv`
  - `fundamental-strong_cash_flow.csv`
  - `fundamental-strong_Ratios_1.csv`
  - `fundamental-strong_Ratios_2.csv`
  - `fundamental-strong_user_ratio.csv`

Then run:
```bash
npx ts-node --project tsconfig.seed.json scripts/seed.ts
```

### 5. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project structure
```
app/
  api/
    industries/       # Sidebar industry groups
    stocks/           # Screener with filters
    stock/[symbol]/   # Stock detail + peers
  dashboard/          # Main dashboard page
  screener/           # Screener page
components/
  layout/             # Topbar, Sidebar
  dashboard/          # Stock header, tabs, KPI tiles
  screener/           # Filter bar, table
lib/
  supabase.ts         # Supabase client
  types.ts            # TypeScript interfaces
  utils.ts            # Formatters
scripts/
  seed.ts             # CSV → Supabase loader
supabase/
  schema.sql          # Database schema + indexes + view
data/                 # Place your CSV files here
```
