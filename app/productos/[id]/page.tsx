"use client"

import { useState, useEffect } from "react"
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
  const { getProductById, products } = useProducts()
  const { installmentPlans, getEffectiveDollarRate } = useAdmin()
  const effectiveDollarRate = getEffectiveDollarRate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  useEffect(() => {
    if (!params.id) {
      setProduct(null)
      setIsLoadingProduct(false)
      return
    }

    setIsLoadingProduct(true)
    const foundProduct = getProductById(params.id as string)
    setProduct(foundProduct || null)
    setIsLoadingProduct(false)
  }, [params.id, getProductById])

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
      const firstGroupWithOptions = groups.find((group) => group.options.length > 0)
      return firstGroupWithOptions ? firstGroupWithOptions.category : null
    })
  }, [product, installmentPlans, effectiveDollarRate])

  const toggleInstallmentCategory = (category: InstallmentCategory) => {
    setOpenInstallmentCategory((current) => (current === category ? null : category))
  }

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

  const priceInPesos =
    product.priceUSD !== undefined && product.priceUSD !== null ? product.priceUSD * effectiveDollarRate : product.price
  const priceInUSD =
    product.priceUSD !== undefined && product.priceUSD !== null
      ? product.priceUSD
      : effectiveDollarRate
        ? Number((product.price / effectiveDollarRate).toFixed(0))
        : null
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

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
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-lg font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-purple-700"
          asChild
        >
          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            Consultar por WhatsApp
          </a>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 bg-transparent px-6 py-4 font-medium text-blue-600 transition hover:border-blue-400 hover:text-blue-700 sm:w-auto"
          onClick={handleShare}
          aria-label="Compartir producto"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-semibold sm:hidden">Compartir</span>
        </Button>
      </div>
    </div>
  )

  const BenefitsGrid = ({ className = "" }: { className?: string }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
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
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
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
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </AnimatedSection>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 mb-16">
            {/* Images */}
            <AnimatedSection animation="fadeLeft">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                    <Image
                      src={product.images[selectedImageIndex] || "/placeholder.svg?height=600&width=600"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 transform rounded-full bg-white/80 p-0 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 transform rounded-full bg-white/80 p-0 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Badges */}
                    <div className="absolute left-4 top-4 flex flex-col gap-2">
                      {product.condition === "seminuevo" && (
                        <Badge className="rounded-full bg-blue-500 px-3 py-1 font-medium text-white">Seminuevo</Badge>
                      )}
                      {product.featured && (
                        <Badge className="rounded-full bg-gray-900 px-3 py-1 font-medium text-white">Destacado</Badge>
                      )}
                      {discountPercentage > 0 && (
                        <Badge className="rounded-full bg-red-500 px-3 py-1 font-bold text-white">
                          -{discountPercentage}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square overflow-hidden rounded-lg ${
                            selectedImageIndex === index ? "ring-2 ring-blue-500" : "hover:opacity-80"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-contain"
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
                  <h1 className="text-4xl font-bold leading-tight text-gray-900">{product.name}</h1>

                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</span>

                      {originalPrice && (
                        <span className="text-2xl text-gray-400 line-through">
                          ${originalPrice.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    {priceInUSD !== null && (
                      <div className="mt-1 text-sm text-gray-500">USD {priceInUSD.toLocaleString("es-AR")}</div>
                    )}

                    <div className="mt-5 rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4 sm:p-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-base font-semibold text-blue-700">Opciones de financiacion disponibles</p>
                        {hasInstallmentOptions && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Elegi la mas conveniente
                          </span>
                        )}
                      </div>

                      {hasInstallmentOptions ? (
                        <div className="mt-4 space-y-3">
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
                                  className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                                    group.category === "naranja"
                                      ? "hover:bg-orange-100/80"
                                      : "hover:bg-blue-50/60"
                                  }`}
                                >
                                  <div>
                                    <p
                                      className={`text-xs font-semibold uppercase tracking-wide ${
                                        group.category === "naranja" ? "text-orange-600" : "text-blue-600"
                                      }`}
                                    >
                                      {group.label}
                                    </p>
                                    <p
                                      className={`mt-1 text-sm ${
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
                                            className="flex items-baseline justify-between gap-2"
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
            <Card className="mb-16 border-0 shadow-sm">
              <CardContent className="p-8">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Descripcion</TabsTrigger>
                    <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Productos relacionados</h2>
                <p className="text-gray-600">Otros productos que podrian interesarte</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <AnimatedSection key={relatedProduct.id} animation="fadeUp" delay={index * 100}>
                    <Link href={`/productos/${relatedProduct.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <Image
                            src={relatedProduct.images[0] || "/placeholder.svg?height=300&width=300"}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
