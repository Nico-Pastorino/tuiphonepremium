"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"
import { useDollarRate } from "@/hooks/use-dollar-rate"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { dollarRate } = useDollarRate()

  const priceInPesos = useMemo(() => {
    if (product.priceUSD !== undefined && product.priceUSD !== null && dollarRate?.blue) {
      return Math.round(product.priceUSD * dollarRate.blue)
    }
    return product.price
  }, [product.price, product.priceUSD, dollarRate?.blue])

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{product.category}</p>
          </div>
          <div className="text-2xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</div>
          <div className="flex gap-2">
            <Button className="flex-1" asChild>
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/productos/${product.id}`}>
                Ver mas
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
