import { NextResponse } from "next/server"

import { toFullProduct } from "@/lib/product-cache"
import { buildProductPricingResponse } from "@/lib/pricing"
import { getDollarConfigCached, getInstallmentConfigCached } from "@/lib/site-config-cache"
import { ProductAdminService } from "@/lib/supabase-admin"

export const revalidate = 300
const DEBUG_EGRESS_LOGS = process.env.DEBUG_EGRESS_LOGS === "true"
const PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const startedAt = Date.now()
  try {
    const [{ data, error }, installmentConfig, dollarConfig] = await Promise.all([
      ProductAdminService.getProductById(params.id),
      getInstallmentConfigCached(),
      getDollarConfigCached(),
    ])

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const product = toFullProduct(data)
    const response = NextResponse.json({
      data: {
        ...product,
        pricing: buildProductPricingResponse({
          product,
          dollarConfig,
          installmentPlans: installmentConfig.plans,
          installmentPromotions: installmentConfig.promotions,
          installmentConfigUpdatedAt: installmentConfig.updatedAt,
        }),
      },
      supabaseConnected: true,
      timestamp: Date.now(),
    })
    response.headers.set("Cache-Control", PUBLIC_CACHE_CONTROL)
    if (DEBUG_EGRESS_LOGS) {
      console.info("[catalog/product]", {
        durationMs: Date.now() - startedAt,
        id: params.id,
      })
    }
    return response
  } catch (error) {
    console.error("Catalog product lookup failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo obtener el producto" },
      { status: 500 },
    )
  }
}
