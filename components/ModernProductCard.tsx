"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MessageCircle, ChevronDown, ChevronUp, CreditCard, Smartphone } from "lucide-react"
import type { Product } from "@/types/product"

interface ModernProductCardProps {
  product: Product
}

// Configuración de cuotas con interés
const installmentOptions = {
  naranja: [
    { months: 3, rate: 0, color: "bg-orange-500" },
    { months: 6, rate: 0.15, color: "bg-orange-600" },
    { months: 9, rate: 0.25, color: "bg-orange-700" },
    { months: 12, rate: 0.35, color: "bg-orange-800" },
  ],
  tarjetas: [
    { months: 3, rate: 0, color: "bg-blue-500" },
    { months: 6, rate: 0.2, color: "bg-blue-600" },
    { months: 9, rate: 0.3, color: "bg-blue-700" },
    { months: 12, rate: 0.4, color: "bg-blue-800" },
  ],
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const [naranjaOpen, setNaranjaOpen] = useState(false)
  const [tarjetasOpen, setTarjetasOpen] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatUSD = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateInstallment = (price: number, months: number, rate: number) => {
    const totalWithInterest = price * (1 + rate)
    return totalWithInterest / months
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "nuevo":
        return "bg-green-100 text-green-800"
      case "seminuevo":
        return "bg-yellow-100 text-yellow-800"
      case "usado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "nuevo":
        return "Nuevo"
      case "seminuevo":
        return "Seminuevo"
      case "usado":
        return "Usado"
      default:
        return condition
    }
  }

  const handleWhatsApp = () => {
    const message = `Hola! Me interesa el ${product.name} - ${formatPrice(product.price)}`
    const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative">
        {/* Imagen del producto */}
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className={getConditionColor(product.condition)} variant="secondary">
            {getConditionText(product.condition)}
          </Badge>
          {product.featured && (
            <Badge className="bg-purple-100 text-purple-800" variant="secondary">
              Destacado
            </Badge>
          )}
        </div>

        {/* Descuento */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Información del producto */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>

        {/* Precios */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.priceUSD && <span className="text-lg text-gray-600">{formatUSD(product.priceUSD)}</span>}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">Disponible</span>
        </div>

        {/* Opciones de cuotas */}
        <div className="space-y-3">
          {/* Naranja */}
          <Collapsible open={naranjaOpen} onOpenChange={setNaranjaOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10 border-orange-200 hover:bg-orange-50 text-orange-700 bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="font-medium">Naranja</span>
                </div>
                {naranjaOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {installmentOptions.naranja.map((option) => (
                <div
                  key={option.months}
                  className="flex justify-between items-center p-2 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <span className="text-sm font-medium text-orange-800">
                    {option.months} cuotas {option.rate === 0 ? "sin interés" : `(${(option.rate * 100).toFixed(0)}%)`}
                  </span>
                  <span className="text-sm font-bold text-orange-900">
                    {formatPrice(calculateInstallment(product.price, option.months, option.rate))}
                  </span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Tarjetas */}
          <Collapsible open={tarjetasOpen} onOpenChange={setTarjetasOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10 border-blue-200 hover:bg-blue-50 text-blue-700 bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">Tarjetas</span>
                </div>
                {tarjetasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {installmentOptions.tarjetas.map((option) => (
                <div
                  key={option.months}
                  className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <span className="text-sm font-medium text-blue-800">
                    {option.months} cuotas {option.rate === 0 ? "sin interés" : `(${(option.rate * 100).toFixed(0)}%)`}
                  </span>
                  <span className="text-sm font-bold text-blue-900">
                    {formatPrice(calculateInstallment(product.price, option.months, option.rate))}
                  </span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Botón de WhatsApp */}
        <Button onClick={handleWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-11">
          <MessageCircle className="w-4 h-4 mr-2" />
          Consultar por WhatsApp
        </Button>
      </CardContent>
    </Card>
  )
}
