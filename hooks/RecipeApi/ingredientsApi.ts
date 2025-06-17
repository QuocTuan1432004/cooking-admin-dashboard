import { authenticatedFetch } from "@/hooks/userAuth"
import type {
  ApiResponse,
  Ingredient,
  IngredientsResponse,
  IngredientsCreationRequest,
  IngredientsUpdateRequest, } from "@/hooks/RecipeApi/recipeTypes"

const API_BASE_URL = "http://localhost:8080"


const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  return response.json()
}

// Create Ingredient
export const createIngredient = async (data: IngredientsCreationRequest): Promise<IngredientsResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/ingredients/create`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  const result: ApiResponse<IngredientsResponse> = await handleResponse(response)
  return result.result
}

// Update Ingredient
export const updateIngredient = async (id: string, data: IngredientsUpdateRequest): Promise<IngredientsResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/ingredients/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  const result: ApiResponse<IngredientsResponse> = await handleResponse(response)
  return result.result
}

// Get All Ingredients
export const getAllIngredients = async (): Promise<Ingredient[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/ingredients/getAll`)

  const result: ApiResponse<Ingredient[]> = await handleResponse(response)
  return result.result
}

// Delete Ingredient
export const deleteIngredient = async (id: string): Promise<string> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/ingredients/delete/${id}`, {
    method: "DELETE",
  })

  const result: ApiResponse<string> = await handleResponse(response)
  return result.result
}
