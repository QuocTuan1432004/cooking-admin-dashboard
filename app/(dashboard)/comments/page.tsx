"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  MessageSquare,
  EyeOff,
  Edit,
  Trash2,
  Check,
  Filter,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  user: string;
  recipe: string;
  content: string;
  date: string;
  status: "approved" | "hidden" | "pending";
  avatar?: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const [unreadNotifications] = useState(3);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "Nguyễn Văn A",
      recipe: "Gà kho gừng",
      content: "Món này rất ngon, cảm ơn bạn đã chia sẻ!",
      date: "16/05/2025",
      status: "approved",
    },
    {
      id: 2,
      user: "Trần Thị B",
      recipe: "Canh chua cá",
      content: "Có thể thêm ít rau thơm để tăng hương vị không?",
      date: "15/05/2025",
      status: "approved",
    },
    {
      id: 3,
      user: "Lê Văn C",
      recipe: "Bánh flan",
      content: "Cách làm rất chi tiết, mình làm thành công ngay lần đầu!",
      date: "15/05/2025",
      status: "approved",
    },
    {
      id: 4,
      user: "Phạm Thị D",
      recipe: "Chè đậu xanh",
      content: "Món này hơi ngọt quá, lần sau mình sẽ giảm đường.",
      date: "14/05/2025",
      status: "hidden",
    },
    {
      id: 5,
      user: "Hoàng Văn E",
      recipe: "Rau muống xào tỏi",
      content: "Nhanh mà ngon, rất phù hợp cho bữa tối bận rộn!",
      date: "14/05/2025",
      status: "pending",
    },
  ]);

  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Check className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "hidden":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Ẩn
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (
    commentId: number,
    newStatus: "approved" | "hidden"
  ) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      )
    );
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editingComment) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === editingComment.id
            ? { ...comment, content: editContent }
            : comment
        )
      );
      setEditingComment(null);
      setEditContent("");
    }
  };

  const handleSelectComment = (commentId: number) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map((comment) => comment.id));
    }
  };

  const handleBulkAction = (action: "approve" | "hide" | "delete") => {
    if (action === "delete") {
      setComments((prev) =>
        prev.filter((comment) => !selectedComments.includes(comment.id))
      );
    } else {
      const newStatus = action === "approve" ? "approved" : "hidden";
      setComments((prev) =>
        prev.map((comment) =>
          selectedComments.includes(comment.id)
            ? { ...comment, status: newStatus }
            : comment
        )
      );
    }
    setSelectedComments([]);
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRecipe =
      selectedRecipe === "all" || comment.recipe === selectedRecipe;
    const matchesStatus =
      selectedStatus === "all" || comment.status === selectedStatus;
    const matchesDate = !selectedDate || comment.date.includes(selectedDate);

    return matchesSearch && matchesRecipe && matchesStatus && matchesDate;
  });

  const getUniqueRecipes = () => {
    const recipes = [...new Set(comments.map((comment) => comment.recipe))];
    return recipes;
  };

  const getStatusCounts = () => {
    return {
      total: comments.length,
      approved: comments.filter((c) => c.status === "approved").length,
      hidden: comments.filter((c) => c.status === "hidden").length,
      pending: comments.filter((c) => c.status === "pending").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <Header
        title="Quản lý Bình luận"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadNotifications}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng bình luận</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.approved}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.pending}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã ẩn</p>
                <p className="text-2xl font-bold text-gray-600">
                  {statusCounts.hidden}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách bình luận</span>
            {selectedComments.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("approve")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Duyệt ({selectedComments.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("hide")}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Ẩn ({selectedComments.length})
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa ({selectedComments.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa {selectedComments.length} bình
                        luận đã chọn? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("delete")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm nội dung hoặc người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Công thức
              </Label>
              <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả công thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả công thức</SelectItem>
                  {getUniqueRecipes().map((recipe) => (
                    <SelectItem key={recipe} value={recipe}>
                      {recipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="hidden">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Ngày đăng
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedComments.length === comments.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Người dùng
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Công thức
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Nội dung
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày đăng
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr
                    key={comment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{comment.id}</td>
                    <td className="py-3 px-4 font-medium">{comment.user}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {comment.recipe}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <div className="truncate" title={comment.content}>
                        {comment.content}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{comment.date}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(comment.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditComment(comment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa bình luận</DialogTitle>
                              <DialogDescription>
                                Chỉnh sửa nội dung bình luận của {comment.user}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Nội dung bình luận</Label>
                                <Textarea
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  placeholder="Nhập nội dung bình luận..."
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEditingComment(null)}
                              >
                                Hủy
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                Lưu thay đổi
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

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
                                Bạn có chắc chắn muốn xóa bình luận này? Hành
                                động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {comment.status === "hidden" ||
                        comment.status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(comment.id, "approved")
                            }
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(comment.id, "hidden")
                            }
                            className="text-gray-600 border-gray-600 hover:bg-gray-50"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy bình luận nào phù hợp với bộ lọc.
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                «
              </Button>
              <Button size="sm" className="bg-orange-500 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
