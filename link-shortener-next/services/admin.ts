import apiClient from '../lib/axios';
import type { Ad, AdCreate, AdStatsPerLink, AdStatsPerUser, AdUpdate } from "../types";
import {AdminUserSummary, UserResponse} from "@/types/api";

// Helper function to simplify Axios responses
const extractData = <T>(promise: Promise<{ data: T }>): Promise<T> =>
  promise.then(response => response.data);

// ==========================
// 🧩 Ad Management API
// ==========================

// Get all ads
export const getAds = (): Promise<Ad[]> => {
  return extractData(apiClient.get('/admin/ads'));
};

// Create a new ad
export const createAd = (adData: AdCreate): Promise<Ad> => {
  return extractData(apiClient.post('/admin/ads', adData));
};

// Update an ad
export const updateAd = (adId: number, adData: AdUpdate): Promise<Ad> => {
  return extractData(apiClient.put(`/admin/ads/${adId}`, adData));
};

// Delete an ad
export const deleteAd = (adId: number): Promise<void> => {
  return extractData(apiClient.delete(`/admin/ads/${adId}`));
};

// ==========================
// 📊 Ad Statistics API
// ==========================

// Ads per shortened link
export const getAdStatsPerLink = (): Promise<AdStatsPerLink[]> => {
  return extractData(apiClient.get('/admin/stats/ads-per-link'));
};

// Ads per user
export const getAdStatsPerUser = (): Promise<AdStatsPerUser[]> => {
  return extractData(apiClient.get('/admin/stats/ads-per-user'));
};


export const adminUserService = {
  getUserById: async (userId: number): Promise<AdminUserSummary> => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data;
  },
};