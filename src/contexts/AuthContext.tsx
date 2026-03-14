import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { isLoggedIn, getSessionType, getSessionName, clearSession, saveSession } from "@/lib/api";

interface AuthState {
  loggedIn: boolean;
  type: "admin" | "user" | null;
  name: string;
}

interface AuthContextType extends AuthState {
  login: (token: string, type: string, name: string, extra?: Record<string, string>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loggedIn: isLoggedIn(),
    type: getSessionType(),
    name: getSessionName(),
  });

  const login = useCallback((token: string, type: string, name: string, extra?: Record<string, string>) => {
    saveSession(token, type, name, extra);
    setState({ loggedIn: true, type: type as "admin" | "user", name });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState({ loggedIn: false, type: null, name: "" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
