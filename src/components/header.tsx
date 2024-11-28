'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateUserModal } from "./create-user-modal"

export function UserManagementHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <CreateUserModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}

