import apiClient from "../lib/axios";
import type {
  Ticket,
  TicketDetails,
  ReplyTicketPayload
} from "@/types/api";

export const adminTicketService = {
  // لیست کل تیکت‌ها
  getAllTickets: async (): Promise<Ticket[]> => {
    const response = await apiClient.get("/admin/tickets");
    return response.data;
  },

  // جزئیات تیکت
  getTicketDetails: async (ticketId: number): Promise<TicketDetails> => {
    const response = await apiClient.get(`/admin/tickets/${ticketId}`);
    return response.data;
  },

  // پاسخ ادمین
  replyTicket: async (
    ticketId: number,
    payload: ReplyTicketPayload
  ): Promise<void> => {
    await apiClient.post(`/admin/tickets/${ticketId}/reply`, payload);
  },

  // بستن تیکت
  closeTicket: async (ticketId: number): Promise<void> => {
    await apiClient.patch(`/admin/tickets/${ticketId}/close`);
  },
};
