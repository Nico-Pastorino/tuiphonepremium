"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Eye, Star, Zap, Shield, MessageCircle, GitCompare } from "lucide-react"
import type { Product } from "@/types/product"
import { useAppState } from "@/hooks/use-app-state"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
  showQuickActions?: boolean
}

export function ProductCard({ product, variant = "default", showQuickActions = true }: ProductCardProps) {
  const { dollarRate } = useDollarRate()
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCompare, isInCompare } = useAppState()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const priceInPesos = dollarRate ? product.priceUSD * dollarRate.blue : product.price
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCompare(product)
  }

  const cardVariants = {
    default:
      "group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl sm:rounded-2xl",
    compact:
      "group relative overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl",
    featured:
      "group relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl sm:rounded-3xl",
  }

  return (
    <Card
      className={cardVariants[variant]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image Container - Responsive aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl sm:rounded-t-2xl">
          <Link href={`/productos/${product.id}`}>
            <Image
              src={product.images[0] || "/placeholder.svg?height=400&width=400&query=iPhone"}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>

          {/* Badges - Responsive */}
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

          {/* Quick Actions - Solo desktop */}
          {showQuickActions && (
            <div
              className={cn(
                "absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 transition-all duration-300 hidden sm:flex",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
              )}
            >
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 backdrop-blur-sm p-0"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4",
                    isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-600",
                  )}
                />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 backdrop-blur-sm p-0"
                onClick={handleCompare}
              >
                <GitCompare
                  className={cn("w-3 h-3 sm:w-4 sm:h-4", isInCompare(product.id) ? "text-blue-500" : "text-gray-600")}
                />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 backdrop-blur-sm p-0"
                asChild
              >
                <Link href={`/productos/${product.id}`}>
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </Link>
              </Button>
            </div>
          )}

          {/* Stock Indicator - Responsive */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <div
              className={cn(
                "px-2 sm:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1",
                product.stock > 0
                  ? "bg-green-500/20 text-green-700 border border-green-500/30"
                  : "bg-red-500/20 text-red-700 border border-red-500/30",
              )}
            >
              <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">
                {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
              </span>
              <span className="sm:hidden">{product.stock > 0 ? `${product.stock}` : "0"}</span>
            </div>
          </div>
        </div>

        {/* Content - Responsive padding */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Category & Rating - Responsive */}
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

          {/* Title - Responsive */}
          <Link href={`/productos/${product.id}`}>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Key Specifications - Solo en desktop */}
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

          {/* Price Section - Responsive */}
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

          {/* Actions - Responsive */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="w-full px-2 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 bg-transparent"
              asChild
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
