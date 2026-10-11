// Centralized API client for CivicFix full-stack communication

const TOKEN_KEY = 'civicfix_auth_token';

// Base backend URL resolution with Vite environment variable support
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env?.VITE_API_URL as string) || '';
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return '';
};

export const ApiClient = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },

  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const baseUrl = getApiBaseUrl();
    const targetUrl = endpoint.startsWith('http')
      ? endpoint
      : baseUrl
      ? `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
      : endpoint;

    // Helper for sending request and extracting friendly error
    const executeFetch = async (url: string) => {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          // ignore JSON parse error
        }
        const error: any = new Error(errorMsg);
        error.status = response.status;
        throw error;
      }

      return response.json() as Promise<T>;
    };

    try {
      return await executeFetch(targetUrl);
    } catch (primaryErr: any) {
      // If primary relative request failed (e.g. 404 from Vite proxy or connection failed)
      // and we are calling an /api endpoint on localhost in browser, try direct backend fallback
      const shouldTryDirectFallback =
        !endpoint.startsWith('http') &&
        endpoint.startsWith('/api') &&
        !baseUrl &&
        (primaryErr?.status === 404 || primaryErr?.name === 'TypeError' || primaryErr?.message?.includes('fetch'));

      if (shouldTryDirectFallback) {
        try {
          return await executeFetch(`http://127.0.0.1:5000${endpoint}`);
        } catch {
          try {
            return await executeFetch(`http://localhost:5000${endpoint}`);
          } catch {
            // Re-throw original error if fallbacks also fail
            throw primaryErr;
          }
        }
      }

      throw primaryErr;
    }
  },

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};
