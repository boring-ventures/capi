'use client'

import { useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UserProfileModal } from "./user-profile-modal"
import { TechnicianProfileModal } from "./technician-profile-modal"
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

  const renderProfileModal = () => {
    if (!userData) return null;

    if (userData.role === "technician") {
      return (
        <TechnicianProfileModal
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          technician={{
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            created_at: userData.created_at,
            photo_url: userData.photo_url
          }}
        />
      );
    }

    return (
      <UserProfileModal
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={{
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          registrationDate: userData.created_at,
          services: [], // Si necesitas los servicios, deberías obtenerlos de la base de datos
          reviews: [] // Si necesitas las reseñas, deberías obtenerlas de la base de datos
        }}
      />
    );
  };

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

      {userData && renderProfileModal()}

      <EditUserModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={userId}
      />
    </>
  )
}

