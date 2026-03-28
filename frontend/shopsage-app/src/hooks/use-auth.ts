"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import React from "react";

interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";
const TEST_EMAIL = "tester@shopsage.co";
const TEST_PASSWORD = "testing123";

function setTokenEverywhere(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("shopsage-token", token);
    document.cookie = `shopsage-token=${token}; path=/; max-age=${60 * 60 * 24 * 3}; SameSite=Lax`;
  } else {
    localStorage.removeItem("shopsage-token");
    document.cookie =
      "shopsage-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate existing token
  useEffect(() => {
    const stored = localStorage.getItem("shopsage-token");
    if (!stored) {
      if (SKIP_AUTH) {
        apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, display_name: "Tester" }),
        })
          .then((res) =>
            res.status === 409
              ? apiFetch("/api/auth/login", {
                  method: "POST",
                  body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
                })
              : res
          )
          .then((res) => res.json())
          .then((data) => {
            setTokenEverywhere(data.token);
            setToken(data.token);
            setUser(data.user);
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
        return;
      }
      setIsLoading(false);
      return;
    }
    setToken(stored);
    apiFetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("invalid");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setToken(stored);
      })
      .catch(() => {
        setTokenEverywhere(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    setTokenEverywhere(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Signup failed" }));
        throw new Error(err.detail || "Signup failed");
      }
      const data = await res.json();
      setTokenEverywhere(data.token);
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    setTokenEverywhere(null);
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined" && !SKIP_AUTH) {
      window.location.href = "/login";
    }
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, token, isLoading, login, signup, logout } },
    children
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
