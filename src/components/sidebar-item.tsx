import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

import { cn } from "@/lib/utils"
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
  onClick?: () => void
}

export function SidebarItem({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "w-full justify-start gap-4 px-4 py-3",
          "text-base font-medium text-slate-600 hover:text-slate-900",
          "hover:bg-slate-100/80 focus-visible:bg-slate-100/80",
          isActive && "bg-slate-100 text-slate-900 hover:bg-slate-100"
        )}
        onClick={onClick}
      >
        <Link href={href}>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="font-semibold">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

