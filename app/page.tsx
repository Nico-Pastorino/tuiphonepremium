"use client"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/contexts/ProductContext"

export default function HomePage() {
  const { products } = useProducts()

  const featuredProducts = products.filter((p) => p.featured)

  const scrollToProducts = () => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section - Sin badge de nuevos productos */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="TuIphonepremium Store"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-200">
                  Los mejores
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    productos Apple
                  </span>
                  <br />
                  de Argentina
                </h1>

                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-400">
                  Descubre nuestra selección premium de iPhone, iPad, Mac y más. Productos nuevos y seminuevos con
                  garantía extendida.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up animation-delay-600">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                    onClick={scrollToProducts}
                  >
                    Ver productos
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                    asChild
                  >
                    <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 w-5 h-5" />
                      Consultar por WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Stats - Mejoradas */}
                <div className="grid grid-cols-3 gap-8 text-white animate-fade-in-up animation-delay-800">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-1">10K+</div>
                    <div className="text-white/80 text-sm md:text-base">Clientes felices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-1">5 años</div>
                    <div className="text-white/80 text-sm md:text-base">En el mercado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-1">24h</div>
                    <div className="text-white/80 text-sm md:text-base">Envío express</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={scrollToProducts}
            className="text-white hover:text-blue-400 transition-colors animate-bounce"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Categories Section - Mejorada */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30" id="productos">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explora por categoría</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encuentra exactamente lo que buscas en nuestra amplia selección
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[
                {
                  icon: Smartphone,
                  name: "iPhone",
                  count: "25+ modelos",
                  href: "/productos?category=iphone",
                  color: "from-blue-500 to-purple-600",
                },
                {
                  icon: Tablet,
                  name: "iPad",
                  count: "15+ modelos",
                  href: "/productos?category=ipad",
                  color: "from-purple-500 to-pink-600",
                },
                {
                  icon: Laptop,
                  name: "Mac",
                  count: "12+ modelos",
                  href: "/productos?category=mac",
                  color: "from-gray-600 to-gray-800",
                },
                {
                  icon: Watch,
                  name: "Apple Watch",
                  count: "8+ modelos",
                  href: "/productos?category=watch",
                  color: "from-red-500 to-orange-600",
                },
                {
                  icon: Headphones,
                  name: "AirPods",
                  count: "6+ modelos",
                  href: "/productos?category=airpods",
                  color: "from-green-500 to-teal-600",
                },
              ].map((category, index) => (
                <AnimatedSection key={category.name} animation="scale" delay={index * 100}>
                  <Link href={category.href}>
                    <Card className="group hover:shadow-xl transition-all duration-500 cursor-pointer border-0 shadow-md overflow-hidden transform hover:scale-105 rounded-2xl">
                      <CardContent className="p-4 md:p-6 text-center">
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                        >
                          <category.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1 md:mb-2">
                          {category.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600">{category.count}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Products - Mejorada */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Productos destacados</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Los más vendidos y mejor valorados por nuestros clientes
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <AnimatedSection key={product.id} animation="fadeUp" delay={index * 150}>
                  <Card className="group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl">
                    <CardContent className="p-0">
                      {/* Image container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=300&width=300&query=iPhone"}
                          alt={product.name}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-105"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.condition === "seminuevo" && (
                            <Badge className="bg-emerald-500/90 text-white font-medium px-2 py-1 text-xs rounded-full">
                              Seminuevo
                            </Badge>
                          )}
                          {product.featured && (
                            <Badge className="bg-amber-500/90 text-white font-medium px-2 py-1 text-xs rounded-full">
                              Destacado
                            </Badge>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="absolute bottom-3 left-3">
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 border border-green-500/30 backdrop-blur-sm">
                            {product.stock} disponibles
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium text-blue-600 border-blue-200 bg-blue-50 mb-2"
                        >
                          {product.category.toUpperCase()}
                        </Badge>

                        <h3 className="font-bold text-lg mb-2 text-gray-900 leading-tight line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            ${product.price.toLocaleString("es-AR")}
                          </span>
                          <div className="text-sm text-emerald-600 font-medium mt-1">
                            💳 Hasta 12 cuotas disponibles
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all duration-300"
                          asChild
                        >
                          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Consultar
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection animation="fadeUp" delay={400} className="text-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 bg-transparent"
              >
                <Link href="/productos">
                  Ver todos los productos
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section - Mejorada */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fadeUp" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir TuIphonepremium?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Beneficios que nos hacen la mejor opción para tus productos Apple
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Garantía extendida",
                  description: "12 meses de garantía y soporte técnico especializado",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: Truck,
                  title: "Envío express",
                  description: "Envío gratuito en CABA y GBA en menos de 24hs",
                  color: "from-blue-500 to-cyan-600",
                },
                {
                  icon: Award,
                  title: "Calidad premium",
                  description: "Productos verificados y certificados con garantía",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((benefit, index) => (
                <AnimatedSection key={index} animation="fadeUp" delay={index * 200}>
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 rounded-2xl">
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg`}
                      >
                        <benefit.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* WhatsApp CTA Section */}
      <AnimatedSection animation="scale">
        <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para comprar?</h2>
              <p className="text-lg md:text-xl text-green-100 mb-8">
                Contactanos por WhatsApp y te ayudamos a encontrar el producto perfecto
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 py-4 rounded-xl text-lg transform hover:scale-110 transition-all duration-300 shadow-xl"
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

      {/* Footer - Con gradiente */}
      <AnimatedSection animation="fadeUp">
        <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <AnimatedSection animation="fadeLeft">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 relative">
                      <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">TuIphonepremium</h3>
                      <p className="text-blue-100 text-sm">Productos Apple Premium</p>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-4 leading-relaxed">
                    Tu tienda premium de productos Apple en Argentina. Calidad garantizada y el mejor servicio.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <div>
                  <h4 className="font-bold mb-4 text-lg">Productos</h4>
                  <ul className="space-y-3 text-blue-100">
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
                  <div className="space-y-3 text-blue-100">
                    <p>📱 WhatsApp: +54 9 11 1234-5678</p>
                    <p>📧 Email: info@tuiphonepremium.com.ar</p>
                    <p>📍 Buenos Aires, Argentina</p>
                    <p>🕒 Lun a Vie: 9:00 - 18:00</p>
                  </div>
                  <Button
                    asChild
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/30"
                  >
                    <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fadeUp" delay={600}>
              <div className="border-t border-white/20 pt-8 text-center text-blue-100">
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
