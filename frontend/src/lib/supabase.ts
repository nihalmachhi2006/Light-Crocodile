import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://placeholder.supabase.co'
  supabaseAnonKey = 'placeholder'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
