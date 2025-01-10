"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/categories/actions";
import type { Subcategory } from "@/lib/subcategories/actions";
import { Button } from "@/components/ui/button";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { AddSubcategoryDialog } from "./add-subcategory-dialog";
import { SubcategoriesTable } from "./subcategories-table";
import { getSubcategories } from "@/lib/subcategories/actions";
import { useToast } from "@/hooks/use-toast";

interface CategoryItemProps {
  category: Category;
  onAddSubcategory: () => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryItem({
  category,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubcategories = async () => {
    if (!isExpanded) return;
    
    setIsLoading(true);
    try {
      const data = await getSubcategories(category.id);
      setSubcategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, [isExpanded, category.id]);

  const handleEditSubcategory = (id: string, name: string, minimumPrice: number) => {
    setSubcategories(subcategories.map(subcategory =>
      subcategory.id === id ? { ...subcategory, name, minimumPrice } : subcategory
    ));
  };

  const handleDeleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(subcategory => subcategory.id !== id));
  };

  const handleAddSubcategory = (name: string, minimumPrice: number) => {
    fetchSubcategories(); // Refresh the list after adding
  };

  return (
    <div className="rounded-lg border">
      <div
        className="flex cursor-pointer items-center justify-between p-4 hover:bg-accent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingSubcategory(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Subcategoría
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Cargando subcategorías...
            </div>
          ) : (
            <SubcategoriesTable
              subcategories={subcategories}
              onEdit={handleEditSubcategory}
              onDelete={handleDeleteSubcategory}
            />
          )}
        </div>
      )}

      <EditCategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={category}
        onEdit={onEditCategory}
      />

      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={category}
        onDelete={onDeleteCategory}
      />

      <AddSubcategoryDialog
        open={isAddingSubcategory}
        onOpenChange={setIsAddingSubcategory}
        categoryId={category.id}
        onAdd={handleAddSubcategory}
      />
    </div>
  );
}
