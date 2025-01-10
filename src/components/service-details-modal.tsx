"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react'

interface ServiceDetailsProps {
  isOpen: boolean
  onClose: () => void
  service: {
    id: string
    status: string
    category: string
    date: string
    price: number
    client: {
      name: string
      phone: string
      address: string
    }
    technician: {
      name: string
      phone: string
      rating: number
    }
    offers: {
      initial: number
      counter: number
      accepted: boolean
    }
  }
}

export function ServiceDetailsModal({ isOpen, onClose, service }: ServiceDetailsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Servicio #{service.id}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Información del Servicio</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant="secondary">{service.status}</Badge>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Categoría:</span> {service.category}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Fecha de Solicitud:</span> {service.date}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Precio Acordado:</span> ${service.price}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Técnico Asignado</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Nombre:</span> {service.technician.name}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Teléfono:</span> {service.technician.phone}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Calificación:</span>
                  <div className="flex items-center">
                    {Array.from({ length: service.technician.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Cliente</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Nombre:</span> {service.client.name}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Teléfono:</span> {service.client.phone}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Dirección:</span> {service.client.address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Historial de Ofertas</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Oferta inicial:</span> ${service.offers.initial}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Contraoferta del técnico:</span> ${service.offers.counter}
                </p>
                {service.offers.accepted && (
                  <Badge variant="secondary">Aceptada por el cliente</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="default">Reasignar Técnico</Button>
          <Button variant="destructive">Cancelar Servicio</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

