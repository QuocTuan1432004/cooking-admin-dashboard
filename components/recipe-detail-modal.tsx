"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, CheckCircle, XCircle, ChefHat } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecipeStepsResponse, RecipeIngredientsResponse } from "@/hooks/RecipeApi/recipeTypes"
import { getRecipeStepsByRecipeId } from "@/hooks/RecipeApi/recipeSteps"
import { getRecipeIngredientsByRecipeId } from "@/hooks/RecipeApi/recipeIngredients"

export interface Recipe {
  id: string
  title: string // Thay đổi từ name thành title
  name?: string // Giữ lại để backward compatibility
  category?: string // Giữ lại để backward compatibility
  subCategoryName?: string // Thêm trường này
  author?: string // Giữ lại để backward compatibility
  accountName?: string // Thêm trường này
  date?: string
  createAt?: string // Thêm trường này
  image?: string
  status: string
  description?: string
  ingredients?: string[]
  instructions?: string[]
  cookingTime?: string
  servings?: number
  rating?: number
  views?: number
  difficulty?: string
  subcategoryId?: string
  subCategoryId?: string // Thêm trường này để khớp với backend
  accountId?: string // Thêm trường này
  totalLikes?: string // Thêm trường này
}

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (recipeId: string) => void
  onReject?: (recipeId: string, reason: string) => void
  showApprovalActions?: boolean
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onApprove,
  onReject,
  showApprovalActions = false,
}: RecipeDetailModalProps) {
  const [rejectReason, setRejectReason] = useState("")
  const [recipeSteps, setRecipeSteps] = useState<RecipeStepsResponse[]>([])
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientsResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load recipe details when modal opens
  useEffect(() => {
    if (isOpen && recipe) {
      loadRecipeDetails()
    }
  }, [isOpen, recipe])

  // Clear data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecipeSteps([])
      setRecipeIngredients([])
      setError(null)
      setRejectReason("")
    }
  }, [isOpen])

  const loadRecipeDetails = async () => {
    if (!recipe) return

    try {
      setLoading(true)
      setError(null)

      // Load recipe steps and ingredients in parallel
      const [stepsData, ingredientsData] = await Promise.all([
        getRecipeStepsByRecipeId(recipe.id).catch(() => []),
        getRecipeIngredientsByRecipeId(recipe.id).catch(() => []),
      ])

      setRecipeSteps(stepsData || [])
      setRecipeIngredients(ingredientsData || [])
    } catch (error) {
      setError("Không thể tải chi tiết công thức")
    } finally {
      setLoading(false)
    }
  }

  // Function to convert difficulty from English to Vietnamese
  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "Dễ"
      case "medium":
        return "Trung bình"
      case "hard":
        return "Khó"
      default:
        return difficulty || "Chưa có thông tin"
    }
  }

  if (!recipe) return null

  const handleApprove = () => {
    if (onApprove) {
      onApprove(recipe.id)
    }
    onClose()
  }

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(recipe.id, rejectReason.trim())
      setRejectReason("")
    }
    onClose()
  }

  const getStatusBadge = (status: Recipe["status"]) => {
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

  // const difficultyInfo = getDifficultyInfo(recipe.difficulty)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl">Chi tiết công thức</span>
            {getStatusBadge(recipe.status)}
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Recipe Image */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <img
                    src={recipe.image || "/placeholder.svg?height=300&width=300"}
                    alt={recipe.name}
                    className="w-full h-64 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=300&width=300"
                    }}
                  />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">URL ảnh</Label>
                    <Input
                      value={recipe.image || ""}
                      readOnly
                      className="mt-1 bg-gray-50 text-gray-600"
                      placeholder="Chưa có URL ảnh"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Recipe Info */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  {/* Tên công thức - full width */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Tên công thức <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={recipe.title || recipe.name || ""}
                      readOnly
                      className="mt-1 bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* Danh mục và Tác giả - 2 cột với chiều cao bằng nhau */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700">
                        Danh mục <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md flex-1 flex items-center">
                        <span className="text-gray-700">
                          {recipe.subCategoryName || recipe.category || "Không xác định"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700">Tác giả</Label>
                      <Input
                        value={recipe.accountName || recipe.author || ""}
                        readOnly
                        className="mt-1 bg-gray-50 text-gray-700 flex-1"
                      />
                    </div>
                  </div>

                  {/* Thời gian nấu và Độ khó - 2 cột */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700">Thời gian nấu</Label>
                      <Input
                        value={recipe.cookingTime || ""}
                        readOnly
                        className="mt-1 bg-gray-50 text-gray-600"
                        placeholder="Chưa có thông tin"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700">Độ khó</Label>
                      <Input
                        value={getDifficultyLabel(recipe.difficulty)}
                        readOnly
                        className="mt-1 bg-gray-50 text-gray-600"
                        placeholder="Chưa có thông tin"
                      />
                    </div>
                  </div>

                  {/* Mô tả - full width */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Mô tả <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={recipe.description || ""}
                      readOnly
                      className="mt-1 bg-gray-50 text-gray-600 min-h-[100px]"
                      placeholder="Chưa có mô tả"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600 font-medium">Đang tải chi tiết công thức...</span>
          </div>
        )}

        {/* Recipe Ingredients */}
        {!loading && recipeIngredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🥗</span>
                Nguyên liệu ({recipeIngredients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipeIngredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id || index}
                    className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100"
                  >
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {ingredient.ingredientName || "Nguyên liệu không xác định"}
                      </div>
                      <div className="text-sm text-orange-700 font-medium">Số lượng: {ingredient.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Steps */}
        {!loading && recipeSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👨‍🍳</span>
                Hướng dẫn nấu ăn ({recipeSteps.length} bước)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recipeSteps
                  .sort((a, b) => a.step - b.step)
                  .map((step, index) => (
                    <div key={step.id || index} className="flex gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full text-lg font-bold shadow-md">
                          {step.step}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 mb-2">Bước {step.step}</h4>
                          <p className="text-gray-700 leading-relaxed">{step.description}</p>
                        </div>

                        {step.waitingTime && (
                          <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 px-3 py-2 rounded-md mb-3">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Thời gian chờ: {step.waitingTime}</span>
                          </div>
                        )}

                        {step.recipeStepImage && (
                          <div className="mt-3">
                            <img
                              src={step.recipeStepImage || "/placeholder.svg"}
                              alt={`Bước ${step.step}`}
                              className="max-w-sm h-40 object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && recipeIngredients.length === 0 && recipeSteps.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông tin chi tiết</h3>
            <p className="text-gray-600">Công thức này chưa có thông tin về nguyên liệu và hướng dẫn nấu ăn.</p>
            <p className="text-sm text-gray-500 mt-2">Có thể đang được cập nhật hoặc chưa hoàn thiện.</p>
          </div>
        )}

        {/* Approval Actions */}
        {showApprovalActions && recipe.status === "PENDING" && (
          <>
            <Separator className="my-8" />
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Duyệt công thức</h3>
                  <p className="text-sm text-yellow-700">
                    Công thức này đang chờ duyệt. Vui lòng xem xét và quyết định phê duyệt hoặc từ chối.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt công thức
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 px-6 py-2">
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Từ chối công thức</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vui lòng nhập lý do từ chối công thức này. Thông tin này sẽ được gửi đến tác giả.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reject-reason">Lý do từ chối</Label>
                      <Textarea
                        id="reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Xác nhận từ chối
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
