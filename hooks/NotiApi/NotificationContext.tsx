"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { notificationApi, NotificationResponse } from "@/hooks/NotiApi/NotiApi";

// Interface cho context
interface NotificationContextType {
  unreadCount: number;
  addNotification: (notification: NotificationResponse) => void;
}

// Tạo context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Lấy số thông báo chưa đọc khi component mount
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getNotifications();

        // Kiểm tra xem response có dạng phân trang hay không
        if (response.content) {
          // Nếu là PaginatedResponse, sử dụng response.content
          const count = response.content.filter((n) => !n.readStatus).length;
          setUnreadCount(count);
        } else {
          // Nếu là mảng thông báo thông thường
          const notifications = response as unknown as NotificationResponse[];
          const count = notifications.filter((n) => !n.readStatus).length;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };

    // Đăng ký callback để nhận thông báo mới
    const handleNewNotification = (notification: NotificationResponse) => {
      if (!notification.readStatus && !notification.dismissed) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Kết nối và đăng ký callback
    fetchUnreadCount();
    notificationApi.connect().then(() => {
      notificationApi.registerCallback(handleNewNotification);
    });

    // Cleanup function
    return () => {
      notificationApi.unregisterCallback(handleNewNotification);
    };
  }, []);

  // Thêm thông báo mới (có thể được sử dụng từ components khác)
  const addNotification = (notification: NotificationResponse) => {
    if (!notification.readStatus && !notification.dismissed) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Giá trị context
  const contextValue = {
    unreadCount,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook để sử dụng notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  return context;
};
