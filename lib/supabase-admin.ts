import { createClient, type PostgrestError } from "@supabase/supabase-js"
import type { Database, ProductInsert, ProductRow, ProductUpdate, SiteConfigInsert, SiteConfigRow, Json } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const PRODUCT_SELECT_COLUMNS =
  "id,name,description,price,original_price,price_usd,category,condition,images,specifications,stock,featured,created_at,updated_at"

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
      const { data, error } = await client
        .from("products")
        .insert(productData)
        .select(PRODUCT_SELECT_COLUMNS)
        .single()

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
        .select(PRODUCT_SELECT_COLUMNS)
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
        .select(PRODUCT_SELECT_COLUMNS)
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

  static async getAllProducts(options?: { limit?: number; offset?: number }): Promise<AdminResult<ProductRow[]>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const limit = options?.limit ?? 250
      const offset = options?.offset ?? 0
      const safeLimit = Math.max(1, Math.min(limit, 500))
      const safeOffset = Math.max(0, offset)
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT_COLUMNS)
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + safeLimit - 1)

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

  static async getProductById(id: string): Promise<AdminResult<ProductRow | null>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle()

      if (error) {
        throw error
      }

      return { data: (data as ProductRow) ?? null, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Get product by id error:", normalized)
      return { data: null, error: normalized }
    }
  }

  static async getCatalogPage(options: {
    limit: number
    offset: number
    category?: string | null
    condition?: string | null
    featured?: boolean | null
    search?: string | null
  }): Promise<AdminResult<{ rows: ProductRow[]; total: number }>> {
    if (!supabaseAdmin) {
      return { data: null, error: new Error("Admin client not configured") }
    }

    try {
      const client = getAdminClient()
      const normalizedLimit = Math.max(1, Math.min(options.limit, 200))
      const normalizedOffset = Math.max(0, options.offset)

      let query = client
        .from("products")
        .select(PRODUCT_SELECT_COLUMNS, { count: "exact" })
        .order("condition", { ascending: true })
        .order("price", { ascending: false, nullsFirst: false })
        .order("category", { ascending: true })
        .order("created_at", { ascending: false })
        .range(normalizedOffset, normalizedOffset + normalizedLimit - 1)

      if (options.category) {
        const normalizedCategory = options.category.trim().toLowerCase()
        query = query.ilike("category", normalizedCategory)
      }

      if (options.condition) {
        query = query.eq("condition", options.condition.trim().toLowerCase())
      }

      if (typeof options.featured === "boolean") {
        query = query.eq("featured", options.featured)
      }

      const searchValue = options.search?.trim()
      if (searchValue && searchValue.length > 0) {
        const sanitized = searchValue.replace(/[%_]/g, (match) => `\\${match}`)
        const pattern = `%${sanitized}%`
        query = query.or(
          [
            `name.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `category.ilike.${pattern}`,
            `condition.ilike.${pattern}`,
          ].join(","),
        )
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        data: { rows: (data as ProductRow[]) ?? [], total: count ?? 0 },
        error: null,
      }
    } catch (error) {
      const normalized = normalizeError(error)
      console.error("Get catalog page error:", normalized)
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

      const { data: existing, error: selectError } = await client
        .from("site_config")
        .select("*")
        .eq("key", key)
        .maybeSingle()

      if (selectError) {
        if (isMissingSiteConfigTableError(selectError)) {
          return { data: null, error: new Error(SITE_CONFIG_TABLE_NOT_FOUND) }
        }
        throw selectError
      }

      let result: SiteConfigRow | null = null

      if (existing) {
        const { data, error } = await client
          .from("site_config")
          .update({ value: payload.value, updated_at: payload.updated_at })
          .eq("key", key)
          .select("*")
          .single()

        if (error) {
          throw error
        }

        result = data as SiteConfigRow
      } else {
        const { data, error } = await client.from("site_config").insert(payload).select("*").single()

        if (error) {
          if (isMissingSiteConfigTableError(error)) {
            return { data: null, error: new Error(SITE_CONFIG_TABLE_NOT_FOUND) }
          }
          throw error
        }

        result = data as SiteConfigRow
      }

      return { data: result, error: null }
    } catch (error) {
      const normalized = normalizeError(error)
      if (!isMissingSiteConfigTableError(normalized)) {
        console.error("Upsert site config error:", normalized)
      }
      return { data: null, error: normalized }
    }
  }
}
