"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Shield,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { useAdmin } from "@/contexts/AdminContext"
import Link from "next/link"
import type { Product, ProductSummary } from "@/types/product"
import { TradeInEstimator } from "@/components/trade-in-estimator"
import {
  getProductDetailImageUrls,
  getProductListImageUrls,
  getProductThumbnailImageUrls,
  sanitizeImageList,
} from "@/lib/image-cdn"
import { StorageImage } from "@/components/StorageImage"
import {
  type InstallmentOption as PricingInstallmentOption,
  type ProductPricingResponse,
} from "@/lib/pricing"

const CATEGORY_LABELS = {
  "visa-mastercard": "Visa / Mastercard",
  naranja: "Tarjeta Naranja",
} as const

type ProductWithPricing = Product & {
  pricing?: ProductPricingResponse | null
}

type InstallmentCategory = keyof typeof CATEGORY_LABELS

type InstallmentOption = {
  id: string
  months: number
  interestRate: number
  monthlyAmount: number
}

type InstallmentGroup = {
  category: InstallmentCategory
  label: string
  options: InstallmentOption[]
}

type PromotionGroup = {
  id: string
  label: string
  options: Array<{
    id: string
    months: number
    paymentLabel: string
    monthlyAmount: number
  }>
}

const groupInstallmentOptions = (installmentOptions: PricingInstallmentOption[]): InstallmentGroup[] => {
  return (Object.entries(CATEGORY_LABELS) as Array<[InstallmentCategory, string]>).map(([category, label]) => {
    const options = installmentOptions
      .filter((plan) => plan.category === category)
      .sort((a, b) => a.months - b.months)

    return { category, label, options }
  })
}

const groupPromotions = (promotions: ProductPricingResponse["promotions"]): PromotionGroup[] => {
  const groups = promotions.reduce<PromotionGroup[]>((acc, promotion) => {
    const existing = acc.find((group) => group.label === promotion.groupLabel)
    if (existing) {
      existing.options.push({
        id: `${promotion.promotionId}-${promotion.termId}`,
        months: promotion.months,
        paymentLabel: promotion.paymentLabel,
        monthlyAmount: promotion.monthlyAmount,
      })
      return acc
    }

    acc.push({
      id: promotion.promotionId,
      label: promotion.groupLabel,
      options: [
        {
          id: `${promotion.promotionId}-${promotion.termId}`,
          months: promotion.months,
          paymentLabel: promotion.paymentLabel,
          monthlyAmount: promotion.monthlyAmount,
        },
      ],
    })
    return acc
  }, [])

  return groups.map((group) => ({
    ...group,
    options: [...group.options].sort((a, b) => a.months - b.months),
  }))
}

type FinancingListGroup = {
  id: string
  label: string
  options: Array<{
    id: string
    months: number
    paymentLabel: string
    monthlyAmount: number
  }>
}

const formatCurrency = (amount: number) => `$${Math.round(amount).toLocaleString("es-AR")}`

const getBestInstallmentCopy = (bestInstallment: ProductPricingResponse["best_installment"]) => {
  if (!bestInstallment) {
    return null
  }

  if (bestInstallment.months <= 1) {
    return `En 1 pago fijo de ${formatCurrency(bestInstallment.monthlyAmount)}`
  }

  return `Hasta ${bestInstallment.months} cuotas fijas de ${formatCurrency(bestInstallment.monthlyAmount)}`
}

type ProductDetailClientProps = {
  productId: string
  initialProduct: ProductWithPricing
  relatedProducts: ProductSummary[]
}

