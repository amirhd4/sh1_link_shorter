import apiClient from "../lib/axios";
import type { DomainResponse } from "../types/api";

export const domainService = {
  getDomains: async (): Promise<DomainResponse[]> => {
    const res = await apiClient.get('/domains/');
    return res.data;
  },

  addDomain: async (name: string, is_primary = false): Promise<DomainResponse> => {
    const res = await apiClient.post('/domains/', { name, is_primary });
    return res.data;
  },

  startVerification: async (domainId: number) => {
    const res = await apiClient.post(`/domains/${domainId}/verification/start`);
    // returns object with "http" and "dns" instruction objects
    return res.data;
  },

  checkVerification: async (domainId: number) => {
    const res = await apiClient.post(`/domains/${domainId}/verification/check`);
    return res.data; // { verified: true } on success
  },

  togglePrimary: async (id: number) => {
    const res = await apiClient.post(`/domains/${id}/toggle-primary`);
    return res.data;
  },
  deleteDomain: async (id: number) => {
    const res = await apiClient.delete(`/domains/${id}`);
    return res.data;
  },

};
