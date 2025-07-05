"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

export interface Column {
  id: string;
  label: string;
  required?: boolean;
}

interface ColumnManagerProps {
  columns: Column[];
  visibleColumns: string[];
  onColumnChange: (columns: string[]) => void;
}

export function ColumnManager({ columns, visibleColumns, onColumnChange }: ColumnManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(visibleColumns);

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    let newColumns: string[];
    if (checked) {
      newColumns = [...selectedColumns, columnId];
    } else {
      newColumns = selectedColumns.filter(id => id !== columnId);
    }
    setSelectedColumns(newColumns);
  };

  const handleSave = () => {
    onColumnChange(selectedColumns);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings2 className="h-4 w-4 mr-2" />
          Columnas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestionar Columnas</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={(checked) => handleColumnToggle(column.id, checked as boolean)}
                  disabled={column.required}
                />
                <Label htmlFor={column.id} className="flex-1">
                  {column.label}
                  {column.required && (
                    <span className="text-xs text-muted-foreground ml-2">(Requerido)</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 