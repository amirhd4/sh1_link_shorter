import apiClient from '../lib/axios';
import { UserResponse, TokenResponse } from '../types/api';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    // fastapi.security.OAuth2PasswordRequestForm به صورت x-www-form-urlencoded داده ارسال می‌کند
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<UserResponse> => {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get('/auth/users/me');
    return response.data;
  },
};