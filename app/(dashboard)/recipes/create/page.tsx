"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Save, ArrowLeft, Clock, ChefHat, ImageIcon, X, Search, Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { IngredientSelectModal } from "@/components/ingredient-select-modal"
import { InstructionAddModal, type Instruction } from "@/components/instruction-add-modal"
// Import API functions
import { getAllMainCategories } from "@/hooks/categoryApi/categoryApi"
import { getAllIngredients } from "@/hooks/RecipeApi/ingredientsApi"
import type { Category } from "@/hooks/categoryApi/types"
import type { Ingredient } from "@/hooks/RecipeApi/recipeTypes"

interface Recipe {
  title: string
  description: string
  img: string
  cookingTime: string
  difficulty: "Easy" | "Medium" | "Hard" | ""
  parentCategory: string
  subCategory: string
  ingredients: string[]
  instructions: string[]
}

export default function CreateRecipePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isIngredientSelectOpen, setIsIngredientSelectOpen] = useState(false)
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false)
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null)
  const [detailedInstructions, setDetailedInstructions] = useState<Instruction[]>([])

  // State for API data
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingIngredients, setLoadingIngredients] = useState(true)

  const [recipe, setRecipe] = useState<Recipe>({
    title: "",
    description: "",
    img: "",
    cookingTime: "",
    difficulty: "",
    parentCategory: "",
    subCategory: "",
    ingredients: [],
    instructions: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Recipe, value: string) => {
    setRecipe((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleParentCategoryChange = (value: string) => {
    setRecipe((prev) => ({
      ...prev,
      parentCategory: value,
      subCategory: "", // Reset subcategory when parent changes
    }))
  }

  const getSubCategories = () => {
    const parentCat = categories.find((cat) => cat.id === recipe.parentCategory)
    return parentCat?.children || []
  }

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setRecipe((prev) => ({ ...prev, img: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files[0]) {
      handleImageUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const addIngredientFromSelect = (ingredientText: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredientText],
    }))
  }

  const removeIngredient = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => (i === index ? value : ingredient)),
    }))
  }

  const handleAddInstruction = () => {
    setEditingInstructionIndex(null)
    setIsInstructionModalOpen(true)
  }

  const handleEditInstruction = (index: number) => {
    setEditingInstructionIndex(index)
    setIsInstructionModalOpen(true)
  }

  const handleSaveInstruction = (instructionData: Omit<Instruction, "step">) => {
    if (editingInstructionIndex !== null) {
      // Edit existing instruction
      const newInstructions = [...detailedInstructions]
      newInstructions[editingInstructionIndex] = {
        ...instructionData,
        step: editingInstructionIndex + 1,
      }
      setDetailedInstructions(newInstructions)
    } else {
      // Add new instruction
      const newInstruction: Instruction = {
        ...instructionData,
        step: detailedInstructions.length + 1,
      }
      setDetailedInstructions([...detailedInstructions, newInstruction])
    }
  }

  const removeInstruction = (index: number) => {
    const newInstructions = detailedInstructions.filter((_, i) => i !== index)
    // Re-number steps
    const renumbered = newInstructions.map((inst, i) => ({ ...inst, step: i + 1 }))
    setDetailedInstructions(renumbered)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!recipe.title.trim()) newErrors.title = "Tên công thức là bắt buộc"
    if (!recipe.description.trim()) newErrors.description = "Mô tả là bắt buộc"
    if (!recipe.cookingTime.trim()) newErrors.cookingTime = "Thời gian nấu là bắt buộc"
    if (!recipe.difficulty) newErrors.difficulty = "Độ khó là bắt buộc"
    if (!recipe.parentCategory) newErrors.parentCategory = "Danh mục chính là bắt buộc"
    if (!recipe.subCategory) newErrors.subCategory = "Danh mục con là bắt buộc"
    if (!recipe.img) newErrors.img = "Hình ảnh là bắt buộc"

    const validIngredients = recipe.ingredients.filter((ing) => ing.trim())
    if (validIngredients.length === 0) newErrors.ingredients = "Ít nhất một nguyên liệu là bắt buộc"

    if (detailedInstructions.length === 0 || !detailedInstructions.some((inst) => inst.description.trim())) {
      newErrors.instructions = "Ít nhất một bước làm là bắt buộc"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Convert detailed instructions to simple strings for compatibility
    const simpleInstructions = detailedInstructions
      .filter((inst) => inst.description.trim())
      .map((inst) => inst.description)

    const finalRecipe = {
      ...recipe,
      instructions: simpleInstructions,
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Công thức đã được tạo thành công!")
      router.push("/recipes")
    }, 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Hard":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  // Load data from APIs
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await getAllMainCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
        // Show error message to user
      } finally {
        setLoadingCategories(false)
      }
    }

    const loadIngredients = async () => {
      try {
        setLoadingIngredients(true)
        const ingredientsData = await getAllIngredients()
        setIngredients(ingredientsData)
      } catch (error) {
        console.error('Error loading ingredients:', error)
        // Show error message to user
      } finally {
        setLoadingIngredients(false)
      }
    }

    loadCategories()
    loadIngredients()
  }, [])

  return (
    <>
      <div>
        <Header title="Thêm công thức mới" showSearch={false} />

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">
                      Tên công thức <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={recipe.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Nhập tên công thức..."
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="cookingTime">
                      Thời gian nấu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cookingTime"
                        value={recipe.cookingTime}
                        onChange={(e) => handleInputChange("cookingTime", e.target.value)}
                        placeholder="VD: 30 phút"
                        className={`pl-10 ${errors.cookingTime ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.cookingTime && <p className="text-red-500 text-sm mt-1">{errors.cookingTime}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">
                    Mô tả <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={recipe.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Mô tả về công thức này..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">
                    Độ khó <span className="text-red-500">*</span>
                  </Label>
                  <Select value={recipe.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger className={errors.difficulty ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">
                        <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor("Easy")}`}>Dễ</span>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor("Medium")}`}>
                          Trung bình
                        </span>
                      </SelectItem>
                      <SelectItem value="Hard">
                        <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor("Hard")}`}>Khó</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.difficulty && <p className="text-red-500 text-sm mt-1">{errors.difficulty}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Hình ảnh công thức
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-orange-500 bg-orange-50"
                        : errors.img
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-orange-400"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          width={300}
                          height={200}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white"
                          onClick={() => {
                            setImagePreview(null)
                            setRecipe((prev) => ({ ...prev, img: "" }))
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-orange-600 hover:text-orange-700 font-medium">chọn file</span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file)
                            }}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF tối đa 10MB</p>
                      </div>
                    )}
                  </div>
                  {errors.img && <p className="text-red-500 text-sm">{errors.img}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-green-500" />
                  Danh mục
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="parentCategory">
                      Danh mục chính <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={recipe.parentCategory} 
                      onValueChange={handleParentCategoryChange}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger className={errors.parentCategory ? "border-red-500" : ""}>
                        <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục chính"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.parentCategory && <p className="text-red-500 text-sm mt-1">{errors.parentCategory}</p>}
                  </div>

                  <div>
                    <Label htmlFor="subCategory">
                      Danh mục con <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={recipe.subCategory}
                      onValueChange={(value) => handleInputChange("subCategory", value)}
                      disabled={!recipe.parentCategory || loadingCategories}
                    >
                      <SelectTrigger className={errors.subCategory ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn danh mục con" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubCategories().map((subCategory) => (
                          <SelectItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subCategory && <p className="text-red-500 text-sm mt-1">{errors.subCategory}</p>}
                    {!recipe.parentCategory && (
                      <p className="text-gray-500 text-sm mt-1">Vui lòng chọn danh mục chính trước</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nguyên liệu</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsIngredientSelectOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Chọn nguyên liệu
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                      <div className="flex-1">
                        <Input
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder={`Nguyên liệu ${index + 1}...`}
                        />
                      </div>
                      {recipe.ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {errors.ingredients && <p className="text-red-500 text-sm">{errors.ingredients}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Cách làm</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddInstruction}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bước
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedInstructions.map((instruction, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {instruction.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Bước {instruction.step}</h4>
                            {instruction.time && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{instruction.time}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{instruction.description}</p>
                          {instruction.image && (
                            <Image
                              src={instruction.image || "/placeholder.svg"}
                              alt={`Bước ${instruction.step}`}
                              width={150}
                              height={100}
                              className="rounded object-cover"
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditInstruction(index)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeInstruction(index)}
                            className="text-red-600 hover:bg-red-50"
                            disabled={detailedInstructions.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.instructions && <p className="text-red-500 text-sm">{errors.instructions}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pb-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || loadingCategories || loadingIngredients} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Đang lưu..." : "Tạo công thức"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Ingredient Select Modal */}
      <IngredientSelectModal
        isOpen={isIngredientSelectOpen}
        onClose={() => setIsIngredientSelectOpen(false)}
        onSelect={addIngredientFromSelect}
        ingredients={ingredients}
      />

      {/* Instruction Add Modal */}
      <InstructionAddModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        onSave={handleSaveInstruction}
        stepNumber={editingInstructionIndex !== null ? editingInstructionIndex + 1 : detailedInstructions.length + 1}
        editingInstruction={
          editingInstructionIndex !== null ? detailedInstructions[editingInstructionIndex] : undefined
        }
      />
    </>
  )
}
