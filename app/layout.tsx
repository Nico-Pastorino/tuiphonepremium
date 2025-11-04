import type React from "react"
import type { Metadata } from "next"
import { ProductProvider } from "@/contexts/ProductContext"
import { AdminProvider } from "@/contexts/AdminContext"
import { ToastContainer } from "@/components/ui/toast"
import { ServiceWorkerManager } from "@/components/ServiceWorkerManager"
import "./globals.css"

export const metadata: Metadata = {
  title: "TuIphonepremium - Tienda Apple Argentina",
  description:
    "Los mejores productos Apple nuevos y seminuevos en Argentina. iPhone, iPad, Mac, Apple Watch y mas con garantia y financiacion.",
  generator: "v0.dev",
}

export const revalidate = 300

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AdminProvider>
          <ProductProvider>
            {children}
            <ToastContainer />
            <ServiceWorkerManager />
          </ProductProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
