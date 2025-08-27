import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await ProductAdminService.getProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Admin get product error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Clean and validate data
    const updateData = {
      name: body.name ? String(body.name).trim() : undefined,
      description: body.description ? String(body.description).trim() : undefined,
      price: body.price ? Number(body.price) : undefined,
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      price_usd: body.priceUSD ? Number(body.priceUSD) : null,
      category: body.category ? String(body.category).toLowerCase().trim() : undefined,
      condition: body.condition || undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
      specifications: typeof body.specifications === "object" ? body.specifications : undefined,
      stock: 1, // Always available
      featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const product = await ProductAdminService.updateProduct(params.id, updateData)
    return NextResponse.json(product)
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ProductAdminService.deleteProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
