import { type NextRequest, NextResponse } from "next/server"
import { getProductsCached, invalidateProductsCache } from "@/lib/product-cache"
import { sanitizeImageList } from "@/lib/image-cdn"
import { ProductAdminService } from "@/lib/supabase-admin"
import type { Json, ProductInsert } from "@/types/database"

const OUTLET_SCHEMA_ENABLED = process.env.OUTLET_SCHEMA_ENABLED === "true"
const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"

const buildProductInsert = (body: Record<string, unknown>): ProductInsert => ({
  name: String(body.name),
  description: typeof body.description === "string" ? body.description : "",
  price: Number(body.price),
  original_price: body.originalPrice !== undefined && body.originalPrice !== null ? Number(body.originalPrice) : null,
  price_usd: body.priceUSD !== undefined && body.priceUSD !== null ? Number(body.priceUSD) : null,
  category: String(body.category),
  condition: typeof body.condition === "string" ? body.condition : "nuevo",
  images: sanitizeImageList(body.images),
  specifications: (body.specifications as Json) ?? {},
  stock: body.stock !== undefined && body.stock !== null ? Number(body.stock) : 0,
  featured: Boolean(body.featured),
  ...(OUTLET_SCHEMA_ENABLED
    ? {
        is_outlet: Boolean(body.isOutlet),
        outlet_notes: typeof body.outletNotes === "string" ? body.outletNotes : null,
        outlet_defects: Array.isArray(body.outletDefects) ? (body.outletDefects as string[]) : [],
        outlet_battery_percent:
          body.outletBatteryPercent !== undefined && body.outletBatteryPercent !== null
            ? Number(body.outletBatteryPercent)
            : null,
        outlet_grade: typeof body.outletGrade === "string" ? body.outletGrade : null,
        outlet_warranty_days:
          body.outletWarrantyDays !== undefined && body.outletWarrantyDays !== null
            ? Number(body.outletWarrantyDays)
            : null,
        outlet_accessories: typeof body.outletAccessories === "string" ? body.outletAccessories : null,
        outlet_display_issues:
          body.outletDisplayIssues !== undefined && body.outletDisplayIssues !== null
            ? Boolean(body.outletDisplayIssues)
            : null,
        outlet_case_issues:
          body.outletCaseIssues !== undefined && body.outletCaseIssues !== null
            ? Boolean(body.outletCaseIssues)
            : null,
      }
    : {}),
})

const getErrorMessage = (error: Error) => error.message || "Unexpected error"

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1"
    const limitParam = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "", 10)
    const offsetParam = Number.parseInt(request.nextUrl.searchParams.get("offset") ?? "", 10)
    const search = request.nextUrl.searchParams.get("search")
    const condition = request.nextUrl.searchParams.get("condition")

    if (forceRefresh) {
      await invalidateProductsCache()
    }

    const hasPaginationParams =
      Number.isFinite(limitParam) || Number.isFinite(offsetParam) || Boolean(search?.trim()) || Boolean(condition?.trim())

    if (hasPaginationParams) {
      const limit = Number.isFinite(limitParam) ? limitParam : 24
      const offset = Number.isFinite(offsetParam) ? offsetParam : 0
      const { data, error } = await ProductAdminService.getAdminProductsPage({
        limit,
        offset,
        search: search && search.trim().length > 0 ? search.trim() : null,
        condition: condition && condition.trim().length > 0 ? condition.trim() : null,
      })

      if (error || !data) {
        throw error ?? new Error("No se pudieron cargar los productos")
      }

      const response = NextResponse.json({
        data: data.rows,
        total: data.total,
        limit,
        offset,
      })
      response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120")
      if (DEBUG_EGRESS_LOGS) {
        console.info("[admin/products]", {
          durationMs: Date.now() - startedAt,
          limit,
          offset,
          total: data.total,
          condition: condition ?? null,
          search: search ?? null,
        })
      }
      return response
    }

    const data = await getProductsCached()
    const response = NextResponse.json({ data, total: data.length, limit: data.length, offset: 0 })
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120")
    return response
  } catch (error) {
    console.error("API GET error:", error)
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const category = typeof body.category === "string" ? body.category.trim() : ""
    const price =
      typeof body.price === "number"
        ? body.price
        : typeof body.price === "string" && body.price.trim() !== ""
          ? Number(body.price)
          : Number.NaN

    const missingFields: string[] = []
    if (!name) missingFields.push("name")
    if (!Number.isFinite(price)) missingFields.push("price")
    if (!category) missingFields.push("category")

    if (missingFields.length > 0) {
      const message = `Faltan campos requeridos: ${missingFields.join(", ")}`
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const productData = buildProductInsert({
      ...body,
      name,
      category,
      price,
    })
    const { data, error } = await ProductAdminService.createProduct(productData)

    if (error) {
      console.error("API POST error:", error)
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }

    await invalidateProductsCache()

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
