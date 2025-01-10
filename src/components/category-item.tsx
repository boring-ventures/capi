"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/categories/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

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
              onAddSubcategory();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Subcategoría
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategoría</TableHead>
                <TableHead>Precio Mínimo</TableHead>
                <TableHead>Servicios Activos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.subcategories?.map(
                (subcategory: {
                  id: string;
                  name: string;
                  minimumPrice: number;
                  activeServices: number;
                }) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>{subcategory.name}</TableCell>
                    <TableCell>${subcategory.minimumPrice}</TableCell>
                    <TableCell>{subcategory.activeServices}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
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
    </div>
  );
}
