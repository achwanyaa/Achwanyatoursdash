import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
)
