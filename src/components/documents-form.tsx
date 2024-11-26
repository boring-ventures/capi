import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface DocumentsFormProps {
  onChange: (field: string, value: File | File[]) => void
}

export function DocumentsForm({ onChange }: DocumentsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="carnetIdentidad">Carnet de Identidad (Foto)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="carnetIdentidad"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onChange('carnetIdentidad', e.target.files[0])
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('carnetIdentidad')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Foto de CI
          </Button>
          <span className="text-sm text-muted-foreground">
            Ningún archivo seleccionado
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="facturaLuz">Factura de Luz (Comprobante de Domicilio)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="facturaLuz"
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onChange('facturaLuz', e.target.files[0])
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('facturaLuz')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Factura
          </Button>
          <span className="text-sm text-muted-foreground">
            Ningún archivo seleccionado
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificaciones">Certificaciones o Licencias</Label>
        <div className="flex items-center gap-2">
          <Input
            id="certificaciones"
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                onChange('certificaciones', Array.from(e.target.files))
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('certificaciones')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Certificaciones
          </Button>
          <span className="text-sm text-muted-foreground">
            Ningún archivo seleccionado
          </span>
        </div>
      </div>
    </div>
  )
}

