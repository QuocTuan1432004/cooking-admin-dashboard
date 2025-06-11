"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Save,
  ArrowLeft,
  Clock,
  ChefHat,
  ImageIcon,
  X,
} from "lucide-react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface Recipe {
  title: string;
  description: string;
  img: string;
  cookingTime: string;
  difficulty: "Easy" | "Medium" | "Hard" | "";
  parentCategory: string;
  subCategory: string;
  ingredients: string[];
  instructions: string[];
}

export default function CreateRecipePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Sample categories data
  const categories: Category[] = [
    {
      id: 1,
      name: "Món chính",
      children: [
        { id: 11, name: "Món xào" },
        { id: 12, name: "Món kho" },
        { id: 13, name: "Món nướng" },
        { id: 14, name: "Món luộc" },
      ],
    },
    {
      id: 2,
      name: "Món canh",
      children: [
        { id: 21, name: "Canh chua" },
        { id: 22, name: "Canh ngọt" },
        { id: 23, name: "Súp" },
      ],
    },
    {
      id: 3,
      name: "Món tráng miệng",
      children: [
        { id: 31, name: "Bánh ngọt" },
        { id: 32, name: "Chè" },
        { id: 33, name: "Kem" },
        { id: 34, name: "Trái cây" },
      ],
    },
    {
      id: 4,
      name: "Đồ uống",
      children: [
        { id: 41, name: "Sinh tố" },
        { id: 42, name: "Nước ép" },
        { id: 43, name: "Trà" },
        { id: 44, name: "Cà phê" },
      ],
    },
  ];

  const [recipe, setRecipe] = useState<Recipe>({
    title: "",
    description: "",
    img: "",
    cookingTime: "",
    difficulty: "",
    parentCategory: "",
    subCategory: "",
    ingredients: [""],
    instructions: [""],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Recipe, value: string) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleParentCategoryChange = (value: string) => {
    setRecipe((prev) => ({
      ...prev,
      parentCategory: value,
      subCategory: "", // Reset subcategory when parent changes
    }));
  };

  const getSubCategories = () => {
    const parentCat = categories.find(
      (cat) => cat.id.toString() === recipe.parentCategory
    );
    return parentCat?.children || [];
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setRecipe((prev) => ({ ...prev, img: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? value : ingredient
      ),
    }));
  };

  const addInstruction = () => {
    setRecipe((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) =>
        i === index ? value : instruction
      ),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!recipe.title.trim()) newErrors.title = "Tên công thức là bắt buộc";
    if (!recipe.description.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (!recipe.cookingTime.trim())
      newErrors.cookingTime = "Thời gian nấu là bắt buộc";
    if (!recipe.difficulty) newErrors.difficulty = "Độ khó là bắt buộc";
    if (!recipe.parentCategory)
      newErrors.parentCategory = "Danh mục chính là bắt buộc";
    if (!recipe.subCategory) newErrors.subCategory = "Danh mục con là bắt buộc";
    if (!recipe.img) newErrors.img = "Hình ảnh là bắt buộc";

    const validIngredients = recipe.ingredients.filter((ing) => ing.trim());
    if (validIngredients.length === 0)
      newErrors.ingredients = "Ít nhất một nguyên liệu là bắt buộc";

    const validInstructions = recipe.instructions.filter((inst) => inst.trim());
    if (validInstructions.length === 0)
      newErrors.instructions = "Ít nhất một bước làm là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Công thức đã được tạo thành công!");
      router.push("/recipes");
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div>
      <Header title="Thêm công thức mới" showSearch={false} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">
                    Tên công thức <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={recipe.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Nhập tên công thức..."
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cookingTime">
                    Thời gian nấu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="cookingTime"
                      value={recipe.cookingTime}
                      onChange={(e) =>
                        handleInputChange("cookingTime", e.target.value)
                      }
                      placeholder="VD: 30 phút"
                      className={`pl-10 ${
                        errors.cookingTime ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.cookingTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cookingTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">
                  Mô tả <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  value={recipe.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả về công thức này..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="difficulty">
                  Độ khó <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={recipe.difficulty}
                  onValueChange={(value) =>
                    handleInputChange("difficulty", value)
                  }
                >
                  <SelectTrigger
                    className={errors.difficulty ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(
                          "Easy"
                        )}`}
                      >
                        Dễ
                      </span>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(
                          "Medium"
                        )}`}
                      >
                        Trung bình
                      </span>
                    </SelectItem>
                    <SelectItem value="Hard">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(
                          "Hard"
                        )}`}
                      >
                        Khó
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.difficulty}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
                Hình ảnh công thức
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-orange-500 bg-orange-50"
                      : errors.img
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-orange-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="mx-auto rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white"
                        onClick={() => {
                          setImagePreview(null);
                          setRecipe((prev) => ({ ...prev, img: "" }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Kéo thả hình ảnh vào đây hoặc
                      </p>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-orange-600 hover:text-orange-700 font-medium">
                          chọn file
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG, GIF tối đa 10MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.img && (
                  <p className="text-red-500 text-sm">{errors.img}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-green-500" />
                Danh mục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="parentCategory">
                    Danh mục chính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recipe.parentCategory}
                    onValueChange={handleParentCategoryChange}
                  >
                    <SelectTrigger
                      className={errors.parentCategory ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn danh mục chính" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parentCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.parentCategory}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subCategory">
                    Danh mục con <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recipe.subCategory}
                    onValueChange={(value) =>
                      handleInputChange("subCategory", value)
                    }
                    disabled={!recipe.parentCategory}
                  >
                    <SelectTrigger
                      className={errors.subCategory ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn danh mục con" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubCategories().map((subCategory) => (
                        <SelectItem
                          key={subCategory.id}
                          value={subCategory.id.toString()}
                        >
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subCategory}
                    </p>
                  )}
                  {!recipe.parentCategory && (
                    <p className="text-gray-500 text-sm mt-1">
                      Vui lòng chọn danh mục chính trước
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Nguyên liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        value={ingredient}
                        onChange={(e) =>
                          updateIngredient(index, e.target.value)
                        }
                        placeholder={`Nguyên liệu ${index + 1}...`}
                      />
                    </div>
                    {recipe.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  + Thêm nguyên liệu
                </Button>
                {errors.ingredients && (
                  <p className="text-red-500 text-sm">{errors.ingredients}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Cách làm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction}
                        onChange={(e) =>
                          updateInstruction(index, e.target.value)
                        }
                        placeholder={`Bước ${index + 1}...`}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    {recipe.instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                  className="w-full"
                >
                  + Thêm bước làm
                </Button>
                {errors.instructions && (
                  <p className="text-red-500 text-sm">{errors.instructions}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Đang lưu..." : "Tạo công thức"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
