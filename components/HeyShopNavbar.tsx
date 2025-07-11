"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Search, Menu, Heart } from "lucide-react"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"

export function HeyShopNavbar() {
  const { dollarRate, loading } = useDollarRate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-apple-primary to-apple-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TuiPhone</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/productos" className="text-gray-700 hover:text-apple-primary font-medium transition-colors">
              Productos
            </Link>
            <Link
              href="/productos?category=iphone"
              className="text-gray-700 hover:text-apple-primary font-medium transition-colors"
            >
              iPhone
            </Link>
            <Link
              href="/productos?category=ipad"
              className="text-gray-700 hover:text-apple-primary font-medium transition-colors"
            >
              iPad
            </Link>
            <Link
              href="/productos?category=mac"
              className="text-gray-700 hover:text-apple-primary font-medium transition-colors"
            >
              Mac
            </Link>
            <Link
              href="/productos?condition=seminuevo"
              className="text-apple-accent hover:text-apple-primary font-medium transition-colors"
            >
              Seminuevos
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Dollar rate */}
            {!loading && dollarRate && (
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                <span>Dólar Blue: ${dollarRate.blue}</span>
              </div>
            )}

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-apple-primary text-white text-xs">
                  0
                </Badge>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-4">
              <Link href="/productos" className="text-gray-700 hover:text-apple-primary font-medium">
                Productos
              </Link>
              <Link href="/productos?category=iphone" className="text-gray-700 hover:text-apple-primary font-medium">
                iPhone
              </Link>
              <Link href="/productos?category=ipad" className="text-gray-700 hover:text-apple-primary font-medium">
                iPad
              </Link>
              <Link href="/productos?category=mac" className="text-gray-700 hover:text-apple-primary font-medium">
                Mac
              </Link>
              <Link
                href="/productos?condition=seminuevo"
                className="text-apple-accent hover:text-apple-primary font-medium"
              >
                Seminuevos
              </Link>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritos
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Mi cuenta
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrito
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-apple-primary text-white text-xs">
                    0
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
