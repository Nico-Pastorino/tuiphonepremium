import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Configuración específica para operaciones de administrador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Missing Supabase environment variables for admin operations")
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
      console.log("ProductAdminService: Creating product with data:", productData)

      // Validar datos antes de insertar
      if (!productData.name || !productData.price || !productData.category) {
        throw new Error("Faltan campos requeridos para crear el producto")
      }

      // Limpiar y validar datos
      const cleanedData = {
        name: productData.name,
        description: productData.description || "",
        price: Number(productData.price),
        original_price: productData.original_price || null,
        price_usd: productData.price_usd || null,
        category: productData.category,
        condition: productData.condition || "nuevo",
        images: Array.isArray(productData.images) ? productData.images : [],
        specifications: typeof productData.specifications === "object" ? productData.specifications : {},
        stock: 1,
        featured: Boolean(productData.featured),
      }

      console.log("ProductAdminService: Cleaned data for insertion:", cleanedData)

      const { data, error } = await supabaseAdmin.from("products").insert([cleanedData]).select().single()

      if (error) {
        console.error("ProductAdminService: Supabase insert error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      if (!data) {
        throw new Error("No se recibieron datos después de la inserción")
      }

      console.log("ProductAdminService: Product created successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("ProductAdminService: Create product error:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Error desconocido al crear producto"),
      }
    }
  }

  static async updateProduct(id: string, productData: any) {
    try {
      console.log("ProductAdminService: Updating product with ID:", id, "Data:", productData)

      if (!id) {
        throw new Error("ID del producto es requerido para actualizar")
      }

      // Limpiar y validar datos
      const cleanedData = {
        name: productData.name,
        description: productData.description || "",
        price: Number(productData.price),
        original_price: productData.original_price || null,
        price_usd: productData.price_usd || null,
        category: productData.category,
        condition: productData.condition || "nuevo",
        images: Array.isArray(productData.images) ? productData.images : [],
        specifications: typeof productData.specifications === "object" ? productData.specifications : {},
        stock: 1,
        featured: Boolean(productData.featured),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabaseAdmin.from("products").update(cleanedData).eq("id", id).select().single()

      if (error) {
        console.error("ProductAdminService: Supabase update error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      if (!data) {
        throw new Error("No se encontró el producto para actualizar")
      }

      console.log("ProductAdminService: Product updated successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("ProductAdminService: Update product error:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Error desconocido al actualizar producto"),
      }
    }
  }

  static async deleteProduct(id: string) {
    try {
      console.log("ProductAdminService: Deleting product with ID:", id)

      if (!id) {
        throw new Error("ID del producto es requerido para eliminar")
      }

      const { data, error } = await supabaseAdmin.from("products").delete().eq("id", id).select().single()

      if (error) {
        console.error("ProductAdminService: Supabase delete error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      console.log("ProductAdminService: Product deleted successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("ProductAdminService: Delete product error:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Error desconocido al eliminar producto"),
      }
    }
  }

  static async getProductById(id: string) {
    try {
      console.log("ProductAdminService: Getting product by ID:", id)

      if (!id) {
        throw new Error("ID del producto es requerido")
      }

      const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).single()

      if (error) {
        console.error("ProductAdminService: Supabase get by ID error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      console.log("ProductAdminService: Product found:", data)
      return { data, error: null }
    } catch (error) {
      console.error("ProductAdminService: Get product by ID error:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Error desconocido al obtener producto"),
      }
    }
  }

  static async getAllProducts() {
    try {
      console.log("ProductAdminService: Getting all products")

      const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("ProductAdminService: Supabase get all error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      console.log("ProductAdminService: Found", data?.length || 0, "products")
      return { data: data || [], error: null }
    } catch (error) {
      console.error("ProductAdminService: Get all products error:", error)
      return {
        data: [],
        error: error instanceof Error ? error : new Error("Error desconocido al obtener productos"),
      }
    }
  }
}
