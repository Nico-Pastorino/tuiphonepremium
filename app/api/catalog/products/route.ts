import { type NextRequest, NextResponse } from "next/server"
import { getCatalogProducts } from "@/lib/product-cache"

export const dynamic = "force-dynamic"

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 60

const parseNumberParam = (value: string | null, fallback: number, max: number) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT)
    const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0)
    const force = searchParams.get("refresh") === "1"
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")

    const data = await getCatalogProducts({
      limit,
      offset,
      force,
      category: category && category.trim().length > 0 ? category.trim() : null,
      condition: condition && condition.trim().length > 0 ? condition.trim() : null,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Catalog products API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar los productos" },
      { status: 500 },
    )
  }
}
