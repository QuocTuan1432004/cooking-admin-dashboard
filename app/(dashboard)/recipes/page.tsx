"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/components/recipe-detail-modal";
import { RecipeManagementAdvanced } from "@/components/recipe-management-advanced";

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
      description:
        "Món gà kho gừng thơm ngon, đậm đà hương vị truyền thống Việt Nam",
      ingredients: [
        "1 con gà ta (khoảng 1.5kg)",
        "100g gừng tươi",
        "3 củ hành tím",
        "2 muỗng canh nước mắm",
        "1 muỗng canh đường",
        "1 muỗng cà phê tiêu",
        "Dầu ăn, muối",
      ],
      instructions: [
        "Sơ chế gà: Rửa sạch, chặt miếng vừa ăn",
        "Gừng cạo vỏ, thái lát mỏng. Hành tím bóc vỏ, băm nhỏ",
        "Ướp gà với nước mắm, đường, tiêu trong 30 phút",
        "Làm nóng dầu, phi thơm hành tím và gừng",
        "Cho gà vào xào săn, đổ nước vừa ngập",
        "Nêm nếm gia vị, kho lửa nhỏ 45 phút đến khi thịt mềm",
      ],
      cookingTime: "1 giờ 15 phút",
      servings: 4,
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
      description: "Canh chua cá bông lau thanh mát, chua ngọt đậm đà",
      ingredients: [
        "500g cá bông lau",
        "200g dứa",
        "100g đậu bắp",
        "50g giá đỗ",
        "2 quả cà chua",
        "Me chua, nước mắm, đường",
      ],
      instructions: [
        "Sơ chế cá, thái khúc",
        "Dứa thái múi cau, cà chua thái múi",
        "Nấu nước me chua",
        "Cho cá vào nấu, nêm nếm",
        "Thêm rau củ, nấu chín tắt bếp",
      ],
      cookingTime: "30 phút",
      servings: 3,
    },
    // ... thêm nhiều recipes khác để test pagination
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
      description: "Bánh flan mềm mịn, thơm ngon với lớp caramel đậm đà",
      ingredients: [
        "4 quả trứng gà",
        "400ml sữa tươi",
        "80g đường",
        "1 tsp vanilla",
      ],
      instructions: [
        "Làm caramel với đường",
        "Đánh trứng với sữa",
        "Lọc hỗn hợp, đổ vào khuôn",
        "Hấp 25 phút",
        "Để nguội rồi tách khuôn",
      ],
      cookingTime: "45 phút",
      servings: 6,
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
      description: "Chè đậu xanh mát lành, bổ dưỡng",
      ingredients: ["200g đậu xanh", "100g đường", "400ml nước cốt dừa"],
      instructions: ["Nấu đậu xanh", "Thêm đường", "Chan nước cốt dừa"],
      cookingTime: "40 phút",
      servings: 4,
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
      description: "Rau muống xào tỏi giòn ngon, đơn giản",
      ingredients: ["500g rau muống", "3 tép tỏi", "Nước mắm, dầu ăn"],
      instructions: ["Nhặt rau muống", "Phi tỏi", "Xào rau nhanh tay"],
      cookingTime: "10 phút",
      servings: 2,
    },
  ]);

  const handleLogout = () => {
    console.log("Đăng xuất thành công");
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <div>
      <Header
        title="Quản lý Công thức"
        showSearch={false}
        userName="Nguyễn Huỳnh Quốc Tuấn"
        onLogout={handleLogout}
        notificationCount={unreadNotifications}
      />

      <RecipeManagementAdvanced
        recipes={recipes}
        onRecipeUpdate={setRecipes}
        showApprovalActions={false}
        showRating={true}
        showViews={true}
        showFilters={true}
        showStats={true}
        showBulkActions={true}
        title="Danh sách công thức"
        onAddRecipe={() => router.push("/recipes/create")}
      />
    </div>
  );
}
