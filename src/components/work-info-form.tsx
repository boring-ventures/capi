import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkArea } from "./types"

interface WorkInfoFormProps {
  onChange: (field: string, value: string | number) => void;
  values?: Record<string, any>;
}

export function WorkInfoForm({ onChange, values = {} }: WorkInfoFormProps) {
  const workAreas: { value: WorkArea; label: string }[] = [
    { value: 'plomeria', label: 'Plomería' },
    { value: 'electricidad', label: 'Electricidad' },
    { value: 'carpinteria', label: 'Carpintería' },
    { value: 'pintura', label: 'Pintura' },
    { value: 'limpieza', label: 'Limpieza' },
  ]

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
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar área de trabajo" />
          </SelectTrigger>
          <SelectContent>
            {workAreas.map((area) => (
              <SelectItem key={area.value} value={area.value}>
                {area.label}
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

