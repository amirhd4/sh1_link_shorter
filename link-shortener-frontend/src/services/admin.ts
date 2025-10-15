import { apiService } from './apiService';
import { Ad, AdCreate, AdUpdate, AdStatsPerLink, AdStatsPerUser } from '../types';

// Ad Management
export const getAds = (): Promise<Ad[]> => {
  return apiService.get('/admin/ads');
};

export const createAd = (adData: AdCreate): Promise<Ad> => {
  return apiService.post('/admin/ads', adData);
};

export const updateAd = (adId: number, adData: AdUpdate): Promise<Ad> => {
  return apiService.put(`/admin/ads/${adId}`, adData);
};

export const deleteAd = (adId: number): Promise<void> => {
  return apiService.delete(`/admin/ads/${adId}`);
};

// Ad Statistics
export const getAdStatsPerLink = (): Promise<AdStatsPerLink[]> => {
  return apiService.get('/admin/stats/ads-per-link');
};

export const getAdStatsPerUser = (): Promise<AdStatsPerUser[]> => {
  return apiService.get('/admin/stats/ads-per-user');
};
