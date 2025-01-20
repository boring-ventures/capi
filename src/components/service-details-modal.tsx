"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { LocationDialog } from "./location-dialog";
import { CancelServiceDialog } from "./cancel-service-dialog";
import type { ServiceWithDetails } from "@/lib/services/actions";

const serviceStatusMap = {
  created: { label: "Creado", variant: "secondary" },
  in_progress: { label: "En Progreso", variant: "default" },
  completed: { label: "Completado", variant: "success" },
  canceled: { label: "Cancelado", variant: "destructive" },
  disputed: { label: "En Disputa", variant: "warning" },
} as const;

interface ServiceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceWithDetails;
}

export function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
}: ServiceDetailsProps) {
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalles del Servicio #{service.id.slice(0, 4)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Información del Servicio</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Estado:
                    </span>
                    <Badge
                      variant={serviceStatusMap[service.status].variant as any}
                    >
                      {serviceStatusMap[service.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Categoría:</span>{" "}
                    {service.category.name}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Subcategoría:</span>{" "}
                    {service.subcategory.name}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      Fecha de Solicitud:
                    </span>{" "}
                    {formatDate(service.request_date)}
                  </p>
                  {service.acceptance_date && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Fecha de Aceptación:
                      </span>{" "}
                      {formatDate(service.acceptance_date)}
                    </p>
                  )}
                  {service.agreed_price && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Precio Acordado:
                      </span>{" "}
                      {service.agreed_price} Bs.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setIsLocationDialogOpen(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Ver Detalles y Ubicación
                  </Button>
                </div>
              </div>

              {service.technician && (
                <div>
                  <h3 className="font-semibold mb-2">Técnico Asignado</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Nombre:</span>{" "}
                      {service.technician.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Correo:</span>{" "}
                      {service.technician.email}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Teléfono:</span>{" "}
                      {service.technician.phone}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        Calificación:
                      </span>
                      <div className="flex items-center">
                        {Array.from({
                          length: Math.round(service.technician.rating),
                        }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Cliente</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Nombre:</span>{" "}
                    {service.client.name}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Correo:</span>{" "}
                    {service.client.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Teléfono:</span>{" "}
                    {service.client.phone}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Calificación:
                    </span>
                    <div className="flex items-center">
                      {Array.from({
                        length: Math.round(service.client.rating),
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={service.status === "canceled"}
            >
              Cancelar Servicio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        address={service.location.address}
        latitude={service.location.latitude}
        longitude={service.location.longitude}
        serviceDetails={service.description}
        images={service.images.map((img) => img.image_url)}
      />

      <CancelServiceDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        serviceId={service.id}
      />
    </>
  );
}
