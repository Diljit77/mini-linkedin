import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BASE_URL; 

export const useChatStore = create((set, get) => ({
  socket: null,
  messages: [], 
  onlineUsers: new Map(),

 
  setMessages: (newMessages) => set({ messages: newMessages }),

  connectSocket: (userId) => {
    if (get().socket) return; 

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to socket:", socket.id);
      socket.emit("join", userId);
    });

socket.on("receiveMessage", (message) => {
  set((state) => ({ messages: [...state.messages, message] }));
});

socket.on("messageSent", (message) => {
  set((state) => ({ messages: [...state.messages, message] }));
});


    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    set({ socket });
  },

 sendMessage: (sender, receiver, message) => {
  const { socket } = get();
  if (!socket) return;

  socket.emit("sendMessage", { sender, receiver, ...message }); 
},

  
}));
