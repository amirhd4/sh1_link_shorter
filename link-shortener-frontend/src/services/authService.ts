import apiClient from '../lib/axios';
import type { UserResponse, TokenResponse } from '../types/api';
import type { LoginCredentials, RegisterCredentials, UpdateProfilePayload, ChangePasswordPayload } from '../types/auth';


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


    updateMe: async (payload: UpdateProfilePayload): Promise<UserResponse> => {
    const response = await apiClient.patch('/auth/users/me', payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/users/me/change-password', payload);
    return response.data;
  },


  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (data: { token: string; new_password: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};