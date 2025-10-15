// import { apiService } from './apiService';
import apiClient from '../lib/axios';
import type {Ad, AdCreate, AdStatsPerLink, AdStatsPerUser, AdUpdate} from "../types";

// Ad Management
export const getAds = (): Promise<Ad[]> => {
  return apiClient.get('/admin/ads');
};

export const createAd = (adData: AdCreate): Promise<Ad> => {
  return apiClient.post('/admin/ads', adData);
};

export const updateAd = (adId: number, adData: AdUpdate): Promise<Ad> => {
  return apiClient.put(`/admin/ads/${adId}`, adData);
};

export const deleteAd = (adId: number): Promise<void> => {
  return apiClient.delete(`/admin/ads/${adId}`);
};

// Ad Statistics
export const getAdStatsPerLink = (): Promise<AdStatsPerLink[]> => {
  return apiClient.get('/admin/stats/ads-per-link');
};

export const getAdStatsPerUser = (): Promise<AdStatsPerUser[]> => {
  return apiClient.get('/admin/stats/ads-per-user');
};
