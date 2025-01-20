"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { deleteSubcategory } from "@/lib/subcategories/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Subcategory } from "@/lib/subcategories/actions";

interface DeleteSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategory: Subcategory | null;
  onDelete: (id: string) => void;
}

export function DeleteSubcategoryDialog({
  open,
  onOpenChange,
  subcategory,
  onDelete,
}: DeleteSubcategoryDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isValid = subcategory && confirmName === subcategory.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !subcategory) return;

    setIsLoading(true);
    try {
      await deleteSubcategory(subcategory.id);
      onDelete(subcategory.id);
      onOpenChange(false);
      toast({
        title: "Subcategoría eliminada",
        description: "La subcategoría se ha eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Subcategoría</DialogTitle>
          <DialogDescription className="text-red-500">
            ¡Atención! Esta acción es irreversible. Para confirmar, escriba el nombre de la subcategoría: {subcategory?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmName">Nombre de la subcategoría</Label>
            <Input
              id="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Escriba el nombre exacto de la subcategoría"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={!isValid || isLoading}
              className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 