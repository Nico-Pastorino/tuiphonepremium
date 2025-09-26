export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: ProductInsert
        Update: ProductUpdate
        Relationships: []
      }
      site_config: {
        Row: SiteConfigRow
        Insert: SiteConfigInsert
        Update: SiteConfigUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ProductRow = {
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

export type ProductInsert = {
  id?: string
  name: string
  description?: string | null
  price: number
  original_price?: number | null
  price_usd?: number | null
  category: string
  condition: string
  images?: string[] | null
  specifications?: Json | null
  stock?: number
  featured?: boolean
  created_at?: string
  updated_at?: string | null
}

export type ProductUpdate = {
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
export type SiteConfigRow = {
  key: string
  value: Json | null
  updated_at: string | null
}

export type SiteConfigInsert = {
  key: string
  value?: Json | null
  updated_at?: string | null
}

export type SiteConfigUpdate = {
  key?: string
  value?: Json | null
  updated_at?: string | null
}
