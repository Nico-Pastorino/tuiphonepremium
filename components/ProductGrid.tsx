"use client"

import { ModernProductCard } from "@/components/ModernProductCard"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
}

export function ProductGrid({ products, title, subtitle, showViewAll = false }: ProductGridProps) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            {title && <h2 className="text-5xl font-bold text-gray-900 mb-6">{title}</h2>}
            {subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
          </AnimatedSection>
        )}

        {safeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {safeProducts.map((product, index) => (
              <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                <ModernProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay productos disponibles en este momento.</p>
          </div>
        )}

        {showViewAll && safeProducts.length > 0 && (
          <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-16">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Ver todos los productos
            </button>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
