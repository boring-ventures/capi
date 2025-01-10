import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, PenToolIcon as Tool } from 'lucide-react'

interface ServiceCardProps {
  id: string
  status: string
  client: string
  technician: string
  category: string
  price: number
  onViewDetails: (id: string) => void
  onIntervene: (id: string) => void
}

export function ServiceCard({
  id,
  status,
  client,
  technician,
  category,
  price,
  onViewDetails,
  onIntervene,
}: ServiceCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold">Servicio #{id}</h3>
              <Badge variant="secondary" className="bg-gray-900 text-white">
                {status}
              </Badge>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span>{client}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Técnico:</span>
              <span>{technician}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Categoría:</span>
              <span>{category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Precio:</span>
              <span>${price}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t p-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetails(id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalles
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onIntervene(id)}
        >
          <Tool className="mr-2 h-4 w-4" />
          Intervenir
        </Button>
      </CardFooter>
    </Card>
  )
}

