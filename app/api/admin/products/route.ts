import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await ProductAdminService.getAllProducts()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin get all products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API POST received:", body)

    // Validar campos requeridos
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Faltan campos requeridos: name, price, category" }, { status: 400 })
    }

    // Preparar datos para inserción
    const productData = {
      name: String(body.name).trim(),
      description: body.description ? String(body.description).trim() : "",
      price: Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      price_usd: body.priceUSD ? Number(body.priceUSD) : null,
      category: String(body.category).toLowerCase().trim(),
      condition: body.condition || "nuevo",
      images: Array.isArray(body.images) ? body.images : [],
      specifications: typeof body.specifications === "object" ? body.specifications : {},
      featured: Boolean(body.featured),
    }

    console.log("API POST processed data:", productData)

    const { data, error } = await ProductAdminService.createProduct(productData)

    if (error) {
      console.error("API POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
