"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  Check,
  X,
  Eye,
  Search,
  Plus,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Send,
  User,
  MessageSquare,
} from "lucide-react";

interface Notification {
  id: number;
  userId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
  type: string;
  priority: string;
}

interface Report {
  id: number;
  userId: number;
  userName: string;
  commentId: number;
  reason: string;
  status: "Pending" | "Resolved" | "Rejected";
  createdAt: Date;
  commentContent?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      userId: 2,
      content: "Lê Văn Cường đã đăng công thức 'Rau muống xào tỏi'",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      type: "pending",
      priority: "high",
    },
    {
      id: 2,
      userId: 1,
      content: "Nguyễn Văn A đã bình luận về công thức 'Gà kho gừng'",
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      type: "comment",
      priority: "medium",
    },
    {
      id: 3,
      userId: 5,
      content: "Trần Thị Mai đã đăng ký tài khoản mới",
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      type: "user",
      priority: "low",
    },
  ]);

  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      userId: 3,
      userName: "Phạm Văn C",
      commentId: 101,
      reason: "Nội dung không phù hợp",
      status: "Pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      commentContent: "Món này không ngon lắm, tôi không thích...",
    },
    {
      id: 2,
      userId: 4,
      userName: "Nguyễn Thị D",
      commentId: 102,
      reason: "Spam",
      status: "Pending",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      commentContent: "Mua sản phẩm tại website abc.com giá rẻ...",
    },
    {
      id: 3,
      userId: 6,
      userName: "Lê Văn E",
      commentId: 103,
      reason: "Ngôn từ không phù hợp",
      status: "Resolved",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      commentContent: "Bình luận đã được xử lý",
    },
  ]);

  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    []
  );
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  // Create notification form
  const [newNotification, setNewNotification] = useState({
    userId: "",
    content: "",
    type: "info",
    priority: "medium",
  });

  const users = [
    { id: 1, name: "Nguyễn Văn A" },
    { id: 2, name: "Lê Văn Cường" },
    { id: 3, name: "Phạm Văn C" },
    { id: 4, name: "Nguyễn Thị D" },
    { id: 5, name: "Trần Thị Mai" },
    { id: 0, name: "Tất cả người dùng" },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "user":
        return <User className="w-5 h-5 text-green-500" />;
      case "report":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "system":
        return <Bell className="w-5 h-5 text-purple-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsUnread = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: false } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const handleCreateNotification = () => {
    const newId = Math.max(...notifications.map((n) => n.id)) + 1;
    const notification: Notification = {
      id: newId,
      userId: Number.parseInt(newNotification.userId),
      content: newNotification.content,
      isRead: false,
      createdAt: new Date(),
      type: newNotification.type,
      priority: newNotification.priority,
    };

    setNotifications((prev) => [notification, ...prev]);
    setNewNotification({
      userId: "",
      content: "",
      type: "info",
      priority: "medium",
    });
    setShowCreateModal(false);
    alert("Thông báo đã được tạo thành công!");
  };

  const handleReportAction = (
    reportId: number,
    action: "Resolved" | "Rejected"
  ) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: action } : report
      )
    );
    alert(
      `Báo cáo đã được ${action === "Resolved" ? "giải quyết" : "từ chối"}`
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notif.type === filterType;
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "read" && notif.isRead) ||
      (filterRead === "unread" && !notif.isRead);

    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  return (
    <div>
      <Header title="Thông báo & Báo cáo" showSearch={false} />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Thông báo chưa đọc</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {unreadCount}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Báo cáo chờ xử lý</p>
                  <p className="text-2xl font-bold text-red-600">
                    {pendingReports}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng thông báo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {notifications.length}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng báo cáo</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {reports.length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4 border-b">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`pb-2 px-1 ${
                  activeTab === "notifications"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-600"
                }`}
              >
                Thông báo
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`pb-2 px-1 ${
                  activeTab === "reports"
                    ? "border-b-2 border-red-500 text-red-600"
                    : "text-gray-600"
                }`}
              >
                Báo cáo vi phạm
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <>
            {/* Filters and Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm thông báo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="comment">Bình luận</SelectItem>
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="info">Thông tin</SelectItem>
                        <SelectItem value="system">Hệ thống</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterRead} onValueChange={setFilterRead}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="unread">Chưa đọc</SelectItem>
                        <SelectItem value="read">Đã đọc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <Check className="w-4 h-4 mr-2" />
                      Đánh dấu tất cả đã đọc
                    </Button>

                    <Dialog
                      open={showCreateModal}
                      onOpenChange={setShowCreateModal}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo thông báo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tạo thông báo mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="user-select">Gửi đến</Label>
                            <Select
                              value={newNotification.userId}
                              onValueChange={(value) =>
                                setNewNotification((prev) => ({
                                  ...prev,
                                  userId: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn người dùng" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem
                                    key={user.id}
                                    value={user.id.toString()}
                                  >
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="content">Nội dung</Label>
                            <textarea
                              id="content"
                              value={newNotification.content}
                              onChange={(e) =>
                                setNewNotification((prev) => ({
                                  ...prev,
                                  content: e.target.value,
                                }))
                              }
                              placeholder="Nhập nội dung thông báo..."
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="type">Loại</Label>
                              <Select
                                value={newNotification.type}
                                onValueChange={(value) =>
                                  setNewNotification((prev) => ({
                                    ...prev,
                                    type: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="info">
                                    Thông tin
                                  </SelectItem>
                                  <SelectItem value="system">
                                    Hệ thống
                                  </SelectItem>
                                  <SelectItem value="user">
                                    Người dùng
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="priority">Ưu tiên</Label>
                              <Select
                                value={newNotification.priority}
                                onValueChange={(value) =>
                                  setNewNotification((prev) => ({
                                    ...prev,
                                    priority: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Thấp</SelectItem>
                                  <SelectItem value="medium">
                                    Trung bình
                                  </SelectItem>
                                  <SelectItem value="high">Cao</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowCreateModal(false)}
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={handleCreateNotification}
                              disabled={
                                !newNotification.userId ||
                                !newNotification.content
                              }
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Gửi thông báo
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Danh sách thông báo ({filteredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có thông báo nào</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                          !notification.isRead
                            ? getPriorityColor(notification.priority)
                            : "border-l-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`${
                                  !notification.isRead
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.content}
                                {!notification.isRead && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                                )}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>
                                  {formatTime(notification.createdAt)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    notification.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : notification.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {notification.priority === "high"
                                    ? "Cao"
                                    : notification.priority === "medium"
                                    ? "Trung bình"
                                    : "Thấp"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.isRead ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsUnread(notification.id)}
                                >
                                  <Bell className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo vi phạm ({reports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">{report.userName}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status === "Pending"
                              ? "Chờ xử lý"
                              : report.status === "Resolved"
                              ? "Đã giải quyết"
                              : "Đã từ chối"}
                          </span>
                        </div>

                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Lý do: </span>
                          <span className="text-sm font-medium">
                            {report.reason}
                          </span>
                        </div>

                        <div className="mb-2">
                          <span className="text-sm text-gray-600">
                            Nội dung bình luận:{" "}
                          </span>
                          <span className="text-sm italic">
                            "{report.commentContent}"
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          {formatTime(report.createdAt)}
                        </div>
                      </div>

                      {report.status === "Pending" && (
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() =>
                              handleReportAction(report.id, "Resolved")
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Giải quyết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleReportAction(report.id, "Rejected")
                            }
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
