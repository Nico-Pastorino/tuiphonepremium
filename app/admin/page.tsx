"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  CreditCard,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  Calculator,
} from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { useProducts } from "@/contexts/ProductContext"
import { useDollarRate } from "@/hooks/use-dollar-rate"

export default function AdminPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts()
  const { dollarRate, loading: dollarLoading, refresh } = useDollarRate()
  const [activeTab, setActiveTab] = useState("productos")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Configuración de cuotas
  const [installmentConfig, setInstallmentConfig] = useState({
    naranja: {
      3: 0,
      6: 15,
      9: 25,
      12: 35,
    },
    tarjetas: {
      3: 0,
      6: 20,
      9: 30,
      12: 40,
    },
  })

  // Configuración del dólar
  const [dollarConfig, setDollarConfig] = useState({
    markup: 50, // Markup sobre el dólar blue
    autoUpdate: true,
  })

  const handleAddProduct = async (productData: any) => {
    const success = await addProduct(productData)
    if (success) {
      setShowAddForm(false)
    }
    return success
  }

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return false
    const success = await updateProduct(editingProduct.id, productData)
    if (success) {
      setEditingProduct(null)
    }
    return success
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      await deleteProduct(id)
    }
  }

  const calculatePesoPrice = (usdPrice: number) => {
    if (!dollarRate || !usdPrice) return 0
    return Math.round(usdPrice * (dollarRate.blue + dollarConfig.markup))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona productos, cuotas y configuración del dólar</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="productos" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="cuotas" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Cuotas
            </TabsTrigger>
            <TabsTrigger value="dolar" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Dólar
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Productos Tab */}
          <TabsContent value="productos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gestión de Productos</h2>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar Producto
              </Button>
            </div>

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nuevo Producto</CardTitle>
                  <CardDescription>
                    Solo ingresa el precio en USD, el precio en pesos se calculará automáticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm onSubmit={handleAddProduct} />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {editingProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Producto</CardTitle>
                  <CardDescription>
                    Modifica el precio en USD, el precio en pesos se actualizará automáticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm onSubmit={handleUpdateProduct} initialData={editingProduct} isEditing={true} />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setEditingProduct(null)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay productos. Agrega tu primer producto.</div>
              ) : (
                products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-gray-600 mt-1">{product.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge variant={product.condition === "nuevo" ? "default" : "secondary"}>
                              {product.condition}
                            </Badge>
                            {product.featured && <Badge variant="destructive">Destacado</Badge>}
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="text-2xl font-bold">${product.price.toLocaleString()} ARS</div>
                            {product.priceUSD && <div className="text-lg text-green-600">${product.priceUSD} USD</div>}
                            {product.priceUSD && dollarRate && (
                              <div className="text-sm text-gray-500">
                                Calculado: ${product.priceUSD} × ${(dollarRate.blue + dollarConfig.markup).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Cuotas Tab */}
          <TabsContent value="cuotas" className="space-y-6">
            <h2 className="text-2xl font-semibold">Configuración de Cuotas</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <CreditCard className="w-5 h-5" />
                    Naranja
                  </CardTitle>
                  <CardDescription>Configurar tasas de interés para Naranja</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(installmentConfig.naranja).map(([cuotas, interes]) => (
                    <div key={cuotas} className="flex items-center justify-between">
                      <Label>{cuotas} cuotas</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={interes}
                          onChange={(e) =>
                            setInstallmentConfig((prev) => ({
                              ...prev,
                              naranja: {
                                ...prev.naranja,
                                [cuotas]: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <CreditCard className="w-5 h-5" />
                    Tarjetas
                  </CardTitle>
                  <CardDescription>Configurar tasas de interés para Tarjetas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(installmentConfig.tarjetas).map(([cuotas, interes]) => (
                    <div key={cuotas} className="flex items-center justify-between">
                      <Label>{cuotas} cuotas</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={interes}
                          onChange={(e) =>
                            setInstallmentConfig((prev) => ({
                              ...prev,
                              tarjetas: {
                                ...prev.tarjetas,
                                [cuotas]: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dólar Tab */}
          <TabsContent value="dolar" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Configuración del Dólar</h2>
              <Button onClick={refresh} disabled={dollarLoading} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${dollarLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Cotización Actual
                  </CardTitle>
                  <CardDescription>La API se actualiza automáticamente cada 5 minutos</CardDescription>
                </CardHeader>
                <CardContent>
                  {dollarLoading ? (
                    <div className="text-center py-4">Cargando cotización...</div>
                  ) : dollarRate ? (
                    <div className="space-y-4">
                      <div className="text-3xl font-bold text-blue-600">${dollarRate.blue.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        Última actualización: {new Date(dollarRate.lastUpdate).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Fuente: {dollarRate.source}</div>
                    </div>
                  ) : (
                    <div className="text-red-500">Error al cargar cotización</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Configuración de Precios
                  </CardTitle>
                  <CardDescription>Los precios en pesos se calculan automáticamente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="markup">Markup sobre dólar blue</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="markup"
                        type="number"
                        value={dollarConfig.markup}
                        onChange={(e) =>
                          setDollarConfig((prev) => ({
                            ...prev,
                            markup: Number(e.target.value),
                          }))
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">pesos</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Fórmula de cálculo:</div>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                      Precio ARS = Precio USD × (Dólar Blue + Markup)
                    </div>
                    {dollarRate && (
                      <div className="text-sm text-gray-600">
                        Ejemplo: $100 USD × ${(dollarRate.blue + dollarConfig.markup).toFixed(2)} = $
                        {calculatePesoPrice(100).toLocaleString()} ARS
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuración Tab */}
          <TabsContent value="configuracion" className="space-y-6">
            <h2 className="text-2xl font-semibold">Configuración General</h2>

            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajustes generales de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Actualización automática del dólar</Label>
                    <p className="text-sm text-gray-500">Actualizar cotización cada 5 minutos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dollarConfig.autoUpdate}
                    onChange={(e) =>
                      setDollarConfig((prev) => ({
                        ...prev,
                        autoUpdate: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                </div>

                <Separator />

                <div>
                  <Label>Información del sistema</Label>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>Total de productos: {products.length}</div>
                    <div>Productos destacados: {products.filter((p) => p.featured).length}</div>
                    <div>Última actualización: {new Date().toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
