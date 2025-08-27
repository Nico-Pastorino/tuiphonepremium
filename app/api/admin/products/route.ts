import { type NextRequest, NextResponse } from "next/server"
import { ProductAdminService } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const products = await ProductAdminService.getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Admin get products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Clean and validate data
    const productData = {
      name: String(body.name).trim(),
      description: String(body.description).trim(),
      price: Number(body.price) || 0,
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      price_usd: body.priceUSD ? Number(body.priceUSD) : null,
      category: String(body.category).toLowerCase().trim(),
      condition: body.condition || "nuevo",
      images: Array.isArray(body.images) ? body.images : [],
      specifications: typeof body.specifications === "object" ? body.specifications : {},
      stock: 1, // Always available
      featured: Boolean(body.featured),
    }

    const product = await ProductAdminService.createProduct(productData)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Admin create error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
