import apiClient from '../lib/axios';
import type { PlanResponse } from '../types/api'; // فرض می‌کنیم PlanResponse در api.d.ts تعریف شده

export const plansService = {
  /**
   * لیست تمام پلن‌های موجود را از سرور دریافت می‌کند.
   */
  getAllPlans: async (): Promise<PlanResponse[]> => {
    const response = await apiClient.get('/plans/');
    return response.data;
  },
};