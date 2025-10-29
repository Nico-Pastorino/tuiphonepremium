import type {
  DollarConfig,
  InstallmentConfig,
  InstallmentPlan,
  InstallmentPromotion,
  InstallmentPromotionTerm,
} from "@/types/finance"

const nowIso = () => new Date().toISOString()

const createPlan = (
  id: string,
  months: number,
  interestRate: number,
  category: InstallmentPlan["category"],
  createdAt = nowIso(),
): InstallmentPlan => ({
  id,
  months,
  interestRate,
  isActive: true,
  createdAt,
  category,
})

const VISA_MASTER_DEFAULTS: InstallmentPlan[] = [
  createPlan("visa-1", 3, 0, "visa-mastercard"),
  createPlan("visa-2", 6, 12, "visa-mastercard"),
  createPlan("visa-3", 12, 25, "visa-mastercard"),
]

const NARANJA_DEFAULTS: InstallmentPlan[] = [
  createPlan("naranja-1", 3, 5, "naranja"),
  createPlan("naranja-2", 6, 18, "naranja"),
  createPlan("naranja-3", 9, 28, "naranja"),
  createPlan("naranja-4", 12, 35, "naranja"),
]

export const DEFAULT_INSTALLMENT_PLANS: InstallmentPlan[] = [...VISA_MASTER_DEFAULTS, ...NARANJA_DEFAULTS]

export const DEFAULT_INSTALLMENT_PROMOTIONS: InstallmentPromotion[] = []

export const DEFAULT_INSTALLMENT_CONFIG: InstallmentConfig = {
  plans: cloneInstallmentPlans(DEFAULT_INSTALLMENT_PLANS),
  promotions: cloneInstallmentPromotions(DEFAULT_INSTALLMENT_PROMOTIONS),
  updatedAt: nowIso(),
}

export const DEFAULT_DOLLAR_CONFIG: DollarConfig = {
  id: "default",
  officialRate: 350,
  blueRate: 1000,
  markup: 5,
  lastUpdated: nowIso(),
  autoUpdate: true,
}

const clonePromotionTerms = (terms: InstallmentPromotionTerm[]): InstallmentPromotionTerm[] =>
  terms.map((term) => ({ ...term }))

export function cloneInstallmentPlans(plans: InstallmentPlan[]): InstallmentPlan[] {
  return plans.map((plan) => ({ ...plan }))
}

export function cloneInstallmentPromotions(promotions: InstallmentPromotion[]): InstallmentPromotion[] {
  return promotions.map((promotion) => ({
    ...promotion,
    terms: clonePromotionTerms(promotion.terms ?? []),
  }))
}

export function sanitizeInstallmentPlan(raw: unknown, fallbackIndex = 0): InstallmentPlan | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const months = Number((raw as Record<string, unknown>).months)
  if (!Number.isFinite(months) || months <= 0) {
    return null
  }

  const interestRate = Number((raw as Record<string, unknown>).interestRate ?? 0)
  const category =
    (raw as Record<string, unknown>).category === "naranja" ? "naranja" : ("visa-mastercard" as InstallmentPlan["category"])
  const hasValidId = typeof (raw as Record<string, unknown>).id === "string" && (raw as Record<string, unknown>).id !== ""
  const id = hasValidId ? String((raw as Record<string, unknown>).id) : `${category}-${months}-${fallbackIndex}`
  const isActive =
    (raw as Record<string, unknown>).isActive !== undefined
      ? Boolean((raw as Record<string, unknown>).isActive)
      : true
  const createdAt =
    typeof (raw as Record<string, unknown>).createdAt === "string" && (raw as Record<string, unknown>).createdAt !== ""
      ? String((raw as Record<string, unknown>).createdAt)
      : nowIso()

  return {
    id,
    months,
    interestRate: Number.isFinite(interestRate) ? interestRate : 0,
    isActive,
    createdAt,
    category,
  }
}

export function sanitizeInstallmentPlanCollection(raw: unknown): InstallmentPlan[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item, index) => sanitizeInstallmentPlan(item, index))
    .filter((plan): plan is InstallmentPlan => plan !== null)
}

