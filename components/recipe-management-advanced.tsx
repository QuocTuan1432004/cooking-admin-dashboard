"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Carrot, Edit, Trash2 } from "lucide-react"
import type { Recipe } from "./recipe-detail-modal"
import { RecipeTableEnhanced } from "./recipe-table-enhanced"
import { RecipeDetailModal } from "./recipe-detail-modal"
import { RecipeFilters } from "./recipe-filters"
import { RecipeEditModalImproved } from "./recipe-edit-modal-improved"
import { RecipeStatsCards } from "./recipe-stats-cards"
import { RecipeBulkActions } from "./recipe-bulk-actions"
import { RecipePagination } from "./recipe-pagination"
import type { Ingredient } from "@/hooks/RecipeApi/recipeTypes"
import { IngredientAddModal } from "./ingredient-add-modal"

interface RecipeManagementAdvancedProps {
  recipes: Recipe[]
  onRecipeUpdate: (recipes: Recipe[]) => void
  showApprovalActions?: boolean
  showFilters?: boolean
  showStats?: boolean
  showBulkActions?: boolean
  title?: string
  onAddRecipe?: () => void
  onEditIngredients?: () => void
  onDeleteIngredients?: () => void
  // Cập nhật props để sử dụng string
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onStatusChange?: (recipeId: string) => void  // Thay đổi từ number thành string
  onDeleteRecipe?: (recipeId: string) => void  // Thay đổi từ number thành string
}

