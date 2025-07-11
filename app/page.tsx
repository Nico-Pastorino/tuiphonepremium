"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { ProductCard } from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Tablet, Laptop, Watch, Headphones, Truck, Shield, CreditCard } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/types/product"

// Datos de ejemplo - en producción vendrían de una base de datos
const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    category: "iphone",
    condition: "nuevo",
    price: 1500000,
    priceUSD: 1200,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR.",
    specifications: {
      Pantalla: '6.7" Super Retina XDR',
      Chip: "A17 Pro",
      Cámara: "48MP Principal",
      Almacenamiento: "256GB",
    },
    stock: 5,
    featured: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "iPhone 14 Pro",
    category: "iphone",
    condition: "seminuevo",
    price: 950000,
    priceUSD: 760,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "iPhone 14 Pro en excelente estado, con Dynamic Island y cámara pro.",
    specifications: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A16 Bionic",
      Cámara: "48MP Principal",
      Almacenamiento: "128GB",
    },
    stock: 3,
    featured: true,
    createdAt: "2024-01-02",
  },
  {
    id: "3",
    name: "iPhone 13",
    category: "iphone",
    condition: "seminuevo",
    price: 650000,
    priceUSD: 520,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "iPhone 13 seminuevo en perfecto estado, ideal para uso diario.",
    specifications: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A15 Bionic",
      Cámara: "12MP Dual",
      Almacenamiento: "128GB",
    },
    stock: 8,
    featured: false,
    createdAt: "2024-01-03",
  },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Simular carga de productos
    setProducts(mockProducts)
  }, [])

  const featuredProducts = products.filter((p) => p.featured)

  return (
    <div className="min-h-screen bg-apple-light">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-apple-primary to-apple-accent text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Los mejores iPhones
            <br />
            <span className="text-apple-light">Nuevos y Seminuevos</span>
          </h1>
          <p className="text-xl mb-8 text-apple-light max-w-2xl mx-auto">
            Descubre nuestra selección premium de productos Apple con garantía, financiación y envío gratis en CABA y
            GBA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-apple-primary hover:bg-apple-light">
              Ver iPhones Nuevos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-apple-primary bg-transparent"
            >
              Ver Seminuevos
            </Button>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Explora nuestros productos</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Smartphone, name: "iPhone", href: "/productos?category=iphone" },
              { icon: Tablet, name: "iPad", href: "/productos?category=ipad" },
              { icon: Laptop, name: "Mac", href: "/productos?category=mac" },
              { icon: Watch, name: "Apple Watch", href: "/productos?category=watch" },
              { icon: Headphones, name: "AirPods", href: "/productos?category=airpods" },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-apple-muted/20 hover:border-apple-primary/30">
                  <CardContent className="p-6 text-center">
                    <category.icon className="w-12 h-12 mx-auto mb-4 text-apple-primary group-hover:text-apple-accent transition-colors" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-apple-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-apple-light">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Productos Destacados</h2>
            <Button
              asChild
              variant="outline"
              className="border-apple-primary text-apple-primary hover:bg-apple-primary hover:text-white bg-transparent"
            >
              <Link href="/productos">Ver todos</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">¿Por qué elegir TuiPhone?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Garantía Extendida",
                description: "Todos nuestros productos incluyen garantía de 12 meses",
              },
              {
                icon: Truck,
                title: "Envío Gratis",
                description: "Envío gratuito en CABA y GBA en compras superiores a $100.000",
              },
              {
                icon: CreditCard,
                title: "Financiación",
                description: "Hasta 12 cuotas sin interés con tarjetas seleccionadas",
              },
            ].map((benefit, index) => (
              <Card key={index} className="text-center border-apple-muted/20">
                <CardContent className="p-8">
                  <benefit.icon className="w-16 h-16 mx-auto mb-6 text-apple-primary" />
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TuiPhone</h3>
              <p className="text-gray-400">Tu tienda premium de productos Apple en Argentina.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/productos?category=iphone" className="hover:text-white">
                    iPhone
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=ipad" className="hover:text-white">
                    iPad
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=mac" className="hover:text-white">
                    Mac
                  </Link>
                </li>
                <li>
                  <Link href="/productos?category=watch" className="hover:text-white">
                    Apple Watch
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/garantia" className="hover:text-white">
                    Garantía
                  </Link>
                </li>
                <li>
                  <Link href="/envios" className="hover:text-white">
                    Envíos
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">
                WhatsApp: +54 9 11 1234-5678
                <br />
                Email: info@tuiphone.com.ar
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TuiPhone. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
