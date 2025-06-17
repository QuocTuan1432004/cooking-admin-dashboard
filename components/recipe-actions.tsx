"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { Recipe } from "./recipe-detail-modal";

interface RecipeActionsProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: number) => void;
}

export function RecipeActions({
  recipe,
  onView,
  onEdit,
  onDelete,
}: RecipeActionsProps) {
  return (
    <div className="flex space-x-2">
      {/* View Button */}
      <Button
        size="sm"
        variant="outline"
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
        onClick={() => onView(recipe)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {/* Edit Button */}
      <Button size="sm" variant="outline" onClick={() => onEdit(recipe)}>
        <Edit className="w-4 h-4" />
      </Button>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa công thức "{recipe.name}"? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(recipe.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
