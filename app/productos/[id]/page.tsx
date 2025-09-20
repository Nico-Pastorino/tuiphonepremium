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
} from "lucide-react"
import { useProducts } from "@/contexts/ProductContext"
import { useAdmin } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProductById, products } = useProducts()
  const { installmentPlans } = useAdmin()
  const { dollarRate } = useDollarRate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  useEffect(() => {
    if (params.id) {
      const foundProduct = getProductById(params.id as string)
      setProduct(foundProduct || null)
    }
  }, [params.id, getProductById])

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
    dollarRate && product.priceUSD !== undefined && product.priceUSD !== null
      ? product.priceUSD * dollarRate.blue
      : product.price
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  const validInstallmentAmount = Number.isFinite(priceInPesos) ? Math.max(priceInPesos, 0) : null
  const categoryLabels = {
    "visa-mastercard": "Visa / Mastercard",
    naranja: "Tarjeta Naranja",
  } as const
  type InstallmentCategory = keyof typeof categoryLabels

  const installmentGroups =
    validInstallmentAmount === null
      ? []
      : (Object.entries(categoryLabels) as Array<[InstallmentCategory, string]>).map(([category, label]) => {
          const options = installmentPlans
            .filter((plan) => plan.category === category && plan.isActive)
            .filter((plan) => {
              if (validInstallmentAmount < plan.minAmount) return false
              if (plan.maxAmount > 0 && validInstallmentAmount > plan.maxAmount) return false
              return true
            })
            .map((plan) => {
              const totalAmount = validInstallmentAmount * (1 + plan.interestRate / 100)
              const monthlyAmount = plan.months > 0 ? totalAmount / plan.months : totalAmount
              return {
                id: plan.id,
                months: plan.months,
                monthlyAmount,
              }
            })
            .sort((a, b) => a.months - b.months)

          return { category, label, options }
        })

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <AnimatedSection animation="fadeLeft">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
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
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.condition === "seminuevo" && (
                      <Badge className="bg-blue-500 text-white font-medium px-3 py-1 rounded-full">Seminuevo</Badge>
                    )}
                    {product.featured && (
                      <Badge className="bg-gray-900 text-white font-medium px-3 py-1 rounded-full">Destacado</Badge>
                    )}
                    {discountPercentage > 0 && (
                      <Badge className="bg-red-500 text-white font-bold px-3 py-1 rounded-full">
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
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          selectedImageIndex === index ? "ring-2 ring-blue-500" : "hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Product Info */}

            <AnimatedSection animation="fadeRight">

              <div className="space-y-6">

                {/* Category */}

                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 px-3 py-1">

                  {product.category.toUpperCase()}

                </Badge>



                {/* Title */}

                <h1 className="text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>



                {/* Price */}

                <div className="space-y-3">

                  <div className="flex items-baseline gap-4">

                    <span className="text-4xl font-bold text-gray-900">${priceInPesos.toLocaleString("es-AR")}</span>

                    {originalPrice && (

                      <span className="text-2xl text-gray-500 line-through">

                        ${originalPrice.toLocaleString("es-AR")}

                      </span>

                    )}

                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-700 font-medium">Opciones de financiacion disponibles</p>

                    {hasInstallmentOptions ? (
                      <div className="mt-3 space-y-3 text-sm text-blue-700">
                        {installmentGroups.map((group) => (
                          <div key={group.category} className="rounded-md bg-white/60 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                              {group.label}
                            </p>
                            {group.options.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {group.options.map((option) => (
                                  <div
                                    key={`${group.category}-${option.months}`}
                                    className="flex items-baseline justify-between gap-2"
                                  >
                                    <span>
                                      {option.months} {option.months === 1 ? "cuota" : "cuotas"}
                                    </span>
                                    <span className="font-semibold">
                                      ${option.monthlyAmount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-blue-600/70">No hay planes disponibles para este monto.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-blue-700">Consulta por financiacion personalizada para este producto.</p>
                    )}
                  </div>

                </div>
                {/* Actions */}

                <div className="flex gap-4">

                  <Button

                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl text-lg"

                    asChild

                  >

                    <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">

                      <MessageCircle className="w-5 h-5 mr-2" />

                      Consultar por WhatsApp

                    </a>

                  </Button>



                  <Button

                    variant="outline"

                    size="lg"

                    className="px-4 py-4 rounded-xl border-2 bg-transparent"

                    onClick={handleShare}

                  >

                    <Share2 className="w-5 h-5" />

                  </Button>

                </div>



                {/* Benefits */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">

                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">

                      <Shield className="w-5 h-5 text-green-600" />

                    </div>

                    <div>

                      <p className="font-medium text-sm">Garantia</p>

                      <p className="text-xs text-gray-600">12 meses</p>

                    </div>

                  </div>



                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">

                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">

                      <Truck className="w-5 h-5 text-blue-600" />

                    </div>

                    <div>

                      <p className="font-medium text-sm">Envio gratis</p>

                      <p className="text-xs text-gray-600">CABA y GBA</p>

                    </div>

                  </div>



                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">

                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">

                      <CreditCard className="w-5 h-5 text-purple-600" />

                    </div>

                    <div>

                      <p className="font-medium text-sm">Financiacion</p>

                      <p className="text-xs text-gray-600">Hasta 12 cuotas</p>

                    </div>

                  </div>

                </div>

              </div>



            </AnimatedSection>
          </div>

          {/* Product Details */}
          <AnimatedSection animation="fadeUp">
            <Card className="mb-16 border-0 shadow-sm">
              <CardContent className="p-8">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Descripcion</TabsTrigger>
                    <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
                    <TabsTrigger value="reviews">Resenas</TabsTrigger>
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

                  <TabsContent value="reviews" className="mt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-600">Las resenas estaran disponibles proximamente.</p>
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
