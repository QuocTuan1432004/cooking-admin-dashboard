"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountsApi } from "@/hooks/accountApi";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  username?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  banEndDate?: string;
  roles: Array<{ name: string; description: string; permissions: any[] }>;
  recipeCount?: number; // Add recipe count
}

export default function UsersPage() {
  const { getAllAccounts, deleteAccount, manageAccount, getRecipeCountByUser } = useAccountsApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllAccounts(currentPage, 5);
      
      // Fetch recipe count for each user
      const usersWithRecipeCount = await Promise.all(
        response.content.map(async (user) => {
          const recipeCount = await getRecipeCountByUser(user.id);
          return { ...user, recipeCount };
        })
      );
      
      setUsers(usersWithRecipeCount);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteAccount(userId);
        fetchUsers(); // Refresh data
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleManageUser = async (userId: string, action: 'ban' | 'ban-permanent' | 'activate', days?: number) => {
    try {
      await manageAccount(userId, action, days);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Failed to manage user:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Đang hoạt động
          </span>
        );
      case "BANNED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            Bị khóa
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            Không hoạt động
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  return (
    <div>
      <Header title="Quản lý Người dùng" showSearch={false} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách người dùng
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <Input 
              placeholder="Tìm kiếm người đăng..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="BANNED">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số công thức
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="0-10">0 - 10</SelectItem>
                <SelectItem value="11-20">11 - 20</SelectItem>
                <SelectItem value="21-50">21 - 50</SelectItem>
                <SelectItem value="50+">Trên 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Ngày đăng ký (mới nhất)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reg-date-desc">
                  Ngày đăng ký (mới nhất)
                </SelectItem>
                <SelectItem value="reg-date-asc">
                  Ngày đăng ký (cũ nhất)
                </SelectItem>
                <SelectItem value="recipes-desc">
                  Số công thức (cao đến thấp)
                </SelectItem>
                <SelectItem value="recipes-asc">
                  Số công thức (thấp đến cao)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={fetchUsers}>Lọc</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Username
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Ngày đăng ký
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Số công thức
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-600">{user.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 font-medium">{user.username || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded font-medium">
                      {user.recipeCount || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {user.status === 'ACTIVE' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleManageUser(user.id, 'ban', 7)}
                        >
                          Khóa
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleManageUser(user.id, 'activate')}
                        >
                          Kích hoạt
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              «
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button 
                key={i}
                size="sm" 
                className={currentPage === i ? "bg-orange-500 text-white" : ""}
                variant={currentPage === i ? "default" : "outline"}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}