import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const isConfigured = Boolean(url && anonKey && !url.includes('your-project-id'))

/** null bila env belum diisi → aplikasi otomatis berjalan dalam mode lokal (localStorage). */
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null
