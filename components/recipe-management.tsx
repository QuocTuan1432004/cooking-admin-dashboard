"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Recipe } from "./recipe-detail-modal";
import { RecipeTable } from "./recipe-table";
import { RecipeDetailModal } from "./recipe-detail-modal";
import { RecipeEditModal } from "./recipe-edit-modal";
import { RecipeFilters } from "./recipe-filters";

interface RecipeManagementProps {
  recipes: Recipe[];
  onRecipeUpdate: (recipes: Recipe[]) => void;
  showApprovalActions?: boolean;
  showRating?: boolean;
  showViews?: boolean;
  showFilters?: boolean;
  title?: string;
  onAddRecipe?: () => void;
}

export function RecipeManagement({
  recipes,
  onRecipeUpdate,
  showApprovalActions = false,
  showRating = false,
  showViews = false,
  showFilters = true,
  title = "Danh sách công thức",
  onAddRecipe,
}: RecipeManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const getUniqueCategories = () => {
    return [...new Set(recipes.map((recipe) => recipe.category))];
  };

  const filteredRecipes = recipes.filter((recipe) => {
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

  return (
    <>
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
          )}

          <RecipeTable
            recipes={filteredRecipes}
            onView={handleViewRecipe}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
            onApprove={handleApproveRecipe}
            onReject={handleRejectRecipe}
            onToggleFeatured={handleToggleFeatured}
            showApprovalActions={showApprovalActions}
            showRating={showRating}
            showViews={showViews}
          />

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                «
              </Button>
              <Button size="sm" className="bg-orange-500 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                »
              </Button>
            </div>
          </div>
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

      <RecipeEditModal
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
