"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Star, Zap, Shield, MessageCircle } from "lucide-react"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { dollarRate } = useDollarRate()
  const [imageLoaded, setImageLoaded] = useState(false)

  const priceInPesos = dollarRate ? product.priceUSD * dollarRate.blue : product.price
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  const cardVariants = {
    default:
      "group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl sm:rounded-2xl",
    compact:
      "group relative overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl",
    featured:
      "group relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl sm:rounded-3xl",
  }

  return (
    <Card className={cardVariants[variant]}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl sm:rounded-t-2xl">
          <Link href={`/productos/${product.id}`}>
            <Image
              src={product.images[0] || "/placeholder.svg?height=400&width=400&query=iPhone"}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105 cursor-pointer",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {product.condition === "seminuevo" && (
              <Badge className="bg-emerald-500/90 text-white font-medium px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Seminuevo
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-amber-500/90 text-white font-medium px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Destacado
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500/90 text-white font-bold px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1 bg-green-500/20 text-green-700 border border-green-500/30">
              <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Disponible</span>
              <span className="sm:hidden">✓</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 px-2 py-1">
              {product.category.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1 hidden sm:inline">(4.8)</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/productos/${product.id}`}>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Key Specifications */}
          {variant !== "compact" && (
            <div className="hidden sm:grid grid-cols-2 gap-2 mb-3 sm:mb-4">
              {Object.entries(product.specifications)
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 font-medium mb-1">{key}</div>
                    <div className="text-sm text-gray-900 font-semibold truncate">{value}</div>
                  </div>
                ))}
            </div>
          )}

          {/* Price Section */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                ${priceInPesos.toLocaleString("es-AR")}
              </span>
              {originalPrice && (
                <span className="text-sm sm:text-base lg:text-lg text-gray-500 line-through">
                  ${originalPrice.toLocaleString("es-AR")}
                </span>
              )}
            </div>

            {dollarRate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">USD ${product.priceUSD}</span>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Dólar Blue: ${dollarRate.blue}</span>
              </div>
            )}

            <div className="text-xs sm:text-sm text-emerald-600 font-medium bg-emerald-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
              💳 Hasta 12 cuotas disponibles
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-xs sm:text-sm"
              asChild
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Consultar</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
