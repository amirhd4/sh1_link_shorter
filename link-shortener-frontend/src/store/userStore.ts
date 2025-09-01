import { create } from 'zustand';


interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}


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