"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
import { DEFAULT_HOME_CONFIG, mergeHomeConfig } from "@/lib/home-config"
import type { TradeInConfig } from "@/types/trade-in"
import { DEFAULT_TRADE_IN_CONFIG, mergeTradeInConfig } from "@/lib/trade-in-config"

export type { HomeConfig, HomeSectionConfig, HomeSectionId } from "@/types/home"
export type { TradeInConfig } from "@/types/trade-in"

export interface InstallmentPlan {
  id: string
  months: number
  interestRate: number
  isActive: boolean
  createdAt: string
  category: "visa-mastercard" | "naranja"
}

export interface DollarConfig {
  id: string
  officialRate: number
  blueRate: number
  markup: number
  lastUpdated: string
  autoUpdate: boolean
}

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

function sanitizeInstallmentPlan(raw: any, fallbackIndex: number): InstallmentPlan | null {
  const months = Number(raw?.months)
  if (!Number.isFinite(months) || months <= 0) {
    return null
  }
  const interestRate = Number(raw?.interestRate ?? 0)
  const category: InstallmentPlan["category"] = raw?.category === "naranja" ? "naranja" : "visa-mastercard"
  const hasValidId = typeof raw?.id === "string" && raw.id.trim().length > 0
  const id = hasValidId ? (raw.id as string) : `${category}-${Date.now()}-${fallbackIndex}`
  return {
    id,
    months,
    interestRate: Number.isFinite(interestRate) ? interestRate : 0,
    isActive: raw?.isActive !== undefined ? Boolean(raw.isActive) : true,
    createdAt: typeof raw?.createdAt === "string" ? (raw.createdAt as string) : new Date().toISOString(),
    category,
  }
}

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

const initialVisaMastercardPlans: InstallmentPlan[] = [
  {
    id: "visa-1",
    months: 3,
    interestRate: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
  {
    id: "visa-2",
    months: 6,
    interestRate: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
  {
    id: "visa-3",
    months: 12,
    interestRate: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
]

const initialNaranjaPlans: InstallmentPlan[] = [
  {
    id: "naranja-1",
    months: 3,
    interestRate: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-2",
    months: 6,
    interestRate: 18,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-3",
    months: 9,
    interestRate: 28,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-4",
    months: 12,
    interestRate: 35,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
]

const initialDollarConfig: DollarConfig = {
  id: "1",
  officialRate: 350,
  blueRate: 1000,
  markup: 5,
  lastUpdated: new Date().toISOString(),
  autoUpdate: true,
}

const defaultImageLibrary: ProductImageItem[] = []

const INSTALLMENT_STORAGE_KEY = "admin-installment-plans"
const IMAGE_LIBRARY_STORAGE_KEY = "admin-image-library"
const DOLLAR_STORAGE_KEY = "admin-dollar-config"
const AUTH_STORAGE_KEY = "admin-authenticated"
const HOME_STORAGE_KEY = "admin-home-config"
const TRADE_IN_STORAGE_KEY = "admin-trade-in-config"

export function AdminProvider({ children }: { children: ReactNode }) {
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [dollarConfig, setDollarConfig] = useState<DollarConfig>(initialDollarConfig)
  const [imageLibrary, setImageLibrary] = useState<ProductImageItem[]>(defaultImageLibrary)
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG)
  const [tradeInConfig, setTradeInConfig] = useState<TradeInConfig>(DEFAULT_TRADE_IN_CONFIG)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dollarConfigInitialized, setDollarConfigInitialized] = useState(false)
  const [homeConfigInitialized, setHomeConfigInitialized] = useState(false)
  const [imageLibraryInitialized, setImageLibraryInitialized] = useState(false)
  const [tradeInConfigInitialized, setTradeInConfigInitialized] = useState(false)
  const homeConfigHasLocalUpdates = useRef(false)
  const tradeInConfigHasLocalUpdates = useRef(false)
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed
            .map((plan, index) => sanitizeInstallmentPlan(plan, index))
            .filter((plan): plan is InstallmentPlan => plan !== null)
          if (sanitized.length > 0) {
            setInstallmentPlans(sanitized)
          } else {
            setInstallmentPlans([...initialVisaMastercardPlans, ...initialNaranjaPlans])
          }
        } else {
          setInstallmentPlans([...initialVisaMastercardPlans, ...initialNaranjaPlans])
        }
      } catch (error) {
        console.error("Failed to parse saved installment plans", error)
        setInstallmentPlans([...initialVisaMastercardPlans, ...initialNaranjaPlans])
      }
    } else {
      setInstallmentPlans([...initialVisaMastercardPlans, ...initialNaranjaPlans])
    }

    if (savedDollarConfig) {
      try {
        const parsed = JSON.parse(savedDollarConfig) as DollarConfig
        setDollarConfig({ ...initialDollarConfig, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved dollar config", error)
      }
    }

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
        if (result?.data && !tradeInConfigHasLocalUpdates.current) {
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

    setDollarConfigInitialized(true)
    setImageLibraryInitialized(true)
  }, [])

  useEffect(() => {
    if (installmentPlans.length > 0) {
      localStorage.setItem(INSTALLMENT_STORAGE_KEY, JSON.stringify(installmentPlans))
    }
  }, [installmentPlans])

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

  const addInstallmentPlan = (planData: Omit<InstallmentPlan, "id" | "createdAt">) => {
    const newPlan: InstallmentPlan = {
      ...planData,
      id: `${planData.category}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setInstallmentPlans((prev) => [...prev, newPlan])
  }

  const updateInstallmentPlan = (id: string, planData: Partial<InstallmentPlan>) => {
    setInstallmentPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...planData } : plan)))
  }

  const deleteInstallmentPlan = (id: string) => {
    setInstallmentPlans((prev) => prev.filter((plan) => plan.id !== id))
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
    setDollarConfig((prev) => ({
      ...prev,
      ...configData,
      lastUpdated: new Date().toISOString(),
    }))
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
