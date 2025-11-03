import type React from "react"
import type { Metadata } from "next"
import { AdminProvider } from "@/contexts/AdminContext"
import { ToastContainer } from "@/components/ui/toast"
import { ServiceWorkerManager } from "@/components/ServiceWorkerManager"
import {
  getDollarConfigCached,
  getHomeConfigCached,
  getInstallmentConfigCached,
  getTradeInConfigCached,
} from "@/lib/site-config-cache"
import "./globals.css"

export const metadata: Metadata = {
  title: "TuIphonepremium - Tienda Apple Argentina",
  description:
    "Los mejores productos Apple nuevos y seminuevos en Argentina. iPhone, iPad, Mac, Apple Watch y mas con garantia y financiacion.",
  generator: "v0.dev",
}

export const revalidate = 120

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [homeConfig, tradeInConfig, installmentConfig, dollarConfig] = await Promise.all([
    getHomeConfigCached(),
    getTradeInConfigCached(),
    getInstallmentConfigCached(),
    getDollarConfigCached(),
  ])

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AdminProvider
          initialState={{
            homeConfig,
            tradeInConfig,
            installmentConfig,
            dollarConfig,
          }}
        >
          {children}
          <ToastContainer />
          <ServiceWorkerManager />
        </AdminProvider>
      </body>
    </html>
  )
}
