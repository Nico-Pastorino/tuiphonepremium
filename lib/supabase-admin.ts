import { createClient, type PostgrestError } from "@supabase/supabase-js"
import type { Database, ProductInsert, ProductRow, ProductUpdate, SiteConfigInsert, SiteConfigRow, Json } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: "public",
        },
      })
    : null

export const SITE_CONFIG_TABLE_NOT_FOUND = "SITE_CONFIG_TABLE_NOT_FOUND"

const isMissingSiteConfigTableError = (error: PostgrestError | Error): boolean => {
  const message = ("message" in error && typeof error.message === "string" ? error.message : "")
    .toLowerCase()
  const code = "code" in error && typeof (error as PostgrestError).code === "string" ? (error as PostgrestError).code : ""
  return code === "42P01" || message.includes("site_config")
}

const getAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error("Missing Supabase environment variables for admin operations")
  }

  return supabaseAdmin
}

const normalizeError = (error: unknown): PostgrestError | Error => {
  if (error instanceof Error) {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    return new Error(String((error as { message: unknown }).message))
  }

  return new Error("Unknown Supabase error")
}

export async function testAdminConnection(): Promise<boolean> {
  if (!supabaseAdmin) {
    return false
  }

  try {
    const { error } = await supabaseAdmin.from("products").select("count").limit(1)

    if (error) {
      console.error("Admin connection error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Admin connection failed:", error)
    return false
  }
}

type AdminResult<T> = { data: T | null; error: PostgrestError | Error | null }

export class ProductAdminService {
  static async createProduct(productData: ProductInsert): Promise<AdminResult<ProductRow>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client.from("products").insert(productData).select("*").single()

      if (error) {
        throw error
      }

      const typedData = data as ProductRow | null
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Create product error:", normalized)
      return { data: null, error: normalized }
    }
  }

  static async updateProduct(id: string, productData: ProductUpdate): Promise<AdminResult<ProductRow>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client
        .from("products")
        .update(productData)
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const typedData = data as ProductRow | null
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Update product error:", normalized)
      return { data: null, error: normalized }
    }
  }

  static async deleteProduct(id: string): Promise<AdminResult<ProductRow>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client
        .from("products")
        .delete()
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const typedData = data as ProductRow | null
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Delete product error:", normalized)
      return { data: null, error: normalized }
    }
  }

  static async getAllProducts(): Promise<AdminResult<ProductRow[]>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const typedData = data as ProductRow[] | null
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Get all products error:", normalized)
      return { data: null, error: normalized }
    }
  }
}
export class SiteConfigService {
  static async getConfigByKey(key: string): Promise<AdminResult<SiteConfigRow | null>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client.from("site_config").select("*").eq("key", key).maybeSingle()

      if (error) {
        if (isMissingSiteConfigTableError(error)) {
          return { data: null, error: new Error(SITE_CONFIG_TABLE_NOT_FOUND) }
        }
        throw error
      }

      const typedData = data as SiteConfigRow | null
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      if (!isMissingSiteConfigTableError(normalized)) {
        console.error("Get site config error:", normalized)
      }
      return { data: null, error: normalized }
    }
  }

  static async upsertConfig(key: string, value: Json): Promise<AdminResult<SiteConfigRow>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const payload: SiteConfigInsert = {
        key,
        value,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await client
        .from("site_config")
        .upsert(payload, { onConflict: "key" })
        .select("*")
        .single()

      if (error) {
        if (isMissingSiteConfigTableError(error)) {
          return { data: null, error: new Error(SITE_CONFIG_TABLE_NOT_FOUND) }
        }
        throw error
      }

      const typedData = data as SiteConfigRow
      return { data: typedData, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      if (!isMissingSiteConfigTableError(normalized)) {
        console.error("Upsert site config error:", normalized)
      }
      return { data: null, error: normalized }
    }
  }
}
