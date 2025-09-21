"use client"
import type { FormEvent } from "react"
import type React from "react"

import { useEffect, useMemo, useState, useCallback } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AdminLogin } from "@/components/AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import type { HomeConfig } from "@/contexts/AdminContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"
import Image from "next/image"
import type { Product } from "@/types/product"
import { ProductForm } from "@/components/product-form"
import { InstallmentForm, type InstallmentFormData } from "@/components/installment-form"
import { InstallmentPlanCard } from "@/components/installment-plan-card"
import { Trash2, Edit, Plus, RefreshCw, DollarSign, Settings, Package, CreditCard } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}

function cloneHomeConfig(config: HomeConfig) {
  return {
    ...config,
    sections: config.sections.map((section) => ({ ...section })),
  }
}

function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, loading: productsLoading } = useProducts()
  const {
    installmentPlans,
    addInstallmentPlan,
    updateInstallmentPlan,
    deleteInstallmentPlan,
    dollarConfig,
    updateDollarConfig,
    getEffectiveDollarRate,
    getInstallmentPlansByCategory,
    imageLibrary,
    addImageToLibrary,
    removeImageFromLibrary,
    homeConfig,
    updateHomeConfig,
    updateHomeSection,
    logout,
  } = useAdmin()
  const effectiveAdminRate = getEffectiveDollarRate()
  const { dollarRate, refresh: refreshDollarRate, loading, error } = useDollarRate()

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddInstallmentOpen, setIsAddInstallmentOpen] = useState(false)
  const [installmentCategory, setInstallmentCategory] = useState<"visa-mastercard" | "naranja">("visa-mastercard")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingInstallment, setEditingInstallment] = useState<any>(null)
  const [newLibraryImage, setNewLibraryImage] = useState({ label: "", category: "", url: "" })
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [homeForm, setHomeForm] = useState(() => cloneHomeConfig(homeConfig))
  const [savingHomeConfig, setSavingHomeConfig] = useState(false)

  useEffect(() => {
    setHomeForm(cloneHomeConfig(homeConfig))
  }, [homeConfig]) // Dependencias específicas en lugar del objeto completo

  const computeDisplayPrice = (product: Product) => {
    if (product.priceUSD !== undefined && product.priceUSD !== null && effectiveAdminRate) {
      return Number((product.priceUSD * effectiveAdminRate).toFixed(2))
    }
    return product.price
  }

  // Obtener planes por categoria
  const visaMastercardPlans = getInstallmentPlansByCategory("visa-mastercard")
  const naranjaPlans = getInstallmentPlansByCategory("naranja")

  // Filtrar productos
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUpdateDollarRate = async () => {
    if (dollarRate) {
      updateDollarConfig({
        blueRate: dollarRate.blue,
        lastUpdated: new Date().toISOString(),
      })
    }
    await refreshDollarRate()
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId)
    try {
      const success = await deleteProduct(productId)
      if (success) {
        console.log("Producto eliminado exitosamente")
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    } finally {
      setDeletingProductId(null)
    }
  }

  const imageLibraryCategories = useMemo(() => {
    const categories = new Set(imageLibrary.map((item) => item.category || "general"))
    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [imageLibrary])

  const filteredLibraryImages = useMemo(() => {
    if (libraryCategoryFilter === "todos") {
      return imageLibrary
    }
    return imageLibrary.filter((item) => item.category === libraryCategoryFilter)
  }, [imageLibrary, libraryCategoryFilter])

  const handleAddLibraryImage = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const label = newLibraryImage.label.trim()
      const category = newLibraryImage.category.trim() || "general"
      const url = newLibraryImage.url.trim()
      if (!url) {
        return
      }
      addImageToLibrary({
        label: label || "Imagen",
        category,
        url,
      })
      setNewLibraryImage({ label: "", category, url: "" })
      setImagePreview("")
      setLibraryCategoryFilter(category)
    },
    [newLibraryImage, addImageToLibrary],
  )

  const handleRemoveLibraryImage = (id: string) => {
    removeImageFromLibrary(id)
  }

  const handleSectionToggle = (id: (typeof homeConfig.sections)[number]["id"], enabled: boolean) => {
    setHomeForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === id ? { ...section, enabled } : section)),
    }))
    updateHomeSection(id, { enabled })
  }

  const handleSaveHomeConfig = () => {
    setSavingHomeConfig(true)
    try {
      updateHomeConfig({
        heroImage: homeForm.heroImage,
        heroHeadline: homeForm.heroHeadline,
        heroSubheadline: homeForm.heroSubheadline,
        promoMessage: homeForm.promoMessage,
        whatsappNumber: homeForm.whatsappNumber,
      })
      console.log("Configuracion de la portada actualizada")
    } finally {
      setSavingHomeConfig(false)
    }
  }

  const heroPreview = homeForm.heroImage?.trim() ? homeForm.heroImage : "/hero-iphone-orange.jpg"

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG)")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 5MB permitido.")
      return
    }

    setUploadingImage(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setNewLibraryImage((prev) => ({ ...prev, url: result }))
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

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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
                        if (success) setIsAddProductOpen(false)
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
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-2 left-2 flex gap-2">
                          {product.featured && <Badge className="bg-gray-900 text-white">Destacado</Badge>}
                          <Badge variant={product.condition === "nuevo" ? "default" : "secondary"}>
                            {product.condition}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">
                              ${computeDisplayPrice(product).toLocaleString("es-AR")}
                            </span>
                            <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Producto</DialogTitle>
                              </DialogHeader>
                              <ProductForm
                                initialData={product}
                                onSubmit={async (productData) => {
                                  const success = await updateProduct(product.id, productData)
                                  return success
                                }}
                              />
                            </DialogContent>
                          </Dialog>

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
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Â¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accion no se puede deshacer. El producto "{product.name}" sera eliminado
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

              {filteredProducts.length === 0 && !productsLoading && (
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
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Biblioteca de imagenes
                  </CardTitle>
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
                      <Button type="submit" disabled={!newLibraryImage.url || uploadingImage} className="self-end">
                        {uploadingImage ? "Procesando..." : "Agregar imagen"}
                      </Button>
                    </div>
                  </form>

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
                    {imageLibrary.length === 0 ? (
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
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt={image.label}
                                fill
                                className="object-cover"
                                sizes="200px"
                                unoptimized
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Installments Tab */}
            <TabsContent value="installments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion de Cuotas</h2>
                  <p className="text-gray-600">Configura los planes de financiacion disponibles</p>
                </div>
                <Dialog open={isAddInstallmentOpen} onOpenChange={setIsAddInstallmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Plan de Cuotas</DialogTitle>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visa/Mastercard Plans */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    Planes Visa/Mastercard
                  </h3>
                  <div className="space-y-4">
                    {visaMastercardPlans.map((plan) => (
                      <InstallmentPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={setEditingInstallment}
                        onDelete={deleteInstallmentPlan}
                      />
                    ))}
                    {visaMastercardPlans.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay planes configurados</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Naranja Plans */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    Planes Naranja
                  </h3>
                  <div className="space-y-4">
                    {naranjaPlans.map((plan) => (
                      <InstallmentPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={setEditingInstallment}
                        onDelete={deleteInstallmentPlan}
                      />
                    ))}
                    {naranjaPlans.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay planes configurados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Installment Dialog */}
              {editingInstallment && (
                <Dialog open={!!editingInstallment} onOpenChange={() => setEditingInstallment(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Plan de Cuotas</DialogTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dolar Blue Base</label>
                      <Input
                        type="number"
                        value={dollarConfig.blueRate}
                        onChange={(e) => updateDollarConfig({ blueRate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Markup (Pesos)</label>
                      <Input
                        type="number"
                        step="1"
                        value={dollarConfig.markup}
                        onChange={(e) => updateDollarConfig({ markup: Number(e.target.value) })}
                        placeholder="Ej: 50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dolar Final</label>
                      <Input
                        type="number"
                        value={(dollarConfig.blueRate + dollarConfig.markup).toFixed(2)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Informacion</h4>
                    <p className="text-sm text-blue-800">
                      El dolar final es el precio que se usara para convertir los precios en USD a pesos argentinos. Se
                      calcula como: Dolar Blue Base + Markup en Pesos
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
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Titulo principal</label>
                        <Input
                          value={homeForm.heroHeadline}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, heroHeadline: event.target.value }))}
                          placeholder="Ej: Productos Apple premium en Argentina"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subtitulo</label>
                        <Textarea
                          value={homeForm.heroSubheadline}
                          onChange={(event) =>
                            setHomeForm((prev) => ({ ...prev, heroSubheadline: event.target.value }))
                          }
                          rows={3}
                          placeholder="Describe la propuesta de valor de la portada"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mensaje promocional</label>
                        <Input
                          value={homeForm.promoMessage}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, promoMessage: event.target.value }))}
                          placeholder="Ej: Envios rapidos y garantia incluida"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Imagen de portada (URL)</label>
                        <Input
                          value={homeForm.heroImage}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, heroImage: event.target.value }))}
                          placeholder="/hero-iphone-orange.jpg"
                        />
                        <p className="text-xs text-gray-500">
                          Usa rutas internas (comenzando con /) o una URL completa. La imagen se muestra con
                          optimizacion desactivada.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">WhatsApp (solo numeros)</label>
                        <Input
                          value={homeForm.whatsappNumber}
                          onChange={(event) => setHomeForm((prev) => ({ ...prev, whatsappNumber: event.target.value }))}
                          placeholder="54911..."
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Button onClick={handleSaveHomeConfig} disabled={savingHomeConfig}>
                          {savingHomeConfig ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <p className="text-xs text-gray-500">Los cambios se aplican de inmediato en la portada.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        <Image
                          src={heroPreview || "/placeholder.svg"}
                          alt="Vista previa de la portada"
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800">Secciones visibles</h4>
                        <div className="space-y-3">
                          {homeForm.sections.map((section) => (
                            <div
                              key={section.id}
                              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                            >
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
                          ))}
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
    </div>
  )
}
