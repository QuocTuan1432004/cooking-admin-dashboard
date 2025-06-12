"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Recipe {
  id: number;
  name: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  rating: number;
  views: number;
  featured: boolean;
}

export default function RecipesPage() {
  const router = useRouter();
  const [unreadNotifications] = useState(3);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 1,
      name: "Gà kho gừng",
      category: "Món kho",
      author: "Nguyễn Văn A",
      date: "16/05/2025",
      image: "/placeholder.svg?height=60&width=60",
      status: "approved",
      rating: 4.5,
      views: 1250,
      featured: true,
    },
    {
      id: 2,
      name: "Canh chua cá",
      category: "Món canh",
      author: "Trần Thị B",
      date: "15/05/2025",
      image: "/placeholder.svg?height=60&width=60",
      status: "approved",
      rating: 4.2,
      views: 980,
      featured: false,
    },
    {
      id: 3,
      name: "Bánh flan",
      category: "Món tráng miệng",
      author: "Lê Văn C",
      date: "15/05/2025",
      image: "/placeholder.svg?height=60&width=60",
      status: "approved",
      rating: 4.8,
      views: 1500,
      featured: true,
    },
    {
      id: 4,
      name: "Chè đậu xanh",
      category: "Món tráng miệng",
      author: "Phạm Thị D",
      date: "14/05/2025",
      image: "/placeholder.svg?height=60&width=60",
      status: "pending",
      rating: 0,
      views: 0,
      featured: false,
    },
    {
      id: 5,
      name: "Rau muống xào tỏi",
      category: "Món xào",
      author: "Hoàng Văn E",
      date: "14/05/2025",
      image: "/placeholder.svg?height=60&width=60",
      status: "rejected",
      rating: 0,
      views: 0,
      featured: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const handleDeleteRecipe = (recipeId: number) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
  };

  const handleStatusChange = (
    recipeId: number,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, status: newStatus } : recipe
      )
    );
  };

  const handleToggleFeatured = (recipeId: number) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, featured: !recipe.featured }
          : recipe
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      default:
        return null;
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || recipe.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || recipe.status === selectedStatus;
    const matchesDate = !selectedDate || recipe.date.includes(selectedDate);

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const getUniqueCategories = () => {
    const categories = [...new Set(recipes.map((recipe) => recipe.category))];
    return categories;
  };

  const getStatusCounts = () => {
    return {
      total: recipes.length,
      approved: recipes.filter((r) => r.status === "approved").length,
      rejected: recipes.filter((r) => r.status === "rejected").length,
      pending: recipes.filter((r) => r.status === "pending").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <Header
        title="Quản lý Công thức"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadNotifications}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng công thức</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.approved}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.pending}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bị từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.rejected}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách công thức</span>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Thêm công thức
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm tên hoặc tác giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Ngày đăng
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>

          {/* Table */}
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
                    Tác giả
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày đăng
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Lượt xem
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Đánh giá
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center">
                        {recipe.name}
                        {recipe.featured && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-purple-100 text-purple-800"
                          >
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Nổi bật
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {recipe.category}
                    </td>
                    <td className="py-3 px-4">{recipe.author}</td>
                    <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(recipe.status)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {recipe.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Star
                          className={`w-4 h-4 ${
                            recipe.rating > 0
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                        <span className="ml-1">
                          {recipe.rating > 0 ? recipe.rating.toFixed(1) : "-"}
                        </span>
                      </div>
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
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={
                            recipe.featured
                              ? "text-purple-600 border-purple-600 hover:bg-purple-50"
                              : ""
                          }
                          onClick={() => handleToggleFeatured(recipe.id)}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              recipe.featured ? "fill-current" : ""
                            }`}
                          />
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

          {filteredRecipes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy công thức nào phù hợp với bộ lọc.
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
