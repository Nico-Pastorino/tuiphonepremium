import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

// GET - Obtener todos los productos
export async function GET() {
  try {
    const { data, error } = await ProductAdminService.getAllProducts()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API POST received:", body)

    // Validar datos requeridos
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Faltan campos requeridos: name, price, category" }, { status: 400 })
    }

    // Preparar datos para inserción con valores por defecto para campos opcionales
    const productData = {
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      price_usd: body.priceUSD ? Number(body.priceUSD) : null,
      category: body.category,
      condition: body.condition || "nuevo",
      images: Array.isArray(body.images) ? body.images : [],
      specifications: typeof body.specifications === "object" ? body.specifications : {},
      stock: 1, // Siempre disponible
      featured: Boolean(body.featured),
    }

    console.log("Processed product data:", productData)

    const { data, error } = await ProductAdminService.createProduct(productData)

    if (error) {
      console.error("API POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
