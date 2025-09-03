import { supabase } from "./supabase"
import type { Product } from "@/types/product"

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getProducts:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product by ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProductById:", error)
    return null
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) {
      console.error("Error creating product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createProduct:", error)
    return null
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return false
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products by category:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getProductsByCategory:", error)
    return []
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error searching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in searchProducts:", error)
    return []
  }
}
