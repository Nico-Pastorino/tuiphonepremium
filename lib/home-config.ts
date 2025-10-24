import type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"

export const HOME_SECTIONS_ORDER: HomeSectionId[] = ["categories", "featured", "benefits", "trade-in", "cta"]

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  whatsappNumber: "5491112345678",
  tradeInTitle: "Plan canje",
  tradeInSubtitle: "Tomamos tu Apple usado y te ayudamos a renovar tu equipo.",
  sections: [
    { id: "categories", label: "Explorar por categoria", enabled: true },
    { id: "featured", label: "Productos destacados", enabled: true },
    { id: "benefits", label: "Beneficios", enabled: true },
    { id: "trade-in", label: "Plan canje", enabled: true },
    { id: "cta", label: "Llamado a la accion", enabled: true },
  ],
}

const trimOrFallback = (value: string | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value.trim() : fallback

export function mergeHomeSections(
  baseSections: HomeSectionConfig[],
  updates?: HomeSectionConfig[] | null,
): HomeSectionConfig[] {
  if (!updates || updates.length === 0) {
    return baseSections.map((section) => ({ ...section }))
  }

  const baseMap = new Map<HomeSectionId, HomeSectionConfig>(
    baseSections.map((section) => [section.id, { ...section }]),
  )

  const seen = new Set<HomeSectionId>()
  const mergedSections: HomeSectionConfig[] = []

  updates.forEach((update) => {
    const base = baseMap.get(update.id)
    const merged = base ? { ...base, ...update } : { ...update }
    mergedSections.push(merged)
    seen.add(update.id)
  })

  baseSections.forEach((section) => {
    if (!seen.has(section.id)) {
      mergedSections.push({ ...section })
      seen.add(section.id)
    }
  })

  return mergedSections
}

export function mergeHomeConfig(base: HomeConfig, partial?: Partial<HomeConfig> | null): HomeConfig {
  if (!partial) {
    return {
      ...base,
      sections: base.sections.map((section) => ({ ...section })),
    }
  }

  return {
    whatsappNumber: trimOrFallback(partial.whatsappNumber, base.whatsappNumber),
    tradeInTitle: trimOrFallback(partial.tradeInTitle, base.tradeInTitle),
    tradeInSubtitle: trimOrFallback(partial.tradeInSubtitle, base.tradeInSubtitle),
    sections: mergeHomeSections(base.sections, partial.sections),
  }
}

export function cloneHomeConfig(config: HomeConfig): HomeConfig {
  return {
    ...config,
    sections: config.sections.map((section) => ({ ...section })),
  }
}
