"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react"
import type {
  Product,
  ProductFormData,
  ProductFilters,
} from "@/types/product"
import type { ProductRow } from "@/types/database"
import { useAdmin } from "@/contexts/AdminContext"

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
    isOutlet: Boolean(row.is_outlet),
    outletNotes: row.outlet_notes ?? null,
    outletDefects: row.outlet_defects ?? [],
    outletBatteryPercent: row.outlet_battery_percent ?? null,
    outletGrade: row.outlet_grade ?? null,
    outletWarrantyDays: row.outlet_warranty_days ?? null,
    outletAccessories: row.outlet_accessories ?? null,
    outletDisplayIssues: row.outlet_display_issues ?? null,
    outletCaseIssues: row.outlet_case_issues ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }
}

function mapProducts(rows?: ProductRow[]): Product[] {
  return (rows ?? []).map(transformSupabaseProduct)
}

const API_TIMEOUT_MS = 12_000
const API_MAX_ATTEMPTS = 2
const API_RETRY_DELAY_MS = 300
const CLIENT_DATA_TTL_MS = 5 * 60 * 1000
const CACHE_KEY = "tuiphone_products_cache_v1"
const CACHE_TTL_MS = 1000 * 60 * 5

type FetchInput = Parameters<typeof fetch>[0]
type FetchInit = Parameters<typeof fetch>[1]

type ProductsCachePayload = {
  products: Product[]
  supabaseConnected: boolean
  timestamp: number
}

type InitialProductsPayload = {
  products: ProductRow[]
  supabaseConnected: boolean
  timestamp: number
}

