import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("API: Fetching products from Supabase...")
    const products = await getProducts()

    // Transform data to match frontend expectations
    const transformedProducts = products.map((product) => ({
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
    }))

    console.log(`API: Successfully fetched ${transformedProducts.length} products`)
    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error("API: Error fetching products:", error)
    return NextResponse.json(
      { error: "Error al obtener productos", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API: Creating product:", body)

    const product = await createProduct(body)

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

    console.log("API: Product created successfully:", transformedProduct)
    return NextResponse.json(transformedProduct, { status: 201 })
  } catch (error) {
    console.error("API: Error creating product:", error)
    return NextResponse.json(
      { error: "Error al crear producto", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
