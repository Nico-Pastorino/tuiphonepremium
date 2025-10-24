"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import type { CatalogProductsResponse, ProductSummary } from "@/types/product"

const ProductFilters = dynamic(() => import("@/components/ProductFilters").then((mod) => mod.ProductFilters))

interface ProductsPageClientProps {
  initialData: CatalogProductsResponse
  pageSize: number
}

const fetchCatalogProducts = async (offset: number, limit: number): Promise<CatalogProductsResponse> => {
  const response = await fetch(`/api/catalog/products?offset=${offset}&limit=${limit}`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  return (await response.json()) as CatalogProductsResponse
}

const applyFilters = (
  products: ProductSummary[],
  category: string | null,
  condition: string | null,
): ProductSummary[] => {
  return products.filter((product) => {
    const matchesCategory = !category || product.category === category
    const matchesCondition = !condition || product.condition === condition
    return matchesCategory && matchesCondition
  })
}

export function ProductsPageClient({ initialData, pageSize }: ProductsPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<ProductSummary[]>(initialData.items)
  const [total, setTotal] = useState(initialData.total)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(initialData.items.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const media = window.matchMedia("(max-width: 768px)")
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches)
    }

    handleChange(media)
    if ("addEventListener" in media) {
      media.addEventListener("change", handleChange)
    } else {
      media.addListener(handleChange)
    }

    return () => {
      if ("removeEventListener" in media) {
        media.removeEventListener("change", handleChange)
      } else {
        media.removeListener(handleChange)
      }
    }
  }, [])

  const effectivePageSize = useMemo(() => (isMobile ? Math.min(pageSize, 9) : pageSize), [isMobile, pageSize])

  useEffect(() => {
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")
    setSelectedCategory(category || null)
    setSelectedCondition(condition || null)
  }, [searchParams])

  useEffect(() => {
    setVisibleCount(effectivePageSize)
  }, [effectivePageSize, selectedCategory, selectedCondition, products.length])

  useEffect(() => {
    if (initialData.items.length === 0) {
      setLoadingInitial(true)
      fetchCatalogProducts(0, effectivePageSize)
        .then((data) => {
          setProducts(data.items)
          setTotal(data.total)
        })
        .catch((err) => {
          console.error("No se pudieron cargar los productos iniciales:", err)
          setError("No se pudieron cargar los productos. Intenta nuevamente.")
        })
        .finally(() => setLoadingInitial(false))
    }
  }, [effectivePageSize, initialData.items.length])

  const filteredProducts = useMemo(
    () => applyFilters(products, selectedCategory, selectedCondition),
    [products, selectedCategory, selectedCondition],
  )

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  )

  const hasMore = products.length < total
  const priorityCount = useMemo(() => (isMobile ? 2 : 3), [isMobile])

  const handleFilterChange = useCallback(
    (filters: { category?: string | null; condition?: string | null }) => {
      const { category = null, condition = null } = filters
      setSelectedCategory(category)
      setSelectedCondition(condition)

      const params = new URLSearchParams(searchParams.toString())
      if (category) {
        params.set("category", category)
      } else {
        params.delete("category")
      }
      if (condition) {
        params.set("condition", condition)
      } else {
        params.delete("condition")
      }

      router.replace(`/productos?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return
    }
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchCatalogProducts(products.length, effectivePageSize)
      setProducts((prev) => [...prev, ...data.items])
      setTotal(data.total)
      setVisibleCount((prev) => prev + data.items.length)
    } catch (err) {
      console.error("No se pudieron cargar mas productos:", err)
      setError("No se pudieron cargar mas productos. Verifica tu conexion e intenta nuevamente.")
    } finally {
      setLoadingMore(false)
    }
  }, [effectivePageSize, hasMore, loadingMore, products.length])

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="section-padding">
        <div className="inner-container px-4 sm:px-6 lg:px-0">
          <AnimatedSection animation="fadeUp">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 sm:text-xs">Catálogo completo</p>
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
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-10 lg:flex-row-reverse">
            <div className="flex-1">
              <AnimatedSection animation="fadeRight">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-600 sm:text-base">
                    {loadingInitial
                      ? "Cargando productos..."
                      : `Mostrando ${visibleProducts.length} de ${filteredProducts.length} productos`}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loadingInitial ? (
                  <ProductsLoading />
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8 xl:gap-y-10">
                    {visibleProducts.map((product, index) => (
                      <AnimatedSection key={product.id} animation="fadeUp" delay={isMobile ? 0 : index * 60}>
                        <ModernProductCard product={product} priority={index < priorityCount} />
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
                        handleFilterChange({ category: null, condition: null })
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </AnimatedSection>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-xl border-gray-200 px-6 py-3 text-sm font-semibold hover:border-gray-300 hover:bg-white"
                  >
                    {loadingMore ? "Cargando..." : "Mostrar mas productos"}
                  </Button>
                </div>
              )}
            </div>

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
