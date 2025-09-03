"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { ProductFilters } from "@/components/ProductFilters"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List } from "lucide-react"
import { useProducts } from "@/contexts/ProductContext"

export default function ProductsPage() {
  const { products } = useProducts()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Obtener filtros de la URL
  useEffect(() => {
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")

    if (category) setSelectedCategory(category)
    if (condition) setSelectedCondition(condition)
  }, [searchParams])

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesCondition = !selectedCondition || product.condition === selectedCondition

      return matchesSearch && matchesCategory && matchesCondition
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const handleFilterChange = (filters: any) => {
    setSelectedCategory(filters.category)
    setSelectedCondition(filters.condition)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <MinimalNavbar />

      <div className="pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection animation="fadeUp">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Productos Apple</h1>
              <p className="text-gray-600">
                Descubre nuestra selección completa de productos Apple nuevos y seminuevos
              </p>
            </div>
          </AnimatedSection>

          {/* Search and Filters */}
          <AnimatedSection animation="fadeUp" delay={200}>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre A-Z</SelectItem>
                      <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                      <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                      <SelectItem value="newest">Más Recientes</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Filter Toggle */}
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedCondition) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">Filtros activos:</span>
                  {selectedCategory && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="h-6 px-2 text-xs"
                    >
                      {selectedCategory} ×
                    </Button>
                  )}
                  {selectedCondition && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedCondition(null)}
                      className="h-6 px-2 text-xs"
                    >
                      {selectedCondition} ×
                    </Button>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className={`w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
              <AnimatedSection animation="fadeLeft">
                <ProductFilters onFilterChange={handleFilterChange} />
              </AnimatedSection>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <AnimatedSection animation="fadeRight">
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Mostrando {filteredProducts.length} de {products.length} productos
                  </p>
                </div>

                {/* Products */}
                {filteredProducts.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"
                    }
                  >
                    {filteredProducts.map((product, index) => (
                      <AnimatedSection key={product.id} animation="fadeUp" delay={index * 50}>
                        <ModernProductCard product={product} />
                      </AnimatedSection>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                    <p className="text-gray-600 mb-6">Intenta ajustar tus filtros o términos de búsqueda</p>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
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
          </div>
        </div>
      </div>
    </div>
  )
}
