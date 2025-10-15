"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
import { DEFAULT_HOME_CONFIG, mergeHomeConfig } from "@/lib/home-config"
import type { TradeInConfig } from "@/types/trade-in"
import { DEFAULT_TRADE_IN_CONFIG, mergeTradeInConfig } from "@/lib/trade-in-config"
import type { DollarConfig, InstallmentConfig, InstallmentPlan } from "@/types/finance"
import {
  DEFAULT_DOLLAR_CONFIG,
  DEFAULT_INSTALLMENT_CONFIG,
  cloneInstallmentPlans,
  mergeDollarConfig,
  mergeInstallmentConfig,
  sanitizeInstallmentPlanCollection,
} from "@/lib/finance-config"

export type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
export type { TradeInConfig } from "@/types/trade-in"
export type { InstallmentPlan, DollarConfig } from "@/types/finance"

export interface ProductImageItem {
  id: string
  label: string
  category: string
  url: string
  createdAt: string
}

interface AdminContextType {
  installmentPlans: InstallmentPlan[]
  addInstallmentPlan: (plan: Omit<InstallmentPlan, "id" | "createdAt">) => void
  updateInstallmentPlan: (id: string, plan: Partial<InstallmentPlan>) => void
  deleteInstallmentPlan: (id: string) => void
  getActiveInstallmentPlans: () => InstallmentPlan[]
  getInstallmentPlansByCategory: (category: InstallmentPlan["category"]) => InstallmentPlan[]

