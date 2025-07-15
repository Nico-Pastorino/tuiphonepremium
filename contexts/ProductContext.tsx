"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types/product"

interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getProductsByCondition: (condition: string) => Product[]
  getFeaturedProducts: () => Product[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Datos iniciales mejorados
const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    category: "iphone",
    condition: "nuevo",
    price: 1500000,
    priceUSD: 1200,
    images: ["/placeholder.svg?height=400&width=400"],
    description:
      "El iPhone más avanzado con chip A17 Pro, sistema de cámaras Pro de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.",
    specifications: {
      Pantalla: '6.7" Super Retina XDR',
      Chip: "A17 Pro",
      Cámara: "48MP Principal",
      Almacenamiento: "256GB",
      Batería: "Hasta 29 horas de video",
      Resistencia: "IP68",
    },
    stock: 5,
    featured: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "iPhone 14 Pro 128GB",
    category: "iphone",
    condition: "seminuevo",
    price: 950000,
    priceUSD: 760,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "iPhone 14 Pro en excelente estado, con Dynamic Island y sistema de cámaras Pro avanzado.",
    specifications: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A16 Bionic",
      Cámara: "48MP Principal",
      Almacenamiento: "128GB",
      Batería: "Hasta 23 horas de video",
      Resistencia: "IP68",
    },
    stock: 3,
    featured: true,
    createdAt: "2024-01-02",
  },
  {
    id: "3",
    name: 'MacBook Air M2 13"',
    category: "mac",
    condition: "nuevo",
    price: 1200000,
    priceUSD: 960,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "MacBook Air con chip M2, diseño ultradelgado y hasta 18 horas de batería.",
    specifications: {
      Pantalla: '13.6" Liquid Retina',
      Chip: "Apple M2",
      Memoria: "8GB RAM",
      Almacenamiento: "256GB SSD",
      Batería: "Hasta 18 horas",
      Peso: "1.24 kg",
    },
    stock: 8,
    featured: true,
    createdAt: "2024-01-03",
  },
  {
    id: "4",
    name: 'iPad Pro 11" M2',
    category: "ipad",
    condition: "nuevo",
    price: 800000,
    priceUSD: 640,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "iPad Pro con chip M2, pantalla Liquid Retina y compatibilidad con Apple Pencil.",
    specifications: {
      Pantalla: '11" Liquid Retina',
      Chip: "Apple M2",
      Cámara: "12MP Principal",
      Almacenamiento: "128GB",
      Batería: "Hasta 10 horas",
      Compatibilidad: "Apple Pencil 2",
    },
    stock: 6,
    featured: false,
    createdAt: "2024-01-04",
  },
  {
    id: "5",
    name: "Apple Watch Series 9 45mm",
    category: "watch",
    condition: "nuevo",
    price: 450000,
    priceUSD: 360,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "Apple Watch Series 9 con chip S9, pantalla Always-On más brillante y nuevas funciones de salud.",
    specifications: {
      Pantalla: "45mm Always-On Retina",
      Chip: "S9 SiP",
      Sensores: "ECG, Oxígeno en sangre",
      Resistencia: "WR50",
      Batería: "Hasta 18 horas",
      Conectividad: "GPS + Cellular",
    },
    stock: 12,
    featured: false,
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    name: "AirPods Pro 2da Gen",
    category: "airpods",
    condition: "nuevo",
    price: 280000,
    priceUSD: 224,
    images: ["/placeholder.svg?height=400&width=400"],
    description:
      "AirPods Pro de 2da generación con cancelación activa de ruido mejorada y audio espacial personalizado.",
    specifications: {
      Chip: "H2",
      "Cancelación de ruido": "Activa",
      "Audio espacial": "Personalizado",
      Batería: "Hasta 6 horas",
      "Batería total": "Hasta 30 horas",
      Resistencia: "IPX4",
    },
    stock: 15,
    featured: true,
    createdAt: "2024-01-06",
  },
]

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Cargar productos del localStorage o usar datos iniciales
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      setProducts(initialProducts)
    }
  }, [])

  useEffect(() => {
    // Guardar productos en localStorage cuando cambien
    if (products.length > 0) {
      localStorage.setItem("products", JSON.stringify(products))
    }
  }, [products])

  const addProduct = (productData: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...productData } : product)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const getProduct = (id: string) => {
    return products.find((product) => product.id === id)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category)
  }

  const getProductsByCondition = (condition: string) => {
    return products.filter((product) => product.condition === condition)
  }

  const getFeaturedProducts = () => {
    return products.filter((product) => product.featured)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        getProductsByCategory,
        getProductsByCondition,
        getFeaturedProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
