import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const isServer = typeof window === "undefined"

type RuntimeEnv = { [key: string]: string | undefined }

const getRuntimeEnv = (): RuntimeEnv | undefined => {
  if (isServer) {
    return undefined
  }
  const globalEnv = (globalThis as { __ENV__?: RuntimeEnv } | undefined)?.__ENV__
  if (globalEnv && typeof globalEnv === "object") {
    return globalEnv
  }
  return undefined
}

const readEnvValue = (name: string): string | null => {
  const fromProcess =
    typeof process !== "undefined" && process.env ? (process.env[name] as string | undefined) : undefined
  if (fromProcess && fromProcess.length > 0) {
    return fromProcess
  }

  const runtimeEnv = getRuntimeEnv()
  const fromRuntime = runtimeEnv?.[name]
  if (fromRuntime && fromRuntime.length > 0) {
    return fromRuntime
  }

  return null
}

const supabaseUrl = readEnvValue("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")
const supabaseServiceKey = isServer ? readEnvValue("SUPABASE_SERVICE_ROLE_KEY") : null

// Valores por defecto para evitar que el cliente se rompa en desarrollo
const defaultUrl = "https://placeholder.supabase.co"
const defaultKey = "placeholder-key-for-development"

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isConfigured) {
  console.warn(
    "Supabase no esta configurado correctamente. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Usar valores por defecto si las variables no estan disponibles
const finalUrl = supabaseUrl || defaultUrl
const finalAnonKey = supabaseAnonKey || defaultKey

// Cliente principal para operaciones publicas
export const supabase = createClient<Database>(finalUrl, finalAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Cliente para el servidor (solo si la service key esta disponible)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(finalUrl, supabaseServiceKey, {
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
