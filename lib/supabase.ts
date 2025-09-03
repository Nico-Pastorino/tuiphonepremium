import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente para operaciones administrativas
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

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
      console.log("Supabase not configured properly")
      return false
    }

    const { data, error } = await supabase.from("products").select("count").limit(1)

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

// Funciones CRUD para productos
export async function getProducts() {
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getProducts:", error)
    throw error
  }
}

export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          price_usd: productData.priceUSD,
          category: productData.category,
          condition: productData.condition,
          images: productData.images,
          specifications: productData.specifications || {},
          featured: productData.featured || false,
          stock: productData.stock || 1,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createProduct:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        price_usd: productData.priceUSD,
        category: productData.category,
        condition: productData.condition,
        images: productData.images,
        specifications: productData.specifications || {},
        featured: productData.featured || false,
        stock: productData.stock || 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateProduct:", error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    throw error
  }
}
