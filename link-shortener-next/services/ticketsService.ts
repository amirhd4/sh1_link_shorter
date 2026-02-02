import apiClient from "../lib/axios";
import type {
  Ticket,
  TicketDetails,
  CreateTicketPayload,
  ReplyTicketPayload
} from "@/types/api";

export const ticketsService = {
  // لیست تیکت‌های کاربر
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await apiClient.get("/tickets");
    return response.data;
  },

  // جزئیات تیکت
  getTicketDetails: async (ticketId: number): Promise<TicketDetails> => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // ایجاد تیکت
  createTicket: async (
    payload: CreateTicketPayload
  ): Promise<TicketDetails> => {
    const response = await apiClient.post("/tickets", payload);
    return response.data;
  },

  // پاسخ کاربر
  replyTicket: async (
    ticketId: number,
    payload: ReplyTicketPayload
  ): Promise<void> => {
    await apiClient.post(`/tickets/${ticketId}/reply`, payload);
  },
};
