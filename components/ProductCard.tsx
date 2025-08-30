"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Eye, Zap, Shield, Truck } from "lucide-react"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useAdminContext } from "@/contexts/AdminContext"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { dollarRate } = useDollarRate()
  const { dollarMarkup, installmentRates } = useAdminContext()

  // Calcular precio en pesos usando el dólar blue + markup del admin
  const calculatePriceARS = () => {
    if (!dollarRate?.blue || !product.price_usd) return product.price || 0
    return Math.round(product.price_usd * (dollarRate.blue + dollarMarkup))
  }

  const priceARS = calculatePriceARS()

  // Calcular cuotas usando las tasas configuradas por el admin
  const calculateInstallments = (months: number, type: "visa" | "naranja") => {
    const rate = installmentRates[type][months] || 0
    const monthlyPayment = (priceARS * (1 + rate / 100)) / months
    return Math.round(monthlyPayment)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getConditionBadge = () => {
    switch (product.condition) {
      case "nuevo":
        return { text: "Nuevo", variant: "default" as const, color: "text-green-600 border-green-200 bg-green-50" }
      case "seminuevo":
        return { text: "Seminuevo", variant: "secondary" as const, color: "text-blue-600 border-blue-200 bg-blue-50" }
      case "usado":
        return { text: "Usado", variant: "outline" as const, color: "text-orange-600 border-orange-200 bg-orange-50" }
      default:
        return { text: "Disponible", variant: "outline" as const, color: "text-gray-600 border-gray-200 bg-gray-50" }
    }
  }

  const conditionBadge = getConditionBadge()

  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm overflow-hidden rounded-xl bg-white h-full">
        <Link href={`/productos/${product.id}`}>
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            <Image
              src={
                imageError
                  ? "/placeholder.svg?height=200&width=200"
                  : product.image_url || "/placeholder.svg?height=200&width=200"
              }
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {product.featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-yellow-500 text-white text-xs font-medium px-2 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">{formatPrice(priceARS)}</div>
              <Badge variant={conditionBadge.variant} className={`text-xs ${conditionBadge.color}`}>
                {conditionBadge.text}
              </Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-white h-full hover:scale-[1.02] transform">
      <div className="relative">
        {/* Imagen del producto con aspect ratio fijo */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={
              imageError
                ? "/placeholder.svg?height=400&width=400"
                : product.image_url || "/placeholder.svg?height=400&width=400"
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
            sizes="(max-width: 320px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges superpuestos */}
          <div className="absolute top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 flex flex-col gap-1 xs:gap-2">
            {product.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 shadow-lg">
                <Star className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1" />
                <span className="hidden xs:inline">Destacado</span>
                <span className="xs:hidden">★</span>
              </Badge>
            )}
            <Badge
              className={`text-[9px] xs:text-xs sm:text-sm font-semibold px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 shadow-md ${conditionBadge.color}`}
            >
              {conditionBadge.text}
            </Badge>
          </div>

          {/* Botón de vista rápida */}
          <div className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-700" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Category */}
          <div className="mb-1 xs:mb-2 sm:mb-3">
            <Badge
              variant="outline"
              className="text-[9px] xs:text-xs sm:text-sm font-medium text-blue-600 border-blue-200 bg-blue-50 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1"
            >
              {product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || "Producto"}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-900 mb-1 xs:mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Description - Solo en tablets+ */}
          {product.description && (
            <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 mb-2 xs:mb-3 sm:mb-4 line-clamp-2 leading-relaxed hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Specifications - Solo en tablets+ */}
          {product.specifications && (
            <div className="mb-2 xs:mb-3 sm:mb-4 hidden md:block">
              <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                {product.specifications.slice(0, 2).map((spec, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-[8px] xs:text-[9px] sm:text-xs text-gray-600 bg-gray-100 border-0 px-1.5 xs:px-2 py-0.5 xs:py-1"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-2 xs:mb-3 sm:mb-4">
            <div className="flex flex-wrap items-baseline gap-1 xs:gap-2 sm:gap-3 mb-1 xs:mb-2">
              <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex-shrink-0">
                {formatPrice(priceARS)}
              </div>
              {product.price_usd && (
                <div className="text-[10px] xs:text-xs sm:text-sm text-gray-500 font-medium">
                  USD ${product.price_usd}
                </div>
              )}
            </div>

            {/* Installments */}
            <div className="space-y-0.5 xs:space-y-1">
              <div className="text-[10px] xs:text-xs sm:text-sm text-green-600 font-semibold">
                {installmentRates.visa[3] === 0
                  ? "3 cuotas sin interés"
                  : `3 cuotas de ${formatPrice(calculateInstallments(3, "visa"))}`}
              </div>
              <div className="text-[10px] xs:text-xs sm:text-sm text-blue-600 font-medium">
                12 cuotas de {formatPrice(calculateInstallments(12, "visa"))}
              </div>
            </div>
          </div>

          {/* Features - Solo en desktop */}
          <div className="mb-3 xs:mb-4 sm:mb-5 hidden lg:block">
            <div className="flex items-center gap-3 xs:gap-4 text-[10px] xs:text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Garantía</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span>Envío</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-yellow-500" />
                <span>Rápido</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 sm:gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-[10px] xs:text-xs sm:text-sm md:text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] touch-manipulation"
            >
              <a
                href={`https://wa.me/5491112345678?text=Hola! Me interesa el ${product.name} - ${formatPrice(priceARS)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="xs:hidden">WA</span>
                <span className="hidden xs:inline sm:hidden">WhatsApp</span>
                <span className="hidden sm:inline">Consultar</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1 xs:flex-initial border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] touch-manipulation bg-transparent"
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="xs:hidden">Ver</span>
                <span className="hidden xs:inline">Ver más</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
