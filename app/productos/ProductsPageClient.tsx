"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useSWRInfinite from "swr/infinite"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ModernProductCard } from "@/components/ModernProductCard"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Filter, RefreshCw, Search } from "lucide-react"
import type { CatalogProductsResponse, ProductSummary } from "@/types/product"

const ProductFilters = dynamic(() => import("@/components/ProductFilters").then((mod) => mod.ProductFilters))

const CATEGORY_PRIORITY = ["iphone", "ipad", "mac", "watch", "airpods", "accesorios"]
const CONDITION_PRIORITY: Record<ProductSummary["condition"], number> = {
  nuevo: 0,
  seminuevo: 1,
}

const sortProducts = (items: ProductSummary[]): ProductSummary[] => {
  return [...items].sort((a, b) => {
    const conditionA = CONDITION_PRIORITY[a.condition] ?? 99
    const conditionB = CONDITION_PRIORITY[b.condition] ?? 99
    if (conditionA !== conditionB) {
      return conditionA - conditionB
    }

    const categoryA = a.category?.toLowerCase() ?? ""
    const categoryB = b.category?.toLowerCase() ?? ""
    const priorityA = CATEGORY_PRIORITY.indexOf(categoryA)
    const priorityB = CATEGORY_PRIORITY.indexOf(categoryB)
    const normalizedPriorityA = priorityA >= 0 ? priorityA : CATEGORY_PRIORITY.length
    const normalizedPriorityB = priorityB >= 0 ? priorityB : CATEGORY_PRIORITY.length
    if (normalizedPriorityA !== normalizedPriorityB) {
      return normalizedPriorityA - normalizedPriorityB
    }

    const priceA = a.price ?? 0
    const priceB = b.price ?? 0
    if (priceA !== priceB) {
      return priceB - priceA
    }

    const parsedCreatedA = new Date(a.createdAt ?? "").getTime()
    const parsedCreatedB = new Date(b.createdAt ?? "").getTime()
    const createdA = Number.isFinite(parsedCreatedA) ? parsedCreatedA : 0
    const createdB = Number.isFinite(parsedCreatedB) ? parsedCreatedB : 0
    if (createdA !== createdB) {
      return createdB - createdA
    }

    return (a.name ?? "").localeCompare(b.name ?? "")
  })
}

type FiltersState = {
  category: string | null
  condition: string | null
  search: string | null
}

interface ProductsPageClientProps {
  initialData: CatalogProductsResponse
  pageSize: number
  initialFilters: FiltersState
}

const fetchCatalogProducts = async (requestUrl: string): Promise<CatalogProductsResponse> => {
  const response = await fetch(requestUrl)
  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  return (await response.json()) as CatalogProductsResponse
}

