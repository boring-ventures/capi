"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createSubcategory } from "@/lib/subcategories/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AddSubcategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  onAdd: (name: string, minimumPrice: number) => void
}

export function AddSubcategoryDialog({
  open,
  onOpenChange,
  categoryId,
  onAdd,
}: AddSubcategoryDialogProps) {
  const [name, setName] = useState("")
  const [minimumPrice, setMinimumPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isValid = name.length >= 3 && Number(minimumPrice) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    try {
      await createSubcategory(categoryId, name, Number(minimumPrice))
      onAdd(name, Number(minimumPrice))
      setName("")
      setMinimumPrice("")
      onOpenChange(false)
      toast({
        title: "Subcategoría creada",
        description: "La subcategoría se ha creado exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la subcategoría. Por favor intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Subcategoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Mínimo 3 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumPrice">Precio Mínimo (Bs.)</Label>
            <Input
              id="minimumPrice"
              type="number"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              required
              disabled={isLoading}
              min="1"
              step="1"
              placeholder="Ingrese un valor mayor a 0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isLoading}
              className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

