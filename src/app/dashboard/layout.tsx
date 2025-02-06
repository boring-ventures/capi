"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/app-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const userData = localStorage.getItem("user_data");
      const accessToken = localStorage.getItem("access_token");

      if (!userData || !accessToken) {
        router.push("/");
        return;
      }
    };

    checkUser();
  }, [router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
