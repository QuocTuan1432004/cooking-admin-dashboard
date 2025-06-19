import { authenticatedFetch } from "@/hooks/userAuth"
import type { ApiResponse, RecipeStepsResponse, RecipeStepsCreationRequest, RecipeStepsUpdateRequest } from "@/hooks/RecipeApi/recipeTypes"
import { sub } from "date-fns"

const API_BASE_URL = "http://localhost:8080"

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  return response.json()
}


// Create Recipe Step
export const createRecipeStep = async (
  recipeId: string,
  data: RecipeStepsCreationRequest,
  file?: File,
): Promise<RecipeStepsResponse> => {
  const formData = new FormData()
  formData.append("step", data.step.toString())
  formData.append("description", data.description)
  formData.append("waitingTime", data.waitingTime || "")
  if (file) {
    formData.append("file", file)
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/recipeSteps/create/${recipeId}`, {
    method: "POST",
    body: formData,
  })

  const result: ApiResponse<RecipeStepsResponse> = await handleResponse(response)
  return result.result
}


export const updateRecipeStep = async (
  recipeId: string,
  step: number,
  data: RecipeStepsUpdateRequest,
  file?: File,
): Promise<RecipeStepsResponse> => {
  const formData = new FormData()
  formData.append("step", data.step.toString())
  formData.append("description", data.description)
  formData.append("waitingTime", data.waitingTime || "")
  if (file) {
    formData.append("file", file)
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/recipeSteps/update/${recipeId}/${step}`, {
    method: "PUT",
    body: formData,
  })

  const result: ApiResponse<RecipeStepsResponse> = await handleResponse(response)
  return result.result
}

export const getRecipeStepsByRecipeId = async (recipeId: string): Promise<RecipeStepsResponse[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeSteps/getAllRecipeSteps/${recipeId}`)

  const result: ApiResponse<RecipeStepsResponse[]> = await handleResponse(response)
  return result.result
}

// Delete Recipe Step
export const deleteRecipeStep = async (id: string): Promise<string> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipeSteps/delete/${id}`, {
    method: "DELETE",
  })

  const result: ApiResponse<string> = await handleResponse(response)
  return result.result
}