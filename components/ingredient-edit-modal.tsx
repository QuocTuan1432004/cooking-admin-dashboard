"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Save, X, Edit } from "lucide-react"
import type { Ingredient, IngredientsUpdateRequest } from "@/hooks/RecipeApi/recipeTypes"
import { getAllIngredients, updateIngredient } from "@/hooks/RecipeApi/ingredientsApi"

interface IngredientEditModalProps {
  isOpen: boolean
  onClose: () => void
  ingredients: string[]
  onSave: (updatedIngredients: string[]) => void
}

const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "muỗng canh",
  "muỗng cà phê",
  "chén",
  "bát",
  "củ",
  "quả",
  "lá",
  "cây",
  "miếng",
  "lát",
  "thìa",
  "tô",
  "lon",
  "chai",
]

export function IngredientEditModal({
  isOpen,
  onClose,
  ingredients,
  onSave,
}: IngredientEditModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [editingCalories, setEditingCalories] = useState("")
  const [editingUnit, setEditingUnit] = useState("")
  // Thêm state để lưu dữ liệu gốc
  const [originalData, setOriginalData] = useState<{
    ingredientName: string
    caloriesPerUnit: string
    measurementUnit: string
  } | null>(null)
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load all ingredients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadIngredients()
    }
  }, [isOpen])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, successMessage])

  const loadIngredients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllIngredients()
      setAllIngredients(data)
    } catch (error) {
      setError("Không thể tải danh sách nguyên liệu")
    } finally {
      setLoading(false)
    }
  }

  // Filter ingredients từ API data, không phải từ ingredients prop
  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return allIngredients
    return allIngredients.filter((ingredient) => 
      ingredient.ingredientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allIngredients, searchTerm])

  const handleStartEdit = (ingredient: Ingredient) => {
    setEditingIndex(allIngredients.findIndex(ing => ing.id === ingredient.id))
    setEditingText(ingredient.ingredientName)
    setEditingCalories(ingredient.caloriesPerUnit || "")
    setEditingUnit(ingredient.measurementUnit || "")
    
    // Lưu dữ liệu gốc để so sánh
    setOriginalData({
      ingredientName: ingredient.ingredientName,
      caloriesPerUnit: ingredient.caloriesPerUnit || "",
      measurementUnit: ingredient.measurementUnit || ""
    })
  }

  const handleSaveEdit = async () => {
    if (editingIndex !== null && editingText.trim() && originalData) {
      try {
        setUpdating(true)
        setError(null)
        setSuccessMessage(null)

        const ingredientToUpdate = allIngredients[editingIndex]
        
        if (ingredientToUpdate) {
          // Luôn gửi tất cả các field, nhưng field không thay đổi sẽ để rỗng
          const updateData: IngredientsUpdateRequest = {
            ingredientName: editingText.trim() !== originalData.ingredientName ? editingText.trim() : "",
            caloriesPerUnit: editingCalories !== originalData.caloriesPerUnit ? editingCalories : "",
            measurementUnit: editingUnit !== originalData.measurementUnit ? editingUnit : "",
          }
          
          // Update via API
          await updateIngredient(ingredientToUpdate.id, updateData)

          // Reload ingredients to get updated data
          await loadIngredients()

          // Kiểm tra xem có thay đổi nào không để hiển thị message
          const changedFields = []
          if (editingText.trim() !== originalData.ingredientName) changedFields.push("tên")
          if (editingCalories !== originalData.caloriesPerUnit) changedFields.push("calo")
          if (editingUnit !== originalData.measurementUnit) changedFields.push("đơn vị")

          if (changedFields.length > 0) {
            setSuccessMessage(`Cập nhật thành công (${changedFields.join(", ")})`)
          } else {
            setSuccessMessage("Không có thay đổi nào")
          }
        }

        setEditingIndex(null)
        setEditingText("")
        setEditingCalories("")
        setEditingUnit("")
        setOriginalData(null)
      } catch (error) {
        setError("Không thể cập nhật nguyên liệu")
      } finally {
        setUpdating(false)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingText("")
    setEditingCalories("")
    setEditingUnit("")
    setOriginalData(null)
  }

  const handleSave = () => {
    // Trả về danh sách ingredients đã được format
    const formattedIngredients = allIngredients.map(ing => 
      `${ing.caloriesPerUnit || 0}${ing.measurementUnit || ""} ${ing.ingredientName}`
    )
    onSave(formattedIngredients)
    onClose()
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingText("")
    setEditingCalories("")
    setEditingUnit("")
    setOriginalData(null)
    setSearchTerm("")
    setError(null)
    setSuccessMessage(null)
    onClose()
  }

  // Kiểm tra xem có thay đổi nào không
  const hasChanges = useMemo(() => {
    if (!originalData) return false
    
    return (
      editingText.trim() !== originalData.ingredientName ||
      editingCalories !== originalData.caloriesPerUnit ||
      editingUnit !== originalData.measurementUnit
    )
  }, [editingText, editingCalories, editingUnit, originalData])

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa nguyên liệu</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600"
                disabled={updating}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={updating}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* Search Bar */}
          <div>
            <Label className="text-sm font-medium">Tìm kiếm nguyên liệu</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                placeholder="Nhập tên nguyên liệu để tìm kiếm..."
                disabled={updating}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải nguyên liệu...</span>
            </div>
          )}

          {/* Ingredients List */}
          <div>
            <Label className="text-sm font-medium">
              Danh sách nguyên liệu từ API ({filteredIngredients.length})
            </Label>
            <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
              {filteredIngredients.length > 0 ? (
                <>
                  {/* Header */}
                  <div className="grid grid-cols-11 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Tên nguyên liệu</div>
                    <div className="col-span-2">Calo/Đơn vị</div>
                    <div className="col-span-2">Đơn vị đo</div>
                    <div className="col-span-1">Thao tác</div>
                  </div>

                  {/* Ingredient Rows */}
                  {filteredIngredients.map((ingredient, index) => {
                    const isEditing = editingIndex === allIngredients.findIndex(ing => ing.id === ingredient.id)

                    return (
                      <div
                        key={ingredient.id}
                        className="grid grid-cols-11 gap-4 items-center px-4 py-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>

                        {isEditing ? (
                          <>
                            <div className="col-span-5">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className={`w-full ${
                                  originalData && editingText.trim() !== originalData.ingredientName 
                                    ? 'border-orange-400 bg-orange-50' 
                                    : ''
                                }`}
                                placeholder="VD: thịt heo"
                                autoFocus
                                disabled={updating}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={editingCalories}
                                onChange={(e) => setEditingCalories(e.target.value)}
                                className={`w-full ${
                                  originalData && editingCalories !== originalData.caloriesPerUnit 
                                    ? 'border-orange-400 bg-orange-50' 
                                    : ''
                                }`}
                                placeholder="VD: 500"
                                disabled={updating}
                              />
                            </div>
                            <div className="col-span-2">
                              <select
                                value={editingUnit}
                                onChange={(e) => setEditingUnit(e.target.value)}
                                className={`w-full border rounded px-2 py-1 ${
                                  originalData && editingUnit !== originalData.measurementUnit 
                                    ? 'border-orange-400 bg-orange-50' 
                                    : ''
                                }`}
                                disabled={updating}
                              >
                                <option value="">Chọn đơn vị</option>
                                {UNITS.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-1 flex gap-1">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className={`px-2 ${
                                  hasChanges 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-gray-400 hover:bg-gray-500'
                                }`}
                                disabled={updating}
                              >
                                {updating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Save className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="px-2"
                                disabled={updating}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-5">
                              <div className="p-2 bg-gray-100 rounded border">
                                <span className="text-gray-800 font-medium">{ingredient.ingredientName}</span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="p-2 bg-gray-100 rounded border text-center">
                                <span className="text-gray-800 font-medium">
                                  {ingredient.caloriesPerUnit || "-"}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="p-2 bg-gray-100 rounded border text-center">
                                <span className="text-gray-800 font-medium">
                                  {ingredient.measurementUnit || "-"}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(ingredient)}
                                className="text-blue-600 hover:bg-blue-50 px-2"
                                disabled={updating}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading ? "Đang tải..." : (searchTerm ? "Không tìm thấy nguyên liệu nào" : "Chưa có nguyên liệu nào từ API")}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Dữ liệu nguyên liệu được lấy trực tiếp từ API</li>
              <li>• Sử dụng thanh tìm kiếm để lọc nguyên liệu</li>
              <li>• Click nút "Sửa" để chỉnh sửa nguyên liệu</li>
              <li>• Chỉ những trường đã thay đổi sẽ được gửi đi cập nhật</li>
              <li>• Trường có thay đổi sẽ được highlight màu cam</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
