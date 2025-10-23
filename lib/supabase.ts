import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const isServer = typeof window === "undefined"

// Leer variables en tiempo de build para que Next.js las inyecte correctamente en el bundle del cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const supabaseServiceKey = isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "" : ""

// Valores por defecto para evitar que el cliente se rompa en desarrollo
const defaultUrl = "https://placeholder.supabase.co"
const defaultKey = "placeholder-key-for-development"

const isConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0

if (!isConfigured) {
  console.warn(
    "Supabase no esta configurado correctamente. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Usar valores por defecto si las variables no estan disponibles
const finalUrl = isConfigured ? supabaseUrl : defaultUrl
const finalAnonKey = isConfigured ? supabaseAnonKey : defaultKey
const finalServiceKey = supabaseServiceKey.length > 0 ? supabaseServiceKey : null

// Cliente principal para operaciones publicas
export const supabase = createClient<Database>(finalUrl, finalAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Cliente para el servidor (solo si la service key esta disponible)
export const supabaseAdmin = finalServiceKey
  ? createClient<Database>(finalUrl, finalServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Funcion para verificar si Supabase esta configurado correctamente
export function isSupabaseConfigured(): boolean {
  return isConfigured
}

// Funcion helper para verificar la conexion
export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured - using fallback data")
    return false
  }

  try {
    const { error } = await supabase.from("products").select("count").limit(1)
    if (error) {
      console.error("Supabase connection error:", error)
      return false
    }
    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Supabase connection failed:", error)
    return false
  }
}

// Funcion para obtener informacion de configuracion
export function getSupabaseConfig() {
  return {
    url: finalUrl,
    hasAnonKey: Boolean(supabaseAnonKey),
    hasServiceKey: Boolean(supabaseServiceKey),
    isConfigured: isSupabaseConfigured(),
    adminClientAvailable: Boolean(supabaseAdmin),
  }
}

// Funcion helper para obtener el cliente correcto para operaciones admin
export function getAdminClient() {
  if (supabaseAdmin) {
    console.log("Using Supabase admin client")
    return supabaseAdmin
  }
  console.log("Admin client not available, using regular client")
  return supabase
}
