import { type NextRequest, NextResponse } from "next/server"
import { getCatalogProducts } from "@/lib/product-cache"
import { parseCatalogPagination } from "@/lib/catalog-pagination.mjs"

export const revalidate = 300
// Mantener ISR activo para reducir consultas repetidas al backend.
const PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"
const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"

const parseBooleanParam = (value: string | null): boolean | null => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "1" || normalized === "true") return true
  if (normalized === "0" || normalized === "false") return false
  return null
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const { searchParams } = request.nextUrl
    const pagination = parseCatalogPagination(searchParams)
    if (!pagination) {
      return NextResponse.json({ error: "El offset solicitado excede el rango permitido" }, { status: 400 })
    }
    const { limit, offset } = pagination
    const force = searchParams.get("refresh") === "1"
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")
    const featured = parseBooleanParam(searchParams.get("featured"))
    const search = searchParams.get("search")
    const outletOnly = parseBooleanParam(searchParams.get("outlet")) ?? false

    const data = await getCatalogProducts({
      limit,
      offset,
      force,
      category: category && category.trim().length > 0 ? category.trim() : null,
      condition: condition && condition.trim().length > 0 ? condition.trim() : null,
      featured,
      search: search && search.trim().length > 0 ? search.trim() : null,
      outletOnly,
    })
    const response = NextResponse.json(data)
    response.headers.set("Cache-Control", force ? "no-store" : PUBLIC_CACHE_CONTROL)
    if (DEBUG_EGRESS_LOGS) {
      console.info("[catalog/products]", {
        durationMs: Date.now() - startedAt,
        limit,
        offset,
        total: data.total,
        featured,
        outletOnly,
        category: category ?? null,
        condition: condition ?? null,
        search: search ?? null,
      })
    }
    return response
  } catch (error) {
    console.error("Catalog products API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar los productos" },
      { status: 500 },
    )
  }
}
