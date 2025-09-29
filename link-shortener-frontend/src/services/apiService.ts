import apiClient from '../lib/axios';

export const apiService = {
  getApiKey: async (): Promise<{ api_key: string }> => {
    const res = await apiClient.get("/auth/api-key");
    return res.data;
  },
  regenerateApiKey: async (): Promise<{ api_key: string }> => {
    const res = await apiClient.post("/auth/generate-api-key");
    return res.data;
  },
};
