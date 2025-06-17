"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

export function Header({
  title,
  showSearch = true,
  userName = "Admin User",
  userAvatar,
  notificationCount = 0,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Avatar - Static Display */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={userAvatar || "LogoNoImage.png"}
                alt={userName}
              />
              <AvatarFallback className="bg-orange-500 text-white text-sm">
                {getUserInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-700">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
