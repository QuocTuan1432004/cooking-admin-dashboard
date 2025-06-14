"use client";

import { authenticatedFetch } from './userAuth';

interface AccountResponse {
  id: string;
  email: string;
  username?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  banEndDate?: string;
  roles: Array<{ name: string; description: string; permissions: any[] }>;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface ApiResponse<T> {
  result: T;
  code?: number;
  message?: string;
}

export const useAccountsApi = () => {
  
  // ← GET /accounts với pagination
  const getAllAccounts = async (page = 0, size = 3): Promise<Page<AccountResponse>> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/accounts?page=${page}&size=${size}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const apiResponse: ApiResponse<Page<AccountResponse>> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to fetch accounts:', error);
      throw error;
    }
  };

  // ← GET /accounts/{id}
  const getAccountById = async (accountId: string): Promise<AccountResponse> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/accounts/${accountId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.status}`);
      }

      const apiResponse: ApiResponse<AccountResponse> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to fetch account:', error);
      throw error;
    }
  };

  // ← DELETE /accounts/{id}
  const deleteAccount = async (accountId: string): Promise<string> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/accounts/${accountId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`);
      }

      const apiResponse: ApiResponse<string> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to delete account:', error);
      throw error;
    }
  };

  // ← POST /accounts/{id}/manage
  const manageAccount = async (
    accountId: string, 
    action: 'ban' | 'ban-permanent' | 'activate',
    days?: number
  ): Promise<string> => {
    try {
      const params = new URLSearchParams({ action });
      if (days) params.append('days', days.toString());

      const response = await authenticatedFetch(
        `http://localhost:8080/accounts/${accountId}/manage?${params.toString()}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Failed to manage account: ${response.status}`);
      }

      const apiResponse: ApiResponse<string> = await response.json();
      return apiResponse.message || apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to manage account:', error);
      throw error;
    }
  };

  // ← GET /accounts/search
  const searchAccountsByEmail = async (keyword: string) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/accounts/search?keyword=${encodeURIComponent(keyword)}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to search accounts: ${response.status}`);
      }

      const apiResponse: ApiResponse<any[]> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to search accounts:', error);
      throw error;
    }
  };

  // ← GET /recipe/getTotalRecipe - Get total recipe count for current user
  const getTotalRecipe = async (): Promise<number> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/recipe/getTotalRecipe`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch total recipe count: ${response.status}`);
      }

      const apiResponse: ApiResponse<number> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to fetch total recipe count:', error);
      throw error;
    }
  };

  // ← GET /recipe/count/{accountId} - Get recipe count for specific user
  const getRecipeCountByUser = async (accountId: string): Promise<number> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/recipe/count/${accountId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recipe count: ${response.status}`);
      }

      const apiResponse: ApiResponse<number> = await response.json();
      return apiResponse.result;
    } catch (error) {
      console.error('❌ Failed to fetch recipe count:', error);
      return 0; // Return 0 if error
    }
  };

  return {
    getAllAccounts,
    getAccountById,
    deleteAccount,
    manageAccount,
    searchAccountsByEmail,
    getTotalRecipe,
    getRecipeCountByUser
  };
};