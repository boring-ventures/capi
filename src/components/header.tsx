import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

export function UserManagementHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
      </Button>
    </div>
  )
}

