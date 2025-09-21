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
  const { getEffectiveDollarRate } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const priceInPesos = useMemo(() => {
    if (product.priceUSD !== undefined && product.priceUSD !== null && effectiveDollarRate) {
      return Math.round(product.priceUSD * effectiveDollarRate)
    }
    return product.price
  }, [product.price, product.priceUSD, effectiveDollarRate])

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all rounded-3xl">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-white">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 capitalize">{product.category}</p>
          </div>
          <div className="text-3xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</div>
          <div className="flex gap-3">
            <Button className="flex-1" asChild>
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/productos/${product.id}`}>Ver mas</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
