import type React from "react"
import type { Metadata } from "next"
import { ProductProvider } from "@/contexts/ProductContext"
import { AdminProvider } from "@/contexts/AdminContext"
import { ToastContainer } from "@/components/ui/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "TuIphonepremium - Tienda Apple Argentina",
  description:
    "Los mejores productos Apple nuevos y seminuevos en Argentina. iPhone, iPad, Mac, Apple Watch y más con garantía y financiación.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="mobile-centered-body">
        <AdminProvider>
          <ProductProvider>
            {children}
            <ToastContainer />
          </ProductProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
