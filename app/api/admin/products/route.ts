import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

// GET - Obtener todos los productos
export async function GET() {
  try {
    const { data, error } = await ProductAdminService.getAllProducts()

    if (error) {
      console.error("API GET error:", error)
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
    console.log("API POST received body:", body)

    // Validar datos requeridos
    if (!body.name || !body.price || !body.category) {
      console.error("Missing required fields:", { name: body.name, price: body.price, category: body.category })
      return NextResponse.json({ error: "Faltan campos requeridos: name, price, category" }, { status: 400 })
    }

    // Preparar datos para inserción con validación estricta
    const productData = {
      name: String(body.name).trim(),
      description: body.description ? String(body.description).trim() : "",
      price: Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      price_usd: body.priceUSD ? Number(body.priceUSD) : null,
      category: String(body.category).toLowerCase().trim(),
      condition: body.condition || "nuevo",
      images: Array.isArray(body.images) ? body.images : [],
      specifications:
        typeof body.specifications === "object" && body.specifications !== null ? body.specifications : {},
      stock: 1, // Siempre disponible
      featured: Boolean(body.featured),
    }

    console.log("Processed product data for insertion:", productData)

    // Validar que el precio sea válido
    if (isNaN(productData.price) || productData.price <= 0) {
      return NextResponse.json({ error: "El precio debe ser un número válido mayor a 0" }, { status: 400 })
    }

    const { data, error } = await ProductAdminService.createProduct(productData)

    if (error) {
      console.error("API POST error from service:", error)
      return NextResponse.json({ error: error.message || "Error al crear producto" }, { status: 500 })
    }

    console.log("Product created successfully:", data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API POST unexpected error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
