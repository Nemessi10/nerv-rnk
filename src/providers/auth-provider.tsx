"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  displayName: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (t: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("FETCH USER ERROR:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("spotify_access_token");

    if (stored && stored !== "undefined") {
      setToken(stored);
      fetchUser(stored);
    } else {
      sessionStorage.removeItem("spotify_access_token");
    }

    setIsLoading(false);
  }, []);

  // for displaying auth state in console
  // const isLoggedIn = !!token && !!user;
  // useEffect(() => {
  //   console.log("AUTH STATE:", { token, user, isLoggedIn });
  // }, [token, user, isLoggedIn]);

  const login = (t: string) => {
    sessionStorage.setItem("spotify_access_token", t);
    setToken(t);
    fetchUser(t); // 🔥
  };

  const logout = () => {
    sessionStorage.removeItem("spotify_access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isLoggedIn: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