export function ProductsPageClient({ initialData, pageSize, initialFilters }: ProductsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const activeFilters = useMemo<FiltersState>(() => {
    const categoryParam = searchParams.get("category")
    const conditionParam = searchParams.get("condition")
    const searchParam = searchParams.get("search")
    return {
      category: categoryParam && categoryParam.trim().length > 0 ? categoryParam : null,
      condition: conditionParam && conditionParam.trim().length > 0 ? conditionParam : null,
      search: searchParam && searchParam.trim().length > 0 ? searchParam : null,
    }
  }, [searchParams])

  const [searchInput, setSearchInput] = useState(activeFilters.search ?? "")

  useEffect(() => {
    setSearchInput(activeFilters.search ?? "")
  }, [activeFilters.search])

  useEffect(() => {
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
  const priorityCount = useMemo(() => (isMobile ? 2 : 3), [isMobile])

  const initialSignature = useMemo(
    () => `${initialFilters.category ?? ""}|${initialFilters.condition ?? ""}|${initialFilters.search ?? ""}`,
    [initialFilters.category, initialFilters.condition, initialFilters.search],
  )
  const activeSignature = useMemo(
    () => `${activeFilters.category ?? ""}|${activeFilters.condition ?? ""}|${activeFilters.search ?? ""}`,
    [activeFilters.category, activeFilters.condition, activeFilters.search],
  )

  const fallbackData = useMemo(() => {
    if (initialData.items.length === 0) {
      return undefined
    }
    if (initialSignature !== activeSignature) {
      return undefined
    }
    return [initialData]
  }, [initialData, initialSignature, activeSignature])

  const getKey = useCallback(
    (pageIndex: number, previousPageData: CatalogProductsResponse | null) => {
      if (previousPageData && previousPageData.items.length === 0) {
        return null
      }

      const params = new URLSearchParams()
      params.set("offset", String(pageIndex * effectivePageSize))
      params.set("limit", String(effectivePageSize))
      if (activeFilters.category) params.set("category", activeFilters.category)
      if (activeFilters.condition) params.set("condition", activeFilters.condition)
      if (activeFilters.search) params.set("search", activeFilters.search)
      return `/api/catalog/products?${params.toString()}`
    },
    [activeFilters.category, activeFilters.condition, activeFilters.search, effectivePageSize],
  )

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<CatalogProductsResponse>(
    getKey,
    fetchCatalogProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
      fallbackData,
    },
  )

  useEffect(() => {
    void setSize(1)
  }, [activeSignature, setSize])

  const pages = data ?? []
  const products = useMemo(() => sortProducts(pages.flatMap((page) => page.items)), [pages])
  const total = pages[0]?.total ?? initialData.total
  const loadingInitial = !pages.length && isLoading
  const loadingMore = isValidating && size > pages.length
  const errorMessage = error instanceof Error ? error.message : null
  const initialLoadingEmpty = loadingInitial && products.length === 0
  const trimmedSearch = (activeFilters.search ?? "").trim()
  const statsText = loadingInitial
    ? "Cargando productos..."
    : trimmedSearch.length > 0
      ? products.length > 0
        ? `Encontramos ${products.length} resultado${products.length === 1 ? "" : "s"} para "${trimmedSearch}"`
        : `Sin coincidencias para "${trimmedSearch}".`
      : `Mostrando ${products.length} de ${total} productos`

  const handleFilterChange = useCallback(
    (next: { category?: string | null; condition?: string | null; search?: string | null }) => {
      const params = new URLSearchParams()
      const categoryValue = next.category !== undefined ? next.category : activeFilters.category
      const conditionValue = next.condition !== undefined ? next.condition : activeFilters.condition
      const searchValue = next.search !== undefined ? next.search : activeFilters.search
      if (categoryValue) params.set("category", categoryValue)
      if (conditionValue) params.set("condition", conditionValue)
      if (searchValue) params.set("search", searchValue)
      const queryString = params.toString()
      router.replace(queryString ? `/productos?${queryString}` : "/productos", { scroll: false })
      setShowFilters(false)
    },
    [router, activeFilters.category, activeFilters.condition, activeFilters.search],
  )

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const normalizedInput = searchInput.trim()
      const normalizedActive = (activeFilters.search ?? "").trim()
      if (normalizedInput === normalizedActive) {
        return
      }
      handleFilterChange({ search: normalizedInput.length > 0 ? normalizedInput : null })
    }, 400)

    return () => {
      window.clearTimeout(handler)
    }
  }, [searchInput, activeFilters.search, handleFilterChange])

  const handleLoadMore = useCallback(() => {
    if (loadingMore || products.length >= total) {
      return
    }
    void setSize((currentSize) => currentSize + 1)
  }, [loadingMore, products.length, total, setSize])

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
            <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 sm:text-xs">Catalogo completo</p>
                <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Productos Apple</h1>
                <p className="text-sm text-gray-600 sm:text-base">
                  Descubre nuestra seleccion completa de productos Apple nuevos y seminuevos
                </p>
              </div>
              <div className="w-full max-w-md lg:max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Buscar productos..."
                      aria-label="Buscar productos"
                      className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="h-12 w-12 rounded-full border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white lg:hidden"
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
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
                      category={activeFilters.category}
                      condition={activeFilters.condition}
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

                {errorMessage && !initialLoadingEmpty && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {initialLoadingEmpty ? (
                  <div className="flex justify-center py-16">
                    <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl border border-blue-100 bg-white px-6 py-12 text-center shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">Cargando productos...</p>
                      <p className="text-sm text-blue-600">
                        Estamos preparando el catalogo completo para mostrarte las mejores opciones.
                      </p>
                    </div>
                  </div>
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
                    <p className="text-gray-600 mb-6">
                      {trimmedSearch.length > 0
                        ? `No encontramos coincidencias para "${trimmedSearch}". Intenta con otro termino o ajusta los filtros.`
                        : "Intenta ajustar los filtros seleccionados"}
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      {trimmedSearch.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchInput("")
                            handleFilterChange({ search: null })
                          }}
                          className="rounded-xl border-gray-200 hover:border-gray-300 hover:bg-white"
                        >
                          Limpiar busqueda
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          handleFilterChange({ category: null, condition: null })
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    </div>
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
                    category={activeFilters.category}
                    condition={activeFilters.condition}
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
