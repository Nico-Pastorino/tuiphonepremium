"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Search, Menu, Smartphone, Settings } from "lucide-react"
import { useDollarRate } from "@/hooks/useDollarRate"

export function Header() {
  const { dollarRate, loading } = useDollarRate()

  return (
    <header className="bg-white border-b border-apple-muted/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Barra superior con dólar */}
        <div className="py-2 border-b border-apple-light">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Envíos gratis en CABA y GBA</span>
            </div>
            <div className="flex items-center gap-4">
              {!loading && dollarRate && (
                <Badge variant="outline" className="border-apple-primary text-apple-primary">
                  Dólar Blue: ${dollarRate.blue}
                </Badge>
              )}
              <Link href="/admin" className="text-gray-600 hover:text-apple-primary">
                <Settings className="w-4 h-4 inline mr-1" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Header principal */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-apple-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TuiPhone</h1>
                <p className="text-xs text-apple-primary">Premium Apple Store</p>
              </div>
            </Link>

            {/* Navegación */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/productos" className="text-gray-700 hover:text-apple-primary font-medium">
                Productos
              </Link>
              <Link href="/productos?category=iphone" className="text-gray-700 hover:text-apple-primary font-medium">
                iPhones
              </Link>
              <Link
                href="/productos?condition=seminuevo"
                className="text-gray-700 hover:text-apple-primary font-medium"
              >
                Seminuevos
              </Link>
              <Link href="/cuotas" className="text-gray-700 hover:text-apple-primary font-medium">
                Financiación
              </Link>
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-apple-primary text-white text-xs">
                  0
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
