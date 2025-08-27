import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    // Simple query to test connection
    const { error } = await supabase.from("products").select("count", { count: "exact", head: true })

    return !error
  } catch (err) {
    console.warn("Supabase connection test failed:", err)
    return false
  }
}
