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
import { updateCategory } from "@/lib/categories/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import type { Category } from "@/lib/categories/actions";
import { uploadCategoryLogo } from "@/utils/storage-utils";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onEdit: (id: string, name: string) => void;
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onEdit,
}: EditCategoryDialogProps) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setPreviewUrl(category.image_url || "");
    }
  }, [category]);

  const isValid = name.length >= 3 && category && (name !== category.name || imageFile);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !category) return;

    setIsLoading(true);
    try {
      let finalImageUrl = category.image_url;

      // Si hay una nueva imagen, subirla
      if (imageFile) {
        const uploadedUrl = await uploadCategoryLogo(imageFile, category.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      await updateCategory(category.id, name, finalImageUrl);
      onEdit(category.id, name);
      onOpenChange(false);
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría. Por favor intente nuevamente.",
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
          <DialogTitle>Editar Categoría</DialogTitle>
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
            <Label htmlFor="image">Logo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                disabled={isLoading}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                {previewUrl ? "Cambiar Logo" : "Subir Logo"}
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeImage}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {previewUrl && (
              <div className="relative w-full h-40 mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            )}
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