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
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/nav-user";
import { Header } from "../dashboard/Header";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  items?: NavItem[];
}

const data = {
  user: {
    name: "Admin",
    email: "admin@transix.com", 
    avatar: "/images/avatar.png"
  },
  navMain: [
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
  ] as NavItem[]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      <Sidebar 
        variant="inset" 
        {...props}
        className="bg-primary text-primary-foreground"
      >
        <SidebarHeader className="px-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md">
                    <Image
                      src="/images/capi-light.png"
                      alt="CAPI Logo"
                      width={40}
                      height={40}
                      className="text-primary-foreground"
                    />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-hanson text-xl text-primary-foreground">CAPI</span>
                    <span className="truncate text-sm text-primary-foreground/80">
                      Panel Administrativo
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <div className="h-px bg-primary-foreground/20" />

        <SidebarContent>
          <SidebarMenu>
            {data.navMain.map((item, index) => {
              const isActive = item.url
                ? pathname === item.url
                : item.items?.some((subItem) => pathname === subItem.url);
              const isOpen = openMenus.includes(item.title);

              return (
                <React.Fragment key={item.title + index}>
                  <SidebarMenuItem>
                    {item.items ? (
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full justify-start px-3 py-3 text-primary-foreground hover:bg-primary-foreground/10",
                          isActive && "font-bold bg-primary-foreground/20"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="h-5 w-5" />
                          <span className="text-base">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 ml-auto transition-transform",
                              isOpen && "transform rotate-180"
                            )}
                          />
                        </div>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "w-full justify-start px-3 py-3 text-primary-foreground hover:bg-primary-foreground/10",
                          isActive && "font-bold bg-primary-foreground/20"
                        )}
                      >
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="text-base">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  {item.items && isOpen && (
                    <div className="pl-6 space-y-1">
                      {item.items.map((subItem, subIndex) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title + subIndex}>
                            <SidebarMenuButton
                              asChild
                              className={cn(
                                "w-full justify-start gap-2 text-primary-foreground hover:bg-primary-foreground/10",
                                isSubActive && "font-bold bg-primary-foreground/20"
                              )}
                            >
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2"
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-primary-foreground/20">
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6">{props.children}</main>
      </SidebarInset>
    </>
  );
}
