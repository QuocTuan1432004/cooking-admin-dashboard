"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import type { Recipe } from "./recipe-detail-modal";

interface RecipeBulkActionsProps {
  recipes: Recipe[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onBulkAction: (action: string, ids: number[]) => void;
}

export function RecipeBulkActions({
  recipes,
  selectedIds,
  onSelectionChange,
  onBulkAction,
}: RecipeBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(recipes.map((r) => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkDelete = () => {
    onBulkAction("delete", selectedIds);
    setShowDeleteDialog(false);
    onSelectionChange([]);
  };

  const handleBulkApprove = () => {
    onBulkAction("approve", selectedIds);
    onSelectionChange([]);
  };

  const handleBulkReject = () => {
    onBulkAction("reject", selectedIds);
    onSelectionChange([]);
  };

  const handleBulkFeature = () => {
    onBulkAction("feature", selectedIds);
    onSelectionChange([]);
  };

  const isAllSelected =
    recipes.length > 0 && selectedIds.length === recipes.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < recipes.length;

  return (
    <>
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isPartiallySelected;
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length > 0
              ? `Đã chọn ${selectedIds.length} công thức`
              : "Chọn tất cả"}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Thao tác hàng loạt
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleBulkApprove}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkReject}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkFeature}>
                  <Star className="w-4 h-4 mr-2" />
                  Đánh dấu nổi bật
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hàng loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedIds.length} công thức đã chọn?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
