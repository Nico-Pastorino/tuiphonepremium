"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ArrowRight,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAppState } from "@/hooks/use-app-state"
import { useProducts } from "@/contexts/ProductContext"
import { cn } from "@/lib/utils"

export function EnhancedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const { getCartItemsCount, wishlist, isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppState()

  const { products } = useProducts()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Search functionality
  const searchResults = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = "unset"
  }

  const categories = [
    {
      name: "iPhone",
      href: "/productos?category=iphone",
      icon: Smartphone,
      color: "text-blue-600",
    },
    {
      name: "iPad",
      href: "/productos?category=ipad",
      icon: Tablet,
      color: "text-purple-600",
    },
    {
      name: "Mac",
      href: "/productos?category=mac",
      icon: Laptop,
      color: "text-gray-600",
    },
    {
      name: "Watch",
      href: "/productos?category=watch",
      icon: Watch,
      color: "text-red-600",
    },
    {
      name: "AirPods",
      href: "/productos?category=airpods",
      icon: Headphones,
      color: "text-green-600",
    },
  ]

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 z-10">
              <div className="w-10 h-10 lg:w-12 lg:h-12 relative">
                <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
              </div>
              <span
                className={cn(
                  "text-xl lg:text-2xl font-bold transition-colors hidden sm:block",
                  isScrolled ? "text-gray-900" : "text-white",
                )}
              >
                TuIphonepremium
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10",
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      : "text-white/90 hover:text-white",
                  )}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl"
                />

                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/productos/${product.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSearchQuery("")
                          setIsSearchFocused(false)
                        }}
                      >
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-gray-500 text-xs capitalize">{product.category}</p>
                        </div>
                        <p className="font-bold text-gray-900">${product.price.toLocaleString("es-AR")}</p>
                      </Link>
                    ))}
                    <Link
                      href={`/productos?search=${searchQuery}`}
                      className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                      onClick={() => {
                        setSearchQuery("")
                        setIsSearchFocused(false)
                      }}
                    >
                      Ver todos los resultados
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "lg:hidden p-2",
                  isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                )}
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative p-2 hidden sm:flex",
                  isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                )}
                asChild
              >
                <Link href="/favoritos">
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {wishlist.length}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative p-2",
                  isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                )}
                asChild
              >
                <Link href="/carrito">
                  <ShoppingCart className="w-5 h-5" />
                  {getCartItemsCount() > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 hidden sm:flex",
                  isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                )}
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "lg:hidden p-2",
                  isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10",
                )}
                onClick={toggleMenu}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="flex items-center gap-4 p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-500 rounded-xl"
                autoFocus
              />
            </div>
          </div>

          {searchQuery && (
            <div className="p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/productos/${product.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-gray-500 text-sm capitalize">{product.category}</p>
                      </div>
                      <p className="font-bold text-gray-900">${product.price.toLocaleString("es-AR")}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No se encontraron productos</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden transition-all duration-300", isMenuOpen ? "visible" : "invisible")}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMenu}
        />

        <div
          className={cn(
            "absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300",
            isMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src="/logo-final.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-white font-bold text-lg">TuIphonepremium</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMenu}
              className="text-white hover:bg-white/20 p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="py-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
            >
              Inicio
            </Link>

            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                onClick={closeMenu}
                className="flex items-center gap-3 px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <category.icon className={cn("w-5 h-5", category.color)} />
                {category.name}
              </Link>
            ))}

            <Link
              href="/productos?condition=seminuevo"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
            >
              Productos Seminuevos
            </Link>

            <Link
              href="/cuotas"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
            >
              Financiación
            </Link>

            <Link
              href="/contacto"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors font-medium"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
