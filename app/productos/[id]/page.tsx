import { notFound } from "next/navigation"
import { ProductDetailContent } from "@/components/ProductDetailContent"
import { fetchAllProductIds, fetchProductById, fetchProductsByCategory } from "@/lib/products"

interface ProductDetailPageProps {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params
  const product = await fetchProductById(id)

  if (!product) {
    notFound()
  }

  const productData = product

  const relatedProducts = await fetchProductsByCategory(productData.category, {
    excludeId: productData.id,
    limit: 4,
  })

  return <ProductDetailContent product={productData} relatedProducts={relatedProducts} />
}

export async function generateStaticParams() {
  const ids = await fetchAllProductIds()
  return ids.map((id) => ({ id }))
}
