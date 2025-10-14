import type { DollarConfig, InstallmentConfig, InstallmentPlan } from "@/types/finance"

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

export const DEFAULT_INSTALLMENT_CONFIG: InstallmentConfig = {
  plans: cloneInstallmentPlans(DEFAULT_INSTALLMENT_PLANS),
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

export function cloneInstallmentPlans(plans: InstallmentPlan[]): InstallmentPlan[] {
  return plans.map((plan) => ({ ...plan }))
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

export function mergeInstallmentConfig(
  base: InstallmentConfig,
  partial?: Partial<InstallmentConfig> | null,
): InstallmentConfig {
  if (!partial) {
    return {
      plans: cloneInstallmentPlans(base.plans),
      updatedAt: base.updatedAt,
    }
  }

  const sanitizedPlans = partial.plans ? sanitizeInstallmentPlanCollection(partial.plans) : []
  const plans =
    sanitizedPlans.length > 0 ? sanitizedPlans : cloneInstallmentPlans(base.plans.length > 0 ? base.plans : DEFAULT_INSTALLMENT_PLANS)

  const updatedAt =
    typeof partial.updatedAt === "string" && partial.updatedAt.trim().length > 0 ? partial.updatedAt : base.updatedAt || nowIso()

  return {
    plans,
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
