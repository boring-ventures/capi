"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import type { Subcategory } from "@/lib/subcategories/actions";
import { EditSubcategoryDialog } from "./edit-subcategory-dialog";
import { DeleteSubcategoryDialog } from "./delete-subcategory-dialog";

interface SubcategoriesTableProps {
  subcategories: Subcategory[];
  onEdit: (id: string, name: string, minimumPrice: number) => void;
  onDelete: (id: string) => void;
}

export function SubcategoriesTable({
  subcategories,
  onEdit,
  onDelete,
}: SubcategoriesTableProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (subcategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg font-medium">No hay subcategorías</p>
        <p className="text-sm">Aún no se ha creado ninguna subcategoría</p>
      </div>
    );
  }

  return (
    <>
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
          {subcategories.map((subcategory) => (
            <TableRow key={subcategory.id}>
              <TableCell>{subcategory.name}</TableCell>
              <TableCell>{subcategory.minimumPrice} Bs.</TableCell>
              <TableCell>{subcategory.activeServices}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSubcategory(subcategory);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSubcategory(subcategory);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditSubcategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subcategory={selectedSubcategory}
        onEdit={onEdit}
      />

      <DeleteSubcategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        subcategory={selectedSubcategory}
        onDelete={onDelete}
      />
    </>
  );
} 