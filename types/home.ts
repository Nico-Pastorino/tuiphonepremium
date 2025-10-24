export type HomeSectionId = "categories" | "featured" | "benefits" | "trade-in" | "cta"

export interface HomeSectionConfig {
  id: HomeSectionId
  label: string
  enabled: boolean
}

export interface HomeConfig {
  whatsappNumber: string
  tradeInTitle: string
  tradeInSubtitle: string
  sections: HomeSectionConfig[]
}
