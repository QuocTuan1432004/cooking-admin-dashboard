import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8 max-lg:ml-[70px] max-md:ml-0">
        {children}
      </main>
    </div>
  );
}
