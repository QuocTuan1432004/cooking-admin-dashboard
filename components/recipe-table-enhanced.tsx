"use client";

import type React from "react";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Star, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import type { Recipe } from "./recipe-detail-modal";
import { RecipeStatusBadge } from "./recipe-status-badge";
import { RecipeActions } from "./recipe-actions";

interface RecipeTableEnhancedProps {
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: number) => void;
  onApprove?: (recipeId: number) => void;
  onReject?: (recipeId: number, reason: string) => void;
  onToggleFeatured?: (recipeId: number) => void;
  showApprovalActions?: boolean;
  showRating?: boolean;
  showViews?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

type SortField =
  | "name"
  | "category"
  | "author"
  | "date"
  | "status"
  | "rating"
  | "views";
type SortDirection = "asc" | "desc";

export function RecipeTableEnhanced({
  recipes,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleFeatured,
  showApprovalActions = false,
  showRating = false,
  showViews = false,
  selectedIds = [],
  onSelectionChange,
}: RecipeTableEnhancedProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowSelection = (recipeId: number, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedIds, recipeId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== recipeId));
    }
  };

  const sortedRecipes = [...recipes].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle special cases
    if (sortField === "date") {
      aValue = new Date(a.date.split("/").reverse().join("-"));
      bValue = new Date(b.date.split("/").reverse().join("-"));
    }

    if (sortField === "rating") {
      aValue = a.rating || 0;
      bValue = b.rating || 0;
    }

    if (sortField === "views") {
      aValue = a.views || 0;
      bValue = b.views || 0;
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold"
    >
      {children}
      <ArrowUpDown className="w-4 h-4 ml-1" />
    </Button>
  );

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có công thức nào.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {onSelectionChange && (
              <th className="text-left py-3 px-4 w-12">
                <span className="sr-only">Chọn</span>
              </th>
            )}
            <th className="text-left py-3 px-4">Ảnh</th>
            <th className="text-left py-3 px-4">
              <SortButton field="name">Tên công thức</SortButton>
            </th>
            <th className="text-left py-3 px-4">
              <SortButton field="category">Danh mục</SortButton>
            </th>
            <th className="text-left py-3 px-4">
              <SortButton field="author">
                {showApprovalActions ? "Người đăng" : "Tác giả"}
              </SortButton>
            </th>
            <th className="text-left py-3 px-4">
              <SortButton field="date">Ngày đăng</SortButton>
            </th>
            <th className="text-left py-3 px-4">
              <SortButton field="status">Trạng thái</SortButton>
            </th>
            {showViews && (
              <th className="text-left py-3 px-4">
                <SortButton field="views">Lượt xem</SortButton>
              </th>
            )}
            {showRating && (
              <th className="text-left py-3 px-4">
                <SortButton field="rating">Đánh giá</SortButton>
              </th>
            )}
            <th className="text-left py-3 px-4">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecipes.map((recipe) => (
            <tr
              key={recipe.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {onSelectionChange && (
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedIds.includes(recipe.id)}
                    onCheckedChange={(checked) =>
                      handleRowSelection(recipe.id, checked as boolean)
                    }
                  />
                </td>
              )}
              <td className="py-3 px-4">
                <Image
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.name}
                  width={50}
                  height={50}
                  className="rounded-lg object-cover"
                />
              </td>
              <td className="py-3 px-4 font-medium">
                <div className="flex items-center">
                  {recipe.name}
                  {recipe.featured && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-purple-100 text-purple-800"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Nổi bật
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">{recipe.category}</td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <span>{recipe.author}</span>
                  {recipe.isNew && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      Mới
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
              <td className="py-3 px-4">
                <RecipeStatusBadge status={recipe.status} />
              </td>
              {showViews && (
                <td className="py-3 px-4 text-gray-600">
                  {recipe.views?.toLocaleString() || 0}
                </td>
              )}
              {showRating && (
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <Star
                      className={`w-4 h-4 ${
                        (recipe.rating || 0) > 0
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                    <span className="ml-1">
                      {(recipe.rating || 0) > 0
                        ? recipe.rating?.toFixed(1)
                        : "-"}
                    </span>
                  </div>
                </td>
              )}
              <td className="py-3 px-4">
                <RecipeActions
                  recipe={recipe}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                  onToggleFeatured={onToggleFeatured}
                  showApprovalActions={showApprovalActions}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
