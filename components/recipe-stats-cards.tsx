import { Card, CardContent } from "@/components/ui/card"
import { Eye, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react"
import type { Recipe } from "./recipe-detail-modal"

interface RecipeStatsCardsProps {
  recipes: Recipe[]
}

// Helper function để format số nhất quán
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function RecipeStatsCards({ recipes }: RecipeStatsCardsProps) {
  const stats = {
    total: recipes.length,
    approved: recipes.filter((r) => r.status === "approved").length,
    pending: recipes.filter((r) => r.status === "pending").length,
    rejected: recipes.filter((r) => r.status === "rejected").length,
    totalViews: recipes.reduce((sum, r) => sum + (r.views || 0), 0),
    avgRating: recipes
      .filter((r) => (r.rating || 0) > 0)
      .reduce((sum, r, _, arr) => sum + (r.rating || 0) / arr.length, 0),
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng công thức</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
              <p className="text-sm text-gray-600">Tổng lượt xem</p>
              <p className="text-2xl font-bold text-indigo-600">{formatNumber(stats.totalViews)}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bị từ chối</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ duyệt</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
