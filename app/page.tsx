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

      {/* Hero Section - Imagen con menos intensidad para resaltar el texto */}
      <section className="relative w-full overflow-hidden">
        {/* Contenedor de imagen con altura adaptativa */}
        <div className="relative w-full h-screen min-h-[700px] max-h-[900px] sm:min-h-[750px] md:min-h-[800px]">
          <div className="absolute inset-0">
            <Image
              src="/portada.jpg"
              alt="Colección Premium de Productos Apple - MacBook, iPad, iPhone, Apple Watch, HomePod, Apple TV"
              fill
              className="object-cover hero-image opacity-40 sm:opacity-50 md:opacity-60"
              style={{
                objectPosition: "center center", // Centrado para mostrar todos los productos
              }}
              priority
              quality={95}
              sizes="100vw"
            />
          </div>

          {/* Overlay más intenso para mejor contraste del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 sm:bg-gradient-to-t sm:from-black/70 sm:via-black/50 sm:to-black/30 md:bg-gradient-to-r md:from-black/80 md:via-black/60 md:to-black/40"></div>
        </div>

        {/* Contenido superpuesto - Texto más grande en móvil */}
        <div className="absolute inset-0 flex items-center justify-center sm:justify-start">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="w-full max-w-5xl mx-auto sm:mx-0 text-center sm:text-left">
              <AnimatedSection animation="fadeUp">
                <div className="space-y-6 sm:space-y-6 md:space-y-8">
                  {/* Título con texto mucho más grande en móvil */}
                  <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] sm:leading-tight drop-shadow-2xl">
                    Los mejores
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-none">
                      productos Apple
                    </span>
                    <br />
                    de Argentina
                  </h1>

                  {/* Subtítulo con mejor legibilidad y tamaño más grande */}
                  <div className="max-w-2xl mx-auto sm:mx-0">
                    <p className="text-lg sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-medium drop-shadow-lg">
                      Descubre nuestra selección premium de iPhone, iPad, Mac y más.
                      <span className="text-blue-300 font-semibold block sm:inline mt-1 sm:mt-0">
                        {" "}
                        Productos nuevos y seminuevos
                      </span>{" "}
                      con garantía.
                    </p>
                  </div>

                  {/* Botones más grandes y mejor espaciados */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center sm:justify-start pt-4 sm:pt-6">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-50 font-bold px-8 sm:px-8 py-4 sm:py-4 rounded-xl transition-all duration-300 shadow-2xl text-lg sm:text-lg min-h-[56px] touch-manipulation"
                      onClick={scrollToProducts}
                    >
                      Explorar productos
                      <ArrowRight className="ml-2 w-5 h-5 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-8 sm:px-8 py-4 sm:py-4 rounded-xl transition-all duration-300 text-lg sm:text-lg bg-white/20 backdrop-blur-sm min-h-[56px] touch-manipulation shadow-2xl"
                      asChild
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 w-5 h-5 sm:w-5 sm:h-5" />
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>

                  {/* Stats con texto más grande y mejor contraste */}
                  <div className="grid grid-cols-3 gap-6 sm:gap-6 text-white pt-8 sm:pt-8 max-w-md mx-auto sm:mx-0">
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">10K+</div>
                      <div className="text-white/95 text-sm sm:text-sm md:text-base font-medium drop-shadow-md">
                        Clientes
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">5</div>
                      <div className="text-white/95 text-sm sm:text-sm md:text-base font-medium drop-shadow-md">
                        Años
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">24h</div>
                      <div className="text-white/95 text-sm sm:text-sm md:text-base font-medium drop-shadow-md">
                        Envío
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Posicionado mejor */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
          <button
            onClick={scrollToProducts}
            className="text-white/90 hover:text-white transition-colors animate-bounce p-2 rounded-full hover:bg-white/10 drop-shadow-lg"
            aria-label="Scroll to products"
          >
            <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>
      </section>

      {/* Categories Section - Responsive grid con Accesorios */}
      <AnimatedSection animation="fadeUp">
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50" id="productos">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                Explora por categoría
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Encuentra exactamente lo que buscas en nuestra selección de productos Apple
              </p>
            </AnimatedSection>

            {/* Grid responsive mejorado con 6 categorías */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {[
                {
                  icon: Smartphone,
                  name: "iPhone",
                  count: `${products.filter((p) => p.category === "iphone").length}+ modelos`,
                  href: "/productos?category=iphone",
                  description: "Los últimos modelos",
                },
                {
                  icon: Tablet,
                  name: "iPad",
                  count: `${products.filter((p) => p.category === "ipad").length}+ modelos`,
                  href: "/productos?category=ipad",
                  description: "Para trabajo y creatividad",
                },
                {
                  icon: Laptop,
                  name: "Mac",
                  count: `${products.filter((p) => p.category === "mac").length}+ modelos`,
                  href: "/productos?category=mac",
                  description: "Potencia profesional",
                },
                {
                  icon: Watch,
                  name: "Apple Watch",
                  count: `${products.filter((p) => p.category === "watch").length}+ modelos`,
                  href: "/productos?category=watch",
                  description: "Tu salud en tu muñeca",
                },
                {
                  icon: Headphones,
                  name: "AirPods",
                  count: `${products.filter((p) => p.category === "airpods").length}+ modelos`,
                  href: "/productos?category=airpods",
                  description: "Audio excepcional",
                },
                {
                  icon: Cable,
                  name: "Accesorios",
                  count: `${products.filter((p) => p.category === "accesorios").length}+ productos`,
                  href: "/productos?category=accesorios",
                  description: "Complementos perfectos",
                },
              ].map((category, index) => (
                <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                  <Link href={category.href}>
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm overflow-hidden rounded-xl sm:rounded-2xl h-full bg-white">
                      <CardContent className="p-3 sm:p-4 md:p-6 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <category.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                          </div>
                          <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-1 sm:mb-2">
                            {category.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 hidden sm:block">
                            {category.description}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{category.count}</p>
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
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                Productos destacados
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Los más vendidos y mejor valorados por nuestros clientes
              </p>
            </AnimatedSection>

            {loading ? (
              <ProductsLoading />
            ) : error && !supabaseConnected ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Usando datos de ejemplo</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                  Para ver datos reales, configura Supabase
                </p>
                <Button onClick={refreshProducts} variant="outline" className="border-gray-300 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar conexión
                </Button>
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {featuredProducts.map((product, index) => (
                  <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                    <ProductCard product={product} variant="default" />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No hay productos destacados</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                  Los productos aparecerán aquí una vez que sean agregados
                </p>
              </div>
            )}

            {featuredProducts.length > 0 && (
              <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-12 sm:mt-16">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg text-base sm:text-lg"
                >
                  <Link href="/productos">
                    Ver todos los productos
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              </AnimatedSection>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section - Grid responsive */}
      <AnimatedSection animation="fadeUp">
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeUp" className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Beneficios que nos hacen la mejor opción para tus productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Shield,
                  title: "Garantía extendida",
                  description: "12 meses de garantía completa y soporte técnico especializado",
                  features: ["Soporte 24/7", "Reparación gratuita", "Reemplazo inmediato"],
                },
                {
                  icon: Truck,
                  title: "Envío express",
                  description: "Envío gratuito en CABA y GBA en menos de 24 horas",
                  features: ["Envío gratis", "Tracking en tiempo real", "Seguro incluido"],
                },
                {
                  icon: Award,
                  title: "Calidad premium",
                  description: "Productos verificados y certificados con garantía de autenticidad",
                  features: ["100% originales", "Certificación Apple", "Prueba de calidad"],
                },
              ].map((benefit, index) => (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 200}>
                  <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl h-full bg-white">
                    <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">{benefit.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{benefit.description}</p>
                      </div>
                      <div className="space-y-2">
                        {benefit.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
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
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                ¿Listo para comprar?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
                Contactanos por WhatsApp y te ayudamos a encontrar el producto perfecto
              </p>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all duration-300 shadow-lg"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Escribinos por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer - Responsive */}
      <AnimatedSection animation="fadeUp">
        <footer className="bg-gray-900 text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
              <AnimatedSection animation="fadeLeft">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">TuIphonepremium</h3>
                      <p className="text-sm sm:text-base text-gray-400">Productos Apple Premium</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md">
                    Tu tienda premium de productos Apple en Argentina. Calidad garantizada y el mejor servicio.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div>
                  <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Productos</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
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
                  <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Contacto</h4>
                  <div className="space-y-3 text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                    <div>
                      <p className="font-medium text-white">WhatsApp</p>
                      <p className="text-xs sm:text-sm">+54 9 11 1234-5678</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-xs sm:text-sm">info@tuiphonepremium.com.ar</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Ubicación</p>
                      <p className="text-xs sm:text-sm">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      <Link href="/admin">
                        <Shield className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fadeUp" delay={600}>
              <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
                <p>&copy; 2024 TuIphonepremium. Todos los derechos reservados.</p>
              </div>
            </AnimatedSection>
          </div>
        </footer>
      </AnimatedSection>

      {/* Floating WhatsApp Button - Responsive */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          asChild
          className="bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>
        </Button>
      </div>
    </div>
  )
}
