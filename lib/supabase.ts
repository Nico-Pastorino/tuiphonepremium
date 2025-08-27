import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Función para obtener variables de entorno de manera segura
function getEnvVar(name: string): string | null {
  if (typeof window !== "undefined") {
    // En el cliente, solo podemos acceder a variables que empiecen con NEXT_PUBLIC_
    return (window as any).__ENV__?.[name] || process.env[name] || null
  }
  // En el servidor
  return process.env[name] || null
}

// Obtener variables de entorno
const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

// Valores por defecto para desarrollo (estos no funcionarán pero evitarán el error)
const defaultUrl = "https://placeholder.supabase.co"
const defaultKey = "placeholder-key-for-development"

// Usar valores por defecto si las variables no están disponibles
const finalUrl = supabaseUrl || defaultUrl
const finalAnonKey = supabaseAnonKey || defaultKey

// Cliente principal para operaciones públicas
export const supabase = createClient<Database>(finalUrl, finalAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Cliente para el servidor (solo si la service key está disponible)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(finalUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Función para verificar si Supabase está configurado correctamente
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== defaultUrl && supabaseAnonKey !== defaultKey)
}

// Función helper para verificar la conexión
export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured - using fallback data")
    return false
  }

  try {
    // Usar una consulta más simple que no requiera tablas específicas
    const { data, error } = await supabase.rpc("now")
    if (error) {
      // Si la función RPC no existe, intentar con una consulta básica
      const { error: basicError } = await supabase.from("products").select("count").limit(0)
      if (basicError && !basicError.message.includes("relation") && !basicError.message.includes("does not exist")) {
        console.error("Supabase connection error:", basicError)
        return false
      }
    }
    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.warn("Supabase connection failed, using fallback mode:", error)
    return false
  }
}

// Función para obtener información de configuración
export function getSupabaseConfig() {
  return {
    url: finalUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    isConfigured: isSupabaseConfigured(),
    adminClientAvailable: !!supabaseAdmin,
  }
}

// Función helper para obtener el cliente correcto para operaciones admin
export function getAdminClient() {
  if (supabaseAdmin) {
    console.log("Using Supabase admin client")
    return supabaseAdmin
  }
  console.log("Admin client not available, using regular client")
  return supabase
}
