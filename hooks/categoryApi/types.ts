// lib/types.ts
export interface MainCategory {
  id: string;
  categoryName: string;
  categoryImg?: string; // Optional, not always present
}

export interface SubCategory {
  id: string;
  categoryId: string;
  subCategoryName: string;
  subCategoryImg?: string;
}

export interface Category {
  id: string;
  name: string; // Maps to categoryName (main) or subCategoryName (sub)
  description?: string; // Only for main categories (not in entity, but kept for compatibility)
  parentId?: string; // Maps to mainCategory.id for subcategories
  children?: Category[]; // Subcategories
  image?: string; // Maps to subCategoryImg for subcategories
}