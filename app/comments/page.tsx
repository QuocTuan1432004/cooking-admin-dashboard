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

export default function CommentsPage() {
  const comments = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      recipe: "Gà kho gừng",
      content: "Món này rất ngon, cảm ơn bạn đã chia sẻ!",
      date: "16/05/2025",
      status: "approved",
    },
    {
      id: 2,
      user: "Trần Thị B",
      recipe: "Canh chua cá",
      content: "Có thể thêm ít rau thơm để tăng hương vị không?",
      date: "15/05/2025",
      status: "approved",
    },
    {
      id: 3,
      user: "Lê Văn C",
      recipe: "Bánh flan",
      content: "Cách làm rất chi tiết, mình làm thành công ngay lần đầu!",
      date: "15/05/2025",
      status: "approved",
    },
    {
      id: 4,
      user: "Phạm Thị D",
      recipe: "Chè đậu xanh",
      content: "Món này hơi ngọt quá, lần sau mình sẽ giảm đường.",
      date: "14/05/2025",
      status: "hidden",
    },
    {
      id: 5,
      user: "Hoàng Văn E",
      recipe: "Rau muống xào tỏi",
      content: "Nhanh mà ngon, rất phù hợp cho bữa tối bận rộn!",
      date: "14/05/2025",
      status: "approved",
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
      case "hidden":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
            Ẩn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header title="Quản lý Bình luận" showSearch={false} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách bình luận
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <Input placeholder="Tìm kiếm nội dung hoặc người dùng..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Công thức
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả công thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả công thức</SelectItem>
                <SelectItem value="ga-kho-gung">Gà kho gừng</SelectItem>
                <SelectItem value="rau-muong-xao-toi">
                  Rau muống xào tỏi
                </SelectItem>
                <SelectItem value="canh-chua-ca">Canh chua cá</SelectItem>
                <SelectItem value="banh-flan">Bánh flan</SelectItem>
                <SelectItem value="che-dau-xanh">Chè đậu xanh</SelectItem>
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
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="hidden">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đăng
            </label>
            <Input type="date" />
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
                  Người dùng
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Công thức
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Nội dung
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
              {comments.map((comment) => (
                <tr
                  key={comment.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-3 px-4 text-gray-600">{comment.id}</td>
                  <td className="py-3 px-4 font-medium">{comment.user}</td>
                  <td className="py-3 px-4 text-gray-600">{comment.recipe}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {comment.content}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{comment.date}</td>
                  <td className="py-3 px-4">
                    {getStatusBadge(comment.status)}
                  </td>
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
                      {comment.status === "hidden" ? (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Duyệt
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        >
                          Ẩn
                        </Button>
                      )}
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
