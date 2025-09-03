"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"
import type { Product } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const { getEffectiveDollarRate } = useAdmin()
  const { dollarRate } = useDollarRate()

  const effectiveDollarRate = getEffectiveDollarRate()
  const priceInUSD = product.price_usd || product.price / effectiveDollarRate

  const getCategoryColor = (category: string) => {
    const colors = {
      iphone: "bg-gray-100 text-gray-800",
      ipad: "bg-blue-100 text-blue-800",
      mac: "bg-gray-100 text-gray-800",
      watch: "bg-red-100 text-red-800",
      airpods: "bg-purple-100 text-purple-800",
      accesorios: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      nuevo: "bg-green-100 text-green-800",
      seminuevo: "bg-yellow-100 text-yellow-800",
      usado: "bg-orange-100 text-orange-800",
    }
    return colors[condition as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-md">
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex flex-col gap-1 xs:gap-2">
          <Badge className={`text-xs ${getCategoryColor(product.category)} border-0`}>
            {product.category.toUpperCase()}
          </Badge>
          <Badge className={`text-xs ${getConditionColor(product.condition)} border-0`}>
            {product.condition === "nuevo" ? "NUEVO" : product.condition === "seminuevo" ? "SEMINUEVO" : "USADO"}
          </Badge>
          {product.featured && (
            <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" />
              DESTACADO
            </Badge>
          )}
        </div>

        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 xs:top-3 right-2 xs:right-3 w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 touch-target"
          onClick={(e) => {
            e.preventDefault()
            setIsLiked(!isLiked)
          }}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
      </div>

      <CardContent className="p-3 xs:p-4 sm:p-6">
        <div className="space-y-2 xs:space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm xs:text-base sm:text-lg line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs xs:text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
          )}

          <div className="space-y-1 xs:space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                ${product.price.toLocaleString("es-AR")}
              </span>
              {dollarRate && (
                <span className="text-xs xs:text-sm text-gray-500">
                  USD ${Math.round(priceInUSD).toLocaleString("en-US")}
                </span>
              )}
            </div>

            <div className="text-xs xs:text-sm text-green-600 font-medium">
              12 cuotas sin interés de ${Math.round(product.price / 12).toLocaleString("es-AR")}
            </div>
          </div>

          <div className="flex gap-2 pt-2 xs:pt-3">
            <Link href={`/productos/${product.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs xs:text-sm font-medium rounded-lg touch-target">
                Ver detalles
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="px-2 xs:px-3 border-gray-300 hover:bg-gray-50 touch-target bg-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
