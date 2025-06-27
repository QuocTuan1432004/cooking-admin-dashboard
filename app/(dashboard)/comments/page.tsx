"use client";
import { useNotification } from "../../../hooks/NotiApi/NotificationContext"; // Adjusted path to parent directory

import { useEffect, useState } from "react";
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAllComments,
  deleteComment,
  CommentResponse,
  updateCommentStatus,
  getTotalCommentReports,
} from "../../../hooks/commentApi/commentApi";
import { notificationApi } from "@/hooks/NotiApi/NotiApi"; // Thêm import này
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  EyeOff,
  Edit,
  Trash2,
  Check,
  Filter,
  Search,
  Clock,
  X,
  Flag,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  user: string;
  recipe: string;
  content: string;
  date: string;
  status: "APPROVED" | "HIDDEN" | "PENDING";
  avatar?: string;
  reported?: boolean;
}

const formatDateToYYYYMMDD = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const { unreadCount } = useNotification();
  // Filter states
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempSelectedRecipe, setTempSelectedRecipe] = useState("all");
  const [tempSelectedStatus, setTempSelectedStatus] = useState("all");
  const [tempSelectedDate, setTempSelectedDate] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedSelectedRecipe, setAppliedSelectedRecipe] = useState("all");
  const [appliedSelectedStatus, setAppliedSelectedStatus] = useState("all");
  const [appliedSelectedDate, setAppliedSelectedDate] = useState("");

  // Report states
  const [reportingComment, setReportingComment] = useState<Comment | null>(
    null
  );
  const [reportReasons, setReportReasons] = useState<string[]>([]);
  const [reportDetails, setReportDetails] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Edit states
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;
  const [totalComments, setTotalComments] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [reportedCount, setReportedCount] = useState(0);

  const [commentReportCount, setCommentReportCount] = useState<number>(0);

  // Thêm state để lưu số lượng thông báo chưa đọc
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchCommentReports = async () => {
      try {
        const total = await getTotalCommentReports();
        setCommentReportCount(total);
      } catch (error) {
        console.error("Lỗi khi lấy tổng báo cáo comment:", error);
      }
    };

    fetchCommentReports();
  }, []);

  const fetchTotalReportedCount = async (): Promise<number> => {
    try {
      const totalReports = await getTotalCommentReports(); // <-- GỌI API MỚI
      console.log("Total reported comments from API:", totalReports);
      return totalReports;
    } catch (error) {
      console.error("Failed to fetch total reported comments:", error);
      return 0;
    }
  };

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const handleApplyFilter = async () => {
    if (
      tempSearchTerm ||
      tempSelectedRecipe !== "all" ||
      tempSelectedStatus !== "all" ||
      tempSelectedDate
    ) {
      await fetchAllComments();
    } else {
      await fetchCommentsByPage(0);
    }

    setAppliedSearchTerm(tempSearchTerm);
    setAppliedSelectedRecipe(tempSelectedRecipe);
    setAppliedSelectedStatus(tempSelectedStatus);
    setAppliedSelectedDate(tempSelectedDate);
    setCurrentPage(0);
  };

  const handleClearFilter = async () => {
    setTempSearchTerm("");
    setTempSelectedRecipe("all");
    setTempSelectedStatus("all");
    setTempSelectedDate("");
    setAppliedSearchTerm("");
    setAppliedSelectedRecipe("all");
    setAppliedSelectedStatus("all");
    setAppliedSelectedDate("");
    setCurrentPage(0);
    await fetchCommentsByPage(0);
  };

  const hasActiveFilters = () => {
    return (
      appliedSearchTerm !== "" ||
      appliedSelectedRecipe !== "all" ||
      appliedSelectedStatus !== "all" ||
      appliedSelectedDate !== ""
    );
  };

  const fetchAllComments = async () => {
    setLoading(true);
    let page = 0;
    const allComments: Comment[] = [];

    try {
      while (true) {
        const response = await getAllComments(page, size);
        if (
          !response ||
          !response.content ||
          !Array.isArray(response.content) ||
          response.content.length === 0
        ) {
          break;
        }

        const mappedComments = response.content.map(
          (comment: CommentResponse) => ({
            id: comment.id,
            user: comment.username || "Unknown User",
            recipe: comment.recipeTitle || "Unknown Recipe",
            content: comment.commentText || "No content",
            date: comment.createdAt
              ? formatDateToYYYYMMDD(comment.createdAt)
              : "Unknown Date",
            status: comment.status || "PENDING",
            reported: comment.reported || false,
          })
        );

        allComments.push(...mappedComments);
        page++;
      }

      setComments(allComments);
      updateStats(allComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsByPage = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAllComments(page, size);
      if (response && response.content) {
        const mappedComments = response.content.map(
          (comment: CommentResponse) => ({
            id: comment.id,
            user: comment.username || "Unknown User",
            recipe: comment.recipeTitle || "Unknown Recipe",
            content: comment.commentText || "No content",
            date: comment.createdAt
              ? formatDateToYYYYMMDD(comment.createdAt)
              : "Unknown Date",
            status: comment.status || "PENDING",
            reported: comment.reported || false,
          })
        );

        setComments(mappedComments);
        if (page === 0) {
          setTotalComments(response.totalElements || 0);
          setTotalPages(response.totalPages || 0);
          await fetchAllCommentsForStats();
        }
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCommentsForStats = async () => {
    try {
      let allComments: CommentResponse[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await getAllComments(currentPage, 50);
        if (response && response.content && response.content.length > 0) {
          allComments.push(...response.content);
          currentPage++;
          hasMoreData = !response.last;
        } else {
          hasMoreData = false;
        }
      }

      const approved = allComments.filter(
        (comment) => comment.status === "APPROVED"
      ).length;
      const pending = allComments.filter(
        (comment) => comment.status === "PENDING"
      ).length;
      const hidden = allComments.filter(
        (comment) => comment.status === "HIDDEN"
      ).length;

      // Tính tổng số lượt báo cáo từ tất cả comments
      const totalReportedCount = allComments.reduce((sum, comment) => {
        return sum + (comment.reportedCount || 0);
      }, 0);

      setApprovedCount(approved);
      setPendingCount(pending);
      setHiddenCount(hidden);
      setReportedCount(totalReportedCount); // Cập nhật tổng báo cáo

      console.log("Stats calculated:", {
        approved,
        pending,
        hidden,
        totalReported: totalReportedCount,
      });
    } catch (error) {
      console.error("Failed to fetch all comments for stats:", error);
    }
  };
  const fetchReportStatistics = async () => {
    try {
      // Lấy từ reports API
      const reportStats = await fetchTotalReportedCount();
      const reportStatsValue = await fetchTotalReportedCount();
      setReportedCount(reportStatsValue);

      // Hoặc lấy từ comments API
      const allCommentsResponse = await getAllComments(0, 1000);
      const totalReportedFromComments = allCommentsResponse.content.reduce(
        (sum, comment) => {
          return sum + (comment.reportedCount || 0);
        },
        0
      );

      setReportedCount(totalReportedFromComments);
    } catch (error) {
      console.error("Failed to fetch report statistics:", error);
    }
  };
  const updateStats = (comments: Comment[]) => {
    const approved = comments.filter(
      (comment) => comment.status === "APPROVED"
    ).length;
    const pending = comments.filter(
      (comment) => comment.status === "PENDING"
    ).length;
    const hidden = comments.filter(
      (comment) => comment.status === "HIDDEN"
    ).length;
    const reported = comments.filter((comment) => comment.reported).length;

    setApprovedCount(approved);
    setPendingCount(pending);
    setHiddenCount(hidden);
    setReportedCount(reported);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchCommentsByPage(0);
    fetchTotalReportedCount();
  }, []);

  useEffect(() => {
    if (currentPage === 0) {
      fetchCommentsByPage(0);
    } else {
      fetchCommentsByPage(currentPage);
    }
  }, [currentPage]);

  // Thêm useEffect để lấy số thông báo chưa đọc và lắng nghe thông báo mới
  useEffect(() => {
    // Hàm lấy số thông báo chưa đọc
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getNotifications();
        const count = response.content.filter((n) => !n.readStatus).length;
        setUnreadNotifications(count);
      } catch (error) {
        console.error("Failed to fetch unread notifications count:", error);
      }
    };

    // Lấy số lượng thông báo chưa đọc khi component mount
    fetchUnreadCount();

    // Đăng ký callback để cập nhật khi có thông báo mới
    const handleNewNotification = (notification: any) => {
      if (!notification.readStatus) {
        setUnreadNotifications((prev) => prev + 1);
      }
    };

    // Đảm bảo WebSocket được kết nối
    notificationApi.connect().then(() => {
      notificationApi.registerCallback(handleNewNotification);
    });

    // Cleanup khi component unmount
    return () => {
      notificationApi.unregisterCallback(handleNewNotification);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Check className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "HIDDEN":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Ẩn
          </Badge>
        );
      case "PENDING":
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

  const handleUpdateCommentStatus = async (
    commentId: string,
    newStatus: "APPROVED" | "HIDDEN" | "PENDING"
  ) => {
    try {
      const currentComment = comments.find((c) => c.id === commentId);
      const oldStatus = currentComment?.status;

      await updateCommentStatus(commentId, newStatus);

      if (oldStatus) {
        switch (oldStatus) {
          case "APPROVED":
            setApprovedCount((prev) => prev - 1);
            break;
          case "PENDING":
            setPendingCount((prev) => prev - 1);
            break;
          case "HIDDEN":
            setHiddenCount((prev) => prev - 1);
            break;
        }
      }

      switch (newStatus) {
        case "APPROVED":
          setApprovedCount((prev) => prev + 1);
          break;
        case "PENDING":
          setPendingCount((prev) => prev + 1);
          break;
        case "HIDDEN":
          setHiddenCount((prev) => prev + 1);
          break;
      }

      await fetchCommentsByPage(currentPage);
    } catch (error) {
      console.error("Failed to update comment status:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);

      const deletedComment = comments.find((c) => c.id === commentId);

      setTotalComments((prev) => prev - 1);

      if (deletedComment) {
        switch (deletedComment.status) {
          case "APPROVED":
            setApprovedCount((prev) => prev - 1);
            break;
          case "PENDING":
            setPendingCount((prev) => prev - 1);
            break;
          case "HIDDEN":
            setHiddenCount((prev) => prev - 1);
            break;
        }
        if (deletedComment.reported) {
          setReportedCount((prev) => prev - 1);
        }
      }

      await fetchCommentsByPage(currentPage);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setIsEditDialogOpen(true);
  };

  const handleSelectComment = (commentId: string) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (
      selectedComments.length === filteredComments.length &&
      filteredComments.length > 0
    ) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map((comment) => comment.id));
    }
  };

  const handleBulkAction = async (action: "approve" | "hide" | "delete") => {
    const operations: Promise<void | CommentResponse>[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const commentId of selectedComments) {
      if (action === "delete") {
        operations.push(
          deleteComment(commentId)
            .then(() => {
              successCount++;
            })
            .catch((err) => {
              console.error(`Failed to delete comment ${commentId}:`, err);
              failCount++;
            })
        );
      } else {
        const newStatus = action === "approve" ? "APPROVED" : "HIDDEN";
        operations.push(
          updateCommentStatus(commentId, newStatus)
            .then(() => {
              successCount++;
            })
            .catch((err) => {
              console.error(
                `Failed to update comment ${commentId} status to ${newStatus}:`,
                err
              );
              failCount++;
            })
        );
      }
    }

    await Promise.allSettled(operations);

    if (failCount > 0) {
      alert(
        `Đã hoàn thành hành động hàng loạt với ${successCount} thành công và ${failCount} thất bại.`
      );
    } else {
      alert(`Đã hoàn thành hành động hàng loạt cho ${successCount} bình luận.`);
    }

    setSelectedComments([]);
    fetchAllComments();
  };

  const handleOpenReportDialog = (comment: Comment) => {
    setReportingComment(comment);
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

  const handleSubmitReport = async () => {
    if (reportingComment && reportReasons.length > 0) {
      try {
        // Here you would typically send the report to your backend
        console.log("Reporting comment:", reportingComment.id);
        console.log("Reasons:", reportReasons);
        console.log("Details:", reportDetails);

        setComments((prev) =>
          prev.map((comment) =>
            comment.id === reportingComment.id
              ? { ...comment, reported: true }
              : comment
          )
        );
        setReportedCount((prev) => prev + 1);
        setIsReportDialogOpen(false);
        setReportingComment(null);
        setReportReasons([]);
        setReportDetails("");
      } catch (error) {
        console.error("Failed to submit report:", error);
      }
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      comment.user.toLowerCase().includes(appliedSearchTerm.toLowerCase());
    const matchesRecipe =
      appliedSelectedRecipe === "all" ||
      comment.recipe === appliedSelectedRecipe;
    const matchesStatus =
      appliedSelectedStatus === "all" ||
      comment.status === appliedSelectedStatus;
    const matchesDate =
      !appliedSelectedDate || comment.date === appliedSelectedDate;

    return matchesSearch && matchesRecipe && matchesStatus && matchesDate;
  });

  const getUniqueRecipes = () => {
    return [...new Set(comments.map((comment) => comment.recipe))];
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

  return (
    <div>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <Header
            title="Quản lý Bình luận"
            showSearch={false}
            userName="Nguyễn Huỳnh Quốc Tuấn"
            onLogout={handleLogout}
            notificationCount={unreadCount} // Thêm prop này
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng bình luận
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                      {totalComments}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đã duyệt
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {approvedCount}
                    </p>
                  </div>
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Chờ duyệt
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pendingCount}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã ẩn</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {hiddenCount}
                    </p>
                  </div>
                  <EyeOff className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Bị báo cáo
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {commentReportCount}
                    </p>
                  </div>
                  <Flag className="w-8 h-8 text-red-600" />
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
                            Bạn có chắc chắn muốn xóa {selectedComments.length}{" "}
                            bình luận đã chọn? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <DialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleBulkAction("delete")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Xóa
                          </AlertDialogAction>
                        </DialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm nội dung hoặc người dùng..."
                      value={tempSearchTerm}
                      onChange={(e) => setTempSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Công thức
                  </Label>
                  <Select
                    value={tempSelectedRecipe}
                    onValueChange={setTempSelectedRecipe}
                  >
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
                  <Select
                    value={tempSelectedStatus}
                    onValueChange={setTempSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                      <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                      <SelectItem value="HIDDEN">Ẩn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Ngày đăng
                  </Label>
                  <Input
                    type="date"
                    value={tempSelectedDate}
                    onChange={(e) => setTempSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={handleApplyFilter}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Áp dụng bộ lọc
                  </Button>
                  {hasActiveFilters() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilter}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {hasActiveFilters() && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-orange-800">
                        Bộ lọc đang áp dụng:
                      </span>
                      {appliedSearchTerm && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Tìm kiếm: "{appliedSearchTerm}"
                        </Badge>
                      )}
                      {appliedSelectedRecipe !== "all" && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Công thức: {appliedSelectedRecipe}
                        </Badge>
                      )}
                      {appliedSelectedStatus !== "all" && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Trạng thái:{" "}
                          {appliedSelectedStatus === "APPROVED"
                            ? "Đã duyệt"
                            : appliedSelectedStatus === "PENDING"
                            ? "Chờ duyệt"
                            : "Ẩn"}
                        </Badge>
                      )}
                      {appliedSelectedDate && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Ngày: {appliedSelectedDate}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-orange-600">
                      Tìm thấy {filteredComments.length} kết quả
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={
                            selectedComments.length ===
                              filteredComments.length &&
                            filteredComments.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        STT
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
                    {filteredComments.length === 0 && !loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-8 text-gray-500"
                        >
                          {hasActiveFilters()
                            ? "Không tìm thấy bình luận nào phù hợp với bộ lọc."
                            : "Không có bình luận nào."}
                        </td>
                      </tr>
                    ) : (
                      filteredComments.map((comment, index) => (
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
                          <td className="py-3 px-4 text-gray-600">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {comment.user}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {comment.recipe}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs">
                            <div className="truncate" title={comment.content}>
                              {comment.content}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {comment.date}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(comment.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Dialog
                                open={
                                  isEditDialogOpen &&
                                  editingComment?.id === comment.id
                                }
                                onOpenChange={setIsEditDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditComment(comment)}
                                    className="h-9 w-9 p-0"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chỉnh sửa bình luận
                                    </DialogTitle>
                                    <DialogDescription>
                                      Chỉnh sửa nội dung bình luận của{" "}
                                      {editingComment?.user || "người dùng này"}
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
                                      onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingComment(null);
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={
                                  isReportDialogOpen &&
                                  reportingComment?.id === comment.id
                                }
                                onOpenChange={setIsReportDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleOpenReportDialog(comment)
                                    }
                                    className={
                                      comment.reported
                                        ? "text-red-600 border-red-600 bg-red-50 h-9 w-9 p-0"
                                        : "text-orange-600 border-orange-600 hover:bg-orange-50 h-9 w-9 p-0"
                                    }
                                    disabled={comment.reported}
                                    title="Báo cáo bình luận"
                                  >
                                    <Flag className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Báo cáo bình luận</DialogTitle>
                                    <DialogDescription>
                                      Báo cáo bình luận của{" "}
                                      <strong>{reportingComment?.user}</strong>
                                      <br />
                                      Vui lòng chọn lý do báo cáo và cung cấp
                                      thêm thông tin chi tiết.
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
                                              checked={reportReasons.includes(
                                                reason
                                              )}
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
                                        <strong>Lưu ý:</strong> Báo cáo sai lệch
                                        có thể dẫn đến việc tài khoản của bạn bị
                                        hạn chế.
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setIsReportDialogOpen(false)
                                      }
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

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`h-9 w-9 p-0 border-2 ${
                                      comment.status === "APPROVED"
                                        ? "text-green-600 border-green-600 bg-green-50 hover:bg-green-100"
                                        : comment.status === "PENDING"
                                        ? "text-yellow-600 border-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                                        : "text-gray-600 border-gray-600 bg-gray-50 hover:bg-gray-100"
                                    }`}
                                    title={`Trạng thái: ${
                                      comment.status === "APPROVED"
                                        ? "Đã duyệt"
                                        : comment.status === "PENDING"
                                        ? "Chờ duyệt"
                                        : "Ẩn"
                                    }`}
                                  >
                                    {comment.status === "APPROVED" ? (
                                      <Check className="w-4 h-4" />
                                    ) : comment.status === "PENDING" ? (
                                      <MessageSquare className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCommentStatus(
                                        comment.id,
                                        "APPROVED"
                                      )
                                    }
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Đã duyệt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCommentStatus(
                                        comment.id,
                                        "PENDING"
                                      )
                                    }
                                    className="text-yellow-600 hover:bg-yellow-50"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chờ duyệt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCommentStatus(
                                        comment.id,
                                        "HIDDEN"
                                      )
                                    }
                                    className="text-gray-600 hover:bg-gray-50"
                                  >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Ẩn
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

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
                                    <AlertDialogTitle>
                                      Xác nhận xóa
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa bình luận này?
                                      Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <DialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </DialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!hasActiveFilters() && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-orange-500 text-white"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      «
                    </Button>
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        className={
                          currentPage === index
                            ? "bg-orange-500 text-white"
                            : "outline"
                        }
                        onClick={() => setCurrentPage(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      className="bg-orange-500 text-white"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      »
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
