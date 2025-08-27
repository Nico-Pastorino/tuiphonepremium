import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

// GET - Obtener producto por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await ProductAdminService.getProductById(params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("API PUT received:", { id: params.id, body })

    // Preparar datos para actualización
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

    const { data, error } = await ProductAdminService.updateProduct(params.id, productData)

    if (error) {
      console.error("API PUT error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await ProductAdminService.deleteProduct(params.id)

    if (error) {
      console.error("API DELETE error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
