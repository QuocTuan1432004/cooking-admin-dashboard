"use client"

import { Search } from "lucide-react"

interface HeaderProps {
  title: string
  showSearch?: boolean
}

export function Header({ title, showSearch = true }: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center pb-5 mb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 relative">
            {title}
            <div className="absolute -bottom-3 left-0 w-12 h-1 bg-orange-500 rounded"></div>
          </h1>
        </div>
        <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
            T
          </div>
          <span className="font-medium text-gray-700 max-md:hidden">Nguyễn Huỳnh Quốc Tuấn</span>
        </div>
      </div>

      {showSearch && (
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm công thức, người dùng, danh mục..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-lg shadow-md border-0 focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-700"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      )}
    </div>
  )
}
