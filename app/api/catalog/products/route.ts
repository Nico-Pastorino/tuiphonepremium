import { type NextRequest, NextResponse } from "next/server"
import { getCatalogProducts } from "@/lib/product-cache"

export const revalidate = 300

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 60

const parseNumberParam = (value: string | null, fallback: number, max: number) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

const parseBooleanParam = (value: string | null): boolean | null => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "1" || normalized === "true") return true
  if (normalized === "0" || normalized === "false") return false
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT)
    const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0)
    const force = searchParams.get("refresh") === "1"
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")
    const featured = parseBooleanParam(searchParams.get("featured"))
    const search = searchParams.get("search")

    const data = await getCatalogProducts({
      limit,
      offset,
      force,
      category: category && category.trim().length > 0 ? category.trim() : null,
      condition: condition && condition.trim().length > 0 ? condition.trim() : null,
      featured,
      search: search && search.trim().length > 0 ? search.trim() : null,
    })
    const response = NextResponse.json(data)
    response.headers.set("Cache-Control", force ? "no-store" : "s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Catalog products API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar los productos" },
      { status: 500 },
    )
  }
}
