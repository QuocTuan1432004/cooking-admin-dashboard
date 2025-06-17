"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, Check } from "lucide-react"
import type { Ingredient } from "@/hooks/RecipeApi/recipeTypes"

interface SelectedIngredient {
  ingredient: Ingredient
  quantity: string
  unit: string
}

interface IngredientSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (ingredientText: string) => void
  ingredients: Ingredient[]
}

export function IngredientSelectModal({ isOpen, onClose, onSelect, ingredients }: IngredientSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])

  // Filter ingredients based on search term
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => ingredient.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [ingredients, searchTerm])

  const handleAddIngredient = (ingredient: Ingredient) => {
    const exists = selectedIngredients.find((item) => item.ingredient.id === ingredient.id)
    if (!exists) {
      setSelectedIngredients([
        ...selectedIngredients,
        {
          ingredient,
          quantity: "",
          unit: "g",
        },
      ])
    }
  }

  const handleRemoveIngredient = (ingredientId: string | number) => {
    setSelectedIngredients(selectedIngredients.filter((item) => item.ingredient.id !== ingredientId))
  }

  const handleQuantityChange = (ingredientId: string | number, quantity: string) => {
    setSelectedIngredients(
      selectedIngredients.map((item) => (item.ingredient.id === ingredientId ? { ...item, quantity } : item)),
    )
  }

  const handleUnitChange = (ingredientId: string | number, unit: string) => {
    setSelectedIngredients(
      selectedIngredients.map((item) => (item.ingredient.id === ingredientId ? { ...item, unit } : item)),
    )
  }

  const handleConfirm = () => {
    const validIngredients = selectedIngredients.filter((item) => item.quantity.trim())

    validIngredients.forEach((item) => {
      const ingredientText = `${item.quantity}${item.unit} ${item.ingredient.ingredientName}`
      onSelect(ingredientText)
    })

    // Reset state
    setSelectedIngredients([])
    setSearchTerm("")
    onClose()
  }

  const handleCancel = () => {
    setSelectedIngredients([])
    setSearchTerm("")
    onClose()
  }

  const isIngredientSelected = (ingredientId: string | number) => {
    return selectedIngredients.some((item) => item.ingredient.id === ingredientId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chọn nguyên liệu</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600"
                disabled={selectedIngredients.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Xác nhận ({selectedIngredients.filter((item) => item.quantity.trim()).length})
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <Label className="text-sm font-medium">Tìm kiếm nguyên liệu</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                placeholder="Nhập tên nguyên liệu..."
              />
            </div>
          </div>

          {/* Available Ingredients */}
          <div>
            <Label className="text-sm font-medium">Nguyên liệu có sẵn</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
              {filteredIngredients.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{ingredient.ingredientName}</span>
                        <span className="text-sm text-gray-500 ml-2">({ingredient.caloriesPerUnit} calo/100g)</span>
                      </div>
                      <Button
                        size="sm"
                        variant={isIngredientSelected(ingredient.id) ? "secondary" : "outline"}
                        onClick={() => handleAddIngredient(ingredient)}
                        disabled={isIngredientSelected(ingredient.id)}
                      >
                        {isIngredientSelected(ingredient.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "Không tìm thấy nguyên liệu nào" : "Danh sách nguyên liệu trống"}
                </div>
              )}
            </div>
          </div>

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Nguyên liệu đã chọn</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {selectedIngredients.map((item) => (
                  <div key={item.ingredient.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1">
                      <span className="font-medium">{item.ingredient.ingredientName}</span>
                      <span className="text-sm text-gray-500 ml-1">({item.ingredient.caloriesPerUnit} calo/100g)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.ingredient.id, e.target.value)}
                        className="w-20"
                        placeholder="Số lượng"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleUnitChange(item.ingredient.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="muỗng canh">muỗng canh</option>
                        <option value="muỗng cà phê">muỗng cà phê</option>
                        <option value="củ">củ</option>
                        <option value="quả">quả</option>
                        <option value="con">con</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveIngredient(item.ingredient.id)}
                        className="text-red-600"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tìm kiếm và chọn nguyên liệu từ danh sách có sẵn</li>
              <li>• Nhập số lượng và chọn đơn vị cho từng nguyên liệu</li>
              <li>• Click "Xác nhận" để thêm tất cả nguyên liệu đã chọn vào công thức</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
