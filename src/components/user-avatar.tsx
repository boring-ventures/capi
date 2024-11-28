import { User, UserCog } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string
  role: 'cliente' | 'trabajador'
}

export function UserAvatar({ name, role }: UserAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  const Icon = role === 'cliente' ? User : UserCog

  return (
    <div className="flex items-center">
      <Avatar className="h-8 w-8 mr-2">
        <AvatarFallback>
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </div>
  )
}

