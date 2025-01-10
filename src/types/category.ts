export interface Subcategory {
  id: string
  name: string
  minimumPrice: number
  activeServices: number
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
} 