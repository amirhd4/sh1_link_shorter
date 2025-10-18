import apiClient from '../lib/axios';
import type { AdReward } from '../types/api';

export const adService = {
  async getUserAdRewards(): Promise<AdReward[]> {
    const res = await apiClient.get('/ads/rewards/me');
    return res.data;
  },

  async getLinkAdStats(shortCode: string, domainId?: number | null) {
    const params = domainId != null ? { domain_id: domainId } : undefined;
    const res = await apiClient.get(`/ads/stats/${shortCode}`, { params });
    return res.data;
  },

  async registerAdView(shortCode: string, domainId?: number | null) {
    const params = domainId != null ? { domain_id: domainId } : undefined;

    const res = await apiClient.post(`/ads/view/${shortCode}`, undefined, { params });
    return res.data;
  },

  async getActiveAd(shortCode?: string) {
    const params = shortCode ? { params: { link_code: shortCode } } : undefined;
    const res = await apiClient.get('/ads/active', params);
    return res.data;
  },
};
