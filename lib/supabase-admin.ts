import { createClient, type PostgrestError } from "@supabase/supabase-js"
import type { Database, ProductInsert, ProductRow, ProductUpdate } from "@/types/database"

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
