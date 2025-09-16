export interface Product {
  id: string
  name: string
  description: string
  category: string
  condition: string
  price: number
  createdAt: string
  images: string[]
  specifications: Record<string, string>
  stock: number
  featured: boolean
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  originalPrice?: number
  priceUSD?: number // Add USD price field
  category: string
  condition: "nuevo" | "seminuevo" | "usado"
  images: string[]
  specifications: Record<string, string>
  stock: number
  featured: boolean
}

export interface ProductFilters {
  category?: string
  condition?: string
  priceRange?: [number, number]
  search?: string
  featured?: boolean
}

export type ProductInsert = Omit<Product, "id" | "createdAt" | "updatedAt">
export type ProductUpdate = Partial<ProductInsert>
