"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface InterventionModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string
  client: string
  technician: string
  description: string
}

export function InterventionModal({
  isOpen,
  onClose,
  serviceId,
  client,
  technician,
  description
}: InterventionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Intervenir Servicio #{serviceId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="p-2 bg-muted rounded-md">{client}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Técnico</Label>
            <div className="p-2 bg-muted rounded-md">{technician}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              readOnly
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Acción a tomar</Label>
            <RadioGroup defaultValue="call">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="call" id="call" />
                <Label htmlFor="call">Llamar al cliente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reassign" id="reassign" />
                <Label htmlFor="reassign">Reasignar técnico</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cancel" id="cancel" />
                <Label htmlFor="cancel">Cancelar servicio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency">Enviar equipo de emergencia</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button>Confirmar Acción</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

