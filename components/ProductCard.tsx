"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ProductSummary } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"
import { resolveImageUrl } from "@/lib/image-cdn"

interface ProductCardProps {
  product: ProductSummary
  variant?: "default" | "compact" | "outlet"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
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

  const basePadding = variant === "compact" ? "p-3 sm:p-4" : "p-4"
  const showOutlet = variant === "outlet"
  const outletDefects = (product.outletDefects ?? []).filter((item) => item && item.trim().length > 0)
  const outletBattery =
    product.outletBatteryPercent !== null && product.outletBatteryPercent !== undefined
      ? Math.round(product.outletBatteryPercent)
      : null
  const outletDetailText =
    outletDefects.length > 0
      ? outletDefects.slice(0, 2).join(" · ")
      : product.outletNotes
        ? product.outletNotes
        : "Detalle disponible en la ficha"

  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-gray-50 sm:aspect-[4/5]">
          <Image
            src={resolveImageUrl(product.images[0]) || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain drop-shadow-xl transition-transform duration-500 scale-[1.12] group-hover:scale-[1.18]"
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 82vw"
          />
        </div>
        <div className={`space-y-3 ${basePadding}`}>
          {showOutlet && (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-semibold text-orange-700">Outlet</span>
              {outletBattery !== null && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700">
                  Bateria {outletBattery}%
                </span>
              )}
              {product.outletGrade && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700 capitalize">
                  {product.outletGrade}
                </span>
              )}
            </div>
          )}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 sm:text-lg">{product.name}</h3>
          {showOutlet && (
            <p className="text-xs text-gray-600 line-clamp-2">{outletDetailText}</p>
          )}
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">${priceInPesos.toLocaleString("es-AR")}</div>
            {priceInDollars !== null && (
              <div className="text-xs text-gray-500 sm:text-sm">USD {priceInDollars.toLocaleString("es-AR")}</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap"
              asChild
            >
              <Link href={`/productos/${product.id}`} prefetch={false}>
                Ver mas
              </Link>
            </Button>
            <Button className="w-full px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap" asChild>
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
