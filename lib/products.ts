import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Product } from "@/types/product"
import type { ProductRow } from "@/types/database"
import { fallbackProducts } from "@/data/fallback-products"

export function transformSupabaseProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: row.price,
    originalPrice: row.original_price || undefined,
    priceUSD: row.price_usd || undefined,
    category: row.category,
    condition: row.condition as "nuevo" | "seminuevo" | "usado",
    images: row.images || [],
    specifications: row.specifications || {},
    stock: row.stock,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (error) {
        console.error("Error fetching product by id:", error)
      } else if (data) {
        return transformSupabaseProduct(data)
      }
    } catch (error) {
      console.error("Supabase exception while fetching product by id:", error)
    }
  }

  return fallbackProducts.find((product) => product.id === id) ?? null
}

export async function fetchProductsByCategory(
  category: string,
  { excludeId, limit = 4 }: { excludeId?: string; limit?: number } = {},
): Promise<Product[]> {
  if (!category) {
    return []
  }

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from("products").select("*").eq("category", category).order("created_at", { ascending: false })

      if (excludeId) {
        query = query.neq("id", excludeId)
      }

      const { data, error } = await query.limit(limit)

      if (error) {
        console.error("Error fetching related products:", error)
      } else if (data) {
        return data.map(transformSupabaseProduct)
      }
    } catch (error) {
      console.error("Supabase exception while fetching related products:", error)
    }
  }

  return fallbackProducts
    .filter((product) => product.category === category && (!excludeId || product.id !== excludeId))
    .slice(0, limit)
}

export async function fetchAllProductIds(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("products").select("id")

      if (error) {
        console.error("Error fetching product ids:", error)
      } else if (data) {
        return data.map((row) => row.id)
      }
    } catch (error) {
      console.error("Supabase exception while fetching product ids:", error)
    }
  }

  return fallbackProducts.map((product) => product.id)
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
      } else if (data) {
        return data.map(transformSupabaseProduct)
      }
    } catch (error) {
      console.error("Supabase exception while fetching products:", error)
    }
  }

  return fallbackProducts
}
