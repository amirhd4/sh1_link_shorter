import apiClient from "../lib/axios";
import type {LinkDetails, LinkStatsResponse, URLResponse} from "../types/api";

export const linkService = {
  getMyLinks: async (): Promise<LinkDetails[]> => {
    const response = await apiClient.get('/links/my-links'); // <<<< اصلاح شد
    return response.data;
  },

  createShortLink: async (longUrl: string): Promise<URLResponse> => {
    const response = await apiClient.post('/links/shorten', { long_url: longUrl }); // <<<< اصلاح شد
    return response.data;
  },

  deleteLink: async (shortCode: string): Promise<void> => {
    await apiClient.delete(`/links/${shortCode}`); // <<<< اصلاح شد
  },

  updateLink: async ({ shortCode, longUrl }: { shortCode: string; longUrl: string }): Promise<LinkDetails> => {
    const response = await apiClient.patch(`/links/${shortCode}`, { long_url: longUrl }); // <<<< اصلاح شد
    return response.data;
  },

  getLinkDetails: async (shortCode: string): Promise<LinkDetails> => {
    const response = await apiClient.get(`/links/${shortCode}`);
    return response.data;
  },

  getLinkStats: async (shortCode: string): Promise<LinkStatsResponse> => {
    const response = await apiClient.get(`/links/${shortCode}/stats`);
    return response.data;
  },
};