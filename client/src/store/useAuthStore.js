import {
  create
} from "zustand";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  io,
} from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatedProfile: false,
  onlineUsers: [],
  signUp: async (data) => {
    set({
      isSigningUp: true
    });
    try {
      const response = await api.post("/user/signup", data);
      set({
        authUser: response.data
      });
      toast.success("Account created successfully");
      get().connectSocket();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error(error.response.data.message || "Sign Up failed");
      return {
        success: false,
        data: error.response.data
      };
    } finally {
      set({
        isSigningUp: false
      });
    }
  },
  signIn: async (data) => {
    set({
      isLoggingIn: true
    });
    try {
      const response = await api.post("/user/signin", data);
      set({
        authUser: response.data
      });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message || "Log in failed");
    } finally {
      set({
        isLoggingIn: false
      });
    }
  },
  logOut: async () => {
    try {
      const response = await api.post("/user/logout");
      set({
        authUser: null
      });
      toast.success(response.data.message);
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message || "Log in failed");
    }
  },
  updateProfile: async (data) => {
    set({
      isUpdatingProfile: true
    });
    try {
      const response = await api.put("/user/update-profile", data);
      if (response ?.data ?.user) {
        set({
          authUser: response.data.user
        });
      } else if (response ?.data) {
        set({
          authUser: response.data
        });
      }
      toast.success(response ?.data ?.message || "Profile updated successfully");
    } catch (error) {
      const errorMsg = error ?.response ?.data ?.message || error ?.message || "Update profile failed";
      toast.error(errorMsg);
      console.error("Update profile error:", error);
    } finally {
      set({
        isUpdatingProfile: false
      });
    }
  },
  checkAuth: async () => {
    set({
      isCheckingAuth: true
    });
    try {
      const response = await api.get("/user/check-auth");
      set({
        authUser: response.data,
        isCheckingAuth: false
      });
      get().connectSocket();
    } catch (error) {
      console.log("Error checking auth", error);
      set({
        authUser: null,
        isCheckingAuth: false
      });
    }
  },
connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    const socketURL = import.meta.env.VITE_SOCKET_URL;
    const userId = authUser._id || authUser.user?._id || authUser.id || authUser.user?.id;
    const newSocket = io(socketURL, {
      query: {
        userId: userId,
      },
    });
    newSocket.connect();
    set({ socket: newSocket });
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
  },
}));