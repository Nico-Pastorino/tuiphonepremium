"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProductSummary } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFQkVCRUYiLz48cGF0aCBkPSJNMTAgODBMMzQgNTZsMTYuMjUgMTYuMjVMMzQgOTBMMTAgODAiem0wLTRMNDIgMzhsMTYuMjUgMTYuMjVMNDIgODRMMTAgNzZ6IiBmaWxsPSIjRURFRUY0IiBvcGFjaXR5PSIwLjciLz48L3N2Zz4="

interface ModernProductCardProps {
  product: ProductSummary
  priority?: boolean
}

export function ModernProductCard({ product, priority = false }: ModernProductCardProps) {
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
    <Card className="group h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative aspect-[5/6] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-white sm:aspect-[4/5]">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            priority={priority}
            quality={70}
            placeholder="blur"
            blurDataURL={IMAGE_PLACEHOLDER}
            className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 320px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-6 sm:gap-4 sm:px-6 sm:pb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
            <Badge
              variant="secondary"
              className={`rounded-full border-0 px-3 py-1 text-[11px] font-semibold ${
                product.condition === "seminuevo" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {product.condition === "seminuevo" ? "Seminuevo" : "Nuevo"}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold leading-tight text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600 sm:text-xl">
            {product.name}
          </h3>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900 sm:text-3xl">${priceInPesos.toLocaleString("es-AR")}</div>
            {priceInDollars !== null && (
              <div className="text-sm text-gray-500 sm:text-base">USD {priceInDollars.toLocaleString("es-AR")}</div>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button className="flex-1 justify-center py-2 text-sm sm:py-3 sm:text-base" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button
              variant="outline"
              className="justify-center px-4 py-2 text-sm sm:flex-1 sm:px-5 sm:py-3 sm:text-base"
              asChild
            >
              <Link href={`/productos/${product.id}`}>Ver mas</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
