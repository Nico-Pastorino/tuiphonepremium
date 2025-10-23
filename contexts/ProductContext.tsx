"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { Product, ProductFormData, ProductFilters } from "@/types/product"
import type { ProductRow } from "@/types/database"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type ApiListResponse = { data?: ProductRow[]; error?: string }

type ApiItemResponse = { data?: ProductRow; error?: string }

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
    originalPrice: row.original_price ?? undefined,
    priceUSD: row.price_usd ?? undefined,
    category: row.category,
    condition: row.condition === "nuevo" ? "nuevo" : "seminuevo",
    images: row.images ?? [],
    specifications: normalizeSpecifications(row.specifications),
    stock: row.stock,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }
}

const fallbackProducts: Product[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "iPhone 15 Pro Max",
    description: "El iPhone mas avanzado con chip A17 Pro y camara de 48MP",
    price: 1_500_000,
    originalPrice: 1_600_000,
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
    id: "00000000-0000-0000-0000-000000000002",
    name: "MacBook Air M2",
    description: "Ultraportatil con chip M2 y pantalla Liquid Retina de 13.6 pulgadas",
    price: 1_200_000,
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
    id: "00000000-0000-0000-0000-000000000003",
    name: "iPad Pro 12.9\"",
    description: "iPad Pro con chip M2 y pantalla Liquid Retina XDR",
    price: 800_000,
    originalPrice: 900_000,
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

const FETCH_TIMEOUT_MS = 6000
const FALLBACK_DISPLAY_DELAY_MS = 2500
const CACHE_KEY = "tuiphone_products_cache_v1"
const CACHE_TTL_MS = 1000 * 60 * 5

type FetchInput = Parameters<typeof fetch>[0]
type FetchInit = Parameters<typeof fetch>[1]

type ProductsCachePayload = {
  products: Product[]
  supabaseConnected: boolean
  timestamp: number
}

const readProductsCache = (): ProductsCachePayload | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProductsCachePayload | null
    if (!parsed || !Array.isArray(parsed.products)) return null
    return parsed
  } catch (error) {
    console.warn("No se pudo leer la cache de productos:", error)
    return null
  }
}

