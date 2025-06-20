"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { useRouter } from "next/navigation"
import type { Recipe } from "@/components/recipe-detail-modal"
import { RecipeManagementAdvanced } from "@/components/recipe-management-advanced"
import { IngredientEditModal } from "@/components/ingredient-edit-modal"
import { IngredientDeleteModal } from "@/components/ingredient-delete-modal"
import type { RecipeResponse } from "@/hooks/RecipeApi/recipeTypes"
import { getAllRecipe, changeRecipeStatus, deleteRecipe } from "@/hooks/RecipeApi/recipeApi"

export default function RecipesPage() {
  const router = useRouter()
  const [unreadNotifications] = useState(3)
  const [isIngredientEditOpen, setIsIngredientEditOpen] = useState(false)
  const [isIngredientDeleteOpen, setIsIngredientDeleteOpen] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 5

  // Load recipes from API
  useEffect(() => {
    loadRecipes()
  }, [currentPage])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllRecipe(currentPage, pageSize)
      const apiRecipes = response.result.content

      // Convert API response to local Recipe format
      const convertedRecipes: Recipe[] = apiRecipes.map((apiRecipe: RecipeResponse) => ({
        id: apiRecipe.id,
        name: apiRecipe.title,
        title: apiRecipe.title,
        category: apiRecipe.subCategoryName || "Không xác định",
        author: apiRecipe.accountName || "Không xác định",
        date: new Date(apiRecipe.createAt).toLocaleDateString("vi-VN"),
        image: apiRecipe.image || "/placeholder.svg?height=60&width=60",
        status: apiRecipe.status,
        rating: 0,
        views: Number.parseInt(apiRecipe.totalLikes?.toString() || "0"),
        description: apiRecipe.description,
        difficulty: apiRecipe.difficulty, // THÊM DÒNG NÀY
        ingredients: [],
        instructions: [],
        cookingTime: apiRecipe.cookingTime,
        servings: 4,
      }))

      console.log("Converted Recipes:", convertedRecipes)
      setRecipes(convertedRecipes)
      setTotalPages(response.result.totalPages)
      setTotalElements(response.result.totalElements)
    } catch (error) {
      setError("Không thể tải danh sách công thức")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (recipeId: string) => {
    // Thay đổi từ number thành string
    try {
      setLoading(true)
      await changeRecipeStatus(recipeId)

      // Reload recipes to get updated status
      await loadRecipes()
    } catch (error) {
      setError("Không thể thay đổi trạng thái công thức")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    // Thay đổi từ number thành string
    try {
      setLoading(true)
      await deleteRecipe(recipeId)

      // Reload recipes after deletion
      await loadRecipes()
    } catch (error) {
      setError("Không thể xóa công thức")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    router.push("/login")
  }

  // Get all unique ingredients from all recipes
  const getAllIngredientsFromRecipes = (): string[] => {
    const allIngredients = recipes.flatMap((recipe) => recipe.ingredients || [])
    return [...new Set(allIngredients)]
  }

  const handleIngredientEdit = (updatedIngredients: string[]) => {
    // Ingredients are managed separately via IngredientEditModal's API calls
    // No need to do anything here as the modal handles API calls internally
  }

  const handleIngredientDelete = (updatedIngredients: string[]) => {
    // Ingredients are managed separately via IngredientDeleteModal's API calls
    // No need to do anything here as the modal handles API calls internally
  }

  const handleRecipeUpdate = (updatedRecipes: Recipe[]) => {
    setRecipes(updatedRecipes)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <>
      <div>
        <Header
          title="Quản lý Công thức"
          showSearch={false}
          userName="Nguyễn Huỳnh Quốc Tuấn"
          onLogout={handleLogout}
          notificationCount={unreadNotifications}
        />

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải công thức...</span>
          </div>
        )}

        <RecipeManagementAdvanced
          recipes={recipes}
          onRecipeUpdate={handleRecipeUpdate}
          showApprovalActions={true}
          showFilters={false} // Thay đổi từ true thành false để ẩn bộ lọc
          showStats={false} // Thay đổi từ true thành false để ẩn stats (đánh giá TB, tổng lượt xem)
          showBulkActions={false} // Thay đổi từ true thành false để ẩn bulk actions (chọn tất cả)
          title={`Danh sách công thức (${totalElements} công thức)`}
          onAddRecipe={() => router.push("/recipes/create")}
          onEditIngredients={() => setIsIngredientEditOpen(true)}
          onDeleteIngredients={() => setIsIngredientDeleteOpen(true)}
          // API pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          // API action handlers
          onDeleteRecipe={handleDeleteRecipe}
        />
      </div>

      {/* Ingredient Edit Modal */}
      <IngredientEditModal
        isOpen={isIngredientEditOpen}
        onClose={() => setIsIngredientEditOpen(false)}
        ingredients={getAllIngredientsFromRecipes()}
        onSave={handleIngredientEdit}
      />

      {/* Ingredient Delete Modal */}
      <IngredientDeleteModal
        isOpen={isIngredientDeleteOpen}
        onClose={() => setIsIngredientDeleteOpen(false)}
        ingredients={getAllIngredientsFromRecipes()}
        onDelete={handleIngredientDelete}
      />
    </>
  )
}
