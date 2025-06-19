"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Search, Edit, ChefHat, Loader2, Clock } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

// Import API functions
import { updateRecipe } from "@/hooks/RecipeApi/recipeApi"
import {
  getRecipeIngredientsByRecipeId,
  createRecipeIngredient,
  deleteRecipeIngredient,
} from "@/hooks/RecipeApi/recipeIngredients"
import { getRecipeStepsByRecipeId, createRecipeStep, deleteRecipeStep } from "@/hooks/RecipeApi/recipeSteps"
import { getAllMainCategories, getSubCategoriesByMainId } from "@/hooks/categoryApi/categoryApi"
import { getAllIngredients } from "@/hooks/RecipeApi/ingredientsApi"

import type { Recipe } from "./recipe-detail-modal"
import type {
  Ingredient,
  RecipeIngredientsResponse,
  RecipeStepsResponse,
  RecipeUpdateRequest,
  RecipeIngredientsCreationRequest,
  RecipeStepsCreationRequest,
} from "@/hooks/RecipeApi/recipeTypes"
import type { Category, SubCategory } from "@/hooks/categoryApi/types"

import { IngredientSelectModal } from "./ingredient-select-modal"
import { InstructionModal } from "./instruction-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecipeEditModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onSave: (recipe: Recipe) => void
}

// Thêm interface cho detailed instruction để xử lý ảnh
interface DetailedInstruction {
  step: number
  description: string
  time?: string
  image?: string
  imageFile?: File
}

