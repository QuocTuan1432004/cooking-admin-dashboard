"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshRequest {
  token: string;
}

interface AuthResponse {
  authenticated: boolean;
  token: string;
  refreshToken: string; 
}

interface ApiResponse<T> {
  result: T;
  code?: number;
  message?: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8080/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (response.ok && apiResponse.result.authenticated) {
        saveTokens(apiResponse.result.token, apiResponse.result.refreshToken);
        // ← BỎ setupAutoRefresh() - không cần timer
        router.push("/");
        return true;
      } else {
        setError(apiResponse.message || "Email hoặc mật khẩu không đúng");
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    const refreshTokenValue = getTokenFromCookie('refresh_token');
    if (!refreshTokenValue) {
      console.log('❌ No refresh token found');
      return false;
    }

    try {
      console.log('🔄 Attempting to refresh token...');
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshTokenValue }),
      });

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (response.ok && apiResponse.result.authenticated) {
        console.log('✅ Token refreshed successfully');
        saveTokens(apiResponse.result.token, apiResponse.result.refreshToken);
        // ← BỎ setupAutoRefresh() - không cần timer
        return true;
      } else {
        console.log('❌ Refresh failed:', apiResponse.message);
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      logout();
      return false;
    }
  };

  // ← BỎ setupAutoRefresh - không cần timer nữa

  const saveTokens = (token: string, refreshToken: string) => {
    document.cookie = `auth_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=86400; secure; samesite=strict`;
    
    console.log('💾 Tokens saved:', { 
      accessToken: token.substring(0, 20) + '...', 
      refreshToken: refreshToken.substring(0, 20) + '...' 
    });
  };

  const getTokenFromCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const logout = async () => {
    const accessToken = getTokenFromCookie('auth_token');
    
    if (accessToken) {
      try {
        console.log('🔄 Calling logout API...');
        await fetch('http://localhost:8080/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken }),
        });
        console.log('✅ Logout API called successfully');
      } catch (error) {
        console.error('❌ Logout API error:', error);
      }
    }

    // Clear cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('👋 Logged out');
    router.push('/login');
  };

  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    return await refreshToken();
  };

  return {
    login,
    refreshToken: manualRefresh,
    logout,
    isLoading,
    error,
    setError
  };
};

// ← THÊM: authenticatedFetch - auto refresh khi API call bị 401
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const getTokenFromCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const refreshTokens = async (): Promise<boolean> => {
    const refreshTokenValue = getTokenFromCookie('refresh_token');
    if (!refreshTokenValue) {
      console.log('❌ No refresh token found for auto-refresh');
      return false;
    }

    try {
      console.log('🔄 Access token expired, auto-refreshing...');
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshTokenValue }),
      });

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (response.ok && apiResponse.result.authenticated) {
        // Save new tokens
        document.cookie = `auth_token=${apiResponse.result.token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `refresh_token=${apiResponse.result.refreshToken}; path=/; max-age=86400; secure; samesite=strict`;
        
        console.log('✅ Tokens auto-refreshed successfully');
        return true;
      } else {
        console.log('❌ Auto-refresh failed:', apiResponse.message);
        // Redirect to login
        window.location.href = '/login';
        return false;
      }
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
      window.location.href = '/login';
      return false;
    }
  };

  // Get current access token
  let accessToken = getTokenFromCookie('auth_token');
  
  // Add auth header if token exists
  const authHeaders = accessToken ? {
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers
  } : options.headers;

  // First API call

const headers = options.body instanceof FormData ? 
    { ...authHeaders } : 
    { 'Content-Type': 'application/json', ...authHeaders };

  let response = await fetch(url, {
    ...options,
    headers
  });

  // If 401 (Unauthorized), try to refresh token and retry
  if (response.status === 401) {
    console.log('🔓 401 Unauthorized - attempting token refresh...');
    
    const refreshSuccess = await refreshTokens();
    
    if (refreshSuccess) {
      // Get new access token and retry
      accessToken = getTokenFromCookie('auth_token');
      
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers
        }
      });
      
      console.log('🔄 API call retried with new access token');
    }
  }

  return response;
};

// ← THÊM: useApi hook để sử dụng authenticatedFetch dễ dàng
export const useApi = () => {
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await authenticatedFetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const get = (url: string) => apiCall(url, { method: 'GET' });
  
  const post = (url: string, data: any) => apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  const put = (url: string, data: any) => apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  const del = (url: string) => apiCall(url, { method: 'DELETE' });

  return { get, post, put, delete: del };
};