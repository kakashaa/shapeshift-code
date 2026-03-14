import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { isLoggedIn, getSessionType, getSessionName, clearSession, saveSession } from "@/lib/api";

interface AuthState {
  loggedIn: boolean;
  type: "admin" | "user" | null;
  name: string;
  role: string;
  permissions: string[];
  mustChangePassword: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, type: string, name: string, extra?: Record<string, string>) => void;
  logout: () => void;
  isOwner: () => boolean;
  isSuperAdmin: () => boolean;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loggedIn: isLoggedIn(),
    type: getSessionType(),
    name: getSessionName(),
    role: localStorage.getItem("ghala_role") || "",
    permissions: JSON.parse(localStorage.getItem("ghala_permissions") || "[]"),
    mustChangePassword: localStorage.getItem("ghala_must_change_password") === "true",
  });

  const login = useCallback((token: string, type: string, name: string, extra?: Record<string, string>) => {
    saveSession(token, type, name, extra);
    const role = extra?.role || "";
    const perms = extra?.permissions ? JSON.parse(extra.permissions) : [];
    const mustChange = extra?.must_change_password === "true";
    
    localStorage.setItem("ghala_role", role);
    localStorage.setItem("ghala_permissions", JSON.stringify(perms));
    localStorage.setItem("ghala_must_change_password", String(mustChange));
    
    setState({ loggedIn: true, type: type as "admin" | "user", name, role, permissions: perms, mustChangePassword: mustChange });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    localStorage.removeItem("ghala_role");
    localStorage.removeItem("ghala_permissions");
    localStorage.removeItem("ghala_must_change_password");
    setState({ loggedIn: false, type: null, name: "", role: "", permissions: [], mustChangePassword: false });
  }, []);

  const isOwner = useCallback(() => state.role === "owner", [state.role]);
  const isSuperAdmin = useCallback(() => state.role === "super_admin" || state.role === "owner", [state.role]);
  const hasPermission = useCallback((perm: string) => {
    if (state.role === "owner") return true;
    if (state.permissions.includes("*")) return true;
    return state.permissions.includes(perm);
  }, [state.role, state.permissions]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isOwner, isSuperAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
