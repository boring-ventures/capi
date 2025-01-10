"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCategories } from "@/lib/categories/actions"
import type { Category } from "@/lib/categories/actions"
import { useToast } from "@/hooks/use-toast"

interface WorkInfoFormProps {
  onChange: (field: string, value: string | number) => void;
  values?: Record<string, any>;
}

export function WorkInfoForm({ onChange, values = {} }: WorkInfoFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías. Por favor intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  const accountTypes = [
    { value: 'ahorro', label: 'Cuenta de Ahorro' },
    { value: 'corriente', label: 'Cuenta Corriente' },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="areaTrabajo">Área de Trabajo</Label>
        <Select 
          onValueChange={(value) => onChange('areaTrabajo', value)}
          defaultValue={values.areaTrabajo}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Cargando categorías..." : "Seleccionar área de trabajo"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="anosExperiencia">Años de Experiencia</Label>
        <Input
          id="anosExperiencia"
          type="number"
          min="0"
          placeholder="5"
          value={values.anosExperiencia || ''}
          onChange={(e) => onChange('anosExperiencia', parseInt(e.target.value, 10))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombreBanco">Nombre del Banco</Label>
        <Input
          id="nombreBanco"
          placeholder="Banco Nacional"
          value={values.nombreBanco || ''}
          onChange={(e) => onChange('nombreBanco', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroCuenta">Número de Cuenta</Label>
        <Input
          id="numeroCuenta"
          placeholder="1234567890"
          type="number"
          value={values.numeroCuenta || ''}
          onChange={(e) => onChange('numeroCuenta', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoCuenta">Tipo de Cuenta</Label>
        <Select 
          onValueChange={(value) => onChange('tipoCuenta', value)}
          defaultValue={values.tipoCuenta}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

