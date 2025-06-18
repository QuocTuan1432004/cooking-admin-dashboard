"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Trash2, AlertTriangle } from "lucide-react"

interface IngredientDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  ingredients: string[]
  onDelete: (updatedIngredients: string[]) => void
}

export function IngredientDeleteModal({ isOpen, onClose, ingredients, onDelete }: IngredientDeleteModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // Filter ingredients for search
  const filteredIngredients = useMemo(() => {
    return ingredients
      .map((ingredient, index) => ({ ingredient, originalIndex: index }))
      .filter(({ ingredient }) => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [ingredients, searchTerm])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleIndices = filteredIngredients.map((item) => item.originalIndex)
      setSelectedIndices(visibleIndices)
    } else {
      setSelectedIndices([])
    }
  }

  const handleSelectIngredient = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedIndices((prev) => [...prev, index])
    } else {
      setSelectedIndices((prev) => prev.filter((i) => i !== index))
    }
  }

  const handleDelete = () => {
    const updatedIngredients = ingredients.filter((_, index) => !selectedIndices.includes(index))
    onDelete(updatedIngredients)
    setSelectedIndices([])
    setSearchTerm("")
    onClose()
  }

  const handleCancel = () => {
    setSelectedIndices([])
    setSearchTerm("")
    onClose()
  }

  const parseIngredient = (ingredient: string) => {
    const parts = ingredient.trim().split(" ")
    let quantity = ""
    let unit = ""
    let name = ""

    if (parts.length >= 3) {
      const quantityMatch = parts[0].match(/[\d.,]+/)
      if (quantityMatch) {
        quantity = quantityMatch[0]
        const remainingUnit = parts[0].replace(quantityMatch[0], "")
        if (remainingUnit) {
          unit = remainingUnit
          name = parts.slice(1).join(" ")
        } else {
          unit = parts[1]
          name = parts.slice(2).join(" ")
        }
      } else {
        name = ingredient
      }
    } else {
      name = ingredient
    }

    return { quantity, unit, name: name || ingredient }
  }

  const isAllVisibleSelected =
    filteredIngredients.length > 0 && filteredIngredients.every((item) => selectedIndices.includes(item.originalIndex))
  const isPartiallySelected = selectedIndices.length > 0 && !isAllVisibleSelected

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
                disabled={selectedIndices.length === 0}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa ({selectedIndices.length})
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          {selectedIndices.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">Cảnh báo</h4>
                  <p className="text-red-700 text-sm">
                    Bạn đang chọn xóa {selectedIndices.length} nguyên liệu. Hành động này không thể hoàn tác.
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
              />
            </div>
          </div>

          {/* Select All */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              checked={isAllVisibleSelected}
              ref={(el) => {
                if (el && "indeterminate" in el) {
                  ;(el as HTMLInputElement).indeterminate = isPartiallySelected
                }
              }}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm font-medium">
              {isAllVisibleSelected
                ? `Bỏ chọn tất cả (${filteredIngredients.length})`
                : `Chọn tất cả (${filteredIngredients.length})`}
            </Label>
          </div>

          {/* Ingredients List */}
          <div>
            <Label className="text-sm font-medium">Danh sách nguyên liệu ({filteredIngredients.length})</Label>
            <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
              {filteredIngredients.length > 0 ? (
                <>
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                    <div className="col-span-1">Chọn</div>
                    <div className="col-span-1">#</div>
                    <div className="col-span-6">Tên nguyên liệu</div>
                    <div className="col-span-2">Số lượng</div>
                    <div className="col-span-2">Đơn vị</div>
                  </div>

                  {/* Ingredient Rows */}
                  {filteredIngredients.map(({ ingredient, originalIndex }) => {
                    const { quantity, unit, name } = parseIngredient(ingredient)
                    const isSelected = selectedIndices.includes(originalIndex)

                    return (
                      <div
                        key={originalIndex}
                        className={`grid grid-cols-12 gap-4 items-center px-4 py-3 border rounded-lg transition-colors ${
                          isSelected ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectIngredient(originalIndex, checked as boolean)}
                          />
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-gray-600">{originalIndex + 1}</span>
                        </div>
                        <div className="col-span-6">
                          <div
                            className={`p-2 rounded border ${isSelected ? "bg-red-100 border-red-200" : "bg-gray-100"}`}
                          >
                            <span className={`font-medium ${isSelected ? "text-red-800" : "text-gray-800"}`}>
                              {name}
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
                              {quantity || "-"}
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
                              {unit || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Không tìm thấy nguyên liệu nào" : "Chưa có nguyên liệu nào"}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sử dụng thanh tìm kiếm để lọc nguyên liệu</li>
              <li>• Tick chọn các nguyên liệu muốn xóa</li>
              <li>• Có thể chọn tất cả hoặc chọn từng cái</li>
              <li>• Click "Xóa" để xác nhận xóa các nguyên liệu đã chọn</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
