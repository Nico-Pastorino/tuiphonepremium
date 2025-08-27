"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, MessageCircle, Shield } from "lucide-react"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"

interface ModernProductCardProps {
  product: Product
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const { dollarRate } = useDollarRate()
  const [imageLoaded, setImageLoaded] = useState(false)

  const priceInPesos = dollarRate ? product.priceUSD * dollarRate.blue : product.price
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl">
      <CardContent className="p-0">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-3xl">
          <Link href={`/productos/${product.id}`}>
            <Image
              src={product.images[0] || "/placeholder.svg?height=400&width=400&query=iPhone"}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-105 cursor-pointer ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </Link>

          {/* Status badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.condition === "seminuevo" && (
              <Badge className="bg-emerald-500/90 text-white font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                Seminuevo
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-amber-500/90 text-white font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                Destacado
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500/90 text-white font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Stock indicator */}
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-green-500/20 text-green-700 border border-green-500/30 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Disponible
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 px-2 py-1">
              {product.category.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500 font-medium">
              {product.condition === "nuevo" ? "Nuevo" : "Seminuevo"}
            </span>
          </div>

          {/* Title */}
          <Link href={`/productos/${product.id}`}>
            <h3 className="font-bold text-xl mb-3 text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Key specifications */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(product.specifications)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 font-medium mb-1">{key}</div>
                  <div className="text-sm text-gray-900 font-semibold">{value}</div>
                </div>
              ))}
          </div>

          {/* Price section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through">${originalPrice.toLocaleString("es-AR")}</span>
              )}
            </div>

            {dollarRate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">USD ${product.priceUSD}</span>
                <span className="text-gray-400">•</span>
                <span>Dólar Blue: ${dollarRate.blue}</span>
              </div>
            )}

            <div className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
              💳 Hasta 12 cuotas disponibles
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              asChild
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Consultar
              </a>
            </Button>
            <Button
              variant="outline"
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
