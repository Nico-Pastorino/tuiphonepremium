"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"

interface ModernProductCardProps {
  product: Product
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const { getEffectiveDollarRate, homeConfig } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const priceInPesos = useMemo(() => {
    if (product.priceUSD !== undefined && product.priceUSD !== null && effectiveDollarRate) {
      return Math.round(product.priceUSD * effectiveDollarRate)
    }
    return product.price
  }, [product.price, product.priceUSD, effectiveDollarRate])

  const priceInDollars = useMemo(() => {
    if (product.priceUSD !== undefined && product.priceUSD !== null) {
      return product.priceUSD
    }
    if (effectiveDollarRate) {
      return Number((product.price / effectiveDollarRate).toFixed(0))
    }
    return null
  }, [product.price, product.priceUSD, effectiveDollarRate])

  const whatsappNumber = useMemo(() => {
    const rawNumber = homeConfig.whatsappNumber?.trim()
    return rawNumber && rawNumber.length > 0 ? rawNumber : "5491112345678"
  }, [homeConfig.whatsappNumber])

  const whatsappLink = useMemo(() => {
    const conditionLabel = product.condition === "seminuevo" ? "Seminuevo" : "Nuevo"
    const message = `Quiero consultar por ${product.name} (${conditionLabel})`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }, [whatsappNumber, product.name, product.condition])

  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-xl sm:rounded-3xl">
      <CardContent className="p-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-white sm:aspect-square">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 320px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"
          />
        </div>
        <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
          <h3 className="text-lg font-semibold leading-tight text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600 sm:text-xl">
            {product.name}
          </h3>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900 sm:text-3xl">${priceInPesos.toLocaleString("es-AR")}</div>
            {priceInDollars !== null && (
              <div className="text-sm text-gray-500 sm:text-base">USD {priceInDollars.toLocaleString("es-AR")}</div>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button className="flex-1 py-2 text-sm sm:py-3 sm:text-base" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button variant="outline" className="px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base" asChild>
              <Link href={`/productos/${product.id}`}>Ver mas</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
