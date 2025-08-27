import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase admin credentials not found, using fallback mode")
}

const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

export class ProductAdminService {
  static async getAllProducts() {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not configured")
    }

    const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return (
      data?.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price,
        priceUSD: product.price_usd,
        category: product.category,
        condition: product.condition as "nuevo" | "seminuevo" | "usado",
        images: product.images || [],
        specifications: product.specifications || {},
        stock: product.stock || 1,
        featured: product.featured || false,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      })) || []
    )
  }

  static async getProductById(id: string) {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not configured")
    }

    const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Supabase error:", error)
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.original_price,
      priceUSD: data.price_usd,
      category: data.category,
      condition: data.condition as "nuevo" | "seminuevo" | "usado",
      images: data.images || [],
      specifications: data.specifications || {},
      stock: data.stock || 1,
      featured: data.featured || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  static async createProduct(productData: any) {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not configured")
    }

    // Clean data before insertion
    const cleanData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      original_price: productData.original_price || null,
      price_usd: productData.price_usd || null,
      category: productData.category,
      condition: productData.condition,
      images: productData.images || [],
      specifications: productData.specifications || {},
      stock: 1,
      featured: productData.featured || false,
    }

    console.log("Creating product with data:", cleanData)

    const { data, error } = await supabaseAdmin.from("products").insert([cleanData]).select().single()

    if (error) {
      console.error("Supabase insert error:", error)
      throw new Error(`Failed to create product: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.original_price,
      priceUSD: data.price_usd,
      category: data.category,
      condition: data.condition as "nuevo" | "seminuevo" | "usado",
      images: data.images || [],
      specifications: data.specifications || {},
      stock: data.stock || 1,
      featured: data.featured || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  static async updateProduct(id: string, updateData: any) {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not configured")
    }

    // Clean data before update
    const cleanData = { ...updateData }
    if (cleanData.originalPrice !== undefined) {
      cleanData.original_price = cleanData.originalPrice
      delete cleanData.originalPrice
    }
    if (cleanData.priceUSD !== undefined) {
      cleanData.price_usd = cleanData.priceUSD
      delete cleanData.priceUSD
    }

    const { data, error } = await supabaseAdmin.from("products").update(cleanData).eq("id", id).select().single()

    if (error) {
      console.error("Supabase update error:", error)
      throw new Error(`Failed to update product: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.original_price,
      priceUSD: data.price_usd,
      category: data.category,
      condition: data.condition as "nuevo" | "seminuevo" | "usado",
      images: data.images || [],
      specifications: data.specifications || {},
      stock: data.stock || 1,
      featured: data.featured || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  static async deleteProduct(id: string) {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not configured")
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(`Failed to delete product: ${error.message}`)
    }

    return true
  }
}
