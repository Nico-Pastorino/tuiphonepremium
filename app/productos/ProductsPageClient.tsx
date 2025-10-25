"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Filter, RefreshCw } from "lucide-react"
import type { CatalogProductsResponse, ProductSummary } from "@/types/product"

const ProductFilters = dynamic(() => import("@/components/ProductFilters").then((mod) => mod.ProductFilters))

type FiltersState = {
  category: string | null
  condition: string | null
}

interface ProductsPageClientProps {
  initialData: CatalogProductsResponse
  pageSize: number
  initialFilters: FiltersState
}

const fetchCatalogProducts = async (
  offset: number,
  limit: number,
  filters: FiltersState,
): Promise<CatalogProductsResponse> => {
  const params = new URLSearchParams()
  params.set("offset", String(offset))
  params.set("limit", String(limit))
  if (filters.category) params.set("category", filters.category)
  if (filters.condition) params.set("condition", filters.condition)

  const response = await fetch(`/api/catalog/products?${params.toString()}`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  return (await response.json()) as CatalogProductsResponse
}

export function ProductsPageClient({ initialData, pageSize, initialFilters }: ProductsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const [products, setProducts] = useState<ProductSummary[]>(initialData.items)
  const [total, setTotal] = useState(initialData.total)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const initialLoadRef = useRef(true)
  const initialLoadingEmpty = loadingInitial && products.length === 0

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

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const conditionParam = searchParams.get("condition")
    const nextFilters: FiltersState = {
      category: categoryParam || null,
      condition: conditionParam || null,
    }

    setFilters((prev) => {
      if (prev.category === nextFilters.category && prev.condition === nextFilters.condition) {
        return prev
      }
      return nextFilters
    })
  }, [searchParams])

  const effectivePageSize = useMemo(() => (isMobile ? Math.min(pageSize, 9) : pageSize), [isMobile, pageSize])
  const priorityCount = useMemo(() => (isMobile ? 2 : 3), [isMobile])

  const loadProductsForFilters = useCallback(
    async (filtersToLoad: FiltersState, offset: number, append: boolean) => {
      setError(null)
      if (append) {
        setLoadingMore(true)
      } else {
        setLoadingInitial(true)
      }

      try {
        const data = await fetchCatalogProducts(offset, effectivePageSize, filtersToLoad)
        setTotal(data.total)
        if (append) {
          setProducts((prev) => [...prev, ...data.items])
        } else {
          setProducts(data.items)
        }
      } catch (err) {
        console.error("No se pudieron cargar los productos:", err)
        setError("No se pudieron cargar los productos. Intenta nuevamente.")
        if (!append) {
          setProducts([])
          setTotal(0)
        }
      } finally {
        if (append) {
          setLoadingMore(false)
        } else {
          setLoadingInitial(false)
        }
      }
    },
    [effectivePageSize],
  )

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }
    loadProductsForFilters(filters, 0, false)
  }, [filters, loadProductsForFilters])

  const handleFilterChange = useCallback(
    (next: { category?: string | null; condition?: string | null }) => {
      const nextFilters: FiltersState = {
        category: next.category ?? null,
        condition: next.condition ?? null,
      }

      setFilters(nextFilters)

      const params = new URLSearchParams()
      if (nextFilters.category) params.set("category", nextFilters.category)
      if (nextFilters.condition) params.set("condition", nextFilters.condition)

      const queryString = params.toString()
      router.replace(queryString ? `/productos?${queryString}` : "/productos", { scroll: false })
      setShowFilters(false)
    },
    [router],
  )

  const handleLoadMore = useCallback(() => {
    if (loadingMore || products.length >= total) {
      return
    }
    loadProductsForFilters(filters, products.length, true)
  }, [filters, loadProductsForFilters, loadingMore, products.length, total])

  const statsText = loadingInitial ? "Cargando productos..." : `Mostrando ${products.length} de ${total} productos`
  useEffect(() => {
    if (initialLoadingEmpty) {
      setShowFilters(false)
    }
  }, [initialLoadingEmpty])

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="section-padding">
        <div className="inner-container px-4 sm:px-6 lg:px-0">
          <AnimatedSection animation="fadeUp">
            {initialLoadingEmpty ? (
              <div className="flex justify-center">
                <div className="flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl border border-blue-100 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Cargando productos...</p>
                  <p className="text-sm text-blue-600">
                    Estamos preparando el catalogo completo para mostrarte las mejores opciones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 sm:text-xs">Catalogo completo</p>
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
            )}
          </AnimatedSection>

          {showFilters && !initialLoadingEmpty && (
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
                      category={filters.category}
                      condition={filters.condition}
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
                  <p className="text-sm text-gray-600 sm:text-base">{statsText}</p>
                </div>

                {error && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loadingInitial && products.length === 0 ? (
                  <ProductsLoading />
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8 xl:gap-y-10">
                    {products.map((product, index) => (
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
              {products.length < total && (
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

            {!initialLoadingEmpty && (
              <div className="hidden lg:block lg:w-80">
                <AnimatedSection animation="fadeLeft" className="lg:sticky lg:top-32">
                  <ProductFilters
                    category={filters.category}
                    condition={filters.condition}
                    onFilterChange={handleFilterChange}
                  />
                </AnimatedSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
