import { create } from "zustand";
import { spotifyAuth } from "~/lib/spotify/spotify-auth";
import { spotifyApi } from "~/lib/spotify/spotify-api";

type User = {
  id: string;
  display_name: string;
  email?: string;
  images?: { url: string }[];
};

type AuthState = {
  user: User | null;
  isLoading: boolean;

  isLoggedIn: boolean;

  init: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  get isLoggedIn() {
    return !!get().user;
  },

  init: async () => {
    set({ isLoading: true });

    try {
      const token = await spotifyAuth.getAccessToken();

      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      const user = await spotifyApi.getCurrentUser();

      set({ user, isLoading: false });
    } catch (err) {
      console.error("AUTH INIT ERROR:", err);
      set({ user: null, isLoading: false });
    }
  },

  login: async () => {
    await spotifyAuth.login();
  },

  logout: async () => {
    try {
      spotifyAuth.logout();
      set({ user: null });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }
  },

  refreshUser: async () => {
    try {
      const token = await spotifyAuth.getAccessToken();

      if (!token) {
        set({ user: null });
        return;
      }

      const user = await spotifyApi.getCurrentUser();

      set({ user });
    } catch (err) {
      console.error("REFRESH USER ERROR:", err);
      set({ user: null });
    }
  },
}));