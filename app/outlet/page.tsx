import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCatalogProducts } from "@/lib/product-cache"
import { ProductsPageClient } from "@/app/productos/ProductsPageClient"

const INITIAL_PAGE_SIZE = 12

export const metadata: Metadata = {
  title: "Outlet Apple | TuIphonepremium",
  description: "Equipos Apple con detalles estéticos o funcionales a precio especial.",
}

export const revalidate = 300

export default async function OutletPage() {
  if (process.env.NEXT_PUBLIC_OUTLET_ENABLED !== "true") {
    notFound()
  }

  const initialData = await getCatalogProducts({
    limit: INITIAL_PAGE_SIZE,
    offset: 0,
    outletOnly: true,
  })

  return (
    <ProductsPageClient
      initialData={initialData}
      pageSize={INITIAL_PAGE_SIZE}
      initialFilters={{ category: null, condition: "outlet", search: null }}
      outletOnly
      title="Outlet Apple"
      subtitle="Equipos con detalles esteticos o funcionales a precio especial."
    />
  )
}
