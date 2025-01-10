"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react'
import { Category } from "@/types/category"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CategoryItemProps {
  category: Category
  onAddSubcategory: () => void
}

export function CategoryItem({ category, onAddSubcategory }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation()
          onAddSubcategory()
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Subcategoría
        </Button>
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
              {category.subcategories.map((subcategory) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

