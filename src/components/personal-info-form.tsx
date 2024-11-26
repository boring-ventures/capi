import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface PersonalInfoFormProps {
  onChange: (field: string, value: string | File) => void
  errors?: Record<string, string>
  values?: Record<string, any>
}

export function PersonalInfoForm({ onChange, errors = {}, values = {} }: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            placeholder="Juan"
            value={values.nombre || ''}
            onChange={(e) => onChange('nombre', e.target.value)}
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            placeholder="Pérez"
            value={values.apellido || ''}
            onChange={(e) => onChange('apellido', e.target.value)}
            className={errors.apellido ? 'border-red-500' : ''}
          />
          {errors.apellido && (
            <p className="text-sm text-red-500">{errors.apellido}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
        <Input
          id="correoElectronico"
          type="email"
          placeholder="juan.perez@ejemplo.com"
          value={values.correoElectronico || ''}
          onChange={(e) => onChange('correoElectronico', e.target.value)}
          className={errors.correoElectronico ? 'border-red-500' : ''}
        />
        {errors.correoElectronico && (
          <p className="text-sm text-red-500">{errors.correoElectronico}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          type="tel"
          placeholder="+591 12345678"
          value={values.telefono || ''}
          onChange={(e) => onChange('telefono', e.target.value)}
          className={errors.telefono ? 'border-red-500' : ''}
        />
        {errors.telefono && (
          <p className="text-sm text-red-500">{errors.telefono}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          placeholder="Calle 123, Ciudad, Departamento"
          value={values.direccion || ''}
          onChange={(e) => onChange('direccion', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fotoPerfil">Foto de Perfil</Label>
        <div className="flex items-center gap-2">
          <Input
            id="fotoPerfil"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onChange('fotoPerfil', e.target.files[0])
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('fotoPerfil')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Foto
          </Button>
          <span className="text-sm text-muted-foreground">
            {values.fotoPerfil?.name || 'Ningún archivo seleccionado'}
          </span>
        </div>
      </div>
    </div>
  )
}

