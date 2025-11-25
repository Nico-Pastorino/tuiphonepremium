import { notFound } from "next/navigation"

import { ProductDetailClient } from "./ProductDetailClient"
import { toFullProduct, toProductSummary } from "@/lib/product-cache"
import { ProductAdminService } from "@/lib/supabase-admin"

type ProductDetailPageProps = {
  params: { id: string }
}

export const revalidate = 300

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { data: productRow, error } = await ProductAdminService.getProductById(params.id)

  if (error) {
    throw error
  }

  if (!productRow) {
    notFound()
  }

  const product = toFullProduct(productRow)

  const { data: relatedData } = await ProductAdminService.getCatalogPage({
    limit: 5,
    offset: 0,
    category: product.category,
  })

  const relatedProducts = (relatedData?.rows ?? [])
    .filter((row) => row.id !== product.id)
    .slice(0, 4)
    .map(toProductSummary)

  return <ProductDetailClient productId={product.id} initialProduct={product} relatedProducts={relatedProducts} />
}
