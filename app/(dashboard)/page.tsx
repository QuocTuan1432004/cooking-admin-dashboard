"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import type { Recipe } from "@/components/recipe-detail-modal";
import { RecipeManagement } from "@/components/recipe-management";
import { useAccountsApi } from "@/hooks/accountApi";
import { countAllNotApprovedRecipes, countAllPendingRecipes, countAllRecipes } from "@/hooks/RecipeApi/recipeApi";
import { countAllApprovedRecipes } from "@/hooks/RecipeApi/recipeApi";
import { set } from "date-fns";

export default function Dashboard() {
  const { getAllAccounts } = useAccountsApi();
  const [unreadNotifications] = useState(3);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPendingRecipes, setTotalPendingRecipes] = useState(0);
  const [totalNotApprovedRecipes, setTotalNotApprovedRecipes] = useState(0);
  const [totalApprovedRecipes, setTotalApprovedRecipes] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch total users count
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAllAccounts(0, 1); // Get first page to get totalElements
      setTotalUsers(response.totalElements);

      const recipeCount = await countAllRecipes();
      setTotalRecipes(recipeCount);

      const approvedRecipeCount = await countAllApprovedRecipes();
      setTotalApprovedRecipes(approvedRecipeCount);
      
      const countPendingRecipes= await countAllPendingRecipes();
      setTotalPendingRecipes(countPendingRecipes);

      const countNotApprovedRecipes = await countAllNotApprovedRecipes();
      setTotalNotApprovedRecipes(countNotApprovedRecipes);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setTotalUsers(0);
      setTotalRecipes(0);
      setTotalApprovedRecipes(0);
    } finally {
      setLoading(false);
    }
  };



  const stats = [
    {
      title: "Tổng số công thức",
      number: totalRecipes, 
      details: [
        { label: "Đã duyệt", value: totalApprovedRecipes },
        { label: "Chờ duyệt", value: totalPendingRecipes, color: "text-yellow-600" },
        { label: "Bị từ chối", value: totalNotApprovedRecipes, color: "text-red-500" },
      ],
    },
    {
      title: "Tổng số người đăng",
      number: totalUsers, // ← Use dynamic data
      details: [
        { label: "Đang hoạt động", value: 45, color: "text-green-500" },
        { label: "Bị khóa", value: 5, color: "text-red-500" },
      ],
    },
    {
      title: "Tổng số danh mục",
      number: 6,
      details: [
        { label: "Món chính", value: 2 },
        { label: "Món phụ", value: 2 },
        { label: "Món tráng miệng", value: 2 },
      ],
    },
    {
      title: "Tổng số bình luận",
      number: 320,
      details: [
        { label: "Hôm nay", value: 12 },
        { label: "Tuần này", value: 45 },
        { label: "Chờ duyệt", value: 7, color: "text-yellow-600" },
      ],
    },
  ];

  return (
    <div>
      <Header
        title="Tổng quan"
        userName="Nguyễn Huỳnh Quốc Tuấn"
        notificationCount={unreadNotifications}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quản lý công thức</p>
                <p className="font-semibold">{totalRecipes.toLocaleString()} công thức</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quản lý người dùng</p>
                <p className="font-semibold">
                  {loading
                    ? "Đang tải..."
                    : `${totalUsers.toLocaleString()} người dùng`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quản lý danh mục</p>
                <p className="font-semibold">6 danh mục</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quản lý bình luận</p>
                <p className="font-semibold">320 bình luận</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} colorIndex={index} />
        ))}
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-green-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Công thức mới (7 ngày qua)
              </h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-teal-500 mb-4">25</div>
            <div className="text-sm text-gray-600 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              Tăng 20% so với tuần trước
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-teal-400 to-green-500 h-2 rounded-full w-3/4 transition-all duration-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Người đăng mới (7 ngày qua)
              </h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-500 mb-4">10</div>
            <div className="text-sm text-gray-600 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              Tăng 15% so với tuần trước
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full w-1/2 transition-all duration-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Recipes using the new RecipeManagement component
      <RecipeManagement
        recipes={pendingRecipes}
        onRecipeUpdate={setPendingRecipes}
        showApprovalActions={true}
        showFilters={false}
        title="Công thức chờ duyệt"
        onAddRecipe={() => console.log("Add recipe clicked")}
      /> */}
    </div>
  );
}
