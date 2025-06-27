"use client";
import { useNotification } from "../../../hooks/NotiApi/NotificationContext"; // Adjusted path to parent directory

import { useState, useEffect, useCallback } from "react";
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
  getAllReports,
  updateReportStatus,
  deleteReport,
  getReportStatistics,
  ReportResponse,
  bulkUpdateReportStatus,
  bulkDeleteReports,
} from "../../../hooks/reportedApi/reportedApi";
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
  Flag,
  Search,
  Filter,
  Ban,
  CheckCircle,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ReportsPage() {
  const { unreadCount } = useNotification();
  const router = useRouter();
  const [unreadNotifications] = useState(3);

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
    byType: { recipe: 0, comment: 0, user: 0 },
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewingReport, setViewingReport] = useState<ReportResponse | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchReports = useCallback(
    async (page = 0, size = 10, status?: string) => {
      try {
        setLoading(true);
        const response = await getAllReports(
          page,
          size,
          status as "PENDING" | "all" | "RESOLVED" | "REJECTED" | undefined
        );

        console.log("Raw API Response:", response);
        if (response.content && response.content.length > 0) {
          console.log("First report:", response.content[0]);
          console.log("Available fields:", Object.keys(response.content[0]));
        } else {
          console.log("No content in response or content is empty.");
        }

        setReports(response.content || []);
        setTotalPages(response.totalPages);
        setTotalReports(response.totalElements);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setReports([]);
        setTotalPages(0);
        setTotalReports(0);
        setCurrentPage(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await getReportStatistics();
      setReportStats({
        total: stats.total,
        pending: stats.pending,
        resolved: stats.resolved,
        rejected: stats.rejected,
        byType: stats.byType,
        bySeverity: stats.bySeverity,
      });
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports(
      currentPage,
      10,
      selectedStatus === "all" ? undefined : selectedStatus.toUpperCase()
    );
    fetchStatistics();
  }, [fetchReports, currentPage, fetchStatistics]);

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const handleApplyFilter = async () => {
    setAppliedSearchTerm(tempSearchTerm);
    setAppliedSelectedStatus(tempSelectedStatus);
    setAppliedSelectedSeverity(tempSelectedSeverity);
    setAppliedSelectedType(tempSelectedType);
    setAppliedSelectedDate(tempSelectedDate);
    setCurrentPage(0);
    await fetchReports(0, 10);
  };

  const handleClearFilter = async () => {
    setTempSearchTerm("");
    setTempSelectedStatus("all");
    setTempSelectedSeverity("all");
    setTempSelectedType("all");
    setTempSelectedDate("");
    setAppliedSearchTerm("");
    setAppliedSelectedStatus("all");
    setAppliedSelectedSeverity("all");
    setAppliedSelectedType("all");
    setAppliedSelectedDate("");
    setCurrentPage(0);
    await fetchReports(0, 10);
  };

  const hasActiveFilters = () => {
    return (
      appliedSearchTerm !== "" ||
      appliedSelectedStatus !== "all" ||
      appliedSelectedSeverity !== "all" ||
      appliedSelectedType !== "all" ||
      appliedSelectedDate !== ""
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Flag className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xử lý
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <X className="w-3 h-3 mr-1" />
            Đã bỏ qua
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string | null | undefined) => {
    const safeSeverity = (severity || "unknown").toLowerCase();

    switch (safeSeverity) {
      case "low":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Thấp</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Cao</Badge>;
      case "critical":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Nghiêm trọng</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Không xác định</Badge>;
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: "PENDING" | "RESOLVED" | "REJECTED") => {
    try {
      setLoading(true);
      await updateReportStatus(reportId, { newStatus: newStatus });
      await fetchReports(
        currentPage,
        10,
        selectedStatus === "all" ? undefined : selectedStatus.toUpperCase()
      );
      await fetchStatistics();
    } catch (error) {
      console.error("Failed to update report status:", error);
      alert("Không thể cập nhật trạng thái báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualDeleteReport = async (reportId: string) => {
    try {
      setLoading(true);
      await deleteReport(reportId); // Gọi API xóa báo cáo đơn lẻ
      await fetchReports(
        currentPage,
        10,
        selectedStatus === "all" ? undefined : selectedStatus.toUpperCase()
      );
      await fetchStatistics(); // Cập nhật thống kê sau khi xóa
    } catch (error) {
      console.error("Failed to delete report:", error);
      alert("Không thể xóa báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (
      selectedReports.length > 0 &&
      selectedReports.length === filteredReports.length &&
      filteredReports.length > 0
    ) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((report) => report.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    setLoading(true);
    try {
      if (action === "resolve") {
        await bulkUpdateReportStatus({
          reportIds: selectedReports,
          newStatus: "RESOLVED",
        });
        alert(`Đã xử lý ${selectedReports.length} báo cáo.`);
      } else if (action === "reject") {
        await bulkUpdateReportStatus({
          reportIds: selectedReports,
          newStatus: "REJECTED",
        });
        alert(`Đã bỏ qua ${selectedReports.length} báo cáo.`);
      } else if (action === "delete") {
        await bulkDeleteReports(selectedReports);
        alert(`Đã xóa ${selectedReports.length} báo cáo.`);
      }
      setSelectedReports([]);
      await fetchReports(
        currentPage,
        10,
        selectedStatus === "all" ? undefined : selectedStatus.toUpperCase()
      );
      await fetchStatistics();
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
      alert(
        `Không thể thực hiện hành động ${action}. Chi tiết lỗi: ${
          (error as Error).message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: ReportResponse) => {
    setViewingReport(report);
    setIsViewDialogOpen(true);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedAccountUsername
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.reporterAccountUsername
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesType =
      selectedType === "all" || report.reportType === selectedType;
    const matchesSeverity =
      selectedSeverity === "all" || report.severity === selectedSeverity;
    const matchesDate =
      !selectedDate ||
      new Date(report.createdAt).toISOString().split("T")[0] === selectedDate;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesSeverity &&
      matchesDate
    );
  });

  const statusLabels: { [key: string]: string } = {
    total: "Tổng báo cáo",
    pending: "Chờ xử lý",
    resolved: "Đã xử lý",
    rejected: "Đã bỏ qua",
  };

  const severityLabels: { [key: string]: string } = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    critical: "Nghiêm trọng",
  };

  const typeLabels: { [key: string]: string } = {
    recipe: "Công thức",
    comment: "Bình luận",
    user: "Người dùng",
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
        disabled={currentPage === 0 || loading}
      >
        «
      </Button>
    );

    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (totalPages <= 5) {
      startPage = 0;
      endPage = totalPages - 1;
    } else if (currentPage <= 2) {
      startPage = 0;
      endPage = 4;
    } else if (currentPage >= totalPages - 3) {
      startPage = totalPages - 5;
      endPage = totalPages - 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={
            currentPage === i ? "bg-orange-500 text-white" : "variant-outline"
          }
          disabled={loading}
        >
          {i + 1}
        </Button>
      );
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() =>
          setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
        }
        disabled={currentPage === totalPages - 1 || loading}
      >
        »
      </Button>
    );
    return buttons;
  };

  return (
    <div className="p-4">
      <Header
        title="Quản lý Báo cáo"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadCount}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(reportStats)
          .slice(0, 4)
          .map(([key, value]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{statusLabels[key]}</p>
                    <p
                      className={`text-2xl font-bold ${
                        key === "pending"
                          ? "text-yellow-600"
                          : key === "resolved"
                          ? "text-green-600"
                          : key === "rejected"
                          ? "text-gray-600"
                          : "text-blue-500"
                      }`}
                    >
                      {typeof value === "number"
                        ? value
                        : JSON.stringify(value)}
                    </p>
                  </div>
                  {key === "total" && (
                    <Flag className="w-8 h-8 text-blue-500" />
                  )}
                  {key === "pending" && (
                    <Flag className="w-8 h-8 text-yellow-500" />
                  )}
                  {key === "resolved" && (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                  {key === "rejected" && (
                    <X className="w-8 h-8 text-gray-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách báo cáo</span>
            {selectedReports.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("resolve")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Xử lý ({selectedReports.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("reject")}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Bỏ qua ({selectedReports.length})
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      disabled={selectedReports.length === 0 || loading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa báo cáo ({selectedReports.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa báo cáo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa {selectedReports.length} báo
                        cáo đã chọn? Hành động này không thể hoàn tác.
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      disabled={selectedReports.length === 0 || loading}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Khóa tài khoản ({selectedReports.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận khóa tài khoản và xóa báo cáo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn thực hiện hành động này? Hành động
                        này sẽ **xóa các báo cáo đã chọn** và ngụ ý rằng bạn sẽ
                        **thực hiện việc khóa tài khoản người dùng liên quan một
                        cách riêng biệt** nếu có.
                        <br />
                        **Lưu ý: Việc xóa báo cáo không thể hoàn tác.**
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("delete")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tiếp tục và Xóa Báo cáo
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
              <Label className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm người dùng, lý do..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Trạng thái</Label>
              <Select value={tempSelectedStatus} onValueChange={setTempSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
                  <SelectItem value="REJECTED">Đã bỏ qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Mức độ nghiêm trọng</Label>
              <Select value={tempSelectedSeverity} onValueChange={setTempSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Loại báo cáo</Label>
              <Select value={tempSelectedType} onValueChange={setTempSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="recipe">Công thức</SelectItem>
                  <SelectItem value="comment">Bình luận</SelectItem>
                  <SelectItem value="user">Người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  fetchReports(
                    0,
                    10,
                    selectedStatus === "all"
                      ? undefined
                      : selectedStatus.toUpperCase()
                  );
                  setCurrentPage(0);
                }}
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
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Applied Filters */}
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
                  {appliedSelectedStatus !== "all" && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Trạng thái:{" "}
                      {appliedSelectedStatus === "PENDING"
                        ? "Chờ xử lý"
                        : appliedSelectedStatus === "RESOLVED"
                        ? "Đã xử lý"
                        : "Đã bỏ qua"}
                    </Badge>
                  )}
                  {appliedSelectedSeverity !== "all" && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Mức độ: {severityLabels[appliedSelectedSeverity.toLowerCase()] || "Không xác định"}
                    </Badge>
                  )}
                  {appliedSelectedType !== "all" && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Loại: {typeLabels[appliedSelectedType.toLowerCase()] || "Không xác định"}
                    </Badge>
                  )}
                  {appliedSelectedDate && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Ngày: {appliedSelectedDate}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-orange-600">
                  Tìm thấy {filteredReports.length} kết quả
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
                      checked={
                        selectedReports.length > 0 &&
                        selectedReports.length === filteredReports.length &&
                        filteredReports.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">STT</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Người bị báo cáo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Người báo cáo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Lý do</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mức độ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày báo cáo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      Đang tải báo cáo...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      Không tìm thấy báo cáo nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report, index) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => handleSelectReport(report.id)}
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-600">{currentPage * 10 + index + 1}</td>
                      <td className="py-3 px-4 font-medium">
                        {/* CHỈ HIỂN THỊ TÊN NGƯỜI BỊ BÁO CÁO */}
                        <p className="font-medium">
                          {report.reportedAccountUsername || "Không xác định"}
                        </p>
                        {/* Đã bỏ dòng hiển thị email */}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {report.reporterAccountUsername || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs">
                        <div className="truncate" title={report.reason}>
                          {report.reason}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getSeverityBadge(report.severity)}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status.toLowerCase() === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(report.id, "RESOLVED")}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                disabled={loading}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(report.id, "REJECTED")}
                                className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                disabled={loading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận xóa báo cáo
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa báo cáo này? Hành
                                  động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleIndividualDeleteReport(report.id)
                                  }
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">{renderPaginationButtons()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogDescription>Thông tin chi tiết về báo cáo vi phạm</DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Người bị báo cáo</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.reportedAccountUsername || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Người báo cáo</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.reporterAccountUsername || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ngày báo cáo</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(viewingReport.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mức độ nghiêm trọng</Label>
                  <div className="mt-1">{getSeverityBadge(viewingReport.severity)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Lý do báo cáo</Label>
                <p className="text-sm text-gray-900 mt-1">{viewingReport.reason}</p>
              </div>

              {viewingReport.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mô tả chi tiết</Label>
                  <p className="text-sm text-gray-900 mt-1">{viewingReport.description}</p>
                </div>
              )}

              {viewingReport.evidenceImageUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ảnh/Video bằng chứng</Label>
                  <div className="mt-2">
                    <img
                      src={viewingReport.evidenceImageUrl}
                      alt="Bằng chứng"
                      className="max-w-[200px] h-auto rounded-md shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }} // Fallback nếu ảnh lỗi
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                <div className="mt-1">{getStatusBadge(viewingReport.status)}</div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
            {viewingReport?.status.toLowerCase() === "pending" && (
              <>
                <Button
                  onClick={() => {
                    if (viewingReport) {
                      handleStatusChange(viewingReport.id, "RESOLVED");
                      setIsViewDialogOpen(false);
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Đánh dấu Đã xử lý
                </Button>
                <Button
                  onClick={() => {
                    if (viewingReport) {
                      handleStatusChange(viewingReport.id, "REJECTED");
                      setIsViewDialogOpen(false);
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Đánh dấu Đã bỏ qua
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
