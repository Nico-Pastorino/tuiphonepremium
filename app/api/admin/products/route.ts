import { type NextRequest, NextResponse } from "next/server"
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

export async function GET() {
  try {
    const { data, error } = await ProductAdminService.getAllProducts()

    if (error) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Faltan campos requeridos: name, price, category" }, { status: 400 })
    }

    const productData = buildProductInsert(body)
    const { data, error } = await ProductAdminService.createProduct(productData)

    if (error) {
      console.error("API POST error:", error)
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