export function sanitizeInstallmentPromotion(raw: unknown, fallbackIndex = 0): InstallmentPromotion | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const name =
    typeof (raw as Record<string, unknown>).name === "string" && (raw as Record<string, unknown>).name.trim().length > 0
      ? (raw as Record<string, unknown>).name.trim()
      : null
  if (!name) {
    return null
  }

  const hasValidId = typeof (raw as Record<string, unknown>).id === "string" && (raw as Record<string, unknown>).id !== ""
  const id = hasValidId ? String((raw as Record<string, unknown>).id) : `promotion-${fallbackIndex}`
  const startDate =
    typeof (raw as Record<string, unknown>).startDate === "string" && (raw as Record<string, unknown>).startDate !== ""
      ? String((raw as Record<string, unknown>).startDate)
      : null
  const endDate =
    typeof (raw as Record<string, unknown>).endDate === "string" && (raw as Record<string, unknown>).endDate !== ""
      ? String((raw as Record<string, unknown>).endDate)
      : null
  const isActive =
    (raw as Record<string, unknown>).isActive !== undefined
      ? Boolean((raw as Record<string, unknown>).isActive)
      : true
  const createdAt =
    typeof (raw as Record<string, unknown>).createdAt === "string" && (raw as Record<string, unknown>).createdAt !== ""
      ? String((raw as Record<string, unknown>).createdAt)
      : nowIso()

  const sanitizePromotionTerm = (value: unknown, index: number): InstallmentPromotionTerm | null => {
    if (!value || typeof value !== "object") {
      return null
    }

    const monthsValue = Number((value as Record<string, unknown>).months)
    if (!Number.isFinite(monthsValue) || monthsValue <= 0) {
      return null
    }

    const interestRateValue = Number((value as Record<string, unknown>).interestRate ?? 0)
    const hasTermId =
      typeof (value as Record<string, unknown>).id === "string" && (value as Record<string, unknown>).id !== ""
    const termId = hasTermId ? String((value as Record<string, unknown>).id) : `${id}-term-${index}`

    return {
      id: termId,
      months: monthsValue,
      interestRate: Number.isFinite(interestRateValue) ? interestRateValue : 0,
    }
  }

  let terms: InstallmentPromotionTerm[] = []
  const rawTerms = (raw as Record<string, unknown>).terms
  if (Array.isArray(rawTerms)) {
    terms = rawTerms
      .map((term, index) => sanitizePromotionTerm(term, index))
      .filter((term): term is InstallmentPromotionTerm => term !== null)
  } else {
    const fallbackTerm = sanitizePromotionTerm(raw, 0)
    terms = fallbackTerm ? [fallbackTerm] : []
  }

  return {
    id,
    name,
    terms,
    startDate,
    endDate,
    isActive,
    createdAt,
  }
}

export function sanitizeInstallmentPromotionCollection(raw: unknown): InstallmentPromotion[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item, index) => sanitizeInstallmentPromotion(item, index))
    .filter((promotion): promotion is InstallmentPromotion => promotion !== null)
}

export function mergeInstallmentConfig(
  base: InstallmentConfig,
  partial?: Partial<InstallmentConfig> | null,
): InstallmentConfig {
  const basePromotions = Array.isArray(base.promotions) ? base.promotions : DEFAULT_INSTALLMENT_PROMOTIONS

  if (!partial) {
    return {
      plans: cloneInstallmentPlans(base.plans),
      promotions: cloneInstallmentPromotions(basePromotions),
      updatedAt: base.updatedAt,
    }
  }

  const sanitizedPlans = partial.plans ? sanitizeInstallmentPlanCollection(partial.plans) : []
  const plans =
    sanitizedPlans.length > 0 ? sanitizedPlans : cloneInstallmentPlans(base.plans.length > 0 ? base.plans : DEFAULT_INSTALLMENT_PLANS)
  const sanitizedPromotions =
    partial.promotions !== undefined ? sanitizeInstallmentPromotionCollection(partial.promotions) : null
  const promotions =
    sanitizedPromotions !== null
      ? sanitizedPromotions
      : cloneInstallmentPromotions(basePromotions.length > 0 ? basePromotions : DEFAULT_INSTALLMENT_PROMOTIONS)

  const updatedAt =
    typeof partial.updatedAt === "string" && partial.updatedAt.trim().length > 0 ? partial.updatedAt : base.updatedAt || nowIso()

  return {
    plans,
    promotions,
    updatedAt,
  }
}

export function mergeDollarConfig(base: DollarConfig, partial?: Partial<DollarConfig> | null): DollarConfig {
  if (!partial) {
    return { ...base }
  }

  const next: DollarConfig = {
    id: typeof partial.id === "string" && partial.id.trim().length > 0 ? partial.id : base.id,
    officialRate:
      partial.officialRate !== undefined && Number.isFinite(Number(partial.officialRate))
        ? Number(partial.officialRate)
        : base.officialRate,
    blueRate:
      partial.blueRate !== undefined && Number.isFinite(Number(partial.blueRate))
        ? Number(partial.blueRate)
        : base.blueRate,
    markup:
      partial.markup !== undefined && Number.isFinite(Number(partial.markup)) ? Number(partial.markup) : base.markup,
    autoUpdate: partial.autoUpdate !== undefined ? Boolean(partial.autoUpdate) : base.autoUpdate,
    lastUpdated:
      typeof partial.lastUpdated === "string" && partial.lastUpdated.trim().length > 0 ? partial.lastUpdated : base.lastUpdated,
  }

  if (!next.lastUpdated) {
    next.lastUpdated = nowIso()
  }

  return next
}
