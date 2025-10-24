import type { Metadata } from "next"
import { getCatalogProducts } from "@/lib/product-cache"
import { ProductsPageClient } from "./ProductsPageClient"

const INITIAL_PAGE_SIZE = 12

export const metadata: Metadata = {
  title: "Productos Apple | TuIphonepremium",
  description: "Explora nuestro catalogo completo de productos Apple nuevos y seminuevos disponibles en TuIphonepremium.",
}

export const revalidate = 60

export default async function ProductsPage() {
  const initialData = await getCatalogProducts({ limit: INITIAL_PAGE_SIZE })

  return <ProductsPageClient initialData={initialData} pageSize={INITIAL_PAGE_SIZE} />
}
