"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { ServiceWithDetails } from "@/lib/services/actions";

export function DisputesPanel() {
  const { data: services, isLoading } = useServices();

  const disputedServices = services?.filter(
    (service) => service.status === "disputed"
  ) ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Disputas Activas</h2>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando disputas...
        </div>
      ) : disputedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputedServices.map((service) => (
            <DisputeCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No hay disputas activas
        </div>
      )}
    </div>
  );
}

interface DisputeCardProps {
  service: ServiceWithDetails;
}

function DisputeCard({ service }: DisputeCardProps) {
  return (
    <Card className="bg-yellow-50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <div>
            <h3 className="font-semibold">
              Disputa en Servicio #{service.id.slice(0, 4)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Cliente: {service.client.name} | Técnico: {service.technician?.name ?? "Sin asignar"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {}}
        >
          Gestionar
        </Button>
      </CardContent>
    </Card>
  );
}

