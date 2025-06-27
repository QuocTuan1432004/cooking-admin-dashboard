import Image from "next/image";
import type { Recipe } from "./recipe-detail-modal";
import { RecipeStatusBadge } from "./recipe-status-badge";
import { RecipeActions } from "./recipe-actions";

interface RecipeTableProps {
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: number) => void;
  showRating?: boolean;
  showViews?: boolean;
}

export function RecipeTable({
  recipes,
  onView,
  onEdit,
  onDelete,
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
              Tác giả
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
                  alt={recipe.name || "Placeholder image"}
                  width={50}
                  height={50}
                  className="rounded-lg object-cover"
                />
              </td>
              <td className="py-3 px-4 font-medium">{recipe.name}</td>
              <td className="py-3 px-4 text-gray-600">{recipe.category}</td>
              <td className="py-3 px-4">{recipe.author}</td>
              <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
              <td className="py-3 px-4">
                <RecipeStatusBadge
                  status={recipe.status as "pending" | "approved" | "rejected"}
                />
              </td>
              {showViews && (
                <td className="py-3 px-4 text-gray-600">
                  {recipe.views?.toLocaleString() || 0}
                </td>
              )}
              {showRating && (
                <td className="py-3 px-4">
                  <div className="flex items-center">
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
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
