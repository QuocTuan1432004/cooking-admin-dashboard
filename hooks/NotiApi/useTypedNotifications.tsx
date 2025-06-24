// useTypedNotifications.tsx
"use client";

import { useState, useEffect } from "react";
import { useNotification } from "./NotificationContext";
import { notificationApi, NotificationResponse } from "@/hooks/NotiApi/NotiApi";

export const useTypedNotifications = () => {
  const { unreadCount, addNotification } = useNotification();
  const [typedCounts, setTypedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Hàm fetch chi tiết để phân loại
    const fetchDetailedNotifications = async () => {
      try {
        const response = await notificationApi.getNotifications(0, 10); // Lấy trang đầu tiên
        if ("content" in response && response.content) {
          const counts = response.content.reduce((acc, n) => {
            if (!n.readStatus && !n.dismissed) {
              const type = n.notificationType || "SYSTEM";
              acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);
          setTypedCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch detailed notifications:", error);
      }
    };

    // Xử lý thông báo mới để cập nhật typedCounts
    const handleNewNotification = (notification: NotificationResponse) => {
      addNotification(notification); // Cập nhật unreadCount tổng từ NotificationContext
      if (!notification.readStatus && !notification.dismissed) {
        const type = notification.notificationType || "SYSTEM";
        setTypedCounts((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }));
      }
    };

    // Đăng ký callback để nhận thông báo mới
    notificationApi.registerCallback(handleNewNotification);

    // Fetch dữ liệu ban đầu
    fetchDetailedNotifications();

    // Cleanup
    return () => {
      notificationApi.unregisterCallback(handleNewNotification);
    };
  }, [addNotification]);

  return { typedCounts, addNotification };
};
