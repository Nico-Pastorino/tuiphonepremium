import type { DollarConfig, InstallmentPlan, InstallmentPromotion } from "@/types/finance"
import type { CatalogProductPricing, Product } from "@/types/product"

type ProductPricingInput = {
  price: number
  priceUSD?: number | null
  effectiveDollarRate?: number | null
}

export type PromotionBreakdownItem = {
  promotionId: string
  termId: string
  name: string
  groupLabel: string
  paymentLabel: string
  months: number
  interestRate: number
  monthlyAmount: number
}

export type InstallmentOption = {
  id: string
  groupLabel: string
  paymentLabel: string
  months: number
  interestRate: number
  monthlyAmount: number
  category: InstallmentPlan["category"]
}

export type BestInstallmentOption = {
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
  category?: InstallmentPlan["category"]
}

export type ProductPricingResponse = {
  base_price: number
  display_price: number
  display_currency: "ARS"
  best_installment: BestInstallmentOption | null
  installment_options: InstallmentOption[]
  promotions: PromotionBreakdownItem[]
  pricing_updated_at: string
}

export function toCatalogProductPricing(pricing: ProductPricingResponse): CatalogProductPricing {
  return {
    display_price: pricing.display_price,
    display_currency: pricing.display_currency,
    best_installment: pricing.best_installment,
    pricing_updated_at: pricing.pricing_updated_at,
  }
}

export function getEffectiveDollarRateFromConfig(config: Pick<DollarConfig, "blueRate" | "markup">): number {
  return Number((config.blueRate + config.markup).toFixed(2))
}

const PLAN_GROUP_LABELS: Record<InstallmentPlan["category"], string> = {
  "visa-mastercard": "Visa / MasterCard",
  naranja: "Otros medios",
}

const formatPaymentLabel = (months: number) => {
  if (months <= 1) {
    return "1 pago"
  }
  return `${months} pagos`
}

const getPlanGroupLabel = (category: InstallmentPlan["category"]) => PLAN_GROUP_LABELS[category]

const getPromotionGroupLabel = (name: string) => {
  const trimmed = name.trim()
  if (trimmed.length === 0) {
    return "Promocion especial"
  }
  if (/amex/i.test(trimmed)) {
    return "Amex"
  }
  if (/naranja/i.test(trimmed)) {
    return "Otros medios"
  }
  if (/visa|master/i.test(trimmed)) {
    return trimmed.replace(/\s+/g, " ").trim()
  }
  return trimmed
}

export function roundPricingAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round(value)
}

function calculateRawDisplayPrice({ price, priceUSD, effectiveDollarRate }: ProductPricingInput): number {
  if (priceUSD !== undefined && priceUSD !== null && effectiveDollarRate) {
    return priceUSD * effectiveDollarRate
  }
  return price
}

export function calculateDisplayPrice(input: ProductPricingInput): number {
  return roundPricingAmount(calculateRawDisplayPrice(input))
}

const parseDateSafe = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isPromotionActiveNow(promotion: InstallmentPromotion, referenceDate = new Date()): boolean {
  if (!promotion.isActive) {
    return false
  }

  const start = parseDateSafe(promotion.startDate)
  if (start && referenceDate < start) {
    return false
  }

  const end = parseDateSafe(promotion.endDate)
  if (end && referenceDate > end) {
    return false
  }

  return true
}

export function getActivePromotions(
  promotions: InstallmentPromotion[],
  referenceDate = new Date(),
): InstallmentPromotion[] {
  return promotions
    .filter((promotion) => promotion.terms.length > 0 && isPromotionActiveNow(promotion, referenceDate))
    .map((promotion) => ({
      ...promotion,
      terms: [...promotion.terms].sort((a, b) => a.months - b.months),
    }))
}

export function buildPromotionBreakdown(
  priceInPesos: number,
  promotions: InstallmentPromotion[],
): PromotionBreakdownItem[] {
  if (!Number.isFinite(priceInPesos) || priceInPesos <= 0) {
    return []
  }

  const activePromotions = getActivePromotions(promotions)
  const entries: PromotionBreakdownItem[] = []

  for (const promotion of activePromotions) {
    for (const term of promotion.terms) {
      const totalAmount = priceInPesos * (1 + term.interestRate / 100)
      const monthlyAmount = term.months > 0 ? totalAmount / term.months : totalAmount
      entries.push({
        promotionId: promotion.id,
        termId: term.id,
        name: promotion.name,
        groupLabel: getPromotionGroupLabel(promotion.name),
        paymentLabel: formatPaymentLabel(term.months),
        months: term.months,
        interestRate: term.interestRate,
        monthlyAmount,
      })
    }
  }

  return entries.sort((a, b) => a.monthlyAmount - b.monthlyAmount)
}

