"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Trash2, AlertTriangle } from "lucide-react"
import type { Ingredient } from "@/hooks/RecipeApi/recipeTypes"
import { getAllIngredients, deleteIngredient } from "@/hooks/RecipeApi/ingredientsApi"

interface IngredientDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  ingredients: string[]
  onDelete: (updatedIngredients: string[]) => void
}

export function IngredientDeleteModal({ isOpen, onClose, ingredients, onDelete }: IngredientDeleteModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  // Filter ingredients for search
  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return allIngredients
    return allIngredients.filter((ingredient) =>
      ingredient.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [allIngredients, searchTerm])

  const handleSelectIngredient = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      setDeleting(true)
      setError(null)
      setSuccessMessage(null)

      // Delete ingredients one by one
      const deletePromises = selectedIds.map((id) => deleteIngredient(id))
      await Promise.all(deletePromises)

      setSuccessMessage(`Đã xóa thành công ${selectedIds.length} nguyên liệu`)

      // Reload ingredients to get updated data
      await loadIngredients()

      // Update parent component with formatted ingredients
      const formattedIngredients = allIngredients
        .filter((ing) => !selectedIds.includes(ing.id))
        .map((ing) => `${ing.caloriesPerUnit || 0}${ing.measurementUnit || ""} ${ing.ingredientName}`)

      onDelete(formattedIngredients)

      // Reset selections
      setSelectedIds([])
      setSearchTerm("")

      // Close modal after successful deletion
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setError("Không thể xóa nguyên liệu")
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    setSelectedIds([])
    setSearchTerm("")
    setError(null)
    setSuccessMessage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-500" />
              Xóa nguyên liệu
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={selectedIds.length === 0 || deleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Xóa ({selectedIds.length})
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={deleting}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error/Success Messages */}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* Warning */}
          {selectedIds.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">Cảnh báo</h4>
                  <p className="text-red-700 text-sm">
                    Bạn đang chọn xóa {selectedIds.length} nguyên liệu. Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>
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
                disabled={deleting}
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
            <Label className="text-sm font-medium">Danh sách nguyên liệu từ API ({filteredIngredients.length})</Label>
            <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
              {filteredIngredients.length > 0 ? (
                <>
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                    <div className="col-span-1">Chọn</div>
                    <div className="col-span-1">#</div>
                    <div className="col-span-6">Tên nguyên liệu</div>
                    <div className="col-span-2">Calo</div>
                    <div className="col-span-2">Đơn vị đo</div>
                  </div>

                  {/* Ingredient Rows */}
                  {filteredIngredients.map((ingredient, index) => {
                    const isSelected = selectedIds.includes(ingredient.id)

                    return (
                      <div
                        key={ingredient.id}
                        className={`grid grid-cols-12 gap-4 items-center px-4 py-3 border rounded-lg transition-colors ${
                          isSelected ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectIngredient(ingredient.id, checked as boolean)}
                            disabled={deleting}
                          />
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div className="col-span-6">
                          <div
                            className={`p-2 rounded border ${isSelected ? "bg-red-100 border-red-200" : "bg-gray-100"}`}
                          >
                            <span className={`font-medium ${isSelected ? "text-red-800" : "text-gray-800"}`}>
                              {ingredient.ingredientName}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div
                            className={`p-2 rounded border text-center ${
                              isSelected ? "bg-red-100 border-red-200" : "bg-gray-100"
                            }`}
                          >
                            <span className={`font-medium ${isSelected ? "text-red-800" : "text-gray-800"}`}>
                              {ingredient.caloriesPerUnit || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div
                            className={`p-2 rounded border text-center ${
                              isSelected ? "bg-red-100 border-red-200" : "bg-gray-100"
                            }`}
                          >
                            <span className={`font-medium ${isSelected ? "text-red-800" : "text-gray-800"}`}>
                              {ingredient.measurementUnit || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading
                    ? "Đang tải..."
                    : searchTerm
                      ? "Không tìm thấy nguyên liệu nào"
                      : "Chưa có nguyên liệu nào từ API"}
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
              <li>• Tick chọn các nguyên liệu muốn xóa</li>
              <li>• Click "Xóa" để xác nhận xóa các nguyên liệu đã chọn</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
