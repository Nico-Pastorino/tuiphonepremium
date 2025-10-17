"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"
import { useAdmin } from "@/contexts/AdminContext"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { getEffectiveDollarRate } = useAdmin()
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

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-gray-50">
          <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
        </div>
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</div>
            {priceInDollars !== null && (
              <div className="text-sm text-gray-500">USD {priceInDollars.toLocaleString("es-AR")}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" asChild>
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/productos/${product.id}`}>Ver más</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
