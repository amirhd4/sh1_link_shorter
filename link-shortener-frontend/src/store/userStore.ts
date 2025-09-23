import { create } from 'zustand';
import type { PlanResponse } from '../types/api';


interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  plan?: PlanResponse | null; // <<<< پراپرتی plan اضافه شد
  subscription_end_date?: string | null; // <<<< این پراپرتی هم اضافه شد
}


interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
}


interface UserState {
  user: User | null;
  isLoading: boolean;
  quota: { remaining: number; limit: number } | null;   // 👈 اضافه شد
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setQuota: (quota: { remaining: number; limit: number } | null) => void;  // 👈 متد جدید
  isAuthenticated: () => boolean;
}


export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  quota: null,
  setUser: (user) => set({ user }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setQuota: (quota) => set({ quota }),
  isAuthenticated: () => !!get().user,
}));
