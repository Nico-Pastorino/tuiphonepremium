"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react"

import type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
import { DEFAULT_HOME_CONFIG, mergeHomeConfig } from "@/lib/home-config"
import type { TradeInConfig } from "@/types/trade-in"
import { DEFAULT_TRADE_IN_CONFIG, mergeTradeInConfig } from "@/lib/trade-in-config"
import type {
  DollarConfig,
  InstallmentConfig,
  InstallmentPlan,
  InstallmentPromotion,
  InstallmentPromotionTerm,
} from "@/types/finance"
import {
  DEFAULT_DOLLAR_CONFIG,
  DEFAULT_INSTALLMENT_CONFIG,
  cloneInstallmentPlans,
  cloneInstallmentPromotions,
  mergeDollarConfig,
  mergeInstallmentConfig,
  sanitizeInstallmentPlanCollection,
  sanitizeInstallmentPromotionCollection,
} from "@/lib/finance-config"

import type { ImageLibraryItem } from "@/types/image-library"

export type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
export type { TradeInConfig } from "@/types/trade-in"
export type { InstallmentPlan, InstallmentPromotion, InstallmentPromotionTerm, DollarConfig } from "@/types/finance"

type InstallmentPromotionTermDraft = {
  id?: string
  months: number
  interestRate: number
}

