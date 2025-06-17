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
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  EyeOff,
  Trash2,
  Check,
  Filter,
  Search,
  Flag,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  user: string;
  recipe: string;
  content: string;
  date: string;
  status: "approved" | "pending" | "hidden";
  avatar?: string;
  reported?: boolean;
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
      reported: false,
    },
    {
      id: 2,
      user: "Trần Thị B",
      recipe: "Canh chua cá",
      content: "Có thể thêm ít rau thơm để tăng hương vị không?",
      date: "15/05/2025",
      status: "pending",
      reported: false,
    },
    {
      id: 3,
      user: "Lê Văn C",
      recipe: "Bánh flan",
      content: "Cách làm rất chi tiết, mình làm thành công ngay lần đầu!",
      date: "15/05/2025",
      status: "approved",
      reported: false,
    },
    {
      id: 4,
      user: "Phạm Thị D",
      recipe: "Chè đậu xanh",
      content: "Món này hơi ngọt quá, lần sau mình sẽ giảm đường.",
      date: "14/05/2025",
      status: "hidden",
      reported: false,
    },
    {
      id: 5,
      user: "Hoàng Văn E",
      recipe: "Rau muống xào tỏi",
      content: "Nhanh mà ngon, rất phù hợp cho bữa tối bận rộn!",
      date: "14/05/2025",
      status: "pending",
      reported: false,
    },
  ]);

  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [reportedComments, setReportedComments] = useState<number[]>([]);

  const [reportingUser, setReportingUser] = useState<Comment | null>(null);
  const [reportReasons, setReportReasons] = useState<string[]>([]);
  const [reportDetails, setReportDetails] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

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
      case "hidden":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Đã ẩn
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (
    commentId: number,
    newStatus: "approved" | "pending" | "hidden"
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
      pending: comments.filter((c) => c.status === "pending").length,
      hidden: comments.filter((c) => c.status === "hidden").length,
      reported: comments.filter((c) => c.reported === true).length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleOpenReportDialog = (comment: Comment) => {
    setReportingUser(comment);
    setReportReasons([]);
    setReportDetails("");
    setIsReportDialogOpen(true);
  };

  const handleReportReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setReportReasons((prev) => [...prev, reason]);
    } else {
      setReportReasons((prev) => prev.filter((r) => r !== reason));
    }
  };

  const handleSubmitReport = () => {
    if (reportingUser && reportReasons.length > 0) {
      // Here you would typically send the report to your backend
      console.log("Reporting user:", reportingUser.user);
      console.log("Reasons:", reportReasons);
      console.log("Details:", reportDetails);

      // Update the comment to mark it as reported
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === reportingUser.id
            ? { ...comment, reported: true }
            : comment
        )
      );

      // Close dialog and reset state
      setIsReportDialogOpen(false);
      setReportingUser(null);
      setReportReasons([]);
      setReportDetails("");
    }
  };

  const reportReasonsList = [
    "Spam hoặc quảng cáo",
    "Ngôn từ thù địch hoặc quấy rối",
    "Nội dung không phù hợp",
    "Thông tin sai lệch",
    "Vi phạm bản quyền",
    "Nội dung bạo lực",
    "Lừa đảo hoặc gian lận",
    "Khác",
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-3 h-3" />;
      case "pending":
        return <MessageSquare className="w-3 h-3" />;
      case "hidden":
        return <EyeOff className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "hidden":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bị báo cáo</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.reported}
                </p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
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
                  <SelectItem value="hidden">Đã ẩn</SelectItem>
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
                        {/* Status Dropdown - Small like other buttons */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-9 w-9 p-0 border-2 ${
                                comment.status === "approved"
                                  ? "text-green-600 border-green-600 bg-green-50 hover:bg-green-100"
                                  : comment.status === "pending"
                                  ? "text-yellow-600 border-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                                  : "text-gray-600 border-gray-600 bg-gray-50 hover:bg-gray-100"
                              }`}
                              title={`Trạng thái: ${
                                comment.status === "approved"
                                  ? "Đã duyệt"
                                  : comment.status === "pending"
                                  ? "Chờ duyệt"
                                  : "Đã ẩn"
                              }`}
                            >
                              {getStatusIcon(comment.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(comment.id, "approved")
                              }
                              className="text-green-600 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Đã duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(comment.id, "pending")
                              }
                              className="text-yellow-600 hover:bg-yellow-50"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Chờ duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(comment.id, "hidden")
                              }
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              <EyeOff className="w-4 h-4 mr-2" />
                              Đã ẩn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog
                          open={isReportDialogOpen}
                          onOpenChange={setIsReportDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReportDialog(comment)}
                              className={
                                comment.reported
                                  ? "text-red-600 border-red-600 bg-red-50 h-9 w-9 p-0"
                                  : "text-orange-600 border-orange-600 hover:bg-orange-50 h-9 w-9 p-0"
                              }
                              disabled={comment.reported}
                              title="Báo cáo người dùng"
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Báo cáo người dùng</DialogTitle>
                              <DialogDescription>
                                Báo cáo người dùng:{" "}
                                <strong>{reportingUser?.user}</strong>
                                <br />
                                Vui lòng chọn lý do báo cáo và cung cấp thêm
                                thông tin chi tiết.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                  Lý do báo cáo *
                                </Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {reportReasonsList.map((reason) => (
                                    <div
                                      key={reason}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={reason}
                                        checked={reportReasons.includes(reason)}
                                        onCheckedChange={(checked) =>
                                          handleReportReasonChange(
                                            reason,
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={reason}
                                        className="text-sm text-gray-700 cursor-pointer"
                                      >
                                        {reason}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label
                                  htmlFor="report-details"
                                  className="text-sm font-medium text-gray-700 mb-2 block"
                                >
                                  Chi tiết bổ sung (tùy chọn)
                                </Label>
                                <Textarea
                                  id="report-details"
                                  placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                                  value={reportDetails}
                                  onChange={(e) =>
                                    setReportDetails(e.target.value)
                                  }
                                  rows={3}
                                  className="resize-none"
                                />
                              </div>

                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>Lưu ý:</strong> Báo cáo sai lệch có
                                  thể dẫn đến việc tài khoản của bạn bị hạn chế.
                                </p>
                              </div>
                            </div>

                            <DialogFooter className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsReportDialogOpen(false)}
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={handleSubmitReport}
                                disabled={reportReasons.length === 0}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Gửi báo cáo
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 h-9 w-9 p-0"
                              title="Xóa bình luận"
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
