export interface Product {
  id: string
  name: string
  category: "iphone" | "ipad" | "mac" | "watch" | "airpods" | "accessories"
  condition: "nuevo" | "seminuevo"
  price: number
  priceUSD: number
  images: string[]
  description: string
  specifications: Record<string, string>
  stock: number
  featured: boolean
  createdAt: string
}

export interface InstallmentPlan {
  id: string
  name: string
  installments: number
  interestRate: number
  enabled: boolean
}

export interface DollarRate {
  blue: number
  official: number
  lastUpdate: string
}
