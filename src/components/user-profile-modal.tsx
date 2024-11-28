'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserAvatar } from "./user-avatar"
import { UserRating } from "./user-rating"
import { User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Review {
  rating: number
  date: string
  comment: string
}

interface Service {
  id: string
  date: string
  type: string
  status: 'completado' | 'en curso'
}

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
    role: string
    phone?: string
    address?: string
    registrationDate: string
    services?: Service[]
    reviews?: Review[]
  }
}

export function UserProfileModal({ open, onOpenChange, user }: UserProfileModalProps) {
  const EmptyStateMessage = ({ message }: { message: string }) => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Correo:</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Teléfono:</h3>
                <p className="text-muted-foreground">{user.phone || 'No especificado'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Dirección:</h3>
                <p className="text-muted-foreground">{user.address || 'No especificada'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Fecha de registro:</h3>
                <p className="text-muted-foreground">{user.registrationDate}</p>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="services" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Historial de Servicios</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas y Calificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              {user.services && user.services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Servicio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.id}</TableCell>
                        <TableCell>{service.date}</TableCell>
                        <TableCell>{service.type}</TableCell>
                        <TableCell>
                          <Badge variant={service.status === 'completado' ? 'default' : 'secondary'}>
                            {service.status === 'completado' ? 'Completado' : 'En curso'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyStateMessage message="Este usuario aún no ha realizado ningún servicio." />
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {user.reviews && user.reviews.length > 0 ? (
                <div className="space-y-6">
                  {user.reviews.map((review, index) => (
                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <UserRating rating={review.rating} />
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateMessage message="Este usuario aún no tiene reseñas." />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button variant="destructive">
            Suspender Cuenta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

