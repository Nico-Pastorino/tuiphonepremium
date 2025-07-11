"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Search, Menu, Heart, MapPin, Phone } from "lucide-react"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"

export function ModernHeader() {
  const { dollarRate, loading } = useDollarRate()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-apple-primary text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Envío gratis CABA y GBA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+54 9 11 1234-5678</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!loading && dollarRate && (
                <div className="flex items-center gap-2">
                  <span>Dólar Blue: ${dollarRate.blue}</span>
                </div>
              )}
              <Link href="/admin" className="hover:text-apple-light transition-colors">
                Panel Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex gap-3 items-start">
            <div className="w-12 h-12 bg-gradient-to-br from-apple-primary to-apple-accent rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TuiPhone</h1>
              <p className="text-sm text-apple-primary font-medium">Premium Apple Store</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar productos Apple..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 focus:border-apple-primary rounded-xl"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span className="hidden lg:inline">Favoritos</span>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Mi cuenta</span>
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                0
              </Badge>
              <span className="hidden lg:inline ml-2">Carrito</span>
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 mt-4 pt-4 border-t border-gray-100">
          <Link href="/productos" className="text-gray-700 hover:text-apple-primary font-medium transition-colors">
            Todos los productos
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
            href="/productos?category=watch"
            className="text-gray-700 hover:text-apple-primary font-medium transition-colors"
          >
            Apple Watch
          </Link>
          <Link
            href="/productos?category=airpods"
            className="text-gray-700 hover:text-apple-primary font-medium transition-colors"
          >
            AirPods
          </Link>
          <Link
            href="/productos?condition=seminuevo"
            className="text-apple-accent hover:text-apple-primary font-medium transition-colors"
          >
            Seminuevos
          </Link>
          <Link href="/cuotas" className="text-gray-700 hover:text-apple-primary font-medium transition-colors">
            Financiación
          </Link>
        </nav>
      </div>
    </header>
  )
}
