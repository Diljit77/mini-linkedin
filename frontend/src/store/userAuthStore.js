
import { create } from "zustand";
import { currentUser } from "../utils/api"; // ✅ your API call to /api/auth/me

export const useAuthStore = create((set) => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,

    setUser: (user, token) => {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);
      set({ user, token });
    },

    refreshUser: async () => {
      try {
        const data = await currentUser(); // ✅ call backend
        localStorage.setItem("user", JSON.stringify(data));
        set({ user: data });
        return data;
      } catch (err) {
        console.error("Error refreshing user:", err);
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  };
});



