"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập đăng nhập
    setTimeout(() => {
      setIsLoading(false);
      // Set cookie để middleware biết user đã đăng nhập
      document.cookie = "auth_token=admin_logged_in; path=/; max-age=86400";
      router.push("/");
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/pngtree-beige-pastel-aesthetic-vector-background-picture-image_3950681.png')",
        }}
      >
        <div className="absolute inset-0 bg-[#fff8f0]/85 backdrop-blur-[2px]"></div>
      </div>

      {/* Animated floating shapes */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 top-[10%] left-[15%] animate-float"></div>
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 opacity-10 top-[60%] right-[10%] animate-float-delayed"></div>
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 bottom-[20%] left-[10%] animate-float-delayed-2"></div>
      </div>

      {/* Login container */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100/10 z-10 p-6 animate-slideInFromTop hover:translate-y-[-5px] transition-all duration-300">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-20 h-20 relative mb-4 animate-pulse">
            <Image
              src="/LogoNoName.png"
              alt="LetMeCook Logo"
              fill
              className="object-contain rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">LetMeCook Admin</h1>
          <p className="text-gray-600 text-sm">
            Đăng nhập vào hệ thống quản lý LetMeCook Admin
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Tên đăng nhập hoặc Email"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:border-orange-400 focus:bg-white focus:shadow-orange-100 focus:translate-y-[-2px] transition-all"
              />
            </div>

            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-12 focus:border-orange-400 focus:bg-white focus:shadow-orange-100 focus:translate-y-[-2px] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.username || !formData.password}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-xl py-3 font-medium text-lg relative overflow-hidden hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500"></span>
            </Button>

            <div className="text-center mt-4">
              <a
                href="#"
                className="text-orange-600 hover:text-orange-500 font-medium hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Tính năng quên mật khẩu sẽ được triển khai trong phiên bản tiếp theo."
                  );
                }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
