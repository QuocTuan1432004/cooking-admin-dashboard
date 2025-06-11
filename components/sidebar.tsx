"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ChefHat, Users, FolderOpen, MessageCircle, Settings, Bell } from "lucide-react"

const menuItems = [
  { icon: BarChart3, label: "Tổng quan", href: "/", badge: null },
  { icon: ChefHat, label: "Công thức", href: "/recipes", badge: null },
  { icon: Users, label: "Quản lý người dùng", href: "/users", badge: 3 },
  { icon: FolderOpen, label: "Danh mục", href: "/categories", badge: null },
  { icon: MessageCircle, label: "Bình luận", href: "/comments", badge: 7 },
  { icon: Settings, label: "Cài đặt", href: "/settings", badge: null },
  { icon: Bell, label: "Thông báo", href: "/notifications", badge: null },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 z-10 shadow-xl ${isCollapsed ? "w-[70px]" : "w-[280px]"} max-md:${isCollapsed ? "w-0" : "w-full"}`}
    >
      {/* Header */}
      <div className="text-center p-5 border-b border-white/10">
        <h2
          className={`text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent ${isCollapsed ? "hidden" : "block"}`}
        >
          LET ME COOK
        </h2>
        <p className={`text-sm text-white/80 mt-1 ${isCollapsed ? "hidden" : "block"}`}>Quản trị viên</p>
      </div>

      {/* Menu */}
      <nav className="p-5">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-1 ${
                    isActive ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg" : ""
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
