"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Eye, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useAdmin } from "@/contexts/AdminContext"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const { dollarRate } = useDollarRate()
  const { installmentPlans } = useAdmin()

  // Safe access to installment plans with default values
  const getBestInstallmentOptions = () => {
    if (!installmentPlans) {
      return {
        visa: { cuotas: 3, tasa: 0 },
        naranja: { cuotas: 3, tasa: 10 },
      }
    }

    const visaOptions = [
      { cuotas: 1, tasa: installmentPlans.visa?.installments_1 || 0 },
      { cuotas: 3, tasa: installmentPlans.visa?.installments_3 || 0 },
      { cuotas: 6, tasa: installmentPlans.visa?.installments_6 || 15 },
      { cuotas: 9, tasa: installmentPlans.visa?.installments_9 || 20 },
      { cuotas: 12, tasa: installmentPlans.visa?.installments_12 || 25 },
    ]

    const naranjaOptions = [
      { cuotas: 1, tasa: installmentPlans.naranja?.installments_1 || 0 },
      { cuotas: 3, tasa: installmentPlans.naranja?.installments_3 || 10 },
      { cuotas: 6, tasa: installmentPlans.naranja?.installments_6 || 18 },
      { cuotas: 9, tasa: installmentPlans.naranja?.installments_9 || 22 },
      { cuotas: 12, tasa: installmentPlans.naranja?.installments_12 || 28 },
    ]

    // Find best options (lowest interest rate with reasonable installments)
    const bestVisa = visaOptions.find((opt) => opt.cuotas >= 3 && opt.tasa === 0) || visaOptions[1]
    const bestNaranja = naranjaOptions.reduce((best, current) =>
      current.cuotas >= 3 && current.tasa < best.tasa ? current : best,
    )

    return {
      visa: bestVisa,
      naranja: bestNaranja,
    }
  }

  const calculatePrice = () => {
    if (!product.price_usd || !dollarRate) {
      return {
        ars: product.price || 0,
        usd: product.price_usd || 0,
      }
    }

    const arsPrice = product.price_usd * dollarRate
    return {
      ars: Math.round(arsPrice),
      usd: product.price_usd,
    }
  }

  const calculateInstallment = (price: number, cuotas: number, tasa: number) => {
    const monthlyRate = tasa / 100 / 12
    if (monthlyRate === 0) return price / cuotas

    const installmentAmount =
      (price * (monthlyRate * Math.pow(1 + monthlyRate, cuotas))) / (Math.pow(1 + monthlyRate, cuotas) - 1)
    return installmentAmount
  }

  const prices = calculatePrice()
  const bestOptions = getBestInstallmentOptions()

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] rounded-xl xs:rounded-2xl lg:rounded-3xl">
      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold text-[9px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-md xs:rounded-lg">
            <Star className="w-2 h-2 xs:w-3 h-3 sm:w-4 h-4 mr-1 fill-current" />
            <span className="hidden xs:inline">Destacado</span>
            <span className="xs:hidden">★</span>
          </Badge>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 z-10 w-6 h-6 xs:w-8 h-8 sm:w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <Heart
          className={`w-3 h-3 xs:w-4 h-4 sm:w-5 h-5 transition-colors duration-300 ${
            isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl xs:rounded-t-2xl lg:rounded-t-3xl">
        <Image
          src={product.image_url || "/placeholder.svg?height=400&width=400"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 320px) 280px, (max-width: 640px) 300px, (max-width: 768px) 350px, (max-width: 1024px) 280px, 320px"
        />
      </div>

      {/* Content */}
      <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Category */}
        <div className="mb-1 xs:mb-2 sm:mb-3">
          <Badge
            variant="outline"
            className="text-[9px] xs:text-xs sm:text-sm font-medium text-blue-600 border-blue-200 bg-blue-50 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-md xs:rounded-lg"
          >
            {product.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-3 line-clamp-2 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-tight">
          {product.name}
        </h3>

        {/* Description - Hidden on very small screens */}
        <p className="hidden sm:block text-gray-600 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Specifications - Only on tablets and up */}
        {product.specifications && (
          <div className="hidden md:block mb-3 lg:mb-4">
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {product.specifications.slice(0, 2).map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 bg-gray-100 text-gray-700 rounded-md"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mb-2 xs:mb-3 sm:mb-4 md:mb-6">
          <div className="flex flex-wrap items-baseline gap-1 xs:gap-2 sm:gap-3 mb-1 xs:mb-2 sm:mb-3">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              ${prices.ars.toLocaleString()}
            </span>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-500 font-medium">
              USD ${prices.usd}
            </span>
          </div>

          {/* Installments */}
          <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
            {/* Visa/Mastercard */}
            <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-green-600 font-medium">
              {bestOptions.visa.cuotas === 1
                ? "1 cuota sin interés"
                : `${bestOptions.visa.cuotas} cuotas de $${Math.round(calculateInstallment(prices.ars, bestOptions.visa.cuotas, bestOptions.visa.tasa)).toLocaleString()}`}
              <span className="text-gray-500 ml-1">Visa/MC</span>
            </div>

            {/* Naranja */}
            <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-orange-600 font-medium">
              {bestOptions.naranja.cuotas === 1
                ? "1 cuota Naranja"
                : `${bestOptions.naranja.cuotas} cuotas de $${Math.round(calculateInstallment(prices.ars, bestOptions.naranja.cuotas, bestOptions.naranja.tasa)).toLocaleString()}`}
              <span className="text-gray-500 ml-1">Naranja</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 sm:gap-3">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-[10px] xs:text-xs sm:text-sm md:text-base min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px]"
            asChild
          >
            <Link href={`https://wa.me/1234567890?text=Hola! Me interesa el ${product.name}`}>
              <MessageCircle className="w-2.5 h-2.5 xs:w-3 h-3 sm:w-4 h-4 md:w-5 h-5 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="xs:hidden">WA</span>
              <span className="hidden xs:inline sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Consultar</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 xs:flex-none border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 bg-white hover:bg-gray-50 text-[10px] xs:text-xs sm:text-sm md:text-base min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] md:min-h-[48px] xs:min-w-[80px] sm:min-w-[100px]"
            asChild
          >
            <Link href={`/productos/${product.id}`}>
              <Eye className="w-2.5 h-2.5 xs:w-3 h-3 sm:w-4 h-4 md:w-5 h-5 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Ver</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
