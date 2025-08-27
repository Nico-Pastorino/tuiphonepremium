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
  Heart,
  Share2,
  Shield,
  Truck,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useProducts } from "@/contexts/ProductContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProductById, products } = useProducts()
  const { dollarRate } = useDollarRate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

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

  const priceInPesos = dollarRate ? product.priceUSD * dollarRate.blue : product.price
  const discountPercentage = product.condition === "seminuevo" ? 15 : 0
  const originalPrice = discountPercentage > 0 ? priceInPesos / (1 - discountPercentage / 100) : null

  // Productos relacionados
  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
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

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600">(4.8) • 127 reseñas</span>
                </div>

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

                  {dollarRate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg font-medium">USD ${product.priceUSD}</span>
                      <span className="text-gray-400">•</span>
                      <span>Dólar Blue: ${dollarRate.blue}</span>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-700 font-medium">💳 Hasta 12 cuotas sin interés disponibles</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700">Disponible</span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl text-lg"
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
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>

                  <Button variant="outline" size="lg" className="px-4 py-4 rounded-xl border-2 bg-transparent">
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
                      <p className="font-medium text-sm">Garantía</p>
                      <p className="text-xs text-gray-600">12 meses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Envío gratis</p>
                      <p className="text-xs text-gray-600">CABA y GBA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Financiación</p>
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
                    <TabsTrigger value="description">Descripción</TabsTrigger>
                    <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
                    <TabsTrigger value="reviews">Reseñas</TabsTrigger>
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
                      <p className="text-gray-600">Las reseñas estarán disponibles próximamente.</p>
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
                <p className="text-gray-600">Otros productos que podrían interesarte</p>
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
