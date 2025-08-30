"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Eye } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"

interface Product {
  id: string
  name: string
  price_usd: number
  original_price?: number
  category: string
  image_url?: string
  description?: string
  specifications?: string[]
  is_featured?: boolean
  stock_quantity?: number
  created_at: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false)
  const { getEffectiveDollarRate } = useAdmin()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const dollarRate = getEffectiveDollarRate()
  const priceARS = Math.round(product.price_usd * dollarRate)
  const originalPriceARS = product.original_price ? Math.round(product.original_price * dollarRate) : null
  const discount = originalPriceARS ? Math.round(((originalPriceARS - priceARS) / originalPriceARS) * 100) : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatPriceUSD = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "iphone":
        return "bg-gray-900 text-white"
      case "ipad":
        return "bg-blue-600 text-white"
      case "mac":
        return "bg-gray-600 text-white"
      case "accesorios":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-0 shadow-md bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden h-full">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image_url || "/placeholder.svg?height=400&width=400&text=Producto"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 320px) 280px, (max-width: 640px) 300px, (max-width: 768px) 350px, (max-width: 1024px) 400px, 450px"
        />

        {/* Badges */}
        <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 flex flex-col gap-1 sm:gap-2">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg">
              <Star className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 fill-current" strokeWidth={1.5} />
              <span className="hidden xs:inline">Destacado</span>
              <span className="xs:hidden">★</span>
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
          <Badge
            className={`${getCategoryColor(product.category)} border-0 text-[9px] xs:text-xs sm:text-sm font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg`}
          >
            {product.category}
          </Badge>
        </div>

        {/* Stock indicator */}
        {product.stock_quantity !== undefined && product.stock_quantity <= 5 && (
          <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4">
            <Badge
              variant="outline"
              className="bg-white/90 backdrop-blur-sm text-orange-600 border-orange-200 text-[9px] xs:text-xs sm:text-sm font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg"
            >
              {product.stock_quantity > 0 ? `Solo ${product.stock_quantity} disponibles` : "Sin stock"}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 xs:p-3 sm:p-4 lg:p-5 xl:p-6">
        {/* Category */}
        <div className="mb-1 xs:mb-2 sm:mb-3">
          <Badge
            variant="outline"
            className="text-[9px] xs:text-xs sm:text-sm font-medium text-blue-600 border-blue-200 bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg"
          >
            {product.category.toUpperCase()}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-gray-600 mb-2 xs:mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Specifications - Only show on larger screens */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="hidden md:block mb-3 lg:mb-4">
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {product.specifications.slice(0, 2).map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-[9px] lg:text-xs text-gray-600 bg-gray-100 border-0 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-2 xs:mb-3 sm:mb-4">
          <div className="flex flex-wrap items-center gap-1 xs:gap-2 sm:gap-3 mb-1 xs:mb-2">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {formatPrice(priceARS)}
            </span>
            {originalPriceARS && (
              <span className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-500 line-through">
                {formatPrice(originalPriceARS)}
              </span>
            )}
          </div>
          <div className="text-[9px] xs:text-xs sm:text-sm md:text-base text-gray-500">
            {formatPriceUSD(product.price_usd)} • Dólar: ${Math.round(dollarRate)}
          </div>
        </div>

        {/* Installments */}
        <div className="mb-3 xs:mb-4 sm:mb-6">
          <div className="text-[9px] xs:text-xs sm:text-sm md:text-base text-green-600 font-medium">
            <span className="hidden sm:inline">Hasta </span>12 cuotas sin interés
          </div>
          <div className="text-[9px] xs:text-xs sm:text-sm text-gray-500">
            <span className="hidden xs:inline">desde </span>
            {formatPrice(Math.round(priceARS / 12))}/mes
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 sm:gap-3">
          <Button
            asChild
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[9px] xs:text-xs sm:text-sm md:text-base font-medium rounded-md sm:rounded-lg transition-all duration-300 min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] shadow-md hover:shadow-lg"
          >
            <Link href={`https://wa.me/5491234567890?text=Hola! Me interesa el ${product.name}`}>
              <MessageCircle
                className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0"
                strokeWidth={1.5}
              />
              <span className="xs:hidden">WA</span>
              <span className="hidden xs:inline sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Consultar</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-[9px] xs:text-xs sm:text-sm md:text-base font-medium rounded-md sm:rounded-lg transition-all duration-300 min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] shadow-sm hover:shadow-md bg-transparent"
          >
            <Link href={`/productos/${product.id}`}>
              <Eye
                className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0"
                strokeWidth={1.5}
              />
              <span className="hidden xs:inline">Ver</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
