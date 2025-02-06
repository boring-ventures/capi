"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users2,
  Briefcase,
  History,
  PiggyBank,
  HelpCircle,
  Bell,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav/nav-main";
import { NavUser } from "@/components/nav/nav-user";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    url: "/dashboard/users",
    icon: Users2,
  },
  {
    title: "Servicios",
    url: "/dashboard/services",
    icon: Briefcase,
  },
  {
    title: "Historial",
    url: "/dashboard/history",
    icon: History,
  },
  {
    title: "Finanzas",
    url: "/dashboard/finance",
    icon: PiggyBank,
  },
  {
    title: "Soporte",
    url: "/dashboard/support",
    icon: HelpCircle,
  },
  {
    title: "Notificaciones",
    url: "/dashboard/notifications",
    icon: Bell,
  },
];

const userData = {
  name: "Admin",
  email: "admin@capi.com",
  avatar: "/images/avatar.png",
};

export function AppSidebar() {
  const pathname = usePathname();

  const items = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md">
            <Image
              src="/images/capi.png"
              alt="CAPI Logo"
              width={32}
              height={32}
              className="text-primary-foreground"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-hanson text-lg">CAPI</span>
            <span className="truncate text-xs text-muted-foreground">
              Panel Administrativo
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
