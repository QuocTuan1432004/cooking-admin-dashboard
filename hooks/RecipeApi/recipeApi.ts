import { authenticatedFetch } from "@/hooks/userAuth"
import type { ApiResponse, RecipeResponse, RecipeCreationRequest, RecipeUpdateRequest, PageResponse } from "@/hooks/RecipeApi/recipeTypes"
import { sub } from "date-fns"

const API_BASE_URL = "http://localhost:8080"

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  return response.json()
}

export const createRecipe = async (subCategoryId : string,data: RecipeCreationRequest,file: File): Promise<ApiResponse<RecipeResponse>> => {
    const formdata = new FormData();
    formdata.append("title", data.title);
    formdata.append("description", data.description);
    formdata.append("difficulty", data.difficulty);
    formdata.append("cookingTime", data.cookingTime);
    formdata.append("file", file);

    const response = await authenticatedFetch(`${API_BASE_URL}/recipe/create/${subCategoryId}`, {
        method: "POST",
        body: formdata
    });

    const result: ApiResponse<RecipeResponse> = await handleResponse(response);
    return result;
}

export const updateRecipe = async (recipeId: string, data: RecipeUpdateRequest,file: File): Promise<ApiResponse<RecipeResponse>> => {
const formData = new FormData()
  formData.append("title", data.title)
  formData.append("description", data.description)
  formData.append("difficulty", data.difficulty)
  formData.append("cookingTime", data.cookingTime)
  formData.append("subCategoryId", data.subCategoryId)
  if (file) {
    formData.append("file", file)
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/update/${recipeId}`, {
    method: "PUT",
    body: formData,
  })

  const result: ApiResponse<RecipeResponse> = await handleResponse(response)
  return result
}

export const getAllRecipe = async (page: number, size: number): Promise<ApiResponse<PageResponse<RecipeResponse>>> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipes?page=${page}&size=${size}`)

  const result: ApiResponse<PageResponse<RecipeResponse>> = await handleResponse(response)
  return result
}

export const getReipceBySubCategoryId = async (subCategoryId: string, page: number, size: number): Promise<ApiResponse<PageResponse<RecipeResponse>>> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/subCategory/${subCategoryId}?page=${page}&size=${size}`)

  const result: ApiResponse<PageResponse<RecipeResponse>> = await handleResponse(response)
  return result
}

export const findRecipesByKeyword = async (keyword: string): Promise<RecipeResponse[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/findByKeyWord/${keyword}`)

  const result: ApiResponse<RecipeResponse[]> = await handleResponse(response)
  return result.result
}

export const changeRecipeStatus = async (id: string): Promise<RecipeResponse> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/changeStatus/${id}`, {
    method: "POST",
  })

  const result: ApiResponse<RecipeResponse> = await handleResponse(response)
  return result.result
}

export const deleteRecipe = async (id: string): Promise<string> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/deleteRecipe/${id}`, {
    method: "DELETE",
  })

  const result: ApiResponse<string> = await handleResponse(response)
  return result.result
}