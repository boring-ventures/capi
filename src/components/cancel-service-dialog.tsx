"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUpdateServiceStatus } from "@/hooks/useServices";

interface CancelServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
}

export function CancelServiceDialog({
  open,
  onOpenChange,
  serviceId,
}: CancelServiceDialogProps) {
  const updateStatus = useUpdateServiceStatus();

  const handleCancel = async () => {
    await updateStatus.mutateAsync({
      id: serviceId,
      status: "canceled",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Servicio</DialogTitle>
          <DialogDescription className="text-red-500">
            ¡Atención! Esta acción es irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Solo debe cancelar el servicio por uno de los siguientes motivos:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Petición del cliente</li>
            <li>Petición del técnico</li>
            <li>Resolución de una disputa</li>
          </ul>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateStatus.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 