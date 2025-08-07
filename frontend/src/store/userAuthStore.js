import { create } from 'zustand'

export const useAuthStore = create((set) => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,

    setUser: (user, token) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token });
    },

    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  }
});


