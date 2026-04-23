import { create } from "zustand";
import { api } from "../lib/axios";
import type { User } from "../types";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

interface AuthState {
  authUser: User | null;
  isCheckingAuth: boolean;
  isLoading: boolean;
  socket: Socket | null;
  onlineUsers: string[];

  checkAuth: () => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string }) => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string; profilePic?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoading: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const { data } = await api.get<User>("/auth/check");
      set({ authUser: data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<User>("/auth/signup", formData);
      set({ authUser: data });
      get().connectSocket();
      toast.success("Conta criada com sucesso!");
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao criar conta";
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<User>("/auth/login", formData);
      set({ authUser: data });
      get().connectSocket();
      toast.success("Bem-vindo de volta!");
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Credenciais inválidas";
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Sessão encerrada");
    } catch {
      toast.error("Erro ao sair");
    }
  },

  updateProfile: async (updateData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put<User>("/auth/update", updateData);
      set({ authUser: data });
      toast.success("Perfil atualizado!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao atualizar";
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await api.delete("/auth/delete");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Conta removida");
    } catch {
      toast.error("Erro ao remover conta");
    } finally {
      set({ isLoading: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    const newSocket = io(SOCKET_URL, { query: { userId: authUser._id } });
    newSocket.on("getOnlineUsers", (ids: string[]) => set({ onlineUsers: ids }));
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
