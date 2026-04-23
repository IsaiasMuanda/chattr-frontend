import { create } from "zustand";
import { api } from "../lib/axios";
import type { Message, User } from "../types";
import { useAuthStore } from "./authStore";
import toast from "react-hot-toast";

interface ChatState {
  users: User[];
  selectedUser: User | null;
  messages: Message[];
  isLoadingUsers: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: { text?: string; image?: string }) => Promise<void>;
  selectUser: (user: User | null) => void;
  addMessage: (msg: Message) => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],
  isLoadingUsers: false,
  isLoadingMessages: false,
  isSending: false,

  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const { data } = await api.get<User[]>("/messages/users");
      set({ users: data });
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoadingMessages: true, messages: [] });
    try {
      const { data } = await api.get<Message[]>(`/messages/chat/${userId}`);
      set({ messages: data });
    } catch {
      toast.error("Erro ao carregar mensagens");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    set({ isSending: true });
    try {
      const { data } = await api.post<Message>(`/messages/send/${receiverId}`, content);
      set((s) => ({ messages: [...s.messages, data] }));
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      set({ isSending: false });
    }
  },

  selectUser: (user) => {
    set({ selectedUser: user });
    if (user) get().fetchMessages(user._id);
  },

  addMessage: (msg) => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    const isRelevant =
      (msg.senderId === selectedUser?._id && msg.receiverId === authUser?._id) ||
      (msg.senderId === authUser?._id && msg.receiverId === selectedUser?._id);
    if (isRelevant) {
      set((s) => ({ messages: [...s.messages, msg] }));
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (msg: Message) => {
      get().addMessage(msg);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
