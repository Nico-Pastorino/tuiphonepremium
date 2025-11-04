import { ProductAdminService } from "@/lib/supabase-admin"
import type { ProductRow } from "@/types/database"
import type { CatalogProductsResponse, ProductSummary } from "@/types/product"

type ProductsSnapshot = {
  data: ProductRow[]
  fetchedAt: number
  connected: boolean
}

type CacheState = {
  data: ProductRow[] | null
  expiresAt: number
  fetchedAt: number
  connected: boolean
  inFlight: Promise<ProductsSnapshot> | null
}

type GlobalWithCache = typeof globalThis & {
  __TUIPHONE_PRODUCTS_CACHE__?: CacheState
}

const DEFAULT_TTL_MS = 300_000
const MAX_LIMIT = 60
const CATEGORY_PRIORITY_ORDER = ["iphone", "ipad", "mac", "watch", "airpods", "accesorios"]
const CATEGORY_PRIORITY = new Map(CATEGORY_PRIORITY_ORDER.map((value, index) => [value, index]))
const CONDITION_PRIORITY = new Map<"nuevo" | "seminuevo", number>([
  ["nuevo", 0],
  ["seminuevo", 1],
])

const getCacheTtlMs = (): number => {
  const raw = process.env.PRODUCTS_CACHE_TTL_MS
  if (!raw) {
    return DEFAULT_TTL_MS
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TTL_MS
  }

  return parsed
}

const resolveCacheState = (): CacheState => {
  const globalObject = globalThis as GlobalWithCache
  if (!globalObject.__TUIPHONE_PRODUCTS_CACHE__) {
    globalObject.__TUIPHONE_PRODUCTS_CACHE__ = {
      data: null,
      expiresAt: 0,
      fetchedAt: 0,
      connected: false,
      inFlight: null,
    }
  }

  return globalObject.__TUIPHONE_PRODUCTS_CACHE__
}

const resetCacheState = (cache: CacheState): void => {
  cache.data = null
  cache.expiresAt = 0
  cache.fetchedAt = 0
  cache.connected = false
  cache.inFlight = null
}

const updateCacheState = (cache: CacheState, snapshot: ProductsSnapshot): void => {
  cache.data = snapshot.data
  cache.fetchedAt = snapshot.fetchedAt
  cache.connected = snapshot.connected
  cache.expiresAt = snapshot.fetchedAt + getCacheTtlMs()
}

export const invalidateProductsCache = async (): Promise<void> => {
  const cache = resolveCacheState()
  resetCacheState(cache)
}

export type GetProductsOptions = {
  force?: boolean
}

const fetchProductsSnapshot = async (): Promise<ProductsSnapshot> => {
  const allProducts: ProductRow[] = []
  const pageSize = 200
  let offset = 0
  let connected = false

  while (true) {
    const { data, error } = await ProductAdminService.getAllProducts({ limit: pageSize, offset })

    if (error) {
      throw error instanceof Error ? error : new Error("Unable to load products from Supabase")
    }

    const chunk = data ?? []
    connected = true
    if (chunk.length > 0) {
      allProducts.push(...chunk)
    }

    if (chunk.length < pageSize) {
      break
    }

    offset += chunk.length
  }

  const fetchedAt = Date.now()
  return { data: allProducts, fetchedAt, connected }
}

export const getProductsSnapshot = async ({ force = false }: GetProductsOptions = {}): Promise<ProductsSnapshot> => {
  const cache = resolveCacheState()
  const now = Date.now()

  if (!force && cache.data && cache.expiresAt > now) {
    return { data: cache.data, fetchedAt: cache.fetchedAt, connected: cache.connected }
  }

  if (force) {
    resetCacheState(cache)
    const snapshot = await fetchProductsSnapshot()
    updateCacheState(cache, snapshot)
    return snapshot
  }

  if (cache.inFlight) {
    return cache.inFlight
  }

  const fetchPromise = fetchProductsSnapshot()
  cache.inFlight = fetchPromise

  try {
    const snapshot = await fetchPromise
    updateCacheState(cache, snapshot)
    return snapshot
  } finally {
    if (cache.inFlight === fetchPromise) {
      cache.inFlight = null
    }
  }
}

