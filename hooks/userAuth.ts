"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// 👉 Định nghĩa sớm hàm getTokenFromCookie
const getTokenFromCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

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

interface DecodedToken {
  sub: string;
  email: string;
  roles?: string[];
  id: string;
  exp: number;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getDecodedToken = (): DecodedToken | null => {
    const token = getTokenFromCookie('auth_token');
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (err) {
      console.error("❌ Failed to decode token", err);
      return null;
    }
  };

  const decoded = getDecodedToken();
  console.log("🔍 Decoded token:", decoded);
  const userId = decoded?.id || null;      // ✅ UUID từ claim 'id'
  const email = decoded?.sub || null;      // ✅ email từ 'sub'
  const roles = decoded?.roles || [];      // ✅ quyền từ token
  
  
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
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshTokenValue }),
      });

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (response.ok && apiResponse.result.authenticated) {
        saveTokens(apiResponse.result.token, apiResponse.result.refreshToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      logout();
      return false;
    }
  };

  const saveTokens = (token: string, refreshToken: string) => {
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
    const cookieOptions = isLocalhost
      ? "path=/; max-age=86400; samesite=lax"
      : "path=/; max-age=86400; secure; samesite=strict";
  
    document.cookie = `auth_token=${token}; ${cookieOptions}`;
    document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
  
    console.log('💾 Tokens saved');
    console.log("🔐 auth_token:", token);
    console.log("🔐 refresh_token:", refreshToken);
  };
  

  const logout = async () => {
    const accessToken = getTokenFromCookie('auth_token');

    if (accessToken) {
      try {
        await fetch('http://localhost:8080/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken }),
        });
      } catch (error) {
        console.error('❌ Logout API error:', error);
      }
    }

    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    router.push('/login');
  };

  return {
    login,
  refreshToken,
  logout,
  isLoading,
  error,
  setError,
  userId,   // UUID
  email,    // email từ sub
  roles,
  };
};

// ✅ Auto refresh cho fetch API khi gặp 401
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const refreshTokens = async (): Promise<boolean> => {
    const refreshTokenValue = getTokenFromCookie('refresh_token');
    if (!refreshTokenValue) return false;

    try {
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshTokenValue }),
      });

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (response.ok && apiResponse.result.authenticated) {
        document.cookie = `auth_token=${apiResponse.result.token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `refresh_token=${apiResponse.result.refreshToken}; path=/; max-age=86400; secure; samesite=strict`;
        return true;
      } else {
        window.location.href = '/login';
        return false;
      }
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
      window.location.href = '/login';
      return false;
    }
  };

  let accessToken = getTokenFromCookie('auth_token');

  const authHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}`, ...options.headers }
    : options.headers;

  const headers = options.body instanceof FormData
    ? { ...authHeaders }
    : { 'Content-Type': 'application/json', ...authHeaders };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshSuccess = await refreshTokens();

    if (refreshSuccess) {
      accessToken = getTokenFromCookie('auth_token');
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });
    }
  }

  return response;
};

// ✅ Hook tiện lợi để dùng fetch
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
    body: JSON.stringify(data),
  });

  const put = (url: string, data: any) => apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const del = (url: string) => apiCall(url, { method: 'DELETE' });

  return { get, post, put, delete: del };
};
