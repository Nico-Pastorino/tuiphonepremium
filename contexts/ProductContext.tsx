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
  ensureProductById: (id: string) => Promise<Product | null>
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

const SUPABASE_TIMEOUT_MS = 10_000
const API_TIMEOUT_MS = 12_000
const API_MAX_ATTEMPTS = 2
const API_RETRY_DELAY_MS = 300
const CACHE_KEY = "tuiphone_products_cache_v1"
const CACHE_TTL_MS = 1000 * 60 * 5

type FetchInput = Parameters<typeof fetch>[0]
type FetchInit = Parameters<typeof fetch>[1]

type ProductsCachePayload = {
  products: Product[]
  supabaseConnected: boolean
  timestamp: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  timeoutMs = API_TIMEOUT_MS,
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

  const mapProducts = useCallback((rows?: ProductRow[]): Product[] => (rows ?? []).map(transformSupabaseProduct), [])

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
    }

    updateProductsState(cached.products, cached.supabaseConnected, false)
    setSupabaseConnected(cached.supabaseConnected)
    setLoading(false)
  }, [updateProductsState])

  const loadProducts = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const hasExistingProducts = productsRef.current.length > 0
      const shouldShowLoading = force || !hasExistingProducts
      if (shouldShowLoading) {
        setLoading(true)
      }
      setError(null)
      let loadingCleared = !shouldShowLoading
      const clearLoading = () => {
        if (!loadingCleared) {
          loadingCleared = true
          setLoading(false)
        }
      }

      type SourceName = "api" | "supabase"
      const supabaseConfigured = isSupabaseConfigured()

      const apiUrl = force ? "/api/admin/products?refresh=1" : "/api/admin/products"

      const fetchFromApi = async (attempt = 1): Promise<{ source: SourceName; products: Product[] }> => {
        try {
          const response = await fetchWithTimeout(apiUrl, { cache: "no-store" }, API_TIMEOUT_MS, "API")
          const result = (await response.json()) as ApiListResponse

          if (!response.ok) {
            throw new Error(result?.error || `API responded with status ${response.status}`)
          }

          return { source: "api" as const, products: mapProducts(result.data) }
        } catch (error) {
          if (attempt < API_MAX_ATTEMPTS) {
            console.warn(`Retrying product API fetch (attempt ${attempt + 1})`, error)
            await sleep(API_RETRY_DELAY_MS * attempt)
            return fetchFromApi(attempt + 1)
          }
          throw error
        }
      }

      const fetchFromSupabase = async () => {
        const { data, error: supabaseError } = await withTimeout(
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          SUPABASE_TIMEOUT_MS,
          "Supabase",
        )

        if (supabaseError) {
          throw supabaseError
        }

        return { source: "supabase" as const, products: mapProducts(data ?? []) }
      }

      try {
        const errors: Array<{ source: SourceName; error: unknown }> = []
        let resolvedSource: SourceName | null = null

        const recordError = (source: SourceName, error: unknown) => {
          console.warn(`Failed to load products from ${source}:`, error)
          errors.push({ source, error })
        }

        const applyResult = (source: SourceName, productsList: Product[], connected: boolean) => {
          if (source === "supabase" && productsList.length === 0) {
            console.warn("Supabase returned an empty product list. Waiting for API fallback before updating state.")
            return
          }

          const supabaseAlreadyApplied = resolvedSource === "supabase" && productsRef.current.length > 0
          if (source === "api" && supabaseAlreadyApplied) {
            return
          }

          resolvedSource = source
          updateProductsState(productsList, connected)
          setSupabaseConnected(connected)
          clearLoading()
        }

        const fetchPromises: Promise<void>[] = []

        if (supabaseConfigured) {
          fetchPromises.push(
            fetchFromSupabase()
              .then(({ products: productsList }) => applyResult("supabase", productsList, true))
              .catch((error) => recordError("supabase", error)),
          )
        } else {
          console.info("Supabase no esta configurado. Se intentara cargar desde la API.")
        }

        fetchPromises.push(
          fetchFromApi()
            .then(({ products: productsList }) => applyResult("api", productsList, false))
            .catch((error) => recordError("api", error)),
        )

        await Promise.all(fetchPromises)

        if (resolvedSource === null) {
          const fallbackError = errors[0]?.error
          throw fallbackError instanceof Error ? fallbackError : new Error("No se pudo cargar productos")
        }

      } catch (err) {
        console.error("Error loading products:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
        if (!hasExistingProducts) {
          setProducts([])
          productsRef.current = []
        }
        setSupabaseConnected(false)
        showToast("No se pudieron cargar los productos. Verifica la configuracion remota.", "warning")
      } finally {
        clearLoading()
      }
    },
    [mapProducts, showToast, updateProductsState],
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

  const ensureProductById = useCallback(
    async (id: string): Promise<Product | null> => {
      const existing = productsRef.current.find((item) => item.id === id)
      if (existing) {
        return existing
      }

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await withTimeout(
            supabase.from("products").select("*").eq("id", id).maybeSingle(),
            SUPABASE_TIMEOUT_MS,
            "Supabase",
          )

          if (error) {
            throw error
          }

          if (data) {
            const product = transformSupabaseProduct(data)
            const updatedProducts = [...productsRef.current.filter((item) => item.id !== id), product].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            updateProductsState(updatedProducts, true)
            setSupabaseConnected(true)
            return product
          }
        } catch (error) {
          console.warn(`No se pudo cargar el producto ${id} desde Supabase:`, error)
        }
      }

      try {
        const response = await fetchWithTimeout("/api/admin/products", { cache: "no-store" }, API_TIMEOUT_MS, "API")
        const result = (await response.json()) as ApiListResponse

        if (!response.ok) {
          throw new Error(result?.error || `API responded with status ${response.status}`)
        }

        const fallbackProduct = (result.data ? mapProducts(result.data) : []).find((item) => item.id === id) ?? null

        if (fallbackProduct) {
          const updatedProducts = [...productsRef.current.filter((item) => item.id !== id), fallbackProduct].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          updateProductsState(updatedProducts, false)
          setSupabaseConnected(false)
          return fallbackProduct
        }
      } catch (error) {
        console.error(`Error al obtener el producto ${id} desde la API:`, error)
      }

      return null
    },
    [mapProducts, updateProductsState, setSupabaseConnected],
  )

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
    ensureProductById,
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
