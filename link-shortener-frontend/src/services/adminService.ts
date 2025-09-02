import apiClient from '../lib/axios';
import type { UserResponse, LinkDetailsForAdmin } from '../types/api';
import type { SystemStats } from '../types/api';


export const adminService = {
  /**
   * لیست تمام کاربران سیستم را از سرور دریافت می‌کند.
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  /**
   * یک پلن جدید را به کاربر مشخص شده تخصیص می‌دهد.
   */
  assignPlanToUser: async ({ userId, planName }: { userId: number; planName: string }): Promise<UserResponse> => {
    const response = await apiClient.post(`/admin/users/${userId}/assign-plan`, { plan_name: planName });
    return response.data;
  },

  /**
   * لیست تمام لینک‌های موجود در سیستم را دریافت می‌کند.
   */
  getAllLinks: async (): Promise<LinkDetailsForAdmin[]> => {
    const response = await apiClient.get('/admin/links');
    return response.data;
  },

  deleteLink: async (shortCode: string): Promise<void> => {
    await apiClient.delete(`/admin/links/${shortCode}`);
  },

  getSystemStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  }
};