"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Eye } from "lucide-react"
import type { Product } from "@/types/product"
import { useAppState } from "@/hooks/use-app-state"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
  showQuickActions?: boolean
}

export function ProductCard({ product }: ProductCardProps) {
  const priceInPesos = product.price

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Image */}
      <div className="relative aspect-square mb-4">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Title */}
      <h2 className="font-bold text-xl mb-3 text-gray-900 leading-tight">
        {product.name}
      </h2>

      {/* Price section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          disabled={product.stock === 0}
          asChild
        >
          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
            Consultar
          </a>
        </Button>
        <Button
          variant="outline"
          className="px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent"
          asChild
        >
          <Link href={`/productos/${product.id}`}>
            Ver más
          </Link>
        </Button>
      </div>
    </div>
  )
}
