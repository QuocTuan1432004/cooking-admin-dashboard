import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import type { Recipe } from "./recipe-detail-modal";
import { RecipeStatusBadge } from "./recipe-status-badge";
import { RecipeActions } from "./recipe-actions";

interface RecipeTableProps {
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
}

export function RecipeTable({
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
}: RecipeTableProps) {
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
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Ảnh
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Tên công thức
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Danh mục
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              {showApprovalActions ? "Người đăng" : "Tác giả"}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Ngày đăng
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Trạng thái
            </th>
            {showViews && (
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Lượt xem
              </th>
            )}
            {showRating && (
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Đánh giá
              </th>
            )}
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr
              key={recipe.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
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
