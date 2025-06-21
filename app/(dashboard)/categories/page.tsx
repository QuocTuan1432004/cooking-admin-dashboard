"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, FolderOpen, Folder, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/userAuth"
import {
  getAllMainCategories,
  createMainCategory,
  updateMainCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteMainCategory,
} from "@/hooks/categoryApi/categoryApi"
import type { Category } from "@/hooks/categoryApi/types"

export default function CategoriesPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [unreadNotifications] = useState(3)
  const [categories, setCategories] = useState<Category[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingMainCategory, setIsCreatingMainCategory] = useState(false)
  const [isCreatingSubCategory, setIsCreatingSubCategory] = useState(false)
  const [isUpdatingMainCategory, setIsUpdatingMainCategory] = useState(false)
  const [isUpdatingSubCategory, setIsUpdatingSubCategory] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  // State cho create form
  const [newCategory, setNewCategory] = useState({
    name: "",
    parentId: "",
    image: "" as string | File,
  })
  const [createSubCategoryImage, setCreateSubCategoryImage] = useState<string>("")
  const [createMainCategoryImage, setCreateMainCategoryImage] = useState<string>("")

  // State cho edit form - tách riêng và để trống
  const [editCategory, setEditCategory] = useState({
    name: "",
    parentId: "",
    image: "" as string | File,
  })
  const [editSubCategoryImage, setEditSubCategoryImage] = useState<string>("")
  const [editMainCategoryImage, setEditMainCategoryImage] = useState<string>("")

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    isOpen: false,
    categoryId: "",
    categoryName: "",
    parentId: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [isUpdateSubDialogOpen, setIsUpdateSubDialogOpen] = useState(false)
  const [selectKey, setSelectKey] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const categoriesWithSub = await getAllMainCategories()
        setCategories(categoriesWithSub)
      } catch (error) {
        console.error("Không thể lấy danh mục:", error)
        setError("Không thể tải danh mục. Vui lòng thử lại.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCreateImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setNewCategory((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCreateSubCategoryImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateMainCategoryImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setNewCategory((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCreateMainCategoryImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setEditCategory((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditSubCategoryImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditMainCategoryImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setEditCategory((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditMainCategoryImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateCategory = async () => {
    // Validation
    if (!newCategory.name.trim()) {
      setError("Vui lòng nhập tên danh mục")
      return
    }

    try {
      if (newCategory.parentId) {
        // Tạo subcategory
        setIsCreatingSubCategory(true)
        const newSubCategory = await createSubCategory(
          newCategory.parentId,
          newCategory.name.trim(),
          newCategory.image as File,
        )

        // Đảm bảo subcategory có ID hợp lệ
        if (!newSubCategory.id) {
          throw new Error("Không thể tạo danh mục con - ID không hợp lệ")
        }

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === newCategory.parentId ? { ...cat, children: [...(cat.children || []), newSubCategory] } : cat,
          ),
        )
      } else {
        // Tạo main category
        setIsCreatingMainCategory(true)

        // Validate tên danh mục
        if (!newCategory.name.trim()) {
          throw new Error("Tên danh mục không được để trống")
        }

        console.log("Creating main category with:", {
          name: newCategory.name.trim(),
          image: newCategory.image,
        })

        const newMainCategory = await createMainCategory(
          { categoryName: newCategory.name.trim() },
          newCategory.image instanceof File ? newCategory.image : undefined,
        )

        // Đảm bảo main category có ID hợp lệ
        if (!newMainCategory.id) {
          throw new Error("Không thể tạo danh mục chính - ID không hợp lệ")
        }

        const categoryToAdd = {
          ...newMainCategory,
          children: newMainCategory.children || [],
        }
        setCategories((prev) => [...prev, categoryToAdd])
        setSelectKey((prev) => prev + 1)
      }

      // Reset states
      setNewCategory({ name: "", parentId: "", image: "" })
      setCreateSubCategoryImage("")
      setCreateMainCategoryImage("")
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error("Không thể tạo danh mục:", error)
      setError(error instanceof Error ? error.message : "Không thể tạo danh mục. Vui lòng thử lại.")
    } finally {
      setIsCreatingMainCategory(false)
      setIsCreatingSubCategory(false)
    }
  }

  const resetEditStates = () => {
    setEditCategory({ name: "", parentId: "", image: "" })
    setEditSubCategoryImage("")
    setEditMainCategoryImage("")
    setEditingCategory(null)
    setIsEditDialogOpen(false)
    setIsUpdateSubDialogOpen(false)
  }

  const handleEditCategory = (category: Category) => {
    // Chỉ kiểm tra ID có tồn tại hay không, không kiểm tra temp
    if (!category.id) {
      setError("Không thể chỉnh sửa danh mục - ID không hợp lệ.")
      return
    }

    setEditingCategory(category)

    // Reset states trước khi set mới
    setIsEditDialogOpen(false)
    setIsUpdateSubDialogOpen(false)
    setEditSubCategoryImage("")
    setEditMainCategoryImage("")

    // Để tất cả các trường trống
    setEditCategory({
      name: "",
      parentId: "",
      image: "",
    })

    // Phân biệt main category và subcategory
    const isSubcategory = categories.some((mainCat) => mainCat.children?.some((child) => child.id === category.id))

    if (isSubcategory) {
      console.log("Opening subcategory dialog")
      setIsUpdateSubDialogOpen(true)
    } else {
      console.log("Opening main category dialog")
      setIsEditDialogOpen(true)
    }
  }

  const handleUpdateMainCategory = async (id: string, name: string) => {
    try {
      if (!id) {
        setError("Không thể cập nhật danh mục - ID không hợp lệ.")
        return
      }

      if (!name && !editCategory.image) {
        setError("Vui lòng nhập tên danh mục hoặc chọn ảnh để cập nhật")
        return
      }

      setIsUpdatingMainCategory(true)

      const updatedCategory = await updateMainCategory(
        id,
        { categoryName: name || editingCategory?.name || "" },
        editCategory.image instanceof File ? editCategory.image : undefined,
      )

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id
            ? {
                ...updatedCategory,
                children: cat.children,
                image: updatedCategory.image || cat.image,
              }
            : cat,
        ),
      )
      resetEditStates()
      setError(null)
    } catch (error) {
      console.error("Failed to update main category:", error)
      setError(error instanceof Error ? error.message : "Không thể cập nhật danh mục chính. Vui lòng thử lại.")
    } finally {
      setIsUpdatingMainCategory(false)
    }
  }

  const handleUpdateSubCategory = async () => {
    try {
      if (!editingCategory) {
        setError("Không tìm thấy danh mục để cập nhật")
        return
      }

      // Kiểm tra xem có ít nhất một trường được điền không
      const hasNameChange = editCategory.name.trim() !== ""
      const hasParentChange = editCategory.parentId !== ""
      const hasImageChange = editCategory.image !== ""

      if (!hasNameChange && !hasParentChange && !hasImageChange) {
        setError("Vui lòng điền ít nhất một trường để cập nhật")
        return
      }

      setIsUpdatingSubCategory(true)

      // Gửi dữ liệu trực tiếp - rỗng thì gửi rỗng
      await updateSubCategory(
        editingCategory.id,
        editCategory.name.trim(), // Gửi tên mới hoặc rỗng
        editCategory.parentId, // Gửi parentId mới hoặc rỗng
        editCategory.image instanceof File ? editCategory.image : undefined,
      )

      // Refresh lại toàn bộ categories thay vì cập nhật state phức tạp
      const updatedCategories = await getAllMainCategories()
      setCategories(updatedCategories)

      resetEditStates()
      setError(null)
    } catch (error) {
      console.error("Failed to update subcategory:", error)
      setError(error instanceof Error ? error.message : "Không thể cập nhật danh mục con. Vui lòng thử lại.")
    } finally {
      setIsUpdatingSubCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, parentId?: string) => {
    try {
      setIsDeletingCategory(true)

      if (parentId) {
        await deleteSubCategory(categoryId)
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === parentId
              ? { ...cat, children: cat.children?.filter((child) => child.id !== categoryId) || [] }
              : cat,
          ),
        )
      } else {
        await deleteMainCategory(categoryId)
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      }
      setDeleteConfirmDialog({ isOpen: false, categoryId: "", categoryName: "", parentId: "" })
      setError(null)
    } catch (error) {
      console.error("Không thể xóa danh mục:", error)
      setError("Không thể xóa danh mục. Vui lòng thử lại.")
    } finally {
      setIsDeletingCategory(false)
    }
  }

  const openDeleteConfirmDialog = (categoryId: string, categoryName: string, parentId?: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      categoryId,
      categoryName,
      parentId: parentId || "",
    })
  }

  const getParentCategories = () => {
    const parentCats = categories.filter((cat) => cat.id && (!cat.parentId || cat.parentId === ""))
    return parentCats
  }

  const getCurrentParentCategory = () => {
    if (editingCategory) {
      // Tìm parent category chứa subcategory này
      for (const mainCat of categories) {
        if (mainCat.children?.some((child) => child.id === editingCategory.id)) {
          return mainCat
        }
      }
    }
    return null
  }

  const handleLogout = async () => {
    await logout()
  }

  // Kiểm tra xem có ít nhất một trường được điền không
  const hasChanges = () => {
    return editCategory.name.trim() !== "" || editCategory.parentId !== "" || editCategory.image !== ""
  }

  return (
    <div>
      <Header
        title="Quản lý Danh mục"
        showSearch={false}
        notificationCount={unreadNotifications}
      />
      {error && (
        <div className="mx-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Lỗi: </strong>
            <span className="block sm:inline">{error}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Đang tải danh mục...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 p-4">
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
                    disabled={isCreatingMainCategory}
                  />
                </div>

                <div>
                  <Label htmlFor="main-category-image">Hình ảnh danh mục</Label>
                  <div className="space-y-3">
                    {createMainCategoryImage ? (
                      <div className="relative inline-block">
                        <Image
                          src={createMainCategoryImage || "/placeholder.svg"}
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
                            setCreateMainCategoryImage("")
                            setNewCategory((prev) => ({ ...prev, image: "" }))
                          }}
                          disabled={isCreatingMainCategory}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Chọn hình ảnh</p>
                        <label htmlFor="main-image-upload" className="cursor-pointer">
                          <span className="text-orange-600 hover:text-orange-700 font-medium">Tải lên file</span>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleCreateMainCategoryImageUpload(file)
                            }}
                            disabled={isCreatingMainCategory}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleCreateCategory}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={!newCategory.name || newCategory.parentId !== "" || isCreatingMainCategory}
                >
                  {isCreatingMainCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo danh mục chính
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
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
                    key={selectKey}
                    value={newCategory.parentId}
                    onValueChange={(value) => setNewCategory((prev) => ({ ...prev, parentId: value }))}
                    disabled={isCreatingSubCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục cha" />
                    </SelectTrigger>
                    <SelectContent>
                      {getParentCategories().map((category) => (
                        <SelectItem key={category.id || `temp-${category.name}`} value={category.id}>
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
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={isCreatingSubCategory}
                  />
                </div>
                <div>
                  <Label htmlFor="sub-category-image">Hình ảnh danh mục</Label>
                  <div className="space-y-3">
                    {createSubCategoryImage ? (
                      <div className="relative inline-block">
                        <Image
                          src={createSubCategoryImage || "/placeholder.svg"}
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
                            setCreateSubCategoryImage("")
                            setNewCategory((prev) => ({ ...prev, image: "" }))
                          }}
                          disabled={isCreatingSubCategory}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Chọn hình ảnh</p>
                        <label htmlFor="sub-image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">Tải lên file</span>
                          <input
                            id="sub-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleCreateImageUpload(file)
                            }}
                            disabled={isCreatingSubCategory}
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
                  disabled={!newCategory.name || !newCategory.parentId || isCreatingSubCategory}
                >
                  {isCreatingSubCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo danh mục con
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          {isEditDialogOpen && editingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="w-6 h-6 text-orange-500" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa danh mục chính</h2>
                        <p className="text-sm text-gray-500">Nhập tên mới để cập nhật danh mục</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetEditStates()
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isUpdatingMainCategory}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Thông tin hiện tại */}
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Tên hiện tại:</span>
                      <span className="text-sm text-gray-700">{editingCategory.name}</span>
                    </div>
                  </div>

                  {/* Tên danh mục mới */}
                  <div>
                    <Label htmlFor="edit-category-name">Tên danh mục mới</Label>
                    <Input
                      id="edit-category-name"
                      value={editCategory.name}
                      onChange={(e) => setEditCategory((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Nhập tên danh mục mới"
                      disabled={isUpdatingMainCategory}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-main-category-image">Hình ảnh danh mục mới (tùy chọn)</Label>
                    <div className="space-y-3">
                      {editMainCategoryImage ? (
                        <div className="relative inline-block">
                          <Image
                            src={editMainCategoryImage || "/placeholder.svg"}
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
                              setEditMainCategoryImage("")
                              setEditCategory((prev) => ({ ...prev, image: "" }))
                            }}
                            disabled={isUpdatingMainCategory}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Chọn hình ảnh mới</p>
                          <label htmlFor="edit-main-image-upload" className="cursor-pointer">
                            <span className="text-orange-600 hover:text-orange-700 font-medium">Tải lên file</span>
                            <input
                              id="edit-main-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleEditMainCategoryImageUpload(file)
                              }}
                              disabled={isUpdatingMainCategory}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t">
                  <div className="flex space-x-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetEditStates()
                      }}
                      className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                      disabled={isUpdatingMainCategory}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={() => {
                        handleUpdateMainCategory(editingCategory.id, editCategory.name)
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                      disabled={(!editCategory.name.trim() && !editCategory.image) || isUpdatingMainCategory}
                    >
                      {isUpdatingMainCategory ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isUpdateSubDialogOpen && editingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-white border-b px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="w-6 h-6 text-blue-500" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa danh mục con</h2>
                        <p className="text-sm text-gray-500">Chỉ điền những trường muốn thay đổi</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetEditStates()
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isUpdatingSubCategory}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Hiển thị thông tin hiện tại */}
                  <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Tên hiện tại:</span>
                      <span className="text-sm text-gray-700">{editingCategory.name}</span>
                    </div>
                    {getCurrentParentCategory() && (
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">Danh mục cha hiện tại:</span>
                        <span className="text-sm text-gray-700">{getCurrentParentCategory()?.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="update-parent-category">Danh mục cha mới (tùy chọn)</Label>
                    <Select
                      key={`edit-${selectKey}`}
                      value={editCategory.parentId}
                      onValueChange={(value) => setEditCategory((prev) => ({ ...prev, parentId: value }))}
                      disabled={isUpdatingSubCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha mới" />
                      </SelectTrigger>
                      <SelectContent>
                        {getParentCategories().map((category) => (
                          <SelectItem
                            key={`update-${category.id}` || `update-temp-${category.name}`}
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="update-sub-category-name">Tên danh mục con mới (tùy chọn)</Label>
                    <Input
                      id="update-sub-category-name"
                      placeholder="Nhập tên danh mục con mới"
                      value={editCategory.name}
                      onChange={(e) => setEditCategory((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={isUpdatingSubCategory}
                    />
                  </div>
                  <div>
                    <Label htmlFor="update-sub-category-image">Hình ảnh danh mục mới (tùy chọn)</Label>
                    <div className="space-y-3">
                      {editSubCategoryImage ? (
                        <div className="relative inline-block">
                          <Image
                            src={editSubCategoryImage || "/placeholder.svg"}
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
                              setEditSubCategoryImage("")
                              setEditCategory((prev) => ({ ...prev, image: "" }))
                            }}
                            disabled={isUpdatingSubCategory}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Chọn hình ảnh mới</p>
                          <label htmlFor="update-sub-image-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">Tải lên file</span>
                            <input
                              id="update-sub-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleEditImageUpload(file)
                              }}
                              disabled={isUpdatingSubCategory}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetEditStates()
                      }}
                      className="flex-1"
                      disabled={isUpdatingSubCategory}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleUpdateSubCategory}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      disabled={!hasChanges() || isUpdatingSubCategory}
                    >
                      {isUpdatingSubCategory ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Cập nhật danh mục con
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div
                      key={category.id || `main-${category.name}-${Date.now()}`}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/* Hiển thị ảnh của mainCategory thay vì icon */}
                          {category.image ? (
                            <Image
                              src={category.image || "/placeholder.svg"}
                              alt={category.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover border"
                            />
                          ) : (
                            <FolderOpen className="w-12 h-12 text-orange-500" />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                            disabled={isDeletingCategory}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openDeleteConfirmDialog(category.id, category.name)}
                            disabled={isDeletingCategory}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {category.children && category.children.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {category.children.map((subcategory) => (
                            <div
                              key={subcategory.id || `sub-${subcategory.name}-${category.id}`}
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
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditCategory(subcategory)}
                                  disabled={isDeletingCategory}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => openDeleteConfirmDialog(subcategory.id, subcategory.name, category.id)}
                                  disabled={isDeletingCategory}
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
        </>
      )}
      {deleteConfirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa danh mục</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa danh mục{" "}
                  <span className="font-semibold text-red-600">"{deleteConfirmDialog.categoryName}"</span>?
                </p>
                {!deleteConfirmDialog.parentId && (
                  <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                    ⚠️ Xóa danh mục chính sẽ xóa tất cả danh mục con bên trong.
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDeleteConfirmDialog({ isOpen: false, categoryId: "", categoryName: "", parentId: "" })
                  }
                  className="flex-1"
                  disabled={isDeletingCategory}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() =>
                    handleDeleteCategory(deleteConfirmDialog.categoryId, deleteConfirmDialog.parentId || undefined)
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeletingCategory}
                >
                  {isDeletingCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa danh mục
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
