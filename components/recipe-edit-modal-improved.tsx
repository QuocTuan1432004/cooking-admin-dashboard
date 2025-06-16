"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import Image from "next/image";
import type { Recipe } from "./recipe-detail-modal";

interface RecipeEditModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

const CATEGORIES = [
  "Món kho",
  "Món xào",
  "Món canh",
  "Món nước",
  "Món tráng miệng",
  "Món chính",
  "Món phụ",
];

export function RecipeEditModalImproved({
  recipe,
  isOpen,
  onClose,
  onSave,
}: RecipeEditModalProps) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Đồng bộ recipe với editingRecipe khi modal mở
  useEffect(() => {
    if (isOpen && recipe) {
      setEditingRecipe({
        ...recipe,
        ingredients: recipe.ingredients || [""],
        instructions: recipe.instructions || [""],
      });
      setErrors({});
    } else if (!isOpen) {
      setEditingRecipe(null);
      setErrors({});
    }
  }, [isOpen, recipe]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editingRecipe?.name?.trim()) {
      newErrors.name = "Tên công thức không được để trống";
    }

    if (!editingRecipe?.category?.trim()) {
      newErrors.category = "Danh mục không được để trống";
    }

    if (!editingRecipe?.description?.trim()) {
      newErrors.description = "Mô tả không được để trống";
    }

    if (!editingRecipe?.ingredients?.some((ing) => ing.trim())) {
      newErrors.ingredients = "Phải có ít nhất một nguyên liệu";
    }

    if (!editingRecipe?.instructions?.some((inst) => inst.trim())) {
      newErrors.instructions = "Phải có ít nhất một bước hướng dẫn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!editingRecipe) return;

    if (!validateForm()) {
      return;
    }

    // Lọc bỏ các nguyên liệu và hướng dẫn trống
    const cleanedRecipe = {
      ...editingRecipe,
      ingredients: editingRecipe.ingredients?.filter((ing) => ing.trim()) || [],
      instructions:
        editingRecipe.instructions?.filter((inst) => inst.trim()) || [],
    };

    onSave(cleanedRecipe);
    onClose();
  };

  const handleCancel = () => {
    setEditingRecipe(null);
    setErrors({});
    onClose();
  };

  const updateEditingRecipe = (field: keyof Recipe, value: any) => {
    if (editingRecipe) {
      setEditingRecipe((prev) => (prev ? { ...prev, [field]: value } : null));
      // Xóa lỗi khi user bắt đầu sửa
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
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
    if (
      editingRecipe &&
      editingRecipe.ingredients &&
      editingRecipe.ingredients.length > 1
    ) {
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
    if (
      editingRecipe &&
      editingRecipe.instructions &&
      editingRecipe.instructions.length > 1
    ) {
      const newInstructions = editingRecipe.instructions.filter(
        (_, i) => i !== index
      );
      updateEditingRecipe("instructions", newInstructions);
    }
  };

  if (!editingRecipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa công thức: {editingRecipe.name}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
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
              <div className="mt-2">
                <Label className="text-sm font-medium">URL ảnh</Label>
                <Input
                  value={editingRecipe.image || ""}
                  onChange={(e) => updateEditingRecipe("image", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Tên công thức <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={editingRecipe.name || ""}
                  onChange={(e) => updateEditingRecipe("name", e.target.value)}
                  className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Nhập tên công thức"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Danh mục <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={editingRecipe.category || ""}
                    onValueChange={(value) =>
                      updateEditingRecipe("category", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 ${
                        errors.category ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Tác giả</Label>
                  <Input
                    value={editingRecipe.author || ""}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
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
                    placeholder="VD: 30 phút"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Khẩu phần</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingRecipe.servings || ""}
                    onChange={(e) =>
                      updateEditingRecipe(
                        "servings",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className="mt-1"
                    placeholder="Số người ăn"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Mô tả <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={editingRecipe.description || ""}
                  onChange={(e) =>
                    updateEditingRecipe("description", e.target.value)
                  }
                  className={`mt-1 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  rows={3}
                  placeholder="Mô tả ngắn về công thức"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Nguyên liệu <span className="text-red-500">*</span>
                </h3>
                {errors.ingredients && (
                  <p className="text-red-500 text-sm">{errors.ingredients}</p>
                )}
              </div>
              <Button size="sm" onClick={addIngredient} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm nguyên liệu
              </Button>
            </div>
            <div className="space-y-2">
              {editingRecipe.ingredients?.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-8">
                    {index + 1}.
                  </span>
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1"
                    placeholder="VD: 500g thịt heo"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:bg-red-50"
                    disabled={editingRecipe.ingredients?.length === 1}
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
              <div>
                <h3 className="text-lg font-semibold">
                  Cách làm <span className="text-red-500">*</span>
                </h3>
                {errors.instructions && (
                  <p className="text-red-500 text-sm">{errors.instructions}</p>
                )}
              </div>
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
                      placeholder="Mô tả chi tiết bước làm..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600 hover:bg-red-50"
                      disabled={editingRecipe.instructions?.length === 1}
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
