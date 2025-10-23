import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const isServer = typeof window === "undefined"

type RuntimeEnv = Record<string, string | undefined>

const readRuntimeEnv = (): RuntimeEnv | undefined => {
  if (isServer) {
    return undefined
  }
  const env = (globalThis as { __ENV__?: RuntimeEnv }).__ENV__
  return env && typeof env === "object" ? env : undefined
}

// Variables leídas en build time (Next.js las reemplaza en el bundle)
const staticSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const staticSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const staticSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

const runtimeEnv = readRuntimeEnv()

const resolvedSupabaseUrl = staticSupabaseUrl || runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL || ""
const resolvedSupabaseAnonKey = staticSupabaseAnonKey || runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const resolvedServiceKey = isServer ? staticSupabaseServiceKey : ""

// Valores por defecto para evitar que el cliente se rompa en desarrollo
const defaultUrl = "https://placeholder.supabase.co"
const defaultKey = "placeholder-key-for-development"

const isConfigured = resolvedSupabaseUrl.length > 0 && resolvedSupabaseAnonKey.length > 0

if (!isConfigured) {
  console.warn(
    "Supabase no esta configurado correctamente. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Usar valores por defecto si las variables no estan disponibles
const finalUrl = isConfigured ? resolvedSupabaseUrl : defaultUrl
const finalAnonKey = isConfigured ? resolvedSupabaseAnonKey : defaultKey
const finalServiceKey = resolvedServiceKey.length > 0 ? resolvedServiceKey : null

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
    hasAnonKey: resolvedSupabaseAnonKey.length > 0,
    hasServiceKey: resolvedServiceKey.length > 0,
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
