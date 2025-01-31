import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PersonalInfoFormProps {
  onChange: (field: string, value: string | File | null) => void;
  errors?: Record<string, string>;
  values?: Record<string, any>;
  validatePersonalInfo: () => boolean;
}

export function PersonalInfoForm({
  onChange,
  errors = {},
  values = {},
  validatePersonalInfo,
}: PersonalInfoFormProps) {
  const handleImageDelete = () => {
    onChange("fotoPerfil", null);
  };

  const imagePreview =
    values.fotoPerfil instanceof File
      ? URL.createObjectURL(values.fotoPerfil)
      : null;

  const handleFieldChange = (field: string, value: string | File | null) => {
    onChange(field, value);
    // Validar inmediatamente después de actualizar los datos
    setTimeout(() => validatePersonalInfo(), 0);
  };

  return (
    <ScrollArea className="h-[80vh] overflow-y-auto">
      <div className="space-y-2 p-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Juan"
              value={values.nombre || ""}
              onChange={(e) => handleFieldChange("nombre", e.target.value)}
              className={errors.nombre ? "border-red-500" : ""}
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
              value={values.apellido || ""}
              onChange={(e) => handleFieldChange("apellido", e.target.value)}
              className={errors.apellido ? "border-red-500" : ""}
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
            value={values.correoElectronico || ""}
            onChange={(e) =>
              handleFieldChange("correoElectronico", e.target.value)
            }
            className={errors.correoElectronico ? "border-red-500" : ""}
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
            value={values.telefono || ""}
            onChange={(e) => handleFieldChange("telefono", e.target.value)}
            className={errors.telefono ? "border-red-500" : ""}
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
            value={values.direccion || ""}
            onChange={(e) => handleFieldChange("direccion", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={values.fechaNacimiento || ""}
            onChange={(e) => handleFieldChange("fechaNacimiento", e.target.value)}
            className={errors.fechaNacimiento ? "border-red-500" : ""}
          />
          {errors.fechaNacimiento && (
            <p className="text-sm text-red-500">{errors.fechaNacimiento}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fotoPerfil">Foto de Perfil</Label>
          <div className="flex items-start gap-4">
            <div className="flex">
              <Input
                id="fotoPerfil"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFieldChange("fotoPerfil", e.target.files[0]);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("fotoPerfil")?.click()}
                >
                  {values.fotoPerfil ? (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Foto
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Foto
                    </>
                  )}
                </Button>
                {!imagePreview && (
                  <span className="text-sm text-muted-foreground">
                    Ningún archivo seleccionado
                  </span>
                )}
              </div>
            </div>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-[150px] h-[150px] object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
                  onClick={handleImageDelete}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
