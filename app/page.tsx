"use client"

import { EnhancedNavbar } from "@/components/EnhancedNavbar"
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
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
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
      <EnhancedNavbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="/hero-apple-products.jpg"
              alt="Colección Premium de Productos Apple - iPhone, iPad, Mac, Apple Watch, AirPods"
              fill
              className="object-cover object-center scale-105"
              style={{
                imageRendering: "crisp-edges",
                WebkitImageRendering: "crisp-edges",
                MozImageRendering: "crisp-edges",
                msImageRendering: "crisp-edges",
                objectFit: "cover",
                objectPosition: "center center",
              }}
              priority
              quality={100}
              sizes="100vw"
            />
          </div>
          {/* Gradient Overlay - Más sutil para mostrar mejor la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <AnimatedSection animation="fadeUp">
                <div className="mb-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    Los mejores
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      productos Apple
                    </span>
                    <br />
                    de Argentina
                  </h1>

                  <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl leading-relaxed drop-shadow-lg">
                    Descubre nuestra selección premium de iPhone, iPad, Mac y más.
                    <span className="text-blue-300 font-semibold"> Productos nuevos y seminuevos</span> con garantía
                    extendida.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg backdrop-blur-sm"
                      onClick={scrollToProducts}
                    >
                      Explorar productos
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/80 text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg bg-white/10 backdrop-blur-md"
                      asChild
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 w-5 h-5" />
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-8 text-white">
                    <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="w-6 h-6 mr-2 text-blue-400" />
                        <div className="text-3xl md:text-4xl font-bold">10K+</div>
                      </div>
                      <div className="text-white/90 text-sm md:text-base font-medium">Clientes felices</div>
                    </div>
                    <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-6 h-6 mr-2 text-green-400" />
                        <div className="text-3xl md:text-4xl font-bold">5</div>
                      </div>
                      <div className="text-white/90 text-sm md:text-base font-medium">Años en el mercado</div>
                    </div>
                    <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Truck className="w-6 h-6 mr-2 text-purple-400" />
                        <div className="text-3xl md:text-4xl font-bold">24h</div>
                      </div>
                      <div className="text-white/90 text-sm md:text-base font-medium">Envío express</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={scrollToProducts}
            className="text-white hover:text-blue-400 transition-colors animate-bounce backdrop-blur-sm bg-white/10 rounded-full p-3"
          >
            <ArrowDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* Estado de conexión */}
      <div className="container mx-auto px-4 py-4">
        <Card
          className={`mb-6 ${supabaseConnected ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {supabaseConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Conectado a Supabase - Datos en tiempo real</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">
                      Usando datos de ejemplo - Configura Supabase para datos reales
                    </span>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={refreshProducts} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <AnimatedSection animation="fadeUp">
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30" id="productos">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Explora por categoría</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Encuentra exactamente lo que buscas en nuestra amplia selección de productos Apple premium
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                {
                  icon: Smartphone,
                  name: "iPhone",
                  count: `${products.filter((p) => p.category === "iphone").length}+ modelos`,
                  href: "/productos?category=iphone",
                  color: "from-blue-500 to-purple-600",
                  description: "Los últimos modelos",
                },
                {
                  icon: Tablet,
                  name: "iPad",
                  count: `${products.filter((p) => p.category === "ipad").length}+ modelos`,
                  href: "/productos?category=ipad",
                  color: "from-purple-500 to-pink-600",
                  description: "Para trabajo y creatividad",
                },
                {
                  icon: Laptop,
                  name: "Mac",
                  count: `${products.filter((p) => p.category === "mac").length}+ modelos`,
                  href: "/productos?category=mac",
                  color: "from-gray-600 to-gray-800",
                  description: "Potencia profesional",
                },
                {
                  icon: Watch,
                  name: "Apple Watch",
                  count: `${products.filter((p) => p.category === "watch").length}+ modelos`,
                  href: "/productos?category=watch",
                  color: "from-red-500 to-orange-600",
                  description: "Tu salud en tu muñeca",
                },
                {
                  icon: Headphones,
                  name: "AirPods",
                  count: `${products.filter((p) => p.category === "airpods").length}+ modelos`,
                  href: "/productos?category=airpods",
                  color: "from-green-500 to-teal-600",
                  description: "Audio excepcional",
                },
              ].map((category, index) => (
                <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                  <Link href={category.href}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg overflow-hidden transform hover:scale-105 rounded-3xl h-full">
                      <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                        <div>
                          <div
                            className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <category.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
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

      {/* Featured Products */}
      <AnimatedSection animation="fadeUp">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Productos destacados</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Los más vendidos y mejor valorados por nuestros clientes. Calidad garantizada y precios competitivos.
              </p>
            </AnimatedSection>

            {loading ? (
              <ProductsLoading />
            ) : error && !supabaseConnected ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Usando datos de ejemplo</h3>
                <p className="text-gray-600 mb-6">
                  Para ver datos reales, configura las variables de entorno de Supabase
                </p>
                <Button onClick={refreshProducts} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar conexión
                </Button>
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                    <ProductCard product={product} variant="featured" />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos destacados</h3>
                <p className="text-gray-600 mb-6">
                  Los productos aparecerán aquí una vez que sean agregados por el administrador
                </p>
              </div>
            )}

            {featuredProducts.length > 0 && (
              <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-16">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                >
                  <Link href="/productos">
                    Ver todos los productos
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </AnimatedSection>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection animation="fadeUp">
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">¿Por qué elegir TuIphonepremium?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Beneficios exclusivos que nos hacen la mejor opción para tus productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Garantía extendida",
                  description: "12 meses de garantía completa y soporte técnico especializado las 24 horas",
                  color: "from-green-500 to-emerald-600",
                  features: ["Soporte 24/7", "Reparación gratuita", "Reemplazo inmediato"],
                },
                {
                  icon: Truck,
                  title: "Envío express",
                  description: "Envío gratuito en CABA y GBA en menos de 24 horas. Interior del país en 48hs",
                  color: "from-blue-500 to-cyan-600",
                  features: ["Envío gratis", "Tracking en tiempo real", "Seguro incluido"],
                },
                {
                  icon: Award,
                  title: "Calidad premium",
                  description: "Productos verificados, certificados y probados con garantía de autenticidad",
                  color: "from-purple-500 to-pink-600",
                  features: ["100% originales", "Certificación Apple", "Prueba de calidad"],
                },
              ].map((benefit, index) => (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 200}>
                  <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl h-full">
                    <CardContent className="p-8 h-full flex flex-col justify-between">
                      <div>
                        <div
                          className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg`}
                        >
                          <benefit.icon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">{benefit.description}</p>
                      </div>
                      <div className="space-y-2">
                        {benefit.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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

      {/* CTA Section */}
      <AnimatedSection animation="scale">
        <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para comprar?</h2>
              <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
                Contactanos por WhatsApp y te ayudamos a encontrar el producto perfecto para vos
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-10 py-5 rounded-2xl text-xl transform hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Escribinos por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <AnimatedSection animation="fadeUp">
        <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <AnimatedSection animation="fadeLeft">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 relative">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">TuIphonepremium</h3>
                      <p className="text-blue-100">Productos Apple Premium</p>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-6 leading-relaxed text-lg">
                    Tu tienda premium de productos Apple en Argentina. Calidad garantizada, precios competitivos y el
                    mejor servicio al cliente.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div>
                  <h4 className="font-bold mb-6 text-xl">Productos</h4>
                  <ul className="space-y-4 text-blue-100">
                    <li>
                      <Link
                        href="/productos?category=iphone"
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        iPhone
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/productos?category=ipad"
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Tablet className="w-4 h-4" />
                        iPad
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/productos?category=mac"
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Laptop className="w-4 h-4" />
                        Mac
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/productos?category=watch"
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Watch className="w-4 h-4" />
                        Apple Watch
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/productos?category=airpods"
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Headphones className="w-4 h-4" />
                        AirPods
                      </Link>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeRight" delay={400}>
                <div>
                  <h4 className="font-bold mb-6 text-xl">Contacto</h4>
                  <div className="space-y-4 text-blue-100">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm">+54 9 11 1234-5678</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">📧</div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm">info@tuiphonepremium.com.ar</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">📍</div>
                      <div>
                        <p className="font-medium">Ubicación</p>
                        <p className="text-sm">Buenos Aires, Argentina</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Horarios</p>
                        <p className="text-sm">Lun a Vie: 9:00 - 18:00</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      asChild
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/30"
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent border-white/30 text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
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
              <div className="border-t border-white/20 pt-8 text-center text-blue-100">
                <p>
                  &copy; 2024 TuIphonepremium. Todos los derechos reservados. Diseñado con ❤️ para los amantes de Apple.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </footer>
      </AnimatedSection>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-110"
        >
          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-6 h-6" />
          </a>
        </Button>
      </div>
    </div>
  )
}
