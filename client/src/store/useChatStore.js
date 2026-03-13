import { create } from "zustand";
import api from "../services/api";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await api.get("/message/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const response = await api.get(`/message/${userId}`);
      // Handle both { messages: [] } and direct array responses
      const messages = Array.isArray(response.data) ? response.data : (response.data.messages || []);
      set({ messages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Get messages failed");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const response = await api.post(`/message/send/${selectedUser._id}`, messageData);
      // The backend should return the new message object
      set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Send message failed");
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Unsubscribe first to avoid duplicate listeners
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      // Backend uses 'sender' and 'recipient' as keys
      const isMessageFromSelectedUser = newMessage.sender === selectedUser._id || 
                                       (newMessage.sender === useAuthStore.getState().authUser?._id && newMessage.recipient === selectedUser._id);
      
      if (!isMessageFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
