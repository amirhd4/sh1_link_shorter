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
  // ... (بقیه اینترفیس)
}

export const useUserStore = create<UserState>((set, get) => ({
  // ... (بقیه کد استور)
}));

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
}


interface UserState {
  user: User | null;
  isLoading: boolean; // وضعیت جدید
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void; // متد جدید
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true, // در ابتدا در حال بارگذاری هستیم
  setUser: (user) => set({ user }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  isAuthenticated: () => !!get().user,
}));