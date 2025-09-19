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


  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.get(`/auth/verify-email?token=${token}`, {
        headers: { Authorization: '' } // <<<< حذف توکن برای این درخواست
    });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification-email', { email }, {
        headers: { Authorization: '' } // <<<< حذف توکن برای این درخواست
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email }, {
        headers: { Authorization: '' } // <<<< حذف توکن برای این درخواست
    });
    return response.data;
  },

  resetPassword: async (data: { token: string; new_password: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data, {
        headers: { Authorization: '' } // <<<< حذف توکن برای این درخواست
    });
    return response.data;
  },


  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/send-otp', { phone }, {
      headers: { Authorization: '' }
    });
    return response.data;
  },

  verifyOtp: async (phone: string, code: string): Promise<{ message: string, access_token: string }> => {
    const response = await apiClient.post('/auth/verify-otp', { phone, code }, {
      headers: { Authorization: '' }
    });
    return response.data;
  },

  registerWithOtp: async (phone: string, code: string): Promise<{ message: string; access_token: string }> => {
    const response = await apiClient.post('/auth/register-otp', { phone, code }, {
      headers: { Authorization: '' }
    });
    return response.data;
  }


};