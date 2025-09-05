import apiClient from "../lib/axios";
import type { LinkDetails, URLResponse } from "../types/api";

export const linkService = {
  getMyLinks: async (): Promise<LinkDetails[]> => {
    const response = await apiClient.get('/api/links/my-links'); // <<<< اصلاح شد
    return response.data;
  },

  createShortLink: async (longUrl: string): Promise<URLResponse> => {
    const response = await apiClient.post('/api/links/shorten', { long_url: longUrl }); // <<<< اصلاح شد
    return response.data;
  },

  deleteLink: async (shortCode: string): Promise<void> => {
    await apiClient.delete(`/api/links/links/${shortCode}`); // <<<< اصلاح شد
  },

  updateLink: async ({ shortCode, longUrl }: { shortCode: string; longUrl: string }): Promise<LinkDetails> => {
    const response = await apiClient.patch(`/api/links/links/${shortCode}`, { long_url: longUrl }); // <<<< اصلاح شد
    return response.data;
  },

  getLinkDetails: async (shortCode: string): Promise<LinkDetails> => {
    const response = await apiClient.get(`/api/links/${shortCode}`);
    return response.data;
  },

  getLinkStats: async (shortCode: string): Promise<LinkStatsResponse> => {
    const response = await apiClient.get(`/api/links/${short_code}/stats`);
    return response.data;
  },
};