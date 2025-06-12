"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
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
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Folder,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  children?: Category[];
  recipeCount: number;
  image?: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [unreadNotifications] = useState(3);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Món chính",
      description: "Các món ăn chính trong bữa cơm",
      recipeCount: 45,
      children: [
        {
          id: 11,
          name: "Món xào",
          parentId: 1,
          recipeCount: 15,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 12,
          name: "Món kho",
          parentId: 1,
          recipeCount: 12,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 13,
          name: "Món nướng",
          parentId: 1,
          recipeCount: 18,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: 2,
      name: "Món canh",
      description: "Các loại canh và súp",
      recipeCount: 28,
      children: [
        {
          id: 21,
          name: "Canh chua",
          parentId: 2,
          recipeCount: 8,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 22,
          name: "Canh ngọt",
          parentId: 2,
          recipeCount: 12,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 23,
          name: "Súp",
          parentId: 2,
          recipeCount: 8,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: 3,
      name: "Món tráng miệng",
      description: "Bánh kẹo và đồ ngọt",
      recipeCount: 35,
      children: [
        {
          id: 31,
          name: "Bánh ngọt",
          parentId: 3,
          recipeCount: 20,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 32,
          name: "Chè",
          parentId: 3,
          recipeCount: 10,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 33,
          name: "Kem",
          parentId: 3,
          recipeCount: 5,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: 4,
      name: "Đồ uống",
      description: "Nước uống và sinh tố",
      recipeCount: 17,
      children: [
        {
          id: 41,
          name: "Sinh tố",
          parentId: 4,
          recipeCount: 8,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 42,
          name: "Nước ép",
          parentId: 4,
          recipeCount: 6,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 43,
          name: "Trà",
          parentId: 4,
          recipeCount: 3,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [subCategoryImage, setSubCategoryImage] = useState<string>("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentId: "",
    image: "",
  });

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSubCategoryImage(result);
        setNewCategory((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = () => {
    const id = Math.max(...categories.map((c) => c.id)) + 1;
    const category: Category = {
      id,
      name: newCategory.name,
      description: newCategory.description,
      parentId: newCategory.parentId
        ? Number.parseInt(newCategory.parentId)
        : undefined,
      recipeCount: 0,
      image: newCategory.parentId ? newCategory.image : undefined,
    };

    if (newCategory.parentId) {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === Number.parseInt(newCategory.parentId)) {
            return {
              ...cat,
              children: [...(cat.children || []), category],
            };
          }
          return cat;
        })
      );
    } else {
      setCategories((prev) => [...prev, { ...category, children: [] }]);
    }

    setNewCategory({ name: "", description: "", parentId: "", image: "" });
    setSubCategoryImage("");
    setIsCreateDialogOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: number, parentId?: number) => {
    if (parentId) {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === parentId) {
            return {
              ...cat,
              children:
                cat.children?.filter((child) => child.id !== categoryId) || [],
            };
          }
          return cat;
        })
      );
    } else {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    }
  };

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentId);
  };

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <div>
      <Header
        title="Quản lý Danh mục"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadNotifications}
      />

      {/* Create Category Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Create Main Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-orange-500" />
              Tạo danh mục chính
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="main-category-name">Tên danh mục</Label>
              <Input
                id="main-category-name"
                placeholder="Nhập tên danh mục chính"
                value={newCategory.parentId === "" ? newCategory.name : ""}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    name: e.target.value,
                    parentId: "",
                  }))
                }
              />
            </div>
            <div></div>
            <Button
              onClick={handleCreateCategory}
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={!newCategory.name}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo danh mục chính
            </Button>
          </CardContent>
        </Card>

        {/* Create Subcategory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="w-5 h-5 mr-2 text-blue-500" />
              Tạo danh mục con
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="parent-category">Danh mục cha</Label>
              <Select
                value={newCategory.parentId}
                onValueChange={(value) =>
                  setNewCategory((prev) => ({ ...prev, parentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  {getParentCategories().map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-category-name">Tên danh mục con</Label>
              <Input
                id="sub-category-name"
                placeholder="Nhập tên danh mục con"
                value={newCategory.parentId !== "" ? newCategory.name : ""}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="sub-category-image">Hình ảnh danh mục</Label>
              <div className="space-y-3">
                {subCategoryImage ? (
                  <div className="relative inline-block">
                    <Image
                      src={subCategoryImage || "/placeholder.svg"}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 bg-white"
                      onClick={() => {
                        setSubCategoryImage("");
                        setNewCategory((prev) => ({ ...prev, image: "" }));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Chọn hình ảnh</p>
                    <label
                      htmlFor="sub-image-upload"
                      className="cursor-pointer"
                    >
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Tải lên file
                      </span>
                      <input
                        id="sub-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleCreateCategory}
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={!newCategory.name || !newCategory.parentId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo danh mục con
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories Display */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                {/* Main Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {category.recipeCount} công thức
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {category.children && category.children.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {category.children.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between p-3 bg-white rounded border"
                      >
                        <div className="flex items-center space-x-3">
                          <Folder className="w-5 h-5 text-blue-500" />
                          {subcategory.image && (
                            <Image
                              src={subcategory.image || "/placeholder.svg"}
                              alt={subcategory.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{subcategory.name}</h4>
                            <p className="text-gray-500 text-xs">
                              {subcategory.recipeCount} công thức
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(subcategory)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteCategory(subcategory.id, category.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
