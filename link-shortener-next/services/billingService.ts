import apiClient from '../lib/axios';
import type { TransactionResponse } from '../types/api';

export const billingService = {
  getMyTransactions: async (): Promise<TransactionResponse[]> => {
    const response = await apiClient.get('/payments/transactions');
    return response.data;
  },
};