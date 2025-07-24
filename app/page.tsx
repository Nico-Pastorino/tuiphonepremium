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

      {/* Hero Section - Más minimalista */}
      <section className="relative h-screen w-full overflow-hidden">
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
          {/* Overlay más sutil y minimalista */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <AnimatedSection animation="fadeUp">
                <div className="mb-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    Los mejores
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                      productos Apple
                    </span>
                    <br />
                    de Argentina
                  </h1>

                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                    Descubre nuestra selección premium de iPhone, iPad, Mac y más.
                    <span className="text-blue-300 font-medium"> Productos nuevos y seminuevos</span> con garantía.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg text-lg"
                      onClick={scrollToProducts}
                    >
                      Explorar productos
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-lg bg-white/10 backdrop-blur-sm"
                      asChild
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 w-5 h-5" />
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>

                  {/* Stats más minimalistas */}
                  <div className="grid grid-cols-3 gap-6 text-white">
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold mb-1">10K+</div>
                      <div className="text-white/80 text-sm md:text-base">Clientes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold mb-1">5</div>
                      <div className="text-white/80 text-sm md:text-base">Años</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold mb-1">24h</div>
                      <div className="text-white/80 text-sm md:text-base">Envío</div>
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
            className="text-white hover:text-blue-400 transition-colors animate-bounce"
          >
            <ArrowDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* Categories Section - Minimalista */}
      <AnimatedSection animation="fadeUp">
        <section className="py-20 bg-gray-50" id="productos">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Explora por categoría</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Encuentra exactamente lo que buscas en nuestra selección de productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
              ].map((category, index) => (
                <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                  <Link href={category.href}>
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm overflow-hidden rounded-2xl h-full bg-white">
                      <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
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
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Los más vendidos y mejor valorados por nuestros clientes
              </p>
            </AnimatedSection>

            {loading ? (
              <ProductsLoading />
            ) : error && !supabaseConnected ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Usando datos de ejemplo</h3>
                <p className="text-gray-600 mb-6">Para ver datos reales, configura Supabase</p>
                <Button onClick={refreshProducts} variant="outline" className="border-gray-300 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar conexión
                </Button>
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <AnimatedSection key={product.id} animation="fadeUp" delay={index * 100}>
                    <ProductCard product={product} variant="default" />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos destacados</h3>
                <p className="text-gray-600 mb-6">Los productos aparecerán aquí una vez que sean agregados</p>
              </div>
            )}

            {featuredProducts.length > 0 && (
              <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-16">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg text-lg"
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

      {/* Benefits Section - Más limpio */}
      <AnimatedSection animation="fadeUp">
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">¿Por qué elegirnos?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Beneficios que nos hacen la mejor opción para tus productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl h-full bg-white">
                    <CardContent className="p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <benefit.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">{benefit.title}</h3>
                        <p className="text-gray-600 mb-6">{benefit.description}</p>
                      </div>
                      <div className="space-y-2">
                        {benefit.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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

      {/* CTA Section - Más minimalista */}
      <AnimatedSection animation="scale">
        <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para comprar?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Contactanos por WhatsApp y te ayudamos a encontrar el producto perfecto
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg"
              >
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Escribinos por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer - Más limpio */}
      <AnimatedSection animation="fadeUp">
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <AnimatedSection animation="fadeLeft">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 relative">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">TuIphonepremium</h3>
                      <p className="text-gray-400">Productos Apple Premium</p>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Tu tienda premium de productos Apple en Argentina. Calidad garantizada y el mejor servicio.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div>
                  <h4 className="font-bold mb-4 text-lg">Productos</h4>
                  <ul className="space-y-3 text-gray-400">
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
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeRight" delay={400}>
                <div>
                  <h4 className="font-bold mb-4 text-lg">Contacto</h4>
                  <div className="space-y-3 text-gray-400">
                    <div>
                      <p className="font-medium text-white">WhatsApp</p>
                      <p className="text-sm">+54 9 11 1234-5678</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-sm">info@tuiphonepremium.com.ar</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Ubicación</p>
                      <p className="text-sm">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-3 rounded-xl transition-all duration-300"
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
              <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                <p>&copy; 2024 TuIphonepremium. Todos los derechos reservados.</p>
              </div>
            </AnimatedSection>
          </div>
        </footer>
      </AnimatedSection>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-6 h-6" />
          </a>
        </Button>
      </div>
    </div>
  )
}
