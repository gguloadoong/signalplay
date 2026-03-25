import { createClient } from '@supabase/supabase-js'

// service_role key — 서버사이드 전용. VITE_ 접두사 절대 금지.
export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
