"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/userAuth"
import { useAccountsApi } from "@/hooks/accountApi"
import {
  countAllRecipes,
  countAllApprovedRecipes,
  countAllPendingRecipes,
  countAllNotApprovedRecipes,
} from "@/hooks/RecipeApi/recipeApi"
import { getAllMainCategories } from "@/hooks/categoryApi/categoryApi"
import {
  getAllComments,
  getTotalCommentReports,
  getReportStatistics,
  type CommentResponse,
} from "@/hooks/commentApi/commentApi"

// Types
interface DashboardStats {
  totalRecipes: number
  approvedRecipes: number
  pendingRecipes: number
  rejectedRecipes: number
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  totalCategories: number
  mainCategories: number
  subCategories: number
  totalComments: number
  approvedComments: number
  pendingComments: number
  hiddenComments: number
  reportedComments: number
  totalReports: number
}

interface StatCardProps {
  title: string
  number: number
  details: Array<{
    label: string
    value: number
    color?: string
    icon?: React.ReactNode
  }>
  colorIndex: number
  loading?: boolean
}

const StatCard = ({ title, number, details, colorIndex, loading }: StatCardProps) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
  ]

  const bgColors = [
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200",
    "bg-purple-50 border-purple-200",
    "bg-orange-50 border-orange-200",
  ]

  return (
    <Card
      className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${bgColors[colorIndex % bgColors.length]}`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[colorIndex % colors.length]}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-4">{loading ? "..." : number.toLocaleString()}</div>
        <div className="space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {detail.icon}
                <span className="text-gray-600">{detail.label}</span>
              </div>
              <span className={`font-medium ${detail.color || "text-gray-900"}`}>
                {loading ? "..." : detail.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { logout } = useAuth()
  const { getAllAccounts } = useAccountsApi()

  const [unreadNotifications] = useState(3)
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    approvedRecipes: 0,
    pendingRecipes: 0,
    rejectedRecipes: 0,
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalCategories: 0,
    mainCategories: 0,
    subCategories: 0,
    totalComments: 0,
    approvedComments: 0,
    pendingComments: 0,
    hiddenComments: 0,
    reportedComments: 0,
    totalReports: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const calculateCommentStats = (comments: CommentResponse[]) => {
    const approved = comments.filter((c) => c.status === "APPROVED").length
    const pending = comments.filter((c) => c.status === "PENDING").length
    const hidden = comments.filter((c) => c.status === "HIDDEN").length
    const reported = comments.filter((c) => c.reported === true).length

    return { approved, pending, hidden, reported }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [
        recipesData,
        approvedRecipesData,
        pendingRecipesData,
        rejectedRecipesData,
        usersData,
        categoriesData,
        commentsData,
        totalReportsData,
        reportStatsData,
      ] = await Promise.allSettled([
        countAllRecipes(),
        countAllApprovedRecipes(),
        countAllPendingRecipes(),
        countAllNotApprovedRecipes(),
        getAllAccounts(0, 1), // Get first page to get totalElements
        getAllMainCategories(),
        getAllComments(0, 1), // Get first page for total count
        getTotalCommentReports(),
        getReportStatistics(),
      ])

      // Process results
      const newStats: DashboardStats = {
        totalRecipes: recipesData.status === "fulfilled" ? recipesData.value : 0,
        approvedRecipes: approvedRecipesData.status === "fulfilled" ? approvedRecipesData.value : 0,
        pendingRecipes: pendingRecipesData.status === "fulfilled" ? pendingRecipesData.value : 0,
        rejectedRecipes: rejectedRecipesData.status === "fulfilled" ? rejectedRecipesData.value : 0,
        totalUsers: usersData.status === "fulfilled" ? usersData.value.totalElements : 0,
        activeUsers: 0, // Will be calculated from user data
        bannedUsers: 0, // Will be calculated from user data
        totalCategories: 0,
        mainCategories: categoriesData.status === "fulfilled" ? categoriesData.value.length : 0,
        subCategories: 0,
        totalComments: commentsData.status === "fulfilled" ? commentsData.value.totalElements : 0,
        approvedComments: 0,
        pendingComments: 0,
        hiddenComments: 0,
        reportedComments: 0,
        totalReports: totalReportsData.status === "fulfilled" ? totalReportsData.value : 0,
      }

      // Calculate categories
      if (categoriesData.status === "fulfilled") {
        const categories = categoriesData.value
        let totalSubCategories = 0
        categories.forEach((category) => {
          if (category.children) {
            totalSubCategories += category.children.length
          }
        })
        newStats.totalCategories = categories.length + totalSubCategories
        newStats.subCategories = totalSubCategories
      }

      // Calculate user stats
      if (usersData.status === "fulfilled") {
        try {
          const allUsersData = await getAllAccounts(0, usersData.value.totalElements)
          const activeUsers = allUsersData.content.filter((user) => user.status === "ACTIVE").length
          const bannedUsers = allUsersData.content.filter((user) => user.status === "BANNED").length
          newStats.activeUsers = activeUsers
          newStats.bannedUsers = bannedUsers
        } catch (error) {
          console.warn("Could not fetch detailed user stats:", error)
        }
      }

      // Calculate comment stats using the actual API
      if (commentsData.status === "fulfilled") {
        try {
          // Fetch more comments to get accurate stats
          const allCommentsData = await getAllComments(0, Math.min(commentsData.value.totalElements, 1000))
          const commentStats = calculateCommentStats(allCommentsData.content)

          newStats.approvedComments = commentStats.approved
          newStats.pendingComments = commentStats.pending
          newStats.hiddenComments = commentStats.hidden
          newStats.reportedComments = commentStats.reported
        } catch (error) {
          console.warn("Could not fetch detailed comment stats:", error)
        }
      }

      setStats(newStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const dashboardStats = [
    {
      title: "Tổng số công thức",
      number: stats.totalRecipes,
      details: [
        {
          label: "Đã duyệt",
          value: stats.approvedRecipes,
          color: "text-green-600",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        },
        {
          label: "Chờ duyệt",
          value: stats.pendingRecipes,
          color: "text-yellow-600",
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
        },
        {
          label: "Bị từ chối",
          value: stats.rejectedRecipes,
          color: "text-red-600",
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        },
      ],
    },
    {
      title: "Tổng số người dùng",
      number: stats.totalUsers,
      details: [
        {
          label: "Đang hoạt động",
          value: stats.activeUsers,
          color: "text-green-600",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        },
        {
          label: "Bị khóa",
          value: stats.bannedUsers,
          color: "text-red-600",
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        },
      ],
    },
    {
      title: "Tổng số danh mục",
      number: stats.totalCategories,
      details: [
        {
          label: "Danh mục chính",
          value: stats.mainCategories,
          icon: <FolderOpen className="w-4 h-4 text-purple-500" />,
        },
        {
          label: "Danh mục con",
          value: stats.subCategories,
          icon: <FolderOpen className="w-4 h-4 text-purple-400" />,
        },
      ],
    },
    {
      title: "Tổng số bình luận",
      number: stats.totalComments,
      details: [
        {
          label: "Đã duyệt",
          value: stats.approvedComments,
          color: "text-green-600",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        },
        {
          label: "Chờ duyệt",
          value: stats.pendingComments,
          color: "text-yellow-600",
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
        },
        {
          label: "Đã ẩn",
          value: stats.hiddenComments,
          color: "text-gray-600",
          icon: <EyeOff className="w-4 h-4 text-gray-500" />,
        },
        {
          label: "Bị báo cáo",
          value: stats.reportedComments,
          color: "text-red-600",
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Quản lý Người dùng" showSearch={false} notificationCount={unreadNotifications} />

      <div className="p-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Cập nhật lần cuối: {lastUpdated.toLocaleTimeString("vi-VN")}</p>
          </div>
          <Button
            onClick={fetchDashboardData}
            disabled={loading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/recipes")}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quản lý công thức</p>
                  <p className="font-semibold">
                    {loading ? "Đang tải..." : `${stats.totalRecipes.toLocaleString()} công thức`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/users")}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quản lý người dùng</p>
                  <p className="font-semibold">
                    {loading ? "Đang tải..." : `${stats.totalUsers.toLocaleString()} người dùng`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/categories")}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quản lý danh mục</p>
                  <p className="font-semibold">
                    {loading ? "Đang tải..." : `${stats.totalCategories.toLocaleString()} danh mục`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/comments")}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quản lý bình luận</p>
                  <p className="font-semibold">
                    {loading ? "Đang tải..." : `${stats.totalComments.toLocaleString()} bình luận`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {dashboardStats.map((stat, index) => (
            <StatCard key={index} {...stat} colorIndex={index} loading={loading} />
          ))}
        </div>

        {/* Trend Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-green-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Tỷ lệ duyệt công thức</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-teal-500 mb-4">
                {loading
                  ? "..."
                  : `${stats.totalRecipes > 0 ? Math.round((stats.approvedRecipes / stats.totalRecipes) * 100) : 0}%`}
              </div>
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                {loading
                  ? "..."
                  : `${stats.approvedRecipes.toLocaleString()} / ${stats.totalRecipes.toLocaleString()} công thức`}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-400 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalRecipes > 0 ? (stats.approvedRecipes / stats.totalRecipes) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Tỷ lệ người dùng hoạt động
                </h3>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-4">
                {loading
                  ? "..."
                  : `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`}
              </div>
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                {loading
                  ? "..."
                  : `${stats.activeUsers.toLocaleString()} / ${stats.totalUsers.toLocaleString()} người dùng`}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <Clock className="w-5 h-5" />
                <span>Cần xử lý</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Công thức chờ duyệt</span>
                  <span className="font-semibold text-yellow-700">
                    {loading ? "..." : stats.pendingRecipes.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bình luận chờ duyệt</span>
                  <span className="font-semibold text-yellow-700">
                    {loading ? "..." : stats.pendingComments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bình luận bị báo cáo</span>
                  <span className="font-semibold text-red-700">
                    {loading ? "..." : stats.reportedComments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng số báo cáo</span>
                  <span className="font-semibold text-red-700">
                    {loading ? "..." : stats.totalReports.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Đã duyệt</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Công thức đã duyệt</span>
                  <span className="font-semibold text-green-700">
                    {loading ? "..." : stats.approvedRecipes.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bình luận đã duyệt</span>
                  <span className="font-semibold text-green-700">
                    {loading ? "..." : stats.approvedComments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Người dùng hoạt động</span>
                  <span className="font-semibold text-green-700">
                    {loading ? "..." : stats.activeUsers.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Cảnh báo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Công thức bị từ chối</span>
                  <span className="font-semibold text-red-700">
                    {loading ? "..." : stats.rejectedRecipes.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bình luận đã ẩn</span>
                  <span className="font-semibold text-red-700">
                    {loading ? "..." : stats.hiddenComments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Người dùng bị khóa</span>
                  <span className="font-semibold text-red-700">
                    {loading ? "..." : stats.bannedUsers.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
