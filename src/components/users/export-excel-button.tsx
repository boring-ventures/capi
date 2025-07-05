"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { type User, type Column } from "@/types/user";

interface ExportExcelButtonProps {
  users: User[];
  visibleColumns: string[];
  columns: Column[];
}

export function ExportExcelButton({ users, visibleColumns, columns }: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Prepare headers based on visible columns
      const headers = columns
        .filter(col => visibleColumns.includes(col.id))
        .map(col => col.label);

      // Prepare data rows
      const data = users.map(user => {
        const row: Record<string, any> = {};
        
        visibleColumns.forEach((colId) => {
          const column = columns.find(col => col.id === colId);
          if (!column) return;

          switch (colId) {
            case "name":
              row[column.label] = user.name;
              break;
            case "email":
              row[column.label] = user.email;
              break;
            case "phone":
              row[column.label] = user.phone || "N/A";
              break;
            case "role":
              row[column.label] = user.role === "technician" ? "Técnico" : "Cliente";
              break;
            case "status":
              row[column.label] = user.status === "active" ? "Activo" : "Inactivo";
              break;
            case "reviewStatus":
              if (user.role === "technician") {
                const statusMap: Record<string, string> = {
                  pending: "Pendiente",
                  approved: "Aprobado",
                  accepted: "Aceptado",
                  rejected: "Rechazado"
                };
                row[column.label] = user.reviewStatus ? statusMap[user.reviewStatus] : "N/A";
              } else {
                row[column.label] = "N/A";
              }
              break;
            case "rating":
              row[column.label] = user.rating || 0;
              break;
            case "categories":
              row[column.label] = user.categories?.join(", ") || "N/A";
              break;
            case "created_at":
              row[column.label] = new Date(user.created_at).toLocaleDateString();
              break;
            default:
              row[column.label] = "N/A";
          }
        });

        return row;
      });

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

      // Generate file name with current date
      const date = new Date().toISOString().split("T")[0];
      const fileName = `usuarios_${date}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exportando..." : "Exportar Excel"}
    </Button>
  );
} 