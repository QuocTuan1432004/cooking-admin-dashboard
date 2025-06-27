"use client";
import { useNotification } from "../../hooks/NotiApi/NotificationContext"; // Adjusted path to parent directory
import { useState, useEffect, useCallback } from "react";
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
import { notificationApi, NotificationResponse } from "@/hooks/NotiApi/NotiApi";
import { useRouter } from "next/navigation";

// Helper function to map notification types
function mapNotificationType(notificationType: string): string {
  const typeMap: { [key: string]: string } = {
    RECIPE_SUBMITTED: "recipe",
    RECIPE_APPROVED: "success",
    RECIPE_REJECTED: "error",
    USER_REGISTERED: "user",
    COMMENT_ADDED: "comment",
    SYSTEM_ALERT: "warning",
  };

  return typeMap[notificationType] || "info";
}

export default function DashboardPage() {
  const { unreadCount } = useNotification();
  const router = useRouter();
  const { getAllAccounts } = useAccountsApi();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      message: string;
      date: string;
      time: string;
      type: string | void;
      read: boolean;
      dismissed: boolean;
      originalType: string;
    }[]
  >([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<
    {
      id: string;
      title: string;
      message: string;
      date: string;
      time: string;
      type: string | void;
      read: boolean;
      dismissed: boolean;
      originalType: string;
    }[]
  >([]);

  // Fetch total users count
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
  };

  const handleNewNotification = useCallback(
    (notification: NotificationResponse) => {
      console.log("🔔 Nhận thông báo mới qua WebSocket:", notification);

      const newNotification = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        date: notification.date,
        time: notification.time,
        type: mapNotificationType(notification.notificationType),
        read: notification.readStatus,
        dismissed: notification.dismissed,
        originalType: notification.notificationType,
      };

      // Kiểm tra trùng lặp và cập nhật state thông báo
      if (notification.dismissed) {
        setDismissedNotifications((prev) => {
          // Kiểm tra xem thông báo này đã tồn tại chưa
          const exists = prev.some((n) => n.id === newNotification.id);
          if (exists) {
            console.log(
              `⚠️ Bỏ qua thông báo đã ẩn trùng lặp: ${newNotification.id}`
            );
            return prev;
          }

          console.log("✅ Thêm thông báo đã ẩn mới vào state");
          return [newNotification, ...prev];
        });
      } else {
        setNotifications((prev) => {
          // Kiểm tra xem thông báo này đã tồn tại chưa
          const exists = prev.some((n) => n.id === newNotification.id);
          if (exists) {
            console.log(`⚠️ Bỏ qua thông báo trùng lặp: ${newNotification.id}`);
            return prev;
          }

          console.log("✅ Thêm thông báo mới vào state");
          // Thêm thông báo mới vào đầu danh sách
          return [newNotification, ...prev];
        });

        // Cập nhật số lượng thông báo chưa đọc nếu thông báo mới chưa đọc
        if (!notification.readStatus) {
          setUnreadNotifications((prev) => {
            console.log(
              `📊 Cập nhật số thông báo chưa đọc: ${prev} → ${prev + 1}`
            );
            return prev + 1;
          });
        }
      }
    },
    []
  ); // Empty dependency array since we don't depend on any props/state

  // Single useEffect for notification handling
  useEffect(() => {
    let isSubscribed = true; // Flag to prevent state updates if component unmounted

    const initializeNotifications = async () => {
      try {
        // Fetch initial unread notifications count
        const notifications = await notificationApi.getNotifications();

        if (isSubscribed) {
          const response = await notificationApi.getNotifications();
          const count = response.content.filter((n) => !n.readStatus).length;
          setUnreadNotifications(count);
          console.log(`📊 Initial unread notifications: ${count}`);
        }

        // Connect to WebSocket and register callback
        await notificationApi.connect();

        if (isSubscribed) {
          // Clear any existing callbacks first
          notificationApi.unregisterCallback(handleNewNotification);
          notificationApi.registerCallback(handleNewNotification);
          console.log("✅ WebSocket connected and callback registered");
        }
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();

    // Cleanup function
    return () => {
      isSubscribed = false;
      notificationApi.unregisterCallback(handleNewNotification);
      console.log("🧹 Cleanup: Unregistered notification callback");
    };
  }, []); // Empty dependency array to run only once

  const handleLogout = () => {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    router.push("/login");
  };

  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([
    // {
    // //   // id: 1,
    // //   name: "Rau muống xào tỏi",
    // //   category: "Món xào",
    // //   author: "Lê Văn Cường",
    // //   date: "14/05/2025",
    // //   image: "/placeholder.svg?height=50&width=50",
    // //   isNew: true,
    // //   status: "pending",
    // // },
    // {
    //   id: 2,
    //   name: "Bún bò Huế",
    //   category: "Món nước",
    //   author: "Hoàng Văn Em",
    //   date: "15/05/2025",
    //   image: "/placeholder.svg?height=50&width=50",
    //   isNew: false,
    //   status: "pending",
    // },
    // {
    //   id: 3,
    //   name: "Cá kho tộ",
    //   category: "Món kho",
    //   author: "Nguyễn Thị Phương",
    //   date: "15/05/2025",
    //   image: "/placeholder.svg?height=50&width=50",
    //   isNew: true,
    //   status: "pending",
    // },
  ]);

  const stats = [
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
    <div>
      <Header
        title="Tổng quan"
        userName="Nguyễn Huỳnh Quốc Tuấn"
        notificationCount={unreadCount}
      />

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