  imageLibrary: ProductImageItem[]
  addImageToLibrary: (image: Omit<ProductImageItem, "id" | "createdAt">) => void
  updateImageInLibrary: (id: string, updates: Partial<Omit<ProductImageItem, "id" | "createdAt">>) => void
  removeImageFromLibrary: (id: string) => void

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

function sanitizeProductImage(raw: any, fallbackIndex: number): ProductImageItem | null {
  const url = typeof raw?.url === "string" ? raw.url.trim() : ""
  if (!url) {
    return null
  }
  const label = typeof raw?.label === "string" && raw.label.trim().length > 0 ? raw.label.trim() : "Imagen"
  const category = typeof raw?.category === "string" && raw.category.trim().length > 0 ? raw.category.trim() : "general"
  const hasValidId = typeof raw?.id === "string" && raw.id.trim().length > 0
  const id = hasValidId ? (raw.id as string) : `${category}-${Date.now()}-${fallbackIndex}`
  return {
    id,
    label,
    category,
    url,
    createdAt: typeof raw?.createdAt === "string" ? (raw.createdAt as string) : new Date().toISOString(),
  }
}

const defaultImageLibrary: ProductImageItem[] = []

const INSTALLMENT_STORAGE_KEY = "admin-installment-plans"
const IMAGE_LIBRARY_STORAGE_KEY = "admin-image-library"
const DOLLAR_STORAGE_KEY = "admin-dollar-config"
const AUTH_STORAGE_KEY = "admin-authenticated"
const HOME_STORAGE_KEY = "admin-home-config"
const TRADE_IN_STORAGE_KEY = "admin-trade-in-config"

export function AdminProvider({ children }: { children: ReactNode }) {
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(() =>
    cloneInstallmentPlans(DEFAULT_INSTALLMENT_CONFIG.plans),
  )
  const [dollarConfig, setDollarConfig] = useState<DollarConfig>({ ...DEFAULT_DOLLAR_CONFIG })
  const [imageLibrary, setImageLibrary] = useState<ProductImageItem[]>(defaultImageLibrary)
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG)
  const [tradeInConfig, setTradeInConfig] = useState<TradeInConfig>(DEFAULT_TRADE_IN_CONFIG)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [installmentPlansInitialized, setInstallmentPlansInitialized] = useState(false)
  const [dollarConfigInitialized, setDollarConfigInitialized] = useState(false)
  const [homeConfigInitialized, setHomeConfigInitialized] = useState(false)
  const [imageLibraryInitialized, setImageLibraryInitialized] = useState(false)
  const [tradeInConfigInitialized, setTradeInConfigInitialized] = useState(false)
  const installmentPlansHasLocalUpdates = useRef(false)
  const dollarConfigHasLocalUpdates = useRef(false)
  const homeConfigHasLocalUpdates = useRef(false)
  const tradeInConfigHasLocalUpdates = useRef(false)
  const tradeInConfigLoadedFromStorage = useRef(false)
  useEffect(() => {
    const savedPlans = typeof window === "undefined" ? null : localStorage.getItem(INSTALLMENT_STORAGE_KEY)
    const savedDollarConfig = typeof window === "undefined" ? null : localStorage.getItem(DOLLAR_STORAGE_KEY)
    const savedAuth = typeof window === "undefined" ? null : localStorage.getItem(AUTH_STORAGE_KEY)
    const savedHomeConfig = typeof window === "undefined" ? null : localStorage.getItem(HOME_STORAGE_KEY)
    const savedTradeInConfig = typeof window === "undefined" ? null : localStorage.getItem(TRADE_IN_STORAGE_KEY)
    const savedImageLibrary = typeof window === "undefined" ? null : localStorage.getItem(IMAGE_LIBRARY_STORAGE_KEY)

    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans) as unknown
        const sanitized = sanitizeInstallmentPlanCollection(parsed)
        if (sanitized.length > 0) {
          setInstallmentPlans(cloneInstallmentPlans(sanitized))
        } else {
          setInstallmentPlans(cloneInstallmentPlans(DEFAULT_INSTALLMENT_CONFIG.plans))
        }
      } catch (error) {
        console.error("Failed to parse saved installment plans", error)
        setInstallmentPlans(cloneInstallmentPlans(DEFAULT_INSTALLMENT_CONFIG.plans))
      }
    } else {
      setInstallmentPlans(cloneInstallmentPlans(DEFAULT_INSTALLMENT_CONFIG.plans))
    }

    const loadRemoteInstallments = async () => {
      try {
        const response = await fetch("/api/admin/installments")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch installment plans")
        }
        const result = (await response.json()) as { data?: InstallmentConfig }
        if (result?.data && !installmentPlansHasLocalUpdates.current) {
          const merged = mergeInstallmentConfig(DEFAULT_INSTALLMENT_CONFIG, result.data)
          setInstallmentPlans(cloneInstallmentPlans(merged.plans))
        }
      } catch (error) {
        console.error("Failed to fetch installment plans from API", error)
      } finally {
        setInstallmentPlansInitialized(true)
      }
    }

    void loadRemoteInstallments()

    if (savedDollarConfig) {
      try {
        const parsed = JSON.parse(savedDollarConfig) as Partial<DollarConfig>
        setDollarConfig(mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, parsed))
      } catch (error) {
        console.error("Failed to parse saved dollar config", error)
        setDollarConfig({ ...DEFAULT_DOLLAR_CONFIG })
      }
    } else {
      setDollarConfig({ ...DEFAULT_DOLLAR_CONFIG })
    }

    const loadRemoteDollarConfig = async () => {
      try {
        const response = await fetch("/api/admin/dollar")
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Unable to fetch dollar config")
        }
        const result = (await response.json()) as { data?: Partial<DollarConfig> }
        if (result?.data && !dollarConfigHasLocalUpdates.current) {
          setDollarConfig(mergeDollarConfig(DEFAULT_DOLLAR_CONFIG, result.data))
        }
      } catch (error) {
        console.error("Failed to fetch dollar config from API", error)
      } finally {
        setDollarConfigInitialized(true)
      }
    }

    void loadRemoteDollarConfig()

    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }

    if (savedHomeConfig) {
      try {
        const parsed = JSON.parse(savedHomeConfig) as Partial<HomeConfig>
        setHomeConfig((prev) => mergeHomeConfig(prev, parsed))
      } catch (error) {
        console.error("Failed to parse saved home config", error)
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
        if (result?.data && !homeConfigHasLocalUpdates.current) {
          setHomeConfig((prev) => mergeHomeConfig(prev, result.data))
        }
      } catch (error) {
        console.error("Failed to fetch home config from API", error)
      } finally {
        setHomeConfigInitialized(true)
      }
    }

    void loadRemoteHomeConfig()

    if (savedTradeInConfig) {
      try {
        const parsed = JSON.parse(savedTradeInConfig) as Partial<TradeInConfig>
        setTradeInConfig((prev) => mergeTradeInConfig(prev, parsed))
        tradeInConfigLoadedFromStorage.current = true
      } catch (error) {
        console.error("Failed to parse saved trade-in config", error)
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

        if (shouldApplyRemote) {
          setTradeInConfig((prev) => mergeTradeInConfig(prev, result.data))
        }
      } catch (error) {
        console.error("Failed to fetch trade-in config from API", error)
      } finally {
        setTradeInConfigInitialized(true)
      }
    }

    void loadRemoteTradeInConfig()

    if (savedImageLibrary) {
      try {
        const parsed = JSON.parse(savedImageLibrary) as unknown
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed
            .map((item, index) => sanitizeProductImage(item, index))
            .filter((item): item is ProductImageItem => item !== null)
          if (sanitized.length > 0) {
            setImageLibrary(sanitized)
          } else {
            setImageLibrary(defaultImageLibrary)
          }
        } else {
          setImageLibrary(defaultImageLibrary)
        }
      } catch (error) {
        console.error("Failed to parse saved image library", error)
        setImageLibrary(defaultImageLibrary)
      }
    } else {
      setImageLibrary(defaultImageLibrary)
    }

    setImageLibraryInitialized(true)
  }, [])

  useEffect(() => {
    if (!installmentPlansInitialized) return
    localStorage.setItem(INSTALLMENT_STORAGE_KEY, JSON.stringify(installmentPlans))
  }, [installmentPlans, installmentPlansInitialized])

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
    if (!imageLibraryInitialized) return
    localStorage.setItem(IMAGE_LIBRARY_STORAGE_KEY, JSON.stringify(imageLibrary))
  }, [imageLibrary, imageLibraryInitialized])

  useEffect(() => {
    if (!tradeInConfigInitialized) return
    localStorage.setItem(TRADE_IN_STORAGE_KEY, JSON.stringify(tradeInConfig))
  }, [tradeInConfig, tradeInConfigInitialized])

  const persistInstallmentPlans = async (plans: InstallmentPlan[]) => {
    const sanitized = sanitizeInstallmentPlanCollection(plans)
    const payload: InstallmentConfig = {
      plans: sanitized,
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
      console.error("Failed to persist installment plans", error)
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
      void persistInstallmentPlans(nextPlans)
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
      void persistInstallmentPlans(nextPlans)
      installmentPlansHasLocalUpdates.current = true
      return nextPlans
    })
  }

  const deleteInstallmentPlan = (id: string) => {
    setInstallmentPlans((prev) => {
      const nextPlans = sanitizeInstallmentPlanCollection(prev.filter((plan) => plan.id !== id))
      void persistInstallmentPlans(nextPlans)
      installmentPlansHasLocalUpdates.current = true
      return nextPlans
    })
  }

  const addImageToLibrary = (imageData: Omit<ProductImageItem, "id" | "createdAt">) => {
    setImageLibrary((prev) => {
      if (prev.some((item) => item.url === imageData.url)) {
        return prev
      }
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${imageData.category}-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const newItem: ProductImageItem = {
        id,
        label: imageData.label.trim() || "Imagen",
        category: imageData.category.trim() || "general",
        url: imageData.url.trim(),
        createdAt: new Date().toISOString(),
      }
      return [...prev, newItem]
    })
  }

  const updateImageInLibrary = (id: string, updates: Partial<Omit<ProductImageItem, "id" | "createdAt">>) => {
    setImageLibrary((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeImageFromLibrary = (id: string) => {
    setImageLibrary((prev) => prev.filter((item) => item.id !== id))
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

  const value = useMemo(
    () => ({
      installmentPlans,
      imageLibrary,
      addInstallmentPlan,
      updateInstallmentPlan,
      deleteInstallmentPlan,
      getActiveInstallmentPlans,
      getInstallmentPlansByCategory,
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
    }),
    [installmentPlans, imageLibrary, dollarConfig, homeConfig, tradeInConfig, isAuthenticated],
  )

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
