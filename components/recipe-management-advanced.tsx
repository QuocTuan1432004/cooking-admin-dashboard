"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Recipe } from "./recipe-detail-modal";
import { RecipeTableEnhanced } from "./recipe-table-enhanced";
import { RecipeDetailModal } from "./recipe-detail-modal";
import { RecipeFilters } from "./recipe-filters";
import { RecipeEditModalImproved } from "./recipe-edit-modal-improved";
import { RecipeStatsCards } from "./recipe-stats-cards";
import { RecipeBulkActions } from "./recipe-bulk-actions";
import { RecipePagination } from "./recipe-pagination";

interface RecipeManagementAdvancedProps {
  recipes: Recipe[];
  onRecipeUpdate: (recipes: Recipe[]) => void;
  showApprovalActions?: boolean;
  showRating?: boolean;
  showViews?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  showBulkActions?: boolean;
  title?: string;
  onAddRecipe?: () => void;
}

export function RecipeManagementAdvanced({
  recipes,
  onRecipeUpdate,
  showApprovalActions = false,
  showRating = false,
  showViews = false,
  showFilters = true,
  showStats = false,
  showBulkActions = false,
  title = "Danh sách công thức",
  onAddRecipe,
}: RecipeManagementAdvancedProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal states
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || recipe.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || recipe.status === selectedStatus;
      const matchesDate = !selectedDate || recipe.date.includes(selectedDate);

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [recipes, searchTerm, selectedCategory, selectedStatus, selectedDate]);

  // Paginate recipes
  const paginatedRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecipes.slice(startIndex, startIndex + pageSize);
  }, [filteredRecipes, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecipes.length / pageSize);

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailModalOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleSaveRecipe = (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    );
    onRecipeUpdate(updatedRecipes);
  };

  const handleDeleteRecipe = (recipeId: number) => {
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
    onRecipeUpdate(updatedRecipes);
    setSelectedIds(selectedIds.filter((id) => id !== recipeId));
  };

  const handleApproveRecipe = (recipeId: number) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId
        ? { ...recipe, status: "approved" as const }
        : recipe
    );
    onRecipeUpdate(updatedRecipes);
  };

  const handleRejectRecipe = (recipeId: number, reason: string) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId
        ? { ...recipe, status: "rejected" as const }
        : recipe
    );
    onRecipeUpdate(updatedRecipes);
  };

  const handleToggleFeatured = (recipeId: number) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId
        ? { ...recipe, featured: !recipe.featured }
        : recipe
    );
    onRecipeUpdate(updatedRecipes);
  };

  const handleBulkAction = (action: string, ids: number[]) => {
    let updatedRecipes = [...recipes];

    switch (action) {
      case "delete":
        updatedRecipes = recipes.filter((recipe) => !ids.includes(recipe.id));
        break;
      case "approve":
        updatedRecipes = recipes.map((recipe) =>
          ids.includes(recipe.id)
            ? { ...recipe, status: "approved" as const }
            : recipe
        );
        break;
      case "reject":
        updatedRecipes = recipes.map((recipe) =>
          ids.includes(recipe.id)
            ? { ...recipe, status: "rejected" as const }
            : recipe
        );
        break;
      case "feature":
        updatedRecipes = recipes.map((recipe) =>
          ids.includes(recipe.id)
            ? { ...recipe, featured: !recipe.featured }
            : recipe
        );
        break;
    }

    onRecipeUpdate(updatedRecipes);
  };

  const getUniqueCategories = () => {
    return [...new Set(recipes.map((recipe) => recipe.category))];
  };

  return (
    <>
      {showStats && <RecipeStatsCards recipes={recipes} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            {onAddRecipe && (
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={onAddRecipe}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm công thức
              </Button>
            )}
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
            onApprove={handleApproveRecipe}
            onReject={handleRejectRecipe}
            onToggleFeatured={handleToggleFeatured}
            showApprovalActions={showApprovalActions}
            showRating={showRating}
            showViews={showViews}
            selectedIds={showBulkActions ? selectedIds : undefined}
            onSelectionChange={showBulkActions ? setSelectedIds : undefined}
          />

          <RecipePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredRecipes.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecipe(null);
        }}
      />

      <RecipeEditModalImproved
        recipe={selectedRecipe}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        onSave={handleSaveRecipe}
      />
    </>
  );
}
