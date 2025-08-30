"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageCircle, ExternalLink } from "lucide-react"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useAdmin } from "@/contexts/AdminContext"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { rate: dollarRate, markup } = useDollarRate()
  const { installmentPlans } = useAdmin()

  // Calculate price in ARS using dollar rate + markup
  const finalDollarRate = dollarRate + (markup || 0)
  const priceARS = product.priceUSD ? Math.round(product.priceUSD * finalDollarRate) : product.price

  // Safe access to installment plans with fallback values
  const getBestInstallmentOptions = () => {
    if (!installmentPlans) {
      return {
        visa: { cuotas: 3, interes: 0 },
        naranja: { cuotas: 3, interes: 5 },
      }
    }

    const visaPlans = installmentPlans.visa || {}
    const naranjaPlans = installmentPlans.naranja || {}

    return {
      visa: {
        cuotas: 3,
        interes: visaPlans.installments_3 || 0,
      },
      naranja: {
        cuotas: 3,
        interes: naranjaPlans.installments_3 || 5,
      },
    }
  }

  const bestOptions = getBestInstallmentOptions()
  const installmentPrice = Math.round((priceARS * (1 + bestOptions.visa.interes / 100)) / bestOptions.visa.cuotas)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      iphone: "text-gray-700 border-gray-200 bg-gray-50",
      ipad: "text-blue-700 border-blue-200 bg-blue-50",
      mac: "text-gray-700 border-gray-200 bg-gray-50",
      watch: "text-red-700 border-red-200 bg-red-50",
      accesorios: "text-orange-700 border-orange-200 bg-orange-50",
    }
    return colors[category as keyof typeof colors] || "text-gray-700 border-gray-200 bg-gray-50"
  }

  const getConditionColor = (condition: string) => {
    return condition === "nuevo"
      ? "text-green-700 border-green-200 bg-green-50"
      : "text-yellow-700 border-yellow-200 bg-yellow-50"
  }

  const whatsappMessage = `Hola! Me interesa el ${product.name}. ¿Podrías darme más información?`
  const whatsappUrl = `https://wa.me/5491234567890?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <Card
      className={`group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-lg sm:rounded-xl md:rounded-2xl ${className}`}
    >
      <div className="relative">
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <Badge className="bg-yellow-500 text-white border-0 text-[9px] xs:text-xs sm:text-sm px-1 py-0.5 sm:px-2 sm:py-1 font-medium">
              <Star className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 fill-current" />
              <span className="hidden xs:inline">Destacado</span>
              <span className="xs:hidden">★</span>
            </Badge>
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-50 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
          <Image
            src={
              imageError
                ? "/placeholder.svg?height=400&width=400&text=Producto"
                : product.images?.[0] || "/placeholder.svg?height=400&width=400&text=Producto"
            }
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            sizes="(max-width: 320px) 150px, (max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 350px"
          />
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Category */}
        <div className="mb-1 xs:mb-2 sm:mb-3">
          <Badge
            variant="outline"
            className={`text-[9px] xs:text-xs sm:text-sm font-medium px-1 py-0.5 xs:px-2 xs:py-1 ${getCategoryColor(product.category)}`}
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Description - Hidden on very small screens */}
        {product.description && (
          <p className="hidden sm:block text-gray-600 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Condition Badge */}
        <div className="mb-2 xs:mb-3 sm:mb-4">
          <Badge
            variant="outline"
            className={`text-[9px] xs:text-xs sm:text-sm font-medium px-1 py-0.5 xs:px-2 xs:py-1 ${getConditionColor(product.condition)}`}
          >
            {product.condition === "nuevo" ? "Nuevo" : "Seminuevo"}
          </Badge>
        </div>

        {/* Specifications - Only show on tablets and up */}
        {product.specifications && typeof product.specifications === "object" && (
          <div className="hidden md:block mb-3 lg:mb-4">
            <div className="space-y-1">
              {Object.entries(product.specifications)
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-500 capitalize">{key}:</span>
                    <span className="text-gray-700 font-medium truncate ml-2">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-2 xs:mb-3 sm:mb-4">
          <div className="flex flex-wrap items-baseline gap-1 xs:gap-2">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {formatPrice(priceARS)}
            </span>
            {product.originalPrice && product.originalPrice > priceARS && (
              <span className="text-[10px] xs:text-xs sm:text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* USD Price - Show on larger screens */}
          {product.priceUSD && (
            <p className="hidden xs:block text-[10px] xs:text-xs sm:text-sm text-gray-600 mt-1">
              USD ${product.priceUSD.toLocaleString()}
            </p>
          )}

          {/* Installments */}
          <div className="mt-1 xs:mt-2">
            <p className="text-[10px] xs:text-xs sm:text-sm text-green-600 font-medium">
              {bestOptions.visa.cuotas}x {formatPrice(installmentPrice)}
              {bestOptions.visa.interes === 0 && <span className="text-green-700"> sin interés</span>}
            </p>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">Tarjetas Visa/Mastercard</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 sm:gap-3">
          <Button
            asChild
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold rounded-md xs:rounded-lg sm:rounded-xl min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] px-2 xs:px-3 sm:px-4"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 xs:gap-2"
            >
              <MessageCircle className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="xs:hidden">WA</span>
              <span className="hidden xs:inline sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold rounded-md xs:rounded-lg sm:rounded-xl min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] px-2 xs:px-3 sm:px-4 transition-all duration-200 bg-transparent"
          >
            <Link href={`/productos/${product.id}`} className="flex items-center justify-center gap-1 xs:gap-2">
              <ExternalLink className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="xs:hidden">Ver</span>
              <span className="hidden xs:inline">Ver más</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
