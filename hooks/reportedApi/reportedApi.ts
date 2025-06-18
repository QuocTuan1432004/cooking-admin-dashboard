"use client";

import { authenticatedFetch } from '../userAuth'; // Adjusted path to userAuth 

const BASE_URL = "http://localhost:8080/reports";
// Thay đổi cổng thành cổng backend

export interface ReportRequest {
  reportType: 'REPORT_RECIPE' | 'REPORT_COMMENT' | 'REPORT_USER';
  reportedItemId: string;
  reason: string;
  description?: string;
}

// Thêm một interface mới hoặc cập nhật ReportRequest nếu bạn muốn bao gồm File
// Ví dụ:
export interface ReportCreatePayload extends ReportRequest {
  evidenceImage?: File; // Đảm bảo kiểu là File (để nhận từ input type="file")
}

export interface ReportStatusUpdateRequest {
  newStatus: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminResponse?: string;
}

export interface ReportResponse {
  id: string;

  // Flattened reporter account info
  reporterAccountUsername: string;
  reporterAccountEmail: string;

  // Flattened reported account info
  reportedAccountUsername: string;
  reportedAccountEmail: string;

  reportType: 'REPORT_RECIPE' | 'REPORT_COMMENT' | 'REPORT_USER';
  reportedItemId: string;
  reason: string;
  description?: string; // If your Java DTO can send this, keep it. Otherwise, remove it.
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'RESOLVED' | 'REJECTED'; // Use string literal types if you map enums
  createdAt: string; // Will need to parse LocalDateTime from backend
  adminResponse?: string | null; // Use string | null as backend sends null
  evidenceImageUrl?: string | null; // Use string | null as backend sends null

