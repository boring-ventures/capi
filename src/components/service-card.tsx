import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { serviceStatusMap } from "@/lib/services/utils";

interface ServiceCardProps {
  id: string;
  status: string;
  client: string;
  technician: string;
  category: string;
  price: number;
  onViewDetails: (id: string) => void;
}

export function ServiceCard({
  id,
  status,
  client,
  technician,
  category,
  price,
  onViewDetails,
}: ServiceCardProps) {
  const { label, variant } = serviceStatusMap[status] || {
    label: status,
    variant: "default",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              Servicio #{id.slice(0, 4)}
            </h3>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categoría:</span>
            <span className="font-medium">{category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Técnico:</span>
            <span className="font-medium">{technician}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-medium">{client}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio:</span>
            <span className="font-medium">Bs. {price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewDetails(id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
