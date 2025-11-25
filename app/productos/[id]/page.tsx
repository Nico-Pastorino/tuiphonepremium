import { notFound } from "next/navigation"

import { ProductDetailClient } from "./ProductDetailClient"
import { getProductsSnapshot, toFullProduct, toProductSummary } from "@/lib/product-cache"

type ProductDetailPageProps = {
  params: { id: string }
}

export const revalidate = 300

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const snapshot = await getProductsSnapshot()
  const target = snapshot.data.find((row) => row.id === params.id)

  if (!target) {
    notFound()
  }

  const product = toFullProduct(target)
  const relatedProducts = snapshot.data
    .filter((row) => row.id !== target.id && row.category === target.category)
    .slice(0, 4)
    .map(toProductSummary)

  return <ProductDetailClient productId={product.id} initialProduct={product} relatedProducts={relatedProducts} />
}
