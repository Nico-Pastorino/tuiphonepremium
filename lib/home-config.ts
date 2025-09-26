import type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"

export const HOME_SECTIONS_ORDER: HomeSectionId[] = ["categories", "featured", "benefits", "cta"]

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  heroImage: "/hero-iphone-lineup.jpg",
  heroHeadline: "Los mejores productos Apple de Argentina",
  heroSubheadline: "Descubrí nuestra selección premium de iPhone, iPad, Mac y accesorios con garantía oficial.",
  promoMessage: "Productos nuevos y seminuevos con garantía y entrega inmediata.",
  whatsappNumber: "5491112345678",
  sections: [
    { id: "categories", label: "Explorar por categoría", enabled: true },
    { id: "featured", label: "Productos destacados", enabled: true },
    { id: "benefits", label: "Beneficios", enabled: true },
    { id: "cta", label: "Llamado a la acción", enabled: true },
  ],
}

const trimOrFallback = (value: string | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value.trim() : fallback

export function mergeHomeSections(
  baseSections: HomeSectionConfig[],
  updates?: HomeSectionConfig[] | null,
): HomeSectionConfig[] {
  if (!updates || updates.length === 0) {
    return [...baseSections]
  }

  const sectionMap = new Map<HomeSectionId, HomeSectionConfig>()
  baseSections.forEach((section) => {
    sectionMap.set(section.id, { ...section })
  })

  updates.forEach((update) => {
    const current = sectionMap.get(update.id)
    if (current) {
      sectionMap.set(update.id, { ...current, ...update })
    } else {
      sectionMap.set(update.id, { ...update })
    }
  })

  const ordered = HOME_SECTIONS_ORDER.map((id) => sectionMap.get(id)).filter(Boolean) as HomeSectionConfig[]

  const extraSections = Array.from(sectionMap.values()).filter(
    (section) => !HOME_SECTIONS_ORDER.includes(section.id),
  )

  return [...ordered, ...extraSections]
}

export function mergeHomeConfig(base: HomeConfig, partial?: Partial<HomeConfig> | null): HomeConfig {
  if (!partial) {
    return {
      ...base,
      sections: base.sections.map((section) => ({ ...section })),
    }
  }

  return {
    heroImage: trimOrFallback(partial.heroImage, base.heroImage),
    heroHeadline: trimOrFallback(partial.heroHeadline, base.heroHeadline),
    heroSubheadline: trimOrFallback(partial.heroSubheadline, base.heroSubheadline),
    promoMessage: trimOrFallback(partial.promoMessage, base.promoMessage),
    whatsappNumber: trimOrFallback(partial.whatsappNumber, base.whatsappNumber),
    sections: mergeHomeSections(base.sections, partial.sections),
  }
}

export function cloneHomeConfig(config: HomeConfig): HomeConfig {
  return {
    ...config,
    sections: config.sections.map((section) => ({ ...section })),
  }
}
