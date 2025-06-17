"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Edit, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { useState } from "react";
import type { Recipe } from "./recipe-detail-modal";

interface RecipeActionsProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: number) => void;
  onApprove?: (recipeId: number) => void;
  onReject?: (recipeId: number, reason: string) => void;
  onToggleFeatured?: (recipeId: number) => void;
  showApprovalActions?: boolean;
}

export function RecipeActions({
  recipe,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleFeatured,
  showApprovalActions = false,
}: RecipeActionsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(recipe.id, rejectReason);
      setRejectReason("");
      setIsRejectDialogOpen(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {/* View Button */}
      <Button
        size="sm"
        variant="outline"
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
        onClick={() => onView(recipe)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {/* Approval Actions - only show for pending recipes */}
      {showApprovalActions && recipe.status === "pending" && (
        <>
          {onApprove && (
            <Button
              size="sm"
              onClick={() => onApprove(recipe.id)}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}

          {onReject && (
            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Từ chối công thức</DialogTitle>
                  <DialogDescription>
                    Vui lòng nhập lý do từ chối công thức "{recipe.name}"
                  </DialogDescription>
                </DialogHeader>
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
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!rejectReason.trim()}
                  >
                    Từ chối
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {/* Edit Button */}
      <Button size="sm" variant="outline" onClick={() => onEdit(recipe)}>
        <Edit className="w-4 h-4" />
      </Button>

      {/* Featured Toggle Button */}
      {onToggleFeatured && (
        <Button
          size="sm"
          variant="outline"
          className={
            recipe.featured
              ? "text-purple-600 border-purple-600 hover:bg-purple-50"
              : ""
          }
          onClick={() => onToggleFeatured(recipe.id)}
        >
          <Star
            className={`w-4 h-4 ${recipe.featured ? "fill-current" : ""}`}
          />
        </Button>
      )}

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa công thức "{recipe.name}"? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(recipe.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
