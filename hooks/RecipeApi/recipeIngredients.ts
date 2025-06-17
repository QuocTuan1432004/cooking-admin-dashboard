import { authenticatedFetch } from "@/hooks/userAuth"
import type {   ApiResponse,
  RecipeIngredientsResponse,
  RecipeIngredientsCreationRequest,
  RecipeIngredientsUpdateRequest,
} from "@/hooks/RecipeApi/recipeTypes"
import { sub } from "date-fns"

const API_BASE_URL = "http://localhost:8080"

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  return response.json()
}


//create recipe ingredient
export const createRecipeIngredient = async (
  data: RecipeIngredientsCreationRequest,
): Promise<RecipeIngredientsResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeIngredients/create`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  const result: ApiResponse<RecipeIngredientsResponse> = await handleResponse(response)
  return result.result
}

//update recipe ingredient
export const updateRecipeIngredient = async (
  recipeId: string,
  ingredientId: string,
  data: RecipeIngredientsUpdateRequest,
): Promise<RecipeIngredientsResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeIngredients/update/${recipeId}/${ingredientId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  const result: ApiResponse<RecipeIngredientsResponse> = await handleResponse(response)
  return result.result
}

//get all recipe ingredients by recipe id
export const getRecipeIngredientsByRecipeId = async (recipeId: string): Promise<RecipeIngredientsResponse[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeIngredients/getAllRecipeIngredients/${recipeId}`)

  const result: ApiResponse<RecipeIngredientsResponse[]> = await handleResponse(response)
  return result.result
}

// Delete Recipe Ingredient
export const deleteRecipeIngredient = async (recipeId: string, ingredientId: string): Promise<string> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeIngredients/delete/${recipeId}/${ingredientId}`, {
    method: "DELETE",
  })

  const result: ApiResponse<string> = await handleResponse(response)
  return result.result
}
