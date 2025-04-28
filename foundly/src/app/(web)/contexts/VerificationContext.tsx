"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface VerificationContextType {
  email: string;
  setEmail: (email: string) => void;
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  resendAttempts: number;
  canResend: boolean;
  timeUntilNextResend: number;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

export const RESEND_COOLDOWN_MS = 60000;
export const MAX_RESEND_ATTEMPTS = 3;
export const RESEND_WINDOW_MS = 600000;

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getInitialEmail = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("verification_email") || "";
    }
    return "";
  };

  const getInitialResendAttempts = () => {
    if (typeof window !== "undefined") {
      const storedAttempts = sessionStorage.getItem("resend_attempts");
      if (storedAttempts) {
        try {
          return JSON.parse(storedAttempts);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  };

  const [email, setEmailState] = useState<string>(getInitialEmail);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState<number[]>(
    getInitialResendAttempts
  );
  const [timeUntilNextResend, setTimeUntilNextResend] = useState<number>(0);

  const canResend =
    resendAttempts.length < MAX_RESEND_ATTEMPTS && timeUntilNextResend === 0;

  const setEmail = useCallback((email: string) => {
    setEmailState(email);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("verification_email", email);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const addResendAttempt = useCallback(() => {
    const now = Date.now();
    const newAttempts = [
      ...resendAttempts.filter((time) => now - time < RESEND_WINDOW_MS),
      now,
    ];
    setResendAttempts(newAttempts);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("resend_attempts", JSON.stringify(newAttempts));
    }
  }, [resendAttempts]);

  const sendVerificationCode = useCallback(
    async (emailToVerify: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailToVerify,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to send verification code"
          );
        }

        setEmail(emailToVerify);
        addResendAttempt();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to send verification code"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setEmail, addResendAttempt]
  );

  const verifyCode = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/verificationCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Verification failed");
        }

        setIsVerified(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  const resendCode = useCallback(async () => {
    if (!canResend || !email) return;

    await sendVerificationCode(email);
  }, [canResend, email, sendVerificationCode]);

  useEffect(() => {
    if (resendAttempts.length === 0) return;

    const calculateTimeUntilNextResend = () => {
      const now = Date.now();
      const lastAttempt = Math.max(...resendAttempts);
      const cooldownEnds = lastAttempt + RESEND_COOLDOWN_MS;

      return now < cooldownEnds ? cooldownEnds - now : 0;
    };

    const updateTimer = () => {
      setTimeUntilNextResend(calculateTimeUntilNextResend());
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [resendAttempts]);

  useEffect(() => {
    const cleanupOldAttempts = () => {
      const now = Date.now();
      const validAttempts = resendAttempts.filter(
        (time) => now - time < RESEND_WINDOW_MS
      );

      if (validAttempts.length !== resendAttempts.length) {
        setResendAttempts(validAttempts);

        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "resend_attempts",
            JSON.stringify(validAttempts)
          );
        }
      }
    };

    const cleanup = setInterval(cleanupOldAttempts, 60000);

    return () => clearInterval(cleanup);
  }, [resendAttempts]);

  const value = {
    email,
    setEmail,
    isVerified,
    setIsVerified,
    sendVerificationCode,
    verifyCode,
    resendCode,
    isLoading,
    error,
    resetError,
    resendAttempts: resendAttempts.length,
    canResend,
    timeUntilNextResend,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);

  if (context === undefined) {
    throw new Error(
      "useVerification must be used within a VerificationProvider"
    );
  }

  return context;
};
