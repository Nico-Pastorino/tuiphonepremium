"use client"

import { ProductCard } from "./ProductCard"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className = "" }: ProductGridProps) {
  // Ensure products is always an array to prevent map error
  const safeProducts = Array.isArray(products) ? products : []

  if (safeProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 ${className}`}
    >
      {safeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
