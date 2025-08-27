import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Función para verificar si Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
  )
}

// Función para probar la conexión a Supabase
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false
    }

    const { data, error } = await supabase.from("products").select("count").limit(1)

    if (error) {
      console.error("Supabase connection error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Supabase connection failed:", error)
    return false
  }
}
