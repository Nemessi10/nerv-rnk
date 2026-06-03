import { useAuthStore } from "~/stores/auth-store";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };
};
