import { SubCategory } from "../categoryApi/types"

// Base API Response
export interface ApiResponse<T> {
  code?: number
  message?: string
  result: T
}

// Recipe Types
export interface Recipe {
  id: string
  title: string
  description: string
  img?: string
  cookingTime: string
  difficulty: string
  totalLikes: number
  createAt: string
  status: string
  subCategory?: SubCategory
  account?: Account
}

export interface RecipeResponse {
  id: string
  title: string
  description: string
  img?: string
  cookingTime: string
  difficulty: string
  totalLikes: number
  createAt: string
  status: string
  subCategoryName?: string
  accountName?: string
}

export interface RecipeCreationRequest {
  title: string
  description: string
  difficulty: string
  cookingTime: string
}

export interface RecipeUpdateRequest {
  title: string
  description: string
  difficulty: string
  cookingTime: string
  subCategoryId: string
}

// Ingredients Types
export interface Ingredient {
  id: string
  ingredientName: string
  caloriesPerUnit: string
}

export interface IngredientsResponse {
  id: string
  ingredientName: string
  caloriesPerUnit: string
}

export interface IngredientsCreationRequest {
  ingredientName: string
  caloriesPerUnit: string
}

export interface IngredientsUpdateRequest {
  ingredientName: string
  caloriesPerUnit: string
}

// Recipe Ingredients Types
export interface RecipeIngredients {
  id: string
  recipe: Recipe
  ingredient: Ingredient
  quantity: number
}

export interface RecipeIngredientsResponse {
  id: string
  recipeName: string
  ingredientName: string
  quantity: number
}

export interface RecipeIngredientsCreationRequest {
  recipeId: string
  ingredientId: string
  quantity: number
}

export interface RecipeIngredientsUpdateRequest {
  ingredientId: string
  quantity: number
}

// Recipe Steps Types
export interface RecipeSteps {
  id: string
  step: number
  recipe: Recipe
  description: string
  waitingTime?: string
  recipeStepsImg?: string
}

export interface RecipeStepsResponse {
  id: string
  step: number
  recipeName: string
  description: string
  waitingTime?: string
  recipeStepsImg?: string
}

export interface RecipeStepsCreationRequest {
  step: number
  description: string
  waitingTime?: string
}

export interface RecipeStepsUpdateRequest {
  step: number
  description: string
  waitingTime?: string
}

// Account Types
export interface Account {
  id: string
  username?: string
  email?: string
  // Add other account fields as needed
}

// Pagination Types
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
