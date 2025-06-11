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
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RecipesPage() {
  const recipes = [
    {
      id: 1,
      name: "Gà kho gừng",
      category: "Món kho",
      author: "Trần Thị Bình",
      views: 1245,
      rating: 4.5,
      date: "15/05/2025",
      cookTime: "45 phút",
      difficulty: "Trung bình",
      status: "approved",
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 2,
      name: "Rau muống xào tỏi",
      category: "Món xào",
      author: "Lê Văn Cường",
      views: 875,
      rating: 4.2,
      date: "14/05/2025",
      cookTime: "15 phút",
      difficulty: "Dễ",
      status: "pending",
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 3,
      name: "Canh chua cá",
      category: "Món canh",
      author: "Phạm Thị Duyên",
      views: 1500,
      rating: 4.7,
      date: "13/05/2025",
      cookTime: "30 phút",
      difficulty: "Trung bình",
      status: "approved",
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 4,
      name: "Bánh flan",
      category: "Món bánh",
      author: "Hoàng Văn Em",
      views: 2300,
      rating: 4.8,
      date: "12/05/2025",
      cookTime: "60 phút",
      difficulty: "Khó",
      status: "approved",
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 5,
      name: "Chè đậu xanh",
      category: "Món tráng miệng",
      author: "Nguyễn Thị Phương",
      views: 600,
      rating: 4.0,
      date: "11/05/2025",
      cookTime: "25 phút",
      difficulty: "Dễ",
      status: "rejected",
      image: "/placeholder.svg?height=50&width=50",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Đã duyệt
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            Chờ duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            Bị từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header title="Quản lý Công thức" showSearch={false} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách công thức
          </h2>
          <Link href="/recipes/create">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Thêm công thức
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <Input placeholder="Tìm kiếm công thức..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="mon-kho">Món kho</SelectItem>
                <SelectItem value="mon-xao">Món xào</SelectItem>
                <SelectItem value="mon-canh">Món canh</SelectItem>
                <SelectItem value="mon-banh">Món bánh</SelectItem>
                <SelectItem value="mon-trang-mieng">Món tráng miệng</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ khó
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="de">Dễ</SelectItem>
                <SelectItem value="trung-binh">Trung bình</SelectItem>
                <SelectItem value="kho">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Ngày đăng (mới nhất)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Ngày đăng (mới nhất)</SelectItem>
                <SelectItem value="date-asc">Ngày đăng (cũ nhất)</SelectItem>
                <SelectItem value="views-desc">
                  Lượt xem (cao đến thấp)
                </SelectItem>
                <SelectItem value="views-asc">
                  Lượt xem (thấp đến cao)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full">Lọc</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input type="checkbox" className="rounded" />
                </th>
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
                  Lượt xem
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Đánh giá
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Ngày đăng
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Thời gian nấu
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Độ khó
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
              {recipes.map((recipe) => (
                <tr
                  key={recipe.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
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
                  <td className="py-3 px-4 text-gray-600">{recipe.category}</td>
                  <td className="py-3 px-4 text-gray-600">{recipe.author}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {recipe.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {recipe.rating} ⭐
                  </td>
                  <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
                  <td className="py-3 px-4 text-gray-600">{recipe.cookTime}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {recipe.difficulty}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(recipe.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {recipe.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
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
      </div>
    </div>
  );
}
