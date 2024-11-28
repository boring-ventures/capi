import { Badge } from "@/components/ui/badge"

interface UserStatusProps {
  status: 'activo' | 'inactivo'
}

export function UserStatus({ status }: UserStatusProps) {
  return (
    <Badge variant={status === 'activo' ? 'success' : 'secondary'}>
      {status === 'activo' ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}

