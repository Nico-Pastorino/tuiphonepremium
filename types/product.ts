export interface CatalogBestInstallment {
  source: "promotion" | "plan"
  label: string
  groupLabel: string
  paymentLabel: string
  months: number
  interestRate: number
  monthlyAmount: number
  promotionId?: string
  termId?: string
  planId?: string
  category?: "visa-mastercard" | "naranja"
}

export interface CatalogProductPricing {
  display_price: number
  display_currency: "ARS"
  best_installment: CatalogBestInstallment | null
  pricing_updated_at: string
}

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
  isOutlet?: boolean
  outletNotes?: string | null
  outletDefects?: string[]
  outletBatteryPercent?: number | null
  outletGrade?: string | null
  outletWarrantyDays?: number | null
  outletAccessories?: string | null
  outletDisplayIssues?: boolean | null
  outletCaseIssues?: boolean | null
}

export interface ProductSummary
  extends Pick<
    Product,
    | "id"
    | "name"
    | "category"
    | "condition"
    | "price"
    | "originalPrice"
    | "priceUSD"
    | "images"
    | "stock"
    | "featured"
    | "createdAt"
    | "isOutlet"
    | "outletNotes"
    | "outletDefects"
    | "outletBatteryPercent"
    | "outletGrade"
    | "outletWarrantyDays"
    | "outletAccessories"
    | "outletDisplayIssues"
    | "outletCaseIssues"
  > {
  pricing?: CatalogProductPricing | null
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
  isOutlet?: boolean
  outletNotes?: string | null
  outletDefects?: string[]
  outletBatteryPercent?: number | null
  outletGrade?: string | null
  outletWarrantyDays?: number | null
  outletAccessories?: string | null
  outletDisplayIssues?: boolean | null
  outletCaseIssues?: boolean | null
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

export interface CatalogProductsResponse {
  items: ProductSummary[]
  total: number
  supabaseConnected: boolean
  timestamp: number
}
