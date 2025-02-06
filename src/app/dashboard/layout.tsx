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
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar>
          {children}
        </AppSidebar>
      </SidebarProvider>
    </div>
  );
}
