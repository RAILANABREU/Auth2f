const API_URL = 'http://localhost:8000/api';

interface ApiError {
  detail?: string;
  message?: string;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ 
        message: 'An error occurred' 
      }));
      
      if (response.status === 401) {
        // Clear tokens on unauthorized
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('pre2faToken');
        window.location.href = '/login';
      }
      
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
