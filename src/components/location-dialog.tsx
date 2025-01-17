"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  latitude: number;
  longitude: number;
  serviceDetails: string;
  images: string[];
}

export function LocationDialog({
  open,
  onOpenChange,
  address,
  latitude,
  longitude,
  serviceDetails,
  images,
}: LocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de ubicación</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Dirección:</h3>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Ubicación:</h3>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver en Google Maps
            </a>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Detalles del servicio:</h3>
            <p className="text-sm text-muted-foreground">
              {serviceDetails.length > 200
                ? `${serviceDetails.slice(0, 197)}...`
                : serviceDetails}
            </p>
          </div>

          {images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Imágenes adjuntas:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
