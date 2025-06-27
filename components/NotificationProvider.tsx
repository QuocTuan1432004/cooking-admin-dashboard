// src/components/NotificationProvider.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Đổi cách import để tránh lỗi SSR
let notificationApi: any = null;

// Import động khi chạy trên client
if (typeof window !== 'undefined') {
  import('../hooks/NotiApi/NotiApi').then(module => {
    notificationApi = module.notificationApi;
  });
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoggedIn = true; // Thay bằng logic kiểm tra đăng nhập thực tế
  
  useEffect(() => {
    // Kiểm tra notificationApi đã tải xong chưa
    if (notificationApi && isLoggedIn && !pathname.includes('/login')) {
      console.log('Connecting to notification websocket...');
      notificationApi.connect();
    }
    
    return () => {
      if (notificationApi) {
        notificationApi.disconnect();
      }
    };
  }, [isLoggedIn, pathname]);

  return <>{children}</>;
}