import { Badge } from "@/components/ui/badge"

interface UserStatusProps {
  status: 'active' | 'inactive'
}

export function UserStatus({ status }: UserStatusProps) {
  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status === 'active' ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}

