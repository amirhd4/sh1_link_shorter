import apiClient from "../lib/axios";
import type {
    AdvancedLinkStats,
    LinkDetails,
    LinkStatsResponse,
    UpdateLinkPayload,
    URLCreate,
    URLResponse
} from "../types/api";

export const linkService = {
  getMyLinks: async (): Promise<LinkDetails[]> => {
    const response = await apiClient.get('/links/my-links'); // <<<< اصلاح شد
    return response.data;
  },

  // createShortLink: async (longUrl: string): Promise<URLResponse> => {
  //   const response = await apiClient.post('/links/shorten', { long_url: longUrl }); // <<<< اصلاح شد
  //   return response.data;
  // },
  //
    createShortLink: async (payload: URLCreate): Promise<URLResponse> => {
      const response = await apiClient.post('/links/shorten', payload);
      return response.data;
    },

  deleteLink: async (shortCode: string, domainId: string): Promise<void> => {
    const domainIdNum = parseInt(domainId, 10)
    await apiClient.delete(`/links/${shortCode}/${domainIdNum}`);
  },

  // updateLink: async ({ shortCode, longUrl }: { shortCode: string; longUrl: string }): Promise<LinkDetails> => {
  //   const response = await apiClient.patch(`/links/${shortCode}`, { long_url: longUrl }); // <<<< اصلاح شد
  //   return response.data;
  // },
    updateLink: async (payload: UpdateLinkPayload): Promise<LinkDetails> => {
        const { shortCode, domainId, ...updateData } = payload;

        const domainIdNum = typeof domainId === 'string' ? parseInt(domainId, 10) : domainId;

        // استفاده از هر دو shortCode و domainId در مسیر PATCH
        const response = await apiClient.patch(`/links/${shortCode}/${domainIdNum}`, updateData);
        return response.data;
  },

  getLinkDetails: async (shortCode: string, domainId: string): Promise<LinkDetails> => {
    const domainIdNum = parseInt(domainId, 10);
    const response = await apiClient.get(`/links/${shortCode}/${domainIdNum}`);
    return response.data;
  },

  getLinkStats: async (shortCode: string, domainId: string): Promise<AdvancedLinkStats> => {
    const domainIdNum = parseInt(domainId, 10);
    const response = await apiClient.get(`/links/${shortCode}/${domainIdNum}/stats`);
    return response.data;
  },
};