"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  ExternalLink,
  Navigation,
  Copy,
  Check
} from "lucide-react";
import { type ServiceWithDetails } from "@/lib/services/actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ServiceLocationModalProps {
  service: ServiceWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceLocationModal({ 
  service, 
  open, 
  onOpenChange 
}: ServiceLocationModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  if (!service) return null;

  const { location } = service;

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copiado",
        description: `${field} copiado al portapapeles`,
      });
      
      // Reset after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación del Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del Servicio */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Servicio</h4>
                  <p className="text-sm text-gray-600">#{service.id.slice(-6)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Cliente</h4>
                  <p className="text-sm text-gray-600">{service.client.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Ubicación */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">Nombre del Lugar</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(location.name, "Nombre del lugar")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "Nombre del lugar" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{location.name}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">Dirección</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(location.address, "Dirección")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "Dirección" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">Coordenadas</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(`${location.latitude}, ${location.longitude}`, "Coordenadas")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "Coordenadas" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Mapas */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-2"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Maps
            </Button>
            
            <Button
              onClick={handleGetDirections}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Direcciones
            </Button>
          </div>

          {/* Botón Cerrar */}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 