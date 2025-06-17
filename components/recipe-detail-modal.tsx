import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export interface Recipe {
  id: number;
  name: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  rating?: number;
  views?: number;
  featured?: boolean;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: number;
  isNew?: boolean;
}

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết công thức</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Image
                src={recipe.image || "/placeholder.svg"}
                alt={recipe.name || "Recipe"}
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{recipe.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Danh mục</Label>
                  <p className="mt-1">{recipe.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tác giả</Label>
                  <p className="mt-1">{recipe.author}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Thời gian nấu</Label>
                  <p className="mt-1">
                    {recipe.cookingTime || "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Khẩu phần</Label>
                  <p className="mt-1">
                    {recipe.servings
                      ? `${recipe.servings} người`
                      : "Chưa có thông tin"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="mt-1 text-gray-600">
                  {recipe.description || "Chưa có mô tả"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nguyên liệu</h3>
            <div className="space-y-2">
              {recipe.ingredients?.map((ingredient, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span>{ingredient}</span>
                </div>
              )) || (
                <p className="text-gray-500">Chưa có thông tin nguyên liệu</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cách làm</h3>
            <div className="space-y-4">
              {recipe.instructions?.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p>{instruction}</p>
                  </div>
                </div>
              )) || <p className="text-gray-500">Chưa có hướng dẫn</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