type ProductProviderProps = {
  children: React.ReactNode
  initialData?: InitialProductsPayload | null
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

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, source: string): Promise<T> => {
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

export function ProductProvider({ children, initialData = null }: ProductProviderProps) {
  const { isAuthenticated } = useAdmin()
  const initialProducts = useMemo(() => (initialData ? mapProducts(initialData.products) : []), [initialData])
  const initialSupabaseConnected = initialData?.supabaseConnected ?? false
  const [products, setProducts] = useState<Product[]>(() => initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(initialSupabaseConnected)
  const supabaseConnectedRef = useRef(initialSupabaseConnected)
  const productsRef = useRef<Product[]>(initialProducts)
  const cacheHydratedRef = useRef(initialProducts.length > 0)
  const initialPersistedRef = useRef(false)
  const storageAvailableRef = useRef(true)
  const storageDisabledLoggedRef = useRef(false)
  const lastUpdateRef = useRef(initialData?.timestamp ?? (initialProducts.length > 0 ? Date.now() : 0))

  const updateSupabaseState = useCallback((value: boolean) => {
    setSupabaseConnected(value)
    supabaseConnectedRef.current = value
  }, [])

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" = "success") => {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }, [])

  const updateProductsState = useCallback(
    (productsList: Product[], connected: boolean, persist = true, updatedAt?: number) => {
      setProducts(productsList)
      productsRef.current = productsList
      lastUpdateRef.current = updatedAt ?? Date.now()
      updateSupabaseState(connected)

      if (persist && storageAvailableRef.current && typeof window !== "undefined") {
        try {
          const payload: ProductsCachePayload = {
            products: productsList,
            supabaseConnected: connected,
            timestamp: lastUpdateRef.current,
          }
          const serialized = JSON.stringify(payload)
          if (serialized.length > 2_500_000) {
            storageAvailableRef.current = false
            window.localStorage.removeItem(CACHE_KEY)
            if (!storageDisabledLoggedRef.current) {
              console.warn("Cache de productos desactivada: el tamaño excede el limite permitido en localStorage")
              storageDisabledLoggedRef.current = true
            }
            return
          }
          window.localStorage.setItem(CACHE_KEY, serialized)
        } catch (error) {
          storageAvailableRef.current = false
          if (!storageDisabledLoggedRef.current) {
            console.warn("No se pudo guardar la cache de productos. Se deshabilita el almacenamiento local:", error)
            storageDisabledLoggedRef.current = true
          }
        }
      }
    },
    [updateSupabaseState],
  )

  useEffect(() => {
    if (initialProducts.length === 0 || initialPersistedRef.current) {
      return
    }
    initialPersistedRef.current = true

    updateProductsState(initialProducts, initialSupabaseConnected, false, initialData?.timestamp)
  }, [initialProducts, initialSupabaseConnected, initialData?.timestamp, updateProductsState])

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

    updateProductsState(cached.products, cached.supabaseConnected, false, cached.timestamp)
    updateSupabaseState(cached.supabaseConnected)
    setLoading(false)
  }, [updateProductsState, updateSupabaseState])

  const loadProducts = useCallback(
    async ({ force = false }: { force?: boolean; preferAdmin?: boolean } = {}) => {
      const hasExistingProducts = productsRef.current.length > 0
      const lastUpdated = lastUpdateRef.current
      const isReliableData = supabaseConnectedRef.current
      if (!force && hasExistingProducts && isReliableData && lastUpdated > 0 && Date.now() - lastUpdated < CLIENT_DATA_TTL_MS) {
        return
      }

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

      const adminParams = new URLSearchParams({
        limit: "24",
        offset: "0",
      })
      if (force) {
        adminParams.set("refresh", "1")
      }
      const adminUrl = `/api/admin/products?${adminParams.toString()}`
      // Evita no-store en lecturas normales para permitir cache de red y reducir requests repetidas.
      const readCacheMode: RequestCache = force ? "no-store" : "default"

      const fetchFromAdmin = async (attempt = 1): Promise<Product[]> => {
        try {
          const response = await fetchWithTimeout(adminUrl, { cache: readCacheMode }, API_TIMEOUT_MS, "Admin API")
          const result = (await response.json()) as ApiListResponse

          if (!response.ok) {
            throw new Error(result?.error || `API responded with status ${response.status}`)
          }

          return mapProducts(result.data)
        } catch (error) {
          if (attempt < API_MAX_ATTEMPTS) {
            console.warn(`Retrying product API fetch (attempt ${attempt + 1})`, error)
            await sleep(API_RETRY_DELAY_MS * attempt)
            return fetchFromAdmin(attempt + 1)
          }
          throw error
        }
      }

      try {
        const productsList = await fetchFromAdmin()
        updateProductsState(productsList, true)
        updateSupabaseState(true)
        clearLoading()
      } catch (err) {
        console.error("Error loading products:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
        if (!hasExistingProducts) {
          setProducts([])
          productsRef.current = []
        }
        updateSupabaseState(false)
        showToast("No se pudieron cargar los productos. Verifica la configuracion remota.", "warning")
      } finally {
        clearLoading()
      }
    },
    [showToast, updateProductsState, updateSupabaseState],
  )

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

      if (result.data) {
        const nextProduct = transformSupabaseProduct(result.data)
        const nextProducts = [nextProduct, ...productsRef.current.filter((item) => item.id !== nextProduct.id)]
        updateProductsState(nextProducts, true)
      }
      handleSuccess("Producto agregado exitosamente")
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

      if (result.data) {
        const nextProduct = transformSupabaseProduct(result.data)
        const nextProducts = productsRef.current.some((item) => item.id === nextProduct.id)
          ? productsRef.current.map((item) => (item.id === nextProduct.id ? nextProduct : item))
          : [nextProduct, ...productsRef.current]
        updateProductsState(nextProducts, true)
      }
      handleSuccess("Producto actualizado exitosamente")
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

      updateProductsState(productsRef.current.filter((item) => item.id !== id), true)
      handleSuccess("Producto eliminado exitosamente")
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

      try {
        const response = await fetchWithTimeout(
          `/api/admin/products/${id}`,
          { cache: "default" },
          API_TIMEOUT_MS,
          "Admin product API",
        )

        if (response.status === 404) {
          return null
        }

        const result = (await response.json()) as { data?: ProductRow; error?: string }

        if (!response.ok || !result.data) {
          throw new Error(result?.error || `Admin API responded with status ${response.status}`)
        }

        const product = transformSupabaseProduct(result.data)
        const updatedProducts = [...productsRef.current.filter((item) => item.id !== id), product].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        updateProductsState(updatedProducts, true)
        updateSupabaseState(true)
        return product
      } catch (error) {
        console.error(`Error al obtener el producto ${id} desde la API de admin:`, error)
      }

      return null
    },
    [updateProductsState, updateSupabaseState],
  )

  const refreshProducts = async () => {
    if (!isAuthenticated) {
      return
    }
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
