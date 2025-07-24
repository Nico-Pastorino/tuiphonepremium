export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: ProductInsert
        Update: ProductUpdate
      }
    }
  }
}

export interface ProductRow {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  category: string
  condition: string
  images: string[] | null
  specifications: Record<string, any> | null
  stock: number
  featured: boolean
  created_at: string
  updated_at: string | null
}

export interface ProductInsert {
  id?: string
  name: string
  description?: string | null
  price: number
  original_price?: number | null
  category: string
  condition: string
  images?: string[] | null
  specifications?: Record<string, any> | null
  stock?: number
  featured?: boolean
  created_at?: string
  updated_at?: string | null
}

export interface ProductUpdate {
  id?: string
  name?: string
  description?: string | null
  price?: number
  original_price?: number | null
  category?: string
  condition?: string
  images?: string[] | null
  specifications?: Record<string, any> | null
  stock?: number
  featured?: boolean
  created_at?: string
  updated_at?: string | null
}
