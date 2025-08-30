"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import type { Product } from "@/types/product"
import { Star, MessageCircle, Eye, Zap, Shield, Truck } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { getInstallmentPlansByCategory } = useAdmin()
  const { dollarRate } = useDollarRate()

  // Obtener planes de cuotas
  const visaPlans = getInstallmentPlansByCategory("visa-mastercard").filter((p) => p.isActive)
  const naranjaPlans = getInstallmentPlansByCategory("naranja").filter((p) => p.isActive)

  // Calcular cuota más baja
  const calculateInstallment = (price: number, months: number, rate: number) => {
    const monthlyRate = rate / 100 / 12
    if (rate === 0) return price / months
    return (price * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const getBestInstallment = () => {
    const allPlans = [...visaPlans, ...naranjaPlans]
    if (allPlans.length === 0) return null

    const installments = allPlans.map((plan) => ({
      ...plan,
      monthlyPayment: calculateInstallment(product.price, plan.months, plan.interestRate),
    }))

    return installments.reduce((best, current) => (current.monthlyPayment < best.monthlyPayment ? current : best))
  }

  const bestInstallment = getBestInstallment()

  const handleWhatsApp = () => {
    const message = `Hola! Me interesa el ${product.name} - $${product.price.toLocaleString("es-AR")}`
    const whatsappUrl = `https://wa.me/5491234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-lg bg-white/95 backdrop-blur-sm">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={
            imageError
              ? "/placeholder.svg?height=400&width=400"
              : product.images[0] || "/placeholder.svg?height=400&width=400"
          }
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 xs:top-3 xs:left-3 sm:top-4 sm:left-4 flex flex-col gap-1 xs:gap-2">
          {product.featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-[9px] xs:text-xs sm:text-sm px-1 xs:px-2 py-0.5 xs:py-1 font-medium shadow-lg">
              <Star className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 fill-current" />
              <span className="hidden xs:inline">Destacado</span>
              <span className="xs:hidden">★</span>
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-[9px] xs:text-xs sm:text-sm px-1 xs:px-2 py-0.5 xs:py-1 font-medium shadow-sm ${
              product.condition === "nuevo"
                ? "bg-green-50 text-green-700 border-green-200"
                : product.condition === "seminuevo"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {product.condition}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/productos/${product.id}`}>
            <Button
              size="sm"
              variant="secondary"
              className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <Eye className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-gray-700" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Category */}
        <div className="mb-1 xs:mb-2 sm:mb-3">
          <Badge
            variant="outline"
            className="text-[9px] xs:text-xs sm:text-sm font-medium text-blue-600 border-blue-200 bg-blue-50 px-1 xs:px-2 py-0.5 xs:py-1"
          >
            {product.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-3 line-clamp-2 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-tight">
          {product.name}
        </h3>

        {/* Description - Hidden on mobile */}
        {product.description && (
          <p className="text-gray-600 mb-2 xs:mb-3 sm:mb-4 line-clamp-2 text-[10px] xs:text-xs sm:text-sm hidden sm:block">
            {product.description}
          </p>
        )}

        {/* Specifications - Only on tablets+ */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-2 xs:mb-3 sm:mb-4 hidden md:block">
            <div className="flex flex-wrap gap-1 xs:gap-2">
              {Object.entries(product.specifications)
                .slice(0, 2)
                .map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-[9px] xs:text-xs bg-gray-50 text-gray-600 border-gray-200 px-1 xs:px-2 py-0.5"
                  >
                    {value}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-2 xs:mb-3 sm:mb-4 space-y-1 xs:space-y-2">
          <div className="flex flex-wrap items-baseline gap-1 xs:gap-2">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              ${product.price.toLocaleString("es-AR")}
            </span>
            {product.priceUSD && (
              <span className="text-[10px] xs:text-xs sm:text-sm text-green-600 font-medium">
                USD ${product.priceUSD}
              </span>
            )}
          </div>

          {/* Installments */}
          {bestInstallment && (
            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
              <span className="font-medium">
                {bestInstallment.months}x ${Math.round(bestInstallment.monthlyPayment).toLocaleString("es-AR")}
              </span>
              <span className="text-blue-600 ml-1 xs:ml-2">
                {bestInstallment.category === "naranja" ? "Naranja" : "Tarjetas"}
              </span>
            </div>
          )}
        </div>

        {/* Features - Only on larger screens */}
        <div className="mb-3 xs:mb-4 sm:mb-6 hidden lg:block">
          <div className="flex items-center gap-2 xs:gap-3 text-[10px] xs:text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-2 h-2 xs:w-3 xs:h-3" />
              <span>Garantía</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-2 h-2 xs:w-3 xs:h-3" />
              <span>Envío</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-2 h-2 xs:w-3 xs:h-3" />
              <span>Original</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 xs:gap-2 sm:gap-3">
          <Button
            onClick={handleWhatsApp}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-medium px-2 xs:px-3 sm:px-4 py-1 xs:py-2 sm:py-3 rounded-md xs:rounded-lg sm:rounded-xl min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 xs:mr-2 flex-shrink-0" />
            <span className="xs:hidden">WA</span>
            <span className="hidden xs:inline sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">Consultar</span>
          </Button>

          <Link href={`/productos/${product.id}`} className="flex-shrink-0">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 text-[10px] xs:text-xs sm:text-sm md:text-base font-medium px-2 xs:px-3 sm:px-4 py-1 xs:py-2 sm:py-3 rounded-md xs:rounded-lg sm:rounded-xl min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Eye className="w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Ver</span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
