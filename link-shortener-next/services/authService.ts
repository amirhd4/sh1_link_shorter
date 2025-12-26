import apiClient from '../lib/axios';
import type { UserResponse, TokenResponse } from '@/types/api';
import type { LoginCredentials, RegisterCredentials, UpdateProfilePayload, ChangePasswordPayload } from '@/types/auth';
import type {UserWithToken, OtpLoginResponse} from "@/types/api"


export const authService = {
  login: async (credentials: LoginCredentials & { captcha_token: string }): Promise<TokenResponse> => {
    // fastapi.security.OAuth2PasswordRequestForm به صورت x-www-form-urlencoded داده ارسال می‌کند
    const formData = new URLSearchParams();
    formData.append('username', credentials.phone_number);
    formData.append('password', credentials.password);
    formData.append("captcha_token", credentials.captcha_token);

    const response = await apiClient.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  // register: async (credentials: RegisterCredentials & { captcha_token: string }): Promise<UserResponse> => {
  //   const response = await apiClient.post('/auth/register', credentials);
  //   return response.data;
  // },

//    register: async (credentials: RegisterCredentials & { captcha_token: string }): Promise<UserResponse> => {
//   const payload = {
//     email: credentials.email,
//     password: credentials.password,
//     captcha_token: credentials.captcha_token || "dummy-token",
//   };
//   const response = await apiClient.post('/auth/register', payload);
//   return response.data;
// },



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

  // -------------------------
    // Resend Verification / Password
    // -------------------------
    resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post(
        '/auth/resend-verification-email',
        { email },
        { headers: { Authorization: '' } } // بدون توکن
      );
      return response.data;
    },

    forgotPassword: async (email: string, captchaToken: string): Promise<{ message: string }> => {
      const response = await apiClient.post(
        '/auth/forgot-password',
        { email, captcha_token: captchaToken },
        { headers: { Authorization: '' } } // بدون توکن
      );
      return response.data;
    },

    resetPassword: async (
      data: { token: string; new_password: string },
      captchaToken: string
    ): Promise<{ message: string }> => {
      const response = await apiClient.post(
        '/auth/reset-password',
        { ...data, captcha_token: captchaToken },
        { headers: { Authorization: '' } } // بدون توکن
      );
      return response.data;
    },

    // -------------------------
    // OTP for Login/Register
    // -------------------------
    sendOtpLogin: async (phone: string, captchaToken: string) => {
      const res = await apiClient.post('/auth/send-otp-login', { phone, captcha_token: captchaToken || "dummy" });
      return res.data as { message: string };
    },

    verifyOtpLogin: async (phone: string, code: string, captchaToken: string) => {
      const res = await apiClient.post('/auth/verify-otp-login', { phone, code, captcha_token: captchaToken || "dummy" });
      return res.data as OtpLoginResponse;
    },

    sendOtpRegister: async (phone: string, captchaToken: string) => {
      const res = await apiClient.post('/auth/send-otp-register', { phone, captcha_token: captchaToken || "dummy" });
      return res.data as { message: string };
    },

    registerWithOtp: async (
      phone: string,
      code: string,
      first_name?: string,
      last_name?: string,
      captchaToken?: string
    ) => {
      const res = await apiClient.post('/auth/register-otp', { phone, code, first_name, last_name, captcha_token: captchaToken || "test" });
      return res.data as UserWithToken;
    },

};