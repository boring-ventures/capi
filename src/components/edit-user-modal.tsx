'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { PersonalInfoForm } from "./personal-info-form"
import { useUser, useUpdateUser } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function EditUserModal({ open, onOpenChange, userId }: EditUserModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: userData, isLoading: isLoadingUser } = useUser(userId)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  useEffect(() => {
    if (userData) {
      const [nombre = "", apellido = ""] = userData.name.split(" ", 2)
      setFormData({
        nombre,
        apellido,
        correoElectronico: userData.email,
        telefono: userData.phone,
        direccion: userData.address,
      })
    }
  }, [userData])

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }
    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es requerido"
    }
    if (!formData.correoElectronico?.trim()) {
      newErrors.correoElectronico = "El correo electrónico es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El correo electrónico no es válido"
    }
    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    if (!validatePersonalInfo()) {
      return
    }

    const userData = {
      name: `${formData.nombre} ${formData.apellido}`,
      email: formData.correoElectronico,
      phone: formData.telefono,
      address: formData.direccion,
    }

    updateUser(
      { id: userId, data: userData },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  if (isLoadingUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PersonalInfoForm 
            onChange={handleFieldChange} 
            errors={errors}
            values={formData}
          />
        </div>

        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los campos marcados con * son obligatorios.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
          >
            {isUpdating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 