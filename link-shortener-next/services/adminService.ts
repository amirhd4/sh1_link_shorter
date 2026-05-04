import apiClient from '../lib/axios';
import type {UserResponse, LinkDetailsForAdmin, AdSystemStats, SystemStats, AdminSMS} from '@/types/api';
import {BioPage} from "@/types/bio";

const extractData = <T>(promise: Promise<{ data: T }>): Promise<T> =>
  promise.then(res => res.data);
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

  // deleteLink: async (shortCode: string): Promise<void> => {
  //   await apiClient.delete(`/admin/links/${shortCode}`);
  // },
  deleteLink: async (shortCode: string, domainId?: number | null): Promise<void> => {
      const params = domainId != null ? { domain_id: domainId } : undefined;
      await apiClient.delete(`/admin/links/${shortCode}`, { params });
  },


  getSystemStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  updateUserActive: async (userId: number, isActive: boolean): Promise<UserResponse> => {
  const response = await apiClient.patch(`/admin/users/${userId}/active`, {
    is_active: isActive,
  });
  return response.data;
},


  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  getAdSystemStats: async (): Promise<AdSystemStats> => {
    const response = await apiClient.get('/admin/stats/ads');
    return response.data;
  },

    updateUserRole: async (
  userId: number,
  role: "user" | "admin"
): Promise<UserResponse> => {
  const response = await apiClient.patch(
    `/admin/users/${userId}/role`,
    { role }
  );
  return response.data;
},


  // لیست همه BioPage ها
  getAllBioPages: (): Promise<BioPage[]> => {
    return extractData(apiClient.get("/admin/bio-pages"));
  },

  // جزئیات یک BioPage
  getBioPage: (id: number): Promise<BioPage> => {
    return extractData(apiClient.get(`/admin/bio-pages/${id}`));
  },

  // حذف BioPage
  deleteBioPage: (id: number): Promise<void> => {
    return extractData(apiClient.delete(`/admin/bio-pages/${id}`));
  },

  // حذف لینک داخل Bio
  deleteBioLink: (id: number): Promise<void> => {
    return extractData(apiClient.delete(`/admin/bio-links/${id}`));
  },
syncSms: async (): Promise<{ new_count: number }> => {
  const response = await apiClient.post('/admin_sms/sync');
  return { new_count: response.data.saved }; // فرض می‌کنیم تعداد پیامک‌های جدیدی که ذخیره شده ارجاع داده می‌شود
},


  async getAllSMS(): Promise<AdminSMS[]> {
    const res = await apiClient.get("/admin_sms/list");
    return res.data;
  },
    getSMSDetail: async (id: number) => {
  const res = await apiClient.get(`/admin_sms/messages/${id}`);
  return res.data;
},

markSMSProcessed: async (id: number) => {
  const res = await apiClient.patch(`/admin_sms/messages/${id}/processed`);
  return res.data;
},
};