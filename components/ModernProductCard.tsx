"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProductSummary } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"
import { resolveImageUrl } from "@/lib/image-cdn"

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFQkVCRUYiLz48cGF0aCBkPSJNMTAgODBMMzQgNTZsMTYuMjUgMTYuMjVMMzQgOTBMMTAgODAiem0wLTRMNDIgMzhsMTYuMjUgMTYuMjVMNDIgODRMMTAgNzZ6IiBmaWxsPSIjRURFRUY0IiBvcGFjaXR5PSIwLjciLz48L3N2Zz4="

interface ModernProductCardProps {
  product: ProductSummary
  priority?: boolean
}

export function ModernProductCard({ product, priority = false }: ModernProductCardProps) {
  const { getEffectiveDollarRate, homeConfig, getActiveInstallmentPromotions } = useAdmin()
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

  const activePromotions = getActiveInstallmentPromotions()
  const highlightedPromotion = useMemo(() => {
    if (!Number.isFinite(priceInPesos) || priceInPesos <= 0 || activePromotions.length === 0) {
      return null
    }

    const entries: Array<{
      name: string
      months: number
      interestRate: number
      monthlyAmount: number
    }> = []

    for (const promotion of activePromotions) {
      for (const term of promotion.terms) {
        const totalAmount = priceInPesos * (1 + term.interestRate / 100)
        const monthlyAmount = term.months > 0 ? totalAmount / term.months : totalAmount
        entries.push({
          name: promotion.name,
          months: term.months,
          interestRate: term.interestRate,
          monthlyAmount,
        })
      }
    }

    if (entries.length === 0) {
      return null
    }

    return entries.reduce((best, current) =>
      current.monthlyAmount < best.monthlyAmount ? current : best,
    )
  }, [activePromotions, priceInPesos])

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
            src={resolveImageUrl(product.images[0]) || "/placeholder.svg?height=400&width=400"}
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
        <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-6 sm:gap-5 sm:px-6 sm:pb-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
            {product.isOutlet && (
              <Badge
                variant="secondary"
                className="rounded-full border-0 bg-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-700"
              >
                Outlet
              </Badge>
            )}
            {!product.isOutlet && (
              <Badge
                variant="secondary"
                className={`rounded-full border-0 px-3 py-1 text-[11px] font-semibold ${
                  product.condition === "seminuevo" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {product.condition === "seminuevo" ? "Seminuevo" : "Nuevo"}
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold leading-tight text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600 sm:text-lg lg:text-xl">
            {product.name}
          </h3>
          {product.isOutlet && (
            <div className="text-xs text-gray-600 line-clamp-2">
              {product.outletDefects && product.outletDefects.length > 0
                ? product.outletDefects.slice(0, 2).join(" · ")
                : "Equipo con detalles esteticos o funcionales"}
            </div>
          )}
          <div className="space-y-2">
            <div className="text-[clamp(18px,2.1vw,28px)] font-bold tracking-tight leading-tight tabular-nums text-gray-900">
              ${priceInPesos.toLocaleString("es-AR")}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {priceInDollars !== null && (
                <div className="text-[11px] text-gray-500 sm:text-xs">
                  USD {priceInDollars.toLocaleString("es-AR")}
                </div>
              )}
              {highlightedPromotion && (
                <div className="inline-flex items-center whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 sm:text-xs">
                  Promociones activas
                </div>
              )}
            </div>
          </div>
          <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full min-w-0 justify-center px-3 py-2 text-[12px] leading-tight sm:px-3 sm:py-2.5 sm:text-xs"
              asChild
            >
              <Link href={`/productos/${product.id}`} prefetch={false}>
                Ver mas
              </Link>
            </Button>
            <Button className="w-full min-w-0 justify-center px-3 py-2 text-[12px] leading-tight sm:px-3 sm:py-2.5 sm:text-xs" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
