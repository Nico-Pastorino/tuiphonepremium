"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { useProducts } from "@/contexts/ProductContext"
import { useAdmin } from "@/contexts/AdminContext"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import type { InstallmentPlan } from "@/types/finance"
import { TradeInEstimator } from "@/components/trade-in-estimator"

const CATEGORY_LABELS = {
  "visa-mastercard": "Visa / Mastercard",
  naranja: "Tarjeta Naranja",
} as const

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

const buildInstallmentGroups = (priceInPesos: number, installmentPlans: InstallmentPlan[]): InstallmentGroup[] => {
  return (Object.entries(CATEGORY_LABELS) as Array<[InstallmentCategory, string]>).map(([category, label]) => {
    const options = installmentPlans
      .filter((plan) => plan.category === category && plan.isActive)
      .map((plan) => {
        const totalAmount = priceInPesos * (1 + plan.interestRate / 100)
        const monthlyAmount = plan.months > 0 ? totalAmount / plan.months : totalAmount
        return {
          id: plan.id,
          months: plan.months,
          interestRate: plan.interestRate,
          monthlyAmount,
        }
      })
      .sort((a, b) => a.months - b.months)

    return { category, label, options }
  })
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProductById, ensureProductById, products } = useProducts()
  const { installmentPlans, getEffectiveDollarRate, homeConfig, getActiveInstallmentPromotions } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  useEffect(() => {
    let active = true

    const loadProduct = async () => {
      if (!params.id) {
        if (active) {
          setProduct(null)
          setIsLoadingProduct(false)
        }
        return
      }

      const productId = params.id as string
      const existing = getProductById(productId)

      if (existing) {
        if (active) {
          setProduct(existing)
          setIsLoadingProduct(false)
        }
        // keep syncing with Supabase in the background in case data changed
        ensureProductById(productId).then((fresh) => {
          if (fresh && active) {
            setProduct(fresh)
          }
        })
        return
      }

      if (active) {
        setIsLoadingProduct(true)
      }

      const fetched = await ensureProductById(productId)

      if (!active) {
        return
      }

      setProduct(fetched)
      setIsLoadingProduct(false)
    }

    void loadProduct()

    return () => {
      active = false
    }
  }, [ensureProductById, getProductById, params.id])

  const [openInstallmentCategory, setOpenInstallmentCategory] = useState<InstallmentCategory | null>(null)

  useEffect(() => {
    if (!product) {
      setOpenInstallmentCategory(null)
      return
    }

    const computedPriceInPesos =
      product.priceUSD !== undefined && product.priceUSD !== null
        ? product.priceUSD * effectiveDollarRate
        : product.price

    const groups = buildInstallmentGroups(computedPriceInPesos, installmentPlans)

    setOpenInstallmentCategory((current) => {
      if (current && groups.some((group) => group.category === current && group.options.length > 0)) {
        return current
      }
      return null
    })
  }, [product, installmentPlans, effectiveDollarRate])

  const toggleInstallmentCategory = (category: InstallmentCategory) => {
    setOpenInstallmentCategory((current) => (current === category ? null : category))
  }

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

  const priceInPesos =
    product && product.priceUSD !== undefined && product.priceUSD !== null && effectiveDollarRate
      ? product.priceUSD * effectiveDollarRate
      : product?.price ?? 0
  const priceInUSD =
    product && product.priceUSD !== undefined && product.priceUSD !== null
      ? product.priceUSD
      : product && effectiveDollarRate
        ? Number((product.price / effectiveDollarRate).toFixed(0))
        : null
  const originalPrice =
    product &&
    product.condition === "nuevo" &&
    product.originalPrice !== undefined &&
    product.originalPrice !== null
      ? product.originalPrice
      : null
  const activePromotions = getActiveInstallmentPromotions()
  const promotionBreakdown = useMemo(() => {
    if (!product || !Number.isFinite(priceInPesos) || priceInPesos <= 0 || activePromotions.length === 0) {
      return [] as Array<{
        promotionId: string
        termId: string
        name: string
        months: number
        interestRate: number
        monthlyAmount: number
      }>
    }

    const entries: Array<{
      promotionId: string
      termId: string
      name: string
      months: number
      interestRate: number
      monthlyAmount: number
    }> = []

    for (const promotion of activePromotions) {
      for (const term of promotion.terms) {
        const totalAmount = priceInPesos * (1 + term.interestRate / 100)
        const monthlyAmount = term.months > 0 ? totalAmount / term.months : totalAmount
        entries.push({
          promotionId: promotion.id,
          termId: term.id,
          name: promotion.name,
          months: term.months,
          interestRate: term.interestRate,
          monthlyAmount,
        })
      }
    }

    return entries.sort((a, b) => a.monthlyAmount - b.monthlyAmount)
  }, [activePromotions, priceInPesos, product])
  const hasPromotionOptions = promotionBreakdown.length > 0

  if (isLoadingProduct) {
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

  const installmentGroups = buildInstallmentGroups(priceInPesos, installmentPlans)
  const hasInstallmentOptions = installmentGroups.some((group) => group.options.length > 0)

  // Productos relacionados
  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)

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
                        <Image
                          src={product.images[selectedImageIndex] || "/placeholder.svg?height=600&width=600"}
                          alt={product.name}
                          fill
                          priority
                          className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.05]"
                          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 45vw, (min-width: 640px) 70vw, 92vw"
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
                      {product.condition === "seminuevo" && (
                        <Badge className="rounded-full bg-blue-500 px-3 py-1 font-medium text-white">Seminuevo</Badge>
                      )}
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
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-contain drop-shadow-md"
                            sizes="96px"
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
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-5 lg:gap-6">
                  <Badge variant="secondary" className={`w-fit rounded-full border-0 px-3 py-1 text-xs font-semibold ${conditionBadgeClass}`}>
                    {conditionLabel}
                  </Badge>
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

                    {hasPromotionOptions && (
                      <div className="mt-5 rounded-2xl border border-purple-200/80 bg-purple-50/80 p-4 sm:p-5">
                        <p className="text-sm font-semibold text-purple-800 sm:text-base">Promociones activas</p>
                        <div className="mt-3 space-y-3">
                          {promotionBreakdown.map((promotion) => {
                            const monthlyPayment = Math.round(promotion.monthlyAmount).toLocaleString("es-AR")
                            const installmentsLabel = `${promotion.months} ${
                              promotion.months === 1 ? "cuota" : "cuotas"
                            }`

                            return (
                              <div
                                key={`${promotion.promotionId}-${promotion.termId}`}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3 shadow-sm"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-purple-900 sm:text-base">{promotion.name}</p>
                                  <p className="text-xs text-purple-600 sm:text-sm">
                                    {installmentsLabel} de ${monthlyPayment}
                                    {promotion.interestRate === 0 ? " sin interes" : ""}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-base font-bold text-purple-900 sm:text-lg">${monthlyPayment}</p>
                                  <p className="text-[11px] text-purple-600">por mes</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4 sm:p-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-blue-700 sm:text-base">
                          Opciones de financiacion disponibles
                        </p>
                        {hasInstallmentOptions && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 sm:text-[0.7rem]">
                            Elegi la mas conveniente
                          </span>
                        )}
                      </div>

                      {hasInstallmentOptions ? (
                        <div className="mt-4 space-y-2.5 sm:space-y-3">
                          {installmentGroups.map((group) => {
                            const hasOptionsForGroup = group.options.length > 0
                            const firstOption = hasOptionsForGroup ? group.options[0] : null
                            const isOpen = openInstallmentCategory === group.category

                            return (
                              <div
                                key={group.category}
                                className={`rounded-xl shadow-sm transition ${
                                  group.category === "naranja"
                                    ? "border border-orange-300 bg-orange-50/90"
                                    : "border border-blue-200/70 bg-white/90"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleInstallmentCategory(group.category)}
                                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors sm:px-5 sm:py-4 ${
                                    group.category === "naranja"
                                      ? "hover:bg-orange-100/80"
                                      : "hover:bg-blue-50/60"
                                  }`}
                                >
                                  <div>
                                    <p
                                      className={`text-[0.7rem] font-semibold uppercase tracking-wide ${
                                        group.category === "naranja" ? "text-orange-600" : "text-blue-600"
                                      }`}
                                    >
                                      {group.label}
                                    </p>
                                    <p
                                      className={`mt-1 text-sm leading-tight ${
                                        group.category === "naranja" ? "text-orange-900" : "text-blue-900"
                                      }`}
                                    >
                                      {firstOption
                                        ? `${firstOption.months} ${
                                            firstOption.months === 1 ? "cuota" : "cuotas"
                                          } desde $${firstOption.monthlyAmount.toLocaleString("es-AR", {
                                            maximumFractionDigits: 0,
                                          })}`
                                        : "Consultanos para conocer nuevos planes"}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    className={`h-5 w-5 text-blue-600 transition-transform ${
                                      isOpen ? "rotate-180" : ""
                                    } ${group.category === "naranja" ? "text-orange-600" : "text-blue-600"}`}
                                  />
                                </button>

                                {isOpen && (
                                  <div
                                    className={`border-t px-5 pb-4 pt-3 text-sm ${
                                      group.category === "naranja"
                                        ? "border-orange-200 text-orange-700"
                                        : "border-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {hasOptionsForGroup ? (
                                      <div className="space-y-2">
                                        {group.options.map((option) => (
                                          <div
                                            key={`${group.category}-${option.months}`}
                                            className="flex items-baseline justify-between gap-2 text-sm sm:text-base"
                                          >
                                            <span>
                                              {option.months} {option.months === 1 ? "cuota" : "cuotas"}
                                            </span>
                                            <span className="font-semibold">
                                              $
                                              {option.monthlyAmount.toLocaleString("es-AR", {
                                                maximumFractionDigits: 0,
                                              })}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p
                                        className={`text-xs ${
                                          group.category === "naranja" ? "text-orange-600/70" : "text-blue-600/70"
                                        }`}
                                      >
                                        No hay planes disponibles en este momento.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-blue-700">
                          Consulta por financiacion personalizada para este producto.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {product.category.toLowerCase() === "iphone" && (
                  <TradeInEstimator
                    productName={product.name}
                    productPriceARS={Math.round(priceInPesos)}
                    productPriceUSD={priceInUSD}
                    productCondition={product.condition}
                  />
                )}

                <div className="flex flex-col gap-4 lg:hidden">
                  <QuickActionButtons />
                  <BenefitsGrid />
                </div>
              </div>
            </AnimatedSection>
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
                          <Image
                            src={relatedProduct.images[0] || "/placeholder.svg?height=300&width=300"}
                            alt={relatedProduct.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            sizes="(min-width: 1024px) 210px, 40vw"
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
