"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"
import type { Product } from "@/types/product"

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Omit<Product, "id">) => Promise<boolean>
  updateProduct: (id: string, product: Omit<Product, "id">) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Datos de fallback para cuando Supabase no esté disponible
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    description: "El iPhone más avanzado con titanio, cámara de 48MP y chip A17 Pro",
    price: 1299000,
    priceUsd: 1299,
    originalPrice: 1399000,
    category: "iphone",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=iPhone+15+Pro+Max"],
    specifications: {
      Almacenamiento: "256GB",
      Color: "Titanio Natural",
      Pantalla: "6.7 pulgadas",
      Cámara: "48MP + 12MP + 12MP",
    },
    featured: true,
    stock: 1,
  },
  {
    id: "2",
    name: 'MacBook Air M2 13"',
    description: "Ultraportátil con chip M2, perfecta para trabajo y estudio",
    price: 899000,
    priceUsd: 899,
    originalPrice: 999000,
    category: "mac",
    condition: "nuevo",
    images: ["/placeholder.svg?height=400&width=400&text=MacBook+Air+M2"],
    specifications: {
      Procesador: "Apple M2",
      RAM: "8GB",
      Almacenamiento: "256GB SSD",
      Pantalla: "13.6 pulgadas Liquid Retina",
    },
    featured: true,
    stock: 1,
  },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false)

  useEffect(() => {
    initializeProducts()
  }, [])

  const initializeProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      // Verificar si Supabase está configurado y disponible
      const configured = isSupabaseConfigured()
      if (!configured) {
        console.warn("Supabase not configured, using fallback data")
        setProducts(fallbackProducts)
        setIsSupabaseAvailable(false)
        setLoading(false)
        return
      }

      // Intentar conectar a Supabase
      const connected = await testSupabaseConnection()
      if (!connected) {
        console.warn("Supabase connection failed, using fallback data")
        setProducts(fallbackProducts)
        setIsSupabaseAvailable(false)
        setLoading(false)
        return
      }

      // Si llegamos aquí, Supabase está disponible
      setIsSupabaseAvailable(true)
      await fetchProducts()
    } catch (err) {
      console.error("Error initializing products:", err)
      setError("Error al cargar productos")
      setProducts(fallbackProducts)
      setIsSupabaseAvailable(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    if (!isSupabaseAvailable) {
      setProducts(fallbackProducts)
      return
    }

    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
        setProducts(fallbackProducts)
        return
      }

      setProducts(data || [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setProducts(fallbackProducts)
    }
  }

  const addProduct = async (productData: Omit<Product, "id">): Promise<boolean> => {
    if (!isSupabaseAvailable) {
      // Simular agregar producto en modo fallback
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        stock: 1, // Siempre disponible
      }
      setProducts((prev) => [newProduct, ...prev])
      return true
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...productData, stock: 1 }])
        .select()
        .single()

      if (error) {
        console.error("Error adding product:", error)
        setError("Error al agregar producto")
        return false
      }

      setProducts((prev) => [data, ...prev])
      return true
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error al agregar producto")
      return false
    }
  }

  const updateProduct = async (id: string, productData: Omit<Product, "id">): Promise<boolean> => {
    if (!isSupabaseAvailable) {
      // Simular actualizar producto en modo fallback
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...productData, id, stock: 1 } : p)))
      return true
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...productData, stock: 1 })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating product:", error)
        setError("Error al actualizar producto")
        return false
      }

      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
      return true
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Error al actualizar producto")
      return false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!isSupabaseAvailable) {
      // Simular eliminar producto en modo fallback
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return true
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Error deleting product:", error)
        setError("Error al eliminar producto")
        return false
      }

      setProducts((prev) => prev.filter((p) => p.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Error al eliminar producto")
      return false
    }
  }

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id)
  }

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter((p) => p.category === category)
  }

  const refreshProducts = async () => {
    await fetchProducts()
  }

  const value: ProductContextType = {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
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