type InstallmentPromotionInput = {
  name: string
  terms: InstallmentPromotionTermDraft[]
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

interface AdminContextType {
  installmentPlans: InstallmentPlan[]
  addInstallmentPlan: (plan: Omit<InstallmentPlan, "id" | "createdAt">) => void
  updateInstallmentPlan: (id: string, plan: Partial<InstallmentPlan>) => void
  deleteInstallmentPlan: (id: string) => void
  getActiveInstallmentPlans: () => InstallmentPlan[]
  getInstallmentPlansByCategory: (category: InstallmentPlan["category"]) => InstallmentPlan[]
  installmentPromotions: InstallmentPromotion[]
  addInstallmentPromotion: (promotion: InstallmentPromotionInput) => void
  updateInstallmentPromotion: (id: string, promotion: Partial<InstallmentPromotionInput>) => void
  deleteInstallmentPromotion: (id: string) => void
  getActiveInstallmentPromotions: () => InstallmentPromotion[]

  imageLibrary: ImageLibraryItem[]
  refreshImageLibrary: () => Promise<void>
  addImageToLibrary: (image: { label: string; category: string; dataUrl: string }) => Promise<ImageLibraryItem>
  updateImageInLibrary: (
    id: string,
    updates: Partial<Omit<ImageLibraryItem, "id" | "createdAt">>,
  ) => Promise<void>
  removeImageFromLibrary: (id: string) => Promise<void>

  dollarConfig: DollarConfig
  updateDollarConfig: (config: Partial<DollarConfig>) => void
  getEffectiveDollarRate: () => number

  homeConfig: HomeConfig
  updateHomeConfig: (config: Partial<HomeConfig>) => Promise<void>
  updateHomeSection: (id: HomeSectionId, updates: Partial<HomeSectionConfig>) => Promise<void>

  tradeInConfig: TradeInConfig
  updateTradeInConfig: (config: TradeInConfig) => Promise<void>

  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const INSTALLMENT_STORAGE_KEY = "admin-installment-plans"
const DOLLAR_STORAGE_KEY = "admin-dollar-config"
const AUTH_STORAGE_KEY = "admin-authenticated"
const HOME_STORAGE_KEY = "admin-home-config"
const TRADE_IN_STORAGE_KEY = "admin-trade-in-config"

type AdminProviderProps = {
  children: ReactNode
  initialHomeConfig?: HomeConfig
  initialTradeInConfig?: TradeInConfig
  initialInstallmentConfig?: InstallmentConfig
  initialDollarConfig?: DollarConfig
}

export function AdminProvider({
  children,
  initialHomeConfig,
  initialTradeInConfig,
  initialInstallmentConfig,
  initialDollarConfig,
}: AdminProviderProps) {
  const resolvedInstallmentConfig = initialInstallmentConfig
    ? mergeInstallmentConfig(DEFAULT_INSTALLMENT_CONFIG, initialInstallmentConfig)
    : DEFAULT_INSTALLMENT_CONFIG
  const resolvedDollarConfig = mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, initialDollarConfig ?? null)
  const resolvedHomeConfig = mergeHomeConfig(DEFAULT_HOME_CONFIG, initialHomeConfig ?? null)
  const resolvedTradeInConfig = mergeTradeInConfig(DEFAULT_TRADE_IN_CONFIG, initialTradeInConfig ?? null)

  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(() =>
    cloneInstallmentPlans(resolvedInstallmentConfig.plans),
  )
  const [installmentPromotions, setInstallmentPromotions] = useState<InstallmentPromotion[]>(() =>
    cloneInstallmentPromotions(resolvedInstallmentConfig.promotions),
  )
  const [dollarConfig, setDollarConfig] = useState<DollarConfig>({ ...resolvedDollarConfig })
  const [imageLibrary, setImageLibrary] = useState<ImageLibraryItem[]>([])
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(resolvedHomeConfig)
  const [tradeInConfig, setTradeInConfig] = useState<TradeInConfig>(resolvedTradeInConfig)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [installmentPlansInitialized, setInstallmentPlansInitialized] = useState(Boolean(initialInstallmentConfig))
  const [dollarConfigInitialized, setDollarConfigInitialized] = useState(Boolean(initialDollarConfig))
  const [homeConfigInitialized, setHomeConfigInitialized] = useState(Boolean(initialHomeConfig))
  const [tradeInConfigInitialized, setTradeInConfigInitialized] = useState(Boolean(initialTradeInConfig))
  const installmentPlansHasLocalUpdates = useRef(false)
  const dollarConfigHasLocalUpdates = useRef(false)
  const homeConfigHasLocalUpdates = useRef(false)
  const tradeInConfigHasLocalUpdates = useRef(false)
  const tradeInConfigLoadedFromStorage = useRef(false)

  const refreshImageLibrary = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/image-library")
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Unable to fetch image library")
      }
      const result = (await response.json()) as { data?: ImageLibraryItem[] }
      if (Array.isArray(result?.data)) {
        setImageLibrary(result.data)
      } else {
        setImageLibrary([])
      }
    } catch (error) {
      console.error("Failed to fetch image library from API", error)
      setImageLibrary([])
    }
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const savedPlans = localStorage.getItem(INSTALLMENT_STORAGE_KEY)
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans) as unknown

        if (Array.isArray(parsed)) {
          // Legacy format stored only the plans array; ignore it so we don't lose server promotions.
          console.warn("Ignoring legacy installment cache without promotions")
          localStorage.removeItem(INSTALLMENT_STORAGE_KEY)
        } else if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as Record<string, unknown>).promotions)
        ) {
          const merged = mergeInstallmentConfig(DEFAULT_INSTALLMENT_CONFIG, parsed as Partial<InstallmentConfig>)
          setInstallmentPlans(cloneInstallmentPlans(merged.plans))
          setInstallmentPromotions(cloneInstallmentPromotions(merged.promotions))
        }
      } catch (error) {
        console.error("Failed to parse saved installment plans", error)
      }
    }

    const savedDollarConfig = localStorage.getItem(DOLLAR_STORAGE_KEY)
    if (savedDollarConfig) {
      try {
        const parsed = JSON.parse(savedDollarConfig) as Partial<DollarConfig>
        setDollarConfig(mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, parsed))
      } catch (error) {
        console.error("Failed to parse saved dollar config", error)
      }
    }

    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }

    const savedHomeConfig = localStorage.getItem(HOME_STORAGE_KEY)
    if (savedHomeConfig) {
      try {
        const parsed = JSON.parse(savedHomeConfig) as Partial<HomeConfig>
        setHomeConfig((prev) => mergeHomeConfig(prev, parsed))
      } catch (error) {
        console.error("Failed to parse saved home config", error)
      }
    }

    const savedTradeInConfig = localStorage.getItem(TRADE_IN_STORAGE_KEY)
    if (savedTradeInConfig) {
      try {
        const parsed = JSON.parse(savedTradeInConfig) as Partial<TradeInConfig>
        setTradeInConfig((prev) => mergeTradeInConfig(prev, parsed))
        tradeInConfigLoadedFromStorage.current = true
      } catch (error) {
        console.error("Failed to parse saved trade-in config", error)
      }
    }

    setInstallmentPlansInitialized(true)
    setDollarConfigInitialized(true)
    setHomeConfigInitialized(true)
    setTradeInConfigInitialized(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) {
      return
    }

    let active = true

    const loadRemoteInstallments = async () => {
      try {
        const response = await fetch("/api/admin/installments")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch installment plans")
        }
        const result = (await response.json()) as { data?: InstallmentConfig }
        if (result?.data && !installmentPlansHasLocalUpdates.current && active) {
          const merged = mergeInstallmentConfig(DEFAULT_INSTALLMENT_CONFIG, result.data)
          setInstallmentPlans(cloneInstallmentPlans(merged.plans))
          setInstallmentPromotions(cloneInstallmentPromotions(merged.promotions))
        }
      } catch (error) {
        if (active) {
          console.error("Failed to fetch installment plans from API", error)
        }
      }
    }

    const loadRemoteDollarConfig = async () => {
      try {
        const response = await fetch("/api/admin/dollar")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch dollar config")
        }
        const result = (await response.json()) as { data?: Partial<DollarConfig> }
        if (result?.data && !dollarConfigHasLocalUpdates.current && active) {
          setDollarConfig(mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, result.data))
        }
      } catch (error) {
        if (active) {
          console.error("Failed to fetch dollar config from API", error)
        }
      }
    }

    const loadRemoteHomeConfig = async () => {
      try {
        const response = await fetch("/api/admin/home-config")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch home config")
        }
        const result = (await response.json()) as { data?: Partial<HomeConfig> }
        if (result?.data && !homeConfigHasLocalUpdates.current && active) {
          setHomeConfig((prev) => mergeHomeConfig(prev, result.data))
        }
      } catch (error) {
        if (active) {
          console.error("Failed to fetch home config from API", error)
        }
      }
    }

    const loadRemoteTradeInConfig = async () => {
      try {
        const response = await fetch("/api/admin/trade-in")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch trade-in config")
        }
        const result = (await response.json()) as { data?: TradeInConfig; fallback?: boolean }
        const shouldApplyRemote =
          result?.data &&
          !tradeInConfigHasLocalUpdates.current &&
          (!result.fallback || !tradeInConfigLoadedFromStorage.current)

        if (shouldApplyRemote && active) {
          setTradeInConfig((prev) => mergeTradeInConfig(prev, result.data))
        }
      } catch (error) {
        if (active) {
          console.error("Failed to fetch trade-in config from API", error)
        }
      }
    }

    const loadRemoteData = async () => {
      await Promise.allSettled([
        loadRemoteInstallments(),
        loadRemoteDollarConfig(),
        loadRemoteHomeConfig(),
        loadRemoteTradeInConfig(),
      ])
    }

    void loadRemoteData()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setImageLibrary([])
      return
    }
    void refreshImageLibrary()
  }, [isAuthenticated, refreshImageLibrary])

  useEffect(() => {
    if (!installmentPlansInitialized) return
    const payload: InstallmentConfig = {
      plans: sanitizeInstallmentPlanCollection(installmentPlans),
      promotions: sanitizeInstallmentPromotionCollection(installmentPromotions),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(INSTALLMENT_STORAGE_KEY, JSON.stringify(payload))
  }, [installmentPlans, installmentPromotions, installmentPlansInitialized])

  useEffect(() => {
    if (!dollarConfigInitialized) return
    localStorage.setItem(DOLLAR_STORAGE_KEY, JSON.stringify(dollarConfig))
  }, [dollarConfig, dollarConfigInitialized])

  useEffect(() => {
    if (!homeConfigInitialized) return
    localStorage.setItem(
      HOME_STORAGE_KEY,
      JSON.stringify({
        ...homeConfig,
        sections: homeConfig.sections.map((section) => ({
          id: section.id,
          label: section.label,
          enabled: section.enabled,
        })),
      }),
    )
  }, [homeConfig, homeConfigInitialized])

  useEffect(() => {
    if (!tradeInConfigInitialized) return
    localStorage.setItem(TRADE_IN_STORAGE_KEY, JSON.stringify(tradeInConfig))
  }, [tradeInConfig, tradeInConfigInitialized])

  const normalizePromotionTerms = (promotionId: string, drafts: InstallmentPromotionTermDraft[]) => {
    const baseTimestamp = Date.now()
    return drafts
      .map((draft, index) => {
        const months = Number(draft.months)
        if (!Number.isFinite(months) || months <= 0) {
          return null
        }
        const interestValue = Number(draft.interestRate ?? 0)
        const termId =
          typeof draft.id === "string" && draft.id.trim().length > 0
            ? draft.id
            : `${promotionId}-term-${baseTimestamp}-${index}`

        return {
          id: termId,
          months,
          interestRate: Number.isFinite(interestValue) ? interestValue : 0,
        }
      })
      .filter((term): term is InstallmentPromotionTerm => term !== null)
  }

  const persistInstallmentConfig = async (
    plans: InstallmentPlan[],
    promotions: InstallmentPromotion[],
  ) => {
    const payload: InstallmentConfig = {
      plans: sanitizeInstallmentPlanCollection(plans),
      promotions: sanitizeInstallmentPromotionCollection(promotions),
      updatedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/admin/installments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "No se pudieron guardar las cuotas")
      }
    } catch (error) {
      console.error("Failed to persist installment config", error)
    }
  }

  const persistDollarConfig = async (config: DollarConfig) => {
    try {
      const payload = mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, config)
      const response = await fetch("/api/admin/dollar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "No se pudo guardar la configuracion del dolar")
      }
    } catch (error) {
      console.error("Failed to persist dollar config", error)
    }
  }

  const addInstallmentPlan = (planData: Omit<InstallmentPlan, "id" | "createdAt">) => {
    setInstallmentPlans((prev) => {
      const newPlan: InstallmentPlan = {
        ...planData,
        id: `${planData.category}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      const nextPlans = sanitizeInstallmentPlanCollection([...prev, newPlan])
      void persistInstallmentConfig(nextPlans, installmentPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPlans
    })
  }

  const updateInstallmentPlan = (id: string, planData: Partial<InstallmentPlan>) => {
    setInstallmentPlans((prev) => {
      const nextPlans = sanitizeInstallmentPlanCollection(
        prev.map((plan) =>
          plan.id === id ? { ...plan, ...planData, id: plan.id, createdAt: plan.createdAt } : plan,
        ),
      )
      void persistInstallmentConfig(nextPlans, installmentPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPlans
    })
  }

  const deleteInstallmentPlan = (id: string) => {
    setInstallmentPlans((prev) => {
      const nextPlans = sanitizeInstallmentPlanCollection(prev.filter((plan) => plan.id !== id))
      void persistInstallmentConfig(nextPlans, installmentPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPlans
    })
  }

  const addInstallmentPromotion = (promotionData: InstallmentPromotionInput) => {
    setInstallmentPromotions((prev) => {
      const promotionId = `${promotionData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      const normalizedTerms = normalizePromotionTerms(promotionId, promotionData.terms)
      const newPromotion: InstallmentPromotion = {
        id: promotionId,
        name: promotionData.name.trim(),
        terms: normalizedTerms,
        startDate: promotionData.startDate,
        endDate: promotionData.endDate,
        isActive: promotionData.isActive,
        createdAt: new Date().toISOString(),
      }
      const nextPromotions = sanitizeInstallmentPromotionCollection([...prev, newPromotion])
      void persistInstallmentConfig(installmentPlans, nextPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPromotions
    })
  }

  const updateInstallmentPromotion = (id: string, updates: Partial<InstallmentPromotionInput>) => {
    setInstallmentPromotions((prev) => {
      const nextPromotions = sanitizeInstallmentPromotionCollection(
        prev.map((promotion) => {
          if (promotion.id !== id) {
            return promotion
          }

          const nextTerms =
            updates.terms !== undefined ? normalizePromotionTerms(id, updates.terms) : promotion.terms

          return {
            ...promotion,
            name: updates.name !== undefined ? updates.name.trim() : promotion.name,
            startDate: updates.startDate !== undefined ? updates.startDate : promotion.startDate,
            endDate: updates.endDate !== undefined ? updates.endDate : promotion.endDate,
            isActive: updates.isActive !== undefined ? updates.isActive : promotion.isActive,
            terms: nextTerms,
          }
        }),
      )
      void persistInstallmentConfig(installmentPlans, nextPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPromotions
    })
  }

  const deleteInstallmentPromotion = (id: string) => {
    setInstallmentPromotions((prev) => {
      const nextPromotions = sanitizeInstallmentPromotionCollection(prev.filter((promotion) => promotion.id !== id))
      void persistInstallmentConfig(installmentPlans, nextPromotions)
      installmentPlansHasLocalUpdates.current = true
      return nextPromotions
    })
  }

  const addImageToLibrary = async (imageData: { label: string; category: string; dataUrl: string }) => {
    const payload = {
      label: imageData.label.trim() || "Imagen",
      category: imageData.category.trim() || "general",
      dataUrl: imageData.dataUrl,
    }

    const response = await fetch("/api/admin/image-library", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || "No se pudo subir la imagen")
    }

    const result = (await response.json()) as { data?: ImageLibraryItem }
    if (!result?.data) {
      throw new Error("La respuesta del servidor no contiene la imagen")
    }

    setImageLibrary((prev) => [...prev, result.data!])
    return result.data
  }

  const updateImageInLibrary = async (
    id: string,
    updates: Partial<Omit<ImageLibraryItem, "id" | "createdAt">>,
  ) => {
    setImageLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
    // TODO: Persist updates via API if needed
  }

  const removeImageFromLibrary = async (id: string) => {
    const response = await fetch("/api/admin/image-library", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || "No se pudo eliminar la imagen")
    }

    const result = (await response.json()) as { data?: ImageLibraryItem[] }
    if (Array.isArray(result?.data)) {
      setImageLibrary(result.data)
    } else {
      setImageLibrary((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const parseDateSafe = (value: string | null | undefined) => {
    if (!value) {
      return null
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const isPromotionActiveNow = (promotion: InstallmentPromotion, referenceDate = new Date()) => {
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

  const getActiveInstallmentPromotions = () => {
    const now = new Date()
    return installmentPromotions
      .filter((promotion) => promotion.terms.length > 0 && isPromotionActiveNow(promotion, now))
      .map((promotion) => ({
        ...promotion,
        terms: [...promotion.terms].sort((a, b) => a.months - b.months),
      }))
  }

  const getActiveInstallmentPlans = () => installmentPlans.filter((plan) => plan.isActive)

  const getInstallmentPlansByCategory = (category: InstallmentPlan["category"]) =>
    installmentPlans.filter((plan) => plan.category === category)

  const updateDollarConfig = (configData: Partial<DollarConfig>) => {
    setDollarConfig((prev) => {
      const merged = mergeDollarConfig(prev, {
        ...configData,
        lastUpdated: new Date().toISOString(),
      })
      void persistDollarConfig(merged)
      dollarConfigHasLocalUpdates.current = true
      return merged
    })
  }

  const getEffectiveDollarRate = () => {
    return Number((dollarConfig.blueRate + dollarConfig.markup).toFixed(2))
  }

  const persistHomeConfig = async (partial: Partial<HomeConfig>): Promise<HomeConfig> => {
    let updatedConfig: HomeConfig = homeConfig
    try {
      const response = await fetch("/api/admin/home-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partial),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "No se pudo actualizar la configuracion de la portada")
      }

      const result = (await response.json()) as { data?: Partial<HomeConfig> }

      setHomeConfig((prev) => {
        const merged = mergeHomeConfig(prev, result?.data ?? partial)
        updatedConfig = merged
        return merged
      })

      homeConfigHasLocalUpdates.current = true
      return updatedConfig
    } catch (error) {
      console.error("Failed to persist home config", error)
      throw error instanceof Error ? error : new Error("Failed to persist home config")
    }
  }

  const updateHomeConfig = async (configData: Partial<HomeConfig>) => {
    await persistHomeConfig(configData)
  }

  const updateHomeSection = async (id: HomeSectionId, updates: Partial<HomeSectionConfig>) => {
    const nextSections = homeConfig.sections.map((section) =>
      section.id === id ? { ...section, ...updates } : section,
    )
    await persistHomeConfig({ sections: nextSections })
  }

  const persistTradeInConfig = async (partial: Partial<TradeInConfig>): Promise<TradeInConfig> => {
    let updatedConfig: TradeInConfig = tradeInConfig
    try {
      const response = await fetch("/api/admin/trade-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partial),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "No se pudo actualizar la configuracion de canje")
      }

      const result = (await response.json()) as { data?: Partial<TradeInConfig> }

      setTradeInConfig((prev) => {
        const merged = mergeTradeInConfig(prev, result?.data ?? partial)
        updatedConfig = merged
        return merged
      })

      tradeInConfigHasLocalUpdates.current = true
      return updatedConfig
    } catch (error) {
      console.error("Failed to persist trade-in config", error)
      throw error instanceof Error ? error : new Error("Failed to persist trade-in config")
    }
  }

  const updateTradeInConfig = async (configData: TradeInConfig) => {
    const payload: Partial<TradeInConfig> = {
      ...configData,
      updatedAt: new Date().toISOString(),
    }
    await persistTradeInConfig(payload)
  }

  const login = (password: string) => {
    if (password === "complejo.avesten") {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_STORAGE_KEY, "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const value: AdminContextType = {
    installmentPlans,
    installmentPromotions,
    imageLibrary,
    refreshImageLibrary,
    addInstallmentPlan,
    updateInstallmentPlan,
    deleteInstallmentPlan,
    addInstallmentPromotion,
    updateInstallmentPromotion,
    deleteInstallmentPromotion,
    getActiveInstallmentPlans,
    getInstallmentPlansByCategory,
    getActiveInstallmentPromotions,
    addImageToLibrary,
    updateImageInLibrary,
    removeImageFromLibrary,
    dollarConfig,
    updateDollarConfig,
    getEffectiveDollarRate,
    homeConfig,
    updateHomeConfig,
    updateHomeSection,
    tradeInConfig,
    updateTradeInConfig,
    isAuthenticated,
    login,
    logout,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

export function getProductPriceWithDollar(priceUSD: number | null | undefined, dollarRate: number) {
  if (!priceUSD) return null
  const effective = Number((priceUSD * dollarRate).toFixed(2))
  return effective
}
