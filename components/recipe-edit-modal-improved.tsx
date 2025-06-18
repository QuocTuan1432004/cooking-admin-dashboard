"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Search, Edit, ChefHat } from "lucide-react"
import Image from "next/image"
import type { Recipe } from "./recipe-detail-modal"
import type { Ingredient } from "@/hooks/RecipeApi/recipeTypes"
import { IngredientSelectModal } from "./ingredient-select-modal"
import { InstructionModal } from "./instruction-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecipeEditModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onSave: (recipe: Recipe) => void
  ingredients?: Ingredient[]
}

const CATEGORIES = ["Món kho", "Món xào", "Món canh", "Món nước", "Món tráng miệng", "Món chính", "Món phụ"]

export function RecipeEditModalImproved({ recipe, isOpen, onClose, onSave, ingredients = [] }: RecipeEditModalProps) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isIngredientSelectOpen, setIsIngredientSelectOpen] = useState(false)
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false)

  // Đồng bộ recipe với editingRecipe khi modal mở
  useEffect(() => {
    if (isOpen && recipe) {
      setEditingRecipe({
        ...recipe,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
      })
      setErrors({})
    } else if (!isOpen) {
      setEditingRecipe(null)
      setErrors({})
    }
  }, [isOpen, recipe])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editingRecipe?.name?.trim()) {
      newErrors.name = "Tên công thức không được để trống"
    }

    if (!editingRecipe?.category?.trim()) {
      newErrors.category = "Danh mục không được để trống"
    }

    if (!editingRecipe?.description?.trim()) {
      newErrors.description = "Mô tả không được để trống"
    }

    if (!editingRecipe?.ingredients?.some((ing) => ing.trim())) {
      newErrors.ingredients = "Phải có ít nhất một nguyên liệu"
    }

    if (!editingRecipe?.instructions?.some((inst) => inst.trim())) {
      newErrors.instructions = "Phải có ít nhất một bước hướng dẫn"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!editingRecipe) return

    if (!validateForm()) {
      return
    }

    // Lọc bỏ các nguyên liệu và hướng dẫn trống
    const cleanedRecipe = {
      ...editingRecipe,
      ingredients: editingRecipe.ingredients?.filter((ing) => ing.trim()) || [],
      instructions: editingRecipe.instructions?.filter((inst) => inst.trim()) || [],
    }

    onSave(cleanedRecipe)
    onClose()
  }

  const handleCancel = () => {
    setEditingRecipe(null)
    setErrors({})
    onClose()
  }

  const updateEditingRecipe = (field: keyof Recipe, value: any) => {
    if (editingRecipe) {
      setEditingRecipe((prev) => (prev ? { ...prev, [field]: value } : null))
      // Xóa lỗi khi user bắt đầu sửa
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  }

  const addIngredientFromSelect = (ingredientText: string) => {
    if (editingRecipe) {
      const newIngredients = [...(editingRecipe.ingredients || []), ingredientText]
      updateEditingRecipe("ingredients", newIngredients)
    }
  }

  const removeIngredient = (index: number) => {
    if (editingRecipe && editingRecipe.ingredients && editingRecipe.ingredients.length > 1) {
      const newIngredients = editingRecipe.ingredients.filter((_, i) => i !== index)
      updateEditingRecipe("ingredients", newIngredients)
    }
  }

  if (!editingRecipe) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chỉnh sửa công thức: {editingRecipe.name}</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recipe Image and Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <Image
                      src={editingRecipe.image || "/placeholder.svg"}
                      alt={editingRecipe.name || "Recipe"}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="mt-2">
                      <Label className="text-sm font-medium">URL ảnh</Label>
                      <Input
                        value={editingRecipe.image || ""}
                        onChange={(e) => updateEditingRecipe("image", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Tên công thức <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={editingRecipe.name || ""}
                        onChange={(e) => updateEditingRecipe("name", e.target.value)}
                        className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                        placeholder="Nhập tên công thức"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Danh mục <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={editingRecipe.category || ""}
                          onValueChange={(value) => updateEditingRecipe("category", value)}
                        >
                          <SelectTrigger className={`mt-1 ${errors.category ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tác giả</Label>
                        <Input value={editingRecipe.author || ""} disabled className="mt-1 bg-gray-100" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Thời gian nấu</Label>
                        <Input
                          value={editingRecipe.cookingTime || ""}
                          onChange={(e) => updateEditingRecipe("cookingTime", e.target.value)}
                          className="mt-1"
                          placeholder="VD: 30 phút"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Mô tả <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={editingRecipe.description || ""}
                        onChange={(e) => updateEditingRecipe("description", e.target.value)}
                        className={`mt-1 ${errors.description ? "border-red-500" : ""}`}
                        rows={3}
                        placeholder="Mô tả ngắn về công thức"
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <h3 className="text-lg font-semibold">
                    Nguyên liệu <span className="text-red-500">*</span>
                  </h3>
                  {errors.ingredients && <p className="text-red-500 text-sm">{errors.ingredients}</p>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Only "Chọn nguyên liệu" button */}
                  <div className="flex justify-start">
                    <Button
                      size="sm"
                      onClick={() => setIsIngredientSelectOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Chọn nguyên liệu
                    </Button>
                  </div>

                  {editingRecipe.ingredients && editingRecipe.ingredients.length > 0 ? (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Tên nguyên liệu</div>
                        <div className="col-span-2">Số lượng</div>
                        <div className="col-span-2">Đơn vị</div>
                        <div className="col-span-1">Xóa</div>
                      </div>

                      {/* Ingredient List */}
                      <div className="space-y-2">
                        {editingRecipe.ingredients.map((ingredient, index) => {
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

                          return (
                            <div
                              key={index}
                              className="grid grid-cols-12 gap-4 items-center px-4 py-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="col-span-1">
                                <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                              </div>
                              <div className="col-span-6">
                                <div className="p-2 bg-gray-100 rounded border">
                                  <span className="text-gray-800 font-medium">{name || ingredient}</span>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="p-2 bg-gray-100 rounded border text-center">
                                  <span className="text-gray-800 font-medium">{quantity || "-"}</span>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="p-2 bg-gray-100 rounded border text-center">
                                  <span className="text-gray-800 font-medium">{unit || "-"}</span>
                                </div>
                              </div>
                              <div className="col-span-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(index)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                                  disabled={editingRecipe.ingredients?.length === 1}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-4xl mb-4">🥗</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nguyên liệu nào</h3>
                      <p className="text-gray-600 mb-4">Nhấn "Chọn nguyên liệu" để thêm nguyên liệu cho công thức</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Cách làm <span className="text-red-500">*</span>
                    </h3>
                    {errors.instructions && <p className="text-red-500 text-sm">{errors.instructions}</p>}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsInstructionModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editingRecipe.instructions && editingRecipe.instructions.length > 0 ? (
                    <div className="space-y-4">
                      {editingRecipe.instructions.map((instruction, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">Bước {index + 1}</h4>
                              <p className="text-gray-700">{instruction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hướng dẫn nào</h3>
                      <p className="text-gray-600 mb-4">Nhấn "Chỉnh sửa" để thêm hướng dẫn cho công thức</p>
                      <Button
                        type="button"
                        onClick={() => setIsInstructionModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Thêm hướng dẫn đầu tiên
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ingredient Select Modal */}
      <IngredientSelectModal
        isOpen={isIngredientSelectOpen}
        onClose={() => setIsIngredientSelectOpen(false)}
        onSelect={addIngredientFromSelect}
        ingredients={ingredients}
      />

      {/* Instruction Modal */}
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        instructions={editingRecipe?.instructions || []}
        onSave={(instructions) => updateEditingRecipe("instructions", instructions)}
      />
    </>
  )
}
