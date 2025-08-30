"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Eye, Zap, Shield, Truck } from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { getEffectiveDollarRate, installmentPlans } = useAdmin()
  const { dollarRate } = useDollarRate()

  // Calcular precio en pesos usando el dólar efectivo del admin
  const effectiveDollarRate = getEffectiveDollarRate()
  const priceARS = product.price_usd ? Math.round(product.price_usd * effectiveDollarRate) : product.price

  // Verificar que installmentPlans existe y tiene la estructura correcta
  const safeInstallmentPlans = installmentPlans || {
    visa: {
      installments_1: 0,
      installments_3: 0,
      installments_6: 15,
      installments_9: 20,
      installments_12: 25,
    },
    naranja: {
      installments_1: 0,
      installments_3: 10,
      installments_6: 18,
      installments_9: 25,
      installments_12: 30,
    },
  }

  // Calcular cuotas
  const calculateInstallment = (price: number, installments: number, rate: number) => {
    if (rate === 0) return price / installments
    const monthlyRate = rate / 100 / 12
    return (
      (price * monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1)
    )
  }

  // Obtener mejores opciones de cuotas
  const getBestInstallmentOptions = () => {
    const options = []

    // Visa/Mastercard sin interés
    if (safeInstallmentPlans.visa?.installments_3 === 0) {
      options.push({
        installments: 3,
        amount: priceARS / 3,
        rate: 0,
        type: "Visa/Mastercard",
      })
    }

    // Visa/Mastercard 6 cuotas
    if (safeInstallmentPlans.visa?.installments_6 > 0) {
      options.push({
        installments: 6,
        amount: calculateInstallment(priceARS, 6, safeInstallmentPlans.visa.installments_6),
        rate: safeInstallmentPlans.visa.installments_6,
        type: "Visa/Mastercard",
      })
    }

    // Naranja 3 cuotas
    if (safeInstallmentPlans.naranja?.installments_3 >= 0) {
      options.push({
        installments: 3,
        amount:
          safeInstallmentPlans.naranja.installments_3 === 0
            ? priceARS / 3
            : calculateInstallment(priceARS, 3, safeInstallmentPlans.naranja.installments_3),
        rate: safeInstallmentPlans.naranja.installments_3,
        type: "Naranja",
      })
    }

    return options.slice(0, 2) // Mostrar máximo 2 opciones
  }

  const installmentOptions = getBestInstallmentOptions()

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
        return { text: "Nuevo", color: "bg-green-100 text-green-800 border-green-200" }
      case "seminuevo":
        return { text: "Seminuevo", color: "bg-blue-100 text-blue-800 border-blue-200" }
      case "usado":
        return { text: "Usado", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      default:
        return { text: "Nuevo", color: "bg-green-100 text-green-800 border-green-200" }
    }
  }

  const conditionBadge = getConditionBadge()

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden h-full hover:scale-[1.02] transform">
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-xl sm:rounded-t-2xl lg:rounded-t-3xl">
          {!imageError ? (
            <Image
              src={product.image_url || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3">📱</div>
                <p className="text-xs sm:text-sm font-medium">Imagen no disponible</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-col gap-1 sm:gap-2">
            <Badge
              className={`text-[9px] xs:text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${conditionBadge.color}`}
            >
              {conditionBadge.text}
            </Badge>
            {product.featured && (
              <Badge className="text-[9px] xs:text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border flex items-center gap-1">
                <Star className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span className="hidden xs:inline">Destacado</span>
                <span className="xs:hidden">★</span>
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-gray-700" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 xs:p-3 sm:p-4 lg:p-6">
          {/* Category */}
          <div className="mb-1 xs:mb-2 sm:mb-3">
            <Badge
              variant="outline"
              className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
            >
              {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs xs:text-sm sm:text-base lg:text-lg xl:text-xl text-gray-900 mb-1 xs:mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Specifications - Hidden on mobile */}
          {product.specifications && (
            <div className="hidden sm:block mb-2 sm:mb-3 lg:mb-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Object.entries(product.specifications)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md"
                    >
                      {value}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-2 xs:mb-3 sm:mb-4">
            <div className="flex flex-col xs:flex-row xs:items-end xs:justify-between gap-1 xs:gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 truncate">
                  {formatPrice(priceARS)}
                </div>
                {product.price_usd && dollarRate && (
                  <div className="text-[10px] xs:text-xs sm:text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                    <span>USD ${product.price_usd.toLocaleString()}</span>
                    <span className="hidden xs:inline">•</span>
                    <span className="text-green-600 font-medium">Dólar: ${effectiveDollarRate.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Installments */}
          {installmentOptions.length > 0 && (
            <div className="mb-3 xs:mb-4 sm:mb-5">
              <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                {installmentOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between text-[10px] xs:text-xs sm:text-sm">
                    <span className="text-gray-600 flex-shrink-0">
                      {option.installments === 1 ? "1 cuota" : `${option.installments} cuotas`}
                    </span>
                    <div className="flex items-center gap-1 xs:gap-2 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{formatPrice(option.amount)}</span>
                      {option.rate === 0 && (
                        <Badge className="text-[8px] xs:text-[9px] sm:text-[10px] bg-green-100 text-green-700 border-green-200 px-1 xs:px-1.5 py-0.5 rounded-md flex-shrink-0">
                          Sin interés
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-5 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span>Garantía</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span>Envío</span>
            </div>
            {product.condition === "nuevo" && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                <span>Nuevo</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-2 sm:gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-xs xs:text-sm sm:text-base py-2 xs:py-2.5 sm:py-3 lg:py-4 px-3 xs:px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] lg:min-h-[48px] touch-manipulation"
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 sm:mr-2" />
                <span className="xs:hidden">Ver</span>
                <span className="hidden xs:inline sm:hidden">Ver</span>
                <span className="hidden sm:inline">Ver detalles</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 xs:flex-initial border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 font-semibold text-xs xs:text-sm sm:text-base py-2 xs:py-2.5 sm:py-3 lg:py-4 px-3 xs:px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 min-h-[32px] xs:min-h-[36px] sm:min-h-[40px] lg:min-h-[48px] touch-manipulation bg-transparent"
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 sm:mr-2" />
                <span className="xs:hidden">WA</span>
                <span className="hidden xs:inline sm:hidden">WhatsApp</span>
                <span className="hidden sm:inline">Consultar</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
