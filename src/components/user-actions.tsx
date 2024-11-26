import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface UserActionsProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function UserActions({ onView, onEdit, onDelete }: UserActionsProps) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8">
        <Eye className="h-4 w-4" />
        <span className="sr-only">Ver Información</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Editar Información</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  )
}

