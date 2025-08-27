"use client"

import { useState } from "react"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { AdminLogin } from "@/components/AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    logout,
  } = useAdmin()
  const { dollarRate, refresh: refreshDollarRate, loading, error } = useDollarRate()

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddInstallmentOpen, setIsAddInstallmentOpen] = useState(false)
  const [installmentCategory, setInstallmentCategory] = useState<"visa-mastercard" | "naranja">("visa-mastercard")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingInstallment, setEditingInstallment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // Estadísticas
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.featured || p.condition === "nuevo").length
  const featuredProducts = products.filter((p) => p.featured).length
  const totalValue = products.reduce((sum, product) => sum + product.price, 0) / products.length || 0
  const activeInstallments = installmentPlans.filter((p) => p.isActive).length

  // Obtener planes por categoría
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

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona tu tienda Apple de manera eficiente</p>
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
              <TabsTrigger value="installments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cuotas
              </TabsTrigger>
              <TabsTrigger value="dollar" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Dólar
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
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">${product.price.toLocaleString("es-AR")}</span>
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
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El producto "{product.name}" será eliminado
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

            {/* Installments Tab */}
            <TabsContent value="installments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Cuotas</h2>
                  <p className="text-gray-600">Configura los planes de financiación disponibles</p>
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
                        onUpdate={updateInstallmentPlan}
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
                        onUpdate={updateInstallmentPlan}
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
                    Configuración del Dólar
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    La API del dólar blue se actualiza automáticamente cada 5 minutos
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dólar Blue Base</label>
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
                      <label className="text-sm font-medium">Dólar Final</label>
                      <Input
                        type="number"
                        value={(dollarConfig.blueRate + dollarConfig.markup).toFixed(2)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Información</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      La API del dólar blue se actualiza automáticamente cada 5 minutos. Los precios en pesos se
                      calculan multiplicando el precio en USD por la cotización configurada.
                    </p>
                    <p className="text-sm text-blue-800">
                      Fórmula: Precio en Pesos = Precio USD × (Dólar Blue Base + Markup)
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
                    Configuración General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Configuración</h3>
                    <p>Las opciones de configuración estarán disponibles próximamente.</p>
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
