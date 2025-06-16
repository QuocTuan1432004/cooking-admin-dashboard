"use client";

import { authenticatedFetch } from './userAuth';

interface AccountResponse {
  id: string;
  email: string;
  username?: string;
  status: 'ACTIVE' | 'BANNED'; // ← Removed 'INACTIVE'
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

  // ← POST /accounts/{id}/manage - Updated to remove ban-permanent
  const manageAccount = async (
    accountId: string, 
    action: 'ban' | 'activate',
    days?: number
  ): Promise<string> => {
    try {
      const params = new URLSearchParams({ action });
      if (action === 'ban' && days) {
        params.append('days', days.toString());
      }

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

  // ← GET /accounts/search - Search by email
  const searchAccountsByEmail = async (keyword: string): Promise<AccountResponse[]> => {
    try {
      const url = `http://localhost:8080/accounts/search?keyword=${encodeURIComponent(keyword)}`;
      console.log('🌐 Making search request to:', url);
      
      const response = await authenticatedFetch(url, { method: 'GET' });
      
      console.log('📡 Search response status:', response.status);
      console.log('📡 Search response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ Search response not ok:', response.status, response.statusText);
        throw new Error(`Failed to search accounts: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);
      
      const apiResponse: ApiResponse<AccountResponse[]> = JSON.parse(responseText);
      console.log('📦 Parsed API response:', apiResponse);
      console.log('📦 API response result:', apiResponse.result);
      
      return apiResponse.result || [];
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

  // ← GET /recipe/count/{accountId} - Fixed method
  const getRecipeCountByUser = async (accountId: string): Promise<number> => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/recipe/count/${accountId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        console.warn(`Failed to get recipe count for user ${accountId}: ${response.status}`);
        return 0; // Return 0 as fallback instead of throwing error
      }

      const apiResponse: ApiResponse<number> = await response.json();
      return apiResponse.result || 0;
    } catch (error) {
      console.warn(`Failed to get recipe count for user ${accountId}:`, error);
      return 0; // Return 0 as fallback
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