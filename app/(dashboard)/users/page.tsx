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

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      recipeCount: 15,
      joinDate: "05/02/2025",
      phone: "0912345678",
      status: "active",
    },
    {
      id: 2,
      name: "Lê Văn Cường",
      email: "cuong.le@email.com",
      recipeCount: 8,
      joinDate: "10/03/2025",
      phone: "0923456789",
      status: "active",
    },
    {
      id: 3,
      name: "Phạm Thị Duyên",
      email: "duyen.pham@email.com",
      recipeCount: 12,
      joinDate: "15/04/2025",
      phone: "0934567890",
      status: "inactive",
    },
    {
      id: 4,
      name: "Hoàng Văn Em",
      email: "em.hoang@email.com",
      recipeCount: 20,
      joinDate: "20/04/2025",
      phone: "0945678901",
      status: "active",
    },
    {
      id: 5,
      name: "Nguyễn Thị Phương",
      email: "phuong.nguyen@email.com",
      recipeCount: 5,
      joinDate: "25/04/2025",
      phone: "0956789012",
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Đang hoạt động
          </span>
        );
      case "inactive":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            Bị khóa
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header title="Quản lý Người dùng" showSearch={false} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách người đăng món ăn
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <Input placeholder="Tìm kiếm người đăng..." />
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
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Bị khóa</SelectItem>
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
                  ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Tên
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Số công thức
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Ngày đăng ký
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Số điện thoại
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
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.id}</td>
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.recipeCount}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.joinDate}</td>
                  <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                  <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
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
