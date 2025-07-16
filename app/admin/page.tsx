"use client"

import { useState } from "react"
import { EnhancedNavbar } from "@/components/EnhancedNavbar"
import { AdminLogin } from "@/components/AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useDollarRate } from "@/hooks/use-dollar-rate"
import Image from "next/image"
import type { Product } from "@/types/product"
import { ProductForm } from "@/components/product-form"
import { InstallmentForm } from "@/components/installment-form"
import { InstallmentPlanCard } from "@/components/installment-plan-card"

export default function AdminPage() {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
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

  // Estadísticas
  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const featuredProducts = products.filter((p) => p.featured).length
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar />

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
              {/* LogOut icon */}
              Cerrar Sesión
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="installments">Cuotas</TabsTrigger>
              <TabsTrigger value="dollar">Dólar</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Productos</p>
                        <p className="text-3xl font-bold">{totalProducts}</p>
                      </div>
                      {/* Package icon */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Stock Total</p>
                        <p className="text-3xl font-bold">{totalStock}</p>
                      </div>
                      {/* TrendingUp icon */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Destacados</p>
                        <p className="text-3xl font-bold">{featuredProducts}</p>
                      </div>
                      {/* Users icon */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Valor Total</p>
                        <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(1)}M</p>
                      </div>
                      {/* DollarSign icon */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Planes Activos</p>
                        <p className="text-3xl font-bold">{activeInstallments}</p>
                      </div>
                      {/* CreditCard icon */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dollar Rate Card */}
              <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* DollarSign icon */}
                      Cotización del Dólar en Tiempo Real
                    </div>
                    <div className="flex items-center gap-2">
                      {dollarRate?.source && (
                        <Badge variant="outline" className="text-xs">
                          {dollarRate.source}
                        </Badge>
                      )}
                      <Button onClick={handleUpdateDollarRate} size="sm" variant="outline" disabled={loading}>
                        {/* RefreshCw icon */}
                        {loading ? "Actualizando..." : "Actualizar"}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-100 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700 mb-1 font-medium">Dólar Blue (API)</p>
                      <p className="text-3xl font-bold text-blue-800">
                        ${dollarRate?.blue?.toLocaleString("es-AR") || "---"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Venta</p>
                    </div>

                    <div className="text-center p-4 bg-gray-100 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700 mb-1 font-medium">Dólar Oficial</p>
                      <p className="text-3xl font-bold text-gray-800">
                        ${dollarRate?.official?.toLocaleString("es-AR") || "---"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Referencia</p>
                    </div>

                    <div className="text-center p-4 bg-green-100 rounded-xl border border-green-200">
                      <p className="text-sm text-green-700 mb-1 font-medium">Configurado</p>
                      <p className="text-3xl font-bold text-green-800">
                        ${dollarConfig.blueRate.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Tu precio base</p>
                    </div>

                    <div className="text-center p-4 bg-purple-100 rounded-xl border border-purple-200">
                      <p className="text-sm text-purple-700 mb-1 font-medium">Final (+{dollarConfig.markup}%)</p>
                      <p className="text-3xl font-bold text-purple-800">
                        ${getEffectiveDollarRate().toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Precio de venta</p>
                    </div>
                  </div>

                  {/* Diferencia y recomendaciones */}
                  {dollarRate && dollarRate.blue !== dollarConfig.blueRate && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        {/* AlertTriangle icon */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-800 mb-1">Diferencia detectada</h4>
                          <p className="text-sm text-yellow-700 mb-2">
                            Tu cotización configurada (${dollarConfig.blueRate}) difiere de la cotización actual ($
                            {dollarRate.blue}). Diferencia: $
                            {Math.abs(dollarRate.blue - dollarConfig.blueRate).toLocaleString("es-AR")}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => updateDollarConfig({ blueRate: dollarRate.blue })}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Actualizar a ${dollarRate.blue}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última actualización API:</span>
                        <span className="font-medium">
                          {dollarRate?.lastUpdate
                            ? new Date(dollarRate.lastUpdate).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "No disponible"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuente de datos:</span>
                        <span className="font-medium">{dollarRate?.source || "No disponible"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tu configuración:</span>
                        <span className="font-medium">
                          {new Date(dollarConfig.lastUpdated).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brecha Blue/Oficial:</span>
                        <span className="font-medium text-red-600">
                          {dollarRate
                            ? `${(((dollarRate.blue - dollarRate.official) / dollarRate.official) * 100).toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {/* AlertTriangle icon */}
                        <span className="text-sm text-red-700">Error al obtener cotización: {error.message}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                            <Image
                              src={product.images[0] || "/placeholder.svg?height=48&width=48"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                              {product.category} • {product.condition}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${product.price.toLocaleString("es-AR")}</p>
                          <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      {/* Plus icon */}
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      onSubmit={(productData) => {
                        addProduct(productData)
                        setIsAddProductOpen(false)
                      }}
                      onCancel={() => setIsAddProductOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        {product.featured && <Badge className="bg-yellow-500">Destacado</Badge>}
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
                          <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              {/* Edit icon */}
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                              product={product}
                              onSubmit={(productData) => {
                                updateProduct(product.id, productData)
                              }}
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              {/* Trash2 icon */}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700"
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
            </TabsContent>

            {/* Installments Tab - NUEVA ESTRUCTURA CON DOS CATEGORÍAS */}
            <TabsContent value="installments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Planes de Cuotas</h2>
                  <p className="text-gray-600">Gestiona los planes de financiación por tipo de tarjeta</p>
                </div>
              </div>

              {/* Tabs para las dos categorías */}
              <Tabs defaultValue="visa-mastercard" className="space-y-6">
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="visa-mastercard" className="flex items-center gap-2">
                      {/* CreditCard icon */}
                      Visa/Mastercard
                    </TabsTrigger>
                    <TabsTrigger value="naranja" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      Naranja
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Visa/Mastercard Plans */}
                <TabsContent value="visa-mastercard" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Planes Visa/Mastercard</h3>
                      <p className="text-gray-600">
                        {visaMastercardPlans.filter((p) => p.isActive).length} planes activos de{" "}
                        {visaMastercardPlans.length} totales
                      </p>
                    </div>
                    <Dialog
                      open={isAddInstallmentOpen && installmentCategory === "visa-mastercard"}
                      onOpenChange={(open) => {
                        setIsAddInstallmentOpen(open)
                        if (open) setInstallmentCategory("visa-mastercard")
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          {/* Plus icon */}
                          Agregar Plan Visa/Mastercard
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar Plan Visa/Mastercard</DialogTitle>
                        </DialogHeader>
                        <InstallmentForm
                          category="visa-mastercard"
                          onSubmit={(planData) => {
                            addInstallmentPlan({ ...planData, category: "visa-mastercard" })
                            setIsAddInstallmentOpen(false)
                          }}
                          onCancel={() => setIsAddInstallmentOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visaMastercardPlans.map((plan) => (
                      <InstallmentPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={(plan) => {
                          setEditingInstallment(plan)
                        }}
                        onDelete={(id) => deleteInstallmentPlan(id)}
                        onUpdate={(id, data) => updateInstallmentPlan(id, data)}
                      />
                    ))}
                  </div>
                </TabsContent>

                {/* Naranja Plans */}
                <TabsContent value="naranja" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Planes Tarjeta Naranja</h3>
                      <p className="text-gray-600">
                        {naranjaPlans.filter((p) => p.isActive).length} planes activos de {naranjaPlans.length} totales
                      </p>
                    </div>
                    <Dialog
                      open={isAddInstallmentOpen && installmentCategory === "naranja"}
                      onOpenChange={(open) => {
                        setIsAddInstallmentOpen(open)
                        if (open) setInstallmentCategory("naranja")
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          {/* Plus icon */}
                          Agregar Plan Naranja
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar Plan Tarjeta Naranja</DialogTitle>
                        </DialogHeader>
                        <InstallmentForm
                          category="naranja"
                          onSubmit={(planData) => {
                            addInstallmentPlan({ ...planData, category: "naranja" })
                            setIsAddInstallmentOpen(false)
                          }}
                          onCancel={() => setIsAddInstallmentOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {naranjaPlans.map((plan) => (
                      <InstallmentPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={(plan) => {
                          setEditingInstallment(plan)
                        }}
                        onDelete={(id) => deleteInstallmentPlan(id)}
                        onUpdate={(id, data) => updateInstallmentPlan(id, data)}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Dollar Tab */}
            <TabsContent value="dollar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* DollarSign icon */}
                    Configuración del Dólar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* API Status */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900">Estado de la API</h3>
                      <Button onClick={handleUpdateDollarRate} size="sm" variant="outline" disabled={loading}>
                        {/* RefreshCw icon */}
                        {loading ? "Actualizando..." : "Actualizar"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Dólar Blue (API)</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${dollarRate?.blue?.toLocaleString("es-AR") || "---"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Dólar Oficial</p>
                        <p className="text-2xl font-bold text-gray-600">
                          ${dollarRate?.official?.toLocaleString("es-AR") || "---"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Brecha</p>
                        <p className="text-2xl font-bold text-red-600">
                          {dollarRate
                            ? `${(((dollarRate.blue - dollarRate.official) / dollarRate.official) * 100).toFixed(1)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-blue-700">
                      <p>
                        <strong>Fuente:</strong> {dollarRate?.source || "No disponible"}
                      </p>
                      <p>
                        <strong>Última actualización:</strong>{" "}
                        {dollarRate?.lastUpdate
                          ? new Date(dollarRate.lastUpdate).toLocaleString("es-AR")
                          : "No disponible"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="blueRate">Cotización Dólar Blue</Label>
                        <div className="flex gap-2">
                          <Input
                            id="blueRate"
                            type="number"
                            value={dollarConfig.blueRate}
                            onChange={(e) => updateDollarConfig({ blueRate: Number.parseFloat(e.target.value) || 0 })}
                            placeholder="1000"
                          />
                          {dollarRate && (
                            <Button
                              onClick={() => updateDollarConfig({ blueRate: dollarRate.blue })}
                              variant="outline"
                              title="Usar cotización actual de la API"
                            >
                              Usar API
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Cotización actual de la API: ${dollarRate?.blue?.toLocaleString("es-AR") || "---"}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="markup">Markup (%)</Label>
                        <Input
                          id="markup"
                          type="number"
                          step="0.1"
                          value={dollarConfig.markup}
                          onChange={(e) => updateDollarConfig({ markup: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="5"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Porcentaje de aumento sobre el dólar blue para tus precios
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoUpdate"
                          checked={dollarConfig.autoUpdate}
                          onCheckedChange={(checked) => updateDollarConfig({ autoUpdate: checked })}
                        />
                        <Label htmlFor="autoUpdate">Actualización automática cada 5 minutos</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-3">Vista Previa de Precios</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Dólar Blue base:</span>
                            <span className="font-bold">${dollarConfig.blueRate.toLocaleString("es-AR")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Con Markup (+{dollarConfig.markup}%):</span>
                            <span className="font-bold text-green-600">
                              ${getEffectiveDollarRate().toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <hr className="my-2" />
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Ejemplos de precios:</strong>
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>USD $500 → ${(500 * getEffectiveDollarRate()).toLocaleString("es-AR")}</div>
                              <div>USD $1,000 → ${(1000 * getEffectiveDollarRate()).toLocaleString("es-AR")}</div>
                              <div>USD $1,500 → ${(1500 * getEffectiveDollarRate()).toLocaleString("es-AR")}</div>
                              <div>USD $2,000 → ${(2000 * getEffectiveDollarRate()).toLocaleString("es-AR")}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                          {/* AlertTriangle icon */}
                          <div>
                            <h4 className="font-semibold text-yellow-800">Importante</h4>
                            <p className="text-sm text-yellow-700">
                              Los cambios en la cotización afectarán todos los precios mostrados en la tienda. Se
                              recomienda revisar los precios después de cada actualización.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p>
                          <strong>Tu última actualización:</strong>
                        </p>
                        <p>{new Date(dollarConfig.lastUpdated).toLocaleString("es-AR")}</p>
                      </div>
                      <div>
                        <p>
                          <strong>Próxima actualización automática:</strong>
                        </p>
                        <p>{dollarConfig.autoUpdate ? "En 5 minutos" : "Deshabilitada"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* Settings icon */}
                    Configuración General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Información de la Tienda</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="storeName">Nombre de la tienda</Label>
                          <Input id="storeName" defaultValue="TuIphonepremium" />
                        </div>
                        <div>
                          <Label htmlFor="storeEmail">Email de contacto</Label>
                          <Input id="storeEmail" defaultValue="info@tuiphonepremium.com.ar" />
                        </div>
                        <div>
                          <Label htmlFor="storePhone">Teléfono</Label>
                          <Input id="storePhone" defaultValue="+54 9 11 1234-5678" />
                        </div>
                        <div>
                          <Label htmlFor="storeAddress">Dirección</Label>
                          <Input id="storeAddress" defaultValue="Buenos Aires, Argentina" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Configuración de Seguridad</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Contraseña actual</Label>
                          <Input id="currentPassword" type="password" placeholder="Ingresa tu contraseña actual" />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">Nueva contraseña</Label>
                          <Input id="newPassword" type="password" placeholder="Ingresa una nueva contraseña" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                          <Input id="confirmPassword" type="password" placeholder="Confirma la nueva contraseña" />
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">Cambiar Contraseña</Button>
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
