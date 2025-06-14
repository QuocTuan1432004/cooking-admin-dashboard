"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/userAuth";

interface LogoutButtonProps {
  isCollapsed?: boolean;
  className?: string;
  variant?: "sidebar" | "header" | "default";
}

export function LogoutButton({ 
  isCollapsed = false, 
  className = "",
  variant = "default" 
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "sidebar":
        return `flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:translate-x-1 text-red-400 hover:text-red-300 w-full disabled:opacity-50 disabled:cursor-not-allowed ${
          isCollapsed ? "justify-center" : ""
        }`;
      case "header":
        return "flex items-center px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed";
      default:
        return "flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${getVariantClasses()} ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        <LogOut className="w-5 h-5 flex-shrink-0" />
      )}
      {!isCollapsed && (
        <span className={`${variant === "sidebar" ? "ml-3" : "ml-2"} font-medium`}>
          {isLoading ? "Đang xuất..." : "Đăng xuất"}
        </span>
      )}
    </button>
  );
}