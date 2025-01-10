"use client"

import { useState } from "react"
import { Categories } from "@/components/categories"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { AddCategoryDialog } from "@/components/add-category-dialog"

const initialCategories = [
  {
    id: "1",
    name: "Electricidad",
    subcategories: [
      {
        id: "1-1",
        name: "Instalaciones",
        minimumPrice: 50,
        activeServices: 12,
      },
      {
        id: "1-2",
        name: "Reparaciones",
        minimumPrice: 30,
        activeServices: 8,
      },
    ],
  },
  {
    id: "2",
    name: "Plomería",
    subcategories: [],
  },
]

export default function ServicesPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const handleAddCategory = (name: string, minimumPrice: number) => {
    const newCategory = {
      id: Math.random().toString(),
      name,
      subcategories: [],
    }
    setCategories([...categories, newCategory])
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías y Subcategorías</h1>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Categoría
        </Button>
      </div>
      <Categories initialCategories={categories} />
      
      <AddCategoryDialog
        open={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        onAdd={handleAddCategory}
      />
    </div>
  )
} 