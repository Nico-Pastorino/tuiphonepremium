"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Eye, Zap, Shield, MessageCircle, ChevronDown, CreditCard, Smartphone } from "lucide-react"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useAdmin } from "@/contexts/AdminContext"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { dollarRate } = useDollarRate()
  const { dollarConfig, getInstallmentPlansByCategory } = useAdmin()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [naranjaOpen, setNaranjaOpen] = useState(false)
  const [tarjetasOpen, setTarjetasOpen] = useState(false)

  // Calcular precio en pesos usando la API del dólar + markup del admin
  const priceInPesos =
    dollarRate && product.priceUSD
      ? Math.round(product.priceUSD * (dollarRate.blue + dollarConfig.markup))
      : product.price

  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  // Obtener planes de cuotas configurados por el admin
  const naranjaPlans = getInstallmentPlansByCategory("naranja")
  const tarjetasPlans = getInstallmentPlansByCategory("visa-mastercard")

  // Calcular cuotas usando los planes configurados
  const calculateInstallments = (plans: any[]) => {
    return plans.map((plan) => ({
      cuotas: plan.months,
      cuota: Math.round((priceInPesos * (1 + plan.interestRate / 100)) / plan.months),
    }))
  }

  const naranjaInstallments = calculateInstallments(naranjaPlans)
  const tarjetasInstallments = calculateInstallments(tarjetasPlans)

  const cardVariants = {
    default:
      "group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full",
    compact:
      "group relative overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 rounded-md sm:rounded-lg md:rounded-xl w-full max-w-full",
    featured:
      "group relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl md:rounded-3xl w-full max-w-full",
  }

  return (
    <Card className={cardVariants[variant]}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
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
              sizes="(max-width: 320px) 280px, (max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-1 sm:top-2 md:top-3 left-1 sm:left-2 md:left-3 flex flex-col gap-0.5 sm:gap-1 md:gap-2">
            {product.condition === "seminuevo" && (
              <Badge className="bg-emerald-500/90 text-white font-medium px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm text-[9px] sm:text-xs md:text-sm">
                <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">Seminuevo</span>
                <span className="xs:hidden">Semi</span>
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-amber-500/90 text-white font-medium px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm text-[9px] sm:text-xs md:text-sm">
                <span className="hidden xs:inline">Destacado</span>
                <span className="xs:hidden">★</span>
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500/90 text-white font-bold px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm text-[9px] sm:text-xs md:text-sm">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="absolute bottom-1 sm:bottom-2 md:bottom-3 left-1 sm:left-2 md:left-3">
            <div className="px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium backdrop-blur-sm flex items-center gap-0.5 sm:gap-1 bg-green-500/20 text-green-700 border border-green-500/30">
              <Shield className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Disponible</span>
              <span className="sm:hidden">✓</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
          {/* Category */}
          <div className="mb-1 sm:mb-2 md:mb-3">
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1"
            >
              {product.category.toUpperCase()}
            </Badge>
          </div>

          {/* Title */}
          <Link href={`/productos/${product.id}`}>
            <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 md:mb-4 text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Key Specifications */}
          {variant !== "compact" && (
            <div className="hidden md:grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4 lg:mb-5">
              {Object.entries(product.specifications || {})
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-md sm:rounded-lg p-1 sm:p-2">
                    <div className="text-[9px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1 truncate">{key}</div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-gray-900 font-semibold truncate">
                      {value}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Price Section - Ultra Responsive */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
            {/* Precio Principal */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
              <div className="flex flex-col gap-1 sm:gap-2">
                {/* Precio en Pesos */}
                <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-none">
                    ${priceInPesos.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">ARS</span>
                  {originalPrice && (
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 line-through">
                      ${originalPrice.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>

                {/* Precio en USD */}
                {product.priceUSD && (
                  <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-green-700 leading-none">
                      USD ${product.priceUSD}
                    </span>
                    <span className="text-[9px] sm:text-xs text-gray-500">Dólares</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cuotas Naranja */}
            {naranjaInstallments.length > 0 && (
              <Collapsible open={naranjaOpen} onOpenChange={setNaranjaOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-md sm:rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-orange-700 truncate">
                        Cuotas Naranja
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4 text-orange-600 transition-transform flex-shrink-0",
                        naranjaOpen && "rotate-180",
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 sm:mt-2">
                  <div className="space-y-1 sm:space-y-2 bg-orange-50 rounded-md sm:rounded-lg p-2 sm:p-3 border border-orange-200">
                    {naranjaInstallments.map((plan) => (
                      <div
                        key={plan.cuotas}
                        className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm py-0.5 sm:py-1"
                      >
                        <span className="text-orange-700 font-medium truncate">{plan.cuotas} cuotas</span>
                        <span className="font-bold text-orange-800 text-[11px] sm:text-sm md:text-base flex-shrink-0">
                          ${plan.cuota.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Cuotas Tarjetas */}
            {tarjetasInstallments.length > 0 && (
              <Collapsible open={tarjetasOpen} onOpenChange={setTarjetasOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 truncate">
                        Cuotas Tarjetas
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4 text-blue-600 transition-transform flex-shrink-0",
                        tarjetasOpen && "rotate-180",
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 sm:mt-2">
                  <div className="space-y-1 sm:space-y-2 bg-blue-50 rounded-md sm:rounded-lg p-2 sm:p-3 border border-blue-200">
                    {tarjetasInstallments.map((plan) => (
                      <div
                        key={plan.cuotas}
                        className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm py-0.5 sm:py-1"
                      >
                        <span className="text-blue-700 font-medium truncate">{plan.cuotas} cuotas</span>
                        <span className="font-bold text-blue-800 text-[11px] sm:text-sm md:text-base flex-shrink-0">
                          ${plan.cuota.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 sm:gap-2 md:gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-[10px] sm:text-xs md:text-sm lg:text-base min-h-[32px] sm:min-h-[40px] md:min-h-[48px]"
              asChild
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden md:inline">Consultar</span>
                <span className="xs:hidden sm:inline md:hidden">WhatsApp</span>
                <span className="inline xs:hidden">WA</span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent min-h-[32px] sm:min-h-[40px] md:min-h-[48px] flex-shrink-0"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
