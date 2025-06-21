"use client";

import { authenticatedFetch } from '../userAuth'; // Adjusted path to parent directory
const BASE_URL = "http://localhost:8080/comments"; // Thay đổi cổng thành cổng backend

export interface CommentResponse {
  id: string;
  commentText: string;
  status?: 'APPROVED' | 'HIDDEN' | 'PENDING';
  createdAt: string;
  accountId: string;
  username: string;
  recipeId: string;
  recipeTitle: string;
  reportedCount: number; // Số lần báo cáo bình luận
  reported: boolean;
}

interface Page<T> {
  content: T[];
  totalElements: number; // Tổng số bình luận
  totalPages: number; // Tổng số trang
  size: number; // Số lượng phần tử trên mỗi trang
  number: number; // Số trang hiện tại (bắt đầu từ 0)
  first: boolean; // Có phải trang đầu tiên không
  last: boolean; // Có phải trang cuối cùng không
  totalApproved?: number; // Tổng số bình luận đã duyệt
  totalPending?: number; // Tổng số bình luận chờ duyệt
  totalHidden?: number; // Tổng số bình luận đã ẩn
}

// Function đơn giản chỉ trả về tổng reportedCount
export const getReportStatistics = async (): Promise<{ total: number }> => {
  try {
    const allCommentsResponse = await getAllComments(0, 1000);

    const total = allCommentsResponse.content.reduce((sum, comment) => {
      return sum + (comment.reportedCount || 0);
    }, 0);

    return { total };
  } catch (error) {
    console.error("Error in getReportStatistics:", error);
    return { total: 0 };
  }
};

// GET /comments/recipe/{recipeId} - Lấy danh sách comment theo Recipe ID
export const getCommentsByRecipe = async (recipeId: string, page = 0, size = 10): Promise<Page<CommentResponse>> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/recipe/${recipeId}?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch comments by recipe');
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// POST /comments/{recipeId} - Tạo comment mới
export const createComment = async (recipeId: string, commentText: string): Promise<CommentResponse> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${recipeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentText }),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// DELETE /comments/{commentId} - Xóa comment
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`Failed to delete comment: ${response.status} - ${response.statusText}`);
    }
    console.log("Comment deleted successfully");
  } catch (error) {
    console.error("Error in deleteComment:", error);
    throw error;
  }
};

// GET /comments/all - Lấy tất cả comments
export const getAllComments = async (page = 0, size = 10): Promise<Page<CommentResponse>> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/all?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("getAllComments Response:", data);

    if (!data || !data.result || !Array.isArray(data.result.content)) {
      throw new Error("Invalid response format");
    }

    return data.result;
  } catch (error) {
    console.error("Error in getAllComments:", error);
    throw error;
  }
};

// PATCH /comments/{commentId}/status - Cập nhật trạng thái comment
export const updateCommentStatus = async (
  commentId: string,
  newStatus: 'APPROVED' | 'HIDDEN' | 'PENDING'
): Promise<CommentResponse> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${commentId}/status?status=${newStatus}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }), // Body này có thể không cần thiết nếu backend chỉ dùng @RequestParam
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`Failed to update comment status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("updateCommentStatus Response:", data);

    if (!data || !data.result) {
      throw new Error("Invalid response format: 'result' field missing.");
    }

    return data.result;
  } catch (error) {
    console.error("Error in updateCommentStatus:", error);
    throw error;
  }
};

// NEW: Function để lấy tổng số báo cáo comment từ backend
export const getTotalCommentReports = async (): Promise<number> => {
  try {
    // API endpoint của bạn là /comments/total-comment-reports
    const response = await authenticatedFetch(`${BASE_URL}/total-comment-reports`);
    if (!response.ok) {
      throw new Error(`Failed to fetch total comment reports: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("getTotalCommentReports Response:", data);

    // Backend trả về một đối tượng ApiResponse với trường 'result'
    if (typeof data.result === 'number') {
      return data.result;
    } else {
      throw new Error("Invalid response format: 'result' field is not a number.");
    }
  } catch (error) {
    console.error("Error in getTotalCommentReports:", error);
    throw error;
  }
};