  // Flattened resolvedByAdmin info
  resolvedByAdminUsername?: string | null; // Use string | null
  resolvedByAdminEmail?: string | null;     // Use string | null
  resolvedAt?: string | null;               // Will need to parse LocalDateTime from backend
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// POST /reports - Tạo báo cáo mới (USER role)
export const createReport = async (reportData: ReportCreatePayload): Promise<ReportResponse> => {
  try {
    console.log("Creating report with data:", reportData);
    
    // Nếu có file, sử dụng FormData
    if (reportData.evidenceImage) {
      const formData = new FormData();
      formData.append('reportType', reportData.reportType);
      formData.append('reportedItemId', reportData.reportedItemId);
      formData.append('reason', reportData.reason);
      if (reportData.description) {
        formData.append('description', reportData.description);
      }
      formData.append('evidenceImage', reportData.evidenceImage);

      const response = await authenticatedFetch(`${BASE_URL}`, {
        method: 'POST',
        body: formData, // Không set Content-Type khi dùng FormData
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        throw new Error(`Failed to create report with image: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } 
    // Nếu không có file, gửi JSON
    else {
      const { evidenceImage, ...jsonData } = reportData; // Loại bỏ evidenceImage
      
      const response = await authenticatedFetch(`${BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        
        // Xử lý các lỗi cụ thể từ backend
        if (response.status === 403) {
          throw new Error("Bạn không có quyền tạo báo cáo");
        } else if (response.status === 400) {
          if (errorBody.includes('CANNOT_REPORT_OWN_CONTENT')) {
            throw new Error("Không thể báo cáo nội dung của chính mình");
          } else if (errorBody.includes('CANNOT_REPORT_OWN_ACCOUNT')) {
            throw new Error("Không thể báo cáo tài khoản của chính mình");
          } else if (errorBody.includes('RECIPE_NOT_FOUND')) {
            throw new Error("Công thức không tồn tại");
          } else if (errorBody.includes('COMMENT_NOT_EXIST')) {
            throw new Error("Bình luận không tồn tại");
          } else if (errorBody.includes('USER_NOT_FOUND')) {
            throw new Error("Người dùng không tồn tại");
          } else {
            throw new Error("Dữ liệu không hợp lệ");
          }
        } else {
          throw new Error(`Failed to create report: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log("createReport Response:", data);
      
      if (!data || !data.result) {
        throw new Error("Invalid response format: 'result' field missing.");
      }
      
      return data.result;
    }
  } catch (error) {
    console.error("Error in createReport:", error);
    throw error;
  }
};

// GET /reports - Lấy tất cả báo cáo với phân trang và lọc (ADMIN role)
// Thêm các tham số lọc mới vào getAllReports
export const getAllReports = async (
    page = 0, 
    size = 10, 
    status?: 'PENDING' | 'RESOLVED' | 'REJECTED' | 'all', // Có thể thêm 'all' để bao gồm tất cả
    reportType?: 'REPORT_RECIPE' | 'REPORT_COMMENT' | 'REPORT_USER' | 'all', // Thêm bộ lọc theo loại báo cáo
    reportedItemId?: string, // Thêm bộ lọc theo ID vật phẩm bị báo cáo
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'all', // Thêm bộ lọc theo mức độ nghiêm trọng
    sort = 'createdAt',
    direction = 'DESC'
  ): Promise<Page<ReportResponse>> => {
    try {
      let url = `${BASE_URL}?page=${page}&size=${size}&sort=${sort},${direction}`;
      
      if (status && status !== 'all') {
        url += `&status=${status.toUpperCase()}`;
      }
      // THÊM CÁC BỘ LỌC MỚI Ở ĐÂY
      if (reportType && reportType !== 'all') {
          url += `&reportType=${reportType.toUpperCase()}`;
      }
      if (reportedItemId) {
          url += `&reportedItemId=${reportedItemId}`;
      }
      if (severity && severity !== 'all') {
          url += `&severity=${severity.toUpperCase()}`;
      }
  
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Bạn không có quyền xem danh sách báo cáo");
        }
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("getAllReports Response:", data);
      
      if (!data || !data.result || !Array.isArray(data.result.content)) {
        throw new Error("Invalid response format");
      }
      
      return data.result;
    } catch (error) {
      console.error("Error in getAllReports:", error);
      throw error;
    }
  };

// GET /reports/{reportId} - Lấy chi tiết báo cáo theo ID (ADMIN role)
export const getReportById = async (reportId: string): Promise<ReportResponse> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${reportId}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      
      if (response.status === 403) {
        throw new Error("Bạn không có quyền xem chi tiết báo cáo");
      } else if (response.status === 404) {
        throw new Error("Báo cáo không tồn tại");
      }
      
      throw new Error(`Failed to fetch report: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("getReportById Response:", data);
    
    if (!data || !data.result) {
      throw new Error("Invalid response format: 'result' field missing.");
    }
    
    return data.result;
  } catch (error) {
    console.error("Error in getReportById:", error);
    throw error;
  }
};

// PUT /reports/{reportId}/status - Cập nhật trạng thái báo cáo (ADMIN role)
export const updateReportStatus = async (
  reportId: string,
  statusUpdate: ReportStatusUpdateRequest
): Promise<ReportResponse> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusUpdate),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      
      if (response.status === 403) {
        throw new Error("Bạn không có quyền cập nhật trạng thái báo cáo");
      } else if (response.status === 404) {
        throw new Error("Báo cáo không tồn tại");
      }
      
      throw new Error(`Failed to update report status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("updateReportStatus Response:", data);
    
    if (!data || !data.result) {
      throw new Error("Invalid response format: 'result' field missing.");
    }
    
    return data.result;
  } catch (error) {
    console.error("Error in updateReportStatus:", error);
    throw error;
  }
};

// DELETE /reports/{reportId} - Xóa báo cáo (ADMIN role)
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/${reportId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      
      if (response.status === 403) {
        throw new Error("Bạn không có quyền xóa báo cáo");
      } else if (response.status === 404) {
        throw new Error("Báo cáo không tồn tại");
      }
      
      throw new Error(`Failed to delete report: ${response.status} - ${response.statusText}`);
    }
    
    console.log("Report deleted successfully");
  } catch (error) {
    console.error("Error in deleteReport:", error);
    throw error;
  }
};

// Helper functions

// Lấy báo cáo theo trạng thái cụ thể
export const getReportsByStatus = async (
  status: 'PENDING' | 'RESOLVED' | 'REJECTED',
  page = 0,
  size = 10
): Promise<Page<ReportResponse>> => {
  return getAllReports(page, size, status);
};

// Lấy thống kê báo cáo
export const getReportStatistics = async (): Promise<{
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
  byType: {
    recipe: number;
    comment: number;
    user: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}> => {
  try {
    const allReports = await getAllReports(0, 1000);
    
    const total = allReports.totalElements;
    const pending = allReports.content.filter(report => report.status === 'PENDING').length;
    const resolved = allReports.content.filter(report => report.status === 'RESOLVED').length;
    const rejected = allReports.content.filter(report => report.status === 'REJECTED').length;
    
    const recipeReports = allReports.content.filter(report => report.reportType === 'REPORT_RECIPE').length;
    const commentReports = allReports.content.filter(report => report.reportType === 'REPORT_COMMENT').length;
    const userReports = allReports.content.filter(report => report.reportType === 'REPORT_USER').length;
    
    const lowSeverity = allReports.content.filter(report => report.severity === 'LOW').length;
    const mediumSeverity = allReports.content.filter(report => report.severity === 'MEDIUM').length;
    const highSeverity = allReports.content.filter(report => report.severity === 'HIGH').length;
    const criticalSeverity = allReports.content.filter(report => report.severity === 'CRITICAL').length;
    
    return {
      total,
      pending,
      resolved,
      rejected,
      byType: {
        recipe: recipeReports,
        comment: commentReports,
        user: userReports,
      },
      bySeverity: {
        low: lowSeverity,
        medium: mediumSeverity,
        high: highSeverity,
        critical: criticalSeverity,
      },
    };
  } catch (error) {
    console.error("Error in getReportStatistics:", error);
    throw error;
  }
};

// Hàm tạo báo cáo cho từng loại
export const createCommentReport = async (
  commentId: string,
  reason: string,
  description?: string,
  evidenceImage?: File
): Promise<ReportResponse> => {
  return createReport({
    reportType: 'REPORT_COMMENT',
    reportedItemId: commentId,
    reason,
    description,
    evidenceImage,
  });
};

export const createRecipeReport = async (
  recipeId: string,
  reason: string,
  description?: string,
  evidenceImage?: File
): Promise<ReportResponse> => {
  return createReport({
    reportType: 'REPORT_RECIPE',
    reportedItemId: recipeId,
    reason,
    description,
    evidenceImage,
  });
};

export const createUserReport = async (
  userId: string,
  reason: string,
  description?: string,
  evidenceImage?: File
): Promise<ReportResponse> => {
  return createReport({
    reportType: 'REPORT_USER',
    reportedItemId: userId,
    reason,
    description,
    evidenceImage,
  });
};

// Thêm interface này nếu bạn muốn gửi một danh sách các ID để cập nhật trạng thái
export interface BulkReportStatusUpdateRequest {
  reportIds: string[];
  newStatus: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminResponse?: string;
}

// Hàm cập nhật trạng thái hàng loạt
export const bulkUpdateReportStatus = async (
  statusUpdate: BulkReportStatusUpdateRequest
): Promise<ReportResponse[]> => { // Có thể trả về mảng các báo cáo đã cập nhật hoặc một thông báo thành công
  try {
    // Đảm bảo bạn có endpoint backend để xử lý yêu cầu này, ví dụ: /reports/bulk-status
    const response = await authenticatedFetch(`${BASE_URL}/bulk-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusUpdate),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`Failed to bulk update report status: ${response.status} - ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    console.log("bulkUpdateReportStatus Response:", data);
    return data.result; // Giả định backend trả về một trường 'result' chứa dữ liệu
  } catch (error) {
    console.error("Error in bulkUpdateReportStatus:", error);
    throw error;
  }
};

// Hàm xóa báo cáo hàng loạt
export const bulkDeleteReports = async (reportIds: string[]): Promise<void> => {
  try {
    // Đảm bảo bạn có endpoint backend để xử lý yêu cầu này, ví dụ: /reports/bulk-delete
    const response = await authenticatedFetch(`${BASE_URL}/bulk-delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportIds), // Gửi mảng các ID
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`Failed to bulk delete reports: ${response.status} - ${response.statusText} - ${errorBody}`);
    }

    console.log("Reports deleted successfully in bulk");
  } catch (error) {
    console.error("Error in bulkDeleteReports:", error);
    throw error;
  }
};