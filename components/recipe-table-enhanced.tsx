"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  AlertTriangle
} from "lucide-react"

interface Recipe {
  id: string
  name: string
  category: string
  author: string
  date: string
  image?: string
  status: string
  description?: string
  cookingTime?: string
  views?: number
}

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
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null)

  // Filtering and sorting logic
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || recipe.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const aValue = a[sortBy] || ""
    const bValue = b[sortBy] || ""
    
    if (sortOrder === "asc") {
      return aValue.toString().localeCompare(bValue.toString())
    } else {
      return bValue.toString().localeCompare(aValue.toString())
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
        onSelectionChange(sortedRecipes.map(recipe => recipe.id))
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
        onSelectionChange(selectedIds.filter(id => id !== recipeId))
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
    return recipes.find(recipe => recipe.id === deleteRecipeId)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm công thức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="NOT_APPROVED">Từ chối</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>
      </div>

      {/* Recipe Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách công thức ({sortedRecipes.length})
          </CardTitle>
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
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Tên công thức
                    {sortBy === "name" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1">
                    Danh mục
                    {sortBy === "category" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("author")}
                >
                  <div className="flex items-center gap-1">
                    Tác giả
                    {sortBy === "author" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Ngày tạo
                    {sortBy === "date" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
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
                      alt={recipe.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=50&width=50"
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.category}</TableCell>
                  <TableCell>{recipe.author}</TableCell>
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                  <TableCell>{recipe.date}</TableCell>
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
                  "{getRecipeToDelete()?.name}"
                </span>{" "}
                không?
                <br />
                <br />
                <span className="text-red-500 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </span>
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
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa công thức
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
