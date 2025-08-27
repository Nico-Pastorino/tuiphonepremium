export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  priceUSD?: number
  category: string
  condition: "nuevo" | "seminuevo" | "usado"
  images: string[]
  specifications: Record<string, string>
  stock: number
  featured: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  originalPrice?: number
  priceUSD?: number
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
