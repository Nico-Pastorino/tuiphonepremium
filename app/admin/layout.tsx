import type { ReactNode } from "react"

import { ProductProvider } from "@/contexts/ProductContext"
import { getProductsSnapshot } from "@/lib/product-cache"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const snapshot = await getProductsSnapshot()
  const initialData = {
    products: snapshot.data,
    supabaseConnected: snapshot.connected,
    timestamp: snapshot.fetchedAt,
  }

  return <ProductProvider initialData={initialData}>{children}</ProductProvider>
}
