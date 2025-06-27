import { Sidebar } from "@/components/sidebar";
import { NotificationProvider } from "../../hooks/NotiApi/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[280px] p-8 max-lg:ml-[70px] max-md:ml-0">
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
