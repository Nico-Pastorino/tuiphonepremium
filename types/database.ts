export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: ProductInsert
        Update: ProductUpdate
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface ProductRow {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  price_usd: number | null
  category: string
  condition: string
  images: string[] | null
  specifications: Json | null
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
  price_usd?: number | null
  category: string
  condition?: string
  images?: string[] | null
  specifications?: Json | null
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
  price_usd?: number | null
  category?: string
  condition?: string
  images?: string[] | null
  specifications?: Json | null
  stock?: number
  featured?: boolean
  created_at?: string
  updated_at?: string | null
}
