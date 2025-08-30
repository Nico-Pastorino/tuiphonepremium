"use client"

import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductCard } from "@/components/ProductCard"
import { ProductsLoading } from "@/components/ProductsLoading"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Truck,
  Shield,
  ArrowRight,
  ArrowDown,
  MessageCircle,
  Award,
  RefreshCw,
  AlertCircle,
  Cable,
  Star,
  Zap,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/contexts/ProductContext"

export default function HomePage() {
  const { products, loading, error, supabaseConnected, getFeaturedProducts, refreshProducts } = useProducts()
  const featuredProducts = getFeaturedProducts().slice(0, 8)

  const scrollToProducts = () => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section - Nueva imagen con mejor espaciado */}
      <section className="relative w-full overflow-hidden">
        {/* Contenedor de imagen con altura adaptativa y mejor espaciado del navbar */}
        <div className="relative w-full h-screen min-h-[700px] max-h-[900px] sm:min-h-[750px] md:min-h-[800px] mt-20 sm:mt-24 md:mt-28">
          <div className="absolute inset-0">
            <Image
              src="/portada.jpg"
              alt="Colección Premium de Productos Apple - iPhone, iPad, Mac, HomePod, AirPods, Apple Pencil"
              fill
              className="object-contain hero-image opacity-50 sm:opacity-60 md:opacity-70"
              style={{
                objectPosition: "center center",
              }}
              priority
              quality={95}
              sizes="100vw"
            />
          </div>

          {/* Overlay más suave para mejor contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 sm:bg-gradient-to-t sm:from-black/60 sm:via-black/30 sm:to-black/10 md:bg-gradient-to-r md:from-black/70 md:via-black/40 md:to-black/20"></div>
        </div>

        {/* Contenido superpuesto - Mejor espaciado del título */}
        <div className="absolute inset-0 flex items-center justify-center sm:justify-start mt-20 sm:mt-24 md:mt-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="w-full max-w-5xl mx-auto sm:mx-0 text-center sm:text-left">
              <AnimatedSection animation="fadeUp">
                <div className="space-y-8 sm:space-y-8 md:space-y-10">
                  {/* Título con mejor espaciado y separación del navbar */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] sm:leading-tight drop-shadow-2xl pt-8 sm:pt-12 md:pt-16">
                    Los mejores
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-none">
                      productos Apple
                    </span>
                    <br />
                    de Argentina
                  </h1>

                  {/* Subtítulo con mejor legibilidad */}
                  <div className="max-w-2xl mx-auto sm:mx-0">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white leading-relaxed font-medium drop-shadow-lg">
                      Descubre nuestra selección premium de iPhone, iPad, Mac y más.
                      <span className="text-blue-300 font-semibold block sm:inline mt-2 sm:mt-0">
                        {" "}
                        Productos nuevos y seminuevos
                      </span>{" "}
                      con garantía.
                    </p>
                  </div>

                  {/* Botones más grandes y mejor espaciados */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-start pt-6 sm:pt-8">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-50 font-bold px-10 sm:px-12 py-5 sm:py-6 rounded-2xl transition-all duration-300 shadow-2xl text-lg sm:text-xl min-h-[60px] touch-manipulation"
                      onClick={scrollToProducts}
                    >
                      Explorar productos
                      <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-10 sm:px-12 py-5 sm:py-6 rounded-2xl transition-all duration-300 text-lg sm:text-xl bg-white/20 backdrop-blur-sm min-h-[60px] touch-manipulation shadow-2xl"
                      asChild
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>

                  {/* Stats con mejor espaciado */}
                  <div className="grid grid-cols-3 gap-8 sm:gap-10 text-white pt-10 sm:pt-12 max-w-lg mx-auto sm:mx-0">
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">10K+</div>
                      <div className="text-white/95 text-sm sm:text-base md:text-lg font-medium drop-shadow-md">
                        Clientes
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">5</div>
                      <div className="text-white/95 text-sm sm:text-base md:text-lg font-medium drop-shadow-md">
                        Años
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">24h</div>
                      <div className="text-white/95 text-sm sm:text-base md:text-lg font-medium drop-shadow-md">
                        Envío
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Mejor posicionado */}
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
          <button
            onClick={scrollToProducts}
            className="text-white/90 hover:text-white transition-colors animate-bounce p-3 rounded-full hover:bg-white/10 drop-shadow-lg"
            aria-label="Scroll to products"
          >
            <ArrowDown className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>
      </section>

      {/* Categories Section - Iconos más minimalistas */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 sm:py-20 md:py-24 bg-gray-50" id="productos">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
                Explora por categoría
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto px-4">
                Encuentra exactamente lo que buscas en nuestra selección de productos Apple
              </p>
            </AnimatedSection>

            {/* Grid responsive mejorado con iconos minimalistas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  icon: Smartphone,
                  name: "iPhone",
                  count: `${products.filter((p) => p.category === "iphone").length}+ modelos`,
                  href: "/productos?category=iphone",
                  description: "Los últimos modelos",
                  gradient: "from-gray-800 to-gray-900",
                },
                {
                  icon: Tablet,
                  name: "iPad",
                  count: `${products.filter((p) => p.category === "ipad").length}+ modelos`,
                  href: "/productos?category=ipad",
                  description: "Para trabajo y creatividad",
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  icon: Laptop,
                  name: "Mac",
                  count: `${products.filter((p) => p.category === "mac").length}+ modelos`,
                  href: "/productos?category=mac",
                  description: "Potencia profesional",
                  gradient: "from-gray-600 to-gray-700",
                },
                {
                  icon: Watch,
                  name: "Apple Watch",
                  count: `${products.filter((p) => p.category === "watch").length}+ modelos`,
                  href: "/productos?category=watch",
                  description: "Tu salud en tu muñeca",
                  gradient: "from-red-500 to-pink-500",
                },
                {
                  icon: Headphones,
                  name: "AirPods",
                  count: `${products.filter((p) => p.category === "airpods").length}+ modelos`,
                  href: "/productos?category=airpods",
                  description: "Audio excepcional",
                  gradient: "from-white to-gray-100 border border-gray-200",
                },
                {
                  icon: Cable,
                  name: "Accesorios",
                  count: `${products.filter((p) => p.category === "accesorios").length}+ productos`,
                  href: "/productos?category=accesorios",
                  description: "Complementos perfectos",
                  gradient: "from-orange-400 to-yellow-500",
                },
              ].map((category, index) => (
                <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                  <Link href={category.href}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden rounded-2xl sm:rounded-3xl h-full bg-white hover:scale-105">
                      <CardContent className="p-4 sm:p-6 md:p-8 text-center h-full flex flex-col justify-between">
                        <div>
                          <div
                            className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <category.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white stroke-[1.5]" />
                          </div>
                          <h3 className="font-bold text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2 sm:mb-3">
                            {category.name}
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 hidden sm:block">
                            {category.description}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{category.count}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Products - Grid responsive */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <span className="text-yellow-600 font-semibold">Destacados</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
                Productos destacados
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto px-4">
                Los más vendidos y mejor valorados por nuestros clientes
              </p>
            </AnimatedSection>

            {loading ? (
              <ProductsLoading />
            ) : error && !supabaseConnected ? (
              <div className="text-center py-16 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Usando datos de ejemplo</h3>
                <p className="text-base sm:text-lg text-gray-600 mb-8 px-4">
                  Para ver datos reales, configura Supabase
                </p>
                <Button onClick={refreshProducts} variant="outline" className="border-gray-300 bg-transparent">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Reintentar conexión
                </Button>
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
                {featuredProducts.map((product, index) => (
                  <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                    <ProductCard product={product} variant="default" />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">No hay productos destacados</h3>
                <p className="text-base sm:text-lg text-gray-600 mb-8 px-4">
                  Los productos aparecerán aquí una vez que sean agregados
                </p>
              </div>
            )}

            {featuredProducts.length > 0 && (
              <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-16 sm:mt-20">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl transition-all duration-300 shadow-lg text-lg sm:text-xl"
                >
                  <Link href="/productos">
                    Ver todos los productos
                    <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </Button>
              </AnimatedSection>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Financing Section - Nueva sección */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-blue-600 font-semibold">Financiación</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
                Comprá en cuotas
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto px-4">
                Financiación flexible con todas las tarjetas de crédito
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              <AnimatedSection animation="fadeUp" delay={100}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl sm:rounded-3xl h-full bg-white">
                  <CardContent className="p-6 sm:p-8 md:p-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Visa & Mastercard</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>1 cuota</span>
                        <span className="font-semibold text-green-600">Sin interés</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>3 cuotas</span>
                        <span className="font-semibold text-green-600">Sin interés</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>6 cuotas</span>
                        <span className="font-semibold">15% TEA</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>12 cuotas</span>
                        <span className="font-semibold">25% TEA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl sm:rounded-3xl h-full bg-white">
                  <CardContent className="p-6 sm:p-8 md:p-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Naranja</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>1 cuota</span>
                        <span className="font-semibold text-green-600">Sin interés</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>3 cuotas</span>
                        <span className="font-semibold">10% TEA</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>6 cuotas</span>
                        <span className="font-semibold">20% TEA</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>12 cuotas</span>
                        <span className="font-semibold">30% TEA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={300}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl sm:rounded-3xl h-full bg-white md:col-span-2 lg:col-span-1">
                  <CardContent className="p-6 sm:p-8 md:p-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Transferencia</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">10% OFF</div>
                        <p className="text-sm">Descuento especial pagando por transferencia bancaria</p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
                    >
                      <Link href="/cuotas">Ver más detalles</Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section - Iconos minimalistas */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto px-4">
                Beneficios que nos hacen la mejor opción para tus productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {[
                {
                  icon: Shield,
                  title: "Garantía extendida",
                  description: "12 meses de garantía completa y soporte técnico especializado",
                  features: ["Soporte 24/7", "Reparación gratuita", "Reemplazo inmediato"],
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  icon: Truck,
                  title: "Envío express",
                  description: "Envío gratuito en CABA y GBA en menos de 24 horas",
                  features: ["Envío gratis", "Tracking en tiempo real", "Seguro incluido"],
                  gradient: "from-blue-500 to-cyan-600",
                },
                {
                  icon: Award,
                  title: "Calidad premium",
                  description: "Productos verificados y certificados con garantía de autenticidad",
                  features: ["100% originales", "Certificación Apple", "Prueba de calidad"],
                  gradient: "from-purple-500 to-violet-600",
                },
              ].map((benefit, index) => (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 200}>
                  <Card className="text-center border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl sm:rounded-3xl h-full bg-white hover:scale-105">
                    <CardContent className="p-6 sm:p-8 md:p-10 h-full flex flex-col justify-between">
                      <div>
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <benefit.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white stroke-[1.5]" />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
                          {benefit.title}
                        </h3>
                        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">{benefit.description}</p>
                      </div>
                      <div className="space-y-3">
                        {benefit.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-center gap-3 text-sm sm:text-base text-gray-600"
                          >
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section - Responsive */}
      <AnimatedSection animation="scale">
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
                ¿Listo para comprar?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 sm:mb-10 px-4">
                Contactanos por WhatsApp y te ayudamos a encontrar el producto perfecto
              </p>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 font-semibold px-10 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl transition-all duration-300 shadow-lg"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  Escribinos por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer - Responsive */}
      <AnimatedSection animation="fadeUp">
        <footer className="bg-gray-900 text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 sm:mb-16">
              <AnimatedSection animation="fadeLeft">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex-shrink-0">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold">TuIphonepremium</h3>
                      <p className="text-base sm:text-lg text-gray-400">Productos Apple Premium</p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-lg">
                    Tu tienda premium de productos Apple en Argentina. Calidad garantizada y el mejor servicio.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div>
                  <h4 className="font-bold mb-4 sm:mb-6 text-lg sm:text-xl">Productos</h4>
                  <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-400">
                    <li>
                      <Link href="/productos?category=iphone" className="hover:text-white transition-colors">
                        iPhone
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=ipad" className="hover:text-white transition-colors">
                        iPad
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=mac" className="hover:text-white transition-colors">
                        Mac
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=watch" className="hover:text-white transition-colors">
                        Apple Watch
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=airpods" className="hover:text-white transition-colors">
                        AirPods
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos?category=accesorios" className="hover:text-white transition-colors">
                        Accesorios
                      </Link>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeRight" delay={400}>
                <div>
                  <h4 className="font-bold mb-4 sm:mb-6 text-lg sm:text-xl">Contacto</h4>
                  <div className="space-y-4 text-base sm:text-lg text-gray-400 mb-6 sm:mb-8">
                    <div>
                      <p className="font-medium text-white">WhatsApp</p>
                      <p className="text-sm sm:text-base">+54 9 11 1234-5678</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-sm sm:text-base">info@tuiphonepremium.com.ar</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Ubicación</p>
                      <p className="text-sm sm:text-base">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 text-base sm:text-lg"
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 text-base sm:text-lg"
                    >
                      <Link href="/admin">
                        <Shield className="w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fadeUp" delay={600}>
              <div className="border-t border-gray-800 pt-8 sm:pt-10 text-center text-sm sm:text-base text-gray-400">
                <p>&copy; 2024 TuIphonepremium. Todos los derechos reservados.</p>
              </div>
            </AnimatedSection>
          </div>
        </footer>
      </AnimatedSection>

      {/* Floating WhatsApp Button - Responsive */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
        <Button
          asChild
          className="bg-green-500 hover:bg-green-600 text-white p-4 sm:p-5 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </a>
        </Button>
      </div>
    </div>
  )
}
