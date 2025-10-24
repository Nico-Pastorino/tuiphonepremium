import { ProductAdminService } from "@/lib/supabase-admin"
import type { ProductRow } from "@/types/database"

type CacheState = {
  data: ProductRow[] | null
  expiresAt: number
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
      inFlight: null,
    }
  }

  return globalObject.__TUIPHONE_PRODUCTS_CACHE__
}

export const invalidateProductsCache = (): void => {
  const cache = resolveCacheState()
  cache.data = null
  cache.expiresAt = 0
}

export type GetProductsOptions = {
  force?: boolean
}

export const getProductsCached = async ({ force = false }: GetProductsOptions = {}): Promise<ProductRow[]> => {
  const cache = resolveCacheState()
  const now = Date.now()

  if (!force && cache.data && cache.expiresAt > now) {
    return cache.data
  }

  if (cache.inFlight) {
    return cache.inFlight
  }

  const fetchPromise = (async () => {
    const { data, error } = await ProductAdminService.getAllProducts()

    if (error) {
      throw error instanceof Error ? error : new Error("Unable to load products from Supabase")
    }

    const products = data ?? []
    cache.data = products
    cache.expiresAt = Date.now() + getCacheTtl()
    return products
  })()

  cache.inFlight = fetchPromise

  try {
    return await fetchPromise
  } finally {
    if (cache.inFlight === fetchPromise) {
      cache.inFlight = null
    }
  }
}

