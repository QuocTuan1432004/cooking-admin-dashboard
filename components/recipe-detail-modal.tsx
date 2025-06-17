"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { Clock, Users, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export interface Recipe {
  id: number
  name: string
  category: string
  author: string
  date: string
  image?: string
  status: "pending" | "approved" | "rejected"
  description?: string
  ingredients?: string[]
  instructions?: string[]
  cookingTime?: string
  servings?: number
  rating?: number
  views?: number
}

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (recipeId: number) => void
  onReject?: (recipeId: number, reason: string) => void
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

  if (!recipe) return null

  const handleApprove = () => {
    if (onApprove) {
      onApprove(recipe.id)
      onClose()
    }
  }

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(recipe.id, rejectReason)
      setRejectReason("")
      onClose()
    }
  }

  const getStatusBadge = (status: Recipe["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Image
                src={recipe.image || "/placeholder.svg"}
                alt={recipe.name}
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                  {getStatusBadge(recipe.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Danh mục:</span> {recipe.category}
                  </div>
                  <div>
                    <span className="font-medium">Tác giả:</span> {recipe.author}
                  </div>
                  <div>
                    <span className="font-medium">Ngày tạo:</span> {recipe.date}
                  </div>
                </div>
              </div>

              {(recipe.cookingTime || recipe.servings) && (
                <div className="flex gap-4">
                  {recipe.cookingTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookingTime}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} người</span>
                    </div>
                  )}
                </div>
              )}

              {recipe.description && (
                <div>
                  <h4 className="font-medium mb-2">Mô tả</h4>
                  <p className="text-gray-700">{recipe.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Nguyên liệu</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Cách làm</h3>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="flex-1 pt-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Actions - chỉ hiển thị khi showApprovalActions = true và recipe pending */}
          {showApprovalActions && recipe.status === "pending" && (
            <>
              <Separator />
              <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800">Duyệt công thức</h3>
                <p className="text-sm text-yellow-700">
                  Công thức này đang chờ duyệt. Vui lòng xem xét và quyết định phê duyệt hoặc từ chối.
                </p>

                <div className="flex gap-4">
                  <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt công thức
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Từ chối công thức</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vui lòng nhập lý do từ chối công thức "{recipe.name}"
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Lý do từ chối</Label>
                          <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectReason("")}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!rejectReason.trim()}
                        >
                          Từ chối
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