const fetchWithTimeout = async (
  input: FetchInput,
  init: FetchInit = {},
  timeoutMs = FETCH_TIMEOUT_MS,
  source: string,
): Promise<Response> => {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timeout al solicitar productos desde ${source}`)
    }
    if ((error as { name?: string })?.name === "AbortError") {
      throw new Error(`Timeout al solicitar productos desde ${source}`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, source: string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout al solicitar productos desde ${source}`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const productsRef = useRef<Product[]>([])
  const cacheHydratedRef = useRef(false)

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" = "success") => {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }, [])

  const mapProducts = (rows?: ProductRow[]): Product[] => (rows ?? []).map(transformSupabaseProduct)

  const updateProductsState = useCallback(
    (productsList: Product[], connected: boolean, persist = true) => {
      setProducts(productsList)
      productsRef.current = productsList

      if (persist && typeof window !== "undefined") {
        try {
          const payload: ProductsCachePayload = {
            products: productsList,
            supabaseConnected: connected,
            timestamp: Date.now(),
          }
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
        } catch (error) {
          console.warn("No se pudo guardar la cache de productos:", error)
        }
      }
    },
    [],
  )

  const hydrateFromCache = useCallback(() => {
    if (cacheHydratedRef.current || typeof window === "undefined") {
      return
    }

    const cached = readProductsCache()
    cacheHydratedRef.current = true

    if (!cached) {
      return
    }

    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS
    if (!isFresh) {
      window.localStorage.removeItem(CACHE_KEY)
      return
    }

    updateProductsState(cached.products, cached.supabaseConnected, false)
    setSupabaseConnected(cached.supabaseConnected)
    setLoading(false)
  }, [updateProductsState])

  const loadProducts = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const hasExistingProducts = productsRef.current.length > 0
      if (force || !hasExistingProducts) {
        setLoading(true)
      }
      setError(null)

      type SourceName = "api" | "supabase"
      type SourceResult = { source: SourceName; products: Product[] }
      const supabaseConfigured = isSupabaseConfigured()

      let fallbackTimer: ReturnType<typeof setTimeout> | null = null
      const clearFallbackTimer = () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer)
          fallbackTimer = null
        }
      }

      if (!hasExistingProducts) {
        fallbackTimer = setTimeout(() => {
          console.info("Mostrando productos de respaldo mientras se completa la carga remota.")
          updateProductsState(fallbackProducts, false, false)
          setLoading(false)
        }, FALLBACK_DISPLAY_DELAY_MS)
      }

      const fetchFromApi = async (): Promise<SourceResult> => {
        const response = await fetchWithTimeout(
          "/api/admin/products",
          { cache: "no-store" },
          FETCH_TIMEOUT_MS,
          "API",
        )
        const result = (await response.json()) as ApiListResponse

        if (!response.ok) {
          throw new Error(result?.error || `API responded with status ${response.status}`)
        }

        return { source: "api", products: mapProducts(result.data) }
      }

      const fetchFromSupabase = async (): Promise<SourceResult> => {
        const { data, error: supabaseError } = await withTimeout(
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          FETCH_TIMEOUT_MS,
          "Supabase",
        )

        if (supabaseError) {
          throw supabaseError
        }

        return { source: "supabase", products: mapProducts(data ?? []) }
      }

      try {
        const errors: Array<{ source: SourceName; error: unknown }> = []
        let firstResult: SourceResult | null = null
        let apiResult: SourceResult | null = null
        let supabaseResult: SourceResult | null = null

        const captureResult = (result: SourceResult) => {
          if (result.source === "api") {
            apiResult = result
          } else {
            supabaseResult = result
          }

          const connected = Boolean(apiResult || supabaseResult)

          if (!firstResult) {
            firstResult = result
            updateProductsState(result.products, connected)
            setLoading(false)
            clearFallbackTimer()
          } else if (result.source === "supabase") {
            // Prefer direct Supabase data cuando este disponible.
            updateProductsState(result.products, connected)
            clearFallbackTimer()
          }

          setSupabaseConnected(connected)
        }

        const tasks: Array<Promise<void>> = [
          (async () => {
            try {
              const result = await fetchFromApi()
              captureResult(result)
            } catch (error) {
              console.warn("Failed to load products from API:", error)
              errors.push({ source: "api", error })
            }
          })(),
        ]

        if (supabaseConfigured) {
          tasks.push(
            (async () => {
              try {
                const result = await fetchFromSupabase()
                captureResult(result)
              } catch (error) {
                console.warn("Failed to load products directly from Supabase:", error)
                errors.push({ source: "supabase", error })
              }
            })(),
          )
        } else {
          console.info("Supabase no esta configurado. Omitiendo la carga directa.")
        }

        await Promise.all(tasks)

        if (!firstResult) {
          const fallbackError = errors[0]?.error
          throw fallbackError instanceof Error ? fallbackError : new Error("No se pudo cargar productos")
        }
      } catch (err) {
        console.error("Error loading products:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
        updateProductsState(fallbackProducts, false)
        setSupabaseConnected(false)
        showToast("Usando datos de ejemplo. Verifica la configuracion de Supabase.", "warning")
      } finally {
        clearFallbackTimer()
        setLoading(false)
      }
    },
    [showToast, updateProductsState],
  )

  useEffect(() => {
    hydrateFromCache()
    loadProducts()
  }, [hydrateFromCache, loadProducts])

  const handleSuccess = (message: string) => {
    showToast(message, "success")
  }

  const handleError = (action: string, err: unknown) => {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    setError(msg)
    showToast(`Error al ${action} producto: ${msg}`, "error")
    return false
  }

  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = (await response.json()) as ApiItemResponse

      if (!response.ok) {
        throw new Error(result.error || "Error al agregar producto")
      }

      handleSuccess("Producto agregado exitosamente")
      await loadProducts({ force: true })
      return true
    } catch (err) {
      return handleError("agregar", err)
    }
  }

  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const result = (await response.json()) as ApiItemResponse

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar producto")
      }

      handleSuccess("Producto actualizado exitosamente")
      await loadProducts({ force: true })
      return true
    } catch (err) {
      return handleError("actualizar", err)
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const result = (await response.json()) as ApiItemResponse

      if (!response.ok) {
        throw new Error(result.error || "Error al eliminar producto")
      }

      handleSuccess("Producto eliminado exitosamente")
      await loadProducts({ force: true })
      return true
    } catch (err) {
      return handleError("eliminar", err)
    }
  }

  const getProductById = (id: string): Product | undefined => products.find((product) => product.id === id)

  const getProductsByCategory = (category: string): Product[] => products.filter((product) => product.category === category)

  const getFeaturedProducts = (): Product[] => products.filter((product) => product.featured)

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
    await loadProducts({ force: true })
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
