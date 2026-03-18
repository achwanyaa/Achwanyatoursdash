import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}

export const supabase = createServerClient()