export function ProductDetailClient({ productId, initialProduct, relatedProducts: initialRelated }: ProductDetailClientProps) {
  const router = useRouter()
  const { homeConfig } = useAdmin()
  const [product, setProduct] = useState<ProductWithPricing | null>(initialProduct ?? null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoadingProduct, setIsLoadingProduct] = useState(!initialProduct)
  const [relatedProducts, setRelatedProducts] = useState<ProductSummary[]>(initialRelated)

  useEffect(() => {
    setProduct(initialProduct ?? null)
    setRelatedProducts(initialRelated)
    setSelectedImageIndex(0)
    setIsLoadingProduct(!initialProduct)
  }, [initialProduct, initialRelated])

  useEffect(() => {
    // Evita un segundo fetch cuando el producto ya fue resuelto en el server component.
    if (initialProduct && initialProduct.id === productId) {
      setIsLoadingProduct(false)
      return
    }

    let active = true

    const syncProduct = async () => {
      const shouldShowLoader = !initialProduct
      if (shouldShowLoader) {
        setIsLoadingProduct(true)
      }

      try {
        const response = await fetch(`/api/catalog/product/${productId}`, { cache: "no-store" })

        if (!response.ok) {
          return
        }

        const result = (await response.json()) as { data?: ProductWithPricing }
        if (result?.data && active) {
          setProduct({
            ...result.data,
            images: sanitizeImageList(result.data.images),
          })
        }
      } catch (error) {
        console.error("No se pudo sincronizar el producto:", error)
      } finally {
        if (active) {
          setIsLoadingProduct(false)
        }
      }
    }

    void syncProduct()

    return () => {
      active = false
    }
  }, [productId, initialProduct])

  const [showAllFinancingOptions, setShowAllFinancingOptions] = useState(false)

  const whatsappNumber = useMemo(() => {
    const configuredNumber = homeConfig.whatsappNumber?.trim()
    return configuredNumber && configuredNumber.length > 0 ? configuredNumber : "5491112345678"
  }, [homeConfig.whatsappNumber])

  const productWhatsappLink = useMemo(() => {
    const baseLink = `https://wa.me/${whatsappNumber}`
    if (!product?.name) {
      return `${baseLink}?text=${encodeURIComponent("Quiero consultar por un producto")}`
    }

    const conditionLabel = product.condition === "seminuevo" ? "Seminuevo" : "Nuevo"
    const message = `Quiero consultar por ${product.name} (${conditionLabel})`

    return `${baseLink}?text=${encodeURIComponent(message)}`
  }, [product?.name, product?.condition, whatsappNumber])

  const resolvedPricing = product?.pricing ?? null
  const priceInPesos = resolvedPricing?.display_price ?? product?.price ?? 0
  const priceInUSD =
    product && product.priceUSD !== undefined && product.priceUSD !== null
      ? product.priceUSD
      : null
  const originalPrice =
    product &&
    product.condition === "nuevo" &&
    product.originalPrice !== undefined &&
    product.originalPrice !== null
      ? product.originalPrice
      : null
  const promotionBreakdown = useMemo(() => resolvedPricing?.promotions ?? [], [resolvedPricing])
  const promotionGroups = useMemo(() => groupPromotions(promotionBreakdown), [promotionBreakdown])
  const installmentGroups = useMemo(
    () => groupInstallmentOptions(resolvedPricing?.installment_options ?? []),
    [resolvedPricing],
  )
  const financingGroups = useMemo<FinancingListGroup[]>(() => {
    const grouped = new Map<string, FinancingListGroup>()

    for (const group of promotionGroups) {
      grouped.set(group.label, {
        id: group.id,
        label: group.label,
        options: [...group.options],
      })
    }

    for (const group of installmentGroups) {
      if (group.options.length === 0) {
        continue
      }

      const current = grouped.get(group.label)
      const nextOptions = group.options.map((option) => ({
        id: `${group.category}-${option.id}`,
        months: option.months,
        paymentLabel: option.paymentLabel,
        monthlyAmount: option.monthlyAmount,
      }))

      if (current) {
        current.options = [...current.options, ...nextOptions].sort((a, b) => a.months - b.months)
      } else {
        grouped.set(group.label, {
          id: group.category,
          label: group.label,
          options: nextOptions,
        })
      }
    }

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        options: group.options.sort((a, b) => a.months - b.months),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"))
  }, [installmentGroups, promotionGroups])
  const bestInstallmentCopy = useMemo(() => getBestInstallmentCopy(resolvedPricing?.best_installment ?? null), [resolvedPricing])
  const hasInstallmentOptions = financingGroups.length > 0

  useEffect(() => {
    setShowAllFinancingOptions(false)
  }, [productId])

  if (isLoadingProduct || !product) {
    return (
      <div className="min-h-screen bg-white">
        <MinimalNavbar />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500" />
              <p className="mt-6 text-lg font-medium text-gray-700">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <MinimalNavbar />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
              <Button asChild variant="outline">
                <Link href="/productos">Volver a productos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const conditionLabel = product.condition === "seminuevo" ? "Seminuevo" : "Nuevo"
  const conditionBadgeClass =
    product.condition === "seminuevo" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"

  // Productos relacionados

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleShare = async () => {
    if (typeof window === "undefined" || !product) {
      return
    }

    const shareUrl = `${window.location.origin}/productos/${product.id}`
    const shareData = {
      title: product.name,
      text: product.description || "Descubri este producto en TuIphonepremium",
      url: shareUrl,
    }

    if (window.navigator.share) {
      try {
        await window.navigator.share(shareData)
        return
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        console.warn("Compartir no disponible", error)
      }
    }

    try {
      if (window.navigator.clipboard) {
        await window.navigator.clipboard.writeText(shareUrl)
        window.alert("Enlace copiado al portapapeles")
      } else {
        window.prompt("Copia este enlace para compartirlo", shareUrl)
      }
    } catch (error) {
      console.error("No se pudo copiar el enlace", error)
      window.prompt("Copia este enlace para compartirlo", shareUrl)
    }
  }

  const QuickActionButtons = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-base font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-purple-700 sm:py-4 sm:text-lg"
          asChild
        >
          <a href={productWhatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            Consultar por WhatsApp
          </a>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 bg-white/80 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-white sm:w-auto sm:px-5 sm:py-4 sm:text-base"
          onClick={handleShare}
          aria-label="Compartir producto"
        >
          <Share2 className="h-5 w-5" />
          <span className="font-semibold">Compartir</span>
        </Button>
      </div>
    </div>
  )

  const BenefitsGrid = ({ className = "" }: { className?: string }) => (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 ${className}`}>
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <Shield className="h-5 w-5 text-green-600" />
        </div>

        <div>
          <p className="text-sm font-medium">Garantia</p>
          <p className="text-xs text-gray-600">12 meses</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <Truck className="h-5 w-5 text-blue-600" />
        </div>

        <div>
          <p className="text-sm font-medium">Envio gratis</p>
          <p className="text-xs text-gray-600">CABA y GBA</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
          <CreditCard className="h-5 w-5 text-purple-600" />
        </div>

        <div>
          <p className="text-sm font-medium">Financiacion</p>
          <p className="text-xs text-gray-600">Hasta 12 cuotas</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <MinimalNavbar />

      <div className="section-padding">
        <div className="inner-container px-4 sm:px-6 lg:px-0">
          {/* Breadcrumb */}
          <AnimatedSection animation="fadeUp">
            <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-gray-600 sm:text-sm">
              <Link href="/" className="hover:text-blue-600">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/productos" className="hover:text-blue-600">
                Productos
              </Link>
              <span>/</span>
              <Link href={`/productos?category=${product.category}`} className="hover:text-blue-600 capitalize">
                {product.category}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </AnimatedSection>

          {/* Back Button */}
          <AnimatedSection animation="fadeUp" delay={100}>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 w-full justify-center gap-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 sm:w-fit sm:justify-start sm:px-0 sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </AnimatedSection>

          <div className="mb-12 grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Images */}
            <AnimatedSection animation="fadeLeft">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="group relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-white shadow-md ring-1 ring-white/60 sm:mx-0 sm:aspect-[4/5] lg:aspect-[5/6]">
                    <div className="pointer-events-none absolute inset-0">
                      <div className="relative h-full w-full p-5 sm:p-8 md:p-10">
                        <StorageImage
                          src={getProductDetailImageUrls(product.images[selectedImageIndex]).thumbnail || "/placeholder.svg?height=600&width=600"}
                          optimizedSrc={getProductDetailImageUrls(product.images[selectedImageIndex]).optimized || "/placeholder.svg?height=600&width=600"}
                          originalSrc={getProductDetailImageUrls(product.images[selectedImageIndex]).original || "/placeholder.svg?height=600&width=600"}
                          alt={product.name}
                          fill
                          priority
                          className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.05]"
                          debugLabel={`ProductDetail:main:${product.id}`}
                        />
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 transform rounded-full bg-white/80 p-0 shadow-sm backdrop-blur hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 transform rounded-full bg-white/80 p-0 shadow-sm backdrop-blur hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Badges */}
                    <div className="absolute left-5 top-5 z-10 flex flex-col gap-2">
                      {product.isOutlet ? (
                        <Badge className="rounded-full bg-orange-500 px-3 py-1 font-medium text-white">Outlet</Badge>
                      ) : product.condition === "seminuevo" ? (
                        <Badge className="rounded-full bg-blue-500 px-3 py-1 font-medium text-white">Seminuevo</Badge>
                      ) : null}
                      {product.featured && (
                        <Badge className="rounded-full bg-gray-900 px-3 py-1 font-medium text-white">Destacado</Badge>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          type="button"
                          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-transparent bg-white/80 transition-all sm:h-auto sm:w-auto sm:aspect-square ${
                            selectedImageIndex === index
                              ? "ring-2 ring-blue-500"
                              : "hover:border-gray-200 hover:opacity-90"
                          }`}
                        >
                          <StorageImage
                            src={getProductThumbnailImageUrls(image).thumbnail || "/placeholder.svg"}
                            optimizedSrc={getProductThumbnailImageUrls(image).optimized || "/placeholder.svg"}
                            originalSrc={getProductThumbnailImageUrls(image).original || "/placeholder.svg"}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-contain drop-shadow-md"
                            loading="lazy"
                            debugLabel={`ProductDetail:thumb:${product.id}:${index}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden flex-col gap-5 lg:flex">
                  <QuickActionButtons />
                  <BenefitsGrid />
                </div>
              </div>
            </AnimatedSection>

            {/* Product Info */}

            <AnimatedSection animation="fadeRight">
              <div className="flex flex-col gap-8 lg:-mt-16">
                <div className="flex flex-col gap-5 lg:gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.isOutlet ? (
                        <Badge className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Outlet
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={`w-fit rounded-full border-0 px-3 py-1 text-xs font-semibold ${conditionBadgeClass}`}
                        >
                          {conditionLabel}
                        </Badge>
                      )}
                    </div>
                  <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{product.name}</h1>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        ${priceInPesos.toLocaleString("es-AR")}
                      </span>

                      {originalPrice && (
                        <span className="text-2xl text-gray-400 line-through">
                          ${originalPrice.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    {priceInUSD !== null && (
                      <div className="mt-1 text-sm text-gray-500 sm:text-base">
                        USD {priceInUSD.toLocaleString("es-AR")}
                      </div>
                    )}

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Financiacion
                          </p>
                          <p className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                            {bestInstallmentCopy ?? "Consulta por opciones de pago para este producto"}
                          </p>
                        </div>

                        {hasInstallmentOptions && (
                          <button
                            type="button"
                            onClick={() => setShowAllFinancingOptions((current) => !current)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                          >
                            {showAllFinancingOptions ? "Ocultar opciones" : "Ver todas las opciones"}
                            <ChevronDown className={`h-4 w-4 transition-transform ${showAllFinancingOptions ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {showAllFinancingOptions && hasInstallmentOptions && (
                        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                          {financingGroups.map((group) => (
                            <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                              <p className="text-sm font-semibold text-slate-900 sm:text-base">{group.label}</p>
                              <div className="mt-3 space-y-2.5">
                                {group.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 sm:text-[15px]"
                                  >
                                    <span>{option.paymentLabel} de {formatCurrency(option.monthlyAmount)}</span>
                                    <span className="font-semibold text-slate-900">{option.months > 1 ? `${option.months} pagos` : "Pago unico"}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {product.isOutlet && (
                      <div className="mt-4 rounded-2xl border border-orange-200/70 bg-orange-50/70 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-orange-800 sm:text-base">Detalle Outlet</p>
                          {product.outletGrade && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 capitalize">
                              {product.outletGrade}
                            </span>
                          )}
                          {product.outletBatteryPercent !== null && product.outletBatteryPercent !== undefined && (
                            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
                              Bateria {product.outletBatteryPercent}%
                            </span>
                          )}
                        </div>
                        {product.outletDefects && product.outletDefects.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {product.outletDefects.slice(0, 6).map((defect) => (
                              <span
                                key={defect}
                                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-orange-700"
                              >
                                {defect}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.outletNotes && (
                          <p className="mt-3 text-sm text-orange-700">{product.outletNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:hidden">
                  <QuickActionButtons />
                  <BenefitsGrid />
                </div>
              </div>
            </AnimatedSection>

            {product.category.toLowerCase() === "iphone" && (
              <AnimatedSection animation="fadeUp" className="lg:col-span-2">
                <TradeInEstimator
                  productName={product.name}
                  productPriceARS={Math.round(priceInPesos)}
                  productPriceUSD={priceInUSD}
                  productCondition={product.condition}
                />
              </AnimatedSection>
            )}
          </div>

          {/* Product Details */}
          <AnimatedSection animation="fadeUp">
            <Card className="mb-12 border-0 shadow-sm sm:mb-16">
              <CardContent className="p-5 sm:p-8">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1">
                    <TabsTrigger value="description">Descripcion</TabsTrigger>
                    <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-5 sm:mt-6">
                    <div className="prose max-w-none">
                      <p className="text-base leading-relaxed text-gray-700 sm:text-lg">{product.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="mt-5 sm:mt-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{key}</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <AnimatedSection animation="fadeUp">
              <div className="mb-6 sm:mb-8">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Productos relacionados</h2>
                <p className="text-gray-600">Otros productos que podrian interesarte</p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct, index) => (
                  <AnimatedSection key={relatedProduct.id} animation="fadeUp" delay={index * 100}>
                    <Link href={`/productos/${relatedProduct.id}`}>
                      <Card className="group cursor-pointer border-0 shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
                          <StorageImage
                            src={getProductListImageUrls(relatedProduct.images[0]).thumbnail || "/placeholder.svg?height=300&width=300"}
                            optimizedSrc={getProductListImageUrls(relatedProduct.images[0]).optimized || "/placeholder.svg?height=300&width=300"}
                            originalSrc={getProductListImageUrls(relatedProduct.images[0]).original || "/placeholder.svg?height=300&width=300"}
                            alt={relatedProduct.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            debugLabel={`ProductDetail:related:${relatedProduct.id}`}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-2xl font-bold text-gray-900">
                            ${relatedProduct.price.toLocaleString("es-AR")}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  )
}
