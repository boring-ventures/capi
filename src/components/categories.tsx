"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/lib/categories/actions";
import { CategoryItem } from "./category-item";
import { AddSubcategoryDialog } from "./add-subcategory-dialog";
import { getCategories } from "@/lib/categories/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "No se pudieron cargar las categorías. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditCategory = (id: string, name: string) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, name } : category
      )
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  if (isLoading) {
    return <div>Cargando categorías...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg font-medium">No hay categorías</p>
        <p className="text-sm">Aún no se ha creado ninguna categoría</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onAddSubcategory={() => {
            setSelectedCategory(category);
            setIsAddingSubcategory(true);
          }}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      ))}

      <AddSubcategoryDialog
        open={isAddingSubcategory}
        onOpenChange={setIsAddingSubcategory}
        onAdd={(name, minimumPrice) => {
          if (selectedCategory) {
            // Handle subcategory addition
            console.log("Adding subcategory", { name, minimumPrice });
          }
        }}
      />
    </div>
  );
}
