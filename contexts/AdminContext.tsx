"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface InstallmentPlan {
  id: string
  months: number
  interestRate: number
  name: string
  description: string
  isActive: boolean
  minAmount: number
  maxAmount: number
  createdAt: string
  category: "visa-mastercard" | "naranja" // Nueva propiedad
}

interface DollarConfig {
  id: string
  officialRate: number
  blueRate: number
  markup: number // Porcentaje de aumento sobre el dólar blue
  lastUpdated: string
  autoUpdate: boolean
}

interface AdminContextType {
  // Installment Plans
  installmentPlans: InstallmentPlan[]
  addInstallmentPlan: (plan: Omit<InstallmentPlan, "id" | "createdAt">) => void
  updateInstallmentPlan: (id: string, plan: Partial<InstallmentPlan>) => void
  deleteInstallmentPlan: (id: string) => void
  getActiveInstallmentPlans: () => InstallmentPlan[]
  getInstallmentPlansByCategory: (category: "visa-mastercard" | "naranja") => InstallmentPlan[]

  // Dollar Configuration
  dollarConfig: DollarConfig
  updateDollarConfig: (config: Partial<DollarConfig>) => void
  getEffectiveDollarRate: () => number

  // Admin Authentication
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Datos iniciales para Visa/Mastercard
const initialVisaMastercardPlans: InstallmentPlan[] = [
  {
    id: "visa-1",
    months: 3,
    interestRate: 0,
    name: "3 cuotas sin interés",
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
    description: "Opción equilibrada con Visa/Mastercard",
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
    description: "Máximo financiamiento con Visa/Mastercard",
    isActive: true,
    minAmount: 0,
    maxAmount: 2000000,
    createdAt: new Date().toISOString(),
    category: "visa-mastercard",
  },
]

// Datos iniciales para Naranja
const initialNaranjaPlans: InstallmentPlan[] = [
  {
    id: "naranja-1",
    months: 3,
    interestRate: 5,
    name: "3 cuotas Naranja",
    description: "Plan básico con Tarjeta Naranja",
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
    description: "Máximo financiamiento con Tarjeta Naranja",
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
  markup: 5, // 5% de aumento sobre el dólar blue
  lastUpdated: new Date().toISOString(),
  autoUpdate: true,
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [dollarConfig, setDollarConfig] = useState<DollarConfig>(initialDollarConfig)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Cargar configuración del localStorage
    const savedPlans = localStorage.getItem("admin-installment-plans")
    const savedDollarConfig = localStorage.getItem("admin-dollar-config")
    const savedAuth = localStorage.getItem("admin-authenticated")

    if (savedPlans) {
      setInstallmentPlans(JSON.parse(savedPlans))
    } else {
      // Combinar planes iniciales de ambas categorías
      setInstallmentPlans([...initialVisaMastercardPlans, ...initialNaranjaPlans])
    }

    if (savedDollarConfig) {
      setDollarConfig(JSON.parse(savedDollarConfig))
    }

    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    // Guardar en localStorage cuando cambien
    if (installmentPlans.length > 0) {
      localStorage.setItem("admin-installment-plans", JSON.stringify(installmentPlans))
    }
  }, [installmentPlans])

  useEffect(() => {
    localStorage.setItem("admin-dollar-config", JSON.stringify(dollarConfig))
  }, [dollarConfig])

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

  const getActiveInstallmentPlans = () => {
    return installmentPlans.filter((plan) => plan.isActive)
  }

  const getInstallmentPlansByCategory = (category: "visa-mastercard" | "naranja") => {
    return installmentPlans.filter((plan) => plan.category === category)
  }

  const updateDollarConfig = (configData: Partial<DollarConfig>) => {
    setDollarConfig((prev) => ({
      ...prev,
      ...configData,
      lastUpdated: new Date().toISOString(),
    }))
  }

  const getEffectiveDollarRate = () => {
    return dollarConfig.blueRate * (1 + dollarConfig.markup / 100)
  }

  const login = (password: string) => {
    // Contraseña simple para demo - en producción usar autenticación real
    if (password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("admin-authenticated", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin-authenticated")
  }

  return (
    <AdminContext.Provider
      value={{
        installmentPlans,
        addInstallmentPlan,
        updateInstallmentPlan,
        deleteInstallmentPlan,
        getActiveInstallmentPlans,
        getInstallmentPlansByCategory,
        dollarConfig,
        updateDollarConfig,
        getEffectiveDollarRate,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
