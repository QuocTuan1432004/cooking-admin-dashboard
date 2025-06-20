"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { createIngredient } from "@/hooks/RecipeApi/ingredientsApi"
import type { Ingredient, IngredientsCreationRequest } from "@/hooks/RecipeApi/recipeTypes"

interface IngredientAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ingredient: Ingredient) => void
}

export function IngredientAddModal({ isOpen, onClose, onSave }: IngredientAddModalProps) {
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [unit, setUnit] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const units = [
    { value: "g", label: "g (gram)" },
    { value: "kg", label: "kg (kilogram)" },
    { value: "ml", label: "ml (mililít)" },
    { value: "l", label: "l (lít)" },
    { value: "muỗng canh", label: "muỗng canh" },
    { value: "muỗng cà phê", label: "muỗng cà phê" },
    { value: "củ", label: "củ" },
    { value: "quả", label: "quả" },
    { value: "con", label: "con" },
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Tên nguyên liệu không được để trống"
    }

    if (!calories.trim()) {
      newErrors.calories = "Số calo không được để trống"
    } else if (isNaN(Number(calories)) || Number(calories) < 0) {
      newErrors.calories = "Số calo phải là số dương"
    }

    if (!unit) {
      newErrors.unit = "Vui lòng chọn đơn vị tính"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const ingredientData: IngredientsCreationRequest = {
        ingredientName: name.trim(),
        caloriesPerUnit: calories.trim(),
        measurementUnit: unit.trim(),
      }

      const response = await createIngredient(ingredientData)
      onSave(response)

      // Reset form và đóng modal
      setName("")
      setCalories("")
      setUnit("")
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error creating ingredient:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo nguyên liệu' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setCalories("")
    setUnit("")
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "name") {
      setName(value)
    } else if (field === "calories") {
      setCalories(value)
    } else if (field === "unit") {
      setUnit(value)
    }

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Thêm nguyên liệu mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tên nguyên liệu */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`mt-2 ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
              placeholder="VD: Thịt heo, Cà chua, Hành tây..."
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Grid cho Calories và Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số calo */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Số calo <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={calories}
                onChange={(e) => handleInputChange("calories", e.target.value)}
                className={`mt-2 ${errors.calories ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                placeholder="250"
                disabled={isLoading}
              />
              {errors.calories && <p className="text-red-500 text-sm mt-1">{errors.calories}</p>}
            </div>

            {/* Đơn vị tính */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Đơn vị tính <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={unit} 
                onValueChange={(value) => handleInputChange("unit", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={`mt-2 ${errors.unit ? "border-red-500" : "border-gray-300"}`}>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unitOption) => (
                    <SelectItem key={unitOption.value} value={unitOption.value}>
                      {unitOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              💡 Hướng dẫn
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Tên nguyên liệu:</strong> Nên rõ ràng và dễ hiểu</li>
              <li>• <strong>Số calo:</strong> Tính theo đơn vị đã chọn</li>
              <li>• <strong>Đơn vị tính:</strong> Chọn đơn vị phù hợp với nguyên liệu</li>
            </ul>
          </div>

          {/* Hiển thị lỗi khi submit */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">❌ {errors.submit}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}