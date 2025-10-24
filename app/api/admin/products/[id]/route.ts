import { type NextRequest, NextResponse } from "next/server"
import { invalidateProductsCache } from "@/lib/product-cache"
import { ProductAdminService } from "@/lib/supabase-admin"
import type { Json, ProductUpdate } from "@/types/database"

const getErrorMessage = (error: Error) => error.message || "Unexpected error"

const buildProductUpdate = (body: Record<string, unknown>): ProductUpdate => {
  const updateData: ProductUpdate = {}

  if (body.name !== undefined) updateData.name = String(body.name)
  if (body.description !== undefined) updateData.description = body.description === null ? null : String(body.description)
  if (body.price !== undefined) updateData.price = Number(body.price)
  if (body.originalPrice !== undefined) {
    updateData.original_price = body.originalPrice === null ? null : Number(body.originalPrice)
  }
  if (body.priceUSD !== undefined) {
    updateData.price_usd = body.priceUSD === null ? null : Number(body.priceUSD)
  }
  if (body.category !== undefined) updateData.category = String(body.category)
  if (body.condition !== undefined) updateData.condition = String(body.condition)
  if (body.images !== undefined) {
    updateData.images = Array.isArray(body.images) ? (body.images as string[]) : []
  }
  if (body.specifications !== undefined) {
    updateData.specifications = body.specifications as Json
  }
  if (body.stock !== undefined) updateData.stock = Number(body.stock)
  if (body.featured !== undefined) updateData.featured = Boolean(body.featured)

  return updateData
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const updateData = buildProductUpdate(body)
    const { data, error } = await ProductAdminService.updateProduct(params.id, updateData)

    if (error) {
      console.error("API PUT error:", error)
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }

    invalidateProductsCache()

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await ProductAdminService.deleteProduct(params.id)

    if (error) {
      console.error("API DELETE error:", error)
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }

    invalidateProductsCache()

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
