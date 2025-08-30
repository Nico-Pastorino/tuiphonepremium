"use client"

import { useState, useEffect } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { ProductGrid } from "@/components/ProductGrid"
import { AnimatedSection } from "@/components/AnimatedSection"
import { useProducts } from "@/contexts/ProductContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Smartphone,
  Tablet,
  Monitor,
  Watch,
  Cable,
  Star,
  Shield,
  Truck,
  CreditCard,
  Users,
  Award,
  TrendingUp,
  MessageCircle,
  ArrowDown,
  CheckCircle,
  Zap,
  Heart,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const { getFeaturedProducts, loading, error } = useProducts()
  const { rate: dollarRate } = useDollarRate()
  const { installmentPlans } = useAdmin()
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    try {
      const products = getFeaturedProducts()
      setFeaturedProducts(products)
    } catch (err) {
      console.error("Error loading featured products:", err)
      setFeaturedProducts([])
    }
  }, [getFeaturedProducts])

  const categories = [
    {
      name: "iPhone",
      icon: Smartphone,
      href: "/productos?category=iphone",
      gradient: "from-gray-900 to-gray-700",
      description: "Últimos modelos",
    },
    {
      name: "iPad",
      icon: Tablet,
      href: "/productos?category=ipad",
      gradient: "from-blue-600 to-blue-800",
      description: "Potencia portátil",
    },
    {
      name: "Mac",
      icon: Monitor,
      href: "/productos?category=mac",
      gradient: "from-gray-600 to-gray-800",
      description: "Rendimiento pro",
    },
    {
      name: "Watch",
      icon: Watch,
      href: "/productos?category=watch",
      gradient: "from-red-500 to-pink-600",
      description: "Salud y fitness",
    },
    {
      name: "Accesorios",
      icon: Cable,
      href: "/productos?category=accesorios",
      gradient: "from-yellow-500 to-orange-600",
      description: "Complementos",
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Garantía Oficial",
      description: "Todos nuestros productos incluyen garantía oficial Apple",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "Envío gratuito a todo el país en compras superiores a $100.000",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: CreditCard,
      title: "Financiación",
      description: "Hasta 12 cuotas sin interés con tarjetas seleccionadas",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Zap,
      title: "Entrega Rápida",
      description: "Recibí tu producto en 24-48hs en CABA y GBA",
      gradient: "from-yellow-500 to-orange-600",
    },
  ]

  const stats = [
    { number: "10K+", label: "Clientes Satisfechos", icon: Users },
    { number: "5★", label: "Calificación Promedio", icon: Award },
    { number: "99%", label: "Productos Originales", icon: CheckCircle },
    { number: "24/7", label: "Soporte Técnico", icon: MessageCircle },
  ]

  const financingOptions = [
    {
      title: "Tarjetas Visa/Mastercard",
      description: "Cuotas sin interés y con interés",
      icon: CreditCard,
      gradient: "from-blue-600 to-purple-600",
      options: [
        { cuotas: 1, interes: 0, descripcion: "1 cuota sin interés" },
        { cuotas: 3, interes: 0, descripcion: "3 cuotas sin interés" },
        { cuotas: 6, interes: 15, descripcion: "6 cuotas con 15% de interés" },
        { cuotas: 12, interes: 25, descripcion: "12 cuotas con 25% de interés" },
      ],
    },
    {
      title: "Tarjeta Naranja",
      description: "Planes especiales Naranja",
      icon: CreditCard,
      gradient: "from-orange-500 to-red-600",
      options: [
        { cuotas: 1, interes: 0, descripcion: "1 cuota Naranja" },
        { cuotas: 3, interes: 5, descripcion: "3 cuotas con 5% de interés" },
        { cuotas: 6, interes: 12, descripcion: "6 cuotas con 12% de interés" },
        { cuotas: 12, interes: 20, descripcion: "12 cuotas con 20% de interés" },
      ],
    },
    {
      title: "Transferencia Bancaria",
      description: "Descuento especial por transferencia",
      icon: TrendingUp,
      gradient: "from-green-600 to-emerald-600",
      options: [{ cuotas: 1, interes: -10, descripcion: "10% de descuento" }],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <MinimalNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/portada.jpg)",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 md:mt-28 pt-8 sm:pt-12 md:pt-16">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8">
                Tu iPhone
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                Los mejores productos Apple al mejor precio. Garantía oficial, envío gratis y financiación disponible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                >
                  Ver Productos
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 min-w-[200px] bg-transparent"
                >
                  Contactar
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Explora Nuestras Categorías
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Encuentra el producto Apple perfecto para ti
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <AnimatedSection key={category.name} delay={index * 0.1}>
                <a
                  href={category.href}
                  className="group block p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                    {category.description}
                  </p>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Opciones de Financiación
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Elegí la forma de pago que más te convenga
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {financingOptions.map((option, index) => (
              <AnimatedSection key={option.title} delay={index * 0.1}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
                    >
                      <option.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">{option.title}</h3>
                    <p className="text-gray-600 mb-6 text-center">{option.description}</p>
                    <div className="space-y-3">
                      {option.options.map((plan, planIndex) => (
                        <div key={planIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{plan.descripcion}</span>
                          {plan.interes !== 0 && (
                            <Badge variant={plan.interes > 0 ? "secondary" : "default"} className="ml-2">
                              {plan.interes > 0 ? `+${plan.interes}%` : `${plan.interes}%`}
                            </Badge>
                          )}
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

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Productos Destacados</h2>
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Los productos más populares y mejor valorados por nuestros clientes
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Error al cargar productos destacados</p>
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}

          <AnimatedSection delay={0.3}>
            <div className="text-center mt-12 sm:mt-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ver Todos los Productos
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                ¿Por Qué Elegirnos?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Más de 10 años de experiencia en productos Apple
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 0.1}>
                <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center`}
                  >
                    <benefit.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 0.1}>
                <div className="text-center p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-8 h-8 text-white fill-current" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">¿Listo para tu nuevo Apple?</h2>
              <Gift className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 sm:mb-12 leading-relaxed">
              Únete a miles de clientes satisfechos y descubre la diferencia de comprar con nosotros
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
              >
                Explorar Productos
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 min-w-[200px] bg-transparent"
              >
                Contactar Ahora
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4">Tu iPhone Premium</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Tu tienda de confianza para productos Apple. Calidad garantizada y el mejor servicio al cliente.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/productos?category=iphone" className="hover:text-white transition-colors">
                    iPhone
                  </a>
                </li>
                <li>
                  <a href="/productos?category=ipad" className="hover:text-white transition-colors">
                    iPad
                  </a>
                </li>
                <li>
                  <a href="/productos?category=mac" className="hover:text-white transition-colors">
                    Mac
                  </a>
                </li>
                <li>
                  <a href="/productos?category=watch" className="hover:text-white transition-colors">
                    Apple Watch
                  </a>
                </li>
                <li>
                  <a href="/productos?category=accesorios" className="hover:text-white transition-colors">
                    Accesorios
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/cuotas" className="hover:text-white transition-colors">
                    Financiación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Garantía
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Soporte Técnico
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Envíos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/contacto" className="hover:text-white transition-colors">
                    Contactanos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Email
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ubicación
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tu iPhone Premium. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
