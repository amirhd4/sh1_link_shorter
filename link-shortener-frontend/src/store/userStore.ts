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

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: () => !!get().user,
}));