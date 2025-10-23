"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { ProductFilters } from "@/components/ProductFilters"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useProducts } from "@/contexts/ProductContext"
import type { Product } from "@/types/product" // <-- Importa el tipo correcto

const INITIAL_VISIBLE = 12
const LOAD_INCREMENT = 12

export default function ProductsPage() {
  const { products, loading } = useProducts() // El contexto ya provee el tipo correcto
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)

  // Obtener filtros de la URL
  useEffect(() => {
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")

    setSelectedCategory(category || null)
    setSelectedCondition(condition || null)
  }, [searchParams])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [selectedCategory, selectedCondition, products])

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
  const visibleProducts = filteredProducts.slice(0, visibleCount)

  const handleFilterChange = (filters: { category?: string | null; condition?: string | null }) => {
    setSelectedCategory(filters.category ?? null)
    setSelectedCondition(filters.condition ?? null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="section-padding">
        <div className="inner-container px-4 sm:px-6 lg:px-0">
          <AnimatedSection animation="fadeUp">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 sm:text-xs">
                  Catálogo completo
                </p>
                <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Productos Apple</h1>
                <p className="text-sm text-gray-600 sm:text-base">
                  Descubre nuestra seleccion completa de productos Apple nuevos y seminuevos
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters((prev) => !prev)}
                className="w-full justify-center gap-2 rounded-xl border-gray-200 text-sm hover:border-gray-300 hover:bg-white sm:hidden"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </AnimatedSection>

          {showFilters && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute inset-y-0 left-0 flex w-full max-w-sm px-4">
                <div className="relative flex-1 overflow-hidden rounded-r-3xl bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      Cerrar
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <ProductFilters
                      category={selectedCategory}
                      condition={selectedCondition}
                      onFilterChange={(filters) => {
                        handleFilterChange(filters)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-10 lg:flex-row-reverse">
            {/* Products Grid */}
            <div className="flex-1">
              <AnimatedSection animation="fadeRight">
                {/* Results Count */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-600 sm:text-base">
                    {loading
                      ? "Cargando productos..."
                      : `Mostrando ${visibleProducts.length} de ${filteredProducts.length} productos`}
                  </p>
                </div>

                {/* Products */}
                {loading ? (
                  <ProductsLoading />
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8 xl:gap-y-10">
                    {visibleProducts.map((product: Product, index: number) => (
                      <AnimatedSection key={product.id} animation="fadeUp" delay={index * 60}>
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
              {!loading && visibleProducts.length < filteredProducts.length && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setVisibleCount((prev) => Math.min(prev + LOAD_INCREMENT, filteredProducts.length))
                    }
                    className="rounded-xl border-gray-200 px-6 py-3 text-sm font-semibold hover:border-gray-300 hover:bg-white"
                  >
                    Mostrar más productos
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar Filters */}
            <div className="hidden lg:block lg:w-80">
              <AnimatedSection animation="fadeLeft" className="lg:sticky lg:top-32">
                <ProductFilters
                  category={selectedCategory}
                  condition={selectedCondition}
                  onFilterChange={handleFilterChange}
                />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


