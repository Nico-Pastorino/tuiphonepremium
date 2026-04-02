import { revalidateTag, unstable_cache } from "next/cache"

import { ProductAdminService } from "@/lib/supabase-admin"
import { sanitizeImageList } from "@/lib/image-cdn"
import type { ProductRow } from "@/types/database"
import type { CatalogProductsResponse, Product, ProductSummary } from "@/types/product"
import { buildProductPricingResponse, toCatalogProductPricing } from "@/lib/pricing"
import { getDollarConfigCached, getInstallmentConfigCached } from "@/lib/site-config-cache"

const DEFAULT_TTL_MS = 300_000
const PRODUCTS_CACHE_TAG = "products-list"
const ADMIN_PRODUCTS_LIMIT = 2000
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

const CACHE_TTL_SECONDS = Math.max(30, Math.round(getCacheTtlMs() / 1000))

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

export const toProductSummary = (row: ProductRow): ProductSummary => {
  const sanitizedImages = sanitizeImageList(row.images)
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    condition: normalizeCondition(row.condition),
    price: row.price,
    originalPrice: row.original_price ?? null,
    priceUSD: row.price_usd ?? null,
    images: sanitizedImages.length > 0 ? [sanitizedImages[0]] : [],
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
  }
}

const normalizeSpecificationsValue = (value: ProductRow["specifications"]): Record<string, string | number | boolean> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, string | number | boolean>
}

export const toFullProduct = (row: ProductRow): Product => {
  const sanitizedImages = sanitizeImageList(row.images)
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category,
    condition: normalizeCondition(row.condition),
    price: row.price,
    originalPrice: row.original_price ?? null,
    priceUSD: row.price_usd ?? null,
    images: sanitizedImages,
    specifications: normalizeSpecificationsValue(row.specifications),
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
    updatedAt: row.updated_at ?? null,
  }
}

const loadAdminProducts = async (): Promise<ProductRow[]> => {
  const { data, error } = await ProductAdminService.getAllProducts({ limit: ADMIN_PRODUCTS_LIMIT, offset: 0 })

  if (error) {
    throw error instanceof Error ? error : new Error("Unable to load products from Supabase")
  }

  return data ?? []
}

const getProductsCachedInternal = unstable_cache(loadAdminProducts, ["products-list"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PRODUCTS_CACHE_TAG],
})

export const invalidateProductsCache = async (): Promise<void> => {
  await revalidateTag(PRODUCTS_CACHE_TAG)
}

export type GetProductsOptions = {
  force?: boolean
}

export const getProductsCached = async ({ force = false }: GetProductsOptions = {}): Promise<ProductRow[]> => {
  if (force) {
    await revalidateTag(PRODUCTS_CACHE_TAG)
  }

  return getProductsCachedInternal()
}

export type CatalogQueryOptions = {
  limit?: number
  offset?: number
  force?: boolean
  category?: string | null
  condition?: string | null
  featured?: boolean | null
  search?: string | null
  outletOnly?: boolean
}

export const getCatalogProducts = async ({
  limit = 12,
  offset = 0,
  force = false,
  category = null,
  condition = null,
  featured = null,
  search = null,
  outletOnly = false,
}: CatalogQueryOptions = {}): Promise<CatalogProductsResponse> => {
  const normalizedOffset = Math.max(0, Number.isFinite(offset) ? offset : 0)
  const normalizedLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 12, MAX_LIMIT))
  const normalizedCategory = category && category.trim().length > 0 ? category.trim() : null
  const normalizedCondition = condition && condition.trim().length > 0 ? condition.trim() : null
  const normalizedSearch = search && search.trim().length > 0 ? search.trim() : null

  if (force) {
    await revalidateTag(PRODUCTS_CACHE_TAG)
  }

  const [{ data, error }, [installmentConfig, dollarConfig]] = await Promise.all([
    ProductAdminService.getCatalogPage({
      limit: normalizedLimit,
      offset: normalizedOffset,
      category: normalizedCategory,
      condition: normalizedCondition,
      featured,
      search: normalizedSearch,
      outletOnly,
    }),
    Promise.all([getInstallmentConfigCached(), getDollarConfigCached()]),
  ])

  if (error || !data) {
    throw error ?? new Error("Catalog query failed")
  }

  const items = data.rows.map((row) => {
    const summary = toProductSummary(row)
    const pricing = buildProductPricingResponse({
      product: {
        ...summary,
        updatedAt: null,
      },
      dollarConfig,
      installmentPlans: installmentConfig.plans,
      installmentPromotions: installmentConfig.promotions,
      installmentConfigUpdatedAt: installmentConfig.updatedAt,
    })

    return {
      ...summary,
      pricing: toCatalogProductPricing(pricing),
    }
  })

  return {
    items,
    total: data.total,
    supabaseConnected: true,
    timestamp: Date.now(),
  }
}
