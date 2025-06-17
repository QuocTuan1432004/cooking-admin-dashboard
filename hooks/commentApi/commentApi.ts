"use client";

import { authenticatedFetch } from '../userAuth'; // Adjusted path to parent directory
const BASE_URL = "http://localhost:8080/comments"; // Thay đổi cổng thành cổng backend

export interface CommentResponse {
  id: string;
  commentText: string;
  status?: 'APPROVED' | 'HIDDEN' | 'PENDING'; // Nếu `status` không bắt buộc, thêm dấu `?`
  createdAt: string;
  accountId: string; // Thay vì `account`
  username: string; // Thêm `username` từ API
  recipeId: string; // Thay vì `recipe`
  recipeTitle: string; // Thêm `recipeTitle` từ API
}

interface Page<T> {
  content: T[];
  totalElements: number; // Tổng số bình luận
  totalPages: number; // Tổng số trang
  size: number; // Số lượng phần tử trên mỗi trang
  number: number; // Số trang hiện tại (bắt đầu từ 0)
  first: boolean; // Có phải trang đầu tiên không
  last: boolean; // Có phải trang cuối cùng không
  totalApproved?: number; // Tổng số bình luận đã duyệt (nếu API trả về)
  totalPending?: number; // Tổng số bình luận chờ duyệt (nếu API trả về)
  totalHidden?: number; // Tổng số bình luận đã ẩn (nếu API trả về)
}

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
            method: 'DELETE', // Thêm phương thức HTTP
        });
        if (!response.ok) {
            // Log chi tiết lỗi từ API nếu có
            const errorBody = await response.text(); // Đọc body lỗi nếu có
            console.error(`Error response body: ${errorBody}`);
            throw new Error(`Failed to delete comment: ${response.status} - ${response.statusText}`);
        }
        console.log("Comment deleted successfully");
    } catch (error) {
        console.error("Error in deleteComment:", error); // Log lỗi chi tiết hơn
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
      console.log("getAllComments Response:", data); // Log dữ liệu trả về từ API
  
      // Kiểm tra và lấy dữ liệu từ trường `result`
      if (!data || !data.result || !Array.isArray(data.result.content)) {
        throw new Error("Invalid response format");
      }
  
      return data.result; // Trả về `result` chứa thông tin phân trang và danh sách `content`
    } catch (error) {
      console.error("Error in getAllComments:", error);
      throw error;
    }
  };

// PATCH /comments/{commentId}/status - Cập nhật trạng thái comment
export const updateCommentStatus = async (
    commentId: string,
    newStatus: 'APPROVED' | 'HIDDEN' | 'PENDING'
): Promise<CommentResponse> => { // Kiểu trả về là CommentResponse (từ trường result)
    try {
        const response = await authenticatedFetch(`${BASE_URL}/${commentId}/status?status=${newStatus}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error response body: ${errorBody}`);
            throw new Error(`Failed to update comment status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json(); // Phân tích toàn bộ response body
        console.log("updateCommentStatus Response:", data); // Log dữ liệu trả về từ API

        // Kiểm tra và lấy dữ liệu từ trường `result`
        if (!data || !data.result) { // Đối với update, result sẽ là CommentResponse
            throw new Error("Invalid response format: 'result' field missing.");
        }
        
        return data.result; // Trả về dữ liệu từ trường `result`
    } catch (error) {
        console.error("Error in updateCommentStatus:", error);
        throw error;
    }
};
