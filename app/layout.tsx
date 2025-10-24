import type React from "react"
import type { Metadata } from "next"
import { ProductProvider } from "@/contexts/ProductContext"
import { AdminProvider } from "@/contexts/AdminContext"
import { ToastContainer } from "@/components/ui/toast"
import { getProductsCached } from "@/lib/product-cache"
import "./globals.css"

export const metadata: Metadata = {
  title: "TuIphonepremium - Tienda Apple Argentina",
  description:
    "Los mejores productos Apple nuevos y seminuevos en Argentina. iPhone, iPad, Mac, Apple Watch y mas con garantia y financiacion.",
  generator: "v0.dev",
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let initialData: {
    products: Awaited<ReturnType<typeof getProductsCached>>
    supabaseConnected: boolean
    timestamp: number
  } | null = null

  try {
    const products = await getProductsCached()
    initialData = {
      products,
      supabaseConnected: true,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error("No se pudo precargar la lista de productos:", error)
  }

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AdminProvider>
          <ProductProvider initialData={initialData}>
            {children}
            <ToastContainer />
          </ProductProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
