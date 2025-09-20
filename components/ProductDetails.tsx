"use client"

import { useMemo } from "react"
import { Product } from "@/types/product"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAdmin } from "@/contexts/AdminContext"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { getEffectiveDollarRate } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()

  const priceInPesos = useMemo(() => {
    if (product.priceUSD !== undefined && product.priceUSD !== null && effectiveDollarRate) {
      return Math.round(product.priceUSD * effectiveDollarRate)
    }
    return product.price
  }, [product.price, product.priceUSD, effectiveDollarRate])

  return (
    <div className="p-6 space-y-6">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
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
          <Link href={`/productos/${product.id}`}>
            Ver mas
          </Link>
        </Button>
      </div>
    </div>
  )
}

