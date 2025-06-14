"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";

interface Recipe {
  id: number;
  name: string;
  category: string;
  author: string;
  date: string;
  image: string;
  isNew: boolean;
  status: "pending" | "approved" | "rejected";
}

export default function Dashboard() {
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([
    {
      id: 1,
      name: "Rau muống xào tỏi",
      category: "Món xào",
      author: "Lê Văn Cường",
      date: "14/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: true,
      status: "pending",
    },
    {
      id: 2,
      name: "Bún bò Huế",
      category: "Món nước",
      author: "Hoàng Văn Em",
      date: "15/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: false,
      status: "pending",
    },
    {
      id: 3,
      name: "Cá kho tộ",
      category: "Món kho",
      author: "Nguyễn Thị Phương",
      date: "15/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: true,
      status: "pending",
    },
  ]);

  const [rejectReason, setRejectReason] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [unreadNotifications] = useState(3);

  const stats = [
    {
      title: "Tổng số công thức",
      number: 125,
      details: [
        { label: "Đã duyệt", value: 100 },
        { label: "Chờ duyệt", value: 15, color: "text-yellow-600" },
        { label: "Bị từ chối", value: 10, color: "text-red-500" },
      ],
    },
    {
      title: "Tổng số người đăng",
      number: 50,
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

  const handleApproveRecipe = (recipeId: number) => {
    setPendingRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, status: "approved" as const }
          : recipe
      )
    );
  };

  const handleRejectRecipe = (recipeId: number, reason: string) => {
    setPendingRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, status: "rejected" as const }
          : recipe
      )
    );
    setRejectReason("");
    setSelectedRecipe(null);
  };

  const handleDeleteRecipe = (recipeId: number) => {
    setPendingRecipes((prev) =>
      prev.filter((recipe) => recipe.id !== recipeId)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

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
                <p className="font-semibold">125 công thức</p>
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
                <p className="font-semibold">50 người dùng</p>
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

      {/* Pending Recipes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Công thức chờ duyệt</span>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm công thức
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ảnh
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Tên công thức
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Người đăng
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày đăng
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
                {pendingRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{recipe.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {recipe.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span>{recipe.author}</span>
                        {recipe.isNew && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            Mới
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(recipe.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {recipe.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRecipe(recipe.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRecipe(recipe)}
                                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Từ chối công thức</DialogTitle>
                                  <DialogDescription>
                                    Vui lòng nhập lý do từ chối công thức "
                                    {recipe.name}"
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Lý do từ chối</Label>
                                    <Textarea
                                      value={rejectReason}
                                      onChange={(e) =>
                                        setRejectReason(e.target.value)
                                      }
                                      placeholder="Nhập lý do từ chối..."
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRecipe(null)}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      selectedRecipe &&
                                      handleRejectRecipe(
                                        selectedRecipe.id,
                                        rejectReason
                                      )
                                    }
                                    className="bg-orange-600 hover:bg-orange-700"
                                    disabled={!rejectReason.trim()}
                                  >
                                    Từ chối
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa công thức "
                                {recipe.name}"? Hành động này không thể hoàn
                                tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRecipe(recipe.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendingRecipes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có công thức nào chờ duyệt.
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                «
              </Button>
              <Button size="sm" className="bg-orange-500 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}