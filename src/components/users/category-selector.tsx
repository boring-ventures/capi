"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  image_url?: string;
  technician_count?: number;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategorySelector({ categories, selectedCategories, onCategoriesChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedCategories);

  const handleToggle = (categoryId: string) => {
    setSelected(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const handleSave = () => {
    onCategoriesChange(selected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Filter className="h-4 w-4 mr-2" />
          Categorías
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Categorías</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`
                  relative rounded-lg border p-4 cursor-pointer transition-colors
                  ${selected.includes(category.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"}
                `}
                onClick={() => handleToggle(category.id)}
              >
                <div className="absolute top-2 right-2">
                  <Checkbox
                    checked={selected.includes(category.id)}
                    onCheckedChange={() => handleToggle(category.id)}
                  />
                </div>
                <div className="space-y-3">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-md"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground">Sin imagen</span>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">{category.name}</Label>
                    {category.technician_count !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.technician_count} técnico{category.technician_count !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Aplicar ({selected.length} seleccionada{selected.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 