"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { ProductFilters } from "@/components/ProductFilters"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useProducts } from "@/contexts/ProductContext"
import type { Product } from "@/types/product" // <-- Importa el tipo correcto

export default function ProductsPage() {
  // Tipado explícito para products
  const { products } = useProducts() // El contexto ya provee el tipo correcto
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Obtener filtros de la URL
  useEffect(() => {
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")

    setSelectedCategory(category || null)
    setSelectedCondition(condition || null)
  }, [searchParams])

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter((product: Product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesCondition = !selectedCondition || product.condition === selectedCondition

      return matchesCategory && matchesCondition
    })
    .sort(
      (a: Product, b: Product) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const handleFilterChange = (filters: { category?: string | null; condition?: string | null }) => {
    setSelectedCategory(filters.category ?? null)
    setSelectedCondition(filters.condition ?? null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-28 pb-12 sm:pt-32">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Productos Apple</h1>
                <p className="text-gray-600">
                  Descubre nuestra selecci??n completa de productos Apple nuevos y seminuevos
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters((prev) => !prev)}
                className="sm:hidden w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </AnimatedSection>

          {(selectedCategory || selectedCondition) && (
            <AnimatedSection animation="fadeUp" delay={150}>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                {selectedCategory && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="h-7 px-2 text-xs"
                  >
                    {selectedCategory} ?-
                  </Button>
                )}
                {selectedCondition && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedCondition(null)}
                    className="h-7 px-2 text-xs"
                  >
                    {selectedCondition} ?-
                  </Button>
                )}
              </div>
            </AnimatedSection>
          )}

          <div className="flex flex-col gap-8 lg:flex-row-reverse">
            {/* Products Grid */}
            <div className="flex-1">
              <AnimatedSection animation="fadeRight">
                {/* Results Count */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-gray-600">
                    Mostrando {filteredProducts.length} de {products.length} productos
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="hidden lg:inline-flex"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Ajustar filtros
                  </Button>
                </div>

                {/* Products */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product: Product, index: number) => (
                      <AnimatedSection key={product.id} animation="fadeUp" delay={index * 50}>
                        <ModernProductCard product={product} />
                      </AnimatedSection>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Filter className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                    <p className="text-gray-600 mb-6">Intenta ajustar los filtros seleccionados</p>
                    <Button
                      onClick={() => {
                        setSelectedCategory(null)
                        setSelectedCondition(null)
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </AnimatedSection>
            </div>

            {/* Sidebar Filters */}
            <div className={`lg:w-80 w-full ${showFilters ? "block" : "hidden lg:block"}`}>
              <AnimatedSection animation="fadeLeft" className="lg:sticky lg:top-32">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    Cerrar
                  </Button>
                </div>
                <ProductFilters onFilterChange={handleFilterChange} />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

