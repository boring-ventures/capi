type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const serviceStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: {
    label: "Pendiente",
    variant: "secondary",
  },
  accepted: {
    label: "Aceptado",
    variant: "default",
  },
  in_progress: {
    label: "En Progreso",
    variant: "secondary",
  },
  completed: {
    label: "Completado",
    variant: "default",
  },
  canceled: {
    label: "Cancelado",
    variant: "destructive",
  },
  disputed: {
    label: "En Disputa",
    variant: "outline",
  },
}; 