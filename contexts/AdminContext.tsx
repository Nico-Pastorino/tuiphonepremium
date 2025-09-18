"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export interface InstallmentPlan {
  id: string
  months: number
  interestRate: number
  name: string
  description: string
  isActive: boolean
  minAmount: number
  maxAmount: number
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

interface AdminContextType {
  installmentPlans: InstallmentPlan[]
  addInstallmentPlan: (plan: Omit<InstallmentPlan, "id" | "createdAt">) => void
  updateInstallmentPlan: (id: string, plan: Partial<InstallmentPlan>) => void
  deleteInstallmentPlan: (id: string) => void
  getActiveInstallmentPlans: () => InstallmentPlan[]
  getInstallmentPlansByCategory: (category: InstallmentPlan["category"]) => InstallmentPlan[]

  dollarConfig: DollarConfig
  updateDollarConfig: (config: Partial<DollarConfig>) => void
  getEffectiveDollarRate: () => number

  homeConfig: HomeConfig
  updateHomeConfig: (config: Partial<Omit<HomeConfig, "sections">>) => void
  updateHomeSection: (id: HomeSectionId, updates: Partial<HomeSectionConfig>) => void
  reorderHomeSection: (id: HomeSectionId, direction: "up" | "down") => void

  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const initialVisaMastercardPlans: InstallmentPlan[] = [
  {
    id: "visa-1",
    months: 3,
    interestRate: 0,
    name: "3 cuotas sin interÃ©s",
    description: "Ideal para compras menores con Visa/Mastercard",
    isActive: true,
    minAmount: 0,
    maxAmount: 500000,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
  {
    id: "visa-2",
    months: 6,
    interestRate: 12,
    name: "6 cuotas",
    description: "OpciÃ³n equilibrada con Visa/Mastercard",
    isActive: true,
    minAmount: 0,
    maxAmount: 1000000,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
  {
    id: "visa-3",
    months: 12,
    interestRate: 25,
    name: "12 cuotas",
    description: "MÃ¡ximo financiamiento con Visa/Mastercard",
    isActive: true,
    minAmount: 0,
    maxAmount: 2000000,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
]

const initialNaranjaPlans: InstallmentPlan[] = [
  {
    id: "naranja-1",
    months: 3,
    interestRate: 5,
    name: "3 cuotas Naranja",
    description: "Plan bÃ¡sico con Tarjeta Naranja",
    isActive: true,
    minAmount: 0,
    maxAmount: 400000,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-2",
    months: 6,
    interestRate: 18,
    name: "6 cuotas Naranja",
    description: "Plan intermedio con Tarjeta Naranja",
    isActive: true,
    minAmount: 0,
    maxAmount: 800000,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-3",
    months: 9,
    interestRate: 28,
    name: "9 cuotas Naranja",
    description: "Plan extendido con Tarjeta Naranja",
    isActive: true,
    minAmount: 0,
    maxAmount: 1200000,
    createdAt: new Date().toISOString(),
    category: "naranja",
  },
  {
    id: "naranja-4",
    months: 12,
    interestRate: 35,
    name: "12 cuotas Naranja",
    description: "MÃ¡ximo financiamiento con Tarjeta Naranja",
    isActive: true,
    minAmount: 0,
    maxAmount: 1500000,
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

const defaultHomeConfig: HomeConfig = {
  heroImage: "/portada.jpg",
  heroHeadline: "Los mejores productos Apple de Argentina",
  heroSubheadline: "Descubre nuestra selecciÃ³n premium de iPhone, iPad, Mac y mÃ¡s con garantÃ­a oficial.",
  promoMessage: "Productos nuevos y seminuevos con garantÃ­a.",
  whatsappNumber: "5491112345678",
  sections: [
    { id: "categories", label: "Explorar por categorÃ­a", enabled: true },
    { id: "featured", label: "Productos destacados", enabled: true },
    { id: "benefits", label: "Beneficios", enabled: true },
    { id: "cta", label: "Llamado a la acciÃ³n", enabled: true },
  ],
}

const INSTALLMENT_STORAGE_KEY = "admin-installment-plans"
const DOLLAR_STORAGE_KEY = "admin-dollar-config"
const AUTH_STORAGE_KEY = "admin-authenticated"
const HOME_STORAGE_KEY = "admin-home-config"

function mergeHomeSections(sections: HomeSectionConfig[] | undefined): HomeSectionConfig[] {
  const base = defaultHomeConfig.sections
  if (!sections || sections.length === 0) {
    return base
  }

  const merged = base.map((section) => {
    const saved = sections.find((item) => item.id === section.id)
    return saved ? { ...section, ...saved } : section
  })

  const extra = sections.filter((section) => !base.some((baseSection) => baseSection.id === section.id))
  return [...merged, ...extra]
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [dollarConfig, setDollarConfig] = useState<DollarConfig>(initialDollarConfig)
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(defaultHomeConfig)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const savedPlans = typeof window === "undefined" ? null : localStorage.getItem(INSTALLMENT_STORAGE_KEY)
    const savedDollarConfig = typeof window === "undefined" ? null : localStorage.getItem(DOLLAR_STORAGE_KEY)
    const savedAuth = typeof window === "undefined" ? null : localStorage.getItem(AUTH_STORAGE_KEY)
    const savedHomeConfig = typeof window === "undefined" ? null : localStorage.getItem(HOME_STORAGE_KEY)

    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans) as InstallmentPlan[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInstallmentPlans(parsed)
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
        setHomeConfig((prev) => ({
          heroImage: parsed.heroImage || prev.heroImage,
          heroHeadline: parsed.heroHeadline || prev.heroHeadline,
          heroSubheadline: parsed.heroSubheadline || prev.heroSubheadline,
          promoMessage: parsed.promoMessage || prev.promoMessage,
          whatsappNumber: parsed.whatsappNumber || prev.whatsappNumber,
          sections: mergeHomeSections(parsed.sections),
        }))
      } catch (error) {
        console.error("Failed to parse saved home config", error)
      }
    }
  }, [])

  useEffect(() => {
    if (installmentPlans.length > 0) {
      localStorage.setItem(INSTALLMENT_STORAGE_KEY, JSON.stringify(installmentPlans))
    }
  }, [installmentPlans])

  useEffect(() => {
    localStorage.setItem(DOLLAR_STORAGE_KEY, JSON.stringify(dollarConfig))
  }, [dollarConfig])

  useEffect(() => {
    localStorage.setItem(
      HOME_STORAGE_KEY,
      JSON.stringify({
        ...homeConfig,
        sections: homeConfig.sections.map((section) => ({ id: section.id, label: section.label, enabled: section.enabled })),
      }),
    )
  }, [homeConfig])

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
    return Number((dollarConfig.blueRate * (1 + dollarConfig.markup / 100)).toFixed(2))
  }

  const updateHomeConfig = (configData: Partial<Omit<HomeConfig, "sections">>) => {
    setHomeConfig((prev) => ({
      ...prev,
      ...configData,
    }))
  }

  const updateHomeSection = (id: HomeSectionId, updates: Partial<HomeSectionConfig>) => {
    setHomeConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === id ? { ...section, ...updates } : section)),
    }))
  }

  const reorderHomeSection = (id: HomeSectionId, direction: "up" | "down") => {
    setHomeConfig((prev) => {
      const sections = [...prev.sections]
      const index = sections.findIndex((section) => section.id === id)
      if (index === -1) return prev

      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= sections.length) {
        return prev
      }

      ;[sections[index], sections[swapIndex]] = [sections[swapIndex], sections[index]]
      return { ...prev, sections }
    })
  }

  const login = (password: string) => {
    if (password === "admin123") {
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
      addInstallmentPlan,
      updateInstallmentPlan,
      deleteInstallmentPlan,
      getActiveInstallmentPlans,
      getInstallmentPlansByCategory,
      dollarConfig,
      updateDollarConfig,
      getEffectiveDollarRate,
      homeConfig,
      updateHomeConfig,
      updateHomeSection,
      reorderHomeSection,
      isAuthenticated,
      login,
      logout,
    }),
    [
      installmentPlans,
      dollarConfig,
      homeConfig,
      isAuthenticated,
    ],
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
