"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";

const AUTH_COOKIE_NAME = "postpipe_auth";

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  image?: string;
  plan?: string;
  monthlySubmissions?: number;
  usageResetDate?: string;
  hasActiveSubscription?: boolean;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | Date;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
  refreshSession?: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuthCookies = () => {
    if (typeof document !== 'undefined') {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=-1`;
      document.cookie = `token=; path=/; max-age=-1`;
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; domain=.postpipe.in; max-age=-1`;
      document.cookie = `token=; path=/; domain=.postpipe.in; max-age=-1`;
    }
  };

  const handleAuthFailure = useCallback(() => {
    setUser(null);
    clearAuthCookies();
    const protectedRoutes = ['/dashboard', '/forms', '/workflows', '/explore', '/static'];
    if (typeof window !== 'undefined' && protectedRoutes.some(route => pathname.startsWith(route))) {
      router.push('/login');
    }
  }, [pathname, router]);

  const fetchUser = async () => {
    if (typeof document !== 'undefined' && !document.cookie.includes(AUTH_COOKIE_NAME)) {
      setUser(null);
      setLoading(false);
      const protectedRoutes = ['/dashboard', '/forms', '/workflows', '/explore', '/static'];
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        router.push('/login');
      }
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data && data.email) {
          setUser(data);
        } else {
          handleAuthFailure();
        }
      } else {
        handleAuthFailure();
      }
    } catch (error) {
      console.error("Failed to fetch user session", error);
      handleAuthFailure();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-check on route change if needed, or better, expose refresh

  const login = (email: string) => {
    // Legacy cookie setting - server actions usually handle the insecure cookies or the server-side cookie
    // But we'll keep it for now if other things depend on it.
    // However, the main thing is to refresh the user state.
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(email)}; path=/; max-age=86400`;
    fetchUser(); // Refresh user data immediately
    router.push("/dashboard");
  };

  const logout = useCallback(async () => {
    await signOut();
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=-1`;
    setUser(null);
    router.push("/login");
  }, [router]);



  // Function to manually refresh session (useful after profile update)
  const refreshSession = () => {
    fetchUser();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    refreshSession, // Expose this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
