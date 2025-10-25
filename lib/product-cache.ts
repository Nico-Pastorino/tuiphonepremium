import { revalidateTag, unstable_cache } from "next/cache"

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

export const PRODUCTS_CACHE_TAG = "products"

const PRODUCTS_CACHE_KEY = "products-snapshot"
const DEFAULT_TTL_MS = 30_000
const MAX_LIMIT = 60

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

const getCacheTtlSeconds = (): number => Math.max(1, Math.floor(getCacheTtlMs() / 1000))

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
  await revalidateTag(PRODUCTS_CACHE_TAG)
}

export type GetProductsOptions = {
  force?: boolean
}

const fetchProductsSnapshot = async (): Promise<ProductsSnapshot> => {
  const { data, error } = await ProductAdminService.getAllProducts()

  if (error) {
    throw error instanceof Error ? error : new Error("Unable to load products from Supabase")
  }

  const products = data ?? []
  const fetchedAt = Date.now()
  return { data: products, fetchedAt, connected: true }
}

const cachedProductsSnapshot = unstable_cache(fetchProductsSnapshot, [PRODUCTS_CACHE_KEY], {
  revalidate: getCacheTtlSeconds(),
  tags: [PRODUCTS_CACHE_TAG],
})

export const getProductsSnapshot = async ({ force = false }: GetProductsOptions = {}): Promise<ProductsSnapshot> => {
  const cache = resolveCacheState()
  const now = Date.now()

  if (!force && cache.data && cache.expiresAt > now) {
    return { data: cache.data, fetchedAt: cache.fetchedAt, connected: cache.connected }
  }

  if (force) {
    resetCacheState(cache)
    await revalidateTag(PRODUCTS_CACHE_TAG)
    const snapshot = await fetchProductsSnapshot()
    updateCacheState(cache, snapshot)
    return snapshot
  }

  if (cache.inFlight) {
    return cache.inFlight
  }

  const fetchPromise = cachedProductsSnapshot()
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

export const toProductSummary = (row: ProductRow): ProductSummary => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  category: row.category,
  condition: row.condition === "nuevo" ? "nuevo" : "seminuevo",
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
  filters: { category?: string | null; condition?: string | null },
): ProductRow[] => {
  const normalizedCategory = filters.category?.toLowerCase() ?? null
  const normalizedCondition = filters.condition?.toLowerCase() ?? null

  if (!normalizedCategory && !normalizedCondition) {
    return rows
  }

  return rows.filter((row) => {
    const categoryMatches = !normalizedCategory || row.category.toLowerCase() === normalizedCategory
    const conditionMatches = !normalizedCondition || row.condition.toLowerCase() === normalizedCondition
    return categoryMatches && conditionMatches
  })
}

export type CatalogQueryOptions = {
  limit?: number
  offset?: number
  force?: boolean
  category?: string | null
  condition?: string | null
}

export const getCatalogProducts = async ({
  limit = 12,
  offset = 0,
  force = false,
  category = null,
  condition = null,
}: CatalogQueryOptions = {}): Promise<CatalogProductsResponse> => {
  const snapshot = await getProductsSnapshot({ force })
  const { data, fetchedAt, connected } = snapshot

  const filtered = applyFilters(data, { category, condition })
  const normalizedOffset = Math.max(0, Number.isFinite(offset) ? offset : 0)
  const normalizedLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 12, MAX_LIMIT))

  const slice = filtered.slice(normalizedOffset, normalizedOffset + normalizedLimit)
  const items = slice.map(toProductSummary)

  return {
    items,
    total: filtered.length,
    supabaseConnected: connected,
    timestamp: fetchedAt,
  }
}
