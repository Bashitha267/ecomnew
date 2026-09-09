"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, tokenStore, getApiError } from "../lib/api";
import { setCookie, COUNTRY_COOKIE_NAME, COUNTRY_CHOSEN_COOKIE_NAME } from "../lib/cookies";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  country?: string;
  phone?: string;
  address?: string;
  role: "admin" | "customer";
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (
    emailOrUsername: string,
    password: string,
    fullName?: string,
    extraData?: { phone?: string; address?: string }
  ) => Promise<{ success: boolean; role: "admin" | "customer"; name: string; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
    address?: string;
    country?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_CACHE_KEY = "cv_user_cache";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore cached user + validate token
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          if (parsed.country) {
            setCookie(COUNTRY_COOKIE_NAME, parsed.country, 365);
            setCookie(COUNTRY_CHOSEN_COOKIE_NAME, "true", 365);
            localStorage.setItem(COUNTRY_COOKIE_NAME, parsed.country);
            localStorage.setItem(COUNTRY_CHOSEN_COOKIE_NAME, "true");
          }
        }

        // If we have a token, verify it's still valid
        const token = tokenStore.getAccess();
        if (token) {
          const { data } = await authApi.me();
          if (data.success) {
            setUser(data.user);
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
            if (data.user.country) {
              setCookie(COUNTRY_COOKIE_NAME, data.user.country, 365);
              setCookie(COUNTRY_CHOSEN_COOKIE_NAME, "true", 365);
              localStorage.setItem(COUNTRY_COOKIE_NAME, data.user.country);
              localStorage.setItem(COUNTRY_CHOSEN_COOKIE_NAME, "true");
            }
          }
        }
      } catch {
        // Token invalid — clear everything
        tokenStore.clear();
        localStorage.removeItem(USER_CACHE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string,
    _fullName = "",
    _extraData?: { phone?: string; address?: string }
  ): Promise<{ success: boolean; role: "admin" | "customer"; name: string; error?: string }> => {
    try {
      const { data } = await authApi.login(emailOrUsername, password);

      if (data.success) {
        tokenStore.setAccess(data.accessToken);
        tokenStore.setRefresh(data.refreshToken);
        setUser(data.user);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
        if (data.user.country) {
          setCookie(COUNTRY_COOKIE_NAME, data.user.country, 365);
          setCookie(COUNTRY_CHOSEN_COOKIE_NAME, "true", 365);
          localStorage.setItem(COUNTRY_COOKIE_NAME, data.user.country);
          localStorage.setItem(COUNTRY_CHOSEN_COOKIE_NAME, "true");
        }
        return { success: true, role: data.user.role, name: data.user.name };
      }

      return { success: false, role: "customer", name: "", error: "Login failed" };
    } catch (err) {
      const error = getApiError(err);
      return { success: false, role: "customer", name: "", error };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
    address?: string;
    country?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await authApi.register(formData);

      if (data.success) {
        tokenStore.setAccess(data.accessToken);
        tokenStore.setRefresh(data.refreshToken);
        setUser(data.user);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
        if (data.user.country) {
          setCookie(COUNTRY_COOKIE_NAME, data.user.country, 365);
          setCookie(COUNTRY_CHOSEN_COOKIE_NAME, "true", 365);
          localStorage.setItem(COUNTRY_COOKIE_NAME, data.user.country);
          localStorage.setItem(COUNTRY_CHOSEN_COOKIE_NAME, "true");
        }
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (err) {
      return { success: false, error: getApiError(err) };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — clean up locally regardless
    } finally {
      tokenStore.clear();
      localStorage.removeItem(USER_CACHE_KEY);
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
