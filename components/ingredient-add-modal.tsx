"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [isLoading, setIsLoading] = useState(false) // Thêm loading state
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      }

      // Gọi API tạo ingredient
      const response = await createIngredient(ingredientData)
      
      // Gọi callback với ingredient vừa tạo từ response
      onSave(response)

      // Reset form và đóng modal
      setName("")
      setCalories("")
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
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "name") {
      setName(value)
    } else if (field === "calories") {
      setCalories(value)
    }

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Thêm nguyên liệu mới</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
              placeholder="VD: Thịt heo, Cà chua, Hành tây..."
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">
              Số calo (trên 100g) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={calories}
              onChange={(e) => handleInputChange("calories", e.target.value)}
              className={`mt-1 ${errors.calories ? "border-red-500" : ""}`}
              placeholder="VD: 250"
              disabled={isLoading}
            />
            {errors.calories && <p className="text-red-500 text-sm mt-1">{errors.calories}</p>}
            <p className="text-gray-500 text-xs mt-1">Nhập số calo trên 100g nguyên liệu</p>
          </div>

          {/* Hiển thị lỗi khi submit */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tên nguyên liệu nên rõ ràng và dễ hiểu</li>
              <li>• Số calo được tính trên 100g nguyên liệu</li>
              <li>• Thông tin này sẽ được sử dụng để tính toán dinh dưỡng</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}