"use client";

import { useState } from "react";
import { Category } from "@/types/category";
import { CategoryItem } from "./category-item";
import { AddCategoryDialog } from "./add-category-dialog";
import { AddSubcategoryDialog } from "./add-subcategory-dialog";

interface CategoriesProps {
  initialCategories: Category[];
}

export function Categories({ initialCategories }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: Math.random().toString(),
      name,
      subcategories: [],
    };
    setCategories([...categories, newCategory]);
  };

  const handleAddSubcategory = (
    categoryId: string,
    name: string,
    minimumPrice: number
  ) => {
    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: [
              ...category.subcategories,
              {
                id: Math.random().toString(),
                name,
                minimumPrice,
                activeServices: 0,
              },
            ],
          };
        }
        return category;
      })
    );
  };

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
        />
      ))}

      <AddCategoryDialog
        open={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        onAdd={handleAddCategory}
      />

      <AddSubcategoryDialog
        open={isAddingSubcategory}
        onOpenChange={setIsAddingSubcategory}
        onAdd={(name, minimumPrice) => {
          if (selectedCategory) {
            handleAddSubcategory(selectedCategory.id, name, minimumPrice);
          }
        }}
      />
    </div>
  );
}
