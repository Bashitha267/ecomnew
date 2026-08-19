"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "customer";
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (
    usernameOrEmail: string,
    password?: string,
    fullName?: string,
    extraData?: { phone?: string; address?: string }
  ) => { success: boolean; role: "admin" | "customer"; name: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "carlton_valley_auth_user_v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Could not load auth state:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {}
  }, [user, isHydrated]);

  const login = (
    usernameOrEmail: string,
    password = "",
    fullName = "",
    extraData?: { phone?: string; address?: string }
  ): { success: boolean; role: "admin" | "customer"; name: string } => {
    const cleanInput = usernameOrEmail.trim().toLowerCase();

    // Check if logging in as admin
    if (cleanInput === "admin" || cleanInput === "admin@carltonvalley.com" || cleanInput === "admin@parknoire.com") {
      const adminUser: AuthUser = {
        id: "usr-admin-1",
        name: "Admin",
        username: "admin",
        email: "admin@carltonvalley.com",
        role: "admin",
      };
      setUser(adminUser);
      return { success: true, role: "admin", name: "Admin" };
    }

    // Otherwise regular customer login
    const displayName = fullName.trim() || usernameOrEmail.split("@")[0] || "Customer";
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const customerUser: AuthUser = {
      id: "usr-" + Date.now(),
      name: formattedName,
      username: cleanInput,
      email: usernameOrEmail.includes("@") ? usernameOrEmail : `${cleanInput}@client.com`,
      phone: extraData?.phone || "",
      address: extraData?.address || "",
      role: "customer",
    };

    setUser(customerUser);
    return { success: true, role: "customer", name: formattedName };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
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
