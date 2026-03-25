import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser / server-component safe client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Server-only admin client (uses service_role key, bypasses RLS)
// Import this only in API routes / server actions — never in client components
export function supabaseAdmin() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
