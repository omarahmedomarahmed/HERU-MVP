import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://utlxvkwdcpwvdnkthksk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHh2a3dkY3B3dmRua3Roa3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDM3NzAsImV4cCI6MjA5MDgxOTc3MH0.maTgrS_ecWgo5nPOOkFsGzuEoU66kvru2bm4_X_HeMk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
