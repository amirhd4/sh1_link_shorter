import apiClient from "../lib/apiClient";
import { LinkDetails } from "../types/api";

export const linkService = {
    getMyLinks: async (): Promise<LinkDetails[]> => {
        const response = await apiClient.get('/my-links');
        return response.data;
    }
}