export function buildInstallmentOptions(priceInPesos: number, plans: InstallmentPlan[]): InstallmentOption[] {
  if (!Number.isFinite(priceInPesos) || priceInPesos <= 0) {
    return []
  }

  return plans
    .filter((plan) => plan.isActive)
    .map((plan) => {
      const totalAmount = priceInPesos * (1 + plan.interestRate / 100)
      const monthlyAmount = plan.months > 0 ? totalAmount / plan.months : totalAmount
      return {
        id: plan.id,
        groupLabel: getPlanGroupLabel(plan.category),
        paymentLabel: formatPaymentLabel(plan.months),
        months: plan.months,
        interestRate: plan.interestRate,
        monthlyAmount,
        category: plan.category,
      }
    })
    .sort((a, b) => a.months - b.months)
}

export function getBestInstallment(
  priceInPesos: number,
  plans: InstallmentPlan[],
  promotions: InstallmentPromotion[],
): BestInstallmentOption | null {
  const promotionOptions = buildPromotionBreakdown(priceInPesos, promotions)
  if (promotionOptions.length > 0) {
    const bestPromotion = promotionOptions[0]
    return {
      source: "promotion",
      label: bestPromotion.name,
      groupLabel: bestPromotion.groupLabel,
      paymentLabel: bestPromotion.paymentLabel,
      months: bestPromotion.months,
      interestRate: bestPromotion.interestRate,
      monthlyAmount: bestPromotion.monthlyAmount,
      promotionId: bestPromotion.promotionId,
      termId: bestPromotion.termId,
    }
  }

  const installmentOptions = buildInstallmentOptions(priceInPesos, plans).sort((a, b) => a.monthlyAmount - b.monthlyAmount)
  if (installmentOptions.length === 0) {
    return null
  }

  const bestPlan = installmentOptions[0]
  return {
    source: "plan",
    label: bestPlan.category === "naranja" ? "Tarjeta Naranja" : "Visa / Mastercard",
    groupLabel: bestPlan.groupLabel,
    paymentLabel: bestPlan.paymentLabel,
    months: bestPlan.months,
    interestRate: bestPlan.interestRate,
    monthlyAmount: bestPlan.monthlyAmount,
    planId: bestPlan.id,
    category: bestPlan.category,
  }
}

const latestIsoDate = (values: Array<string | null | undefined>): string => {
  const timestamps = values
    .map((value) => {
      if (!value) {
        return null
      }
      const parsed = new Date(value).getTime()
      return Number.isFinite(parsed) ? parsed : null
    })
    .filter((value): value is number => value !== null)

  if (timestamps.length === 0) {
    return new Date().toISOString()
  }

  return new Date(Math.max(...timestamps)).toISOString()
}

export function buildProductPricingResponse(params: {
  product: Pick<Product, "price" | "priceUSD" | "createdAt" | "updatedAt">
  dollarConfig: Pick<DollarConfig, "blueRate" | "markup" | "lastUpdated">
  installmentPlans: InstallmentPlan[]
  installmentPromotions: InstallmentPromotion[]
  installmentConfigUpdatedAt?: string | null
}): ProductPricingResponse {
  const effectiveDollarRate = getEffectiveDollarRateFromConfig(params.dollarConfig)
  const displayPrice = calculateDisplayPrice({
    price: params.product.price,
    priceUSD: params.product.priceUSD,
    effectiveDollarRate,
  })
  const installmentOptions = buildInstallmentOptions(displayPrice, params.installmentPlans)
  const promotions = buildPromotionBreakdown(displayPrice, params.installmentPromotions)
  const bestInstallment = getBestInstallment(displayPrice, params.installmentPlans, params.installmentPromotions)

  return {
    base_price: params.product.price,
    display_price: displayPrice,
    display_currency: "ARS",
    best_installment: bestInstallment,
    installment_options: installmentOptions,
    promotions,
    pricing_updated_at: latestIsoDate([
      params.product.updatedAt,
      params.product.createdAt,
      params.dollarConfig.lastUpdated,
      params.installmentConfigUpdatedAt,
    ]),
  }
}
