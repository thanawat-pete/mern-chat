import { create } from "zustand";
import api from "../services/api";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

export const useChatStore = create((set, get) => ({
  users: [],
  message: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,
  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await api.get("/message/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const response = await api.post(
        "/message/send/" + selectedUser._id,
        messageData,
      );
      set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Send message failed");
    }
  },
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const response = await api.get(`/message/${userId}`);
      set({ messages: response.data.messages || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Get messages failed");
    } finally {
      set({ isMessageLoading: false });
    }
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Subscribe to new messages via socket
    socket.on("newMessage", (newMessage) => {
      // Only add message to state if the incoming message belongs to the current open chat
      if (
        newMessage.sender === selectedUser._id ||
        newMessage.recipient === selectedUser._id
      ) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
