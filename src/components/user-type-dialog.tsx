"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserCircle, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

const userTypes = [
  { name: "Administrador", icon: User },
  { name: "Cliente", icon: UserCircle },
  { name: "Tecnico", icon: Wrench },
];

interface UserTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: string) => void;
}

export default function UserTypeDialog({
  open,
  onOpenChange,
  onSelect,
}: UserTypeDialogProps) {
  const { toast } = useToast();

  const handleSelection = (type: string) => {
    if (type !== "Tecnico") {
      onOpenChange(false);
      toast({
        title: "La opción no está disponible",
        description: "Por el momento, solo se pueden crear usuarios técnicos.",
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
    onSelect(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Crear Nuevo Usuario
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 pt-4">
          {userTypes.map((type) => (
            <Card
              key={type.name}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => handleSelection(type.name)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <type.icon className="h-12 w-12 mb-2" />
                <p className="text-sm font-medium">{type.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
