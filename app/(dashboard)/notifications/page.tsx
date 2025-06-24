"use client";

import { useNotification } from "../../../hooks/NotiApi/NotificationContext";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  User,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  NotificationResponse,
  PaginatedResponse,
  notificationApi,
} from "@/hooks/NotiApi/NotiApi";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../../hooks/userAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: "recipe" | "comment" | "user" | "system" | "report";
  read: boolean;
  dismissed: boolean;
  originalType?: string;
  recipientId: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { userId, roles } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Notification[]
  >([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [dismissedPage, setDismissedPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDismissedPages, setTotalDismissedPages] = useState(1);

  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    console.log("Current userId:", userId);
    let cleanupCallback: () => void;

    const setupNotifications = async () => {
      setLoading(true);
      try {
        console.log("🔄 Disconnecting and reconnecting WebSocket...");
        notificationApi.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 300));
        const isConnected = await notificationApi.connect();
        console.log(
          `${
            isConnected
              ? "✅ WebSocket connected!"
              : "⚠️ WebSocket connection failed"
          }`
        );

        await refreshNotifications();

        const handleNewNotification = (notification: NotificationResponse) => {
          const now = Date.now();
          console.log(
            `🔔 Received new notification at ${new Date(now).toISOString()}:`,
            notification
          );
          console.log(
            `Current userId: ${userId}, Notification recipientId: ${notification.recipientId}`
          );

          // ✅ Chỉ xử lý nếu dành cho user hiện tại hoặc admin (qua recipientUsername)
          const isForCurrentUser =
            (notification.recipientId && notification.recipientId === userId) ||
            (notification.recipientUsername === "admin" &&
              roles.includes("ADMIN"));

          if (!isForCurrentUser) {
            console.log(
              "🚫 Notification không dành cho user hiện tại, bỏ qua."
            );
            return;
          }

          const newNotification = {
            id: notification.id,
            title: notification.title || "No title",
            message: notification.message || "No message",
            date: notification.date || new Date().toISOString().split("T")[0],
            time: notification.time || new Date().toTimeString().split(" ")[0],
            type: mapNotificationType(
              notification.notificationType || "SYSTEM"
            ),
            read: notification.readStatus || false,
            dismissed: notification.dismissed || false,
            originalType: notification.notificationType,
            recipientId: notification.recipientId || null,
          };

          const isDuplicate = [
            ...notifications,
            ...dismissedNotifications,
          ].some((n) => n.id === newNotification.id);
          if (isDuplicate) {
            console.warn(
              `⚠️ Skipping duplicate notification: ${newNotification.id}`
            );
            return;
          }

          lastNotificationTimeRef.current = now;

          if (newNotification.dismissed) {
            if (dismissedPage === 0) {
              setDismissedNotifications((prev) =>
                [newNotification, ...prev].slice(0, pageSize)
              );
              console.log("✅ Added new dismissed notification");
            }
          } else {
            if (currentPage === 0) {
              setNotifications((prev) =>
                [newNotification, ...prev].slice(0, pageSize)
              );
              console.log("✅ Added new regular notification");
              if (!newNotification.read) {
                setUnreadNotifications((prev) => prev + 1);
              }
            }
          }

          addNotification(notification); // lưu vào cache/global state
        };

        // ✅ Đăng ký và cleanup callback
        notificationApi.unregisterCallback(handleNewNotification);
        notificationApi.registerCallback(handleNewNotification);
        cleanupCallback = () =>
          notificationApi.unregisterCallback(handleNewNotification);
      } catch (error) {
        console.error("Failed to setup notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    setupNotifications();
    return () => {
      if (cleanupCallback) cleanupCallback();
    };
  }, [currentPage, dismissedPage, userId]);

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      console.log("Current userId for refresh:", userId);
      const regularResponse = await notificationApi.getNotifications(
        currentPage,
        pageSize
      );
      if (regularResponse && regularResponse.content) {
        const convertedRegular = regularResponse.content.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.date,
          time: n.time,
          type: mapNotificationType(n.notificationType),
          read: n.readStatus,
          dismissed: n.dismissed,
          originalType: n.notificationType,
          recipientId: n.recipientId || null,
        }));
        setNotifications(convertedRegular);
        setTotalPages(regularResponse.totalPages);
        setUnreadNotifications(convertedRegular.filter((n) => !n.read).length);
      }

      const dismissedResponse = await notificationApi.getDismissedNotifications(
        dismissedPage,
        pageSize
      );
      if (dismissedResponse && dismissedResponse.content) {
        const convertedDismissed = dismissedResponse.content.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.date,
          time: n.time,
          type: mapNotificationType(n.notificationType),
          read: n.readStatus,
          dismissed: true,
          originalType: n.notificationType,
          recipientId: n.recipientId || null,
        }));
        setDismissedNotifications(convertedDismissed);
        setTotalDismissedPages(dismissedResponse.totalPages);
      }
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHideNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) {
        console.warn(`Notification ID ${notificationId} not found`);
        toast.error("Notification not found");
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setDismissedNotifications((prev) => {
        if (prev.some((n) => n.id === notificationId)) return prev;
        return [{ ...notification, dismissed: true }, ...prev];
      });
      if (!notification.read)
        setUnreadNotifications((prev) => Math.max(prev - 1, 0));
      const success = await notificationApi.dismissNotification(notificationId);
      if (success) {
        console.log("✅ Notification hidden on server");
        toast.success("Notification hidden!");
      } else {
        console.error("❌ Failed to hide notification on server");
        toast.error("Failed to hide notification on server");
      }
    } catch (error) {
      console.error("Failed to hide notification:", error);
      toast.error("Error hiding notification");
    }
  };

  const handleUnhideNotification = async (notificationId: string) => {
    try {
      const notification = dismissedNotifications.find(
        (n) => n.id === notificationId
      );
      if (!notification) {
        console.warn(
          `Notification ID ${notificationId} not found in dismissed`
        );
        toast.error("Notification not found");
        return;
      }
      setDismissedNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      if (currentPage === 0) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notificationId)) return prev;
          return [{ ...notification, dismissed: false }, ...prev];
        });
        if (!notification.read) setUnreadNotifications((prev) => prev + 1);
      }
      const success = await notificationApi.unhideNotification(notificationId);
      if (success) {
        console.log("✅ Notification unhidden on server");
        toast.success("Notification unhidden!");
      } else {
        console.error("❌ Failed to unhide notification on server");
        toast.error("Failed to unhide notification on server");
      }
    } catch (error) {
      console.error("Failed to unhide notification:", error);
      toast.error("Error unhiding notification");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await notificationApi.markAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setDismissedNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadNotifications((prev) => Math.max(prev - 1, 0));
        toast.success("Marked as read!");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationApi.markAllAsRead();
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setDismissedNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadNotifications(0);
        toast.success("All marked as read!");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const notification = [...notifications, ...dismissedNotifications].find(
        (n) => n.id === notificationId
      );
      if (!notification) {
        console.warn(`Notification ID ${notificationId} not found`);
        toast.error("Notification not found.");
        return;
      }
      const success = await notificationApi.deleteNotification(notificationId);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setDismissedNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        if (!notification.read)
          setUnreadNotifications((prev) => Math.max(prev - 1, 0));
        toast.success("Notification deleted!");
      } else {
        console.error(`Failed to delete notification ${notificationId}`);
        toast.error("Failed to delete notification.");
      }
    } catch (error) {
      console.error(`Error deleting notification ID ${notificationId}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete notification."
      );
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const totalNotifications =
        notifications.length + dismissedNotifications.length;
      if (totalNotifications === 0) {
        console.log("No notifications to delete.");
        toast("No notifications to delete.", {
          style: { background: "#d4edda", color: "#155724" },
        });
        return;
      }
      let successCount = 0;
      for (const notification of [
        ...notifications,
        ...dismissedNotifications,
      ]) {
        if (await notificationApi.deleteNotification(notification.id))
          successCount++;
      }
      setNotifications([]);
      setDismissedNotifications([]);
      setUnreadNotifications(0);
      toast.success("All notifications deleted!");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete all notifications."
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
  };

  const handleDismissedPageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalDismissedPages)
      setDismissedPage(newPage);
  };

  const mapNotificationType = (
    apiType: string
  ): "recipe" | "comment" | "user" | "system" | "report" => {
    if (["NEW_RECIPE", "RECIPE_APPROVED", "RECIPE_REJECTED"].includes(apiType))
      return "recipe";
    if (apiType === "COMMENT") return "comment";
    if (apiType === "USER" || apiType === "USER_CREATED") return "user";
    if (apiType === "REPORT" || apiType === "REPORT_SUBMITTED") return "report";
    return "system";
  };

  const getNotificationIcon = (type: string, apiType?: string) => {
    if (apiType) {
      switch (apiType) {
        case "NEW_RECIPE":
          return <BookOpen className="w-5 h-5 text-green-500" />;
        case "RECIPE_APPROVED":
          return <BookOpen className="w-5 h-5 text-blue-500" />;
        case "RECIPE_REJECTED":
          return <BookOpen className="w-5 h-5 text-red-500" />;
        case "USER_CREATED":
          return <User className="w-5 h-5 text-purple-500" />;
        case "REPORT_SUBMITTED":
          return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      }
    }
    switch (type) {
      case "recipe":
        return <BookOpen className="w-5 h-5 text-orange-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "user":
        return <User className="w-5 h-5 text-green-500" />;
      case "report":
        return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      case "system":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    isDismissed = false
  ) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(0, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            isDismissed
              ? handleDismissedPageChange(currentPage - 1)
              : handlePageChange(currentPage - 1)
          }
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() =>
              isDismissed
                ? handleDismissedPageChange(page)
                : handlePageChange(page)
            }
          >
            {page + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            isDismissed
              ? handleDismissedPageChange(currentPage + 1)
              : handlePageChange(currentPage + 1)
          }
          disabled={currentPage >= totalPages - 1}
        >
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const handleLogout = () => {
    console.log("Logged out successfully");
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    router.push("/login");
  };

  return (
    <div>
      <Toaster position="top-right" />
      <Header
        title="Thông báo"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadNotifications}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Thông báo của bạn</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadNotifications === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Đánh dấu tất cả đã đọc
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={handleDeleteAllNotifications}
                disabled={
                  notifications.length + dismissedNotifications.length === 0
                }
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa tất cả
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Tất cả
                <Badge variant="secondary" className="ml-2 bg-gray-100">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Chưa đọc
                <Badge
                  variant="secondary"
                  className="ml-2 bg-orange-100 text-orange-800"
                >
                  {unreadNotifications}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="dismissed">
                Đã ẩn
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {dismissedNotifications.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Đang tải thông báo...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div
                      key={`all-${notification.id}-${index}`}
                      className={`p-4 border rounded-lg flex items-start ${
                        notification.read ? "bg-white" : "bg-orange-50"
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        {getNotificationIcon(
                          notification.type,
                          notification.originalType
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                              >
                                Mới
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideNotification(notification.id);
                              }}
                              title="Ẩn thông báo"
                            >
                              <EyeOff className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              title="Xóa thông báo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.date} lúc {notification.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có thông báo nào.
                  </div>
                )}
                {totalPages > 1 && renderPagination(currentPage, totalPages)}
              </div>
            </TabsContent>
            <TabsContent value="unread">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Đang tải thông báo...
                  </div>
                ) : notifications.filter((n) => !n.read).length > 0 ? (
                  notifications
                    .filter((n) => !n.read)
                    .map((notification, index) => (
                      <div
                        key={`unread-${notification.id}-${index}`}
                        className="p-4 border rounded-lg bg-orange-50 flex items-start"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="p-2 bg-gray-100 rounded-full mr-4">
                          {getNotificationIcon(
                            notification.type,
                            notification.originalType
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                              >
                                Mới
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHideNotification(notification.id);
                                }}
                                title="Ẩn thông báo"
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                title="Xóa thông báo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.date} lúc {notification.time}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có thông báo chưa đọc.
                  </div>
                )}
                {totalPages > 1 && renderPagination(currentPage, totalPages)}
              </div>
            </TabsContent>
            <TabsContent value="dismissed">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Đang tải thông báo...
                  </div>
                ) : dismissedNotifications.length > 0 ? (
                  dismissedNotifications.map((notification, index) => (
                    <div
                      key={`dismissed-${notification.id}-${index}`}
                      className={`p-4 border rounded-lg flex items-start ${
                        notification.read ? "bg-white" : "bg-orange-50"
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        {getNotificationIcon(
                          notification.type,
                          notification.originalType
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                              >
                                Mới
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnhideNotification(notification.id);
                              }}
                              title="Khôi phục thông báo"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              title="Xóa thông báo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.date} lúc {notification.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có thông báo đã ẩn.
                  </div>
                )}
                {totalDismissedPages > 1 &&
                  renderPagination(dismissedPage, totalDismissedPages, true)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
