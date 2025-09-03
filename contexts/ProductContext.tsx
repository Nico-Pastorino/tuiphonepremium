"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Product } from "@/types/product"
import { testSupabaseConnection } from "@/lib/supabase"

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  supabaseConnected: boolean
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<boolean>
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  getFeaturedProducts: () => Product[]
  searchProducts: (query: string) => Product[]
  filterProducts: (category?: string, condition?: string) => Product[]
  refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Productos de fallback para desarrollo
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    description: "El iPhone más avanzado con chip A17 Pro y cámara de 48MP",
    price: 2500000,
    originalPrice: 2800000,
    priceUSD: 1200,
    category: "iphone",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPhone+15+Pro+Max"],
    specifications: {
      pantalla: "6.7 pulgadas Super Retina XDR",
      procesador: "A17 Pro",
      almacenamiento: "256GB",
      camara: "48MP + 12MP + 12MP",
    },
    stock: 1,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "iPad Air M2",
    description: "iPad Air con chip M2 para máximo rendimiento",
    price: 1800000,
    priceUSD: 850,
    category: "ipad",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPad+Air+M2"],
    specifications: {
      pantalla: "10.9 pulgadas Liquid Retina",
      procesador: "M2",
      almacenamiento: "128GB",
      conectividad: "Wi-Fi 6E",
    },
    stock: 1,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "MacBook Pro 14",
    description: "MacBook Pro con chip M3 Pro para profesionales",
    price: 4200000,
    priceUSD: 2000,
    category: "mac",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=MacBook+Pro+14"],
    specifications: {
      pantalla: "14.2 pulgadas Liquid Retina XDR",
      procesador: "M3 Pro",
      memoria: "18GB RAM",
      almacenamiento: "512GB SSD",
    },
    stock: 1,
    featured: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Apple Watch Series 9",
    description: "Apple Watch con chip S9 y pantalla más brillante",
    price: 850000,
    priceUSD: 400,
    category: "watch",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=Apple+Watch+Series+9"],
    specifications: {
      pantalla: "45mm Always-On Retina",
      procesador: "S9 SiP",
      conectividad: "GPS + Cellular",
      resistencia: "WR50",
    },
    stock: 1,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "AirPods Pro 2",
    description: "AirPods Pro con cancelación activa de ruido mejorada",
    price: 650000,
    priceUSD: 300,
    category: "accesorios",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=AirPods+Pro+2"],
    specifications: {
      audio: "Audio espacial personalizado",
      bateria: "Hasta 6 horas de reproducción",
      conectividad: "Bluetooth 5.3",
      resistencia: "IPX4",
    },
    stock: 1,
    featured: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    name: "iPhone 14 Seminuevo",
    description: "iPhone 14 en excelente estado, garantía incluida",
    price: 1800000,
    originalPrice: 2200000,
    priceUSD: 850,
    category: "iphone",
    condition: "seminuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPhone+14+Seminuevo"],
    specifications: {
      pantalla: "6.1 pulgadas Super Retina XDR",
      procesador: "A15 Bionic",
      almacenamiento: "128GB",
      camara: "12MP + 12MP",
    },
    stock: 1,
    featured: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("ProductContext: Testing Supabase connection...")
      const isConnected = await testSupabaseConnection()

      if (isConnected) {
        console.log("ProductContext: Fetching products from API...")
        const response = await fetch("/api/admin/products")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("ProductContext: API response:", data)

        if (Array.isArray(data) && data.length >= 0) {
          setProducts(data)
          setSupabaseConnected(true)
          console.log("ProductContext: Using Supabase data")
        } else {
          console.log("ProductContext: No data from API, using fallback")
          setProducts(fallbackProducts)
          setSupabaseConnected(false)
        }
      } else {
        console.log("ProductContext: Supabase not connected, using fallback")
        setProducts(fallbackProducts)
        setSupabaseConnected(false)
      }
    } catch (error) {
      console.error("ProductContext: Error fetching products:", error)
      setError("Error al cargar productos")
      setProducts(fallbackProducts)
      setSupabaseConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<boolean> => {
    try {
      console.log("ProductContext: Adding product:", productData)

      if (!supabaseConnected) {
        // Fallback local para desarrollo
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setProducts((prev) => [newProduct, ...prev])
        return true
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear producto")
      }

      const newProduct = await response.json()
      console.log("ProductContext: Product created:", newProduct)

      // Actualizar la lista de productos
      await refreshProducts()
      return true
    } catch (error) {
      console.error("ProductContext: Error adding product:", error)
      setError(error instanceof Error ? error.message : "Error al agregar producto")
      return false
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      console.log("ProductContext: Updating product:", id, productData)

      if (!supabaseConnected) {
        // Fallback local para desarrollo
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p)),
        )
        return true
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar producto")
      }

      const updatedProduct = await response.json()
      console.log("ProductContext: Product updated:", updatedProduct)

      // Actualizar la lista de productos
      await refreshProducts()
      return true
    } catch (error) {
      console.error("ProductContext: Error updating product:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar producto")
      return false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      console.log("ProductContext: Deleting product:", id)

      if (!supabaseConnected) {
        // Fallback local para desarrollo
        setProducts((prev) => prev.filter((p) => p.id !== id))
        return true
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar producto")
      }

      console.log("ProductContext: Product deleted successfully")

      // Actualizar la lista de productos
      await refreshProducts()
      return true
    } catch (error) {
      console.error("ProductContext: Error deleting product:", error)
      setError(error instanceof Error ? error.message : "Error al eliminar producto")
      return false
    }
  }

  const getFeaturedProducts = () => {
    return products.filter((product) => product.featured)
  }

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description?.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery),
    )
  }

  const filterProducts = (category?: string, condition?: string) => {
    return products.filter((product) => {
      const matchesCategory = !category || product.category === category
      const matchesCondition = !condition || product.condition === condition
      return matchesCategory && matchesCondition
    })
  }

  const value: ProductContextType = {
    products,
    loading,
    error,
    supabaseConnected,
    addProduct,
    updateProduct,
    deleteProduct,
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
