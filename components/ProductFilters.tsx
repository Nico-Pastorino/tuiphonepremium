"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Tablet, Laptop, Watch, Headphones, Filter } from "lucide-react"
import { useState } from "react"

interface ProductFiltersProps {
  onFilterChange?: (filters: any) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)

  const categories = [
    { id: "iphone", name: "iPhone", icon: Smartphone, color: "from-blue-500 to-purple-600" },
    { id: "ipad", name: "iPad", icon: Tablet, color: "from-purple-500 to-pink-600" },
    { id: "mac", name: "Mac", icon: Laptop, color: "from-gray-600 to-gray-800" },
    { id: "watch", name: "Apple Watch", icon: Watch, color: "from-red-500 to-orange-600" },
    { id: "airpods", name: "AirPods", icon: Headphones, color: "from-green-500 to-teal-600" },
  ]

  const conditions = [
    { id: "nuevo", name: "Nuevos", color: "bg-blue-500" },
    { id: "seminuevo", name: "Seminuevos", color: "bg-emerald-500" },
  ]

  return (
    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Filtrar productos</h3>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col items-center gap-2 rounded-2xl transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => {
                  const newCategory = activeCategory === category.id ? null : category.id
                  setActiveCategory(newCategory)
                  onFilterChange?.({ category: newCategory, condition: activeCondition })
                }}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeCategory === category.id ? "bg-white/20" : `bg-gradient-to-br ${category.color}`
                  }`}
                >
                  <category.icon
                    className={`w-4 h-4 ${activeCategory === category.id ? "text-white" : "text-white"}`}
                  />
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Estado</h4>
          <div className="flex gap-3">
            {conditions.map((condition) => (
              <Button
                key={condition.id}
                variant={activeCondition === condition.id ? "default" : "outline"}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeCondition === condition.id
                    ? `${condition.color} text-white shadow-lg`
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => {
                  const newCondition = activeCondition === condition.id ? null : condition.id
                  setActiveCondition(newCondition)
                  onFilterChange?.({ category: activeCategory, condition: newCondition })
                }}
              >
                {condition.name}
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
                {categories.find((c) => c.id === activeCategory)?.name} ×
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
                {conditions.find((c) => c.id === activeCondition)?.name} ×
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
