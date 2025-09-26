export type HomeSectionId = "categories" | "featured" | "benefits" | "cta"

export interface HomeSectionConfig {
  id: HomeSectionId
  label: string
  enabled: boolean
}

export interface HomeConfig {
  heroImage: string
  heroHeadline: string
  heroSubheadline: string
  promoMessage: string
  whatsappNumber: string
  sections: HomeSectionConfig[]
}
