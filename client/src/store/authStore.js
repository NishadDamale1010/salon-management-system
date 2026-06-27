import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => set((state) => ({ 
        user, 
        isAuthenticated: !!user, 
        token: token || state.token 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "gayatri-auth" }
  )
);