export function RecipeEditModalImproved({ recipe, isOpen, onClose, onSave }: RecipeEditModalProps) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isIngredientSelectOpen, setIsIngredientSelectOpen] = useState(false)
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false)

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false)
  const [isLoadingSteps, setIsLoadingSteps] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingAllIngredients, setIsLoadingAllIngredients] = useState(false)

  // Recipe data from API
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientsResponse[]>([])
  const [recipeSteps, setRecipeSteps] = useState<RecipeStepsResponse[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Thêm state để lưu detailed instructions với ảnh
  const [detailedInstructions, setDetailedInstructions] = useState<DetailedInstruction[]>([])

  // Category data from API
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>("")

  // Ingredients data from API
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])

  // Load recipe data when modal opens
  useEffect(() => {
    if (isOpen && recipe) {
      setEditingRecipe({
        ...recipe,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
      })
      setErrors({})
      loadInitialData(recipe.id)
    } else if (!isOpen) {
      resetModalState()
    }
  }, [isOpen, recipe])

  // Auto-select categories when data is loaded
  useEffect(() => {
    if (categories.length > 0 && editingRecipe && !selectedMainCategoryId) {
      identifyCurrentCategories()
    }
  }, [categories, editingRecipe])

  const resetModalState = () => {
    setEditingRecipe(null)
    setErrors({})
    setRecipeIngredients([])
    setRecipeSteps([])
    setDetailedInstructions([])
    setImageFile(null)
    setCategories([])
    setSubCategories([])
    setSelectedMainCategoryId("")
    setAllIngredients([])
    setIsSaving(false)
    setIsLoadingIngredients(false)
    setIsLoadingSteps(false)
    setIsLoadingCategories(false)
    setIsLoadingAllIngredients(false)
  }

  const loadInitialData = async (recipeId: string) => {
    try {
      // Load all data in parallel
      await Promise.all([
        loadRecipeIngredients(recipeId),
        loadRecipeSteps(recipeId),
        loadCategories(),
        loadAllIngredients(),
      ])
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast.error("Không thể tải dữ liệu")
    }
  }

  const loadAllIngredients = async () => {
    try {
      setIsLoadingAllIngredients(true)
      const ingredientsData = await getAllIngredients()
      setAllIngredients(ingredientsData)
      console.log("Loaded ingredients:", ingredientsData)
    } catch (error) {
      console.error("Error loading ingredients:", error)
      toast.error("Không thể tải danh sách nguyên liệu")
    } finally {
      setIsLoadingAllIngredients(false)
    }
  }

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const categoryData = await getAllMainCategories()
      setCategories(categoryData)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const identifyCurrentCategories = async () => {
    if (!editingRecipe || !categories.length) return

    try {
      console.log("Identifying categories for recipe:", editingRecipe)
      console.log("Recipe subcategoryId:", editingRecipe.subcategoryId)
      console.log("Recipe category:", editingRecipe.category)

      let foundMainCategory: Category | null = null
      let foundSubCategory: SubCategory | null = null

      // Method 1: Find by subcategoryId (most reliable)
      if (editingRecipe.subcategoryId) {
        for (const mainCategory of categories) {
          try {
            const subCategoriesData = await getSubCategoriesByMainId(mainCategory.id)
            const matchingSubCategory = subCategoriesData.find((sub) => sub.id === editingRecipe.subcategoryId)

            if (matchingSubCategory) {
              foundMainCategory = mainCategory
              foundSubCategory = matchingSubCategory
              setSubCategories(subCategoriesData)
              break
            }
          } catch (error) {
            console.error(`Error loading subcategories for ${mainCategory.id}:`, error)
          }
        }
      }

      // Method 2: Find by category name if subcategoryId method failed
      if (!foundMainCategory && editingRecipe.category) {
        for (const mainCategory of categories) {
          try {
            const subCategoriesData = await getSubCategoriesByMainId(mainCategory.id)
            const matchingSubCategory = subCategoriesData.find(
              (sub) =>
                sub.subCategoryName === editingRecipe.category ||
                sub.subCategoryName.toLowerCase() === editingRecipe.category.toLowerCase(),
            )

            if (matchingSubCategory) {
              foundMainCategory = mainCategory
              foundSubCategory = matchingSubCategory
              setSubCategories(subCategoriesData)

              // Update recipe with correct subcategoryId if it was missing
              if (!editingRecipe.subcategoryId) {
                updateEditingRecipe("subcategoryId", matchingSubCategory.id)
              }
              break
            }
          } catch (error) {
            console.error(`Error loading subcategories for ${mainCategory.id}:`, error)
          }
        }
      }

      // Set the found categories
      if (foundMainCategory && foundSubCategory) {
        console.log("Found categories:", {
          mainCategory: foundMainCategory.name,
          subCategory: foundSubCategory.subCategoryName,
        })

        setSelectedMainCategoryId(foundMainCategory.id)

        // Update recipe data with correct information
        updateEditingRecipe("category", foundSubCategory.subCategoryName)
        updateEditingRecipe("subcategoryId", foundSubCategory.id)

        toast.success(`Đã xác định danh mục: ${foundMainCategory.name} > ${foundSubCategory.subCategoryName}`)
      } else {
        console.warn("Could not identify current categories for recipe")
        toast.warning("Không thể xác định danh mục hiện tại của công thức")

        // Set empty subcategories for the first main category as fallback
        if (categories.length > 0) {
          const firstMainCategory = categories[0]
          const subCategoriesData = await getSubCategoriesByMainId(firstMainCategory.id)
          setSubCategories(subCategoriesData)
        }
      }
    } catch (error) {
      console.error("Error identifying current categories:", error)
      toast.error("Lỗi khi xác định danh mục hiện tại")
    }
  }

  const loadSubCategories = async (mainCategoryId: string) => {
    try {
      const subCategoryData = await getSubCategoriesByMainId(mainCategoryId)
      setSubCategories(subCategoryData)
    } catch (error) {
      console.error("Error loading subcategories:", error)
      toast.error("Không thể tải danh sách danh mục con")
      setSubCategories([])
    }
  }

  const loadRecipeIngredients = async (recipeId: string) => {
    try {
      setIsLoadingIngredients(true)
      const ingredients = await getRecipeIngredientsByRecipeId(recipeId)
      setRecipeIngredients(ingredients)

      // Update editing recipe with formatted ingredients
      const formattedIngredients = ingredients.map((ing) =>
        `${ing.quantity || ""} ${ing.unit || ""} ${ing.ingredientName}`.trim(),
      )

      setEditingRecipe((prev) => (prev ? { ...prev, ingredients: formattedIngredients } : null))
    } catch (error) {
      console.error("Error loading ingredients:", error)
      toast.error("Không thể tải danh sách nguyên liệu")
    } finally {
      setIsLoadingIngredients(false)
    }
  }

  const loadRecipeSteps = async (recipeId: string) => {
    try {
      setIsLoadingSteps(true)
      const steps = await getRecipeStepsByRecipeId(recipeId)
      setRecipeSteps(steps)

      // Tạo detailed instructions với đầy đủ thông tin bao gồm ảnh
      const detailedSteps: DetailedInstruction[] = steps
        .sort((a, b) => a.step - b.step)
        .map((step) => ({
          step: step.step,
          description: step.description,
          time: step.waitingTime || "",
          image: step.recipeStepImage || "", // Lấy ảnh từ API
        }))

      setDetailedInstructions(detailedSteps)

      // Update editing recipe với chỉ descriptions để tương thích với code cũ
      const formattedSteps = steps.sort((a, b) => a.step - b.step).map((step) => step.description)

      setEditingRecipe((prev) => (prev ? { ...prev, instructions: formattedSteps } : null))
    } catch (error) {
      console.error("Error loading steps:", error)
      toast.error("Không thể tải các bước hướng dẫn")
    } finally {
      setIsLoadingSteps(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editingRecipe?.name?.trim()) {
      newErrors.name = "Tên công thức không được để trống"
    }

    if (!editingRecipe?.subcategoryId?.trim()) {
      newErrors.subcategoryId = "Danh mục không được để trống"
    }

    if (!editingRecipe?.description?.trim()) {
      newErrors.description = "Mô tả không được để trống"
    }

    if (!recipeIngredients || recipeIngredients.length === 0) {
      newErrors.ingredients = "Phải có ít nhất một nguyên liệu"
    }

    if (!editingRecipe?.instructions?.some((inst) => inst.trim())) {
      newErrors.instructions = "Phải có ít nhất một bước hướng dẫn"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!editingRecipe) return

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    try {
      setIsSaving(true)

      // Prepare update data
      const updateData: RecipeUpdateRequest = {
        title: editingRecipe.name,
        description: editingRecipe.description || "",
        difficulty: editingRecipe.difficulty || "Easy",
        cookingTime: editingRecipe.cookingTime || "",
        subCategoryId: editingRecipe.subcategoryId || "",
      }

      // Update recipe basic info
      await updateRecipe(editingRecipe.id, updateData, imageFile as File)

      // Update steps với ảnh
      await updateRecipeStepsWithImages(editingRecipe.id, detailedInstructions)

      toast.success("Cập nhật công thức thành công!")

      // Clean up the recipe data and call onSave
      const cleanedRecipe = {
        ...editingRecipe,
        ingredients: editingRecipe.ingredients?.filter((ing) => ing.trim()) || [],
        instructions: editingRecipe.instructions?.filter((inst) => inst.trim()) || [],
      }

      onSave(cleanedRecipe)
      onClose()
    } catch (error) {
      console.error("Error updating recipe:", error)
      toast.error("Không thể cập nhật công thức")
    } finally {
      setIsSaving(false)
    }
  }

  // Hàm mới để update recipe steps với ảnh
  const updateRecipeStepsWithImages = async (recipeId: string, instructions: DetailedInstruction[]) => {
    try {
      // Delete existing steps
      for (const step of recipeSteps) {
        await deleteRecipeStep(step.id)
      }

      // Create new steps với ảnh
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i]
        if (instruction.description.trim()) {
          const stepData: RecipeStepsCreationRequest = {
            step: i + 1,
            description: instruction.description,
            waitingTime: instruction.time || "",
          }

          // Gửi kèm file ảnh nếu có
          await createRecipeStep(recipeId, stepData, instruction.imageFile)
        }
      }
    } catch (error) {
      console.error("Error updating steps with images:", error)
      throw error
    }
  }

  const handleCancel = () => {
    resetModalState()
    onClose()
  }

  const updateEditingRecipe = (field: keyof Recipe, value: any) => {
    if (editingRecipe) {
      setEditingRecipe((prev) => {
        if (!prev) return null
        const updated = { ...prev, [field]: value }
        return updated
      })

      // Xóa lỗi khi user bắt đầu sửa
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  }

  const handleMainCategoryChange = (mainCategoryId: string) => {
    setSelectedMainCategoryId(mainCategoryId)

    // Only reset subcategory if user manually changes main category
    if (mainCategoryId !== selectedMainCategoryId) {
      updateEditingRecipe("subcategoryId", "")
      updateEditingRecipe("category", "")
    }

    // Load subcategories for the selected main category
    loadSubCategories(mainCategoryId)

    // Clear error if exists
    if (errors.subcategoryId) {
      setErrors((prev) => ({ ...prev, subcategoryId: "" }))
    }
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    const selectedSubCategory = subCategories.find((sub) => sub.id === subCategoryId)
    if (selectedSubCategory) {
      updateEditingRecipe("subcategoryId", subCategoryId)
      updateEditingRecipe("category", selectedSubCategory.subCategoryName)

      console.log("Selected subcategory:", {
        id: subCategoryId,
        name: selectedSubCategory.subCategoryName,
      })
    }
  }

  const addIngredientFromSelect = async (ingredientText: string) => {
    try {
      // Phân tích chuỗi ingredientText thành quantity, unit, và ingredientName
      const parts = ingredientText.trim().split(" ")
      const quantity = Number.parseFloat(parts[0]) || 1
      const unit = parts[1] || ""
      const ingredientName = parts.slice(2).join(" ")

      // Tìm ingredient trong allIngredients dựa trên ingredientName
      const selectedIngredient = allIngredients.find(
        (ing) => ing.ingredientName.toLowerCase() === ingredientName.toLowerCase(),
      )

      if (!selectedIngredient) {
        toast.error("Không tìm thấy nguyên liệu trong danh sách")
        return
      }

      // Gọi API để tạo mới recipe ingredient
      const recipeIngredientData: RecipeIngredientsCreationRequest = {
        recipeId: editingRecipe!.id,
        ingredientId: selectedIngredient.id,
        quantity: quantity,
      }

      const newRecipeIngredient = await createRecipeIngredient(recipeIngredientData)

      // Cập nhật recipeIngredients
      setRecipeIngredients((prev) => [...prev, newRecipeIngredient])

      // Cập nhật editingRecipe.ingredients
      if (editingRecipe) {
        const newIngredients = [...(editingRecipe.ingredients || []), ingredientText]
        updateEditingRecipe("ingredients", newIngredients)
      }

      toast.success("Thêm nguyên liệu thành công!")
    } catch (error) {
      console.error("Error adding ingredient:", error)
      toast.error("Không thể thêm nguyên liệu")
    }
  }

  const removeIngredientById = async (ingredientId: string, index: number) => {
    try {
      // Gọi API để xóa nguyên liệu trên server
      await deleteRecipeIngredient(ingredientId)

      // Xóa nguyên liệu khỏi state recipeIngredients
      setRecipeIngredients((prev) => prev.filter((ing) => ing.id !== ingredientId))

      // Xóa nguyên liệu khỏi editingRecipe.ingredients
      if (editingRecipe && editingRecipe.ingredients) {
        const newIngredients = editingRecipe.ingredients.filter((_, i) => i !== index)
        updateEditingRecipe("ingredients", newIngredients)
      }

      toast.success("Xóa nguyên liệu thành công!")
    } catch (error) {
      console.error("Error deleting ingredient:", error)
      toast.error("Không thể xóa nguyên liệu")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          updateEditingRecipe("image", e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const memoizedDetailedInstructions = useMemo(() => detailedInstructions, [detailedInstructions])

  if (!editingRecipe) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chỉnh sửa công thức: {editingRecipe.name}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isSaving || isLoadingIngredients || isLoadingSteps}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
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
                  {isLoadingCategories && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
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
                    <div className="mt-2 space-y-2">
                      <Label className="text-sm font-medium">Upload ảnh mới</Label>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-1" />
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

                    {/* Category Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Danh mục chính <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={selectedMainCategoryId}
                          onValueChange={handleMainCategoryChange}
                          disabled={isLoadingCategories}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue
                              placeholder={
                                isLoadingCategories
                                  ? "Đang tải..."
                                  : selectedMainCategoryId
                                    ? categories.find((c) => c.id === selectedMainCategoryId)?.name ||
                                      "Chọn danh mục chính"
                                    : "Chọn danh mục chính"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedMainCategoryId && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Hiện tại: {categories.find((c) => c.id === selectedMainCategoryId)?.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Danh mục con <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={editingRecipe.subcategoryId || ""}
                          onValueChange={handleSubCategoryChange}
                          disabled={!selectedMainCategoryId || subCategories.length === 0}
                        >
                          <SelectTrigger className={`mt-1 ${errors.subcategoryId ? "border-red-500" : ""}`}>
                            <SelectValue
                              placeholder={
                                !selectedMainCategoryId
                                  ? "Chọn danh mục chính trước"
                                  : subCategories.length === 0
                                    ? "Không có danh mục con"
                                    : editingRecipe.subcategoryId
                                      ? subCategories.find((s) => s.id === editingRecipe.subcategoryId)
                                          ?.subCategoryName || "Chọn danh mục con"
                                      : "Chọn danh mục con"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {subCategories.map((subCategory) => (
                              <SelectItem key={subCategory.id} value={subCategory.id}>
                                {subCategory.subCategoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.subcategoryId && <p className="text-red-500 text-sm mt-1">{errors.subcategoryId}</p>}
                        {editingRecipe.subcategoryId && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Hiện tại:{" "}
                            {subCategories.find((s) => s.id === editingRecipe.subcategoryId)?.subCategoryName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Độ khó</Label>
                        <Select
                          value={editingRecipe.difficulty || ""}
                          onValueChange={(value) => updateEditingRecipe("difficulty", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn độ khó" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Dễ</SelectItem>
                            <SelectItem value="Medium">Trung bình</SelectItem>
                            <SelectItem value="Hard">Khó</SelectItem>
                          </SelectContent>
                        </Select>
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
                    {isLoadingIngredients && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                    {isLoadingAllIngredients && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                  </h3>
                  {errors.ingredients && <p className="text-red-500 text-sm">{errors.ingredients}</p>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Button to select ingredients */}
                  <div className="flex justify-start">
                    <Button
                      size="sm"
                      onClick={() => setIsIngredientSelectOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={isLoadingIngredients || isLoadingAllIngredients}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {isLoadingAllIngredients ? "Đang tải..." : "Chọn nguyên liệu"}
                    </Button>
                  </div>

                  {recipeIngredients && recipeIngredients.length > 0 ? (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Tên nguyên liệu</div>
                        <div className="col-span-2">Số lượng</div>
                        <div className="col-span-2">Đơn vị</div>
                        <div className="col-span-1">Xóa</div>
                      </div>

                      {/* Ingredient List - Sử dụng trực tiếp từ API */}
                      <div className="space-y-2">
                        {recipeIngredients.map((ingredient, index) => (
                          <div
                            key={ingredient.id}
                            className="grid grid-cols-12 gap-4 items-center px-4 py-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="col-span-1">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div className="col-span-6">
                              <div className="p-2 bg-gray-100 rounded border">
                                <span className="text-gray-800 font-medium">{ingredient.ingredientName}</span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="p-2 bg-gray-100 rounded border text-center">
                                <span className="text-gray-800 font-medium">{ingredient.quantity || "-"}</span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="p-2 bg-gray-100 rounded border text-center">
                                <span className="text-gray-800 font-medium">{ingredient.unit || "-"}</span>
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredientById(ingredient.id, index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                                disabled={recipeIngredients.length === 1 || isLoadingIngredients}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-4xl mb-4">🥗</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isLoadingIngredients ? "Đang tải nguyên liệu..." : "Chưa có nguyên liệu nào"}
                      </h3>
                      <p className="text-gray-600 mb-4">Nhấn "Chọn nguyên liệu" để thêm nguyên liệu cho công thức</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Instructions - Hiển thị với ảnh */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Cách làm <span className="text-red-500">*</span>
                      {isLoadingSteps && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
                    </h3>
                    {errors.instructions && <p className="text-red-500 text-sm">{errors.instructions}</p>}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsInstructionModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isLoadingSteps}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedInstructions && detailedInstructions.length > 0 ? (
                    <div className="space-y-4">
                      {detailedInstructions.map((instruction, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">Bước {index + 1}</h4>
                              <p className="text-gray-700 mb-2">{instruction.description}</p>

                              {/* Hiển thị thời gian nếu có */}
                              {instruction.time && (
                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                  <Clock className="w-3 h-3" />
                                  <span>{instruction.time}</span>
                                </div>
                              )}

                              {/* Hiển thị ảnh nếu có */}
                              {instruction.image && (
                                <div className="mt-2">
                                  <Image
                                    src={instruction.image || "/placeholder.svg"}
                                    alt={`Bước ${index + 1}`}
                                    width={200}
                                    height={150}
                                    className="rounded-lg object-cover border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isLoadingSteps ? "Đang tải hướng dẫn..." : "Chưa có hướng dẫn nào"}
                      </h3>
                      <p className="text-gray-600 mb-4">Nhấn "Chỉnh sửa" để thêm hướng dẫn cho công thức</p>
                      <Button
                        type="button"
                        onClick={() => setIsInstructionModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={isLoadingSteps}
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
        ingredients={allIngredients}
      />

      {/* Instruction Modal - Truyền detailed instructions */}
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        detailedInstructions={memoizedDetailedInstructions}
        onSave={(instructions) => {
          console.log("Saving detailed instructions from modal:", instructions)
          setDetailedInstructions(instructions)

          // Cập nhật editingRecipe.instructions để tương thích
          const simpleInstructions = instructions.map((inst) => inst.description)
          updateEditingRecipe("instructions", simpleInstructions)

          // Clear validation error if exists
          if (errors.instructions) {
            setErrors((prev) => ({ ...prev, instructions: "" }))
          }

          // Close modal after saving
          setIsInstructionModalOpen(false)
        }}
      />
    </>
  )
}
