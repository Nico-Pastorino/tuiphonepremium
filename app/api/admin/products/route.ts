import { type NextRequest, NextResponse } from "next/server"
import { getProductsCached, invalidateProductsCache } from "@/lib/product-cache"
import { ProductAdminService } from "@/lib/supabase-admin"
import type { Json, ProductInsert } from "@/types/database"

const buildProductInsert = (body: Record<string, unknown>): ProductInsert => ({
  name: String(body.name),
  description: typeof body.description === "string" ? body.description : "",
  price: Number(body.price),
  original_price: body.originalPrice !== undefined && body.originalPrice !== null ? Number(body.originalPrice) : null,
  price_usd: body.priceUSD !== undefined && body.priceUSD !== null ? Number(body.priceUSD) : null,
  category: String(body.category),
  condition: typeof body.condition === "string" ? body.condition : "nuevo",
  images: Array.isArray(body.images) ? (body.images as string[]) : [],
  specifications: (body.specifications as Json) ?? {},
  stock: body.stock !== undefined && body.stock !== null ? Number(body.stock) : 0,
  featured: Boolean(body.featured),
})

const getErrorMessage = (error: Error) => error.message || "Unexpected error"

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1"
    const data = await getProductsCached({ force: forceRefresh })
    return NextResponse.json({ data })
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

    invalidateProductsCache()

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
