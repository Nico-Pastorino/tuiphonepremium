"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Tablet, Laptop, Watch, Headphones, Filter, Cable } from "lucide-react"
import { useEffect, useState } from "react"

interface ProductFiltersProps {
  onFilterChange?: (filters: { category: string | null; condition: string | null; search?: string | null }) => void
  category?: string | null
  condition?: string | null
}

export function ProductFilters({ onFilterChange, category = null, condition = null }: ProductFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(category)
  const [activeCondition, setActiveCondition] = useState<string | null>(condition)

  useEffect(() => {
    setActiveCategory(category)
  }, [category])

  useEffect(() => {
    setActiveCondition(condition)
  }, [condition])

  const categories = [
    { id: "iphone", name: "iPhone", icon: Smartphone, color: "from-blue-500 to-purple-600" },
    { id: "ipad", name: "iPad", icon: Tablet, color: "from-purple-500 to-pink-600" },
    { id: "mac", name: "Mac", icon: Laptop, color: "from-gray-600 to-gray-800" },
    { id: "watch", name: "Apple Watch", icon: Watch, color: "from-red-500 to-orange-600" },
    { id: "airpods", name: "AirPods", icon: Headphones, color: "from-green-500 to-teal-600" },
    { id: "accesorios", name: "Accesorios", icon: Cable, color: "from-yellow-500 to-orange-600" },
  ]

  const conditions = [
    { id: "nuevo", name: "Nuevos", color: "bg-blue-500" },
    { id: "seminuevo", name: "Seminuevos", color: "bg-emerald-500" },
  ]

  return (
    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Filtrar productos</h3>
        </div>

        {/* Conditions */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Estado</h4>
          <div className="flex flex-col gap-3">
            {conditions.map((conditionOption) => (
              <Button
                key={conditionOption.id}
                variant={activeCondition === conditionOption.id ? "default" : "outline"}
                className={`w-full justify-start rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 sm:text-base ${
                  activeCondition === conditionOption.id
                    ? `${conditionOption.color} text-white shadow-lg`
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => {
                  const newCondition = activeCondition === conditionOption.id ? null : conditionOption.id
                  setActiveCondition(newCondition)
                  onFilterChange?.({ category: activeCategory, condition: newCondition })
                }}
              >
                {conditionOption.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h4>
          <div className="grid grid-cols-1 gap-3">
            {categories.map((categoryOption) => (
              <Button
                key={categoryOption.id}
                variant={activeCategory === categoryOption.id ? "default" : "outline"}
                className={`flex w-full items-center justify-start gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                  activeCategory === categoryOption.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => {
                  const newCategory = activeCategory === categoryOption.id ? null : categoryOption.id
                  setActiveCategory(newCategory)
                  onFilterChange?.({ category: newCategory, condition: activeCondition })
                }}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center p-1 ${
                    activeCategory === categoryOption.id ? "bg-white/20" : `bg-gradient-to-br ${categoryOption.color}`
                  }`}
                >
                  <categoryOption.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-left sm:text-base">{categoryOption.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Active filters */}
        {(activeCategory || activeCondition) && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-600">Filtros activos:</span>
            {activeCategory && (
              <Badge
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                onClick={() => {
                  setActiveCategory(null)
                  onFilterChange?.({ category: null, condition: activeCondition })
                }}
              >
                {categories.find((c) => c.id === activeCategory)?.name} x
              </Badge>
            )}
            {activeCondition && (
              <Badge
                className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                onClick={() => {
                  setActiveCondition(null)
                  onFilterChange?.({ category: activeCategory, condition: null })
                }}
              >
                {conditions.find((c) => c.id === activeCondition)?.name} x
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}




