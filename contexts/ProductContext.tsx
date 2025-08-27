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
    priceUSD: row.price_usd || undefined,
    category: row.category,
    condition: row.condition as "nuevo" | "seminuevo" | "usado",
    images: row.images || [],
    specifications: row.specifications || {},
    stock: 1, // Siempre disponible
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
    price: 1500000,
    originalPrice: 1600000,
    priceUSD: 1299,
    category: "iphone",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPhone+15+Pro+Max"],
    specifications: {
      storage: "256GB",
      color: "Titanio Natural",
      screen: "6.7 pulgadas",
    },
    stock: 1,
    featured: true,
    createdAt: new Date().toISOString(),
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
    images: ["/placeholder.svg?height=400&width=400&text=MacBook+Air+M2"],
    specifications: {
      processor: "Apple M2",
      memory: "8GB",
      storage: "256GB SSD",
      screen: "13.6 pulgadas",
    },
    stock: 1,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: 'iPad Pro 12.9"',
    description: "iPad Pro con chip M2 y pantalla Liquid Retina XDR",
    price: 800000,
    originalPrice: 900000,
    priceUSD: 799,
    category: "ipad",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPad+Pro"],
    specifications: {
      processor: "Apple M2",
      storage: "128GB",
      screen: "12.9 pulgadas",
      connectivity: "Wi-Fi",
    },
    stock: 1,
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Apple Watch Series 9",
    description: "El Apple Watch más avanzado con pantalla más brillante",
    price: 450000,
    originalPrice: 500000,
    priceUSD: 399,
    category: "watch",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=Apple+Watch+Series+9"],
    specifications: {
      size: "45mm",
      color: "Medianoche",
      connectivity: "GPS + Cellular",
      battery: "Hasta 18 horas",
    },
    stock: 1,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "AirPods Pro (2ª generación)",
    description: "Cancelación activa de ruido de nueva generación",
    price: 280000,
    originalPrice: 320000,
    priceUSD: 249,
    category: "airpods",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=AirPods+Pro"],
    specifications: {
      connectivity: "Bluetooth 5.3",
      battery: "Hasta 6 horas",
      features: "Cancelación activa de ruido",
      case: "Estuche de carga MagSafe",
    },
    stock: 1,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Cable Lightning a USB-C",
    description: "Cable oficial Apple para carga rápida",
    price: 25000,
    originalPrice: 30000,
    priceUSD: 29,
    category: "accesorios",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=Cable+Lightning"],
    specifications: {
      length: "1 metro",
      compatibility: "iPhone, iPad",
      features: "Carga rápida",
      material: "Cable trenzado",
    },
    stock: 1,
    featured: false,
    createdAt: new Date().toISOString(),
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

      // Intentar cargar desde la API primero
      try {
        console.log("Loading products from API...")
        const response = await fetch("/api/admin/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const result = await response.json()
          console.log("API response:", result)

          if (result.data && Array.isArray(result.data)) {
            const transformedProducts = result.data.map(transformSupabaseProduct)
            console.log("Transformed products:", transformedProducts)
            setProducts(transformedProducts)
            return
          }
        } else {
          console.warn("API response not ok:", response.status, response.statusText)
        }
      } catch (apiError) {
        console.warn("API not available, trying direct Supabase connection:", apiError)
      }

      // Fallback a conexión directa con Supabase
      console.log("Trying direct Supabase connection...")
      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      const transformedProducts = data?.map(transformSupabaseProduct) || []
      console.log("Direct Supabase products:", transformedProducts)
      setProducts(transformedProducts)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
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

  // Función para agregar producto usando la API
  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    try {
      console.log("ProductContext: Adding product:", productData)

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()
      console.log("ProductContext: API response:", result)

      if (!response.ok) {
        throw new Error(result.error || `Error HTTP ${response.status}`)
      }

      if (!result.data) {
        throw new Error("No se recibieron datos del producto creado")
      }

      console.log("ProductContext: Product added successfully:", result.data)
      showToast("Producto agregado exitosamente", "success")

      // Recargar productos para mostrar el nuevo
      await loadProducts()
      return true
    } catch (err) {
      console.error("ProductContext: Error adding product:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      showToast(`Error al agregar producto: ${errorMessage}`, "error")
      setError(errorMessage)
      return false
    }
  }

  // Función para actualizar producto usando la API
  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    try {
      console.log("ProductContext: Updating product:", { id, productData })

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()
      console.log("ProductContext: Update API response:", result)

      if (!response.ok) {
        throw new Error(result.error || `Error HTTP ${response.status}`)
      }

      console.log("ProductContext: Product updated successfully:", result.data)
      showToast("Producto actualizado exitosamente", "success")

      // Recargar productos para mostrar los cambios
      await loadProducts()
      return true
    } catch (err) {
      console.error("ProductContext: Error updating product:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      showToast(`Error al actualizar producto: ${errorMessage}`, "error")
      setError(errorMessage)
      return false
    }
  }

  // Función para eliminar producto usando la API
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      console.log("ProductContext: Deleting product:", id)

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("ProductContext: Delete API response:", result)

      if (!response.ok) {
        throw new Error(result.error || `Error HTTP ${response.status}`)
      }

      console.log("ProductContext: Product deleted successfully")
      showToast("Producto eliminado exitosamente", "success")

      // Recargar productos para reflejar la eliminación
      await loadProducts()
      return true
    } catch (err) {
      console.error("ProductContext: Error deleting product:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      showToast(`Error al eliminar producto: ${errorMessage}`, "error")
      setError(errorMessage)
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
