"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/product"

interface ModernProductCardProps {
  product: Product
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const priceInPesos = product.price

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl">
      <CardContent className="p-0">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-3xl">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400&query=iPhone"}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
          />

          {/* Stock indicator */}
          <div className="absolute bottom-4 left-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                product.stock > 0
                  ? "bg-green-500/20 text-green-700 border border-green-500/30"
                  : "bg-red-500/20 text-red-700 border border-red-500/30"
              }`}
            >
              {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-bold text-xl mb-3 text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Price section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              disabled={product.stock === 0}
              asChild
            >
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                Consultar
              </a>
            </Button>
            <Button
              variant="outline"
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent"
              asChild
            >
              <Link href={`/productos/${product.id}`}>
                Ver más
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}