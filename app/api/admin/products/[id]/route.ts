import { type NextRequest, NextResponse } from "next/server"
import { updateProduct, deleteProduct } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    console.log("API: Updating product:", id, body)

    const product = await updateProduct(id, body)

    // Transform response to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      priceUSD: product.price_usd,
      category: product.category,
      condition: product.condition,
      images: product.images || [],
      specifications: product.specifications || {},
      stock: product.stock || 1,
      featured: product.featured || false,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }

    console.log("API: Product updated successfully:", transformedProduct)
    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error("API: Error updating product:", error)
    return NextResponse.json(
      { error: "Error al actualizar producto", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("API: Deleting product:", id)

    await deleteProduct(id)

    console.log("API: Product deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Error deleting product:", error)
    return NextResponse.json(
      { error: "Error al eliminar producto", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
