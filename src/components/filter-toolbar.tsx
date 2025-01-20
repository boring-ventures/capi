"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from 'lucide-react'
import { serviceStatusMap } from "@/lib/services/utils"

interface FilterToolbarProps {
  onFilterChange: (status: string) => void
  onFilterClick: () => void
}

export function FilterToolbar({ onFilterChange, onFilterClick }: FilterToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceStatusMap).map(([key, { label, variant }]) => (
          <Badge
            key={key}
            variant={variant}
            className="cursor-pointer hover:opacity-80"
            onClick={() => onFilterChange(key)}
          >
            {label}
          </Badge>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onFilterClick}>
        <Filter className="mr-2 h-4 w-4" />
        Filtros
      </Button>
    </div>
  )
}

