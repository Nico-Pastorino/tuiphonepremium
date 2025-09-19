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
function normalizeSpecifications(value: ProductRow["specifications"]): Record<string, string | number | boolean> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string | number | boolean>
  }

  return {}
}

function transformSupabaseProduct(row: ProductRow): Product {
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
    specifications: normalizeSpecifications(row.specifications),
    stock: row.stock,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  }
}

// Productos de respaldo si Supabase no está disponible
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    description: "El iPhone más avanzado con chip A17 Pro y cámara de 48MP",
    price: 1500000,
    originalPrice: 1600000,
    priceUSD: 1299,
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
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "MacBook Air M2",
    description: "Ultraportátil con chip M2 y pantalla Liquid Retina de 13.6 pulgadas",
    price: 1200000,
    originalPrice: 1350000,
    priceUSD: 1199,
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
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "iPad Pro 12.9\"",
    description: "iPad Pro con chip M2 y pantalla Liquid Retina XDR",
    price: 800000,
    originalPrice: 900000,
    priceUSD: 799,
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
    createdAt: "2024-01-01T00:00:00.000Z",
  },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  // Función para mostrar notificaciones
  const showToast = useCallback((message: string, type: "success" | "error" | "warning" = "success") => {
    console.log(`[${type.toUpperCase()}] ${message}`)
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

      // Intentar cargar desde la API primero, luego desde Supabase directamente
      try {
        const response = await fetch("/api/admin/products")
        if (response.ok) {
          const result = (await response.json()) as { data?: ProductRow[] }
          const transformedProducts = (result.data ?? []).map(transformSupabaseProduct)
          setProducts(transformedProducts)
          return
        }
      } catch (apiError) {
        console.warn("API not available, trying direct Supabase connection")
      }

      // Fallback a conexión directa con Supabase
      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      const transformedProducts = ((data ?? []) as ProductRow[]).map(transformSupabaseProduct)
      setProducts(transformedProducts)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProducts(fallbackProducts)
      setSupabaseConnected(false)
      showToast("Usando datos de ejemplo. Verificá la configuración de Supabase.", "warning")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Función para agregar producto usando la API
  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    try {
      console.log("Adding product:", productData)

const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al agregar producto")
      }

      console.log("Product added successfully:", result.data)
      showToast("Producto agregado exitosamente", "success")
      await loadProducts()
      return true
    } catch (err) {
      console.error("Error adding product:", err)
      showToast(`Error al agregar producto: ${err instanceof Error ? err.message : "Error desconocido"}`, "error")
      return false
    }
  }

  // Función para actualizar producto usando la API
  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    try {
      console.log("Updating product:", { id, productData })

const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar producto")
      }

      console.log("Product updated successfully:", result.data)
      showToast("Producto actualizado exitosamente", "success")
      await loadProducts()
      return true
    } catch (err) {
      console.error("Error updating product:", err)
      showToast(`Error al actualizar producto: ${err instanceof Error ? err.message : "Error desconocido"}`, "error")
      return false
    }
  }

  // Función para eliminar producto usando la API
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      console.log("Deleting product:", id)

const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al eliminar producto")
      }

      console.log("Product deleted successfully:", result.data)
      showToast("Producto eliminado exitosamente", "success")
      await loadProducts()
      return true
    } catch (err) {
      console.error("Error deleting product:", err)
      showToast(`Error al eliminar producto: ${err instanceof Error ? err.message : "Error desconocido"}`, "error")
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
