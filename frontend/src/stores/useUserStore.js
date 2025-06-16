import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password & Confirm Password does not match");
    }
    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      if (res.status === 200) {
        toast.success("New User created");
        set({ user: res.data });
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      if (res.status === 200) {
        toast.success("Login Successful");
        set({ user: res.data });
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const res = await axios.get("/auth/profile");
      if (res.status === 200) {
        set({ user: res.data });
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({ user: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
}));
