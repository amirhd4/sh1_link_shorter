import apiClient from '../lib/axios';

interface CreatePaymentLinkResponse {
  payment_url: string;
}

export const paymentService = {
  /**
   * درخواست ایجاد لینک پرداخت برای یک پلن خاص را ارسال می‌کند.
   */
  createPaymentLink: async (planName: string): Promise<CreatePaymentLinkResponse> => {
    const response = await apiClient.post('/payments/create-zarinpal-link', { plan_name: planName });
    return response.data;
  },
};