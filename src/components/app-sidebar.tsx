"use client"

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users2, Briefcase, History, PiggyBank, HelpCircle, Bell, LogOut } from 'lucide-react'
import Image from 'next/image'
import logo from '../app/assets/logo.png'

import { SidebarItem } from './sidebar-item'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users2, label: 'Usuarios', href: '/dashboard/users' },
  { icon: Briefcase, label: 'Servicios', href: '/dashboard/services' },
  { icon: History, label: 'Historial de Servicios', href: '/dashboard/history' },
  { icon: PiggyBank, label: 'Gestión Financiera', href: '/dashboard/finance' },
  { icon: HelpCircle, label: 'Soporte y Alertas', href: '/dashboard/support' },
  { icon: Bell, label: 'Notificaciones', href: '/dashboard/notifications' },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    console.log('Cerrando sesión...')
  }

  return (
    <Sidebar className="border-r border-slate-200 bg-white pt-4">
      <SidebarHeader className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1">
            <Image
              src={logo}
              alt="Taskibara Logo"
              width={24}
              height={24}
              className="h-8 w-8"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Taskibara</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
          <div className="mx-4 my-2 h-px bg-slate-200" />
          <SidebarItem
            icon={LogOut}
            label="Cerrar Sesión"
            href="#"
            onClick={handleLogout}
          />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

