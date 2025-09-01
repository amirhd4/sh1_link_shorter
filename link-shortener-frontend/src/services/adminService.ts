import apiClient from '../lib/axios';
import type { UserResponse } from '../types/api';

export const adminService = {
  /**
   * لیست تمام کاربران سیستم را از سرور دریافت می‌کند.
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
};