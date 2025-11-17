import type { Metadata } from "next"
import { getCatalogProducts } from "@/lib/product-cache"
import { ProductsPageClient } from "./ProductsPageClient"

const INITIAL_PAGE_SIZE = 12

export const metadata: Metadata = {
  title: "Productos Apple | TuIphonepremium",
  description: "Explora nuestro catalogo completo de productos Apple nuevos y seminuevos disponibles en TuIphonepremium.",
}

export const revalidate = 300

type PageProps = {
  searchParams?: Record<string, string | string[]>
}

const getParam = (searchParams: PageProps["searchParams"], key: string): string | null => {
  if (!searchParams) return null
  const value = searchParams[key]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const category = getParam(searchParams, "category")
  const condition = getParam(searchParams, "condition")

  const initialData = await getCatalogProducts({
    limit: INITIAL_PAGE_SIZE,
    offset: 0,
    category: category && category.trim().length > 0 ? category : null,
    condition: condition && condition.trim().length > 0 ? condition : null,
  })

  return (
    <ProductsPageClient
      initialData={initialData}
      pageSize={INITIAL_PAGE_SIZE}
      initialFilters={{ category: category ?? null, condition: condition ?? null }}
    />
  )
}
