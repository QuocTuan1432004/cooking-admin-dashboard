import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

export default function Dashboard() {
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
  ]

  const pendingRecipes = [
    {
      id: 1,
      name: "Rau muống xào tỏi",
      category: "Món xào",
      author: "Lê Văn Cường",
      date: "14/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: true,
    },
    {
      id: 2,
      name: "Bún bò Huế",
      category: "Món nước",
      author: "Hoàng Văn Em",
      date: "15/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: false,
    },
    {
      id: 3,
      name: "Cá kho tộ",
      category: "Món kho",
      author: "Nguyễn Thị Phương",
      date: "15/05/2025",
      image: "/placeholder.svg?height=50&width=50",
      isNew: true,
    },
  ]

  return (
    <div>
      <Header title="Tổng quan" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} colorIndex={index} />
        ))}
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-green-500"></div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">Công thức mới (7 ngày qua)</h3>
          <div className="text-3xl font-bold text-teal-500 mb-4">25</div>
          <div className="text-sm text-gray-600 mb-3">Tăng 20% so với tuần trước</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-400 to-green-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">
            Người đăng mới (7 ngày qua)
          </h3>
          <div className="text-3xl font-bold text-blue-500 mb-4">10</div>
          <div className="text-sm text-gray-600 mb-3">Tăng 15% so với tuần trước</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Pending Recipes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Công thức chờ duyệt</h2>
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm công thức
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ảnh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên công thức</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Danh mục</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Người đăng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày đăng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                  <td className="py-3 px-4">
                    {recipe.author}
                    {recipe.isNew && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Mới</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{recipe.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Chờ duyệt</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        Từ chối
                      </Button>
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
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
  )
}
