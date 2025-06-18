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
import { Flag, Search, Filter, Ban, CheckCircle, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportedUser {
  id: number;
  reportedUser: string;
  reportedBy: string;
  reason: string;
  description: string;
  reportDate: string;
  status: "pending" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high" | "critical";
  userEmail: string;
  reporterEmail: string;
  evidence?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [unreadNotifications] = useState(3);

  const [reports, setReports] = useState<ReportedUser[]>([
    {
      id: 1,
      reportedUser: "Nguyễn Văn A",
      reportedBy: "Trần Thị B",
      reason: "Spam hoặc quảng cáo",
      description:
        "Người dùng này liên tục đăng nội dung quảng cáo không liên quan đến công thức nấu ăn",
      reportDate: "16/05/2025",
      status: "pending",
      severity: "medium",
      userEmail: "nguyenvana@email.com",
      reporterEmail: "tranthib@email.com",
      evidence: "Đã đăng 5 bài quảng cáo trong 1 ngày",
    },
    {
      id: 2,
      reportedUser: "Lê Văn C",
      reportedBy: "Phạm Thị D",
      reason: "Ngôn từ thù địch hoặc quấy rối",
      description:
        "Sử dụng ngôn từ không phù hợp trong bình luận, xúc phạm người khác",
      reportDate: "15/05/2025",
      status: "pending",
      severity: "high",
      userEmail: "levanc@email.com",
      reporterEmail: "phamthid@email.com",
      evidence: "Bình luận có chứa từ ngữ xúc phạm",
    },
    {
      id: 3,
      reportedUser: "Hoàng Văn E",
      reportedBy: "Nguyễn Thị F",
      reason: "Nội dung không phù hợp",
      description: "Đăng công thức có nội dung không phù hợp với độ tuổi",
      reportDate: "14/05/2025",
      status: "resolved",
      severity: "low",
      userEmail: "hoangvane@email.com",
      reporterEmail: "nguyenthif@email.com",
      evidence: "Công thức chứa hình ảnh không phù hợp",
    },
    {
      id: 4,
      reportedUser: "Trần Văn G",
      reportedBy: "Lê Thị H",
      reason: "Thông tin sai lệch",
      description:
        "Chia sẻ công thức có thông tin sai lệch, có thể gây hại cho sức khỏe",
      reportDate: "13/05/2025",
      status: "dismissed",
      severity: "critical",
      userEmail: "tranvang@email.com",
      reporterEmail: "lethih@email.com",
      evidence: "Công thức sử dụng nguyên liệu độc hại",
    },
    {
      id: 5,
      reportedUser: "Phạm Văn I",
      reportedBy: "Hoàng Thị J",
      reason: "Vi phạm bản quyền",
      description: "Sao chép công thức từ nguồn khác mà không ghi nguồn",
      reportDate: "12/05/2025",
      status: "pending",
      severity: "medium",
      userEmail: "phamvani@email.com",
      reporterEmail: "hoangthij@email.com",
      evidence: "Công thức giống hệt từ website khác",
    },
  ]);

  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewingReport, setViewingReport] = useState<ReportedUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            <Flag className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xử lý
          </Badge>
        );
      case "dismissed":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
          >
            <X className="w-3 h-3 mr-1" />
            Đã bỏ qua
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Thấp
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Trung bình
          </Badge>
        );
      case "high":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Cao
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Nghiêm trọng
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (
    reportId: number,
    newStatus: "pending" | "resolved" | "dismissed"
  ) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  const handleSelectReport = (reportId: number) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map((report) => report.id));
    }
  };

  const handleBulkAction = (action: "resolve" | "dismiss" | "ban") => {
    if (action === "ban") {
      // Logic to ban users
      console.log("Banning users for reports:", selectedReports);
    } else {
      const newStatus = action === "resolve" ? "resolved" : "dismissed";
      setReports((prev) =>
        prev.map((report) =>
          selectedReports.includes(report.id)
            ? { ...report, status: newStatus }
            : report
        )
      );
    }
    setSelectedReports([]);
  };

  const handleViewReport = (report: ReportedUser) => {
    setViewingReport(report);
    setIsViewDialogOpen(true);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;
    const matchesSeverity =
      selectedSeverity === "all" || report.severity === selectedSeverity;
    const matchesDate =
      !selectedDate || report.reportDate.includes(selectedDate);

    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  });

  const getStatusCounts = () => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      dismissed: reports.filter((r) => r.status === "dismissed").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <Header
        title="Quản lý Báo cáo"
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
                <p className="text-sm text-gray-600">Tổng báo cáo</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Flag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.pending}
                </p>
              </div>
              <Flag className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã xử lý</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã bỏ qua</p>
                <p className="text-2xl font-bold text-gray-600">
                  {statusCounts.dismissed}
                </p>
              </div>
              <X className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
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
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Xử lý ({selectedReports.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("dismiss")}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
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
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Khóa tài khoản ({selectedReports.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Xác nhận khóa tài khoản
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn khóa tài khoản của{" "}
                        {selectedReports.length} người dùng bị báo cáo? Hành
                        động này sẽ ngăn họ truy cập vào hệ thống.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("ban")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Khóa tài khoản
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
                  placeholder="Tìm kiếm người dùng, lý do..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                  <SelectItem value="dismissed">Đã bỏ qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Mức độ nghiêm trọng
              </Label>
              <Select
                value={selectedSeverity}
                onValueChange={setSelectedSeverity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="critical">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Ngày báo cáo
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
                      checked={selectedReports.length === reports.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Người bị báo cáo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Người báo cáo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Lý do
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Mức độ
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày báo cáo
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
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{report.id}</td>
                    <td className="py-3 px-4 font-medium">
                      {report.reportedUser}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {report.reportedBy}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <div className="truncate" title={report.reason}>
                        {report.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(report.severity)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {report.reportDate}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(report.status)}
                    </td>
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
                        {report.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(report.id, "resolved")
                              }
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(report.id, "dismissed")
                              }
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy báo cáo nào phù hợp với bộ lọc.
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

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về báo cáo vi phạm
            </DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Người bị báo cáo
                  </Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.reportedUser}
                  </p>
                  <p className="text-xs text-gray-500">
                    {viewingReport.userEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Người báo cáo
                  </Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.reportedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {viewingReport.reporterEmail}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Ngày báo cáo
                  </Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.reportDate}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Mức độ nghiêm trọng
                  </Label>
                  <div className="mt-1">
                    {getSeverityBadge(viewingReport.severity)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Lý do báo cáo
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {viewingReport.reason}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Mô tả chi tiết
                </Label>
                <p className="text-sm text-gray-900 mt-1">
                  {viewingReport.description}
                </p>
              </div>

              {viewingReport.evidence && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Bằng chứng
                  </Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewingReport.evidence}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Trạng thái hiện tại
                </Label>
                <div className="mt-1">
                  {getStatusBadge(viewingReport.status)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
            {viewingReport?.status === "pending" && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleStatusChange(viewingReport.id, "resolved");
                    setIsViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Xử lý
                </Button>
                <Button
                  onClick={() => {
                    handleStatusChange(viewingReport.id, "dismissed");
                    setIsViewDialogOpen(false);
                  }}
                  variant="outline"
                  className="text-gray-600 border-gray-600"
                >
                  Bỏ qua
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
