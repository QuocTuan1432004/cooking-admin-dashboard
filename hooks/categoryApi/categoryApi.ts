import { authenticatedFetch } from "@/hooks/userAuth";
import { MainCategory, SubCategory, Category } from "@/hooks/categoryApi/types";

const API_BASE_URL = 'http://localhost:8080';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
};

export const countRecipeByMainCategory = async (mainCategoryId: string): Promise<number> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/countRecipeByMainCate/${mainCategoryId}`);
  const data = await handleResponse(response);
  return data.count || 0;
};

export const countRecipeBySubCategory = async (subCategoryId: string): Promise<number> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/recipe/countRecipeBySub/${subCategoryId}`);
  const data = await handleResponse(response);
  return data.count || 0;
};

const mapMainCategoryToCategory = async (main: MainCategory): Promise<Category> => {
  const recipeCount = await countRecipeByMainCategory(main.id);
  return {
    id: main.id,
    name: main.categoryName,
    description: '', // Backend không trả về description, đặt mặc định
    children: [],
    image: main.categoryImg || '/placeholder.svg?height=60&width=60', // Thêm mapping cho ảnh
  };
};

const mapSubCategoryToCategory = async (sub: SubCategory): Promise<Category> => {
  const recipeCount = await countRecipeBySubCategory(sub.id);
  return {
    id: sub.id,
    name: sub.subCategoryName,
    parentId: sub.categoryId,
    image: sub.subCategoryImg || '/placeholder.svg?height=60&width=60',
  };
};

//Main Category API
export const createMainCategory = async (data: { categoryName: string; }, file?: File) => {
  const formData = new FormData();
  formData.append('categoryName', data.categoryName);
  if (file) formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/mainCategory/create`, {
    method: 'POST',
    body: formData,
  });
  const result = await handleResponse(response);
  return mapMainCategoryToCategory(result.result);
};

export const updateMainCategory = async (id: string, data: { categoryName: string; }, file?: File) => {
  const formData = new FormData();
  formData.append('categoryName', data.categoryName);
  if (file) formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/mainCategory/update/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const result = await handleResponse(response);
  return mapMainCategoryToCategory(result.result);
};

export const getAllMainCategories = async (): Promise<Category[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/mainCategory/getAll`);
  const result = await handleResponse(response);
  const mainCategories: MainCategory[] = result.result;
  const categories = await Promise.all(
    mainCategories.map(async (main) => {
      const mainCategory = await mapMainCategoryToCategory(main);
      const subResponse = await getSubCategoriesByMainId(main.id);
      const subCategories = await Promise.all(
        subResponse.map(mapSubCategoryToCategory)
      );
      return {
        ...mainCategory,
        children: subCategories,
      };
    })
  );
  return categories;
};

export const deleteMainCategory = async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/mainCategory/delete/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const countAllMainCategories = async (): Promise<number> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/countAllMainCategory`); 
  const data = await handleResponse(response);
  return data.count || 0;
}

// Sub Category API
export const createSubCategory = async (mainCategoryId: string, subCategoryName: string, file?: File) => {
  const formData = new FormData();
  formData.append('subCategoryName', subCategoryName);
  if (file) formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/subCategory/create/${mainCategoryId}`, {
    method: 'POST',
    body: formData,
  });
  const result = await handleResponse(response);
  return mapSubCategoryToCategory(result.result);
};

export const updateSubCategory = async (id: string, subCategoryName: string, categoryId: string, file?: File) => {
  const formData = new FormData();
  formData.append('subCategoryName', subCategoryName);
  formData.append('categoryId', categoryId);
  if (file) formData.append('file', file);

  const response = await authenticatedFetch(`${API_BASE_URL}/subCategory/update/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const result = await handleResponse(response);
  return mapSubCategoryToCategory(result.result);
};

export const getSubCategoriesByMainId = async (mainCategoryId: string): Promise<SubCategory[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/subCategory/getAllSubByMain/${mainCategoryId}`);
  const result = await handleResponse(response);
  return result.result;
};

export const deleteSubCategory = async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/subCategory/deleteSubCategory/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const countAllSubCategories = async (): Promise<number> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/countAllSubCategory`);
  const data = await handleResponse(response);
  return data.count || 0;
};