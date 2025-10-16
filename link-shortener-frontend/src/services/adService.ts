import apiClient from '../lib/axios';
import type { AdReward } from '../types/api';

export const adService = {
  async getUserAdRewards(): Promise<AdReward[]> {
    const res = await apiClient.get('/ads/rewards/me');
    return res.data;
  },

  async getLinkAdStats(shortCode: string, domainId?: string | number) {
    const domain = (domainId && domainId !== 'undefined' && domainId !== 'null') ? domainId : '0';
    const res = await apiClient.get(`/ads/stats/${domain}/${shortCode}`);
    return res.data;
  },

  async registerAdView(shortCode: string, domainId?: string | number) {
    const domain = (domainId && domainId !== 'undefined' && domainId !== 'null') ? domainId : '0';
    const res = await apiClient.post(`/ads/view/${domain}/${shortCode}`);
    return res.data;
  },

  async getActiveAd(shortCode?: string) {
    const params = shortCode ? { params: { link_code: shortCode } } : undefined;
    const res = await apiClient.get('/ads/active', params);
    return res.data;
  },
};
