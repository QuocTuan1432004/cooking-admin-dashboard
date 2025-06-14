"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Recipe } from "./recipe-detail-modal";

interface RecipeEditModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

export function RecipeEditModal({
  recipe,
  isOpen,
  onClose,
  onSave,
}: RecipeEditModalProps) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleOpen = (open: boolean) => {
    if (open && recipe) {
      setEditingRecipe({ ...recipe });
    } else {
      setEditingRecipe(null);
      onClose();
    }
  };

  const handleSave = () => {
    if (editingRecipe) {
      onSave(editingRecipe);
      onClose();
    }
  };

  const updateEditingRecipe = (field: keyof Recipe, value: any) => {
    if (editingRecipe) {
      setEditingRecipe((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    if (editingRecipe && editingRecipe.ingredients) {
      const newIngredients = [...editingRecipe.ingredients];
      newIngredients[index] = value;
      updateEditingRecipe("ingredients", newIngredients);
    }
  };

  const addIngredient = () => {
    if (editingRecipe) {
      const newIngredients = [...(editingRecipe.ingredients || []), ""];
      updateEditingRecipe("ingredients", newIngredients);
    }
  };

  const removeIngredient = (index: number) => {
    if (editingRecipe && editingRecipe.ingredients) {
      const newIngredients = editingRecipe.ingredients.filter(
        (_, i) => i !== index
      );
      updateEditingRecipe("ingredients", newIngredients);
    }
  };

  const updateInstruction = (index: number, value: string) => {
    if (editingRecipe && editingRecipe.instructions) {
      const newInstructions = [...editingRecipe.instructions];
      newInstructions[index] = value;
      updateEditingRecipe("instructions", newInstructions);
    }
  };

  const addInstruction = () => {
    if (editingRecipe) {
      const newInstructions = [...(editingRecipe.instructions || []), ""];
      updateEditingRecipe("instructions", newInstructions);
    }
  };

  const removeInstruction = (index: number) => {
    if (editingRecipe && editingRecipe.instructions) {
      const newInstructions = editingRecipe.instructions.filter(
        (_, i) => i !== index
      );
      updateEditingRecipe("instructions", newInstructions);
    }
  };

  if (!editingRecipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa công thức</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600"
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpen(false)}
              >
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Image
                src={editingRecipe.image || "/placeholder.svg"}
                alt={editingRecipe.name || "Recipe"}
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label className="text-sm font-medium">Tên công thức</Label>
                <Input
                  value={editingRecipe.name || ""}
                  onChange={(e) => updateEditingRecipe("name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Danh mục</Label>
                  <Input
                    value={editingRecipe.category || ""}
                    onChange={(e) =>
                      updateEditingRecipe("category", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Tác giả</Label>
                  <p className="mt-1 py-2">{editingRecipe.author}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Thời gian nấu</Label>
                  <Input
                    value={editingRecipe.cookingTime || ""}
                    onChange={(e) =>
                      updateEditingRecipe("cookingTime", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Khẩu phần</Label>
                  <Input
                    type="number"
                    value={editingRecipe.servings || ""}
                    onChange={(e) =>
                      updateEditingRecipe(
                        "servings",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <Textarea
                  value={editingRecipe.description || ""}
                  onChange={(e) =>
                    updateEditingRecipe("description", e.target.value)
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nguyên liệu</h3>
              <Button size="sm" onClick={addIngredient} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm nguyên liệu
              </Button>
            </div>
            <div className="space-y-2">
              {editingRecipe.ingredients?.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cách làm</h3>
              <Button size="sm" onClick={addInstruction} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm bước
              </Button>
            </div>
            <div className="space-y-4">
              {editingRecipe.instructions?.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
