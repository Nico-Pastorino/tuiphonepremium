export type InstallmentPlanCategory = "visa-mastercard" | "naranja"

export interface InstallmentPlan {
  id: string
  months: number
  interestRate: number
  isActive: boolean
  createdAt: string
  category: InstallmentPlanCategory
}

export interface InstallmentPromotionTerm {
  id: string
  months: number
  interestRate: number
}

export interface InstallmentPromotion {
  id: string
  name: string
  terms: InstallmentPromotionTerm[]
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export interface InstallmentConfig {
  plans: InstallmentPlan[]
  promotions: InstallmentPromotion[]
  updatedAt: string
}

export interface DollarConfig {
  id: string
  officialRate: number
  blueRate: number
  markup: number
  lastUpdated: string
  autoUpdate: boolean
}
