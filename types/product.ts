export interface Product {
  id: string
  name: string
  description: string
  category: string
  condition: "nuevo" | "seminuevo"
  price: number
  originalPrice?: number | null
  priceUSD?: number | null
  createdAt: string
  updatedAt?: string | null
  images: string[]
  specifications: Record<string, string | number | boolean>
  stock: number
  featured: boolean
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  originalPrice?: number | null
  priceUSD?: number | null
  category: string
  condition: "nuevo" | "seminuevo"
  images: string[]
  specifications: Record<string, string | number | boolean>
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


