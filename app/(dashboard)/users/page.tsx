"use client";
import { useNotification } from "../../../hooks/NotiApi/NotificationContext"; // Adjusted path to parent directory
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BanUserDialog } from "@/components/ui/ban-user-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountsApi } from "@/hooks/accountApi";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  username?: string;
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  banEndDate?: string;
  roles: Array<{ name: string; description: string; permissions: any[] }>;
  recipeCount: number;
}

export default function UsersPage() {
  const { unreadCount } = useNotification();
  const {
    getAllAccounts,
    deleteAccount,
    manageAccount,
    getRecipeCountByUser,
    searchAccountsByEmail,
  } = useAccountsApi();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // ← Store all users for filtering
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  // ← Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recipeCountFilter, setRecipeCountFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("reg-date-desc");

  // Fetch users when page changes or on initial load
  useEffect(() => {
    if (!isSearchMode) {
      fetchUsers();
    }
  }, [currentPage, isSearchMode]);

  // ← Apply filters when filter states change
  useEffect(() => {
    if (!isSearchMode && allUsers.length > 0) {
      applyFilters();
    }
  }, [statusFilter, recipeCountFilter, sortBy, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllAccounts(currentPage, 5);

      const usersWithRecipeCount: User[] = [];

      for (const user of response.content) {
        try {
          const recipeCount = await getRecipeCountByUser(user.id);
          usersWithRecipeCount.push({ ...user, recipeCount });
        } catch (error) {
          console.warn(
            `Failed to get recipe count for user ${user.id}:`,
            error
          );
          usersWithRecipeCount.push({ ...user, recipeCount: 0 });
        }
      }

      setAllUsers(usersWithRecipeCount); // ← Store original data
      setUsers(usersWithRecipeCount); // ← Display data
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setAllUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // ← Apply filters to current users
  const applyFilters = () => {
    let filteredUsers = [...allUsers];

    // Filter by status
    if (statusFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === statusFilter
      );
    }

    // Filter by recipe count
    if (recipeCountFilter !== "all") {
      switch (recipeCountFilter) {
        case "0-10":
          filteredUsers = filteredUsers.filter(
            (user) => user.recipeCount >= 0 && user.recipeCount <= 10
          );
          break;
        case "11-20":
          filteredUsers = filteredUsers.filter(
            (user) => user.recipeCount >= 11 && user.recipeCount <= 20
          );
          break;
        case "21-50":
          filteredUsers = filteredUsers.filter(
            (user) => user.recipeCount >= 21 && user.recipeCount <= 50
          );
          break;
        case "50+":
          filteredUsers = filteredUsers.filter((user) => user.recipeCount > 50);
          break;
      }
    }

    // Sort users
    switch (sortBy) {
      case "reg-date-desc":
        filteredUsers.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "reg-date-asc":
        filteredUsers.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "recipes-desc":
        filteredUsers.sort((a, b) => b.recipeCount - a.recipeCount);
        break;
      case "recipes-asc":
        filteredUsers.sort((a, b) => a.recipeCount - b.recipeCount);
        break;
    }

    setUsers(filteredUsers);
  };

  // ← Reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setRecipeCountFilter("all");
    setSortBy("reg-date-desc");
  };

  // Search function - triggered by Enter key
  const handleSearch = async () => {
    console.log("🔍 handleSearch called with keyword:", searchKeyword);

    if (!searchKeyword.trim()) {
      console.log("❌ Empty search keyword, returning to normal mode");
      setIsSearchMode(false);
      setCurrentPage(0);
      return;
    }

    try {
      setLoading(true);
      setIsSearchMode(true);

      console.log(
        "📡 Calling searchAccountsByEmail with keyword:",
        searchKeyword.trim()
      );
      const searchResults = await searchAccountsByEmail(searchKeyword.trim());
      console.log("📊 Search results received:", searchResults);
      console.log("📊 Number of results:", searchResults?.length || 0);

      const validEmails = searchResults.filter((user) => user && user.email);
      console.log("✅ Valid emails found:", validEmails);

      if (validEmails.length === 0) {
        console.log("❌ No valid emails found");
        setUsers([]);
        setTotalPages(1);
        return;
      }

      console.log("📡 Fetching all users to find matching accounts...");
      const allUsersResponse = await getAllAccounts(0, 100);
      console.log("📊 All users fetched:", allUsersResponse.content);

      const matchedUsers = [];
      for (const searchEmail of validEmails) {
        const fullUser = allUsersResponse.content.find(
          (user) =>
            user.email?.toLowerCase() === searchEmail.email?.toLowerCase()
        );

        if (fullUser) {
          console.log(
            `✅ Found full user data for ${searchEmail.email}:`,
            fullUser
          );
          matchedUsers.push(fullUser);
        } else {
          console.warn(`⚠️ No full user data found for ${searchEmail.email}`);
          matchedUsers.push({
            id: `temp-${Date.now()}-${Math.random()}`,
            email: searchEmail.email,
            username: undefined,
            status: "ACTIVE" as const,
            createdAt: new Date().toISOString(),
            banEndDate: undefined,
            roles: [],
          });
        }
      }

      console.log("🎯 Matched users with full data:", matchedUsers);

      const usersWithRecipeCount: User[] = [];
      for (const user of matchedUsers) {
        try {
          const recipeCount =
            user.id && !user.id.startsWith("temp-")
              ? await getRecipeCountByUser(user.id)
              : 0;
          console.log(`✅ Recipe count for ${user.email}: ${recipeCount}`);
          usersWithRecipeCount.push({ ...user, recipeCount });
        } catch (error) {
          console.warn(
            `❌ Failed to get recipe count for user ${user.email}:`,
            error
          );
          usersWithRecipeCount.push({ ...user, recipeCount: 0 });
        }
      }

      console.log("🎯 Final users with recipe count:", usersWithRecipeCount);
      setUsers(usersWithRecipeCount);
      setTotalPages(1);
    } catch (error) {
      console.error("❌ Failed to search users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
      console.log("✅ Search completed");
    }
  };

  // Clear search and go back to normal mode
  const handleClearSearch = () => {
    setSearchKeyword("");
    setIsSearchMode(false);
    setCurrentPage(0);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteAccount(userId);
        if (isSearchMode) {
          handleSearch();
        } else {
          fetchUsers();
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleManageUser = async (
    userId: string,
    action: "ban" | "activate",
    days?: number
  ) => {
    try {
      await manageAccount(userId, action, days);
      if (isSearchMode) {
        handleSearch();
      } else {
        fetchUsers();
      }

      if (action === "activate") {
        alert("Tài khoản đã được kích hoạt thành công!");
      } else {
        alert(`Tài khoản đã bị khóa ${days} ngày!`);
      }
    } catch (error) {
      console.error("Failed to manage user:", error);
      alert("Có lỗi xảy ra khi xử lý tài khoản!");
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
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
            Không xác định
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Đang tải...</div>
    );
  }

  return (
    <div>
      <Header
        title="Quản lý Người dùng"
        showSearch={false}
        notificationCount={unreadCount}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách người dùng
            {isSearchMode && (
              <span className="text-sm text-gray-500 ml-2">
                (Tìm thấy {users.length} kết quả cho: "{searchKeyword}")
              </span>
            )}
            {!isSearchMode &&
              (statusFilter !== "all" ||
                recipeCountFilter !== "all" ||
                sortBy !== "reg-date-desc") && (
                <span className="text-sm text-blue-600 ml-2">
                  (Đã lọc: {users.length}/{allUsers.length} kết quả)
                </span>
              )}
          </h2>
          <div className="flex space-x-2">
            {isSearchMode && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa tìm kiếm
              </Button>
            )}
            {!isSearchMode &&
              (statusFilter !== "all" ||
                recipeCountFilter !== "all" ||
                sortBy !== "reg-date-desc") && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              )}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Top row - Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Input
                  placeholder="Nhập email để tìm kiếm (Enter để tìm)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pr-10"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchKeyword && (
                <p className="text-xs text-gray-500 mt-1">
                  Nhấn Enter để tìm kiếm
                </p>
              )}
            </div>

            {/* Reset button */}
            <div className="flex-shrink-0 mt-7">
              <Button
                onClick={resetFilters}
                disabled={isSearchMode}
                variant="outline"
                className="h-10 px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>

          {/* Bottom row - Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={isSearchMode}
              >
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
              <Select
                value={recipeCountFilter}
                onValueChange={setRecipeCountFilter}
                disabled={isSearchMode}
              >
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
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                disabled={isSearchMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ngày đăng ký" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reg-date-desc">Mới nhất</SelectItem>
                  <SelectItem value="reg-date-asc">Cũ nhất</SelectItem>
                  <SelectItem value="recipes-desc">
                    Nhiều công thức nhất
                  </SelectItem>
                  <SelectItem value="recipes-asc">Ít công thức nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Results info */}
        {users.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {isSearchMode
              ? `Không tìm thấy người dùng nào với email chứa "${searchKeyword}"`
              : "Không có người dùng nào thỏa mãn điều kiện lọc."}
          </div>
        )}

        {/* Table */}
        {users.length > 0 && (
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
                    Ngày tạo
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
                    <td className="py-3 px-4 text-gray-600">
                      {user.id && !user.id.startsWith("temp-")
                        ? user.id.slice(0, 8) + "..."
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {isSearchMode ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: (user.email || "").replace(
                              new RegExp(`(${searchKeyword})`, "gi"),
                              '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                            ),
                          }}
                        />
                      ) : (
                        user.email || "N/A"
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {user.username || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded font-medium">
                        {user.recipeCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status || "UNKNOWN")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {user.status === "ACTIVE" ? (
                          <BanUserDialog
                            userId={user.id}
                            userName={user.username || user.email}
                            onBanUser={handleManageUser}
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                disabled={
                                  !user.id || user.id.startsWith("temp-")
                                }
                              >
                                Khóa
                              </Button>
                            }
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() =>
                              user.id &&
                              !user.id.startsWith("temp-") &&
                              handleManageUser(user.id, "activate")
                            }
                            disabled={!user.id || user.id.startsWith("temp-")}
                          >
                            Kích hoạt
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() =>
                            user.id &&
                            !user.id.startsWith("temp-") &&
                            handleDeleteUser(user.id)
                          }
                          disabled={!user.id || user.id.startsWith("temp-")}
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
        )}

        {/* Pagination - Only show in normal mode */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                «
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  className={
                    currentPage === i ? "bg-orange-500 text-white" : ""
                  }
                  variant={currentPage === i ? "default" : "outline"}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                »
              </Button>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {isSearchMode && users.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Hiển thị tất cả {users.length} kết quả tìm kiếm
          </div>
        )}
      </div>
    </div>
  );
}
