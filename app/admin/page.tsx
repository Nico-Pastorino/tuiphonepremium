"use client"
import type { ChangeEvent, FormEvent } from "react"

import { useEffect, useMemo, useState, useCallback } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AdminLogin } from "@/components/AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProducts } from "@/contexts/ProductContext"
import { useAdmin } from "@/contexts/AdminContext"
import type { HomeConfig, InstallmentPlan, InstallmentPromotion, TradeInConfig } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import { cloneHomeConfig } from "@/lib/home-config"
import { cloneTradeInConfig } from "@/lib/trade-in-config"
import { toNumericInputValue } from "@/lib/number-input"
import Image from "next/image"
import { getAdminLibraryImageUrls, getProductListImageUrls } from "@/lib/image-cdn"
import { StorageImage } from "@/components/StorageImage"
import type { CatalogProductPricing, Product } from "@/types/product"
import { ProductForm } from "@/components/product-form"
import { InstallmentForm, type InstallmentFormData } from "@/components/installment-form"
import {
  InstallmentPromotionForm,
  type InstallmentPromotionFormData,
} from "@/components/installment-promotion-form"
import {
  Trash2,
  Edit,
  Copy,
  Plus,
  RefreshCw,
  DollarSign,
  Settings,
  Package,
  CreditCard,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import type { TradeInConditionId, TradeInStorageId, TradeInRow } from "@/types/trade-in"
import type { ImageLibraryItem } from "@/types/image-library"

type NewLibraryImageForm = { label: string; category: string; dataUrl: string }
type AdminListCondition = "nuevo" | "seminuevo" | "outlet" | null
type AdminProduct = Product & { pricing?: CatalogProductPricing | null }
type AdminProductsResponse = {
  data?: AdminProduct[]
  total?: number
  limit?: number
  offset?: number
  error?: string
}

export const dynamic = "force-dynamic"



const TRADE_IN_STORAGE_IDS: TradeInStorageId[] = ["64gb", "128gb", "256gb", "512gb"]
const TRADE_IN_CONDITION_IDS: TradeInConditionId[] = ["under90", "over90"]

const slugifyTradeInLabel = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const createEmptyTradeInRow = (label: string, id: string): TradeInRow => {
  const values = TRADE_IN_STORAGE_IDS.reduce(
    (storageAcc, storageId) => {
      storageAcc[storageId] = TRADE_IN_CONDITION_IDS.reduce(
        (conditionAcc, conditionId) => {
          conditionAcc[conditionId] = null
          return conditionAcc
        },
        {} as Record<TradeInConditionId, number | null>,
      )
      return storageAcc
    },
    {} as Record<TradeInStorageId, Record<TradeInConditionId, number | null>>,
  )

  return {
    id,
    label,
    values,
  }
}


export default function AdminPage() {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const { addProduct, updateProduct, deleteProduct, ensureProductById } = useProducts()
  const {
    installmentPlans,
    installmentPromotions,
    addInstallmentPlan,
    updateInstallmentPlan,
    deleteInstallmentPlan,
    addInstallmentPromotion,
    updateInstallmentPromotion,
    deleteInstallmentPromotion,
    dollarConfig,
    updateDollarConfig,
    getInstallmentPlansByCategory,
    addImageToLibrary,
    removeImageFromLibrary,
    homeConfig,
    updateHomeConfig,
    updateHomeSection,
    tradeInConfig,
    updateTradeInConfig,
    logout,
  } = useAdmin()
  const { dollarRate, refresh: refreshDollarRate, loading, error } = useDollarRate()
  const outletEnabled = process.env.NEXT_PUBLIC_OUTLET_ENABLED === "true"

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddInstallmentOpen, setIsAddInstallmentOpen] = useState(false)
  const [installmentCategory, setInstallmentCategory] = useState<"visa-mastercard" | "naranja">("visa-mastercard")
  const [editingInstallment, setEditingInstallment] = useState<InstallmentPlan | null>(null)
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<InstallmentPromotion | null>(null)
  const [newLibraryImage, setNewLibraryImage] = useState<NewLibraryImageForm>({
    label: "",
    category: "",
    dataUrl: "",
  })
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [conditionFilter, setConditionFilter] = useState<AdminListCondition>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [productsPage, setProductsPage] = useState(1)
  const [productsTotal, setProductsTotal] = useState(0)
  const [pagedProducts, setPagedProducts] = useState<AdminProduct[]>([])
  const [productsReloadToken, setProductsReloadToken] = useState(0)
  const [editingProductDetail, setEditingProductDetail] = useState<Product | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProductOpen, setEditingProductOpen] = useState(false)
  const [editingProductLoading, setEditingProductLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [savingLibraryImage, setSavingLibraryImage] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [isLibrarySectionOpen, setIsLibrarySectionOpen] = useState(false)
  const [libraryPage, setLibraryPage] = useState(1)
  const [imageLibrary, setImageLibrary] = useState<ImageLibraryItem[]>([])
  const [imageLibraryTotal, setImageLibraryTotal] = useState(0)
  const [imageLibraryLoading, setImageLibraryLoading] = useState(false)
  const [imageLibraryReloadToken, setImageLibraryReloadToken] = useState(0)
  const IMAGE_LIBRARY_PAGE_SIZE = 12

  const [homeForm, setHomeForm] = useState<HomeConfig>(() => cloneHomeConfig(homeConfig))
  const [savingHomeConfig, setSavingHomeConfig] = useState(false)

  const [tradeInForm, setTradeInForm] = useState<TradeInConfig>(() => cloneTradeInConfig(tradeInConfig))
  const [savingTradeInConfig, setSavingTradeInConfig] = useState(false)
  const [markupInput, setMarkupInput] = useState(() => String(dollarConfig.markup))
  const [tradeInRowDialog, setTradeInRowDialog] = useState<{ sectionId: string | null; label: string; error: string | null }>(
    {
      sectionId: null,
      label: "",
      error: null,
    },
  )

  useEffect(() => {
    setHomeForm(cloneHomeConfig(homeConfig))
  }, [homeConfig]) // Dependencias especficas en lugar del objeto completo

  useEffect(() => {
    setTradeInForm(cloneTradeInConfig(tradeInConfig))
  }, [tradeInConfig])

  useEffect(() => {
    setMarkupInput(String(dollarConfig.markup))
  }, [dollarConfig.markup])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const getDisplayPrice = (product: AdminProduct) => product.pricing?.display_price ?? product.price

  // Obtener planes por categoria
  const visaMastercardPlans = getInstallmentPlansByCategory("visa-mastercard")
  const naranjaPlans = getInstallmentPlansByCategory("naranja")
  const formatFactorValue = useCallback((interestRate: number) => (1 + interestRate / 100).toFixed(2), [])
  const formatPromotionRange = useCallback((startDate: string | null, endDate: string | null) => {
    const formatDate = (value: string | null) => {
      if (!value) return null
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return null
      return parsed.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    const startLabel = formatDate(startDate)
    const endLabel = formatDate(endDate)
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
    if (startLabel) return `Desde ${startLabel}`
    if (endLabel) return `Hasta ${endLabel}`
    return "Siempre activa"
  }, [])

  // Filtrar productos
  const PRODUCTS_PAGE_SIZE = 24
  const totalProductPages = Math.max(1, Math.ceil(productsTotal / PRODUCTS_PAGE_SIZE))
  const trimmedSearch = searchTerm.trim()

  useEffect(() => {
    setProductsPage(1)
  }, [trimmedSearch, conditionFilter])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setProductsLoading(true)
      setProductsError(null)

      try {
        const params = new URLSearchParams()
        params.set("limit", String(PRODUCTS_PAGE_SIZE))
        params.set("offset", String((productsPage - 1) * PRODUCTS_PAGE_SIZE))
        if (trimmedSearch.length > 0) {
          params.set("search", trimmedSearch)
        }
        if (conditionFilter) {
          params.set("condition", conditionFilter)
        }

        const response = await fetch(`/api/admin/products?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const result = (await response.json()) as AdminProductsResponse

        if (!response.ok) {
          throw new Error(result.error || `Error ${response.status}`)
        }

        if (!active) {
          return
        }

        setPagedProducts(Array.isArray(result.data) ? result.data : [])
        setProductsTotal(typeof result.total === "number" ? result.total : 0)
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) {
          return
        }

        setPagedProducts([])
        setProductsTotal(0)
        setProductsError(error instanceof Error ? error.message : "No se pudieron cargar los productos")
      } finally {
        if (active) {
          setProductsLoading(false)
        }
      }
    }, 250)

    return () => {
      active = false
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [productsPage, trimmedSearch, conditionFilter, productsReloadToken])

  const baseDollarRate = dollarRate?.blue ?? dollarConfig.blueRate
  const finalDollarValue = (baseDollarRate + dollarConfig.markup).toFixed(2)
  const formattedTradeInUpdatedAt = useMemo(() => {
    if (!tradeInConfig.updatedAt) {
      return "sin datos"
    }
    const parsedDate = new Date(tradeInConfig.updatedAt)
    if (Number.isNaN(parsedDate.getTime())) {
      return "sin datos"
    }
    return parsedDate.toLocaleString("es-AR")
  }, [tradeInConfig.updatedAt])

  useEffect(() => {
    if (!dollarRate) {
      return
    }

    const apiBlue = Number.isFinite(dollarRate.blue) ? dollarRate.blue : null
    const apiOfficial = Number.isFinite(dollarRate.official) ? dollarRate.official : null

    if (apiBlue === null) {
      return
    }

    const hasBlueChanged = Math.abs(dollarConfig.blueRate - apiBlue) > 0.01
    const hasOfficialChanged =
      apiOfficial !== null && Math.abs(dollarConfig.officialRate - apiOfficial) > 0.01

    if (!hasBlueChanged && !hasOfficialChanged) {
      return
    }

    updateDollarConfig({
      blueRate: apiBlue,
      officialRate: apiOfficial ?? dollarConfig.officialRate,
    })
  }, [dollarRate, dollarConfig.blueRate, dollarConfig.officialRate, updateDollarConfig])

  const handleUpdateDollarRate = async () => {
    await refreshDollarRate()
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId)
    try {
      const success = await deleteProduct(productId)
      if (success) {
        console.log("Producto eliminado exitosamente")
        setProductsReloadToken((current) => current + 1)
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleOpenEditProduct = useCallback(
    async (productId: string) => {
      setEditingProductId(productId)
      setEditingProductLoading(true)
      setEditingProductOpen(true)

      try {
        const product = await ensureProductById(productId)
        setEditingProductDetail(product)
      } catch (error) {
        console.error("No se pudo cargar el producto para edicion:", error)
        setEditingProductDetail(null)
      } finally {
        setEditingProductLoading(false)
      }
    },
    [ensureProductById],
  )

  const imageLibraryCategories = useMemo(() => {
    const categories = new Set<string>(imageLibrary.map((item) => item.category || "general"))
    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [imageLibrary])

  const filteredLibraryImages = imageLibrary
  const totalLibraryPages = Math.max(1, Math.ceil(imageLibraryTotal / IMAGE_LIBRARY_PAGE_SIZE))

  useEffect(() => {
    setLibraryPage(1)
  }, [libraryCategoryFilter])

  useEffect(() => {
    if (!isLibrarySectionOpen) {
      return
    }
    let active = true

    const loadImageLibraryPage = async () => {
      try {
        setImageLibraryLoading(true)
        const params = new URLSearchParams()
        params.set("limit", String(IMAGE_LIBRARY_PAGE_SIZE))
        params.set("offset", String((libraryPage - 1) * IMAGE_LIBRARY_PAGE_SIZE))
        if (libraryCategoryFilter !== "todos") {
          params.set("category", libraryCategoryFilter)
        }

        const response = await fetch(`/api/admin/image-library?${params.toString()}`, { cache: "default" })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "No se pudo cargar la biblioteca")
        }

        const result = (await response.json()) as {
          data?: ImageLibraryItem[]
          total?: number
        }

        if (!active) {
          return
        }

        setImageLibrary(Array.isArray(result.data) ? result.data : [])
        setImageLibraryTotal(result.total ?? 0)
      } catch (error) {
        if (!active) {
          return
        }
        console.error("No se pudo cargar la biblioteca de imagenes:", error)
        setImageLibrary([])
        setImageLibraryTotal(0)
      } finally {
        if (active) {
          setImageLibraryLoading(false)
        }
      }
    }

    void loadImageLibraryPage()

    return () => {
      active = false
    }
  }, [isLibrarySectionOpen, libraryPage, libraryCategoryFilter, imageLibraryReloadToken])

  const handleAddLibraryImage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const label = newLibraryImage.label.trim()
      const category = newLibraryImage.category.trim() || "general"
      const dataUrl = newLibraryImage.dataUrl.trim()
      if (!dataUrl) {
        alert("Selecciona una imagen antes de agregarla.")
        return
      }

      try {
        setSavingLibraryImage(true)
        await addImageToLibrary({
          label: label || "Imagen",
          category,
          dataUrl,
        })
        setNewLibraryImage({ label: "", category, dataUrl: "" })
        setImagePreview("")
        setLibraryCategoryFilter(category)
        setLibraryPage(1)
        setImageLibraryReloadToken((current) => current + 1)
      } catch (error) {
        console.error("No se pudo guardar la imagen:", error)
        const message = error instanceof Error ? error.message : "No se pudo guardar la imagen. Intenta nuevamente."
        alert(message)
      } finally {
        setSavingLibraryImage(false)
      }
    },
    [addImageToLibrary, newLibraryImage],
  )

  const handleRemoveLibraryImage = async (id: string) => {
    try {
      await removeImageFromLibrary(id)
      setImageLibrary((prev) => prev.filter((item) => item.id !== id))
      setImageLibraryTotal((prev) => Math.max(0, prev - 1))
      setImageLibraryReloadToken((current) => current + 1)
    } catch (error) {
      console.error("No se pudo eliminar la imagen:", error)
      const message = error instanceof Error ? error.message : "No se pudo eliminar la imagen. Intenta nuevamente."
      alert(message)
    }
  }

  const handleSectionToggle = async (id: (typeof homeConfig.sections)[number]["id"], enabled: boolean) => {
    const previousSections = homeForm.sections.map((section) => ({ ...section }))
    setHomeForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === id ? { ...section, enabled } : section)),
    }))
    try {
      await updateHomeSection(id, { enabled })
    } catch (error) {
      console.error("No se pudo actualizar la visibilidad de la seccion", error)
      setHomeForm((prev) => ({ ...prev, sections: previousSections }))
      alert("No se pudo guardar el cambio de visibilidad. Intenta nuevamente.")
    }
  }


  const handleTradeInValueChange = (
    sectionId: string,
    rowId: string,
    storageId: TradeInStorageId,
    conditionId: TradeInConditionId,
    rawValue: string,
  ) => {
    setTradeInForm((prev) => {
      const next = cloneTradeInConfig(prev)
      const section = next.sections.find((item) => item.id === sectionId)
      if (!section) {
        return prev
      }
      const row = section.rows.find((item) => item.id === rowId)
      if (!row) {
        return prev
      }

      const cleaned = rawValue.trim()
      if (cleaned.length === 0) {
        row.values[storageId][conditionId] = null
        return next
      }

      const parsed = Number(cleaned.replace(/,/g, "."))
      row.values[storageId][conditionId] = Number.isNaN(parsed) ? null : parsed
      return next
    })
  }

  const closeTradeInRowDialog = () => {
    setTradeInRowDialog({ sectionId: null, label: "", error: null })
  }

  const handleTradeInRowLabelChange = (sectionId: string, rowId: string, label: string) => {
    setTradeInForm((prev) => {
      const next = cloneTradeInConfig(prev)
      const section = next.sections.find((item) => item.id === sectionId)
      if (!section) {
        return prev
      }
      const row = section.rows.find((item) => item.id === rowId)
      if (!row) {
        return prev
      }
      row.label = label
      return next
    })
  }

  const handleRemoveTradeInRow = (sectionId: string, rowId: string) => {
    setTradeInForm((prev) => {
      const next = cloneTradeInConfig(prev)
      const section = next.sections.find((item) => item.id === sectionId)
      if (!section) {
        return prev
      }
      section.rows = section.rows.filter((item) => item.id !== rowId)
      return next
    })
  }

  const handleAddTradeInRow = () => {
    const { sectionId, label } = tradeInRowDialog
    if (!sectionId) {
      return
    }

    const trimmedLabel = label.trim()
    if (trimmedLabel.length === 0) {
      setTradeInRowDialog((prev) => ({ ...prev, error: "Ingresa un nombre valido." }))
      return
    }

    let duplicated = false

    setTradeInForm((prev) => {
      const next = cloneTradeInConfig(prev)
      const section = next.sections.find((item) => item.id === sectionId)
      if (!section) {
        return prev
      }

      if (section.rows.some((row) => row.label.trim().toLowerCase() === trimmedLabel.toLowerCase())) {
        duplicated = true
        return prev
      }

      let baseId = slugifyTradeInLabel(trimmedLabel)
      if (!baseId) {
        baseId = `modelo-${Date.now()}`
      }
      let candidateId = baseId
      let counter = 1
      while (section.rows.some((row) => row.id === candidateId)) {
        candidateId = `${baseId}-${counter}`
        counter += 1
      }

      section.rows.push(createEmptyTradeInRow(trimmedLabel, candidateId))
      return next
    })

    if (duplicated) {
      setTradeInRowDialog((prev) => ({ ...prev, error: "Ya existe un modelo con ese nombre." }))
      return
    }

    closeTradeInRowDialog()
  }

  const handleSaveTradeInConfig = async () => {
    setSavingTradeInConfig(true)
    try {
      await updateTradeInConfig(tradeInForm)
    } catch (error) {
      console.error("Failed to save trade-in config", error)
      alert("No se pudo guardar la tabla de canje")
    } finally {
      setSavingTradeInConfig(false)
    }
  }


  const handleSaveHomeConfig = async () => {
    setSavingHomeConfig(true)
    try {
      const tradeInLabel = homeForm.tradeInTitle.trim().length > 0 ? homeForm.tradeInTitle.trim() : "Plan canje"

      await updateHomeConfig({
        whatsappNumber: homeForm.whatsappNumber,
        tradeInTitle: homeForm.tradeInTitle,
        tradeInSubtitle: homeForm.tradeInSubtitle,
      })

      const tradeInSectionConfig = homeForm.sections.find((section) => section.id === "trade-in")
      if (!tradeInSectionConfig || tradeInSectionConfig.label !== tradeInLabel) {
        await updateHomeSection("trade-in", { label: tradeInLabel })
      }

      console.log("Configuracion de la portada actualizada")
    } catch (error) {
      console.error("No se pudo guardar la configuracion de la portada", error)
      alert("No se pudo guardar la portada. Revisa tu conexion e intenta nuevamente.")
    } finally {
      setSavingHomeConfig(false)
    }
  }

  const handleMoveSection = async (
    id: (typeof homeForm.sections)[number]["id"],
    direction: "up" | "down",
  ) => {
    const currentIndex = homeForm.sections.findIndex((section) => section.id === id)
    if (currentIndex === -1) {
      return
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= homeForm.sections.length) {
      return
    }

    const previousSections = homeForm.sections.map((section) => ({ ...section }))
    const nextSections = previousSections.map((section) => ({ ...section }))
    ;[nextSections[currentIndex], nextSections[swapIndex]] = [
      nextSections[swapIndex],
      nextSections[currentIndex],
    ]

    setHomeForm((prev) => ({
      ...prev,
      sections: nextSections,
    }))

    try {
      await updateHomeConfig({ sections: nextSections })
    } catch (error) {
      console.error("No se pudo reordenar la seccion", error)
      setHomeForm((prev) => ({ ...prev, sections: previousSections }))
      alert("No se pudo reordenar la seccion. Intenta nuevamente.")
    }
  }


  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen vlido (JPG, PNG)")
      return
    }

    // Validar tamao (mximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Mximo 5MB permitido.")
      return
    }

    setUploadingImage(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview((prev) => {
          if (prev.startsWith("blob:")) {
            URL.revokeObjectURL(prev)
          }
          return URL.createObjectURL(file)
        })
        setNewLibraryImage((prev) => ({ ...prev, dataUrl: result }))
        setUploadingImage(false)
      }
      reader.onerror = () => {
        alert("Error al cargar la imagen")
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error al procesar la imagen:", error)
      alert("Error al procesar la imagen")
      setUploadingImage(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administracion</h1>
              <p className="text-gray-600">Gestiona tu tienda Apple de manera eficiente</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Cerrar Sesion
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="installments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cuotas
              </TabsTrigger>
              <TabsTrigger value="dollar" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Dolar
              </TabsTrigger>
              <TabsTrigger value="trade-in" className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Canje
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuracion
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                  <Button
                    type="button"
                    variant={conditionFilter === "nuevo" ? "default" : "outline"}
                    className={`h-8 rounded-full px-3 text-xs ${
                      conditionFilter === "nuevo"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "border-gray-200 text-gray-700"
                    }`}
                    onClick={() => setConditionFilter((prev) => (prev === "nuevo" ? null : "nuevo"))}
                  >
                    Nuevo
                  </Button>
                  <Button
                    type="button"
                    variant={conditionFilter === "seminuevo" ? "default" : "outline"}
                    className={`h-8 rounded-full px-3 text-xs ${
                      conditionFilter === "seminuevo"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "border-gray-200 text-gray-700"
                    }`}
                    onClick={() => setConditionFilter((prev) => (prev === "seminuevo" ? null : "seminuevo"))}
                  >
                    Seminuevo
                  </Button>
                  {outletEnabled && (
                    <Button
                      type="button"
                      variant={conditionFilter === "outlet" ? "default" : "outline"}
                      className={`h-8 rounded-full px-3 text-xs ${
                        conditionFilter === "outlet"
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "border-orange-100 text-orange-700"
                      }`}
                      onClick={() => setConditionFilter((prev) => (prev === "outlet" ? null : "outlet"))}
                    >
                      Outlet
                    </Button>
                  )}
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      onSubmit={async (productData) => {
                        const success = await addProduct(productData)
                        if (success) {
                          setIsAddProductOpen(false)
                          setProductsReloadToken((current) => current + 1)
                        }
                        return success
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando productos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <StorageImage
                          src={getProductListImageUrls(product.images[0]).thumbnail || "/placeholder.svg?height=300&width=300"}
                          optimizedSrc={getProductListImageUrls(product.images[0]).optimized || "/placeholder.svg?height=300&width=300"}
                          originalSrc={getProductListImageUrls(product.images[0]).original || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                          loading="lazy"
                          debugLabel={`AdminProduct:${product.id}`}
                        />
                        <div className="absolute top-2 left-2 flex gap-2">
                          {product.isOutlet ? (
                            <Badge className="bg-orange-500 text-white">Outlet</Badge>
                          ) : product.condition === "nuevo" ? (
                            <Badge className="bg-emerald-500 text-white">Nuevo</Badge>
                          ) : (
                            <Badge className="bg-blue-500 text-white">Seminuevo</Badge>
                          )}
                          {product.featured && <Badge className="bg-gray-900 text-white">Destacado</Badge>}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">
                              ${getDisplayPrice(product).toLocaleString("es-AR")}
                            </span>
                            <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => void handleOpenEditProduct(product.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent border-red-200"
                                disabled={deletingProductId === product.id}
                              >
                                {deletingProductId === product.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accion no se puede deshacer. El producto{" "}
                                  <span className="font-semibold text-gray-900">{product.name}</span> sera eliminado
                                  permanentemente de la base de datos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {productsError && !productsLoading && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {productsError}
                </div>
              )}

              {pagedProducts.length === 0 && !productsLoading && !productsError && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? "Intenta con otros terminos de busqueda" : "Agrega tu primer producto para comenzar"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddProductOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              )}
              {productsTotal > PRODUCTS_PAGE_SIZE && !productsLoading && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-sm text-gray-600">
                    Mostrando {(productsPage - 1) * PRODUCTS_PAGE_SIZE + 1}-
                    {Math.min(productsPage * PRODUCTS_PAGE_SIZE, productsTotal)} de {productsTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setProductsPage((current) => Math.max(1, current - 1))}
                      disabled={productsPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Pagina {productsPage} de {totalProductPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setProductsPage((current) => Math.min(totalProductPages, current + 1))}
                      disabled={productsPage >= totalProductPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-6 h-6 text-gray-600" />
                      Biblioteca de imagenes
                    </CardTitle>
                    <Button type="button" variant="outline" onClick={() => setIsLibrarySectionOpen((prev) => !prev)}>
                      {isLibrarySectionOpen ? "Ocultar biblioteca" : "Ver biblioteca"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="grid gap-4 md:grid-cols-4" onSubmit={handleAddLibraryImage}>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Categoria</label>
                      <Input
                        value={newLibraryImage.category}
                        onChange={(event) => setNewLibraryImage((prev) => ({ ...prev, category: event.target.value }))}
                        placeholder="Ej: iphone"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Titulo</label>
                      <Input
                        value={newLibraryImage.label}
                        onChange={(event) => setNewLibraryImage((prev) => ({ ...prev, label: event.target.value }))}
                        placeholder="Ej: iPhone 14 Pro Negro"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Seleccionar imagen</label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="flex-1"
                        />
                        {imagePreview && (
                          <div className="relative w-12 h-12 rounded border overflow-hidden">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                      {uploadingImage && <p className="text-sm text-blue-600">Procesando imagen...</p>}
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                      <Button
                        type="submit"
                        disabled={!newLibraryImage.dataUrl || uploadingImage || savingLibraryImage}
                        className="self-end"
                      >
                        {uploadingImage
                          ? "Procesando..."
                          : savingLibraryImage
                            ? "Guardando..."
                            : "Agregar imagen"}
                      </Button>
                    </div>
                  </form>

                  {!isLibrarySectionOpen ? (
                    <p className="text-sm text-gray-500">
                      La carga directa queda disponible siempre. La grilla de imagenes existentes solo se abre bajo demanda.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Imagenes disponibles</p>
                            <p className="text-xs text-gray-500">
                              Elige una imagen para los productos desde el formulario de carga.
                            </p>
                          </div>
                          {imageLibrary.length > 0 && (
                            <Select
                              value={libraryCategoryFilter}
                              onValueChange={(value) => setLibraryCategoryFilter(value)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar por categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todos">Todas las categorias</SelectItem>
                                {imageLibraryCategories.map((category) => (
                                  <SelectItem key={category} value={category} className="capitalize">
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        {imageLibraryLoading ? (
                          <p className="text-sm text-gray-500">Cargando imagenes...</p>
                        ) : imageLibraryTotal === 0 ? (
                          <p className="text-sm text-gray-500">
                            Todavia no cargaste imagenes. Usa el formulario superior para agregar la primera.
                          </p>
                        ) : filteredLibraryImages.length === 0 ? (
                          <p className="text-sm text-gray-500">No hay imagenes para la categoria seleccionada.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredLibraryImages.map((image) => (
                              <div
                                key={image.id}
                                className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col gap-2"
                              >
                                <div className="relative h-28 w-full overflow-hidden rounded-md bg-gray-100">
                                  <StorageImage
                                    src={getAdminLibraryImageUrls(image.url).thumbnail || "/placeholder.svg"}
                                    optimizedSrc={getAdminLibraryImageUrls(image.url).optimized || "/placeholder.svg"}
                                    originalSrc={getAdminLibraryImageUrls(image.url).original || "/placeholder.svg"}
                                    alt={image.label}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    loading="lazy"
                                    debugLabel={`AdminLibrary:${image.id}`}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{image.label}</p>
                                  <p className="text-xs text-gray-500 capitalize">{image.category}</p>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveLibraryImage(image.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {imageLibraryTotal > IMAGE_LIBRARY_PAGE_SIZE && (
                          <div className="flex items-center justify-between gap-4 pt-2">
                            <p className="text-sm text-gray-600">
                              Mostrando {(libraryPage - 1) * IMAGE_LIBRARY_PAGE_SIZE + 1}-{Math.min(libraryPage * IMAGE_LIBRARY_PAGE_SIZE, imageLibraryTotal)} de {imageLibraryTotal}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setLibraryPage((current) => Math.max(1, current - 1))}
                                disabled={libraryPage === 1 || imageLibraryLoading}
                              >
                                Anterior
                              </Button>
                              <span className="text-sm text-gray-600">
                                Pagina {libraryPage} de {totalLibraryPages}
                              </span>
                              <Button
                                variant="outline"
                                onClick={() => setLibraryPage((current) => Math.min(totalLibraryPages, current + 1))}
                                disabled={libraryPage >= totalLibraryPages || imageLibraryLoading}
                              >
                                Siguiente
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Installments Tab */}
            <TabsContent value="installments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Financiacion</h2>
                  <p className="text-gray-600">Carga medios de pago y promociones con una estructura simple.</p>
                </div>
                <Dialog open={isAddInstallmentOpen} onOpenChange={setIsAddInstallmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Agregar plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant={installmentCategory === "visa-mastercard" ? "default" : "outline"}
                          onClick={() => setInstallmentCategory("visa-mastercard")}
                          className="flex-1"
                        >
                          Visa/Mastercard
                        </Button>
                        <Button
                          variant={installmentCategory === "naranja" ? "default" : "outline"}
                          onClick={() => setInstallmentCategory("naranja")}
                          className="flex-1"
                        >
                          Naranja
                        </Button>
                      </div>
                      <InstallmentForm
                        category={installmentCategory}
                        onSubmit={(data: InstallmentFormData) => {
                          addInstallmentPlan(data)
                          setIsAddInstallmentOpen(false)
                        }}
                        onCancel={() => setIsAddInstallmentOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-slate-900">Planes base</h3>
                  <p className="mt-1 text-sm text-slate-600">Define en segundos cuántos pagos ofreces y qué factor aplica.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-2">
                  {[
                    {
                      category: "visa-mastercard" as const,
                      label: "Visa / MasterCard",
                      accent: "bg-blue-500",
                      plans: visaMastercardPlans,
                    },
                    {
                      category: "naranja" as const,
                      label: "Otros medios",
                      accent: "bg-orange-500",
                      plans: naranjaPlans,
                    },
                  ].map((section) => (
                    <div key={section.category} className="rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${section.accent}`} />
                          <div>
                            <p className="font-semibold text-slate-900">{section.label}</p>
                            <p className="text-xs text-slate-500">Tipo de plan: cuotas fijas</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInstallmentCategory(section.category)
                            setIsAddInstallmentOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar
                        </Button>
                      </div>

                      {section.plans.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-medium">Pagos</th>
                                <th className="px-4 py-3 font-medium">Factor</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {section.plans.map((plan) => (
                                <tr key={plan.id} className="align-middle">
                                  <td className="px-4 py-3 font-medium text-slate-900">{plan.months}</td>
                                  <td className="px-4 py-3 text-slate-700">{formatFactorValue(plan.interestRate)}</td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        plan.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {plan.isActive ? "Activo" : "Pausado"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" size="sm" onClick={() => setEditingInstallment(plan)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          addInstallmentPlan({
                                            months: plan.months,
                                            interestRate: plan.interestRate,
                                            isActive: plan.isActive,
                                            category: plan.category,
                                          })
                                        }
                                      >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => deleteInstallmentPlan(plan.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center text-slate-500">
                          <CreditCard className="h-10 w-10 text-slate-300" />
                          <p className="text-sm">Aun no cargaste planes para este medio.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Installment Dialog */}
              {editingInstallment && (
                <Dialog open={!!editingInstallment} onOpenChange={() => setEditingInstallment(null)}>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Editar plan</DialogTitle>
                    </DialogHeader>
                    <InstallmentForm
                      category={editingInstallment.category}
                      plan={editingInstallment}
                      onSubmit={(data: InstallmentFormData) => {
                        updateInstallmentPlan(editingInstallment.id, data)
                        setEditingInstallment(null)
                      }}
                      onCancel={() => setEditingInstallment(null)}
                    />
                  </DialogContent>
                </Dialog>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Promociones por banco o tarjeta</h3>
                    <p className="text-sm text-slate-600">Carga campañas temporales con una tabla simple y planes editables.</p>
                  </div>
                  <Dialog open={isAddPromotionOpen} onOpenChange={setIsAddPromotionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva promocion
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Crear promocion</DialogTitle>
                      </DialogHeader>
                      <InstallmentPromotionForm
                        onSubmit={(data: InstallmentPromotionFormData) => {
                          addInstallmentPromotion(data)
                          setIsAddPromotionOpen(false)
                        }}
                        onCancel={() => setIsAddPromotionOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="px-5 py-5">
                  {installmentPromotions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Nombre</th>
                            <th className="px-4 py-3 font-medium">Planes</th>
                            <th className="px-4 py-3 font-medium">Vigencia</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 font-medium text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {installmentPromotions.map((promotion) => (
                            <tr key={promotion.id} className="align-top">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-900">{promotion.name}</p>
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                <div className="space-y-1">
                                  {promotion.terms.map((term) => (
                                    <p key={term.id}>
                                      {term.months} pagos · factor {formatFactorValue(term.interestRate)}
                                    </p>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {formatPromotionRange(promotion.startDate, promotion.endDate)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => updateInstallmentPromotion(promotion.id, { isActive: !promotion.isActive })}
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    promotion.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {promotion.isActive ? "Activa" : "Pausada"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="bg-white" onClick={() => setEditingPromotion(promotion)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    onClick={() => deleteInstallmentPromotion(promotion.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-slate-600">
                      <p className="text-sm">Todavia no agregaste promociones temporales.</p>
                      <Button
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        onClick={() => setIsAddPromotionOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar promocion
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {editingPromotion && (
                <Dialog
                  open={!!editingPromotion}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setEditingPromotion(null)
                    }
                  }}
                >
                    <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Editar promocion</DialogTitle>
                    </DialogHeader>
                    <InstallmentPromotionForm
                      promotion={{
                        name: editingPromotion.name,
                        terms: editingPromotion.terms,
                        startDate: editingPromotion.startDate,
                        endDate: editingPromotion.endDate,
                        isActive: editingPromotion.isActive,
                      }}
                      onSubmit={(data: InstallmentPromotionFormData) => {
                        updateInstallmentPromotion(editingPromotion.id, data)
                        setEditingPromotion(null)
                      }}
                      onCancel={() => setEditingPromotion(null)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            {/* Dollar Tab */}
            <TabsContent value="dollar" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Configuracion del Dolar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-xl border border-green-100 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Cotizacion actual (API)</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${dollarRate ? dollarRate.blue.toLocaleString("es-AR") : "---"}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Ultima actualizacion:{" "}
                        {dollarRate?.lastUpdate ? new Date(dollarRate.lastUpdate).toLocaleString("es-AR") : "sin datos"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {dollarRate?.source && (
                        <Badge variant="outline" className="text-xs">
                          {dollarRate.source}
                        </Badge>
                      )}
                      <Button onClick={handleUpdateDollarRate} size="sm" variant="outline" disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Actualizando..." : "Actualizar"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Markup (Pesos)</label>
                      <Input
                        type="number"
                        step="1"
                        value={markupInput}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          setMarkupInput(nextValue)
                          const parsed = toNumericInputValue(nextValue)
                          if (parsed !== "") {
                            updateDollarConfig({ markup: parsed })
                          }
                        }}
                        onBlur={() => {
                          const parsed = toNumericInputValue(markupInput)
                          if (parsed === "") {
                            setMarkupInput(String(dollarConfig.markup))
                          }
                        }}
                        placeholder="Ej: 50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dolar Final</label>
                      <Input
                        type="number"
                        value={finalDollarValue}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Informacion</h4>
                    <p className="text-sm text-blue-800">
                      El dolar final es el precio que se usara para convertir los precios en USD a pesos argentinos. Se
                      calcula como: Cotizacion de la API + Markup en Pesos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trade-in Tab */}
            <TabsContent value="trade-in" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6 text-gray-600" />
                    Tabla de canje
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Actualiza los valores de toma en USD segun capacidad y estado.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {tradeInForm.sections.map((section) => {
                    const totalColumns =
                      1 + section.storageColumns.reduce((acc, column) => acc + column.conditions.length, 0)

                    return (
                      <div key={section.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-xs text-gray-500">Define los montos estimados para cada capacidad y estado.</p>
                          </div>
                          <Dialog
                            open={tradeInRowDialog.sectionId === section.id}
                            onOpenChange={(isOpen) => {
                              if (isOpen) {
                                setTradeInRowDialog({ sectionId: section.id, label: "", error: null })
                              } else if (tradeInRowDialog.sectionId === section.id) {
                                closeTradeInRowDialog()
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button type="button" size="sm" variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Agregar modelo
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Agregar modelo</DialogTitle>
                              </DialogHeader>
                              <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  handleAddTradeInRow()
                                }}
                              >
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Nombre del modelo</label>
                                  <Input
                                    autoFocus
                                    value={tradeInRowDialog.sectionId === section.id ? tradeInRowDialog.label : ""}
                                    onChange={(event) =>
                                      setTradeInRowDialog((prev) => ({
                                        sectionId: section.id,
                                        label: event.target.value,
                                        error: null,
                                      }))
                                    }
                                    placeholder="Ej: iPhone 14 Pro"
                                  />
                                  {tradeInRowDialog.sectionId === section.id && tradeInRowDialog.error && (
                                    <p className="text-xs text-red-600">{tradeInRowDialog.error}</p>
                                  )}
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={closeTradeInRowDialog}>
                                    Cancelar
                                  </Button>
                                  <Button type="submit">Agregar</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 text-sm">
                            <thead>
                              <tr className="bg-emerald-100 text-gray-900">
                                <th rowSpan={2} className="border border-gray-200 px-3 py-2 text-left font-semibold">
                                  Modelo
                                </th>
                                {section.storageColumns.map((column) => (
                                  <th
                                    key={`${section.id}-${column.id}`}
                                    colSpan={column.conditions.length}
                                    className="border border-gray-200 px-3 py-2 text-center font-semibold uppercase"
                                  >
                                    {column.label}
                                  </th>
                                ))}
                              </tr>
                              <tr className="bg-amber-100 text-gray-800">
                                {section.storageColumns.flatMap((column) =>
                                  column.conditions.map((condition) => (
                                    <th
                                      key={`${section.id}-${column.id}-${condition.id}`}
                                      className="border border-gray-200 px-2 py-1 text-center text-xs font-semibold uppercase"
                                    >
                                      {condition.label}
                                    </th>
                                  )),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {section.rows.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={totalColumns}
                                    className="border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500"
                                  >
                                    No hay modelos configurados en esta seccion.
                                  </td>
                                </tr>
                              ) : (
                                section.rows.map((row, rowIndex) => (
                                  <tr key={row.id} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={row.label}
                                          onChange={(event) =>
                                            handleTradeInRowLabelChange(section.id, row.id, event.target.value)
                                          }
                                          placeholder="Nombre del modelo"
                                          className="h-9 w-full min-w-[160px]"
                                        />
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="ghost"
                                              className="text-red-600 hover:text-red-700"
                                              aria-label={`Eliminar ${row.label}`}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Eliminar modelo?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Esta accion quitara <span className="font-semibold">{row.label}</span> de la tabla de canje.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleRemoveTradeInRow(section.id, row.id)}>
                                                Eliminar
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </td>
                                    {section.storageColumns.flatMap((column) => {
                                      const storageId = column.id as TradeInStorageId
                                      return column.conditions.map((condition) => {
                                        const conditionId = condition.id as TradeInConditionId
                                        const currentValue = row.values[storageId][conditionId]
                                        return (
                                          <td key={`${row.id}-${storageId}-${conditionId}`} className="border border-gray-200 px-2 py-2">
                                            <Input
                                              type="number"
                                              min="0"
                                              step="10"
                                              placeholder="---"
                                              value={currentValue ?? ""}
                                              onChange={(event) =>
                                                handleTradeInValueChange(
                                                  section.id,
                                                  row.id,
                                                  storageId,
                                                  conditionId,
                                                  event.target.value,
                                                )
                                              }
                                              className="h-9 text-center text-sm"
                                            />
                                          </td>
                                        )
                                      })
                                    })}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={handleSaveTradeInConfig} disabled={savingTradeInConfig} className="sm:w-auto">
                      {savingTradeInConfig ? "Guardando..." : "Guardar valores"}
                    </Button>
                    <p className="text-xs text-gray-500">
                      Ultima actualizacion: {formattedTradeInUpdatedAt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Configuracion de la portada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[3fr,2fr]">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">WhatsApp (solo numeros)</label>
                        <Input
                          value={homeForm.whatsappNumber}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, whatsappNumber: event.target.value }))}
                          placeholder="54911..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Ttulo plan canje</label>
                        <Input
                          value={homeForm.tradeInTitle}
                          onChange={(event) => {
                            const value = event.target.value
                            setHomeForm((prev) => ({
                              ...prev,
                              tradeInTitle: value,
                              sections: prev.sections.map((section) =>
                                section.id === "trade-in"
                                  ? { ...section, label: value.trim().length > 0 ? value : "Plan canje" }
                                  : section,
                              ),
                            }))
                          }}
                          placeholder="Ej: Plan canje premium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descripcin plan canje</label>
                        <Textarea
                          value={homeForm.tradeInSubtitle}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, tradeInSubtitle: event.target.value }))}
                          rows={3}
                          placeholder="Explica cmo funciona el canje para tus clientes"
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Button onClick={handleSaveHomeConfig} disabled={savingHomeConfig}>
                          {savingHomeConfig ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <p className="text-xs text-gray-500">Los cambios se aplican de inmediato en la portada.</p>
                      </div>
                    </div>
                  <div className="space-y-5">
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-4 py-3">
                          <h4 className="text-sm font-semibold text-gray-800">Secciones visibles</h4>
                          <p className="mt-1 text-xs text-gray-500">
                            Activa o desactiva los bloques que aparecen en la portada principal.
                          </p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {homeForm.sections.map((section, index) => {
                            const isFirst = index === 0
                            const isLast = index === homeForm.sections.length - 1
                            return (
                              <div key={section.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-gray-700"
                                    onClick={() => handleMoveSection(section.id, "up")}
                                    disabled={isFirst}
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-gray-700"
                                    onClick={() => handleMoveSection(section.id, "down")}
                                    disabled={isLast}
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-1 items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{section.label}</p>
                                    <p className="text-xs text-gray-500">
                                      {section.enabled ? "Visible en la home" : "Oculto en la home"}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={section.enabled}
                                    onCheckedChange={(value) => handleSectionToggle(section.id, value)}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={editingProductOpen}
        onOpenChange={(open) => {
          setEditingProductOpen(open)
          if (!open) {
            setEditingProductDetail(null)
            setEditingProductId(null)
            setEditingProductLoading(false)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {editingProductLoading || !editingProductDetail || !editingProductId ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando detalle del producto...</span>
            </div>
          ) : (
              <ProductForm
              initialData={editingProductDetail}
              onSubmit={async (productData) => {
                const success = await updateProduct(editingProductId, productData)
                if (success) {
                  setEditingProductOpen(false)
                  setEditingProductDetail(null)
                  setEditingProductId(null)
                  setProductsReloadToken((current) => current + 1)
                }
                return success
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
