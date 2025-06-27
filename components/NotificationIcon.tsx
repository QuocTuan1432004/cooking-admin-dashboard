// src/components/NotificationIcon.tsx
"use client";

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationResponse } from '@/hooks/NotiApi/NotiApi';

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let api: any = null;
    
    // Dynamic import
    import('@/hooks/NotiApi/NotiApi').then(module => {
      api = module.notificationApi;
      
      // Lấy thông báo hiện tại
      api.getNotifications().then((notis: NotificationResponse[]) => {
        setNotifications(notis);
        setUnreadCount(notis.filter(n => !n.readStatus).length);
      });
      
      // Đăng ký lắng nghe thông báo mới
      const handleNewNotification = (notification: NotificationResponse) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.readStatus) {
          setUnreadCount(prev => prev + 1);
        }
      };
      
      api.registerCallback(handleNewNotification);
      
      return () => {
        api.unregisterCallback(handleNewNotification);
      };
    });
  }, []);
  
  // Đánh dấu đã đọc
  const handleMarkAsRead = async (id: string) => {
    const api = (await import('@/hooks/NotiApi/NotiApi')).notificationApi;
    const success = await api.markAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? {...n, readStatus: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Ẩn thông báo
  const handleDismiss = async (id: string) => {
    const api = (await import('@/hooks/NotiApi/NotiApi')).notificationApi;
    const success = await api.dismissNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Cập nhật lại số lượng thông báo chưa đọc
      setUnreadCount(prev => {
        const notif = notifications.find(n => n.id === id);
        return notif && !notif.readStatus ? prev - 1 : prev;
      });
    }
  };
  
  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    const api = (await import('@/hooks/NotiApi/NotiApi')).notificationApi;
    const success = await api.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({...n, readStatus: true})));
      setUnreadCount(0);
    }
  };
  
  // Định dạng thời gian
  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="border-b px-4 py-2 flex justify-between items-center">
            <h3 className="font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-500 hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b hover:bg-gray-50 ${
                    notification.readStatus ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <button 
                      onClick={() => handleDismiss(notification.id)}
                      className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 my-1">
                    {notification.message}
                  </p>
                  
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-gray-500">
                      {formatDateTime(notification.date, notification.time)}
                    </span>
                    
                    {!notification.readStatus && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-500 hover:underline"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t p-2 text-center">
            <a href="/notifications" className="text-sm text-blue-500 hover:underline">
              Xem tất cả thông báo
            </a>
          </div>
        </div>
      )}
    </div>
  );
}