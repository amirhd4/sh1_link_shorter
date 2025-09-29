import apiClient from '../lib/axios';

export const apiService = {
  getApiKey: async (): Promise<{ api_key: string }> => {
    const res = await apiClient.get("/api/auth/api-key");
    return res.data;
  },
  regenerateApiKey: async (): Promise<{ api_key: string }> => {
    const res = await apiClient.post("/api/auth/generate-api-key");
    return res.data;
  },
};
