'use client'

import { useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UserProfileModal } from "./user-profile-modal"
import { EditUserModal } from "./edit-user-modal"
import { useUser, useDeleteUser } from "@/hooks/useUsers"
import { toast } from "sonner"

interface UserActionsProps {
  userId: string
}

export function UserActions({ userId }: UserActionsProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { data: userData, isLoading } = useUser(userId)
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const handleDelete = () => {
    if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      deleteUser(userId, {
        onSuccess: () => {
          toast.success('Usuario eliminado exitosamente')
        },
      })
    }
  }

  return (
    <>
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsProfileOpen(true)}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver Información</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsEditOpen(true)} 
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar Información</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>

      {userData && (
        <UserProfileModal 
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          user={userData}
        />
      )}

      <EditUserModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={userId}
      />
    </>
  )
}

