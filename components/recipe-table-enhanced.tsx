"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Eye, Edit, Trash2, SortAsc, SortDesc, AlertTriangle, Tag } from "lucide-react"
import { Label } from "@/components/ui/label"

// Import Recipe interface từ recipe-detail-modal để đảm bảo consistency
import type { Recipe } from "./recipe-detail-modal"

interface RecipeTableEnhancedProps {
  recipes: Recipe[]
  onView: (recipe: Recipe) => void
  onEdit: (recipe: Recipe) => void
  onDelete: (recipeId: string) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  showSelection?: boolean
}

export function RecipeTableEnhanced({
  recipes,
  onView,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectionChange,
  showSelection = false,
}: RecipeTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Recipe>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null)

  // Filtering and sorting logic
  const filteredRecipes = recipes.filter((recipe) => {
    const recipeName = recipe.name || recipe.title || ""
    const recipeAuthor = recipe.author || recipe.accountName || ""
    const recipeCategory = recipe.category || recipe.subCategoryName || ""

    const matchesSearch =
      recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipeAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipeCategory.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || recipe.status === statusFilter
    const matchesCategory =
      categoryFilter === "all" || recipeCategory.toLowerCase().includes(categoryFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    let aValue = ""
    let bValue = ""

    // Handle different field mappings
    switch (sortBy) {
      case "name":
        aValue = a.name || a.title || ""
        bValue = b.name || b.title || ""
        break
      case "author":
        aValue = a.author || a.accountName || ""
        bValue = b.author || b.accountName || ""
        break
      case "category":
        aValue = a.category || a.subCategoryName || ""
        bValue = b.category || b.subCategoryName || ""
        break
      default:
        aValue = (a[sortBy] || "").toString()
        bValue = (b[sortBy] || "").toString()
    }

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const handleSort = (column: keyof Recipe) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(sortedRecipes.map((recipe) => recipe.id))
      } else {
        onSelectionChange([])
      }
    }
  }

  const handleSelectRecipe = (recipeId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, recipeId])
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== recipeId))
      }
    }
  }

  const handleDeleteClick = (recipeId: string) => {
    setDeleteRecipeId(recipeId)
  }

  const handleDeleteConfirm = () => {
    if (deleteRecipeId) {
      onDelete(deleteRecipeId)
      setDeleteRecipeId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteRecipeId(null)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500 text-white">Đã duyệt</Badge>
      case "NOT_APPROVED":
        return <Badge className="bg-red-500 text-white">Từ chối</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Chờ duyệt</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRecipeToDelete = () => {
    return recipes.find((recipe) => recipe.id === deleteRecipeId)
  }

  // Get unique categories from recipes
  const uniqueCategories = [
    ...new Set(recipes.map((recipe) => recipe.category || recipe.subCategoryName).filter(Boolean)),
  ]

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Single Row - Search, Status, Category */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-1">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm công thức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="NOT_APPROVED">Từ chối</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-1">
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Danh mục
            </Label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">Tất cả danh mục</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="lg:col-span-1">
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-800">Bộ lọc đang áp dụng:</span>
            {searchTerm && (
              <Badge variant="outline" className="bg-white">
                Tìm kiếm: "{searchTerm}"
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="outline" className="bg-white">
                Trạng thái:{" "}
                {statusFilter === "APPROVED" ? "Đã duyệt" : statusFilter === "PENDING" ? "Chờ duyệt" : "Từ chối"}
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="outline" className="bg-white">
                Danh mục: {categoryFilter}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Recipe Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách công thức ({sortedRecipes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {showSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === sortedRecipes.length && sortedRecipes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Hình ảnh</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    Tên công thức
                    {sortBy === "name" &&
                      (sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("category")}>
                  <div className="flex items-center gap-1">
                    Danh mục
                    {sortBy === "category" &&
                      (sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("author")}>
                  <div className="flex items-center gap-1">
                    Tác giả
                    {sortBy === "author" &&
                      (sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">
                    Ngày tạo
                    {sortBy === "date" &&
                      (sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                  </div>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecipes.map((recipe) => (
                <TableRow key={recipe.id} className="hover:bg-gray-50">
                  {showSelection && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(recipe.id)}
                        onCheckedChange={(checked) => handleSelectRecipe(recipe.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <img
                      src={recipe.image || "/placeholder.svg?height=50&width=50"}
                      alt={recipe.name || recipe.title || "Recipe"}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=50&width=50"
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{recipe.name || recipe.title || "Không có tên"}</TableCell>
                  <TableCell>{recipe.category || recipe.subCategoryName || "Không xác định"}</TableCell>
                  <TableCell>{recipe.author || recipe.accountName || "Không xác định"}</TableCell>
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                  <TableCell>
                    {recipe.date ||
                      (recipe.createAt ? new Date(recipe.createAt).toLocaleDateString("vi-VN") : "Không xác định")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(recipe)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(recipe)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(recipe.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {sortedRecipes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Không tìm thấy công thức nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteRecipeId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Xác nhận xóa công thức
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa công thức{" "}
                <span className="font-semibold text-red-600">
                  "{getRecipeToDelete()?.name || getRecipeToDelete()?.title || "Không có tên"}"
                </span>{" "}
                không?
                <br />
                <br />
                <span className="text-red-500 font-medium">⚠️ Hành động này không thể hoàn tác!</span>
                <br />
                Tất cả dữ liệu liên quan đến công thức này sẽ bị xóa vĩnh viễn, bao gồm:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Thông tin công thức</li>
                  <li>• Danh sách nguyên liệu</li>
                  <li>• Các bước hướng dẫn</li>
                  <li>• Hình ảnh đính kèm</li>
                  <li>• Đánh giá và bình luận</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 focus:ring-red-500">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa công thức
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
