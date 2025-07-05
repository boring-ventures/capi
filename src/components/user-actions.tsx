'use client'

import { useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UserProfileModal } from "./user-profile-modal"
import { TechnicianProfileModal } from "./technician-profile-modal"
import { EditUserModal } from "./edit-user-modal"
import { useDeleteUser } from "@/hooks/useUsers"
import { toast } from "sonner"

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "technician" | "client";
  status: "active" | "inactive";
  reviewStatus?: "pending" | "rejected" | "approved" | "accepted";
  rating?: number;
  address?: string;
  photo_url?: string;
  created_at: string;
}

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const handleDelete = () => {
    if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      deleteUser(user.id, {
        onSuccess: () => {
          toast.success('Usuario eliminado exitosamente')
        },
      })
    }
  }

  const renderProfileModal = () => {
    if (user.role === "technician") {
      return (
        <TechnicianProfileModal
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          technician={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            address: user.address,
            created_at: user.created_at,
            photo_url: user.photo_url
          }}
        />
      );
    }

    return (
      <UserProfileModal
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          registrationDate: user.created_at,
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

      {renderProfileModal()}

      <EditUserModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={user.id}
      />
    </>
  )
}

