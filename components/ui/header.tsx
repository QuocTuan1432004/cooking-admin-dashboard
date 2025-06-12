"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, LogOut, User, Settings } from "lucide-react";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export function Header({
  title,
  showSearch = true,
  userName = "",
  userAvatar,
  onLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout logic
      console.log("Đăng xuất");
      // Redirect to login page or clear session
      window.location.href = "/login";
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={userAvatar || "/placeholder.svg"}
                    alt={userName}
                  />
                  <AvatarFallback className="bg-orange-500 text-white text-sm">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-700">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center space-x-2"></DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
