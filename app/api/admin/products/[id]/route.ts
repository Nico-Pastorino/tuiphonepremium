import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    console.log("API PUT received:", { id, body })

    // Preparar datos para actualización
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.originalPrice !== undefined) {
      updateData.original_price = body.originalPrice ? Number(body.originalPrice) : null
    }
    if (body.priceUSD !== undefined) {
      updateData.price_usd = body.priceUSD ? Number(body.priceUSD) : null
    }
    if (body.category !== undefined) updateData.category = body.category
    if (body.condition !== undefined) updateData.condition = body.condition
    if (body.images !== undefined) updateData.images = body.images
    if (body.specifications !== undefined) updateData.specifications = body.specifications
    if (body.stock !== undefined) updateData.stock = Number(body.stock)
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured)

    const { data, error } = await ProductAdminService.updateProduct(id, updateData)

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
    const { id } = params
    console.log("API DELETE received:", id)

    const { data, error } = await ProductAdminService.deleteProduct(id)

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
