import { ProductAdminService } from "@/lib/supabase-admin"
import type { ProductRow } from "@/types/database"
import type { CatalogProductsResponse, ProductSummary } from "@/types/product"

type CacheState = {
  data: ProductRow[] | null
  expiresAt: number
  fetchedAt: number
  inFlight: Promise<ProductRow[]> | null
}

type GlobalWithCache = typeof globalThis & {
  __TUIPHONE_PRODUCTS_CACHE__?: CacheState
}

const DEFAULT_TTL_MS = 30_000

const getCacheTtl = (): number => {
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
      inFlight: null,
    }
  }

  return globalObject.__TUIPHONE_PRODUCTS_CACHE__
}

export const invalidateProductsCache = (): void => {
  const cache = resolveCacheState()
  cache.data = null
  cache.expiresAt = 0
  cache.fetchedAt = 0
}

export type GetProductsOptions = {
  force?: boolean
}

type ProductsSnapshot = {
  data: ProductRow[]
  fetchedAt: number
}

const fetchAndStoreProducts = async (cache: CacheState): Promise<ProductRow[]> => {
  const { data, error } = await ProductAdminService.getAllProducts()

  if (error) {
    throw error instanceof Error ? error : new Error("Unable to load products from Supabase")
  }

  const products = data ?? []
  cache.data = products
  cache.fetchedAt = Date.now()
  cache.expiresAt = cache.fetchedAt + getCacheTtl()
  return products
}

export const getProductsSnapshot = async ({ force = false }: GetProductsOptions = {}): Promise<ProductsSnapshot> => {
  const cache = resolveCacheState()
  const now = Date.now()

  if (!force && cache.data && cache.expiresAt > now) {
    return { data: cache.data, fetchedAt: cache.fetchedAt }
  }

  if (cache.inFlight) {
    await cache.inFlight
    return { data: cache.data ?? [], fetchedAt: cache.fetchedAt }
  }

  const fetchPromise = fetchAndStoreProducts(cache)
  cache.inFlight = fetchPromise

  try {
    const data = await fetchPromise
    return { data, fetchedAt: cache.fetchedAt }
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

const mapRowToSummary = (row: ProductRow): ProductSummary => ({
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

export type CatalogQueryOptions = {
  limit?: number
  offset?: number
  force?: boolean
}

export const getCatalogProducts = async ({
  limit = 12,
  offset = 0,
  force = false,
}: CatalogQueryOptions = {}): Promise<CatalogProductsResponse> => {
  const snapshot = await getProductsSnapshot({ force })
  const { data, fetchedAt } = snapshot
  const total = data.length

  const normalizedOffset = Math.max(0, Number.isFinite(offset) ? offset : 0)
  const normalizedLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 12, 60))

  const slice = data.slice(normalizedOffset, normalizedOffset + normalizedLimit)
  const items = slice.map(mapRowToSummary)

  return {
    items,
    total,
    supabaseConnected: true,
    timestamp: fetchedAt,
  }
}
