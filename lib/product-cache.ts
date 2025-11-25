import { revalidateTag, unstable_cache } from "next/cache"

import { ProductAdminService } from "@/lib/supabase-admin"
import type { ProductRow } from "@/types/database"
import type { CatalogProductsResponse, Product, ProductSummary } from "@/types/product"

type ProductsSnapshot = {
  data: ProductRow[]
  fetchedAt: number
  connected: boolean
}

const DEFAULT_TTL_MS = 300_000
const PRODUCTS_CACHE_TAG = "products-snapshot"
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

export const invalidateProductsCache = async (): Promise<void> => {
  await revalidateTag(PRODUCTS_CACHE_TAG)
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

const CACHE_TTL_SECONDS = Math.max(30, Math.round(getCacheTtlMs() / 1000))

const getSnapshotCached = unstable_cache(fetchProductsSnapshot, ["products-snapshot"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PRODUCTS_CACHE_TAG],
})

export const getProductsSnapshot = async ({ force = false }: GetProductsOptions = {}): Promise<ProductsSnapshot> => {
  if (force) {
    await revalidateTag(PRODUCTS_CACHE_TAG)
  }
  return getSnapshotCached()
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

const removeDiacritics = (value: string): string => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
const normalizeText = (value: string): string => removeDiacritics(value.toLowerCase()).replace(/\s+/g, " ").trim()

const getSpecificationsText = (value: ProductRow["specifications"]): string => {
  if (value === null || typeof value === "undefined") {
    return ""
  }
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.warn("No se pudieron serializar las especificaciones para la busqueda:", error)
    return ""
  }
}

const matchesSearch = (row: ProductRow, normalizedSearch: string): boolean => {
  const parts: string[] = [row.name, row.description ?? "", row.category, row.condition]
  const numericParts: Array<number | null | undefined> = [row.price, row.original_price, row.price_usd]

  for (const numeric of numericParts) {
    if (typeof numeric === "number" && Number.isFinite(numeric)) {
      parts.push(String(numeric))
    }
  }

  const specsText = getSpecificationsText(row.specifications)
  if (specsText) {
    parts.push(specsText)
  }

  return parts.some((part) => {
    if (!part) return false
    return normalizeText(part).includes(normalizedSearch)
  })
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

const normalizeSpecificationsValue = (value: ProductRow["specifications"]): Record<string, string | number | boolean> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, string | number | boolean>
}

export const toFullProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  category: row.category,
  condition: normalizeCondition(row.condition),
  price: row.price,
  originalPrice: row.original_price ?? null,
  priceUSD: row.price_usd ?? null,
  images: row.images ?? [],
  specifications: normalizeSpecificationsValue(row.specifications),
  stock: row.stock,
  featured: row.featured,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? null,
})

const applyFilters = (
  rows: ProductRow[],
  filters: { category?: string | null; condition?: string | null; featured?: boolean | null; search?: string | null },
): ProductRow[] => {
  const normalizedCategory = filters.category?.toLowerCase() ?? null
  const normalizedCondition = filters.condition ? normalizeCondition(filters.condition) : null
  const normalizedFeatured = typeof filters.featured === "boolean" ? filters.featured : null
  const normalizedSearch =
    filters.search && filters.search.trim().length > 0 ? normalizeText(filters.search) : null

  if (!normalizedCategory && !normalizedCondition && normalizedFeatured === null && !normalizedSearch) {
    return rows
  }

  return rows.filter((row) => {
    const categoryMatches = !normalizedCategory || row.category.toLowerCase() === normalizedCategory
    const conditionMatches = !normalizedCondition || normalizeCondition(row.condition) === normalizedCondition
    const featuredMatches = normalizedFeatured === null || row.featured === normalizedFeatured
    const searchMatches = !normalizedSearch || matchesSearch(row, normalizedSearch)
    return categoryMatches && conditionMatches && featuredMatches && searchMatches
  })
}

export type CatalogQueryOptions = {
  limit?: number
  offset?: number
  force?: boolean
  category?: string | null
  condition?: string | null
  featured?: boolean | null
  search?: string | null
}

export const getCatalogProducts = async ({
  limit = 12,
  offset = 0,
  force = false,
  category = null,
  condition = null,
  featured = null,
  search = null,
}: CatalogQueryOptions = {}): Promise<CatalogProductsResponse> => {
  const normalizedOffset = Math.max(0, Number.isFinite(offset) ? offset : 0)
  const normalizedLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 12, MAX_LIMIT))
  const normalizedCategory = category && category.trim().length > 0 ? category.trim().toLowerCase() : null
  const normalizedCondition = condition && condition.trim().length > 0 ? condition.trim().toLowerCase() : null
  const normalizedSearch = search && search.trim().length > 0 ? search.trim() : null

  try {
    const { data, error } = await ProductAdminService.getCatalogPage({
      limit: normalizedLimit,
      offset: normalizedOffset,
      category: normalizedCategory,
      condition: normalizedCondition,
      featured,
      search: normalizedSearch,
    })

    if (error || !data) {
      throw error ?? new Error("Catalog query failed")
    }

    return {
      items: data.rows.map(toProductSummary),
      total: data.total,
      supabaseConnected: true,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error("Fallo la consulta directa del catalogo, usando cache en memoria:", error)
    const snapshot = await getProductsSnapshot({ force })
    const filtered = applyFilters(snapshot.data, {
      category: normalizedCategory,
      condition: normalizedCondition,
      featured,
      search: normalizedSearch,
    })

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
      supabaseConnected: snapshot.connected,
      timestamp: snapshot.fetchedAt,
    }
  }
}
