"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase, testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabase"
import type { Product, ProductFormData, ProductFilters } from "@/types/product"
import { fallbackProducts } from "@/data/fallback-products"
import { transformSupabaseProduct } from "@/lib/products"

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
          const result = await response.json()
          const transformedProducts = result.data?.map(transformSupabaseProduct) || []
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

      const transformedProducts = data?.map(transformSupabaseProduct) || []
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
