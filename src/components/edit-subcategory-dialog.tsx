"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSubcategory } from "@/lib/subcategories/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Subcategory } from "@/lib/subcategories/actions";

interface EditSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategory: Subcategory | null;
  onEdit: (id: string, name: string, minimumPrice: number) => void;
}

export function EditSubcategoryDialog({
  open,
  onOpenChange,
  subcategory,
  onEdit,
}: EditSubcategoryDialogProps) {
  const [name, setName] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setMinimumPrice(subcategory.minimumPrice.toString());
    }
  }, [subcategory]);

  const isValid = name.length >= 3 && 
    Number(minimumPrice) > 0 && 
    subcategory && 
    (name !== subcategory.name || Number(minimumPrice) !== subcategory.minimumPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !subcategory) return;

    setIsLoading(true);
    try {
      await updateSubcategory(subcategory.id, name, Number(minimumPrice));
      onEdit(subcategory.id, name, Number(minimumPrice));
      onOpenChange(false);
      toast({
        title: "Subcategoría actualizada",
        description: "La subcategoría se ha actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la subcategoría. Por favor intente nuevamente.",
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
          <DialogTitle>Editar Subcategoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Mínimo 3 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumPrice">Precio Mínimo (Bs.)</Label>
            <Input
              id="minimumPrice"
              type="number"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              required
              disabled={isLoading}
              min="1"
              step="1"
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
              disabled={!isValid || isLoading}
              className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 