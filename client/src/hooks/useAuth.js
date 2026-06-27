import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../services";
import { useAuthStore } from "../store/authStore";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      try {
        const res = await authService.getMe();
        setUser(res.data);
        return res.data;
      } catch (err) {
        setUser(null);
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogin = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      setUser(res.data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      toast.success("Welcome back! ✨");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useGoogleLogin = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (res) => {
      setUser(res.data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      toast.success("Welcome back with Google! ✨");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      qc.clear();
      toast.success("Logged out successfully");
    },
    onError: () => {
      logout();
      qc.clear();
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: authService.register,
    onSuccess: () => toast.success("Account created! Please login."),
    onError: (err) => toast.error(err.message),
  });
