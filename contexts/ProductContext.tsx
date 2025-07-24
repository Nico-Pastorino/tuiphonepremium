"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase, testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabase"
import type { Product, ProductFormData, ProductFilters } from "@/types/product"
import type { ProductRow } from "@/types/database"

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  supabaseConnected: boolean
  addProduct: (product: ProductFormData) => Promise<boolean>
  updateProduct: (id: string, product: Partial<ProductFormData>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getFeaturedProducts: () => Product[]
  searchProducts: (query: string) => Product[]
  filterProducts: (filters: ProductFilters) => Product[]
  refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Función para transformar datos de Supabase a nuestro formato
function transformSupabaseProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: row.price,
    originalPrice: row.original_price || undefined,
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

// Productos de fallback si Supabase no está disponible
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    description: "El iPhone más avanzado con chip A17 Pro y cámara de 48MP",
    price: 1299.99,
    originalPrice: 1399.99,
    category: "iphone",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400"],
    specifications: {
      storage: "256GB",
      color: "Titanio Natural",
      screen: "6.7 pulgadas",
    },
    stock: 5,
    featured: true,
  },
  {
    id: "2",
    name: "MacBook Air M2",
    description: "Ultraportátil con chip M2 y pantalla Liquid Retina de 13.6 pulgadas",
    price: 1199.99,
    originalPrice: 1299.99,
    category: "mac",
    condition: "seminuevo",
    images: ["/placeholder.svg?height=400&width=400"],
    specifications: {
      processor: "Apple M2",
      memory: "8GB",
      storage: "256GB SSD",
      screen: "13.6 pulgadas",
    },
    stock: 3,
    featured: true,
  },
  {
    id: "3",
    name: 'iPad Pro 12.9"',
    description: "iPad Pro con chip M2 y pantalla Liquid Retina XDR",
    price: 1099.99,
    originalPrice: 1199.99,
    category: "ipad",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400"],
    specifications: {
      processor: "Apple M2",
      storage: "128GB",
      screen: "12.9 pulgadas",
      connectivity: "Wi-Fi",
    },
    stock: 7,
    featured: false,
  },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  // Función para mostrar notificaciones (implementación simple)
  const showToast = useCallback((message: string, type: "success" | "error" | "warning" = "success") => {
    console.log(`[${type.toUpperCase()}] ${message}`)
    // Aquí podrías integrar con una librería de toast como react-hot-toast
  }, [])

  // Función para cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar si Supabase está configurado
      if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using fallback products")
        setProducts(fallbackProducts)
        setSupabaseConnected(false)
        return
      }

      // Verificar conexión a Supabase
      const isConnected = await testSupabaseConnection()
      setSupabaseConnected(isConnected)

      if (!isConnected) {
        console.warn("Supabase not available, using fallback products")
        setProducts(fallbackProducts)
        return
      }

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      const transformedProducts = data?.map(transformSupabaseProduct) || []
      setProducts(transformedProducts)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      // Usar productos de fallback en caso de error
      setProducts(fallbackProducts)
      setSupabaseConnected(false)
      showToast("Usando datos de ejemplo. Verifica la configuración de Supabase.", "warning")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Suscribirse a cambios en tiempo real (solo si Supabase está conectado)
  useEffect(() => {
    if (!supabaseConnected || !isSupabaseConfigured()) return

    const subscription = supabase
      .channel("products_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        console.log("Real-time update:", payload)
        loadProducts() // Recargar productos cuando hay cambios
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseConnected, loadProducts])

  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    if (!supabaseConnected) {
      showToast("Supabase no está conectado. No se puede agregar el producto.", "error")
      return false
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice,
          category: productData.category,
          condition: productData.condition,
          images: productData.images,
          specifications: productData.specifications,
          stock: productData.stock,
          featured: productData.featured,
        })
        .select()
        .single()

      if (error) throw error

      showToast("Producto agregado exitosamente", "success")
      return true
    } catch (err) {
      console.error("Error adding product:", err)
      showToast("Error al agregar producto", "error")
      return false
    }
  }

  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    if (!supabaseConnected) {
      showToast("Supabase no está conectado. No se puede actualizar el producto.", "error")
      return false
    }

    try {
      const updateData: any = {}
      if (productData.name !== undefined) updateData.name = productData.name
      if (productData.description !== undefined) updateData.description = productData.description
      if (productData.price !== undefined) updateData.price = productData.price
      if (productData.originalPrice !== undefined) updateData.original_price = productData.originalPrice
      if (productData.category !== undefined) updateData.category = productData.category
      if (productData.condition !== undefined) updateData.condition = productData.condition
      if (productData.images !== undefined) updateData.images = productData.images
      if (productData.specifications !== undefined) updateData.specifications = productData.specifications
      if (productData.stock !== undefined) updateData.stock = productData.stock
      if (productData.featured !== undefined) updateData.featured = productData.featured

      const { error } = await supabase.from("products").update(updateData).eq("id", id)

      if (error) throw error

      showToast("Producto actualizado exitosamente", "success")
      return true
    } catch (err) {
      console.error("Error updating product:", err)
      showToast("Error al actualizar producto", "error")
      return false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!supabaseConnected) {
      showToast("Supabase no está conectado. No se puede eliminar el producto.", "error")
      return false
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      showToast("Producto eliminado exitosamente", "success")
      return true
    } catch (err) {
      console.error("Error deleting product:", err)
      showToast("Error al eliminar producto", "error")
      return false
    }
  }

  const getProductById = (id: string): Product | undefined => {
    return products.find((product) => product.id === id)
  }

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter((product) => product.category === category)
  }

  const getFeaturedProducts = (): Product[] => {
    return products.filter((product) => product.featured)
  }

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery),
    )
  }

  const filterProducts = (filters: ProductFilters): Product[] => {
    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) return false
      if (filters.condition && product.condition !== filters.condition) return false
      if (filters.priceRange) {
        const [min, max] = filters.priceRange
        if (product.price < min || product.price > max) return false
      }
      if (filters.search) {
        const query = filters.search.toLowerCase()
        if (!product.name.toLowerCase().includes(query) && !product.description.toLowerCase().includes(query))
          return false
      }
      return true
    })
  }

  const refreshProducts = async () => {
    await loadProducts()
  }

  const value: ProductContextType = {
    products,
    loading,
    error,
    supabaseConnected,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    filterProducts,
    refreshProducts,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
