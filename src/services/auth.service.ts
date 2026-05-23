import apiClient from '../lib/axios';

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
  message?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string; // ajusta según los campos que pida tu backend
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return await apiClient.post('/auth/login', { email, password });
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    return await apiClient.post('/auth/register', userData);
  },

  logout: (): void => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
};