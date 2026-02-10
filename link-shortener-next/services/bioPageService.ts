// services/bioPageService.ts
import apiClient from "../lib/axios";
import {
    BioPageResponse,
    BioPageCreate,
    BioLinkResponse,
    BioLinkCreate,
    SuccessResponse, ToggleLinkActive, BioPageUpdate, BioPageForm, BioLinkUpdate
} from "@/types/api";

export const bioPageService = {
  // ----------------------------
  // Bio Page
  // ----------------------------
  getMyBioPages: async (): Promise<BioPageResponse[]> => {
    const response = await apiClient.get("/bio-pages/");
    return response.data;
  },

  getBioPage: async (id: number): Promise<BioPageResponse> => {
    const response = await apiClient.get(`/bio-pages/${id}`);
    return response.data;
  },

  getPublicBioPage: async (slug: string): Promise<BioPageResponse> => {
    const response = await apiClient.get(`/bio-pages/public/${slug}`);
    return response.data;
  },
createBioPage: async (formData: FormData): Promise<BioPageResponse> => {
    const res = await apiClient.post("/bio-pages/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },


  updateBioPage: async (pageId: number, payload: BioPageUpdate): Promise<BioPageResponse> => {
    const res = await apiClient.put(`/bio-pages/${pageId}`, payload);
    return res.data;
  },

  deleteBioPage: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/bio-pages/${id}`);
    return response.data;
  },

  // ----------------------------
  // Bio Links
  // ----------------------------
  addBioLink: async (pageId: number, payload: BioLinkCreate): Promise<BioLinkResponse> => {
    const response = await apiClient.post(`/bio-pages/${pageId}/links`, payload);
    return response.data;
  },

  updateBioLink: async (
  linkId: number,
  payload: BioLinkUpdate
): Promise<BioLinkResponse> => {
  const response = await apiClient.patch(
    `/bio-pages/links/${linkId}`,
    payload
  );
  return response.data;
},


  deleteBioLink: async (linkId: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/bio-pages/links/${linkId}`);
    return response.data;
  },

  reorderLinks: async (pageId: number, order: { id: number; position: number }[]): Promise<void> => {
    await apiClient.patch(`/bio-pages/${pageId}/links/reorder`, order);
  },

  toggleLinkActive: async (linkId: number, isActive: boolean): Promise<BioLinkResponse> => {
    const res = await apiClient.patch(`/bio-pages/links/${linkId}/toggle-active`, {
      is_active: isActive,
    } as ToggleLinkActive);
    return res.data;
  },
    updateBioPageAvatar: async (pageId: number, formData: FormData) => {
  const res = await apiClient.put(
    `/bio-pages/${pageId}/avatar`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.avatar_url;
},

  // clickBioLink: async (linkId: number): Promise<void> => {
  //   // این endpoint فقط redirect می‌کنه
  //   await apiClient.get(`/bio-pages/link/${linkId}`);
  // }
};
