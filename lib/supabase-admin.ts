import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Configuración específica para operaciones de administrador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables for admin operations")
}

// Cliente administrativo con permisos completos
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
})

// Función para verificar la conexión del admin
export async function testAdminConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.from("products").select("count").limit(1)
    if (error) {
      console.error("Admin connection error:", error)
      return false
    }
    console.log("Admin connection successful")
    return true
  } catch (error) {
    console.error("Admin connection failed:", error)
    return false
  }
}

// Operaciones CRUD específicas para admin
export class ProductAdminService {
  static async createProduct(productData: any) {
    try {
      console.log("Creating product with admin service:", productData)

      const { data, error } = await supabaseAdmin.from("products").insert(productData).select().single()

      if (error) {
        console.error("Admin create error:", error)
        throw error
      }

      console.log("Product created successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Create product error:", error)
      return { data: null, error }
    }
  }

  static async updateProduct(id: string, productData: any) {
    try {
      console.log("Updating product with admin service:", { id, productData })

      const { data, error } = await supabaseAdmin.from("products").update(productData).eq("id", id).select().single()

      if (error) {
        console.error("Admin update error:", error)
        throw error
      }

      console.log("Product updated successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Update product error:", error)
      return { data: null, error }
    }
  }

  static async deleteProduct(id: string) {
    try {
      console.log("Deleting product with admin service:", id)

      const { data, error } = await supabaseAdmin.from("products").delete().eq("id", id).select().single()

      if (error) {
        console.error("Admin delete error:", error)
        throw error
      }

      console.log("Product deleted successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Delete product error:", error)
      return { data: null, error }
    }
  }

  static async getAllProducts() {
    try {
      const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Admin get all error:", error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Get all products error:", error)
      return { data: null, error }
    }
  }
}
