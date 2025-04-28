"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthState {
  userId: string | null;
  sessionId: string | null;
  email: string | null;
  isVerified: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  setEmail: (email: string) => void;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  logout: () => void;
  error: string | null;
  resetError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    sessionId: null,
    email: null,
    isVerified: false,
    isLoading: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = Cookies.get("userId");
    const sessionId = Cookies.get("sessionId");
    const email = Cookies.get("email");
    const isVerified = Cookies.get("isVerified") === "true";

    setAuthState({
      userId: userId || null,
      sessionId: sessionId || null,
      email: email || null,
      isVerified,
      isLoading: false,
    });
  }, []);

  const updateAuth = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        Cookies.remove(key);
      } else {
        Cookies.set(key, String(value), { expires: 1 });
      }
    });
  };

  const setEmail = (email: string) => {
    updateAuth({ email });
  };

  const resetError = () => setError(null);

  const sendVerificationCode = async (emailToVerify: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      setError(null);

      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to send verification code"
        );
      }

      const data = await response.json();
      updateAuth({ userId: data.userId, email: emailToVerify });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
      throw err;
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const verifyCode = async (code: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      setError(null);

      const response = await fetch("/api/verificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const data = await response.json();
      updateAuth({
        isVerified: true,
        sessionId: data.sessionId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      throw err;
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const resendCode = async () => {
    if (!authState.email) return;
    await sendVerificationCode(authState.email);
  };

  const logout = () => {
    updateAuth({
      userId: null,
      sessionId: null,
      isVerified: false,
      email: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setEmail,
        sendVerificationCode,
        verifyCode,
        resendCode,
        logout,
        error,
        resetError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