export function RecipeManagementAdvanced({
  recipes,
  onRecipeUpdate,
  showApprovalActions = false,
  showFilters = true,
  showStats = false,
  showBulkActions = false,
  title = "Danh sách công thức",
  onAddRecipe,
  onEditIngredients,
  onDeleteIngredients,
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  onPageChange: propOnPageChange,
  onStatusChange,
  onDeleteRecipe: propOnDeleteRecipe,
}: RecipeManagementAdvancedProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")

  // Modal states
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])  // Thay đổi từ number[] thành string[]

  // Local pagination (chỉ sử dụng khi không có API pagination)
  const [localCurrentPage, setLocalCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sử dụng API pagination nếu có, ngược lại dùng local pagination
  const currentPage = propCurrentPage !== undefined ? propCurrentPage + 1 : localCurrentPage // API pagination bắt đầu từ 0
  const totalPages = propTotalPages || Math.ceil(recipes.length / pageSize)
  const onPageChange = propOnPageChange
    ? (page: number) => propOnPageChange(page - 1) // Convert về 0-based cho API
    : setLocalCurrentPage

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  // Filter recipes (chỉ khi không có API pagination)
  const filteredRecipes = useMemo(() => {
    if (propCurrentPage !== undefined) {
      // Nếu có API pagination, return recipes as is
      return recipes
    }

    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || recipe.status === selectedStatus
      const matchesDate = !selectedDate || recipe.date.includes(selectedDate)

      return matchesSearch && matchesCategory && matchesStatus && matchesDate
    })
  }, [recipes, searchTerm, selectedCategory, selectedStatus, selectedDate, propCurrentPage])

  // Paginate recipes (chỉ khi không có API pagination)
  const paginatedRecipes = useMemo(() => {
    if (propCurrentPage !== undefined) {
      // Nếu có API pagination, return recipes as is
      return recipes
    }

    const startIndex = (localCurrentPage - 1) * pageSize
    return filteredRecipes.slice(startIndex, startIndex + pageSize)
  }, [filteredRecipes, localCurrentPage, pageSize, recipes, propCurrentPage])

  // Reset pagination when filters change
  const handleFilterChange = () => {
    if (propOnPageChange) {
      propOnPageChange(0) // Reset về page 0 cho API
    } else {
      setLocalCurrentPage(1)
    }
    setSelectedIds([])
  }

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDetailModalOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsEditModalOpen(true)
  }

  const handleSaveRecipe = (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map((recipe) => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
    onRecipeUpdate(updatedRecipes)
  }

  const handleDeleteRecipe = (recipeId: string) => {  // Thay đổi từ number thành string
    if (propOnDeleteRecipe) {
      // Sử dụng API delete
      propOnDeleteRecipe(recipeId)
    } else {
      // Local delete
      const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId)
      onRecipeUpdate(updatedRecipes)
    }
    setSelectedIds(selectedIds.filter((id) => id !== recipeId))
  }

  const handleApproveRecipe = (recipeId: string) => {  // Thay đổi từ number thành string
    if (onStatusChange) {
      // Sử dụng API status change
      onStatusChange(recipeId)
    } else {
      // Local update với status mới
      const updatedRecipes = recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, status: "APPROVED" } : recipe,
      )
      onRecipeUpdate(updatedRecipes)
    }
  }

  const handleRejectRecipe = (recipeId: string, reason: string) => {  // Thay đổi từ number thành string
    if (onStatusChange) {
      // Sử dụng API status change
      onStatusChange(recipeId)
    } else {
      // Local update với status mới
      const updatedRecipes = recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, status: "NOT_APPROVED" } : recipe,
      )
      onRecipeUpdate(updatedRecipes)
    }
  }

  const handleBulkAction = (action: string, ids: string[]) => {  // Thay đổi từ number[] thành string[]
    let updatedRecipes = [...recipes]

    switch (action) {
      case "delete":
        updatedRecipes = recipes.filter((recipe) => !ids.includes(recipe.id))
        break
      case "approve":
        updatedRecipes = recipes.map((recipe) =>
          ids.includes(recipe.id) ? { ...recipe, status: "APPROVED" } : recipe,
        )
        break
      case "reject":
        updatedRecipes = recipes.map((recipe) =>
          ids.includes(recipe.id) ? { ...recipe, status: "NOT_APPROVED" } : recipe,
        )
        break
    }

    onRecipeUpdate(updatedRecipes)
    setSelectedIds([]) // Clear selection after bulk action
  }

  const handleAddIngredient = (newIngredient: Omit<Ingredient, "id">) => {
    const ingredient: Ingredient = {
      ...newIngredient,
      id: (Math.max(...ingredients.map((i) => Number(i.id) || 0), 0) + 1).toString(),
    }
    setIngredients([...ingredients, ingredient])
  }

  const getUniqueCategories = () => {
    return [...new Set(recipes.map((recipe) => recipe.category))]
  }

  return (
    <>
      {showStats && <RecipeStatsCards recipes={recipes} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              {onAddRecipe && (
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={onAddRecipe}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm công thức
                </Button>
              )}
              <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsIngredientModalOpen(true)}>
                <Carrot className="w-4 h-4 mr-2" />
                Thêm nguyên liệu
              </Button>
              {onEditIngredients && (
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={onEditIngredients}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa nguyên liệu
                </Button>
              )}
              {onDeleteIngredients && (
                <Button className="bg-red-500 hover:bg-red-600" onClick={onDeleteIngredients}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa nguyên liệu
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div onChange={handleFilterChange}>
              <RecipeFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                categories={getUniqueCategories()}
              />
            </div>
          )}

          {showBulkActions && (
            <RecipeBulkActions
              recipes={paginatedRecipes}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkAction={handleBulkAction}
            />
          )}

          <RecipeTableEnhanced
            recipes={paginatedRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
            selectedIds={showBulkActions ? selectedIds : undefined}
            onSelectionChange={showBulkActions ? setSelectedIds : undefined}
          />

          <RecipePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={propCurrentPage !== undefined ? recipes.length : filteredRecipes.length}
            onPageChange={onPageChange}
            onPageSizeChange={(size) => {
              setPageSize(size)
              if (propOnPageChange) {
                propOnPageChange(0) // Reset về page 0 cho API
              } else {
                setLocalCurrentPage(1)
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedRecipe(null)
        }}
        onApprove={handleApproveRecipe}
        onReject={handleRejectRecipe}
        showApprovalActions={showApprovalActions}
      />

      <RecipeEditModalImproved
        recipe={selectedRecipe}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecipe(null)
        }}
        onSave={handleSaveRecipe}
        ingredients={ingredients}
      />

      <IngredientAddModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSave={handleAddIngredient}
      />
    </>
  )
}
