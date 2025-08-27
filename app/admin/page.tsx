"use client"

import type React from "react"

import { useState } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AdminLogin } from "@/components/AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useDollarRate } from "@/hooks/use-dollar-rate"
import Image from "next/image"
import type { Product } from "@/types/product"
import { Trash2, Edit, Plus, RefreshCw, DollarSign, Settings, Package, CreditCard } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
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
    getInstallmentPlansByCategory,
    logout,
  } = useAdmin()
  const { dollarRate, refresh: refreshDollarRate, loading, error } = useDollarRate()

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // Formulario de producto
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    priceUSD: "",
    category: "",
    condition: "nuevo",
    images: [] as string[],
    featured: false,
  })

  const [newImage, setNewImage] = useState("")

  // Obtener planes por categoría
  const visaMastercardPlans = getInstallmentPlansByCategory("visa-mastercard")
  const naranjaPlans = getInstallmentPlansByCategory("naranja")

  // Filtrar productos
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculatePesoPrice = (usdPrice: number) => {
    if (!dollarRate || !usdPrice) return 0
    return Math.round(usdPrice * (dollarRate.blue + dollarConfig.markup))
  }

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm.name || !productForm.priceUSD || !productForm.category) return

    const usdPrice = Number.parseFloat(productForm.priceUSD)
    const pesoPrice = calculatePesoPrice(usdPrice)

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: pesoPrice,
      priceUSD: usdPrice,
      category: productForm.category,
      condition: productForm.condition,
      images: productForm.images,
      specifications: {},
      featured: productForm.featured,
    }

    const success = await addProduct(productData)
    if (success) {
      setIsAddProductOpen(false)
      setProductForm({
        name: "",
        description: "",
        priceUSD: "",
        category: "",
        condition: "nuevo",
        images: [],
        featured: false,
      })
      setNewImage("")
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !productForm.name || !productForm.priceUSD || !productForm.category) return

    const usdPrice = Number.parseFloat(productForm.priceUSD)
    const pesoPrice = calculatePesoPrice(usdPrice)

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: pesoPrice,
      priceUSD: usdPrice,
      category: productForm.category,
      condition: productForm.condition,
      images: productForm.images,
      specifications: editingProduct.specifications,
      featured: productForm.featured,
    }

    const success = await updateProduct(editingProduct.id, productData)
    if (success) {
      setEditingProduct(null)
      setProductForm({
        name: "",
        description: "",
        priceUSD: "",
        category: "",
        condition: "nuevo",
        images: [],
        featured: false,
      })
      setNewImage("")
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      priceUSD: product.priceUSD?.toString() || "",
      category: product.category,
      condition: product.condition,
      images: product.images || [],
      featured: product.featured || false,
    })
  }

  const addImage = () => {
    if (newImage.trim()) {
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }))
      setNewImage("")
    }
  }

  const removeImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addInstallmentPlanSimple = (category: "visa-mastercard" | "naranja", months: number, rate: number) => {
    const planData = {
      months,
      interestRate: rate,
      name: `${months} cuotas ${category === "naranja" ? "Naranja" : "Tarjetas"}`,
      description: `Plan de ${months} cuotas con ${rate}% de interés`,
      isActive: true,
      minAmount: 0,
      maxAmount: 10000000,
      category,
    }
    addInstallmentPlan(planData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona tu tienda de manera simple y eficiente</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Cerrar Sesión
            </Button>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="dollar" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Dólar
              </TabsTrigger>
              <TabsTrigger value="installments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cuotas
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre del producto *</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="iPhone 15 Pro Max"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Categoría *</Label>
                          <Select
                            value={productForm.category}
                            onValueChange={(value) => setProductForm((prev) => ({ ...prev, category: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iphone">iPhone</SelectItem>
                              <SelectItem value="ipad">iPad</SelectItem>
                              <SelectItem value="mac">Mac</SelectItem>
                              <SelectItem value="watch">Apple Watch</SelectItem>
                              <SelectItem value="airpods">AirPods</SelectItem>
                              <SelectItem value="accesorios">Accesorios</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del producto..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priceUSD">Precio en USD *</Label>
                          <Input
                            id="priceUSD"
                            type="number"
                            step="0.01"
                            value={productForm.priceUSD}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, priceUSD: e.target.value }))}
                            placeholder="999.99"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Precio calculado en ARS</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-lg font-semibold">
                              $
                              {calculatePesoPrice(Number.parseFloat(productForm.priceUSD) || 0).toLocaleString("es-AR")}
                            </div>
                            <p className="text-xs text-gray-500">
                              {dollarRate
                                ? `${productForm.priceUSD} × (${dollarRate.blue} + ${dollarConfig.markup})`
                                : "Esperando cotización..."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="condition">Estado</Label>
                          <Select
                            value={productForm.condition}
                            onValueChange={(value) => setProductForm((prev) => ({ ...prev, condition: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nuevo">Nuevo</SelectItem>
                              <SelectItem value="seminuevo">Seminuevo</SelectItem>
                              <SelectItem value="usado">Usado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, featured: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor="featured">Producto destacado</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Imágenes</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="URL de la imagen"
                            className="flex-1"
                          />
                          <Button type="button" onClick={addImage} disabled={!newImage.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {productForm.images.length > 0 && (
                          <div className="space-y-1">
                            {productForm.images.map((image, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <span className="flex-1 text-sm truncate">{image}</span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Agregar Producto</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Edit Product Dialog */}
              {editingProduct && (
                <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Producto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditProduct} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nombre del producto *</Label>
                          <Input
                            id="edit-name"
                            value={productForm.name}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="iPhone 15 Pro Max"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Categoría *</Label>
                          <Select
                            value={productForm.category}
                            onValueChange={(value) => setProductForm((prev) => ({ ...prev, category: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iphone">iPhone</SelectItem>
                              <SelectItem value="ipad">iPad</SelectItem>
                              <SelectItem value="mac">Mac</SelectItem>
                              <SelectItem value="watch">Apple Watch</SelectItem>
                              <SelectItem value="airpods">AirPods</SelectItem>
                              <SelectItem value="accesorios">Accesorios</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                          id="edit-description"
                          value={productForm.description}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del producto..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-priceUSD">Precio en USD *</Label>
                          <Input
                            id="edit-priceUSD"
                            type="number"
                            step="0.01"
                            value={productForm.priceUSD}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, priceUSD: e.target.value }))}
                            placeholder="999.99"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Precio calculado en ARS</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-lg font-semibold">
                              $
                              {calculatePesoPrice(Number.parseFloat(productForm.priceUSD) || 0).toLocaleString("es-AR")}
                            </div>
                            <p className="text-xs text-gray-500">
                              {dollarRate
                                ? `${productForm.priceUSD} × (${dollarRate.blue} + ${dollarConfig.markup})`
                                : "Esperando cotización..."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-condition">Estado</Label>
                          <Select
                            value={productForm.condition}
                            onValueChange={(value) => setProductForm((prev) => ({ ...prev, condition: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nuevo">Nuevo</SelectItem>
                              <SelectItem value="seminuevo">Seminuevo</SelectItem>
                              <SelectItem value="usado">Usado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <input
                            type="checkbox"
                            id="edit-featured"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, featured: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor="edit-featured">Producto destacado</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Imágenes</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="URL de la imagen"
                            className="flex-1"
                          />
                          <Button type="button" onClick={addImage} disabled={!newImage.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {productForm.images.length > 0 && (
                          <div className="space-y-1">
                            {productForm.images.map((image, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <span className="flex-1 text-sm truncate">{image}</span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Actualizar Producto</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

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
                      <div className="relative aspect-square">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          fill
                          className="object-cover"
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
                          <div className="space-y-1">
                            <div className="text-xl font-bold">${product.price.toLocaleString("es-AR")} ARS</div>
                            {product.priceUSD && <div className="text-sm text-green-600">USD ${product.priceUSD}</div>}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => openEditDialog(product)}
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
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El producto "{product.name}" será eliminado
                                  permanentemente.
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
                    {searchTerm ? "Intenta con otros términos de búsqueda" : "Agrega tu primer producto para comenzar"}
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
            </TabsContent>

            {/* Dollar Tab */}
            <TabsContent value="dollar" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      Configuración del Dólar
                    </div>
                    <Button onClick={handleUpdateDollarRate} size="sm" variant="outline" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Actualizando..." : "Actualizar"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-700 mb-1 font-medium">Dólar Blue (API)</p>
                      <p className="text-3xl font-bold text-blue-800">
                        ${dollarRate?.blue?.toLocaleString("es-AR") || "---"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Se actualiza cada 5 min</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-sm text-green-700 mb-1 font-medium">Tu Markup</p>
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          value={dollarConfig.markup}
                          onChange={(e) => updateDollarConfig({ markup: Number(e.target.value) })}
                          className="w-20 text-center text-2xl font-bold border-0 bg-transparent"
                        />
                      </div>
                      <p className="text-xs text-green-600 mt-1">Pesos adicionales</p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-sm text-purple-700 mb-1 font-medium">Precio Final</p>
                      <p className="text-3xl font-bold text-purple-800">
                        ${dollarRate ? (dollarRate.blue + dollarConfig.markup).toLocaleString("es-AR") : "---"}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Para calcular precios</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">¿Cómo funciona?</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Los precios en pesos se calculan automáticamente usando esta fórmula:
                    </p>
                    <div className="bg-white p-3 rounded border font-mono text-sm">
                      Precio ARS = Precio USD × (Dólar Blue + Tu Markup)
                    </div>
                    {dollarRate && (
                      <p className="text-sm text-gray-600 mt-2">
                        Ejemplo: $100 USD = ${calculatePesoPrice(100).toLocaleString("es-AR")} ARS
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm text-red-700">Error: {error.message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Installments Tab */}
            <TabsContent value="installments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuración de Cuotas</h2>
                  <p className="text-gray-600">Configura las tasas de interés para cada tipo de tarjeta</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tarjetas Plans */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <CreditCard className="w-5 h-5" />
                      Tarjetas (Visa/Mastercard)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[3, 6, 9, 12].map((months) => {
                      const plan = visaMastercardPlans.find((p) => p.months === months)
                      return (
                        <div key={months} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">{months} cuotas</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={plan?.interestRate || 0}
                              onChange={(e) => {
                                const rate = Number(e.target.value)
                                if (plan) {
                                  updateInstallmentPlan(plan.id, { interestRate: rate })
                                } else {
                                  addInstallmentPlanSimple("visa-mastercard", months, rate)
                                }
                              }}
                              className="w-20 text-center"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Naranja Plans */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <CreditCard className="w-5 h-5" />
                      Naranja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[3, 6, 9, 12].map((months) => {
                      const plan = naranjaPlans.find((p) => p.months === months)
                      return (
                        <div key={months} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium">{months} cuotas</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={plan?.interestRate || 0}
                              onChange={(e) => {
                                const rate = Number(e.target.value)
                                if (plan) {
                                  updateInstallmentPlan(plan.id, { interestRate: rate })
                                } else {
                                  addInstallmentPlanSimple("naranja", months, rate)
                                }
                              }}
                              className="w-20 text-center"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Configuración General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                          <div className="text-sm text-gray-600">Total de productos</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {products.filter((p) => p.featured).length}
                          </div>
                          <div className="text-sm text-gray-600">Productos destacados</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {installmentPlans.filter((p) => p.isActive).length}
                          </div>
                          <div className="text-sm text-gray-600">Planes de cuotas activos</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Configuración de la Tienda</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Actualización automática del dólar</div>
                            <div className="text-sm text-gray-600">La API se actualiza cada 5 minutos</div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Activo
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Cálculo automático de precios</div>
                            <div className="text-sm text-gray-600">Los precios en ARS se calculan automáticamente</div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Activo
                          </Badge>
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
