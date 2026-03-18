import { createClientComponentClient } from '@supabase/ssr'

export const createClient = () => createClientComponentClient()

export const supabase = createClient()
