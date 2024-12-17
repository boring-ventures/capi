'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateUserModal } from "./create-user-modal"
import UserTypeDialog from "./user-type-dialog"

export function UserManagementHeader() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)

  const handleUserTypeSelected = (type: string) => {
    if (type === 'Tecnico') {
      setIsCreateModalOpen(true)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setIsTypeDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <UserTypeDialog 
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        onSelect={handleUserTypeSelected}
      />

      <CreateUserModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  )
}

