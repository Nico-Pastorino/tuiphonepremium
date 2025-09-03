"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { MessageCircle, Star, Zap, Shield, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { installmentPlans, getEffectiveDollarRate } = useAdmin()
  const { dollarRate } = useDollarRate()
  const [imageError, setImageError] = useState(false)

  // Calcular precio en pesos usando el dólar efectivo del admin
  const effectiveDollarRate = getEffectiveDollarRate()
  const priceARS = product.price_usd ? Math.round(product.price_usd * effectiveDollarRate) : product.price

  // Función para obtener las mejores opciones de cuotas
  const getBestInstallmentOptions = () => {
    if (!installmentPlans) return []

    const options = []

    // Visa/Mastercard - mejor opción sin interés
    if (installmentPlans.visa_mastercard?.installments_3 === 0) {
      options.push({
        cuotas: 3,
        interes: 0,
        tipo: "Visa/MC",
        precio: Math.round(priceARS / 3),
      })
    } else if (installmentPlans.visa_mastercard?.installments_1 === 0) {
      options.push({
        cuotas: 1,
        interes: 0,
        tipo: "Visa/MC",
        precio: priceARS,
      })
    }

    // Naranja - mejor opción
    if (installmentPlans.naranja?.installments_3 !== undefined) {
      const interesNaranja = installmentPlans.naranja.installments_3
      options.push({
        cuotas: 3,
        interes: interesNaranja,
        tipo: "Naranja",
        precio: Math.round((priceARS * (1 + interesNaranja / 100)) / 3),
      })
    }

    return options.slice(0, 2) // Mostrar máximo 2 opciones
  }

  const installmentOptions = getBestInstallmentOptions()

  const isCompact = variant === "compact"

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden h-full">
      <div className="relative">
        {/* Imagen del producto */}
        <div className={`relative ${isCompact ? "aspect-square" : "aspect-[4/3]"} overflow-hidden`}>
          {!imageError ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 flex flex-col gap-1 xs:gap-2">
            {product.featured && (
              <Badge className="bg-yellow-500 text-white text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 xs:px-2 py-0.5 xs:py-1">
                <Star className="w-2 h-2 xs:w-3 xs:h-3 mr-1 fill-current" />
                {isCompact ? "★" : "Destacado"}
              </Badge>
            )}
            {product.condition === "nuevo" && (
              <Badge className="bg-green-500 text-white text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 xs:px-2 py-0.5 xs:py-1">
                <Zap className="w-2 h-2 xs:w-3 xs:h-3 mr-1" />
                {isCompact ? "N" : "Nuevo"}
              </Badge>
            )}
            {product.condition === "seminuevo" && (
              <Badge className="bg-blue-500 text-white text-[9px] xs:text-xs sm:text-sm font-bold px-1.5 xs:px-2 py-0.5 xs:py-1">
                <Shield className="w-2 h-2 xs:w-3 xs:h-3 mr-1" />
                {isCompact ? "S" : "Seminuevo"}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-2 xs:p-3 sm:p-4 lg:p-6">
          {/* Category */}
          <div className="mb-2 sm:mb-3">
            <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 px-2 py-1">
              {product.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description - Solo en desktop */}
          {!isCompact && (
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Specifications - Solo en tablet+ */}
          {!isCompact && product.specifications && (
            <div className="mb-3 sm:mb-4 hidden md:block">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Object.entries(product.specifications)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-[9px] xs:text-xs bg-gray-100 text-gray-700 px-1.5 xs:px-2 py-0.5"
                    >
                      {value}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <div className="flex flex-wrap items-baseline gap-1 xs:gap-2 mb-2 xs:mb-3">
              <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                ${priceARS.toLocaleString("es-AR")}
              </span>
              {product.price_usd && (
                <span className="text-xs xs:text-sm sm:text-base text-gray-500">
                  (USD ${product.price_usd.toLocaleString("es-AR")})
                </span>
              )}
            </div>

            {/* Installment Options */}
            {installmentOptions.length > 0 && (
              <div className="space-y-1 xs:space-y-2">
                {installmentOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between text-xs xs:text-sm">
                    <span className="text-gray-600 flex items-center">
                      <CreditCard className="w-3 h-3 xs:w-4 xs:h-4 mr-1 flex-shrink-0" />
                      {option.cuotas}x ${option.precio.toLocaleString("es-AR")}
                    </span>
                    <Badge
                      variant={option.interes === 0 ? "default" : "secondary"}
                      className="text-[9px] xs:text-xs px-1.5 xs:px-2 py-0.5"
                    >
                      {option.interes === 0 ? "Sin interés" : `${option.interes}%`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg min-h-[32px] xs:min-h-[40px] sm:min-h-[48px] touch-manipulation"
            >
              <Link href={`/productos/${product.id}`}>Ver Detalles</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 xs:flex-none border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 font-semibold text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl transition-all duration-300 min-h-[32px] xs:min-h-[40px] sm:min-h-[48px] touch-manipulation bg-transparent"
            >
              <a
                href={`https://wa.me/5491112345678?text=Hola! Me interesa el ${product.name} - $${priceARS.toLocaleString("es-AR")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full"
              >
                <MessageCircle className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden lg:inline">
                  {isCompact ? "WA" : window.innerWidth >= 640 ? "WhatsApp" : "Consultar"}
                </span>
                <span className="xs:hidden sm:inline lg:hidden">WA</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
