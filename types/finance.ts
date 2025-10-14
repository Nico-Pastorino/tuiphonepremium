export type InstallmentPlanCategory = "visa-mastercard" | "naranja"

export interface InstallmentPlan {
  id: string
  months: number
  interestRate: number
  isActive: boolean
  createdAt: string
  category: InstallmentPlanCategory
}

export interface InstallmentConfig {
  plans: InstallmentPlan[]
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
