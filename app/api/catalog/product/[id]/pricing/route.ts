import { NextResponse } from "next/server"

import { toFullProduct } from "@/lib/product-cache"
import { buildProductPricingResponse } from "@/lib/pricing"
import { getDollarConfigCached, getInstallmentConfigCached } from "@/lib/site-config-cache"
import { ProductAdminService } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [{ data: productRow, error }, installmentConfig, dollarConfig] = await Promise.all([
      ProductAdminService.getProductById(params.id),
      getInstallmentConfigCached(),
      getDollarConfigCached(),
    ])

    if (error) {
      throw error
    }

    if (!productRow) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const product = toFullProduct(productRow)
    const pricing = buildProductPricingResponse({
      product,
      dollarConfig,
      installmentPlans: installmentConfig.plans,
      installmentPromotions: installmentConfig.promotions,
      installmentConfigUpdatedAt: installmentConfig.updatedAt,
    })

    const response = NextResponse.json(pricing)
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
    return response
  } catch (error) {
    console.error("Catalog product pricing failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo obtener el pricing del producto" },
      { status: 500 },
    )
  }
}
