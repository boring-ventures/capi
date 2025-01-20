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
import { deleteCategory } from "@/lib/categories/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Category } from "@/lib/categories/actions";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onDelete: (id: string) => void;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onDelete,
}: DeleteCategoryDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isValid = category && confirmName === category.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !category) return;

    setIsLoading(true);
    try {
      await deleteCategory(category.id);
      onDelete(category.id);
      onOpenChange(false);
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría. Por favor intente nuevamente.",
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
          <DialogTitle>Eliminar Categoría</DialogTitle>
          <DialogDescription className="text-red-500">
            ¡Atención! Esta acción es irreversible. Para confirmar, escriba el nombre de la categoría: {category?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmName">Nombre de la categoría</Label>
            <Input
              id="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Escriba el nombre exacto de la categoría"
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