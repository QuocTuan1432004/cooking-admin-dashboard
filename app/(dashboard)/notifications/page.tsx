"use client";

import { useState } from "react";
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  Clock,
  Trash2,
  User,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  time: string;
  type: "recipe" | "comment" | "user" | "system";
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Công thức mới",
      message: "Nguyễn Văn A đã đăng công thức mới: Gà kho gừng",
      date: "16/05/2025",
      time: "10:30",
      type: "recipe",
      read: false,
    },
    {
      id: 2,
      title: "Bình luận mới",
      message: "Trần Thị B đã bình luận về công thức Canh chua cá của bạn",
      date: "15/05/2025",
      time: "14:45",
      type: "comment",
      read: false,
    },
    {
      id: 3,
      title: "Người dùng mới",
      message: "Lê Văn C đã đăng ký tài khoản mới",
      date: "15/05/2025",
      time: "09:15",
      type: "user",
      read: false,
    },
    {
      id: 4,
      title: "Cập nhật hệ thống",
      message: "Hệ thống đã được cập nhật lên phiên bản mới",
      date: "14/05/2025",
      time: "22:00",
      type: "system",
      read: true,
    },
    {
      id: 5,
      title: "Công thức được duyệt",
      message: "Công thức Bánh flan của bạn đã được duyệt",
      date: "14/05/2025",
      time: "16:30",
      type: "recipe",
      read: true,
    },
  ]);

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === notificationId && !notification.read) {
          setUnreadNotifications((count) => count - 1);
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadNotifications(0);
  };

  const handleDeleteNotification = (notificationId: number) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadNotifications((count) => count - 1);
    }
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleDeleteAllNotifications = () => {
    setNotifications([]);
    setUnreadNotifications(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "recipe":
        return <BookOpen className="w-5 h-5 text-orange-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "user":
        return <User className="w-5 h-5 text-green-500" />;
      case "system":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allCount = notifications.length;

  return (
    <div>
      <Header
        title="Thông báo"
        showSearch={false}
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
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={handleDeleteAllNotifications}
                disabled={allCount === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tất cả
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
                  {allCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Chưa đọc
                <Badge
                  variant="secondary"
                  className="ml-2 bg-orange-100 text-orange-800"
                >
                  {unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg flex items-start ${
                        notification.read ? "bg-white" : "bg-orange-50"
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        {getNotificationIcon(notification.type)}
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
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
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
              </div>
            </TabsContent>
            <TabsContent value="unread">
              <div className="space-y-4">
                {notifications.filter((n) => !n.read).length > 0 ? (
                  notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border rounded-lg bg-orange-50 flex items-start"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="p-2 bg-gray-100 rounded-full mr-4">
                          {getNotificationIcon(notification.type)}
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
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
