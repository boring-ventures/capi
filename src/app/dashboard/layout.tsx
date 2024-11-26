"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
      <AppSidebar />
      <SidebarInset className="bg-slate-50">
        <main className="flex-1 p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
