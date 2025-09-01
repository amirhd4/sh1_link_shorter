import apiClient from "../lib/axios";
import type { LinkDetails, URLResponse } from "../types/api";

export const linkService = {
    getMyLinks: async (): Promise<LinkDetails[]> => {
        const response = await apiClient.get('/my-links');
        return response.data;
    },

    createShortLink: async (longUrl: string): Promise<URLResponse> => {
        const response = await apiClient.post('/shorten', { long_url: longUrl });
        return response.data;
    },

    deleteLink: async (shortCode: string): Promise<void> => {
        await apiClient.delete(`/links/${shortCode}`);
    },

    updateLink: async ({ shortCode, longUrl }: { shortCode: string; longUrl: string }): Promise<LinkDetails> => {
        const response = await apiClient.patch(`/links/${shortCode}`, { long_url: longUrl });
        return response.data;
    }
}