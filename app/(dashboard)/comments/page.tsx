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
} from "../../../hooks/commentApi/commentApi"; // Đảm bảo đường dẫn đúng
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

// Định nghĩa Comment phù hợp với cách bạn map từ CommentResponse
interface Comment {
    id: string;
    user: string; // Map từ username
    recipe: string; // Map từ recipeTitle
    content: string; // Map từ commentText
    date: string; // Đã được định dạng YYYY-MM-DD
    status: "APPROVED" | "HIDDEN" | "PENDING";
    avatar?: string; // Giữ lại nếu có
}

// Hàm trợ giúp để định dạng ngày thành YYYY-MM-DD
const formatDateToYYYYMMDD = (isoString: string): string => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State để kiểm soát Dialog

    const handleLogout = () => {
        console.log("Đăng xuất thành công");
        localStorage.removeItem("auth_token");
        router.push("/login");
    };

    // Hàm chung để fetch comments
    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await getAllComments(0, 10); // Gọi API lấy comments (page = 0, size = 10)
            console.log("API Response:", response);

            if (!response || !response.content || !Array.isArray(response.content)) {
                console.error("Invalid response format:", response);
                setComments([]); // Clear comments if format is invalid
                return;
            }

            const mappedComments = response.content.map((comment: CommentResponse) => ({
                id: comment.id,
                user: comment.username || "Unknown User",
                recipe: comment.recipeTitle || "Unknown Recipe",
                content: comment.commentText || "No content",
                date: comment.createdAt ? formatDateToYYYYMMDD(comment.createdAt) : "Unknown Date",
                status: comment.status || "PENDING",
            }));
            setComments(mappedComments);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            // Optionally, clear comments or show error message to user
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchComments();
    }, []); // Mảng dependency rỗng để chỉ gọi một lần khi component được mount

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

    // Hàm mới để xử lý cập nhật trạng thái
    const handleUpdateCommentStatus = async (
        commentId: string,
        newStatus: 'APPROVED' | 'HIDDEN' | 'PENDING'
    ) => {
        try {
            const updatedComment = await updateCommentStatus(commentId, newStatus);
            setComments((prev) =>
                prev.map((comment) =>
                    comment.id === updatedComment.id
                        ? { ...comment, status: updatedComment.status || newStatus } // Sử dụng status từ API hoặc fallback
                        : comment
                )
            );
            console.log(`Comment ${commentId} status updated to ${newStatus} successfully.`);
        } catch (error) {
            console.error(`Failed to update comment ${commentId} status to ${newStatus}:`, error);
            alert(`Không thể cập nhật trạng thái bình luận ${commentId}. Vui lòng thử lại.`);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            console.log(`Comment with ID ${commentId} deleted successfully.`);
        } catch (error) {
            console.error("Failed to delete comment:", error);
            alert("Không thể xóa bình luận. Vui lòng thử lại.");
        }
    };

    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
        setIsEditDialogOpen(true); // Mở dialog chỉnh sửa
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
        const operations: Promise<void | CommentResponse>[] = []; // Mảng chứa các Promise của API calls
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

        await Promise.allSettled(operations); // Chờ tất cả các thao tác hoàn thành

        if (failCount > 0) {
            alert(`Đã hoàn thành hành động hàng loạt với ${successCount} thành công và ${failCount} thất bại. Vui lòng kiểm tra console để biết chi tiết.`);
        } else {
            alert(`Đã hoàn thành hành động hàng loạt cho ${successCount} bình luận.`);
        }
        
        setSelectedComments([]);
        fetchComments(); // Fetch lại toàn bộ comments để đảm bảo trạng thái hiển thị chính xác
    };


    const filteredComments = comments.filter((comment) => {
        const matchesSearch =
            comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.user.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRecipe =
            selectedRecipe === "all" || comment.recipe === selectedRecipe;
        const matchesStatus =
            selectedStatus === "all" || comment.status === selectedStatus;

        const matchesDate = !selectedDate || comment.date === selectedDate;

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
                                            onClick={() => handleBulkAction("hide")} // Gọi bulk action "hide"
                                            className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                        >
                                            <EyeOff className="w-4 h-4 mr-1" /> {/* Thêm mr-1 để căn chỉnh icon */}
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
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                        }}
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
                                                    checked={selectedComments.length === filteredComments.length && filteredComments.length > 0} // Cập nhật để phù hợp với filteredComments
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                STT
                                            </th> {/* Đổi ID thành STT để tránh nhầm lẫn với comment.id */}
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
                                                    Không tìm thấy bình luận nào phù hợp với bộ lọc.
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
                                                                    title="Duyệt bình luận" // Thêm title để hover hiển thị
                                                                    onClick={() => handleUpdateCommentStatus(comment.id, "APPROVED")}
                                                                    className="bg-green-500 hover:bg-green-600"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    title="Ẩn bình luận" // Thêm title để hover hiển thị
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
                </>
            )}
        </div>
    );
}