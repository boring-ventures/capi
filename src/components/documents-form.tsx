import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentsFormProps {
  onChange: (field: string, value: File | File[] | null) => void;
  values: Record<string, any>;
}

export function DocumentsForm({ onChange, values }: DocumentsFormProps) {
  const handleDelete = (field: string) => {
    onChange(field, null);
  };

  const handleDeleteCertification = (index: number) => {
    if (Array.isArray(values.certificaciones)) {
      const newCertificaciones = values.certificaciones.filter(
        (_: any, i: number) => i !== index
      );
      onChange(
        "certificaciones",
        newCertificaciones.length > 0 ? newCertificaciones : null
      );
    }
  };

  const getImagePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    // Para archivos PDF, podrías retornar un ícono o imagen por defecto
    return '/pdf-icon.png'; // Asegúrate de tener este archivo en tu carpeta public
  };

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6 p-2">
        <div className="space-y-4">
          <Label>Carnet de Identidad</Label>
          <div className="grid grid-cols-2 gap-4">
            {/* Anverso */}
            <div className="space-y-2">
              <div className="box items-start gap-4">
                <div className="flex-1 mb-2">
                  <Input
                    id="carnetIdentidadAnverso"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onChange("carnetIdentidadAnverso", e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("carnetIdentidadAnverso")?.click()
                    }
                  >
                    {values.carnetIdentidadAnverso ? (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Anverso
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Anverso
                      </>
                    )}
                  </Button>
                </div>
                {values.carnetIdentidadAnverso && (
                  <div className="flex items-center gap-4">
                    <img
                      src={getImagePreview(values.carnetIdentidadAnverso)}
                      alt="Anverso CI"
                      className="w-[200px] h-[120px] object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
                      onClick={() => handleDelete("carnetIdentidadAnverso")}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Reverso */}
            <div className="space-y-2">
              <div className="box items-start gap-4">
                <div className="flex-1 mb-2">
                  <Input
                    id="carnetIdentidadReverso"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onChange("carnetIdentidadReverso", e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("carnetIdentidadReverso")?.click()
                    }
                  >
                    {values.carnetIdentidadReverso ? (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Reverso
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Reverso
                      </>
                    )}
                  </Button>
                </div>
                {values.carnetIdentidadReverso && (
                  <div className="flex items-center gap-4">
                    <img
                      src={getImagePreview(values.carnetIdentidadReverso)}
                      alt="Reverso CI"
                      className="w-[200px] h-[120px] object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
                      onClick={() => handleDelete("carnetIdentidadReverso")}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facturaLuz">
            Factura de Luz (Comprobante de Domicilio)
          </Label>
          <div className="box items-start gap-4">
            <div className="flex-1 mb-2">
              <Input
                id="facturaLuz"
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onChange("facturaLuz", e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("facturaLuz")?.click()}
              >
                {values.facturaLuz ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar Factura
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Factura
                  </>
                )}
              </Button>
            </div>
            {values.facturaLuz && (
              <div className="flex items-center gap-4">
                <img
                  src={getImagePreview(values.facturaLuz)}
                  alt="Factura"
                  className="w-[90%] h-[220px] object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
                  onClick={() => handleDelete("facturaLuz")}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="certificaciones">Certificaciones o Licencias</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                id="certificaciones"
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    const currentFiles = Array.isArray(values.certificaciones)
                      ? values.certificaciones
                      : [];
                    onChange("certificaciones", [...currentFiles, ...newFiles]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("certificaciones")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Añadir Certificaciones
              </Button>
            </div>

            {Array.isArray(values.certificaciones) &&
              values.certificaciones.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {values.certificaciones.map((file: File, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={getImagePreview(file)}
                        alt={`Certificación ${index + 1}`}
                        className="w-[90%] h-[220px] object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDeleteCertification(index)}
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
