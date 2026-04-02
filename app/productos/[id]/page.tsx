import { notFound } from "next/navigation"

import { ProductDetailClient } from "./ProductDetailClient"
import { getCatalogProducts, toFullProduct } from "@/lib/product-cache"
import { buildProductPricingResponse } from "@/lib/pricing"
import { getDollarConfigCached, getInstallmentConfigCached } from "@/lib/site-config-cache"
import { ProductAdminService } from "@/lib/supabase-admin"

type ProductDetailPageProps = {
  params: { id: string }
}

export const revalidate = 300

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [{ data: productRow, error }, installmentConfig, dollarConfig] = await Promise.all([
    ProductAdminService.getProductById(params.id),
    getInstallmentConfigCached(),
    getDollarConfigCached(),
  ])

  if (error) {
    throw error
  }

  if (!productRow) {
    notFound()
  }

  const baseProduct = toFullProduct(productRow)
  const product = {
    ...baseProduct,
    pricing: buildProductPricingResponse({
      product: baseProduct,
      dollarConfig,
      installmentPlans: installmentConfig.plans,
      installmentPromotions: installmentConfig.promotions,
      installmentConfigUpdatedAt: installmentConfig.updatedAt,
    }),
  }

  const relatedResponse = await getCatalogProducts({
    limit: 5,
    offset: 0,
    category: product.category,
  })

  const relatedProducts = relatedResponse.items.filter((item) => item.id !== product.id).slice(0, 4)

  return <ProductDetailClient productId={product.id} initialProduct={product} relatedProducts={relatedProducts} />
}
