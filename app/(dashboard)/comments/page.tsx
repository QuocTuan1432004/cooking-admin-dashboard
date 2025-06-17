"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    getAllComments,
    deleteComment,
    CommentResponse,
    updateCommentStatus,
} from "../../../hooks/commentApi/commentApi";
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
    Clock,
    X,
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
}

const formatDateToYYYYMMDD = (isoString: string): string => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
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
    
    // Tách biệt các giá trị filter hiện tại và đã áp dụng
    const [tempSearchTerm, setTempSearchTerm] = useState("");
    const [tempSelectedRecipe, setTempSelectedRecipe] = useState("all");
    const [tempSelectedStatus, setTempSelectedStatus] = useState("all");
    const [tempSelectedDate, setTempSelectedDate] = useState("");
    
    // Các giá trị filter được áp dụng
    const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
    const [appliedSelectedRecipe, setAppliedSelectedRecipe] = useState("all");
    const [appliedSelectedStatus, setAppliedSelectedStatus] = useState("all");
    const [appliedSelectedDate, setAppliedSelectedDate] = useState("");
    
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 10;
    const [totalComments, setTotalComments] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [hiddenCount, setHiddenCount] = useState(0);

    const handleLogout = () => {
        console.log("Đăng xuất thành công");
        localStorage.removeItem("auth_token");
        router.push("/login");
    };

    // Hàm xử lý khi bấm nút Lọc
    const handleApplyFilter = async () => {
        // Nếu có bất kỳ filter nào, tải tất cả dữ liệu để tìm kiếm
        if (tempSearchTerm || tempSelectedRecipe !== "all" || tempSelectedStatus !== "all" || tempSelectedDate) {
            await fetchAllComments(); // Tải tất cả comments
        } else {
            // Nếu không có filter, về phân trang bình thường
            await fetchCommentsByPage(0);
        }
        
        setAppliedSearchTerm(tempSearchTerm);
        setAppliedSelectedRecipe(tempSelectedRecipe);
        setAppliedSelectedStatus(tempSelectedStatus);
        setAppliedSelectedDate(tempSelectedDate);
        setCurrentPage(0);
    };

    // Hàm xóa bộ lọc
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
        
        // Về lại phân trang bình thường khi xóa filter
        await fetchCommentsByPage(0);
    };

    // Kiểm tra xem có filter nào đang được áp dụng không
    const hasActiveFilters = () => {
        return appliedSearchTerm !== "" || 
               appliedSelectedRecipe !== "all" || 
               appliedSelectedStatus !== "all" || 
               appliedSelectedDate !== "";
    };

    const fetchAllComments = async () => {
        setLoading(true);
        let page = 0;
        const size = 10;
        const allComments: any[] = [];

        try {
            while (true) {
                const response = await getAllComments(page, size);
                console.log(`API Response for page ${page}:`, response);

                if (!response || !response.content || !Array.isArray(response.content) || response.content.length === 0) {
                    console.log("No more comments to load.");
                    break;
                }

                const mappedComments = response.content.map((comment: CommentResponse) => ({
                    id: comment.id,
                    user: comment.username || "Unknown User",
                    recipe: comment.recipeTitle || "Unknown Recipe",
                    content: comment.commentText || "No content",
                    date: comment.createdAt ? formatDateToYYYYMMDD(comment.createdAt) : "Unknown Date",
                    status: comment.status || "PENDING",
                }));

                allComments.push(...mappedComments);
                page++;
            }

            setComments(allComments);
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
                const mappedComments = response.content.map((comment: CommentResponse) => ({
                    id: comment.id,
                    user: comment.username || "Unknown User",
                    recipe: comment.recipeTitle || "Unknown Recipe",
                    content: comment.commentText || "No content",
                    date: comment.createdAt ? formatDateToYYYYMMDD(comment.createdAt) : "Unknown Date",
                    status: comment.status || "PENDING",
                }));
                
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

            const approved = allComments.filter(comment => comment.status === 'APPROVED').length;
            const pending = allComments.filter(comment => comment.status === 'PENDING').length;
            const hidden = allComments.filter(comment => comment.status === 'HIDDEN').length;

            setApprovedCount(approved);
            setPendingCount(pending);
            setHiddenCount(hidden);
            
            console.log("Stats calculated:", { approved, pending, hidden });
        } catch (error) {
            console.error("Failed to fetch all comments for stats:", error);
        }
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
    }, []);

    useEffect(() => {
        if (currentPage === 0) {
            fetchCommentsByPage(0);
        } else {
            fetchCommentsByPage(currentPage);
        }
    }, [currentPage]);

    const refreshStats = async () => {
        try {
            const response = await getAllComments(0, size);
            if (response) {
                setTotalComments(response.totalElements || 0);
                setApprovedCount(response.totalApproved || 0);
                setPendingCount(response.totalPending || 0);
                setHiddenCount(response.totalHidden || 0);
            }
        } catch (error) {
            console.error("Failed to refresh stats:", error);
        }
    };

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

    const handleUpdateCommentStatus = async (commentId: string, newStatus: "APPROVED" | "HIDDEN" | "PENDING") => {
        try {
            const currentComment = comments.find(c => c.id === commentId);
            const oldStatus = currentComment?.status;
            
            await updateCommentStatus(commentId, newStatus);
            
            if (oldStatus) {
                switch (oldStatus) {
                    case "APPROVED":
                        setApprovedCount(prev => prev - 1);
                        break;
                    case "PENDING":
                        setPendingCount(prev => prev - 1);
                        break;
                    case "HIDDEN":
                        setHiddenCount(prev => prev - 1);
                        break;
                }
            }
            
            switch (newStatus) {
                case "APPROVED":
                    setApprovedCount(prev => prev + 1);
                    break;
                case "PENDING":
                    setPendingCount(prev => prev + 1);
                    break;
                case "HIDDEN":
                    setHiddenCount(prev => prev + 1);
                    break;
            }
            
            await fetchCommentsByPage(currentPage);
            
            console.log(`Comment status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update comment status:", error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            
            const deletedComment = comments.find(c => c.id === commentId);
            
            setTotalComments(prev => prev - 1);
            
            if (deletedComment) {
                switch (deletedComment.status) {
                    case "APPROVED":
                        setApprovedCount(prev => prev - 1);
                        break;
                    case "PENDING":
                        setPendingCount(prev => prev - 1);
                        break;
                    case "HIDDEN":
                        setHiddenCount(prev => prev - 1);
                        break;
                }
            }
            
            await fetchCommentsByPage(currentPage);
            
            console.log("Comment deleted successfully");
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
        if (selectedComments.length === comments.length && comments.length > 0) {
            setSelectedComments([]);
        } else {
            setSelectedComments(comments.map((comment) => comment.id));
        }
    };

    const handleBulkAction = async (action: "approve" | "hide" | "delete") => {
        const operations: Promise<void | CommentResponse>[] = [];
        let successCount = 0;
        let failCount = 0;

        for (const commentId of selectedComments) {
            if (action === "delete") {
                operations.push(deleteComment(commentId)
                    .then(() => { successCount++; })
                    .catch((err) => {
                        console.error(`Failed to delete comment ${commentId}:`, err);
                        failCount++;
                    })
                );
            } else {
                const newStatus = action === "approve" ? "APPROVED" : "HIDDEN";
                operations.push(updateCommentStatus(commentId, newStatus)
                    .then(() => { successCount++; })
                    .catch((err) => {
                        console.error(`Failed to update comment ${commentId} status to ${newStatus}:`, err);
                        failCount++;
                    })
                );
            }
        }

        await Promise.allSettled(operations);

        if (failCount > 0) {
            alert(`Đã hoàn thành hành động hàng loạt với ${successCount} thành công và ${failCount} thất bại. Vui lòng kiểm tra console để biết chi tiết.`);
        } else {
            alert(`Đã hoàn thành hành động hàng loạt cho ${successCount} bình luận.`);
        }

        setSelectedComments([]);
        fetchAllComments();
    };

    // Sử dụng appliedFilters thay vì temp filters cho việc lọc
    const filteredComments = comments.filter((comment) => {
        const matchesSearch =
            comment.content.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
            comment.user.toLowerCase().includes(appliedSearchTerm.toLowerCase());
        const matchesRecipe =
            appliedSelectedRecipe === "all" || comment.recipe === appliedSelectedRecipe;
        const matchesStatus =
            appliedSelectedStatus === "all" || comment.status === appliedSelectedStatus;
        const matchesDate = !appliedSelectedDate || comment.date === appliedSelectedDate;

        return matchesSearch && matchesRecipe && matchesStatus && matchesDate;
    });

    const getUniqueRecipes = () => {
        const recipes = [...new Set(comments.map((comment) => comment.recipe))];
        return recipes;
    };

    const getStatusCounts = () => {
        return {
            total: comments.length,
            approved: comments.filter((c) => c.status === "APPROVED").length,
            hidden: comments.filter((c) => c.status === "HIDDEN").length,
            pending: comments.filter((c) => c.status === "PENDING").length,
        };
    };

    const statusCounts = getStatusCounts();

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
                        notificationCount={3}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Tổng bình luận</p>
                                        <p className="text-2xl font-bold">{totalComments}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Check className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                                        <p className="text-2xl font-bold">{approvedCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Clock className="h-8 w-8 text-yellow-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                                        <p className="text-2xl font-bold">{pendingCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <EyeOff className="h-8 w-8 text-gray-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Đã ẩn</p>
                                        <p className="text-2xl font-bold">{hiddenCount}</p>
                                    </div>
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
                                    <Select value={tempSelectedRecipe} onValueChange={setTempSelectedRecipe}>
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
                                    <Select value={tempSelectedStatus} onValueChange={setTempSelectedStatus}>
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
                                    <Label className="text-sm font-medium text-gray-700 mb-2">Ngày đăng</Label>
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
                                        Lọc
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

                            {/* Hiển thị thông tin bộ lọc đang áp dụng */}
                            {hasActiveFilters() && (
                                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-orange-800">Bộ lọc đang áp dụng:</span>
                                            {appliedSearchTerm && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    Tìm kiếm: "{appliedSearchTerm}"
                                                </Badge>
                                            )}
                                            {appliedSelectedRecipe !== "all" && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    Công thức: {appliedSelectedRecipe}
                                                </Badge>
                                            )}
                                            {appliedSelectedStatus !== "all" && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    Trạng thái: {appliedSelectedStatus === "APPROVED" ? "Đã duyệt" : 
                                                                appliedSelectedStatus === "PENDING" ? "Chờ duyệt" : "Ẩn"}
                                                </Badge>
                                            )}
                                            {appliedSelectedDate && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
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

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
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
                                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                                    {hasActiveFilters() 
                                                        ? "Không tìm thấy bình luận nào phù hợp với bộ lọc." 
                                                        : "Không có bình luận nào."
                                                    }
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
                                                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                                    <td className="py-3 px-4 font-medium">{comment.user}</td>
                                                    <td className="py-3 px-4 text-gray-600">{comment.recipe}</td>
                                                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                                                        <div className="truncate" title={comment.content}>
                                                            {comment.content}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{comment.date}</td>
                                                    <td className="py-3 px-4">{getStatusBadge(comment.status)}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            <Dialog open={isEditDialogOpen && editingComment?.id === comment.id} onOpenChange={setIsEditDialogOpen}>
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
                                                                            Chỉnh sửa nội dung bình luận của {editingComment?.user || "người dùng này"}
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label>Nội dung bình luận</Label>
                                                                            <Textarea
                                                                                value={editContent}
                                                                                onChange={(e) => setEditContent(e.target.value)}
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
                                                                            Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
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

                                                            {comment.status === "HIDDEN" || comment.status === "PENDING" ? (
                                                                <Button
                                                                    size="sm"
                                                                    title="Duyệt bình luận"
                                                                    onClick={() => handleUpdateCommentStatus(comment.id, "APPROVED")}
                                                                    className="bg-green-500 hover:bg-green-600"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    title="Ẩn bình luận"
                                                                    onClick={() => handleUpdateCommentStatus(comment.id, "HIDDEN")}
                                                                    className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                                                >
                                                                    <EyeOff className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Thêm điều kiện ẩn phân trang khi có filter */}
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
                                                className={currentPage === index ? "bg-orange-500 text-white" : "outline"}
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