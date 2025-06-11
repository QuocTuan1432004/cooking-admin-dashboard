"use client";

export function LoginBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {/* Floating animated shapes */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 top-[10%] left-[15%] animate-float"></div>
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 opacity-10 top-[60%] right-[10%] animate-float-delayed"></div>
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 bottom-[20%] left-[10%] animate-float-delayed-2"></div>

      {/* Additional decorative elements */}
      <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-8 top-[30%] right-[20%] animate-float"></div>
      <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-orange-300 to-red-400 opacity-8 bottom-[40%] right-[15%] animate-float-delayed"></div>
    </div>
  );
}