export const getProductsCached = async (options?: GetProductsOptions): Promise<ProductRow[]> => {
  const snapshot = await getProductsSnapshot(options)
  return snapshot.data
}

const normalizeCondition = (condition: string | null): "nuevo" | "seminuevo" => {
  const normalized = condition?.trim().toLowerCase() ?? ""
  if (normalized.length === 0) return "nuevo"

  const sanitized = normalized.replace(/\s+/g, "")
  const semiIndicators = ["semi", "usado", "reacond", "refurb", "abierto", "demo"]
  if (semiIndicators.some((indicator) => sanitized.includes(indicator))) {
    return "seminuevo"
  }

  return "nuevo"
}

export const toProductSummary = (row: ProductRow): ProductSummary => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  category: row.category,
  condition: normalizeCondition(row.condition),
  price: row.price,
  originalPrice: row.original_price ?? null,
  priceUSD: row.price_usd ?? null,
  images: row.images ?? [],
  stock: row.stock,
  featured: row.featured,
  createdAt: row.created_at,
})

const applyFilters = (
  rows: ProductRow[],
  filters: { category?: string | null; condition?: string | null; featured?: boolean | null },
): ProductRow[] => {
  const normalizedCategory = filters.category?.toLowerCase() ?? null
  const normalizedCondition = filters.condition ? normalizeCondition(filters.condition) : null
  const normalizedFeatured = typeof filters.featured === "boolean" ? filters.featured : null

  if (!normalizedCategory && !normalizedCondition && normalizedFeatured === null) {
    return rows
  }

  return rows.filter((row) => {
    const categoryMatches = !normalizedCategory || row.category.toLowerCase() === normalizedCategory
    const conditionMatches = !normalizedCondition || normalizeCondition(row.condition) === normalizedCondition
    const featuredMatches = normalizedFeatured === null || row.featured === normalizedFeatured
    return categoryMatches && conditionMatches && featuredMatches
  })
}

export type CatalogQueryOptions = {
  limit?: number
  offset?: number
  force?: boolean
  category?: string | null
  condition?: string | null
  featured?: boolean | null
}

export const getCatalogProducts = async ({
  limit = 12,
  offset = 0,
  force = false,
  category = null,
  condition = null,
  featured = null,
}: CatalogQueryOptions = {}): Promise<CatalogProductsResponse> => {
  const snapshot = await getProductsSnapshot({ force })
  const { data, fetchedAt, connected } = snapshot

  const filtered = applyFilters(data, { category, condition, featured })
  const normalizedOffset = Math.max(0, Number.isFinite(offset) ? offset : 0)
  const normalizedLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 12, MAX_LIMIT))

  const sorted = filtered.slice().sort((a, b) => {
    const conditionPriorityA = CONDITION_PRIORITY.get(normalizeCondition(a.condition)) ?? CONDITION_PRIORITY.size
    const conditionPriorityB = CONDITION_PRIORITY.get(normalizeCondition(b.condition)) ?? CONDITION_PRIORITY.size
    if (conditionPriorityA !== conditionPriorityB) {
      return conditionPriorityA - conditionPriorityB
    }

    const priceA = Number.isFinite(a.price) ? a.price : 0
    const priceB = Number.isFinite(b.price) ? b.price : 0
    if (priceA !== priceB) {
      return priceB - priceA
    }

    const priorityA = CATEGORY_PRIORITY.get(a.category.toLowerCase()) ?? CATEGORY_PRIORITY.size
    const priorityB = CATEGORY_PRIORITY.get(b.category.toLowerCase()) ?? CATEGORY_PRIORITY.size
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const slice = sorted.slice(normalizedOffset, normalizedOffset + normalizedLimit)
  const items = slice.map(toProductSummary)

  return {
    items,
    total: filtered.length,
    supabaseConnected: connected,
    timestamp: fetchedAt,
  }
}
