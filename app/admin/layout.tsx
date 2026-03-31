import type { ReactNode } from "react"

import { ProductProvider } from "@/contexts/ProductContext"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  return <ProductProvider>{children}</ProductProvider>
}
